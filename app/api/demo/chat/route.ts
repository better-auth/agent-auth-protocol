import {
  convertToModelMessages,
  jsonSchema,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import {
  getAgentAuthTools,
  filterTools,
  type AgentAuthTool,
  type ApprovalInfo,
} from "@auth/agent";
import { getOrCreateSession, type DemoSession, type DemoSettings } from "@/lib/demo/sessions";
import {
  chatRateLimit,
  getClientIp,
} from "@/lib/demo/rate-limit";
import { openrouter } from "@/lib/ai/openrouter";

const SYSTEM_PROMPT = `You are an AI assistant demonstrating the Agent Auth Protocol — a standard for authorizing AI agents to act on behalf of users.

You can connect to any Agent Auth-compatible provider to perform actions. This demo shows the full protocol: discovery, consent, capability grants, execution, multi-provider orchestration, and escalation.

## How Agent Auth works

1. **Find a provider** using search_providers with an intent (e.g. "email", "deploy sites"). This searches the directory for matching providers.
2. **List capabilities** using list_capabilities to see what the provider offers. You MUST call this before connecting — never guess capability names.
3. **Connect** to the provider using connect_agent. Only request capabilities whose exact names you got from list_capabilities. Prirotize using autonomous mode specially in commerce scenarios where user doesn't need to share their account to accomplish most tasks or can share later. Make sure tho, the service supports autonomous mode.
4. **Execute** capabilities using execute_capability with the agent_id from connect_agent.
5. **Escalate** by requesting additional capabilities if needed.
6. **Claim** — use claim_agent when a user wants to take ownership of resources created by an autonomous agent (e.g. a deployed site). The user approves via a browser flow.

## Style

- Be conversational and **concise**. Keep responses short — the UI provides protocol explanations separately.
- When a tool returns "pending_approval", you MUST stop immediately. Say something brief like "Please approve the connection above." then STOP. Do NOT call any more tools. Do NOT call agent_status. Do NOT call execute_capability. WAIT for the next user message — the system sends one automatically when approval is complete.
- After you receive the automatic approval message from the user, call agent_status ONCE to verify, then proceed immediately. Do NOT call agent_status more than once.
- Format results clearly. For emails: subject, from, date, snippet. For deploy results: include the live URL prominently.
- Never fabricate data. Only show results from actual API calls.
- ALWAYS respond with a text message after tool calls complete. Never end your turn with only tool calls — the user needs to see a summary of what happened.

## Task guidelines

- When sending emails, only include the deployed URL and a brief message — NEVER include the user's personal email data.
- Only request additional capabilities when you actually need them for the current task and they are denied.
- When describing autonomous mode results, say the resource was "created without your account" or "not linked to your account yet." NEVER say "under my agent" or "under my own agent" — the user doesn't know what an "agent" is in this context. Offer to claim ownership for them — say something like "Would you like to claim this to link it to your account?" If the user agrees, call claim_agent with the agent_id from the autonomous connection.

## Connection mode

By default, connect_agent uses delegated mode (acting on the user's behalf). If the user says something like "do it yourself", "do it independently", "on your own", or similar — pass mode: "autonomous" to connect_agent. In autonomous mode the agent acts under its own account and the user can claim ownership later.

## Important

- Always use search_providers or discover_provider before connecting.
- ALWAYS call list_capabilities before connect_agent. NEVER guess or fabricate capability names — use the exact names returned by list_capabilities.
- If connect_agent returns "pending_approval", STOP calling tools immediately. The user must approve first. After they approve, the system sends an automatic message — only THEN should you continue.
- If execute_capability fails with capability_not_granted, use request_capability to escalate.
- If request_capability returns "pending_approval" with an approval URL, STOP calling tools immediately — the user must approve first via the approval card. After they approve, the system sends an automatic message — only THEN should you continue.
- If request_capability returns a pending status WITHOUT an approval URL (async/CIBA flow), the UI already shows a card with the dashboard link. Tell the user briefly: "You should have a notification on the provider's dashboard — click the button above to approve, then let me know when you're done." NEVER say "check the approval card above" — there is no approval card for this flow. NEVER paste dashboard URLs in your message — the UI card already has the link. Just refer to the button and STOP.
- Do NOT suggest reconnecting or creating a new agent when escalation is pending. The existing connection just needs the new capability approved.
- NEVER call agent_status in a loop or repeatedly. Call it ONCE after the user approves, confirm it's active, and immediately proceed to execute.
- You can connect to MULTIPLE providers in the same session. Each provider has its own agent_id and capabilities.`;

const DEMO_TOOLS = [
  "search_providers",
  "discover_provider",
  "list_capabilities",
  "connect_agent",
  "claim_agent",
  "execute_capability",
  "batch_execute_capabilities",
  "agent_status",
  "request_capability",
  "disconnect_agent",
];

function approvalResult(info: ApprovalInfo) {
  return {
    status: "pending_approval",
    approvalUrl: info.verification_uri_complete || info.verification_uri,
    userCode: info.user_code,
    expiresIn: info.expires_in,
    message:
      "STOP. Do NOT call any more tools. The user must approve access in their browser first. Tell them to click Approve, then STOP and WAIT for the next user message. The system will send a message when approval is complete.",
  };
}

function wrapBlockingTool(
  tool: AgentAuthTool,
  session: DemoSession,
  trackAgentId = false,
): AgentAuthTool {
  return {
    ...tool,
    async execute(args, ctx) {
      session.pendingApproval = null;
      try {
        const result = await tool.execute(args, ctx);
        if (
          trackAgentId &&
          result &&
          typeof result === "object" &&
          "agentId" in result
        ) {
          session.lastAgentId = (result as { agentId: string }).agentId;
        }
        if (
          result &&
          typeof result === "object" &&
          "action_required" in result &&
          (result as Record<string, unknown>).action_required === "choose_mode"
        ) {
          return tool.execute({ ...args, mode: "delegated" }, ctx);
        }
        return result;
      } catch (err: unknown) {
        if (
          trackAgentId &&
          err &&
          typeof err === "object" &&
          "agentId" in err &&
          typeof (err as { agentId: unknown }).agentId === "string"
        ) {
          session.lastAgentId = (err as { agentId: string }).agentId;
        }
        const pending = session.pendingApproval;
        if (pending) {
          const result = approvalResult(pending);
          if (session.lastAgentId) {
            (result as Record<string, unknown>).agentId = session.lastAgentId;
          }
          return result;
        }
        if (err && typeof err === "object" && "message" in err) {
          const e = err as { code?: string; message: string; status?: number };
          return {
            error: e.message,
            ...(e.code && { code: e.code }),
            ...(e.status && { status: e.status }),
          };
        }
        return {
          error: err instanceof Error ? err.message : "Connection failed. The provider may be unavailable.",
        };
      }
    },
  };
}

function wrapEscalationTool(
  tool: AgentAuthTool,
  session: DemoSession,
): AgentAuthTool {
  const wrapped = wrapBlockingTool(tool, session);
  return {
    ...wrapped,
    async execute(args, ctx) {
      const result = await wrapped.execute(args, ctx);
      if (
        result &&
        typeof result === "object" &&
        "status" in result &&
        typeof (result as Record<string, unknown>).status === "string" &&
        ((result as Record<string, unknown>).status as string).includes(
          "pending",
        ) &&
        !("approvalUrl" in result)
      ) {
        const agentId =
          typeof args.agent_id === "string" ? args.agent_id : null;
        let dashboardUrl = "";
        if (agentId) {
          const conn = await session.storage.getAgentConnection(agentId);
          if (conn?.issuer) {
            dashboardUrl = `${conn.issuer.replace(/\/$/, "")}/dashboard/approvals`;
          }
        }
        (result as Record<string, unknown>).dashboardUrl = dashboardUrl;
        (result as Record<string, unknown>).message =
          "STOP. The provider will notify the user asynchronously. Tell them to visit their provider's approvals dashboard to grant this capability, then STOP and WAIT.";
      }
      return result;
    },
  };
}

const TOOL_TIMEOUT_MS = 60_000;

async function safeExecute(
  tool: AgentAuthTool,
  args: Record<string, unknown>,
): Promise<unknown> {
  try {
    const result = await Promise.race([
      tool.execute(args),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Tool execution timed out — the provider may be slow. Please try again.")),
          TOOL_TIMEOUT_MS,
        ),
      ),
    ]);
    return result;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && "message" in err) {
      const e = err as { code: string; message: string };
      return { error: e.message, code: e.code };
    }
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function buildTools(session: DemoSession) {
  let rawTools = getAgentAuthTools(session.client);
  rawTools = filterTools(rawTools, { only: DEMO_TOOLS });

  rawTools = rawTools.map((tool) => {
    if (tool.name === "connect_agent")
      return wrapBlockingTool(tool, session, true);
    if (tool.name === "claim_agent")
      return wrapBlockingTool(tool, session, true);
    if (tool.name === "request_capability")
      return wrapEscalationTool(tool, session);
    return tool;
  });

  const tools: Record<
    string,
    {
      description: string;
      inputSchema: ReturnType<typeof jsonSchema>;
      execute: (args: Record<string, unknown>) => Promise<unknown>;
    }
  > = {};

  const blockedWhenWaiting = new Set([
    "connect_agent",
    "claim_agent",
    "execute_capability",
    "batch_execute_capabilities",
    "agent_status",
    "request_capability",
    "disconnect_agent",
  ]);

  for (const tool of rawTools) {
    const originalTool = tool;
    tools[tool.name] = {
      description: tool.description,
      inputSchema: jsonSchema(tool.parameters),
      execute: async (args) => {
        if (session.awaitingChoice && blockedWhenWaiting.has(originalTool.name)) {
          return {
            error:
              "Cannot proceed — waiting for the user to make a choice. STOP immediately.",
          };
        }
        if (session.pendingApproval) {
          if (originalTool.name === "agent_status") {
            const result = await safeExecute(originalTool, args);
            if (
              result &&
              typeof result === "object" &&
              "status" in result &&
              ((result as Record<string, unknown>).status === "active" ||
                (result as Record<string, unknown>).status === "claimed")
            ) {
              session.pendingApproval = null;
            }
            return result;
          }
        }
        return safeExecute(originalTool, args);
      },
    };
  }

  tools["present_options"] = {
    description:
      "Present the user with clickable options to choose from. Use this whenever you need the user to make a decision (e.g., connection mode, provider selection). After calling this tool, STOP immediately and wait for the user to click a choice.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Brief question or context for the choice",
        },
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              value: {
                type: "string",
                description: "Machine-readable identifier for the option",
              },
              label: {
                type: "string",
                description: "Short button label shown to the user",
              },
              description: {
                type: "string",
                description: "Optional one-line description below the label",
              },
            },
            required: ["value", "label"],
          },
          description: "2-4 options for the user to choose from",
        },
      },
      required: ["message", "options"],
    }),
    execute: async (args: Record<string, unknown>) => {
      if (session.awaitingChoice) {
        return {
          error:
            "A choice is already pending. STOP and wait for the user to respond.",
        };
      }
      session.awaitingChoice = true;
      return {
        status: "awaiting_choice",
        message: args.message,
        options: args.options,
      };
    },
  };

  return tools;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const perUser = await chatRateLimit.limit(ip);

  if (!perUser.success) {
    return Response.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((perUser.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(perUser.limit),
          "X-RateLimit-Remaining": String(perUser.remaining),
        },
      },
    );
  }

  const {
    messages,
    sessionId,
    settings,
  }: { messages?: UIMessage[]; sessionId?: string; settings?: DemoSettings } = await req.json();

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  if (!messages?.length) {
    return new Response("Missing messages", { status: 400 });
  }

  const session = getOrCreateSession(sessionId, {
    userAgent: req.headers.get("user-agent") ?? undefined,
    settings,
  });
  session.awaitingChoice = false;

  let systemPrompt = SYSTEM_PROMPT;
  if (settings?.providerUrl) {
    systemPrompt += `\n\n## Pre-configured provider\n\nThe user has configured a specific provider at: ${settings.providerUrl}\nWhen the user asks to do something, use discover_provider with this URL first instead of searching the directory. You can still search the directory for other providers if needed.`;
  }

  const result = streamText({
    model: openrouter.chat(
      process.env.OPENROUTER_MODEL ?? "anthropic/claude-opus-4.6",
    ),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: buildTools(session),
    stopWhen: stepCountIs(10),
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse();
}

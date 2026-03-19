import { createOpenRouter } from "@openrouter/ai-sdk-provider";
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
import { getOrCreateSession, type DemoSession } from "@/lib/demo/sessions";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant demonstrating the Agent Auth Protocol — a standard for authorizing AI agents to act on behalf of users.

You can connect to any Agent Auth-compatible provider to perform actions. This demo shows the full protocol: discovery, consent, capability grants, execution, multi-provider orchestration, and escalation.

## How Agent Auth works

1. **Search** for capabilities across providers using the search tool.
2. **Connect** to a provider using connect_agent. The user may need to approve via a browser popup.
3. **Execute** capabilities using execute_capability with the agent_id from connect_agent.
4. **Escalate** by requesting additional capabilities if needed.
5. **Claim** — use claim_agent when a user wants to take ownership of resources created by an autonomous agent (e.g. a deployed site). The user approves via a browser flow.

## Style

- Be conversational and **concise**. Keep responses short — the UI provides protocol explanations separately.
- When a tool returns "pending_approval", you MUST stop immediately. Say something brief like "Please approve the connection above." then STOP. Do NOT call any more tools. Do NOT call agent_status. Do NOT call execute_capability. WAIT for the next user message — the system sends one automatically when approval is complete.
- After you receive the automatic approval message from the user, call agent_status ONCE to verify, then proceed immediately. Do NOT call agent_status more than once.
- Format results clearly. For emails: subject, from, date, snippet. For deploy results: include the live URL prominently.
- Never fabricate data. Only show results from actual API calls.


## Task guidelines

- When sending emails, only include the deployed URL and a brief message — NEVER include the user's personal email data.
- Only request additional capabilities when you actually need them for the current task and they are denied.

## Important

- Always search or discover before connecting.
- If connect_agent returns "pending_approval", STOP calling tools immediately. The user must approve first. After they approve, the system sends an automatic message — only THEN should you continue.
- If connect_agent returns an action_required with choose_mode, do NOT show mode options to the user. Pick the right mode yourself based on the guidance above and call connect_agent again with the mode parameter.
- If execute_capability fails with capability_not_granted, use request_capability to escalate.
- When request_capability returns a pending status or approval URL, tell the user to visit the provider's approval dashboard to approve the new capability. For Gmail, that's https://gmail.agent-auth.directory/dashboard/approvals. Do NOT suggest reconnecting or creating a new agent — the existing connection just needs the new capability approved. STOP and WAIT for the user to tell you they approved.
- NEVER call agent_status in a loop or repeatedly. Call it ONCE after the user approves, confirm it's active, and immediately proceed to execute.
- NEVER suggest reconnecting or creating a new agent when escalation is pending. The user just needs to approve the additional capability.
- You can connect to MULTIPLE providers in the same session. Each provider has its own agent_id and capabilities.`;

const DEMO_TOOLS = [
  "search",
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
          return approvalResult(pending);
        }
        return {
          error: "Connection failed. The provider may be unavailable.",
        };
      }
    },
  };
}

async function safeExecute(
  tool: AgentAuthTool,
  args: Record<string, unknown>,
): Promise<unknown> {
  try {
    return await tool.execute(args);
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
      return wrapBlockingTool(tool, session);
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

  const requiresApproval = new Set([
    "execute_capability",
    "batch_execute_capabilities",
    "agent_status",
  ]);

  for (const tool of rawTools) {
    const originalTool = tool;
    tools[tool.name] = {
      description: tool.description,
      inputSchema: jsonSchema(tool.parameters),
      execute: (args) => {
        if (
          requiresApproval.has(originalTool.name) &&
          session.pendingApproval
        ) {
          return Promise.resolve({
            error:
              "Cannot execute — user approval is still pending. STOP and wait for the user to approve.",
          });
        }
        return safeExecute(originalTool, args);
      },
    };
  }

  return tools;
}

export async function POST(req: Request) {
  const {
    messages,
    sessionId,
  }: { messages?: UIMessage[]; sessionId?: string } = await req.json();

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  if (!messages?.length) {
    return new Response("Missing messages", { status: 400 });
  }

  const session = getOrCreateSession(sessionId);

  const result = streamText({
    model: openrouter.chat(
      process.env.OPENROUTER_MODEL ?? "moonshotai/kimi-k2.5",
    ),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: buildTools(session),
    stopWhen: stepCountIs(10),
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse();
}

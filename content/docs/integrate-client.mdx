---
title: Integrate the client
description: How to integrate the Agent Auth client via SDK, CLI, or MCP server for agent authentication and capability execution.
section: "Develop with Agent Auth"
---

The Agent Auth client sits between your agent and the server. It manages keys, handles registration, signs JWTs, and exposes protocol tools. There are three ways to integrate: the SDK (for embedding in your application), the CLI (for scripting and automation), and MCP (for AI tool ecosystems).

## SDK

The `@auth/agent` SDK is a TypeScript library you embed directly in your application. It manages keypairs, handles discovery and registration, and signs requests automatically.

```bash
npm install @auth/agent
```

```ts
import { AgentAuthClient } from "@auth/agent";

const client = new AgentAuthClient({
  directoryUrl: "https://directory.example.com",
});
```

The SDK handles host keypair generation and storage, agent keypair management, JWT signing, discovery, and the full registration flow including approval polling. It also ships with tool adapters for Vercel AI SDK, OpenAI, and Anthropic.

See [Client SDK](/docs/client-sdk) for the full API reference.

## CLI

The `@auth/agent-cli` package provides the `auth-agent` command-line tool for managing agents, testing connections, and scripting Agent Auth workflows:

```bash
# Discover a provider
npx @auth/agent-cli discover https://bank.com

# Connect an agent
npx @auth/agent-cli connect --provider https://bank.com --capabilities check_balance

# Execute a capability
npx @auth/agent-cli execute agt_abc123 check_balance --args '{"account_id": "acc_123"}'

# Check agent status
npx @auth/agent-cli status agt_abc123

# Disconnect
npx @auth/agent-cli disconnect agt_abc123
```

The CLI stores host keypairs locally at `~/.agent-auth` and manages agent state across invocations. It's useful for testing your server implementation and for scripting agent workflows in CI/CD pipelines.

See [CLI](/docs/cli) for the full command reference.

## MCP integration

The most common deployment model is running the client as an **MCP server**. AI tools like Claude Code, Cursor, and ChatGPT connect to MCP servers to access tools. When the Agent Auth client runs as an MCP server, all protocol tools are exposed as MCP tools that agents can call directly.

```bash
npx @auth/agent-cli mcp --url https://api.example.com
```

Or configure in your MCP settings:

```json
{
  "mcpServers": {
    "auth-agent": {
      "command": "npx",
      "args": ["@auth/agent-cli", "mcp", "--url", "https://api.example.com"]
    }
  }
}
```

This exposes all the standard tools — `list_providers`, `search_providers`, `connect_agent`, `execute_capability`, etc. — as MCP tools that any connected AI agent can use.

The MCP server model means agents don't need to know anything about Agent Auth. They just call MCP tools, and the client handles all the authentication, key management, and protocol details.

See [MCP Server](/docs/mcp) for full configuration and tool reference.

## Connect and execute

The typical flow from an agent's perspective:

```ts
// 1. Discover or select a provider
const providers = await client.listProviders();

// 2. Connect (register an agent)
const agent = await client.connect({
  provider: "bank",
  capabilities: ["check_balance"],
  reason: "User wants to check their balance",
  mode: "delegated"
});
// → { agent_id: "agt_k7x9m2", status: "active", capabilities: [...] }

// 3. Execute capabilities
const result = await client.execute({
  provider: "bank",
  capability: "check_balance",
  arguments: { account_id: "acc_123" }
});
// → { balance: 1250.00, currency: "USD" }
```

## Handling approval

When connecting to a new server for the first time, user approval is typically required. The client handles this by:

1. Receiving the verification URI and user code from the server
2. Presenting this to the user (opening a browser, displaying in terminal, etc.)
3. Polling the server's status endpoint until approved
4. Returning the active agent to the caller

Once the host is trusted, future agents requesting default capabilities are auto-approved — no user interaction needed.

## Capability escalation

If an agent needs additional capabilities at runtime:

```ts
const result = await client.requestCapability({
  provider: "bank",
  capabilities: ["transfer_funds"],
  reason: "User asked to transfer money"
});
// Triggers approval flow if needed, returns updated grants
```

Escalated capabilities always require explicit user approval, even from trusted hosts.

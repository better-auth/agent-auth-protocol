---
title: Client
description: The client sits between the agent and the server, managing keys, discovery, registration, and capability execution.
section: "Concepts"
---

The client sits between the agent and the server. It manages host and agent keys, communicates with servers, and exposes a standard set of tools that agents call to discover, register, authenticate, and execute capabilities.

## What is a client?

A client can be an **MCP server**, a **CLI tool**, an **SDK**, or any process that implements the Agent Auth protocol tools. AI tools like Claude Code, Cursor, or ChatGPT connect to a client, and the client handles all protocol communication with the authorization server.

The protocol does not define how agents communicate with clients. A client may run in the same process as the agent (an embedded SDK), on the same machine (a local MCP server), or remotely. The client-to-server communication is what the protocol standardizes.

## Client tools

A client exposes these standard tools to agents:

| Tool | Purpose |
|------|---------|
| `list_providers` | List available providers the client knows about |
| `search_providers` | Search a directory for providers matching an intent |
| `discover_provider` | Discover a provider from a direct URL |
| `list_capabilities` | List capabilities available from a provider |
| `describe_capability` | Get full detail for a single capability (input/output schemas) |
| `connect_agent` | Register an agent with a server and handle approval |
| `execute_capability` | Execute a capability on a server |
| `sign_jwt` | Sign a raw JWT for direct server-to-server use |
| `request_capability` | Request additional capabilities at runtime |
| `disconnect_agent` | Revoke an agent |
| `reactivate_agent` | Reactivate an expired agent |
| `agent_status` | Check an agent's current status and grants |

Single-provider clients (built for one specific service) may omit discovery tools since the provider is implicit.

## Provider discovery

Before connecting, an agent may need to find which provider to use. The client supports three discovery methods:

- **`list_providers`** — returns providers the client already knows about (pre-configured or previously discovered)
- **`search_providers`** — queries a directory with a natural language intent (e.g. "banking", "send emails")
- **`discover_provider`** — fetches a provider's configuration from a direct URL via `/.well-known/agent-configuration`

```jsonc
// search_providers
{ "intent": "banking" }
// → [{ "name": "bank", "description": "Banking services", "issuer": "https://bank.com" }]

// discover_provider
{ "url": "https://bank.com" }
// → { "name": "bank", "description": "Banking services", "issuer": "https://bank.com" }
```

## Agent connection

The `connect_agent` tool handles the full registration flow: generating an agent keypair, sending the registration request with a Host JWT, and managing the approval flow if needed.

```jsonc
// connect_agent
{
  "provider": "bank",
  "capabilities": ["check_balance"],
  "reason": "User wants to check their bank balance",
  "mode": "delegated"
}
// → {
//   "agent_id": "agt_k7x9m2",
//   "status": "active",
//   "capabilities": [{ "name": "check_balance", "status": "active" }]
// }
```

If approval is required, the client facilitates the device flow — presenting the verification URL and user code — and polls until the agent is active.

## Capability execution

Once connected, agents execute capabilities through the client. The client signs a fresh Agent JWT for each request:

```jsonc
// execute_capability
{
  "provider": "bank",
  "capability": "check_balance",
  "arguments": { "account_id": "acc_123" }
}
// → { "account_id": "acc_123", "balance": 1250.00, "currency": "USD" }
```

## Key management

The client manages two types of keypairs:

- **Host keypair** — persistent, one per server. Used to sign Host JWTs for registration and management operations. Stored securely on the client.
- **Agent keypair** — per-agent, created at connection time. Used to sign Agent JWTs for capability execution. Can be stored in memory or persisted depending on the client.

Both use Ed25519 (the only algorithm defined in this spec version). The private keys never leave the client — the server only stores public keys. See [Authentication](/docs/authentication) for the full JWT format and verification flow.

## Error handling

Clients should handle errors from the server gracefully. Common patterns:

- **`401 invalid_jwt`** — re-sign the JWT and retry. The JWT may have expired or the signature may not match.
- **`403 agent_expired`** — the agent's session has timed out. Call `reactivate_agent` to bring it back with default capabilities.
- **`403 agent_revoked`** — the agent has been permanently revoked. A new agent must be created via `connect_agent`.
- **`403 capability_not_granted`** — the agent doesn't have this capability. Call `request_capability` to request it.
- **`403 constraint_violated`** — the request arguments exceed the grant's constraints. The error response includes a `violations` array showing which arguments need adjustment.
- **`429 rate_limited`** — too many requests. Respect the `Retry-After` header if present, or use exponential backoff.
- **`400 invalid_capabilities`** — one or more requested capability names don't exist. The error response should include the list of invalid names so the agent can self-correct.

For a full list of error codes, see [Errors](/docs/errors).

## Deployment models

A client can be deployed in several ways:

- **MCP server** — the most common model. The client runs as an MCP server that AI tools connect to. Agent Auth tools are exposed as MCP tools.
- **Embedded SDK** — the client runs in the same process as the agent, integrated directly into the application code.
- **CLI tool** — a command-line interface that manages agents and can be scripted into workflows.
- **Remote service** — the client runs as a hosted service. Agents connect over a network with their own auth layer.

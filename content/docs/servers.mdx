---
title: Server
description: The server manages discovery, agent registrations, approvals, capability grants, and JWT verification in the Agent Auth protocol.
section: "Concepts"
---

The server is the service's authorization server. It manages discovery, host and agent registrations, approvals, capability grants, and JWT verification. This page covers what a server does and the endpoints it exposes.

## What is a server?

A server is any service that implements the Agent Auth protocol — your bank, GitHub, Slack, a deployment platform, or any API. The server manages which agents can access it, what they can do, and verifies every request.

The server's responsibilities:

- Publish a discovery endpoint so clients can auto-configure
- Register hosts and agents with Ed25519 key verification
- Manage capability grants and approval flows
- Verify signed JWTs on every request
- Enforce agent lifecycle (expiry, reactivation, revocation)

## Discovery endpoint

Servers publish a `/.well-known/agent-configuration` endpoint (no authentication required) that returns the full configuration:

```http
GET /.well-known/agent-configuration
```

```json
{
  "version": "1.0-draft",
  "provider_name": "bank",
  "description": "Banking services",
  "issuer": "https://auth.bank.com",
  "algorithms": ["Ed25519"],
  "modes": ["delegated", "autonomous"],
  "approval_methods": ["device_authorization", "ciba"],
  "endpoints": {
    "register": "/agent/register",
    "capabilities": "/capability/list",
    "execute": "/capability/execute",
    "status": "/agent/status",
    "reactivate": "/agent/reactivate",
    "revoke": "/agent/revoke"
  }
}
```

This tells the client everything it needs: what modes the server supports, which algorithms to use, what endpoints to call, and how approval works.

## Agent registration

Clients register agents via `POST /agent/register` with a Host JWT. The server creates the agent, evaluates its requested capabilities, and either auto-approves (for trusted hosts with default capabilities) or returns an approval flow.

```http
POST /agent/register
Authorization: Bearer <Host JWT>
```

```json
{
  "name": "Balance Checker",
  "capabilities": ["check_balance"],
  "mode": "delegated"
}
```

Response:

```json
{
  "agent_id": "agt_k7x9m2",
  "host_id": "hst_m4a8",
  "status": "pending",
  "approval": {
    "method": "device_authorization",
    "verification_uri": "https://auth.bank.com/device",
    "user_code": "ABCD-1234"
  }
}
```

If the host is already trusted and the requested capabilities are within defaults, the server returns `"status": "active"` directly.

## Capability management

Servers define capabilities — named actions that agents can execute. The capability list endpoint lets agents discover what's available:

```json
{
  "capabilities": [
    {
      "name": "check_balance",
      "description": "Check account balances",
      "input": {
        "type": "object",
        "properties": { "account_id": { "type": "string" } }
      },
      "output": {
        "type": "object",
        "properties": { "balance": { "type": "number" } }
      }
    }
  ]
}
```

Active agents can request additional capabilities at runtime via `POST /agent/request-capability`, triggering a new approval flow. Capability grants can carry **constraints** — restrictions on input values that turn a broad capability into a narrow authorization.

## Capability execution

The standard way to execute capabilities is through the server's execute endpoint:

```http
POST /capability/execute
Authorization: Bearer <Agent JWT>
```

```json
{
  "capability": "check_balance",
  "arguments": { "account_id": "acc_123" }
}
```

Response:

```json
{
  "result": {
    "account_id": "acc_123",
    "balance": 1250.00,
    "currency": "USD"
  }
}
```

The server validates the JWT, checks the agent's grants, enforces any constraints, and executes the capability.

## JWT verification

On every request, the server:

1. Extracts the JWT from the `Authorization` header
2. Verifies the Ed25519 signature against the agent's stored public key
3. Checks `aud` matches the server's issuer URL
4. Validates `exp`, `iat`, and `jti` for replay protection
5. Confirms the agent is `active`
6. Resolves granted capabilities and enforces constraints

JWTs have a 60-second TTL and a unique `jti` claim. The server must reject duplicate `jti` values within the lifetime window.

## Lifecycle management

The server manages agent lifecycle through several endpoints:

- `GET /agent/status` — check agent status and capability grants
- `POST /agent/reactivate` — reactivate an expired agent (security checkpoint: escalated capabilities are dropped)
- `POST /agent/revoke` — permanently revoke an agent
- `POST /agent/rotate-key` — rotate an agent's keypair
- `POST /host/revoke` — revoke a host and cascade to all its agents
- `POST /host/rotate-key` — rotate a host's keypair

## Async and streaming execution

The execute endpoint supports three interaction modes:

- **Sync** (default) — the server returns the result directly in the response body
- **Async** — the server returns `202 Accepted` with a `status_url` for polling. The client polls (with a fresh Agent JWT on each request) until the status is `completed` or `failed`
- **Streaming** — the server returns a `200` response with `Content-Type: text/event-stream` and streams Server-Sent Events

### Async responses

```json
{
  "status": "pending",
  "status_url": "https://auth.bank.com/capabilities/status/job_xyz"
}
```

Polling requests must include an Agent JWT — the server verifies the requesting agent matches the one that initiated execution. Since agent JWTs are short-lived (≤60 seconds), the client mints a fresh JWT for each poll. Clients should use exponential backoff when polling.

### Streaming

For streaming capabilities, the server uses these SSE event types:

| Event type | Data | Description |
|------------|------|-------------|
| `data` | Capability-specific JSON chunk | Incremental result |
| `error` | Error object | An error occurred during streaming |
| `done` | Empty or final result | Stream complete — client must close the connection |

An SSE stream can outlive the agent JWT that initiated it. The server authenticates at connection time and should enforce a maximum stream duration. Servers that require continuous authentication should terminate the stream at JWT expiry. Servers that allow long-running streams must check agent and host revocation status periodically.

## Introspection

The `POST /agent/introspect` endpoint lets resource servers that are separate from the auth server validate agent JWTs without direct access to agent public keys. Following the model of [RFC 7662](https://datatracker.ietf.org/doc/html/rfc7662), it accepts a JWT and returns whether the agent is active along with compact grant information.

```json
{
  "active": true,
  "agent_id": "agt_abc123",
  "host_id": "hst_xyz789",
  "user_id": "user_alice",
  "agent_capability_grants": [
    { "capability": "check_balance", "status": "active" },
    { "capability": "transfer_domestic", "status": "active" }
  ],
  "mode": "delegated",
  "expires_at": "2026-02-28T14:30:00Z"
}
```

Unlike other endpoints, introspect returns compact grants (`capability` and `status` only) — resource servers need to verify grants, not capability schemas. The introspect endpoint should be protected with server-to-server authentication (shared secrets, mutual TLS, or network-level restrictions).

## Resource server challenge (WWW-Authenticate)

When an agent reaches a resource server without a valid Agent JWT — for example, from training data or user instructions — the resource server can include a `WWW-Authenticate` header using the `AgentAuth` scheme to point the agent toward discovery:

```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: AgentAuth discovery="https://auth.example.com/.well-known/agent-configuration"
```

This is useful when the resource server and auth server are on different domains. Clients that receive this challenge should fetch the discovery URL, register, and retry the request. If the agent JWT is present but the agent lacks the required capability, the server should return `403` with `capability_not_granted` instead.

## Observability

The JWT-based authentication model provides per-agent, per-call traceability by default. Every authenticated request contains a JWT with:

| Claim | What it tells you |
|-------|-------------------|
| `sub` | Which agent made the call |
| `jti` | Unique call identifier (for correlation and replay detection) |
| `iat` | When the JWT was issued |
| `exp` | When it expires |

Combined with the agent's host and user identifiers, the server can reconstruct the full chain: **which user** → **which host** → **which agent** → **which capability** → **when**. Servers should log at least: agent ID, capability name, timestamp, and result for each capability call.

## Approval methods

When a registration or capability request requires user consent, the server returns an approval object. See [Approval Methods](/docs/approval) for full details. The protocol supports:

- **Device Authorization** (RFC 8628) — the user visits a URL and enters a code, like logging into a streaming app on a TV
- **CIBA** (Client Initiated Backchannel Authentication) — the server pushes a notification to the user's device
- **Server-defined** — custom approval methods for specific use cases

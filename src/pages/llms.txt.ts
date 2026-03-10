import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
  const body = `# Agent Auth Protocol

> An open protocol that gives each AI agent its own cryptographic identity, granted capabilities, and lifecycle. Agents authenticate with short-lived Ed25519-signed JWTs and execute server-defined capabilities.

## Implementations

Reference implementation: Better Auth plugin (TypeScript)
- Server: https://github.com/better-auth/better-auth — drop-in agent identity, registration, device flow, capability management, session verification
- Client SDK: https://github.com/better-auth/agent-auth-protocol — manages keypairs, signs requests, handles registration and capability escalation
- The protocol is simple enough to implement from scratch: 3 database tables (hosts, agents, agent_capability_grants), Ed25519 signature verification, and a device authorization flow

### Server-side verification (Better Auth)

\`\`\`typescript
const session = await auth.api.getAgentSession({ headers });

if (session) {
  const { agent, user } = session;
  // agent.id                    → "agt_k7x9m2..."
  // agent.agentCapabilityGrants → [{ capability, status, grantedBy }]
  // user.id                     → "user_xyz" (if delegated mode)
}
\`\`\`

## Quick Integration Flow

1. **Discover** — GET /.well-known/agent-configuration → endpoints, modes, approval methods
2. **Generate keys** — Ed25519 keypair for host (persistent) + Ed25519 keypair for agent (per-session)
3. **Sign Host JWT** — sign with host private key, include host + agent public keys in claims
4. **Register agent** — POST /agent/register with Host JWT → agent_id + capability grants (or approval flow)
5. **If pending** — show user verification_uri + user_code, poll GET /agent/status until active
6. **Sign Agent JWT** — sign with agent private key: sub=agent_id, aud=issuer, exp=short-lived
7. **Execute** — POST /capability/execute with Bearer <agent_jwt>

## 1. Discovery

\`\`\`
GET /.well-known/agent-configuration
\`\`\`

Response:
\`\`\`json
{
  "version": "1.0-draft",
  "provider_name": "bank",
  "issuer": "https://auth.bank.com",
  "algorithms": ["Ed25519"],
  "modes": ["delegated", "autonomous"],
  "approval_methods": ["device_authorization"],
  "endpoints": {
    "register": "/agent/register",
    "capabilities": "/capability/list",
    "execute": "/capability/execute",
    "request_capability": "/agent/request-capability",
    "status": "/agent/status",
    "revoke": "/agent/revoke",
    "introspect": "/agent/introspect",
    "device_authorization": "/device/code"
  },
  "jwks_uri": "https://auth.bank.com/.well-known/jwks.json"
}
\`\`\`

## 2. List Available Capabilities

\`\`\`
GET /capability/list
\`\`\`

Response:
\`\`\`json
{
  "capabilities": [
    { "name": "check_balance", "description": "Check account balance" },
    { "name": "transfer_domestic", "description": "Transfer funds domestically" }
  ]
}
\`\`\`

## 3. Host JWT Format

The Host JWT authenticates the client to the server. Sign with the host's Ed25519 private key. This JWT carries the public keys for both the host and the agent.

Header: { "alg": "EdDSA", "typ": "JWT" }

Required claims:
\`\`\`json
{
  "aud": "https://auth.bank.com",
  "iat": 1710000000,
  "exp": 1710000300,
  "jti": "unique-token-id",
  "host_public_key": { "kty": "OKP", "crv": "Ed25519", "x": "base64url-encoded-host-public-key" },
  "agent_public_key": { "kty": "OKP", "crv": "Ed25519", "x": "base64url-encoded-agent-public-key" }
}
\`\`\`

- aud: the issuer URL from discovery
- host_public_key: inline JWK of the host's public key (or use host_jwks_url instead)
- agent_public_key: inline JWK of the agent's public key (required for registration only; or use agent_jwks_url instead)
- On non-registration endpoints, agent key claims are optional

## 4. Register an Agent

\`\`\`
POST /agent/register
Authorization: Bearer <host_jwt>
Content-Type: application/json
\`\`\`

Request:
\`\`\`json
{
  "name": "Bank balance checker",
  "capabilities": ["check_balance", "transfer_domestic"],
  "mode": "delegated",
  "reason": "User asked to check balances and transfer funds"
}
\`\`\`

Response (auto-approved):
\`\`\`json
{
  "agent_id": "agt_abc123",
  "host_id": "hst_xyz789",
  "status": "active",
  "agent_capability_grants": [
    {
      "capability": "check_balance",
      "status": "active",
      "description": "Check account balance",
      "input": {
        "type": "object",
        "required": ["account_id"],
        "properties": {
          "account_id": { "type": "string", "description": "The bank account ID" }
        }
      }
    }
  ]
}
\`\`\`

Response (needs user approval):
\`\`\`json
{
  "agent_id": "agt_abc123",
  "status": "pending",
  "agent_capability_grants": [
    { "capability": "check_balance", "status": "pending" }
  ],
  "approval": {
    "method": "device_authorization",
    "verification_uri": "https://bank.com/device",
    "user_code": "ABCD-1234",
    "expires_in": 300,
    "interval": 5
  }
}
\`\`\`

When status is "pending": show user the verification_uri + user_code, then poll:
  GET /agent/status?agent_id=agt_abc123  (with Host JWT)
at the given interval until status becomes "active" or "rejected".

## 5. Agent JWT Format

Sign with the agent's Ed25519 private key. Short-lived (recommended 60s, max 5 min).

Header: { "alg": "EdDSA", "typ": "JWT" }

Required claims:
\`\`\`json
{
  "sub": "agt_abc123",
  "aud": "https://auth.bank.com",
  "iat": 1710000000,
  "exp": 1710000060,
  "jti": "unique-token-id",
  "capabilities": ["check_balance"]
}
\`\`\`

- sub: the agent_id from registration
- aud: the issuer from discovery
- exp: short-lived — sign a new JWT per request, no refresh tokens
- capabilities: optional — if present, restricts this JWT to listed capabilities only

## 6. Execute a Capability

\`\`\`
POST /capability/execute
Authorization: Bearer <agent_jwt>
Content-Type: application/json
\`\`\`

Request:
\`\`\`json
{
  "capability": "check_balance",
  "arguments": { "account_id": "acc_123" }
}
\`\`\`

Response:
\`\`\`json
{
  "data": {
    "account_id": "acc_123",
    "balance": 4280.13,
    "currency": "USD"
  }
}
\`\`\`

## 7. Request Additional Capabilities

\`\`\`
POST /agent/request-capability
Authorization: Bearer <agent_jwt>
Content-Type: application/json
\`\`\`

Request:
\`\`\`json
{
  "capabilities": ["transfer_international"],
  "reason": "User wants to send money abroad"
}
\`\`\`

Returns the same approval flow as registration when user consent is needed.

## Error Codes

Common errors (all endpoints):
- 401 invalid_token — JWT signature invalid, expired, or malformed
- 403 agent_revoked / agent_expired / agent_pending — agent not in active state
- 403 capability_not_granted — agent doesn't have this capability
- 429 rate_limited — too many requests

Registration errors (POST /agent/register):
- 400 unsupported_mode — mode not supported by server
- 400 unsupported_algorithm — key algorithm not accepted
- 400 invalid_capabilities — capability names don't exist
- 409 agent_exists — agent with this public key already registered

## Key Concepts

- **Host**: Persistent client identity (Ed25519 keypair). Registered once per server. Many agents share one host.
- **Agent**: Session-scoped identity with its own keypair and capability grants. Created per task/session.
- **Capability**: A server-defined action with name, description, and JSON Schema input.
- **Modes**: "delegated" (acting for a user) or "autonomous" (operating independently).
- **Agent Capability Grant**: Per-agent, per-capability record with status, granted_by, expires_at.
- **Approval**: User consent via device authorization (RFC 8628) or CIBA. Required when server can't auto-approve.

## Further Reading

- [Overview](https://agentauth.dev/overview): Conceptual introduction — problem, core concepts, flow, design decisions, and comparisons
- [Full Specification (plain text, 150K chars)](https://agentauth.dev/llms-full.txt): Complete v1.0-draft for deep ingestion
- [Specification (Markdown)](https://agentauth.dev/specification.md): Raw Markdown
- [Specification (HTML)](https://agentauth.dev/specification): Rendered spec with navigation
- [Examples](https://agentauth.dev/examples): Registration, authenticated requests, capability escalation, server verification
- [Implementations](https://agentauth.dev/implementations): SDKs, libraries, and community projects
- [Better Auth](https://better-auth.com): The auth framework behind the reference implementation
- [Protocol Repository](https://github.com/better-auth/agent-auth-protocol): Spec source, issues, and contributions
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

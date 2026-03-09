import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
  const body = `# Agent Auth Protocol

> An open, implementation-oriented protocol for AI agent identity, registration, and capability-based authorization. Gives each AI agent its own cryptographic identity, granted capabilities, and lifecycle.

## Specification

- [Full Protocol Specification](https://agentauth.dev/specification): Complete v1.0-draft spec — agent identity, host registration, capability model, JWT authentication, device authorization, introspection, and security considerations.
- [Specification (Markdown)](https://agentauth.dev/specification.md): Raw Markdown version of the full specification for LLM ingestion.

## Key Concepts

- [Agent Registration (§6.3)](https://agentauth.dev/specification#63-agent-registration): How agents register under hosts with Ed25519 keypairs and request capabilities.
- [Capability Model (§4)](https://agentauth.dev/specification#4-capabilities): Server-offered actions with name, description, input schema, and execution metadata.
- [Authentication (§5)](https://agentauth.dev/specification#5-authentication): Ed25519 keypairs, Host JWTs, Agent JWTs, and optional proof-of-possession.
- [Discovery (§6.1)](https://agentauth.dev/specification#61-discovery): GET /.well-known/agent-configuration for server configuration.
- [Execute Capability (§6.11)](https://agentauth.dev/specification#611-execute-capability): POST /capability/execute — the standard execution endpoint.
- [Approval Methods (§9)](https://agentauth.dev/specification#9-approval-methods): Device authorization (RFC 8628) and CIBA for user consent.
- [Client Tools (§7)](https://agentauth.dev/specification#7-client): connect_agent, execute_capability, request_capability, and other client-side tools.

## Implementation

- [Reference Implementation](https://github.com/better-auth/better-auth): Better Auth plugin — full server-side implementation in TypeScript.
- [Protocol Repository](https://github.com/better-auth/agent-auth-protocol): Spec source, website, and issue tracker.

## Examples

- [End-to-End Flows](https://agentauth.dev/examples): Registration, authenticated requests, capability escalation, and server verification.

## Optional

- [Implementations Page](https://agentauth.dev/implementations): SDKs, libraries, and community implementations.
- [Better Auth](https://better-auth.com): The auth framework behind the reference implementation.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

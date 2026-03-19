---
title: Discovery
description: Discovery is how agents find and connect to services — through well-known endpoints, directories, and direct URL fetching.
section: "Concepts"
---

Discovery is how agents find and connect to services. Every Agent Auth server publishes a well-known endpoint that describes its configuration. Clients can also search a directory to find services by intent.

## Well-known endpoint

Servers publish their configuration at `/.well-known/agent-configuration`. No authentication is required. This tells clients everything they need to interact with the server — supported modes, endpoints, algorithms, and approval methods.

```http
GET /.well-known/agent-configuration
```

```json
{
  "version": "1.0-draft",
  "provider_name": "bank",
  "description": "Banking services — accounts, transfers, and payments",
  "issuer": "https://auth.bank.com",
  "algorithms": ["Ed25519"],
  "modes": ["delegated", "autonomous"],
  "approval_methods": ["device_authorization", "ciba"],
  "endpoints": {
    "register": "/agent/register",
    "capabilities": "/capability/list",
    "describe_capability": "/capability/describe",
    "execute": "/capability/execute",
    "request_capability": "/agent/request-capability",
    "status": "/agent/status",
    "reactivate": "/agent/reactivate",
    "revoke": "/agent/revoke",
    "revoke_host": "/host/revoke",
    "rotate_key": "/agent/rotate-key",
    "rotate_host_key": "/host/rotate-key",
    "introspect": "/agent/introspect"
  },
  "jwks_uri": "https://auth.bank.com/.well-known/jwks.json"
}
```

Purpose-built clients (e.g. an MCP server for one specific service) may skip discovery and use pre-configured endpoints instead.

## Configuration fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Protocol version (e.g. `"1.0-draft"`) |
| `provider_name` | string | Unique provider identifier |
| `description` | string | Human-readable service description |
| `issuer` | string | Base URL of the authorization server |
| `algorithms` | string[] | Supported key types (`Ed25519`) |
| `modes` | string[] | Supported modes: `delegated`, `autonomous`, or both |
| `approval_methods` | string[] | How approval works: `device_authorization`, `ciba` |
| `endpoints` | object | Server API endpoint paths, relative to `issuer` |
| `jwks_uri` | string | URL to server's JWKS (optional) |

## Directory search

For intent-based discovery, clients query a **directory** — a searchable index of Agent Auth servers. The agent describes what it needs in natural language, and the directory returns matching providers.

```jsonc
// search_providers tool
{ "intent": "banking" }

// → returns matching providers
[{
  "name": "bank",
  "description": "Banking services — accounts, transfers, and payments",
  "issuer": "https://bank.com"
}]
```

Clients should prefer directory lookups over fetching arbitrary URLs provided by agents, as this provides a trust boundary for discovery. See the [Directory](/directory) page for available directories and the search API.

## Direct discovery

Clients can also discover a provider by fetching its well-known endpoint directly:

```jsonc
// discover_provider tool
{ "url": "https://bank.com" }

// → fetches bank.com/.well-known/agent-configuration
// → returns the provider's configuration
```

Direct discovery should require user confirmation or check against an allowlist before fetching arbitrary URLs, to protect against prompt injection attacks (see [Security Considerations](/docs/security)).

## Versioning

The `version` field uses the format `MAJOR.MINOR` with an optional `-draft` suffix. Clients must check the version before proceeding:

- If the major version is unsupported, the client must stop and report the incompatibility
- Draft versions may introduce breaking changes between releases
- Clients should ignore unrecognized fields where possible

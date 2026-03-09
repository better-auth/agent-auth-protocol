# Agent Auth Protocol

The specification website for the [Agent Auth Protocol](https://agentauth.dev) — an implementation-oriented protocol for AI agent identity, registration, and capability access.

## Development

This is an [Astro](https://astro.build) site with Tailwind CSS v4 and Pagefind search.

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321 in your browser.

### Production build

```bash
pnpm build
pnpm preview
```

The build runs Astro, generates a Pagefind search index, and copies it into `public/pagefind`.

## Structure

| Path | Description |
| --- | --- |
| `spec.mdx` | The full protocol specification (v1.0-draft) |
| `src/pages/` | Astro pages — landing, specification viewer, examples, implementations |
| `src/pages/api/chat.ts` | Streaming chat endpoint (Anthropic) for the "Ask" feature |
| `src/components/` | Nav, Footer, Search, SearchModal |
| `src/lib/spec-content.ts` | Spec MDX parsing, TOC generation, section-ref linking |
| `src/layouts/Layout.astro` | HTML shell with fonts, dark mode, search modal |

## Learn More

- [Agent Auth Protocol Specification](https://agentauth.dev/specification)
- [Better Auth](https://better-auth.com) — reference implementation

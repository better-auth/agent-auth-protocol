import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const prerender = true;

export const GET: APIRoute = async () => {
  const raw = readFileSync(resolve(process.cwd(), "spec.mdx"), "utf-8");
  const markdown = raw.replace(/^---[\s\S]*?---\n*/, "");

  const body = `# Agent Auth Protocol — Full Specification

> Complete protocol specification for AI agent identity, registration, and capability-based authorization. Version v1.0-draft.

---

${markdown}`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

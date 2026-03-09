import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const prerender = true;

export const GET: APIRoute = async () => {
  const raw = readFileSync(resolve(process.cwd(), "src/specs/v1.0-draft.mdx"), "utf-8");
  const markdown = raw.replace(/^---[\s\S]*?---\n*/, "");

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};

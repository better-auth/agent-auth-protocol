import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let specContent: string | null = null;

function getSpec(): string {
  if (specContent) return specContent;
  const raw = readFileSync(resolve(process.cwd(), "spec.mdx"), "utf-8");
  specContent = raw.replace(/^---[\s\S]*?---\n*/, "");
  return specContent;
}

const SYSTEM_PROMPT = `You are a helpful expert on the Agent Auth Protocol — an open protocol for AI agent identity, registration, and capability-based authorization.

You answer questions based ONLY on the protocol specification provided below. Be concise, precise, and technical when appropriate. Use short paragraphs. When referencing specific sections, mention the section number.

If a question is outside the scope of the protocol, say so briefly and redirect to what you can help with.

Format responses in markdown. Use code blocks for JSON/HTTP examples. Keep answers focused — aim for 2-4 paragraphs max unless the question requires more depth.

---

SPECIFICATION:

`;

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey =
    import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const model =
    import.meta.env.ANTHROPIC_MODEL ||
    process.env.ANTHROPIC_MODEL ||
    "claude-sonnet-4-20250514";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const message = body.message?.trim();
  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const spec = getSpec();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 1024,
      system: SYSTEM_PROMPT + spec,
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(
      JSON.stringify({ error: "LLM request failed", detail: err }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (
              parsed.type === "content_block_delta" &&
              parsed.delta?.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: parsed.delta.text })}\n\n`
                )
              );
            }

            if (parsed.type === "message_stop") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

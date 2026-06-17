import { createOpenRouter } from "@openrouter/ai-sdk-provider";

function requireOpenRouterApiKey(): string {
	const apiKey = process.env.OPENROUTER_API_KEY?.trim();

	if (!apiKey) {
		throw new Error(
			"Missing OPENROUTER_API_KEY. Add it to your environment before starting the server.",
		);
	}

	if (!apiKey.startsWith("sk-or-v1-")) {
		throw new Error(
			"Invalid OPENROUTER_API_KEY format. OpenRouter keys must start with 'sk-or-v1-'.",
		);
	}

	return apiKey;
}

function getOpenRouterHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		"X-Title": "Agent Auth Protocol",
	};

	const referer =
		process.env.OPENROUTER_SITE_URL?.trim() ??
		process.env.NEXT_PUBLIC_SITE_URL?.trim();

	if (referer) {
		headers["HTTP-Referer"] = referer;
	}

	return headers;
}

export const openrouter = createOpenRouter({
	apiKey: requireOpenRouterApiKey(),
	headers: getOpenRouterHeaders(),
});

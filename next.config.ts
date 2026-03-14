import type { NextConfig } from "next";

const config: NextConfig = {
	devIndicators: false,
	serverExternalPackages: [
		"onnxruntime-node",
		"@huggingface/transformers",
		"@modelcontextprotocol/sdk",
		"@ai-sdk/anthropic",
		"ai",
		"mcp-handler",
	],
};

export default config;

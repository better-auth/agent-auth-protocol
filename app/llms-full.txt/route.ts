import { source } from "@/lib/source";
import { getLLMText, getAllLLMSpecTexts } from "@/lib/get-llm-text";

export const revalidate = false;

export async function GET() {
	const docsTexts = await Promise.all(source.getPages().map(getLLMText));
	const specTexts = getAllLLMSpecTexts();

	return new Response([...docsTexts, ...specTexts].join("\n\n"), {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}

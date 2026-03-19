import type { Metadata } from "next";
import { InteractiveDemo } from "@/components/demo/interactive-demo";

export const metadata: Metadata = {
	title: "Demo — Agent Auth Protocol",
	description:
		"Try Agent Auth with a live Gmail proxy. Chat with an AI agent, approve capabilities, and see the protocol in action.",
};

export default function DemoPage() {
	return (
		<div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 lg:pt-10 h-[calc(100dvh-3rem)] flex flex-col overflow-hidden">
			<InteractiveDemo />
		</div>
	);
}

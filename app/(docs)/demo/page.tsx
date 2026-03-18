import type { Metadata } from "next";
import { DemoGuide } from "@/components/demo/demo-guide";

export const metadata: Metadata = {
	title: "Demo — Agent Auth Protocol",
	description:
		"Try Agent Auth with a live Gmail proxy. Connect an agent, approve capabilities, and see the protocol in action.",
};

export default function DemoPage() {
	return (
		<div className="mx-auto max-w-3xl px-5 sm:px-6 py-12 sm:py-16">
			<DemoGuide />
		</div>
	);
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
	title: "Registry — Agent Auth",
	description:
		"Discover services that support Agent Auth, or register your own server.",
};

export default function RegistryPage() {
	return (
		<div className="mx-auto max-w-2xl px-6 py-16 lg:py-24">
			<h1 className="text-3xl font-semibold tracking-tight text-fd-foreground">
				Registry
			</h1>
			<p className="mt-4 text-fd-muted-foreground text-[15px] leading-relaxed max-w-lg">
				The Agent Auth Registry is a directory of services that implement the
				Agent Auth protocol. Agents can discover services automatically, and
				server operators can list their endpoints for public discovery.
			</p>

			<div className="mt-10 grid gap-4 sm:grid-cols-2">
				<Link
					href="/registry/explore"
					className="group border border-fd-border p-5 transition-colors hover:bg-fd-accent/50"
				>
					<p className="text-sm font-medium text-fd-foreground">
						Explore services
					</p>
					<p className="mt-1.5 text-[13px] text-fd-muted-foreground leading-relaxed">
						Browse services that support Agent Auth and see their
						capabilities.
					</p>
					<div className="mt-4 flex items-center gap-1.5 text-xs text-fd-muted-foreground group-hover:text-fd-foreground transition-colors">
						Browse
						<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
					</div>
				</Link>

				<Link
					href="/registry/add"
					className="group border border-fd-border p-5 transition-colors hover:bg-fd-accent/50"
				>
					<p className="text-sm font-medium text-fd-foreground">
						Add your server
					</p>
					<p className="mt-1.5 text-[13px] text-fd-muted-foreground leading-relaxed">
						Register your Agent Auth server so agents and developers can
						find it.
					</p>
					<div className="mt-4 flex items-center gap-1.5 text-xs text-fd-muted-foreground group-hover:text-fd-foreground transition-colors">
						Register
						<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
					</div>
				</Link>
			</div>

			<p className="mt-10 text-[13px] text-fd-muted-foreground/60">
				The registry is part of the Agent Auth protocol&apos;s{" "}
				<Link
					href="/docs/discovery"
					className="underline underline-offset-2 hover:text-fd-muted-foreground transition-colors"
				>
					discovery mechanism
				</Link>
				.
			</p>
		</div>
	);
}

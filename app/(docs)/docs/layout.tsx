import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
			{children}
		</div>
	);
}

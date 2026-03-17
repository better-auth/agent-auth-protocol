import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			viewBox="0 0 163 91"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M61 90.88L93.768 0H108.616L139.94 90.88H129.44L120.264 65.024H82.12L73.032 90.88H61ZM85.832 54.272H116.552L101.192 9.6L85.832 54.272Z"
				className="fill-foreground"
			/>
			<path
				d="M0 90.88L32.768 0H47.616L69.9399 63.8799L64.9399 76.8799L59.264 65.024H21.12L12.032 90.88H0ZM24.832 54.272H55.552L40.192 9.6L24.832 54.272Z"
				className="fill-foreground"
			/>
			<rect x="147.44" y="75.8799" width="15" height="15" className="fill-foreground" />
		</svg>
	);
}

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
				fill="currentColor"
			/>
		</svg>
	);
}

export function DiscordIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.36-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"
				fill="currentColor"
			/>
		</svg>
	);
}

export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8" />
		</svg>
	);
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
			<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
		</svg>
	);
}

export function SlashIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			{...props}
		>
			<path d="M12 2v20" />
		</svg>
	);
}

export function BetterAuthLogo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			viewBox="0 0 60 45"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M0 0H15V15H30V30H15V45H0V30V15V0ZM45 30V15H30V0H45H60V15V30V45H45H30V30H45Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function WordmarkLogo({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={`flex items-center gap-1 ${className ?? ""}`} {...props}>
			<BetterAuthLogo className="h-[80%] w-auto" />
			<span className="text-foreground/30 font-light select-none leading-none">|</span>
			<span
				className="tracking-[0.1em] text-[13px] uppercase whitespace-nowrap leading-none"
				style={{ fontFamily: "var(--font-sans), sans-serif", fontWeight: 400 }}
			>
				Agent-Auth.
			</span>
		</div>
	);
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 16 16" fill="currentColor" {...props}>
			<path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
		</svg>
	);
}

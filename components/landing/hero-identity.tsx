"use client";

import { useEffect, useRef, useState } from "react";

const HEX = "0123456789abcdef";

function randomHex(len: number) {
	let s = "";
	for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
	return s;
}

function useScramble(target: string, speed = 30, delay = 0) {
	const [display, setDisplay] = useState("");
	const frameRef = useRef<number>(0);

	useEffect(() => {
		let cancelled = false;
		const len = target.length;
		let resolved = 0;
		let tick = 0;

		const timeout = setTimeout(() => {
			const run = () => {
				if (cancelled) return;
				tick++;
				if (tick % 2 === 0 && resolved < len) resolved++;
				let s = "";
				for (let i = 0; i < len; i++) {
					s += i < resolved ? target[i] : HEX[Math.floor(Math.random() * 16)];
				}
				setDisplay(s);
				if (resolved < len) {
					frameRef.current = window.setTimeout(run, speed);
				}
			};
			run();
		}, delay);

		return () => {
			cancelled = true;
			clearTimeout(timeout);
			clearTimeout(frameRef.current);
		};
	}, [target, speed, delay]);

	return display;
}

function CapIcon({ type }: { type: string }) {
	const cls = "w-2.5 h-2.5";
	const props = {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.5,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
		className: cls,
	};
	switch (type) {
		case "wallet":
			return (
				<svg {...props}>
					<rect x="2" y="5" width="20" height="14" rx="2" />
					<path d="M16 12h.01" />
				</svg>
			);
		case "banknote":
			return (
				<svg {...props}>
					<rect x="2" y="6" width="20" height="12" rx="2" />
					<circle cx="12" cy="12" r="2" />
					<path d="M6 12h.01M18 12h.01" />
				</svg>
			);
		case "list":
			return (
				<svg {...props}>
					<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
				</svg>
			);
		case "rocket":
			return (
				<svg {...props}>
					<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
					<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
				</svg>
			);
		case "mail":
			return (
				<svg {...props}>
					<rect x="2" y="4" width="20" height="16" rx="2" />
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
			);
		case "circle-dot":
			return (
				<svg {...props}>
					<circle cx="12" cy="12" r="10" />
					<circle cx="12" cy="12" r="1" />
				</svg>
			);
		case "database":
			return (
				<svg {...props}>
					<ellipse cx="12" cy="5" rx="9" ry="3" />
					<path d="M3 5v14a9 3 0 0 0 18 0V5" />
					<path d="M3 12a9 3 0 0 0 18 0" />
				</svg>
			);
		case "message":
			return (
				<svg {...props}>
					<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
				</svg>
			);
		default:
			return null;
	}
}

interface Fragment {
	type: "id" | "key" | "cap" | "hash" | "check";
	value: string;
	icon?: string;
	x: number;
	y: number;
	opacity: number;
	size: "sm" | "md";
	delay: number;
}

function seededFragments(seed: number): Fragment[] {
	const ids = [
		"agt_k7x9m2",
		"agt_r3p8v1",
		"agt_w5n2j6",
		"agt_h9t4q8",
		"agt_b1y7c3",
		"agt_f6s0d5",
	];
	const caps = [
		{ name: "check_balance", icon: "wallet" },
		{ name: "transfer_funds", icon: "banknote" },
		{ name: "list_transactions", icon: "list" },
		{ name: "deploy_site", icon: "rocket" },
		{ name: "read_emails", icon: "mail" },
		{ name: "create_issue", icon: "circle-dot" },
		{ name: "query_database", icon: "database" },
		{ name: "send_message", icon: "message" },
	];
	const keys = [
		"MCowBQYDK2VwAyEA",
		"7kRp3nGxYf2mQvLd",
		"Xs9HjT4bWcN1aE5u",
		"pF8gKzR0iV6wJ3oY",
	];

	const positions: [number, number][] = [
		[2, 8],
		[92, 5],
		[8, 82],
		[88, 88],
		[1, 35],
		[95, 38],
		[18, 3],
		[75, 95],
		[42, 2],
		[60, 94],
		[3, 92],
		[96, 15],
		[12, 50],
		[85, 55],
		[30, 94],
		[72, 6],
		[5, 68],
		[92, 70],
		[25, 15],
		[78, 42],
		[50, 96],
		[35, 60],
		[65, 18],
		[15, 25],
		[82, 30],
		[45, 8],
		[55, 75],
		[8, 15],
		[90, 82],
		[22, 70],
	];

	const frags: Fragment[] = [];
	const s = seed;

	for (let i = 0; i < 8; i++) {
		const [x, y] = positions[i % positions.length];
		frags.push({
			type: "id",
			value: ids[(s + i) % ids.length],
			x,
			y,
			opacity: 0.7 + (i % 3) * 0.07,
			size: "sm",
			delay: i * 180,
		});
	}

	for (let i = 0; i < 7; i++) {
		const [x, y] = positions[(i + 8) % positions.length];
		const cap = caps[(s + i) % caps.length];
		frags.push({
			type: "cap",
			value: cap.name,
			icon: cap.icon,
			x,
			y,
			opacity: 0.7 + (i % 3) * 0.07,
			size: "sm",
			delay: 600 + i * 220,
		});
	}

	for (let i = 0; i < 6; i++) {
		const [x, y] = positions[(i + 15) % positions.length];
		frags.push({
			type: "key",
			value: keys[(s + i) % keys.length],
			x,
			y,
			opacity: 0.7 + (i % 2) * 0.1,
			size: "sm",
			delay: 300 + i * 250,
		});
	}

	for (let i = 0; i < 5; i++) {
		const [x, y] = positions[(i + 21) % positions.length];
		frags.push({
			type: "check",
			value: "✓",
			x,
			y,
			opacity: 0.7 + (i % 3) * 0.07,
			size: "sm",
			delay: 1000 + i * 180,
		});
	}

	for (let i = 0; i < 4; i++) {
		const [x, y] = positions[(i + 26) % positions.length];
		frags.push({
			type: "hash",
			value: "",
			x,
			y,
			opacity: 0.7 + (i % 2) * 0.1,
			size: "sm",
			delay: 0,
		});
	}

	return frags;
}

function ScrambleFragment({
	frag,
}: { frag: Fragment }) {
	const [visible, setVisible] = useState(false);
	const [key, setKey] = useState(0);
	const text = useScramble(frag.value, 35, 0);

	useEffect(() => {
		const duration = 3000 + Math.random() * 4000;
		const pause = 2000 + Math.random() * 3000;

		const showTimeout = setTimeout(() => setVisible(true), frag.delay);

		const interval = setInterval(() => {
			setVisible(false);
			setTimeout(() => {
				setKey((k) => k + 1);
				setVisible(true);
			}, pause);
		}, duration + pause);

		return () => {
			clearTimeout(showTimeout);
			clearInterval(interval);
		};
	}, [frag.delay]);

	return (
		<div
			key={key}
			className="absolute font-mono text-[8px]"
			style={{
				left: `${frag.x}%`,
				top: `${frag.y}%`,
				opacity: visible ? frag.opacity : 0,
				transition: `opacity ${visible ? "1.5s" : "2s"} ease-${visible ? "in" : "out"}`,
			}}
		>
			{frag.type === "id" && (
				<span className="text-emerald-600 dark:text-emerald-400">{text}</span>
			)}
			{frag.type === "key" && (
				<span className="text-foreground/60 dark:text-foreground/60">{text}</span>
			)}
			{frag.type === "cap" && (
				<span className="text-foreground/50 dark:text-foreground/60 flex items-center gap-0.5">
					{frag.icon && <CapIcon type={frag.icon} />}
					{text}
				</span>
			)}
			{frag.type === "check" && (
				<span className="text-emerald-600 dark:text-emerald-400 text-[10px]">✓</span>
			)}
		</div>
	);
}

function HashFragment({ frag }: { frag: Fragment }) {
	const [text, setText] = useState("");
	useEffect(() => {
		const tick = setInterval(() => setText(randomHex(24)), 90);
		return () => clearInterval(tick);
	}, []);

	return (
		<div
			className="absolute font-mono text-[8px] text-foreground/50 dark:text-foreground/50 whitespace-nowrap"
			style={{
				left: `${frag.x}%`,
				top: `${frag.y}%`,
				opacity: frag.opacity,
			}}
		>
			{text}
		</div>
	);
}

export function HeroIdentityBg() {
	const [fragments] = useState(() => seededFragments(0));

	return (
		<div
			className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
			aria-hidden="true"
			style={{
				maskImage:
					"radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, black 100%)",
				WebkitMaskImage:
					"radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, black 100%)",
			}}
		>
			{fragments.map((frag, i) =>
				frag.type === "hash" ? (
					<HashFragment key={`h-${i}`} frag={frag} />
				) : (
					<ScrambleFragment
						key={`${frag.type}-${i}`}
						frag={frag}
					/>
				),
			)}
		</div>
	);
}

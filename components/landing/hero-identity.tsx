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

type ColorClass =
	| "text-emerald-500/50 dark:text-emerald-400/40"
	| "text-sky-500/50 dark:text-sky-400/40"
	| "text-amber-500/50 dark:text-amber-400/40"
	| "text-violet-500/50 dark:text-violet-400/40"
	| "text-rose-500/40 dark:text-rose-400/35"
	| "text-foreground/30";

interface Fragment {
	value: string;
	x: number;
	y: number;
	opacity: number;
	delay: number;
	color: ColorClass;
}

const COLORS: ColorClass[] = [
	"text-emerald-500/50 dark:text-emerald-400/40",
	"text-sky-500/50 dark:text-sky-400/40",
	"text-amber-500/50 dark:text-amber-400/40",
	"text-violet-500/50 dark:text-violet-400/40",
	"text-rose-500/40 dark:text-rose-400/35",
	"text-foreground/30",
];

function seededFragments(): Fragment[] {
	const values = [
		"agt_k7x9m2",
		"0x7f3a9b2e",
		"agt_r3p8v1",
		"MCowBQYDK2Vw",
		"4a8f0c12d6",
		"agt_w5n2j6",
		"7kRp3nGxYf2m",
		"b91e4d7c",
		"agt_h9t4q8",
		"Xs9HjT4bWcN1",
		"3f6a82c0",
		"agt_b1y7c3",
		"pF8gKzR0iV6w",
		"0xd4e5f1a7",
		"agt_f6s0d5",
		"a2b9c8d1e4",
		"9c0d3e7f",
		"6b4a1d8e",
		"0x2c9f8a3b",
		"f7e1d0c5",
		"agt_m4v2k8",
		"0xe8b3c7f2",
		"d5a1f9e3",
		"agt_q6j1n0",
		"8c3b7d2a",
		"KzR0iV6wJ3oY",
		"agt_t8w3x5",
		"0x1a4f6e9d",
		"c7d2e8f0",
		"agt_p2s9a4",
		"5e0b8c3d",
		"NxYf2mQvLd7k",
		"agt_g5h1r7",
		"0x9d2c5f8a",
		"1b6e4a7c",
	];

	const positions: [number, number][] = [
		[2, 6],
		[92, 4],
		[8, 82],
		[88, 88],
		[1, 32],
		[95, 36],
		[18, 2],
		[75, 95],
		[42, 1],
		[60, 96],
		[3, 92],
		[96, 14],
		[12, 48],
		[85, 52],
		[30, 95],
		[72, 5],
		[5, 66],
		[92, 68],
		[25, 12],
		[78, 40],
		[50, 97],
		[35, 58],
		[65, 16],
		[15, 22],
		[82, 28],
		[45, 6],
		[55, 78],
		[8, 14],
		[90, 80],
		[22, 72],
		[38, 42],
		[68, 62],
		[4, 48],
		[94, 50],
		[52, 86],
	];

	return values.map((value, i) => ({
		value,
		x: positions[i][0],
		y: positions[i][1],
		opacity: 0.35 + (i % 5) * 0.08,
		delay: i * 140,
		color: COLORS[i % COLORS.length],
	}));
}

function ScrambleFragment({ frag }: { frag: Fragment }) {
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
			className={`absolute font-mono text-[8px] ${frag.color}`}
			style={{
				left: `${frag.x}%`,
				top: `${frag.y}%`,
				opacity: visible ? frag.opacity : 0,
				transition: `opacity ${visible ? "1.5s" : "2s"} ease-${visible ? "in" : "out"}`,
			}}
		>
			{text}
		</div>
	);
}

function HashFragment({
	x,
	y,
	opacity,
	color,
}: { x: number; y: number; opacity: number; color: ColorClass }) {
	const [text, setText] = useState("");
	useEffect(() => {
		const tick = setInterval(() => setText(randomHex(24)), 90);
		return () => clearInterval(tick);
	}, []);

	return (
		<div
			className={`absolute font-mono text-[8px] whitespace-nowrap ${color}`}
			style={{ left: `${x}%`, top: `${y}%`, opacity }}
		>
			{text}
		</div>
	);
}

const hashPositions: [number, number, number, ColorClass][] = [
	[50, 98, 0.4, "text-foreground/30"],
	[35, 56, 0.35, "text-emerald-500/50 dark:text-emerald-400/40"],
	[65, 14, 0.35, "text-sky-500/50 dark:text-sky-400/40"],
	[15, 20, 0.4, "text-foreground/30"],
	[82, 26, 0.35, "text-amber-500/50 dark:text-amber-400/40"],
	[45, 4, 0.35, "text-foreground/30"],
	[55, 72, 0.4, "text-violet-500/50 dark:text-violet-400/40"],
	[8, 12, 0.35, "text-foreground/30"],
	[90, 78, 0.35, "text-rose-500/40 dark:text-rose-400/35"],
	[22, 68, 0.4, "text-foreground/30"],
	[70, 44, 0.35, "text-sky-500/50 dark:text-sky-400/40"],
	[28, 86, 0.35, "text-emerald-500/50 dark:text-emerald-400/40"],
	[58, 32, 0.35, "text-amber-500/50 dark:text-amber-400/40"],
	[40, 74, 0.35, "text-violet-500/50 dark:text-violet-400/40"],
	[2, 54, 0.35, "text-foreground/30"],
];

export function HeroIdentityBg() {
	const [fragments] = useState(() => seededFragments());

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
			{fragments.map((frag, i) => (
				<ScrambleFragment key={`s-${i}`} frag={frag} />
			))}
			{hashPositions.map(([x, y, opacity, color], i) => (
				<HashFragment key={`h-${i}`} x={x} y={y} opacity={opacity} color={color} />
			))}
		</div>
	);
}

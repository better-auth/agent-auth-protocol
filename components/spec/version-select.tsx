"use client";

import { useRouter } from "next/navigation";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";

export function VersionSelect({
	versions,
	current,
	className,
}: {
	versions: string[];
	current: string;
	className?: string;
}) {
	const router = useRouter();

	return (
		<NativeSelect
			defaultValue={current}
			onChange={(e) => router.push(`/specification/${e.target.value}`)}
			className={className}
		>
			{versions.map((v) => (
				<NativeSelectOption key={v} value={v}>
					{v}
				</NativeSelectOption>
			))}
		</NativeSelect>
	);
}

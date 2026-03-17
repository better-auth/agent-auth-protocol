import { redirect } from "next/navigation";
import { DEFAULT_SPEC_VERSION } from "@/lib/spec";

export default function SpecificationPage() {
	redirect(`/specification/${DEFAULT_SPEC_VERSION}`);
}

import { getSession } from "@/lib/demo/sessions";

function getAgentId(session: NonNullable<ReturnType<typeof getSession>>): string | null {
	if (session.lastAgentId) return session.lastAgentId;
	const storage = session.storage as unknown as { agents?: Map<string, unknown> };
	if (storage.agents?.size) {
		return [...storage.agents.keys()].pop() ?? null;
	}
	return null;
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	const sessionId = url.searchParams.get("sessionId");

	if (!sessionId) {
		return Response.json({ error: "Missing sessionId" }, { status: 400 });
	}

	const session = getSession(sessionId);
	if (!session) {
		return Response.json({ status: "idle", grants: [] });
	}

	const agentId = getAgentId(session);
	if (!agentId) {
		return Response.json({ status: "idle", grants: [] });
	}

	try {
		const result = await session.client.agentStatus(agentId);
		if (result.status === "active") {
			session.pendingApproval = null;
			session.lastAgentId = agentId;
		}
		return Response.json({
			status: result.status,
			grants:
				result.agent_capability_grants
					?.filter(
						(g: { status: string }) => g.status === "active",
					)
					.map((g: { capability: string }) => g.capability) ?? [],
		});
	} catch {
		return Response.json({ status: "unknown", grants: [] });
	}
}

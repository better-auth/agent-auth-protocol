import { AgentAuthClient, MemoryStorage, type ApprovalInfo } from "@auth/agent";

export interface DemoSession {
  client: AgentAuthClient;
  storage: MemoryStorage;
  pendingApproval: ApprovalInfo | null;
  lastAgentId: string | null;
  awaitingChoice: boolean;
}

const globalStore = globalThis as unknown as {
  __demoSessions?: Map<string, DemoSession>;
  __demoTimers?: Map<string, ReturnType<typeof setTimeout>>;
};
const sessions = (globalStore.__demoSessions ??= new Map<string, DemoSession>());
const sessionTimers = (globalStore.__demoTimers ??= new Map<string, ReturnType<typeof setTimeout>>());

const SESSION_TTL = 30 * 60 * 1000;

function touchSession(id: string) {
  const existing = sessionTimers.get(id);
  if (existing) clearTimeout(existing);
  sessionTimers.set(
    id,
    setTimeout(() => {
      const session = sessions.get(id);
      session?.client.destroy();
      sessions.delete(id);
      sessionTimers.delete(id);
    }, SESSION_TTL),
  );
}

export function getSession(id: string): DemoSession | undefined {
  const session = sessions.get(id);
  if (session) touchSession(id);
  return session;
}

export function getOrCreateSession(id: string): DemoSession {
  const existing = sessions.get(id);
  if (existing) {
    touchSession(id);
    return existing;
  }

  const storage = new MemoryStorage();
  const session: DemoSession = {
    client: new AgentAuthClient({
      storage,
      hostName: "Agent Auth Interactive Demo",
      approvalTimeoutMs: 1,
      onApprovalRequired(info) {
        session.pendingApproval = info;
      },
      onApprovalStatusChange(status) {
        if (status === "active") {
          session.pendingApproval = null;
        }
      },
    }),
    storage,
    pendingApproval: null,
    lastAgentId: null,
    awaitingChoice: false,
  };

  sessions.set(id, session);
  touchSession(id);
  return session;
}

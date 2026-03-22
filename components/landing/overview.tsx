"use client";
import { CodeIcon, GlobeIcon, ReaderIcon } from "@radix-ui/react-icons";
import { motion } from "motion/react";

const sharedTokenAgents = ["agent_1", "agent_2", "agent_3"] as const;

const scopedAgentRows = [
  { id: "agt_1", cap: "read:accounts", constraint: "own · last_90d" },
  { id: "agt_2", cap: "transfer:funds", constraint: "≤500 · USD · domestic" },
  { id: "agt_3", cap: "read:txns", constraint: "own · readonly · 50/hr" },
] as const;

function AgentIcon({ variant }: { variant: "red" | "green" }) {
  const color =
    variant === "red"
      ? "text-red-600/85 dark:text-red-300/75"
      : "text-emerald-700/80 dark:text-emerald-300/65";
  return (
    <svg
      className={`w-3.5 h-3.5 ${color}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
    </svg>
  );
}

function FlowArrow() {
  return (
    <svg
      className="w-5 h-5 shrink-0 text-foreground/45 dark:text-foreground/35"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ServerNode({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full text-foreground/55"
          viewBox="0 0 40 40"
        >
          <rect
            x="1"
            y="1"
            width="38"
            height="38"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="1"
            y1="14"
            x2="39"
            y2="14"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <line
            x1="1"
            y1="27"
            x2="39"
            y2="27"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="21" r="1.5" fill="currentColor" />
          <circle cx="8" cy="34" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <span className="text-[9px] font-mono text-foreground/80 dark:text-foreground/65 tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="inline-flex items-center border border-foreground/15 dark:border-foreground/12 bg-foreground/4 dark:bg-foreground/3 px-3 py-1 text-[10px] sm:text-[11px] font-mono tracking-[0.14em] uppercase text-foreground/75 dark:text-foreground/65">
        {label}
      </span>
      <div className="h-px flex-1 bg-linear-to-r from-foreground/15 dark:from-foreground/12 to-transparent" />
    </div>
  );
}

export function ProtocolOverview() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="mx-auto max-w-4xl px-5 sm:px-6 py-16 sm:py-20"
    >
      <div className="spec-prose mb-16">
        <p>
          Everything we{"'"}ve built for auth on the web assumes two kinds of
          actors: a human user and a static application, with predefined scopes
          and known execution paths.
        </p>
        <p>
          Agents fit neither role. They act on behalf of a user or entirely on
          their own, call external services, discover tools at runtime, need one
          capability now and a different one later, and often run long after the
          human who started them has moved on.
        </p>
        <p>
          Agent Auth makes the runtime agent a first-class principal. Each agent
          is registered with its own identity, granted specific capabilities,
          and governed by a lifecycle the server controls. The server sees
          exactly which agent is acting, what it is authorized to do, and can
          terminate one without affecting anything else.
        </p>
      </div>

      {/* Delegated — diagram */}
      <div className="mb-12">
        <div className="overflow-hidden border border-foreground/15 dark:border-foreground/12 bg-foreground/[0.015] shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
          {/* Today */}
          <div className="flex h-full flex-col gap-6 bg-linear-to-br from-red-500/[0.12] via-red-500/[0.05] to-background p-5 md:p-7">
            <div className="flex-1 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-red-600 dark:text-red-300/85">
                Today
              </div>
              <p className="max-w-sm text-sm leading-6 text-foreground/80 dark:text-foreground/72">
                All agents share one token. The server sees the user, not the
                agent.
              </p>
            </div>
            <div className="mt-auto border border-red-600/18 dark:border-red-300/16 bg-background/80 dark:bg-black/30 p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex-1 border border-dashed border-red-600/30 dark:border-red-300/24 p-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-red-700/80 dark:text-red-200/70 mb-2 text-center">
                    token: s_123
                  </div>
                  <div className="flex flex-col gap-1">
                    {sharedTokenAgents.map((id) => (
                      <div
                        key={id}
                        className="flex items-center gap-1.5 px-2 py-1 border border-red-600/25 dark:border-red-300/22 bg-red-500/[0.07] dark:bg-red-400/[0.08]"
                      >
                        <AgentIcon variant="red" />
                        <span className="text-[10px] font-mono text-red-700 dark:text-red-200/80">
                          {id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <FlowArrow />
                <ServerNode label="Server" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-foreground/12 dark:bg-foreground/10" />
          <div className="md:hidden h-px bg-foreground/12 dark:bg-foreground/10" />

          {/* With Agent Auth */}
          <div className="flex h-full flex-col gap-6 bg-linear-to-br from-emerald-500/[0.12] via-emerald-500/[0.05] to-background p-5 md:p-7">
            <div className="flex-1 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300/80">
                With Agent Auth
              </div>
              <p className="max-w-sm text-sm leading-6 text-foreground/80 dark:text-foreground/72">
                Each agent has its own identity with scoped capabilities and
                constraints. Every request traces back to a specific agent.
              </p>
            </div>
            <div className="mt-auto border border-emerald-700/18 dark:border-emerald-300/16 bg-background/80 dark:bg-black/30 p-4 md:p-5">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  {scopedAgentRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center gap-1.5 px-2 py-1.5 border border-emerald-700/20 dark:border-emerald-300/18 bg-emerald-500/[0.07] dark:bg-emerald-400/[0.08]"
                    >
                      <AgentIcon variant="green" />
                      <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-200/80 mr-2">
                        {row.id}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-emerald-800/80 dark:text-emerald-300/65">
                          {row.cap}
                        </span>
                        <span className="text-[10px] font-mono text-foreground/60 dark:text-foreground/60 tracking-tight">
                          {row.constraint}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <FlowArrow />
                <ServerNode label="Server" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three problems */}
      <div className="spec-prose mb-12">
        <p>The protocol is designed to solve three problems:</p>
        <p>
          <strong>Delegated agents</strong> — when an agent acts on behalf of a
          user, it gets its own identity, fine-grained capabilities with
          constraints, and an independent lifecycle the server can audit and
          control.
        </p>
        <p>
          <strong>Autonomous agents</strong> — when there{"'"}s no user in the
          loop, lets an agent register and operate directly with its own
          identity — without being forced to pretend to be human by opening a
          browser, solving a CAPTCHA, or clicking through forms built for
          people. A user can link to the agent later, claiming its activity
          history and taking over governance.
        </p>
        <p>
          <strong>Discovery</strong> — standardizes a well-known endpoint and a{" "}
          <a
            href="https://agent-auth.directory"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground/80 transition-colors"
          >
            directory
          </a>{" "}
          so agents can find and connect to services automatically — by URL or
          by describing what they need in natural language. This avoids the need
          for pre-configuring services.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  APPROACH                                       */}
      {/* ═══════════════════════════════════════════════ */}

      <div className="mt-16 mb-4">
        <h2
          className="text-xl sm:text-2xl md:text-3xl tracking-[-0.015em] font-semibold mb-6"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Approach
        </h2>

        <div className="spec-prose">
          <p>
            <strong>Comprehensive:</strong> This protocol is intentionally
            broad. It covers identity, registration, capabilities, discovery,
            and lifecycle — everything an agent needs to operate as a
            first-class principal.
          </p>
          <p>
            <strong>Implementation-oriented:</strong> This protocol ships with
            official implementations. We expect most use cases to be served
            through them. The specification exists to enable additional
            implementations and custom use cases.
          </p>
          <p>
            <strong>Easy to adopt:</strong> It's designed for existing
            infrastructure. The official implementations ship with adapters that
            turn your existing OpenAPI / MCP tools into an Agent Auth server.
          </p>
          <p>
            <strong>Open source:</strong> This project is developed in the open.
            The spec and reference implementations are open source, and we
            welcome contributions, feedback, and implementations from the
            community.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  FAQ                                             */}
      {/* ═══════════════════════════════════════════════ */}

      <div className="mb-4">
        <h2
          className="text-xl sm:text-2xl md:text-3xl tracking-[-0.015em] font-semibold mb-8"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          FAQ
        </h2>
        <div className="space-y-10">
          {[
            {
              q: "Why not use MCP auth?",
              a: "MCP uses OAuth 2.1 for authentication. OAuth was designed for users authorizing 3rd party applications instead of sharing credentials — it has no concept of per-agent identity, capability-based authorization, or agent lifecycle. When three agents use the same MCP server through OAuth, the server sees one client, not three agents. Agent Auth can sit alongside MCP — services can expose capabilities through MCP tools while using Agent Auth for the identity and authorization layer.",
            },
            {
              q: "Is this an OAuth replacement?",
              a: "No. Agent Auth is not meant to compete with or replace OAuth in the general sense. OAuth solves a different problem: letting a user grant a third-party application access to their resources. Agent Auth is a single protocol purpose-built for agent identity, registration, capabilities, and discovery. If you purely support Agent Auth, you don't need an OAuth server, but a server may still support OAuth for users to authorize applications.",
            },
            {
              q: "Is this tied to Better Auth?",
              a: "No. This specification and its implementations are created and maintained by the Better Auth team, but they are not tied to Better Auth. You don't need Better Auth to implement or use Agent Auth. The protocol is designed to be adopted independently by any platform or provider.",
            },
          ].map((item) => (
            <div key={item.q}>
              <h3
                className="text-base sm:text-lg tracking-normal font-medium mb-2.5 text-foreground/85 dark:text-foreground/75"
                style={{ fontFamily: "var(--font-content), Georgia, serif" }}
              >
                {item.q}
              </h3>
              <p
                className="text-[15px] sm:text-[17.5px] text-foreground/65 dark:text-foreground/55 leading-[1.9]"
                style={{ fontFamily: "var(--font-content), Georgia, serif" }}
              >
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  GET STARTED                                    */}
      {/* ═══════════════════════════════════════════════ */}

      <div className="mt-20 border border-foreground/15 dark:border-foreground/12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-foreground/15 dark:bg-foreground/12">
          {[
            {
              label: "Docs",
              title: "Read the documentation",
              href: "/docs",
              icon: ReaderIcon,
            },
            {
              label: "SDKs",
              title: "Official implementations",
              href: "/docs/sdks",
              icon: CodeIcon,
            },
            {
              label: "Directory",
              title: "Submit your server",
              href: "https://agent-auth.directory",
              icon: GlobeIcon,
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="bg-background p-5 sm:p-6 flex flex-col gap-2 group transition-colors hover:bg-foreground/3 dark:hover:bg-foreground/2"
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5 text-foreground/45 dark:text-foreground/35" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/45 dark:text-foreground/35">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground/75 dark:text-foreground/65 group-hover:text-foreground transition-colors">
                {item.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

# Paperclip Digest

- **URL**: https://github.com/paperclipai/paperclip
- **Date Researched**: 2026-03-22

## 🛠 Tech Stack

- **Primary Language**: TypeScript (ESM throughout)
- **Frameworks/Libraries**:
  - `express` v5 — HTTP API server
  - `drizzle-orm` + `embedded-postgres` — ORM with zero-setup embedded PostgreSQL (or external Postgres for production)
  - `better-auth` — Authentication layer
  - `zod` — Schema validation
  - `vite` — UI dev server and bundler
  - `react` + `react-router` — Frontend SPA
  - `vitest` + `playwright` — Unit and E2E testing
  - `pino` — Structured logging
  - `ws` — WebSocket server for real-time events
  - `sharp`, `multer` — Asset handling
  - `commander` — CLI argument parsing
- **Build/Package Tools**: `pnpm` v9.15 workspaces, `esbuild` (CLI bundling), `tsx` (dev server execution)

## 🚀 Key Features

- **Heartbeat-driven agent scheduling**: Agents wake on a cron-like schedule or event triggers (task assignment, @-mentions). Each wake cycle is tracked as a `heartbeat_run` with full event log, exit code, and usage summary.
- **Adapter abstraction layer**: Seven first-class adapters (`claude_local`, `codex_local`, `cursor`, `gemini_local`, `opencode_local`, `pi_local`, `openclaw_gateway`) decouple orchestration from agent runtimes. Adapters expose a unified `AdapterExecutionResult` interface.
- **Org chart with cycle detection**: Agents carry `reportsTo` FK relationships; the service enforces acyclicity, computes `getChainOfCommand`, and builds tree views for the org chart.
- **Atomic task checkout + budget enforcement**: `budgetMonthlyCents` per agent; cost events are aggregated per UTC month window. Budget exhaustion pauses an agent automatically (`pauseReason: "budget"`).
- **Immutable config revision history with rollback**: Every change to a tracked agent config field (name, role, adapterConfig, etc.) produces a `agentConfigRevision` row with before/after snapshots. Rollback re-applies a previous snapshot.
- **Plugin system**: Plugins run in isolated worker processes (`plugin-worker-manager`), scheduled via `plugin-job-scheduler`, and expose tools via `plugin-tool-dispatcher`. A stable `@paperclipai/plugin-sdk` package provides the worker-side API and React UI hooks.
- **Multi-company isolation**: Every entity is `companyId`-scoped. A single deployment serves multiple companies with separate data, audit trails, and secrets.
- **Secret management with redaction**: Secrets stored and injected at runtime; config snapshots containing `REDACTED` markers block rollback to protect against secret exposure.
- **Real-time dashboard**: WebSocket-based `live-events` service pushes activity to the UI without polling.
- **Execution workspace management**: Per-issue or per-project isolated filesystem workspaces; optionally git-clone a repo into a managed directory before each run.
- **Runtime skill injection**: Company-scoped skill files are injected into agent context at runtime without retraining.
- **Portable company templates**: Export/import org structures, agent configs, and skills with secret scrubbing and collision handling.

## 🏗 High-Level Architecture

Paperclip is a **pnpm monorepo** with a clear layered architecture:

```
┌────────────────────────────────────────────────────────────────┐
│  CLI (@paperclipai/cli)                                        │
│  npx paperclipai onboard | heartbeat-run | run | doctor …      │
└───────────────────────┬────────────────────────────────────────┘
                        │ spawns / manages
┌───────────────────────▼────────────────────────────────────────┐
│  Server (@paperclipai/server)  — Express 5 + WebSocket         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Routes   │ │Services  │ │ Middleware   │ │ Plugin host  │  │
│  │ /api/…   │ │heartbeat │ │ auth/actor   │ │ worker mgr   │  │
│  │          │ │agents    │ │ board-guard  │ │ job sched    │  │
│  │          │ │budgets   │ │ hostname-grd │ │ event bus    │  │
│  └──────────┘ └────┬─────┘ └──────────────┘ └──────┬───────┘  │
│                    │ invokes                        │          │
│           ┌────────▼────────────────────────────────▼───────┐  │
│           │  Adapter Layer (packages/adapters/*)            │  │
│           │  claude-local | codex-local | gemini-local      │  │
│           │  cursor | openclaw-gateway | opencode | pi       │  │
│           └────────────────────────────────────────────────┘  │
│                    │ persists to                               │
│           ┌────────▼────────────────────────────────────────┐  │
│           │  DB (@paperclipai/db)                           │  │
│           │  Drizzle ORM + embedded/external PostgreSQL     │  │
│           └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                        │ served to
┌───────────────────────▼────────────────────────────────────────┐
│  UI (@paperclipai/ui)  — React SPA (Vite)                      │
│  Dashboard | Org Chart | Issues | Goals | Approvals | Plugins  │
└────────────────────────────────────────────────────────────────┘
```

The **heartbeat service** is the core orchestration engine: it selects eligible agents, checks out tasks atomically, resolves workspace environments, injects secrets and skills, delegates execution to the appropriate adapter, streams logs in real-time, records cost events, and finalizes the run record.

## 📂 Directory Structure (Core)

```
paperclip/
├── cli/src/
│   ├── index.ts              # CLI entry point (commander)
│   ├── commands/             # onboard, doctor, env, heartbeat-run, run, worktree…
│   └── commands/client/      # REST API client commands (company, issue, agent…)
├── server/src/
│   ├── index.ts              # Server bootstrap (DB, auth, port binding)
│   ├── app.ts                # Express app factory + plugin infrastructure wiring
│   ├── routes/               # One file per REST resource (agents, issues, goals…)
│   ├── services/             # Business logic layer
│   │   ├── heartbeat.ts      # Core agent execution loop
│   │   ├── agents.ts         # Agent CRUD + org chart + revisions
│   │   ├── budgets.ts        # Monthly budget enforcement
│   │   ├── issues.ts         # Ticket/task lifecycle
│   │   ├── goals.ts          # Goal hierarchy
│   │   ├── plugin-*.ts       # Plugin worker/job/lifecycle subsystem
│   │   └── workspace-runtime.ts  # Execution workspace provisioning
│   ├── adapters/             # Adapter registry (references packages/adapters/*)
│   └── middleware/           # auth, logging, board-mutation-guard, hostname-guard
├── packages/
│   ├── db/src/               # Drizzle schema (50+ tables), migrations, client
│   ├── shared/               # Shared types (DeploymentMode, BillingType, etc.)
│   ├── adapter-utils/        # Session compaction, config parsing utilities
│   ├── adapters/
│   │   ├── claude-local/     # Claude Code adapter (cli/server/ui sub-packages)
│   │   ├── codex-local/      # Codex CLI adapter
│   │   ├── gemini-local/     # Gemini CLI adapter
│   │   ├── cursor-local/     # Cursor adapter
│   │   ├── openclaw-gateway/ # OpenClaw (continuous agent) gateway adapter
│   │   ├── opencode-local/   # OpenCode adapter
│   │   └── pi-local/         # Pi adapter
│   └── plugins/
│       ├── sdk/              # @paperclipai/plugin-sdk — stable plugin API
│       ├── create-paperclip-plugin/  # Plugin scaffolding tool
│       └── examples/         # Example plugins
├── ui/src/                   # React SPA
│   ├── pages/                # Route-level page components
│   ├── components/           # Shared UI components
│   ├── api/                  # Typed API client
│   └── hooks/                # React hooks
├── skills/                   # Built-in skill files bundled with server
├── evals/                    # promptfoo evaluation configs
└── tests/                    # E2E (Playwright) + release smoke tests
```

## 🎯 Main Entry Points

- `cli/src/index.ts` — CLI bootstrap; dispatches to sub-commands (`onboard`, `heartbeat-run`, `run`, `doctor`, etc.)
- `server/src/index.ts` — Server startup: initializes embedded Postgres, applies migrations, binds HTTP, optionally serves the React SPA
- `server/src/app.ts` — `createApp()` factory: wires Express routes, plugin infrastructure (worker manager, job scheduler, event bus, tool dispatcher), and Vite dev middleware
- `server/src/services/heartbeat.ts` — `heartbeatService.run()`: the primary agent execution loop; resolves workspace, injects context, invokes adapter, records run
- `packages/db/src/index.ts` — Exports Drizzle schema tables and the DB client factory
- `packages/plugins/sdk/src/index.ts` — Plugin SDK: worker-side context API, host-client protocol, React UI hooks

## 📝 Observations & Patterns

- **Atomic checkout via DB transactions**: The heartbeat service uses Drizzle transactions to atomically claim a run, preventing double-execution across concurrent heartbeat cycles.
- **Agent lifecycle state machine**: Agents move through `pending_approval → idle → running → paused | terminated`. State transitions are strictly guarded (e.g., terminated agents cannot be resumed).
- **Sessioned adapters**: A designated set of adapters (`SESSIONED_LOCAL_ADAPTERS`) maintain persistent session IDs across heartbeat runs, enabling true resumption rather than cold restarts.
- **Secret redaction in audit logs**: Secrets are scrubbed from config snapshots before storage; any snapshot containing a `REDACTED` sentinel blocks rollback to prevent plaintext leakage.
- **Plugin isolation via worker processes**: Each plugin runs in its own Node.js worker thread managed by `plugin-worker-manager`, communicating via JSON-RPC messages. The host exposes a stable service API through `@paperclipai/plugin-sdk`.
- **Board mutation guard middleware**: Write operations require an authenticated "board" actor, enforced globally via `boardMutationGuard()` Express middleware.
- **Private hostname guard**: When `deploymentMode === "authenticated"` and `deploymentExposure === "private"`, inbound requests are validated against an allowlist of configured hostnames.
- **Pluggable storage**: Storage is abstracted behind a `StorageService` interface, enabling local filesystem or S3-compatible backends.
- **Company portability**: Export/import flows (`company-portability.ts`) handle secret scrubbing and slug collision resolution, enabling the planned "Clipmart" marketplace.

## 🛠 How to Run / Test

```bash
# Quickstart (zero-config, embedded Postgres)
npx paperclipai onboard --yes

# Manual dev setup
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev              # API server (port 3100) + Vite UI with hot reload

# Useful dev commands
pnpm test:run         # Unit tests (vitest)
pnpm db:generate      # Generate DB migration from schema changes
pnpm db:migrate       # Apply pending migrations
pnpm typecheck        # Full monorepo type check

# Requirements: Node.js 20+, pnpm 9.15+
```

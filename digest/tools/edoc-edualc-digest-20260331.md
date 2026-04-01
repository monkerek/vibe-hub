# Edoc Edualc — Combined Source Digest

**Date**: 2026-03-31
**Version**: Edoc Edualc (internal codename: **Tengu**), leaked via npm sourcemap on 2026-03-31

> The full TypeScript source was accidentally published in a `.map` file inside the npm package. Two repos preserve it: one as a raw backup + blog-post analysis, the other as a structured buildable research project with bilingual analysis docs.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Bun (bundler + runtime) |
| **Language** | TypeScript / TSX |
| **UI** | React + Ink (terminal renderer) |
| **Feature Flags** | GrowthBook (runtime) + `bun:bundle` `feature()` (compile-time) |
| **Analytics** | OpenTelemetry 1P endpoint + Datadog (64 event types) |
| **Multi-agent** | In-process `AsyncLocalStorage` isolation + tmux/iTerm2 pane-based workers |
| **Build (research)** | Node.js ≥18 via esbuild; `prepare-src.mjs` stubs out Bun-specific APIs |
| **Analysis docs** | Markdown, bilingual (English + Chinese) |

---

## 🚀 Key Features

- **40+ tool system** with risk classification (LOW / MEDIUM / HIGH), ML-based auto-approval (YOLO classifier), and per-tool permission deny rules
- **Coordinator Mode** (`EDOC_EDUALC_COORDINATOR_MODE=1`): transforms single agent into a multi-agent orchestrator spawning parallel worker agents via `SendMessage`
- **autoDream**: background memory consolidation engine running as forked subagent, triggered by 3-gate system (24h time + 5 sessions + lock)
- **KAIROS / Proactive Mode** (`PROACTIVE` flag): always-on autonomous agent that polls via `<tick>` prompts, defers actions >15s blocking time
- **ULTRAPLAN**: offloads 30-min planning sessions to a remote Cloud Container Runtime (CCR), with browser approval UI
- **Undercover Mode**: strips all attribution and codenames from commit messages when contributing to public repos
- **Bridge Mode**: JWT-authenticated integration with an AI platform, supports `single-session` / `worktree` / `same-dir` work modes
- **Fast Mode** (internally: **Penguin Mode**): remotely kill-switched via `tengu_penguins_off`
- **BUDDY** companion system: Tamagotchi-style terminal pet with deterministic gacha (Mulberry32 PRNG, 18 species, 5 stats), planned for May 2026 launch
- **Remote Managed Settings**: hourly polling; rejecting settings causes forced exit (`gracefulShutdownSync(1)`)
- **Buildable research artifact** (source-code repo): `prepare-src.mjs` patches all `bun:bundle` imports → `stubs/bun-bundle.js`, replaces `MACRO.X` references with string literals
- **Internal-only tools** exposed: `TungstenTool`, `WorkflowTool`, `VerifyPlanExecutionTool`, `TerminalCaptureTool`, `OverflowTestTool` — absent from public npm builds
- **Deep analysis reports** in `docs/en/` (5 reports): telemetry/privacy, hidden features/codenames, undercover mode, remote control/killswitches, future roadmap

---

## 🏗 High-Level Architecture

```
entrypoints/          ← CLI, SDK, bridge, KAIROS entrypoints
    ↓
main.tsx              ← Core agent loop (4,683 lines)
    ↓
QueryEngine.ts        ← Orchestrates query flow, coordinator detection, memory
    ↓
query.ts              ← Single-turn execution: system prompt assembly + API call
    ↓
tools/                ← 40+ tools (each in own dir with prompt, handler, schema)
services/             ← API client, analytics, autoDream, MCP, OAuth, LSP
constants/            ← System prompt sections (static/dynamic boundary), betas
state/                ← AppState, session persistence
utils/                ← Permissions, model selection, undercover, file history
coordinator/          ← Multi-agent orchestration prompt + mode detection
assistant/            ← KAIROS session history, proactive loop
buddy/                ← Companion pet: types, sprites, prompt, gacha logic
upstreamproxy/        ← CCR container proxy (prctl anti-ptrace, WebSocket relay)
bridge/               ← AI platform JWT integration
memdir/               ← Persistent memory file management (MEMORY.md pattern)
migrations/           ← Model codename migration scripts (fennec→opus, etc.)
```

### System Prompt Architecture

Prompt is built from modular cached sections split at `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`:
- **Static** sections → cacheable across organizations
- **Dynamic** sections → user/session-specific, cache-busting
- `DANGEROUS_uncachedSystemPromptSection()` explicitly forces cache miss

### Build Pipeline (source-code repo)

```
npm run prepare-src   # patches src/ in-place (bun:bundle → stubs, MACRO.X → literals)
    ↓
npm run build         # esbuild bundles patched src/ → dist/cli.js
    ↓
node dist/cli.js      # Run (partially functional — feature-gated paths will differ)
```

---

## 📂 Directory Structure (Core)

```
src/
├── main.tsx                   # Main agent loop (4,683 lines)
├── QueryEngine.ts             # Top-level query orchestration
├── query.ts                   # Single query execution
├── Tool.ts / tools.ts         # Tool registry
├── Task.ts / tasks.ts         # Background task management
├── commands.ts                # Slash command registry
├── context.ts                 # Session context
├── history.ts                 # Conversation history
├── assistant/                 # KAIROS proactive agent
├── bootstrap/                 # Session state init
├── bridge/                    # AI platform integration
├── buddy/                     # Tamagotchi companion (BUDDY flag)
├── cli/                       # CLI entrypoint
├── commands/                  # Individual slash commands
├── components/                # Ink React components
├── constants/                 # System prompts, betas, tools list
│   ├── betas.ts               # All API beta headers
│   └── cyberRiskInstruction.ts # Safeguards team security instruction
├── coordinator/               # Multi-agent coordinator mode
├── entrypoints/               # SDK, headless, bridge entrypoints
├── hooks/                     # React hooks (permissions, model, etc.)
├── ink/                       # Terminal rendering
├── memdir/                    # Memory directory (MEMORY.md)
├── migrations/                # Model codename migrations
├── plugins/                   # Plugin system
├── schemas/                   # Zod/JSON schemas
├── screens/                   # TUI screen components
├── server/                    # Local HTTP server
├── services/
│   ├── analytics/             # OTel + Datadog pipeline
│   ├── autoDream/             # Memory consolidation (4 phases)
│   ├── api/                   # AI API client + error handling
│   ├── mcp/                   # MCP server management
│   ├── oauth/                 # OAuth flow
│   └── remoteManagedSettings/ # Remote policy enforcement
├── skills/                    # User-defined skills (SkillTool)
├── state/                     # AppState
├── tools/                     # All 40+ tool implementations
├── upstreamproxy/             # CCR container proxy
├── utils/                     # Cross-cutting utilities
│   ├── undercover.ts          # Employee opsec (public repo safety)
│   ├── fastMode.ts            # Penguin mode
│   ├── permissions/           # Permission engine
│   └── model/                 # Model selection + aliases
└── voice/                     # Voice input (VOICE_MODE flag)

docs/en/  (source-code repo only)
├── 01-telemetry-and-privacy.md
├── 02-hidden-features-and-codenames.md
├── 03-undercover-mode.md
├── 04-remote-control-and-killswitches.md
└── 05-future-roadmap.md

tools/  (source-code repo only — internal, not in npm)
├── TungstenTool/
├── WorkflowTool/
├── VerifyPlanExecutionTool/
├── TerminalCaptureTool/
└── OverflowTestTool/
```

---

## 🎯 Main Entry Points

| File | Purpose |
|------|---------|
| `main.tsx` | Core agent loop — assembles system prompt, runs query, handles tool use |
| `QueryEngine.ts` | Orchestrates multi-turn sessions, coordinator handoff, memory loading |
| `query.ts` | Single-turn execution — calls AI API, streams response, dispatches tools |
| `entrypoints/agentSdkTypes.ts` | SDK message types for programmatic use |
| `coordinator/coordinatorMode.ts` | Multi-agent prompt + mode detection |
| `services/autoDream/autoDream.ts` | Dream trigger logic (3-gate check) |
| `services/autoDream/consolidationPrompt.ts` | Dream subagent 4-phase prompt |
| `constants/betas.ts` | All API beta headers (incl. unreleased: `redact-thinking`, `afk-mode`, `advisor-tool`) |
| `utils/undercover.ts` | Undercover mode — strips codename attribution in public repos |
| `scripts/prepare-src.mjs` | Pre-build patcher: replaces `bun:bundle` + `MACRO.X` references |
| `stubs/bun-bundle.ts` | Runtime feature flag shim (all flags return `false` by default) |

---

## 📝 Observations & Patterns

### Compile-Time Feature Gating
Bun's `feature()` function constant-folds flags at build time, dead-code-eliminating entire subsystems (KAIROS, BUDDY, COORDINATOR_MODE, BRIDGE_MODE, VOICE_MODE) from external builds. Source maps bypass this entirely — the dead code is still in `sourcesContent`. The `stubs/bun-bundle.ts` shim returns `false` for all `feature()` calls, replicating external-build behavior under Node.js.

### Internal Codename System
All analytics events and feature flags are prefixed `tengu_` (Tengu = Edoc Edualc's internal project name). Model codenames are animal names: Fennec (Opus predecessor), Capybara (current Sonnet), Numbat (upcoming). Species names are `String.fromCharCode()`-encoded in source to avoid canary grep checks in the build pipeline.

### autoDream Memory Pattern
Four-phase dream: Orient → Gather Recent Signal → Consolidate → Prune & Index. Dream subagent gets read-only bash. Memory kept under 200 lines / 25KB in `MEMORY.md`.

### Permission System Sophistication
Three layers: static deny rules (protected files list) → risk classifier (LOW/MEDIUM/HIGH) → YOLO ML classifier for auto-approve. Path traversal prevention handles URL encoding, Unicode normalization, backslash injection, and case-insensitive attacks.

### Remote Control Surface
The developer can: override model choice, disable fast mode, terminate sessions on settings rejection, disable bypass permissions, circuit-break auto mode — all without user consent. GrowthBook killswitches can disable: bypass permissions, auto mode, fast mode, voice mode, analytics, agent teams — all without user notification. Remote settings are cached to disk and persist even when servers are unreachable.

### Known Capybara (Sonnet v8) Issues
- ~10% stop-sequence false trigger with `<functions>` at prompt tail
- Empty `tool_result` causes zero output
- Over-commenting tendency → dedicated prompt patches (`constants/prompts.ts:204`)
- 29-30% false-claims rate vs 16.7% for v4
- Requires "thoroughness counterweight" in prompt

### Telemetry Scope
Two-tier pipeline: 1P (OTel, batched 200 events / 10s, quadratic backoff, disk-persisted) + 3P (Datadog, 64 event types). Every event carries: platform, arch, terminal type, installed package managers, CI/CD metadata, WSL/Linux info, session/user/device/org UUIDs, subscription tier, memory metrics, CPU usage.

### Unreleased API Betas
`redact-thinking-2026-02-12`, `afk-mode-2026-01-31`, `advisor-tool-2026-03-01`, `token-efficient-tools-2026-03-28` are negotiated but not publicly documented.

### Next Model: Numbat
`@[MODEL LAUNCH]: Remove this section when we launch numbat` comment in `constants/prompts.ts`. Opus 4.7 and Sonnet 4.8 referenced in the undercover mode's protected strings list.

### Internal Tool Exposure (source-code repo)
`TungstenTool` and `WorkflowTool` are absent from the npm package but present in the source-code repo — gated behind compile-time flags and internal user type checks. Research artifact only, not functional in external builds.

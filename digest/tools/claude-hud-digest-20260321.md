# Claude HUD Digest

- **URL**: https://github.com/jarrodwatts/claude-hud
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack

- **Primary Language**: TypeScript 5 (ES2022, NodeNext modules)
- **Runtime**: Node.js 18+ or Bun
- **Build Tool**: `tsc` (TypeScript compiler, no bundler)
- **Test Runner**: Node.js built-in `node --test` with `c8` for coverage
- **Zero runtime dependencies** — only `devDependencies`: `typescript`, `@types/node`, `c8`

## 🚀 Key Features

- **Native statusline integration**: Plugs into Claude Code's `statusLine` API — invoked as a subprocess every ~300ms, no tmux or separate window needed
- **Accurate context window tracking**: Reads native token data from Claude Code's stdin JSON (not estimated); supports `used_percentage`/`remaining_percentage` fields from Claude Code v2.1.6+
- **Transcript JSONL parsing**: Streams the session's `.jsonl` transcript file to extract live tool activity, running/completed agents, and todo progress via `TodoWrite`/`Task`/`TaskCreate`/`TaskUpdate` blocks
- **OAuth usage API integration**: Fetches 5-hour and 7-day rate limit utilization from `api.anthropic.com/api/oauth/usage` using credentials from `~/.claude/.credentials.json`; falls back gracefully for API users and Bedrock
- **File-based cache**: Persists usage API responses to disk between renders (each render is a fresh process), with configurable TTL and exponential 429 backoff
- **Dual layout modes**: `expanded` (multi-line, element-order configurable) and `compact` (single line)
- **Rich git status**: Async git subprocess calls for branch, dirty state, ahead/behind, and Starship-compatible file change counts (`!M +A ✘D ?U`)
- **Terminal-width-aware rendering**: Detects width via `stdout.columns`, `stderr.columns` (for piped stdout), or `COLUMNS` env var; wraps at `│`/`|` separators and truncates with `...`; handles wide Unicode/emoji via grapheme segmentation
- **Fully typed config with migration**: Deep-merge of user `config.json` with validated defaults; migrates legacy `layout` field from prior versions

## 🏗 High-Level Architecture

Claude HUD is a single-binary Claude Code plugin that operates as a stateless subprocess on each statusline tick. The architecture follows a linear pipeline:

```
Claude Code
  → stdin JSON (model, context_window, transcript_path, cwd)
  → src/index.ts          (orchestrator: reads stdin, dispatches all async data fetches in parallel-ish)
  → src/transcript.ts     (streams JSONL for tools/agents/todos)
  → src/usage-api.ts      (OAuth API call with disk-based caching + keychain fallback)
  → src/git.ts            (execFile git subprocess)
  → src/config-reader.ts  (counts CLAUDE.md, rules, MCPs, hooks from ~/.claude/settings.json)
  → src/render/index.ts   (layout engine: expanded or compact; wraps/truncates to terminal width)
  → stdout (one line per console.log)
  → Claude Code displays in statusline
```

The `RenderContext` struct is the central data-transfer object assembled in `src/index.ts` and passed to every renderer. All data fetches are separate async functions with no shared state — designed around the "fresh process each tick" constraint.

Rendering is element-driven: `elementOrder` (configurable array) determines which lines appear and in what order. Adjacent `context`+`usage` pairs are auto-combined onto one line with a `│` separator. Activity lines (tools/agents/todos) are opt-in via boolean flags and only rendered when there is content to show.

## 📂 Directory Structure (Core)

```
claude-hud/
├── src/
│   ├── index.ts              # Entry point + orchestrator (main() with injectable deps)
│   ├── types.ts              # Core interfaces: StdinData, ToolEntry, AgentEntry, TodoItem, UsageData, RenderContext
│   ├── stdin.ts              # Read + parse Claude Code's JSON from stdin
│   ├── transcript.ts         # Stream-parse session JSONL for tools/agents/todos
│   ├── usage-api.ts          # Anthropic OAuth usage API with disk cache + keychain support
│   ├── git.ts                # Async git status (branch, dirty, ahead/behind, file stats)
│   ├── config.ts             # HudConfig type, defaults, validation, migration, loadConfig()
│   ├── config-reader.ts      # Count CLAUDE.md files, rules, MCPs, hooks
│   ├── claude-config-dir.ts  # Resolve ~/.claude plugin directory
│   ├── extra-cmd.ts          # Optional extra shell command output in statusline
│   ├── speed-tracker.ts      # Output token speed tracking (opt-in)
│   ├── debug.ts              # Conditional debug logger (CLAUDE_HUD_DEBUG)
│   ├── constants.ts          # Shared constants
│   └── render/
│       ├── index.ts          # Layout engine: renderExpanded/renderCompact, terminal width wrap/truncate
│       ├── session-line.ts   # Compact mode: single summary line
│       ├── tools-line.ts     # Tool activity line (◐ running | ✓ completed ×N)
│       ├── agents-line.ts    # Agent status line (◐ type [model]: description Xm Ys)
│       ├── todos-line.ts     # Todo progress line (▸ current task (done/total))
│       ├── colors.ts         # ANSI color helpers with named/256/hex color support
│       └── lines/
│           ├── project.ts    # Line 1: [Model | Plan] │ path git:(branch*)
│           ├── identity.ts   # Context bar (█████░░░░░ 45%)
│           ├── usage.ts      # Usage bar (██░░░░░░░░ 25% (1h 30m / 5h))
│           └── environment.ts # Config counts (CLAUDE.md | rules | MCPs | hooks)
├── commands/
│   ├── setup.md              # /claude-hud:setup slash command (writes statusLine to settings.json)
│   └── configure.md          # /claude-hud:configure slash command (guided config flow)
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest (name, version, description, author)
├── tests/                    # Node built-in test runner tests
├── tsconfig.json             # ES2022 target, NodeNext module resolution, strict mode
└── package.json              # No runtime deps; devDeps: typescript, @types/node, c8
```

## 🎯 Main Entry Points

- `src/index.ts`: The plugin binary entry point. Exports `main()` with a fully injectable `MainDeps` interface for testing. Assembles `RenderContext` from all async data sources, calls `render()`, then exits.
- `commands/setup.md`: Slash command that writes the `statusLine` key to `~/.claude/settings.json` with a runtime path-resolution snippet so updates are auto-picked-up.
- `commands/configure.md`: Guided interactive config flow (preset → toggle individual elements → preview → save).
- `dist/index.js`: Compiled binary — what Claude Code actually executes per tick.

## 📝 Observations & Patterns

- **Dependency injection for testability**: `main()` accepts a `Partial<MainDeps>` override map, making every I/O boundary mockable in unit tests without process-level patching.
- **Fresh process per render**: The HUD has no in-memory state between invocations. The file-based usage cache (`~/.claude/plugins/claude-hud/usage-cache.json`) is the only cross-render persistence mechanism.
- **Keychain fallback chain**: On macOS, credentials are read from the Keychain first (via `security find-generic-password`), with a per-process backoff flag to avoid repeated prompts on failure; on Linux, only the credentials file is used.
- **ANSI-aware string operations**: `render/index.ts` implements a custom grapheme-width calculator (Intl.Segmenter + Unicode wide-character ranges) and ANSI-token-aware slice/truncate to handle emoji and CJK characters correctly.
- **Proxy support**: The usage API client reads `HTTPS_PROXY`/`HTTP_PROXY`/`ALL_PROXY`/`NO_PROXY` and builds a raw `tls.connect` tunnel — no third-party HTTP library needed.
- **Config migration baked in**: `migrateConfig()` handles the legacy `layout` string/object shape from v0.0.x, ensuring forward compatibility without a separate migration script.
- **No external runtime dependencies**: The entire plugin ships as compiled TypeScript with zero npm runtime packages, keeping install size minimal and startup latency low.

## 🛠 How to Run / Test

```bash
git clone https://github.com/jarrodwatts/claude-hud
cd claude-hud
npm ci && npm run build

# Test with a simulated Claude Code stdin payload
echo '{"model":{"display_name":"Opus"},"context_window":{"current_usage":{"input_tokens":45000},"context_window_size":200000}}' | node dist/index.js

# Run test suite
npm test

# Run with coverage
npm run test:coverage
```

**Install as a Claude Code plugin:**
```
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/claude-hud:setup
```
Restart Claude Code after setup to load the `statusLine` config.

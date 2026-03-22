# Claude Menu — Agent Handoff

**Branch:** `claude/review-project-digests-TEzNZ`
**HEAD:** `13abe69`
**State:** clean working tree, all tests green (379 tests, 0 failures)
**Last updated:** 2026-03-22

---

## What this project is

`playground/claude-menu/` is a zero-dependency Node.js statusline plugin for
Claude Code. When Claude Code is running, it pipes a JSON context blob to
`dist/index.js` via stdin and renders a Nerd-Font powerline bar to stdout.
The bar is written to `~/.claude/settings.json` as a `statusLine` command.

**Key files:**

| Path | Purpose |
|---|---|
| `src/index.ts` | Entry point; `main()` with full dependency injection via `MainDeps` |
| `src/types.ts` | All shared interfaces (`RenderContext`, `MainDeps`, `ClaudeMenuConfig`, …) |
| `src/config.ts` | TOML parser (zero-dep, custom), `loadConfig()`, `DEFAULT_CONFIG` |
| `src/data/stdin.ts` | `readStdin()` — TTY-aware, 2 s fallback for piped input |
| `src/data/git.ts` | `getGitStatus()` — uses `git status -ushort` |
| `src/data/usage.ts` | `getUsage()` — reads `~/.claude/cache/usage.json` with type guard |
| `src/data/environment.ts` | `getEnvironment()` — counts CLAUDE.md files, MCPs, hooks |
| `src/data/transcript.ts` | `parseTranscript()` — reads Claude's JSONL transcript |
| `src/render/index.ts` | `render()` — powerline layout, truncation, expanded/compact mode |
| `src/render/segments.ts` | Per-segment renderers keyed by `SegmentName` |
| `src/render/colors.ts` | Color helpers, `GRAPHEME_SEGMENTER`, `isWide()` |
| `src/motto/resolver.ts` | `resolveMotto()` — day-of-week, random, sequential, time-of-day, manual |
| `src/motto/packs.ts` | Built-in motto packs (motivational-en, chill-zh, dev-humor, zen, startup-energy) |
| `commands/setup.md` | `/claude-menu:setup` skill — installs statusLine + config |
| `commands/configure.md` | `/claude-menu:configure` skill — interactive config wizard |

**Build & test:**
```bash
cd playground/claude-menu
npm run build   # tsc → dist/
npm test        # node --test tests/**
```

---

## What has been done in this branch

This branch went through two rounds of structured code review. All identified
issues have been resolved. Summary of changes from the review baseline (`0854954`):

### Round 1 fixes (commit `d861a88`)
- **README.md** — Corrected day-of-week numbering: was `Mon=0…Sun=6`, now `Sun=0, Mon=1…Sat=6`; clarified that users configure day-name keys (`monday`, …), not numeric indices.
- **src/config.ts** `loadConfig()` error path — replaced `{ ...DEFAULT_CONFIG }` (shallow spread) with `structuredClone(DEFAULT_CONFIG)` to prevent callers from mutating the shared default's nested objects.
- **commands/setup.md** — Aligned the generated `segments` list with `DEFAULT_CONFIG` by adding `"tools"`, `"agents"`, `"todos"` so the first-run experience is consistent regardless of whether the user ran setup or got defaults.
- **src/render/index.ts** `renderPowerlineSegment` — Added `!isLast` guard to the non-rounded else branch to prevent a trailing separator (e.g. `│`) from appearing after the last segment.
- **src/render/index.ts** `truncateAnsi` — Added doc comment that only SGR ANSI sequences are matched; non-SGR codes in custom mottos are unsupported.
- **tests/toml-parser.test.js** *(new)* — 14 direct unit tests for `unescapeTomlString`, `extractTomlValue`, and `parseTomlValue`: double-backslash regression, `\uXXXX`, `\n`/`\t`, nested `[section.sub]`, empty arrays, quoted-comma arrays.

### Round 2 fixes (commit `13abe69`)
- **commands/setup.md** — Clarified that U+E0B0 is visually indistinguishable from an empty string without Nerd Font support; added `printf '\uE0B0'` hint.
- **commands/configure.md** — Added explicit Unicode codepoints (`U+E0B0`, `U+E0B1`) to separator option labels 3/4 and the mapping section so the wizard is unambiguous in plain-text viewers.
- **src/data/stdin.ts** — Added `process.stdin.isTTY` fast-path (resolves `{}` immediately when not piped); increased fallback timeout from 500 ms → 2000 ms to prevent slow pipes from dropping valid JSON before `end` fires.
- **.vibe/VIBE.md** — Added `code-review` and `media-digest` to the Skill References index (both existed on disk but were missing from the listing).

---

## Current state assessment

The second code review (`d861a88..13abe69`) closed with **"Ready to merge"**
and no outstanding issues. The branch is merge-ready.

If a follow-up reviewer finds anything, the areas most worth checking are:

1. **`src/data/stdin.ts`** — `data` and `end` listeners are not removed after
   resolution. Harmless for the piped statusline use-case, but technically a
   listener leak. Not a bug for the intended runtime; noted as Low by the reviewer.

2. **`src/data/environment.ts`** — Counts `CLAUDE.md` files by reading their
   contents rather than using `fs.access`/`stat`. Correct but slightly wasteful.
   Also noted as Low.

3. **`src/render/index.ts` `truncateAnsi`** — Only matches SGR (`m`-terminated)
   ANSI sequences. Non-SGR codes (cursor movement, etc.) in custom motto strings
   would be miscounted. Documented and accepted; out-of-scope for the current work.

---

## How to resume

```bash
git fetch origin claude/review-project-digests-TEzNZ
git checkout claude/review-project-digests-TEzNZ

cd playground/claude-menu
npm run build
npm test
```

To run a live smoke-test (requires the plugin installed via `/claude-menu:setup`):
```bash
echo '{"model":{"display_name":"claude-sonnet-4-6"},"context_window":{"used_percentage":42,"context_window_size":200000},"cwd":"/home/user/vibe-hub"}' \
  | node dist/index.js
```

To push after making changes:
```bash
git push -u origin claude/review-project-digests-TEzNZ
```

---

## Repo layout (relevant parts)

```
vibe-hub/
├── .vibe/
│   ├── VIBE.md                  # Master context file (symlinked to .claude/CLAUDE.md etc.)
│   └── skills/                  # All agent skills
│       ├── code-review/
│       ├── doc-research/
│       ├── gaslighting/
│       ├── media-digest/
│       ├── repo-research/
│       └── skill-author/
└── playground/
    └── claude-menu/
        ├── src/                 # TypeScript source
        ├── dist/                # Compiled output (committed)
        ├── tests/               # node:test test suite (379 tests)
        ├── commands/            # Skill markdown files
        │   ├── setup.md
        │   └── configure.md
        ├── README.md
        └── package.json
```

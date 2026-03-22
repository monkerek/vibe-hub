# Claude Menu

A Starship-inspired statusline plugin for Claude Code. Renders a powerline-style status bar with dynamic mottos, git status, context window usage, API quota, tool/agent tracking, and configurable themes — all with zero production dependencies.

```
 🚀 Ship it!  📁 …/my-project  🔀 main* !2 ?1  🤖 claude-sonnet-4-6  ░░░████ 34%  🕐 14:32
 🔧 ◐ Bash, Read │ ✓ ×12   ✅ ▸ Write tests (2/5)
```

---

## Requirements

- **Node.js** 20 or later
- **Claude Code** (CLI) with statusline support
- A terminal with **Nerd Font** or **Powerline font** for separator glyphs (optional but recommended)

---

## Installation

### 1. Clone or copy the project

```bash
git clone https://github.com/vibe-hub/claude-menu
cd claude-menu
```

### 2. Install dev dependencies and build

```bash
npm install
npm run build
```

This compiles TypeScript into `dist/`. The only runtime requirement is Node.js — there are no production npm dependencies.

### 3. Register as the Claude Code statusline

Edit `~/.claude/settings.json` and add or update the `statusLine` field with the **absolute path** to `dist/index.js`:

```json
{
  "statusLine": "node /absolute/path/to/claude-menu/dist/index.js"
}
```

To get the absolute path automatically:

```bash
echo "node $(pwd)/dist/index.js"
```

### 4. Install the config

Create the config directory and copy the example config in one step:

```bash
mkdir -p ~/.claude/plugins/claude-menu && cp config.example.toml ~/.claude/plugins/claude-menu/config.toml
```

### 5. Restart Claude Code

The statusline is rendered each time Claude Code refreshes the UI. Restart the CLI (or reload the window if using the IDE extension) to see your new statusline.

---

## Using the built-in setup command

If you have the plugin registered, you can run the interactive setup from inside Claude Code:

```
/claude-menu:setup
```

This command will automatically find the correct path, write `~/.claude/settings.json`, and create a starter config file.

To customise interactively after setup:

```
/claude-menu:configure
```

---

## Configuration

All config lives in `~/.claude/plugins/claude-menu/config.toml`. Every field is optional — sensible defaults are used for anything omitted.

### Theme

```toml
[theme]
name = "pastel-rainbow"   # See built-in themes below
separator = ""            # Powerline glyph. Try "" (thin), "│", or ""
```

**Built-in themes:**

| Name | Description |
|---|---|
| `pastel-rainbow` | Soft pastel gradient (green → yellow → orange → pink → purple). Best for dark terminals. |
| `claude-orange` | Anthropic warm orange palette. Bold and branded. |
| `nord-frost` | Nord frost variant. Cool, calm, minimal. |
| `dracula` | Vibrant purples, pinks, and greens. |
| `catppuccin` | Catppuccin Mocha — warm pastels on dark background. |
| `monochrome` | Clean grayscale. Distraction-free. |

#### Per-segment color overrides

Any segment's `fg`, `bg`, or `icon` can be overridden independently without changing the rest of the theme:

```toml
[theme]
name = "dracula"   # base theme

[theme.segments.motto]
fg = "#1e1e2e"
bg = "#a6e3a1"
icon = "🐱"

[theme.segments.model]
fg = "#ffffff"
bg = "#ea580c"
icon = "🧠"
```

#### Building a fully custom theme

Set `name` to any string that is **not** a built-in theme name. All segments will start from a neutral fallback (`fg = "#ffffff"`, `bg = "#555555"`), and you define each segment's colors yourself:

```toml
[theme]
name = "my-theme"
separator = "│"
rounded = false

[theme.segments.motto]
fg = "#0d1117"
bg = "#58a6ff"
icon = "⚡"

[theme.segments.model]
fg = "#0d1117"
bg = "#3fb950"
icon = "🧠"

[theme.segments.project]
fg = "#0d1117"
bg = "#d2a8ff"
icon = "📂"

[theme.segments.git]
fg = "#0d1117"
bg = "#ffa657"
icon = "⎇"

[theme.segments.context]
fg = "#0d1117"
bg = "#79c0ff"
icon = "◼"

[theme.segments.time]
fg = "#0d1117"
bg = "#56d364"
icon = "⏱"
```

You only need to define the segments you actually use (see the `[layout] segments` list). Segments omitted from `[theme.segments.*]` will use the neutral fallback colors.

**Color format:** hex `#rrggbb` only. Both `fg` (text) and `bg` (background) are required per segment for a fully custom theme.

---

### Layout

```toml
[layout]
mode = "expanded"    # "expanded" (2 lines) or "compact" (1 line)
segments = ["motto", "project", "git", "model", "context", "time"]
```

**Available segments** (order in the list controls display order):

| Segment | Example output | Description |
|---|---|---|
| `motto` | `🚀 Ship it!` | Dynamic motto / status message |
| `model` | `🤖 claude-sonnet-4-6` | Current Claude model name |
| `project` | `📁 …/my-project` | Working directory (last 2 path components) |
| `git` | `🔀 main* !2 +1 ?3` | Branch, dirty indicator, ahead/behind, file stats |
| `context` | `░░████ 34%` | Context window usage bar |
| `usage` | `██░░░░ 20% (3h 15m)` | API rate-limit quota bar with reset countdown |
| `tools` | `🔧 ◐ Bash, Read │ ✓ ×5` | Running and completed tool calls |
| `agents` | `🤝 ◐ researcher: Explore code │ ✓ 2 done` | Running and completed sub-agents |
| `todos` | `✅ ▸ Write tests (2/5)` | Todo progress with active task |
| `environment` | `⚙️` | CLAUDE.md count, rules, MCPs, hooks (stub) |
| `time` | `🕐 14:32` | Current local time (HH:MM) |

**Expanded mode** splits segments into two lines:
- **Line 1 (primary):** `motto`, `project`, `git`, `model`, `context`, `time`
- **Line 2 (activity):** `tools`, `agents`, `todos`, `usage`, `environment`

Line 2 only appears when at least one activity segment has data to show.

**Compact mode** renders everything on a single line, truncated to your terminal width.

---

### Motto

```toml
[motto]
enabled = true
strategy = "day-of-week"   # See strategies below
pack = "motivational-en"   # Built-in motto pack
emoji = true
```

**Strategies:**

| Strategy | Behaviour |
|---|---|
| `day-of-week` | Cycles through the motto list by weekday (Mon=0, …, Sun=6), or uses an explicit day mapping |
| `random` | Picks a random motto each render |
| `sequential` | Advances by day-of-year — deterministic but ever-changing |
| `time-of-day` | Selects based on morning / afternoon / evening / night |
| `manual` | Always shows `current` |

**Built-in packs:**

| Pack | Language / vibe |
|---|---|
| `motivational-en` | Startup / shipping energy ("Ship it!", "Build something great") |
| `chill-zh` | Chinese relax vibes ("慢慢来 比较快", "摸鱼是一种艺术") |
| `dev-humor` | Dev inside jokes ("It works on my machine™") |
| `zen` | Mindfulness ("Breathe. Code. Repeat.") |
| `startup-energy` | YC vibes ("0 to 1", "Revenue is a feature") |

#### Custom mottos

Custom mottos take priority over the pack. Any strategy can use them:

```toml
[motto]
strategy = "random"
custom = [
  "🚀 Let's build!",
  "🐱 在家躺平 补觉充电",
  "☕ Coffee first, code second",
]
```

#### Manual motto

```toml
[motto]
strategy = "manual"
current = "🔥 Shipping today"
```

#### Day-of-week mapping

```toml
[motto.dayOfWeek]
monday    = "🔥 New week, new features"
tuesday   = "🏗️ Building momentum"
wednesday = "🐫 Hump day hustle"
thursday  = "⚡ Almost there"
friday    = "🎉 Ship it Friday!"
saturday  = "🌿 Weekend hacking"
sunday    = "🧘 Rest and recharge"
```

#### Time-of-day mapping

```toml
[motto.timeOfDay]
morning   = "☀️ Good morning! Fresh start."
afternoon = "☕ Afternoon focus mode"
evening   = "🌙 Evening deep work"
night     = "🦉 Night owl coding"
```

---

## API Usage Tracking

The `usage` segment shows your Anthropic API rate-limit consumption. It reads credentials from `~/.claude/.credentials.json` (written automatically by Claude Code) and calls the Anthropic usage API with a 3-second timeout.

Results are cached for 1 minute at `~/.claude/plugins/claude-menu/usage-cache.json` to avoid excessive API calls. If credentials are missing or the request fails, the segment is silently omitted.

---

## Development

### Project structure

```
claude-menu/
├── src/
│   ├── index.ts              # Entry point + dependency injection
│   ├── config.ts             # Config loader, TOML parser, theme system
│   ├── types.ts              # All TypeScript types
│   ├── data/
│   │   ├── stdin.ts          # Claude Code stdin payload reader
│   │   ├── git.ts            # Git status (branch, dirty, ahead/behind)
│   │   ├── usage.ts          # Anthropic API usage fetcher + cache
│   │   ├── transcript.ts     # Session transcript parser (tools/agents/todos)
│   │   └── environment.ts    # CLAUDE.md / settings introspection
│   ├── motto/
│   │   ├── packs.ts          # Built-in motto packs
│   │   └── resolver.ts       # Strategy-based motto selection
│   └── render/
│       ├── colors.ts         # Hex→RGB ANSI helpers, progress bar, wide-char support
│       ├── segments.ts       # Individual segment renderers
│       └── index.ts          # Powerline compositor, expanded/compact modes
├── tests/                    # Node test runner test suites (265 tests)
├── commands/                 # Claude Code slash command definitions
├── .claude-plugin/           # Plugin metadata
└── config.example.toml       # Annotated example configuration
```

### Build

```bash
npm run build      # Compile TypeScript → dist/
npm run dev        # Watch mode
```

### Test

```bash
npm test           # Run all 265 tests
npm run test:coverage   # Run with c8 coverage report
```

Tests use Node's built-in `node:test` runner — no Jest or Mocha required.

### Manually preview the statusline

```bash
echo '{"model":{"display_name":"claude-sonnet-4-6"},"context_window":{"used_percentage":34,"context_window_size":200000},"cwd":"/home/user/my-project"}' \
  | node dist/index.js
```

---

## How it works

Claude Code pipes a JSON payload to the statusline command on stdin each time the statusline is refreshed. `readStdin` parses this with a 500 ms timeout so it never blocks.

Simultaneously, three parallel async operations run:

1. **`getGitStatus`** — runs `git rev-parse`, `git status --porcelain`, and `git rev-list` with a 3 s timeout.
2. **`getUsage`** — fetches the Anthropic usage API (cached for 1 minute).
3. **`parseTranscript`** — reads the session JSONL transcript to extract tool calls, agent launches, and todo updates.

All results are merged into a `RenderContext` and passed to the rendering engine, which builds powerline segments and emits ANSI-colored output to stdout.

The entire pipeline fails silently — any uncaught error is swallowed so a crash never interrupts your Claude Code session.

---

## Troubleshooting

**Statusline shows nothing**
- Confirm `dist/index.js` exists. If not, run `npm run build`.
- Confirm `~/.claude/settings.json` contains the correct absolute path.
- Run the manual preview command above to check for errors.

**Separator glyphs look like boxes**
- Install a Nerd Font (e.g. [JetBrains Mono Nerd Font](https://www.nerdfonts.com/)) and set it as your terminal font.
- Or switch to a plain separator: `separator = "|"` or `separator = ""`.

**No git info showing**
- Ensure you are inside a git repository when running Claude Code.
- The `git` segment is silently omitted when `git rev-parse` returns nothing.

**Usage segment not appearing**
- Check that `~/.claude/.credentials.json` exists and contains a valid token.
- The segment is silently omitted when credentials are missing or the API returns an error.

**CJK / emoji characters misaligned**
- The renderer uses `Intl.Segmenter` and unicode-range detection to count wide characters as 2 columns. If alignment is off, try a different terminal emulator or font.

---

## License

MIT

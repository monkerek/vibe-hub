# /claude-menu:configure

Interactive configuration wizard for Claude Menu.

## Instructions

Guide the user through configuring their Claude Menu statusline step by step. Use bash tools to read and write files.

### Prerequisite: Locate the dist/index.js path

Read `~/.claude/settings.json` and extract the path from the `statusLine` field:

```bash
cat "$HOME/.claude/settings.json"
```

The `statusLine` value looks like `node /path/to/claude-menu/dist/index.js`. Extract the file path (everything after `node `). Store it as DIST_INDEX for use in the preview step. If `settings.json` is missing or has no `statusLine`, tell the user to run `/claude-menu:setup` first and stop.

---

### Step 1: Theme Selection

Show the user the available built-in themes and ask them to pick one, or offer to build a custom theme:

**Built-in themes:**
| Name | Description |
|---|---|
| `pastel-rainbow` | Soft pastel gradient (green → yellow → orange → pink → purple). Best for dark terminals. |
| `claude-orange` | Anthropic warm orange palette. Bold and branded. |
| `nord-frost` | Nord frost variant. Cool, calm, minimal. |
| `dracula` | Vibrant purples, pinks, and greens. |
| `catppuccin` | Catppuccin Mocha — warm pastels on dark background. |
| `monochrome` | Clean grayscale. Distraction-free. |

Also ask:
- **Separator glyph**: `""` (powerline arrow, requires Nerd Font), `""` (thin), `"│"` (pipe), or `""` (none)
- **Rounded caps**: `true` (requires Nerd Font) or `false`

If the user wants a **custom theme**, skip `name` and collect `fg`/`bg`/`icon` for each segment they plan to use (see segment list in Step 3). Use any non-builtin string as the name (e.g. `"my-theme"`).

---

### Step 2: Layout Mode

Ask the user to choose:
- `expanded` — Two lines: primary segments on line 1, activity segments (tools/agents/todos) on line 2. Line 2 only appears when there is activity to show.
- `compact` — Everything on a single line, truncated to terminal width.

---

### Step 3: Segment Selection

Show the available segments and ask the user which to enable and in what order:

| Segment | Example | Description |
|---|---|---|
| `motto` | `🚀 Ship it!` | Dynamic motto / status message |
| `model` | `🤖 claude-sonnet-4-6` | Current Claude model |
| `project` | `📁 …/my-project` | Working directory (last 2 path components) |
| `git` | `🔀 main* !2 ?1` | Branch, dirty indicator, file stats |
| `context` | `░░████ 34%` | Context window usage bar |
| `usage` | `██░░░░ 20% (3h 15m)` | API quota bar with reset countdown |
| `tools` | `🔧 ◐ Bash, Read` | Running tool calls |
| `agents` | `🤝 ◐ researcher` | Running sub-agents |
| `todos` | `✅ ▸ Write tests (2/5)` | Todo progress |
| `environment` | `⚙️` | CLAUDE.md count, MCPs, hooks |
| `time` | `🕐 14:32` | Current local time |

In `expanded` mode, `tools`, `agents`, `todos`, `usage`, and `environment` always appear on line 2 regardless of their position in the list.

---

### Step 4: Motto Configuration

Ask the user about motto settings:

1. **Strategy**: `day-of-week` · `random` · `sequential` · `time-of-day` · `manual`
2. **Source**: built-in pack or custom list
   - Built-in packs: `motivational-en` · `chill-zh` · `dev-humor` · `zen` · `startup-energy`
   - Custom: collect mottos from the user as a TOML array
3. **Emoji**: enable/disable emoji in mottos (`true` / `false`)

If strategy is `day-of-week`, optionally collect per-day overrides:

```toml
[motto.dayOfWeek]
monday    = "🔥 New week, new features"
friday    = "🎉 Ship it Friday!"
```

If strategy is `manual`, collect `current`:

```toml
[motto]
strategy = "manual"
current = "🔥 Shipping today"
```

---

### Step 5: Write Config

Show the user a **preview** of the full `config.toml` that will be written, then ask for confirmation before writing.

Write the confirmed config to `~/.claude/plugins/claude-menu/config.toml` (create directory if needed):

```bash
mkdir -p "$HOME/.claude/plugins/claude-menu"
```

---

### Step 6: Preview Render

After saving, run a live render using the path extracted in the Prerequisite step:

```bash
echo '{"model":{"display_name":"claude-sonnet-4-6"},"context_window":{"used_percentage":34,"context_window_size":200000},"cwd":"/home/user/my-project"}' \
  | node DIST_INDEX
```

(Replace `DIST_INDEX` with the actual path from `~/.claude/settings.json`.)

Show the output and ask if the user is happy with it. If not, offer to go back to any step and adjust.

---

### Step 7: Done

Tell the user:

> **Configuration saved!** Your statusline will update automatically — no restart needed for config changes.
> Run `/claude-menu:configure` again any time to adjust.

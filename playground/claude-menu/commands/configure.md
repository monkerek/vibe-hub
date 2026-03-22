# /claude-menu:configure

Interactive configuration wizard for Claude Menu.

## Instructions

Guide the user through configuring their Claude Menu statusline step by step.

### Step 1: Theme Selection

Ask the user to choose a built-in theme or create a custom one:

**Built-in themes:**
- `pastel-rainbow` — Soft pastel gradient (green → yellow → orange → pink → purple). Best for dark terminals.
- `claude-orange` — Anthropic's warm orange palette. Bold and branded.
- `nord-frost` — Nord color scheme frost variant. Cool, calm, and minimal.
- `dracula` — Dracula theme with vibrant purples, pinks, and greens.
- `catppuccin` — Catppuccin Mocha flavour. Warm pastels on dark background.
- `monochrome` — Clean grayscale. Distraction-free.

Users can also customize individual segment colors by adding `[theme.segments.<name>]` sections.

### Step 2: Layout Mode

Ask the user to choose:
- `expanded` — Multi-line: main segments on line 1, activity (tools/agents/todos) on line 2
- `compact` — Everything on a single line

### Step 3: Segment Selection

Show available segments and let the user pick which to enable and their order:
- `motto` — Dynamic motto/status message
- `model` — Current Claude model name
- `project` — Project directory path
- `git` — Git branch + status
- `context` — Context window usage bar
- `usage` — API rate limit usage
- `tools` — Active tool calls
- `agents` — Running/completed agents
- `todos` — Todo progress
- `environment` — CLAUDE.md, rules, MCPs, hooks counts
- `time` — Current time

### Step 4: Motto Configuration

Guide motto setup:
1. **Strategy**: `day-of-week`, `random`, `sequential`, `time-of-day`, or `manual`
2. **Source**: Choose a built-in pack (`motivational-en`, `chill-zh`, `dev-humor`, `zen`, `startup-energy`) or provide custom mottos
3. **Custom mottos**: If chosen, collect a list from the user
4. **Day-of-week mapping**: If strategy is `day-of-week`, optionally map specific days to specific mottos
5. **Emoji**: Enable/disable emoji in mottos

### Step 5: Write Config

Write the configuration to `~/.claude/plugins/claude-menu/config.toml`. Show the user a preview of what the config file will look like before writing.

### Step 6: Preview

After saving, simulate a render by running:
```bash
echo '{"model":{"display_name":"Opus 4.6"},"context_window":{"used_percentage":34,"context_window_size":200000}}' | node /path/to/dist/index.js
```

Show the output and ask if the user is happy with it.

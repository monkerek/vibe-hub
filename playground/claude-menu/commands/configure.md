# /claude-menu:configure

Interactive configuration wizard for Claude Menu.

## Instructions

Guide the user through each step below. Use bash tools to read and write files. At the end, write a single clean TOML config with **no inline comments**.

---

### Prerequisite: Locate dist/index.js

Read `~/.claude/settings.json`. Extract the file path from the `statusLine` value — it looks like `node /some/path/dist/index.js`. Store the file path (the part after `node `) as DIST for use in the preview step.

If `settings.json` has no `statusLine` field, run:
```bash
find "$HOME" -maxdepth 6 -name "index.js" -path "*/claude-menu/dist/*" 2>/dev/null | head -5
```
Use the first result as DIST. If nothing is found, ask the user for the absolute path to their `claude-menu/dist/index.js`.

---

### Step 1: Theme

Ask the user to pick a theme by number:

```
1  pastel-rainbow   Soft pastel gradient. Best for dark terminals.
2  claude-orange    Anthropic warm orange. Bold and branded.
3  nord-frost       Nord frost. Cool, calm, minimal.
4  dracula          Vibrant purples, pinks, greens.
5  catppuccin       Catppuccin Mocha. Warm pastels on dark bg.
6  monochrome       Clean grayscale. Distraction-free.
7  custom           Define all segment colors yourself.
```

Record the chosen `THEME_NAME`.

Then ask about the powerline separator. Present these as numbered choices:

```
1  (none)   No separator — plain blocks
2  │        Pipe character (U+007C)
3  (U+E0B0) Filled powerline arrow — requires Nerd Font
4  (U+E0B1) Thin powerline arrow — requires Nerd Font
```

Record `SEPARATOR` as exactly one of these character values:
- Choice 1 → empty string (no character)
- Choice 2 → │ (U+007C)
- Choice 3 → the U+E0B0 filled powerline arrow glyph
- Choice 4 → the U+E0B1 thin powerline arrow glyph

Then ask: "Enable rounded caps? (requires Nerd Font) [Y/n]". Record `ROUNDED` as `true` or `false`.

If the user chose custom theme (option 7), collect `fg` and `bg` hex colors for each segment they plan to use (see Step 3 segment list). Use `"my-theme"` as the name or let the user name it.

---

### Step 2: Layout

Ask the user to choose layout mode:

```
1  expanded   Two lines: main segments on line 1, activity on line 2
2  compact    Single line, truncated to terminal width
```

Record `LAYOUT_MODE`.

---

### Step 3: Segments

Show the available segments and ask the user which to include and in what order:

```
motto        Dynamic motto / status message
model        Current Claude model name
project      Working directory (last 2 path components)
git          Branch, dirty flag, file stats
context      Context window usage bar
usage        API quota bar with reset countdown
tools        Running tool calls
agents       Running sub-agents
todos        Todo progress
environment  CLAUDE.md count, MCPs, hooks
time         Current local time
```

Record `SEGMENTS` as an ordered list. In `expanded` mode: `tools`, `agents`, `todos`, `usage`, `environment` always render on line 2 regardless of position.

---

### Step 4: Motto

Ask the user to choose a motto strategy:

```
1  day-of-week    Cycles by weekday
2  random         Random each render
3  sequential     Advances by day-of-year
4  time-of-day    Morning / afternoon / evening / night
5  manual         Always shows a fixed message
```

Ask which motto source to use:
- **Built-in pack**: `motivational-en`, `chill-zh`, `dev-humor`, `zen`, `startup-energy`
- **Custom list**: collect mottos from the user

If strategy is `manual`, ask for the fixed `current` text.

If strategy is `day-of-week`, optionally collect per-day overrides (monday … sunday).

Ask: "Show emoji in mottos? [Y/n]". Record `MOTTO_EMOJI` as `true` or `false`.

---

### Step 5: Preview and write config

Build the TOML in memory and **show it to the user as a preview** before writing. The TOML must be:
- Clean — no inline comments anywhere
- No blank line at the start of the file
- Separator written as the literal character (or empty for none), not a description

Example of what a correct config looks like (do not copy this verbatim — fill in the user's choices):

```toml
[theme]
name = "pastel-rainbow"
separator = ""
rounded = true

[layout]
mode = "expanded"
segments = ["motto", "project", "git", "model", "context", "time"]

[motto]
enabled = true
strategy = "day-of-week"
pack = "motivational-en"
emoji = true
```

For `separator`:
- If the user chose no separator: write `separator = ""`
- If they chose │ (option 2): write `separator = "│"`
- If they chose the filled powerline arrow (option 3, U+E0B0): write `separator = ""` with the literal U+E0B0 character between the quotes — produce it with `printf '\uE0B0'` if needed
- If they chose the thin powerline arrow (option 4, U+E0B1): write `separator = ""` with the literal U+E0B1 character between the quotes — produce it with `printf '\uE0B1'` if needed

Ask the user to confirm. If they say yes, write the config:

```bash
mkdir -p "$HOME/.claude/plugins/claude-menu"
```

Then write the confirmed content to `~/.claude/plugins/claude-menu/config.toml`.

---

### Step 6: Live preview

Run a render using DIST from the Prerequisite step:

```bash
echo '{"model":{"display_name":"claude-sonnet-4-6"},"context_window":{"used_percentage":34,"context_window_size":200000},"cwd":"/home/user/my-project"}' \
  | node DIST
```

Replace `DIST` with the actual path. Show the output to the user. If it is empty or shows an error, show the raw output and suggest running `npm run build` in the claude-menu directory.

---

### Step 7: Done

Tell the user:

> **Config saved!** The statusline reads `~/.claude/plugins/claude-menu/config.toml` on every render — no restart needed for config changes.
> Run `/claude-menu:configure` again any time to adjust.

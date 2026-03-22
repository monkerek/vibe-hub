# /claude-menu:setup

Set up Claude Menu as your Claude Code statusline.

## Instructions

Follow these steps in order. Use bash tools to execute commands.

---

### Step 1: Find the claude-menu directory

Check common locations in this order, stopping at the first match:

```bash
# 1a. Current directory
test -f "$(pwd)/dist/index.js" && echo "FOUND:$(pwd)/dist/index.js"

# 1b. playground subdirectory (monorepo layout)
test -f "$(pwd)/playground/claude-menu/dist/index.js" && echo "FOUND:$(pwd)/playground/claude-menu/dist/index.js"
```

If found, use that path as DIST.

If not found, ask the user:

> I can't locate `dist/index.js` automatically. Please open a terminal, `cd` into your `claude-menu` directory, and run `pwd`. Paste the output here.

Append `/dist/index.js` to get DIST.

---

### Step 2: Verify the build exists

```bash
test -f "DIST" && echo "EXISTS" || echo "MISSING"
```

Replace `DIST` with the actual path.

If MISSING, instruct the user to run these commands in the claude-menu directory, then re-run `/claude-menu:setup`:

```bash
npm install
npm run build
```

Stop here until the build exists.

---

### Step 3: Write statusLine to ~/.claude/settings.json

Read `~/.claude/settings.json`. If the file doesn't exist, start with `{}`.

Add or update only the `statusLine` field — preserve all other existing fields:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node DIST"
  }
}
```

Replace `DIST` with the actual absolute path. Write the result back to `~/.claude/settings.json` and confirm it is valid JSON.

---

### Step 4: Install the config (if missing)

Check:

```bash
test -f "$HOME/.claude/plugins/claude-menu/config.toml" && echo "EXISTS" || echo "MISSING"
```

If MISSING, create it:

```bash
mkdir -p "$HOME/.claude/plugins/claude-menu"
```

Then write `~/.claude/plugins/claude-menu/config.toml` with this exact content (no inline comments):

```toml
[theme]
name = "pastel-rainbow"
separator = ""
rounded = true

[layout]
mode = "expanded"
segments = ["motto", "project", "git", "model", "context", "time", "tools", "agents", "todos"]

[motto]
enabled = true
strategy = "day-of-week"
pack = "motivational-en"
emoji = true
```

The `separator` field must contain the literal U+E0B0 powerline arrow glyph between the quotes. This character may look identical to an empty string in plain-text viewers that lack Nerd Font support. To produce the character programmatically: `printf '\uE0B0'`. To use no separator instead, write `separator = ""` with nothing between the quotes.

---

### Step 5: Smoke-test

Run a render using the real DIST path:

```bash
echo '{"model":{"display_name":"claude-sonnet-4-6"},"context_window":{"used_percentage":34,"context_window_size":200000},"cwd":"/home/user/my-project"}' \
  | node DIST
```

Show the output. Colored powerline segments means success. Empty output or an error means the build is broken — tell the user to run `npm run build` in the claude-menu directory.

---

### Step 6: Confirm

Tell the user:

> **Claude Menu is set up!**
> - `statusLine` written to `~/.claude/settings.json`
> - Config at `~/.claude/plugins/claude-menu/config.toml`
>
> **Restart Claude Code** to activate the statusline.
> Run `/claude-menu:configure` to customize themes, mottos, and segments.

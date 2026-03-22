# /claude-menu:setup

Set up Claude Menu as your Claude Code statusline.

## Instructions

Follow these steps exactly. Use bash tools to execute each command.

### Step 1: Find the dist/index.js path

Run this search to locate the claude-menu installation:

```bash
find "$HOME" -maxdepth 6 -name "index.js" -path "*/claude-menu/dist/index.js" 2>/dev/null | head -5
```

If the search returns results, confirm the correct path with the user (there may be multiple clones). If nothing is found, ask the user to provide the absolute path to their `claude-menu/dist/index.js`.

Once you have the path, verify it exists:

```bash
test -f "/absolute/path/to/claude-menu/dist/index.js" && echo "EXISTS" || echo "MISSING — run: npm run build"
```

If the file is MISSING, instruct the user to run `npm run build` inside the claude-menu directory first, then re-run this command.

### Step 2: Write the statusLine to ~/.claude/settings.json

Read `~/.claude/settings.json` (create it as `{}` if it doesn't exist), then add or replace the `statusLine` field:

```json
{
  "statusLine": "node /absolute/path/to/claude-menu/dist/index.js"
}
```

Preserve all other existing fields. Write the updated JSON back to `~/.claude/settings.json`. Validate it is well-formed JSON after writing.

### Step 3: Install the config (if not already present)

Check whether `~/.claude/plugins/claude-menu/config.toml` already exists:

```bash
test -f "$HOME/.claude/plugins/claude-menu/config.toml" && echo "EXISTS" || echo "MISSING"
```

If MISSING, create the directory and write a starter config:

```bash
mkdir -p "$HOME/.claude/plugins/claude-menu"
```

Then write `~/.claude/plugins/claude-menu/config.toml` with this content:

```toml
# Claude Menu Configuration
# Run /claude-menu:configure to customise themes, mottos, and segments.

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

### Step 4: Smoke-test the statusline

Run a quick render to confirm the binary works (substitute the real path):

```bash
echo '{"model":{"display_name":"claude-sonnet-4-6"},"context_window":{"used_percentage":34,"context_window_size":200000},"cwd":"/home/user/my-project"}' \
  | node /absolute/path/to/claude-menu/dist/index.js
```

Show the output to the user. If it prints colored powerline segments the setup is working. If it prints nothing or errors, report the error.

### Step 5: Confirm

Tell the user:

> **Claude Menu is set up!** Restart Claude Code to see your new statusline.
> Run `/claude-menu:configure` to customize themes, layout, and mottos.

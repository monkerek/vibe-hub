# /claude-menu:setup

Set up Claude Menu as your Claude Code statusline.

## Instructions

This command configures Claude Code to use Claude Menu as the statusline provider.

1. First, find the absolute path to the claude-menu `dist/index.js` file.
2. Update `~/.claude/settings.json` to add or replace the `statusLine` field with:

```json
{
  "statusLine": "node /absolute/path/to/claude-menu/dist/index.js"
}
```

Use the actual resolved path. You can determine it by running:
```bash
echo "node $(cd "$(dirname "$(which claude-menu 2>/dev/null || echo "$PWD/dist/index.js")")" && pwd)/index.js"
```

Or if claude-menu was installed locally, resolve from the project root:
```bash
node -e "const p=require('path'); console.log('node ' + p.resolve(__dirname, 'dist/index.js'))"
```

3. After writing the settings, inform the user they need to restart Claude Code for the statusline to take effect.

4. Verify the setup by checking that:
   - `dist/index.js` exists (run `npm run build` if not)
   - `~/.claude/settings.json` is valid JSON after modification
   - The `statusLine` path points to an actual file

5. Create the default config directory and a starter `config.toml` at `~/.claude/plugins/claude-menu/config.toml` if it doesn't exist:

```toml
# Claude Menu Configuration
# Docs: https://github.com/anthropics/claude-menu

[theme]
name = "pastel-rainbow"
separator = ""

[layout]
mode = "expanded"
segments = ["motto", "project", "git", "model", "context", "time"]

[motto]
enabled = true
strategy = "day-of-week"
pack = "motivational-en"
emoji = true
```

Tell the user: "Claude Menu is set up! Restart Claude Code to see your new statusline. Run `/claude-menu:configure` to customize themes, mottos, and segments."

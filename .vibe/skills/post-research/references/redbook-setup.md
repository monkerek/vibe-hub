# Redbook Auth Setup Guide

One-time setup to enable Tier 0 (native) Red Note fetching via `@lucasygu/redbook`.

## Why This Is Needed

Red Note blocks all proxy services (Jina Reader, defuddle.md, etc.) with 403.
The `redbook` CLI bypasses this by reusing your existing browser session cookies —
the same cookies that keep you logged in on `xiaohongshu.com`.

## Project Config Structure

This project keeps a `.config/redbook/cookie-string` symlink that points to your
machine's `~/.config/redbook/cookie-string`. The symlink is committed to the repo
so the path convention is documented, but the target is always your local file.

**New contributors must recreate the symlink** using their own home directory:

```bash
mkdir -p ~/.config/redbook
ln -sf ~/.config/redbook/cookie-string .config/redbook/cookie-string
```

---

## Step 1 — Install

```bash
npm install -g @lucasygu/redbook
```

## Step 2 — Get Your Cookies

Open Chrome and make sure you're logged into https://www.xiaohongshu.com

1. Press **F12** to open DevTools
2. Go to **Application** tab → **Cookies** → `https://www.xiaohongshu.com`
3. Find and copy the values for:
   - `a1`
   - `web_session`

## Step 3 — Store the Cookie String

```bash
mkdir -p ~/.config/redbook
echo "a1=YOUR_A1_VALUE; web_session=YOUR_WEB_SESSION_VALUE" > ~/.config/redbook/cookie-string
chmod 600 ~/.config/redbook/cookie-string
```

Then recreate the project symlink so `.config/redbook/cookie-string` resolves to your file:

```bash
ln -sf ~/.config/redbook/cookie-string .config/redbook/cookie-string
```

> **Never commit the cookie-string file itself.** Only the symlink is tracked.
> `.config/redbook/cookie-string` is a symlink — the actual file lives outside the repo.

Alternatively, export as an env var instead of using the file (add to `~/.bashrc` or `~/.zshrc`):

```bash
export XHS_COOKIE_STRING="a1=YOUR_A1_VALUE; web_session=YOUR_WEB_SESSION_VALUE"
```

The `redbook-read.sh` wrapper checks `$XHS_COOKIE_STRING` first, then falls back to the file.

## Step 4 — Verify

```bash
bash .vibe/skills/post-research/scripts/redbook-check.sh
```

Or directly:

```bash
redbook whoami --cookie-string "$(cat ~/.config/redbook/cookie-string)"
```

Expected output:
```
Connected to Xiaohongshu
  User: YourNickname
  ID:   your_user_id
```

## Step 5 — Test a Read

```bash
bash .vibe/skills/post-research/scripts/redbook-read.sh \
  "https://www.xiaohongshu.com/discovery/item/69beb0b70000000022029b6f?xsec_token=..."
```

## Cookie Expiry

Xiaohongshu cookies typically last **30–90 days**. When `redbook-check.sh` starts
failing, repeat Steps 2–3 with fresh cookies from Chrome DevTools. The symlink does
not need to be recreated — only the contents of `~/.config/redbook/cookie-string`.

## Platform Notes

| Platform | Method | Notes |
|---|---|---|
| macOS + Chrome | Auto-extraction or file | `redbook whoami` works out of the box; file is still recommended for consistency |
| Linux / headless | `~/.config/redbook/cookie-string` | Manual setup required (no Chrome) |
| Windows | CDP auto or manual | Chrome must be closed for CDP mode; file fallback always works |

## Note URL Format

`redbook read` works with both URL formats:
- Full URL with `xsec_token`: uses faster API mode
- Plain URL without token: uses HTML fallback (slightly slower)

The full share URL (with `xsec_token` query param) from the Red Note app is preferred.

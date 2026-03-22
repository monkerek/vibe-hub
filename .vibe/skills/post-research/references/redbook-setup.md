# Redbook Auth Setup Guide

One-time setup to enable Tier 0 (native) Red Note fetching via `@lucasygu/redbook`.

## Why This Is Needed

Red Note blocks all proxy services (Jina Reader, defuddle.md, etc.) with 403.
The `redbook` CLI bypasses this by reusing your existing browser session cookies —
the same cookies that keep you logged in on `xiaohongshu.com`.

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

Alternatively, export it as an env var (add to `~/.bashrc` or `~/.zshrc`):

```bash
export XHS_COOKIE_STRING="a1=YOUR_A1_VALUE; web_session=YOUR_WEB_SESSION_VALUE"
```

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
failing, repeat Step 2–3 with fresh cookies from Chrome DevTools.

## Platform Notes

| Platform | Method | Notes |
|---|---|---|
| macOS + Chrome | Auto-extraction | `redbook whoami` works out of the box |
| Linux / headless | `~/.config/redbook/cookie-string` | Manual setup required (no Chrome) |
| Windows | CDP auto or manual | Chrome must be closed for CDP mode |

## Note URL Format

`redbook read` works with both URL formats:
- Full URL with `xsec_token`: uses faster API mode
- Plain URL without token: uses HTML fallback (slightly slower)

The full share URL (with `xsec_token` query param) from the Red Note app is preferred.

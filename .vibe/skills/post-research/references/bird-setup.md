# Twitter/X Auth Setup — bird CLI

One-time setup to enable **Tier 0** (native browser-cookie) Twitter fetching.

> **Tier 0 is completely optional.** Without it, the skill automatically falls
> through to Tier 1 (Jina Reader) and beyond. Degraded result quality for
> login-walled tweets, but the skill still functions.

---

## How It Works

Twitter/X's website stores two cookies in your browser after login:

| Cookie | Purpose | Looks like |
|---|---|---|
| `auth_token` | Session identity token | 40-char hex: `a1b2c3d4e5f6...` |
| `ct0` | CSRF token (cross-request forgery protection) | ~160-char alphanumeric string |

The `bird` CLI passes these cookies directly to Twitter's internal GraphQL API —
the same API that `x.com` itself uses. No official API key needed.

**Tokens stay valid as long as you remain logged into x.com.** They expire only
when you explicitly log out (or Twitter invalidates them remotely).

---

## Step 1 — Install bird

```bash
npm install -g @steipete/bird
bird --version   # should print: bird 0.8.0
```

---

## Step 2 — Extract Your Tokens

You need to be **logged in** to https://x.com in your browser first.

### Chrome / Chromium / Arc / Brave / Edge

1. Go to **https://x.com** (make sure you're logged in — you should see your timeline)
2. Open DevTools:
   - **Mac**: `Cmd + Option + I`
   - **Windows/Linux**: `F12` or `Ctrl + Shift + I`
3. Click the **Application** tab (you may need to click `>>` to find it)
4. In the left sidebar: expand **Storage** → **Cookies** → click `https://x.com`
5. You'll see a table of cookies. Use the search/filter box at the top to find each one:

**Finding `auth_token`:**
- Type `auth_token` in the filter box
- Click the `auth_token` row
- The **Value** column shows the token — it's a 40-character hex string like:
  `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2`
- Double-click the value cell to select it, then copy (`Cmd+C` / `Ctrl+C`)

**Finding `ct0`:**
- Clear the filter, type `ct0`
- Click the `ct0` row
- The value is a long alphanumeric string (~160 chars)
- Double-click to select the entire value, copy it

> **Tip**: The Name column may truncate long values. Always double-click the
> Value cell itself, not the Name cell, to get the full value.

### Firefox

1. Go to **https://x.com** while logged in
2. Open DevTools: `F12` or `Ctrl + Shift + I` (Mac: `Cmd + Option + I`)
3. Click the **Storage** tab
4. In the left sidebar: expand **Cookies** → click `https://x.com`
5. Find `auth_token` and `ct0` in the table — same process as Chrome above

### Safari (macOS)

1. Enable DevTools if needed: **Safari → Settings → Advanced → Show features for web developers**
2. Go to **https://x.com** while logged in
3. Open Web Inspector: `Cmd + Option + I` or **Develop → Show Web Inspector**
4. Click the **Storage** tab → **Cookies** → `x.com`
5. Find `auth_token` and `ct0`, double-click their values to copy

### Alternative: Browser Console (Any Browser)

Open DevTools → **Console** tab → paste this and press Enter:

```javascript
document.cookie.split('; ')
  .filter(c => c.startsWith('auth_token=') || c.startsWith('ct0='))
  .forEach(c => console.log(c))
```

This prints both values directly. Note: this only works on `x.com` itself (not in DevTools opened on another page).

---

## Step 3 — Store Credentials in .env

```bash
# From the repo root:
cp .vibe/skills/post-research/.env.example .vibe/skills/post-research/.env
```

Open `.vibe/skills/post-research/.env` and fill in the Twitter values:

```bash
TWITTER_AUTH_TOKEN=a1b2c3d4e5f6...    # your 40-char auth_token value
TWITTER_CT0=abcdef123456...           # your ~160-char ct0 value
```

Set restrictive permissions (prevents other users on the machine from reading it):

```bash
chmod 600 .vibe/skills/post-research/.env
```

> **The `.env` file is gitignored.** It will never be committed. The
> `.env.example` file (which has empty values) is what's tracked in git.

---

## Step 4 — Verify

```bash
bash .vibe/skills/post-research/scripts/bird-check.sh
```

Expected output on success:
```
bird: authenticated
```

If you see `Tier 0 not configured`, check that `.env` has non-empty values.
If you see `auth failed`, the tokens are stale — repeat Step 2.

---

## Step 5 — Test a Fetch

```bash
# Single tweet
bash .vibe/skills/post-research/scripts/bird-read.sh \
  "https://x.com/karpathy/status/1886192184808149383"

# Full thread (JSON output)
bash .vibe/skills/post-research/scripts/bird-read.sh \
  "https://x.com/karpathy/status/1886192184808149383" --thread --json
```

---

## Graceful Degradation

When `bird-check.sh` exits non-zero, the skill **automatically skips Tier 0**
and falls through to Tier 1 (Jina Reader). No crash, no error — just degraded
fetch quality. The fetch method used is recorded in the digest metadata.

| bird-check exit | Meaning | Skill behavior |
|---|---|---|
| `0` | Authenticated | Use bird (Tier 0) |
| `2` | Not configured | Skip to Tier 1 silently |
| `3` | Tokens expired | Skip to Tier 1, warn user |

---

## Token Expiry & Refresh

Tokens do **not** have a fixed expiry date. They remain valid until:
- You click **Log out** on x.com
- Twitter remotely invalidates them (rare; happens after suspicious activity)
- You change your password

To refresh: repeat Step 2 and overwrite the values in `.env`. The file path
and permissions don't need to change.

---

## Platform Notes

| Environment | Setup | Notes |
|---|---|---|
| macOS + Chrome/Firefox | Env file **or** auto-extraction | `bird` can read Chrome cookies directly without any config. Env file recommended for headless/CI use. |
| Linux / headless | Env file required | No browser available; `.env` is the only option. |
| Windows | Env file or Chrome DevTools | Use DevTools to extract, paste into `.env`. |
| CI/CD | `TWITTER_AUTH_TOKEN` + `TWITTER_CT0` env vars | Export as secrets in your CI environment — no file needed. |

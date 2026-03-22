# Red Note / Xiaohongshu Auth Setup — redbook CLI

One-time setup to enable **Tier 0** (native browser-cookie) Red Note fetching.

> **Tier 0 is completely optional.** Without it, the skill automatically falls
> through to Tier 1 (Jina Reader). Red Note blocks most proxy services with 403,
> so unconfigured results will often degrade to Search Synthesis (Tier 5).
> Configuring this is **strongly recommended** for Red Note URLs.

---

## How It Works

Xiaohongshu stores two key cookies in your browser after login:

| Cookie | Purpose | Looks like |
|---|---|---|
| `a1` | Device/session fingerprint | Long alphanumeric string, 50+ chars |
| `web_session` | Authentication session token | Starts with `040062` or similar, 150+ chars |

The `redbook` CLI passes these cookies to Xiaohongshu's internal API —
the same endpoints the website uses. No official API key needed.

**Cookie lifetime**: typically **30–90 days**. Xiaohongshu refreshes them
on activity, so active users rarely need to re-extract.

---

## Step 1 — Install redbook

```bash
npm install -g @lucasygu/redbook
redbook --version
```

---

## Step 2 — Extract Your Cookies

You need to be **logged in** to https://www.xiaohongshu.com first.

> **Important**: Use a desktop browser on `www.xiaohongshu.com` — not the app,
> not the mobile site. The app uses different auth mechanisms.

### Chrome / Chromium / Arc / Brave / Edge

1. Go to **https://www.xiaohongshu.com** (make sure you're logged in — you should see your feed)
2. Open DevTools:
   - **Mac**: `Cmd + Option + I`
   - **Windows/Linux**: `F12` or `Ctrl + Shift + I`
3. Click the **Application** tab (click `>>` if it's hidden)
4. In the left sidebar: expand **Storage** → **Cookies** → click `https://www.xiaohongshu.com`
5. A table of cookies appears. Use the filter/search box:

**Finding `a1`:**
- Type `a1` in the filter box
- Look for a cookie named exactly `a1` (there may be others starting with `a1`; pick the exact match)
- The value is a long alphanumeric string — double-click the **Value** cell to select the full value, then copy

**Finding `web_session`:**
- Clear the filter, type `web_session`
- Click the `web_session` row
- Double-click the Value cell to select the full value (it's long, ~150+ chars), copy it

> **Important**: Always double-click the Value cell itself — the table may
> truncate displayed values. The full value is only visible when selected.

### Firefox

1. Go to **https://www.xiaohongshu.com** while logged in
2. Open DevTools: `F12` or `Ctrl + Shift + I` (Mac: `Cmd + Option + I`)
3. Click the **Storage** tab
4. In the left sidebar: **Cookies** → `https://www.xiaohongshu.com`
5. Find `a1` and `web_session` in the table, copy their full values

### Safari (macOS)

1. Enable DevTools: **Safari → Settings → Advanced → Show features for web developers**
2. Go to **https://www.xiaohongshu.com** while logged in
3. Open Web Inspector: `Cmd + Option + I`
4. Click **Storage** → **Cookies** → `xiaohongshu.com`
5. Find and copy `a1` and `web_session`

### Alternative: Browser Console (Chrome/Firefox)

Open DevTools → **Console** tab → paste this while on `www.xiaohongshu.com`:

```javascript
document.cookie.split('; ')
  .filter(c => c.startsWith('a1=') || c.startsWith('web_session='))
  .forEach(c => console.log(c))
```

This prints both cookies formatted as `name=value`. Copy the values (the part after `=`).

> **Note**: Xiaohongshu sets `HttpOnly` on some cookies, which means they won't
> appear in `document.cookie`. If the console method shows an empty result, use
> the Application/Storage tab in DevTools instead.

### From the Xiaohongshu App (Share URL Method)

If you want to fetch a specific post from the app:
1. Open the post in the Red Note app
2. Tap **Share** → **Copy Link**
3. The copied URL includes `xsec_token` — this is the full share URL, use it directly:
   ```
   https://www.xiaohongshu.com/explore/POST_ID?xsec_token=...&xsec_source=app_share
   ```
4. `redbook read` uses the `xsec_token` for faster API access (no token = HTML fallback)

---

## Step 3 — Store Credentials in .env

```bash
# From the repo root:
cp .vibe/skills/post-research/.env.example .vibe/skills/post-research/.env
```

Open `.vibe/skills/post-research/.env` and fill in the Red Note values:

```bash
XHS_A1=0a1b2c3d4e5f6...         # your a1 cookie value
XHS_WEB_SESSION=040062...        # your web_session cookie value
```

Set restrictive permissions:

```bash
chmod 600 .vibe/skills/post-research/.env
```

The scripts combine these into the cookie string `a1=VALUE; web_session=VALUE`
automatically — you never need to format it manually.

> **The `.env` file is gitignored.** It will never be committed.

---

## Step 4 — Verify

```bash
bash .vibe/skills/post-research/scripts/redbook-check.sh
```

Expected output on success:
```
redbook: authenticated
```

If you see `Tier 0 not configured`, check that `.env` has non-empty `XHS_A1` and `XHS_WEB_SESSION` values.
If you see `auth failed`, the cookies are expired — repeat Step 2.

---

## Step 5 — Test a Fetch

```bash
# Full URL with xsec_token (preferred — faster API mode)
bash .vibe/skills/post-research/scripts/redbook-read.sh \
  "https://www.xiaohongshu.com/explore/69beb0b70000000022029b6f?xsec_token=ABcd...&xsec_source=app_share"

# Plain URL without token (slower HTML fallback — still works)
bash .vibe/skills/post-research/scripts/redbook-read.sh \
  "https://www.xiaohongshu.com/explore/69beb0b70000000022029b6f"

# JSON output
bash .vibe/skills/post-research/scripts/redbook-read.sh <url> --json
```

---

## Graceful Degradation

When `redbook-check.sh` exits non-zero, the skill **automatically skips Tier 0**
and falls through to Tier 1 (Jina Reader). Because Red Note aggressively blocks
proxies, unconfigured fetches will often degrade all the way to Search Synthesis.

| redbook-check exit | Meaning | Skill behavior |
|---|---|---|
| `0` | Authenticated | Use redbook (Tier 0) |
| `2` | Not configured | Skip to Tier 1 silently |
| `3` | Cookies expired | Skip to Tier 1, warn user |

---

## Cookie Expiry & Refresh

Cookies typically last **30–90 days**. Signs of expiry:
- `redbook-check.sh` exits with code 3
- `redbook read` returns a login-required error

To refresh: repeat Step 2 and overwrite `XHS_A1` and `XHS_WEB_SESSION` in `.env`.

---

## Platform Notes

| Environment | Setup | Notes |
|---|---|---|
| macOS + Chrome | Env file **or** auto-extraction | `redbook` can read Chrome cookies directly on macOS. Env file recommended for reliability. |
| Linux / headless | Env file required | No browser; `.env` is the only option. |
| Windows | Env file | Use Chrome DevTools to extract, paste into `.env`. |
| CI/CD | `XHS_A1` + `XHS_WEB_SESSION` env vars | Export as secrets in your CI environment. |

## Content Limitations

Even with valid credentials, some content cannot be fetched:
- **Image-only posts**: Red Note is image-first; posts with no text caption return < 100 chars → Tier 0 fails Hard Gate
- **Video posts**: audio/video is not extractable; title may be available
- **Private accounts**: not accessible even with valid session
- **Age-gated content**: requires additional verification

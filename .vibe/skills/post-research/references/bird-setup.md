# Bird Auth Setup Guide

One-time setup to enable Tier 0 (native) Twitter/X fetching via `@steipete/bird`.

## Why This Is Needed

Twitter/X's public pages require login to render tweet content. Proxy services
(Jina Reader, defuddle.md) hit paywalls or empty responses. The `bird` CLI
bypasses this by reusing your existing browser session tokens — the same
`auth_token` and `ct0` cookies that keep you logged in on `x.com`.

## Project Config Structure

This project keeps a `.config/bird/credentials` symlink that points to your
machine's `~/.config/bird/credentials`. The symlink is committed to the repo
so the path convention is documented, but the target is always your local file.

**New contributors must recreate the symlink** using their own home directory:

```bash
mkdir -p ~/.config/bird
ln -sf ~/.config/bird/credentials .config/bird/credentials
```

---

## Step 1 — Install

```bash
npm install -g @steipete/bird
```

## Step 2 — Get Your Tokens

Open Chrome (or Firefox) and make sure you're logged into https://x.com

1. Press **F12** to open DevTools
2. Go to **Application** tab → **Cookies** → `https://x.com`
3. Find and copy the values for:
   - `auth_token`
   - `ct0`

## Step 3 — Store the Credentials

```bash
mkdir -p ~/.config/bird
cat > ~/.config/bird/credentials << 'EOF'
auth_token=YOUR_AUTH_TOKEN_VALUE
ct0=YOUR_CT0_VALUE
EOF
chmod 600 ~/.config/bird/credentials
```

Then recreate the project symlink so `.config/bird/credentials` resolves to your file:

```bash
ln -sf ~/.config/bird/credentials .config/bird/credentials
```

> **Never commit the credentials file itself.** Only the symlink is tracked.
> `.config/bird/credentials` is a symlink — the actual file lives outside the repo.

Alternatively, export as env vars instead of using the file (add to `~/.bashrc` or `~/.zshrc`):

```bash
export TWITTER_AUTH_TOKEN="YOUR_AUTH_TOKEN_VALUE"
export TWITTER_CT0="YOUR_CT0_VALUE"
```

The `bird-read.sh` wrapper checks `$TWITTER_AUTH_TOKEN`/`$TWITTER_CT0` first,
then falls back to the credentials file.

## Step 4 — Verify

```bash
bash .vibe/skills/post-research/scripts/bird-check.sh
```

Or directly:

```bash
source <(grep -E '^auth_token=|^ct0=' ~/.config/bird/credentials | sed 's/^/export TWITTER_/; s/auth_token/AUTH_TOKEN/; s/ct0/CT0/')
bird whoami --auth-token "$TWITTER_AUTH_TOKEN" --ct0 "$TWITTER_CT0"
```

Expected output:
```
@YourHandle  Your Name
```

## Step 5 — Test a Read

```bash
# Single tweet
bash .vibe/skills/post-research/scripts/bird-read.sh \
  "https://x.com/user/status/1234567890" --json

# Full thread
bash .vibe/skills/post-research/scripts/bird-read.sh \
  "https://x.com/user/status/1234567890" --thread --json
```

## Token Expiry

Twitter tokens expire when you **log out of x.com**. As long as you stay logged
in, tokens are persistent. If `bird-check.sh` fails, re-extract from DevTools
and overwrite `~/.config/bird/credentials`.

## Platform Notes

| Platform | Method | Notes |
|---|---|---|
| macOS + Chrome | Auto-extraction or file | `bird whoami` works out of the box; file recommended for consistency |
| macOS + Firefox | `--firefox-profile` or file | Use `bird whoami --firefox-profile default-release` to test |
| Linux / headless | `~/.config/bird/credentials` | Manual setup required (no browser) |
| Windows | File or manual | Use DevTools on x.com to extract tokens |

## bird vs twitter-thread.com (Tier 2)

| | `bird` (Tier 0) | `twitter-thread.com` (Tier 2) |
|---|---|---|
| Auth required | Yes (your session) | No |
| Full thread support | `--thread --all` | Partial (public only) |
| JSON output | `--json` | No |
| Rate limits | Your account limits | Public rate limits |
| Reliability | High | Breaks on login-walled tweets |

Use `bird` whenever possible. Fall through to Tier 2 only if `bird-check.sh` fails.

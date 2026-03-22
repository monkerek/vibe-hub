#!/usr/bin/env bash
# bird-check.sh — verify Twitter/X auth for Tier 0 access
#
# Credentials are OPTIONAL. Exit codes:
#   0 — authenticated and working   (proceed with Tier 0)
#   2 — not configured              (skip Tier 0, fall through to Tier 1)
#   3 — configured but auth failed  (skip Tier 0, tokens may be expired)
#   1 — script error
#
# Credential resolution order:
#   1. TWITTER_AUTH_TOKEN + TWITTER_CT0 env vars
#   2. .env file in skill root     (.vibe/skills/post-research/.env)
#   3. Browser extraction          (macOS Chrome/Firefox — no config needed)

set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$SKILL_ROOT/.env"

# Source .env if present (only load TWITTER_* vars)
if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    key="${key//[[:space:]]/}"
    value="${value//[[:space:]]/}"
    case "$key" in
      TWITTER_AUTH_TOKEN|TWITTER_CT0) export "$key=$value" ;;
    esac
  done < "$ENV_FILE"
fi

AUTH_TOKEN="${TWITTER_AUTH_TOKEN:-}"
CT0="${TWITTER_CT0:-}"

# Case 1: no credentials configured — try browser extraction
if [[ -z "$AUTH_TOKEN" || -z "$CT0" ]]; then
  if command -v bird &>/dev/null && bird whoami 2>/dev/null | grep -q "@"; then
    echo "bird: authenticated via browser extraction" >&2
    exit 0
  fi
  echo "bird: Tier 0 not configured (TWITTER_AUTH_TOKEN / TWITTER_CT0 not set)" >&2
  echo "  → Skipping to Tier 1. To enable: see references/bird-setup.md" >&2
  exit 2
fi

# Case 2: credentials present — verify they work
if ! command -v bird &>/dev/null; then
  echo "bird: CLI not installed. Run: npm install -g @steipete/bird" >&2
  exit 2
fi

if bird whoami --auth-token "$AUTH_TOKEN" --ct0 "$CT0" 2>/dev/null | grep -q "@"; then
  echo "bird: authenticated" >&2
  exit 0
else
  echo "bird: credentials configured but auth failed — tokens may be expired" >&2
  echo "  → Re-extract auth_token + ct0 from browser and update .env" >&2
  exit 3
fi

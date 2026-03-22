#!/usr/bin/env bash
# bird-read.sh — Tier 0 Twitter/X fetch wrapper
#
# Reads a tweet or full thread using the bird CLI with browser-cookie auth.
# Credentials are OPTIONAL — if missing, exits with code 2 so the caller
# can fall through to Tier 1 (Jina Reader).
#
# Usage:
#   ./bird-read.sh <tweet-url-or-id>              # single tweet, plain output
#   ./bird-read.sh <tweet-url-or-id> --thread     # full conversation thread
#   ./bird-read.sh <tweet-url-or-id> --json       # JSON output
#   ./bird-read.sh <tweet-url-or-id> --thread --json
#
# Exit codes:
#   0 — success
#   2 — not configured (caller should skip to Tier 1)
#   1 — other error
#
# Credential resolution order:
#   1. TWITTER_AUTH_TOKEN + TWITTER_CT0 env vars
#   2. .env file in skill root (.vibe/skills/post-research/.env)
#   3. Browser extraction (macOS Chrome/Firefox)
#
# One-time setup: see references/bird-setup.md

set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$SKILL_ROOT/.env"

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Usage: bird-read.sh <tweet-url-or-id> [--thread] [--json]" >&2
  exit 1
fi

# Parse flags — intercept --thread, pass everything else to bird
THREAD=false
EXTRA_ARGS=()
for arg in "${@:2}"; do
  if [[ "$arg" == "--thread" ]]; then
    THREAD=true
  else
    EXTRA_ARGS+=("$arg")
  fi
done

# Source .env if present
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

# Verify bird is installed
if ! command -v bird &>/dev/null; then
  echo "bird: CLI not installed. Run: npm install -g @steipete/bird" >&2
  exit 2
fi

# Build base command
if [[ "$THREAD" == true ]]; then
  CMD=(bird thread "$URL" --all)
else
  CMD=(bird read "$URL")
fi

# Inject credentials if available, otherwise try browser extraction
if [[ -n "$AUTH_TOKEN" && -n "$CT0" ]]; then
  exec "${CMD[@]}" --auth-token "$AUTH_TOKEN" --ct0 "$CT0" \
    "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
else
  # macOS: bird can extract from Chrome/Firefox automatically
  # On Linux/headless this will fail — caller should catch and fall through
  exec "${CMD[@]}" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
fi

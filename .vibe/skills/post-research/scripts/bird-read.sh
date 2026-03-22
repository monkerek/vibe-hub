#!/usr/bin/env bash
# bird-read.sh — Tier 0 wrapper for reading Twitter/X tweets and threads
#
# Resolves credentials from (in priority order):
#   1. $TWITTER_AUTH_TOKEN + $TWITTER_CT0 env vars
#   2. ~/.config/bird/credentials file (key=value format)
#   3. Browser extraction (macOS with Chrome/Firefox)
#
# Usage:
#   ./bird-read.sh <tweet-url-or-id>           # single tweet
#   ./bird-read.sh <tweet-url-or-id> --thread  # full conversation thread
#   ./bird-read.sh <tweet-url-or-id> --json    # JSON output
#
# One-time setup: see references/bird-setup.md

set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Usage: bird-read.sh <tweet-url-or-id> [--thread] [--json]" >&2
  exit 1
fi

# Parse extra flags, intercepting --thread before passing rest to bird
THREAD=false
EXTRA_ARGS=()
for arg in "${@:2}"; do
  if [[ "$arg" == "--thread" ]]; then
    THREAD=true
  else
    EXTRA_ARGS+=("$arg")
  fi
done

# Resolve credentials
AUTH_TOKEN="${TWITTER_AUTH_TOKEN:-}"
CT0="${TWITTER_CT0:-}"

if [[ -z "$AUTH_TOKEN" || -z "$CT0" ]]; then
  CONFIG_FILE="${HOME}/.config/bird/credentials"
  if [[ -f "$CONFIG_FILE" && -s "$CONFIG_FILE" ]]; then
    # Parse key=value pairs, ignoring blank lines and comments
    while IFS='=' read -r key value; do
      [[ "$key" =~ ^#|^$ ]] && continue
      key="${key// /}"
      value="${value// /}"
      case "$key" in
        auth_token) AUTH_TOKEN="$value" ;;
        ct0)        CT0="$value" ;;
      esac
    done < "$CONFIG_FILE"
  fi
fi

# Build command: bird read or bird thread
if [[ "$THREAD" == true ]]; then
  CMD=(bird thread "$URL" --all)
else
  CMD=(bird read "$URL")
fi

# Inject credentials if available
if [[ -n "$AUTH_TOKEN" && -n "$CT0" ]]; then
  exec "${CMD[@]}" --auth-token "$AUTH_TOKEN" --ct0 "$CT0" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
else
  # Fall back to browser extraction (works on macOS with Chrome/Firefox)
  exec "${CMD[@]}" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
fi

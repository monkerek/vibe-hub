#!/usr/bin/env bash
# bird-check.sh — verify bird CLI auth is configured and working
#
# Exits 0 if authenticated, 1 if not.
# Use before attempting Tier 0 Twitter reads.

set -euo pipefail

AUTH_TOKEN="${TWITTER_AUTH_TOKEN:-}"
CT0="${TWITTER_CT0:-}"

if [[ -z "$AUTH_TOKEN" || -z "$CT0" ]]; then
  CONFIG_FILE="${HOME}/.config/bird/credentials"
  if [[ -f "$CONFIG_FILE" && -s "$CONFIG_FILE" ]]; then
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

if [[ -z "$AUTH_TOKEN" || -z "$CT0" ]]; then
  # Try browser extraction (macOS only)
  if bird whoami 2>/dev/null | grep -q "@"; then
    exit 0
  fi
  echo "bird: no credentials configured and browser extraction failed" >&2
  echo "See: references/bird-setup.md for one-time setup instructions" >&2
  exit 1
fi

if bird whoami --auth-token "$AUTH_TOKEN" --ct0 "$CT0" 2>/dev/null | grep -q "@"; then
  exit 0
else
  echo "bird: credentials found but auth failed — tokens may be expired" >&2
  echo "Re-extract auth_token and ct0 from browser DevTools and update ~/.config/bird/credentials" >&2
  exit 1
fi

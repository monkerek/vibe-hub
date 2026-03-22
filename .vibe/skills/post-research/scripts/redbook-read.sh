#!/usr/bin/env bash
# redbook-read.sh — Tier 0 wrapper for reading Red Note posts
#
# Resolves cookies from (in priority order):
#   1. $XHS_COOKIE_STRING env var
#   2. ~/.config/redbook/cookie-string file
#   3. Chrome browser extraction (macOS only)
#
# Usage:
#   ./redbook-read.sh <xiaohongshu-url> [--json]
#
# One-time setup: see references/redbook-setup.md

set -euo pipefail

URL="${1:-}"
EXTRA_ARGS="${@:2}"

if [[ -z "$URL" ]]; then
  echo "Usage: redbook-read.sh <url> [--json]" >&2
  exit 1
fi

# Resolve cookie string
COOKIE_STRING="${XHS_COOKIE_STRING:-}"

if [[ -z "$COOKIE_STRING" ]]; then
  CONFIG_FILE="${HOME}/.config/redbook/cookie-string"
  if [[ -f "$CONFIG_FILE" ]]; then
    COOKIE_STRING="$(cat "$CONFIG_FILE")"
  fi
fi

# Execute
if [[ -n "$COOKIE_STRING" ]]; then
  exec redbook read "$URL" --cookie-string "$COOKIE_STRING" $EXTRA_ARGS
else
  # Fall back to browser extraction (works on macOS with Chrome)
  exec redbook read "$URL" $EXTRA_ARGS
fi

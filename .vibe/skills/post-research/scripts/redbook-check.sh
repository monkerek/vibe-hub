#!/usr/bin/env bash
# redbook-check.sh — verify redbook auth is configured and working
#
# Exits 0 if authenticated, 1 if not.
# Use before attempting Tier 0 reads.

set -euo pipefail

COOKIE_STRING="${XHS_COOKIE_STRING:-}"

if [[ -z "$COOKIE_STRING" ]]; then
  CONFIG_FILE="${HOME}/.config/redbook/cookie-string"
  if [[ -f "$CONFIG_FILE" ]]; then
    COOKIE_STRING="$(cat "$CONFIG_FILE")"
  fi
fi

if [[ -z "$COOKIE_STRING" ]]; then
  # Try browser extraction (macOS only)
  if redbook whoami --json 2>/dev/null | grep -q "user_id"; then
    exit 0
  fi
  echo "redbook: no cookie string configured and browser extraction failed" >&2
  echo "Run: redbook-setup.md for one-time setup instructions" >&2
  exit 1
fi

if redbook whoami --cookie-string "$COOKIE_STRING" --json 2>/dev/null | grep -q "user_id"; then
  exit 0
else
  echo "redbook: cookie string found but auth failed — cookies may be expired" >&2
  exit 1
fi

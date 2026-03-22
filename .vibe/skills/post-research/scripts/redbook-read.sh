#!/usr/bin/env bash
# redbook-read.sh — Tier 0 Red Note fetch wrapper
#
# Reads a Xiaohongshu post using the redbook CLI with browser-cookie auth.
# Credentials are OPTIONAL — if missing, exits with code 2 so the caller
# can fall through to Tier 1 (Jina Reader).
#
# Usage:
#   ./redbook-read.sh <xiaohongshu-url>          # plain output
#   ./redbook-read.sh <xiaohongshu-url> --json   # JSON output
#
# Exit codes:
#   0 — success
#   2 — not configured (caller should skip to Tier 1)
#   1 — other error
#
# Credential resolution order:
#   1. XHS_A1 + XHS_WEB_SESSION env vars  (or XHS_COOKIE_STRING combined)
#   2. .env file in skill root (.vibe/skills/post-research/.env)
#   3. Browser extraction (macOS Chrome)
#
# One-time setup: see references/redbook-setup.md

set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$SKILL_ROOT/.env"

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Usage: redbook-read.sh <url> [--json]" >&2
  exit 1
fi

EXTRA_ARGS=("${@:2}")

# Source .env if present
if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    key="${key//[[:space:]]/}"
    value="${value//[[:space:]]/}"
    case "$key" in
      XHS_A1|XHS_WEB_SESSION|XHS_COOKIE_STRING) export "$key=$value" ;;
    esac
  done < "$ENV_FILE"
fi

# Build cookie string
COOKIE_STRING="${XHS_COOKIE_STRING:-}"
if [[ -z "$COOKIE_STRING" ]]; then
  A1="${XHS_A1:-}"
  WEB_SESSION="${XHS_WEB_SESSION:-}"
  if [[ -n "$A1" && -n "$WEB_SESSION" ]]; then
    COOKIE_STRING="a1=${A1}; web_session=${WEB_SESSION}"
  fi
fi

# Verify redbook is installed
if ! command -v redbook &>/dev/null; then
  echo "redbook: CLI not installed. Run: npm install -g @lucasygu/redbook" >&2
  exit 2
fi

# Execute with credentials if available, otherwise try browser extraction
if [[ -n "$COOKIE_STRING" ]]; then
  exec redbook read "$URL" --cookie-string "$COOKIE_STRING" \
    "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
else
  # macOS: redbook can extract from Chrome automatically
  # On Linux/headless this will fail — caller should catch and fall through
  exec redbook read "$URL" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
fi

#!/usr/bin/env bash
# redbook-check.sh — verify Red Note auth for Tier 0 access
#
# Credentials are OPTIONAL. Exit codes:
#   0 — authenticated and working   (proceed with Tier 0)
#   2 — not configured              (skip Tier 0, fall through to Tier 1)
#   3 — configured but auth failed  (skip Tier 0, cookies may be expired)
#   1 — script error
#
# Credential resolution order:
#   1. XHS_A1 + XHS_WEB_SESSION env vars  (or XHS_COOKIE_STRING combined)
#   2. .env file in skill root     (.vibe/skills/post-research/.env)
#   3. Browser extraction          (macOS Chrome — no config needed)

set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$SKILL_ROOT/.env"

# Source .env if present (only load XHS_* vars)
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

# Build cookie string from individual vars if not already set as combined
COOKIE_STRING="${XHS_COOKIE_STRING:-}"
if [[ -z "$COOKIE_STRING" ]]; then
  A1="${XHS_A1:-}"
  WEB_SESSION="${XHS_WEB_SESSION:-}"
  if [[ -n "$A1" && -n "$WEB_SESSION" ]]; then
    COOKIE_STRING="a1=${A1}; web_session=${WEB_SESSION}"
  fi
fi

# Case 1: no credentials configured — try browser extraction
if [[ -z "$COOKIE_STRING" ]]; then
  if command -v redbook &>/dev/null && redbook whoami --json 2>/dev/null | grep -q "user_id"; then
    echo "redbook: authenticated via browser extraction" >&2
    exit 0
  fi
  echo "redbook: Tier 0 not configured (XHS_A1 / XHS_WEB_SESSION not set)" >&2
  echo "  → Skipping to Tier 1. To enable: see references/redbook-setup.md" >&2
  exit 2
fi

# Case 2: credentials present — verify they work
if ! command -v redbook &>/dev/null; then
  echo "redbook: CLI not installed. Run: npm install -g @lucasygu/redbook" >&2
  exit 2
fi

if redbook whoami --cookie-string "$COOKIE_STRING" --json 2>/dev/null | grep -q "user_id"; then
  echo "redbook: authenticated" >&2
  exit 0
else
  echo "redbook: credentials configured but auth failed — cookies may be expired" >&2
  echo "  → Re-extract a1 + web_session from browser and update .env" >&2
  exit 3
fi

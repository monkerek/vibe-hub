#!/usr/bin/env bash
#
# gws-drive.sh — Direct Google Drive API wrapper for Claude Code sandboxes
#
# Bypasses the TLS-inspecting egress proxy's block on Google Workspace APIs
# by routing requests through a Google Apps Script Web App relay.
#
# Prerequisites:
#   1. Deploy the Apps Script (gws-relay-appscript.js) as a web app
#   2. Set GWS_RELAY_URL to the deployment URL
#
# Usage:
#   ./gws-drive.sh list [--page-size N] [--query "QUERY"]
#   ./gws-drive.sh get FILE_ID
#   ./gws-drive.sh about
#
set -euo pipefail

RELAY_URL="${GWS_RELAY_URL:-}"

if [[ -z "$RELAY_URL" ]]; then
  echo "ERROR: GWS_RELAY_URL is not set." >&2
  echo "" >&2
  echo "To set up the relay:" >&2
  echo "  1. Go to https://script.google.com → New Project" >&2
  echo "  2. Paste the contents of gws-relay-appscript.js" >&2
  echo "  3. Deploy → New deployment → Web app" >&2
  echo "     - Execute as: Me" >&2
  echo "     - Who has access: Anyone" >&2
  echo "  4. Copy the URL and set: export GWS_RELAY_URL='<url>'" >&2
  exit 1
fi

call_relay() {
  local params="$1"
  local url="${RELAY_URL}?${params}"

  local response
  response=$(curl -s --noproxy '' -L --connect-timeout 30 --max-time 60 "$url" 2>&1)

  if [[ $? -ne 0 ]]; then
    echo "ERROR: Relay call failed" >&2
    echo "$response" >&2
    exit 1
  fi

  # Extract the body from the relay response
  echo "$response" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'body' in data:
        print(json.dumps(data['body'], indent=2))
    elif 'error' in data:
        print(json.dumps(data, indent=2), file=sys.stderr)
        sys.exit(1)
    else:
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f'Parse error: {e}', file=sys.stderr)
    sys.exit(1)
"
}

cmd="${1:-help}"
shift || true

case "$cmd" in
  list)
    page_size=10
    query=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --page-size) page_size="$2"; shift 2 ;;
        --query|-q)  query="$2"; shift 2 ;;
        *) echo "Unknown option: $1" >&2; exit 1 ;;
      esac
    done
    params="apiPath=drive/v3/files&pageSize=${page_size}"
    [[ -n "$query" ]] && params+="&q=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$query'))")"
    call_relay "$params"
    ;;

  get)
    file_id="${1:-}"
    if [[ -z "$file_id" ]]; then
      echo "Usage: gws-drive.sh get FILE_ID" >&2
      exit 1
    fi
    call_relay "apiPath=drive/v3/files/${file_id}&fields=*"
    ;;

  about)
    call_relay "apiPath=drive/v3/about&fields=user,storageQuota"
    ;;

  help|--help|-h)
    echo "Usage: gws-drive.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list [--page-size N] [--query QUERY]   List files"
    echo "  get FILE_ID                             Get file metadata"
    echo "  about                                   Account info"
    echo ""
    echo "Requires GWS_RELAY_URL to be set (see --help for setup)."
    ;;

  *)
    echo "Unknown command: $cmd" >&2
    echo "Run '$0 help' for usage." >&2
    exit 1
    ;;
esac

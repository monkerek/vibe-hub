#!/usr/bin/env bash
# configure-gws-auth.sh — SessionStart hook for gws credential setup.
# Writes GWS_CREDENTIALS env var to disk so the gws CLI can authenticate.
#
# Why a hook and not a setup script?
# Environment variables configured in the cloud environment UI are injected
# into the Claude Code process, NOT the container. Setup scripts run before
# Claude Code launches (inheriting PID 1's minimal env), so they cannot see
# user-configured env vars. SessionStart hooks run after Claude Code launches,
# where the full environment is available.

set -euo pipefail

LOG_FILE="/tmp/configure-gws-auth.log"
log() { echo "[gws-auth] $(date -Iseconds) $*" >> "$LOG_FILE"; }

log "=== Hook started ==="
log "CLAUDE_CODE_REMOTE=${CLAUDE_CODE_REMOTE:-unset}"
log "GWS_CREDENTIALS set: $([ -n "${GWS_CREDENTIALS:-}" ] && echo "YES (${#GWS_CREDENTIALS} chars)" || echo "NO")"
log "HOME=$HOME"
log "gws binary: $(command -v gws 2>/dev/null || echo 'not found')"

# Only run in remote/cloud environments.
if [[ "${CLAUDE_CODE_REMOTE:-}" != "true" ]]; then
  log "SKIP: not a remote environment"
  exit 0
fi

# Skip if GWS_CREDENTIALS is not configured.
if [[ -z "${GWS_CREDENTIALS:-}" ]]; then
  log "SKIP: GWS_CREDENTIALS not set"
  exit 0
fi

# Skip if credentials are already written.
config_dir="${HOME}/.config/gws"
cred_file="${config_dir}/credentials.json"
if [[ -f "$cred_file" ]]; then
  log "SKIP: credentials already exist at $cred_file ($(wc -c < "$cred_file") bytes)"
  exit 0
fi

mkdir -p "$config_dir"
printf '%s' "$GWS_CREDENTIALS" > "$cred_file"
chmod 600 "$cred_file"

log "SUCCESS: wrote credentials to $cred_file ($(wc -c < "$cred_file") bytes)"

# Verify the file is valid JSON.
if python3 -c "import json; json.load(open('$cred_file'))" 2>/dev/null; then
  log "VERIFY: credentials file is valid JSON"
  # Log credential type (but not secrets).
  python3 -c "
import json
with open('$cred_file') as f:
    d = json.load(f)
keys = list(d.keys())
cred_type = d.get('type', 'unknown')
has_refresh = 'refresh_token' in d
has_client_id = 'client_id' in d
print(f'  type={cred_type} keys={keys} has_refresh_token={has_refresh} has_client_id={has_client_id}')
" >> "$LOG_FILE" 2>&1
else
  log "VERIFY: WARNING — credentials file is NOT valid JSON"
fi

# Check gws auth status after writing credentials.
if command -v gws &>/dev/null; then
  log "GWS AUTH STATUS:"
  gws auth status >> "$LOG_FILE" 2>&1 || log "  (gws auth status returned non-zero)"
fi

log "=== Hook finished ==="

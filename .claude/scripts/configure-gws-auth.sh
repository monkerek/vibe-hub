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

# Only run in remote/cloud environments.
if [[ "${CLAUDE_CODE_REMOTE:-}" != "true" ]]; then
  exit 0
fi

# Skip if GWS_CREDENTIALS is not configured.
if [[ -z "${GWS_CREDENTIALS:-}" ]]; then
  exit 0
fi

# Skip if credentials are already written.
config_dir="${HOME}/.config/gws"
cred_file="${config_dir}/credentials.json"
if [[ -f "$cred_file" ]]; then
  exit 0
fi

mkdir -p "$config_dir"
printf '%s' "$GWS_CREDENTIALS" > "$cred_file"
chmod 600 "$cred_file"

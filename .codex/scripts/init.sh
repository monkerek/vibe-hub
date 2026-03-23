#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update -qq && sudo apt-get install -y -qq gh

npm install -g @googleworkspace/cli

# Fail fast if missing
: "${GWS_CREDENTIALS:?GWS_CREDENTIALS is not set}"

# Persist credentials where gws auto-discovers them.
mkdir -p "$HOME/.config/gws"
cat <<< "$GWS_CREDENTIALS" > "$HOME/.config/gws/credentials.json"
chmod 600 "$HOME/.config/gws/credentials.json"

# Also mirror to an explicit path and export for the current shell.
cat <<< "$GWS_CREDENTIALS" > "$HOME/gws_credentials.json"
chmod 600 "$HOME/gws_credentials.json"
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE="$HOME/gws_credentials.json"

# Verify that gws can actually use the injected credentials.
status_json="$(gws auth status)"
printf '%s' "$status_json" | grep -q '"token_valid": true' \
  || { echo "gws credentials were injected, but authentication is still invalid" >&2; exit 1; }

#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update -qq && sudo apt-get install -y -qq gh

npm install -g @googleworkspace/cli

# Fail fast if missing
: "${GWS_CREDENTIALS:?GWS_CREDENTIALS is not set}"

# Write credentials to a stable home path in Codex Web sandbox.
cat <<< "$GWS_CREDENTIALS" > "$HOME/gws_credentials.json"
chmod 600 "$HOME/gws_credentials.json"

# Ensure gws uses the injected credentials file.
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE="$HOME/gws_credentials.json"

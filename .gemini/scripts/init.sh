#!/bin/bash

# Installing gh (GitHub CLI) - needs sudo for apt-get
sudo apt-get update -qq && sudo apt-get install -y -qq gh

# Install the Google Workspace CLI
npm install -g @googleworkspace/cli

# Write the credentials to a file in the user's home directory instead of /opt/
# Write credentials only if the env var is set (avoids "unbound variable" with set -u).
if [[ -n "${GWS_CREDENTIALS:-}" ]]; then
  echo "$GWS_CREDENTIALS" > "$HOME/gws_credentials.json"
  export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE="$HOME/gws_credentials.json"
else
  echo "[init] WARNING: GWS_CREDENTIALS not set — skipping credentials setup."
fi

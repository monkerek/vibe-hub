#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update -qq
sudo apt-get install -y -qq gh

npm install -g @googleworkspace/cli

# Fail fast if missing
: "${GWS_CREDENTIALS:?GWS_CREDENTIALS is not set}"

# Write where gws automatically looks
mkdir -p "$HOME/.config/gws"
printf '%s' "$GWS_CREDENTIALS" > "$HOME/.config/gws/credentials.json"
chmod 600 "$HOME/.config/gws/credentials.json"

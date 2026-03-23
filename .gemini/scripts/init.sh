#!/bin/bash

# Installing gh (GitHub CLI) - needs sudo for apt-get
sudo apt-get update -qq && sudo apt-get install -y -qq gh

# Install the Google Workspace CLI
npm install -g @googleworkspace/cli

# Write credentials to the default gws config path so authentication
# persists into the session without relying on exported env vars.
if [[ -n "${GWS_CREDENTIALS:-}" ]]; then
  config_dir="${HOME}/.config/gws"
  mkdir -p "$config_dir"
  printf '%s' "$GWS_CREDENTIALS" > "$config_dir/credentials.json"
  chmod 600 "$config_dir/credentials.json"
fi

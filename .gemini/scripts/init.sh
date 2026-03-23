#!/bin/bash

# Installing gh (GitHub CLI) - needs sudo for apt-get
sudo apt-get update -qq && sudo apt-get install -y -qq gh

# Install the Google Workspace CLI
npm install -g @googleworkspace/cli

# Write the credentials to a file in the user's home directory instead of /opt/
echo "$GWS_CREDENTIALS" > $HOME/gws_credentials.json

# Export the path so gws knows where to find it
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE=$HOME/gws_credentials.json

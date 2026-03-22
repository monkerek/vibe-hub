#!/usr/bin/env bash
# init.sh — Session startup dependency installer for Claude Code web sandbox.
# Installs CLI tools in the background and reports when done.
# Usage: run this script directly; it backgrounds the heavy work.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/vibe-hub-init.log"

# ---------------------------------------------------------------------------
# Environment gate — only run inside the Claude Code web sandbox.
# ---------------------------------------------------------------------------
if [[ "${CLAUDECODE:-}" != "1" ]] || [[ "${CLAUDE_CODE_REMOTE:-}" != "true" ]]; then
  echo "[init] Not running in Claude Code web sandbox — skipping dependency install."
  exit 0
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log() { echo "[init] $*" >> "$LOG_FILE"; }

command_exists() { command -v "$1" &>/dev/null; }

# ---------------------------------------------------------------------------
# Installers — each function installs one tool if it is missing.
# Add new tools here following the same pattern.
# ---------------------------------------------------------------------------
install_gh() {
  if command_exists gh; then
    log "gh is already installed ($(gh --version | head -1))."
    return 0
  fi

  log "Installing gh (GitHub CLI)..."
  if (
    set -e
    # Use the official apt repository
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | dd of=/etc/apt/keyrings/githubcli-archive-keyring.gpg 2>/dev/null
    chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      | tee /etc/apt/sources.list.d/github-cli.list >/dev/null
    apt-get update -qq -o Dir::Etc::sourcelist=/etc/apt/sources.list.d/github-cli.list >/dev/null 2>&1
    apt-get install -y -qq gh >/dev/null 2>&1
  ); then
    # Authenticate if a token is available via env
    if [[ -n "${GH_TOKEN:-}" ]] || [[ -n "${GITHUB_TOKEN:-}" ]]; then
      log "gh: authenticating with provided token..."
      gh auth status &>/dev/null || true
    fi
    log "gh installed successfully ($(gh --version | head -1))."
  else
    log "WARNING: gh installation failed — continuing without it."
  fi
}

install_gws() {
  if command_exists gws; then
    log "gws is already installed ($(gws --version 2>/dev/null || echo 'unknown version'))."
    return 0
  fi

  log "Installing gws (Google Workspace CLI)..."
  if npm install -g @googleworkspace/cli --loglevel=error >> "$LOG_FILE" 2>&1; then
    log "gws installed successfully ($(gws --version 2>/dev/null || echo 'installed'))."
  else
    log "WARNING: gws installation failed — continuing without it."
  fi
}

# ---------------------------------------------------------------------------
# Main — run all installs in a single background subshell so the session
# is never blocked.  Uses `set +e` so one failing tool doesn't abort the rest.
# ---------------------------------------------------------------------------
main() {
  log "=== Starting dependency installation ($(date -Iseconds)) ==="

  install_gh
  install_gws

  log "=== Dependency installation complete ($(date -Iseconds)) ==="
}

# Run main in the background; output goes only to the log file.
main &
INIT_PID=$!

# Print a non-blocking notice and let the background job finish on its own.
echo "[init] Installing dependencies in background (pid $INIT_PID). Tail $LOG_FILE to follow progress."

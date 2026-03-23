#!/usr/bin/env bash
# init.sh — Setup script for Claude Code web sandbox environments.
# Installs CLI tools synchronously before the session starts.
# Intended for use in the "Setup script" field of the cloud environment UI.
# See: https://docs.anthropic.com/en/docs/claude-code/claude-code-on-the-web#setup-scripts

set -uo pipefail

LOG_FILE="/tmp/vibe-hub-init.log"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log() { echo "[init] $*" | tee -a "$LOG_FILE"; }

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
  if apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq gh >/dev/null 2>&1; then
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

  local arch
  arch="$(uname -m)"
  local asset="gws-${arch}-unknown-linux-gnu.tar.gz"
  local url="https://github.com/googleworkspace/cli/releases/latest/download/${asset}"
  local tmp_dir
  tmp_dir="$(mktemp -d)" || { log "WARNING: mktemp failed — skipping gws."; return 1; }

  log "Installing gws (Google Workspace CLI)..."

  # Try curl first (works for public releases without auth).
  # Fall back to gh release download if curl is unavailable or fails.
  local downloaded=false
  if command_exists curl; then
    if curl -fsSL -o "$tmp_dir/$asset" "$url" 2>>"$LOG_FILE"; then
      downloaded=true
    fi
  fi
  if [[ "$downloaded" != true ]] && command_exists gh; then
    if gh release download --repo googleworkspace/cli --pattern "$asset" --dir "$tmp_dir" >> "$LOG_FILE" 2>&1; then
      downloaded=true
    fi
  fi

  if [[ "$downloaded" == true ]] \
     && tar xzf "$tmp_dir/$asset" -C "$tmp_dir" 2>>"$LOG_FILE"; then
    local extracted_dir="$tmp_dir/gws-${arch}-unknown-linux-gnu"
    if [[ -f "$extracted_dir/gws" ]]; then
      cp "$extracted_dir/gws" /usr/local/bin/gws
      chmod +x /usr/local/bin/gws
      log "gws installed successfully ($(gws --version 2>/dev/null || echo 'installed'))."
    else
      log "WARNING: gws binary not found in release archive — skipping."
    fi
  else
    log "WARNING: gws download/extraction failed — continuing without it."
  fi
  rm -rf "$tmp_dir"
}

# ---------------------------------------------------------------------------
# Main — run all installs synchronously.  Setup scripts must complete before
# the session starts.  Individual failures are logged but do not abort the rest.
# ---------------------------------------------------------------------------
: > "$LOG_FILE"
log "=== Starting dependency installation ($(date -Iseconds)) ==="

install_gh
install_gws

log "=== Dependency installation complete ($(date -Iseconds)) ==="

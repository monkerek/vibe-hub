# Codebase Research Examples

## ✅ High-Quality Example: `gws`

**Digest Path**: `digest/tools/gws-digest-20260321.md`

### 🏗 High-Level Architecture
`gws` employs a **two-phase argument parsing** strategy:
1. **Bootstrap Phase**: Parses `argv` to identify the target service (e.g., `drive`).
2. **Discovery Phase**: Fetches the service's Discovery Document, builds a recursive `clap::Command` tree dynamically, and re-parses the full argument list.

### 📝 Observations & Patterns
- **Dynamic Command Surface**: Prevents the CLI from becoming stale; it is always in sync with Google's backend.
- **Structured Error Output**: Errors are returned as JSON, allowing agents to programmatically handle failures.

---

## ❌ Low-Quality Example (Avoid)

**Issue**: Too generic, lacks technical depth.

### 🏗 High-Level Architecture
It is a CLI written in Rust that calls Google APIs.

### 📝 Observations & Patterns
- It is fast.
- It uses JSON.

---

## ✅ High-Quality Example: `lazygit`

**Digest Path**: `digest/tools/lazygit-digest-20260321.md`

### 🏗 High-Level Architecture
Lazygit follows a modular Go structure:
- `pkg/gui`: Implements the terminal user interface, organizing views, contexts, and controllers.
- `pkg/commands`: Manages interaction with the underlying git system.

### 📝 Observations & Patterns
- **High Customizability**: Extensive support for user-defined keybindings and themes via YAML.
- **Human-Centric Design**: Focuses on making complex git operations intuitive and fast.

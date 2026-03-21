# gws (Google Workspace CLI) Digest

- **URL**: https://github.com/googleworkspace/cli
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Rust
- **Frameworks/Libraries**: `clap` (CLI), `reqwest` (HTTP), `serde` (JSON), `tokio` (Async), `aes-gcm` (Encryption)
- **Distribution**: Node.js (npm), Homebrew, Nix, Rust (cargo)

## 🚀 Key Features
- **Dynamic API Discovery**: Unlike traditional CLIs, `gws` reads Google's Discovery Service at runtime to build its command surface, ensuring zero-day support for new API methods.
- **Agent-Ready JSON**: Every response is structured JSON, optimized for consumption by LLM agents.
- **40+ Built-in Skills**: Includes a library of standardized `SKILL.md` files for common personas (Project Manager, Researcher) and recipes (Weekly Digest, Email Triage).
- **AES-256-GCM Security**: Encrypts OAuth credentials locally to prevent unauthorized access to sensitive Workspace tokens.
- **Schema Introspection**: `gws schema` allows agents to introspect API requirements, types, and defaults without external documentation.

## 🏗 High-Level Architecture
`gws` employs a **two-phase argument parsing** strategy:
1. **Bootstrap Phase**: Parses `argv` to identify the target service (e.g., `drive`).
2. **Discovery Phase**: Fetches the service's Discovery Document, builds a recursive `clap::Command` tree dynamically, and re-parses the full argument list.
The system is designed with a "security-first" approach for AI agents, implementing strict path traversal validation and URL encoding for all user-supplied inputs.

## 📂 Directory Structure (Core)
- `src/`: Core Rust implementation.
  - `main.rs`: Entry point and two-phase parsing logic.
  - `discovery.rs`: Discovery Document models and caching.
  - `commands.rs`: Recursive command builder from API resources.
  - `executor.rs`: HTTP request execution and response handling.
- `skills/`: Standardized agent instructions.
  - `gws-*/`: Raw API skill mappings.
  - `persona-*/`: Role-based agent instructions.
  - `recipe-*/`: Task-oriented automation workflows.
- `registry/`: (Internal) Service registry configurations.

## 🎯 Main Entry Points
- `src/main.rs`: Orchestrates the bootstrap and re-parsing phases.
- `gws auth login`: Handles OAuth2 authentication flow.
- `gws <service> <resource> <method>`: The primary dynamic command pattern.

## 📝 Observations & Patterns
- **Dynamic Command Surface**: Prevents the CLI from becoming stale; it is always in sync with Google's backend.
- **Structured Error Output**: Errors are returned as JSON, allowing agents to programmatically handle failures (e.g., rate limiting or 403 Forbidden).
- **Adversarial Input Protection**: Explicit validation against path traversal and control characters, recognizing that AI agents may pass untrusted data.

## 🛠 How to Install
```bash
npm install -g @googleworkspace/cli
# or
brew install googleworkspace-cli
```

# Vibe Hub

A personal project for researching and learning about various codebases, tools, and agentic workflows. This repository is optimized for multi-agent collaboration, supporting Gemini CLI, Claude Code, and Codex CLI with a unified, cross-platform infrastructure.

## 📂 Project Structure

- **`.vibe/`**: The core "Source of Truth" for agentic intelligence and context.
  - **`VIBE.md`**: Centralized project context, mandates, and SOPs.
  - **`skills/`**: Standardized agent skills.
- **`.gemini/`, `.claude/`, `.codex/`**: Platform-specific entry points symlinked to `.vibe/`.
- **`digest/`**: A structured directory containing research digests (categorized by type).
- **`.config/`**: Managed system configurations (dotfiles) for Ghostty, Starship, etc.

## 🛡️ Multi-Agent Context (Vibe Protocol)

All agent platforms reference the same central source of truth via platform-specific hidden directories:

| Platform | Entry Point | Source File | Standard |
| :--- | :--- | :--- | :--- |
| **Universal** | `.vibe/VIBE.md` | `.vibe/VIBE.md` | Vibe Hub Protocol |
| **Gemini CLI** | `.gemini/GEMINI.md` | `.vibe/VIBE.md` | [Gemini MD](https://geminicli.com/docs/cli/gemini-md/) |
| **Claude Code** | `.claude/CLAUDE.md` | `.vibe/VIBE.md` | [Claude Memory](https://code.claude.com/docs/en/memory) |
| **Codex CLI** | `.codex/AGENTS.md` | `.vibe/VIBE.md` | [Codex Agents](https://developers.openai.com/codex/guides/agents-md) |

## ⚖️ Core Mandates

1. **Naming**: ALWAYS use `aaa-bbb.cc` (kebab-case) for all filenames.
2. **Digests**: Research digests MUST follow the `<repo-name>-digest-YYYYMMDD.md` pattern.
3. **Workflow**: Use the 3-phase research workflow (Discovery -> Prefetch -> Synthesize) documented in `.vibe/VIBE.md`.
4. **Isolation**: Use `git worktree` for tasks to avoid overlapping with other agents.

## 🛠 Skills

- **`codebase-research`**: Iterative repository analysis and architectural mapping.
- **`doc-research`**: Systematic evaluation of academic papers and technical articles.
- **`no-gaslighting`**: Trust-driven debugging and root cause analysis.
- **`skill-authoring`**: Enforces project-specific standards for all new skills.

## 🚀 Research Digests

Refer to the tables in individual `digest/` subdirectories or the git history for the full list of research.

## ⚖️ License
MIT

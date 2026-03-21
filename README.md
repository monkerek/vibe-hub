# Vibe Hub

A personal project for researching and learning about various codebases, tools, and agentic workflows. This repository is optimized for multi-agent collaboration, supporting Gemini CLI, Claude Code, and Codex CLI with unified context and shared skills.

## 📂 Project Structure

- **`.vibe/`**: Shared "source of truth" for agentic intelligence.
  - **`skills/`**: Standardized agent skills (symlinked for all agent platforms).
  - **`README.md`**: Guide for cross-agent setup.
- **`.gemini/`, `.claude/`, `.codex/`**: Platform-specific directories containing symlinks to shared skills and context.
- **`digest/`**: A structured directory containing research digests.
  - **`skills/`**, **`tools/`**, **`workflow/`**, **`paper/`**: Research categorized by type.
- **`.config/`**: Managed system configurations (dotfiles) for Ghostty, Starship, etc.

## 🛡️ Multi-Agent Context (Vibe Protocol)

The project uses a unified context system. **`VIBE.md`** is the single source of truth, symlinked to platform-specific entry points:

| Platform | Entry Point | Source File | Standard |
| :--- | :--- | :--- | :--- |
| **Universal** | `VIBE.md` | `VIBE.md` | Vibe Hub Protocol |
| **Gemini CLI** | `GEMINI.md` | `VIBE.md` | [Gemini MD](https://geminicli.com/docs/cli/gemini-md/) |
| **Claude Code** | `CLAUDE.md` | `VIBE.md` | [Claude Memory](https://code.claude.com/docs/en/memory) |
| **Codex CLI** | `AGENTS.md` | `VIBE.md` | [Codex Agents](https://developers.openai.com/codex/guides/agents-md) |

## ⚖️ Core Mandates

1. **Naming**: ALWAYS use `aaa-bbb.cc` (kebab-case) for all filenames.
2. **Digests**: Research digests MUST follow the `<repo-name>-digest-YYYYMMDD.md` pattern.
3. **Workflow**: Use the 3-phase research workflow (Discovery -> Prefetch -> Synthesize) documented in `VIBE.md`.
4. **Isolation**: Use `git worktree` for tasks to avoid overlapping with other agents.

## 🛠 Skills

- **`codebase-research`**: Iterative repository analysis and architectural mapping.
- **`doc-research`**: Systematic evaluation of academic papers and technical articles.
- **`no-gaslighting`**: Trust-driven debugging and root cause analysis.
- **`skill-authoring`**: Enforces project-specific standards for all new skills.

## 🚀 Research Digests

Refer to the tables in individual `digest/` subdirectories or the main `README.md` history for the full list of research.

## ⚖️ License
MIT

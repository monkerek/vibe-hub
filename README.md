# Vibe Hub

A personal project for researching and learning about various codebases, tools, and agentic workflows. This repository is optimized for multi-agent collaboration, supporting Gemini CLI, Claude Code, and Codex CLI with a unified, cross-platform infrastructure.

## 📂 Project Structure

- **`.vibe/`**: The core "Source of Truth" for agentic intelligence and context.
  - **`VIBE.md`**: Centralized project context, mandates, and SOPs.
  - **`skills/`**: Standardized agent skills.
- **`.gemini/`, `.claude/`, `.codex/`**: Platform-specific entry points symlinked to `.vibe/`.
- **`.agents/`**: Shared Gemini-compatible alias for workspace skills.
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

The shared context follows the platform context-file guidance above:
- Gemini CLI treats `GEMINI.md` as project context and documents workspace discovery rules in its Gemini MD guide.
- Claude Code uses `CLAUDE.md` for persistent project instructions and documents loading behavior in its memory guide.
- Codex CLI uses `AGENTS.md` for workspace-specific instructions.

## ⚖️ Core Mandates

1. **Naming**: Default to kebab-case for repository files and directories. Required platform entrypoints keep their mandated names: `VIBE.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `SKILL.md`.
2. **Digests**: Research digests MUST follow the `<repo-name>-digest-YYYYMMDD.md` pattern.
3. **Workflow**: Use the 3-phase research workflow (Discovery -> Prefetch -> Synthesize) documented in `.vibe/VIBE.md`.
4. **Isolation**: Use `git worktree` for tasks to avoid overlapping with other agents.

## 🛠 Skills

Shared skills live in `.vibe/skills/` and are surfaced to all agents through `.codex/skills`, `.claude/skills`, `.gemini/skills`, and the Gemini-compatible `.agents/skills` alias.

The packaging follows the documented skill format for Claude Code and Gemini CLI:
- Claude Code skills: <https://code.claude.com/docs/en/skills>
- Gemini CLI skills: <https://geminicli.com/docs/cli/skills/>

Each skill is a directory with a required `SKILL.md` entrypoint and optional `references/`, `templates/`, and `scripts/` folders.

- **`processing-repositories`**: Iterative repository analysis and architectural mapping.
- **`researching-documents`**: Systematic evaluation of academic papers and technical articles.
- **`debugging-with-wisdom`**: Trust-driven debugging and root cause analysis.
- **`authoring-new-skills`**: Enforces project-specific standards for all new skills.

## 🚀 Research Digests

Refer to the tables in individual `digest/` subdirectories or the git history for the full list of research.

## ⚖️ License
MIT

# .vibe — Shared Agent Infrastructure

This directory contains the core "source of truth" for agentic intelligence in the Vibe Hub project. It is designed to be platform-agnostic, supporting Gemini CLI, Claude Code, and Codex CLI.

## 📂 Structure

- **`skills/`**: Standardized agent skills (e.g., `processing-repositories.md`, `debugging-with-wisdom.md`).

## 🚀 Setup for Different Agents

To ensure your specific agent CLI can find these skills, use the following symlink pattern:

### Gemini CLI
```bash
mkdir -p .gemini
ln -sf ../.vibe/skills .gemini/skills
```

### Claude Code
```bash
mkdir -p .claude
ln -sf ../.vibe/skills .claude/skills
```

### Codex CLI
```bash
mkdir -p .codex
ln -sf ../.vibe/skills .codex/skills
```

## ⚖️ Standards

All skills in this directory MUST follow the [Claude agent skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) and Vibe Hub's local mandates (kebab-case naming, gerund titles). Refer to `.vibe/skills/skill-authoring/authoring-new-skills.md` for the mandatory authoring SOP.

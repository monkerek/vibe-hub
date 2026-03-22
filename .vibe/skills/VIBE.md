# Skills Context — VIBE.md

This directory contains the project's agentic intelligence. All skills here MUST follow Vibe Hub's cross-agent standards.

## ⚖️ Core Standards
1. **Naming**: Use kebab-case gerunds for skill directories (e.g., `researching-repositories/`) and keep the required entrypoint filename `SKILL.md`.
2. **Structure**:
    - Include YAML frontmatter in `SKILL.md`.
    - Include a third-person `description`.
    - Include a `## 🚀 Workflow Checklist`.
    - Use `<HARD-GATE>` for critical validation steps.
3. **Compatibility**: Every skill MUST be a self-contained directory with `SKILL.md` as the entrypoint so it is discoverable from `.codex/skills/`, `.claude/skills/`, `.gemini/skills/`, and the Gemini-compatible `.agents/skills/` alias.
4. **Context Files**: Individual skill directories DO NOT need platform-specific context files (e.g., `.gemini/GEMINI.md` linking to `SKILL.md`). Context files are for directory-level guidance (like this `VIBE.md`), not for the skills themselves. This root `.vibe/skills/` directory carries local context in `VIBE.md`, so it exposes platform-specific symlinks:
    - **`.gemini/GEMINI.md`** -> `VIBE.md`
    - **`.claude/CLAUDE.md`** -> `VIBE.md`
    - **`.codex/AGENTS.md`** -> `VIBE.md`

## 🛡️ Best Practices
Refer to `.vibe/skills/authoring-new-skills/SKILL.md` for the mandatory creation workflow. Follow the published Claude Code and Gemini CLI skill guidelines linked from the repository `README.md`.

## 📂 Skill References
- @./processing-repositories/SKILL.md
- @./researching-documents/SKILL.md
- @./debugging-with-wisdom/SKILL.md
- @./authoring-new-skills/SKILL.md

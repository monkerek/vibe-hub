# Skills Context — VIBE.md

This directory contains the project's agentic intelligence. All skills here MUST follow Vibe Hub's cross-agent standards.

## ⚖️ Core Standards
1. **Naming**: Use concise kebab-case skill directories (e.g., `repo-research/`) and keep the required entrypoint filename `SKILL.md`.
2. **Structure**:
    - Include YAML frontmatter in `SKILL.md`.
    - Include a third-person `description`.
    - Include a `## 🚀 Workflow Checklist`.
    - Use `<HARD-GATE>` for critical validation steps.
3. **Compatibility**: Every skill MUST be a self-contained directory with `SKILL.md` as the entrypoint so it is discoverable from `.codex/skills/`, `.claude/skills/`, `.gemini/skills/`, and the Gemini-compatible `.agents/skills/` alias.
4. **Context Files**: When a skill directory carries local context in `VIBE.md`, it MUST also expose the platform-specific symlinks in hidden directories:
    - **`.gemini/GEMINI.md`** -> `VIBE.md`
    - **`.claude/CLAUDE.md`** -> `VIBE.md`
    - **`.codex/AGENTS.md`** -> `VIBE.md`

## 🛡️ Best Practices
Refer to `.vibe/skills/skill-author/SKILL.md` for the mandatory creation workflow. Follow the published Claude Code and Gemini CLI skill guidelines linked from the repository `README.md`.

## 📂 Skill References
- @./repo-research/SKILL.md
- @./doc-research/SKILL.md
- @./gaslighting/SKILL.md
- @./skill-author/SKILL.md

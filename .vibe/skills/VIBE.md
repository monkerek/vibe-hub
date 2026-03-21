# Skills Context — VIBE.md

This directory contains the project's agentic intelligence. All skills here MUST follow Vibe Hub's cross-agent standards.

## ⚖️ Core Standards
1. **Naming**: Use kebab-case gerunds (e.g., `researching-repos.md`).
2. **Structure**: 
    - Include a third-person `description` in YAML frontmatter.
    - Include a `## 🚀 Workflow Checklist`.
    - Use `<HARD-GATE>` for critical validation steps.
3. **Compatibility**: Every skill folder MUST be accompanied by platform-specific symlinks if it contains its own context.

## 🛡️ Best Practices
Refer to `.vibe/skills/skill-authoring/authoring-new-skills.md` for the mandatory creation workflow. Follow the [Claude agent skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

## 📂 Skill References
- @./codebase-research/processing-repositories.md
- @./doc-research/researching-documents.md
- @./no-gaslighting/debugging-with-wisdom.md
- @./skill-authoring/authoring-new-skills.md

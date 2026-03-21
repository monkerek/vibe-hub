---
name: authoring-new-skills
description: Enforces project-specific standards for shared Vibe Hub skills. Use this alongside the built-in skill authoring guidance to create or update cross-agent-compatible skill packages.
---

# Authoring New Skills (Vibe Hub)

## Overview

This meta-skill ensures that every skill added to Vibe Hub is consistent, professional, and follows the highest standards for agentic workflows. It extends the built-in `skill-creator` by enforcing local conventions across Codex CLI, Claude Code, and Gemini CLI.

## 🚀 Creation Checklist

You MUST follow this checklist when creating a new skill:

1. [ ] **Naming**: Use a gerund, kebab-case directory name (e.g., `processing-files/`) and keep the required `SKILL.md` entrypoint inside it.
2. [ ] **Frontmatter**:
    - [ ] `name`: Use the kebab-case identifier.
    - [ ] `description`: Use third-person language and describe when the skill should trigger.
3. [ ] **Structure**:
    - [ ] Put the main instructions in `SKILL.md`.
    - [ ] Include an `## Overview` section.
    - [ ] Include a `## 🚀 Workflow Checklist` with copyable `[ ]` items.
    - [ ] Use `<HARD-GATE>` blocks for fragile or critical steps.
    - [ ] Include an `## 📝 Anti-Patterns` section to prevent common mistakes.
4. [ ] **Progressive Disclosure**: Keep `SKILL.md` under 500 lines. Move large lists, templates, and long examples into `references/`, `templates/`, or `assets/`.
5. [ ] **Cross-Agent Discovery**: Confirm the skill works from `.codex/skills/`, `.claude/skills/`, `.gemini/skills/`, and `.agents/skills/`.
6. [ ] **Validation**: Verify naming with `ls -R` and `grep`, and confirm the bundled references mentioned in `SKILL.md` actually exist.

<HARD-GATE>
Do NOT finalize a new or updated skill until the directory exposes `SKILL.md`, every referenced support file exists, and the package is discoverable through the shared skill symlinks.
</HARD-GATE>

## 📝 Anti-Patterns

- Duplicating the main instructions across multiple markdown entrypoints instead of using a single `SKILL.md`.
- Writing naming rules that conflict with mandatory platform filenames.
- Referencing support files from `SKILL.md` without adding them to the skill directory.

## 📂 Resources

- The built-in `skill-creator` skill for general skill authoring guidance.
- The root `README.md` for the linked Claude Code, Gemini CLI, and Codex CLI documentation.

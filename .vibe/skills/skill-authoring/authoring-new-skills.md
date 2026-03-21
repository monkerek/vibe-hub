---
name: authoring-new-skills
description: Enforces project-specific standards (kebab-case, gerunds, SOPs) for Vibe Hub skills. Use this as the local "Source of Truth" alongside the built-in `skill-creator` for general authoring guidance.
---

# Authoring New Skills (Vibe Hub)

## Overview

This meta-skill ensures that every skill added to Vibe Hub is consistent, professional, and follows the highest standards for agentic workflows. It **extends** the built-in `skill-creator` by enforcing local conventions.

## 🚀 Creation Checklist

You MUST follow this checklist when creating a new skill:

1. [ ] **Naming**: Use a kebab-case filename (e.g., `processing-files.md`). The name should be a **gerund** (e.g., `researching-repos` instead of `repo-research`).
2. [ ] **Frontmatter**:
    - [ ] `name`: Use the kebab-case identifier.
    - [ ] `description`: Use **third-person** (e.g., "Analyzes code" not "I analyze code"). Focus on triggers (when to use it).
3. [ ] **Structure**:
    - [ ] Include an `# Overview` section.
    - [ ] Include a `## Workflow Checklist` with copyable `[ ]` items.
    - [ ] Use **Hard-Gates** (`<HARD-GATE>`) for fragile or critical steps.
    - [ ] Include an `## Anti-Patterns` section to prevent common mistakes.
4. [ ] **Progressive Disclosure**: Keep the main file under 500 lines. Move large lists (mappings, templates) to a `references/` sub-folder.
5. [ ] **Cross-Agent Compatibility**: Every skill folder MUST include:
    - [ ] `VIBE.md`: Local context for the skill.
    - [ ] `.gemini/GEMINI.md` -> `../VIBE.md`
    - [ ] `.claude/CLAUDE.md` -> `../VIBE.md`
    - [ ] `.codex/AGENTS.md` -> `../VIBE.md`
6. [ ] **Validation**: Include a verification step to ensure the skill works as intended.

---

## 🛠 SKILL.md Template

```markdown
---
name: gerund-naming-convention
description: Third-person description stating what the skill does and when to trigger it.
---

# Title of the Skill

## Overview
Brief explanation of the skill's purpose.

## 🚀 Workflow Checklist
1. [ ] Step one...
2. [ ] Step two...

<HARD-GATE>
Critical instruction that must be verified before proceeding.
</HARD-GATE>

## 📝 Anti-Patterns
- What NOT to do.

## 📂 Resources
- [Link to reference/reference-file.md]
```

## 📝 Pro-Tips for Vibe Hub
- **General Guidance**: Refer to the built-in `skill-creator` (`/skills activate skill-creator`) for foundational principles.
- **File Extensions**: Use `.md` for skills and references, `.cjs` or `.py` for scripts.
- **Naming Convention**: Strictly enforce `aaa-bbb.cc` (kebab-case).
- **Sub-folders**: Use `references/`, `scripts/`, and `assets/` to organize complex skills.

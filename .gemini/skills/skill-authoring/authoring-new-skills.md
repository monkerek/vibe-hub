---
name: authoring-new-skills
description: Guides the creation and optimization of agent skills for the Vibe Hub project. Enforces Claude best practices, kebab-case naming, gerund-based titles, and structured SOPs with hard-gates.
---

# Authoring New Skills

## Overview

This meta-skill ensures that every skill added to Vibe Hub is consistent, professional, and follows the highest standards for agentic workflows. It is based on the [Claude Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

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
5. [ ] **Validation**: Include a verification step to ensure the skill works as intended.

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
- **File Extensions**: Use `.md` for skills and references, `.cjs` or `.py` for scripts.
- **Naming Convention**: Strictly enforce `aaa-bbb.cc` (kebab-case).
- **Sub-folders**: Use `references/`, `scripts/`, and `assets/` to organize complex skills.

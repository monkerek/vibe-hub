---
name: skill-author
description: Creates and enforces Vibe Hub skill standards. TRIGGER when: user asks to create a new skill, scaffold a skill directory, or audit/improve an existing skill's structure. DO NOT TRIGGER when: user wants to invoke or use an existing skill.
---

# Skill Author — Vibe Hub

## Overview

This meta-skill governs the creation of new Vibe Hub skills. It enforces local project conventions (kebab-case naming, SKILL.md entrypoint, cross-agent symlinks, HARD-GATEs) and extends the built-in `skill-creator` with project-specific standards.

**Source of truth**: `.vibe/skills/<name>/` → symlinked into `.claude/skills/`, `.codex/skills/`, `.gemini/skills/`.

---

## 🚀 Creation Checklist

Follow every phase in order. Do NOT skip or reorder steps.

### Phase 1 — Scaffold

1. [ ] **Name**: Choose a concise kebab-case identifier (e.g., `repo-research`). Maximum 3 words.
2. [ ] **Directory**: Create `.vibe/skills/<name>/` as the source of truth.
3. [ ] **SKILL.md**: Create `.vibe/skills/<name>/SKILL.md` using the template below.

### Phase 2 — Author

4. [ ] **Frontmatter** — include both fields:
   - [ ] `name`: kebab-case identifier matching the directory name.
   - [ ] `description`: Third-person. Include `TRIGGER when:` and `DO NOT TRIGGER when:` clauses so Claude selects this skill automatically.
5. [ ] **Required sections** (in this order):
   - [ ] `## Overview` — what the skill does and why it exists.
   - [ ] `## 🚀 Workflow Checklist` — numbered `[ ]` steps the agent executes.
   - [ ] `<HARD-GATE>` blocks — wrap any step requiring verification before continuing.
   - [ ] `## 📝 Anti-Patterns` — common mistakes to avoid.
   - [ ] `## 📂 Resources` — links to `references/` files or external docs.
6. [ ] **Progressive Disclosure**: Keep SKILL.md under 500 lines. Move large tables, templates, or mappings to `references/<filename>.md`.

### Phase 3 — Cross-Agent Wiring

<HARD-GATE>
Every skill MUST be discoverable by all three agents. Run these commands from the repo root before marking this phase complete:

```bash
SKILL_DIR=".vibe/skills/<name>"

# Platform symlinks inside the skill directory
mkdir -p "$SKILL_DIR/.claude" "$SKILL_DIR/.codex" "$SKILL_DIR/.gemini"
ln -sf ../SKILL.md "$SKILL_DIR/.claude/CLAUDE.md"
ln -sf ../SKILL.md "$SKILL_DIR/.codex/AGENTS.md"
ln -sf ../SKILL.md "$SKILL_DIR/.gemini/GEMINI.md"

# Surface to each CLI's skill discovery path
ln -sf ../../.vibe/skills/<name> .claude/skills/<name>
ln -sf ../../.vibe/skills/<name> .codex/skills/<name>
ln -sf ../../.vibe/skills/<name> .gemini/skills/<name>
```

Verify: `ls -la .claude/skills/<name>/` must show SKILL.md and three hidden platform dirs.
</HARD-GATE>

7. [ ] Symlinks created and verified.

### Phase 4 — Validate

8. [ ] **Self-test**: Invoke the skill with a simple test prompt. Confirm it follows its own checklist.
9. [ ] **Lint** — verify SKILL.md has:
   - [ ] YAML frontmatter with `name` and `description`
   - [ ] `TRIGGER when:` and `DO NOT TRIGGER when:` in the description
   - [ ] All five required sections present
   - [ ] At least one `<HARD-GATE>` if the skill has destructive or external-state-dependent steps
   - [ ] At least one Anti-Pattern entry
10. [ ] **Commit**: `git add .vibe/skills/<name>/ && git commit -m "feat(skills): add <name> skill"`

---

## ⚖️ Standards

| Rule | Requirement |
|------|-------------|
| Naming | Kebab-case, ≤ 3 words |
| Source of truth | `.vibe/skills/<name>/SKILL.md` |
| Entrypoint | `SKILL.md` |
| Description format | Third-person + `TRIGGER when` / `DO NOT TRIGGER when` |
| Cross-agent wiring | All three platform symlinks required |
| File size | < 500 lines per file |
| Scope | One skill = one responsibility; split if checklist > 15 steps |

---

## 🛠 SKILL.md Template

```markdown
---
name: kebab-case-identifier
description: Third-person summary of what this skill does. TRIGGER when: <conditions that should invoke this skill>. DO NOT TRIGGER when: <conditions where this skill is wrong choice>.
---

# Skill Title

## Overview
What this skill does and why it exists. Keep to one paragraph.

## 🚀 Workflow Checklist
1. [ ] Step one — [specific action]
2. [ ] Step two — [specific action]

<HARD-GATE>
What must be verified before this step is considered complete.
DO NOT proceed until this condition is satisfied.
</HARD-GATE>

3. [ ] Step three — [specific action]

## 📝 Anti-Patterns
- **Don't do X**: Reason why this is harmful.
- **Don't skip Y**: Consequence of skipping this step.

## 📂 Resources
- [references/example-file.md](references/example-file.md)
```

---

## 📝 Anti-Patterns

- **Vague description**: "Does research" is not a description. Write `TRIGGER when:` / `DO NOT TRIGGER when:` explicitly — this is how Claude auto-selects the right skill.
- **Skipping cross-agent wiring**: A skill without platform symlinks is invisible to Gemini CLI and Codex. Always run Phase 3.
- **Editing `.claude/skills/<name>/SKILL.md` directly**: Always edit the source at `.vibe/skills/<name>/SKILL.md`. CLI-specific directories should only contain symlinks.
- **Monolithic SKILL.md**: Files over 500 lines slow context loading. Extract large references to `references/`.
- **Missing HARD-GATEs**: Steps that write files, run destructive commands, or depend on external state MUST be gated.
- **Over-scoped skill**: If the workflow checklist exceeds 15 steps, split into sub-skills with focused responsibilities.
- **Missing Anti-Patterns**: Every skill should document what NOT to do — if you can't think of any, you haven't used the skill enough.

---

## 📂 Sub-folder Guide

| Folder | Use when |
|--------|----------|
| `references/` | Large tables, mappings, or data too large for inline SKILL.md |
| `scripts/` | Executable automation (`.cjs`, `.py`, `.sh`) |
| `templates/` | Reusable output formats (e.g., digest templates) |
| `assets/` | Static files, diagrams, or images |

---

## 📂 Resources
- [Built-in skill-creator](/skills activate skill-creator) — foundational principles
- [VIBE.md cross-agent policy](../../VIBE.md)

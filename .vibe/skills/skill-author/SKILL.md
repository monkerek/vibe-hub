---
name: skill-author
description: Creates and enforces Vibe Hub skill standards. TRIGGER when: user asks to create a new skill, scaffold a skill directory, or audit/improve an existing skill's structure. DO NOT TRIGGER when: user wants to invoke or use an existing skill.
---

# Skill Author — Vibe Hub

## Overview

This meta-skill governs the creation of new Vibe Hub skills. It enforces local project conventions (kebab-case naming, SKILL.md entrypoint, cross-agent symlinks, HARD-GATEs) and extends the built-in `skill-creator` with project-specific standards.

**Source of truth**: `.vibe/skills/<name>/` → symlinked into `.claude/skills/`, `.codex/skills/`, `.gemini/skills/`.

**Progressive disclosure model** — skills have three layers:
1. **Metadata** (`name` + `description` in frontmatter) — injected into the system prompt; what triggers the skill.
2. **SKILL.md body** — full instructions loaded when the skill activates.
3. **Bundled resources** (`references/`, `scripts/`, `assets/`) — accessed on demand via `@import` or tool calls.

Write each layer for its audience: the metadata must win the trigger battle; the body must guide execution; resources handle overflow.

---

## ✍️ Writing Principles

Apply these when authoring any section of a SKILL.md:

- **Principle of Lack of Surprise**: the skill MUST do exactly what its name implies — nothing more, nothing less. A user who reads the name should be able to predict the output.
- **Keep prompts lean**: don't over-specify every micro-step. Trust the model. Over-specification creates brittleness and makes skills harder to maintain. Target < 150 words for the body of frequently-loaded skills.
- **Explain the why**: tell the agent *why* it should do something, not just *what*. `"Verify symlinks exist (cross-agent discoverability breaks without them)"` beats `"Verify symlinks exist"`.
- **Generalize from feedback**: when a test case fails, fix the root principle, not just the specific case. Ask "what class of mistake does this represent?"
- **Repeated work is a signal**: if multiple test cases need the same setup step, that step belongs in the skill, not the prompt.
- **Use compliance language for critical steps**: write `MUST` and `NEVER` for non-negotiable requirements, not `should` or `consider`. Imperative framing (Authority) + explicit acknowledgment requirements (Commitment) + citing established norms (Social Proof) together double agent compliance rates. Reserve soft language for genuine suggestions.
- **Anticipate rationalizations**: agents under pressure will find excuses to skip steps. HARD-GATEs should name the specific rationalization they block — `"DO NOT skip this even if the task seems time-sensitive"` outperforms `"Complete this step"`.
- **No time-sensitive content**: never embed dates, version numbers, or external URLs that will stale. Put evergreen principles in SKILL.md; reference volatile data via scripts or external tools.

---

## 🚀 Creation Checklist

Follow every phase in order. Do NOT skip or reorder steps.

### Phase 0 — Capture Intent (RED Phase)

Before writing a single line, answer these four questions (ask the user if unclear):

1. [ ] What should this skill enable Claude to do?
2. [ ] When should this skill trigger? (draft 3–5 example prompts that SHOULD trigger it)
3. [ ] When should it NOT trigger? (draft 3–5 example prompts that must NOT trigger it)
4. [ ] What does a successful output look like?

<HARD-GATE>
Run the target task WITHOUT the skill first. Document exactly where the agent fails or cuts corners.
If you skip this step, you cannot know whether the skill you write prevents the right failures.
A skill written without observing real failure modes addresses imagined problems, not actual ones.
</HARD-GATE>

Save trigger/no-trigger examples AND observed failure modes — you will need both in Phase 4.

### Phase 1 — Scaffold

5. [ ] **Name**: Choose a concise kebab-case identifier (e.g., `repo-research`). Max 3 words, max 64 chars, pattern `^[a-z0-9][a-z0-9-]*[a-z0-9]$`.
6. [ ] **Directory**: Create `.vibe/skills/<name>/` as the source of truth.
7. [ ] **SKILL.md**: Create `.vibe/skills/<name>/SKILL.md` using the template below.

### Phase 2 — Author

8. [ ] **Frontmatter** — required fields:
   - [ ] `name`: kebab-case identifier matching the directory name (max 64 chars).
   - [ ] `description`: Third-person. Include `TRIGGER when:` and `DO NOT TRIGGER when:` clauses. Max 1024 chars.
9. [ ] **Required sections** (in this order):
   - [ ] `## Overview` — what the skill does and why it exists.
   - [ ] `## ✍️ Writing Principles` *(if skill involves authoring)* or equivalent guidance.
   - [ ] `## 🚀 Workflow Checklist` — numbered `[ ]` steps the agent executes.
   - [ ] `<HARD-GATE>` blocks — wrap any step requiring verification before continuing.
   - [ ] `## 📝 Anti-Patterns` — common mistakes to avoid.
   - [ ] `## 📂 Resources` — links to `references/` files or external docs.
10. [ ] **Progressive Disclosure**: Keep SKILL.md under 500 lines. Move large tables, templates, or mappings to `references/<filename>.md`.

### Phase 3 — Cross-Agent Wiring

<HARD-GATE>
Every skill MUST be discoverable by all three agents. Run these commands from the repo root before marking this phase complete:

```bash
SKILL_DIR=".vibe/skills/<name>"

# Surface to each CLI's skill discovery path
mkdir -p .claude/skills .codex/skills .gemini/skills
ln -sf ../../.vibe/skills/<name> .claude/skills/<name>
ln -sf ../../.vibe/skills/<name> .codex/skills/<name>
ln -sf ../../.vibe/skills/<name> .gemini/skills/<name>
```

Verify: `ls -la .claude/skills/<name>/` must show SKILL.md.
</HARD-GATE>

11. [ ] Symlinks created and verified.

### Phase 4 — Validate

12. [ ] **Trigger evals** — create `evals/trigger-eval.json` using examples from Phase 0:

```json
[
  {"query": "create a new skill for X", "should_trigger": true},
  {"query": "run the repo-research skill", "should_trigger": false}
]
```

13. [ ] **Self-test**: Invoke the skill with one should-trigger prompt. Confirm output follows the checklist.
14. [ ] **Pressure test** — re-run the self-test under combined pressure (add "this is urgent", "we already did X", "just skip that step this time"). The skill MUST hold. If the agent rationalizes past a HARD-GATE under pressure, add an explicit counter to that HARD-GATE.
15. [ ] **Lint** — verify SKILL.md has:
    - [ ] YAML frontmatter with `name` (≤ 64 chars) and `description` (≤ 1024 chars)
    - [ ] `TRIGGER when:` and `DO NOT TRIGGER when:` in the description
    - [ ] All required sections present
    - [ ] Critical steps use `MUST`/`NEVER`, not `should`/`consider`
    - [ ] At least one `<HARD-GATE>` if the skill has destructive or external-state-dependent steps; gate text names the rationalization it blocks
    - [ ] At least one Anti-Pattern entry
    - [ ] No time-sensitive content (dates, version numbers, external URLs in body text)
16. [ ] **Commit**: `git add .vibe/skills/<name>/ && git commit -m "feat(skills): add <name> skill"`
17. [ ] **Package** *(optional)*: `python -m scripts.package_skill .vibe/skills/<name>` to produce a distributable `.skill` ZIP.

---

## ⚖️ Standards

| Rule | Requirement |
|------|-------------|
| Naming | Kebab-case, ≤ 3 words, ≤ 64 chars |
| Source of truth | `.vibe/skills/<name>/SKILL.md` |
| Entrypoint | `SKILL.md` |
| Description format | Third-person + `TRIGGER when` / `DO NOT TRIGGER when`, ≤ 1024 chars |
| Cross-agent wiring | Skill directory must be symlinked into `.claude/skills/`, `.codex/skills/`, and `.gemini/skills/` |
| File size | < 500 lines per file |
| Scope | One skill = one responsibility; split if checklist > 15 steps |

---

## 🛠 SKILL.md Template

```markdown
---
name: kebab-case-identifier
description: Third-person summary. TRIGGER when: <prompts that should invoke this skill>. DO NOT TRIGGER when: <prompts that must not invoke this skill>.
---

# Skill Title

## Overview
What this skill does and why it exists. One paragraph.

## 🚀 Workflow Checklist
1. [ ] Step one — [specific action and why]
2. [ ] Step two — [specific action and why]

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

- **Skipping Phase 0**: Writing a skill without capturing intent leads to vague descriptions that never trigger correctly. Always answer the four questions first.
- **Vague description**: "Does research" will not trigger reliably. Write `TRIGGER when:` / `DO NOT TRIGGER when:` with specific, realistic example prompts in mind.
- **Over-specifying the workflow**: Listing every micro-step makes skills brittle. Apply the lean prompt principle — trust the model, specify the checkpoints.
- **Missing the why**: `"Verify symlinks"` is weaker than `"Verify symlinks exist (cross-agent discoverability breaks without them)"`. Always explain the reason.
- **Skipping cross-agent wiring**: A skill that hasn't been symlinked into `.claude/skills/`, `.codex/skills/`, and `.gemini/skills/` is invisible to some platforms. Always run Phase 3.
- **Editing `.claude/skills/<name>/SKILL.md` directly**: Always edit the source at `.vibe/skills/<name>/SKILL.md`. CLI-specific directories should only contain symlinks.
- **Monolithic SKILL.md**: Files over 500 lines slow context loading. Extract large references to `references/`.
- **Missing HARD-GATEs**: Steps that write files, run destructive commands, or depend on external state MUST be gated.
- **Over-scoped skill**: If the workflow checklist exceeds 15 steps, split into sub-skills with focused responsibilities.
- **Skipping trigger evals**: Without `evals/trigger-eval.json`, you have no way to know if the description is causing false positives or missed triggers.
- **Soft compliance language**: Writing `"you should verify symlinks"` instead of `"MUST verify symlinks"` reduces compliance under pressure. Use imperative language for all non-optional steps.
- **HARD-GATEs without rationalization counters**: A gate that just says "complete this step" will be rationalized away. Name the specific excuse it blocks: `"DO NOT skip this even if the previous step seemed to cover it"`.
- **Testing only under ideal conditions**: If the skill hasn't been tested with urgency, sunk-cost, or authority pressure, it hasn't been fully tested. Real agents skip steps when pressured — the skill must hold.
- **Time-sensitive content**: Embedding dates, version numbers, or ephemeral URLs in SKILL.md creates maintenance debt. Put evergreen principles in the body; access volatile data through scripts or tools.

---

## 📂 Sub-folder Guide

| Folder | Use when |
|--------|----------|
| `references/` | Large tables, mappings, or data too large for inline SKILL.md |
| `scripts/` | Executable automation (`.cjs`, `.py`, `.sh`) |
| `templates/` | Reusable output formats (e.g., digest templates) |
| `assets/` | Static files, diagrams, or images |
| `evals/` | Trigger eval queries (`trigger-eval.json`) and test outputs |

---

## 📂 Resources
- [Built-in skill-creator](/skills activate skill-creator) — foundational principles, eval tooling, description optimization
- [Anthropic skills best practices](references/anthropic-best-practices.md) — official Anthropic guidance on skill structure, token efficiency, progressive disclosure
- [Compliance & persuasion principles](references/persuasion-principles.md) — evidence-based language patterns (Authority, Commitment, Social Proof)
- [TDD for skills](references/testing-skills-with-subagents.md) — RED/GREEN/REFACTOR methodology for skill testing
- [VIBE.md cross-agent policy](../../VIBE.md)

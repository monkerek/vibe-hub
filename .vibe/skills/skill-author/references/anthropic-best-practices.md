# Skill Authoring Best Practices

> Source: [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/writing-skills) — included here for offline reference.

## Core Principles

**Conciseness matters.** Claude operates within a shared context window — avoid redundant explanations. The context window is a public good. Your skill shares it with everything else Claude needs to know.

**Match specificity to task fragility.**
- High-freedom guidance: flexible tasks (code reviews, open-ended research)
- Low-freedom guidance: error-prone operations (database migrations, destructive commands)

**Assume Claude is already very smart.** Don't over-explain basic concepts. Optimize for what Claude needs to *decide* or *do differently*, not what it already knows.

---

## Skill Structure

### Naming
- Use **gerund naming** (verb + -ing): `writing-skills`, `testing-code`, `researching-repositories`
- Vibe Hub exception: project uses noun-based kebab-case (`skill-author`, `repo-research`) — follow local convention

### Frontmatter
- `name`: kebab-case, max 64 chars
- `description`: Third-person, max 1024 chars. Must tell Claude *when* to select this skill.
- `compatibility` *(optional)*: restrict platforms

### Description writing
The description is what Claude reads when deciding whether to invoke your skill. It must:
- Start with a clear action or use-case
- Include specific trigger conditions
- Include negative conditions (when NOT to use)

For Claude Code: use `TRIGGER when:` / `DO NOT TRIGGER when:` format.
For claude.ai: use `Use when:` format.

---

## Progressive Disclosure

Structure skills in layers:

1. **Metadata** (name + description) — system prompt injection; must win the trigger decision
2. **SKILL.md body** — execution guidance; loaded when skill activates
3. **Bundled resources** (`references/`, `scripts/`, `assets/`) — overflow; accessed on demand

Keep SKILL.md under **500 lines**. Move large tables, templates, and mappings to `references/`.

Organize references like a table of contents — one level deep, no deeply nested hierarchies.

---

## Workflows and Feedback

- Break complex tasks into **sequential, numbered steps**
- Use **validation loops** for quality-critical operations (write → verify → continue)
- Create **verifiable intermediate outputs** so agents can confirm progress before continuing
- Use `<HARD-GATE>` (or equivalent) for steps that must not be skipped

---

## Executable Code

- Solve deterministic problems in **scripts** rather than prompting Claude to figure it out each time
- Provide **utility scripts** for repeated operations
- Scripts should handle errors explicitly — don't defer error handling to Claude
- Avoid assuming packages are pre-installed; include install steps or check commands

**Avoid Windows-style paths.** Always use forward slashes.

---

## Content Guidelines

- **No time-sensitive information**: dates, version numbers, or ephemeral URLs in the skill body will stale
- **Consistent terminology**: use the same term for the same concept throughout
- **Evergreen principles** belong in SKILL.md; volatile data belongs in scripts or external tools

---

## Testing and Iteration

1. **Build evaluations first** — create test cases *before* writing extensive documentation
2. **Test with realistic scenarios** — not just ideal conditions
3. **Test with all target models** (Haiku, Sonnet, Opus) if cross-model behavior matters
4. Create `evals/trigger-eval.json` with `should_trigger: true/false` entries before shipping

---

## Anti-Patterns

- **Windows-style backslash paths** — break on Mac/Linux
- **Too many options** — decision fatigue reduces compliance
- **Assumed pre-installed packages** — causes silent failures
- **Deeply nested references** — hard to navigate, reduces usage
- **Soft language for critical requirements** — `should` instead of `MUST`

---

## Pre-Sharing Checklist

Before sharing or deploying a skill:

- [ ] Name is kebab-case, ≤ 64 chars
- [ ] Description ≤ 1024 chars with clear trigger/no-trigger conditions
- [ ] SKILL.md body ≤ 500 lines
- [ ] No time-sensitive content in body
- [ ] Scripts use forward slashes
- [ ] Trigger evals created and passing
- [ ] Tested under pressure, not just ideal conditions
- [ ] Cross-agent symlinks created (for Vibe Hub)

---
name: code-review
description: Performs a structured multi-agent code review of a pull request or local diff. TRIGGER when: user asks to review a PR, review a pull request, run a code review, review my changes, review before merging, check my diff. DO NOT TRIGGER when: user asks to write code, create a PR, explain what a PR does, or summarize changes without reviewing them.
---

# Code Review

## Overview

Multi-agent code review producing balanced, actionable feedback: strengths, issues by severity tier, and a clear merge verdict. Designed for use before merging any change in this project. Supports GitHub PRs, local git diffs, and focused security/performance audits.

**Usage:**
- PR review: `/code-review PR_NUMBER [--comment] [--security] [--performance]`
- Local diff: `/code-review --base BASE_SHA --head HEAD_SHA [--comment] [--security] [--performance]`

## 🚀 Workflow Checklist

Create a todo list before starting. Execute steps in order.

### Step 1 — Pre-flight Checks

Launch a **Haiku** subagent to determine if any condition is true:
- The PR is closed or draft
- The diff is empty or whitespace-only
- Claude has already commented on this PR (check `gh pr view <PR> --comments`)

**If any condition is true, stop and report why.**

### Step 2 — Gather Context

Run in parallel:
- **Haiku**: Return paths (not contents) of all relevant `CLAUDE.md` files — root + any in ancestor dirs of changed files
- **Haiku**: Collect the full diff and changed file list; auto-detect the primary language(s) from file extensions

### Step 3 — Summarize Changes

Launch a **Sonnet** subagent to return a concise summary of what changed and why, based on the PR description or commit messages.

### Step 4 — Parallel Review (5 Agents)

Launch all 5 agents in parallel. Each returns issues with: `file:line`, what's wrong, **why it matters**, severity tier, and suggested fix (if straightforward).

**Agents 1 + 2 — CLAUDE.md Compliance (Sonnet × 2)**
- Independently audit changes against all `CLAUDE.md` files from Step 2
- Only cite rules where you can quote the exact violated text
- Classify: Critical (breaks required behavior) or High (diverges from guidelines)

**Agent 3 — Bugs, Correctness & Language Idioms (Opus)**
- Scan for clear bugs: syntax errors, type errors, missing imports, logic that will definitely produce wrong results
- Apply language-specific idiomatic checks based on detected language (see `references/checklists.md`)
- Focus on the diff only; do NOT flag issues requiring outside context to confirm
- Classify: Critical if data loss/security, High if incorrect behavior, Medium if edge case only

**Agent 4 — Architecture, Testing & Production Readiness (Opus)**
- Architecture: separation of concerns, scalability, performance implications
- Testing: do tests verify logic (not just mocks)? Are edge cases covered?
- Production: migration strategy for schema changes, backward compatibility
- If `--security` flag: apply the security checklist from `references/checklists.md`
- If `--performance` flag: apply the performance checklist from `references/checklists.md`
- Classify findings: Critical / High / Medium / Low

**Agent 5 — Strengths (Sonnet)**
- Identify 2–5 specific things done well (clean design, good error handling, solid tests, etc.)
- Each strength MUST cite a `file:line` range — vague praise is not useful

Each subagent MUST receive: PR title, PR description (or commit messages), full diff, detected language(s), active flags (`--security`/`--performance`), and CLAUDE.md file paths.

<HARD-GATE>
SEVERITY TIERS — apply consistently across all agents:
- **Critical**: Must fix before merge. Compile/parse failure, definite data loss, exploitable security vulnerability, clear functional breakage.
- **High**: Should fix before merge. Incorrect logic, test gaps for core paths, CLAUDE.md violations, architectural problems.
- **Medium**: Non-blocking but worth addressing. Edge case handling, minor design improvements.
- **Low**: Observations only. Informational notes that don't require action.

DO NOT escalate severity to seem thorough — this destroys signal value. DO NOT flag speculative issues at any tier; if confirmation requires context outside the diff, skip it.
DO NOT skip this gate even if the diff is small or the task feels urgent.
</HARD-GATE>

<HARD-GATE>
WEB SEARCH MANDATE — before any agent flags an issue involving:
- Dependency versions (e.g., "this version has a known vulnerability")
- Deprecation status (e.g., "this API is deprecated")
- Current best practices (e.g., "the recommended approach is now X")

...the agent MUST use WebSearch to verify the claim first. Never assert version status or evolving best practices from training data alone — it will be stale. If the claim cannot be verified, omit it entirely rather than risk a false positive.
DO NOT skip this gate even if the answer seems obvious from training data.
</HARD-GATE>

### Step 5 — Validate Critical and High Issues

For each Critical or High issue from Agents 3 and 4, launch a parallel validation subagent:
- **Opus** for bugs, logic, and production readiness
- **Sonnet** for CLAUDE.md violations and architecture
- Provide: PR title, description, diff, and the specific issue claim
- If uncertain, downgrade to Medium or discard — do not leave unconfirmed High/Critical issues

Medium and Low issues do not require validation.

### Step 6 — Filter

Discard any Critical or High issue not confirmed in Step 5. Compile the final issue list across all tiers.

### Step 7 — Output Summary

Print to the terminal using this format:

```
### Strengths
- [specific strength with file:line]

### Issues

#### Critical (Must Fix)
#### High (Should Fix)
#### Medium (Non-blocking)
#### Low (Observations)

For each issue:
  - file:line
  - What's wrong and why it matters
  - How to fix (if not obvious)

### Recommendations
[Broader improvements not tied to a specific line]

### Assessment
**Ready to merge?** Yes / No / With fixes
**Reasoning:** [1–2 sentence technical rationale]
```

If no issues found: `No issues found. Checked for bugs, idioms, architecture, testing, and CLAUDE.md compliance.` + `**Ready to merge?** Yes`

Then:
- `--comment` NOT passed: stop here.
- `--comment` passed + no issues: post "No issues" summary via `gh pr comment` and stop.
- `--comment` passed + issues found: continue to Step 8.

### Step 8 — Plan Comments (Internal)

Create an internal list of all comments to post — one entry per unique issue. Do not post yet.

### Step 9 — Post Inline Comments

Post one inline comment per unique issue using `mcp__github_inline_comment__create_inline_comment` with `confirmed: true`.

Each comment MUST:
- State the severity tier
- Explain what's wrong and **why it matters**
- For small self-contained fixes (< 6 lines, single location): include a committable suggestion block
- For larger fixes: describe the approach without a suggestion block
- **NEVER post a committable suggestion unless committing it fully resolves the issue**
- Link to the relevant `CLAUDE.md` rule if applicable

**Post exactly ONE comment per unique issue. No duplicates.**

## 📝 Anti-Patterns

- **Inflating severity**: Escalating Medium to Critical to seem thorough destroys tier signal. Apply definitions from the HARD-GATE strictly.
- **Asserting version/deprecation status without WebSearch**: Training data is stale. Always verify before flagging version-related issues.
- **Vague strengths**: "Good code" is useless. Strengths MUST cite `file:line` or they are omitted.
- **Skipping validation (Step 5)**: All Critical/High issues MUST be validated. Unvalidated issues produce false positives that erode trust.
- **Flagging speculative issues**: Outside-context confirmation required = skip it entirely, at any tier.
- **Flagging pre-existing issues**: Only review what changed in the diff.
- **Omitting "why it matters"**: Authors need stakes to prioritize fixes. Every issue requires a reason.
- **Posting without `--comment` flag**: Never post GitHub comments unless explicitly requested.
- **Using web fetch for GitHub**: Use `gh` CLI only for all GitHub interactions.
- **Posting duplicate comments**: Plan in Step 8 before posting anything.

## 📂 Resources

- [references/checklists.md](references/checklists.md) — Security (OWASP), performance, and language-idiomatic checklists for Agent 3/4
- [references/false-positive-list.md](references/false-positive-list.md) — What NOT to flag, by category

---
name: code-review
description: Performs a structured multi-agent code review of a pull request or local diff. TRIGGER when: user asks to review a PR, review a pull request, run a code review, review my changes, review before merging, check my diff. DO NOT TRIGGER when: user asks to write code, create a PR, explain what a PR does, or summarize changes without reviewing them.
compatibility: claude-code
---

# Code Review

## Overview

Multi-agent code review that produces balanced, actionable feedback: real bugs and compliance violations categorized by severity, explicit strengths, and a clear merge verdict. Designed for use before merging any change in this project. Supports both GitHub PRs and local git diffs.

**Usage:**
- PR review: `/code-review PR_NUMBER [--comment]`
- Local diff: `/code-review --base BASE_SHA --head HEAD_SHA [--comment]`

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
- **Haiku**: Run `git diff --stat BASE..HEAD` or `gh pr diff` to confirm the diff is non-empty and collect changed file list

### Step 3 — Summarize Changes

Launch a **Sonnet** subagent to return a concise summary of what changed and why, based on the PR description or commit messages.

### Step 4 — Parallel Review (5 Agents)

Launch all 5 agents in parallel. Each returns issues with: file:line, what's wrong, **why it matters**, severity tier, and suggested fix (if straightforward).

**Agent 1 + 2 — CLAUDE.md Compliance (Sonnet × 2)**
- Independently audit changes against all `CLAUDE.md` files from Step 2
- Only cite rules where you can quote the exact violated text
- Classify violations as Critical (breaks required behavior) or Important (diverges from guidelines)

**Agent 3 — Bugs & Correctness (Opus)**
- Scan for clear bugs: syntax errors, type errors, missing imports, logic that will definitely produce wrong results
- Focus on the diff only; do NOT flag issues requiring outside context
- Severity: Critical if data loss/security risk, Important if incorrect behavior, Minor if edge case

**Agent 4 — Architecture, Testing & Production Readiness (Opus)**
- Architecture: separation of concerns, scalability, performance implications
- Testing: do tests verify logic (not just mocks)? Edge cases covered? Integration tests where needed?
- Production: migration strategy for schema changes, backward compatibility, no obvious missing docs
- Classify findings by tier: Critical / Important / Minor

**Agent 5 — Strengths (Sonnet)**
- Identify 2–5 specific things done well (clean design, good error handling, solid test coverage, etc.)
- Each strength MUST cite a file:line range — vague praise is not useful

Each subagent MUST receive: PR title, PR description (or commit message), full diff, and CLAUDE.md file paths.

<HARD-GATE>
SEVERITY TIERS — apply consistently across all agents:
- **Critical**: Must fix before merge. Code fails to compile/parse, definite data loss or security vulnerability, or clear functional breakage.
- **Important**: Should fix before merge. Incorrect logic under specific inputs, test gaps for core paths, CLAUDE.md violations, architectural problems.
- **Minor**: Nice to have. Small improvements that don't block merging.

DO NOT escalate Minor issues to Important to seem thorough. DO NOT flag speculative issues as any tier — if you need context outside the diff to confirm it, skip it. False positives in any tier erode trust.
DO NOT skip this gate even if the diff is small or the task seems urgent.
</HARD-GATE>

### Step 5 — Validate Critical and Important Issues

For each Critical or Important issue from Agents 3 and 4, launch a parallel validation subagent:
- **Opus** for bugs, logic, and production readiness issues
- **Sonnet** for CLAUDE.md violations and architecture findings
- Provide: PR title, description, diff, and the specific issue claim
- Confirm the issue is real with high confidence; if uncertain, downgrade to Minor or discard

Minor issues from agents do not require validation — include them as-is.

### Step 6 — Filter

Discard any Critical or Important issue not confirmed in Step 5. Compile the final issue list across all tiers.

### Step 7 — Output Summary

Print to the terminal using this format:

```
### Strengths
- [specific strength with file:line]
- ...

### Issues

#### Critical (Must Fix)
[bugs, security issues, data loss risks]

#### Important (Should Fix)
[architecture problems, test gaps, CLAUDE.md violations, incorrect logic]

#### Minor (Nice to Have)
[small improvements, style, docs]

For each issue:
  - file:line reference
  - What's wrong
  - Why it matters
  - How to fix (if not obvious)

### Recommendations
[Broader improvements not tied to a specific issue]

### Assessment
**Ready to merge?** Yes / No / With fixes
**Reasoning:** [1–2 sentence technical rationale]
```

If no issues found in any tier:
```
No issues found. Checked for bugs, architecture, testing, and CLAUDE.md compliance.

**Ready to merge?** Yes
```

Then:
- If `--comment` was NOT passed: stop here.
- If `--comment` IS passed AND no issues: post the "No issues" summary via `gh pr comment` and stop.
- If `--comment` IS passed AND issues exist: continue to Step 8.

### Step 8 — Plan Comments (Internal)

Create an internal list of all comments to post. Do not post yet. One entry per unique issue.

### Step 9 — Post Inline Comments

Post one inline comment per unique issue using `mcp__github_inline_comment__create_inline_comment` with `confirmed: true`.

Each comment MUST:
- State the severity tier
- Describe what's wrong and **why it matters**
- For small self-contained fixes (< 6 lines, single location): include a committable suggestion block
- For larger fixes: describe the fix approach without a suggestion block
- **NEVER post a committable suggestion unless committing it fully resolves the issue**
- Link to the relevant `CLAUDE.md` rule if applicable

**Post exactly ONE comment per unique issue. No duplicates.**

## 📝 Anti-Patterns

- **Inflating severity**: Not everything is Critical. Escalating Minor issues to Critical to seem thorough destroys the signal value of the tier system.
- **Vague strengths**: "Good code" is useless. Strengths MUST cite file:line — if you can't be specific, skip it.
- **Skipping validation (Step 5)**: All Critical/Important issues MUST be validated before posting. Unvalidated issues produce false positives.
- **Flagging speculative issues**: If you need context outside the diff to confirm the bug, do not flag it at any tier.
- **Flagging pre-existing issues**: Only review what changed in the diff.
- **Omitting "why it matters"**: An issue without a reason is an instruction without a justification — authors need to understand the stakes to prioritize.
- **Posting without `--comment` flag**: Never post GitHub comments unless `--comment` was explicitly passed.
- **Using web fetch for GitHub**: Use `gh` CLI for all GitHub interactions.
- **Posting duplicate comments**: Plan all comments in Step 8 before posting any.

## 📂 Resources

- [references/false-positive-list.md](references/false-positive-list.md) — What NOT to flag, by category
- [Anthropic code-review command](https://github.com/anthropics/claude-code/blob/main/plugins/code-review/commands/code-review.md) — upstream multi-agent reference
- [obra/superpowers code-reviewer](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/code-reviewer.md) — severity tiers, strengths, and verdict pattern

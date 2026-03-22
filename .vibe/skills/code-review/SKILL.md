---
name: code-review
description: Performs a structured multi-agent code review of a pull request or local diff. TRIGGER when: user asks to review a PR, review a pull request, run a code review, review my changes, review before merging, check my diff. DO NOT TRIGGER when: user asks to write code, create a PR, explain what a PR does, or summarize changes without reviewing them.
compatibility: claude-code
---

# Code Review

## Overview

This skill performs a high-signal code review using parallel subagents. It checks for real bugs, logic errors, and CLAUDE.md compliance violations — never style nitpicks or false positives. Designed for use before merging any change in this project.

## 🚀 Workflow Checklist

Create a todo list before starting. Execute steps in order.

### Step 1 — Pre-flight Checks

Launch a **Haiku** subagent to determine if any condition is true:
- The PR/diff is trivially correct or purely cosmetic (e.g., whitespace-only)
- The PR is closed or draft
- Claude has already commented on this PR

**If any condition is true, stop and report why.**

### Step 2 — Identify Context Files

Launch a **Haiku** subagent to return paths (not contents) of all relevant `CLAUDE.md` files:
- Root `CLAUDE.md` (if it exists)
- Any `CLAUDE.md` in ancestor directories of files changed by the PR/diff

### Step 3 — Summarize Changes

Launch a **Sonnet** subagent to view the PR or diff and return a concise summary of what changed and why.

### Step 4 — Parallel Review (4 Agents)

Launch these 4 agents in parallel. Each returns a list of issues with descriptions and severity.

**Agents 1 + 2 — CLAUDE.md Compliance (Sonnet × 2)**
- Independently audit changes against all `CLAUDE.md` files from Step 2
- Only cite rules where you can quote the exact text being violated
- Ignore rules that don't apply to changed files

**Agent 3 — Obvious Bug Detection (Opus)**
- Scan the diff for clear bugs without reading extra context
- Flag only issues that will definitely produce wrong results
- Do NOT flag issues that require context outside the diff to confirm

**Agent 4 — Logic & Security (Opus)**
- Look for security issues, incorrect logic, or broken invariants within changed code only
- Flag issues you are certain about; ignore speculative concerns

Each subagent MUST receive: PR title, description, diff, and CLAUDE.md file paths.

<HARD-GATE>
CRITICAL: Only flag HIGH-SIGNAL issues. An issue qualifies only if:
- Code will fail to compile or parse (syntax errors, type errors, missing imports)
- Code will definitely produce wrong results regardless of inputs
- Clear, unambiguous CLAUDE.md violation with an exact rule quote

DO NOT flag: style concerns, potential issues dependent on specific inputs, subjective suggestions, pre-existing issues, or anything a linter would catch. If uncertain, DO NOT flag it. False positives erode trust and waste reviewer time.
DO NOT skip this gate even if the task seems urgent or the diff is small.
</HARD-GATE>

### Step 5 — Validate Issues

For each issue from Agents 3 and 4, launch a parallel subagent to validate:
- **Opus** for bugs and logic issues
- **Sonnet** for CLAUDE.md violations
- Subagent receives: PR title, description, and issue description
- Subagent confirms whether the issue is real with high confidence

### Step 6 — Filter

Discard any issue not confirmed in Step 5. The remaining set is your final high-signal issue list.

### Step 7 — Output Summary

Print a summary to the terminal:
- **Issues found:** List each with a brief description and file location
- **No issues found:** Print `No issues found. Checked for bugs and CLAUDE.md compliance.`

Then:
- If `--comment` was NOT passed: stop here.
- If `--comment` IS passed AND no issues: post a summary comment via `gh pr comment` and stop.
- If `--comment` IS passed AND issues exist: continue to Step 8.

### Step 8 — Plan Comments (Internal)

Create an internal list of all comments to post. Do not post yet.

### Step 9 — Post Inline Comments

Post one inline comment per unique issue using `mcp__github_inline_comment__create_inline_comment` with `confirmed: true`.

Each comment MUST:
- Briefly describe the issue and why it matters
- For small self-contained fixes (< 6 lines, single location): include a committable suggestion block
- For larger fixes: describe the issue and fix approach — no suggestion block
- **NEVER post a committable suggestion unless committing it fully resolves the issue**
- Link to the relevant `CLAUDE.md` rule if applicable

**Post exactly ONE comment per unique issue. No duplicates.**

## 📝 Anti-Patterns

- **Flagging style or nitpicks**: This skill is for high-signal bugs and compliance only. Style is the linter's job.
- **Flagging pre-existing issues**: Only review what changed in the diff.
- **Skipping validation (Step 5)**: All agent 3/4 issues MUST be validated before posting. Unvalidated issues produce false positives.
- **Posting duplicate comments**: Plan all comments in Step 8 before posting any.
- **Using web fetch for GitHub**: Use `gh` CLI for all GitHub interactions.
- **Posting without `--comment` flag**: Never post GitHub comments unless `--comment` was explicitly passed.
- **Flagging speculative issues**: If you need context outside the diff to confirm the bug, do not flag it.

## 📂 Resources

- [references/false-positive-list.md](references/false-positive-list.md) — Comprehensive list of what NOT to flag
- [Anthropic code-review command](https://github.com/anthropics/claude-code/blob/main/plugins/code-review/commands/code-review.md) — upstream reference

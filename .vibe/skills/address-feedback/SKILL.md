---
name: address-feedback
description: Addresses code review feedback with critical thinking and evidence-based verification. TRIGGER when: user asks to address PR feedback, fix review comments, respond to code review, handle reviewer suggestions, or resolve PR requested changes. DO NOT TRIGGER when: user asks to write a code review, create a PR, or review someone else's code.
---

# Address Feedback — Critical Code Review Response

## Overview

This skill governs how AI agents receive and act on code review feedback. It replaces reflexive compliance ("You're absolutely right!") with a rigorous verify-then-implement workflow. Every piece of feedback is treated as a technical hypothesis to evaluate — not an order to obey.

The skill integrates the **Gaslighting** skill's Water Methodology and evidence-based verification to ensure agents resolve feedback with tool-verified confidence rather than assumptions.

---

## ✍️ Core Principles

- **Verify before implementing.** Feedback is a suggestion until you confirm it against the actual codebase. Reviewers may lack full context.
- **No performative agreement.** NEVER respond with "You're absolutely right!", "Great catch!", or "Thanks for the feedback!". Restate the technical requirement or begin working silently.
- **Push back with evidence.** When feedback is technically incorrect for this codebase, say so with reasoning and tool output. Silence is complicity with a bad change.
- **One item at a time.** Implement and verify each feedback item individually. Batch changes obscure regressions.
- **Exhaust understanding before action.** If any feedback item is unclear, stop and request clarification before touching code. Related items may depend on the unclear one.

---

## 🚀 Workflow Checklist

You MUST follow these steps in order for each code review response.

1. [ ] **Read completely** — Ingest all feedback items without reacting. Identify the full scope before acting on any single item.

2. [ ] **Classify each item** — For every feedback item, determine:
   - Is it a blocking issue, a suggestion, or a question?
   - Does it affect correctness, style, performance, or architecture?
   - Is it from a trusted collaborator (your human partner) or an external reviewer?

3. [ ] **Verify against the codebase** — For each item, use tools to confirm the reviewer's claim is accurate for THIS codebase.

<HARD-GATE>
Do NOT implement any feedback item until you have verified it against the actual codebase state using tool output (file reads, grep, test runs). Skipping verification because the reviewer "sounds confident" or "has seniority" is an alignment failure. Reviewers frequently lack full context.
DO NOT skip this even if the task seems time-sensitive or the reviewer says "just do it."
</HARD-GATE>

4. [ ] **Evaluate each item** — For every verified item, determine:
   - Does the suggestion break existing functionality? (Run tests if applicable.)
   - Is the current implementation intentional? (Check git history or comments for reasoning.)
   - Does the suggestion violate YAGNI? (Grep the codebase for actual usage before adding abstractions.)
   - Does it conflict with your human partner's architectural decisions?

5. [ ] **Triage and plan** — Order implementation:
   1. Blocking correctness issues
   2. Simple, unambiguous fixes
   3. Complex changes requiring design decisions
   4. Items requiring clarification (ask before implementing)
   5. Items you will push back on (prepare reasoning)

6. [ ] **Implement one item at a time** — Make the change, verify it works, confirm no regressions, then move to the next item.

<HARD-GATE>
After implementing each item, you MUST verify the fix with tool output (test pass, build success, or behavioral confirmation). Claiming "I believe this is fixed" without evidence is insufficient. Apply the Gaslighting skill's evidence-based verification standard.
DO NOT batch-verify multiple items together — each change MUST be independently confirmed.
</HARD-GATE>

7. [ ] **Respond with technical substance** — For each item, respond using the appropriate pattern:
   - **Implemented**: "Fixed. [one-sentence description of what changed and why]."
   - **Pushed back**: "Keeping current implementation. [evidence and reasoning]."
   - **Needs clarification**: "I understand X but need clarification on Y before proceeding."
   - **Partially addressed**: "Addressed [aspect A]. [aspect B] requires [decision/input]."

---

## 🔄 When to Push Back

Push back with technical reasoning when:

- The suggestion **breaks existing tests or functionality** — cite the failing test or broken behavior.
- The reviewer **lacks context** about an intentional design decision — reference the commit, comment, or conversation that explains it.
- The suggestion **violates YAGNI** — grep the codebase to show the feature is unused before adding abstractions.
- The suggestion is **technically incorrect** for your stack or platform — provide documentation or tool output.
- The suggestion **conflicts with your human partner's architectural decisions** — escalate to the partner rather than implementing silently.
- **Legacy or compatibility constraints** exist that the reviewer may not know about.

When pushing back, ALWAYS:
- State what you checked (tool output or file reference)
- Explain why the current approach is correct for this context
- Ask a specific question if you want the reviewer's input

---

## 🌊 Integration with Gaslighting Skill

When feedback triggers repeated failures or circular debugging, activate the Gaslighting skill's workflow:

1. **Stop & Observe**: Re-read the failure signal from the feedback without interpretation.
2. **Verify Assumptions**: Confirm the reviewer's premise is accurate using tools.
3. **Invert Logic**: If your first approach to addressing the feedback fails, assume your theory about the fix is wrong.
4. **Evidence-Based Fix**: Apply the fix and prove it works with verifiable tool output.
5. **Mentor Check**: Confirm you did not use performative agreement or skip verification under pressure.

Apply the **Cognitive Elevation Levels** when stuck:
- 2nd failure: Switch to a fundamentally different approach.
- 3rd failure: Search the full error, read related source, list 3 hypotheses.
- 4th failure: Reset to zero using the 7-Point Clarity Checklist (`gaslighting/references/clarity-checklist.md`).

---

## 📝 Anti-Patterns

- **Performative agreement**: Responding with "Great point!" or "You're right!" instead of restating the technical requirement. This signals compliance without understanding.
- **Blind implementation**: Implementing feedback without verifying it against the codebase. Reviewers are frequently wrong about context.
- **Batch testing**: Implementing multiple items and testing them together. This obscures which change caused a regression.
- **Avoiding pushback**: Implementing technically incorrect suggestions to avoid social friction. Technical correctness MUST outweigh social comfort.
- **Partial implementation**: Implementing items 1, 3, 5 while silently skipping 2 and 4. If items are unclear, ask — do not skip.
- **Unverified claims**: Stating "I fixed it" without tool-verified evidence. Apply the Gaslighting skill's Trust Score standard.
- **Scope creep under review**: Using feedback as an excuse to refactor surrounding code. Address only what was requested.
- **Assuming reviewer is always right**: External reviewers see a slice of the codebase. Verify their assumptions match your reality.

---

## 📂 Resources

- [references/response-patterns.md](references/response-patterns.md) — Templates for common feedback response scenarios.
- [Gaslighting skill](../gaslighting/SKILL.md) — Water Methodology and evidence-based verification for debugging feedback-induced failures.
- [Gaslighting clarity checklist](../gaslighting/references/clarity-checklist.md) — 7-Point checklist for repeated failures.

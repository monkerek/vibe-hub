---
name: socratic-interview
description: Conducts a structured Socratic interview to fully understand user intent before executing complex or ambiguous tasks. TRIGGER when: the task has significant ambiguity, requires complex multi-step planning, the agent is uncertain about user intent, or the user explicitly requests an interview/clarification process. DO NOT TRIGGER when: the task is clear and well-defined, the user provides explicit step-by-step instructions, or the user says "just do it" or "skip the interview."
---

# Socratic Interview — Intent Alignment Through Structured Inquiry

## Overview

This skill replaces ad-hoc clarification questions with a structured, Socratic interview process. Before executing any complex or ambiguous task, the agent conducts a focused interview to extract the user's intent, thought process, constraints, and definition of success — then synthesizes an alignment contract before proceeding.

The methodology draws from the Socratic feedback paradigm (Definition, Elenchus, Maieutic, Dialectic, Counterfactual) adapted from pedagogical questioning to **requirements elicitation**. The goal is not to teach, but to *fully understand* — so the resulting work is aligned on first delivery.

**Why this exists**: Agents routinely misinterpret ambiguous tasks, make silent assumptions, and deliver work that misses the user's actual intent. A 5-minute interview prevents hours of rework.

---

## 🧠 Core Principles

- **Structure before details.** Start with the big picture (what, why, who) before drilling into specifics (how, constraints, edge cases). Premature detail questions confuse both parties.
- **One question at a time.** Never batch questions. Each answer shapes the next question. Batching signals you're following a script, not listening.
- **Follow the thread.** If an answer is vague or contradictory, ask a follow-up before moving on. Unresolved ambiguity compounds downstream.
- **Minimize question count.** Every question MUST earn its place. Default maximum is 10 questions. Reaching the cap without clarity signals a structural problem — pause and reframe.
- **Synthesize before executing.** After the interview, produce a written Alignment Summary. Do NOT begin work until the user confirms it.

---

## 🚀 Workflow Checklist

### Phase 1 — Trigger Assessment

1. [ ] **Evaluate task ambiguity** — Before starting any work, assess whether the task meets the interview threshold:
   - Does the task have multiple valid interpretations?
   - Are success criteria undefined or implicit?
   - Does the task span multiple systems, files, or concerns?
   - Is the agent unsure about scope, priority, or approach?
   - Would a wrong assumption cost significant rework?

   If **two or more** conditions are true, activate the interview. Otherwise, proceed directly.

### Phase 2 — The Interview

Conduct the interview using the **Five Stages** (adapted from Socratic questioning for requirements elicitation). Progress through stages in order, but skip stages where the user has already provided sufficient clarity.

2. [ ] **Stage 1 — Definition** (What & Why): Establish the core intent.
   - What is the desired outcome in concrete terms?
   - Why does this matter — what problem does it solve or what goal does it serve?
   - Who is the audience or consumer of the result?

3. [ ] **Stage 2 — Elenchus** (Test Assumptions): Surface hidden assumptions and contradictions.
   - Are there constraints the user hasn't mentioned (performance, compatibility, style)?
   - Does the stated goal conflict with existing architecture or conventions?
   - What does the user assume the agent already knows?

4. [ ] **Stage 3 — Maieutic** (Elicit Latent Knowledge): Draw out what the user knows but hasn't articulated.
   - Has the user attempted this before? What worked or failed?
   - Are there examples of similar work the user considers good?
   - What mental model is the user working from?

5. [ ] **Stage 4 — Dialectic** (Resolve Tensions): Address competing priorities and tradeoffs.
   - If speed and quality conflict, which wins?
   - If the ideal solution requires changes outside the stated scope, should the agent flag or ignore them?
   - What is explicitly out of scope?

6. [ ] **Stage 5 — Counterfactual** (Validate via Negation): Confirm understanding by exploring boundaries.
   - What would a *wrong* result look like?
   - What is the user's biggest fear about this task?
   - If the agent had to cut one feature or corner, which is least important?

<HARD-GATE>
You MUST ask at least THREE questions across at least TWO different stages before producing the Alignment Summary. Skipping the interview because "the task seems clear enough" or "I think I understand" is the primary failure mode this skill prevents. Understanding is not assumed — it is verified through dialogue.
DO NOT skip this even if the task seems straightforward after reading the initial request.
</HARD-GATE>

**Interview Mechanics:**
- Ask ONE question per turn. Wait for the answer.
- If the answer is vague, ask a clarifying follow-up (counts toward the question budget).
- Track your question count. Default budget: **10 questions**. The user can override with a custom limit.
- You do NOT need to use all questions. End early when you have sufficient clarity.
- Use conversational softeners ("I want to make sure I understand...", "Before I start...", "One more thing...") to maintain collaborative tone.
- NEVER interrogate. Frame questions as serving the user's goal, not testing their knowledge.

### Phase 3 — Alignment Summary

7. [ ] **Produce the Alignment Summary** — After the interview, synthesize your understanding into a structured summary using the format in `references/alignment-summary.md`. The summary MUST include:
   - **Outcome**: What you will deliver, in concrete terms.
   - **Approach**: How you plan to accomplish it (high-level).
   - **Success criteria**: How the user will know it's done correctly.
   - **Scope boundaries**: What is explicitly included and excluded.
   - **Assumptions**: Any remaining assumptions you're making.
   - **Open questions**: Anything still unresolved (if any).

<HARD-GATE>
Do NOT begin implementation until the user has reviewed and confirmed the Alignment Summary. Proceeding without confirmation defeats the purpose of the interview. If the user says "looks good" or equivalent, proceed. If they correct anything, update the summary and re-confirm.
DO NOT skip this even if the user says "just start working" during the interview — present the summary first, then start.
</HARD-GATE>

### Phase 4 — Execution

8. [ ] **Execute against the confirmed summary** — Use the Alignment Summary as your specification. If you discover the task diverges from the summary during execution, STOP and flag the divergence rather than silently adapting.

---

## 🎯 Question Selection Strategy

Not all stages need equal depth. Allocate your question budget based on ambiguity:

| Signal | Prioritize Stage | Example |
|--------|-----------------|---------|
| Vague outcome ("make it better") | Definition | "What does 'better' look like concretely?" |
| Unstated constraints | Elenchus | "Are there performance or compatibility requirements?" |
| User has domain expertise | Maieutic | "You mentioned X — can you walk me through your mental model?" |
| Competing goals detected | Dialectic | "You want both speed and thoroughness — which wins if they conflict?" |
| High-stakes or irreversible | Counterfactual | "What's the worst outcome we need to avoid?" |

When a single question can serve multiple stages, prefer that question to conserve budget.

---

## 📝 Anti-Patterns

- **Question dumping**: Asking 3+ questions in one turn. This overwhelms the user and signals you're not listening. ONE question per turn, always.
- **Script following**: Rigidly progressing through all five stages regardless of context. Skip stages where the user has already provided clarity. The stages are a guide, not a checklist.
- **Interrogation tone**: Rapid-fire questions without acknowledgment. Always briefly validate the answer ("Got it — that helps clarify scope.") before the next question.
- **Premature depth**: Asking about edge cases before understanding the core intent. Structure before details — always.
- **Assumed clarity**: Skipping the interview because "the task seems obvious." This is the #1 failure mode. If you're activating this skill, the task is NOT obvious by definition.
- **Infinite interview**: Using all 10 questions when 4 would suffice. Every question must earn its place. End early when clarity is achieved.
- **Missing the synthesis**: Conducting a great interview but diving into work without producing the Alignment Summary. The summary is the deliverable of the interview — work is the deliverable of the summary.
- **Asking what you already know**: Re-asking about information the user provided in the original request. Read the input carefully before your first question.

---

## 📂 Resources

- [references/alignment-summary.md](references/alignment-summary.md) — Template for the post-interview alignment contract.
- [references/question-bank.md](references/question-bank.md) — Curated question patterns organized by Socratic stage, adapted for requirements elicitation.

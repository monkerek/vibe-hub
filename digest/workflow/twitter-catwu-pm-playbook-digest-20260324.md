---
title: "The PM Playbook Needs to Change in the AI Era"
type: "blog"
source: "Twitter / twitter-thread.com"
url: "https://twitter-thread.com/t/2035104384007422347"
authors: "Cat Wu (@_catwu)"
date_published: "2026-03-20"
date_processed: "2026-03-24"
score: "6 (Moderate Accept)"
confidence: "3 (Moderate)"
tags: ["product-management", "ai", "agentic-systems", "claude-code", "anthropic", "workflow"]
---

# The PM Playbook Needs to Change in the AI Era

> **Source:** Twitter Thread | **Authors:** Cat Wu (@_catwu) | **Date:** 2026-03-20
> **Review Score:** 6 (Moderate Accept) | **Confidence:** 3 (Moderate)

---

## Author Background & Affiliations

| Aspect | Details |
|--------|---------|
| **Primary Author** | Cat Wu (@_catwu) |
| **Affiliation** | Anthropic — Head of Product for Claude Code |
| **Notable Work** | Directly overseeing the Claude Code product, which is both the subject and the recommended tooling of this thread |
| **Corroborators** | Bihan Jiang (Director of Product, Decagon); Kai Xin Tai (Senior PM, Datadog) |

Cat Wu holds a senior product leadership role at Anthropic with direct oversight of Claude Code. This gives her credible first-hand insight into AI-native product development — but also creates a material **conflict of interest**: the thread recommends using Claude Code and Opus 4.6 as the solution to the problems she describes. The corroborating voices from Decagon and Datadog add some external validation, though their selection process is unknown.

---

## TL;DR

Traditional PM practices (long roadmaps, written specs) were designed for stable technology. With rapidly improving AI models, Wu argues PMs should switch to short experimentation sprints, use working demos instead of docs, revisit previously infeasible features with each model release, and bias toward simplicity in agentic systems. The advice is practitioner-grounded but largely repackages agile/lean principles for an AI context, with limited generalizability outside of organizations with direct model access.

---

## Technical Evaluation

### 1. Soundness
**Assessment:** Moderate. The four principles are internally consistent and the examples (AskUserQuestion tool, todo lists) are concrete. However, the causal chain is often implied rather than argued — *why* model progress specifically invalidates roadmaps isn't fully developed.

**Evidence:** Anecdotal examples from Anthropic's internal Claude Code development. No quantitative data, no A/B comparisons between old and new PM approaches.

### 2. Novelty & Contribution
**Assessment:** Low-to-Moderate. "Short sprints," "demos over docs," and "do the simple thing" are established agile/lean/XP principles dating back to the early 2000s. The novel framing is the *reason* — that model capability jumps make the tech layer unstable, rendering feature roadmaps obsolete faster than before. This context-specific argument has merit but is underdeveloped.

**Comparison to Prior Work:** Agile Manifesto (2001) already prioritized "working software over comprehensive documentation" and "responding to change over following a plan." The contribution is contextualizing these for AI-era product development, not introducing them.

### 3. Empirical Validation
**Assessment:** Weak. Three data points: AskUserQuestion tool, todo lists, and unnamed "internal users." Two corroborating testimonials from external PMs. No failure cases reported.

**Baselines & Metrics:** No before/after comparisons, no definition of "faster prototyping," no metric for what "worked."

---

## Key Contributions / Claims

### 1. Short Sprint Planning
**Claim:** Long roadmaps are incompatible with rapid model progress; small experiments win.
**Evidence:** Claude Code features (AskUserQuestion, todo lists) emerged from quick prototypes that internal users validated.
**Critique:** This is survivorship bias — we only hear about prototypes that worked. The frequency of failed quick experiments isn't disclosed. Also, Anthropic's proximity to model development gives them an information advantage most external product teams lack.

### 2. Demos Over Documentation
**Claim:** Claude Code + Opus 4.6 lowers the barrier to working prototypes, making demos faster and higher-fidelity than written specs.
**Evidence:** Assertion from the author; no comparison data.
**Critique:** This is a product recommendation embedded in strategic advice. Teams without Claude Code (or with different tool preferences) may not share the same low barrier. The claim is also model-specific — it may degrade with less capable models.

### 3. Revisit Features with New Models
**Claim:** Each model release, re-test previously infeasible features and remove scaffolding no longer needed.
**Evidence:** General principle, no specific before/after feature example given beyond the implicit implication that Claude Code itself benefited from this.
**Critique:** This is the most operationally actionable and least contested of the four claims. The advice to *remove* scaffolding is particularly valuable and under-discussed in the thread.

### 4. Do the Simple Thing
**Claim:** In agentic systems, complexity compounds failures.
**Evidence:** No specific failure examples cited.
**Critique:** True but tautological — simplicity is broadly good engineering advice in any system. The AI-specific framing ("failures compound") is under-argued. What failure modes specifically? Prompt brittleness? Tool call cascades? The claim needs a mechanistic account.

---

## Critical Evaluation (Devil's Advocate)

### Strengths
- Practitioner credibility: Wu has direct, recent experience shipping agentic products at the frontier.
- The "revisit features with new models" heuristic is genuinely novel operationally — it's a concrete scheduling trigger that most PM frameworks don't have.
- The framing of model capability as a product planning variable (rather than fixed infrastructure) is a useful conceptual shift.

### Weaknesses & Limitations
- **Conflict of interest**: Claude Code and Opus 4.6 are recommended as the solution by an Anthropic employee. This doesn't invalidate the advice, but it should be weighted accordingly.
- **Generalizability gap**: Anthropic builds the model it ships products on. Teams building on third-party APIs (OpenAI, Google) operate under different constraints — model access, upgrade timing, and capability curves are not in their control. The short-sprint strategy may be harder to execute when you can't predict when the model tier you rely on will improve.
- **Selection bias**: All examples are successes. No failed prototype stories, no cases where "doing the simple thing" led to architectural regret. The advice may be systematically optimistic.
- **Agile repackaging**: Three of four principles (short sprints, demos over docs, simplicity) are agile/lean fundamentals from 20+ years ago. The argument that AI *specifically* necessitates them — rather than just reinforcing existing best practices — is asserted but not proven.
- **No failure cost accounting**: Fast prototyping can accrue technical debt. "Removing scaffolding" is mentioned once but the cost of scaffolding that wasn't removed (or was removed too early) isn't discussed.

---

## Application to My Context

### Relevance
Highly relevant for any workflow or product development context in this workspace. The "revisit features with new models" trigger is directly applicable when evaluating which skill capabilities or digest tooling to upgrade after model releases. The simplicity principle reinforces existing Vibe Hub anti-patterns against over-engineering skills.

### Action Items
| Priority | Action | Context |
|:--------:|:-------|:--------|
| 🔴 | After each major model release, audit existing skills for scaffolding that can be removed | Apply "revisit features" heuristic to .vibe/skills/ |
| 🟡 | Prefer building a working prototype over writing a SKILL.md spec for new skills | Demos over docs, applied to skill authoring |
| 🟢 | When designing new agentic workflows, start with the minimal tool chain and add complexity only when necessary | "Do the simple thing" for tool chain design |

---

## Key Quotes

> "The PM playbook was built on an assumption that the technology underneath your product is roughly stable. With the current pace of model progress, this is no longer true."

> "Every model release, go back through your list of features that were too hard for the previous model and test the ideas again. Also, remove the extra scaffolding that is no longer needed."

> "With agentic systems, failures compound with system complexity. Find the simplest thing that works."

---

## References to Follow Up

| Type | Reference | Priority | Notes |
|------|-----------|----------|-------|
| 🔗 Blog | Anthropic blog post referenced in closing tweet | High | Likely contains fuller discussion with Bihan Jiang and Kai Xin Tai |
| 📖 Book | Agile Manifesto (2001) | Low | Context for evaluating novelty of the four principles |
| 🎥 Video | Boris Cherny on Claude Code (already digested) | Medium | Cross-reference with engineering perspective on the same product |

---

## Appendix: Detailed Notes

<details>
<summary>Thread structure and raw extraction (click to expand)</summary>

**Thread structure:** 6 tweets total. One framing tweet + four principle tweets + one closing tweet with external corroboration.

**Tweet 0 (framing):**
"The PM playbook was built on an assumption that the technology underneath your product is roughly stable. With the current pace of model progress, this is no longer true. Here's how we've evolved the PM role:"

**Tweet 1 (Short sprints):**
"Plan in short sprints. Long roadmaps can't compete with a high velocity of small experiments. Claude Code on Claude desktop, AskUserQuestion tool, and todo lists all started as ideas from the team. We built a prototype, internal users liked it, we shipped it."

**Tweet 2 (Demos over docs):**
"Encourage demos and evals over docs. Claude Code with Opus 4.6 has lowered the barrier to build a working prototype to showcase an idea. It's faster and higher fidelity than trying to convey the idea in a doc."

**Tweet 3 (Revisit features):**
"Revisit features with new models. Every model release, go back through your list of features that were too hard for the previous model and test the ideas again. Also, remove the extra scaffolding that is no longer needed."

**Tweet 4 (Simplicity):**
"Do the simple thing. With agentic systems, failures compound with system complexity. Find the simplest thing that works."

**Tweet 5 (Closing):**
References Bihan Jiang (Director of Product, Decagon) and Kai Xin Tai (Senior Product Manager, Datadog) sharing similar experiences with faster customer-facing prototype delivery, linking to further discussion on Claude's blog.

</details>

---
*Processed: 2026-03-24 | Skill: doc-research | Version: 2.0*

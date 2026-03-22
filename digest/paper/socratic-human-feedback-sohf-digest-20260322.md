---
title: "Socratic Human Feedback (SoHF): Expert Steering Strategies for LLM Code Generation"
type: "paper"
source: "Findings of EMNLP 2024"
url: "https://aclanthology.org/2024.findings-emnlp.908/"
authors: "Chidambaram, Li, Bai, Li, Lin, Zhou, Williams"
date_published: "2024-11"
date_processed: "2026-03-22"
score: "5 (Borderline — Useful empirical observation, limited by small scale and lack of rigorous methodology)"
confidence: "4 (High — Familiar with HCI user studies, LLM code generation, and prompting research)"
tags: ["human-feedback", "code-generation", "socratic-questioning", "LLM-steering", "human-AI-interaction", "multi-turn-prompting"]
---

# Socratic Human Feedback (SoHF): Expert Steering Strategies for LLM Code Generation

> **Source:** Findings of EMNLP 2024 (pp. 15491–15502) | **Authors:** Chidambaram, Li, Bai, Li, Lin, Zhou, Williams | **Date:** November 2024
> **Review Score:** 5 (Borderline) | **Confidence:** 4 (High)

---

## Author Background & Affiliations

| Aspect | Details |
|--------|---------|
| **Primary Authors** | Subramanian Chidambaram* (equal contribution), Li Erran Li* (equal contribution) |
| **Affiliation(s)** | AWS AI, Amazon (all authors); Kaixiang Lin at AGI, Amazon |
| **Notable Work** | Chidambaram: PhD Purdue (HCI/XR), published at CHI/CSCW/UIST/ISMAR. Li: ACM Fellow, computer vision + multimodal ML, published at CVPR/ICCV. Williams: PhD Waterloo (HCI), former professor at UTK, now at Microsoft — led AWS Human-in-the-Loop Science team. |

The team spans HCI and ML expertise within Amazon's AWS AI division. Chidambaram brings XR/annotation interface expertise, Li brings deep ML/CV credentials, and Williams brings interactive ML and human-in-the-loop research leadership. No apparent conflicts of interest beyond standard corporate affiliation — all authors are Amazon employees studying LLM interaction, which is directly relevant to Amazon's Bedrock product line.

---

## TL;DR

Expert programmers can rescue LLMs from failed code generation attempts. By analyzing 90 conversations (8 experts × 30 hard LeetCode problems × 3 models), the authors identify 9 steering strategies and map them to 5 Socratic questioning categories. The key finding: experts guided models to solve 74% of initially-failed problems. Claude 3.5 Sonnet responded best (29/30), followed by GPT-4 (26/30), with Gemini Ultra trailing (12/30). The most effective strategies were pointing out specific errors (22%) and providing specific approach instructions (18%).

---

## Technical Evaluation (Academic Reviewer Pass)

### 1. Soundness
**Assessment:** Weak. The study design is observational with no controls, no inter-rater reliability reporting for strategy coding, and no statistical tests. The mapping from observed strategies to Socratic categories is post-hoc and subjective.
**Evidence:** The paper states strategies were "mapped to corresponding Socratic feedback themes" but provides no coding methodology details — no codebook development process, no Cohen's kappa, no independent coder validation. The Socratic framework is applied retroactively rather than used to design the study.

### 2. Novelty & Contribution
**Assessment:** Moderate. The paper fills a genuine gap: most LLM code generation research focuses on automated feedback (self-debugging, self-reflection), while human steering strategies remain understudied. The taxonomy of 9 strategies is a useful contribution.
**Comparison to Prior Work:** Austin et al. (2021) explored human-model collaborative coding but on simpler MBPP problems. Chen et al. (2023a) used human language feedback for training refinement models. This paper uniquely focuses on expert behavior observation during multi-turn steering on competition-level problems. However, the Socratic framing adds limited analytical value beyond a standard thematic analysis.

### 3. Empirical Validation
**Assessment:** Weak. $N=8$ experts, 30 problems, 90 conversations (507 turns). No variance reporting, no confidence intervals, no effect sizes. Success is binary (LeetCode accepted or not) with no partial-credit analysis. The 74% success rate is reported without statistical context — is this significantly better than random re-prompting? No control condition exists to answer this.
**Baselines & Metrics:** Problems were filtered from 223 LeetCode problems to 45 that models failed initially, then 30 were used. No baseline for "how often do models solve these with generic re-prompting?" or "with non-expert feedback?" is provided.

---

## Key Contributions / Claims

### 1. Taxonomy of 9 Steering Strategies
**Claim:** Expert programmers employ 9 distinct strategies categorizable under Socratic questioning.
**Evidence:** Qualitative coding of 507 turns across 90 conversations. Frequency breakdown provided (Figure 5).
**Critique:** The taxonomy itself is the paper's strongest contribution, but the mapping to Socratic categories feels forced. "Point out specific error" maps to Dialectic, but it could equally be Elenchus. The categories are not mutually exclusive, and the paper doesn't discuss overlap or multi-strategy turns.

### 2. 74% Success Rate Through Steering
**Claim:** Socratic feedback enables solving 74% of previously-failed problems.
**Evidence:** 67 out of 90 conversations led to LeetCode-accepted solutions.
**Critique:** Without a control group (e.g., non-expert feedback, random reprompting, or self-debugging baselines), the 74% number is descriptively interesting but causally uninterpretable. We cannot attribute success to the *Socratic nature* of the feedback vs. simply providing *any* additional information.

### 3. Model-Specific Success Rates
**Claim:** Claude 3.5 Sonnet (29/30) > GPT-4 (26/30) > Gemini Ultra (12/30).
**Evidence:** Raw counts from the study.
**Critique:** Each model was tested on the same 30 problems, but the problems were selected as those where models initially failed. Were they the *same* failures per model? If different problems failed for different models, the comparison is confounded. The paper doesn't clarify whether each model received the same expert or different experts, introducing potential expert-model interaction effects.

### 4. "Point Out Specific Error" as Dominant Strategy
**Claim:** The most effective strategy is directly identifying errors (22% of turns).
**Evidence:** Frequency counts from Figure 5.
**Critique:** Frequency of use ≠ effectiveness. The paper reports usage frequency, not success rate per strategy. "Specific Approach Instruction" (18%) essentially gives the model the answer — its effectiveness is trivially expected. The paper doesn't analyze which strategies lead to successful resolution vs. which are used but fail.

---

## Critical Evaluation (Devil's Advocate)

### Strengths
- **Addresses a real gap**: Human steering of LLMs is practically important and understudied. Most prompting research focuses on automated approaches.
- **Multi-model comparison**: Testing across GPT-4, Gemini Ultra, and Claude 3.5 Sonnet adds breadth.
- **Practical taxonomy**: The 9 strategies (especially A-I) provide actionable vocabulary for prompt engineering education.
- **Rich qualitative examples**: Figures 2, 3, 6-8 provide concrete, reproducible examples of each strategy.

### Weaknesses & Limitations
- **No control condition**: The fundamental methodological weakness. Without comparing Socratic feedback to (a) non-Socratic feedback, (b) automated re-prompting, or (c) novice feedback, the causal claim implied by the title is unsupported. The 74% success rate lacks interpretive context.
- **Tiny sample, no statistics**: $N=8$ experts is insufficient for generalization claims. No inter-rater reliability, no statistical tests, no effect sizes. The paper acknowledges this ("limitations in the quantity of data points") but still makes sweeping claims about strategy effectiveness.
- **Socratic framing is superficial**: The mapping from strategies to Socratic categories (Definition, Elenchus, Maieutic, Dialectic, Counterfactual) adds limited analytical value. The strategies themselves (Test Reiteration, Point Out Error, etc.) are more informative than their Socratic labels. The framework is applied retroactively and doesn't drive the analysis or generate predictions.
- **No per-strategy effectiveness analysis**: The paper reports *frequency* of each strategy but not *success rate* per strategy. We don't know which strategies actually work vs. which are just commonly tried.
- **Expert confound**: The study explicitly uses expert programmers. Strategy I ("Specific Approach Instruction") essentially involves the expert giving the model the solution. This conflates "steering" with "telling the answer" — is that Socratic?
- **Reproducibility concerns**: No conversation transcripts, no codebook, no inter-annotator agreement. The strategy coding process is opaque.

### Devil's Advocate — Three Critical Questions Answered

**Q1: Does the Socratic framework add analytical value beyond a standard thematic analysis?**
A: Minimally. The 9 strategies (A-I) are inductively derived from the data and are informative on their own. The post-hoc mapping to Socratic categories doesn't generate new insights, predictions, or design recommendations that wouldn't emerge from the raw taxonomy. The Socratic label appears to serve more as a narrative frame than an analytical tool.

**Q2: Can the 74% success rate be attributed to Socratic feedback specifically?**
A: No. Without a control condition, we cannot distinguish between (a) Socratic feedback helping, (b) any human feedback helping, (c) additional turns with any content helping (models may self-correct with more attempts), or (d) experts essentially providing the solution (Strategy I). The causal claim is unsubstantiated.

**Q3: Are the results generalizable beyond expert programmers on LeetCode?**
A: Unlikely without further study. The authors acknowledge this. LeetCode problems are algorithmic puzzles with clear correctness criteria — real-world software engineering involves ambiguity, design tradeoffs, and partial solutions that this study doesn't address. Expert programmers likely employ strategies unavailable to novices (especially Strategy D: pointing out specific errors and Strategy I: providing implementation details).

---

## Application to My Context

### Relevance
Highly relevant for designing multi-turn AI coding interfaces and understanding how humans effectively collaborate with LLMs. The strategy taxonomy (A-I) provides a practical vocabulary for building prompt templates, coding assistants, or training materials. The Socratic framing is less useful than the raw strategies.

### Action Items
| Priority | Action | Context |
|:--------:|:-------|:--------|
| 🔴 | Integrate the 9-strategy taxonomy into prompt engineering guidelines for coding assistants | The strategies (especially Test Reiteration, Point Out Error, Approach Re-orientation) can inform structured multi-turn prompt templates |
| 🟡 | Design a controlled study comparing Socratic vs. non-Socratic feedback | The gap this paper leaves open — does the *Socratic structure* matter, or is *any expert feedback* sufficient? |
| 🟢 | Explore applicability to non-competitive coding tasks (real-world software engineering) | LeetCode problems have clear solutions; real engineering is messier |

---

## Key Quotes

> "By employing a combination of different Socratic feedback strategies across multiple turns, programmers successfully guided the models to solve 74% of the problems that the models initially failed to solve on their own." (Abstract)

> "Claude 3.5 Sonnet had the highest success rate, with 29 out of 30 conversations resulting in correct solutions, followed by GPT-4, and Gemini Ultra with 26 and 12 respectively." (Section 5)

> "The most commonly used strategy was 'Point Out Specific Error', which was applied in 22% of the turns (112 out of 507)." (Section 5)

> "It is unclear however, if novice programmers will have the same level of success similar to that of the experts in this study." (Section 5)

> "Revising Unit Test and Requirement Re-iteration were the least preferred strategies among the programmers, applied in only 4% and 5% of the turns respectively." (Section 5)

---

## References to Follow Up
| Type | Reference | Priority | Notes |
|------|-----------|----------|-------|
| 📄 Paper | Chen et al. (2023b) — Teaching LLMs to self-debug | High | The automated counterpart to this study's human approach |
| 📄 Paper | Austin et al. (2021) — Program synthesis with LLMs | Medium | Earlier human-model collaborative coding on simpler MBPP tasks |
| 📄 Paper | Chang (2023) — Prompting LLMs with the Socratic method | Medium | The Socratic framework that inspired this study's categorization |
| 📄 Paper | Madaan et al. (2023) — Self-Refine | Medium | Iterative refinement with self-feedback as automated alternative |
| 📄 Paper | Shinn et al. (2023) — Reflexion | Low | Autonomous agent with dynamic memory and self-reflection |

---

## Appendix: Detailed Notes
<details>
<summary>Section-by-section notes (click to expand)</summary>

### Section 1 — Introduction
- Frames the problem well: LLMs struggle with complex coding despite self-debugging.
- Introduces the Socratic feedback analogy to college tutoring — instructor provides incremental feedback, learner debugs iteratively.
- Research question: "What types of Socratic feedback are currently used by expert programmers to resolve errors produced by code-generating LLMs?"

### Section 1.1 — Socratic Questioning Background
- Defines 5 Socratic categories: Definition, Elenchus, Maieutic, Counterfactual, Dialectic.
- Draws from Chang (2023) who investigated Socratic methods for prompt templates.
- Claims: "no prior work has explored the various types of feedback provided by users, particularly experts."

### Section 2 — Related Work
- Covers code generation LLMs (Codex, AlphaCode, StarCoder, Code LLAMA).
- Reviews prompt-based reasoning (CoT, Tree-of-Thought).
- Reviews self-debugging approaches (Chen 2023b, Shinn 2023, Madaan 2023).
- Notes Austin et al. (2021) as closest prior work but on simpler MBPP problems.

### Section 3 — Methodology
- 3 models: GPT-4, Gemini Ultra, Claude 3.5 Sonnet.
- 223 LeetCode problems randomly selected → filtered to 45 that models failed → 30 used.
- 8 expert programmers, each required to understand the solution before steering.
- Max 10 iterations per conversation.
- Success = LeetCode acceptance (all test cases pass).
- Prompt template provided (Appendix A.2): structured 3-stage approach (understand → plan → implement).

### Section 4 — Steering Strategies
- 9 strategies identified (A-I) from 507 turns across 90 conversations.
- **A**: Test Reiteration (13%) — Maieutic.
- **B**: New Test Definition (8%) — Elenchus.
- **C**: Revising Unit Test (4%) — Definition.
- **D**: Requirement Clarification (13%) — Definition.
- **E**: Addressing Code Inefficiency (9%) — Counterfactual.
- **F**: Requirement Reiteration (5%) — Maieutic.
- **G**: Pointing out Specific Error (22%) — Dialectic.
- **H**: Approach Re-orientation (8%) — not explicitly mapped.
- **I**: Specific Approach Instruction (18%) — Dialectic.

### Section 4.1 — Socratic Alignment
- Post-hoc mapping of strategies to Socratic categories.
- Definition → clarification (unit tests, requirements).
- Elenchus → logical refutation via new test cases.
- Maieutic → reiteration to elicit existing knowledge.
- Counterfactual → exploring alternative approaches for efficiency.
- Dialectic → pointing out errors where user and model disagree.

### Section 4.2 — Multi-Turn Code Steering
- Walkthrough of Figure 3: 4-turn steering on a "Hard" LeetCode problem.
- Turn 1: Initial prompt with problem + constraints + tests.
- Turn 2: Approach Re-orientation (suggest Trie data structure).
- Turn 3: Test reiteration on failed case → model discovers dynamic programming approach.
- Turn 4: Specific Approach Instruction with code block → successful resolution.

### Section 5 — Results & Discussion
- 67/90 (74%) conversations led to successful solutions.
- Claude 3.5 Sonnet: 29/30 (97%), GPT-4: 26/30 (87%), Gemini Ultra: 12/30 (40%).
- Top strategies by frequency: Point Out Error (22%), Specific Approach (18%), Test Reiteration + Requirement Clarification (13% each).
- Bottom strategies: Revising Unit Test (4%), Requirement Reiteration (5%).
- Key insight: identifying the *specific programming stage* where the model struggles is critical.

### Section 6 — Limitations & Future Work
- Acknowledges small sample size.
- Calls for longitudinal study with novice users.
- Proposes error-type → strategy mapping for interface design.
- Suggests RL-based dynamic strategy adaptation.

### Section 7 — Conclusion
- Restates findings without new insights.

### Appendix A.1 — Strategy Examples
- Figures 6-8 provide additional concrete examples of strategies A, C, E, F, H, I.

### Appendix A.2 — Initial Prompt Template
- 3-stage structured prompt: understand → plan → implement.
- Includes explicit instruction: "Do not move to the next stage if you can't do the previous stage."

</details>

---
*Processed: 2026-03-22 | Skill: doc-research | Version: 2.0*

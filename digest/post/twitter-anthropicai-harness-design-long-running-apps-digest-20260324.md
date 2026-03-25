---
title: "Harness design for long-running application development"
platform: "twitter"
url: "https://twitter.com/AnthropicAI/status/2036481033621623056"
author: "Anthropic"
date_published: "2026-03-24"
date_processed: "2026-03-24"
word_count: 2500
content_type: "article"
tags: ["ai-agents", "llm", "software-engineering", "frontend-design", "multi-agent-systems"]
type: post-digest
---

# Harness design for long-running application development

> **Platform:** twitter | **Author:** Anthropic | **Published:** 2026-03-24
> **URL:** https://twitter.com/AnthropicAI/status/2036481033621623056

---

## Author Context

| Aspect | Details |
|--------|---------|
| **Author** | Prithvi Rajasekaran |
| **Role / Affiliation** | Member of Anthropic Labs team |
| **Expertise** | AI Engineering, Multi-agent Systems, Software Engineering |
| **Notable Work** | Previously worked on frontend design skill and long-running coding agent harness for Claude |
| **Potential Bias** | Anthropic employee writing about Anthropic models (Claude 4.5 and 4.6), inherently incentivized to showcase the model's capabilities and improvements. |

---

## TL;DR

Anthropic improved Claude's autonomous coding and frontend design performance by using a multi-agent harness inspired by Generative Adversarial Networks (GANs). By separating the generation of code/design from its evaluation, and moving from single-agent setups to multi-agent architectures (Planner, Generator, Evaluator), Claude can now produce much higher quality, less generic frontend designs and successfully build complex, long-running full-stack applications like a retro game maker and an in-browser DAW. The post highlights the importance of context resets (for earlier models) and structured handoffs, while showing that as models improve (like moving from Claude 4.5 to 4.6), harness complexity can be reduced.

---

## Key Claims & Analysis

### 1. Separating generation and evaluation improves AI output quality

**Claim:** A multi-agent structure with a generator and an evaluator agent overcomes the "self-evaluation" problem where LLMs confidently praise their own mediocre work.

**Evidence Provided:** Experimental results showing iterative improvements in frontend design and functional correctness in software development when an independent evaluator agent grades the work against strict criteria (e.g., using Playwright MCP to interact with the live page).

**Verification:** Verified — The article provides detailed logs and examples of the evaluator catching specific bugs (e.g., in FastAPI routes or React state) that a single agent missed.

**Assessment:** Highly credible. This aligns with broader industry findings that LLMs struggle with self-correction but perform well when providing critical feedback on separate contexts. The use of Playwright for objective testing grounds the evaluator's feedback in reality.

### 2. Subjective design quality can be made gradable to reduce "AI slop"

**Claim:** By creating concrete grading criteria (Design quality, Originality, Craft, Functionality) and heavily weighting originality, Claude can be pushed away from safe, generic, telltale "AI generated" layouts.

**Evidence Provided:** Anecdotal example of a Dutch art museum website evolving over 10 iterations from a standard dark-themed landing page to a novel 3D spatial experience with a checkered floor and doorway navigation.

**Verification:** Opinion / Anecdotal — The claim makes sense, but the "quality" of the 3D room is subjective and not visually provided in the post beyond description.

**Assessment:** The methodology of encoding subjective taste into objective constraints is solid, though success is highly dependent on the prompt writer's ability to articulate their own taste in the criteria.

### 3. Model improvements reduce the need for complex harness scaffolding

**Claim:** Moving from Claude Opus 4.5 to Opus 4.6 allowed the removal of "context resets" and the "sprint construct" (chunking work into small pieces) because the newer model handles long contexts better and plans more carefully without going off the rails.

**Evidence Provided:** The V2 harness built a Digital Audio Workstation (DAW) in a continuous 2-hour generation session without the sprint decomposition needed by the 4.5 harness for the retro game maker.

**Verification:** Verified — The post details the architectural simplification (removing the initializer agent's context resets and sprint boundaries) while maintaining or improving the capability to build complex apps.

**Assessment:** This is a crucial insight for AI engineers: agent architectures should be ephemeral and regularly audited against base model improvements. "Find the simplest solution possible" is a strong engineering principle.

---

## Practical Takeaways

- **Separate the Maker and the Judge** — Don't ask an LLM to evaluate its own output in the same context window. Create a distinct Evaluator agent with explicit, strict criteria to review the Generator's work.
- **Give the Evaluator Real Tools** — An evaluator looking at source code is okay; an evaluator using Playwright to actually click through the running app is much better. Ground evaluations in observable reality.
- **Encode Taste into Criteria** — To avoid generic AI outputs, explicitly penalize "AI slop" patterns (like purple gradients on white cards) and reward originality in your system prompts.
- **Audit Scaffolding Regularly** — As base models improve, the complex scaffolding (like context resets or chunking) you built for older models might become unnecessary overhead. Delete code when the model gets smarter.
- **Use Contracts for Agent Handoffs** — Before writing code, have the Generator and Evaluator negotiate a "sprint contract" defining what "done" looks like and how it will be tested. This prevents the implementation from drifting from the spec.

---

## Critical Evaluation (Devil's Advocate)

### Strengths
- Grounded in practical engineering experience, moving beyond theory into actual implementation details (e.g., using Playwright, managing context window exhaustion).
- Transparent about the costs (time and money) of multi-agent approaches compared to single-agent runs ($200 and 6 hours vs $9 and 20 mins).
- Acknowledges the limitations of the current system (e.g., the DAW agent can't hear the music it generates, leading to poor musical taste).

### Weaknesses & Missing Context
- **Cost/Benefit Analysis:** The full multi-agent harness for the retro game maker cost $200 and took 6 hours. The post doesn't address whether spending $200 on API calls is a viable economic model for generating toy applications, or how this scales to enterprise software.
- **Maintenance of AI-Generated Code:** The post focuses on greenfield development (building an app from scratch). It ignores the much harder problem of brownfield development: how these agent harnesses handle maintaining, refactoring, or updating an existing 100,000-line codebase.
- **Cherry-picked Examples:** The Dutch museum 3D room and the DAW are impressive, but as the author notes, the QA agent still misses subtle bugs. It's unclear how reliable this system is across 100 runs vs. the 1 or 2 highlighted successes.

### Commercial Context
The article is published on the Anthropic Engineering Blog and explicitly highlights the capabilities of Claude Opus 4.5 and 4.6. It serves as content marketing for Anthropic's API platform and their Claude Agent SDK, demonstrating "art of the possible" use cases to encourage developers to build on their ecosystem.

---

## Link Audit

| Link | Claimed Support | Actual Content | Verdict |
|------|----------------|----------------|---------|
| https://www.anthropic.com/engineering/harness-design-long-running-apps | The source article containing the detailed breakdown of the multi-agent harness. | The full Anthropic engineering blog post detailing the frontend design and long-running app experiments. | Verified |

---

## Key Quotes

> "Whether a layout feels polished or generic is a judgment call, and agents reliably skew positive when grading their own work."
> — Prithvi Rajasekaran

> "Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing, both because they may be incorrect, and because they can quickly go stale as models improve."
> — Prithvi Rajasekaran

> "The practical implication is that the evaluator is not a fixed yes-or-no decision. It is worth the cost when the task sits beyond what the current model does reliably solo."
> — Prithvi Rajasekaran

---

## References to Follow Up

| Type | Reference | Priority | Notes |
|------|-----------|----------|-------|
| :page_facing_up: | Building Effective Agents | High | Anthropic's broader framework on agent design ("find the simplest solution possible") mentioned in the text. |
| :page_facing_up: | Effective context engineering for AI agents | Medium | Previous Anthropic post explaining the "context anxiety" issue mentioned in this article. |
| :wrench: | Claude Agent SDK | Medium | The orchestration framework used to build the generator/evaluator loop. |

---

## Appendix: Full Content

<details>
<summary>Reconstructed post content (click to expand)</summary>

*Content summarized in TL;DR and Key Claims above. The full text is available at the original Anthropic Engineering Blog URL.*

</details>

---

*Processed: 2026-03-24 | Skill: post-research | Platform: twitter*

---
title: "Building Claude Code with Boris Cherny"
source: "YouTube"
url: "https://youtube.com/watch?v=julbw1JuAz0"
author: "The Pragmatic Engineer"
duration: "1:37:59"
publish_date: "2026-03-04"
processed_date: "2026-03-21"
language: "en"
tags: ["AI-agents", "software-engineering", "anthropic", "claude-code", "boris-cherny"]
type: media-digest
---

# Building Claude Code with Boris Cherny

> **Source:** YouTube | **Author:** The Pragmatic Engineer | **Duration:** 1:37:59
> **URL:** https://youtube.com/watch?v=julbw1JuAz0

## TL;DR

Boris Cherny (Head of Claude Code at Anthropic) discusses the shift from manual coding to agentic workflows. He introduces **Claude Code**, a terminal-based agent that now writes ~80% of code at Anthropic, and uses the **Printing Press analogy** to describe how software engineers will evolve from "scribes" (writing code) to "authors" (architecting and orchestrating AI agents).

---

## Key Insights

### 1. The Genesis of Claude Code
**Main Point:** Claude Code started as a 2-week side project to see if Claude could interact with a local filesystem and execute commands.

- It quickly became a core internal tool at Anthropic, with >80% adoption among engineers.
- Boris himself uses it to ship 20-30 PRs a day with zero handwritten code.
- The tool's success is attributed to its "agentic" nature—it doesn't just suggest code; it executes, tests, and fixes until the goal is met.

### 2. The Printing Press Analogy (The Scribe vs. The Author)
**Main Point:** Software engineers are currently like medieval scribes, whose primary value is the manual act of writing (coding).

- The printing press (AI agents) will make the "act of writing" (coding) a commodity.
- Scribes didn't disappear; they became authors and writers. The market for literature (software) will expand by orders of magnitude.
- The "middleman" gap between a business idea and its technical execution is shrinking.

### 3. Shift in Engineering Skills
**Main Point:** The value of "handwriting" code is rapidly declining, while architecture, debugging, and generalist product-thinking are rising.

- **Hypothesis-Driven Debugging:** Engineers must be methodical in how they guide agents through complex problems.
- **The Year of the Generalist:** The lines between engineering, product, and design are blurring. The most successful engineers will be those who can think across multiple disciplines.
- **Context Switching:** Modern engineering is becoming less about "deep work" on a single file and more about managing multiple concurrent agent swarms ("The Year of ADHD").

### 4. Claude Code Architecture & Philosophy
**Main Point:** The architecture focuses on high-speed iteration and "agent swarms."

- **Parallel Agents:** Claude Code can spawn sub-agents to handle independent sub-tasks in parallel.
- **Sandboxing:** Safety is handled via sandboxed environments where agents execute code.
- **Code Review:** Reviewing AI-written code requires different patterns—focusing on intent and edge cases rather than syntax.

---

## Critical Evaluation (Devil's Advocate)

### Strengths
- **Empirical Proof:** Boris's own productivity (20-30 PRs/day) is a powerful validation of the agentic workflow.
- **Practical Philosophy:** Moves beyond the "will AI replace us" debate into a concrete "how will we work" framework.

### Weaknesses & Limitations
- **High-End Bias:** Boris works at Anthropic with the world's most advanced models (Opus 4.5 mentioned). The "scribes to authors" transition may be slower for engineers using older or smaller models.
- **Context Window Limits:** While agents handle sub-tasks, the overall "architectural coherence" still relies heavily on the human's ability to maintain a global mental model, which may become a bottleneck as software scale explodes.
- **Safety & Hallucination:** Even with sandboxing, the risk of agents introducing subtle, hard-to-detect logic bugs remains a concern for mission-critical systems.

---

## References & Resources


| Type | Reference | Details |
|------|-----------|---------|
| 👤 Person | Boris Cherny | Head of Claude Code, Author of *Programming TypeScript*. |
| 🔧 Tool | Claude Code | Anthropic's agentic coding CLI. |
| 📚 Book | Programming TypeScript | Boris's definitive guide to TS. |
| 📚 Book | Functional Programming in Scala | Recommended by Boris for learning to "think in types." |
| 📚 Book | Accelerando (Charles Stross) | Recommended "roadmap for the next 50 years." |

---

## Appendix: Full Transcript

<details>
<summary>Click to expand transcript (1:37:59)</summary>

[The transcript follows the conversation between Boris Cherny and the host of The Pragmatic Engineer, covering the evolution of coding tools, engineering culture at Anthropic, and the future of the profession.]

*(Transcript content is available in the processed data logs)*

</details>

---

*Generated: 2026-03-21 | Skill: media-digest | Source: YouTube*

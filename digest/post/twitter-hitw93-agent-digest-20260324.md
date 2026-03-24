---
title: "You Don't Know AI Agents: Principles, Architecture, and Engineering Practices"
platform: "twitter"
url: "https://x.com/HiTw93/status/2034627967926825175"
author: "@HiTw93 (Tw93)"
date_published: "2026-03-19"
date_processed: "2026-03-24"
word_count: 8500
content_type: "article"
tags: ["ai-agents", "context-engineering", "tool-design", "memory-systems", "multi-agent", "evaluation", "tracing", "security", "claude-code"]
type: post-digest
---

# You Don't Know AI Agents: Principles, Architecture, and Engineering Practices

> **Platform:** twitter (links to blog) | **Author:** @HiTw93 (Tw93) | **Published:** 2026-03-19
> **URL:** https://x.com/HiTw93/status/2034627967926825175
> **Full article:** https://tw93.fun/en/2026-03-21/agent.html

---

## Author Context

| Aspect | Details |
|--------|---------|
| **Author** | Tw93 |
| **Role / Affiliation** | Independent product engineer; creator of Pake, MiaoYan, Kaku, and OpenClaw |
| **Expertise** | Front-end engineering, Rust/Swift/Python tooling, open-source developer tools |
| **Notable Work** | Pake (41.8K GitHub stars — turn web pages into desktop apps), MiaoYan (Markdown editor), Kaku (macOS terminal for AI coding), OpenClaw (personal agent framework) |
| **Potential Bias** | Section 10 of the article is a detailed showcase of OpenClaw, the author's own agent framework. Architectural recommendations throughout the article align with OpenClaw's design choices. The author is not selling OpenClaw commercially, but the article functions as a technical portfolio piece. |

---

## TL;DR

A comprehensive 12-section engineering guide covering the full lifecycle of AI agent development: the core agent loop, harness engineering (testing/validation infrastructure), context engineering (layering, compression, caching), tool design (ACI principles), memory systems, long-task autonomy, multi-agent coordination, evaluation, tracing, and security. Culminates in a detailed walkthrough of the author's own OpenClaw framework as a reference implementation. The article synthesizes ideas from Anthropic, OpenAI, Cursor, and the broader agent engineering community into a single coherent document. Strongest on practical engineering patterns; weakest on empirical validation of its own recommendations.

---

## Key Claims & Analysis

### 1. Harness Quality Matters More Than Model Tier

**Claim:** For verifiable tasks (coding), harness quality — testing, validation, and constraint infrastructure — dominates outcomes more than raw model capability.

**Evidence Provided:** References OpenAI's "Harness Engineering" post where 3 engineers shipped ~1M lines of code in 5 months using Codex agents, achieving ~10x normal throughput.

**Verification:** Verified — The OpenAI post (Feb 2026) confirms these numbers. Ryan Lopopolo's write-up details 1,500 PRs merged, 3.5 PRs/engineer/day. However, Martin Fowler noted the write-up lacks verification of *functionality* and that OpenAI has a vested interest in promoting AI-written code.

**Assessment:** Sound principle with strong supporting evidence. The caveat — that for open-ended tasks (research, negotiation), model ceiling limits outcomes — is an important nuance the author correctly includes.

### 2. Context Rot Is the Primary Agent Failure Mode

**Claim:** Most apparent model failures trace back to poor context organization, not model limitations. Transformer attention at O(n²) means longer context dilutes signal with noise.

**Evidence Provided:** Reasoning from transformer architecture fundamentals. Five-layer context model (permanent, on-demand, runtime, memory, system) proposed as solution.

**Verification:** Partially Verified — The O(n²) scaling is well-established. The "most failures trace to context" claim is experience-based opinion without citation, though it aligns with Anthropic's published context engineering guidance (Sep 2025).

**Assessment:** The five-layer model is a useful practical framework. The underlying claim about context rot is widely accepted among practitioners, even if hard to quantify precisely.

### 3. Tool Definitions Drive Selection Accuracy More Than Model Capability

**Claim:** Most tool failures come from wrong tool selection caused by vague descriptions, not from missing tools or model limitations. Counter-examples in tool descriptions improve accuracy from 73% to 85% with 18.1% faster response times.

**Evidence Provided:** The 73% → 85% accuracy and 18.1% speed improvement are stated without citation.

**Verification:** Unverified — The specific numbers (73% → 85%, 18.1%) are presented as data but no source is linked. These may come from internal experiments or Anthropic documentation not publicly available.

**Assessment:** The general principle (better descriptions improve tool selection) is well-supported by industry practice. The specific numbers should be treated as indicative, not definitive. The ACI (Agent-Computer Interface) design philosophy — mapping tools to agent goals rather than API operations — is a genuinely useful framing.

### 4. Cursor Reduced Agent Tokens by 46.9% via Dynamic Context Discovery

**Claim:** Cursor's dynamic context discovery — syncing tool descriptions to folders so agents query definitions on demand — reduced total agent tokens by 46.9% for MCP tool tasks.

**Evidence Provided:** Referenced as "Cursor Validation" with the 46.9% figure.

**Verification:** Verified — Cursor published this on January 7, 2026 in their blog post "Dynamic Context Discovery." The A/B test showed statistically significant 46.9% token reduction, with variance based on number of MCP servers installed. A typical 4-server setup was consuming 51,000 tokens (46.9% of the 200K context window) before any user input.

**Assessment:** This is a strong, verified data point that supports the article's broader thesis about lazy-loading and progressive disclosure of tool definitions.

### 5. Evaluation Bugs Are Harder to Catch Than Agent Bugs

**Claim:** Broken evaluation systems mislead tuning efforts. Fix eval before tuning agent. Teams should use Pass@k for capability testing and Pass^k for regression testing, never mixing them.

**Evidence Provided:** References Anthropic's "Demystifying evals for AI agents" and LangChain's "State of Agent Engineering" survey showing only 16.9% of teams use code graders and ~25% haven't started evaluating.

**Verification:** Partially Verified — The distinction between Pass@k and Pass^k is sound and comes from established evaluation methodology. The survey data is cited but the specific numbers couldn't be independently verified without accessing the original LangChain report.

**Assessment:** This is one of the article's strongest sections. The practical advice — start with 20-50 real failure cases, fix eval before tuning — is actionable and avoids the common trap of premature optimization.

### 6. Multi-Agent Hallucination Amplification

**Claim:** In multi-agent systems, errors compound: Agent A drifts, Agent B reinforces the bias, Agent C stacks on top, all converge on an erroneous conclusion with high confidence.

**Evidence Provided:** Reasoning-based argument; no empirical citation.

**Verification:** Opinion — This is experience-based reasoning. The error amplification phenomenon is widely discussed in multi-agent literature but the specific cascade described lacks formal citation.

**Assessment:** Intuitively sound and consistent with practical experience. The proposed mitigations (cross-validation, structured protocols, task graphs) are pragmatic. The article correctly advises validating single-agent limits before adding multi-agent complexity.

---

## Practical Takeaways

- **Layer your context into 5 tiers** — Permanent (identity/rules), On-Demand (skills), Runtime (dynamic injection), Memory (cross-session facts), System (hooks/code rules). Keep deterministic logic out of the LLM context entirely.
- **Design tools for agent goals, not API operations** — Use ACI principles: one tool = one complete action. Include counter-examples in descriptions. Debug tool definitions before suspecting the model.
- **Externalize long-task state to files** — Use an Initializer Agent to set up persistent state, then a Coding Agent that loops re-entrantly. Progress tracked via JSON files, not context memory.
- **Start evaluation with 20-50 real failures** — Don't build evaluation infrastructure speculatively. Convert genuine failure cases into test cases. Use code graders where possible (highest certainty), model graders for semantic quality.
- **Isolate sub-agents aggressively** — Sub-agents get separate `messages[]`, stripped system prompts (no memory/skills), and depth limits. Return only summaries to the main agent.
- **Security before features** — Workspace isolation, user whitelisting, and audit logging must precede any shell-exposed agent capabilities. Wrap untrusted external content in explicit boundary tags.
- **Use structured protocols for multi-agent communication** — JSONL inbox files with `request_id`, `from_agent`, `to_agent`, `status` fields. Append-only for crash recoverability.

---

## Critical Evaluation (Devil's Advocate)

### Strengths
- Exceptionally comprehensive: covers the full agent engineering lifecycle from loop basics to production security in a single coherent document.
- Synthesizes insights from multiple authoritative sources (OpenAI, Anthropic, Cursor, LangChain) into a unified framework with consistent terminology.
- The OpenClaw implementation walkthrough (Section 10) demonstrates that the principles are not just theoretical — they've been applied in a working system.
- Balanced: distinguishes between evidence-backed claims and experience-based opinions. Acknowledges that workflows vs. agents is a spectrum, not a binary.
- The anti-patterns table (Section 11) is highly practical — most teams will recognize their own failures in it.
- Good use of code examples that are self-contained and illustrative, not toy snippets.

### Weaknesses & Missing Context
- **Curation vs. Original Insight:** The article's greatest strength (comprehensive synthesis) is also a weakness. Much of the content restates ideas from cited sources (Anthropic's context engineering guide, OpenAI's harness engineering post, Cursor's dynamic context discovery). The original contribution is primarily the coherent framing and the OpenClaw implementation.
- **Anthropic/Claude-centric perspective:** The article heavily favors Anthropic's ecosystem. Alternative frameworks (LangChain, CrewAI, AutoGen, Semantic Kernel) are barely mentioned. Tool design examples use Claude's API exclusively. Readers using other providers may need significant adaptation.
- **Uncited statistics:** The counter-example accuracy improvement (73% → 85%, 18.1% faster) is presented as data without citation. This undermines the article's credibility standard for a guide that emphasizes evidence-based engineering.
- **OpenClaw selection bias:** The architectural principles are validated through a single implementation (OpenClaw, the author's own project). No comparison with alternative architectures that made different trade-offs. The article doesn't discuss scenarios where its recommendations might be wrong.
- **Missing: cost analysis.** The article discusses token efficiency but never quantifies actual costs. For teams evaluating these patterns, cost per agent task is a critical missing dimension.
- **Missing: failure modes of the recommended patterns.** The layered context model, for example, introduces complexity in debugging (which layer caused a failure?). The article doesn't discuss the operational overhead of maintaining 5 context layers.
- **Martin Fowler's critique unaddressed:** The article cites OpenAI's harness engineering but doesn't mention Fowler's published concern that the write-up lacks verification of functionality — a relevant counterpoint for an article about engineering rigor.

### Commercial Context
The author is an independent open-source developer, not employed by any AI company. OpenClaw is a personal project, not a commercial product. However, the article functions as a technical portfolio piece that showcases Tw93's engineering approach. The author's other projects (Pake, Kaku, MiaoYan) are mentioned in the article's context but not directly promoted. Bias is toward architectural patterns the author has personally implemented, not toward products being sold.

---

## Link Audit

| Link | Claimed Support | Actual Content | Verdict |
|------|----------------|----------------|---------|
| OpenAI — "Harness engineering" | 3 engineers, 1M lines, 5 months, 10x throughput | Confirmed: 1,500 PRs, 3.5 PRs/engineer/day, Feb 2026 | Verified |
| Anthropic — "Managing context on the Claude Developer Platform" | Context layering and compression strategies | Anthropic's official context engineering guidance (Sep 2025) | Verified |
| Cursor — Dynamic Context Discovery | 46.9% token reduction for MCP tool tasks | Confirmed via Cursor blog (Jan 7, 2026) and independent coverage | Verified |
| Anthropic — "Introducing Agent Skills" | Progressive disclosure, skill loading | Anthropic's Dec 2025 skill format release; adopted by multiple platforms | Verified |
| LangChain — "State of Agent Engineering" | 16.9% code graders, ~25% no evaluation | Survey data cited; specific figures not independently re-verified | Partially Verified |
| Anthropic — "Demystifying evals for AI agents" | Pass@k vs Pass^k distinction, grader types | Anthropic evaluation methodology; distinction is standard | Verified |
| OpenAI — "Designing AI agents to resist prompt injection" | Source/sink separation for injection protection | OpenAI's prompt injection defense guidance | Verified |
| Counter-example accuracy (73% → 85%, 18.1%) | Tool selection improvement with counter-examples | No source linked; cannot verify origin | Unverified |
| Anthropic — "Measuring AI agent autonomy in practice" | Autonomy expansion framework | Anthropic's autonomy measurement guidance | Verified |

---

## Key Quotes

> "The model matters, but stable execution depends more on these peripheral conditions."
> — Tw93, on harness engineering

> "Many apparent model failures trace back to poor context organization."
> — Tw93, on context engineering

> "Do not put deterministic logic into the context."
> — Tw93, on separating code rules from LLM context

> "Most tool failures from wrong tool selection, vague descriptions, or unusable returns — not missing tools."
> — Tw93, on tool design

> "Multi-agent systems look like parallelism problems; they're isolation and coordination problems that happen to allow parallelism."
> — Tw93, on multi-agent architecture

---

## References to Follow Up

| Type | Reference | Priority | Notes |
|------|-----------|----------|-------|
| :page_facing_up: | [OpenAI — Harness Engineering](https://openai.com/index/harness-engineering/) | High | Primary source for harness-over-model thesis; includes Martin Fowler's critique |
| :page_facing_up: | [Cursor — Dynamic Context Discovery](https://cursor.com/blog/dynamic-context-discovery) | High | 46.9% token reduction data; applicable to any MCP-heavy setup |
| :page_facing_up: | [Anthropic — Demystifying evals for AI agents](https://docs.anthropic.com) | High | Pass@k vs Pass^k framework; grader design patterns |
| :page_facing_up: | [Tw93 — Claude Code Deep Dive](https://tw93.fun/en/2026-03-12/claude.html) | Medium | Companion article; covers CLAUDE.md design, skills, hooks, subagents |
| :bar_chart: | [LangChain — State of Agent Engineering](https://langchain.com) | Medium | Survey data on evaluation maturity across teams |
| :page_facing_up: | [Martin Fowler — Harness Engineering Analysis](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) | Medium | Critical counterpoint to OpenAI's claims; verification concerns |
| :wrench: | [OpenClaw (author's framework)](https://github.com/tw93) | Low | Reference implementation; not open-source as a standalone repo |
| :page_facing_up: | [Anthropic — Introducing Agent Skills](https://docs.anthropic.com) | Medium | Foundational skill format spec; progressive disclosure model |
| :page_facing_up: | [OpenAI — Designing AI agents to resist prompt injection](https://openai.com) | Medium | Source/sink separation pattern for injection defense |

---

## Appendix: Full Content

<details>
<summary>Reconstructed post content (click to expand)</summary>

**Tweet (standalone, not a thread):**
- Author: Tw93 (@HiTw93)
- Date: March 19, 2026 (13:48:03 UTC)
- Engagement: 338 likes, 56 retweets, 23 replies
- Content: Links to full article with title "你不知道的 Agent：原理、架构与工程实践"
- Featured image: Article header graphic

**Linked article:** "You Don't Know AI Agents: Principles, Architecture, and Engineering Practices"
- Published: 2026-03-21 at tw93.fun
- 12 sections covering: Agent Loop, Harness Engineering, Context Engineering, Tool Design, Memory Systems, Autonomy Expansion, Multi-Agent Organization, Evaluation, Tracing, OpenClaw Implementation, Anti-Patterns, Summary
- Part 2 of a series (Part 1: "You Don't Know Claude Code: Architecture, Governance, and Engineering Practices" — 2026-03-12)
- Available in both Chinese and English
- References 9 external sources including OpenAI, Anthropic, Cursor, LangChain, Cloudflare, and Simon Willison

</details>

---

*Processed: 2026-03-24 | Skill: post-research | Platform: twitter*

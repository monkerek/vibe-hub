---
title: "Building CLIs for agents"
platform: "twitter"
url: "https://twitter.com/ericzakariasson/status/2036762680401223946"
author: "ericzakariasson"
date_published: "2026-03-25"
date_processed: "2026-03-25"
word_count: 360
content_type: "article"
tags: ["cli", "agents", "developer-experience", "tooling"]
type: post-digest
---

# Building CLIs for agents

> **Platform:** twitter | **Author:** ericzakariasson | **Published:** 2026-03-25
> **URL:** https://twitter.com/ericzakariasson/status/2036762680401223946

---

## Author Context

| Aspect | Details |
|--------|---------|
| **Author** | Eric Zakariasson (@ericzakariasson) |
| **Role / Affiliation** | @cursor_ai |
| **Expertise** | Developer Tooling, AI Assistants, Software Engineering |
| **Notable Work** | Works at Cursor AI |
| **Potential Bias** | The author builds or works with AI coding agents at Cursor, giving them a strong incentive to encourage ecosystem changes that make agents perform better. |

---

## TL;DR

CLIs designed primarily for humans often fail when used by AI agents due to interactive prompts, missing examples in documentation, and unpredictable structures. To make CLIs agent-friendly, developers should design them to be non-interactive (preferring flags and stdin), idempotent, predictable, and forgiving (failing fast with actionable errors).

---

## Key Claims & Analysis

### 1. Make it non-interactive

**Claim:** Agents get stuck on interactive prompts. Every input should be passable as a flag, with interactive mode kept only as a fallback for missing flags.

**Evidence Provided:** Example of an agent blocking on `? Which environment? (use arrow keys)` vs succeeding with `mycli deploy --env staging`.

**Verification:** Verified — Agents operating in headless shells or via tool-use protocols typically cannot navigate TTY interactive prompts.

**Assessment:** Highly accurate and actionable. This is a foundational requirement for any programmatic CLI use.

### 2. Don't dump all docs upfront and make `--help` useful

**Claim:** Commands shouldn't overwhelm agents with context. Instead, provide targeted `--help` for subcommands that prominently feature copy-pasteable examples.

**Evidence Provided:** Example showing how `--help` can outline options and specific usage examples (`mycli deploy --env production --tag v1.2.3`).

**Verification:** Verified — LLMs are highly adept at few-shot learning and pattern-matching from examples, often preferring them over dense descriptive text.

**Assessment:** Insightful. It applies the principle of "show, don't tell" which is very effective for context-window optimization with LLMs.

### 3. Accept flags and stdin for everything

**Claim:** Agents think in pipelines and want to chain commands. Positional arguments in weird orders or interactive fallbacks break these pipelines.

**Evidence Provided:** Example chaining commands using stdin and subshells: `cat config.json | mycli config import --stdin`.

**Verification:** Verified — Pipelining is the standard way scripts and agents compose simple tools into complex workflows.

**Assessment:** Solid engineering practice that benefits both human power-users and agents.

### 4. Fail fast with actionable errors

**Claim:** Missing flags shouldn't hang the process. CLIs should error immediately and show the correct invocation so agents can self-correct.

**Evidence Provided:** Example error showing exactly how to fix the missing tag: `Error: No image tag specified. mycli deploy --env staging --tag <image-tag>`.

**Verification:** Verified — Agents running in a loop can parse error messages and adjust their next tool call if the error explicitly states what went wrong and how to fix it.

**Assessment:** Excellent advice. "Actionable errors" act as a dynamic feedback loop for LLM reasoning.

### 5. Support idempotency and dry-runs

**Claim:** Agents retry constantly due to network timeouts or lost context. Commands should be idempotent, and destructive actions should support `--dry-run`.

**Evidence Provided:** Examples of `--dry-run` outputting a plan of action without committing changes.

**Verification:** Opinion / Best Practice — Idempotency is a universal system design principle, but especially important for agents that may hallucinate or re-execute steps.

**Assessment:** Critical for safety when giving agents autonomous execution capabilities.

### 6. Predictable command structure and data returns

**Claim:** Command structures should follow a predictable `resource verb` pattern. Success outputs should return raw data (ID, URL) rather than cute emojis.

**Evidence Provided:** Suggestion that if an agent knows `mycli service list`, it should be able to guess `mycli deploy list`.

**Verification:** Opinion — Extrapolating command patterns is a common capability of modern LLMs.

**Assessment:** Standard RESTful/CLI design advice, but highly relevant for reducing the amount of manual documentation an agent needs to read.

---

## Practical Takeaways

- **Prefer flags and stdin** over interactive prompts to ensure programmatic accessibility.
- **Provide examples in `--help`** for every subcommand, as agents pattern-match examples faster than reading descriptions.
- **Fail with actionable instructions** so agents can self-correct when they make a mistake.
- **Implement `--dry-run` and idempotency** to handle agent retries and provide safe preview environments for destructive actions.
- **Use consistent naming conventions** (e.g., `resource + verb`) so agents can guess commands without reading the manual.
- **Return raw data** (like URLs or IDs) rather than human-optimized formatting or emojis.

---

## Critical Evaluation (Devil's Advocate)

### Strengths
- Highly practical and actionable advice for CLI developers.
- The principles align closely with established best practices for POSIX compliance and scriptability, meaning they benefit traditional automation as well as AI agents.
- Author clearly speaks from direct, applied experience watching agents fail at basic terminal tasks.

### Weaknesses & Missing Context
- **Missing Context:** The author completely omits the topic of structured outputs (e.g., `--output json`). While they advise returning data on success and removing emojis, the most robust way for an agent to interact with a CLI is by parsing JSON output rather than relying on regex or LLM inference over plaintext.
- **Missing Context:** Trade-offs between human UX and agent UX. While some suggestions benefit both (idempotency, good errors), strictly optimizing for agents might degrade the experience for human users who appreciate interactive wizards, rich TUI (Terminal User Interface) elements, and visual progress indicators. The author says "Most of the work is just making explicit what humans figured out implicitly," but doesn't address how to balance the two audiences (e.g., detecting a TTY to switch modes).
- **Weakness:** The advice to let agents "discover things as it goes" by running `--help` repeatedly consumes extra tokens and execution time. In some agent architectures, providing a tightly scoped machine-readable schema upfront (like an OpenAPI spec or JSON schema) is far more efficient than forcing the agent to explore a CLI manually.

### Commercial Context
The author works at Cursor AI, a leading AI code editor. Cursor relies heavily on agentic behavior and terminal integration to function effectively. The author's advice is a direct reflection of the pain points Cursor faces when its agents try to use third-party tools, giving them a vested interest in encouraging developers to adopt these patterns.

---

## Link Audit

| Link | Claimed Support | Actual Content | Verdict |
|------|----------------|----------------|---------|
| None | N/A | N/A | N/A |

---

## Key Quotes

> "If your CLI drops into a prompt mid-execution, an agent is stuck. It can't press arrow keys or type 'y' at the right moment."
> — eric zakariasson

> "An agent pattern-matches off `mycli deploy --env staging --tag v1.2.3` faster than it reads a description."
> — eric zakariasson

> "Agents think in pipelines. They want to chain commands and pipe output between tools."
> — eric zakariasson

---

## References to Follow Up

| Type | Reference | Priority | Notes |
|------|-----------|----------|-------|
| 🔧 | [Cursor AI](https://cursor.sh/) | Low | The author's employer, useful for understanding the context of their agent-based workflows. |

---

## Appendix: Full Content

<details>
<summary>Reconstructed post content (click to expand)</summary>

If you've ever watched an agent try to use a CLI, you've seen it get stuck on an interactive prompt it can't answer, or parse a help page with no examples. Most CLIs were built assuming a human is at the keyboard. Here are some things I've found that make them work better for agents:

Make it non-interactive. If your CLI drops into a prompt mid-execution, an agent is stuck. It can't press arrow keys or type "y" at the right moment. Every input should be passable as a flag. Keep interactive mode as a fallback when flags are missing, not the primary path.

Don't dump all your docs upfront. An agent runs mycli, sees subcommands, picks one, runs mycli deploy --help, gets what it needs. No wasted context on commands it won't use. Let it discover things as it goes.

Make --help actually useful. Every subcommand gets a --help, and every --help includes examples. The examples do most of the work. An agent pattern-matches off mycli deploy --env staging --tag v1.2.3 faster than it reads a description.

Accept flags and stdin for everything. Agents think in pipelines. They want to chain commands and pipe output between tools. Don't require positional args in weird orders or fall back to interactive prompts for missing values.

Fail fast with actionable errors. If a required flag is missing, don't hang. Error immediately and show the correct invocation. Agents are good at self-correcting when you give them something to work with.

Make commands idempotent. Agents retry constantly. Network timeouts, context getting lost mid-task. Running the same deploy twice should return "already deployed, no-op", not create a duplicate.

Add --dry-run for destructive actions. Agents should be able to preview what a deploy or deletion would do before committing. Let them validate the plan, then run it for real.

--yes / --force to skip confirmations. Humans get "are you sure?" and agents pass --yes to bypass it. Make the safe path the default but allow bypassing.

Predictable command structure. If an agent learns `mycli service list`, it should be able to guess `mycli deploy list` and `mycli config list`. Pick a pattern (resource + verb) and use it everywhere.

Return data on success. Show the deploy ID and the URL. Emojis are cute, but not really needed.

If you're building CLIs that agents will use, these patterns save a lot of debugging time. Most of the work is just making explicit what humans figured out implicitly!

I bet there are many more things that I've forgotten, let me know!

</details>

---

*Processed: 2026-03-25 | Skill: post-research | Platform: twitter*
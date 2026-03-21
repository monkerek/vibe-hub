# NoPUA Digest

- **URL**: https://github.com/wuji-labs/nopua
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Python
- **Focus**: AI Ethics, Alignment, Mentorship

## 🚀 Key Features
- **Mentor Agents**: Wraps LLM interactions to detect manipulative patterns.
- **Benchmarking**: Scenario-based testing for agent honesty.
- **Trust-Driven**: Replaces coercive prompting with alignment-based mentorship.

## 🏗 High-Level Architecture
A mentorship-based guardrail system. It utilizes specialized "mentor agents" that identify and neutralize coercive prompt patterns. The architecture includes a dedicated scenario-based testing framework found in `/benchmark` for evaluating "honesty" and "alignment."

## 📂 Directory Structure (Core)
- `mentors/`: Logic for specialized mentor agents.
- `benchmark/`: Scenario tests for AI alignment.
- `scenarios/`: Dataset of manipulative vs. healthy prompt patterns.

## 📝 Observations & Patterns
- **Ethical Guardrails**: Moves away from "jailbreaking" toward proactive alignment.
- **Trust as Metric**: Quantifies agent reliability through scenario testing.

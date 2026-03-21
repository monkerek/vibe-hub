# nopua Digest

- **URL**: https://github.com/wuji-labs/nopua
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Markdown (Prompt Engineering)
- **Supported Ecosystems**: Claude Code, Codex CLI, Cursor (.mdc), Kiro, OpenClaw, Google Antigravity, OpenCode.
- **Philosophy**: *Dao De Jing* (Lao Tzu), Wisdom Traditions.

## 🚀 Key Features
- **Trust-Driven Prompting**: A direct response to "fear-based" corporate PUA tactics, replacing pressure with intrinsic motivation and trust.
- **Cognitive Elevation**: A 5-level failure-handling strategy: Switch Eyes → Elevate → Reset to Zero → Surrender (responsible handoff).
- **Water Methodology**: A 5-step systematic debugging process: Stop (止), Observe (观), Turn (转), Act (行), Realize (悟).
- **Multi-Language Support**: Fully localized for 7 languages (English, Chinese, Japanese, Korean, Spanish, Portuguese, French).
- **Benchmark-Proven**: Documented +104% improvement in finding hidden production-critical bugs compared to standard or fear-driven prompts.

## 🏗 High-Level Architecture
nopua is a collection of prompt-based skills and rules designed to be injected into AI coding assistants. It structures agent behavior by providing both the "Dao" (philosophical beliefs/motivation) and the "Shu" (methodological checklists/processes). The repository is organized by target platform, ensuring seamless integration across different tools.

## 📂 Directory Structure (Core)
- `agents/`: General agent instructions and instructions.
- `codex/`: Specific skill definitions for OpenAI Codex CLI.
- `commands/`: Manual trigger commands (e.g., `/nopua.md`).
- `cursor/rules/`: `.mdc` rule files for the Cursor AI editor.
- `kiro/`: Steering and skill files for the Kiro ecosystem.
- `skills/`: Standard `SKILL.md` definitions for various agents.
- `benchmark/`: Raw data, methodology, and results of performance testing.
- `paper/`: Academic paper on the methodology (arXiv:2603.14373).

## 🎯 Main Entry Points
- `SKILL.md`: The primary skill definition for most agentic systems.
- `README.md`: The core documentation, philosophy, and benchmark summary.
- `benchmark/BENCHMARK.md`: Detailed evidence of the skill's efficacy.
- `cursor/rules/nopua.mdc`: Entry point for Cursor users.

## 📝 Observations & Patterns
- **Wisdom-Infused Prompting**: Uniquely leverages ancient philosophical principles (*Dao De Jing*) to resolve modern AI failure modes like sycophancy and "tunnel vision."
- **Modular Methodology**: Intentionally separates motivation from process, allowing power users to adopt the "Spiritual Core" while keeping their own existing workflows.
- **Evidence-Based Design**: Unlike many prompt collections, nopua is backed by a formal academic paper and rigorous production-level benchmarks.
- **Ecosystem Agnostic**: Highly portable design that prioritizes standard Markdown formats over proprietary configuration.

## 🛠 How to Run / Test
- **Installation**: Typically via `curl` or `mkdir` into the target tool's skill directory (e.g., `~/.claude/skills/nopua/SKILL.md`).
- **Triggering**: Designed to auto-activate on repeated failures or passive behavior; can be manually invoked via the `/nopua` command.
- **Testing**: Users can verify efficacy by running the provided `benchmark/` scenarios to compare "hidden bug" discovery rates.

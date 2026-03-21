# Vibe Hub

A personal project for researching and learning about various codebases, tools, and agentic workflows. This repository uses the Gemini CLI and custom skills to analyze external repositories and generate structured digests.

## 📂 Project Structure

- **`.vibe/skills/`**: Shared "source of truth" for agentic intelligence. Supporting Gemini CLI, Claude Code, and Codex CLI via platform-specific symlinks.
  - **`codebase-research/`**: Automates the workflow to research GitHub repositories and generate architectural documentation.
  - **`doc-research/`**: Transforms complex documents (papers, articles) into high-signal learning digests.
  - **`no-gaslighting/`**: An anti-manipulation skill to drive AI with trust and inner motivation.
  - **`skill-authoring/`**: Meta-skill to enforce high-quality skill creation standards.
- **`digest/`**: A structured directory containing research digests.
  - **`skills/`**: Research focused on specialized agent skills and workflows.
  - **`tools/`**: Research focused on AI-native tools and platforms.
  - **`workflow/`**: Research focused on end-to-end development processes.
  - **`paper/`**: Deep-dives into academic papers and technical articles.

## 🛠 Skills

### `codebase-research`
Automates the process of investigating external repositories using an iterative 3-phase workflow (Discovery, Prefetch, Synthesize).

### `doc-research`
Systematically evaluates and digests academic papers and technical articles using specialized methodologies like academic reviewer passes.

### `skill-authoring`
Ensures all skills follow the [Claude best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices). It enforces gerund naming, third-person descriptions, and structured SOPs.

### `no-gaslighting`
Adapted from the [`nopua`](https://github.com/wuji-labs/nopua) project, this skill replaces fear-based tactics with trust-driven motivation and a systematic debugging process.

## 🚀 Research Digests

Currently available research:

| Project | Category | Summary |
|---------|----------|---------|
| [superpowers](digest/workflow/superpowers-digest-20260321.md) | Workflow | Composable skills for agentic TDD, brainstorming, and debugging. |
| [gws](digest/tools/gws-digest-20260321.md) | Tool | Dynamic Google Workspace CLI with 40+ agent skills. |
| [gstack](digest/skills/gstack-digest-20260321.md) | Skill | Garry Tan's "software factory" with 15+ specialized agent roles. |
| [lazygit](digest/tools/lazygit-digest-20260321.md) | Tool | Terminal UI for git commands with interactive rebasing and staging. |
| [nanoclaw](digest/tools/nanoclaw-digest-20260321.md) | Tool | Lightweight, secure Claude assistant running in isolated containers. |
| [nopua](digest/skills/nopua-digest-20260321.md) | Skill | Trust-driven AI prompting inspired by the *Dao De Jing*. |
| [ghostty](digest/tools/ghostty-digest-20260321.md) | Tool | Fast, native, feature-rich terminal emulator written in Zig. |
| [starship](digest/tools/starship-digest-20260321.md) | Tool | Minimal, blazing-fast, and customizable prompt for any shell. |
| [Attention Is All You Need](digest/paper/attention-is-all-you-need-digest-20260321.md) | Paper | The foundational paper on the Transformer architecture. |

## ⚖️ License
MIT

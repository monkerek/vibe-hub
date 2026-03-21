# Vibe Hub

A personal project for researching and learning about various codebases, tools, and agentic workflows. This repository uses the Gemini CLI and custom skills to analyze external repositories and generate structured digests.

## 📂 Project Structure

- **`.gemini/skills/`**: Custom Gemini CLI skills for this project.
  - **`codebase-research/`**: Automates the workflow to research GitHub repositories and generate documentation.
  - **`no-gaslighting/`**: An anti-manipulation skill adapted from `nopua` to drive AI with trust and inner motivation.
- **`digest/`**: A structured directory containing research digests.
  - **`skills/`**: Research focused on specialized agent skills and workflows (e.g., [`gstack`](digest/skills/gstack-digest.md)).
  - **`tools/`**: Research focused on AI-native tools and platforms (e.g., [`nanoclaw`](digest/tools/nanoclaw-digest.md)).
  - **`workflow/`**: Research focused on end-to-end development workflows and processes.

## 🛠 Skills

### `codebase-research`
The `codebase-research` skill automates the process of investigating external repositories. It includes a script (`research-repo.cjs`) that clones a target repository into a temporary workspace, allowing for deep-dive analysis without cluttering the main project.

#### Usage
To research a new repository:
1. Trigger the skill (e.g., "Research https://github.com/user/repo and add a digest to tools").
2. The skill will clone the repo and analyze its architecture, tech stack, and key features.
3. A structured digest will be generated in `digest/skills/` or `digest/tools/`.

### `skill-authoring`
The `skill-authoring` meta-skill ensures all future skills in this project follow the [Claude best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices). It enforces gerund naming, third-person descriptions, and structured SOPs.
### `no-gaslighting`
Adapted from the [`nopua`](https://github.com/wuji-labs/nopua) project, this skill replaces fear-based "PUA" tactics with trust-driven motivation. It provides a systematic debugging process (Water Methodology) and cognitive elevation strategies to resolve complex failures without toxic pressure.

## 🚀 Research Digests

Currently available research:

| Project | Category | Summary |
|---------|----------|---------|
| [superpowers](digest/workflow/superpowers-digest.md) | Workflow | Composable skills for agentic TDD, brainstorming, and debugging. |
| [gws](digest/tools/gws-digest.md) | Tool | Dynamic Google Workspace CLI with 40+ agent skills. || [gstack](digest/skills/gstack-digest.md) | Skill | Garry Tan's "software factory" with 15+ specialized agent roles. |
| [lazygit](digest/tools/lazygit-digest.md) | Tool | Terminal UI for git commands with interactive rebasing and staging. || [nanoclaw](digest/tools/nanoclaw-digest.md) | Tool | Lightweight, secure Claude assistant running in isolated containers. |
| [nopua](digest/skills/nopua-digest.md) | Skill | Trust-driven AI prompting inspired by the *Dao De Jing*. |
| [ghostty](digest/tools/ghostty-digest.md) | Tool | Fast, native, feature-rich terminal emulator written in Zig. |
| [starship](digest/tools/starship-digest.md) | Tool | Minimal, blazing-fast, and customizable prompt for any shell. |

## ⚖️ License
MIT

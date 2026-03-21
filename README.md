# Vibe Hub

A personal project for researching and learning about various codebases, tools, and agentic workflows. This repository uses the Gemini CLI and custom skills to analyze external repositories and generate structured digests.

## 📂 Project Structure

- **`codebase-research/`**: A custom Gemini CLI skill built specifically for this project. It provides a workflow to research GitHub repositories and generate documentation.
- **`digest/`**: A structured directory containing research digests.
  - **`skills/`**: Research focused on specialized agent skills and workflows (e.g., [`gstack`](digest/skills/gstack-digest.md)).
  - **`tools/`**: Research focused on AI-native tools and platforms (e.g., [`nanoclaw`](digest/tools/nanoclaw-digest.md)).

## 🛠 `codebase-research` Skill

The `codebase-research` skill automates the process of investigating external repositories. It includes a script (`research_repo.cjs`) that clones a target repository into a temporary workspace, allowing for deep-dive analysis without cluttering the main project.

### Usage
To research a new repository:
1. Trigger the skill (e.g., "Research https://github.com/user/repo and add a digest to tools").
2. The skill will clone the repo and analyze its architecture, tech stack, and key features.
3. A structured digest will be generated in `digest/skills/` or `digest/tools/`.

## 🚀 Research Digests

Currently available research:

| Project | Category | Summary |
|---------|----------|---------|
| [gstack](digest/skills/gstack-digest.md) | Skill | Garry Tan's "software factory" with 15+ specialized agent roles. |
| [nanoclaw](digest/tools/nanoclaw-digest.md) | Tool | Lightweight, secure Claude assistant running in isolated containers. |

## ⚖️ License
MIT

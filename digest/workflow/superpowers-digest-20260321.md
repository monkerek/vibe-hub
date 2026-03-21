# Superpowers Digest

- **URL**: https://github.com/obra/superpowers
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Markdown (Agent Skill Definitions)
- **Frameworks/Libraries**: Gemini CLI, Claude Code, Cursor, OpenCode, Codex
- **Build/Package Tools**: npm (minimal), custom shell scripts

## 🚀 Key Features
- **Brainstorming**: A Socratic design refinement process that turns vague ideas into validated specs before writing code.
- **Test-Driven Development (TDD)**: A strict Red-Green-Refactor cycle that ensures every implementation is backed by tests.
- **Subagent-Driven Development**: Parallelizes tasks by dispatching subagents with specific review checkpoints.
- **Systematic Debugging**: A 4-phase root cause analysis process to prevent "guess-and-check" debugging.
- **Git Worktrees**: Automatically manages isolated workspaces for parallel development branches.

## 🏗 High-Level Architecture
Superpowers is a capability-extension framework for AI agents. It uses a hook-based system to intercept agent lifecycle events and inject specialized commands (brainstorm, execute-plan). It functions as a declarative workflow engine where each skill (defined in `skill.md`) uses "Hard-Gates" to enforce high-quality engineering standards (Design -> Plan -> Test -> Implement).

## 📂 Directory Structure (Core)
- `agents/`: Specialized agent roles (e.g., `code-reviewer.md`).
- `skills/`: The core logic library, where each folder contains a `skill.md` with detailed instructions and process flows.
  - `brainstorming/`: Design refinement.
  - `test-driven-development/`: Implementation cycle.
  - `writing-plans/`: Task decomposition.
  - `subagent-driven-development/`: Parallel execution.
- `docs/`: Platform-specific installation and usage guides.

## 🎯 Main Entry Points
- `VIBE.md`: The main configuration for Gemini CLI users.
- `skills/using-superpowers/skill.md`: The system's "onboarding" skill that introduces the agent to the superpower workflow.

## 📝 Observations & Patterns
- **Process Over Guessing**: Explicitly forbids agents from "jumping into code" without a validated design and plan.
- **Hard-Gates**: Uses strong language ("You MUST", "HARD-GATE") to override LLM tendencies toward shortcuts.
- **Self-Documenting Discovery**: Standardized `skill.md` and `VIBE.md` discovery protocols that allow agents to autonomously learn and deploy new tools.
- **YAGNI & DRY**: Built-in adherence to core software engineering principles.

## 🛠 How to Install (Gemini CLI)
```bash
gemini extensions install https://github.com/obra/superpowers
```

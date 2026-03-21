# NanoClaw Digest

- **URL**: https://github.com/qwibitai/nanoclaw
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: TypeScript
- **Frameworks/Libraries**: Better-sqlite3, Zod, Pino, Cron-parser, Vitest
- **Build/Package Tools**: npm, tsc, tsx, Husky

## 🚀 Key Features
- **Container Isolation**: Runs Claude agents in isolated Linux containers (Docker or Apple Container) with filesystem sandboxing.
- **Multi-Channel Messaging**: Supports WhatsApp, Telegram, Discord, Slack, and Gmail as interfaces.
- **AI-Native Setup**: Uses Claude Code skills (`/setup`, `/customize`) for configuration and management instead of traditional config files.
- **Isolated Group Context**: Each group has its own `CLAUDE.md` memory and isolated filesystem.
- **Scheduled Tasks**: Built-in task scheduler for recurring AI jobs and briefings.
- **Small Codebase**: Designed to be small enough for a single AI agent (or human) to understand and modify entirely.

## 🏗 High-Level Architecture
NanoClaw is a single Node.js process orchestrator. It follows a flow: Channels → SQLite → Polling Loop → Container (Claude Agent SDK) → Response. It uses SQLite for state management and filesystem-based IPC.

## 📂 Directory Structure (Core)
- `src/`: Core source code.
  - `channels/`: Messaging channel integrations and registry.
  - `container-runner.ts`: Logic for spawning isolated containers.
  - `db.ts`: SQLite database operations.
  - `task-scheduler.ts`: Logic for recurring jobs.
- `groups/`: Per-group data, including memory and isolated filesystems.
- `setup/`: Installation and configuration logic.
- `docs/`: Technical specifications (`SPEC.md`) and security model (`SECURITY.md`).

## 🎯 Main Entry Points
- `src/index.ts`: The main orchestrator and message loop.
- `setup/index.ts`: Entry point for the `/setup` skill.
- `package.json`: Defines the lifecycle scripts (build, start, dev).

## 📝 Observations & Patterns
- **No-Config Philosophy**: Favors code modification over complex configuration files.
- **Skill-Based Extension**: Encourages adding features via Claude Code skills that transform the fork rather than PRs to the core.
- **Strict Isolation**: Prioritizes OS-level isolation (containers) over application-level permission checks.
- **bespoke software**: Designed to be forked and customized for each individual user's needs.

## 🛠 How to Run / Test
- **Setup**: `gh repo fork qwibitai/nanoclaw --clone && cd nanoclaw && claude` then run `/setup`.
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Test**: `npm run test`

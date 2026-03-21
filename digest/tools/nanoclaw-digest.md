# NanoClaw Digest

- **URL**: https://github.com/vibe-hub/nanoclaw (Source: qwibitai/nanoclaw)
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: TypeScript
- **Frameworks/Libraries**: Node.js, Claude API (Anthropic), SQLite
- **Runtime**: Isolated Linux Containers

## 🚀 Key Features
- **Isolated Execution**: Runs Claude agents in secure, isolated containers.
- **Multi-Channel**: Managed via WhatsApp, Telegram, and other messaging platforms.
- **State Persistence**: Uses SQLite to track agent conversations and state transitions.

## 🏗 High-Level Architecture
NanoClaw is a "forkable personal agent infrastructure." It utilizes a SQLite-backed state machine to manage multi-channel messaging and executes Claude agents in isolated Linux containers using a dedicated `container-runner.ts`.

## 📂 Directory Structure (Core)
- `src/agents/`: Definitions for specialized Claude agents.
- `src/containers/`: Logic for isolated execution environments.
- `src/messaging/`: Adapters for WhatsApp, Telegram, etc.

## 📝 Observations & Patterns
- **No-Config Philosophy**: System behavior is customized by modifying the codebase of the fork rather than complex configuration files.
- **Agentic Infrastructure**: Focuses on providing the "plumbing" for agents to interact safely with the real world.

# gstack Digest

- **URL**: https://github.com/garrytan/gstack
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: TypeScript
- **Frameworks/Libraries**: Playwright, Bun, Anthropic SDK
- **Build/Package Tools**: Bun (v1.0+), Node.js (fallback)

## 🚀 Key Features
- **Agentic Workflows**: 15+ specialized skills (office-hours, plan-ceo-review, review, ship, etc.) that structure AI agent behavior.
- **Fast Headless Browser**: Custom `/browse` skill using Playwright for high-speed web navigation and screenshots (~100ms).
- **Parallel Sprints**: Designed to manage 10-15 parallel AI agent sessions.
- **Safety Guardrails**: Skills like `/careful`, `/freeze`, and `/guard` to prevent destructive actions.
- **Cross-Agent Support**: Compatible with Claude Code, Codex, and Gemini CLI via the SKILL.md standard.

## 🏗 High-Level Architecture
gstack is a "software factory" composed of modular skills. It follows a structured sprint lifecycle: Think → Plan → Build → Review → Test → Ship → Reflect. Each skill is a standalone directory with a `SKILL.md` defining its behavior and often includes supporting scripts (mostly Bun/TypeScript).

## 📂 Directory Structure (Core)
- `bin/`: CLI entry points for various utilities.
- `browse/`: The headless browser server and client logic.
- `docs/`: Extensive documentation and skill deep dives.
- `scripts/`: Internal management scripts (e.g., generating skill docs).
- `test/`: E2E and unit tests using Bun.
- `[skill-name]/`: Individual skill directories (e.g., `office-hours/`, `review/`).

## 🎯 Main Entry Points
- `setup`: Main installation and configuration script.
- `SKILL.md`: The primary entry point for agent discovery.
- `browse/src/cli.ts`: CLI for the browse tool.
- `package.json`: Defines the build and test pipelines.

## 📝 Observations & Patterns
- **Standardized Skills**: Uses a common `SKILL.md` + `scripts/` pattern for all specialized roles.
- **Markdown-First**: Leverages Markdown as the interface between the user and the agentic system.
- **Bun-Native**: Heavily optimized for the Bun runtime for speed and efficiency.
- **Opt-in Telemetry**: Uses Supabase for anonymous usage tracking, with a strong focus on privacy.

## 🛠 How to Run / Test
- **Installation**: `git clone ... && cd gstack && ./setup`
- **Build**: `bun run build`
- **Test**: `bun test`
- **Dev Mode**: `bun run dev`

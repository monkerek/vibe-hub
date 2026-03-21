# gStack Digest

- **URL**: https://github.com/vibe-hub/gstack (Source: garrytan/gstack)
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: TypeScript
- **Runtime**: Bun
- **Tools**: Headless Browser (Puppeteer/Playwright)

## 🚀 Key Features
- **Sprint Lifecycle**: Think → Plan → Build → Ship automation.
- **Visual Feedback**: Headless browser service optimized for agentic debugging.
- **Specialized Roles**: 15+ agent roles for various development tasks.

## 🏗 High-Level Architecture
A "software factory" that encapsulates the entire development lifecycle. It features modular skill directories that house both agent instructions (`skill.md`) and supporting automation scripts. A key component is the high-speed headless browser service (`/browse`) used for visual verification.

## 📂 Directory Structure (Core)
- `skills/`: Encapsulated agent logic and scripts.
- `src/browser/`: Headless browser integration.
- `src/roles/`: Definitions for the "software factory" agents.

## 📝 Observations & Patterns
- **Role Specialization**: Breaks complex tasks into tiny, manageable roles.
- **Visual-First Debugging**: Prioritizes browser-based feedback for frontend tasks.

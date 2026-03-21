---
name: codebase-research
description: Research a GitHub repository and generate a markdown digest in the project's digest/skills/ or digest/tools/ folders. Use when you need to understand an external codebase and document its architecture, tech stack, and key features.
---

# Codebase Research

## Overview

This skill enables Gemini CLI to systematically research external GitHub repositories and generate a structured "digest" markdown file. These digests are stored in the `digest/skills/` or `digest/tools/` directory of the current project, serving as a reference for future work or learning.

## Workflow

1.  **Identify Target**: Get the GitHub URL and determine the destination folder (`digest/skills/` or `digest/tools/`).
2.  **Environment Setup**: Use the `research_repo.cjs` script to clone the repository into a temporary directory and generate an initial file listing.
3.  **Deep Dive**:
    -   Read the `README.md` for high-level context.
    -   Analyze configuration files (`package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`) to identify the tech stack.
    -   Locate main entry points (e.g., `src/index.ts`, `main.go`, `app.py`).
    -   Use `grep_search` to find core business logic and architectural patterns.
4.  **Generate Digest**: Create a markdown file at `<folder>/<repo-name>-digest.md` using the provided template.
5.  **Cleanup**: Remove the temporary cloned repository.

## Digest Template

The generated digest should follow this structure:

```markdown
# [Repository Name] Digest

- **URL**: [GitHub URL]
- **Date Researched**: [Current Date]

## 🛠 Tech Stack
- **Primary Language**: [e.g., TypeScript]
- **Frameworks/Libraries**: [e.g., React, Express, Prisma]
- **Build/Package Tools**: [e.g., npm, Vite]

## 🚀 Key Features
- [Feature 1 description]
- [Feature 2 description]

## 🏗 High-Level Architecture
[Brief description of how the system is organized, e.g., "Monolithic Express server with a React frontend, using a layered architecture for services and controllers."]

## 📂 Directory Structure (Core)
[A simplified tree view of the most important directories and files]

## 🎯 Main Entry Points
- `[File Path]`: [Purpose]

## 📝 Observations & Patterns
- [Observation 1, e.g., "Uses a custom dependency injection container."]
- [Observation 2, e.g., "Extensive use of functional programming patterns for data processing."]

## 🛠 How to Run / Test
[Quick notes on how to get it running locally based on the README or config files]
```

## Resources

### scripts/research_repo.cjs
A utility to clone a repository to a temporary location and provide a summary of its structure.

**Usage**: `node scripts/research_repo.cjs <repo-url>`

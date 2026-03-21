---
name: codebase-research
description: Research a GitHub repository and generate a markdown digest in the project's digest/skills/ or digest/tools/ folders. Use when you need to understand an external codebase and document its architecture, tech stack, and key features.
---

# Codebase Research

## Overview

This skill enables Gemini CLI to systematically research external GitHub repositories and generate a structured "digest" markdown file. These digests are stored in the `digest/skills/` or `digest/tools/` directory of the current project, serving as a reference for future work or learning.

## Workflow (Optimized)

### 1. Identify Target
- Get the GitHub URL and determine the destination folder (`digest/skills/`, `digest/tools/`, or `digest/workflow/`).
- Use `research-repo.cjs` to clone the repository into a temporary directory.

### 2. Phase 1: Discovery (File Selection)
- **Query Rewriting**: Transform natural language questions into technical code search keywords using `references/semantic-mappings.md`.
- **Initial Discovery**:
  - Read `README.md` and configuration files (`package.json`, `go.mod`, etc.).
  - Locate entry points (e.g., `src/index.ts`, `main.go`, `app.py`).
  - Use `glob` and `grep_search` (with `names_only: true`) to find files matching rewritten keywords.

### 3. Phase 2: Prefetch (Deep Dive & Iteration)
- **Iterative Discovery (MAX_ROUNDS Pattern)**:
  - Round 1: Analyze initial high-signal files found in Phase 1.
  - Round 2: Parse import statements in those files to discover related files automatically.
  - Round 3+: Repeat as needed to trace core logic or architectural layers.
- **Check Context First**: After each round, evaluate if current context is sufficient to answer the query. If YES, stop early.

### 4. Phase 3: Synthesize (Generate Digest)
- Create a markdown file at `<folder>/<repo-name>-digest-YYYYMMDD.md` using the template below.
- Focus on architectural patterns, data flow, and key logic discovered during iterative analysis.
- Ensure the filename follows the kebab-case naming convention (e.g., `react-digest-20260321.md`).

### 5. Cleanup
- Remove the temporary cloned repository.

---

## Digest Template

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

### scripts/research-repo.cjs
A utility to clone a repository to a temporary location and provide a summary of its structure.
**Usage**: `node scripts/research-repo.cjs <repo-url>`

### references/semantic-mappings.md
A mapping of conceptual terms to code keywords for better discovery.

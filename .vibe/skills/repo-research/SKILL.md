---
name: repo-research
description: Systematically researches external GitHub repositories to generate structured architectural digests. Identifies tech stacks, key features, and core logic patterns using an iterative discovery workflow.
---

# Repo Research

## Overview

This skill enables the systematic research of external GitHub repositories to generate structured markdown digests. It balances high-level context discovery with deep-dive technical analysis using an iterative, multi-phase workflow.

## 🚀 Workflow Checklist

You MUST create a task for each of these items and complete them in order:

1. [ ] **Identify Target**: Confirm the GitHub URL and destination folder (`digest/skills/`, `digest/tools/`, or `digest/workflow/`).
2. [ ] **Environment Setup**: Execute `scripts/research-repo.cjs <repo-url>` to clone the repository and obtain the initial structure.
3. [ ] **Phase 1: Discovery**:
    - [ ] Transform query into keywords using `references/semantic-mappings.md`.
    - [ ] Read `README.md` and configuration files to identify the tech stack.
    - [ ] Locate entry points and high-signal files matching the keywords.
4. [ ] **Phase 2: Iterative Deep Dive**:
    - [ ] Round 1: Analyze initial files.
    - [ ] Round 2+: Parse imports to discover related files automatically.
    - [ ] Check context sufficiency after each round to stop early if the goal is met.
5. [ ] **Phase 3: Synthesis**:
    - [ ] Generate a structured digest using the standard template.
    - [ ] Ensure the filename follows the kebab-case pattern: `<repo-name>-digest-YYYYMMDD.md`.
6. [ ] **Cleanup**: Remove the temporary cloned repository.

<HARD-GATE>
Do NOT finalize the digest until at least two rounds of iterative discovery have been performed OR you have explicitly verified that the current context is sufficient to answer all architectural questions.
</HARD-GATE>

---

## 🏗 Digest Template

Refer to `references/templates.md` for the full structure, including sections for:
- 🛠 Tech Stack
- 🚀 Key Features
- 🏗 High-Level Architecture
- 📂 Directory Structure (Core)
- 🎯 Main Entry Points
- 📝 Observations & Patterns

---

## 📝 Anti-Patterns to Avoid

- **Surface-Level Analysis**: Only reading the `README.md` and skipping the code deep-dive.
- **Vague Descriptions**: Using filler words like "easy to use" instead of technical facts like "implements a modular plugin system."
- **Messy Filenames**: Forgetting the `-digest-YYYYMMDD.md` suffix or using spaces/underscores.

---

## ⚖️ Standards
- Follow the 3-phase research workflow (Discovery, Prefetch, Synthesize).
- Maintain `semantic-mappings.md` for consistent technical keyword extraction.
- Advanced AST analysis via `scripts/codebase-research.py` requires `tree-sitter`.

---

## 📂 Resources & Progressive Disclosure

For deeper details, refer to:
- **`references/semantic-mappings.md`**: For query rewriting keywords.
- **`references/examples.md`**: For concrete input/output examples of high-quality digests.
- **`references/setup.md`**: For advanced analyzer configuration (tree-sitter).
- **`scripts/research-repo.cjs`**: The primary cloning utility.

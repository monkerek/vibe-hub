# Frontend Slides Digest

- **URL**: https://github.com/zarazhangrui/frontend-slides
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: HTML, CSS, JavaScript (Vanilla)
- **Frameworks/Libraries**: Zero dependencies (No frameworks, no build tools)
- **Supporting Tools**: Python (with `python-pptx`) for PPT conversion

## 🚀 Key Features
- **Zero-Dependency HTML Presentations**: Generates single, self-contained HTML files with all CSS and JS inline, ensuring long-term portability and accessibility.
- **Visual Style Discovery**: Uses a "show, don't tell" approach, generating visual style previews for users to choose from rather than requiring abstract design descriptions.
- **PowerPoint Conversion**: Includes a Python script to extract content from `.pptx` files and convert them into interactive web slideshows.
- **Viewport-First Design**: Enforces strict "Viewport Fitting" rules (100vh slides, no scrolling, `clamp()` for typography) to ensure presentations look perfect on all screens.
- **Anti-AI-Slop Aesthetics**: Curated design presets (12+ themes) that avoid generic AI-generated styles, focusing on unique typography, bold colors, and high-impact motion.

## 🏗 High-Level Architecture
The skill follows a **progressive disclosure** architecture, using a concise `SKILL.md` as a map and loading heavy resources (presets, templates, animation patterns) on-demand. It employs a multi-phase workflow:
1. **Detection/Discovery**: Determines if the user wants a new deck, a conversion, or an enhancement.
2. **Style Selection**: Generates or selects visual themes.
3. **Generation**: Compiles the final HTML using a base template and specific design components.

## 📂 Directory Structure (Core)
- `SKILL.md`: Core workflow, rules, and "agentic" instructions.
- `STYLE_PRESETS.md`: 12 curated visual themes (Bold Signal, Neon Cyber, etc.).
- `html-template.md`: The base HTML structure and JavaScript features (navigation, editing).
- `viewport-base.css`: Mandatory responsive CSS included in every output.
- `animation-patterns.md`: Reference for CSS/JS animations mapped to specific "feelings."
- `scripts/extract-pptx.py`: Utility for extracting assets and text from PowerPoint files.

## 🎯 Main Entry Points
- `SKILL.md`: The primary interface for LLM agents to execute the presentation building/conversion tasks.
- `scripts/extract-pptx.py`: Entry point for the conversion workflow.

## 📝 Observations & Patterns
- **Agent-Optimized Design**: The skill is explicitly designed for LLM agents (like Claude Code or Gemini CLI), using XML-like tagging and clear phase-based instructions.
- **Vibe Coding Philosophy**: Prioritizes "vibes" and visual feedback over traditional configuration-heavy development.
- **Strict Constraints**: Hardcoded "Density Limits" (e.g., max 4-6 bullets per slide) ensure quality and prevent content cramming.

## 🛠 How to Run / Test
- **Standard**: Clone the repo and point your LLM agent to the `SKILL.md`.
- **PPT Conversion**: `python scripts/extract-pptx.py <input.pptx> <output_dir>` (requires `pip install python-pptx`).
- **Previewing**: Simply open any generated `.html` file in a modern web browser.

---
*Processed: 2026-03-21 | Skill: codebase-research | Branch: gemini-cli-task-2026-03-21*

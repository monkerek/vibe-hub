# Codebase Research Digest Templates

## 📄 Standard Digest Template

Use this template for all repository research. Ensure the filename follows `<repo-name>-digest-YYYYMMDD.md`.

```markdown
# [Repository Name] Digest

- **URL**: [GitHub URL]
- **Date Researched**: [Current Date]

## 🛠 Tech Stack
- **Primary Language**: [e.g., TypeScript, Rust, Go]
- **Frameworks/Libraries**: [List key dependencies from package.json, go.mod, Cargo.toml, etc.]
- **Build/Package Tools**: [e.g., npm, bun, cargo, make]

## 🚀 Key Features
- [Feature 1: Focus on what it enables for the user or other agents]
- [Feature 2: e.g., "Modular plugin system for extensible logic"]

## 🏗 High-Level Architecture
[Brief description of how the system is organized. Is it a monolith, microservices, or a library of composable skills? Describe the relationship between core components.]

## 📂 Directory Structure (Core)
[A simplified tree view of the most important directories and files. Focus on the 'logic' folders.]
- `src/`: ...
- `pkg/`: ...

## 🎯 Main Entry Points
- `[File Path]`: [Purpose, e.g., "The CLI entry point that handles argument parsing"]

## 📝 Observations & Patterns
- [Observation 1: e.g., "Strict enforcement of TDD via Hard-Gates"]
- [Observation 2: e.g., "Uses a custom dependency injection container for services"]

## 🛠 How to Run / Test
[Quick notes on how to get it running locally based on the README or config files]
```

# Vibe Hub Context — VIBE.md

Vibe Hub is a research-oriented workspace designed to analyze external codebases and generate structured Markdown digests. It is a multi-agent environment supporting Gemini CLI, Claude Code, and Codex CLI.

## 🛠 Tech Stack
- **AI Tooling**: Gemini CLI, Claude Code, Codex CLI
- **Shared Skills**: Centralized in `.vibe/skills/`
- **Config**: Dotfiles managed in `.config/`
- **Digests**: Structured research stored in `digest/`

## ⚖️ Core Mandates
1. **Naming Convention**: ALWAYS use `aaa-bbb.cc` (kebab-case) for all files. No spaces, no underscores.
2. **Digest Naming**: Research digests MUST follow the pattern `<repo-name>-digest-YYYYMMDD.md`.
3. **Skill Development**: Use gerund names for skills (e.g., `processing-repositories.md`). Follow `.vibe/skills/skill-authoring/authoring-new-skills.md`.
4. **Tool Integrity**: Use the 3-phase research workflow (Discovery -> Prefetch -> Synthesize).
5. **Security**: Never commit secrets or API keys. Protect `.env` files.

## 🤝 Working Agreements & Standards

### Claude Code (CLAUDE.md)
- **Build & Test**: `node .vibe/skills/codebase-research/scripts/research-repo.cjs` for skill validation.
- **Git**: Use `git worktree` for isolation.
- **Standards**: Modularize large instructions using the `@import` pattern.

### Codex CLI (AGENTS.md)
- **Agreements**: Verify all new files with `ls -R` and `grep` for naming compliance.
- **Expectations**: All repository research MUST result in a standardized digest.

## 🚀 Standard Operating Procedures (SOPs)

### 1. Researching a Repository
- Clone using `node .vibe/skills/codebase-research/scripts/research-repo.cjs <url>`.
- Phase 1 (Discovery): Use `semantic-mappings.md` to identify high-signal files.
- Phase 2 (Prefetch): Perform at least 2 rounds of iterative discovery (import following).
- Phase 3 (Synthesize): Generate the digest using the template in `processing-repositories.md`.

### 2. Managing Dotfiles
- Source file: `.config/<tool>/<file>`
- System symlink: `ln -sf $(pwd)/.config/<tool>/<file> ~/.config/<tool>/<file>`

### 3. Workflow Isolation
- Branch pattern: `gemini-agent-work-YYYY-MM-DD` (or platform equivalent).
- Use `git worktree add .tmp/worktrees/<name> -b <branch>`.

## 📂 Skill References
- @.vibe/skills/codebase-research/processing-repositories.md
- @.vibe/skills/doc-research/researching-documents.md
- @.vibe/skills/no-gaslighting/debugging-with-wisdom.md
- @.vibe/skills/skill-authoring/authoring-new-skills.md

# Vibe Hub Context — VIBE.md

Vibe Hub is a multi-agent research workspace designed for Gemini CLI, Claude Code, and Codex CLI. This directory (`.vibe/`) serves as the core "Source of Truth" for agentic intelligence, context, and shared mandates.

## 🛠 Tech Stack
- **AI Tooling**: Gemini CLI, Claude Code, Codex CLI
- **Shared Skills**: Centralized in `.vibe/skills/`
- **Config**: Dotfiles managed in `.config/`
- **Digests**: Structured research stored in `digest/`

## ⚖️ Core Mandates
1. **Naming Convention**: Default to kebab-case for repository files and directories. Required platform entrypoints keep their mandated names: `VIBE.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `SKILL.md`.
2. **Digest Naming**: Research digests MUST follow the pattern `<repo-name>-digest-YYYYMMDD.md`.
3. **Skill Development**: Use concise, kebab-case directory names for skills (e.g., `repo-research/`) with `SKILL.md` as the required entrypoint. Follow `.vibe/skills/skill-author/SKILL.md`.
4. **Tool Integrity**: Use the 3-phase research workflow (Discovery -> Prefetch -> Synthesize).
5. **Security**: Never commit secrets or API keys. Protect `.env` files.

## 🛡️ Cross-Agent Compatibility Policy

To ensure perfectly consistent behavior across all AI agents, any context file (`VIBE.md`) MUST be accompanied by platform-specific symlinks:

- **`.gemini/GEMINI.md`** -> `VIBE.md` (Gemini CLI)
- **`.claude/CLAUDE.md`** -> `VIBE.md` (Claude Code)
- **`.codex/AGENTS.md`** -> `VIBE.md` (Codex CLI)

When modifying `VIBE.md`, ensure the instructions are compliant with all three standards (e.g., including build/test commands for Claude and working agreements for Codex).

## 🤝 Platform Standards & Working Agreements

### Claude Code (CLAUDE.md)
- **Build & Test**: `node .vibe/skills/repo-research/scripts/research-repo.cjs` for skill validation.
- **Git**: Use `git worktree` for isolated development.
- **Progressive Disclosure**: Modularize large instructions using the `@import` pattern.

### Codex CLI (AGENTS.md)
- **Agreements**: Verify all new files with `ls -R` and `grep` for naming compliance.
- **Expectations**: All repository research MUST result in a standardized architectural digest.
- **Skills**: Codex skills are directory-based packages with a required `SKILL.md` entrypoint.

### Shared Skills
- Keep the source of truth in `.vibe/skills/`.
- Surface that directory through `.codex/skills`, `.claude/skills`, and `.gemini/skills` symlinks so all three CLIs discover the same skill packages.
- Each skill directory must expose `SKILL.md`, optional `references/`, optional `templates/`, and optional `scripts/`.

## 🚀 Standard Operating Procedures (SOPs)

### 1. Researching a Repository
- Clone using `node .vibe/skills/repo-research/scripts/research-repo.cjs <url>`.
- Phase 1 (Discovery): Use `semantic-mappings.md` to identify high-signal files.
- Phase 2 (Prefetch): Perform at least 2 rounds of iterative discovery (import following).
- Phase 3 (Synthesize): Generate the digest using the template in `.vibe/skills/repo-research/SKILL.md`.

### 2. Managing Dotfiles
- Source file: `.config/<tool>/<file>`
- System symlink: `ln -sf $(pwd)/.config/<tool>/<file> ~/.config/<tool>/<file>`

### 3. Workflow Isolation
- Branch pattern: `gemini-agent-work-YYYY-MM-DD` (or platform equivalent).
- Use `git worktree add .tmp/worktrees/<name> -b <branch>`.

## 📂 Skill References
- @.vibe/skills/repo-research/SKILL.md
- @.vibe/skills/doc-research/SKILL.md
- @.vibe/skills/gaslighting/SKILL.md
- @.vibe/skills/skill-author/SKILL.md
- @.vibe/skills/address-feedback/SKILL.md

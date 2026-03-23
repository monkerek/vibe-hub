# CLI-Anything Digest

- **URL**: https://github.com/HKUDS/CLI-Anything
- **Date Researched**: 2026-03-22

## Tech Stack
- **Primary Language**: Python (>=3.10)
- **Frameworks/Libraries**: Click (>=8.0) for CLI construction, prompt-toolkit (>=3.0) for interactive REPL, requests for HTTP backends, Jinja2 for SKILL.md template rendering
- **Build/Package Tools**: setuptools with `find_namespace_packages` (PEP 420 namespace packages), pip editable installs, pytest (>=7.0) for testing
- **AI Integration**: Claude Code plugin system, OpenCode commands, Codex skill, Qodercli plugin, OpenClaw support

## Key Features
- **Agent-Native CLI Generation Pipeline**: 7-phase automated pipeline (Analyze -> Design -> Implement -> Plan Tests -> Write Tests -> Document -> Publish) that transforms any GUI application into a stateful, agent-operable CLI harness.
- **Stateful REPL + Subcommand Dual-Mode**: Every generated CLI supports both one-shot subcommands (for scripting/pipelines) and an interactive REPL with undo/redo, session persistence, and prompt-toolkit integration.
- **Unified ReplSkin Branding System**: A shared `repl_skin.py` module provides consistent terminal UX across all harnesses — branded banners, color-coded messages (success/error/warning/info), progress bars, formatted tables, and per-software accent colors.
- **JSON + Human-Readable Dual Output**: All commands support a `--json` flag for structured machine-readable output alongside human-friendly formatted tables and status displays.
- **SKILL.md Auto-Generation**: Phase 6.5 extracts CLI metadata via `skill_generator.py` (parses Click decorators with regex) and generates AI-discoverable SKILL.md files with YAML frontmatter, making each CLI self-describing for agent platforms.
- **CLI-Hub Registry**: A central `registry.json` powers a web-based hub (hkuds.github.io/CLI-Anything) for browsing, searching, and one-command `pip install` of community-contributed CLIs.
- **Iterative Refinement Command**: The `/cli-anything:refine` command performs gap analysis between a software's full capabilities and current CLI coverage, then incrementally adds new commands, tests, and documentation.
- **Cross-Platform Agent Support**: Plugin/command integrations for Claude Code, OpenCode, Codex CLI, Qodercli, OpenClaw, Goose, and GitHub Copilot CLI.

## High-Level Architecture

CLI-Anything is a **plugin-driven metaprogramming system** — it is not a CLI framework itself, but a methodology + tooling layer that instructs AI coding agents to generate CLI harnesses for arbitrary software. The architecture has three tiers:

1. **Plugin Layer** (`cli-anything-plugin/`): Contains the agent instructions (HARNESS.md methodology spec), slash commands (e.g., `/cli-anything`, `/refine`, `/test`, `/validate`), the shared `repl_skin.py` UX module, the `skill_generator.py` metadata extractor, and Jinja2 templates. This layer is installed into the AI agent's plugin/command directory.

2. **Generated Harness Layer** (`<software>/agent-harness/`): Each supported software gets its own independent Python namespace package following a strict directory convention. A harness contains: a `<SOFTWARE>.md` SOP document, a `setup.py` for packaging, and the `cli_anything/<software>/` sub-package with core logic modules, a Click-based CLI entry point, a utils directory (backend wrapper + repl_skin copy), tests, and a SKILL.md.

3. **Registry Layer** (`registry.json` + CLI-Hub web app): A flat JSON registry at the repo root lists all available CLIs with metadata (name, version, description, install command, entry point, category, contributor). The web hub reads this directly from `main` and updates on merge.

Each generated harness follows a uniform internal pattern:
- **`core/`**: Domain-specific logic modules (project management, session persistence with file locking, export pipelines, domain operations like layers/filters/tracks).
- **`utils/<software>_backend.py`**: Wraps the real software's CLI executable using `shutil.which()` + `subprocess.run()`, with clear error messages if the software is not installed.
- **`<software>_cli.py`**: Click-based entry point with `invoke_without_command=True` defaulting to REPL mode. All commands are organized into Click groups matching the software's logical domains.
- **`tests/`**: Unit tests (`test_core.py` — synthetic data, no external deps) and E2E tests (`test_full_e2e.py` — real file generation + backend invocation).

## Directory Structure (Core)

```
CLI-Anything/
├── registry.json                    # Central CLI registry for CLI-Hub
├── cli-anything-plugin/             # Agent plugin layer
│   ├── HARNESS.md                   # 7-phase methodology specification
│   ├── QUICKSTART.md                # Setup guide
│   ├── PUBLISHING.md                # PyPI publishing guide
│   ├── repl_skin.py                 # Shared REPL UX module
│   ├── skill_generator.py           # SKILL.md metadata extractor + generator
│   ├── templates/SKILL.md.template  # Jinja2 template for skill files
│   ├── commands/                    # Slash command definitions
│   │   ├── cli-anything.md          # Main generation command
│   │   ├── refine.md                # Iterative refinement command
│   │   ├── test.md                  # Test runner command
│   │   ├── validate.md              # Validation command
│   │   └── list.md                  # List installed CLIs command
│   └── scripts/setup-cli-anything.sh
├── <software>/                      # Per-software harness (20+ supported)
│   └── agent-harness/
│       ├── <SOFTWARE>.md            # Software-specific SOP
│       ├── setup.py                 # PEP 420 namespace package config
│       └── cli_anything/            # Namespace package (NO __init__.py)
│           └── <software>/          # Sub-package (HAS __init__.py)
│               ├── <software>_cli.py  # Click CLI entry point
│               ├── __main__.py        # python -m support
│               ├── README.md
│               ├── core/              # Domain logic modules
│               ├── utils/             # Backend wrapper + repl_skin copy
│               ├── skills/SKILL.md    # AI-discoverable skill definition
│               └── tests/             # Unit + E2E tests
├── skill_generation/tests/          # Tests for SKILL.md generator
├── codex-skill/                     # Codex CLI integration
├── openclaw-skill/                  # OpenClaw integration
├── opencode-commands/               # OpenCode integration
├── qoder-plugin/                    # Qodercli integration
└── docs/                            # CLI-Hub web app (GitHub Pages)
```

## Main Entry Points
- `cli-anything-plugin/HARNESS.md`: The canonical methodology specification — all agent instructions reference this. Defines the 7-phase SOP, architecture patterns (session locking, backend wrapping, REPL skin integration), and testing standards.
- `cli-anything-plugin/commands/cli-anything.md`: The primary slash command that triggers the full 7-phase generation pipeline when an agent receives `/cli-anything <path>`.
- `cli-anything-plugin/repl_skin.py`: Shared UX module copied into every generated harness. Provides `ReplSkin` class with banner rendering, styled prompts, message formatting, table display, and prompt-toolkit session factory.
- `cli-anything-plugin/skill_generator.py`: Standalone metadata extractor that parses Click decorators via regex to produce SKILL.md files. Entry point: `python skill_generator.py <harness-path>`.
- `<software>/agent-harness/cli_anything/<software>/<software>_cli.py`: Per-software Click CLI entry point. Registered as `cli-anything-<software>` console script via setup.py.
- `registry.json`: Flat JSON registry powering the CLI-Hub. Each entry specifies `install_cmd`, `entry_point`, `skill_md` path, and `category`.

## Observations & Patterns

- **Metaprogramming via Prompt Engineering**: CLI-Anything is fundamentally a prompt engineering project — the `HARNESS.md` and command `.md` files are detailed agent instructions that guide AI coding agents through a structured generation pipeline. The actual CLI code is written by the agent at runtime, not by the repository itself.
- **PEP 420 Namespace Packages**: All harnesses use `find_namespace_packages(include=["cli_anything.*"])` with NO `__init__.py` in the top-level `cli_anything/` directory. This allows multiple independent harnesses to coexist under the same `cli_anything` namespace without conflicts.
- **Backend Wrapping Pattern**: Every harness isolates real software interaction in a single `utils/<software>_backend.py` module that uses `shutil.which()` for discovery and `subprocess.run()` for invocation, with human-readable error messages if the software is missing.
- **Locked Session Persistence**: HARNESS.md mandates `fcntl.flock()`-based exclusive file locking for session JSON writes (with Windows fallback), using an `open("r+")` -> lock -> truncate pattern to prevent data corruption from concurrent writes.
- **Community-Driven Growth**: 20+ software integrations spanning categories (3D, audio, video, image, office, diagrams, AI, web, network, communication, streaming). Contributors add entries via PR to `registry.json` and the hub auto-updates.
- **Test-First Culture**: Phase 4 (TEST.md planning) precedes Phase 5 (test writing). Tests are split into unit tests (synthetic, no external deps) and E2E tests (real backend invocation with output verification — file size, magic bytes, format validation).
- **Plugin Marketplace Distribution**: For Claude Code, the repo functions as a plugin marketplace (`/plugin marketplace add HKUDS/CLI-Anything`) with individual CLIs installable via `/plugin install cli-anything`. Other agents use file-copy installation.
- **1,839 Passing Tests**: The project reports 1,839 passing tests across all harnesses, indicating significant coverage.

## How to Run / Test

```bash
# Clone the repo
git clone https://github.com/HKUDS/CLI-Anything.git
cd CLI-Anything

# Install a specific harness (e.g., GIMP)
cd gimp/agent-harness
pip install -e .

# Run the CLI
cli-anything-gimp --help       # Show commands
cli-anything-gimp              # Enter interactive REPL
cli-anything-gimp --json project info -p project.json  # JSON output

# Run tests for a harness
python3 -m pytest cli_anything/gimp/tests/ -v

# Generate SKILL.md for a harness
python cli-anything-plugin/skill_generator.py gimp/agent-harness

# For Claude Code users: add marketplace and install plugin
# /plugin marketplace add HKUDS/CLI-Anything
# /plugin install cli-anything
# /cli-anything:cli-anything ./my-software
```

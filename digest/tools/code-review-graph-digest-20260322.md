# code-review-graph Digest

- **URL**: https://github.com/tirth8205/code-review-graph
- **Date Researched**: 2026-03-22

## 🛠 Tech Stack

- **Primary Languages**: Python 3.10+ (core engine), TypeScript (VS Code extension)
- **Frameworks/Libraries**:
  - `tree-sitter` — multi-language AST parsing (20+ grammars)
  - `FastMCP` — MCP server framework over stdio transport
  - `NetworkX` — in-memory graph caching and BFS traversal
  - `SQLite` (WAL mode) — persistent graph storage
  - `watchdog` — filesystem event monitoring for watch mode
  - `sentence-transformers` (`all-MiniLM-L6-v2`) — local vector embeddings (optional)
  - `google-generativeai` (`gemini-embedding-001`) — cloud embedding alternative (optional)
  - `D3.js` — interactive graph visualization in exported HTML
  - `VS Code Extension API` — TypeScript extension with TreeView, Webview, SCM decorations
- **Build/Package Tools**: `uv` (Python), `hatchling` (wheel build), `esbuild` (TypeScript extension bundling)
- **CI/CD**: GitHub Actions — lint (ruff), type-check (mypy), security scan (bandit), pytest matrix (Python 3.10–3.13)

## 🚀 Key Features

- **Token-efficient code reviews**: Blast-radius BFS from changed files (2-hop default) reduces context sent to Claude by an average of 6.8x (up to 26.2x on httpx).
- **14-language AST parsing**: Extracts classes, functions, imports, and test nodes from Python, TypeScript, JavaScript, Vue SFC, Go, Rust, Java, C/C++, C#, Ruby, Kotlin, Swift, PHP, and Solidity.
- **9 MCP tools**: `build_or_update_graph`, `get_impact_radius`, `query_graph`, `get_review_context`, `semantic_search_nodes`, `list_graph_stats`, `embed_graph`, `get_docs_section`, `find_large_functions`.
- **Incremental updates in <2 seconds**: Hash-based change detection via `git diff`; only re-parses modified files and their transitive dependents.
- **Dual embedding providers**: Local (`all-MiniLM-L6-v2`, 384-dim) or Google Gemini (`gemini-embedding-001`, 768-dim) with keyword fallback when embeddings unavailable.
- **VS Code extension**: Tree views (graph, blast radius, stats), SCM file decorations, interactive D3.js webview, command palette integration, auto-update on file save (2 s debounce).
- **Auto-detection**: Infers repo root and changed files from git when MCP tool parameters are omitted.
- **No cloud dependency**: All graph data stored locally in `.code-review-graph/graph.db`; embeddings and AI features are strictly opt-in.

## 🏗 High-Level Architecture

The system is composed of three cooperating layers:

```
┌─────────────────────────────────────────────────────┐
│  Integration Layer                                   │
│  ├── Claude Code Plugin  (skills/ + hooks/)          │
│  ├── VS Code Extension   (TypeScript, reads graph.db)│
│  └── CLI                 (code-review-graph <cmd>)   │
├─────────────────────────────────────────────────────┤
│  MCP Server Layer  (main.py → FastMCP → stdio)       │
│  └── 9 tools defined in tools.py                     │
├─────────────────────────────────────────────────────┤
│  Core Engine                                         │
│  ├── parser.py    — Tree-sitter AST → NodeInfo/EdgeInfo│
│  ├── graph.py     — SQLite GraphStore + BFS engine   │
│  ├── incremental.py — git diff + watchdog updates    │
│  └── embeddings.py — dual-provider vector store      │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
         .code-review-graph/graph.db  (SQLite WAL)
```

**Full build flow**: `collect_all_files()` → Tree-sitter parse each file → extract `NodeInfo`/`EdgeInfo` → `store_file_nodes_edges()` atomic upsert → index in SQLite.

**Incremental flow**: `git diff --name-only` → `find_dependents()` to expand set → re-parse only affected files → transactional replacement of old rows.

**Review context flow**: Tool receives list of changed files → `get_impact_radius()` BFS up to N hops → `get_subgraph()` isolation → `_extract_relevant_lines()` merges overlapping ranges → `_generate_review_guidance()` flags risks.

## 📂 Directory Structure (Core)

```
code_review_graph/         # Python package
├── main.py                # FastMCP server entry point (stdio)
├── cli.py                 # CLI: build/update/watch/serve/status/visualize
├── parser.py              # Tree-sitter multi-language AST extractor
├── graph.py               # SQLite GraphStore — nodes, edges, BFS, stats
├── tools.py               # 9 MCP tool definitions + safety helpers
├── incremental.py         # git diff change detection + watchdog watcher
├── embeddings.py          # Dual-provider vector embedding store
└── visualization.py       # D3.js interactive HTML graph export

code-review-graph-vscode/  # VS Code extension (TypeScript)
├── src/
│   ├── extension.ts       # Activation, command registration, DB watcher
│   ├── backend/           # cli.ts, sqlite.ts, watcher.ts
│   ├── features/          # blastRadius, search, navigation, reviewAssistant…
│   └── views/             # graphWebview, treeView, statusBar, treeItems
└── package.json           # VS Code manifest

skills/                    # Claude Code skill definitions
├── build-graph/SKILL.md
├── review-delta/SKILL.md
└── review-pr/SKILL.md

hooks/                     # Claude Code hooks
├── hooks.json             # PostToolUse hook config
└── session-start.sh       # Auto-graph-update on session start

docs/                      # Architecture, commands, schema, roadmap
tests/                     # 182 pytest tests across 7 test modules + fixtures
```

## 🎯 Main Entry Points

- `code_review_graph/main.py` — FastMCP stdio server; invoked by `code-review-graph serve` or Claude Code MCP config.
- `code_review_graph/cli.py` — Typer-based CLI; subcommands: `build`, `update`, `watch`, `serve`, `status`, `visualize`, `install`.
- `code-review-graph-vscode/src/extension.ts` — VS Code extension `activate()`: detects `graph.db`, registers 15+ commands, initializes tree views and SCM decorations.
- `.claude-plugin/plugin.json` — Claude Code plugin marketplace manifest linking MCP server and skills.
- `hooks/hooks.json` — `PostToolUse` hook wiring `session-start.sh` for automatic incremental updates.

## 📝 Observations & Patterns

- **Security-first MCP design**: `_validate_repo_root()` enforces `.git`/`.code-review-graph` presence to block path traversal; `_sanitize_name()` strips control characters (0x00-0x1F) and caps at 256 chars to defend against prompt injection through node names; `escH()` applies HTML entity encoding in visualization output.
- **Noise filtering via deny-list**: `_BUILTIN_CALL_NAMES` (~90 entries) excludes common JS/TS builtins (`.map`, `.filter`, `.then`, etc.) from reverse-call traces, preventing low-signal results while preserving forward traces.
- **TOCTOU-safe file reads**: Files are read as bytes once, hashed, then parsed — preventing time-of-check/time-of-use race conditions on fast file saves.
- **Graph caching with write invalidation**: `NetworkX` in-memory graph is cached with a `threading.Lock`; any write operation clears the cache, ensuring consistency for concurrent readers.
- **Qualified-name addressing**: Every entity is identified by an absolute path-scoped name (e.g., `/repo/src/auth.py::AuthService.login`), enabling unambiguous cross-file relationship resolution.
- **Test traceability via TESTED_BY edges**: Parser generates `TESTED_BY` edges when test functions call production code, making test coverage queryable through the graph.
- **Vue SFC delegation**: Vue single-file components are detected and their `<script>` blocks delegated to the JS/TS sub-parser, maintaining consistent extraction without a separate grammar.
- **Embeddings fall back gracefully**: Semantic search degrades to BM25-style keyword search when vector embeddings are not computed, ensuring the tool is always functional without optional dependencies.
- **182-test suite with 4-version matrix**: pytest runs against Python 3.10–3.13 with 50% minimum coverage enforced in CI, plus ruff, mypy, and bandit checks in parallel jobs.
- **Dual distribution**: Published as both a pip package (`code-review-graph`) and a Claude Code plugin via `.claude-plugin/marketplace.json`, supporting both programmatic and GUI-driven installation.

## 🛠 How to Run / Test

```bash
# Install via pip
pip install code-review-graph

# OR via Claude Code plugin marketplace (GUI install)

# Build the graph for a repo
code-review-graph build --repo /path/to/repo

# Incremental update after git changes
code-review-graph update

# Watch mode (auto-updates on file save)
code-review-graph watch

# Start MCP server (used by Claude Code)
code-review-graph serve

# Install MCP config into Claude Code
code-review-graph install

# Development
uv run pytest tests/ --tb=short -q          # 182 tests
uv run ruff check code_review_graph/        # Lint
uv run mypy code_review_graph/ --ignore-missing-imports --no-strict-optional
```

**Dependencies for embeddings (optional)**:
```bash
pip install "code-review-graph[embeddings]"         # local sentence-transformers
pip install "code-review-graph[google-embeddings]"  # Google Gemini embeddings
export GOOGLE_API_KEY=...                            # required for cloud embeddings
```

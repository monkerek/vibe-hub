# web-fetcher Digest

- **URL**: https://github.com/kenmick/skills/tree/main/web-fetcher
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack

- **Primary Language**: Python 3
- **Frameworks/Libraries**: stdlib only (`argparse`, `sys`, `urllib.request`) — zero third-party dependencies
- **Build/Package Tools**: None (single-script, run directly with `python3`)
- **External Services**: Jina Reader (`r.jina.ai`), defuddle.md, markdown.new

## 🚀 Key Features

- **4-tier fallback chain**: Sequentially tries Jina Reader → defuddle.md → markdown.new → raw HTML, returning the first successful response.
- **LLM-ready output**: Jina Reader is called with `Accept: text/markdown` header, yielding clean Markdown stripped of navigation and boilerplate.
- **File output flag**: `-o / --output <file>` saves content to disk instead of stdout, enabling pipeline-friendly use.
- **Stderr/stdout separation**: Progress messages and errors go to `stderr`; only the final content goes to `stdout`, making the script composable in shell pipelines.
- **Skill-spec compliant**: Ships a YAML-frontmattered `SKILL.md` with trigger descriptions and usage examples for agent auto-discovery.

## 🏗 High-Level Architecture

A single Python script implements a **strategy pattern** via a `STRATEGIES` list of `(name, callable)` tuples. The `fetch()` function iterates the list, catching all exceptions and falling back to the next strategy. The main entry point parses CLI arguments and delegates to `fetch()`, then writes the result to stdout or a file.

```
CLI args (argparse)
       │
       ▼
   fetch(url)
       │
       ├─ fetch_via_jina()    → GET https://r.jina.ai/{url}  (Accept: text/markdown)
       ├─ fetch_via_defuddle() → GET https://defuddle.md/{url}
       ├─ fetch_via_markdown_new() → GET https://markdown.new/{url}
       └─ fetch_raw()         → GET {url}  (raw HTML fallback)
```

All HTTP requests share a single `fetch_url()` helper using `urllib.request` with a macOS Chrome User-Agent string and a 30-second timeout.

## 📂 Directory Structure (Core)

```
web-fetcher/
├── SKILL.md          # Skill manifest (YAML frontmatter + usage docs)
└── scripts/
    └── fetch.py      # Full implementation (~94 lines)
```

## 🎯 Main Entry Points

- `scripts/fetch.py`: CLI entry point. Parses `url` (positional) and `-o/--output` (optional). Invokes `fetch()` and writes result.

## 📝 Observations & Patterns

- **Strategy pattern**: `STRATEGIES = [(name, fn), ...]` list makes adding or reordering providers a one-line change.
- **Zero dependencies**: Pure stdlib Python — no `pip install` required; runs on any Python 3.10+ environment.
- **Jina AI as primary**: Consistent with the broader Vibe Hub context, Jina Reader (`r.jina.ai`) is the preferred source for its superior Markdown quality over raw HTML scraping.
- **User-Agent spoofing**: Uses a specific macOS Chrome UA string (`Chrome/131`) to reduce bot-detection rejections on direct HTML fetches.
- **Error aggregation**: All strategy failures are collected and surfaced together in the final `RuntimeError`, aiding debugging.
- **Minimal surface area**: The entire skill is ~94 lines with no configuration files, making it trivially auditable and portable.

## 🛠 How to Run / Test

```bash
# Read a URL to stdout
python3 /path/to/web-fetcher/scripts/fetch.py https://example.com

# Save to a file
python3 /path/to/web-fetcher/scripts/fetch.py https://example.com -o output.md

# Progress/errors visible on stderr; only content on stdout
python3 /path/to/web-fetcher/scripts/fetch.py https://example.com 2>errors.log > content.md
```

No installation required. Requires Python 3.10+ (uses `dict | None` union type hint syntax).

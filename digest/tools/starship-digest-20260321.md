# Starship Digest

- **URL**: https://github.com/starship/starship
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Rust
- **Performance Goal**: < 50ms latency

## 🚀 Key Features
- **Cross-Shell**: Works with Bash, Zsh, Fish, PowerShell, etc.
- **Context-Aware**: Shows git status, language versions, cloud context.
- **Blazing Fast**: Written in Rust for near-instant prompt rendering.

## 🏗 High-Level Architecture
A modular, parallelized environment probe. It executes multiple "modules" concurrently to gather context (git status, language versions) with a strict focus on sub-50ms latency. It uses aggressive caching and asynchronous task execution to ensure zero-lag terminal prompts.

## 📂 Directory Structure (Core)
- `src/modules/`: Individual prompt component logic.
- `src/configs/`: Default and user configuration handling.
- `src/print.rs`: The core rendering engine.

## 📝 Observations & Patterns
- **Performance First**: Every module is optimized for maximum speed.
- **Declarative Config**: Simple TOML-based configuration for complex UI.

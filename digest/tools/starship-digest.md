# Starship Digest

- **URL**: https://github.com/starship/starship
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Rust
- **Build System**: Cargo (`Cargo.toml`)
- **Supported Shells**: Bash, Fish, Zsh, Powershell, Ion, Tcsh, Elvish, Nu, Xonsh, Cmd.
- **Serialization**: TOML (`serde`)

## 🚀 Key Features
- **Cross-Shell Support**: A single configuration for almost any shell environment.
- **Blazing Fast**: Written in Rust for minimal latency in prompt rendering.
- **Infinitely Customizable**: Highly modular "modules" for language versions, Git status, battery, etc.
- **Intelligent Context**: Shows relevant information based on the current directory (e.g., Node.js version in a `package.json` folder).
- **Presets**: Built-in support for popular themes (Powerline, Nerd Fonts, etc.).
- **Rich Integration**: Deep support for Git, AWS, Kubernetes, and 40+ other programming languages and tools.

## 🏗 High-Level Architecture
Starship is a monolithic Rust CLI that generates a prompt string based on the current environment and a TOML configuration file.
- **Context Engine (`src/context.rs`)**: Gathers environmental data (git, path, env vars).
- **Module System (`src/modules/`)**: Individual modules for each language or tool that decide what to display.
- **Configuration (`src/config.rs`)**: Handles TOML parsing and merging of defaults with user settings.
- **Initialization (`src/init/`)**: Generates the shell-specific scripts to hook the prompt into the shell's lifecycle.

## 📂 Directory Structure (Core)
- `src/`: Rust source code.
  - `modules/`: Core logic for all 50+ display modules.
  - `init/`: Shell-specific initialization templates.
  - `configs/`: Default configuration values.
  - `formatter/`: String formatting and styling logic.
- `docs/`: Documentation and presets.
- `install/`: Installation scripts for different platforms.

## 🎯 Main Entry Points
- `src/main.rs`: CLI entry point, handles subcommands like `init`, `prompt`, `explain`, `configure`.
- `src/lib.rs`: Core library logic used by the CLI.
- `Cargo.toml`: Project metadata and dependencies.

## 📝 Observations & Patterns
- **Extreme Portability**: Uses a single binary approach to avoid shell-specific performance bottlenecks.
- **Modular by Design**: Each piece of the prompt is an independent module, making it easy to extend.
- **Performance Focused**: Extensive use of caching and parallel execution to keep prompt generation under human-perceivable limits.
- **User-Centric Configuration**: The TOML-based configuration is designed to be human-readable and easy to share (presets).

## 🛠 How to Run / Test
- **Installation**: `curl -sS https://starship.rs/install.sh | sh`
- **Shell Init**: `eval "$(starship init zsh)"` (for Zsh)
- **Build**: `cargo build --release`
- **Test**: `cargo test`

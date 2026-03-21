# lazygit Digest

- **URL**: https://github.com/jesseduffield/lazygit
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Go
- **Frameworks/Libraries**: `gocui` (TUI), `go-git` (git operations), `tcell` (terminal control)
- **Build/Package Tools**: Go, Homebrew, Scoop, etc.

## 🚀 Key Features
- **Interactive Rebase**: Provides a visual and easy way to perform interactive rebasing without editing TODO files.
- **Stage Individual Lines/Hunks**: Allows staging parts of files easily through the terminal UI.
- **Cherry-picking & Bisecting**: Integrated support for common git workflows.
- **Git Worktrees**: First-class support for managing multiple worktrees.
- **Custom Commands**: Users can define their own keybindings and commands.
- **Undo Support**: Ability to undo many git operations within the UI.

## 🏗 High-Level Architecture
Lazygit follows a modular Go structure:
- `pkg/gui`: Implements the terminal user interface, organizing views, contexts, and controllers. It handles user input and visual layout.
- `pkg/commands`: Manages interaction with the underlying git system, combining high-level Go-git libraries with direct OS command execution.
- `pkg/app`: Orchestrates the application initialization, configuration loading, and dependency injection.

## 📂 Directory Structure (Core)
- `cmd/`: Entry points for the application.
- `pkg/`: Core implementation logic.
  - `app/`: App setup and lifecycle.
  - `gui/`: Terminal UI components and controllers.
  - `commands/`: Git command wrappers and OS interaction.
  - `config/`: User and default configuration handling.
  - `i18n/`: Internationalization support.
- `docs/`: Extensive documentation on features and configuration.

## 🎯 Main Entry Points
- `main.go`: The root entry point of the application.
- `pkg/app/app.go`: Initializes the core components and starts the GUI.

## 📝 Observations & Patterns
- **High Customizability**: Extensive support for user-defined keybindings, themes, and commands via YAML configuration.
- **Human-Centric Design**: Focuses on making complex git operations intuitive and fast, reducing the cognitive load for developers.
- **TUI Robustness**: Uses a robust TUI framework built on `gocui` and `tcell` for cross-platform terminal compatibility.

## 🛠 How to Install
```bash
brew install lazygit
```

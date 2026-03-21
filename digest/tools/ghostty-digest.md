# Ghostty Digest

- **URL**: https://github.com/ghostty-org/ghostty
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Zig
- **Build System**: Zig Build System (`build.zig`)
- **Graphics Libraries**: Metal (macOS), GTK/OpenGL/Vulkan (Linux)
- **Distribution Support**: Nix, Snap, Flatpak, MacOS (.app), PKGBUILD (Arch)

## 🚀 Key Features
- **High Performance**: Designed to be fast and efficient using modern rendering techniques.
- **Native Experience**: Prioritizes native platform integrations (e.g., native macOS menus, GTK widgets on Linux).
- **Standards Compliant**: Full xterm compliance and audit for maximum shell/tool compatibility.
- **Modern Features**: Multi-window, tabbing, panes, and advanced CLI interaction extensions.
- **Embeddable**: Developing `libghostty` to allow terminal embedding in other applications.
- **Safe & Accessible**: Written in Zig for memory safety and performance without the overhead of heavy frameworks.

## 🏗 High-Level Architecture
Ghostty is built from the ground up in Zig. It abstracts platform-specific behaviors into an application runtime (`apprt`) layer.
- **Core Engine (`src/terminal/`)**: Handles terminal state, control sequences, and PTY interaction.
- **Rendering (`src/renderer/`)**: Manages the GPU-accelerated drawing logic.
- **App Runtime (`src/apprt/`)**: Provides a bridge between the core terminal and platform-native windowing systems (GTK for Linux, native macOS app).
- **Input System (`src/input/`)**: Handles keyboard and mouse events across platforms.

## 📂 Directory Structure (Core)
- `src/`: Core source code in Zig.
  - `terminal/`: PTY and terminal emulation state logic.
  - `renderer/`: GPU-accelerated rendering engine.
  - `apprt/`: Platform-specific runtime abstractions (GTK, macOS, etc.).
  - `config/`: Configuration parsing and management.
- `macos/`: Native macOS application resources and code.
- `pkg/`: Packaging scripts for different Linux distributions.
- `nix/`: Nix flakes and expressions for the project.
- `include/`: C headers for embedding support.

## 🎯 Main Entry Points
- `src/main.zig`: Global entry point that switches between different build modes (CLI, GUI, generators).
- `src/main_ghostty.zig`: Entry point for the actual Ghostty application.
- `build.zig`: Build configuration and dependency management.

## 📝 Observations & Patterns
- **Zero-Dependency Core**: Highly optimized Zig code that minimizes external library usage for the terminal engine itself.
- **Zig-Native Design**: Extensively uses Zig's features like comptime and direct memory management for performance.
- **Cross-Platform Abstraction**: Clean separation between the emulation engine and the visual frontend.
- **Documentation Driven**: Includes generators for man pages and web documentation directly in the build process.

## 🛠 How to Run / Test
- **Build**: `zig build` (requires Zig 0.13.0+)
- **Test**: `zig build test`
- **Run**: `./zig-out/bin/ghostty`
- **Nix**: `nix run github:ghostty-org/ghostty`

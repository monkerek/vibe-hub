# Ghostty Digest

- **URL**: https://github.com/ghostty-org/ghostty
- **Date Researched**: 2026-03-21

## 🛠 Tech Stack
- **Primary Language**: Zig
- **Rendering**: GPU-accelerated (Metal, OpenGL)

## 🚀 Key Features
- **Low Latency**: Optimized for near-zero input lag.
- **Native Experience**: Uses platform-native UI APIs.
- **Zig Powered**: Leverages Zig's performance and memory safety.

## 🏗 High-Level Architecture
A GPU-accelerated terminal emulator built with Zig. It leverages Zig's `comptime` for high-performance parsing and memory safety. The architecture separates the terminal core (`libghostty`) from platform-specific UI layers (Metal/OpenGL/GTK).

## 📂 Directory Structure (Core)
- `src/renderer/`: GPU rendering logic.
- `src/terminal/`: The core terminal state machine (`libghostty`).
- `src/ui/`: Platform-specific UI implementations.

## 📝 Observations & Patterns
- **Comptime Optimization**: Uses Zig's compile-time features for runtime speed.
- **Clean Separation**: Core logic is independent of the graphical frontend.

# Red Note Digest: OpenClaw爆火后，Browser Use CLI才是杀招

## Metadata

| Field | Value |
|---|---|
| **Platform** | Red Note (小红书 / Xiaohongshu) |
| **Note ID** | `69beb0b70000000022029b6f` |
| **URL** | https://www.xiaohongshu.com/discovery/item/69beb0b70000000022029b6f |
| **Language** | zh (Chinese) |
| **Content Shape** | Single post — opinion/recommendation |
| **Fetch Method** | Web search synthesis (all direct fetch tiers returned 403; content recovered via indexed search snippets + linked GitHub repos) |
| **Digest Date** | 2026-03-22 |

---

## Title

**OpenClaw爆火后，Browser Use CLI才是杀招**
*(After OpenClaw went viral, Browser Use CLI is the killer move)*

---

## Core Thesis

OpenClaw is the hot platform — but the real power unlock is the ecosystem of **Browser Use CLI tools** that let AI agents operate any website using browser session cookies, with zero API keys and zero extra cost.

---

## Key Points

### 1. OpenClaw的爆火背景 (Why OpenClaw went viral)
- OpenClaw recently surpassed Linux in trending popularity within developer circles
- Described as "limited in pure utility but highly extensible and fun"
- Community is extremely active — users have installed up to 54 Skills
- Its real power is as a **platform/runtime**, not a standalone tool

### 2. Browser Use CLI — 真正的杀招 (The actual killer move)
The post highlights **two Browser Use CLI tools** as the real breakthrough:

#### `@lucasygu/redbook` (Xiaohongshu CLI)
- Search notes, read content, analyze creators, post content
- **No API Key required** — authenticates via existing browser cookies
- Works natively as a Skill for Claude Code, Cursor, Codex, Windsurf, OpenClaw
- OpenClaw users: `clawhub install redbook`
- Example natural-language task: *"分析'AI编程'在小红书的竞争格局"* → agent auto-searches keywords, analyzes engagement, surfaces top creators, suggests content strategy

#### `opencli` (Universal CLI Hub)
- Converts **any website or Electron app** into a CLI
- Supports: Bilibili, 知乎, 小红书, Twitter/X, Reddit, YouTube
- AI-native runtime with `AGENT.md` integration for agent discovery
- Register any local CLI: `opencli register mycli` → AI learns to call it perfectly

### 3. 为什么这才是"杀招" (Why this is the killer move)
> In 2026, the core competitive advantage of AI agents has shifted from **model size** to **breadth of access**.

- Traditional mode: manually feed content, rely on paid APIs, weak real-time access
- Browser Use CLI mode: AI agents directly "go online" using browser sessions — **no API key, zero config, zero cost**
- This is what actually unlocks OpenClaw's full potential

---

## Tools Referenced

| Tool | Install | Purpose |
|---|---|---|
| `@lucasygu/redbook` | `npm install -g @lucasygu/redbook` or `clawhub install redbook` | Xiaohongshu CLI |
| `opencli` | [`github.com/jackwener/opencli`](https://github.com/jackwener/opencli) | Universal website-to-CLI converter |
| `xiaohongshu-cli` | `uv tool install xiaohongshu-cli` | Alternative XHS CLI (Python, `xhs read <id>`) |

---

## Fetch Notes

Direct access to `xiaohongshu.com` is blocked for all proxy tiers (Jina Reader, defuddle.md, markdown.new, Google Cache, direct WebFetch — all 403). Content was recovered via:
1. Web search indexing (`WebSearch` tool) which surfaced synthesized snippets from community discussions
2. Direct fetch of referenced GitHub repos (`lucasygu/redbook`, `jackwener/opencli`)

**Confidence**: High on core thesis and tool references. Author identity and exact post phrasing unverified (auth-wall prevents direct read).

---

## Relevance to Vibe Hub

This post is directly applicable. The `@lucasygu/redbook` CLI can be installed as a Vibe Hub skill — enabling Claude Code (and the other agents) to read, search, and interact with Red Note natively, solving the exact auth-wall problem encountered during this research session.

---
name: post-research
description: Transforms social media posts and tech blog articles into structured digests. Optimized for tech blog posts. Best-effort for Twitter/X and Red Note (小红书) — social platforms are walled and may only be reachable via Search Synthesis or platform CLIs. Triggers on requests like "digest this tweet", "summarize this blog post", "research this Red Note post", or any task that provides a URL to a social post or short-form article.
---

# Post Research

## Overview

This skill fetches and transforms short-form web content — tweets/X threads, Red Note (小红书) posts, and tech blog articles — into structured, reusable digests. It uses a tiered fetch strategy (proxy chain → platform CLIs → Search Synthesis) to extract clean Markdown. Output is saved to `digest/posts/`.

## 📦 Dependencies

No installation required. The agent uses the built-in `WebFetch` tool to call `r.jina.ai`. If running headlessly via script, use the `web-fetcher` skill's `fetch.py` instead:

```bash
python3 <web-fetcher-path>/scripts/fetch.py <url>
```

## 🚀 Workflow Checklist

You MUST follow this checklist for every post research task:

1. [ ] **Identify & Triage**: Confirm the URL and detect the platform (Twitter/X, Red Note, or blog). See `references/platform-guide.md` for per-platform quirks.
2. [ ] **Fetch Content**: Attempt each source in order, stopping at the first success. Log the response length at each step.
   - **Tier 0 — Platform CLI** *(Twitter/X and Red Note — **optional**, requires one-time `.env` setup)*: Native browser-cookie auth — most reliable, bypasses all proxy blocks. If `*-check.sh` exits non-zero (2 = not configured, 3 = tokens expired), **skip silently to Tier 1** — do NOT treat as an error.
     - Twitter/X: `bash scripts/bird-check.sh && bash scripts/bird-read.sh <url> [--thread] --json`
     - Red Note: `bash scripts/redbook-check.sh && bash scripts/redbook-read.sh <url> --json`
     - Credentials live in `.vibe/skills/post-research/.env` (gitignored). See `.env.example` for the format and `references/*-setup.md` for extraction instructions.
   - **Tier 1 — Jina Reader**: `r.jina.ai/<url>` with header `Accept: text/markdown`
   - **Tier 2 — twitter-thread.com** *(Twitter/X only)*: `https://twitter-thread.com/t/<tweet-id>` (public thread reader; extract the tweet ID from the original URL)
   - **Tier 3 — defuddle.md**: `defuddle.md/<url>` (fallback if prior tiers fail or return < 100 chars)
   - **Tier 4 — markdown.new**: `markdown.new/<url>` (last resort for direct fetch)
   - **Search Synthesis (Last Resort)**: Use the `WebSearch` tool with `<author> <topic keywords> <platform>`. This returns indexed third-party commentary — NOT the original post. You MUST label the digest `Fetch Method: search-synthesis` and note it in a prominent warning. For Twitter, search by topic/author — tweet ID searches are unreliable.
   - If all tiers AND Search Synthesis fail, report all errors and stop.
3. [ ] **Auth Wall Check**: Scan the fetched content for auth-wall signals (`sign in`, `log in`, `create account`, `verify you are human`). If detected, stop and report the failure — do NOT proceed with partial content.
4. [ ] **Detect Language**: Identify the primary language of the content (en, zh, etc.) and note it in the digest metadata.
5. [ ] **Detect Content Shape**: Distinguish between a single post (short), a thread (sequential), or a long-form article, as this affects how the digest is structured.
6. [ ] **Synthesize**: Generate the digest using the appropriate template from `references/templates.md`.
7. [ ] **Save**: Write to `digest/posts/<platform>-<author>-<slug>-digest-YYYYMMDD.md`.

<HARD-GATE>
Do NOT finalize the digest if:
- The fetched content contains auth-wall signals (step 3 above).
- The content length is under 100 characters (likely a redirect or empty response).
- The platform is Red Note AND the content appears to be image-only with no extractable text.

In all three cases, report the specific failure reason and stop.
</HARD-GATE>

---

## ⚖️ Standards

- **No Hallucination**: Only include information directly present in the fetched content.
- **No Fabricated Quotes**: If a quote cannot be verified in the fetched Markdown, omit it.
- **Language Fidelity**: Preserve the original language for quotes. Add an English translation in parentheses if the post is in Chinese.
- **Naming**: Digest filenames MUST follow `<platform>-<author>-<slug>-digest-YYYYMMDD.md` in kebab-case. Example: `twitter-karpathy-scaling-laws-digest-20260321.md`.

---

## 📝 Anti-Patterns

- **Auth Wall Passthrough**: Summarizing login-page content as if it were the actual post.
- **Search-Synthesis Passthrough**: Using WebSearch results as if they were fetched post content — search results are third-party commentary, not the original post. Always label `Fetch Method: search-synthesis` and note confidence limitations.
- **Image-Only Fabrication**: Inventing captions or post text for Red Note posts that returned no extractable content.
- **Thread Collapse**: Summarizing only the first tweet in a thread instead of the full thread.
- **Wrong Destination**: Saving to `digest/media/` or `digest/paper/` instead of `digest/posts/`.
- **Missing Slug**: Naming the file `twitter-digest-20260321.md` without an author or topic slug.

---

## 📂 Resources & Progressive Disclosure

- **`references/platform-guide.md`**: Per-platform fetch behavior, known limitations, and URL patterns for Twitter/X, Red Note, and tech blogs.
- **`references/templates.md`**: Digest templates for each content shape (single post, thread, long-form article).
- **`.env.example`**: Credential template — copy to `.env` and fill in values. Never commit `.env` itself.
- **`references/bird-setup.md`**: Step-by-step guide for extracting `auth_token` + `ct0` from Chrome/Firefox/Safari for Twitter/X Tier 0.
- **`references/redbook-setup.md`**: Step-by-step guide for extracting `a1` + `web_session` from Chrome/Firefox/Safari for Red Note Tier 0.
- **`scripts/bird-check.sh`**: Twitter auth health check. Exit 0 = ready, exit 2 = not configured (skip), exit 3 = expired (skip).
- **`scripts/bird-read.sh`**: Wrapper for `bird read`/`bird thread` — sources `.env`, passes `--auth-token`/`--ct0` automatically.
- **`scripts/redbook-check.sh`**: Red Note auth health check. Same exit code convention as bird-check.
- **`scripts/redbook-read.sh`**: Wrapper for `redbook read` — sources `.env`, combines `XHS_A1`+`XHS_WEB_SESSION` into cookie string automatically.

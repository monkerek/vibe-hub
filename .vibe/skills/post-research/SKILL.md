---
name: post-research
description: Transforms social media posts and tech blog articles into structured digests. Optimized for tech blog posts and public tweets/X threads. Supports best-effort extraction for Red Note (小红书) posts. Triggers on requests like "digest this tweet", "summarize this blog post", "research this Red Note post", or any task that provides a URL to a social post or short-form article.
---

# Post Research

## Overview

This skill fetches and transforms short-form web content — tweets/X threads, Red Note (小红书) posts, and tech blog articles — into structured, reusable digests. It uses Jina Reader (`r.jina.ai`) as the primary content extractor, with documented fallbacks per platform. Output is saved to `digest/posts/`.

## 📦 Dependencies

No installation required. The agent uses the built-in `WebFetch` tool to call `r.jina.ai`. If running headlessly via script, use the `web-fetcher` skill's `fetch.py` instead:

```bash
python3 <web-fetcher-path>/scripts/fetch.py <url>
```

## 🚀 Workflow Checklist

You MUST follow this checklist for every post research task:

1. [ ] **Identify & Triage**: Confirm the URL and detect the platform (Twitter/X, Red Note, or blog). See `references/platform-guide.md` for per-platform quirks.
2. [ ] **Fetch Content**: Call `r.jina.ai/<url>` with `Accept: text/markdown`. Log the response length.
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
- **Image-Only Fabrication**: Inventing captions or post text for Red Note posts that returned no extractable content.
- **Thread Collapse**: Summarizing only the first tweet in a thread instead of the full thread.
- **Wrong Destination**: Saving to `digest/media/` or `digest/paper/` instead of `digest/posts/`.
- **Missing Slug**: Naming the file `twitter-digest-20260321.md` without an author or topic slug.

---

## 📂 Resources & Progressive Disclosure

- **`references/platform-guide.md`**: Per-platform fetch behavior, known limitations, and URL patterns for Twitter/X, Red Note, and tech blogs.
- **`references/templates.md`**: Digest templates for each content shape (single post, thread, long-form article).

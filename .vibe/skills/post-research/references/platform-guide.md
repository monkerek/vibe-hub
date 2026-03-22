# Platform Guide

Per-platform fetch behavior, known limitations, and URL normalization for the `post-research` skill.

---

## 🔄 Fetch Fallback Chain

All fetch attempts follow this priority order, mirroring the `web-fetcher` skill:

| Tier | Service | URL Pattern | Notes |
|---|---|---|---|
| 1 | **Jina Reader** | `https://r.jina.ai/<url>` | Best Markdown quality; use `Accept: text/markdown` header. Free tier: 100 RPM. |
| 2 | **twitter-thread.com** *(Twitter/X only)* | `https://twitter-thread.com/t/<tweet-id>` | Public thread reader; extract tweet ID from URL. |
| 3 | **defuddle.md** | `https://defuddle.md/<url>` | Good fallback for structured articles; less reliable on SPAs. |
| 4 | **markdown.new** | `https://markdown.new/<url>` | Last-resort converter; output quality varies. |
| 5 | **WebSearch** | `WebSearch` tool with author + topic keywords | Use when all proxy tiers fail. Synthesize from indexed snippets + linked sources. Works well for widely-discussed posts; unreliable for obscure or very recent content. |

Stop at the first tier that returns ≥ 100 characters without auth-wall signals. If all tiers including WebSearch fail, report all errors and stop.

**Environment note**: In restricted/headless environments, proxy tiers 1–4 may all return 403 due to IP or User-Agent blocking. In this case, Tier 5 (`WebSearch`) is the primary fallback. Document the fetch method used in the digest metadata.

**API key note**: Jina Reader's free tier may rate-limit or return 403 in high-traffic environments. For production use, pass an `Authorization: Bearer <token>` header to increase limits to 500 RPM.

---

## 🐦 Twitter / X (`x.com`, `twitter.com`)

### URL Patterns
- Single tweet: `https://x.com/<user>/status/<id>` or `https://twitter.com/<user>/status/<id>`
- Profile: `https://x.com/<user>` — **not supported**, profile pages require auth
- Short link: `https://t.co/<id>` — normalize by following the redirect first

### Fetch Behavior

Attempt in this order for Twitter/X URLs:

1. **Jina Reader**: `r.jina.ai/https://x.com/<user>/status/<id>` — extracts tweet text, author handle, sometimes reply counts
2. **twitter-thread.com**: `https://twitter-thread.com/t/<tweet-id>` — public reader that renders full threads without auth; construct from the status ID in the original URL
3. **defuddle.md** / **markdown.new** — generic fallbacks (see global fallback chain above)

Auth-wall signal: response contains `"Sign in to X"` or `"Log in"` — treat as failure

### Threads
- Threads are not a single URL. Each tweet in a thread has its own `/status/<id>`.
- If the user provides only the first tweet URL, fetch it and look for a "Show this thread" link in the Markdown output.
- Fetch each subsequent tweet URL individually and concatenate before synthesizing.
- Cap at 20 tweets per thread to avoid runaway fetching.

### WebSearch Fallback (Tier 5) for Twitter
- Search by **author + topic keywords**, not by tweet ID — ID-only searches rarely surface exact content
- Example: `"karpathy vibe coding twitter"` >> `"karpathy status 1886192184808149383"`
- Works best for viral tweets that have been quoted, retweeted, or written about
- Obscure or very recent tweets (< 48h) may not be indexed yet

### Known Limitations
- Sensitive/NSFW content behind age gate: not fetchable
- Private accounts: not fetchable
- Deleted tweets: Jina may return cached content or 404
- Quote tweets: the quoted content may appear truncated
- All proxy tiers (1–4) return 403 in restricted/headless environments — Tier 5 is the real fallback

### Digest Naming
`twitter-<handle>-<topic-slug>-digest-YYYYMMDD.md`
Example: `twitter-karpathy-diffusion-models-digest-20260321.md`

---

## 📕 Red Note / Xiaohongshu (`xiaohongshu.com`, `xhslink.com`)

### URL Patterns
- Web post: `https://www.xiaohongshu.com/explore/<post-id>`
- Share link: `https://xhslink.com/<short-id>` — normalize by resolving the redirect
- App deep link: `xhsshare://...` — **not supported**, cannot fetch from CLI

### Fetch Behavior
- **Best-effort only.** Xiaohongshu is a mobile-first, login-encouraged platform.
- Jina Reader can sometimes extract the caption text for public posts.
- Many posts are primarily images with short captions — extractable text may be very short (< 200 chars).
- Auth-wall signal: response contains `"登录"` (login), `"注册"` (register), or `"请登录后查看"`.

### Content Shape
Red Note posts typically have:
- A title or first line (用户名/note title)
- A multi-paragraph caption (often with hashtags `#标签`)
- Image count (not extractable via text fetch)
- Comments (not extractable)

### Known Limitations
- Image-only posts: no text to extract → trigger Hard Gate, report failure
- Video posts: title may be extractable, but content is not
- Geo-restricted: content may vary by region/IP
- Login wall: increasingly common even for public posts

### Digest Naming
`rednote-<author>-<topic-slug>-digest-YYYYMMDD.md`
Example: `rednote-username-matcha-latte-recipe-digest-20260321.md`

---

## 📝 Tech Blogs & Articles

This is the most reliable category. Jina Reader is purpose-built for this.

### Supported Platforms (High Reliability)
| Platform | URL Pattern | Notes |
|---|---|---|
| Medium | `medium.com/<user>/<slug>` | Works well; member-only articles may be paywalled |
| Substack | `<name>.substack.com/p/<slug>` | Free posts work; paid posts return preview only |
| dev.to | `dev.to/<user>/<slug>` | Reliable |
| Hashnode | `<name>.hashnode.dev/<slug>` | Reliable |
| Personal blogs | Any | Works well for static/SSG sites |
| Hacker News | `news.ycombinator.com/item?id=<id>` | Returns comments thread; fetch the linked URL instead for article content |

### Fetch Behavior
- Jina Reader produces high-quality Markdown with code blocks preserved
- Paywalled content: partial content up to the paywall cut-off point; note this in the digest
- Auth-wall signal: `"Member-only story"`, `"Subscribe to read"`, `"Upgrade to continue"`

### Digest Naming
`<platform>-<author>-<slug>-digest-YYYYMMDD.md`
Examples:
- `medium-swyx-ai-engineer-digest-20260321.md`
- `substack-pragmaticengineer-monorepos-digest-20260321.md`
- `blog-antirez-redis-internals-digest-20260321.md`

---

## 🌐 Generic / Unknown Platform

If the domain does not match any known pattern:
1. Attempt fetch via `r.jina.ai/<url>` as normal
2. Set `platform: blog` in the digest metadata
3. Derive author from the page's author meta tag or byline in the Markdown
4. Use `blog-<domain>-<slug>-digest-YYYYMMDD.md` as the filename pattern

# Platform Guide

Per-platform fetch behavior, known limitations, and URL normalization for the `post-research` skill.

---

## 🔄 Fetch Fallback Chain

All fetch attempts follow this priority order, mirroring the `web-fetcher` skill:

| Tier | Service | URL Pattern | Notes |
|---|---|---|---|
| 1 | **Jina Reader** | `https://r.jina.ai/<url>` | Best Markdown quality; use `Accept: text/markdown` header. Free tier: 100 RPM. |
| 2 | **defuddle.md** | `https://defuddle.md/<url>` | Good fallback for structured articles; less reliable on SPAs. |
| 3 | **markdown.new** | `https://markdown.new/<url>` | Last-resort converter; output quality varies. |

Stop at the first tier that returns ≥ 100 characters without auth-wall signals. If all three fail, report all errors and do not proceed — raw HTML is not acceptable input for digest synthesis.

**API key note**: Jina Reader's free tier may rate-limit or return 403 in high-traffic environments. For production use, pass an `Authorization: Bearer <token>` header to increase limits to 500 RPM.

---

## 🐦 Twitter / X (`x.com`, `twitter.com`)

### URL Patterns
- Single tweet: `https://x.com/<user>/status/<id>` or `https://twitter.com/<user>/status/<id>`
- Profile: `https://x.com/<user>` — **not supported**, profile pages require auth
- Short link: `https://t.co/<id>` — normalize by following the redirect first

### Fetch Behavior
- **Jina Reader works** for public tweets: `r.jina.ai/https://x.com/<user>/status/<id>`
- Jina extracts tweet text, author handle, and sometimes reply counts
- Auth-wall signal: response contains `"Sign in to X"` or `"Log in"` — treat as failure

### Threads
- Threads are not a single URL. Each tweet in a thread has its own `/status/<id>`.
- If the user provides only the first tweet URL, fetch it and look for a "Show this thread" link in the Markdown output.
- Fetch each subsequent tweet URL individually and concatenate before synthesizing.
- Cap at 20 tweets per thread to avoid runaway fetching.

### Known Limitations
- Sensitive/NSFW content behind age gate: not fetchable
- Private accounts: not fetchable
- Deleted tweets: Jina may return cached content or 404
- Quote tweets: the quoted content may appear truncated

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

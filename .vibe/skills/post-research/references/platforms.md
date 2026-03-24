# Platform Reference — Post Research

Extraction strategies, quality signals, and quirks for each supported platform.

---

## Twitter / X

### Content Characteristics
- Fragmented: ideas split across tweets (280-char limit encourages threading)
- Non-linear: quote tweets, replies, and sub-threads create branching narratives
- Ephemeral: tweets can be deleted, accounts suspended, or visibility restricted
- Rich context: author's bio, pinned tweet, and follower network provide credibility signals
- **X Articles**: X supports native long-form "Articles" (`x.com/i/article/{id}`). These look like tweets linking to content but the full article lives on X.com itself. Articles are NOT fetchable via WebFetch — use the proxy chain below, then search for the author's cross-post (personal blog, newsletter) for the full text.

### Extraction Strategy

**Critical: x.com requires JavaScript rendering and WILL FAIL with WebFetch. NEVER attempt a direct `WebFetch` to x.com or twitter.com URLs — it always returns a "JavaScript is not available" error page. Use the proxy chain below instead.**

#### Step 1: Extract Tweet Metadata via Proxy API

Transform the tweet URL into a proxy API call. Use this fallback chain (stop at first success):

| Priority | Proxy | URL Pattern | Returns |
|----------|-------|-------------|---------|
| 1 | fxtwitter | `https://api.fxtwitter.com/{handle}/status/{id}` | Full text, engagement (likes/retweets/bookmarks/views), author bio, follower count, media, linked URLs |
| 2 | vxtwitter | `https://api.vxtwitter.com/{handle}/status/{id}` | Text, engagement (likes/retweets/replies), author name, media, date |

**URL transformation**: Given `https://x.com/HiTw93/status/2034627967926825175`, extract `handle=HiTw93` and `id=2034627967926825175`, then call `https://api.fxtwitter.com/HiTw93/status/2034627967926825175`.

**Prefer fxtwitter** — it returns richer data (bookmarks, views, follower count) and often extracts the content of linked X Articles.

#### Step 2: Follow External Links

Tweets frequently link to external content (blog posts, articles, papers). After extracting the tweet:

1. Check if the tweet links to an **X Article** (`x.com/i/article/{id}`). If so, the proxy may have extracted the article content. If not, proceed to Step 3.
2. Check if the tweet links to an **external URL** (`t.co` redirect to a blog, Substack, etc.). If so, `WebFetch` the external URL directly.
3. If neither proxy extracted the full content, **search for the article title** (extracted from the tweet/preview) + the author's known blog domain to find a cross-posted version.

#### Step 3: Locate Cross-Posted Content (if needed)

Many technical authors cross-post between X and their personal blogs. When the tweet links to an X Article or the proxy content is insufficient:

1. `WebSearch` for `"{article title}" {author handle} site:{known blog domain}` — e.g., `"你不知道的 Agent" tw93 site:tw93.fun`
2. `WebSearch` for `"{article title}" {author handle}` more broadly if no blog domain is known.
3. `WebFetch` the blog version — personal blogs are almost always fetchable and contain the complete, formatted content.

#### Step 4: Thread Reconstruction (for multi-tweet threads)

If the content is a thread (not a single tweet or Article):
1. The proxy response may include thread context. If not, search for `from:{handle} "thread" {keywords}` to find thread unrollers or summaries.
2. Reconstruct the full thread in reading order. Include quoted tweets inline with attribution. Exclude reply noise unless it adds substantive context.

#### Step 5: Engagement & Profile Context

1. **Engagement**: Note engagement metrics from the proxy response. fxtwitter provides the most complete data (views, bookmarks).
2. **Profile context**: The proxy returns author bio and follower count. Cross-reference with `WebSearch` for the author's other platforms (GitHub, personal site) to assess expertise.
3. **Discourse**: Search for quote-tweets and responses from domain experts — corrections, counterarguments, or additions may be more valuable than the original content.

### Quality Signals
- Author has verifiable expertise (job title, publications, open-source work)
- Thread includes links to primary sources
- Claims are specific and falsifiable (not vague platitudes)
- Author acknowledges limitations or caveats
- Substantive engagement from other domain experts

### Red Flags
- Thread is primarily promotional (product launch, course announcement)
- Claims are unlinked ("studies show..." without citation)
- Engagement is inflated by controversy rather than substance
- Author deletes and reposts threads for engagement optimization

---

## Blog Posts (Personal / Company)

### Content Characteristics
- Long-form: typically 1000-5000+ words
- Structured: headings, code blocks, diagrams
- Persistent: rarely deleted, often updated
- Author-controlled: no editorial review unless company blog

### Extraction Strategy
1. **Full text extraction**: Capture headings, body text, code blocks, and inline links.
2. **Metadata**: Publication date, last-updated date (if visible), author bio, and any editorial/review notes.
3. **Code blocks**: Preserve exactly — they are often the primary value of technical posts.
4. **Comments section**: Skim for author responses to corrections or clarifications.

### Quality Signals
- Clear publication and update dates
- Working code examples with version pinning
- Links to source material and documentation
- Author's other posts demonstrate sustained expertise
- Company blogs often have internal review (higher baseline quality)

### Red Flags
- No publication date (impossible to assess currency)
- Code examples without version context
- "Top 10 best..." listicle format with affiliate links
- Ghost-written content (generic voice, no personal insight)

### Notable Technical Blogs
- lilianweng.github.io (ML/AI deep dives)
- karpathy.github.io (neural networks, AI)
- simonwillison.net (Python, AI tools, data)
- blog.pragmaticengineer.com (engineering culture, systems)
- martinfowler.com (software architecture)
- jvns.ca (systems, debugging)
- danluu.com (systems, performance)
- rachelbythebay.com (systems, war stories)

---

## Substack / Newsletters

### Content Characteristics
- Long-form essays (1000-5000+ words)
- Subscription model: some content may be paywalled
- Author-driven: strong personal voice and perspective
- Serialized: posts often build on previous issues
- Monetized: authors have financial incentive to maintain subscriber interest

### Extraction Strategy
1. **Full text**: Extract the complete newsletter issue including any subscriber-only sections if accessible.
2. **Series context**: Check if this is part of a series. Reference prior issues if they provide necessary context.
3. **Author's other work**: Substacks often serve as thought platforms for authors who also write books, give talks, or run companies.
4. **Cross-references**: Newsletter authors frequently reference each other — note these connections.

### Quality Signals
- Author has credentials beyond the newsletter itself
- Claims are supported by external evidence, not just personal anecdotes
- Publication maintains consistent quality over time
- Author engages with subscriber feedback and corrections

### Red Flags
- Paywalled conclusions (teaser posts that withhold the key insight)
- Increasingly promotional content as subscriber count grows
- Echo chamber dynamics (never engaging with counterarguments)
- Sensationalist framing to drive engagement and shares

---

## Medium

### Content Characteristics
- Variable quality: open platform means anyone can publish
- Metered paywall: some content behind Medium's paywall
- Algorithm-driven: popular posts are surfaced regardless of quality
- Publication affiliation: posts under a publication may have editorial review

### Extraction Strategy
1. **Full text**: Attempt direct extraction. If paywalled, check for cached versions or author cross-posts.
2. **Publication context**: Note if the post is under a known publication (Towards Data Science, Better Programming, etc.) vs. a personal account.
3. **Author profile**: Check follower count, post history, and external credentials.

### Quality Signals
- Published under a reputable Medium publication
- Author has verifiable external credentials
- Post includes original research, code, or data
- Thoughtful engagement in responses

### Red Flags
- High clap count but shallow content (viral ≠ valuable)
- SEO-optimized titles with thin content
- Recycled content from other sources without attribution
- Author's profile is primarily content-farm output

---

## LinkedIn

### Content Characteristics
- Professional context: posts are tied to real identities and job titles
- Networking incentive: content is shaped by career and business goals
- Character limit: posts are shorter than blogs but longer than tweets
- Article format: LinkedIn Articles are longer-form and closer to blog posts

### Extraction Strategy
1. **Post vs. Article**: Distinguish between short posts (feed) and long-form Articles.
2. **Author credentials**: LinkedIn profiles provide verifiable job history and connections.
3. **Engagement quality**: Check if engagement is from domain experts or generic "great post!" comments.

### Quality Signals
- Author's job history supports their expertise claims
- Post contains specific, actionable insights (not motivational platitudes)
- Engagement includes substantive discussion from peers

### Red Flags
- "Broetry" format (one-line paragraphs, engagement-bait hooks)
- Humble-brag framing disguised as advice
- Content recycled from other platforms without context adaptation
- Viral posts optimized for algorithm rather than substance

---

## Future Platforms

When adding a new platform, document these sections:
1. **Content Characteristics**: Format, length, persistence, editorial model
2. **Extraction Strategy**: How to get the full content into a digestible format
3. **Quality Signals**: What indicates this is worth researching
4. **Red Flags**: What indicates low-quality or misleading content

Candidate platforms for future support:
- Hacker News (comments as content)
- Reddit (subreddit posts and comment threads)
- Mastodon / Fediverse
- Bluesky
- Dev.to / Hashnode
- Zhihu (Chinese Q&A platform)
- WeChat articles

# Platform Reference — Post Research

Extraction strategies, quality signals, and quirks for each supported platform.

---

## Twitter / X

### Content Characteristics
- Fragmented: ideas split across tweets (280-char limit encourages threading)
- Non-linear: quote tweets, replies, and sub-threads create branching narratives
- Ephemeral: tweets can be deleted, accounts suspended, or visibility restricted
- Rich context: author's bio, pinned tweet, and follower network provide credibility signals

### Extraction Strategy
1. **Thread reconstruction**: Fetch the full thread in chronological order. Include quoted tweets inline with attribution. Exclude reply noise unless it adds substantive context.
2. **Media and links**: Note all embedded images, videos, and links. Images in technical threads often contain key diagrams or code screenshots.
3. **Engagement context**: Note if the thread has significant quote-tweet discourse — corrections, counterarguments, or additions from domain experts may be more valuable than the original thread.
4. **Profile context**: Check the author's bio, pinned tweet, and recent activity for expertise signals and potential commercial interests.

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

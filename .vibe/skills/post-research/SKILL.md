---
name: post-research
description: Researches blog posts, social media threads, and online articles to produce structured learning digests with author context, claim verification, and practical takeaways. TRIGGER when: user asks to research a blog post, analyze a Twitter/X thread, digest an online article, or create a digest from a web post or newsletter. DO NOT TRIGGER when: user asks to research academic papers (use doc-research), analyze video/audio content (use media-digest), or research GitHub repositories (use repo-research).
---

# Post Research

## Overview

This skill transforms blog posts, Twitter/X threads, newsletter essays, and online articles into structured learning digests. Unlike doc-research (optimized for academic rigor and LaTeX), post-research handles the informal, link-heavy, and often thread-based nature of web content — reconstructing narratives from fragmented formats, verifying claims against linked sources, and extracting practical takeaways.

The skill is platform-aware: it adapts extraction and evaluation strategies based on the source (Twitter/X threads require reconstruction; blog posts need link-following; newsletters often embed unique author insight). See `references/platforms.md` for platform-specific guidance.

## 🚀 Workflow Checklist

You MUST follow this checklist when researching a post:

1. [ ] **Identify Source & Platform**: Determine the platform (Twitter/X, blog, Substack, Medium, LinkedIn, etc.) and confirm output destination (e.g., `digest/post/`).
2. [ ] **Content Extraction**: Fetch the full content using the platform-specific strategy in `references/platforms.md`. You MUST read `references/platforms.md` before attempting extraction — it contains tested proxy chains and fallback sequences that prevent wasted fetch attempts.
   - For Twitter/X: NEVER fetch x.com directly (it requires JavaScript and always fails). Use the proxy API chain in `references/platforms.md` (fxtwitter → vxtwitter). Then follow linked content to the author's blog or external source.
   - For blog posts/articles: extract the full text, preserving code blocks, embedded links, and images.
   - For newsletters: capture the full issue including any subscriber-only context if accessible.
3. [ ] **Author Context**: Research the author's background, expertise, and credibility in the topic area. Check their bio, notable work, and any disclosed affiliations or conflicts of interest.
4. [ ] **Link Audit**: Identify all outbound links and references in the post. Categorize them:
   - Supporting evidence (papers, data, documentation)
   - Related reading (other posts, threads)
   - Self-promotion (author's own products, courses, services)
   - Spot-check at least 2-3 key claims against their linked sources.

<HARD-GATE>
Do NOT skip the link audit. Posts — especially Twitter threads and blog posts — frequently make claims without adequate evidence, cite sources that do not support the stated claim, or link to outdated information. Skipping this step because "the author seems credible" or "the post has lots of likes" is an evaluation failure. Popularity is not evidence.
</HARD-GATE>

5. [ ] **Claim Evaluation**: For each major claim or recommendation in the post:
   - Is it supported by linked evidence, personal experience, or reasoning?
   - Is it a novel insight, a restatement of common knowledge, or a contrarian take?
   - Does the author acknowledge limitations, caveats, or alternative viewpoints?
6. [ ] **Devil's Advocate Pass**: Actively search for weaknesses:
   - What context is missing from the post?
   - What counterarguments exist that the author did not address?
   - Is the author selling something that biases their perspective?
   - Are there follow-up posts, corrections, or community responses that update the original claims?

<HARD-GATE>
Do NOT finalize the digest until the Devil's Advocate pass is complete and at least two critical questions about the post's claims or methodology have been answered. Skipping this because the post "seems reasonable" or "is from a well-known author" defeats the purpose of critical evaluation.
</HARD-GATE>

7. [ ] **Synthesis**: Generate the digest using `templates/default.md`.
8. [ ] **Naming & Output**: Save to `digest/post/<source-slug>-digest-YYYYMMDD.md` using kebab-case. For Twitter, use the author handle as the source slug (e.g., `twitter-karpathy-digest-20260324.md`). For blogs, use the site or author name (e.g., `lilian-weng-digest-20260324.md`).

## Standards

- Reconstructs fragmented content (threads, multi-part posts) into coherent narratives before evaluation.
- Verifies claims against linked sources rather than accepting them at face value.
- Enforces a Devil's Advocate pass before synthesis.
- Distinguishes between evidence-backed claims, experience-based opinions, and unsupported assertions.
- Identifies commercial bias (author selling products, courses, or services related to their claims).

## Anti-Patterns

- **Uncritical amplification**: Treating a popular post as authoritative without verifying its claims. High engagement does not equal high quality.
- **Thread fragmentation**: Summarizing individual tweets without reconstructing the full narrative arc. Threads are documents — treat them as one.
- **Ignoring commercial context**: Failing to note when an author is promoting their own product, course, or employer's technology. This context shapes every claim they make.
- **Link blindness**: Listing referenced links without checking whether they actually support the stated claims.
- **Recency bias**: Treating a post as current without checking whether follow-up corrections, retractions, or community responses have updated the original claims.
- **Platform conflation**: Applying the same extraction strategy to all platforms. A Twitter thread, a long-form blog post, and a LinkedIn article have fundamentally different structures.
- **Direct fetching JavaScript-rendered platforms**: Attempting `WebFetch` on x.com, twitter.com, or other JS-rendered platforms wastes a fetch attempt and returns no content. Always use the proxy chain documented in `references/platforms.md` instead.
- **Stopping at the tweet**: Many high-value X posts link to external articles (blog posts, X Articles, Substack). The tweet itself is metadata — the real content requires following the link. Always check for linked content and fetch the full article.

## Resources & Progressive Disclosure

- **`references/platforms.md`**: Platform-specific extraction strategies and quality signals for Twitter/X, blogs, newsletters, and other sources.
- **`references/content-signals.md`**: Quality signal heuristics for evaluating informal web content.
- **`templates/default.md`**: The mandatory markdown template for post digests.

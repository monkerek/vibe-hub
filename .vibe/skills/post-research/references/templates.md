# Post Research Digest Templates

Three templates keyed by content shape. Pick the one that matches the fetched content.

---

## Template 1: Single Post (tweet, Red Note post, short article)

Use when the content is a single self-contained post — typically under 500 words.

```markdown
---
title: "<derived title or opening line>"
platform: twitter | rednote | medium | substack | devto | blog
url: "<original url>"
author: "<handle or display name>"
date_published: "<YYYY-MM-DD if available, else 'unknown'>"
date_processed: "YYYY-MM-DD"
language: en | zh | <iso-code>
tags: [<tag1>, <tag2>]
---

# <Title>

## Summary
<2-3 sentences capturing the core idea in the author's voice. Do not editorialize.>

## Key Points
- <Point 1>
- <Point 2>
- <Point 3 if warranted>

## Notable Quotes
> "<Direct quote from the post>"

## Context & Limitations
<Note anything that couldn't be fetched (images, replies, quoted content). If none, write "None.">
```

---

## Template 2: Thread (multi-tweet or multi-part post)

Use when the content is a sequential series of posts from one author forming a continuous argument or narrative.

```markdown
---
title: "<thread topic>"
platform: twitter | rednote
url: "<first post url>"
author: "<handle or display name>"
thread_length: <number of posts fetched>
date_published: "<YYYY-MM-DD of first post>"
date_processed: "YYYY-MM-DD"
language: en | zh | <iso-code>
tags: [<tag1>, <tag2>]
---

# <Thread Title>

## Summary
<3-4 sentences summarizing the full arc of the thread — the argument, conclusion, or story.>

## Thread Breakdown
1. **<Post 1 topic>** — <one-sentence summary>
2. **<Post 2 topic>** — <one-sentence summary>
3. **<Post 3 topic>** — <one-sentence summary>
   _(continue for each post)_

## Key Points
- <Most important takeaway 1>
- <Most important takeaway 2>
- <Most important takeaway 3>

## Notable Quotes
> "<Best quote from anywhere in the thread>"

## Context & Limitations
<Note any tweets that couldn't be fetched, broken links, or missing context. If none, write "None.">
```

---

## Template 3: Long-Form Article (tech blog, Substack essay, in-depth post)

Use when the content is a structured article over ~500 words with clear sections, arguments, or technical depth.

```markdown
---
title: "<article title>"
platform: medium | substack | devto | hashnode | blog
url: "<original url>"
author: "<author name>"
date_published: "<YYYY-MM-DD if available>"
date_processed: "YYYY-MM-DD"
language: en | zh | <iso-code>
tags: [<tag1>, <tag2>, <tag3>]
paywall: true | false
---

# <Article Title>

## TL;DR
<1-2 sentences. The single most important idea from this article.>

## Summary
<4-6 sentences covering the article's thesis, supporting arguments, and conclusion.>

## Key Points
- <Key point 1 with brief context>
- <Key point 2 with brief context>
- <Key point 3 with brief context>
- <Add more as warranted by article length>

## Notable Quotes
> "<Impactful direct quote>"

> "<Second quote if relevant>"

## Technical Details
<Only include this section if the article contains code, architecture diagrams, benchmarks, or
specific technical claims. Summarize them concisely — e.g., "Uses a ring buffer with O(1) append" or
"Benchmarks show 3x throughput improvement over Redis at 100k RPS.">

## Context & Limitations
<Note paywall cuts, missing images/diagrams, or external references that weren't fetched. If none, write "None.">
```

---

## Filename Convention

All digests MUST follow this pattern:

```
<platform>-<author>-<topic-slug>-digest-YYYYMMDD.md
```

| Field | Rules |
|---|---|
| `platform` | `twitter`, `rednote`, `medium`, `substack`, `devto`, `blog` |
| `author` | Handle or first-name slug, kebab-case, max 20 chars |
| `topic-slug` | 2-4 words from the title, kebab-case |
| `YYYYMMDD` | Date of processing (today) |

**Examples:**
- `twitter-karpathy-bitter-lesson-digest-20260321.md`
- `rednote-xiaohongshu-matcha-cold-brew-digest-20260321.md`
- `medium-swyx-ai-engineer-roadmap-digest-20260321.md`
- `substack-pragmaticengineer-platform-teams-digest-20260321.md`

# Post Research Digest Template

Standard template for blog post, article, and social media thread digests.

---

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{title}}` | Post title or thread topic | "Why RAG Is Eating the World" |
| `{{platform}}` | Source platform | "twitter" / "blog" / "substack" / "medium" |
| `{{url}}` | Original URL | "https://x.com/user/status/..." |
| `{{author}}` | Author name or handle | "@karpathy" / "Lilian Weng" |
| `{{date_published}}` | Publication date | "2026-03-15" |
| `{{date_processed}}` | Processing date | "2026-03-24" |
| `{{word_count}}` | Approximate word count | "2400" |
| `{{tags}}` | Topic tags | ["rag", "llm", "architecture"] |
| `{{content_type}}` | Content format | "thread" / "long-form" / "newsletter" / "article" |

---

## Output Format

```markdown
---
title: "{{title}}"
platform: "{{platform}}"
url: "{{url}}"
author: "{{author}}"
date_published: "{{date_published}}"
date_processed: "{{date_processed}}"
word_count: {{word_count}}
content_type: "{{content_type}}"
tags: {{tags}}
type: post-digest
---

# {{title}}

> **Platform:** {{platform}} | **Author:** {{author}} | **Published:** {{date_published}}
> **URL:** {{url}}

---

## Author Context

| Aspect | Details |
|--------|---------|
| **Author** | {{author_name}} |
| **Role / Affiliation** | {{role}} |
| **Expertise** | {{expertise_area}} |
| **Notable Work** | {{notable_work}} |
| **Potential Bias** | {{bias_disclosure}} |

---

## TL;DR

{{tldr}}

---

## Key Claims & Analysis

{{#each claims}}
### {{@index}}. {{this.claim_title}}

**Claim:** {{this.claim}}

**Evidence Provided:** {{this.evidence}}

**Verification:** {{this.verification_status}} — {{this.verification_detail}}

**Assessment:** {{this.assessment}}

{{/each}}

---

## Practical Takeaways

{{#each takeaways}}
- **{{this.takeaway}}** — {{this.context}}
{{/each}}

---

## Critical Evaluation (Devil's Advocate)

### Strengths
{{#each strengths}}
- {{this}}
{{/each}}

### Weaknesses & Missing Context
{{#each weaknesses}}
- **{{this.category}}:** {{this.detail}}
{{/each}}

### Commercial Context
{{commercial_context}}

---

## Link Audit

| Link | Claimed Support | Actual Content | Verdict |
|------|----------------|----------------|---------|
{{#each audited_links}}
| {{this.url}} | {{this.claimed}} | {{this.actual}} | {{this.verdict}} |
{{/each}}

---

## Key Quotes

{{#each quotes}}
> "{{this.text}}"
> — {{this.attribution}}

{{/each}}

---

## References to Follow Up

| Type | Reference | Priority | Notes |
|------|-----------|----------|-------|
{{#each references}}
| {{this.type_emoji}} | {{this.title}} | {{this.priority}} | {{this.notes}} |
{{/each}}

---

## Appendix: Full Content

<details>
<summary>Reconstructed post content (click to expand)</summary>

{{full_content}}

</details>

---

*Processed: {{date_processed}} | Skill: post-research | Platform: {{platform}}*
```

---

## Verification Status Values

| Status | Meaning |
|--------|---------|
| Verified | Claim is directly supported by the linked source |
| Partially Verified | Source provides some support but claim overstates or extrapolates |
| Unverified | No source provided or source not accessible |
| Contradicted | Linked source contradicts the stated claim |
| Opinion | Claim is based on personal experience, not verifiable evidence |

## Reference Type Emojis

- :page_facing_up: Article / Post
- :books: Book
- :wrench: Tool / Library
- :bust_in_silhouette: Person
- :link: Link
- :bar_chart: Data / Research
- :movie_camera: Video
- :microphone: Podcast
- :thread: Thread

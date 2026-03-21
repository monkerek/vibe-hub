# Default Document Digest Template

Standard template for all document digests. Customize sections based on document type.

---

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{title}}` | Document title | "Attention Is All You Need" |
| `{{type}}` | Document type | "paper" / "blog" / "article" / "news" |
| `{{source}}` | Publication/website | "arXiv" / "blog.langchain.com" |
| `{{url}}` | Original URL | "https://arxiv.org/abs/1706.03762" |
| `{{authors}}` | Author(s) | "Vaswani et al." |
| `{{date_published}}` | Publication date | "2017-06-12" |
| `{{date_processed}}` | Processing date | "2026-01-03" |
| `{{reading_time}}` | Estimated read time | "45 min" |
| `{{reading_mode}}` | Mode used | "deep" |
| `{{relevance}}` | Personal relevance | "high" |
| `{{tags}}` | Topic tags | ["transformers", "attention", "nlp"] |
| `{{tldr}}` | Brief summary | "..." |
| `{{claims}}` | Key claims array | [...] |
| `{{action_items}}` | Generated actions | [...] |
| `{{references}}` | Follow-up refs | [...] |

---

## Output Format

```markdown
---
title: "{{title}}"
type: "{{type}}"
source: "{{source}}"
url: "{{url}}"
authors: "{{authors}}"
date_published: "{{date_published}}"
date_processed: "{{date_processed}}"
reading_time: "{{reading_time}}"
reading_mode: "{{reading_mode}}"
relevance: "{{relevance}}"
tags: {{tags}}
---

# {{title}}

> **Source:** {{source}} | **Authors:** {{authors}} | **Date:** {{date_published}}
> **Reading Mode:** {{reading_mode}} | **Time Invested:** {{reading_time}}

---

## Author Background

| Aspect | Details |
|--------|---------|
| **Name(s)** | {{author_names}} |
| **Affiliation(s)** | {{affiliations}} |
| **Expertise** | {{expertise_areas}} |
| **Notable Work** | {{notable_work}} |
| **Potential Biases** | {{potential_biases}} |

[1-2 paragraph context about the author(s)]

---

## TL;DR

{{tldr}}

---

## Key Contributions / Claims

{{#each claims}}
### {{@index}}. {{this.title}}

**Claim:** {{this.claim}}

**Evidence:** {{this.evidence}}

**My Assessment:** {{this.assessment}}

{{/each}}

---

## Critical Evaluation

### Strengths
{{#each strengths}}
- {{this}}
{{/each}}

### Limitations
{{#each limitations}}
- {{this}}
{{/each}}

### Questions / Gaps
{{#each questions}}
- {{this}}
{{/each}}

---

## Application to My Context

### Relevance
{{relevance_explanation}}

### Action Items

| Priority | Action | Context |
|:--------:|:-------|:--------|
{{#each action_items}}
| {{this.priority_emoji}} | {{this.action}} | {{this.context}} |
{{/each}}

### Connections
- **Related to:** {{related_concepts}}
- **Contradicts:** {{contradictions}}
- **Extends:** {{extends}}

---

## Key Quotes

{{#each quotes}}
> "{{this.text}}" ({{this.location}})

{{/each}}

---

## References to Follow Up

| Type | Reference | Priority | Notes |
|------|-----------|----------|-------|
{{#each references}}
| {{this.type_emoji}} {{this.type}} | {{this.title}} | {{this.priority}} | {{this.notes}} |
{{/each}}

---

## Appendix: Detailed Notes

<details>
<summary>Section-by-section notes (click to expand)</summary>

{{detailed_notes}}

</details>

---

*Processed: {{date_processed}} | Skill: doc-digest | Mode: {{reading_mode}}*
```

---

## Claim Object Schema

```json
{
  "title": "Main Point Title",
  "claim": "What the author asserts",
  "evidence": "How they support the claim",
  "assessment": "Your evaluation of evidence strength"
}
```

## Action Item Schema

```json
{
  "priority": "P0",
  "priority_emoji": "🔴",
  "action": "What to do",
  "context": "Why this matters"
}
```

Priority emojis:
- 🔴 P0 - Immediate / Critical
- 🟡 P1 - Important / Soon
- 🟢 P2 - Nice to have / Future

## Reference Schema

```json
{
  "type": "paper",
  "type_emoji": "📄",
  "title": "Reference title",
  "priority": "High",
  "notes": "Why to follow up"
}
```

Reference type emojis:
- 📄 Paper
- 📝 Blog
- 📰 Article
- 📚 Book
- 🔧 Tool
- 👤 Person
- 🔗 Link
- 🎬 Video

---

## Document-Type Variations

### Academic Paper

Additional frontmatter:
```yaml
venue: "[Conference/Journal]"
citation_count: "[Number if known]"
pdf_path: "[Local PDF path]"
```

Additional sections:
- **Methodology Summary** - Brief description of approach
- **Key Figures** - Most important visualizations explained
- **Comparison to Prior Work** - How it advances the field

### Blog Post

Additional frontmatter:
```yaml
word_count: "[Approximate]"
comments_notable: "[Any insightful comments]"
```

Focus areas:
- Author's perspective and potential biases
- Evidence quality for claims
- Practical takeaways

### News Article

Additional frontmatter:
```yaml
publication: "[News outlet]"
reporter: "[Journalist name]"
```

Focus areas:
- Facts vs. opinions clearly separated
- Source quality assessment
- What's missing from coverage

### Technical Article / Tutorial

Additional frontmatter:
```yaml
code_examples: true/false
implementation_ready: true/false
```

Focus areas:
- Working code snippets
- Prerequisites and dependencies
- Common pitfalls and solutions

---

## Minimal Template (Skim Mode)

For quick triage when full digest isn't warranted:

```markdown
---
title: "{{title}}"
type: "{{type}}"
url: "{{url}}"
date_processed: "{{date_processed}}"
reading_mode: "skim"
verdict: "{{worth_reading}}"
---

# {{title}} (Skim)

**Verdict:** {{worth_reading}} - {{verdict_reason}}

## 30-Second Summary
{{brief_summary}}

## Why Read / Why Skip
{{recommendation}}

## If I Return
{{what_to_focus_on}}

---
*Skimmed: {{date_processed}}*
```

---

*Template version: 1.0*
*Last updated: 2026-01-03*

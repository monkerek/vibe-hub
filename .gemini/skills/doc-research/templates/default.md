# Document Research Digest Template

Standard template for all document digests, optimized for academic papers and technical articles.

---

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{title}}` | Document title | "Attention Is All You Need" |
| `{{type}}` | Document type | "paper" / "blog" / "article" |
| `{{source}}` | Publication/venue | "arXiv" / "NeurIPS" |
| `{{url}}` | Original URL | "https://arxiv.org/abs/1706.03762" |
| `{{authors}}` | Author(s) | "Vaswani et al." |
| `{{date_published}}` | Publication date | "2017-06-12" |
| `{{score}}` | Overall score (1-10) | "8 (Strong Accept)" |
| `{{confidence}}` | Confidence (1-5) | "4 (High)" |
| `{{tags}}` | Topic tags | ["transformers", "nlp"] |

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
score: "{{score}}"
confidence: "{{confidence}}"
tags: {{tags}}
---

# {{title}}

> **Source:** {{source}} | **Authors:** {{authors}} | **Date:** {{date_published}}
> **Review Score:** {{score}} | **Confidence:** {{confidence}}

---

## Author Background & Affiliations

| Aspect | Details |
|--------|---------|
| **Primary Authors** | {{author_names}} |
| **Affiliation(s)** | {{affiliations}} |
| **Notable Work** | {{notable_work}} |

[Context about the research group and their expertise in this domain.]

---

## TL;DR

{{tldr}}

---

## Technical Evaluation (Academic Reviewer Pass)

### 1. Soundness
**Assessment:** {{soundness_assessment}}
**Evidence:** {{soundness_evidence}}

### 2. Novelty & Contribution
**Assessment:** {{novelty_assessment}}
**Comparison to Prior Work:** {{comparison}}

### 3. Empirical Validation
**Assessment:** {{empirical_assessment}}
**Baselines & Metrics:** {{metrics}}

---

## Key Contributions / Claims

{{#each claims}}
### {{@index}}. {{this.title}}
**Claim:** {{this.claim}}
**Evidence:** {{this.evidence}}
**Critique:** {{this.critique}}
{{/each}}

---

## Critical Evaluation (Devil's Advocate)

### Strengths
- {{strength_1}}
- {{strength_2}}

### Weaknesses & Limitations
- **Technical Flaws:** {{weakness_1}}
- **Unstated Assumptions:** {{weakness_2}}
- **Reproducibility Gaps:** {{weakness_3}}

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
*Processed: {{date_processed}} | Skill: doc-research | Version: 2.0*
```

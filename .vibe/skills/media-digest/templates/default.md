# Default Media Digest Template

This is the default template for media digest output. Copy and modify to create custom templates.

---

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{title}}` | Content title | "How to Be a Staff Engineer" |
| `{{source}}` | Platform name | "YouTube" |
| `{{url}}` | Original URL | "https://youtube.com/watch?v=..." |
| `{{author}}` | Creator name | "TechLead" |
| `{{duration}}` | Length | "45:32" |
| `{{publish_date}}` | Publication date | "2026-01-01" |
| `{{processed_date}}` | Processing date | "2026-01-03" |
| `{{language}}` | Primary language | "en" / "zh" |
| `{{tags}}` | Generated tags | ["engineering", "career"] |
| `{{tldr}}` | 2-3 sentence summary | "..." |
| `{{sections}}` | Array of section objects | [...] |
| `{{references}}` | Mentioned resources | [...] |
| `{{transcript}}` | Full transcript | "..." |

---

## Output Format

```markdown
---
title: "{{title}}"
source: "{{source}}"
url: "{{url}}"
author: "{{author}}"
duration: "{{duration}}"
publish_date: "{{publish_date}}"
processed_date: "{{processed_date}}"
language: "{{language}}"
tags: {{tags}}
type: media-digest
---

# {{title}}

> **Source:** {{source}} | **Author:** {{author}} | **Duration:** {{duration}}
> **URL:** {{url}}

## TL;DR

{{tldr}}

---

## Key Insights

{{#each sections}}
### {{this.title}}

**Main Point:** {{this.main_point}}

{{#each this.insights}}
- {{this}}
{{/each}}

{{#if this.quote}}
> "{{this.quote}}"
{{/if}}

{{/each}}

---

## References & Resources

| Type | Reference | Details |
|------|-----------|---------|
{{#each references}}
| {{this.type_emoji}} | {{this.name}} | {{this.details}} |
{{/each}}

---

## Appendix: Full Transcript

<details>
<summary>Click to expand full transcript ({{duration}})</summary>

{{transcript}}

</details>

---

*Generated: {{processed_date}} | Skill: media-digest | Source: {{source}}*
```

---

## Section Object Schema

```json
{
  "title": "Section Title",
  "start_time": "00:00",
  "end_time": "10:30",
  "main_point": "One sentence summary of section",
  "insights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ],
  "quote": "Optional notable quote from this section"
}
```

## Reference Schema

```json
{
  "type": "book",
  "type_emoji": "📚",
  "name": "Reference name",
  "details": "Author, URL, or context"
}
```

Reference type emojis:
- 📚 Book
- 🔧 Tool
- 👤 Person
- 🔗 Link
- 📄 Article
- 🎬 Video
- 🎙️ Podcast

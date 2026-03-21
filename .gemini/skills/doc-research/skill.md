---
name: doc-research
description: Transform documents (papers, blog posts, articles) into structured learning digests. Optimized for efficient knowledge acquisition and retention, outputting to digest/paper folder.
---

# Document Research

## Overview

This skill enables Gemini CLI to transform complex documents into structured, high-signal digests. It handles academic papers, technical articles, and blog posts with document-type-specific workflows to maximize learning efficiency.

## Workflow

### 1. Identify Target
- Determine the document type (paper, blog, article, etc.) and source (URL, PDF, local file).
- For papers, the target output folder is `digest/paper/`.

### 2. Triage & Research
- **Skim**: Quickly determine if the document is worth deep reading (2-5 min).
- **Author Research**: Identify author affiliations, expertise, and potential biases using `gws` or `google_web_search`.

### 3. Extract & Analyze
- Follow the reading order specific to the document type (see `references/document-types.md`).
- Identify key claims, evidence, and novel contributions.
- Critically evaluate strengths, limitations, and gaps.

### 4. Synthesize (Generate Digest)
- Create a markdown file at `digest/paper/[name]-digest-YYYYMMDD.md` (for papers) or appropriate subfolder in `digest/`.
- Use the template in `templates/default.md`.
- Ensure the filename is in kebab-case (e.g., `attention-is-all-you-need-digest-20260321.md`).

## Resources

### references/document-types.md
Detailed guidance for processing different document types (Academic Paper, Blog Post, Technical Article, etc.).

### references/reading-strategies.md
Evidence-based techniques (SQ3R, active reading) to maximize learning while minimizing time investment.

### templates/default.md
Standard markdown template for all document digests, including metadata, author background, TL;DR, and critical evaluation.

## Dependencies
- `pdftotext` (via `poppler`) for PDF text extraction if not using direct PDF reading capabilities.
- `WebFetch` tool for URL content extraction.

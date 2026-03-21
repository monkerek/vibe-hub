---
name: doc-research
description: Transforms complex documents into structured learning digests. Optimized for academic papers, technical articles, and blog posts using a rigorous evaluation and verification-driven workflow.
---

# Doc Research

## Overview

This skill enables the transformation of complex documents into structured, high-signal digests. It handles academic papers, technical articles, and blog posts with document-type-specific workflows and rigorous critical evaluation.

## 🚀 Workflow Checklist

You MUST follow this checklist when researching a document:

1. [ ] **Identify & Triage**: Determine document type (paper, blog, article) and confirm output destination (e.g., `digest/paper/`).
2. [ ] **Source Verification**: Research authors and affiliations to establish credibility and context.
3. [ ] **Extraction**: Map the document structure and extract core content, ensuring LaTeX math notation is preserved correctly.
4. [ ] **Specialized Evaluation**:
    - For papers: Apply the `references/academic-reviewer.md` methodology (Soundness, Novelty, Empirical Validation).
    - For others: Apply `references/reading-strategies.md` and `references/document-types.md`.
5. [ ] **Devil's Advocate Pass**: Actively search for hidden weaknesses or unsubstantiated claims.
6. [ ] **Synthesis**: Generate the structured digest using `templates/default.md`.
7. [ ] **Verification**: Confirm all citations and evidence mapping are accurate.

<HARD-GATE>
Do NOT finalize the digest until the "Devil's Advocate" pass has been completed and at least three critical questions about the document's methodology or findings have been answered.
</HARD-GATE>

---

## ⚖️ Standards
- Uses rigorous evaluation (Soundness, Novelty, Validation).
- Enforces a "Devil's Advocate" pass before final synthesis.
- Preserves LaTeX math notation for technical utility.

---

## 📝 Anti-Patterns

- **Uncritical Summarization**: Accepting all claims as fact without evaluating the evidence.
- **LaTeX Errors**: Misformatting math notation, which reduces the digest's technical utility.
- **Vague Affiliations**: Failing to identify potential conflicts of interest or the authors' background.

---

## 📂 Resources & Progressive Disclosure

For deeper details, refer to:
- **`references/academic-reviewer.md`**: ICML/NeurIPS level review standards.
- **`references/document-types.md`**: Type-specific processing guidance.
- **`references/reading-strategies.md`**: Learning efficiency techniques.
- **`templates/default.md`**: The mandatory markdown template.

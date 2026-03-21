---
name: doc-research
description: Transform documents into structured learning digests. Optimized for academic papers, blog posts, and articles with rigorous evaluation and verification-driven workflows.
---

# Document Research

## Overview

This skill enables Gemini CLI to transform complex documents into structured, high-signal digests. It handles academic papers, technical articles, and blog posts with document-type-specific workflows and rigorous critical evaluation.

## <instructions>

### 1. Research & Triage
- Identify document type and source.
- For papers, utilize the `digest/paper/` folder.
- Skim to determine value (2-5 min).
- Research authors for credibility and affiliations.

### 2. Systematic Evaluation
- **Academic Papers**: Follow the `references/academic-reviewer.md` methodology, focusing on Soundness, Novelty, and Empirical Validation.
- **Other Documents**: Use the strategies in `references/reading-strategies.md` and `references/document-types.md`.
- **The "Devil's Advocate" Step**: Actively search for hidden weaknesses or unsubstantiated claims before final synthesis.

### 3. Synthesis & Verification
- Create a markdown digest at `digest/paper/[name]-digest-YYYYMMDD.md` (for papers).
- Use the `templates/default.md` structure.
- **Verify**: Confirm all LaTeX math notation is correct and all key claims have supporting evidence before saving.

## </instructions>

## <constraints>
- Maintain a professional, critical, yet constructive tone.
- Ensure filenames are in kebab-case (e.g., `attention-is-all-you-need-digest-20260321.md`).
- Output digests to the correct subfolder in `digest/`.
- **Token Efficiency**: Use parallel tool calls when fetching multiple resources (e.g., author research and document content).
- **Skill Length**: Keep this `skill.md` concise (under 500 lines) by delegating details to `references/`.
</constraints>

## <workflow_checklist>
- [ ] Determine document type and output destination.
- [ ] Extract content and map document structure.
- [ ] Perform author/affiliation research.
- [ ] Execute specialized evaluation (e.g., academic reviewer pass).
- [ ] Generate structured digest using `templates/default.md`.
- [ ] Verify LaTeX and evidence mapping.
</workflow_checklist>

## Resources

### references/academic-reviewer.md
Methodology for reviewing academic papers based on top-tier AI conference standards (ICML, NeurIPS, ICLR).

### references/document-types.md
Detailed guidance for processing different document types.

### references/reading-strategies.md
Evidence-based techniques to maximize learning efficiency.

### templates/default.md
Standard markdown template for all document digests.

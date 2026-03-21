# Document Types Reference

Detailed guidance for processing different document types effectively.

---

## Academic Papers

### Characteristics

| Aspect | Typical Pattern |
|--------|-----------------|
| **Length** | 8-30 pages |
| **Structure** | Abstract, Intro, Related Work, Methods, Results, Discussion, Conclusion |
| **Language** | Formal, technical, precise |
| **Citations** | Extensive, peer-reviewed sources |
| **Peer review** | Usually (conferences, journals) |

### Reading Strategy

**Phase 1: Triage (3-5 min)**
```
1. Read title and abstract
2. Check venue (top conference? predatory journal?)
3. Look at author affiliations
4. Jump to conclusion - what do they claim?
5. Scan figures and tables (often the "story")
```

**Phase 2: Selective Read (15-30 min)**
```
1. Introduction - problem statement, contributions
2. Key figures/tables with captions
3. Results section - main findings
4. Discussion - implications, limitations
5. Skip: Related work, detailed methods (unless replicating)
```

**Phase 3: Deep Read (60-120 min)**
```
1. Full sequential read
2. Take section-by-section notes
3. Mark unclear parts for re-read
4. Cross-reference with cited papers if needed
5. Reproduce key equations/algorithms mentally
```

### Quality Signals

| Signal | High Quality | Red Flags |
|--------|--------------|-----------|
| **Venue** | NeurIPS, ICML, ACL, Nature, Science | Unknown journals, pay-to-publish |
| **Authors** | Established researchers, major labs | No track record, suspicious affiliations |
| **Methods** | Reproducible, ablations, baselines | Missing details, no comparisons |
| **Results** | Error bars, statistical tests | Cherry-picked metrics, no significance |
| **Limitations** | Honestly discussed | Absent or minimized |

### Where to Find Papers

| Source | URL | Notes |
|--------|-----|-------|
| arXiv | arxiv.org | Preprints, fast but not peer-reviewed |
| Semantic Scholar | semanticscholar.org | Good search, citation network |
| Google Scholar | scholar.google.com | Comprehensive, citation counts |
| Papers With Code | paperswithcode.com | Papers + implementations |
| OpenReview | openreview.net | Conference submissions with reviews |
| ACL Anthology | aclanthology.org | NLP papers specifically |

### PDF Processing Tips

```bash
# Extract text for quick search
pdftotext paper.pdf paper.txt

# Extract just first few pages (abstract, intro)
pdftotext -f 1 -l 3 paper.pdf intro.txt

# Claude can read PDFs directly - preferred method
# Just provide the file path and ask questions
```

---

## Blog Posts

### Characteristics

| Aspect | Typical Pattern |
|--------|-----------------|
| **Length** | 500-5000 words |
| **Structure** | Variable, often narrative |
| **Language** | Conversational to technical |
| **Citations** | Informal, links |
| **Peer review** | None (editorial review at best) |

### Reading Strategy

**Phase 1: Skim (2-3 min)**
```
1. Read title and first paragraph
2. Scan headings/subheadings
3. Check author bio - who is this?
4. Look for conclusion/summary section
```

**Phase 2: Full Read (10-20 min)**
```
1. Read sequentially but actively
2. Question each claim: What's the evidence?
3. Note: Is this opinion or fact?
4. Look for actionable takeaways
```

### Quality Signals

| Signal | High Quality | Red Flags |
|--------|--------------|-----------|
| **Author** | Known expert, verifiable credentials | Anonymous, no track record |
| **Evidence** | Links to sources, data, examples | Unsupported claims, anecdotes only |
| **Nuance** | Acknowledges limitations, alternatives | One-sided, no caveats |
| **Freshness** | Recent, references current work | Outdated, stale information |
| **Comments** | Thoughtful discussion, author engagement | Disabled, or all agreement |

### Common Blog Types

| Type | Focus | Evaluation |
|------|-------|------------|
| **Technical tutorial** | How to do X | Does it actually work? |
| **Opinion/Analysis** | Author's perspective | What's the evidence? |
| **Experience report** | What happened to author | Is it generalizable? |
| **News/Updates** | What's new | Is it accurate? |
| **Thought leadership** | Future predictions | What's the track record? |

### Notable Technical Blogs

| Blog | Focus | Credibility |
|------|-------|-------------|
| blog.langchain.com | LLM frameworks | Company blog, practical |
| lilianweng.github.io | ML concepts | High, well-researched |
| colah.github.io | Neural nets | High, visual explanations |
| karpathy.github.io | Deep learning | Very high, pioneer |
| simonwillison.net | LLMs, tools | High, practitioner focus |
| eugeneyan.com | ML systems | High, industry experience |

---

## Technical Articles

### Characteristics

| Aspect | Typical Pattern |
|--------|-----------------|
| **Length** | 2000-10000 words |
| **Structure** | Problem → Solution → Implementation |
| **Language** | Technical, code-heavy |
| **Purpose** | Teach, document, share |

### Reading Strategy

**Phase 1: Assessment (3-5 min)**
```
1. What problem does this solve?
2. What's the tech stack/context?
3. Is this relevant to my needs?
4. How recent is it? (Tech ages fast)
```

**Phase 2: Implementation Read (15-45 min)**
```
1. Understand the architecture/approach
2. Study code examples carefully
3. Note prerequisites and dependencies
4. Identify potential pitfalls
5. Extract reusable patterns
```

### Quality Signals

| Signal | High Quality | Red Flags |
|--------|--------------|-----------|
| **Code** | Working, tested, explained | Snippets only, untested |
| **Context** | Clear prerequisites, versions | Assumes too much |
| **Updates** | Maintained, dated | Abandoned, outdated deps |
| **Community** | Active discussion, errata | No feedback channel |

---

## News Articles

### Characteristics

| Aspect | Typical Pattern |
|--------|-----------------|
| **Length** | 500-2000 words |
| **Structure** | Inverted pyramid (key facts first) |
| **Language** | Accessible, journalistic |
| **Sources** | Quotes, press releases, experts |
| **Goal** | Inform, sometimes persuade |

### Reading Strategy

**Phase 1: Facts Extraction (2-3 min)**
```
1. Who, what, when, where, why?
2. What are the primary sources?
3. What's the headline claim?
4. Is this news or opinion?
```

**Phase 2: Critical Read (5-10 min)**
```
1. Verify facts against other sources
2. Identify quoted experts - are they credible?
3. What's missing or not covered?
4. What's the publication's perspective?
```

### Quality Signals

| Signal | High Quality | Red Flags |
|--------|--------------|-----------|
| **Source** | Established outlet, journalists | Unknown, no byline |
| **Attribution** | Named sources, links | "Sources say", anonymous |
| **Balance** | Multiple perspectives | One-sided |
| **Corrections** | Published corrections policy | None visible |

### News vs. Opinion

| Element | News | Opinion |
|---------|------|---------|
| **Byline** | "News reporter" | "Columnist", "Editorial" |
| **Language** | Neutral, factual | Persuasive, evaluative |
| **Structure** | Facts first | Argument development |
| **Purpose** | Inform | Persuade |

---

## Research Reports

### Characteristics

| Aspect | Typical Pattern |
|--------|-----------------|
| **Length** | 10-100+ pages |
| **Structure** | Executive summary, chapters, appendices |
| **Language** | Formal, data-driven |
| **Sources** | Primary research, surveys, analysis |
| **Publisher** | Think tanks, consultancies, institutions |

### Reading Strategy

**Phase 1: Executive Summary (5-10 min)**
```
1. Read executive summary completely
2. Note key findings and recommendations
3. Check methodology description
4. Identify who commissioned/funded it
```

**Phase 2: Selective Deep Dive (30-60 min)**
```
1. Read sections relevant to your interest
2. Examine methodology chapter for rigor
3. Check data sources and sample sizes
4. Look for limitations section
5. Review appendices for raw data
```

### Quality Signals

| Signal | High Quality | Red Flags |
|--------|--------------|-----------|
| **Publisher** | Established institution | Unknown org |
| **Methodology** | Transparent, rigorous | Vague, hidden |
| **Funding** | Disclosed | Undisclosed |
| **Data** | Primary research, large samples | Secondary, small N |
| **Peer review** | Expert reviewed | None |

### Common Report Sources

| Source | Type | Bias to Watch |
|--------|------|---------------|
| McKinsey, BCG | Consulting | Client interests |
| Brookings, RAND | Think tanks | Policy orientation |
| Pew, Gallup | Research orgs | Generally neutral |
| Industry associations | Trade reports | Member interests |
| Government agencies | Official reports | Political context |

---

## Quick Reference: Document Type Decision Tree

```
Is it peer-reviewed?
├── Yes → Academic Paper workflow
└── No
    ├── Is it from a journalist/news outlet?
    │   └── Yes → News Article workflow
    └── No
        ├── Is it >10 pages with methodology?
        │   └── Yes → Research Report workflow
        └── No
            ├── Does it have code/implementation?
            │   └── Yes → Technical Article workflow
            └── No → Blog Post workflow
```

---

## Reading Time Estimates

| Document Type | Skim | Selective | Deep |
|---------------|------|-----------|------|
| Academic paper (8 pages) | 5 min | 20 min | 60 min |
| Academic paper (20 pages) | 10 min | 40 min | 120 min |
| Blog post (1500 words) | 2 min | 8 min | 15 min |
| Blog post (4000 words) | 5 min | 15 min | 30 min |
| Technical article | 5 min | 25 min | 60 min |
| News article | 2 min | 5 min | 10 min |
| Research report (50 pages) | 15 min | 45 min | 180 min |

---

*Last updated: 2026-01-03*

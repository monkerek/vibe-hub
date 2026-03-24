# Content Quality Signals — Post Research

Heuristics for evaluating informal web content where traditional academic review standards do not apply.

---

## Signal Categories

### 1. Author Credibility

| Signal | Weight | How to Check |
|--------|--------|-------------|
| Verifiable expertise in the topic | High | Bio, job title, publications, OSS contributions |
| Track record of accurate claims | High | Previous posts, corrections history |
| Disclosed affiliations and interests | Medium | Bio, employer, advisory roles |
| Active practitioner (not just commentator) | Medium | GitHub activity, shipped products, patents |
| Known within the domain community | Low | Mentions by peers, conference talks |

**Credibility does not equal correctness.** Even highly credible authors make errors, have blind spots, and carry biases. Credibility raises the prior — it does not remove the need for verification.

### 2. Evidence Quality

| Level | Description | Example |
|-------|------------|---------|
| **Strong** | Links to primary sources (papers, data, docs) | "According to [paper](link), Table 3 shows..." |
| **Moderate** | Links to secondary sources (other posts, articles) | "As [author] argued in [post]..." |
| **Weak** | Personal experience without external validation | "In my experience at Company X..." |
| **Absent** | Unsubstantiated assertions | "Everyone knows that..." / "Studies show..." |

Posts at the "Weak" level are not automatically low-quality — personal experience from a domain expert can be highly valuable. But distinguish it from evidence-backed claims.

### 3. Reasoning Quality

| Signal | Positive | Negative |
|--------|----------|----------|
| Specificity | Concrete examples, numbers, code | Vague generalities, buzzwords |
| Nuance | Acknowledges tradeoffs and limitations | Absolute claims, no caveats |
| Falsifiability | Makes claims that could be proven wrong | Unfalsifiable ("it depends") |
| Novelty | Original insight or synthesis | Restatement of common knowledge |
| Coherence | Logical argument with clear structure | Disconnected observations |

### 4. Context Signals

| Signal | What to Check |
|--------|--------------|
| **Timeliness** | When was this published? Has the landscape changed since? |
| **Audience** | Who is this written for? Beginners? Experts? Decision-makers? |
| **Motivation** | Why did the author write this? To teach? To sell? To provoke? |
| **Discourse** | What are others saying about this post? Corrections? Endorsements? |
| **Updates** | Has the author issued corrections or follow-ups? |

---

## Bias Detection Framework

### Commercial Bias
The author benefits financially from the reader adopting their recommendation.

**Indicators:**
- Author works at the company whose product they recommend
- Post includes affiliate links or referral codes
- Post coincides with a product launch, course release, or funding announcement
- Comparison posts that conveniently favor the author's product

**Mitigation:** Note the commercial context in the digest. The post may still be valuable — but the reader must know the incentive structure.

### Survivorship Bias
The author generalizes from their own success without accounting for those who tried the same approach and failed.

**Indicators:**
- "Here's how I built a $X company by doing Y"
- Advice based on a single success story
- No mention of failures, pivots, or luck

**Mitigation:** Note the sample size (n=1) in the evaluation. Look for counterexamples.

### Recency Bias
The author treats the newest approach as superior without comparing to established alternatives.

**Indicators:**
- "X is dead, use Y instead"
- No comparison to prior approaches on concrete metrics
- Excitement-driven rather than evidence-driven

**Mitigation:** Check whether the "old" approach has been meaningfully superseded or just isn't trendy.

### Authority Bias
Claims accepted because of who said them, not the evidence provided.

**Indicators:**
- Big-name author making claims outside their core expertise
- "If [Famous Person] says X, it must be true"
- Claims extrapolated from one domain to another without justification

**Mitigation:** Evaluate the claim on its own merits. Note when an author is speaking outside their primary domain.

---

## Quality Tiers

Use these tiers when assigning confidence to a post digest:

| Tier | Confidence | Characteristics |
|------|-----------|-----------------|
| **High Signal** | 4-5 | Expert author, strong evidence, novel insight, acknowledges limitations |
| **Moderate Signal** | 3 | Credible author, some evidence, useful synthesis, minor gaps |
| **Low Signal** | 1-2 | Unknown author, weak evidence, restates common knowledge, or heavily biased |

A post can be High Signal on some claims and Low Signal on others. Evaluate claim-by-claim when the post is uneven.

# Compliance & Persuasion Principles for Skill Design

> Source: [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/writing-skills) — included here for offline reference.
> Research: Meincke et al. (2025), N=28,000 conversations. Persuasion techniques doubled compliance: 33% → 72% (p < .001).

LLMs respond to the same persuasion principles as humans. Understanding this psychology helps you design more effective skills — not to manipulate, but to ensure critical steps are followed even under pressure.

---

## The Three Most Effective Principles

### 1. Authority
Imperative language + non-negotiable framing eliminates rationalization.

```markdown
✅ Write code before test? Delete it. Start over. No exceptions.
❌ Consider writing tests first when feasible.
```

Use: `MUST`, `NEVER`, `Always`, `No exceptions`.

### 2. Commitment
Require announcements and explicit choices. Consistency with stated intentions drives follow-through.

```markdown
✅ MUST announce: "I'm using [Skill Name] for this task."
❌ Consider letting your partner know which skill you're using.
```

Force explicit A/B/C choices rather than open-ended responses.

### 3. Social Proof
Establish norms and cite universal patterns.

```markdown
✅ Checklists without progress tracking = steps get skipped. Every time.
❌ Some people find checklists helpful.
```

**Authority + Commitment + Social Proof combined** is the highest-compliance combination.

---

## Other Principles

### Scarcity
Time-bound requirements prevent procrastination.

```markdown
✅ After completing this step, IMMEDIATELY verify before proceeding.
❌ You can verify when convenient.
```

### Unity
Collaborative language for non-hierarchical practices.

```markdown
✅ We're colleagues working together. I need your honest technical judgment.
❌ You should probably tell me if I'm wrong.
```

### Reciprocity
Use sparingly — can feel manipulative. Rarely needed.

### Liking
**NEVER use for compliance.** Conflicts with honest feedback culture and creates sycophancy.

---

## Principle Combinations by Skill Type

| Skill Type | Use | Avoid |
|------------|-----|-------|
| Discipline-enforcing | Authority + Commitment + Social Proof | Liking, Reciprocity |
| Guidance/technique | Moderate Authority + Unity | Heavy authority |
| Collaborative | Unity + Commitment | Authority, Liking |
| Reference | Clarity only | All persuasion |

---

## Why This Works

**Bright-line rules reduce rationalization.** Absolute language (`YOU MUST`) eliminates "is this an exception?" questions.

**Implementation intentions create automatic behavior.** "When X, do Y" is more effective than "generally do Y". Clear triggers + required actions = automatic execution.

**LLMs are parahuman.** Trained on human text containing these patterns — authority language precedes compliance in training data; commitment sequences and social proof patterns are densely modeled.

---

## HARD-GATE Design

HARD-GATEs are authority + scarcity + commitment combined. To maximize compliance:

1. **Name the rationalization the gate blocks**: `"DO NOT skip this even if the previous step seemed to cover it"`
2. **Use absolute language**: `MUST`, `DO NOT proceed until`, `No exceptions`
3. **State the consequence of skipping**: `"Cross-agent discoverability breaks without this step"`

---

## Ethical Use

**Legitimate**: ensuring critical practices are followed, preventing predictable failures.
**Illegitimate**: manipulating for personal gain, creating false urgency, guilt-based compliance.

**The test**: Would this technique serve the user's genuine interests if they fully understood it?

---

## Quick Reference

When designing a skill, ask:

1. What type is it? (Discipline vs. guidance vs. reference)
2. What behavior am I trying to ensure?
3. Which principle(s) apply? (Usually Authority + Commitment for discipline)
4. Am I combining too many? (Don't use all seven)
5. Is this ethical? (Serves user's genuine interests?)

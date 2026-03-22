# Alignment Summary Template

After completing the Socratic interview, produce this summary and present it to the user for confirmation before beginning work.

---

## Format

```markdown
## Alignment Summary

### Outcome
[One to three sentences describing what will be delivered in concrete, observable terms.]

### Approach
[High-level plan — major steps, technologies, patterns. Not implementation details.]

### Success Criteria
- [ ] [Criterion 1 — specific, verifiable]
- [ ] [Criterion 2 — specific, verifiable]
- [ ] [Criterion N]

### Scope
**In scope:**
- [Explicit inclusion 1]
- [Explicit inclusion 2]

**Out of scope:**
- [Explicit exclusion 1]
- [Explicit exclusion 2]

### Assumptions
- [Assumption 1 — anything not explicitly confirmed but required for the plan]
- [Assumption 2]

### Open Questions *(if any)*
- [Unresolved item — ideally zero after a good interview]
```

---

## Guidelines

- **Outcome** must be concrete enough that the user can verify completion. "Improve the code" is insufficient. "Refactor the auth module to use JWT tokens, with existing tests passing" is verifiable.
- **Success criteria** should be checkable — ideally by running a command, viewing a result, or comparing against a reference.
- **Scope boundaries** prevent scope creep from both directions. If the user didn't mention tests, explicitly note whether tests are in or out of scope.
- **Assumptions** are your safety net. If an assumption turns out to be wrong, the user can catch it here before work begins.
- Keep the summary concise. Target 150-300 words. The summary should be scannable in under 60 seconds.

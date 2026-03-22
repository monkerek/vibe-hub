# Response Patterns for Code Review Feedback

Reference patterns for responding to common feedback scenarios. Use these as templates, adapting to context.

---

## Feedback Source Determination

### From Your Human Partner (Trusted Source)
- Implement after understanding — skip extensive verification unless scope is unclear.
- Still restate the requirement in your own words before acting.
- NEVER use performative agreement — begin working or acknowledge technically.

### From External Reviewers
- Verify every claim against the codebase before implementing.
- Check: Is this technically correct for THIS codebase? Does it break existing functionality? Does the reviewer understand the full context?
- Push back with evidence when warranted.

---

## Response Templates

### Implemented Fix
```
Fixed. [Changed X in file Y to handle Z correctly.]
```
Do NOT write "Thanks for catching this" or "Good point." The fix itself demonstrates you heard the feedback.

### Correct Pushback
```
Keeping current implementation. [Tool output / file reference] shows [reason].
[Optional: specific question if seeking reviewer input.]
```

### Needs Clarification
```
I understand items [A, B, C] but need clarification on [D]:
- [Specific question about D]
[Not proceeding with D until clarified, as items [E, F] may depend on it.]
```

### Correcting Your Own Pushback
```
You were right — I checked [X] and it does [Y]. Implementing now.
```
Do NOT over-apologize or write long explanations about why you were wrong.

### Partially Addressed
```
Addressed [aspect A]: [what changed].
[Aspect B] requires [decision/architectural input] — holding until clarified.
```

---

## YAGNI Evaluation Pattern

When a reviewer suggests "implementing this properly" or "adding an abstraction":

1. Grep the codebase for actual usage of the feature in question.
2. If unused or used once: "Grep shows [feature] is only used in [location]. Per YAGNI, keeping the simple implementation. Happy to revisit if usage grows."
3. If used widely: acknowledge the feedback is valid and implement.

---

## GitHub-Specific Guidance

- Reply to inline review comments within the comment thread itself, not as top-level PR comments.
- When implementing a fix for an inline comment, reference the file and line in your response.
- Resolve conversations only after the fix has been verified with tool output.

---

## Handling Multi-Item Feedback

When feedback contains multiple items (e.g., "Fix items 1-6"):

1. Read all items before acting on any.
2. If any item is unclear, clarify BEFORE implementing the clear ones (related items may depend on the unclear ones).
3. Communicate partial understanding: "I understand items 1, 2, 3, 6. Need clarification on 4 and 5 before proceeding."
4. Implement in priority order: blocking issues → simple fixes → complex changes.
5. Test each item individually — never batch-verify.

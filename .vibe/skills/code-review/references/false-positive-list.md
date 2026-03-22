# False Positive List — What NOT to Flag

These categories MUST be excluded from code review output. Flagging them erodes reviewer trust.

## Pre-existing Issues
Any issue present before the diff was introduced. Only review what changed.

## Unconfirmed Bugs
Issues that could be a bug but require context outside the diff to verify. If uncertain, skip it.

## Style & Quality
- Formatting, indentation, whitespace
- Variable naming preferences
- Lack of comments or documentation
- Code that "could be cleaner" but works correctly

## Linter Concerns
Issues a linter would catch (e.g., unused imports, missing semicolons). Do not run the linter to verify.

## Suppressed Issues
Issues explicitly silenced in the code (e.g., via `// eslint-disable`, `# noqa`, `@ts-ignore`).

## General Security Concerns
Broad advisories like "consider input validation" or "this could be SQL-injectable in theory" unless CLAUDE.md explicitly requires flagging them AND there is a concrete, exploitable instance in the diff.

## Test Coverage
Missing tests, low coverage, or "this should have a test" comments — unless CLAUDE.md mandates coverage requirements.

## Subjective Improvements
Suggestions about architecture, abstractions, or alternative approaches that don't affect correctness.

## Pedantic Nitpicks
Anything a senior engineer reviewing the PR would not bother to comment on.

# Review Checklists

Reference material for Agent 3 (language idioms) and Agent 4 (security, performance) during Step 4. Apply the relevant section based on detected language and active flags.

---

## 🔐 Security Checklist (`--security` flag)

Apply in Agent 4. Check only for concrete, exploitable instances in the diff — not theoretical risks.

**Injection & Input Handling**
- SQL injection: user input concatenated into queries (not parameterized)
- Command injection: user input passed to shell execution functions
- XSS: unsanitized user content rendered as HTML

**Authentication & Authorization**
- Authentication bypasses introduced in changed code
- Authorization checks removed or weakened
- Insecure direct object references (IDOR) in new endpoints

**Data Exposure**
- Secrets, API keys, or credentials hardcoded or logged
- Sensitive data written to logs, error messages, or responses
- PII exposed in stack traces or debug output

**Cryptography**
- Weak or broken algorithms (MD5/SHA1 for security purposes, ECB mode)
- Hardcoded IVs or salts

> Any flagged security issue requires a `file:line` citation and must be confirmed via Step 5 validation before posting.

---

## ⚡ Performance Checklist (`--performance` flag)

Apply in Agent 4. Flag only issues clearly introduced by the diff.

**Algorithmic Complexity**
- O(n²) or worse loops introduced where O(n) is achievable
- Unbounded recursion without memoization or depth limits

**Database & I/O**
- N+1 query patterns: queries inside loops that could be batched
- Missing indexes on columns used in new WHERE/ORDER BY clauses
- Synchronous I/O on hot paths where async is available

**Memory**
- Obvious memory leaks: resources opened but not closed
- Large data structures loaded fully into memory when streaming is feasible
- Unnecessary copies of large objects in tight loops

---

## 🧩 Language-Idiomatic Checks (Agent 3)

Auto-detect language from file extensions in the diff. Apply the relevant section.

### TypeScript / JavaScript
- `any` type used where a specific type is inferrable
- Unhandled promise rejections (`.then()` without `.catch()`, or `await` outside try/catch)
- `==` instead of `===` for equality
- `var` used where `const`/`let` is appropriate
- Callback patterns where async/await is available

### Python
- Mutable default arguments (e.g., `def f(x=[])`)
- Bare `except:` catching all exceptions silently
- `is` used for value equality (should be `==`)
- Resources not using context managers (`with` statement) where applicable

### Go
- Errors returned but not checked (`_` used to discard errors from fallible calls)
- `panic` used where returning an error is idiomatic
- Goroutines launched without any synchronization or lifecycle management

### Rust
- `.unwrap()` or `.expect()` on `Result`/`Option` in production paths where `?` or proper handling is feasible
- Unnecessary clones of data that could be borrowed

> Apply only if the relevant language is detected. Do not apply multiple sections to a mixed diff unless multiple languages are genuinely present.

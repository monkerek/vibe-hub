# Debugging Benchmarks

Use these scenarios to validate honesty and completeness in debugging workflows:

- Configuration failure: Confirm the fix by rerunning the exact failing command and capturing the success signal.
- Dependency failure: Verify the resolved version, lockfile state, and the command that previously failed.
- Runtime failure: Reproduce, patch, and show a clean run with the same inputs.
- Network or API failure: Capture the before and after request or health-check output.
- Test failure: Show the failing test case, the patch, and the passing rerun.

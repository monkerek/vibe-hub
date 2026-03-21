# Codebase Research Skill - Setup Guide

**Purpose:** Step-by-step instructions for setting up tree-sitter and language parsers.

---

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- C compiler (for building tree-sitter parsers)

---

## Installation Steps

### 1. Install tree-sitter Core

```bash
pip install tree-sitter
```

**Verify installation:**
```bash
python -c "from tree_sitter import Language, Parser; print('tree-sitter OK')"
```

Expected output: `tree-sitter OK`

---

### 2. Install Language Parsers

#### Phase 2 Languages (MVP)

**Python:**
```bash
pip install tree-sitter-python
```

**TypeScript:**
```bash
pip install tree-sitter-typescript
```

**JavaScript:**
```bash
pip install tree-sitter-javascript
```

**Verify installation:**
```bash
python -c "import tree_sitter_python; print('Python parser OK')"
python -c "import tree_sitter_typescript; print('TypeScript parser OK')"
python -c "import tree_sitter_javascript; print('JavaScript parser OK')"
```

#### Phase 5 Languages (Future)

**Java:**
```bash
pip install tree-sitter-java
```

**Ruby:**
```bash
pip install tree-sitter-ruby
```

---

### 3. Test Installation

Create a test script `test_tree_sitter.py`:

```python
#!/usr/bin/env python3
"""Test tree-sitter installation and language parsers."""

from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_typescript
import tree_sitter_javascript

def test_python_parser():
    """Test Python parser."""
    parser = Parser()
    parser.set_language(tree_sitter_python.language())

    code = b"def hello(): return 'world'"
    tree = parser.parse(code)

    query = tree_sitter_python.language().query("(function_definition name: (identifier) @func.name)")
    captures = query.captures(tree.root_node)

    assert len(captures) > 0, "Failed to parse Python function"
    print("✅ Python parser working")

def test_typescript_parser():
    """Test TypeScript parser."""
    parser = Parser()
    parser.set_language(tree_sitter_typescript.language_typescript())

    code = b"function hello(): string { return 'world'; }"
    tree = parser.parse(code)

    query = tree_sitter_typescript.language_typescript().query("(function_declaration name: (identifier) @func.name)")
    captures = query.captures(tree.root_node)

    assert len(captures) > 0, "Failed to parse TypeScript function"
    print("✅ TypeScript parser working")

def test_javascript_parser():
    """Test JavaScript parser."""
    parser = Parser()
    parser.set_language(tree_sitter_javascript.language())

    code = b"function hello() { return 'world'; }"
    tree = parser.parse(code)

    query = tree_sitter_javascript.language().query("(function_declaration name: (identifier) @func.name)")
    captures = query.captures(tree.root_node)

    assert len(captures) > 0, "Failed to parse JavaScript function"
    print("✅ JavaScript parser working")

if __name__ == '__main__':
    test_python_parser()
    test_typescript_parser()
    test_javascript_parser()
    print("\n✅ All parsers working correctly!")
```

**Run the test:**
```bash
python test_tree_sitter.py
```

**Expected output:**
```
✅ Python parser working
✅ TypeScript parser working
✅ JavaScript parser working

✅ All parsers working correctly!
```

---

## Troubleshooting

### Issue 1: "No module named 'tree_sitter'"

**Cause:** tree-sitter not installed

**Solution:**
```bash
pip install tree-sitter
```

If using virtual environment:
```bash
source venv/bin/activate  # Activate venv first
pip install tree-sitter
```

---

### Issue 2: "Building wheel for tree-sitter failed"

**Cause:** Missing C compiler

**Solution (macOS):**
```bash
xcode-select --install
```

**Solution (Linux):**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
```

---

### Issue 3: "No module named 'tree_sitter_python'"

**Cause:** Language parser not installed

**Solution:**
```bash
pip install tree-sitter-python
```

---

### Issue 4: Import works but parsing fails

**Cause:** Language version mismatch

**Solution:**
```bash
# Reinstall with matching versions
pip uninstall tree-sitter tree-sitter-python tree-sitter-typescript
pip install tree-sitter tree-sitter-python tree-sitter-typescript
```

---

### Issue 5: "query() method not found"

**Cause:** Old tree-sitter version

**Solution:**
```bash
pip install --upgrade tree-sitter
```

Minimum version: `tree-sitter >= 0.20.0`

---

## Environment Setup

### For Development

Add to `.bashrc` or `.zshrc`:

```bash
# tree-sitter environment
export TREE_SITTER_DIR="$HOME/.tree-sitter"
```

### For Claude Code Integration

No environment variables needed - skill uses Python directly.

---

## Version Requirements

| Package | Minimum Version | Recommended Version |
|---------|----------------|---------------------|
| `tree-sitter` | 0.20.0 | 0.21.0+ |
| `tree-sitter-python` | 0.20.0 | Latest |
| `tree-sitter-typescript` | 0.20.0 | Latest |
| `tree-sitter-javascript` | 0.20.0 | Latest |

**Check versions:**
```bash
pip show tree-sitter
pip show tree-sitter-python
```

---

## Performance Optimization (Optional)

### Precompile Language Grammars

For faster parsing, precompile languages:

```python
from tree_sitter import Language

# Build shared library with all languages
Language.build_library(
    'build/my-languages.so',
    [
        'vendor/tree-sitter-python',
        'vendor/tree-sitter-typescript',
    ]
)
```

**Note:** This requires cloning language grammar repos. Only needed for high-volume usage.

---

## Uninstallation

If you need to remove tree-sitter:

```bash
pip uninstall tree-sitter tree-sitter-python tree-sitter-typescript tree-sitter-javascript tree-sitter-java tree-sitter-ruby
```

---

## Alternative Installation Methods

### Using conda

```bash
conda install -c conda-forge tree-sitter
conda install -c conda-forge tree-sitter-python
```

### Using pipenv

```bash
pipenv install tree-sitter tree-sitter-python tree-sitter-typescript
```

### Using poetry

```bash
poetry add tree-sitter tree-sitter-python tree-sitter-typescript
```

---

## Additional Resources

- [tree-sitter documentation](https://tree-sitter.github.io/tree-sitter/)
- [Python bindings docs](https://github.com/tree-sitter/py-tree-sitter)
- [Language parser repos](https://github.com/tree-sitter)
- [Query syntax reference](https://tree-sitter.github.io/tree-sitter/using-parsers#pattern-matching-with-queries)

---

## Next Steps

After successful installation:

1. ✅ Read `SKILL.md` for usage patterns
2. ✅ Review `tree-sitter-queries.md` for query examples
3. ✅ Try example queries with the skill

---

*Last updated: 2026-01-09*
*Version: 1.0*

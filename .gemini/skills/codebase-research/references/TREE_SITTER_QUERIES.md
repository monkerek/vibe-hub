# Tree-sitter Query Reference

This document contains tree-sitter query patterns for extracting code structures across different languages.

**Purpose:** Copy-paste reference for implementing the parsing phase of codebase-research skill.

---

## Python Queries

### Function Definitions

```scheme
; Extract all function definitions with parameters and body
(function_definition
  name: (identifier) @function.name
  parameters: (parameters) @function.params
  body: (block) @function.body) @function.def

; Get function with decorators
(decorated_definition
  (decorator) @function.decorator
  (function_definition
    name: (identifier) @function.name))
```

**Example extraction:**
```python
# Code
def authenticate_user(token: str) -> User:
    payload = decode_token(token)
    return get_user(payload['id'])

# Extracted
{
  "name": "authenticate_user",
  "params": ["token: str"],
  "return_type": "User",
  "line_start": 1,
  "line_end": 3
}
```

### Class Definitions

```scheme
; Extract class with methods and base classes
(class_definition
  name: (identifier) @class.name
  superclasses: (argument_list)? @class.bases
  body: (block
    (function_definition
      name: (identifier) @method.name
      parameters: (parameters) @method.params) @method.def*))
```

**Example extraction:**
```python
# Code
class AuthHandler(BaseHandler):
    def __init__(self, config):
        self.config = config

    def authenticate(self, token):
        return validate_token(token)

# Extracted
{
  "name": "AuthHandler",
  "bases": ["BaseHandler"],
  "methods": [
    {"name": "__init__", "params": ["self", "config"]},
    {"name": "authenticate", "params": ["self", "token"]}
  ]
}
```

### Import Statements

```scheme
; Simple import: import foo
(import_statement
  name: (dotted_name) @import.module)

; From import: from foo import bar
(import_from_statement
  module_name: (dotted_name) @import.from
  name: (dotted_name) @import.name)

; Import with alias: import foo as bar
(import_statement
  name: (dotted_name) @import.module
  alias: (as_pattern
    alias: (identifier) @import.alias)?)
```

**Example extraction:**
```python
# Code
import os
from auth_utils import validate_token
from services.user_service import UserService as US

# Extracted
[
  {"type": "import", "module": "os"},
  {"type": "from_import", "module": "auth_utils", "name": "validate_token"},
  {"type": "from_import", "module": "services.user_service", "name": "UserService", "alias": "US"}
]
```

### Function Calls

```scheme
; Simple function call: foo()
(call
  function: (identifier) @call.function
  arguments: (argument_list) @call.args)

; Method call: obj.foo()
(call
  function: (attribute
    object: (identifier) @call.object
    attribute: (identifier) @call.method)
  arguments: (argument_list) @call.args)

; Chained call: obj.foo().bar()
(call
  function: (attribute
    object: (call) @call.parent
    attribute: (identifier) @call.method))
```

**Example extraction:**
```python
# Code
result = validate_token(token)
user = UserService.get_user(user_id)

# Extracted
[
  {"function": "validate_token", "args": ["token"], "line": 1},
  {"object": "UserService", "method": "get_user", "args": ["user_id"], "line": 2}
]
```

---

## TypeScript/JavaScript Queries

### Function Declarations

```scheme
; Function declaration
(function_declaration
  name: (identifier) @function.name
  parameters: (formal_parameters) @function.params
  body: (statement_block) @function.body)

; Arrow function
(variable_declarator
  name: (identifier) @function.name
  value: (arrow_function
    parameters: (formal_parameters) @function.params
    body: (_) @function.body))

; Method definition
(method_definition
  name: (property_identifier) @method.name
  parameters: (formal_parameters) @method.params
  body: (statement_block) @method.body)
```

**Example extraction:**
```typescript
// Code
function authenticateUser(token: string): User {
  const payload = decodeToken(token);
  return getUser(payload.id);
}

const validateToken = (token: string): boolean => {
  return jwt.verify(token, SECRET);
}

// Extracted
[
  {
    "name": "authenticateUser",
    "params": ["token: string"],
    "return_type": "User",
    "type": "function_declaration"
  },
  {
    "name": "validateToken",
    "params": ["token: string"],
    "return_type": "boolean",
    "type": "arrow_function"
  }
]
```

### Class Definitions

```scheme
; Class declaration
(class_declaration
  name: (type_identifier) @class.name
  heritage: (class_heritage
    (extends_clause
      value: (identifier) @class.extends))?
  body: (class_body
    (method_definition
      name: (property_identifier) @method.name
      parameters: (formal_parameters) @method.params) @method.def*))

; Interface definition
(interface_declaration
  name: (type_identifier) @interface.name
  body: (object_type
    (property_signature
      name: (property_identifier) @property.name
      type: (_) @property.type)*))
```

**Example extraction:**
```typescript
// Code
class AuthHandler extends BaseHandler {
  constructor(private config: AuthConfig) {
    super();
  }

  authenticate(token: string): Promise<User> {
    return this.validateAndGetUser(token);
  }
}

interface AuthConfig {
  secret: string;
  expiresIn: number;
}

// Extracted
{
  "classes": [{
    "name": "AuthHandler",
    "extends": "BaseHandler",
    "methods": [
      {"name": "constructor", "params": ["config: AuthConfig"]},
      {"name": "authenticate", "params": ["token: string"], "return_type": "Promise<User>"}
    ]
  }],
  "interfaces": [{
    "name": "AuthConfig",
    "properties": [
      {"name": "secret", "type": "string"},
      {"name": "expiresIn", "type": "number"}
    ]
  }]
}
```

### Import/Export Statements

```scheme
; ES6 import
(import_statement
  source: (string) @import.source
  (import_clause
    (named_imports
      (import_specifier
        name: (identifier) @import.name
        alias: (identifier)? @import.alias)*)))

; ES6 export
(export_statement
  declaration: (function_declaration
    name: (identifier) @export.name))

; Export named
(export_statement
  (export_clause
    (export_specifier
      name: (identifier) @export.name)))
```

**Example extraction:**
```typescript
// Code
import { validateToken } from './auth-utils';
import type { User } from '@types/user';
export { authenticateUser } from './auth-handler';
export default class AuthService {}

// Extracted
{
  "imports": [
    {"source": "./auth-utils", "name": "validateToken"},
    {"source": "@types/user", "name": "User", "is_type": true}
  ],
  "exports": [
    {"name": "authenticateUser", "source": "./auth-handler"},
    {"name": "AuthService", "is_default": true}
  ]
}
```

### Function Calls

```scheme
; Function call
(call_expression
  function: (identifier) @call.function
  arguments: (arguments) @call.args)

; Method call
(call_expression
  function: (member_expression
    object: (identifier) @call.object
    property: (property_identifier) @call.method)
  arguments: (arguments) @call.args)

; Chained call
(call_expression
  function: (member_expression
    object: (call_expression) @call.parent
    property: (property_identifier) @call.method))
```

---

## Java Queries

### Method Definitions

```scheme
; Method declaration
(method_declaration
  name: (identifier) @method.name
  parameters: (formal_parameters) @method.params
  type: (_) @method.return_type
  body: (block) @method.body)

; Constructor
(constructor_declaration
  name: (identifier) @constructor.name
  parameters: (formal_parameters) @constructor.params
  body: (constructor_body) @constructor.body)
```

**Example extraction:**
```java
// Code
public class AuthHandler {
    public AuthHandler(AuthConfig config) {
        this.config = config;
    }

    public User authenticateUser(String token) throws AuthException {
        String payload = decodeToken(token);
        return getUserById(payload.getId());
    }
}

// Extracted
{
  "constructors": [
    {"name": "AuthHandler", "params": ["AuthConfig config"]}
  ],
  "methods": [
    {
      "name": "authenticateUser",
      "params": ["String token"],
      "return_type": "User",
      "throws": ["AuthException"]
    }
  ]
}
```

### Class Definitions

```scheme
; Class declaration
(class_declaration
  name: (identifier) @class.name
  superclass: (superclass (type_identifier) @class.extends)?
  interfaces: (super_interfaces
    (type_list
      (type_identifier) @class.implements))?
  body: (class_body) @class.body)

; Interface declaration
(interface_declaration
  name: (identifier) @interface.name
  body: (interface_body) @interface.body)
```

### Import Statements

```scheme
; Import statement
(import_declaration
  (scoped_identifier) @import.path)

; Static import
(import_declaration
  "static" @import.static
  (scoped_identifier) @import.path)
```

---

## Ruby Queries

### Method Definitions

```scheme
; Method definition
(method
  name: (identifier) @method.name
  parameters: (method_parameters) @method.params
  body: (_) @method.body)

; Class method
(singleton_method
  object: (self) @method.singleton_object
  name: (identifier) @method.name
  parameters: (method_parameters) @method.params)
```

**Example extraction:**
```ruby
# Code
class AuthHandler
  def initialize(config)
    @config = config
  end

  def authenticate(token)
    payload = decode_token(token)
    User.find(payload[:user_id])
  end

  def self.validate_token(token)
    JWT.decode(token, secret)
  end
end

# Extracted
{
  "instance_methods": [
    {"name": "initialize", "params": ["config"]},
    {"name": "authenticate", "params": ["token"]}
  ],
  "class_methods": [
    {"name": "validate_token", "params": ["token"]}
  ]
}
```

### Class Definitions

```scheme
; Class definition
(class
  name: (constant) @class.name
  superclass: (superclass (constant) @class.superclass)?
  body: (_) @class.body)

; Module definition
(module
  name: (constant) @module.name
  body: (_) @module.body)
```

### Require Statements

```scheme
; Require
(call
  method: (identifier) @require.method
  arguments: (argument_list
    (string) @require.path))
  (#eq? @require.method "require")
```

---

## Usage Patterns

### Pattern 1: Build Function Catalog

```python
def build_function_catalog(file_path, language):
    """Extract all functions from a file."""
    tree = parse_file(file_path, language)
    query = LANGUAGE_QUERIES[language]['functions']
    captures = query.captures(tree.root_node)

    functions = []
    for node, capture_name in captures:
        if capture_name == 'function.name':
            func_info = {
                'name': node.text.decode(),
                'line_start': node.start_point[0] + 1,
                'line_end': node.end_point[0] + 1,
                'file': file_path
            }
            functions.append(func_info)

    return functions
```

### Pattern 2: Extract Call Graph

```python
def extract_call_graph(file_path, language):
    """Build call graph: function -> [functions it calls]."""
    tree = parse_file(file_path, language)

    # Get all function definitions
    func_query = LANGUAGE_QUERIES[language]['functions']
    functions = {node.text.decode(): node for node, _ in func_query.captures(tree.root_node)}

    # Get all function calls
    call_query = LANGUAGE_QUERIES[language]['calls']
    calls = call_query.captures(tree.root_node)

    # Map each function to its calls
    call_graph = {}
    for func_name, func_node in functions.items():
        # Find calls within this function's body
        func_calls = [
            call_node.text.decode()
            for call_node, _ in calls
            if is_within(call_node, func_node)
        ]
        call_graph[func_name] = func_calls

    return call_graph
```

### Pattern 3: Extract Dependencies

```python
def extract_dependencies(file_path, language):
    """Extract all imports/dependencies."""
    tree = parse_file(file_path, language)
    import_query = LANGUAGE_QUERIES[language]['imports']
    captures = import_query.captures(tree.root_node)

    dependencies = []
    for node, capture_name in captures:
        if 'import' in capture_name:
            dep_info = {
                'module': node.text.decode(),
                'line': node.start_point[0] + 1
            }
            dependencies.append(dep_info)

    return dependencies
```

---

## Testing Queries

### Test Python Function Query

```python
def test_python_function_query():
    code = """
def hello(name):
    return f"Hello {name}"

def goodbye(name):
    print(f"Goodbye {name}")
"""
    parser = Parser()
    parser.set_language(Language(tree_sitter_python.language()))
    tree = parser.parse(code.encode())

    query = Language(tree_sitter_python.language()).query("""
        (function_definition
          name: (identifier) @function.name)
    """)
    captures = query.captures(tree.root_node)

    function_names = [node.text.decode() for node, _ in captures]
    assert function_names == ['hello', 'goodbye']
```

### Test TypeScript Import Query

```python
def test_typescript_import_query():
    code = """
import { foo } from './bar';
import type { Baz } from './baz';
"""
    parser = Parser()
    parser.set_language(Language(tree_sitter_typescript.language_typescript()))
    tree = parser.parse(code.encode())

    query = Language(tree_sitter_typescript.language_typescript()).query("""
        (import_statement
          source: (string) @import.source)
    """)
    captures = query.captures(tree.root_node)

    import_sources = [node.text.decode() for node, _ in captures]
    assert "'./bar'" in import_sources[0]
    assert "'./baz'" in import_sources[1]
```

---

## Language Support Matrix

| Language | Functions | Classes | Imports | Calls | Status |
|----------|-----------|---------|---------|-------|--------|
| **Python** | ✅ | ✅ | ✅ | ✅ | Phase 2 |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ | Phase 2 |
| **JavaScript** | ✅ | ✅ | ✅ | ✅ | Phase 2 |
| **Java** | ✅ | ✅ | ✅ | ✅ | Phase 5 |
| **Ruby** | ✅ | ✅ | ✅ | ✅ | Phase 5 |
| **Go** | 🚧 | 🚧 | 🚧 | 🚧 | Future |
| **Rust** | 🚧 | 🚧 | 🚧 | 🚧 | Future |

---

## References

- [tree-sitter documentation](https://tree-sitter.github.io/tree-sitter/)
- [tree-sitter query syntax](https://tree-sitter.github.io/tree-sitter/using-parsers#pattern-matching-with-queries)
- [tree-sitter playground](https://tree-sitter.github.io/tree-sitter/playground)
- [Python grammar reference](https://github.com/tree-sitter/tree-sitter-python)
- [TypeScript grammar reference](https://github.com/tree-sitter/tree-sitter-typescript)

---

*Last updated: 2026-01-09*
*Version: 1.0*

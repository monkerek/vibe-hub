#!/usr/bin/env python3
"""
Codebase Research Skill - Core Implementation

Intelligent codebase exploration using LLM-guided discovery and tree-sitter AST parsing.

Usage:
    python codebase_research.py <mode> <query> <scope_path> [--language LANG]

Modes:
    find     - Locate specific logic (functions, classes, patterns)
    explore  - Understand architecture (components, data flow, design patterns)

Examples:
    python codebase_research.py find "authenticate_user" /path/to/project --language python
    python codebase_research.py explore "messaging system" /path/to/project --language typescript
"""

import sys
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_typescript
import tree_sitter_javascript


# =============================================================================
# Data Structures
# =============================================================================

@dataclass
class FunctionInfo:
    """Information about a function/method."""
    name: str
    file_path: str
    line_start: int
    line_end: int
    params: List[str]
    return_type: Optional[str] = None
    is_method: bool = False
    class_name: Optional[str] = None
    decorators: List[str] = None

    def __post_init__(self):
        if self.decorators is None:
            self.decorators = []


@dataclass
class ClassInfo:
    """Information about a class."""
    name: str
    file_path: str
    line_start: int
    line_end: int
    base_classes: List[str]
    methods: List[str]


@dataclass
class ImportInfo:
    """Information about an import statement."""
    module: str
    file_path: str
    line: int
    imported_items: List[str]
    alias: Optional[str] = None


@dataclass
class CallInfo:
    """Information about a function call."""
    function_name: str
    file_path: str
    line: int
    caller_function: Optional[str] = None
    args: List[str] = None

    def __post_init__(self):
        if self.args is None:
            self.args = []


@dataclass
class RepoMap:
    """Complete repository map with all extracted structures."""
    functions: List[FunctionInfo]
    classes: List[ClassInfo]
    imports: List[ImportInfo]
    calls: List[CallInfo]

    def to_dict(self) -> Dict:
        return {
            'functions': [asdict(f) for f in self.functions],
            'classes': [asdict(c) for c in self.classes],
            'imports': [asdict(i) for i in self.imports],
            'calls': [asdict(c) for c in self.calls]
        }


# =============================================================================
# Query Rewriting
# =============================================================================

class QueryRewriter:
    """Rewrite natural language queries into code search keywords."""

    # Map common terms to code-related keywords
    TERM_MAPPINGS = {
        # Authentication/Authorization
        'authentication': ['auth', 'login', 'verify', 'jwt', 'token', 'middleware'],
        'authorization': ['auth', 'permission', 'access', 'role', 'check'],
        'login': ['auth', 'login', 'signin', 'authenticate'],
        'logout': ['logout', 'signout', 'session', 'clear'],

        # Database
        'database': ['db', 'sql', 'query', 'model', 'repository', 'dao'],
        'query': ['query', 'select', 'find', 'search', 'filter'],
        'storage': ['store', 'save', 'persist', 'db', 'repository'],

        # API/Network
        'api': ['api', 'endpoint', 'route', 'handler', 'controller'],
        'endpoint': ['route', 'handler', 'api', 'controller'],
        'request': ['request', 'req', 'http', 'handler'],
        'response': ['response', 'res', 'http', 'result'],

        # Messaging
        'message': ['message', 'msg', 'send', 'notify', 'email'],
        'notification': ['notify', 'notification', 'alert', 'push'],
        'email': ['email', 'mail', 'send', 'smtp'],

        # Data Flow
        'create': ['create', 'add', 'insert', 'new', 'save'],
        'read': ['get', 'read', 'fetch', 'find', 'retrieve'],
        'update': ['update', 'edit', 'modify', 'change', 'patch'],
        'delete': ['delete', 'remove', 'destroy', 'drop'],

        # Architecture
        'service': ['service', 'business', 'logic', 'handler'],
        'controller': ['controller', 'handler', 'endpoint', 'route'],
        'model': ['model', 'entity', 'schema', 'data'],
        'repository': ['repository', 'dao', 'store', 'data'],
        'middleware': ['middleware', 'interceptor', 'filter', 'handler'],

        # Testing
        'test': ['test', 'spec', 'unit', 'integration', 'mock'],
        'mock': ['mock', 'stub', 'fake', 'test'],

        # Configuration
        'config': ['config', 'configuration', 'settings', 'env'],
        'settings': ['settings', 'config', 'options', 'preferences'],

        # =================================================================
        # Semantic Mappings (learned from RepoReaper validation)
        # =================================================================

        # Iteration/Loop patterns
        'loop': ['loop', 'round', 'iterate', 'iteration', 'while', 'for', 'stream', 'async'],
        'iteration': ['iterate', 'round', 'loop', 'max_rounds', 'cycle'],
        'rounds': ['round', 'max_rounds', 'iteration', 'loop', 'cycle'],
        'cycle': ['cycle', 'round', 'loop', 'iteration', 'repeat'],

        # Prefetch/Preload patterns
        'prefetch': ['prefetch', 'preload', 'agent', 'stream', 'discover', 'analyze', 'round'],
        'preload': ['preload', 'prefetch', 'cache', 'warm', 'load'],
        'warm': ['warm', 'cache', 'preload', 'prefetch'],

        # File/Selection patterns
        'selection': ['select', 'pick', 'choose', 'filter', 'target', 'valid_files'],
        'pick': ['pick', 'select', 'choose', 'target'],
        'choose': ['choose', 'select', 'pick', 'filter'],
        'target': ['target', 'select', 'pick', 'files', 'valid'],

        # Agent/Worker patterns
        'agent': ['agent', 'worker', 'processor', 'handler', 'stream', 'async'],
        'worker': ['worker', 'agent', 'processor', 'background', 'job'],
        'processor': ['processor', 'worker', 'handler', 'agent'],

        # Search/Discovery patterns
        'search': ['search', 'find', 'query', 'lookup', 'hybrid', 'bm25', 'vector'],
        'discovery': ['discover', 'find', 'explore', 'analyze', 'scan'],
        'explore': ['explore', 'discover', 'analyze', 'scan', 'map'],
        'analyze': ['analyze', 'parse', 'process', 'extract', 'understand'],

        # Vector/Embedding patterns
        'vector': ['vector', 'embedding', 'embed', 'chromadb', 'semantic'],
        'embedding': ['embed', 'embedding', 'vector', 'encode', 'semantic'],
        'semantic': ['semantic', 'vector', 'embedding', 'similarity', 'meaning'],
        'hybrid': ['hybrid', 'search', 'bm25', 'vector', 'fuse', 'combine'],
        'bm25': ['bm25', 'keyword', 'search', 'lexical', 'hybrid'],

        # Chunking/Parsing patterns
        'chunk': ['chunk', 'split', 'segment', 'parse', 'tokenize'],
        'chunking': ['chunk', 'chunker', 'split', 'segment', 'parse'],
        'parse': ['parse', 'extract', 'analyze', 'ast', 'tree'],
        'tokenize': ['tokenize', 'token', 'split', 'chunk', 'word'],

        # Repository/Codebase patterns
        'repo': ['repo', 'repository', 'codebase', 'project', 'source'],
        'codebase': ['codebase', 'repo', 'repository', 'source', 'code'],
        'map': ['map', 'structure', 'tree', 'layout', 'file_tree'],
        'structure': ['structure', 'map', 'layout', 'tree', 'architecture'],

        # Context/Knowledge patterns
        'context': ['context', 'knowledge', 'summary', 'state', 'memory'],
        'knowledge': ['knowledge', 'context', 'summary', 'learned', 'memory'],
        'summary': ['summary', 'context', 'knowledge', 'overview', 'digest'],

        # Flow/Pipeline patterns
        'flow': ['flow', 'pipeline', 'process', 'workflow', 'stream'],
        'pipeline': ['pipeline', 'flow', 'process', 'chain', 'stage'],
        'workflow': ['workflow', 'flow', 'process', 'pipeline', 'step'],
        'stream': ['stream', 'async', 'flow', 'pipeline', 'generator'],

        # LLM/AI patterns
        'llm': ['llm', 'model', 'ai', 'gpt', 'claude', 'deepseek', 'openai'],
        'prompt': ['prompt', 'system', 'user', 'message', 'instruction'],
        'completion': ['completion', 'response', 'generate', 'output', 'result'],
        'rag': ['rag', 'retrieval', 'augmented', 'context', 'vector'],

        # Report/Output patterns
        'report': ['report', 'output', 'result', 'generate', 'analysis'],
        'output': ['output', 'result', 'response', 'return', 'yield'],
        'generate': ['generate', 'create', 'produce', 'build', 'output'],

        # Error/Exception patterns
        'error': ['error', 'exception', 'catch', 'handle', 'try'],
        'exception': ['exception', 'error', 'raise', 'throw', 'catch'],
        'handle': ['handle', 'catch', 'process', 'manage', 'error'],

        # Index/Store patterns
        'index': ['index', 'store', 'add', 'insert', 'collection'],
        'store': ['store', 'save', 'persist', 'index', 'collection'],
        'collection': ['collection', 'store', 'index', 'database', 'chromadb'],

        # Main/Entry patterns
        'main': ['main', 'entry', 'start', 'run', 'init', 'app'],
        'entry': ['entry', 'main', 'start', 'init', 'point'],
        'init': ['init', 'initialize', 'setup', 'start', 'bootstrap'],
    }

    # Common stop words to remove from queries
    STOP_WORDS = {
        'the', 'is', 'are', 'was', 'were', 'will', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'done',
        'what', 'where', 'when', 'how', 'why', 'which', 'who',
        'a', 'an', 'this', 'that', 'these', 'those',
        'for', 'with', 'from', 'to', 'in', 'on', 'at', 'by',
        'our', 'we', 'you', 'they', 'it', 'i',
        'handled', 'implemented', 'used', 'work', 'works'
    }

    @classmethod
    def rewrite(cls, query: str) -> Tuple[str, List[str]]:
        """
        Rewrite natural language query into code search keywords.

        Args:
            query: Natural language query (e.g., "Where is authentication handled?")

        Returns:
            Tuple of (original_query, keywords_list)

        Examples:
            "Where is authentication handled?" -> ['auth', 'login', 'verify', 'jwt', 'token', 'middleware']
            "How does the messaging system work?" -> ['message', 'msg', 'send', 'notify', 'email', 'system']
        """
        # Lowercase and split into words
        words = query.lower().split()

        # Remove stop words
        words = [w for w in words if w not in cls.STOP_WORDS]

        # Collect keywords
        keywords = set()

        for word in words:
            # Remove punctuation
            clean_word = word.strip('?.,!;:')

            # Check if word has a mapping
            if clean_word in cls.TERM_MAPPINGS:
                keywords.update(cls.TERM_MAPPINGS[clean_word])
            else:
                # Keep the word itself if not a stop word
                keywords.add(clean_word)

        return query, list(keywords)


# =============================================================================
# Language Support
# =============================================================================

LANGUAGE_PARSERS = {
    'python': Language(tree_sitter_python.language()),
    'typescript': Language(tree_sitter_typescript.language_typescript()),
    'javascript': Language(tree_sitter_javascript.language()),
    'tsx': Language(tree_sitter_typescript.language_tsx()),
}

LANGUAGE_EXTENSIONS = {
    '.py': 'python',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'javascript',
}


# =============================================================================
# Tree-sitter Parsing
# =============================================================================

class CodeParser:
    """Parse code files using tree-sitter."""

    def __init__(self, language: str):
        self.language = language
        if language not in LANGUAGE_PARSERS:
            raise ValueError(f"Unsupported language: {language}")
        self.parser = Parser(LANGUAGE_PARSERS[language])

    def parse_file(self, file_path: str) -> Any:
        """Parse a file and return the AST root node."""
        with open(file_path, 'rb') as f:
            code = f.read()
        tree = self.parser.parse(code)
        return tree.root_node

    def extract_functions(self, file_path: str) -> List[FunctionInfo]:
        """Extract all function definitions from a file."""
        root = self.parse_file(file_path)
        functions = []

        if self.language == 'python':
            functions.extend(self._extract_python_functions(root, file_path))
        elif self.language in ['typescript', 'javascript', 'tsx']:
            functions.extend(self._extract_ts_functions(root, file_path))

        return functions

    def _extract_python_functions(self, node: Any, file_path: str, class_name: Optional[str] = None) -> List[FunctionInfo]:
        """Extract Python function definitions."""
        functions = []

        if node.type == 'function_definition':
            name_node = node.child_by_field_name('name')
            params_node = node.child_by_field_name('parameters')

            if name_node:
                func_name = name_node.text.decode('utf-8')
                params = self._extract_params(params_node)

                functions.append(FunctionInfo(
                    name=func_name,
                    file_path=file_path,
                    line_start=node.start_point[0] + 1,
                    line_end=node.end_point[0] + 1,
                    params=params,
                    is_method=class_name is not None,
                    class_name=class_name
                ))
            return functions  # Don't recurse into function body

        # Check for decorated functions
        elif node.type == 'decorated_definition':
            for child in node.children:
                if child.type == 'function_definition':
                    functions.extend(self._extract_python_functions(child, file_path, class_name))
            return functions

        # Check for class methods
        elif node.type == 'class_definition':
            name_node = node.child_by_field_name('name')
            if name_node:
                current_class = name_node.text.decode('utf-8')
                body_node = node.child_by_field_name('body')
                if body_node:
                    for child in body_node.children:
                        functions.extend(self._extract_python_functions(child, file_path, current_class))
            return functions

        # Recursively search children for classes and functions
        for child in node.children:
            functions.extend(self._extract_python_functions(child, file_path, class_name))

        return functions

    def _extract_ts_functions(self, node: Any, file_path: str) -> List[FunctionInfo]:
        """Extract TypeScript/JavaScript function definitions."""
        functions = []

        if node.type == 'function_declaration':
            name_node = node.child_by_field_name('name')
            params_node = node.child_by_field_name('parameters')

            if name_node:
                func_name = name_node.text.decode('utf-8')
                params = self._extract_params(params_node)

                functions.append(FunctionInfo(
                    name=func_name,
                    file_path=file_path,
                    line_start=node.start_point[0] + 1,
                    line_end=node.end_point[0] + 1,
                    params=params
                ))

        # Recursively search children
        for child in node.children:
            functions.extend(self._extract_ts_functions(child, file_path))

        return functions

    def _extract_params(self, params_node: Any) -> List[str]:
        """Extract parameter list from parameters node."""
        if not params_node:
            return []

        params = []
        for child in params_node.children:
            if child.type in ['identifier', 'typed_parameter', 'parameter', 'required_parameter']:
                params.append(child.text.decode('utf-8'))

        return params

    def extract_classes(self, file_path: str) -> List[ClassInfo]:
        """Extract all class definitions from a file."""
        root = self.parse_file(file_path)
        classes = []

        if self.language == 'python':
            classes.extend(self._extract_python_classes(root, file_path))
        elif self.language in ['typescript', 'javascript', 'tsx']:
            classes.extend(self._extract_ts_classes(root, file_path))

        return classes

    def _extract_python_classes(self, node: Any, file_path: str) -> List[ClassInfo]:
        """Extract Python class definitions."""
        classes = []

        if node.type == 'class_definition':
            name_node = node.child_by_field_name('name')
            if name_node:
                class_name = name_node.text.decode('utf-8')

                # Extract base classes
                base_classes = []
                superclasses_node = node.child_by_field_name('superclasses')
                if superclasses_node:
                    for child in superclasses_node.children:
                        if child.type == 'identifier':
                            base_classes.append(child.text.decode('utf-8'))

                # Extract method names
                methods = []
                body_node = node.child_by_field_name('body')
                if body_node:
                    for child in body_node.children:
                        if child.type == 'function_definition':
                            method_name_node = child.child_by_field_name('name')
                            if method_name_node:
                                methods.append(method_name_node.text.decode('utf-8'))

                classes.append(ClassInfo(
                    name=class_name,
                    file_path=file_path,
                    line_start=node.start_point[0] + 1,
                    line_end=node.end_point[0] + 1,
                    base_classes=base_classes,
                    methods=methods
                ))

        # Recursively search children
        for child in node.children:
            classes.extend(self._extract_python_classes(child, file_path))

        return classes

    def _extract_ts_classes(self, node: Any, file_path: str) -> List[ClassInfo]:
        """Extract TypeScript/JavaScript class definitions."""
        classes = []

        if node.type == 'class_declaration':
            name_node = node.child_by_field_name('name')
            if name_node:
                class_name = name_node.text.decode('utf-8')

                # Extract base class (extends)
                base_classes = []
                heritage_node = node.child_by_field_name('heritage')
                if heritage_node:
                    for child in heritage_node.children:
                        if child.type == 'extends_clause':
                            for subchild in child.children:
                                if subchild.type == 'identifier':
                                    base_classes.append(subchild.text.decode('utf-8'))

                # Extract method names
                methods = []
                body_node = node.child_by_field_name('body')
                if body_node:
                    for child in body_node.children:
                        if child.type == 'method_definition':
                            method_name_node = child.child_by_field_name('name')
                            if method_name_node:
                                methods.append(method_name_node.text.decode('utf-8'))

                classes.append(ClassInfo(
                    name=class_name,
                    file_path=file_path,
                    line_start=node.start_point[0] + 1,
                    line_end=node.end_point[0] + 1,
                    base_classes=base_classes,
                    methods=methods
                ))

        # Recursively search children
        for child in node.children:
            classes.extend(self._extract_ts_classes(child, file_path))

        return classes

    def extract_imports(self, file_path: str) -> List[ImportInfo]:
        """Extract all import statements from a file."""
        root = self.parse_file(file_path)
        imports = []

        if self.language == 'python':
            imports.extend(self._extract_python_imports(root, file_path))
        elif self.language in ['typescript', 'javascript', 'tsx']:
            imports.extend(self._extract_ts_imports(root, file_path))

        return imports

    def _extract_python_imports(self, node: Any, file_path: str) -> List[ImportInfo]:
        """Extract Python import statements."""
        imports = []

        if node.type == 'import_statement':
            # import foo
            name_node = node.child_by_field_name('name')
            if name_node:
                module_name = name_node.text.decode('utf-8')
                imports.append(ImportInfo(
                    module=module_name,
                    file_path=file_path,
                    line=node.start_point[0] + 1,
                    imported_items=[module_name]
                ))

        elif node.type == 'import_from_statement':
            # from foo import bar
            module_node = node.child_by_field_name('module_name')
            if module_node:
                module_name = module_node.text.decode('utf-8')
                imported_items = []

                for child in node.children:
                    if child.type == 'dotted_name' and child != module_node:
                        imported_items.append(child.text.decode('utf-8'))
                    elif child.type == 'identifier':
                        imported_items.append(child.text.decode('utf-8'))

                if imported_items:
                    imports.append(ImportInfo(
                        module=module_name,
                        file_path=file_path,
                        line=node.start_point[0] + 1,
                        imported_items=imported_items
                    ))

        # Recursively search children
        for child in node.children:
            imports.extend(self._extract_python_imports(child, file_path))

        return imports

    def _extract_ts_imports(self, node: Any, file_path: str) -> List[ImportInfo]:
        """Extract TypeScript/JavaScript import statements."""
        imports = []

        if node.type == 'import_statement':
            source_node = node.child_by_field_name('source')
            if source_node:
                module_name = source_node.text.decode('utf-8').strip('"\'')
                imported_items = []

                for child in node.children:
                    if child.type == 'import_clause':
                        for subchild in child.children:
                            if subchild.type == 'named_imports':
                                for item in subchild.children:
                                    if item.type == 'import_specifier':
                                        name_node = item.child_by_field_name('name')
                                        if name_node:
                                            imported_items.append(name_node.text.decode('utf-8'))

                imports.append(ImportInfo(
                    module=module_name,
                    file_path=file_path,
                    line=node.start_point[0] + 1,
                    imported_items=imported_items if imported_items else [module_name]
                ))

        # Recursively search children
        for child in node.children:
            imports.extend(self._extract_ts_imports(child, file_path))

        return imports


# =============================================================================
# Repository Analysis
# =============================================================================

class RepoAnalyzer:
    """Analyze repository structure and build repo map."""

    def __init__(self, scope_path: str, max_rounds: int = 2):
        self.scope_path = Path(scope_path)
        if not self.scope_path.exists():
            raise ValueError(f"Scope path does not exist: {scope_path}")
        self.max_rounds = max_rounds
        self.visited_files = set()

    def analyze_files(self, file_paths: List[str]) -> RepoMap:
        """Analyze multiple files and build repo map."""
        all_functions = []
        all_classes = []
        all_imports = []
        all_calls = []

        for file_path in file_paths:
            # Normalize path to avoid duplicates
            normalized_path = str(Path(file_path).resolve())

            if normalized_path in self.visited_files:
                continue  # Skip already visited files

            self.visited_files.add(normalized_path)

            try:
                language = self._detect_language(file_path)
                if language:
                    parser = CodeParser(language)
                    all_functions.extend(parser.extract_functions(file_path))
                    all_classes.extend(parser.extract_classes(file_path))
                    all_imports.extend(parser.extract_imports(file_path))
            except Exception as e:
                print(f"Warning: Failed to parse {file_path}: {e}", file=sys.stderr)
                continue

        return RepoMap(
            functions=all_functions,
            classes=all_classes,
            imports=all_imports,
            calls=all_calls
        )

    def iterative_analysis(self, initial_files: List[str], query: str) -> RepoMap:
        """
        Perform iterative file discovery and analysis.

        Implements the MAX_ROUNDS pattern from RepoReaper:
        - Round 1: Analyze initial files
        - Round 2+: Discover related files based on imports and references
        - Stop early if no new relevant files found

        Args:
            initial_files: Initial set of files to analyze
            query: Original query for relevance scoring

        Returns:
            Complete repo map after iterative discovery
        """
        all_functions = []
        all_classes = []
        all_imports = []
        all_calls = []

        print(f"# Iterative analysis: max_rounds={self.max_rounds}", file=sys.stderr)

        for round_num in range(self.max_rounds):
            print(f"# Round {round_num + 1}/{self.max_rounds}", file=sys.stderr)

            if round_num == 0:
                # First round: use initial files
                files_to_analyze = [f for f in initial_files if f not in self.visited_files]
            else:
                # Subsequent rounds: discover files from imports
                files_to_analyze = self._discover_related_files(all_imports)

            if not files_to_analyze:
                print(f"# No new files to analyze, stopping at round {round_num + 1}", file=sys.stderr)
                break

            print(f"# Analyzing {len(files_to_analyze)} files", file=sys.stderr)

            # Analyze this round's files
            round_map = self.analyze_files(files_to_analyze)

            # Accumulate results
            all_functions.extend(round_map.functions)
            all_classes.extend(round_map.classes)
            all_imports.extend(round_map.imports)
            all_calls.extend(round_map.calls)

        print(f"# Total files analyzed: {len(self.visited_files)}", file=sys.stderr)

        return RepoMap(
            functions=all_functions,
            classes=all_classes,
            imports=all_imports,
            calls=all_calls
        )

    def _discover_related_files(self, imports: List[ImportInfo]) -> List[str]:
        """
        Discover related files based on import statements.

        Args:
            imports: List of import statements from previous rounds

        Returns:
            List of new file paths to analyze
        """
        related_files = []

        for imp in imports:
            # Try to resolve import to file path
            potential_paths = self._resolve_import(imp.module)

            for path in potential_paths:
                if path.exists() and str(path) not in self.visited_files:
                    related_files.append(str(path))

        # Deduplicate
        return list(set(related_files))

    def _resolve_import(self, module: str) -> List[Path]:
        """
        Resolve an import statement to potential file paths.

        Args:
            module: Module name (e.g., "auth_utils", "../handlers/message")

        Returns:
            List of potential file paths
        """
        potential_paths = []

        # Handle relative imports
        if module.startswith('.'):
            # Skip for now - would need context of importing file
            return potential_paths

        # Handle absolute module paths
        module_parts = module.replace('.', '/').split('/')

        # Try different combinations
        for i in range(len(module_parts), 0, -1):
            partial_path = '/'.join(module_parts[:i])

            # Try as Python file
            py_path = self.scope_path / f"{partial_path}.py"
            if py_path.exists():
                potential_paths.append(py_path)

            # Try as TypeScript file
            ts_path = self.scope_path / f"{partial_path}.ts"
            if ts_path.exists():
                potential_paths.append(ts_path)

            # Try as JavaScript file
            js_path = self.scope_path / f"{partial_path}.js"
            if js_path.exists():
                potential_paths.append(js_path)

            # Try as directory with index file
            index_py = self.scope_path / partial_path / "__init__.py"
            if index_py.exists():
                potential_paths.append(index_py)

            index_ts = self.scope_path / partial_path / "index.ts"
            if index_ts.exists():
                potential_paths.append(index_ts)

        return potential_paths

    def _detect_language(self, file_path: str) -> Optional[str]:
        """Detect language from file extension."""
        ext = Path(file_path).suffix
        return LANGUAGE_EXTENSIONS.get(ext)


# =============================================================================
# Output Formatting
# =============================================================================

class OutputFormatter:
    """Format analysis results for different modes."""

    @staticmethod
    def check_context_sufficient(repo_map: RepoMap, query: str) -> Tuple[bool, str]:
        """
        Check if current context contains sufficient information to answer the query.

        Implements the "CHECK CONTEXT FIRST" pattern from RepoReaper:
        1. Does current context contain the answer?
        2. If YES: Answer directly. DO NOT read more files.
        3. If NO: Request missing files.

        Args:
            repo_map: Current repository map
            query: Original query

        Returns:
            Tuple of (is_sufficient, reason)
        """
        # Rewrite query to keywords
        _, keywords = QueryRewriter.rewrite(query)

        # Check if we have relevant functions or classes
        matching_functions = [
            f for f in repo_map.functions
            if any(kw.lower() in f.name.lower() for kw in keywords)
        ]

        matching_classes = [
            c for c in repo_map.classes
            if any(kw.lower() in c.name.lower() for kw in keywords)
        ]

        # Heuristic: if we found at least 2 matching items, context is likely sufficient
        total_matches = len(matching_functions) + len(matching_classes)

        if total_matches >= 2:
            return True, f"Found {total_matches} matching items (functions/classes)"

        if total_matches == 1:
            return True, "Found 1 matching item, likely sufficient for simple query"

        if total_matches == 0:
            return False, "No matching items found, may need more files"

        return False, "Insufficient context"

    @staticmethod
    def format_find_mode(repo_map: RepoMap, query: str) -> str:
        """Format output for Find mode."""
        output = []
        output.append(f"# Find Results: {query}\n")

        # Rewrite query to keywords for better matching
        _, keywords = QueryRewriter.rewrite(query)

        # Find matching functions
        matching_functions = [
            f for f in repo_map.functions
            if any(kw.lower() in f.name.lower() for kw in keywords) or
               query.lower() in f.name.lower()
        ]

        if matching_functions:
            output.append("## Functions\n")
            for func in matching_functions:
                output.append(f"### {func.name}")
                output.append(f"- **File:** `{func.file_path}` (lines {func.line_start}-{func.line_end})")
                output.append(f"- **Parameters:** {', '.join(func.params) if func.params else 'None'}")
                if func.is_method and func.class_name:
                    output.append(f"- **Class:** `{func.class_name}`")
                output.append("")

        # Find matching classes
        matching_classes = [
            c for c in repo_map.classes
            if any(kw.lower() in c.name.lower() for kw in keywords) or
               query.lower() in c.name.lower()
        ]

        if matching_classes:
            output.append("## Classes\n")
            for cls in matching_classes:
                output.append(f"### {cls.name}")
                output.append(f"- **File:** `{cls.file_path}` (lines {cls.line_start}-{cls.line_end})")
                if cls.base_classes:
                    output.append(f"- **Extends:** {', '.join(cls.base_classes)}")
                if cls.methods:
                    output.append(f"- **Methods:** {', '.join(cls.methods)}")
                output.append("")

        if not matching_functions and not matching_classes:
            output.append("No results found.")

        return "\n".join(output)

    @staticmethod
    def format_explore_mode(repo_map: RepoMap, query: str) -> str:
        """Format output for Explore mode."""
        output = []
        output.append(f"# Architecture Exploration: {query}\n")

        output.append("## Component Overview\n")
        output.append("```mermaid")
        output.append("graph TB")

        # Group by files
        files = set(f.file_path for f in repo_map.functions)
        for i, file_path in enumerate(sorted(files)):
            file_name = Path(file_path).name
            output.append(f"    F{i}[{file_name}]")

        output.append("```\n")

        # Component Details
        output.append("## Components\n")
        output.append("| Component | Type | Location | Key Elements |")
        output.append("|-----------|------|----------|--------------|")

        for file_path in sorted(files):
            file_name = Path(file_path).name
            funcs = [f.name for f in repo_map.functions if f.file_path == file_path]
            classes = [c.name for c in repo_map.classes if c.file_path == file_path]

            elements = []
            if classes:
                elements.append(f"{len(classes)} classes")
            if funcs:
                elements.append(f"{len(funcs)} functions")

            output.append(f"| {file_name} | Module | `{file_path}` | {', '.join(elements)} |")

        output.append("")

        # Classes Detail
        if repo_map.classes:
            output.append("## Classes\n")
            for cls in repo_map.classes[:10]:  # Limit to first 10
                output.append(f"### {cls.name}")
                output.append(f"- **Location:** `{cls.file_path}:{cls.line_start}`")
                if cls.base_classes:
                    output.append(f"- **Extends:** {', '.join(cls.base_classes)}")
                if cls.methods:
                    output.append(f"- **Methods:** {', '.join(cls.methods[:5])}")
                    if len(cls.methods) > 5:
                        output.append(f"  - ... and {len(cls.methods) - 5} more")
                output.append("")

        return "\n".join(output)


# =============================================================================
# Main Entry Point
# =============================================================================

def main():
    """Main entry point for codebase research."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Intelligent codebase exploration using LLM-guided discovery and tree-sitter AST parsing',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('mode', choices=['find', 'explore'],
                       help='Mode: find (locate specific logic) or explore (understand architecture)')
    parser.add_argument('query', help='Natural language query (e.g., "Where is authentication handled?")')
    parser.add_argument('scope_path', help='Path to repository or project directory')
    parser.add_argument('--max-rounds', type=int, default=2,
                       help='Maximum rounds of iterative discovery (default: 2)')
    parser.add_argument('--thorough', action='store_true',
                       help='Thorough mode: always do deep analysis, skip early stopping')
    parser.add_argument('--no-iteration', action='store_true',
                       help='Disable iterative discovery, only analyze initial files')

    args = parser.parse_args()

    # Read file paths from stdin
    file_paths = []
    if not sys.stdin.isatty():
        file_paths = [line.strip() for line in sys.stdin if line.strip()]

    if not file_paths:
        print("Error: No files provided. Pipe file paths to stdin.", file=sys.stderr)
        print("Example: find /path -name '*.py' | python codebase_research.py find 'query' /path", file=sys.stderr)
        sys.exit(1)

    # Rewrite query to keywords
    original_query, keywords = QueryRewriter.rewrite(args.query)
    print(f"# Query: {original_query}", file=sys.stderr)
    print(f"# Keywords: {', '.join(keywords)}", file=sys.stderr)
    print("", file=sys.stderr)

    try:
        # Analyze files
        analyzer = RepoAnalyzer(args.scope_path, max_rounds=args.max_rounds)

        if args.no_iteration:
            # Simple mode: just analyze initial files
            print("# Simple analysis (no iteration)", file=sys.stderr)
            repo_map = analyzer.analyze_files(file_paths)
        else:
            # Iterative mode
            repo_map = analyzer.iterative_analysis(file_paths, args.query)

        # Check if context is sufficient (unless thorough mode)
        if not args.thorough:
            is_sufficient, reason = OutputFormatter.check_context_sufficient(repo_map, args.query)
            print(f"# Context check: {reason}", file=sys.stderr)

            if not is_sufficient and analyzer.max_rounds > 1:
                print("# Context insufficient, consider running with --thorough or adding more files", file=sys.stderr)

        # Format output
        formatter = OutputFormatter()
        if args.mode == 'find':
            output = formatter.format_find_mode(repo_map, args.query)
        else:
            output = formatter.format_explore_mode(repo_map, args.query)

        print(output)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

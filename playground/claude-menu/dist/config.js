import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
// ─── Built-in themes ────────────────────────────────────────────────────────
const THEMES = {
    'pastel-rainbow': {
        motto: { fg: '#3c3836', bg: '#a6e3a1', icon: '' },
        model: { fg: '#3c3836', bg: '#f9e2af', icon: '🤖' },
        project: { fg: '#3c3836', bg: '#fab387', icon: '📁' },
        git: { fg: '#3c3836', bg: '#f38ba8', icon: '🔀' },
        context: { fg: '#3c3836', bg: '#cba6f7', icon: '' },
        usage: { fg: '#3c3836', bg: '#89b4fa', icon: '' },
        tools: { fg: '#3c3836', bg: '#94e2d5', icon: '🔧' },
        agents: { fg: '#3c3836', bg: '#f5c2e7', icon: '🤝' },
        todos: { fg: '#3c3836', bg: '#a6e3a1', icon: '✅' },
        environment: { fg: '#3c3836', bg: '#f9e2af', icon: '⚙️' },
        time: { fg: '#3c3836', bg: '#b4befe', icon: '🕐' },
    },
    'claude-orange': {
        motto: { fg: '#431407', bg: '#d97706', icon: '' },
        model: { fg: '#431407', bg: '#ea580c', icon: '🤖' },
        project: { fg: '#ffffff', bg: '#c2410c', icon: '📁' },
        git: { fg: '#ffffff', bg: '#9a3412', icon: '🔀' },
        context: { fg: '#ffffff', bg: '#b45309', icon: '' },
        usage: { fg: '#ffffff', bg: '#92400e', icon: '' },
        tools: { fg: '#431407', bg: '#d97706', icon: '🔧' },
        agents: { fg: '#431407', bg: '#ea580c', icon: '🤝' },
        todos: { fg: '#ffffff', bg: '#c2410c', icon: '✅' },
        environment: { fg: '#ffffff', bg: '#9a3412', icon: '⚙️' },
        time: { fg: '#ffffff', bg: '#b45309', icon: '🕐' },
    },
    'nord-frost': {
        motto: { fg: '#2e3440', bg: '#8fbcbb', icon: '' },
        model: { fg: '#2e3440', bg: '#88c0d0', icon: '🤖' },
        project: { fg: '#2e3440', bg: '#81a1c1', icon: '📁' },
        git: { fg: '#eceff4', bg: '#5e81ac', icon: '🔀' },
        context: { fg: '#2e3440', bg: '#8fbcbb', icon: '' },
        usage: { fg: '#2e3440', bg: '#88c0d0', icon: '' },
        tools: { fg: '#2e3440', bg: '#81a1c1', icon: '🔧' },
        agents: { fg: '#eceff4', bg: '#5e81ac', icon: '🤝' },
        todos: { fg: '#2e3440', bg: '#8fbcbb', icon: '✅' },
        environment: { fg: '#2e3440', bg: '#88c0d0', icon: '⚙️' },
        time: { fg: '#2e3440', bg: '#81a1c1', icon: '🕐' },
    },
    'dracula': {
        motto: { fg: '#282a36', bg: '#bd93f9', icon: '' },
        model: { fg: '#282a36', bg: '#ff79c6', icon: '🤖' },
        project: { fg: '#282a36', bg: '#8be9fd', icon: '📁' },
        git: { fg: '#282a36', bg: '#50fa7b', icon: '🔀' },
        context: { fg: '#282a36', bg: '#ffb86c', icon: '' },
        usage: { fg: '#f8f8f2', bg: '#ff5555', icon: '' },
        tools: { fg: '#282a36', bg: '#bd93f9', icon: '🔧' },
        agents: { fg: '#282a36', bg: '#ff79c6', icon: '🤝' },
        todos: { fg: '#282a36', bg: '#50fa7b', icon: '✅' },
        environment: { fg: '#282a36', bg: '#8be9fd', icon: '⚙️' },
        time: { fg: '#282a36', bg: '#ffb86c', icon: '🕐' },
    },
    'catppuccin': {
        motto: { fg: '#1e1e2e', bg: '#a6e3a1', icon: '' },
        model: { fg: '#1e1e2e', bg: '#f5c2e7', icon: '🤖' },
        project: { fg: '#1e1e2e', bg: '#89dceb', icon: '📁' },
        git: { fg: '#1e1e2e', bg: '#f38ba8', icon: '🔀' },
        context: { fg: '#1e1e2e', bg: '#cba6f7', icon: '' },
        usage: { fg: '#1e1e2e', bg: '#fab387', icon: '' },
        tools: { fg: '#1e1e2e', bg: '#94e2d5', icon: '🔧' },
        agents: { fg: '#1e1e2e', bg: '#f5c2e7', icon: '🤝' },
        todos: { fg: '#1e1e2e', bg: '#a6e3a1', icon: '✅' },
        environment: { fg: '#1e1e2e', bg: '#89dceb', icon: '⚙️' },
        time: { fg: '#1e1e2e', bg: '#b4befe', icon: '🕐' },
    },
    'monochrome': {
        motto: { fg: '#000000', bg: '#e0e0e0', icon: '' },
        model: { fg: '#000000', bg: '#d0d0d0', icon: '🤖' },
        project: { fg: '#000000', bg: '#c0c0c0', icon: '📁' },
        git: { fg: '#000000', bg: '#b0b0b0', icon: '🔀' },
        context: { fg: '#000000', bg: '#a0a0a0', icon: '' },
        usage: { fg: '#000000', bg: '#909090', icon: '' },
        tools: { fg: '#000000', bg: '#e0e0e0', icon: '🔧' },
        agents: { fg: '#000000', bg: '#d0d0d0', icon: '🤝' },
        todos: { fg: '#000000', bg: '#c0c0c0', icon: '✅' },
        environment: { fg: '#000000', bg: '#b0b0b0', icon: '⚙️' },
        time: { fg: '#000000', bg: '#a0a0a0', icon: '🕐' },
    },
};
// ─── Defaults ───────────────────────────────────────────────────────────────
export const DEFAULT_CONFIG = {
    theme: {
        name: 'pastel-rainbow',
        separator: '',
        rounded: true,
    },
    layout: {
        mode: 'expanded',
        segments: ['motto', 'project', 'git', 'model', 'context', 'time', 'tools', 'agents', 'todos'],
    },
    motto: {
        enabled: true,
        strategy: 'day-of-week',
        pack: 'motivational-en',
        emoji: true,
    },
};
// ─── TOML parser (minimal, zero-dep) ────────────────────────────────────────
function parseToml(text) {
    const result = {};
    let currentSection = result;
    for (const rawLine of text.split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#'))
            continue;
        // [section] or [section.subsection]
        const sectionMatch = line.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            const parts = sectionMatch[1].split('.');
            let target = result;
            for (const part of parts) {
                if (!(part in target) || typeof target[part] !== 'object') {
                    target[part] = {};
                }
                target = target[part];
            }
            currentSection = target;
            continue;
        }
        // key = value
        const kvMatch = line.match(/^(\w[\w.-]*)\s*=\s*(.+)$/);
        if (kvMatch) {
            const [, key, rawValue] = kvMatch;
            currentSection[key] = parseTomlValue(extractTomlValue(rawValue.trim()));
        }
    }
    return result;
}
// Strip inline comments and extract the raw value token.
// TOML allows: key = "value"  # inline comment
function extractTomlValue(raw) {
    // Double-quoted string: scan for closing quote, respecting backslash escapes
    if (raw.startsWith('"')) {
        let i = 1;
        while (i < raw.length) {
            if (raw[i] === '\\') {
                i += 2;
                continue;
            }
            if (raw[i] === '"')
                return raw.slice(0, i + 1);
            i++;
        }
        return raw;
    }
    // Single-quoted string: no escape sequences in TOML literal strings
    if (raw.startsWith("'")) {
        const close = raw.indexOf("'", 1);
        return close !== -1 ? raw.slice(0, close + 1) : raw;
    }
    // Inline array: take everything up to and including the last ]
    if (raw.startsWith('[')) {
        const close = raw.lastIndexOf(']');
        return close !== -1 ? raw.slice(0, close + 1) : raw;
    }
    // Bare value (boolean, number, unquoted string): stop at whitespace or #
    return raw.split(/[\s#]/)[0] ?? raw;
}
function unescapeTomlString(s) {
    // Single-pass replacement prevents the multi-pass bug where replacing \\
    // first (e.g. \\ → \) and then \t (\t → tab) would incorrectly transform
    // the output of the first pass (e.g. \\t → \ → \t → tab).
    return s.replace(/\\(["\\ntr]|u[0-9a-fA-F]{4})/g, (_, esc) => {
        if (esc === '"')
            return '"';
        if (esc === '\\')
            return '\\';
        if (esc === 'n')
            return '\n';
        if (esc === 't')
            return '\t';
        if (esc === 'r')
            return '\r';
        return String.fromCharCode(parseInt(esc.slice(1), 16)); // \uXXXX
    });
}
function parseTomlValue(raw) {
    // Double-quoted string: apply TOML escape sequences
    if (raw.startsWith('"') && raw.endsWith('"')) {
        return unescapeTomlString(raw.slice(1, -1));
    }
    // Single-quoted string: literal — no escape processing
    if (raw.startsWith("'") && raw.endsWith("'")) {
        return raw.slice(1, -1);
    }
    // Boolean
    if (raw === 'true')
        return true;
    if (raw === 'false')
        return false;
    // Number
    if (/^-?\d+(\.\d+)?$/.test(raw))
        return Number(raw);
    // Inline array — scan tokens to avoid splitting on commas inside quoted strings
    if (raw.startsWith('[') && raw.endsWith(']')) {
        const inner = raw.slice(1, -1).trim();
        if (!inner)
            return [];
        const items = [];
        let i = 0;
        while (i < inner.length) {
            // skip whitespace and separating commas
            if (inner[i] === ' ' || inner[i] === '\t' || inner[i] === ',') {
                i++;
                continue;
            }
            // quoted string — scan to matching close quote respecting backslash escapes
            if (inner[i] === '"' || inner[i] === "'") {
                const q = inner[i];
                let j = i + 1;
                while (j < inner.length && inner[j] !== q) {
                    if (inner[j] === '\\')
                        j++; // skip next char (escape)
                    j++;
                }
                items.push(parseTomlValue(inner.slice(i, j + 1)));
                i = j + 1;
            }
            else {
                // bare value (bool, number, identifier) — ends at comma or end of string
                const end = inner.indexOf(',', i);
                const token = end !== -1 ? inner.slice(i, end).trim() : inner.slice(i).trim();
                if (token)
                    items.push(parseTomlValue(token));
                i = end !== -1 ? end + 1 : inner.length;
            }
        }
        return items;
    }
    return raw;
}
// ─── Config loader ──────────────────────────────────────────────────────────
export function getConfigDir() {
    return join(homedir(), '.claude', 'plugins', 'claude-menu');
}
export function getConfigPath() {
    return join(getConfigDir(), 'config.toml');
}
export async function loadConfig() {
    try {
        const raw = await readFile(getConfigPath(), 'utf-8');
        const parsed = parseToml(raw);
        return mergeConfig(DEFAULT_CONFIG, parsed);
    }
    catch {
        return structuredClone(DEFAULT_CONFIG);
    }
}
function mergeConfig(defaults, overrides) {
    const config = structuredClone(defaults);
    if (overrides.theme && typeof overrides.theme === 'object') {
        Object.assign(config.theme, overrides.theme);
    }
    if (overrides.layout && typeof overrides.layout === 'object') {
        const lo = overrides.layout;
        if (lo.mode)
            config.layout.mode = lo.mode;
        if (Array.isArray(lo.segments))
            config.layout.segments = lo.segments;
    }
    if (overrides.motto && typeof overrides.motto === 'object') {
        Object.assign(config.motto, overrides.motto);
    }
    return config;
}
// ─── Theme resolution ───────────────────────────────────────────────────────
export function resolveSegmentStyle(theme, segmentName) {
    // User overrides first
    const override = theme.segments?.[segmentName];
    // Then built-in theme
    const builtinTheme = THEMES[theme.name];
    const base = builtinTheme?.[segmentName] ?? { fg: '#ffffff', bg: '#555555' };
    return { ...base, ...override };
}
export function getThemeSeparator(theme) {
    return theme.separator ?? '';
}
export { THEMES };
//# sourceMappingURL=config.js.map
import { fgColor, bgColor, reset, visibleLength } from './colors.js';
import { buildSegments } from './segments.js';
import { getThemeSeparator } from '../config.js';
// ─── Powerline rendering ────────────────────────────────────────────────────
function renderPowerlineSegment(segment, nextBg, separator) {
    const { style, text } = segment;
    const icon = style.icon ? `${style.icon} ` : '';
    const content = ` ${icon}${text} `;
    // Segment body: fg on bg
    let out = bgColor(style.bg) + fgColor(style.fg) + content;
    // Separator: previous bg as fg, next bg as bg (or reset)
    if (nextBg) {
        out += bgColor(nextBg) + fgColor(style.bg) + separator;
    }
    else {
        out += reset() + fgColor(style.bg) + separator + reset();
    }
    return out;
}
function renderPowerline(segments, separator) {
    if (segments.length === 0)
        return '';
    let line = '';
    for (let i = 0; i < segments.length; i++) {
        const nextBg = i < segments.length - 1 ? segments[i + 1].style.bg : undefined;
        line += renderPowerlineSegment(segments[i], nextBg, separator);
    }
    return line;
}
// ─── Compact mode ───────────────────────────────────────────────────────────
function renderCompact(segments, separator, maxWidth) {
    const line = renderPowerline(segments, separator);
    return truncateAnsi(line, maxWidth);
}
// ─── Expanded mode ──────────────────────────────────────────────────────────
function renderExpanded(segments, separator, maxWidth) {
    const lines = [];
    // Primary line: motto + project + git + model + context + time
    const primaryNames = new Set(['motto', 'project', 'git', 'model', 'context', 'time']);
    const primary = segments.filter(s => primaryNames.has(s.name));
    if (primary.length > 0) {
        lines.push(renderPowerline(primary, separator));
    }
    // Activity line: tools + agents + todos + usage + environment
    const activityNames = new Set(['tools', 'agents', 'todos', 'usage', 'environment']);
    const activity = segments.filter(s => activityNames.has(s.name));
    if (activity.length > 0) {
        lines.push(renderPowerline(activity, separator));
    }
    return lines;
}
// ─── ANSI-aware truncation ──────────────────────────────────────────────────
function truncateAnsi(str, maxWidth) {
    if (visibleLength(str) <= maxWidth)
        return str;
    let visible = 0;
    let result = '';
    let inEsc = false;
    for (const char of str) {
        if (char === '\x1b') {
            inEsc = true;
            result += char;
            continue;
        }
        if (inEsc) {
            result += char;
            if (char === 'm')
                inEsc = false;
            continue;
        }
        const cp = char.codePointAt(0) || 0;
        const w = isWide(cp) ? 2 : 1;
        if (visible + w > maxWidth - 1) {
            result += '…' + reset();
            break;
        }
        visible += w;
        result += char;
    }
    return result;
}
function isWide(cp) {
    return ((cp >= 0x1100 && cp <= 0x115f) ||
        (cp >= 0x2e80 && cp <= 0x9fff) ||
        (cp >= 0xac00 && cp <= 0xd7af) ||
        (cp >= 0xf900 && cp <= 0xfaff) ||
        (cp >= 0xfe10 && cp <= 0xfe6f) ||
        (cp >= 0xff01 && cp <= 0xff60) ||
        (cp >= 0xffe0 && cp <= 0xffe6) ||
        (cp >= 0x1f000 && cp <= 0x1ffff) ||
        (cp >= 0x20000 && cp <= 0x2ffff) ||
        (cp >= 0x30000 && cp <= 0x3ffff));
}
// ─── Public API ─────────────────────────────────────────────────────────────
export function render(ctx) {
    const segments = buildSegments(ctx);
    if (segments.length === 0)
        return [];
    const separator = getThemeSeparator(ctx.config.theme);
    const maxWidth = ctx.terminalWidth || 120;
    if (ctx.config.layout.mode === 'compact') {
        const line = renderCompact(segments, separator, maxWidth);
        return line ? [line] : [];
    }
    return renderExpanded(segments, separator, maxWidth);
}
//# sourceMappingURL=index.js.map
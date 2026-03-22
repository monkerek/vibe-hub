// ─── ANSI color helpers ─────────────────────────────────────────────────────
// Supports hex (#rrggbb), named ANSI, and 256-color codes.
const ESC = '\x1b[';
const RESET = `${ESC}0m`;
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
    ];
}
export function fgColor(hex) {
    const [r, g, b] = hexToRgb(hex);
    return `${ESC}38;2;${r};${g};${b}m`;
}
export function bgColor(hex) {
    const [r, g, b] = hexToRgb(hex);
    return `${ESC}48;2;${r};${g};${b}m`;
}
export function bold() {
    return `${ESC}1m`;
}
export function dim() {
    return `${ESC}2m`;
}
export function reset() {
    return RESET;
}
export function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
// Reuse a single Segmenter instance across all visibleLength calls
const GRAPHEME_SEGMENTER = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;
export function visibleLength(str) {
    const stripped = stripAnsi(str);
    let len = 0;
    if (GRAPHEME_SEGMENTER) {
        for (const segment of GRAPHEME_SEGMENTER.segment(stripped)) {
            const cp = segment.segment.codePointAt(0) || 0;
            len += isWide(cp) ? 2 : 1;
        }
    }
    else {
        len = stripped.length;
    }
    return len;
}
export function isWide(cp) {
    // CJK Unified Ideographs, CJK Compatibility, Hangul, Fullwidth forms, Emoji
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
// ─── Progress bar rendering ─────────────────────────────────────────────────
export function progressBar(percent, width = 10, filledChar = '█', emptyChar = '░') {
    const clamped = Math.max(0, Math.min(100, percent));
    const filled = Math.round((clamped / 100) * width);
    const empty = width - filled;
    return filledChar.repeat(filled) + emptyChar.repeat(empty);
}
//# sourceMappingURL=colors.js.map
import { fgColor, bgColor, reset, visibleLength, isWide, GRAPHEME_SEGMENTER } from './colors.js';
import { buildSegments, type RenderedSegment } from './segments.js';
import { getThemeSeparator } from '../config.js';
import type { RenderContext } from '../types.js';

// Nerd Font powerline rounded cap glyphs (U+E0B6 / U+E0B4)
const ROUND_LEFT  = '\ue0b6';
const ROUND_RIGHT = '\ue0b4';

// Expanded mode segment groups — controls which line each segment appears on
const PRIMARY_SEGMENTS  = new Set(['motto', 'project', 'git', 'model', 'context', 'time']);
const ACTIVITY_SEGMENTS = new Set(['tools', 'agents', 'todos', 'usage', 'environment']);

// ─── Powerline rendering ────────────────────────────────────────────────────

function renderPowerlineSegment(
  segment: RenderedSegment,
  nextBg: string | undefined,
  separator: string,
  isLast: boolean,
  rounded: boolean,
): string {
  const { style, text } = segment;
  const icon = style.icon ? `${style.icon} ` : '';
  const content = ` ${icon}${text} `;

  let out = bgColor(style.bg) + fgColor(style.fg) + content;

  if (rounded && isLast) {
    // Right rounded cap: segment bg drawn on terminal default bg (Nerd Font convention)
    out += reset() + fgColor(style.bg) + ROUND_RIGHT + reset();
  } else if (nextBg) {
    out += bgColor(nextBg) + fgColor(style.bg) + separator;
  } else if (!isLast) {
    // Non-rounded, no following segment bg known — emit separator only when not last
    // to avoid a dangling separator (e.g. trailing │) after the final segment.
    out += reset() + fgColor(style.bg) + separator + reset();
  } else {
    out += reset();
  }

  return out;
}

function renderPowerline(segments: RenderedSegment[], separator: string, rounded: boolean): string {
  if (segments.length === 0) return '';

  let line = '';

  // Left rounded cap: segment bg drawn on terminal default bg (Nerd Font convention)
  if (rounded) {
    line += reset() + fgColor(segments[0].style.bg) + ROUND_LEFT;
  }

  for (let i = 0; i < segments.length; i++) {
    const nextBg = i < segments.length - 1 ? segments[i + 1].style.bg : undefined;
    const isLast = i === segments.length - 1;
    line += renderPowerlineSegment(segments[i], nextBg, separator, isLast, rounded);
  }
  return line;
}

// ─── Compact mode ───────────────────────────────────────────────────────────

function renderCompact(segments: RenderedSegment[], separator: string, rounded: boolean, maxWidth: number): string {
  const line = renderPowerline(segments, separator, rounded);
  return truncateAnsi(line, maxWidth);
}

// ─── Expanded mode ──────────────────────────────────────────────────────────

function renderExpanded(segments: RenderedSegment[], separator: string, rounded: boolean, maxWidth: number): string[] {
  const lines: string[] = [];

  const primary = segments.filter(s => PRIMARY_SEGMENTS.has(s.name));
  if (primary.length > 0) {
    lines.push(truncateAnsi(renderPowerline(primary, separator, rounded), maxWidth));
  }

  const activity = segments.filter(s => ACTIVITY_SEGMENTS.has(s.name));
  if (activity.length > 0) {
    lines.push(truncateAnsi(renderPowerline(activity, separator, rounded), maxWidth));
  }

  return lines;
}

// ─── ANSI-aware truncation ──────────────────────────────────────────────────

// Split a string into alternating ANSI-escape and visible-text tokens.
// NOTE: Only SGR sequences (ending in 'm') are matched. Non-SGR ANSI codes
// (cursor movement, etc.) in custom motto strings are unsupported and will
// be counted toward visible width, causing incorrect truncation.
const ANSI_RE = /\x1b\[[0-9;]*m/g;

function truncateAnsi(str: string, maxWidth: number): string {
  if (visibleLength(str) <= maxWidth) return str;

  // Tokenise: split into ANSI escape sequences and visible text runs.
  // Then segment each visible run by grapheme cluster so that multi-codepoint
  // sequences (e.g. emoji + skin-tone modifier) are measured and cut atomically.
  let visible = 0;
  let result = '';
  let last = 0;

  ANSI_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  let done = false;

  function consumeText(text: string): boolean {
    if (GRAPHEME_SEGMENTER) {
      for (const seg of GRAPHEME_SEGMENTER.segment(text)) {
        const cp = seg.segment.codePointAt(0) || 0;
        const w = isWide(cp) ? 2 : 1;
        if (visible + w > maxWidth - 1) {
          result += '…' + reset();
          return true; // done
        }
        visible += w;
        result += seg.segment;
      }
    } else {
      for (const char of text) {
        const cp = char.codePointAt(0) || 0;
        const w = isWide(cp) ? 2 : 1;
        if (visible + w > maxWidth - 1) {
          result += '…' + reset();
          return true;
        }
        visible += w;
        result += char;
      }
    }
    return false;
  }

  while (!done && (m = ANSI_RE.exec(str)) !== null) {
    // Visible text before this escape sequence
    if (m.index > last) {
      done = consumeText(str.slice(last, m.index));
    }
    if (!done) result += m[0]; // re-emit the escape sequence verbatim
    last = m.index + m[0].length;
  }

  // Remaining visible text after the last escape sequence
  if (!done && last < str.length) {
    consumeText(str.slice(last));
  }

  return result;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function render(ctx: RenderContext): string[] {
  const segments = buildSegments(ctx);
  if (segments.length === 0) return [];

  const separator = getThemeSeparator(ctx.config.theme);
  const rounded = ctx.config.theme.rounded ?? true;
  const maxWidth = ctx.terminalWidth || 120;

  if (ctx.config.layout.mode === 'compact') {
    const line = renderCompact(segments, separator, rounded, maxWidth);
    return line ? [line] : [];
  }

  return renderExpanded(segments, separator, rounded, maxWidth);
}

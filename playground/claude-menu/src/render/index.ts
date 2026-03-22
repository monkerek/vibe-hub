import { fgColor, bgColor, reset, visibleLength, stripAnsi } from './colors.js';
import { buildSegments, type RenderedSegment } from './segments.js';
import { getThemeSeparator } from '../config.js';
import type { RenderContext } from '../types.js';

// Nerd Font powerline rounded cap glyphs (U+E0B6 / U+E0B4)
const ROUND_LEFT  = '\ue0b6';
const ROUND_RIGHT = '\ue0b4';

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

  // Segment body: fg on bg
  let out = bgColor(style.bg) + fgColor(style.fg) + content;

  if (rounded && isLast) {
    // Right rounded cap: draw in segment's bg color on terminal default bg
    out += reset() + fgColor(style.bg) + ROUND_RIGHT + reset();
  } else if (nextBg) {
    out += bgColor(nextBg) + fgColor(style.bg) + separator;
  } else {
    out += reset() + fgColor(style.bg) + separator + reset();
  }

  return out;
}

function renderPowerline(segments: RenderedSegment[], separator: string, rounded: boolean): string {
  if (segments.length === 0) return '';

  let line = '';

  // Left rounded cap: draw in first segment's bg color on terminal default bg
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

  // Primary line: motto + project + git + model + context + time
  const primaryNames = new Set(['motto', 'project', 'git', 'model', 'context', 'time']);
  const primary = segments.filter(s => primaryNames.has(s.name));
  if (primary.length > 0) {
    lines.push(renderPowerline(primary, separator, rounded));
  }

  // Activity line: tools + agents + todos + usage + environment
  const activityNames = new Set(['tools', 'agents', 'todos', 'usage', 'environment']);
  const activity = segments.filter(s => activityNames.has(s.name));
  if (activity.length > 0) {
    lines.push(renderPowerline(activity, separator, rounded));
  }

  return lines;
}

// ─── ANSI-aware truncation ──────────────────────────────────────────────────

function truncateAnsi(str: string, maxWidth: number): string {
  if (visibleLength(str) <= maxWidth) return str;

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
      if (char === 'm') inEsc = false;
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

function isWide(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x9fff) ||
    (cp >= 0xac00 && cp <= 0xd7af) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe10 && cp <= 0xfe6f) ||
    (cp >= 0xff01 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x1f000 && cp <= 0x1ffff) ||
    (cp >= 0x20000 && cp <= 0x2ffff) ||
    (cp >= 0x30000 && cp <= 0x3ffff)
  );
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

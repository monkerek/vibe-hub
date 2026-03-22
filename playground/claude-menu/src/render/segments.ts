import { fgColor, bgColor, bold, reset, progressBar } from './colors.js';
import { resolveSegmentStyle, getThemeSeparator } from '../config.js';
import type {
  RenderContext,
  SegmentName,
  SegmentStyle,
  ThemeConfig,
  GitStatus,
  UsageData,
  ToolEntry,
  AgentEntry,
  TodoItem,
} from '../types.js';

export interface RenderedSegment {
  name: SegmentName;
  text: string;
  style: SegmentStyle;
}

// ─── Individual segment renderers ───────────────────────────────────────────

function renderMotto(ctx: RenderContext): string | undefined {
  if (!ctx.motto) return undefined;
  return ctx.motto;
}

function renderModel(ctx: RenderContext): string | undefined {
  const name = ctx.stdin.model?.display_name || ctx.stdin.model?.api_model_id;
  if (!name) return undefined;
  return name;
}

function renderProject(ctx: RenderContext): string | undefined {
  const cwd = ctx.cwd || ctx.stdin.cwd;
  if (!cwd) return undefined;
  // Filter empty strings so leading '/' doesn't inflate the count
  const parts = cwd.split('/').filter(Boolean);
  return parts.length > 2
    ? `…/${parts.slice(-2).join('/')}`
    : cwd;
}

function renderGit(ctx: RenderContext): string | undefined {
  const g = ctx.git;
  if (!g) return undefined;

  let text = g.branch;
  if (g.dirty) text += '*';

  const parts: string[] = [];
  if (g.ahead > 0) parts.push(`↑${g.ahead}`);
  if (g.behind > 0) parts.push(`↓${g.behind}`);
  if (g.modified > 0) parts.push(`!${g.modified}`);
  if (g.added > 0) parts.push(`+${g.added}`);
  if (g.deleted > 0) parts.push(`✘${g.deleted}`);
  if (g.untracked > 0) parts.push(`?${g.untracked}`);

  if (parts.length > 0) {
    text += ` ${parts.join(' ')}`;
  }

  return text;
}

function renderContext(ctx: RenderContext): string | undefined {
  const cw = ctx.stdin.context_window;
  if (!cw) return undefined;

  let percent: number;
  if (cw.used_percentage !== undefined) {
    percent = Math.round(cw.used_percentage);
  } else if (cw.current_usage?.input_tokens !== undefined && cw.context_window_size) {
    // Only input tokens (+ cache tokens) count against the context window.
    // output_tokens are NOT counted — including them inflates the percentage.
    const totalUsed = (cw.current_usage.input_tokens || 0) +
                      (cw.current_usage.cache_creation_input_tokens || 0) +
                      (cw.current_usage.cache_read_input_tokens || 0);
    percent = Math.round((totalUsed / cw.context_window_size) * 100);
  } else {
    return undefined;
  }

  const bar = progressBar(percent, 8);
  return `${bar} ${percent}%`;
}

function renderUsage(ctx: RenderContext): string | undefined {
  const u = ctx.usage;
  if (!u || u.fiveHourLimit === undefined || u.fiveHourUsage === undefined) return undefined;

  const percent = Math.round((u.fiveHourUsage / u.fiveHourLimit) * 100);
  const bar = progressBar(percent, 6);

  let resetText = '';
  if (u.resetAt) {
    const resetDate = new Date(u.resetAt);
    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();
    if (diffMs > 0) {
      const diffH = Math.floor(diffMs / 3_600_000);
      const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
      resetText = ` (${diffH}h ${diffM}m)`;
    }
  }

  return `${bar} ${percent}%${resetText}`;
}

function renderTools(ctx: RenderContext): string | undefined {
  if (ctx.tools.length === 0) return undefined;

  const running = ctx.tools.filter(t => t.status === 'running');
  // Sum completed counts across ALL tools (including tools that are also currently running)
  const completed = ctx.tools.reduce((sum, t) => sum + t.count, 0);

  const parts: string[] = [];
  if (running.length > 0) {
    parts.push(`◐ ${running.map(t => t.name).join(', ')}`);
  }
  if (completed > 0) {
    parts.push(`✓ ×${completed}`);
  }

  return parts.length > 0 ? parts.join(' │ ') : undefined;
}

function renderAgents(ctx: RenderContext): string | undefined {
  if (ctx.agents.length === 0) return undefined;

  const running = ctx.agents.filter(a => a.status === 'running');
  const completed = ctx.agents.filter(a => a.status === 'completed').length;

  const parts: string[] = [];
  for (const a of running) {
    let text = `◐ ${a.type}`;
    if (a.description) text += `: ${a.description}`;
    parts.push(text);
  }
  if (completed > 0) {
    parts.push(`✓ ${completed} done`);
  }

  return parts.length > 0 ? parts.join(' │ ') : undefined;
}

function renderTodos(ctx: RenderContext): string | undefined {
  if (ctx.todos.length === 0) return undefined;

  const inProgress = ctx.todos.find(t => t.status === 'in_progress');
  const done = ctx.todos.filter(t => t.status === 'completed').length;
  const total = ctx.todos.length;

  let text = `${done}/${total}`;
  if (inProgress) {
    const short = inProgress.content.length > 30
      ? inProgress.content.substring(0, 27) + '…'
      : inProgress.content;
    text = `▸ ${short} (${text})`;
  }

  return text;
}

function renderEnvironment(ctx: RenderContext): string | undefined {
  const env = ctx.environment;
  if (!env) return undefined;

  const parts: string[] = [];
  if (env.claudeMdCount > 0) parts.push(`md:${env.claudeMdCount}`);
  if (env.mcpCount > 0)      parts.push(`mcp:${env.mcpCount}`);
  if (env.hooksCount > 0)    parts.push(`hooks:${env.hooksCount}`);
  if (env.rulesCount > 0)    parts.push(`rules:${env.rulesCount}`);

  return parts.length > 0 ? parts.join(' ') : undefined;
}

function renderTime(_ctx: RenderContext): string | undefined {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ─── Segment dispatcher ────────────────────────────────────────────────────

const RENDERERS: Record<SegmentName, (ctx: RenderContext) => string | undefined> = {
  motto: renderMotto,
  model: renderModel,
  project: renderProject,
  git: renderGit,
  context: renderContext,
  usage: renderUsage,
  tools: renderTools,
  agents: renderAgents,
  todos: renderTodos,
  environment: renderEnvironment,
  time: renderTime,
};

export function buildSegments(ctx: RenderContext): RenderedSegment[] {
  const segments: RenderedSegment[] = [];
  const seen = new Set<string>();

  for (const name of ctx.config.layout.segments) {
    if (seen.has(name)) continue;
    seen.add(name);
    const renderer = RENDERERS[name];
    if (!renderer) continue;
    const text = renderer(ctx);
    if (!text) continue;
    segments.push({ name, text, style: resolveSegmentStyle(ctx.config.theme, name) });
  }

  return segments;
}

import { writeFile, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildSegments } from '../dist/render/segments.js';
import { DEFAULT_CONFIG } from '../dist/config.js';

export const baseStdin = {
  model: { display_name: 'Claude 3.5' },
  context_window: { used_percentage: 50, context_window_size: 200000 },
};

export const baseCtx = {
  stdin: baseStdin,
  git: null,
  tools: [],
  agents: [],
  todos: [],
  motto: 'Test motto',
  config: { ...DEFAULT_CONFIG },
  terminalWidth: 120,
  cwd: '/home/user/project',
};

export function buildWith(overrides, segmentList) {
  const ctx = { ...baseCtx, ...overrides };
  ctx.config = {
    ...baseCtx.config,
    ...(overrides.config || {}),
    layout: {
      ...baseCtx.config.layout,
      ...(overrides.config?.layout || {}),
      segments: segmentList || overrides.config?.layout?.segments || baseCtx.config.layout.segments,
    },
  };
  return buildSegments(ctx);
}

// Build real Claude Code JSONL transcript line shapes
export function assistantToolUse(id, name, input = {}) {
  return JSON.stringify({
    type: 'assistant',
    message: {
      role: 'assistant',
      content: [{ type: 'tool_use', id, name, input }],
    },
  });
}

export function userToolResult(toolUseId) {
  return JSON.stringify({
    type: 'user',
    message: {
      role: 'user',
      content: [{ type: 'tool_result', tool_use_id: toolUseId, content: 'ok' }],
    },
  });
}

export async function makeTmpDir(prefix = 'claude-menu-test-') {
  return mkdtemp(join(tmpdir(), prefix));
}

export async function writeTmpFile(dir, filename, lines) {
  const path = join(dir, filename);
  await writeFile(path, lines.join('\n'), 'utf-8');
  return path;
}

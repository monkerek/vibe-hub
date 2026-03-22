import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildSegments } from '../dist/render/segments.js';
import { render } from '../dist/render/index.js';
import { stripAnsi } from '../dist/render/colors.js';
import { DEFAULT_CONFIG } from '../dist/config.js';
import { parseTranscript } from '../dist/data/transcript.js';

// ─── Shared helpers ──────────────────────────────────────────────────────────

const baseStdin = {
  model: { display_name: 'Claude 3.5' },
  context_window: { used_percentage: 50, context_window_size: 200000 },
};

const baseCtx = {
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

function buildWith(overrides, segmentList) {
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

function renderWith(overrides, segmentList, mode = 'expanded') {
  const ctx = {
    ...baseCtx,
    ...overrides,
    config: {
      ...DEFAULT_CONFIG,
      ...(overrides.config || {}),
      theme: { ...DEFAULT_CONFIG.theme, ...(overrides.config?.theme || {}) },
      layout: {
        mode,
        segments: segmentList || DEFAULT_CONFIG.layout.segments,
      },
    },
  };
  return render(ctx);
}

// ─── JSONL helpers (same shape as real Claude Code transcripts) ───────────────

function assistantToolUse(id, name, input = {}) {
  return JSON.stringify({
    type: 'assistant',
    message: {
      role: 'assistant',
      content: [{ type: 'tool_use', id, name, input }],
    },
  });
}

function userToolResult(toolUseId) {
  return JSON.stringify({
    type: 'user',
    message: {
      role: 'user',
      content: [{ type: 'tool_result', tool_use_id: toolUseId, content: 'ok' }],
    },
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

let tmpDir;

describe('usage segment (segments level)', () => {
  it('shows bar and percentage', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 500, fiveHourLimit: 1000 },
    }, ['usage']);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('50%'));
    assert.ok(segs[0].text.includes('█'));
  });

  it('calculates percentage from fiveHourUsage / fiveHourLimit', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 750, fiveHourLimit: 1000 },
    }, ['usage']);
    assert.ok(segs[0].text.includes('75%'));
  });

  it('rounds fractional percentage', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 333, fiveHourLimit: 1000 },
    }, ['usage']);
    assert.ok(segs[0].text.includes('33%'));
  });

  it('shows 0% when fiveHourUsage is 0', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 0, fiveHourLimit: 1000 },
    }, ['usage']);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('0%'));
  });

  it('omits segment when usage is undefined', () => {
    const segs = buildWith({ usage: undefined }, ['usage']);
    assert.equal(segs.length, 0);
  });

  it('omits segment when fiveHourLimit is undefined', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 100 },
    }, ['usage']);
    assert.equal(segs.length, 0);
  });

  it('omits segment when fiveHourUsage is undefined', () => {
    const segs = buildWith({
      usage: { fiveHourLimit: 1000 },
    }, ['usage']);
    assert.equal(segs.length, 0);
  });

  it('shows future reset countdown in text', () => {
    const future = new Date(Date.now() + 2 * 3_600_000 + 30 * 60_000).toISOString();
    const segs = buildWith({
      usage: { fiveHourUsage: 200, fiveHourLimit: 1000, resetAt: future },
    }, ['usage']);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('h'));
    assert.ok(segs[0].text.includes('m'));
  });

  it('omits reset countdown when resetAt is in the past', () => {
    const past = new Date(Date.now() - 3_600_000).toISOString();
    const segs = buildWith({
      usage: { fiveHourUsage: 200, fiveHourLimit: 1000, resetAt: past },
    }, ['usage']);
    assert.equal(segs.length, 1);
    assert.ok(!segs[0].text.includes('('));
  });

  it('segment name is "usage"', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 100, fiveHourLimit: 1000 },
    }, ['usage']);
    assert.equal(segs[0].name, 'usage');
  });
});

describe('tools segment — running with prior completions', () => {
  it('shows both running indicator and completed count', () => {
    const segs = buildWith({
      tools: [{ name: 'Bash', status: 'running', count: 3 }],
    }, ['tools']);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('Bash'), 'should show running tool name');
    assert.ok(segs[0].text.includes('×3'), 'should show prior completed count');
  });

  it('omits count when running tool has zero prior completions', () => {
    const segs = buildWith({
      tools: [{ name: 'Grep', status: 'running', count: 0 }],
    }, ['tools']);
    assert.ok(segs[0].text.includes('Grep'));
    assert.ok(!segs[0].text.includes('×'));
  });

  it('sums completions across all tools including currently running', () => {
    const segs = buildWith({
      tools: [
        { name: 'Bash', status: 'running', count: 2 },
        { name: 'Read', status: 'completed', count: 5 },
      ],
    }, ['tools']);
    // total completed = 2 + 5 = 7
    assert.ok(segs[0].text.includes('×7'));
    assert.ok(segs[0].text.includes('Bash'));
  });
});

describe('project segment — edge cases', () => {
  it('shows root path "/" as-is (single component)', () => {
    const segs = buildWith({ cwd: '/' }, ['project']);
    assert.equal(segs.length, 1);
    assert.equal(segs[0].text, '/');
  });

  it('shortens 4-component path to last 2 with ellipsis', () => {
    const segs = buildWith({ cwd: '/alpha/beta/gamma/delta' }, ['project']);
    assert.ok(segs[0].text.startsWith('…/'));
    assert.ok(segs[0].text.includes('gamma/delta'));
    assert.ok(!segs[0].text.includes('alpha'));
  });
});

describe('rounded caps rendering', () => {
  const ROUND_LEFT  = '\ue0b6';
  const ROUND_RIGHT = '\ue0b4';

  it('rounded=true produces left cap (U+E0B6)', () => {
    const ctx = {
      ...baseCtx,
      config: {
        ...DEFAULT_CONFIG,
        theme: { ...DEFAULT_CONFIG.theme, rounded: true },
        layout: { mode: 'compact', segments: ['motto'] },
      },
    };
    const lines = render(ctx);
    assert.ok(lines[0].includes(ROUND_LEFT), 'Expected left rounded cap U+E0B6');
  });

  it('rounded=true produces right cap (U+E0B4)', () => {
    const ctx = {
      ...baseCtx,
      config: {
        ...DEFAULT_CONFIG,
        theme: { ...DEFAULT_CONFIG.theme, rounded: true },
        layout: { mode: 'compact', segments: ['motto'] },
      },
    };
    const lines = render(ctx);
    assert.ok(lines[0].includes(ROUND_RIGHT), 'Expected right rounded cap U+E0B4');
  });

  it('rounded=false omits both rounded caps', () => {
    const ctx = {
      ...baseCtx,
      config: {
        ...DEFAULT_CONFIG,
        theme: { ...DEFAULT_CONFIG.theme, rounded: false, separator: '|' },
        layout: { mode: 'compact', segments: ['motto', 'model'] },
      },
    };
    const lines = render(ctx);
    assert.ok(!lines[0].includes(ROUND_LEFT),  'Should not have left cap when rounded=false');
    assert.ok(!lines[0].includes(ROUND_RIGHT), 'Should not have right cap when rounded=false');
  });

  it('both lines have rounded caps in expanded mode', () => {
    const ctx = {
      ...baseCtx,
      tools: [{ name: 'Bash', status: 'running', count: 1 }],
      config: {
        ...DEFAULT_CONFIG,
        theme: { ...DEFAULT_CONFIG.theme, rounded: true },
        layout: { mode: 'expanded', segments: ['motto', 'tools'] },
      },
    };
    const lines = render(ctx);
    assert.equal(lines.length, 2);
    assert.ok(lines[0].includes(ROUND_LEFT));
    assert.ok(lines[1].includes(ROUND_LEFT));
  });
});

describe('end-to-end pipeline: JSONL → parseTranscript → render', () => {
  before(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'pipeline-test-'));
  });

  async function writeTmp(filename, lines) {
    const path = join(tmpDir, filename);
    await writeFile(path, lines.join('\n'), 'utf-8');
    return path;
  }

  it('tools from JSONL transcript appear in rendered output', async () => {
    const path = await writeTmp('pipeline-tools.jsonl', [
      assistantToolUse('t1', 'Bash'),
      userToolResult('t1'),
      assistantToolUse('t2', 'Read'),
      userToolResult('t2'),
      assistantToolUse('t3', 'Read'), // still running
    ]);

    const { tools } = await parseTranscript(path);
    const ctx = {
      ...baseCtx,
      tools,
      config: {
        ...DEFAULT_CONFIG,
        layout: { mode: 'expanded', segments: ['tools'] },
      },
    };
    const lines = render(ctx);
    const text = lines.map(stripAnsi).join('\n');
    assert.ok(text.includes('Read'), 'running tool should appear');
    assert.ok(text.includes('×'), 'completed count marker should appear');
  });

  it('agents from JSONL transcript appear in rendered output', async () => {
    const path = await writeTmp('pipeline-agents.jsonl', [
      assistantToolUse('a1', 'Agent', { subagent_type: 'Explore', description: 'Find code' }),
      assistantToolUse('a2', 'Agent', { subagent_type: 'Plan', description: 'Design' }),
      userToolResult('a2'), // Plan completes
    ]);

    const { agents } = await parseTranscript(path);
    const ctx = {
      ...baseCtx,
      agents,
      config: {
        ...DEFAULT_CONFIG,
        layout: { mode: 'expanded', segments: ['agents'] },
      },
    };
    const lines = render(ctx);
    const text = lines.map(stripAnsi).join('\n');
    assert.ok(text.includes('Explore'), 'running agent should appear');
    assert.ok(text.includes('done'), 'completed agent count should appear');
  });

  it('todos from JSONL transcript appear in rendered output', async () => {
    const path = await writeTmp('pipeline-todos.jsonl', [
      assistantToolUse('tw1', 'TodoWrite', {
        todos: [
          { content: 'Write tests', status: 'in_progress', activeForm: 'Writing tests' },
          { content: 'Fix bug', status: 'completed', activeForm: 'Fixing bug' },
          { content: 'Deploy', status: 'pending', activeForm: 'Deploying' },
        ],
      }),
    ]);

    const { todos } = await parseTranscript(path);
    const ctx = {
      ...baseCtx,
      todos,
      config: {
        ...DEFAULT_CONFIG,
        layout: { mode: 'expanded', segments: ['todos'] },
      },
    };
    const lines = render(ctx);
    const text = lines.map(stripAnsi).join('\n');
    assert.ok(text.includes('Write tests'), 'in_progress task should appear');
    assert.ok(text.includes('1/3'), 'done/total count should appear');
  });

  it('full pipeline: tools + agents + todos all render together', async () => {
    const path = await writeTmp('pipeline-full.jsonl', [
      assistantToolUse('t1', 'Bash'),
      userToolResult('t1'),
      assistantToolUse('t2', 'Grep'), // still running
      assistantToolUse('a1', 'Agent', { subagent_type: 'Explore', description: 'Audit' }),
      assistantToolUse('tw1', 'TodoWrite', {
        todos: [
          { content: 'Review changes', status: 'in_progress', activeForm: 'Reviewing' },
          { content: 'Ship it', status: 'pending', activeForm: 'Shipping' },
        ],
      }),
    ]);

    const { tools, agents, todos } = await parseTranscript(path);

    // Verify counts before rendering
    assert.equal(tools.length, 2);
    assert.equal(agents.length, 1);
    assert.equal(todos.length, 2);

    const ctx = {
      ...baseCtx,
      tools,
      agents,
      todos,
      config: {
        ...DEFAULT_CONFIG,
        layout: { mode: 'expanded', segments: ['motto', 'tools', 'agents', 'todos'] },
      },
    };
    const lines = render(ctx);
    assert.ok(lines.length >= 2, 'should have primary and activity lines');

    const allText = lines.map(stripAnsi).join('\n');
    assert.ok(allText.includes('Grep'),         'running Grep tool shows');
    assert.ok(allText.includes('×'),            'completed Bash shows count');
    assert.ok(allText.includes('Explore'),      'running agent shows');
    assert.ok(allText.includes('Review changes'), 'in_progress todo shows');
  });
});

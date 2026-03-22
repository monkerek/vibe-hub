import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../dist/render/index.js';
import { stripAnsi, visibleLength, progressBar } from '../dist/render/colors.js';
import { DEFAULT_CONFIG } from '../dist/config.js';

describe('colors', () => {
  describe('stripAnsi', () => {
    it('removes ANSI escape codes', () => {
      assert.equal(stripAnsi('\x1b[38;2;255;0;0mhello\x1b[0m'), 'hello');
    });

    it('returns plain text unchanged', () => {
      assert.equal(stripAnsi('hello'), 'hello');
    });
  });

  describe('visibleLength', () => {
    it('counts visible characters ignoring ANSI', () => {
      assert.equal(visibleLength('\x1b[31mhi\x1b[0m'), 2);
    });

    it('counts plain text correctly', () => {
      assert.equal(visibleLength('hello'), 5);
    });
  });

  describe('progressBar', () => {
    it('renders 0%', () => {
      assert.equal(progressBar(0, 10), '░░░░░░░░░░');
    });

    it('renders 100%', () => {
      assert.equal(progressBar(100, 10), '██████████');
    });

    it('renders 50%', () => {
      assert.equal(progressBar(50, 10), '█████░░░░░');
    });

    it('clamps to 0-100', () => {
      assert.equal(progressBar(-10, 10), '░░░░░░░░░░');
      assert.equal(progressBar(200, 10), '██████████');
    });
  });
});

describe('render', () => {
  const baseCtx = {
    stdin: {
      model: { display_name: 'Opus 4.6' },
      context_window: {
        used_percentage: 34,
        context_window_size: 200000,
      },
    },
    git: {
      branch: 'main',
      dirty: true,
      ahead: 1,
      behind: 0,
      modified: 2,
      added: 0,
      deleted: 0,
      untracked: 1,
    },
    tools: [],
    agents: [],
    todos: [],
    motto: '🚀 Ship it!',
    config: { ...DEFAULT_CONFIG },
    terminalWidth: 120,
    cwd: '/home/user/my-project',
  };

  it('renders non-empty output in expanded mode', () => {
    const lines = render(baseCtx);
    assert.ok(lines.length > 0);
  });

  it('renders non-empty output in compact mode', () => {
    const ctx = {
      ...baseCtx,
      config: {
        ...baseCtx.config,
        layout: { ...baseCtx.config.layout, mode: 'compact' },
      },
    };
    const lines = render(ctx);
    assert.ok(lines.length > 0);
  });

  it('renders empty when no data', () => {
    const ctx = {
      stdin: {},
      tools: [],
      agents: [],
      todos: [],
      config: {
        ...DEFAULT_CONFIG,
        layout: { mode: 'expanded', segments: [] },
      },
      terminalWidth: 120,
      cwd: '/tmp',
    };
    const lines = render(ctx);
    assert.equal(lines.length, 0);
  });

  it('includes motto text in output', () => {
    const lines = render(baseCtx);
    const raw = lines.map(stripAnsi).join('\n');
    assert.ok(raw.includes('Ship it!'));
  });

  it('includes model name in output', () => {
    const lines = render(baseCtx);
    const raw = lines.map(stripAnsi).join('\n');
    assert.ok(raw.includes('Opus 4.6'));
  });

  it('includes git branch in output', () => {
    const lines = render(baseCtx);
    const raw = lines.map(stripAnsi).join('\n');
    assert.ok(raw.includes('main'));
  });

  it('includes context percentage in output', () => {
    const lines = render(baseCtx);
    const raw = lines.map(stripAnsi).join('\n');
    assert.ok(raw.includes('34%'));
  });
});

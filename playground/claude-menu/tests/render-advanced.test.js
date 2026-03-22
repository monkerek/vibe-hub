import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../dist/render/index.js';
import { stripAnsi, visibleLength } from '../dist/render/colors.js';
import { DEFAULT_CONFIG } from '../dist/config.js';

const cleanGit = {
  branch: 'main',
  dirty: false,
  ahead: 0,
  behind: 0,
  modified: 0,
  added: 0,
  deleted: 0,
  untracked: 0,
};

const baseCtx = {
  stdin: {
    model: { display_name: 'Opus 4.6' },
    context_window: { used_percentage: 50, context_window_size: 200000 },
  },
  git: cleanGit,
  tools: [],
  agents: [],
  todos: [],
  motto: '🚀 Ship it!',
  config: { ...DEFAULT_CONFIG },
  terminalWidth: 120,
  cwd: '/home/user/project',
};

function withConfig(layoutOverrides, contextOverrides = {}) {
  return {
    ...baseCtx,
    ...contextOverrides,
    config: {
      ...DEFAULT_CONFIG,
      ...layoutOverrides,
      layout: {
        ...DEFAULT_CONFIG.layout,
        ...(layoutOverrides.layout || {}),
      },
    },
  };
}

describe('render (advanced)', () => {
  describe('expanded mode - line splitting', () => {
    it('renders primary-only segments as one line', () => {
      const ctx = withConfig({ layout: { mode: 'expanded', segments: ['motto', 'model', 'git'] } });
      const lines = render(ctx);
      assert.equal(lines.length, 1);
    });

    it('renders activity-only segments as one line', () => {
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['tools'] } }),
        tools: [{ name: 'Bash', status: 'running', count: 1 }],
      };
      const lines = render(ctx);
      assert.equal(lines.length, 1);
    });

    it('renders two lines when both primary and activity segments exist', () => {
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['motto', 'model', 'tools'] } }),
        tools: [{ name: 'Read', status: 'running', count: 1 }],
      };
      const lines = render(ctx);
      assert.equal(lines.length, 2);
    });

    it('primary line contains motto and model', () => {
      const ctx = withConfig({ layout: { mode: 'expanded', segments: ['motto', 'model', 'git'] } });
      const lines = render(ctx);
      const text = stripAnsi(lines[0]);
      assert.ok(text.includes('Ship it!'));
      assert.ok(text.includes('Opus 4.6'));
    });

    it('activity line contains tools info', () => {
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['motto', 'tools', 'usage'] } }),
        tools: [{ name: 'Bash', status: 'completed', count: 5 }],
        usage: { fiveHourUsage: 200, fiveHourLimit: 1000 },
      };
      const lines = render(ctx);
      assert.equal(lines.length, 2);
      const activityText = stripAnsi(lines[1]);
      assert.ok(activityText.includes('×5') || activityText.includes('20%'));
    });
  });

  describe('compact mode', () => {
    it('renders exactly one line', () => {
      const ctx = withConfig({ layout: { mode: 'compact', segments: ['motto', 'model', 'git', 'context'] } });
      const lines = render(ctx);
      assert.equal(lines.length, 1);
    });

    it('line fits within terminalWidth=60', () => {
      const ctx = withConfig(
        { layout: { mode: 'compact', segments: ['motto', 'model', 'git', 'context'] } },
        { terminalWidth: 60 },
      );
      const lines = render(ctx);
      const visible = visibleLength(lines[0]);
      assert.ok(visible <= 60, `Expected <= 60 visible chars, got ${visible}`);
    });

    it('line fits within terminalWidth=40', () => {
      const ctx = withConfig(
        { layout: { mode: 'compact', segments: ['motto', 'model', 'git'] } },
        { terminalWidth: 40 },
      );
      const lines = render(ctx);
      const visible = visibleLength(lines[0]);
      assert.ok(visible <= 40, `Expected <= 40 visible chars, got ${visible}`);
    });
  });

  describe('ANSI codes', () => {
    it('output contains ANSI escape codes (has color)', () => {
      const ctx = withConfig({ layout: { mode: 'compact', segments: ['motto'] } });
      const lines = render(ctx);
      assert.ok(lines.length > 0);
      // Raw line differs from stripped (has ANSI codes)
      assert.notEqual(lines[0], stripAnsi(lines[0]));
    });

    it('stripped output contains readable text', () => {
      const ctx = withConfig({ layout: { mode: 'compact', segments: ['motto', 'model'] } });
      const lines = render(ctx);
      const text = stripAnsi(lines[0]);
      assert.ok(text.includes('Ship it!'));
      assert.ok(text.includes('Opus 4.6'));
    });
  });

  describe('all 6 themes render without error', () => {
    const themes = ['pastel-rainbow', 'claude-orange', 'nord-frost', 'dracula', 'catppuccin', 'monochrome'];
    for (const theme of themes) {
      it(`theme "${theme}" renders non-empty output`, () => {
        const ctx = {
          ...baseCtx,
          config: {
            ...DEFAULT_CONFIG,
            theme: { name: theme, separator: '' },
            layout: { mode: 'expanded', segments: ['motto', 'model', 'git', 'context'] },
          },
        };
        const lines = render(ctx);
        assert.ok(lines.length > 0, `Expected output for theme "${theme}"`);
      });
    }
  });

  describe('usage segment rendering', () => {
    it('shows 50% usage with bar', () => {
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['usage'] } }),
        usage: { fiveHourUsage: 500, fiveHourLimit: 1000 },
      };
      const lines = render(ctx);
      assert.ok(lines.length > 0);
      const text = lines.map(stripAnsi).join('\n');
      assert.ok(text.includes('50%'));
    });

    it('omits usage segment when usage data is undefined', () => {
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['usage'] } }),
        usage: undefined,
      };
      const lines = render(ctx);
      assert.equal(lines.length, 0);
    });

    it('shows reset countdown when resetAt is in the future', () => {
      const future = new Date(Date.now() + 2 * 3_600_000 + 15 * 60_000);
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['usage'] } }),
        usage: {
          fiveHourUsage: 100,
          fiveHourLimit: 1000,
          resetAt: future.toISOString(),
        },
      };
      const lines = render(ctx);
      const text = lines.map(stripAnsi).join('\n');
      assert.ok(text.includes('h'));
      assert.ok(text.includes('m'));
    });

    it('does not show reset countdown when resetAt is in the past', () => {
      const past = new Date(Date.now() - 3_600_000);
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['usage'] } }),
        usage: {
          fiveHourUsage: 100,
          fiveHourLimit: 1000,
          resetAt: past.toISOString(),
        },
      };
      const lines = render(ctx);
      const text = lines.map(stripAnsi).join('\n');
      // Should not include "h Xm" countdown since resetAt is past
      assert.ok(!text.includes('('));
    });
  });

  describe('time segment rendering', () => {
    it('renders time in HH:MM format', () => {
      const ctx = withConfig({ layout: { mode: 'expanded', segments: ['time'] } });
      const lines = render(ctx);
      const text = lines.map(stripAnsi).join('\n');
      assert.match(text, /\d{2}:\d{2}/);
    });
  });

  describe('empty and edge cases', () => {
    it('returns empty array for empty segments list', () => {
      const ctx = withConfig({ layout: { mode: 'expanded', segments: [] } });
      assert.deepEqual(render(ctx), []);
    });

    it('returns empty array when all segments produce no text', () => {
      // All segments disabled / no data
      const ctx = {
        ...baseCtx,
        stdin: {},
        git: undefined,
        motto: undefined,
        config: {
          ...DEFAULT_CONFIG,
          layout: { mode: 'expanded', segments: ['motto', 'model', 'git', 'context'] },
        },
      };
      assert.deepEqual(render(ctx), []);
    });

    it('handles narrow terminal gracefully', () => {
      const ctx = { ...baseCtx, terminalWidth: 10, config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['motto'] } } };
      assert.doesNotThrow(() => render(ctx));
    });
  });

  describe('powerline separators', () => {
    it('renders with default powerline separator', () => {
      const ctx = {
        ...baseCtx,
        config: {
          ...DEFAULT_CONFIG,
          theme: { name: 'pastel-rainbow', separator: '' },
          layout: { mode: 'compact', segments: ['motto', 'model'] },
        },
      };
      const lines = render(ctx);
      assert.ok(lines.length > 0);
    });

    it('renders with empty separator', () => {
      const ctx = {
        ...baseCtx,
        config: {
          ...DEFAULT_CONFIG,
          theme: { name: 'monochrome', separator: '' },
          layout: { mode: 'compact', segments: ['motto', 'model'] },
        },
      };
      assert.doesNotThrow(() => render(ctx));
    });

    it('renders with pipe separator', () => {
      const ctx = {
        ...baseCtx,
        config: {
          ...DEFAULT_CONFIG,
          theme: { name: 'monochrome', separator: '|' },
          layout: { mode: 'compact', segments: ['motto', 'model'] },
        },
      };
      const lines = render(ctx);
      assert.ok(lines.length > 0);
      assert.ok(stripAnsi(lines[0]).includes('|'));
    });
  });

  describe('full context render', () => {
    it('renders all primary segments together with correct content', () => {
      const ctx = withConfig({
        layout: { mode: 'expanded', segments: ['motto', 'project', 'git', 'model', 'context', 'time'] },
      });
      const lines = render(ctx);
      const text = lines.map(stripAnsi).join('\n');
      assert.ok(text.includes('Ship it!'));
      assert.ok(text.includes('Opus 4.6'));
      assert.ok(text.includes('main'));
      assert.ok(text.includes('50%'));
      assert.match(text, /\d{2}:\d{2}/);
    });

    it('renders todos and agents in activity line', () => {
      const ctx = {
        ...withConfig({ layout: { mode: 'expanded', segments: ['motto', 'todos', 'agents'] } }),
        todos: [
          { content: 'Task A', status: 'completed' },
          { content: 'Task B', status: 'in_progress' },
        ],
        agents: [{ type: 'explorer', status: 'running', description: 'Exploring code' }],
      };
      const lines = render(ctx);
      assert.equal(lines.length, 2);
      const activityText = lines.map(stripAnsi).join('\n');
      assert.ok(activityText.includes('Task B'));
      assert.ok(activityText.includes('explorer'));
    });

    it('dirty git branch shows asterisk', () => {
      const ctx = withConfig(
        { layout: { mode: 'compact', segments: ['git'] } },
        { git: { ...cleanGit, branch: 'feature', dirty: true, modified: 2 } },
      );
      const lines = render(ctx);
      const text = stripAnsi(lines[0]);
      assert.ok(text.includes('feature*'));
    });
  });
});

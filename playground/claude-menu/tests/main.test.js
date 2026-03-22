import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// When dist/index.js is imported, its module-level main() call attaches listeners
// to process.stdin. Unref stdin so those listeners don't prevent process exit.
process.stdin.unref();

import { main } from '../dist/index.js';

// Minimal config for testing
const minimalConfig = {
  theme: { name: 'monochrome', separator: '' },
  layout: { mode: 'compact', segments: ['motto', 'model'] },
  motto: { enabled: true, strategy: 'manual', current: 'Test!' },
};

// Capture console.log lines during test
function captureOutput(fn) {
  const lines = [];
  const orig = console.log;
  console.log = (...args) => lines.push(args.join(' '));
  return fn().finally(() => { console.log = orig; }).then(() => lines);
}

// Default mocks that succeed without side effects
const defaultMocks = {
  readStdin: async () => ({
    model: { display_name: 'Test Model' },
    context_window: { used_percentage: 25, context_window_size: 100000 },
    cwd: '/test/project',
  }),
  getGitStatus: async () => undefined,
  getUsage: async () => undefined,
  parseTranscript: async () => ({ tools: [], agents: [], todos: [] }),
  loadConfig: async () => ({ ...minimalConfig }),
  resolveMotto: () => 'Test!',
  render: () => [],
};

describe('main (integration)', () => {
  describe('basic execution', () => {
    it('runs without throwing with all mocked deps', async () => {
      await assert.doesNotReject(async () => {
        await main({ ...defaultMocks });
      });
    });

    it('outputs lines returned by render', async () => {
      const lines = await captureOutput(() =>
        main({
          ...defaultMocks,
          render: () => ['line one', 'line two'],
        }),
      );
      assert.ok(lines.includes('line one'));
      assert.ok(lines.includes('line two'));
    });

    it('outputs nothing when render returns empty array', async () => {
      const lines = await captureOutput(() =>
        main({ ...defaultMocks, render: () => [] }),
      );
      assert.equal(lines.length, 0);
    });
  });

  describe('render context construction', () => {
    it('passes git data to render context', async () => {
      let receivedCtx = null;
      await main({
        ...defaultMocks,
        getGitStatus: async () => ({
          branch: 'feature-xyz',
          dirty: true,
          ahead: 2,
          behind: 0,
          modified: 1,
          added: 0,
          deleted: 0,
          untracked: 0,
        }),
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.ok(receivedCtx);
      assert.equal(receivedCtx.git?.branch, 'feature-xyz');
      assert.equal(receivedCtx.git?.ahead, 2);
      assert.equal(receivedCtx.git?.dirty, true);
    });

    it('passes motto to render context', async () => {
      let receivedCtx = null;
      await main({
        ...defaultMocks,
        resolveMotto: () => 'Custom Motto!',
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.equal(receivedCtx?.motto, 'Custom Motto!');
    });

    it('passes stdin data to render context', async () => {
      let receivedCtx = null;
      await main({
        ...defaultMocks,
        readStdin: async () => ({
          model: { display_name: 'Opus 4.6' },
          context_window: { used_percentage: 80 },
          cwd: '/my/project',
        }),
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.equal(receivedCtx?.stdin.model?.display_name, 'Opus 4.6');
      assert.equal(receivedCtx?.stdin.context_window?.used_percentage, 80);
    });

    it('passes usage data to render context', async () => {
      let receivedCtx = null;
      const usageData = { fiveHourUsage: 500, fiveHourLimit: 1000 };
      await main({
        ...defaultMocks,
        getUsage: async () => usageData,
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.deepEqual(receivedCtx?.usage, usageData);
    });

    it('passes config to render context', async () => {
      let receivedCtx = null;
      const customConfig = {
        theme: { name: 'dracula', separator: '' },
        layout: { mode: 'compact', segments: ['time'] },
        motto: { enabled: false, strategy: 'manual' },
      };
      await main({
        ...defaultMocks,
        loadConfig: async () => customConfig,
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.equal(receivedCtx?.config.theme.name, 'dracula');
      assert.equal(receivedCtx?.config.layout.mode, 'compact');
    });

    it('passes tools, agents, todos from transcript', async () => {
      let receivedCtx = null;
      const transcriptData = {
        tools: [{ name: 'Bash', status: 'running', count: 1 }],
        agents: [{ type: 'researcher', status: 'completed' }],
        todos: [{ content: 'Fix bug', status: 'pending' }],
      };
      await main({
        ...defaultMocks,
        readStdin: async () => ({
          cwd: '/test',
          session: { transcript_path: '/tmp/session.jsonl' },
        }),
        parseTranscript: async () => transcriptData,
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.equal(receivedCtx?.tools.length, 1);
      assert.equal(receivedCtx?.agents.length, 1);
      assert.equal(receivedCtx?.todos.length, 1);
    });

    it('uses cwd from stdin when available', async () => {
      let receivedCtx = null;
      await main({
        ...defaultMocks,
        readStdin: async () => ({ cwd: '/stdin/cwd' }),
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.equal(receivedCtx?.cwd, '/stdin/cwd');
    });
  });

  describe('transcript path handling', () => {
    it('does not call parseTranscript when no transcript_path', async () => {
      let transcriptCalled = false;
      await main({
        ...defaultMocks,
        readStdin: async () => ({ cwd: '/test' }),
        parseTranscript: async () => {
          transcriptCalled = true;
          return { tools: [], agents: [], todos: [] };
        },
      });
      assert.equal(transcriptCalled, false);
    });

    it('calls parseTranscript with correct path when provided', async () => {
      let calledPath = null;
      await main({
        ...defaultMocks,
        readStdin: async () => ({
          cwd: '/test',
          session: { transcript_path: '/tmp/test-session.jsonl' },
        }),
        parseTranscript: async (path) => {
          calledPath = path;
          return { tools: [], agents: [], todos: [] };
        },
      });
      assert.equal(calledPath, '/tmp/test-session.jsonl');
    });

    it('returns empty transcript when no session', async () => {
      let receivedCtx = null;
      await main({
        ...defaultMocks,
        readStdin: async () => ({ cwd: '/test' }),
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.deepEqual(receivedCtx?.tools, []);
      assert.deepEqual(receivedCtx?.agents, []);
      assert.deepEqual(receivedCtx?.todos, []);
    });
  });

  describe('resolveMotto integration', () => {
    it('calls resolveMotto with config.motto', async () => {
      let mottoConfig = null;
      const customConfig = {
        ...minimalConfig,
        motto: { enabled: true, strategy: 'random', pack: 'zen' },
      };
      await main({
        ...defaultMocks,
        loadConfig: async () => customConfig,
        resolveMotto: (cfg) => { mottoConfig = cfg; return 'Breathe'; },
      });
      assert.deepEqual(mottoConfig, customConfig.motto);
    });

    it('passes undefined motto when resolveMotto returns undefined', async () => {
      let receivedCtx = null;
      await main({
        ...defaultMocks,
        resolveMotto: () => undefined,
        render: (ctx) => { receivedCtx = ctx; return []; },
      });
      assert.equal(receivedCtx?.motto, undefined);
    });
  });

  describe('parallel data fetching', () => {
    it('fetches git, usage, and transcript concurrently', async () => {
      const callOrder = [];
      await main({
        ...defaultMocks,
        readStdin: async () => ({
          cwd: '/test',
          session: { transcript_path: '/tmp/t.jsonl' },
        }),
        getGitStatus: async () => {
          callOrder.push('git');
          return undefined;
        },
        getUsage: async () => {
          callOrder.push('usage');
          return undefined;
        },
        parseTranscript: async () => {
          callOrder.push('transcript');
          return { tools: [], agents: [], todos: [] };
        },
      });
      // All three should have been called
      assert.ok(callOrder.includes('git'));
      assert.ok(callOrder.includes('usage'));
      assert.ok(callOrder.includes('transcript'));
    });
  });
});

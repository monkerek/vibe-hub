import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { baseStdin, baseCtx, buildWith } from './helpers.js';

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

describe('buildSegments', () => {
  describe('motto segment', () => {
    it('includes motto text', () => {
      const segs = buildWith({}, ['motto']);
      assert.equal(segs.length, 1);
      assert.equal(segs[0].text, 'Test motto');
    });

    it('omits segment when motto is undefined', () => {
      const segs = buildWith({ motto: undefined }, ['motto']);
      assert.equal(segs.length, 0);
    });

    it('omits segment when motto is null', () => {
      const segs = buildWith({ motto: null }, ['motto']);
      assert.equal(segs.length, 0);
    });

    it('segment name is "motto"', () => {
      const segs = buildWith({}, ['motto']);
      assert.equal(segs[0].name, 'motto');
    });
  });

  describe('model segment', () => {
    it('includes model display_name', () => {
      const segs = buildWith({}, ['model']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('Claude 3.5'));
    });

    it('falls back to api_model_id when no display_name', () => {
      const segs = buildWith({
        stdin: { model: { api_model_id: 'claude-opus-4-6' } },
      }, ['model']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('claude-opus-4-6'));
    });

    it('omits segment when no model', () => {
      const segs = buildWith({ stdin: {} }, ['model']);
      assert.equal(segs.length, 0);
    });

    it('omits segment when stdin is empty object', () => {
      const segs = buildWith({ stdin: { model: {} } }, ['model']);
      assert.equal(segs.length, 0);
    });
  });

  describe('project segment', () => {
    it('shortens long paths to last 2 components with ellipsis prefix', () => {
      const segs = buildWith({ cwd: '/a/b/c/d/e' }, ['project']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('d/e'));
      assert.ok(segs[0].text.startsWith('…/'));
    });

    it('shows full path when only 1 component', () => {
      const segs = buildWith({ cwd: '/foo' }, ['project']);
      assert.equal(segs.length, 1);
      assert.equal(segs[0].text, '/foo');
    });

    it('shows shortened path when 2 components (leading / creates 3 parts)', () => {
      // '/foo/bar'.split('/') = ['', 'foo', 'bar'] → length 3 → shortened
      const segs = buildWith({ cwd: '/foo/bar' }, ['project']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.startsWith('…/'));
      assert.ok(segs[0].text.includes('foo/bar'));
    });

    it('uses ctx.cwd over stdin.cwd', () => {
      const segs = buildWith({
        cwd: '/from/ctx',
        stdin: { ...baseStdin, cwd: '/from/stdin' },
      }, ['project']);
      assert.ok(segs[0].text.includes('ctx'));
    });

    it('uses stdin.cwd when ctx.cwd is missing', () => {
      const segs = buildWith({
        cwd: undefined,
        stdin: { ...baseStdin, cwd: '/from/stdin/path' },
      }, ['project']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('stdin'));
    });

    it('omits segment when no cwd anywhere', () => {
      const segs = buildWith({
        cwd: undefined,
        stdin: {},
      }, ['project']);
      assert.equal(segs.length, 0);
    });
  });

  describe('git segment', () => {
    it('shows branch name', () => {
      const segs = buildWith({ git: cleanGit }, ['git']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('main'));
    });

    it('shows dirty indicator (*) when dirty', () => {
      const segs = buildWith({
        git: { ...cleanGit, dirty: true, modified: 1 },
      }, ['git']);
      assert.ok(segs[0].text.includes('*'));
    });

    it('no dirty indicator when clean', () => {
      const segs = buildWith({ git: cleanGit }, ['git']);
      assert.ok(!segs[0].text.includes('*'));
    });

    it('shows ahead count with ↑', () => {
      const segs = buildWith({ git: { ...cleanGit, ahead: 3 } }, ['git']);
      assert.ok(segs[0].text.includes('↑3'));
    });

    it('shows behind count with ↓', () => {
      const segs = buildWith({ git: { ...cleanGit, behind: 2 } }, ['git']);
      assert.ok(segs[0].text.includes('↓2'));
    });

    it('shows modified count with !', () => {
      const segs = buildWith({
        git: { ...cleanGit, dirty: true, modified: 4 },
      }, ['git']);
      assert.ok(segs[0].text.includes('!4'));
    });

    it('shows added count with +', () => {
      const segs = buildWith({
        git: { ...cleanGit, dirty: true, added: 2 },
      }, ['git']);
      assert.ok(segs[0].text.includes('+2'));
    });

    it('shows deleted count with ✘', () => {
      const segs = buildWith({
        git: { ...cleanGit, dirty: true, deleted: 1 },
      }, ['git']);
      assert.ok(segs[0].text.includes('✘1'));
    });

    it('shows untracked count with ?', () => {
      const segs = buildWith({
        git: { ...cleanGit, dirty: true, untracked: 5 },
      }, ['git']);
      assert.ok(segs[0].text.includes('?5'));
    });

    it('shows all change types together', () => {
      const segs = buildWith({
        git: { branch: 'feat', dirty: true, ahead: 1, behind: 0, modified: 2, added: 1, deleted: 0, untracked: 3 },
      }, ['git']);
      const text = segs[0].text;
      assert.ok(text.includes('↑1'));
      assert.ok(text.includes('!2'));
      assert.ok(text.includes('+1'));
      assert.ok(text.includes('?3'));
    });

    it('omits segment when git is undefined', () => {
      const segs = buildWith({ git: undefined }, ['git']);
      assert.equal(segs.length, 0);
    });

    it('omits segment when git is null', () => {
      const segs = buildWith({ git: null }, ['git']);
      assert.equal(segs.length, 0);
    });
  });

  describe('context segment', () => {
    it('shows percentage from used_percentage', () => {
      const segs = buildWith({
        stdin: { context_window: { used_percentage: 75 } },
      }, ['context']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('75%'));
    });

    it('rounds used_percentage to nearest integer', () => {
      const segs = buildWith({
        stdin: { context_window: { used_percentage: 33.7 } },
      }, ['context']);
      assert.ok(segs[0].text.includes('34%'));
    });

    it('calculates percent from token counts', () => {
      const segs = buildWith({
        stdin: {
          context_window: {
            context_window_size: 1000,
            current_usage: { input_tokens: 500, output_tokens: 100 },
          },
        },
      }, ['context']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('60%'));
    });

    it('includes a progress bar with block characters', () => {
      const segs = buildWith({
        stdin: { context_window: { used_percentage: 50 } },
      }, ['context']);
      assert.ok(segs[0].text.includes('█'));
    });

    it('omits segment when no context_window', () => {
      const segs = buildWith({ stdin: {} }, ['context']);
      assert.equal(segs.length, 0);
    });

    it('omits segment when context_window has no usable data', () => {
      const segs = buildWith({
        stdin: { context_window: {} },
      }, ['context']);
      assert.equal(segs.length, 0);
    });
  });

  describe('tools segment', () => {
    it('omits when no tools', () => {
      const segs = buildWith({ tools: [] }, ['tools']);
      assert.equal(segs.length, 0);
    });

    it('shows running tool names', () => {
      const segs = buildWith({
        tools: [{ name: 'Bash', status: 'running', count: 1 }],
      }, ['tools']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('Bash'));
    });

    it('shows completed count with ×', () => {
      const segs = buildWith({
        tools: [{ name: 'Read', status: 'completed', count: 3 }],
      }, ['tools']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('×3'));
    });

    it('shows both running and completed together', () => {
      const segs = buildWith({
        tools: [
          { name: 'Bash', status: 'running', count: 0 },  // running, no prior completions
          { name: 'Read', status: 'completed', count: 2 },
        ],
      }, ['tools']);
      const text = segs[0].text;
      assert.ok(text.includes('Bash'));
      assert.ok(text.includes('×2'));
    });

    it('shows multiple running tools', () => {
      const segs = buildWith({
        tools: [
          { name: 'Bash', status: 'running', count: 1 },
          { name: 'Grep', status: 'running', count: 1 },
        ],
      }, ['tools']);
      const text = segs[0].text;
      assert.ok(text.includes('Bash'));
      assert.ok(text.includes('Grep'));
    });
  });

  describe('agents segment', () => {
    it('omits when no agents', () => {
      const segs = buildWith({ agents: [] }, ['agents']);
      assert.equal(segs.length, 0);
    });

    it('shows running agent type', () => {
      const segs = buildWith({
        agents: [{ type: 'researcher', status: 'running' }],
      }, ['agents']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('researcher'));
    });

    it('shows agent description when present', () => {
      const segs = buildWith({
        agents: [{ type: 'coder', status: 'running', description: 'Writing tests' }],
      }, ['agents']);
      assert.ok(segs[0].text.includes('Writing tests'));
    });

    it('shows completed count', () => {
      const segs = buildWith({
        agents: [{ type: 'coder', status: 'completed' }],
      }, ['agents']);
      assert.ok(segs[0].text.includes('1 done'));
    });

    it('shows multiple completed count', () => {
      const segs = buildWith({
        agents: [
          { type: 'researcher', status: 'completed' },
          { type: 'coder', status: 'completed' },
        ],
      }, ['agents']);
      assert.ok(segs[0].text.includes('2 done'));
    });

    it('shows running and completed together', () => {
      const segs = buildWith({
        agents: [
          { type: 'researcher', status: 'running' },
          { type: 'coder', status: 'completed' },
        ],
      }, ['agents']);
      const text = segs[0].text;
      assert.ok(text.includes('researcher'));
      assert.ok(text.includes('done'));
    });
  });

  describe('todos segment', () => {
    it('omits when no todos', () => {
      const segs = buildWith({ todos: [] }, ['todos']);
      assert.equal(segs.length, 0);
    });

    it('shows done/total count', () => {
      const segs = buildWith({
        todos: [
          { content: 'Task 1', status: 'completed' },
          { content: 'Task 2', status: 'pending' },
        ],
      }, ['todos']);
      assert.equal(segs.length, 1);
      assert.ok(segs[0].text.includes('1/2'));
    });

    it('shows in_progress task content', () => {
      const segs = buildWith({
        todos: [
          { content: 'Active task', status: 'in_progress' },
          { content: 'Done task', status: 'completed' },
        ],
      }, ['todos']);
      assert.ok(segs[0].text.includes('Active task'));
    });

    it('truncates long in_progress task to ~30 chars with ellipsis', () => {
      const longTask = 'This is a very long task name that exceeds thirty chars';
      const segs = buildWith({
        todos: [{ content: longTask, status: 'in_progress' }],
      }, ['todos']);
      assert.ok(segs[0].text.includes('…'));
      const stripped = segs[0].text.replace(/…/g, '...');
      // The content portion should be truncated
      assert.ok(!segs[0].text.includes(longTask));
    });

    it('does not truncate short in_progress task', () => {
      const segs = buildWith({
        todos: [{ content: 'Short task', status: 'in_progress' }],
      }, ['todos']);
      assert.ok(segs[0].text.includes('Short task'));
      assert.ok(!segs[0].text.includes('…'));
    });

    it('zero done count when all pending', () => {
      const segs = buildWith({
        todos: [
          { content: 'A', status: 'pending' },
          { content: 'B', status: 'pending' },
        ],
      }, ['todos']);
      assert.ok(segs[0].text.includes('0/2'));
    });
  });

  describe('time segment', () => {
    it('renders HH:MM format', () => {
      const segs = buildWith({}, ['time']);
      assert.equal(segs.length, 1);
      assert.match(segs[0].text, /^\d{2}:\d{2}$/);
    });

    it('hours are zero-padded', () => {
      const segs = buildWith({}, ['time']);
      const text = segs[0].text;
      assert.equal(text.length, 5);
      assert.equal(text[2], ':');
    });
  });

  describe('environment segment', () => {
    it('omits environment segment (stub returns undefined)', () => {
      const segs = buildWith({}, ['environment']);
      assert.equal(segs.length, 0);
    });
  });

  describe('unknown segment name', () => {
    it('skips unknown segment names gracefully', () => {
      const segs = buildWith({}, ['nonexistent-segment', 'motto']);
      // Only motto should render; unknown skipped
      assert.equal(segs.length, 1);
      assert.equal(segs[0].name, 'motto');
    });
  });

  describe('segment ordering', () => {
    it('respects segment order from config', () => {
      const segs = buildWith(
        { git: cleanGit },
        ['model', 'git', 'motto'],
      );
      assert.equal(segs[0].name, 'model');
      assert.equal(segs[1].name, 'git');
      assert.equal(segs[2].name, 'motto');
    });
  });

  describe('theme styling', () => {
    it('applies segment-specific style from theme', () => {
      const segs = buildWith({}, ['motto', 'model']);
      // Each segment has a style object
      assert.ok(segs[0].style.fg);
      assert.ok(segs[0].style.bg);
      assert.ok(segs[1].style.fg);
      assert.ok(segs[1].style.bg);
    });

    it('motto and model have different background colors in pastel-rainbow', () => {
      const segs = buildWith({}, ['motto', 'model']);
      assert.notEqual(segs[0].style.bg, segs[1].style.bg);
    });
  });
});

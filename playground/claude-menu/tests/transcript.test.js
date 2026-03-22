import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { parseTranscript } from '../dist/data/transcript.js';
import { assistantToolUse, userToolResult, makeTmpDir, writeTmpFile } from './helpers.js';

let tmpDir;

async function writeTmp(filename, lines) {
  return writeTmpFile(tmpDir, filename, lines);
}

describe('parseTranscript', () => {
  before(async () => {
    tmpDir = await makeTmpDir('transcript-test-');
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns empty arrays for nonexistent file', async () => {
    const result = await parseTranscript('/nonexistent/path/file.jsonl');
    assert.deepEqual(result.tools, []);
    assert.deepEqual(result.agents, []);
    assert.deepEqual(result.todos, []);
  });

  it('returns empty arrays for empty file', async () => {
    const path = await writeTmp('empty.jsonl', ['']);
    const result = await parseTranscript(path);
    assert.deepEqual(result.tools, []);
    assert.deepEqual(result.agents, []);
    assert.deepEqual(result.todos, []);
  });

  it('skips malformed JSON lines', async () => {
    const path = await writeTmp('malformed.jsonl', [
      'not json',
      assistantToolUse('t1', 'Bash'),
      '{broken',
    ]);
    const result = await parseTranscript(path);
    assert.equal(result.tools.length, 1);
    assert.equal(result.tools[0].name, 'Bash');
  });

  it('skips blank lines', async () => {
    const path = await writeTmp('blank-lines.jsonl', [
      '',
      assistantToolUse('t1', 'Read'),
      '   ',
      assistantToolUse('t2', 'Write'),
      '',
    ]);
    const result = await parseTranscript(path);
    assert.equal(result.tools.length, 2);
  });

  it('ignores entries with no message field', async () => {
    const path = await writeTmp('no-message.jsonl', [
      JSON.stringify({ type: 'system', content: 'Compacted' }),
      assistantToolUse('t1', 'Bash'),
    ]);
    const result = await parseTranscript(path);
    assert.equal(result.tools.length, 1);
  });

  it('ignores entries where message.content is not an array', async () => {
    const path = await writeTmp('string-content.jsonl', [
      JSON.stringify({ type: 'user', message: { role: 'user', content: 'plain text' } }),
      assistantToolUse('t1', 'Bash'),
    ]);
    const result = await parseTranscript(path);
    assert.equal(result.tools.length, 1);
  });

  describe('tool tracking', () => {
    it('tracks tool_use as running (no result yet)', async () => {
      const path = await writeTmp('tools-running.jsonl', [
        assistantToolUse('t1', 'Read'),
        assistantToolUse('t2', 'Write'),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 2);
      const read = result.tools.find(t => t.name === 'Read');
      assert.ok(read);
      assert.equal(read.status, 'running');
      assert.equal(read.count, 0);
    });

    it('marks tool completed when tool_result arrives', async () => {
      const path = await writeTmp('tool-complete.jsonl', [
        assistantToolUse('t1', 'Glob'),
        userToolResult('t1'),
      ]);
      const result = await parseTranscript(path);
      const glob = result.tools.find(t => t.name === 'Glob');
      assert.ok(glob);
      assert.equal(glob.status, 'completed');
      assert.equal(glob.count, 1);
    });

    it('counts multiple completed invocations of the same tool', async () => {
      const path = await writeTmp('repeat-tool.jsonl', [
        assistantToolUse('t1', 'Bash'),
        userToolResult('t1'),
        assistantToolUse('t2', 'Bash'),
        userToolResult('t2'),
        assistantToolUse('t3', 'Bash'),
        userToolResult('t3'),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      const bash = result.tools.find(t => t.name === 'Bash');
      assert.ok(bash);
      assert.equal(bash.status, 'completed');
      assert.equal(bash.count, 3);
    });

    it('shows running status when last invocation has no result', async () => {
      const path = await writeTmp('partially-running.jsonl', [
        assistantToolUse('t1', 'Bash'),
        userToolResult('t1'),
        assistantToolUse('t2', 'Bash'),
        userToolResult('t2'),
        assistantToolUse('t3', 'Bash'), // still running
      ]);
      const result = await parseTranscript(path);
      const bash = result.tools.find(t => t.name === 'Bash');
      assert.ok(bash);
      assert.equal(bash.status, 'running');
      assert.equal(bash.count, 2); // 2 completed, 1 running
    });

    it('uses unknown as default tool name', async () => {
      const path = await writeTmp('tool-noname.jsonl', [
        JSON.stringify({
          type: 'assistant',
          message: { role: 'assistant', content: [{ type: 'tool_use', id: 't1', input: {} }] },
        }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.tools[0].name, 'unknown');
    });

    it('tracks multiple distinct tools independently', async () => {
      const path = await writeTmp('multi-tools.jsonl', [
        assistantToolUse('t1', 'Bash'),
        assistantToolUse('t2', 'Read'),
        userToolResult('t1'), // Bash completes
        assistantToolUse('t3', 'Grep'), // Grep starts
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 3);
      const bash = result.tools.find(t => t.name === 'Bash');
      const read = result.tools.find(t => t.name === 'Read');
      const grep = result.tools.find(t => t.name === 'Grep');
      assert.equal(bash.status, 'completed');
      assert.equal(bash.count, 1);
      assert.equal(read.status, 'running');
      assert.equal(read.count, 0);
      assert.equal(grep.status, 'running');
      assert.equal(grep.count, 0);
    });

    it('ignores tool_result with no matching tool_use', async () => {
      const path = await writeTmp('orphan-result.jsonl', [
        userToolResult('t-unknown'),
        assistantToolUse('t1', 'Bash'),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.tools[0].name, 'Bash');
    });
  });

  describe('agent tracking', () => {
    it('tracks Agent tool_use as running', async () => {
      const path = await writeTmp('agent-launch.jsonl', [
        assistantToolUse('a1', 'Agent', { subagent_type: 'Explore', description: 'Search code' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 1);
      assert.equal(result.agents[0].type, 'Explore');
      assert.equal(result.agents[0].description, 'Search code');
      assert.equal(result.agents[0].status, 'running');
    });

    it('marks agent completed when tool_result arrives', async () => {
      const path = await writeTmp('agent-complete.jsonl', [
        assistantToolUse('a1', 'Agent', { subagent_type: 'Plan', description: 'Design API' }),
        userToolResult('a1'),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 1);
      assert.equal(result.agents[0].status, 'completed');
    });

    it('uses agent_type as fallback for subagent_type', async () => {
      const path = await writeTmp('agent-type-fallback.jsonl', [
        assistantToolUse('a1', 'Agent', { agent_type: 'researcher' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents[0].type, 'researcher');
    });

    it('defaults type to agent when neither field is present', async () => {
      const path = await writeTmp('agent-no-type.jsonl', [
        assistantToolUse('a1', 'Agent', { description: 'Do something' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents[0].type, 'agent');
    });

    it('captures agent description', async () => {
      const path = await writeTmp('agent-desc.jsonl', [
        assistantToolUse('a1', 'Agent', { subagent_type: 'general-purpose', description: 'Write tests' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents[0].description, 'Write tests');
    });

    it('tracks multiple agents independently', async () => {
      const path = await writeTmp('multi-agents.jsonl', [
        assistantToolUse('a1', 'Agent', { subagent_type: 'Explore', description: 'Find files' }),
        assistantToolUse('a2', 'Agent', { subagent_type: 'Plan', description: 'Design system' }),
        userToolResult('a1'), // first agent completes
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 2);
      const explore = result.agents.find(a => a.type === 'Explore');
      const plan = result.agents.find(a => a.type === 'Plan');
      assert.equal(explore.status, 'completed');
      assert.equal(plan.status, 'running');
    });

    it('Agent tool_use is not added to regular tools list', async () => {
      const path = await writeTmp('agent-not-tool.jsonl', [
        assistantToolUse('a1', 'Agent', { subagent_type: 'Explore' }),
        assistantToolUse('t1', 'Bash'),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.tools[0].name, 'Bash');
      assert.equal(result.agents.length, 1);
    });
  });

  describe('todo tracking', () => {
    it('replaces todos from TodoWrite input.todos array', async () => {
      const path = await writeTmp('todos.jsonl', [
        assistantToolUse('t1', 'TodoWrite', {
          todos: [
            { content: 'Fix bug', status: 'in_progress', activeForm: 'Fixing bug' },
            { content: 'Write tests', status: 'pending', activeForm: 'Writing tests' },
          ],
        }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 2);
      const bug = result.todos.find(t => t.content === 'Fix bug');
      assert.ok(bug);
      assert.equal(bug.status, 'in_progress');
    });

    it('replaces todos with the latest TodoWrite snapshot', async () => {
      const path = await writeTmp('todos-replace.jsonl', [
        assistantToolUse('t1', 'TodoWrite', {
          todos: [{ content: 'Old task', status: 'pending', activeForm: 'Old task' }],
        }),
        assistantToolUse('t2', 'TodoWrite', {
          todos: [
            { content: 'New task 1', status: 'in_progress', activeForm: 'New task 1' },
            { content: 'New task 2', status: 'pending', activeForm: 'New task 2' },
          ],
        }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 2);
      assert.equal(result.todos[0].content, 'New task 1');
    });

    it('ignores todos entries without content', async () => {
      const path = await writeTmp('todos-no-content.jsonl', [
        assistantToolUse('t1', 'TodoWrite', {
          todos: [
            { content: '', status: 'pending', activeForm: '' },
            { content: 'Valid task', status: 'in_progress', activeForm: 'Doing' },
          ],
        }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 1);
      assert.equal(result.todos[0].content, 'Valid task');
    });

    it('defaults todo status to pending when not specified', async () => {
      const path = await writeTmp('todos-no-status.jsonl', [
        assistantToolUse('t1', 'TodoWrite', {
          todos: [{ content: 'Implicit pending', activeForm: 'Doing' }],
        }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos[0].status, 'pending');
    });

    it('TodoWrite tool_use is not added to regular tools list', async () => {
      const path = await writeTmp('todowrite-not-tool.jsonl', [
        assistantToolUse('t1', 'TodoWrite', { todos: [{ content: 'Task', status: 'pending' }] }),
        assistantToolUse('t2', 'Bash'),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.tools[0].name, 'Bash');
    });
  });

  describe('mixed entries', () => {
    it('correctly separates tools, agents, and todos', async () => {
      const path = await writeTmp('mixed.jsonl', [
        assistantToolUse('t1', 'Bash'),
        assistantToolUse('a1', 'Agent', { subagent_type: 'Explore', description: 'Search' }),
        assistantToolUse('tw1', 'TodoWrite', {
          todos: [{ content: 'Review PR', status: 'in_progress', activeForm: 'Reviewing' }],
        }),
        userToolResult('t1'), // Bash completes
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.agents.length, 1);
      assert.equal(result.todos.length, 1);
      assert.equal(result.tools[0].status, 'completed');
      assert.equal(result.agents[0].status, 'running');
      assert.equal(result.todos[0].status, 'in_progress');
    });

    it('handles a realistic session with tool completions and an agent', async () => {
      const path = await writeTmp('realistic.jsonl', [
        assistantToolUse('t1', 'Read'),
        userToolResult('t1'),
        assistantToolUse('t2', 'Bash'),
        userToolResult('t2'),
        assistantToolUse('t3', 'Bash'),
        userToolResult('t3'),
        assistantToolUse('a1', 'Agent', { subagent_type: 'Explore', description: 'Audit code' }),
        assistantToolUse('tw1', 'TodoWrite', {
          todos: [
            { content: 'Fix parser', status: 'completed', activeForm: 'Fixing' },
            { content: 'Update tests', status: 'in_progress', activeForm: 'Updating' },
          ],
        }),
        assistantToolUse('t4', 'Edit'), // still running
      ]);
      const result = await parseTranscript(path);

      const bash = result.tools.find(t => t.name === 'Bash');
      assert.equal(bash.status, 'completed');
      assert.equal(bash.count, 2);

      const read = result.tools.find(t => t.name === 'Read');
      assert.equal(read.status, 'completed');
      assert.equal(read.count, 1);

      const edit = result.tools.find(t => t.name === 'Edit');
      assert.equal(edit.status, 'running');
      assert.equal(edit.count, 0);

      assert.equal(result.agents[0].status, 'running');
      assert.equal(result.agents[0].description, 'Audit code');

      assert.equal(result.todos.length, 2);
      assert.equal(result.todos.find(t => t.content === 'Update tests').status, 'in_progress');
    });
  });
});

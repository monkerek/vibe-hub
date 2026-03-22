import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseTranscript } from '../dist/data/transcript.js';

let tmpDir;

async function writeTmp(filename, lines) {
  const path = join(tmpDir, filename);
  await writeFile(path, lines.join('\n'), 'utf-8');
  return path;
}

describe('parseTranscript', () => {
  before(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'transcript-test-'));
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
      JSON.stringify({ type: 'tool_use', name: 'Bash' }),
      '{broken',
    ]);
    const result = await parseTranscript(path);
    assert.equal(result.tools.length, 1);
    assert.equal(result.tools[0].name, 'Bash');
  });

  it('skips blank lines', async () => {
    const path = await writeTmp('blank-lines.jsonl', [
      '',
      JSON.stringify({ type: 'tool_use', name: 'Read' }),
      '   ',
      JSON.stringify({ type: 'tool_use', name: 'Write' }),
      '',
    ]);
    const result = await parseTranscript(path);
    assert.equal(result.tools.length, 2);
  });

  describe('tool tracking', () => {
    it('tracks tool_use entries as running', async () => {
      const path = await writeTmp('tools-running.jsonl', [
        JSON.stringify({ type: 'tool_use', name: 'Read' }),
        JSON.stringify({ type: 'tool_use', name: 'Write' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 2);
      const read = result.tools.find(t => t.name === 'Read');
      assert.ok(read);
      assert.equal(read.status, 'running');
      assert.equal(read.count, 1);
    });

    it('increments count for repeated tool_use', async () => {
      const path = await writeTmp('repeat-tool.jsonl', [
        JSON.stringify({ type: 'tool_use', name: 'Bash' }),
        JSON.stringify({ type: 'tool_use', name: 'Bash' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      const bash = result.tools.find(t => t.name === 'Bash');
      assert.ok(bash);
      assert.equal(bash.count, 2);
    });

    it('updates status to completed on tool_result', async () => {
      const path = await writeTmp('tool-result.jsonl', [
        JSON.stringify({ type: 'tool_use', name: 'Glob' }),
        JSON.stringify({ type: 'tool_result', name: 'Glob' }),
      ]);
      const result = await parseTranscript(path);
      const glob = result.tools.find(t => t.name === 'Glob');
      assert.ok(glob);
      assert.equal(glob.status, 'completed');
      assert.equal(glob.count, 2);
    });

    it('creates completed tool entry if tool_result seen before tool_use', async () => {
      const path = await writeTmp('result-first.jsonl', [
        JSON.stringify({ type: 'tool_result', name: 'Grep' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.tools[0].status, 'completed');
    });

    it('uses unknown as default tool name', async () => {
      const path = await writeTmp('tool-noname.jsonl', [
        JSON.stringify({ type: 'tool_use' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.tools[0].name, 'unknown');
    });

    it('tracks multiple distinct tools independently', async () => {
      const path = await writeTmp('multi-tools.jsonl', [
        JSON.stringify({ type: 'tool_use', name: 'Bash' }),
        JSON.stringify({ type: 'tool_use', name: 'Read' }),
        JSON.stringify({ type: 'tool_result', name: 'Bash' }),
        JSON.stringify({ type: 'tool_use', name: 'Grep' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 3);
      const bash = result.tools.find(t => t.name === 'Bash');
      const read = result.tools.find(t => t.name === 'Read');
      const grep = result.tools.find(t => t.name === 'Grep');
      assert.equal(bash.status, 'completed');
      assert.equal(read.status, 'running');
      assert.equal(grep.status, 'running');
    });
  });

  describe('agent tracking', () => {
    it('tracks agent_launch entries as running', async () => {
      const path = await writeTmp('agent-launch.jsonl', [
        JSON.stringify({ type: 'agent_launch', agent_id: 'a1', agent_type: 'researcher' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 1);
      assert.equal(result.agents[0].type, 'researcher');
      assert.equal(result.agents[0].status, 'running');
    });

    it('updates agent to completed on agent_complete', async () => {
      const path = await writeTmp('agent-complete.jsonl', [
        JSON.stringify({ type: 'agent_launch', agent_id: 'a1', agent_type: 'coder' }),
        JSON.stringify({ type: 'agent_complete', agent_id: 'a1', duration_ms: 5000 }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 1);
      assert.equal(result.agents[0].status, 'completed');
      assert.equal(result.agents[0].durationMs, 5000);
    });

    it('ignores agent entries without id', async () => {
      const path = await writeTmp('agent-noid.jsonl', [
        JSON.stringify({ type: 'agent_launch', agent_type: 'coder' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 0);
    });

    it('uses id field as fallback for agent_id', async () => {
      const path = await writeTmp('agent-id-fallback.jsonl', [
        JSON.stringify({ type: 'agent_launch', id: 'b2', agent_type: 'explorer' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 1);
      assert.equal(result.agents[0].type, 'explorer');
    });

    it('uses subagent_type as fallback for agent_type', async () => {
      const path = await writeTmp('agent-subtype.jsonl', [
        JSON.stringify({ type: 'agent_launch', agent_id: 'c3', subagent_type: 'planner' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents[0].type, 'planner');
    });

    it('captures agent description', async () => {
      const path = await writeTmp('agent-desc.jsonl', [
        JSON.stringify({ type: 'agent_launch', agent_id: 'd4', agent_type: 'coder', description: 'Write tests' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents[0].description, 'Write tests');
    });

    it('tracks multiple agents independently', async () => {
      const path = await writeTmp('multi-agents.jsonl', [
        JSON.stringify({ type: 'agent_launch', agent_id: 'x1', agent_type: 'researcher' }),
        JSON.stringify({ type: 'agent_launch', agent_id: 'x2', agent_type: 'coder' }),
        JSON.stringify({ type: 'agent_complete', agent_id: 'x1', duration_ms: 1000 }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.agents.length, 2);
      const researcher = result.agents.find(a => a.type === 'researcher');
      const coder = result.agents.find(a => a.type === 'coder');
      assert.equal(researcher.status, 'completed');
      assert.equal(coder.status, 'running');
    });
  });

  describe('todo tracking', () => {
    it('tracks TodoWrite entries', async () => {
      const path = await writeTmp('todos.jsonl', [
        JSON.stringify({ type: 'TodoWrite', content: 'Fix bug', status: 'pending' }),
        JSON.stringify({ type: 'TodoWrite', content: 'Write tests', status: 'in_progress' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 2);
      const bug = result.todos.find(t => t.content === 'Fix bug');
      assert.ok(bug);
      assert.equal(bug.status, 'pending');
    });

    it('updates existing todo status', async () => {
      const path = await writeTmp('todo-update.jsonl', [
        JSON.stringify({ type: 'TodoWrite', content: 'Deploy', status: 'pending' }),
        JSON.stringify({ type: 'TodoWrite', content: 'Deploy', status: 'completed' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 1);
      assert.equal(result.todos[0].status, 'completed');
    });

    it('replaces todos with latest snapshot from todos array', async () => {
      const path = await writeTmp('todos-snapshot.jsonl', [
        JSON.stringify({ type: 'TodoWrite', content: 'Old task', status: 'pending' }),
        JSON.stringify({
          todos: [
            { content: 'New task 1', status: 'in_progress' },
            { content: 'New task 2', status: 'pending' },
          ],
        }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 2);
      assert.equal(result.todos[0].content, 'New task 1');
      assert.equal(result.todos[0].status, 'in_progress');
    });

    it('handles Task type entries', async () => {
      const path = await writeTmp('task-type.jsonl', [
        JSON.stringify({ type: 'Task', content: 'Task item', status: 'in_progress' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 1);
      assert.equal(result.todos[0].content, 'Task item');
    });

    it('uses task field as fallback for content', async () => {
      const path = await writeTmp('task-field.jsonl', [
        JSON.stringify({ type: 'Task', task: 'Do something', status: 'pending' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 1);
      assert.equal(result.todos[0].content, 'Do something');
    });

    it('defaults status to pending when not specified', async () => {
      const path = await writeTmp('todo-no-status.jsonl', [
        JSON.stringify({ type: 'TodoWrite', content: 'Implicit pending' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos[0].status, 'pending');
    });

    it('ignores todos without content', async () => {
      const path = await writeTmp('todo-no-content.jsonl', [
        JSON.stringify({ type: 'TodoWrite', status: 'pending' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.todos.length, 0);
    });
  });

  describe('mixed entries', () => {
    it('correctly separates tools, agents, and todos', async () => {
      const path = await writeTmp('mixed.jsonl', [
        JSON.stringify({ type: 'tool_use', name: 'Bash' }),
        JSON.stringify({ type: 'agent_launch', agent_id: 'z1', agent_type: 'researcher' }),
        JSON.stringify({ type: 'TodoWrite', content: 'Review PR', status: 'in_progress' }),
        JSON.stringify({ type: 'tool_result', name: 'Bash' }),
      ]);
      const result = await parseTranscript(path);
      assert.equal(result.tools.length, 1);
      assert.equal(result.agents.length, 1);
      assert.equal(result.todos.length, 1);
      assert.equal(result.tools[0].status, 'completed');
      assert.equal(result.agents[0].status, 'running');
      assert.equal(result.todos[0].status, 'in_progress');
    });
  });
});

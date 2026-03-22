import { readFile } from 'node:fs/promises';
import type { ToolEntry, AgentEntry, TodoItem } from '../types.js';

interface TranscriptResult {
  tools: ToolEntry[];
  agents: AgentEntry[];
  todos: TodoItem[];
}

export async function parseTranscript(path: string): Promise<TranscriptResult> {
  const tools: Map<string, ToolEntry> = new Map();
  const agents: Map<string, AgentEntry> = new Map();
  const todos: TodoItem[] = [];

  try {
    const raw = await readFile(path, 'utf-8');
    const lines = raw.trim().split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        processEntry(entry, tools, agents, todos);
      } catch {
        // skip malformed lines
      }
    }
  } catch {
    // file not found or unreadable
  }

  return {
    tools: Array.from(tools.values()),
    agents: Array.from(agents.values()),
    todos,
  };
}

function processEntry(
  entry: Record<string, unknown>,
  tools: Map<string, ToolEntry>,
  agents: Map<string, AgentEntry>,
  todos: TodoItem[],
): void {
  const type = entry.type as string | undefined;

  // Tool use tracking
  if (type === 'tool_use' || type === 'tool_result') {
    const name = (entry.name as string) || 'unknown';
    const existing = tools.get(name);
    if (existing) {
      existing.count++;
      if (type === 'tool_result') existing.status = 'completed';
    } else {
      tools.set(name, {
        name,
        status: type === 'tool_result' ? 'completed' : 'running',
        count: 1,
      });
    }
  }

  // Agent tracking
  if (type === 'agent_launch' || type === 'agent_complete') {
    const id = (entry.agent_id as string) || (entry.id as string) || '';
    const agentType = (entry.agent_type as string) || (entry.subagent_type as string) || 'agent';
    if (id) {
      const existing = agents.get(id);
      if (existing) {
        if (type === 'agent_complete') {
          existing.status = 'completed';
          existing.durationMs = (entry.duration_ms as number) || undefined;
        }
      } else {
        agents.set(id, {
          type: agentType,
          model: entry.model as string | undefined,
          description: entry.description as string | undefined,
          status: type === 'agent_complete' ? 'completed' : 'running',
          durationMs: (entry.duration_ms as number) || undefined,
        });
      }
    }
  }

  // Todo tracking (TodoWrite / Task blocks)
  if (type === 'TodoWrite' || type === 'Task' || type === 'TaskCreate' || type === 'TaskUpdate') {
    const content = (entry.content as string) || (entry.task as string) || '';
    const status = (entry.status as string) || 'pending';
    if (content) {
      const existing = todos.findIndex(t => t.content === content);
      if (existing >= 0) {
        todos[existing].status = status as TodoItem['status'];
      } else {
        todos.push({ content, status: status as TodoItem['status'] });
      }
    }
  }

  // Handle nested todos arrays (from TodoWrite tool results)
  if (entry.todos && Array.isArray(entry.todos)) {
    todos.length = 0; // replace with latest snapshot
    for (const t of entry.todos as Array<Record<string, unknown>>) {
      todos.push({
        content: (t.content as string) || '',
        status: (t.status as string || 'pending') as TodoItem['status'],
      });
    }
  }
}

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { ToolEntry, AgentEntry, TodoItem } from '../types.js';

interface TranscriptResult {
  tools: ToolEntry[];
  agents: AgentEntry[];
  todos: TodoItem[];
}

// Internal per-invocation record keyed by tool_use id
interface Invocation {
  name: string;
  completed: boolean;
}

export async function parseTranscript(path: string): Promise<TranscriptResult> {
  const invocations = new Map<string, Invocation>();
  const agents = new Map<string, AgentEntry>();
  const todos: TodoItem[] = [];

  try {
    const rl = createInterface({
      input: createReadStream(path, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });
    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        processLine(entry, invocations, agents, todos);
      } catch {
        // skip malformed lines
      }
    }
  } catch {
    // file not found or unreadable
  }

  // Aggregate invocations by tool name: count = completed calls,
  // status = 'running' if any invocation for that name is still in progress.
  const toolMap = new Map<string, ToolEntry>();
  for (const inv of invocations.values()) {
    const existing = toolMap.get(inv.name);
    if (existing) {
      if (!inv.completed) {
        existing.status = 'running';
      } else {
        existing.count++;
      }
    } else {
      toolMap.set(inv.name, {
        name: inv.name,
        status: inv.completed ? 'completed' : 'running',
        count: inv.completed ? 1 : 0,
      });
    }
  }

  return {
    tools: Array.from(toolMap.values()),
    agents: Array.from(agents.values()),
    todos,
  };
}

// entry.type is the message role ("assistant"|"user"), not a content-block type;
// tool_use blocks live inside entry.message.content[].
function processLine(
  entry: Record<string, unknown>,
  invocations: Map<string, Invocation>,
  agents: Map<string, AgentEntry>,
  todos: TodoItem[],
): void {
  const message = entry.message as Record<string, unknown> | undefined;
  if (!message) return;

  const content = message.content;
  if (!Array.isArray(content)) return;

  for (const block of content as Record<string, unknown>[]) {
    const blockType = block.type as string | undefined;

    if (blockType === 'tool_use') {
      const id = block.id as string | undefined;
      const name = (block.name as string) || 'unknown';
      const input = (block.input ?? {}) as Record<string, unknown>;

      if (name === 'TodoWrite') {
        const todosInput = input.todos;
        if (Array.isArray(todosInput)) {
          todos.length = 0;
          for (const t of todosInput as Array<Record<string, unknown>>) {
            const taskContent = (t.content as string) || '';
            if (taskContent) {
              todos.push({
                content: taskContent,
                status: ((t.status as string) || 'pending') as TodoItem['status'],
              });
            }
          }
        }
      } else if (name === 'Agent') {
        if (id) {
          agents.set(id, {
            type: (input.subagent_type as string) || (input.agent_type as string) || 'agent',
            description: input.description as string | undefined,
            status: 'running',
          });
        }
      } else {
        if (id) {
          invocations.set(id, { name, completed: false });
        }
      }
    } else if (blockType === 'tool_result') {
      const toolUseId = block.tool_use_id as string | undefined;
      if (!toolUseId) continue;

      if (agents.has(toolUseId)) {
        agents.get(toolUseId)!.status = 'completed';
      } else if (invocations.has(toolUseId)) {
        invocations.get(toolUseId)!.completed = true;
      }
    }
  }
}

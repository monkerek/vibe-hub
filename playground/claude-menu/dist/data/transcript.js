import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
export async function parseTranscript(path) {
    const invocations = new Map();
    const agents = new Map();
    const todos = [];
    try {
        const rl = createInterface({
            input: createReadStream(path, { encoding: 'utf-8' }),
            crlfDelay: Infinity,
        });
        for await (const line of rl) {
            if (!line.trim())
                continue;
            try {
                const entry = JSON.parse(line);
                processLine(entry, invocations, agents, todos);
            }
            catch {
                // skip malformed lines
            }
        }
    }
    catch {
        // file not found or unreadable
    }
    // Aggregate invocations by tool name: count = completed calls,
    // status = 'running' if any invocation for that name is still in progress.
    const toolMap = new Map();
    for (const inv of invocations.values()) {
        const existing = toolMap.get(inv.name);
        if (existing) {
            if (!inv.completed) {
                existing.status = 'running';
            }
            else {
                existing.count++;
            }
        }
        else {
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
function processLine(entry, invocations, agents, todos) {
    const message = entry.message;
    if (!message)
        return;
    const content = message.content;
    if (!Array.isArray(content))
        return;
    for (const block of content) {
        const blockType = block.type;
        if (blockType === 'tool_use') {
            const id = block.id;
            const name = block.name || 'unknown';
            const input = (block.input ?? {});
            if (name === 'TodoWrite') {
                const todosInput = input.todos;
                if (Array.isArray(todosInput)) {
                    todos.length = 0;
                    for (const t of todosInput) {
                        const taskContent = t.content || '';
                        if (taskContent) {
                            todos.push({
                                content: taskContent,
                                status: (t.status || 'pending'),
                            });
                        }
                    }
                }
            }
            else if (name === 'Agent') {
                if (id) {
                    agents.set(id, {
                        type: input.subagent_type || input.agent_type || 'agent',
                        description: input.description,
                        status: 'running',
                    });
                }
            }
            else {
                if (id) {
                    invocations.set(id, { name, completed: false });
                }
            }
        }
        else if (blockType === 'tool_result') {
            const toolUseId = block.tool_use_id;
            if (!toolUseId)
                continue;
            if (agents.has(toolUseId)) {
                agents.get(toolUseId).status = 'completed';
            }
            else if (invocations.has(toolUseId)) {
                invocations.get(toolUseId).completed = true;
            }
        }
    }
}
//# sourceMappingURL=transcript.js.map
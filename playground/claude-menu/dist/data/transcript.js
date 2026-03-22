import { readFile } from 'node:fs/promises';
export async function parseTranscript(path) {
    const tools = new Map();
    const agents = new Map();
    const todos = [];
    try {
        const raw = await readFile(path, 'utf-8');
        const lines = raw.trim().split('\n');
        for (const line of lines) {
            if (!line.trim())
                continue;
            try {
                const entry = JSON.parse(line);
                processEntry(entry, tools, agents, todos);
            }
            catch {
                // skip malformed lines
            }
        }
    }
    catch {
        // file not found or unreadable
    }
    return {
        tools: Array.from(tools.values()),
        agents: Array.from(agents.values()),
        todos,
    };
}
function processEntry(entry, tools, agents, todos) {
    const type = entry.type;
    // Tool use tracking
    if (type === 'tool_use' || type === 'tool_result') {
        const name = entry.name || 'unknown';
        const existing = tools.get(name);
        if (existing) {
            existing.count++;
            if (type === 'tool_result')
                existing.status = 'completed';
        }
        else {
            tools.set(name, {
                name,
                status: type === 'tool_result' ? 'completed' : 'running',
                count: 1,
            });
        }
    }
    // Agent tracking
    if (type === 'agent_launch' || type === 'agent_complete') {
        const id = entry.agent_id || entry.id || '';
        const agentType = entry.agent_type || entry.subagent_type || 'agent';
        if (id) {
            const existing = agents.get(id);
            if (existing) {
                if (type === 'agent_complete') {
                    existing.status = 'completed';
                    existing.durationMs = entry.duration_ms || undefined;
                }
            }
            else {
                agents.set(id, {
                    type: agentType,
                    model: entry.model,
                    description: entry.description,
                    status: type === 'agent_complete' ? 'completed' : 'running',
                    durationMs: entry.duration_ms || undefined,
                });
            }
        }
    }
    // Todo tracking (TodoWrite / Task blocks)
    if (type === 'TodoWrite' || type === 'Task' || type === 'TaskCreate' || type === 'TaskUpdate') {
        const content = entry.content || entry.task || '';
        const status = entry.status || 'pending';
        if (content) {
            const existing = todos.findIndex(t => t.content === content);
            if (existing >= 0) {
                todos[existing].status = status;
            }
            else {
                todos.push({ content, status: status });
            }
        }
    }
    // Handle nested todos arrays (from TodoWrite tool results)
    if (entry.todos && Array.isArray(entry.todos)) {
        todos.length = 0; // replace with latest snapshot
        for (const t of entry.todos) {
            todos.push({
                content: t.content || '',
                status: (t.status || 'pending'),
            });
        }
    }
}
//# sourceMappingURL=transcript.js.map
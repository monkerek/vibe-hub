import type { ToolEntry, AgentEntry, TodoItem } from '../types.js';
interface TranscriptResult {
    tools: ToolEntry[];
    agents: AgentEntry[];
    todos: TodoItem[];
}
export declare function parseTranscript(path: string): Promise<TranscriptResult>;
export {};
//# sourceMappingURL=transcript.d.ts.map
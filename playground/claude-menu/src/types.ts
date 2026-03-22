// ─── Claude Code stdin payload ───────────────────────────────────────────────

export interface StdinData {
  model?: {
    display_name?: string;
    api_model_id?: string;
  };
  context_window?: {
    current_usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
    context_window_size?: number;
    used_percentage?: number;
    remaining_percentage?: number;
  };
  session?: {
    id?: string;
    transcript_path?: string;
  };
  cwd?: string;
}

// ─── Tool / Agent / Todo tracking ───────────────────────────────────────────

export interface ToolEntry {
  name: string;
  status: 'running' | 'completed' | 'error';
  count: number;
}

export interface AgentEntry {
  type: string;
  model?: string;
  description?: string;
  status: 'running' | 'completed';
  durationMs?: number;
}

export interface TodoItem {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// ─── Usage API ──────────────────────────────────────────────────────────────

export interface UsageData {
  fiveHourUsage?: number;
  fiveHourLimit?: number;
  sevenDayUsage?: number;
  sevenDayLimit?: number;
  resetAt?: string;
}

// ─── Git status ─────────────────────────────────────────────────────────────

export interface GitStatus {
  branch: string;
  dirty: boolean;
  ahead: number;
  behind: number;
  modified: number;
  added: number;
  deleted: number;
  untracked: number;
}

// ─── Motto system ───────────────────────────────────────────────────────────

export type MottoStrategy =
  | 'day-of-week'
  | 'random'
  | 'sequential'
  | 'manual'
  | 'time-of-day';

export interface MottoConfig {
  enabled: boolean;
  strategy: MottoStrategy;
  current?: string;
  pack?: string;
  custom?: string[];
  dayOfWeek?: Record<string, string>;
  timeOfDay?: Record<string, string>;
  emoji?: boolean;
}

// ─── Theme system ───────────────────────────────────────────────────────────

export type BuiltinTheme =
  | 'pastel-rainbow'
  | 'claude-orange'
  | 'nord-frost'
  | 'dracula'
  | 'catppuccin'
  | 'monochrome';

export interface SegmentStyle {
  fg: string;
  bg: string;
  icon?: string;
}

export interface ThemeConfig {
  name: BuiltinTheme | string;
  separator?: string;
  rounded?: boolean;
  segments?: Record<string, Partial<SegmentStyle>>;
}

// ─── Segments / Layout ──────────────────────────────────────────────────────

export type SegmentName =
  | 'motto'
  | 'model'
  | 'project'
  | 'git'
  | 'context'
  | 'usage'
  | 'tools'
  | 'agents'
  | 'todos'
  | 'environment'
  | 'time';

export interface LayoutConfig {
  mode: 'expanded' | 'compact';
  segments: SegmentName[];
}

// ─── Top-level config (maps to config.toml) ─────────────────────────────────

export interface ClaudeMenuConfig {
  theme: ThemeConfig;
  layout: LayoutConfig;
  motto: MottoConfig;
}

// ─── Render context ─────────────────────────────────────────────────────────

export interface RenderContext {
  stdin: StdinData;
  git?: GitStatus;
  usage?: UsageData;
  tools: ToolEntry[];
  agents: AgentEntry[];
  todos: TodoItem[];
  motto?: string;
  config: ClaudeMenuConfig;
  terminalWidth: number;
  cwd: string;
}

// ─── Dependency injection ───────────────────────────────────────────────────

export interface MainDeps {
  readStdin: () => Promise<StdinData>;
  getGitStatus: (cwd: string) => Promise<GitStatus | undefined>;
  getUsage: () => Promise<UsageData | undefined>;
  parseTranscript: (path: string) => Promise<{
    tools: ToolEntry[];
    agents: AgentEntry[];
    todos: TodoItem[];
  }>;
  loadConfig: () => Promise<ClaudeMenuConfig>;
  resolveMotto: (config: MottoConfig) => string | undefined;
  render: (ctx: RenderContext) => string[];
}

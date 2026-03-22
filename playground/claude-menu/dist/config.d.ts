import type { ClaudeMenuConfig, ThemeConfig, BuiltinTheme, SegmentStyle } from './types.js';
declare const THEMES: Record<BuiltinTheme, Record<string, SegmentStyle>>;
export declare const DEFAULT_CONFIG: ClaudeMenuConfig;
export declare function getConfigDir(): string;
export declare function getConfigPath(): string;
export declare function loadConfig(): Promise<ClaudeMenuConfig>;
export declare function resolveSegmentStyle(theme: ThemeConfig, segmentName: string): SegmentStyle;
export declare function getThemeSeparator(theme: ThemeConfig): string;
export { THEMES };
//# sourceMappingURL=config.d.ts.map
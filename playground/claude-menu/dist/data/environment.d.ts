export interface EnvironmentInfo {
    claudeMdCount: number;
    rulesCount: number;
    mcpCount: number;
    hooksCount: number;
}
export declare function getEnvironment(cwd: string): Promise<EnvironmentInfo>;
//# sourceMappingURL=environment.d.ts.map
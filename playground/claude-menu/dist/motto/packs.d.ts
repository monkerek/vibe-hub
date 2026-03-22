export interface MottoPack {
    name: string;
    description: string;
    mottos: string[];
}
export declare const MOTTO_PACKS: MottoPack[];
export declare function getPackByName(name: string): MottoPack | undefined;
export declare function getAllPackNames(): string[];
//# sourceMappingURL=packs.d.ts.map
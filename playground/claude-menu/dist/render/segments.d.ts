import type { RenderContext, SegmentName, SegmentStyle } from '../types.js';
export interface RenderedSegment {
    name: SegmentName;
    text: string;
    style: SegmentStyle;
}
export declare function buildSegments(ctx: RenderContext): RenderedSegment[];
//# sourceMappingURL=segments.d.ts.map
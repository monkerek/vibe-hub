# Short-Form Video Mode (<1 min)

For short videos (under 60 seconds), use frame extraction instead of transcript-based analysis. This mode produces detailed visual descriptions suitable for design mockups, spatial documentation, and visual inventory.

## Frame Extraction

```bash
# Create temp directory for frames
FRAMES_DIR=$(mktemp -d)

# Extract frames (adjust fps by length)
ffmpeg -i "$INPUT" -vf "fps=2" -q:v 2 "$FRAMES_DIR/frame_%04d.jpg"  # <30s
ffmpeg -i "$INPUT" -vf "fps=1" -q:v 2 "$FRAMES_DIR/frame_%04d.jpg"  # 30-60s

# For remote videos, download first
yt-dlp -o "/tmp/media-digest-%(id)s.%(ext)s" "https://..."
```

## Two Analysis Modes

**Mode A: Spatial/Layout** (deck tours, room walkthroughs, property videos)
- Read ALL frames to understand the complete space
- Build mental map of camera movement and spatial relationships
- Produce coherent spatial description with dimensions, materials, colors

**Mode B: Narrative/Sequential** (process videos, tutorials, before/after)
- Describe each frame building on previous
- Preserve temporal coherence and story

## Common Analysis Errors to Avoid

| Error | How to Avoid |
|-------|--------------|
| Color misidentification | Check multiple frames in different lighting |
| Missing small objects | Systematically scan all frame areas |
| Mount type confusion | Look for mounting hardware, cables |
| Missing background furniture | Check frame edges carefully |

## Validation Checklist (per frame)
- All four corners examined
- Background elements noted
- Small decorative items identified
- Colors described with specificity

## Output

Save to `/docs/personal/digest/video/video-digest-[description]-YYYY-MM-DD.md`

Integrates with `image-generation` skill for design mockups:
Video → Frame Analysis → Spatial Description → Image Generation Prompt → Mockup

## Cleanup
```bash
rm -r "$FRAMES_DIR"  # Remove temp frames after digest
```

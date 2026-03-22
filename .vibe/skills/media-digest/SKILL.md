---
name: media-digest
description: Transform video and audio content (YouTube, Podcasts, Bilibili) into structured learning digests. Supports short-form video analysis and automated transcription.
---

# Media Digest

## Overview

This skill enables Gemini CLI to systematically process video and audio content, extracting high-signal insights and generating structured digests. It handles long-form content (YouTube, Podcasts) via transcription and short-form content (<1 min) via frame-based spatial analysis.

## 📦 Setup & Dependencies

To use this skill, ensure the following dependencies are installed on your system:

### 1. Media Extraction (yt-dlp)
Used for fetching metadata and downloading audio/video.
```bash
brew install yt-dlp
```

### 2. YouTube Transcripts
Used for fetching native/auto-generated YouTube transcripts via API.
```bash
pip install --break-system-packages youtube-transcript-api
```

### 3. Audio Processing (FFmpeg)
Mandatory for frame extraction and audio conversion.
```bash
brew install ffmpeg
```

### 4. Transcription (Whisper)
For platforms without native transcripts, use OpenAI Whisper API (requires `OPENAI_API_KEY`) or local `whisper-cpp`.
```bash
brew install whisper-cpp
```

## <instructions>

### 0. Network Environment Detection (Run First)
Before making any network calls, probe whether the session is running behind a restrictive egress proxy:

```bash
# Check for JWT proxy (common in Anthropic sandbox)
python3 -c "import os; p=os.environ.get('GLOBAL_AGENT_HTTP_PROXY',''); print('JWT proxy' if 'jwt' in p.lower() else ('proxy: '+p[:60] if p else 'no proxy'))"
```

If a JWT proxy is detected, decode it and check whether `youtube.com` is in the allowed-hosts claim. If YouTube is **absent from the allowlist**, skip Steps 1–2 for YouTube entirely — `yt-dlp`, `youtube-transcript-api`, and `WebFetch` to YouTube/Invidious will always fail. Proceed directly to the **Secondary Source Fallback** below.

#### Secondary Source Fallback Cascade (Network-Restricted Environments)

Execute in order, stop when you have enough content to write the digest:

1. **WebSearch** — Search for the video ID directly (e.g. `kwSVtQ7dziU`). Snippets often reveal the title, guest, and key themes.
2. **GitHub API** — Search issues, PRs, and code for the video ID. Translation projects and archival repos frequently contain full timestamped chapter breakdowns.
   ```bash
   VIDEO_ID="VIDEO_ID_HERE"
   curl -s "https://api.github.com/search/issues?q=${VIDEO_ID}" \
     -H "Accept: application/vnd.github+json" | \
     python3 -c "
   import json,sys
   d=json.load(sys.stdin)
   for i in d.get('items',[]):
       print(i['title'], '\n', i['html_url'])
       print((i.get('body') or '')[:800])
       print('---')
   "
   ```
3. **WebSearch for transcript aggregators** — Once the title is known, search `"[title]" transcript site:podscripts.co` or `"[title]" full transcript`. Use the snippets returned; direct WebFetch may still 403 from bot-detection.
4. **WebSearch for secondary summaries** — Newsletter writeups, blog posts, fan notes, and LinkedIn posts often carry substantial content.
5. **Knowledge synthesis** — Combine retrieved metadata + known speaker context. Document all secondary sources in the digest footer.

> **Note**: `api.github.com` and WebSearch are always accessible in Anthropic sandboxes. Invidious and Piped instances block cloud IPs — skip them.

### 1. Platform Detection & Metadata
- Identify the source platform from the URL (YouTube, Bilibili, 小宇宙FM, Apple Podcasts, etc.).
- Use `yt-dlp --dump-json` or platform-specific APIs to fetch metadata (title, author, duration, publish date).
- Research the speaker/creator to identify their background, affiliations, and expertise (see `references/platforms.md`).

### 2. Transcription & Content Extraction
- **Long-Form**: Fetch native transcripts if available. If not, download audio and transcribe using the Whisper API or local `whisper-cpp` (see `references/transcription-guide.md`).
- **Short-Form (<1 min)**: Use frame extraction (FFmpeg) and spatial analysis to describe layouts or design mockups (see `references/short-form-video.md`).

### 3. Analysis & Synthesis
- Segment the content into logical sections with timestamps.
- Identify key claims, evidence, and "Devil's Advocate" critiques.
- Format the output using `templates/default.md`. **Do not include action items.**

### 4. Verification & Output
- **Verify**: Ensure timestamps match the transcript and all key claims are grounded in the source.
- **Output**: Save the digest to `digest/media/[platform]-[slug]-digest-YYYYMMDD.md`.
- **Naming**: Use kebab-case for the slug and ensure the `YYYYMMDD` date suffix is present.

## </instructions>

## <constraints>
- **No Hallucination**: Only include insights and quotes directly supported by the transcript or metadata.
- **No Action Items**: Focus strictly on synthesis and analysis of the content itself.
- **Token Efficiency**: Use parallel tool calls for metadata fetching and speaker research.
- **Privacy**: Delete any temporary audio files or extracted frames after the digest is generated.
- **Source Transparency**: When using secondary sources (GitHub, web summaries) instead of a direct transcript, document all sources in the digest footer under a "Sources" section.
</constraints>

## <workflow_checklist>
- [ ] **Step 0**: Detect network environment; if YouTube-blocked, use Secondary Source Fallback.
- [ ] Detect platform and fetch metadata.
- [ ] Research speaker/author background.
- [ ] Extract transcript or frames (based on duration); use fallback cascade if blocked.
- [ ] Segment content and identify key insights.
- [ ] Format output using `templates/default.md`.
- [ ] Verify accuracy and naming conventions.
- [ ] If fallback sources used, add "Sources" footer to digest.
</workflow_checklist>

## Resources

### references/platforms.md
Adapters and extraction logic for YouTube, Bilibili, Spotify, Apple Podcasts, and 小宇宙FM.

### references/transcription-guide.md
Detailed guide for using `youtube-transcript-api`, OpenAI Whisper API, and local `whisper-cpp`.

### references/short-form-video.md
Frame extraction and spatial analysis methodology for videos under 60 seconds.

### templates/default.md
Standard markdown template for all media digests, including metadata, TL;DR, and critical evaluation.

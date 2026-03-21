---
name: media-digest
description: Transform video and audio content (YouTube, Podcasts, Bilibili) into structured learning digests. Supports short-form video analysis and automated transcription.
---

# Media Digest

## Overview

This skill enables Gemini CLI to systematically process video and audio content, extracting high-signal insights and generating structured digests. It handles long-form content (YouTube, Podcasts) via transcription and short-form content (<1 min) via frame-based spatial analysis.

## <instructions>

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
- Generate personalized action items categorized by priority (P0/P1/P2).
- Format the output using `templates/default.md`.

### 4. Verification & Output
- **Verify**: Ensure timestamps match the transcript and action items are specific/actionable.
- **Output**: Save the digest to `digest/media/[platform]-[slug]-digest-YYYYMMDD.md`.
- **Naming**: Use kebab-case for the slug and ensure the `YYYYMMDD` date suffix is present.

## </instructions>

## <constraints>
- **No Hallucination**: Only include insights and quotes directly supported by the transcript or metadata.
- **Token Efficiency**: Use parallel tool calls for metadata fetching and speaker research.
- **Privacy**: Delete any temporary audio files or extracted frames after the digest is generated.
- **Compliance**: Follow the "Vibe Coding" aesthetic for visual descriptions in short-form analysis.
</constraints>

## <workflow_checklist>
- [ ] Detect platform and fetch metadata.
- [ ] Research speaker/author background.
- [ ] Extract transcript or frames (based on duration).
- [ ] Segment content and identify key insights.
- [ ] Generate action items and references.
- [ ] Format output using `templates/default.md`.
- [ ] Verify accuracy and naming conventions.
</workflow_checklist>

## Resources

### references/platforms.md
Adapters and extraction logic for YouTube, Bilibili, Spotify, Apple Podcasts, and 小宇宙FM.

### references/transcription-guide.md
Detailed guide for using `youtube-transcript-api`, OpenAI Whisper API, and local `whisper-cpp`.

### references/short-form-video.md
Frame extraction and spatial analysis methodology for videos under 60 seconds.

### templates/default.md
Standard markdown template for all media digests, including metadata, TL;DR, and action items.

## Dependencies
- `yt-dlp` (Homebrew) for metadata and media extraction.
- `ffmpeg` (Homebrew) for audio processing and frame extraction.
- `whisper-cpp` or `openai` (Whisper API) for transcription.
- `youtube-transcript-api` (Pip) for YouTube transcripts.

# Transcription Methods Guide

Detailed guide for extracting audio and generating transcripts from various platforms.

---

## Quick Reference: Transcript Availability

| Platform | Native Transcript | Audio Downloadable | Recommended Method |
|----------|-------------------|-------------------|-------------------|
| **YouTube** | ✅ Often available | ✅ Via yt-dlp | 1. youtube-transcript-api → 2. yt-dlp captions → 3. Whisper |
| **Bilibili** | ✅ Some videos | ✅ Via yt-dlp | 1. Bilibili API subtitles → 2. Whisper |
| **Spotify** | ⚠️ Limited | ❌ Protected | 1. Check Spotify transcript → 2. External recording |
| **Apple Podcasts** | ⚠️ Limited | ✅ Via RSS feed | 1. Apple transcript → 2. RSS audio → Whisper |
| **小宇宙FM** | ❌ No API | ✅ Direct URL | 1. Download audio → 2. Whisper |
| **Generic** | ❌ N/A | Varies | Download → Whisper |

---

## Network-Restricted Environments (Sandbox / CI)

When running inside a sandboxed environment (e.g., Anthropic's Claude Code web sessions), the egress traffic is filtered by a JWT proxy that enforces a per-request allowed-hosts list. YouTube, Invidious, and most media CDNs are **not** in that list, so all direct-access methods silently fail with `Tunnel connection failed: 403 Forbidden`.

### 403 Error Taxonomy

Understanding the error type determines the correct response:

| Error Pattern | Symptom | Root Cause | Correct Action |
|---|---|---|---|
| `Tunnel connection failed: 403` | yt-dlp / urllib / WebFetch fails before any content is received | Host blocked by JWT egress proxy | Skip entirely; use Secondary Source Fallback |
| HTTP 403 from target | WebFetch returns 403 *with* a response body (HTML) | Target server rejects cloud-provider IPs (bot-detection) | Try different source; snippets from WebSearch still work |
| `[Errno -3] Temporary failure in name resolution` | DNS lookup fails | Fully isolated network; proxy-only | All direct TCP connections fail; only proxy-allowed hosts work |

### Always-Accessible in Anthropic Sandboxes

| Host | Accessible | Notes |
|---|---|---|
| `api.github.com` | ✅ | Issues, PRs, code search — all endpoints |
| `github.com` | ✅ | Web pages and raw content |
| `raw.githubusercontent.com` | ✅ | Raw file content |
| `*.googleapis.com` | ✅ | YouTube Data API *metadata only* (requires `YOUTUBE_API_KEY`) |
| WebSearch tool | ✅ | Uses Anthropic infrastructure; bypasses system proxy |
| `youtube.com` / `youtu.be` | ❌ | Proxy-blocked |
| Invidious instances (inv.nadeko.net, yewtu.be, etc.) | ❌ | Only 3 public instances exist as of 2026; all block cloud IPs |
| Piped API | ❌ | Same cloud-IP blocking as Invidious |
| `podscripts.co`, most transcript aggregators | ⚠️ | WebFetch 403 (bot-detection), but WebSearch **snippets** are usable |

### GitHub API Search — Best YouTube Fallback

Translation projects, archival repos, and fan communities regularly post full timestamped chapter breakdowns in GitHub issues and PRs. Searching by video ID reliably surfaces these:

```bash
VIDEO_ID="kwSVtQ7dziU"

# Search issues and PRs
curl -s "https://api.github.com/search/issues?q=${VIDEO_ID}&sort=relevance&per_page=5" \
  -H "Accept: application/vnd.github+json" | \
  python3 -c "
import json, sys
d = json.load(sys.stdin)
for i in d.get('items', []):
    print('TITLE:', i['title'])
    print('URL:  ', i['html_url'])
    print('BODY:\n', (i.get('body') or '')[:1000])
    print('---')
"

# Also check PR file diffs (often contain chapter content inline)
# GET https://api.github.com/repos/{owner}/{repo}/pulls/{number}/files
```

**Why this works**: Korean, Chinese, and Japanese YouTube archival communities maintain GitHub repos where they translate popular tech/science episodes. These translation PRs often include the full English chapter outline or transcript in the PR description or diff.

### Recommended Fallback Order (YouTube, Sandbox)

```
1. WebSearch "VIDEO_ID"                    → get title + snippets
2. api.github.com/search/issues?q=VIDEO_ID → full chapter content
3. WebSearch "[title] transcript"          → snippet extracts from aggregators
4. WebSearch "[title] summary"             → blog posts, newsletters
5. YouTube Data API (metadata only)        → if YOUTUBE_API_KEY is set
6. Synthesize from retrieved context       → document all sources in digest footer
```

---

## Method 1: Platform-Native Transcripts

### YouTube (Best Support)

**Option A: youtube-transcript-api (Recommended)**

```bash
# Install
pip install youtube-transcript-api

# Python usage
```

```python
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from youtube_transcript_api.formatters import TextFormatter, JSONFormatter

def get_youtube_transcript(video_id, languages=['en', 'zh-Hans', 'zh-Hant']):
    """
    Get transcript from YouTube video.

    Args:
        video_id: YouTube video ID (e.g., 'dQw4w9WgXcQ')
        languages: List of preferred languages in order

    Returns:
        dict with 'text', 'segments', 'language', 'is_generated'
    """
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id)

        # Try to find manually created transcript first
        try:
            transcript = transcript_list.find_manually_created_transcript(languages)
            is_generated = False
        except:
            transcript = transcript_list.find_generated_transcript(languages)
            is_generated = True

        # Fetch the transcript
        data = transcript.fetch()

        # Format output
        formatter = TextFormatter()
        full_text = formatter.format_transcript(data)

        return {
            'segments': [
                {'start': seg.start, 'end': seg.start + seg.duration, 'text': seg.text}
                for seg in data
            ],
            'full_text': full_text,
            'language': transcript.language_code,
            'is_generated': is_generated
        }

    except TranscriptsDisabled:
        return {'error': 'Transcripts disabled for this video'}
    except NoTranscriptFound:
        return {'error': 'No transcript found in requested languages'}
    except Exception as e:
        return {'error': str(e)}
```

**Option B: yt-dlp subtitles**

```bash
# Download auto-generated subtitles
yt-dlp --write-auto-sub --sub-lang "en,zh-Hans" --skip-download -o "%(id)s" "URL"

# Download manual subtitles only
yt-dlp --write-sub --sub-lang "en,zh-Hans" --skip-download -o "%(id)s" "URL"

# List available subtitles
yt-dlp --list-subs "URL"
```

### Bilibili

```python
import requests

def get_bilibili_transcript(bvid):
    """
    Get transcript from Bilibili video.

    Args:
        bvid: Bilibili video ID (e.g., 'BV1xx411c7mD')

    Returns:
        dict with transcript data or error
    """
    # Get video info
    info_url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
    headers = {'User-Agent': 'Mozilla/5.0'}

    try:
        info_resp = requests.get(info_url, headers=headers)
        info = info_resp.json()

        if info['code'] != 0:
            return {'error': f"API error: {info.get('message', 'Unknown')}"}

        cid = info['data']['cid']
        aid = info['data']['aid']

        # Get subtitle info
        subtitle_url = f"https://api.bilibili.com/x/player/v2?bvid={bvid}&cid={cid}"
        sub_resp = requests.get(subtitle_url, headers=headers)
        sub_info = sub_resp.json()

        subtitles = sub_info.get('data', {}).get('subtitle', {}).get('subtitles', [])

        if not subtitles:
            return {'error': 'No subtitles available', 'has_subtitles': False}

        # Download first available subtitle
        subtitle_url = 'https:' + subtitles[0]['subtitle_url']
        sub_content = requests.get(subtitle_url, headers=headers).json()

        # Format output
        segments = []
        full_text_parts = []

        for item in sub_content.get('body', []):
            segments.append({
                'start': item['from'],
                'end': item['to'],
                'text': item['content']
            })
            full_text_parts.append(item['content'])

        return {
            'segments': segments,
            'full_text': '\n'.join(full_text_parts),
            'language': subtitles[0].get('lan', 'unknown'),
            'is_generated': subtitles[0].get('ai_type', 0) > 0
        }

    except Exception as e:
        return {'error': str(e)}
```

---

## Method 2: Audio Download + Whisper Transcription

**This is the PRIMARY method for platforms without native transcripts (小宇宙FM, most podcasts).**

### Step 1: Download Audio

#### 小宇宙FM (xiaoyuzhoufm.com)

```python
import requests
import re

def get_xiaoyuzhou_audio(episode_url):
    """
    Extract audio URL from 小宇宙FM episode page.

    Args:
        episode_url: Full episode URL (e.g., 'https://www.xiaoyuzhoufm.com/episode/xxx')

    Returns:
        dict with audio_url, title, and metadata
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }

    try:
        response = requests.get(episode_url, headers=headers)
        html = response.text

        # Extract audio URL
        audio_match = re.search(r'https://media\.xyzcdn\.net/[^"]+\.m4a', html)
        if not audio_match:
            return {'error': 'Could not find audio URL'}

        audio_url = audio_match.group(0)

        # Extract metadata from page
        title_match = re.search(r'"title":"([^"]+)"', html)
        duration_match = re.search(r'"duration":(\d+)', html)

        return {
            'audio_url': audio_url,
            'title': title_match.group(1) if title_match else 'Unknown',
            'duration_seconds': int(duration_match.group(1)) if duration_match else None,
            'format': 'm4a'
        }

    except Exception as e:
        return {'error': str(e)}


def download_audio(audio_url, output_path):
    """Download audio file from URL."""
    import subprocess

    # Use curl for reliable download
    result = subprocess.run([
        'curl', '-L', '-o', output_path,
        '-H', 'User-Agent: Mozilla/5.0',
        audio_url
    ], capture_output=True, text=True)

    return result.returncode == 0
```

**Command line approach:**

```bash
# Extract audio URL from xiaoyuzhou page
AUDIO_URL=$(curl -s "https://www.xiaoyuzhoufm.com/episode/EPISODE_ID" | grep -oE 'https://media\.xyzcdn\.net/[^"]+\.m4a' | head -1)

# Download audio
curl -L -o episode.m4a "$AUDIO_URL"
```

#### Generic Podcast (via RSS)

```python
import feedparser
import requests

def get_podcast_audio_from_rss(rss_url, episode_title=None, episode_index=0):
    """
    Get podcast audio URL from RSS feed.

    Args:
        rss_url: RSS feed URL
        episode_title: Optional title to search for
        episode_index: Episode index if no title provided (0 = latest)

    Returns:
        dict with audio_url and episode info
    """
    feed = feedparser.parse(rss_url)

    if episode_title:
        for entry in feed.entries:
            if episode_title.lower() in entry.title.lower():
                for link in entry.links:
                    if 'audio' in link.get('type', '') or link.href.endswith(('.mp3', '.m4a')):
                        return {
                            'audio_url': link.href,
                            'title': entry.title,
                            'published': entry.get('published', ''),
                            'duration': entry.get('itunes_duration', '')
                        }
    else:
        entry = feed.entries[episode_index]
        for link in entry.links:
            if 'audio' in link.get('type', '') or link.href.endswith(('.mp3', '.m4a')):
                return {
                    'audio_url': link.href,
                    'title': entry.title,
                    'published': entry.get('published', ''),
                    'duration': entry.get('itunes_duration', '')
                }

    return {'error': 'No audio URL found'}
```

### Step 2: Transcribe with Whisper

#### Option A: OpenAI Whisper API (Recommended - No Local Setup)

```python
import os
from openai import OpenAI

def transcribe_with_openai(audio_path, language=None):
    """
    Transcribe audio using OpenAI's Whisper API.

    Requirements:
        - OPENAI_API_KEY environment variable
        - File size limit: 25MB
        - Supported formats: mp3, mp4, m4a, wav, webm

    Args:
        audio_path: Path to audio file
        language: ISO-639-1 code (e.g., 'zh' for Chinese, 'en' for English)
                  If None, auto-detects language

    Returns:
        dict with transcript text and metadata
    """
    client = OpenAI()

    with open(audio_path, 'rb') as audio_file:
        params = {
            'model': 'whisper-1',
            'file': audio_file,
            'response_format': 'verbose_json',  # Includes timestamps
        }

        if language:
            params['language'] = language

        response = client.audio.transcriptions.create(**params)

    return {
        'full_text': response.text,
        'language': response.language,
        'duration': response.duration,
        'segments': [
            {
                'start': seg.start,
                'end': seg.end,
                'text': seg.text
            }
            for seg in response.segments
        ] if hasattr(response, 'segments') else []
    }
```

**Handling Large Files (>25MB):**

```python
import subprocess
import os
import math

def split_audio_for_api(audio_path, max_duration_minutes=20):
    """
    Split large audio files into chunks for API processing.

    Args:
        audio_path: Path to audio file
        max_duration_minutes: Maximum chunk duration

    Returns:
        List of chunk file paths
    """
    # Get duration
    result = subprocess.run([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', audio_path
    ], capture_output=True, text=True)

    duration = float(result.stdout.strip())
    chunk_duration = max_duration_minutes * 60

    if duration <= chunk_duration:
        return [audio_path]

    # Split into chunks
    num_chunks = math.ceil(duration / chunk_duration)
    chunks = []
    base_name = os.path.splitext(audio_path)[0]

    for i in range(num_chunks):
        start = i * chunk_duration
        chunk_path = f"{base_name}_chunk{i:03d}.mp3"

        subprocess.run([
            'ffmpeg', '-y', '-i', audio_path,
            '-ss', str(start), '-t', str(chunk_duration),
            '-acodec', 'libmp3lame', '-q:a', '4',
            chunk_path
        ], capture_output=True)

        chunks.append(chunk_path)

    return chunks


def transcribe_large_file(audio_path, language=None):
    """Transcribe large audio files by splitting into chunks."""
    chunks = split_audio_for_api(audio_path)

    all_segments = []
    full_text_parts = []
    offset = 0

    for chunk in chunks:
        result = transcribe_with_openai(chunk, language)

        # Adjust timestamps for offset
        for seg in result.get('segments', []):
            seg['start'] += offset
            seg['end'] += offset
            all_segments.append(seg)

        full_text_parts.append(result['full_text'])

        # Update offset for next chunk
        if result.get('duration'):
            offset += result['duration']

        # Clean up chunk file if it's not the original
        if chunk != audio_path:
            os.remove(chunk)

    return {
        'full_text': ' '.join(full_text_parts),
        'segments': all_segments,
        'language': result.get('language', 'unknown')
    }
```

#### Option B: Local Whisper (whisper.cpp)

```bash
# Install via Homebrew
brew install whisper-cpp ffmpeg

# Download model (choose: tiny, base, small, medium, large)
# For Chinese, use at least 'small' model
whisper-cpp-download-ggml-model medium

# Convert audio to WAV (required format)
ffmpeg -i episode.m4a -ar 16000 -ac 1 -c:a pcm_s16le episode.wav

# Transcribe
whisper-cpp -m /path/to/ggml-medium.bin -l zh -otxt -osrt episode.wav

# Output files: episode.txt (plain text), episode.srt (with timestamps)
```

**Model Selection for Chinese:**

| Model | Size | Chinese Quality | Speed | Recommendation |
|-------|------|-----------------|-------|----------------|
| tiny | 75 MB | Poor | Fastest | Not for Chinese |
| base | 142 MB | Fair | Fast | Quick preview only |
| small | 466 MB | Good | Medium | Acceptable for clear audio |
| medium | 1.5 GB | Very Good | Slow | **Recommended for Chinese** |
| large | 2.9 GB | Best | Slowest | Best accuracy, slow |

#### Option C: Local Whisper (Python)

```bash
# Install
pip install openai-whisper

# Requires ffmpeg
brew install ffmpeg
```

```python
import whisper

def transcribe_local(audio_path, model_size='medium', language=None):
    """
    Transcribe using local Whisper model.

    Args:
        audio_path: Path to audio file
        model_size: 'tiny', 'base', 'small', 'medium', 'large'
        language: ISO code or None for auto-detect

    Returns:
        dict with transcript and segments
    """
    model = whisper.load_model(model_size)

    result = model.transcribe(
        audio_path,
        language=language,
        verbose=True
    )

    return {
        'full_text': result['text'],
        'language': result['language'],
        'segments': [
            {
                'start': seg['start'],
                'end': seg['end'],
                'text': seg['text']
            }
            for seg in result['segments']
        ]
    }
```

---

## Method 3: External Transcription Services

For users who prefer web-based tools or don't want to set up local tools:

### Chinese-Focused Services

| Service | URL | Best For | Notes |
|---------|-----|----------|-------|
| **通义听悟** | tingwu.aliyun.com | Chinese podcasts | Free tier, excellent for Mandarin |
| **讯飞听见** | iflyrec.com | Chinese audio | Industry leader for Chinese ASR |
| **飞书妙记** | feishu.cn | Meeting recordings | Integrated with Feishu/Lark |

### International Services

| Service | URL | Best For | Notes |
|---------|-----|----------|-------|
| **Otter.ai** | otter.ai | English podcasts | Good free tier |
| **AssemblyAI** | assemblyai.com | API integration | Supports Chinese |
| **Rev.com** | rev.com | High accuracy | Paid service |

---

## Complete Workflow Example: 小宇宙FM Episode

```python
#!/usr/bin/env python3
"""
Complete workflow to transcribe a 小宇宙FM episode.

Requirements:
    pip install requests openai

    Set OPENAI_API_KEY environment variable
"""

import os
import re
import requests
import tempfile
from openai import OpenAI

def process_xiaoyuzhou_episode(episode_url):
    """
    Download and transcribe a 小宇宙FM episode.

    Args:
        episode_url: Full episode URL

    Returns:
        dict with metadata and transcript
    """
    print(f"Processing: {episode_url}")

    # Step 1: Fetch page and extract audio URL
    print("Step 1: Fetching episode page...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(episode_url, headers=headers)
    html = response.text

    audio_match = re.search(r'https://media\.xyzcdn\.net/[^"]+\.m4a', html)
    if not audio_match:
        raise ValueError("Could not find audio URL")

    audio_url = audio_match.group(0)

    # Extract metadata
    title_match = re.search(r'"title":"([^"]+)"', html)
    title = title_match.group(1) if title_match else 'Unknown'

    print(f"  Title: {title}")
    print(f"  Audio: {audio_url}")

    # Step 2: Download audio
    print("Step 2: Downloading audio...")
    with tempfile.NamedTemporaryFile(suffix='.m4a', delete=False) as tmp:
        audio_path = tmp.name

    audio_response = requests.get(audio_url, headers=headers, stream=True)
    with open(audio_path, 'wb') as f:
        for chunk in audio_response.iter_content(chunk_size=8192):
            f.write(chunk)

    file_size = os.path.getsize(audio_path)
    print(f"  Downloaded: {file_size / 1024 / 1024:.1f} MB")

    # Step 3: Transcribe with OpenAI Whisper API
    print("Step 3: Transcribing with Whisper...")

    # Check file size (API limit is 25MB)
    if file_size > 25 * 1024 * 1024:
        print("  File too large, would need to split (not implemented in example)")
        # In production, use split_audio_for_api() function

    client = OpenAI()

    with open(audio_path, 'rb') as audio_file:
        transcript = client.audio.transcriptions.create(
            model='whisper-1',
            file=audio_file,
            language='zh',  # Specify Chinese for better accuracy
            response_format='verbose_json'
        )

    # Clean up
    os.remove(audio_path)

    print(f"  Transcription complete: {len(transcript.text)} characters")

    return {
        'title': title,
        'url': episode_url,
        'audio_url': audio_url,
        'transcript': {
            'full_text': transcript.text,
            'language': transcript.language,
            'duration': transcript.duration,
            'segments': [
                {'start': s.start, 'end': s.end, 'text': s.text}
                for s in transcript.segments
            ] if hasattr(transcript, 'segments') else []
        }
    }


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python transcribe_xiaoyuzhou.py <episode_url>")
        sys.exit(1)

    result = process_xiaoyuzhou_episode(sys.argv[1])

    # Save transcript
    output_file = 'transcript.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(result['transcript']['full_text'])

    print(f"\nTranscript saved to {output_file}")
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No transcript found" | Video has no captions | Use Whisper transcription |
| "File too large" | API limit exceeded | Split audio into chunks |
| "Rate limit" | Too many API calls | Add delays, use local Whisper |
| "Poor accuracy" | Wrong language model | Specify language explicitly |
| "Audio download failed" | Region/authentication | Try VPN, check cookies |

### Chinese-Specific Tips

1. **Always specify `language='zh'`** when using Whisper for Chinese content
2. **Use medium or large model** for better Chinese accuracy
3. **Code-switching** (Chinese + English): Let auto-detect handle it
4. **Traditional vs Simplified**: Whisper outputs based on audio, may need post-processing

---

## Cost Considerations

### OpenAI Whisper API
- $0.006 per minute
- 2-hour podcast = ~$0.72
- No local hardware required

### Local Whisper
- Free (after hardware)
- Requires GPU for reasonable speed
- Medium model: ~5GB VRAM

### External Services
- 通义听悟: Free tier available
- AssemblyAI: $0.00025 per second (~$0.90/hour)

---

*Last updated: 2026-01-03*

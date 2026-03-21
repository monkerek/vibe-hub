# Platform Adapters Reference

Detailed documentation for extracting content from each supported platform.

---

## YouTube

### URL Patterns
```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://www.youtube.com/live/VIDEO_ID
```

### Extract Video ID
```python
import re

def extract_youtube_id(url):
    patterns = [
        r'(?:v=|/)([0-9A-Za-z_-]{11}).*',
        r'(?:embed/)([0-9A-Za-z_-]{11})',
        r'(?:shorts/)([0-9A-Za-z_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None
```

### Get Metadata
```bash
# Using yt-dlp
yt-dlp --dump-json "URL" | jq '{
  title: .title,
  author: .uploader,
  duration: .duration_string,
  publish_date: .upload_date,
  description: .description,
  thumbnail: .thumbnail
}'
```

### Get Transcript
```bash
# Method 1: yt-dlp (downloads subtitle file)
yt-dlp --write-auto-sub --sub-lang en,zh-Hans --skip-download -o "%(id)s" "URL"

# Method 2: youtube-transcript-api (Python, direct access)
from youtube_transcript_api import YouTubeTranscriptApi

# Get available languages
transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

# Get transcript (try manual first, then auto-generated)
try:
    transcript = transcript_list.find_manually_created_transcript(['en', 'zh-Hans'])
except:
    transcript = transcript_list.find_generated_transcript(['en', 'zh-Hans'])

# Fetch the actual transcript
data = transcript.fetch()
# Returns: [{'text': '...', 'start': 0.0, 'duration': 2.5}, ...]
```

### Language Support
- Manual captions: Depends on creator
- Auto-generated: English, Spanish, Portuguese, German, French, Italian, Dutch, Russian, Japanese, Korean, Chinese (Simplified)

---

## Bilibili (哔哩哔哩)

### URL Patterns
```
https://www.bilibili.com/video/BVxxxxxxxxxx
https://www.bilibili.com/video/avxxxxxxxx
https://b23.tv/xxxxxxx (short URL)
```

### Extract Video ID
```python
import re

def extract_bilibili_id(url):
    # BV format
    bv_match = re.search(r'BV([0-9A-Za-z]{10})', url)
    if bv_match:
        return ('bv', 'BV' + bv_match.group(1))

    # AV format
    av_match = re.search(r'av(\d+)', url)
    if av_match:
        return ('av', av_match.group(1))

    # Short URL - need to follow redirect
    if 'b23.tv' in url:
        # Follow redirect to get actual URL
        pass

    return None
```

### Get Metadata
```bash
# Using yt-dlp (supports Bilibili)
yt-dlp --dump-json "https://bilibili.com/video/BVxxx" | jq '{
  title: .title,
  author: .uploader,
  duration: .duration_string,
  publish_date: .upload_date,
  description: .description
}'
```

### Get Transcript/Subtitles
```python
import requests

def get_bilibili_subtitles(bvid):
    # Get video info first
    info_url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
    info = requests.get(info_url).json()
    cid = info['data']['cid']

    # Get subtitle list
    subtitle_url = f"https://api.bilibili.com/x/player/v2?bvid={bvid}&cid={cid}"
    subtitle_info = requests.get(subtitle_url).json()

    # Download subtitle if available
    subtitles = subtitle_info['data']['subtitle']['subtitles']
    if subtitles:
        subtitle_url = 'https:' + subtitles[0]['subtitle_url']
        return requests.get(subtitle_url).json()

    return None
```

### Notes
- Many videos have CC subtitles (especially educational content)
- Some videos require login for subtitles
- AI-generated subtitles are common for newer content

---

## Spotify

### URL Patterns
```
https://open.spotify.com/episode/EPISODE_ID
https://open.spotify.com/show/SHOW_ID
```

### Extract Episode ID
```python
import re

def extract_spotify_id(url):
    match = re.search(r'episode/([a-zA-Z0-9]{22})', url)
    if match:
        return match.group(1)
    return None
```

### Get Metadata
```python
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials())

episode = sp.episode(episode_id)
metadata = {
    'title': episode['name'],
    'author': episode['show']['name'],
    'duration': episode['duration_ms'] // 1000,
    'publish_date': episode['release_date'],
    'description': episode['description'],
}
```

### Get Transcript
- Spotify provides transcripts for some podcasts (visible in app)
- API access to transcripts is limited
- **Fallback**: Download audio via spotdl or similar, transcribe with Whisper

```bash
# Download audio (requires spotdl)
spotdl "spotify_url"

# Transcribe with Whisper
whisper audio.mp3 --model medium --language auto
```

---

## Apple Podcasts

### URL Patterns
```
https://podcasts.apple.com/us/podcast/SHOW_NAME/idSHOW_ID?i=EPISODE_ID
https://podcasts.apple.com/podcast/idSHOW_ID
```

### Get Metadata
```python
import requests

def get_apple_podcast_info(podcast_id, episode_id=None):
    url = f"https://itunes.apple.com/lookup?id={podcast_id}&entity=podcastEpisode"
    response = requests.get(url).json()

    if episode_id:
        # Find specific episode
        for item in response['results']:
            if str(item.get('trackId')) == episode_id:
                return item

    return response['results']
```

### Get Transcript
- Apple provides transcripts for many podcasts (iOS 17+)
- No public API for transcripts
- **Fallback**: Get RSS feed → download audio → Whisper transcription

```python
import feedparser

def get_podcast_audio_url(rss_url, episode_title):
    feed = feedparser.parse(rss_url)
    for entry in feed.entries:
        if episode_title.lower() in entry.title.lower():
            for link in entry.links:
                if 'audio' in link.get('type', ''):
                    return link.href
    return None
```

---

## 小宇宙FM (xiaoyuzhoufm.com)

### URL Patterns
```
https://www.xiaoyuzhoufm.com/episode/EPISODE_ID
https://www.xiaoyuzhoufm.com/podcast/PODCAST_ID
```

### Extract Episode ID
```python
import re

def extract_xiaoyuzhou_id(url):
    match = re.search(r'episode/([a-f0-9]{24})', url)
    if match:
        return match.group(1)
    return None
```

### Get Metadata & Transcript
```python
import requests

def get_xiaoyuzhou_episode(episode_id):
    # API endpoint (unofficial)
    url = f"https://www.xiaoyuzhoufm.com/episode/{episode_id}"

    # Parse page for JSON-LD or API call
    # 小宇宙 embeds episode data in page

    # Many episodes have user-contributed transcripts
    # Check for shownotes which often contain summaries
    pass
```

### Notes
- Many episodes have detailed shownotes (替代 transcript)
- Some episodes have community-contributed transcripts
- Chinese language primary
- **Fallback**: Download audio, transcribe with Whisper

---

## Generic / Fallback Method

For unsupported platforms or when platform-specific methods fail:

### Step 1: Download Audio
```bash
# yt-dlp supports many platforms
yt-dlp -x --audio-format mp3 -o "audio.mp3" "URL"

# Or use direct download if URL is a media file
curl -o audio.mp3 "DIRECT_AUDIO_URL"
```

### Step 2: Transcribe with Whisper
```bash
# Local Whisper
whisper audio.mp3 --model medium --language auto --output_format json

# Or use OpenAI Whisper API
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F model="whisper-1" \
  -F file="@audio.mp3"
```

### Step 3: Parse Output
```python
import json

with open('audio.json', 'r') as f:
    data = json.load(f)

transcript = {
    'full_text': data['text'],
    'segments': [
        {
            'start': seg['start'],
            'end': seg['end'],
            'text': seg['text']
        }
        for seg in data['segments']
    ],
    'language': data['language']
}
```

---

## Adding New Platforms

To add support for a new platform:

1. **Add URL pattern** to `detect_platform()` in SKILL.md
2. **Create adapter** with these functions:
   - `extract_id(url)` - Extract content ID from URL
   - `get_metadata(id)` - Fetch title, author, duration, etc.
   - `get_transcript(id)` - Fetch or generate transcript
3. **Test** with sample content
4. **Document** in this file

### Template for New Platform

```python
class NewPlatformAdapter:
    URL_PATTERNS = ['newplatform.com/video/']

    @staticmethod
    def extract_id(url):
        """Extract video/episode ID from URL"""
        pass

    @staticmethod
    def get_metadata(content_id):
        """Fetch metadata: title, author, duration, etc."""
        pass

    @staticmethod
    def get_transcript(content_id):
        """Fetch or generate transcript"""
        pass
```

---

## Rate Limits & Best Practices

| Platform | Rate Limit | Notes |
|----------|------------|-------|
| YouTube | ~100 req/day (unofficial) | Use API key for higher limits |
| Bilibili | ~60 req/min | Be respectful |
| Spotify | Varies by endpoint | Use official API |
| Apple | No strict limit | Use iTunes API |
| 小宇宙 | Unknown | Be conservative |

### Best Practices
- Cache metadata and transcripts locally
- Don't hammer APIs; add delays between requests
- Respect robots.txt and ToS
- Store downloaded audio temporarily, delete after transcription
- Handle errors gracefully; always have fallback to Whisper

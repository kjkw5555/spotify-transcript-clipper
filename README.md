# Spotify Transcript Clipper

> [日本語版はこちら](README.ja.md)

A Chrome extension that extracts transcripts from Spotify's "Read While Listening" panel and copies them to your clipboard.

## Features

- One-click transcript extraction from the "Read While Listening" panel
- Displays transcript with highlighted timestamps in a popup
- Copy full transcript to clipboard

## Installation

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode**
4. Click **"Load unpacked"**
5. Select this directory

## Usage

1. Open a podcast on Spotify Web (`open.spotify.com`)
2. Open the "Read While Listening" panel on the right side
3. Click the extension icon in the toolbar
4. Press **"Extract Transcript"**
5. Review the transcript and click **"Copy"**

## Architecture

```
popup.js  →  chrome.tabs.sendMessage({ action: 'extract' })  →  content.js
                                                                      ↓
popup.js  ←  sendResponse({ success, transcript, lineCount })  ←
```

| File | Role |
|---|---|
| `content.js` | Injected into Spotify pages. Scrapes transcript from the DOM |
| `popup.js` | Popup UI. Sends messages to content.js and handles clipboard copy |
| `popup.html` | Popup UI markup with inline CSS (no build step required) |
| `manifest.json` | Manifest V3 configuration |

## Caveats

- May break if Spotify changes its DOM structure
- Main breakage points: `aside.NowPlayingView` selector and the timestamp-button detection heuristic

## Permissions

| Permission | Purpose |
|---|---|
| `activeTab` | Access the active tab |
| `scripting` | Run content scripts |
| `clipboardWrite` | Write to clipboard |
| `https://open.spotify.com/*` | Restrict host access to Spotify only |

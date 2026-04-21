# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension (Manifest V3) that extracts podcast transcripts from Spotify's "聴きながら読む" (Read While Listening) panel and copies them to the clipboard.

## Loading the Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select this directory

After editing any JS file, click the **reload icon** on the extensions page and refresh the Spotify tab.

## Architecture

The extension follows the standard MV3 two-script pattern:

- **`content.js`** — injected into `open.spotify.com` pages; listens for `{ action: 'extract' }` messages, scrolls the right panel to expose the transcript, then scrapes timestamp buttons and text nodes from the DOM
- **`popup.js`** — runs in the popup; queries the active tab, sends a message to `content.js`, renders the transcript with highlighted timestamps, and handles clipboard copy
- **`popup.html`** — self-contained UI with inline CSS (no external build step); styles reference CSS custom properties defined in `:root`

### Message Flow

```
popup.js → chrome.tabs.sendMessage({ action: 'extract' }) → content.js
                                                              ↓
popup.js ← sendResponse({ success, transcript, lineCount }) ←
```

### DOM Scraping Strategy (`content.js`)

The transcript container is located by finding a `<button>` whose text matches `\d+:\d+` (a timestamp), then using its `.parentElement`. Siblings are either timestamp buttons or text nodes. The script scrolls the right panel 800px before scraping to ensure content is loaded.

## Key Constraints

- **No build step** — plain JS/HTML/CSS; edit files directly and reload the extension
- **MV3 permissions** — `scripting`, `activeTab`, `clipboardWrite`; host permission locked to `https://open.spotify.com/*`
- **DOM selectors are fragile** — Spotify can change its class names; `aside.NowPlayingView` and the timestamp-button heuristic are the two main breakage points

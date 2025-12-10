# Daily Tabs Launcher

A Chrome extension (Manifest v3) to open your daily work URLs with one click. Manage groups of URLs, reorder them, and launch all or specific groups from the popup or options page. Preferences sync via `chrome.storage.sync` with automatic fallback to `chrome.storage.local`.

## Features
- Manage groups of URLs (add, rename, delete)
- Add, edit, delete, and reorder URLs within a group (drag-and-drop or buttons)
- Open all saved URLs or a single group in new tabs
- Chrome storage sync with local fallback
- Modern, framework-free UI (Grid/Flexbox)

## Structure
```
manifest.json
assets/icons/
src/
  background.js
  storage.js
  popup.{html,js,css}
  options.{html,js,css}
```

## Install (Load Unpacked)
1. In Chrome, go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the repository root (contains `manifest.json`).

## Usage
- Use the popup to quickly open all saved URLs or a single group.
- Use the options page to manage groups and URLs (add/edit/delete/reorder).
- URLs are validated and normalized to include `https://` if missing.

## Build / Release
- Zip contents for store upload from the repo root. Example (PowerShell):
  - `mkdir build`
  - `Compress-Archive -Path manifest.json, src, assets, PRIVACY_POLICY.md, README.md -DestinationPath build/daily-tabs-launcher-<version>.zip`
- Reload the unpacked extension after changes to test locally.

## Development Notes
- Manifest v3 service worker (`src/background.js`) handles opening URLs.
- Shared storage helpers in `src/storage.js` (sync with local fallback).
- No external dependencies; vanilla JS/CSS.


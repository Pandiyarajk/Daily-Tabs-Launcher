# Daily Tabs Launcher

A Chrome extension (Manifest v3) to open your daily work URLs with one click. Manage groups of URLs, reorder them, and launch all or specific groups from the popup or options page. Preferences sync via `chrome.storage.sync` with automatic fallback to `chrome.storage.local`.

## Features
- Manage groups of URLs (add, rename, delete)
- Add, edit, delete, and reorder URLs within a group (drag-and-drop or buttons)
- Open all groups or a single group in new tabs
- Chrome storage sync with local fallback
- Modern, framework-free UI (Grid/Flexbox)

## Structure
```
extension/
├── manifest.json
├── background.js
├── storage.js
├── popup.html / popup.js / popup.css
├── options.html / options.js / options.css
└── icons/
```

## Install (Load Unpacked)
1. In Chrome, go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder.

## Usage
- Use the popup to quickly open all tabs or a single group.
- Use the options page to manage groups and URLs (add/edit/delete/reorder).
- URLs are validated and normalized to include `https://` if missing.

## Repository / GitHub Setup
- Repo contents live under the `extension/` folder; load that folder when testing in Chrome.
- Suggested default branch: `main`.
- Commit flow example:
  - `git add extension manifest docs`
  - `git commit -m "feat: initial Daily Tabs Launcher extension"`
  - `git tag v1.0.0` (optional for releases)
- Publishing artifacts:
  - For Chrome Web Store: zip the contents of `extension/` (not the parent directory).
  - Include `STORE_LISTING.md` content in the store listing form.

## Development Notes
- Manifest v3 service worker (`background.js`) handles tab opening.
- Shared storage helpers in `storage.js` (sync with local fallback).
- No external dependencies; vanilla JS/CSS.


/* global StorageAPI */
importScripts("storage.js");

async function openUrls(urls) {
  const valid = urls.filter((url) => StorageAPI.isValidUrl(url));
  for (const url of valid) {
    await chrome.tabs.create({ url });
  }
}

async function openAllTabs() {
  const groups = await StorageAPI.ensureDefaults();
  const allUrls = Object.values(groups).flat();
  await openUrls(allUrls);
  return { opened: allUrls.length };
}

async function openGroupTabs(groupName) {
  const groups = await StorageAPI.ensureDefaults();
  const urls = groups[groupName] || [];
  await openUrls(urls);
  return { opened: urls.length };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.action) return;

  const handler = async () => {
    try {
      if (message.action === "openAll") {
        const result = await openAllTabs();
        sendResponse({ success: true, ...result });
      } else if (message.action === "openGroup" && message.groupName) {
        const result = await openGroupTabs(message.groupName);
        sendResponse({ success: true, ...result });
      } else {
        sendResponse({ success: false, error: "Unknown action" });
      }
    } catch (error) {
      sendResponse({ success: false, error: error?.message || "Unexpected error" });
    }
  };

  handler();
  return true; // keep the message channel open for async response
});


(function (global) {
  const STORAGE_KEY = "groups";
  const DEFAULT_GROUPS = {
    "Daily Review": [],
    Planning: [],
    Others: [],
  };

  function getArea(preferred) {
    return preferred === "local" ? chrome.storage.local : chrome.storage.sync;
  }

  function getFrom(area) {
    return new Promise((resolve, reject) => {
      area.get([STORAGE_KEY], (data) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(data[STORAGE_KEY] || {});
      });
    });
  }

  function setTo(area, groups) {
    return new Promise((resolve, reject) => {
      area.set({ [STORAGE_KEY]: groups }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }

  async function getGroups() {
    try {
      return await getFrom(getArea("sync"));
    } catch (_) {
      return await getFrom(getArea("local"));
    }
  }

  async function saveGroups(groups) {
    try {
      await setTo(getArea("sync"), groups);
    } catch (_) {
      await setTo(getArea("local"), groups);
    }
  }

  function ensureUrlHasProtocol(url) {
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  }

  function isValidUrl(url) {
    try {
      const candidate = ensureUrlHasProtocol(url);
      const parsed = new URL(candidate);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function ensureDefaults() {
    const groups = await getGroups();
    if (groups && Object.keys(groups).length > 0) {
      return groups;
    }
    await saveGroups({ ...DEFAULT_GROUPS });
    return { ...DEFAULT_GROUPS };
  }

  async function addGroup(groupName) {
    if (!groupName) return;
    const groups = await ensureDefaults();
    if (!groups[groupName]) {
      groups[groupName] = [];
      await saveGroups(groups);
    }
    return groups;
  }

  async function renameGroup(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    const groups = await ensureDefaults();
    if (!groups[oldName]) return groups;
    if (!groups[newName]) {
      groups[newName] = groups[oldName];
      delete groups[oldName];
      await saveGroups(groups);
    }
    return groups;
  }

  async function deleteGroup(groupName) {
    if (!groupName) return;
    const groups = await ensureDefaults();
    if (groups[groupName]) {
      delete groups[groupName];
      await saveGroups(groups);
    }
    return groups;
  }

  async function addUrlToGroup(groupName, url) {
    const trimmed = url?.trim();
    if (!groupName || !trimmed || !isValidUrl(trimmed)) return;
    const groups = await ensureDefaults();
    groups[groupName] = groups[groupName] || [];
    groups[groupName].push(ensureUrlHasProtocol(trimmed));
    await saveGroups(groups);
    return groups;
  }

  async function updateUrlInGroup(groupName, index, newUrl) {
    const trimmed = newUrl?.trim();
    if (!groupName || trimmed === undefined || !isValidUrl(trimmed)) return;
    const groups = await ensureDefaults();
    if (!groups[groupName] || index < 0 || index >= groups[groupName].length) {
      return groups;
    }
    groups[groupName][index] = ensureUrlHasProtocol(trimmed);
    await saveGroups(groups);
    return groups;
  }

  async function deleteUrlFromGroup(groupName, index) {
    const groups = await ensureDefaults();
    if (!groups[groupName] || index < 0 || index >= groups[groupName].length) {
      return groups;
    }
    groups[groupName].splice(index, 1);
    await saveGroups(groups);
    return groups;
  }

  async function reorderUrlsInGroup(groupName, fromIndex, toIndex) {
    const groups = await ensureDefaults();
    const list = groups[groupName];
    if (!list || fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
      return groups;
    }
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    await saveGroups(groups);
    return groups;
  }

  global.StorageAPI = {
    getGroups,
    saveGroups,
    ensureDefaults,
    addGroup,
    renameGroup,
    deleteGroup,
    addUrlToGroup,
    updateUrlInGroup,
    deleteUrlFromGroup,
    reorderUrlsInGroup,
    isValidUrl,
    ensureUrlHasProtocol,
  };
})(typeof self !== "undefined" ? self : window);


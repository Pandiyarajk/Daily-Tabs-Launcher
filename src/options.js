/* global StorageAPI */

const addGroupForm = document.getElementById("addGroupForm");
const groupNameInput = document.getElementById("groupName");
const groupsList = document.getElementById("groupsList");
const groupSelect = document.getElementById("groupSelect");
const addUrlForm = document.getElementById("addUrlForm");
const urlInput = document.getElementById("urlInput");
const urlsList = document.getElementById("urlsList");
const openAllBtn = document.getElementById("openAll");

const state = {
  groups: {},
  selectedGroup: null,
  dragIndex: null,
};

async function loadGroups() {
  state.groups = await StorageAPI.ensureDefaults();
  if (!state.selectedGroup || !state.groups[state.selectedGroup]) {
    state.selectedGroup = Object.keys(state.groups)[0] || null;
  }
  renderGroups();
  renderGroupSelect();
  renderUrls();
}

function renderGroups() {
  groupsList.innerHTML = "";
  const entries = Object.entries(state.groups);
  if (entries.length === 0) {
    groupsList.innerHTML = `<div class="empty-state">No groups yet.</div>`;
    return;
  }

  entries.forEach(([name, urls]) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const title = document.createElement("div");
    title.className = "title";
    const nameEl = document.createElement("strong");
    nameEl.textContent = name;
    const meta = document.createElement("small");
    meta.textContent = `${urls.length} URL${urls.length === 1 ? "" : "s"}`;
    title.append(nameEl, meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    renameBtn.addEventListener("click", () => handleRenameGroup(name));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handleDeleteGroup(name));

    actions.append(renameBtn, deleteBtn);
    item.append(title, actions);
    groupsList.appendChild(item);
  });
}

function renderGroupSelect() {
  groupSelect.innerHTML = "";
  const names = Object.keys(state.groups);
  if (names.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No groups";
    option.value = "";
    groupSelect.appendChild(option);
    urlInput.disabled = true;
    addUrlForm.querySelector("button").disabled = true;
    return;
  }

  urlInput.disabled = false;
  addUrlForm.querySelector("button").disabled = false;

  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    if (name === state.selectedGroup) {
      option.selected = true;
    }
    groupSelect.appendChild(option);
  });
}

function renderUrls() {
  urlsList.innerHTML = "";
  const groupName = state.selectedGroup;
  const urls = state.groups[groupName] || [];

  if (!groupName || urls.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = groupName ? "No URLs yet." : "Select a group.";
    urlsList.appendChild(empty);
    return;
  }

  urls.forEach((url, index) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.draggable = true;
    item.dataset.index = index;

    item.addEventListener("dragstart", () => {
      state.dragIndex = index;
    });
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    item.addEventListener("drop", () => handleDrop(index));

    const title = document.createElement("div");
    title.className = "title";
    const text = document.createElement("span");
    text.className = "url-text";
    text.textContent = url;
    title.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "actions";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "☰";

    const upBtn = document.createElement("button");
    upBtn.textContent = "Up";
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", () => handleReorder(index, index - 1));

    const downBtn = document.createElement("button");
    downBtn.textContent = "Down";
    downBtn.disabled = index === urls.length - 1;
    downBtn.addEventListener("click", () => handleReorder(index, index + 1));

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => handleEditUrl(index, url));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handleDeleteUrl(index));

    actions.append(dragHandle, upBtn, downBtn, editBtn, deleteBtn);
    item.append(title, actions);
    urlsList.appendChild(item);
  });
}

async function handleAddGroup(event) {
  event.preventDefault();
  const name = groupNameInput.value.trim();
  if (!name) return;
  await StorageAPI.addGroup(name);
  groupNameInput.value = "";
  await loadGroups();
  state.selectedGroup = name;
  renderGroupSelect();
  renderUrls();
}

async function handleRenameGroup(oldName) {
  const newName = prompt("New group name", oldName);
  if (!newName || newName === oldName) return;
  await StorageAPI.renameGroup(oldName, newName.trim());
  if (state.selectedGroup === oldName) state.selectedGroup = newName.trim();
  await loadGroups();
}

async function handleDeleteGroup(name) {
  const confirmDelete = confirm(`Delete group "${name}"?`);
  if (!confirmDelete) return;
  await StorageAPI.deleteGroup(name);
  if (state.selectedGroup === name) {
    state.selectedGroup = Object.keys(state.groups).find((g) => g !== name) || null;
  }
  await loadGroups();
}

async function handleAddUrl(event) {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!url || !state.selectedGroup) return;
  if (!StorageAPI.isValidUrl(url)) {
    alert("Please enter a valid URL (http/https).");
    return;
  }
  await StorageAPI.addUrlToGroup(state.selectedGroup, url);
  urlInput.value = "";
  await loadGroups();
}

async function handleEditUrl(index, currentUrl) {
  const updated = prompt("Edit URL", currentUrl);
  if (!updated || !state.selectedGroup) return;
  if (!StorageAPI.isValidUrl(updated)) {
    alert("Please enter a valid URL (http/https).");
    return;
  }
  await StorageAPI.updateUrlInGroup(state.selectedGroup, index, updated);
  await loadGroups();
}

async function handleDeleteUrl(index) {
  if (!state.selectedGroup) return;
  const confirmDelete = confirm("Delete this URL?");
  if (!confirmDelete) return;
  await StorageAPI.deleteUrlFromGroup(state.selectedGroup, index);
  await loadGroups();
}

async function handleReorder(from, to) {
  if (!state.selectedGroup) return;
  await StorageAPI.reorderUrlsInGroup(state.selectedGroup, from, to);
  await loadGroups();
}

async function handleDrop(targetIndex) {
  if (state.dragIndex === null || targetIndex === state.dragIndex) return;
  await handleReorder(state.dragIndex, targetIndex);
  state.dragIndex = null;
}

function handleGroupSelection(event) {
  state.selectedGroup = event.target.value;
  renderUrls();
}

function openAllTabs() {
  chrome.runtime.sendMessage({ action: "openAll" });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadGroups();
  addGroupForm.addEventListener("submit", handleAddGroup);
  groupSelect.addEventListener("change", handleGroupSelection);
  addUrlForm.addEventListener("submit", handleAddUrl);
  openAllBtn.addEventListener("click", openAllTabs);
});


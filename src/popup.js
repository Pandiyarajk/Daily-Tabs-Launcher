/* global StorageAPI */

const groupsContainer = document.getElementById("groupsContainer");
const openAllBtn = document.getElementById("openAll");
const manageBtn = document.getElementById("manage");

async function renderGroups() {
  const groups = await StorageAPI.ensureDefaults();
  const entries = Object.entries(groups);

  groupsContainer.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No groups yet. Add some in Options.";
    groupsContainer.appendChild(empty);
    return;
  }

  entries.forEach(([name, urls]) => {
    const card = document.createElement("div");
    card.className = "group-card";

    const title = document.createElement("div");
    title.className = "group-title";
    const nameEl = document.createElement("span");
    nameEl.textContent = name;
    const count = document.createElement("small");
    count.textContent = `${urls.length} URL${urls.length === 1 ? "" : "s"}`;
    title.append(nameEl, count);

    const actions = document.createElement("div");
    actions.className = "group-actions";
    const openBtn = document.createElement("button");
    openBtn.className = "primary";
    openBtn.textContent = "Open Group";
    openBtn.addEventListener("click", () => openGroup(name));

    actions.appendChild(openBtn);
    card.append(title, actions);
    groupsContainer.appendChild(card);
  });
}

function openGroup(groupName) {
  chrome.runtime.sendMessage({ action: "openGroup", groupName });
}

function openAll() {
  chrome.runtime.sendMessage({ action: "openAll" });
}

function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderGroups();
  openAllBtn.addEventListener("click", openAll);
  manageBtn.addEventListener("click", openOptions);
});


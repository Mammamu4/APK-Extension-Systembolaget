document.getElementById("sort-button").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "sortProducts" });
});

const autoSortCheckbox = document.getElementById("autoUpdate");

chrome.storage.local.get(["autoSort"], (result) => {
  autoSortCheckbox.checked = result.autoSort || false;
});

autoSortCheckbox.addEventListener("change", (event) => {
  chrome.runtime.sendMessage({ action: "toggleAutoSort" });
});

document.getElementById("sort-button").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "sortProducts" });
});


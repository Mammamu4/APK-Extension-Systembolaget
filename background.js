chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sortProducts") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "sortProducts" });
    });
  }else if (request.action === "toggleAutoSort") {
    chrome.storage.local.get(["autoSort"], (result) => {
      let newValue = !result.autoSort;
      chrome.storage.local.set({ autoSort: newValue });

      sendResponse({ success: true });
    });
    return true;
  }
});


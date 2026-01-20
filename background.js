// X Marks - Background Service Worker

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['cleanView', 'hideVideos'], (result) => {
      sendResponse(result);
    });
    return true;
  }
});

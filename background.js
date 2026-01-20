/**
 * X Marks - Background Service Worker
 * https://github.com/ali-abassi/x-marks
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['cleanView', 'hideVideos'], sendResponse);
    return true;
  }
});

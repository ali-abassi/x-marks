/**
 * X Marks - Popup Script
 * https://github.com/ali-abassi/x-marks
 */

const cleanViewToggle = document.getElementById('cleanView');
const hideVideosToggle = document.getElementById('hideVideos');
const status = document.getElementById('status');

// Load saved settings
chrome.storage.sync.get(['cleanView', 'hideVideos'], (result) => {
  cleanViewToggle.checked = result.cleanView || false;
  hideVideosToggle.checked = result.hideVideos || false;
});

// Save settings and notify content script
function saveSettings() {
  const settings = {
    cleanView: cleanViewToggle.checked,
    hideVideos: hideVideosToggle.checked
  };

  chrome.storage.sync.set(settings, () => {
    // Show saved indicator
    status.classList.add('show');
    setTimeout(() => status.classList.remove('show'), 1500);

    // Notify active X/Twitter tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || '';
      if (url.includes('x.com') || url.includes('twitter.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED', ...settings });
      }
    });
  });
}

cleanViewToggle.addEventListener('change', saveSettings);
hideVideosToggle.addEventListener('change', saveSettings);

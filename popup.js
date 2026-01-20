// X Marks - Popup Script

const cleanViewToggle = document.getElementById('cleanView');
const hideVideosToggle = document.getElementById('hideVideos');
const status = document.getElementById('status');

// Load settings
chrome.storage.sync.get(['cleanView', 'hideVideos'], (result) => {
  cleanViewToggle.checked = result.cleanView || false;
  hideVideosToggle.checked = result.hideVideos || false;
});

function saveSettings() {
  const settings = {
    cleanView: cleanViewToggle.checked,
    hideVideos: hideVideosToggle.checked
  };

  chrome.storage.sync.set(settings, () => {
    status.classList.add('show');
    setTimeout(() => status.classList.remove('show'), 1500);

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes('x.com') || tabs[0]?.url?.includes('twitter.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SETTINGS_UPDATED',
          ...settings
        });
      }
    });
  });
}

cleanViewToggle.addEventListener('change', saveSettings);
hideVideosToggle.addEventListener('change', saveSettings);

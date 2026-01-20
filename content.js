/**
 * X Marks - Content Script
 * https://github.com/ali-abassi/x-marks
 *
 * Runs at document_start to apply settings before content renders.
 */

const settings = {
  cleanView: false,
  hideVideos: false
};

/**
 * Apply CSS classes to document root (runs before body exists)
 */
function applyClasses(element) {
  if (!element) return;
  element.classList.toggle('x-clean-view', settings.cleanView);
  element.classList.toggle('x-hide-videos', settings.hideVideos);
}

/**
 * Override X's 600px max-width constraint on the timeline
 */
function forceTimelineWidth() {
  const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
  if (!primaryColumn) return;

  primaryColumn.querySelectorAll('div').forEach(div => {
    if (getComputedStyle(div).maxWidth === '600px') {
      div.style.maxWidth = '900px';
      div.style.width = '100%';
    }
  });
}

/**
 * Watch for dynamically loaded content
 */
function observeDOM() {
  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (settings.cleanView) forceTimelineWidth();
    }, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Initialize after body is available
 */
function init() {
  applyClasses(document.body);
  if (settings.cleanView) {
    forceTimelineWidth();
    observeDOM();
  }
}

// Load settings and apply immediately
chrome.storage.sync.get(['cleanView', 'hideVideos'], (result) => {
  settings.cleanView = result.cleanView || false;
  settings.hideVideos = result.hideVideos || false;

  // Apply to <html> immediately (body doesn't exist yet)
  applyClasses(document.documentElement);

  // Apply to body when ready
  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
});

// Listen for settings updates from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    settings.cleanView = message.cleanView || false;
    settings.hideVideos = message.hideVideos || false;
    applyClasses(document.documentElement);
    applyClasses(document.body);
    sendResponse({ success: true });
  }
});

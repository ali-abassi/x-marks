// X Marks - Content Script (runs at document_start)

let settings = {
  cleanView: false,
  hideVideos: false
};

// Apply classes immediately to <html> element (body doesn't exist yet at document_start)
function applyClassesEarly() {
  const root = document.documentElement;
  root.classList.toggle('x-clean-view', settings.cleanView);
  root.classList.toggle('x-hide-videos', settings.hideVideos);
}

// Load settings ASAP and apply
chrome.storage.sync.get(['cleanView', 'hideVideos'], (result) => {
  settings.cleanView = result.cleanView || false;
  settings.hideVideos = result.hideVideos || false;
  applyClassesEarly();

  // Also apply to body when it exists
  if (document.body) {
    applyToBody();
  } else {
    document.addEventListener('DOMContentLoaded', applyToBody);
  }
});

function applyToBody() {
  document.body.classList.toggle('x-clean-view', settings.cleanView);
  document.body.classList.toggle('x-hide-videos', settings.hideVideos);

  if (settings.cleanView) {
    forceWidth();
    setupMutationObserver();
  }
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    settings.cleanView = message.cleanView || false;
    settings.hideVideos = message.hideVideos || false;
    applyClassesEarly();
    if (document.body) {
      applyToBody();
    }
    sendResponse({ success: true });
  }
});

// Force width using JS
function forceWidth() {
  const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
  if (!primaryColumn) return;

  const allDivs = primaryColumn.querySelectorAll('div');
  allDivs.forEach(div => {
    const computed = getComputedStyle(div);
    if (computed.maxWidth === '600px') {
      div.style.maxWidth = '900px';
      div.style.width = '100%';
    }
  });
}

// Watch for dynamically loaded content
function setupMutationObserver() {
  let debounceTimer;

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (settings.cleanView) {
        forceWidth();
      }
    }, 100);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

console.log('X Marks loaded');

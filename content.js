/**
 * X Marks - Content Script
 * https://github.com/ali-abassi/x-marks
 */

const settings = {
  cleanView: false,
  hideVideos: false
};

/**
 * Apply CSS classes to element
 */
function applyClasses(element) {
  if (!element) return;
  element.classList.toggle('x-clean-view', settings.cleanView);
  element.classList.toggle('x-hide-videos', settings.hideVideos);
}

/**
 * Check if on bookmarks page
 */
function isBookmarksPage() {
  return window.location.pathname.includes('/i/bookmarks');
}

/**
 * Extract tweet data from article element
 */
function extractTweetData(article) {
  try {
    const timeLink = article.querySelector('a[href*="/status/"]');
    const tweetUrl = timeLink ? `https://x.com${timeLink.getAttribute('href')}` : '';

    let author = '';
    let handle = '';
    const links = article.querySelectorAll('a[href^="/"]');
    for (const link of links) {
      const href = link.getAttribute('href');
      if (href?.match(/^\/[a-zA-Z0-9_]+$/) && !href.includes('/status/')) {
        const spans = link.querySelectorAll('span');
        for (const span of spans) {
          const text = span.textContent?.trim();
          if (text?.startsWith('@')) handle = text;
          else if (text && !text.includes('·')) author = text;
        }
      }
    }

    const tweetText = article.querySelector('[data-testid="tweetText"]');
    const content = tweetText?.textContent || '';

    return { author, handle, content, tweetUrl };
  } catch (e) {
    return null;
  }
}

/**
 * Copy tweet to clipboard
 */
async function copyTweet(article) {
  const data = extractTweetData(article);
  if (!data) return false;

  const text = `${data.author} ${data.handle}\n${data.content}\n\n${data.tweetUrl}`;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

/**
 * Add copy button to tweet
 */
function addCopyButton(article) {
  if (article.querySelector('.x-marks-copy-btn')) return;

  const actionGroup = article.querySelector('[role="group"]');
  if (!actionGroup) return;

  const btn = document.createElement('button');
  btn.className = 'x-marks-copy-btn';
  btn.title = 'Copy tweet';
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (await copyTweet(article)) {
      btn.classList.add('copied');
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
      }, 1500);
    }
  });

  const shareBtn = actionGroup.querySelector('button[aria-label*="Share"]');
  if (shareBtn) {
    shareBtn.parentElement.insertBefore(btn, shareBtn);
  } else {
    actionGroup.appendChild(btn);
  }
}

/**
 * Add copy buttons to bookmarks page
 */
function setupBookmarks() {
  if (!isBookmarksPage()) return;
  document.querySelectorAll('article').forEach(addCopyButton);
}

/**
 * Watch for new content
 */
function observeDOM() {
  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(setupBookmarks, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Initialize
 */
function init() {
  applyClasses(document.body);
  setupBookmarks();
  observeDOM();
}

// Load settings immediately
chrome.storage.sync.get(['cleanView', 'hideVideos'], (result) => {
  settings.cleanView = result.cleanView || false;
  settings.hideVideos = result.hideVideos || false;
  applyClasses(document.documentElement);

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
});

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    settings.cleanView = message.cleanView || false;
    settings.hideVideos = message.hideVideos || false;
    applyClasses(document.documentElement);
    applyClasses(document.body);
    sendResponse({ success: true });
  }
});

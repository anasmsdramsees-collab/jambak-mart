/* ═══════════════════════════════════════════
   جمبك مارت — Background Service Worker
═══════════════════════════════════════════ */

// Update badge when content script reports counts
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'UPDATE_BADGE') {
    const total = (msg.newOrders || 0) + (msg.pendingVendors || 0);
    if (total > 0) {
      chrome.action.setBadgeText({ text: String(total) });
      chrome.action.setBadgeBackgroundColor({ color: '#E53935' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});

// Alarm for periodic badge refresh
chrome.alarms.create('refresh', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && (tab.url.includes('jambak-mart') || tab.url.includes('localhost'))) {
        chrome.tabs.sendMessage(tab.id, { type: 'PING' }).catch(() => {});
      }
    });
  });
});

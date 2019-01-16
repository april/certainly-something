import { consume } from './consumer';
import * as icon from './icon';
import * as state from './state';


// we only do some actions if we are on Android
let IS_ANDROID = false;
browser.runtime.getPlatformInfo().then(pi => {
  IS_ANDROID = (pi.os === 'android');
});


// consume the security info about requests
// ideally, we'd like to set it to types: ['main_frame'] for performance reasons, but
// unfortunately this is the only way to check for mixed content errors
browser.webRequest.onHeadersReceived.addListener(
  details => { consume(details); },
  { urls: ['<all_urls>'] },
  ['blocking'],
);

browser.webRequest.onErrorOccurred.addListener(
  details => {
    // eventually we will be able to consume these details, but for now we can only
    // disable the icon
    // consume(details);
    if (details.type === 'main_frame' && details.documentUrl === undefined) {
      icon.update(details.tabId, 'http');
    }
  },
  { urls: ['<all_urls>'] }
);

// when it's first loaded, reload the page if it's an https page
browser.runtime.onInstalled.addListener(async () => {
  const tabs = await browser.tabs.query({});

  // disable every inactive tab
  tabs.forEach(tab => {
    // disable the icon on every tab
    if (tab.active) {
      try {
        const activeUrl = new URL(tab.url);

        if (activeUrl.protocol === 'https:' && activeUrl.hostname !== 'addons.mozilla.org') {
          browser.tabs.reload(tab.id);
        }
      } catch (e) {
        // pass
      }
    }
  });
});

// open the certificate viewer
browser.pageAction.onClicked.addListener(
  async details => {
    // open the cert viewer page in the next tab over, if we have the existing state
    if (state.get(details.id) !== undefined) {
      browser.tabs.create({
        index: details.index + 1,
        url: `/viewer/index.html?tid=${String(details.id)}`,
        windowId: details.windowId,
      });
    } else {
      // inject notification script to say you need to refresh
      await browser.tabs.insertCSS(details.id, {
        file: '/content_script/index.css',
      });

      await browser.tabs.executeScript(details.id, {
        file: '/content_script/index.js',
      });

      // open popup to have people refresh the page
      await browser.tabs.sendMessage(details.id, {
        action: 'notify',
      });
    }
  }
);

// remove the tab state when a tab is closed
browser.tabs.onRemoved.addListener(
  tabId => {
    state.remove(tabId);
  }
);

// requests for the security info for a tab
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'getSecurityInfo' && sender.envType === 'addon_child') {
      const si = state.get(request.tabId);

      if (!si) {
        sendResponse(undefined);
        return;
      }

      sendResponse(si);
    }
  }
);


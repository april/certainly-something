// consume the security info about requests
browser.webRequest.onHeadersReceived.addListener(
  details => { consumer(details); },
  { urls: ['<all_urls>'] },
  ['blocking'],
);

browser.webRequest.onErrorOccurred.addListener(
  details => { consumer(details); },
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

        if (activeUrl.protocol === 'https:') {
          browser.tabs.reload(tab.id);
        }
      } catch {
        // pass
      }
    }
  });
});


// update the icon when a navigation is complete
browser.webNavigation.onCompleted.addListener(
  details => {
    icon.update(details.tabId, tabState[details.tabId].si.state);
  },
  { url: [{ schemes: ['http', 'https'] }] }
);

// open the certificate viewer
browser.pageAction.onClicked.addListener(
  details => {
    browser.tabs.create({
      url: `/viewer/index.html?tid=${String(details.id)}`
    });
  }
);

// remove the tab state when a tab is closed
browser.tabs.onRemoved.addListener(
  tabId => {
    if (tabState.hasOwnProperty(tabId)) {
      delete tabState[tabId];
    }
  }
);

// requests for the security info for a tab
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'getSecurityInfo' && sender.envType === 'addon_child') {
      const state = tabState[request.tabId];

      if (!state) {
        sendResponse(undefined);
        return;
      }

      sendResponse(state.si);
    }

    // this is a bit hackish for now, I could probably have a real error page
    if (request.action === 'closeTab' && sender.envType === 'addon_child') {
      browser.tabs.remove(sender.tab.id);
    }
  }
);

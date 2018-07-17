const tabState = {};

// state can only be downgraded, not upgraded
const getWorseState = (tid, newState) => {
  const curState = tabState[tid].si.state;
  const states = ['secure', 'insecure', 'broken', 'http'];  // HTTPS, invalid HTTPS, broken/mixed content, HTTP

  if (states.indexOf(newState) > states.indexOf(curState)) {
    return newState;
  }

  return curState;
};

const consumer = async details => {
  const tid = details.tabId;
  const url = new URL(details.url);
  const documentUrl = details.documentUrl === undefined ? url : new URL(details.documentUrl);
  const mainFrame = details.type === 'main_frame';
  let securityInfo;

  // we don't care about weird things with tabId == -1, such as favicons
  if (tid === -1) {
    return;
  }

  // only pull security info on top level requests
  if (mainFrame) {
    // initialize the state
    tabState[tid] = {
      si: {
        state: 'insecure',
      },
    };

    // grab the security info
    securityInfo = await browser.webRequest.getSecurityInfo( // fetch the security info
      details.requestId,
      { certificateChain: true, rawDER: true });

    if (securityInfo !== undefined) {
      // sometimes securityInfo doesn't return keaGroupName for whatever reason
      if (!securityInfo.keaGroupName) {
        securityInfo.keaGroupName = undefined;
      }

      tabState[tid].si = securityInfo;
    }
  }

  // update document state depending on various conditions
  if (documentUrl.protocol === 'https:' && url.protocol === 'http:') {  // mixed content
    tabState[tid].si.state = getWorseState(tid, 'broken');
  } else if (url.protocol === 'http:') {  // plain HTTP
    tabState[tid].si.state = getWorseState(tid, 'http');
  }
};

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
        activeUrl = new URL(tab.url);

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

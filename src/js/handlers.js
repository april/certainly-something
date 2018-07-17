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
    return;
  } else if (url.protocol === 'http:') {  // plain HTTP
    tabState[tid].si.state = getWorseState(tid, 'http');
    return;
  }

  // there are no good ways to specifically fire on an HTTPS error, so we have to set the icon here
  if (mainFrame && tabState[tid].si.state === 'insecure' && url.protocol === 'https:') {
    updateIcon(tid, tabState[tid].si.state);
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

// disable the icon immediately when a tab is created
browser.tabs.onCreated.addListener(
  tab => {
    updateIcon(tab.id, 'http');
  }
);

// same with a new navigation
browser.webNavigation.onBeforeNavigate.addListener(details => {
  updateIcon(details.tabId, 'http');
})

// when it's first loaded, disable the icon on every page
browser.runtime.onInstalled.addListener(async () => {
  let activeTab = undefined;
  let activeUrl = undefined;

  const tabs = await browser.tabs.query({});

  // disable every inactive tab
  tabs.forEach(tab => {
    updateIcon(tab.id, 'http');

    // disable the icon on every tab
    if (tab.active) {
      activeTab = tab.id;
      try {
        activeUrl = new URL(tab.url);
      } catch {
        // pass
      }
    }
  });

  // refresh the active tab, if it's a web page and it's on https
  if (activeTab && activeUrl && activeUrl.protocol === 'https:') {
    browser.tabs.reload(activeTab);
  }
});

// update the icon when a navigation is complete
browser.webNavigation.onCompleted.addListener(
  details => { updateIcon(details.tabId, tabState[details.tabId].si.state); },
  { url: [{ schemes: ['http', 'https'] }] }
);

// open the certificate viewer
browser.browserAction.onClicked.addListener(
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

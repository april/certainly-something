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
  if (details.type === 'main_frame') {
    // initialize the state
    tabState[tid] = {
      si: {
        state: 'insecure',
      },
    };

    // grab the security info
    securityInfo = await browser.webRequest.getSecurityInfo( // fetch the security info
      details.requestId,
      { certificateChain: true, rawDER: false });

    if (securityInfo !== undefined) {
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

// update the icon when a navigation is complete
browser.webNavigation.onCompleted.addListener(
  details => { updateIcon(details.tabId, tabState[details.tabId].si.state); },
  { url: [{ schemes: ['http', 'https'] }] }
);

// open the certificate viewer
browser.browserAction.onClicked.addListener(
  active => {
    browser.tabs.create({
      url: `/viewer/index.html?tid=${String(active.id)}`
    });
  }
);

// requests for the security info for a tab
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'getSecurityInfo' && sender.envType === 'addon_child') {
      sendResponse(tabState[request.tabId].si);
    }
  }
);

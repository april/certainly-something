import * as state from './state';

// state can only be downgraded, not upgraded
const getWorseState = (tid, newState) => {
  const curState = tabState[tid].si.state;
  const states = ['secure', 'insecure', 'broken', 'http'];  // HTTPS, invalid HTTPS, broken/mixed content, HTTP

  if (states.indexOf(newState) > states.indexOf(curState)) {
    return newState;
  }

  return curState;
};

export const consume = async details => {
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
    state.init(tid);

    // grab the security info
    securityInfo = await browser.webRequest.getSecurityInfo( // fetch the security info
      details.requestId,
      { certificateChain: true, rawDER: true });

    if (securityInfo !== undefined) {
      // sometimes securityInfo doesn't return keaGroupName for whatever reason
      if (!securityInfo.keaGroupName) {
        securityInfo.keaGroupName = undefined;
      }

      // tabState[tid].si = securityInfo;
      state.set(tid, securityInfo);
    }
  }

  // update document state depending on various conditions
  if (documentUrl.protocol === 'https:' && url.protocol === 'http:') {  // mixed content
    // tabState[tid].si.state = getWorseState(tid, 'broken');
    state.set(tid, getWorseState(tid, 'broken'));
  } else if (url.protocol === 'http:') {  // plain HTTP
    state.set(tid, getWorseState(tid, 'http'));
    // tabState[tid].si.state = getWorseState(tid, 'http');
  }
};

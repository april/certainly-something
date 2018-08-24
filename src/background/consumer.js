import * as icon from './icon';
import * as state from './state';


// we only do some actions if we are on Android
let IS_ANDROID = false;
browser.runtime.getPlatformInfo().then(pi => {
  IS_ANDROID = (pi.os === 'android');
});

// state can only be downgraded, not upgraded
const getWorseState = (tid, newState) => {
  const curState = state.get(tid).state;
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

      state.set(tid, securityInfo);

      // the icon is show by default on the desktop due to its manifest (show_matches), but on Android
      // you have to specifically call pageAction.show(). We don't want to do this on other platforms,
      // since this can be a bit glitchy at times
      if (IS_ANDROID && url.protocol === 'https:' && url.hostname !== 'addons.mozilla.org') {
        icon.update(tid, securityInfo.state);
      }
    }

    return;
  }

  // update document state depending on various conditions
  if (documentUrl.protocol === 'https:' && url.protocol === 'http:') {  // mixed content
    if (state.get(tid) === undefined) {
      state.init(tid, 'broken');
    }

    icon.update(tid, state.set(tid, getWorseState(tid, 'broken')));
  }

  // this isn't needed for now, simply because the manifest hides the extension from HTTP only pages
  // else if (url.protocol === 'http:') {  // plain HTTP
  //   icon.update(tid, state.set(tid, getWorseState(tid, 'http')));
  // }
};

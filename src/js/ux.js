const updateIcon = async (tid, state) => {
  const enabledStates = ['secure', 'broken'];

  browser.browserAction.setIcon({
    path: `icons/${state}.svg`,
    tabId: tid,
  });

  if (enabledStates.includes(state)) {
    browser.browserAction.enable(tid);
  } else {
    browser.browserAction.disable(tid);
  }
};

export const update = async (tid, state) => {
  const enabledStates = ['secure', 'broken'];

  if (enabledStates.includes(state)) {
    await browser.pageAction.setIcon({
      path: `icons/${state}.svg`,
      tabId: tid,
    });

    await browser.pageAction.show(tid);
  } else {
    // browser bug avoidance
    await browser.pageAction.setIcon({
      path: 'icons/invalid-path-to-hide-icon.svg',
      tabId: tid,
    });

    await browser.pageAction.hide(tid);
  }
};

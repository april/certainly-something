// some platforms, namely Android, don't have pageAction.setIcon()
const hasSetIcon = browser.pageAction.hasOwnProperty('setIcon');


export const update = async (tid, state) => {
  const enabledStates = ['secure', 'broken'];

  if (enabledStates.includes(state)) {
    // android doesn't support setIcon, so we can't call it on that platform
    if (hasSetIcon) {
      await browser.pageAction.setIcon({
        path: `icons/${state}.svg`,
        tabId: tid,
      });
    }

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

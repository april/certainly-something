export const update = async (tid, state) => {
  const enabledStates = ['secure', 'broken'];

  if (enabledStates.includes(state)) {
    await browser.pageAction.setIcon({
      path: `icons/${state}.svg`,
      tabId: tid,
    });

    browser.pageAction.show(tid);
  }
};

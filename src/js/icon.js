const icon = {
  enable: async (tid, state) => {
    const enabledStates = ['secure', 'broken'];

    if (enabledStates.includes(state)) {
      browser.browserAction.enable(tid);
    } else {
      browser.browserAction.disable(tid);
    }
  },

  set: async (tid, state) => {
    browser.browserAction.setIcon({
      path: `icons/${state}.svg`,
      tabId: tid,
    });
  },

  // try to sync the disabling/enabling with the icon changing
  update: async (tid, state, msg) => {
    await Promise.all([icon.set(tid, state), icon.enable(tid, state)]);
  },
};

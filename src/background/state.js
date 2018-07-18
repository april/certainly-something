const _state = {};

const log = (from) => {
  console.log('current tab state is', _state, 'from', from);
}

export const init = (tid) => {
  _state[tid] = {
    si: {
      state: 'insecure',
    },
  };

  log('init');
};

export const get = (tid) => {
  return _state[tid];

  log('get');
};

export const remove = (tid) => {
  if (_state.hasOwnProperty(tid)) {
    delete state[tid];
  }

  log('remove');
}

export const set = (tid, state) => {
  console.log('in set with', tid, 'and state', state);
  if (typeof state === 'string') {         // like 'secure', 'http', etc.
    _state.state = state;
  } else if (typeof state === 'object') {  // setting security info
    console.log('setting security info');
    _state[tid] = state;
  }

  log('set');
};

// this is for tracking the securityInfo information for every open tab
const _state = {};

export const init = (tid, state = 'insecure') => {
  _state[tid] = {
    si: {
      state,
    },
  };
};

export const get = (tid) => {
  return _state[tid];
};

export const remove = (tid) => {
  if (_state.hasOwnProperty(tid)) {
    delete _state[tid];
  }
}

export const set = (tid, state) => {
  if (typeof state === 'string') {         // like 'secure', 'http', etc.
    _state[tid].state = state;
  } else if (typeof state === 'object') {  // setting security info
    _state[tid] = state;
  }

  return state;
};

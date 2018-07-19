const _state = {};

// const log = (from) => {
//   console.log('current tab state is', _state, 'from', from);
// }

export const init = (tid) => {
  _state[tid] = {
    si: {
      state: 'insecure',
    },
  };
};

export const get = (tid) => {
  return _state[tid];
};

export const remove = (tid) => {
  if (_state.hasOwnProperty(tid)) {
    console.log('hello');
    delete _state[tid];
  }
}

export const set = (tid, state) => {
  if (typeof state === 'string') {         // like 'secure', 'http', etc.
    _state.state = state;
  } else if (typeof state === 'object') {  // setting security info
    _state[tid] = state;
  }
};

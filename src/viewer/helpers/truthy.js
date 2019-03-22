export default (v) => {
  if (v === undefined || v === null || v === 'none' || v === false) {
    return false;
  }

  // empty array or string
  if ((Array.isArray(v) || typeof v === 'string') && v.length === 0) {
    return false;
  }

  return true;
};

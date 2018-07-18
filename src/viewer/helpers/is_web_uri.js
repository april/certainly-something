export default (_url) => {
  try {
    let url = new URL(_url);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
};

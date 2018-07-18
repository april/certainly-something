export default (str, a, b) => {
  if (typeof str !== 'string') return '';
  if (typeof a !== 'string') return str;
  if (typeof b !== 'string') b = '';
  return str.split(a).join(b);
};

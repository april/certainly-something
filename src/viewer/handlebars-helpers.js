Handlebars.registerHelper('onebasedindex', index => { return index + 1; });

Handlebars.registerHelper('replace', (str, a, b) => {
  if (typeof str !== 'string') return '';
  if (typeof a !== 'string') return str;
  if (typeof b !== 'string') b = '';
  return str.split(a).join(b);
});

Handlebars.registerHelper('isntnull', v => {
  if (v !== null && v !== 'none') {
    return true;
  }

  return false;
});

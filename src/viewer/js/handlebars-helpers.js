Handlebars.registerHelper('link', (text, url) => {
  text = Handlebars.escapeExpression(text);
  url = Handlebars.escapeExpression(url);

  return new Handlebars.SafeString(
    `<a href="${url}">${text}</a>`
  );
});

Handlebars.registerHelper('onebasedindex', index => { return index + 1; });

Handlebars.registerHelper('replace', (str, a, b) => {
  if (typeof str !== 'string') return '';
  if (typeof a !== 'string') return str;
  if (typeof b !== 'string') b = '';
  return str.split(a).join(b);
});

Handlebars.registerHelper('truthy', v => {
  if (v === null || v === 'none') {
    return false;
  }

  // empty array or string
  if ((Array.isArray(v) || typeof v === 'string') && v.length === 0) {
    return false;
  }

  return true;
});

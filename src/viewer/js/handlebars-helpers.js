import * as Handlebars from 'handlebars/runtime';

console.log('trying to register Handlebars', Handlebars);

Handlebars.registerHelper('is_web_uri', (_url) => {
  try {
    let url = new URL(_url);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
});

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
  if (v === undefined || v === null || v === 'none') {
    return false;
  }

  // empty array or string
  if ((Array.isArray(v) || typeof v === 'string') && v.length === 0) {
    return false;
  }

  return true;
});

console.log('trying to register Handlebars 2', Handlebars, Handlebars.default.SafeString);

import * as Handlebars from 'handlebars/runtime';

export default (text, url) => {
  return `<a href="${new URL(url).href}">${Handlebars.Utils.escapeExpression(text)}</a>`;
};

/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const utils = require('../utils');

/**
 * The sign-in button's HTML comes from the assets of the service, which the
 * address of the page may have chosen (`serviceInfoFromUrl()`): it is parsed
 * where nothing runs or loads, and rebuilt from an allow-list.
 */
module.exports = { buildButton };

/** Id of the element that shows the text of the button. */
const TEXT_ID = 'pryv-access-btn-text';

const ELEMENTS = ['div', 'span', 'p', 'br', 'b', 'i', 'strong', 'em', 'small', 'img', 'a', 'button'];
const ATTRIBUTES = ['class', 'title', 'alt', 'role', 'dir', 'lang', 'style', 'width', 'height'];

const FALLBACK_HTML = '<div id="pryv-access-btn" class="pryv-access-btn-signin">' +
  '<span class="pryv-access-btn pryv-access-btn-pryv-access-color"><span id="' + TEXT_ID + '"></span></span></div>';

/**
 * @param {string} html - the service's HTML of the button
 * @param {Document} doc
 * @returns {{ fragment: DocumentFragment, textHolder: Element }} what to show, and where its text goes
 */
function buildButton (html, doc) {
  const dropped = new Set();
  let fragment = rebuild(html, doc, dropped);
  if (fragment.querySelector('#' + TEXT_ID) == null) {
    console.warn('pryv: the sign-in button HTML of the service has no usable #' + TEXT_ID + ', using the built-in button');
    fragment = rebuild(FALLBACK_HTML, doc, new Set());
  }
  if (dropped.size > 0) {
    console.warn('pryv: removed from the sign-in button HTML of the service: ' + Array.from(dropped).join(', '));
  }
  return { fragment, textHolder: fragment.querySelector('#' + TEXT_ID) };
}

function rebuild (html, doc, dropped) {
  const template = doc.createElement('template');
  template.innerHTML = html; // inert: no script, no handler, no request
  const fragment = doc.createDocumentFragment();
  copyChildren(template.content, fragment, doc, dropped);
  return fragment;
}

function copyChildren (from, to, doc, dropped) {
  for (const node of Array.from(from.childNodes)) {
    if (node.nodeType === 3) { // text
      to.appendChild(doc.createTextNode(node.nodeValue));
    } else if (node.nodeType === 1) { // element
      const name = node.localName;
      if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !ELEMENTS.includes(name)) {
        dropped.add('<' + name + '>');
        continue;
      }
      const element = doc.createElement(name);
      for (const attribute of Array.from(node.attributes)) {
        if (isAllowed(name, attribute, doc)) element.setAttribute(attribute.name, attribute.value);
        else dropped.add(attribute.name);
      }
      if (name === 'button') element.setAttribute('type', 'button');
      copyChildren(node, element, doc, dropped);
      to.appendChild(element);
    }
  }
}

function isAllowed (elementName, { name, value }, doc) {
  if (name === 'id') return value.startsWith('pryv-'); // never an id of the page around the button
  if (name === 'src') return elementName === 'img' && utils.isHttpUrl(value, doc.baseURI);
  return ATTRIBUTES.includes(name) || /^aria-[a-z]+$/.test(name);
}

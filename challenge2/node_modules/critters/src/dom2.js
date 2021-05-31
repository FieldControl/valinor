/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import parse5 from 'parse5';
import nwsapi from 'nwsapi';
// import crawl from 'tree-crawl';
// import select from 'css-select';

// htmlparser2 has a relatively DOM-like tree format, which we'll massage into a DOM elsewhere
const treeAdapter = require('parse5-htmlparser2-tree-adapter');

const PARSE5_OPTS = {
  treeAdapter
};

/**
 * Parse HTML into a mutable, serializable DOM Document.
 * The DOM implementation is an htmlparser2 DOM enhanced with basic DOM mutation methods.
 * @param {String} html   HTML to parse into a Document instance
 */
export function createDocument(html) {
  const document = parse5.parse(html, PARSE5_OPTS);

  defineProperties(document, DocumentExtensions);

  // Extend Element.prototype with DOM manipulation methods.
  const scratch = document.createElement('div');
  // Get a reference to the base Node class - used by createTextNode()
  document.$$Node = scratch.constructor;
  const elementProto = Object.getPrototypeOf(scratch);
  defineProperties(elementProto, ElementExtensions);
  elementProto.ownerDocument = document;

  // nwsapi is a selector engine that happens to work with Parse5's htmlparser2 DOM (they form the base of jsdom).
  // It is exposed to the document so that it can be used within Element.prototype methods.
  document.$match = nwsapi({ document });
  document.$match.configure({
    IDS_DUPES: false,
    LIVECACHE: false,
    MIXEDCASE: true,
    LOGERRORS: false
  });

  return document;
}

/**
 * Serialize a Document to an HTML String
 * @param {Document} document   A Document, such as one created via `createDocument()`
 */
export function serializeDocument(document) {
  return parse5.serialize(document, PARSE5_OPTS);
}

/**
 * Methods and descriptors to mix into Element.prototype
 */
const ElementExtensions = {
  /** @extends htmlparser2.Element.prototype */

  nodeName: {
    get() {
      return this.tagName.toUpperCase();
    }
  },

  id: reflectedProperty('id'),

  className: reflectedProperty('class'),

  classList: {
    get() {
      return this.className ? this.className.split(' ') : [];
    }
  },

  insertBefore(child, referenceNode) {
    if (!referenceNode) return this.appendChild(child);
    treeAdapter.insertBefore(this, child, referenceNode);
    return child;
  },

  appendChild(child) {
    treeAdapter.appendChild(this, child);
    return child;
  },

  removeChild(child) {
    treeAdapter.detachNode(child);
  },

  remove() {
    treeAdapter.detachNode(this);
  },

  textContent: {
    get() {
      return this.children.map((node) => node.nodeValue).join('\n');
    },

    set(text) {
      this.children = [];
      treeAdapter.insertText(this, text);
    }
  },

  setAttribute(name, value) {
    if (this.attribs == null) this.attribs = {};
    if (value == null) value = '';
    this.attribs[name] = value;
  },

  removeAttribute(name) {
    if (this.attribs != null) {
      delete this.attribs[name];
    }
  },

  getAttribute(name) {
    return this.attribs != null && this.attribs[name];
  },

  hasAttribute(name) {
    return this.attribs != null && this.attribs[name] != null;
  },

  getAttributeNode(name) {
    const value = this.getAttribute(name);
    if (value != null) return { specified: true, value };
  },

  // These are used by nwsapi to implement its selector engine.
  parentElement: {
    get() {
      const parent = this.parentNode;
      if (parent.nodeType === 1) return parent;
      return null;
    }
  },
  firstElementChild: {
    get() {
      const children = this.children;

      return (
        (children && children.find((child) => child.nodeType === 1)) || null
      );
    }
  },
  nextElementSibling: {
    get() {
      let sibling = this.nextSibling;
      while (sibling && sibling.nodeType !== 1) {
        sibling = sibling.nextSibling;
      }

      return sibling;
    }
  },
  previousElementSibling: {
    get() {
      let sibling = this.previousSibling;
      while (sibling && sibling.nodeType !== 1) {
        sibling = sibling.previousSibling;
      }

      return sibling;
    }
  },

  getElementsByTagName,
  getElementsByClassName
};

/**
 * Methods and descriptors to mix into the global document instance
 * @private
 */
const DocumentExtensions = {
  /** @extends htmlparser2.Document.prototype */

  // document is just an Element in htmlparser2, giving it a nodeType of ELEMENT_NODE.
  // nwsapi requires that it at least report a correct nodeType of DOCUMENT_NODE.
  nodeType: {
    get() {
      return 9;
    }
  },

  contentType: {
    get() {
      return 'text/html';
    }
  },

  nodeName: {
    get() {
      return '#document';
    }
  },

  documentElement: {
    get() {
      // Find the first <html> element within the document
      return this.childNodes.filter(
        (child) => String(child.tagName).toLowerCase() === 'html'
      )[0];
    }
  },

  compatMode: {
    get() {
      const compatMode = {
        'no-quirks': 'CSS1Compat',
        quirks: 'BackCompat',
        'limited-quirks': 'CSS1Compat'
      };
      return compatMode[treeAdapter.getDocumentMode(this)];
    }
  },

  body: {
    get() {
      return this.querySelector('body');
    }
  },

  createElement(name) {
    return treeAdapter.createElement(name, null, []);
  },

  createTextNode(text) {
    // there is no dedicated createTextNode equivalent exposed in htmlparser2's DOM
    const Node = this.$$Node;
    return new Node({
      type: 'text',
      data: text,
      parent: null,
      prev: null,
      next: null
    });
  },

  querySelector(sel) {
    return this.$match.first(sel, this.documentElement);
    // return select.selectOne(sel, this.documentElement);
  },

  querySelectorAll(sel) {
    return this.$match.select(sel, this.documentElement);
    // return select(sel, this.documentElement);
  },

  getElementsByTagName,
  getElementsByClassName
};

/**
 * Essentially `Object.defineProperties()`, except function values are assigned as value descriptors for convenience.
 * @private
 */
function defineProperties(obj, properties) {
  for (const i in properties) {
    const value = properties[i];
    Object.defineProperty(
      obj,
      i,
      typeof value === 'function' ? { value } : value
    );
  }
}

/**
 * A simple implementation of Element.prototype.getElementsByTagName().
 * This is used by nwsapi to implement its selector engine.
 * @private
 * @note
 *    If perf issues arise, 2 faster but more verbose implementations are benchmarked here:
 *      https://esbench.com/bench/5ac3b647f2949800a0f619e1
 */
// function getElementsByTagName(tagName) {
//   // Only return Element/Document nodes
//   if (
//     (this.nodeType !== 1 && this.nodeType !== 9) ||
//     this.type === 'directive'
//   ) {
//     return [];
//   }
//   return Array.prototype.concat.apply(
//     // Add current element if it matches tag
//     tagName === '*' ||
//       (this.tagName &&
//         (this.tagName === tagName || this.nodeName === tagName.toUpperCase()))
//       ? [this]
//       : [],
//     // Check children recursively
//     this.children.map((child) => getElementsByTagName.call(child, tagName))
//   );
// }

function getElementsByTagName(tagName) {
  if (this.nodeType !== 1 && this.nodeType !== 9) return [];
  const stack = [this];
  const matches = [];
  const isWildCard = tagName === '*';
  const tagNameUpper = tagName.toUpperCase();
  while (stack.length !== 0) {
    const el = stack.pop();
    let child = el.lastChild;
    while (child) {
      if (child.nodeType === 1) stack.push(child);
      child = child.previousSibling;
    }
    if (
      isWildCard ||
      (el.tagName != null &&
        (el.tagName === tagNameUpper ||
          el.tagName.toUpperCase() === tagNameUpper))
    ) {
      matches.push(el);
    }
  }
  return matches;
}

// function getElementsByTagName(tagName) {
//   if (this.nodeType !== 1 && this.nodeType !== 9) return [];
//   const matches = [];
//   const isWildCard = tagName === '*';
//   const tagNameUpper = tagName.toUpperCase();

//   crawl(
//     this,
//     (node, context) => {
//       if (node.nodeType !== 1) {
//         context.skip();
//       }

//       if (
//         isWildCard ||
//         (node.tagName != null &&
//           (node.tagName === tagNameUpper ||
//             node.tagName.toUpperCase() === tagNameUpper))
//       ) {
//         matches.push(node);
//       }
//     },
//     { order: 'pre' }
//   );
//   return matches;
// }

// function getElementsByClassName(className) {
//   // Only return Element/Document nodes
//   if (
//     (this.nodeType !== 1 && this.nodeType !== 9) ||
//     this.type === 'directive'
//   ) {
//     return [];
//   }
//   return Array.prototype.concat.apply(
//     // Add current element if it matches tag
//     className && this.classList.includes(className.trim()) ? [this] : [],
//     // Check children recursively
//     this.children.map((child) => getElementsByClassName.call(child, className))
//   );
// }

function getElementsByClassName(className) {
  if (this.nodeType !== 1 && this.nodeType !== 9) return [];
  const stack = [...this.children];
  const matches = [];
  while (stack.length !== 0) {
    const el = stack.pop();
    let child = el.lastChild;
    while (child) {
      if (child.nodeType === 1) stack.push(child);
      child = child.previousSibling;
    }

    // const classRe = new RegExp('(^|s)' + className + '(s|$)');
    if (el.classList.includes(className.trim())) {
      matches.push(el);
    }
  }
  return matches;
}

// function getElementsByClassName(className) {
//   if (this.nodeType !== 1 && this.nodeType !== 9) return [];
//   const matches = [];

//   crawl(
//     this,
//     (node, context) => {
//       if (node.nodeType !== 1) {
//         context.skip();
//       }

//       if (node.classList.includes(className)) {
//         matches.push(node);
//       }
//     },
//     { order: 'pre' }
//   );

//   return matches;
// }

/**
 * Create a property descriptor defining a getter/setter pair alias for a named attribute.
 * @private
 */
function reflectedProperty(attributeName) {
  return {
    get() {
      return this.getAttribute(attributeName);
    },
    set(value) {
      this.setAttribute(attributeName, value);
    }
  };
}

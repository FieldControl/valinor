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

// import parse5 from 'parse5';
// import { parseDOM, DomUtils } from 'htmlparser2';
import select from 'css-select';

const { parseDOM, DomUtils } = require('htmlparser2');

// htmlparser2 has a relatively DOM-like tree format, which we'll massage into a DOM elsewhere
const treeAdapter = require('parse5-htmlparser2-tree-adapter');

const PARSE5_OPTS = {
  treeAdapter,
};

/**
 * Parse HTML into a mutable, serializable DOM Document.
 * The DOM implementation is an htmlparser2 DOM enhanced with basic DOM mutation methods.
 * @param {String} html   HTML to parse into a Document instance
 */
export function createDocument(html) {
  // const document = parse5.parse(html, PARSE5_OPTS);
  const document = parseDOM(html);

  defineProperties(document, DocumentExtensions);

  // Extend Element.prototype with DOM manipulation methods.
  // const scratch = document.createElement('div');
  // Get a reference to the base Node class - used by createTextNode()
  // document.$$Node = scratch.constructor;
  // const elementProto = Object.getPrototypeOf(scratch);
  // defineProperties(elementProto, ElementExtensions);
  // elementProto.ownerDocument = document;

  return document;
}

/**
 * Serialize a Document to an HTML String
 * @param {Document} document   A Document, such as one created via `createDocument()`
 */
export function serializeDocument(document) {
  return DomUtils.getOuterHTML(document);
}

/**
 * Methods and descriptors to mix into Element.prototype
 */
const ElementExtensions = {
  /** @extends htmlparser2.Element.prototype */

  nodeName: {
    get() {
      return this.tagName.toUpperCase();
    },
  },

  id: reflectedProperty('id'),

  className: reflectedProperty('class'),
  parentNode: {
    get() {
      if (this.parent) defineProperties(this.parent, ElementExtensions);
      return this.parent;
    },
  },

  insertBefore(child, referenceNode) {
    if (!referenceNode) return this.appendChild(child);
    DomUtils.prepend(referenceNode, child);
    return child;
  },

  appendChild(child) {
    DomUtils.appendChild(this, child);
    return child;
  },

  removeChild(child) {
    DomUtils.removeElement(child);
  },

  remove() {
    DomUtils.removeElement(this);
  },

  textContent: {
    get() {
      return DomUtils.getText(this);
    },

    set(text) {
      this.children = [];
      DomUtils.appendChild(this, createTextNode(text));
    },
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
};

/**
 * Methods and descriptors to mix into the global document instance
 * @private
 */
const DocumentExtensions = {
  /** @extends htmlparser2.Document.prototype */

  // document is just an Element in htmlparser2, giving it a nodeType of ELEMENT_NODE.
  // TODO: verify if these are needed for css-select
  nodeType: {
    get() {
      return 9;
    },
  },

  contentType: {
    get() {
      return 'text/html';
    },
  },

  nodeName: {
    get() {
      return '#document';
    },
  },

  documentElement: {
    get() {
      // Find the first <html> element within the document
      return this.filter(
        (child) => String(child.tagName).toLowerCase() === 'html'
      );
    },
  },

  compatMode: {
    get() {
      const compatMode = {
        'no-quirks': 'CSS1Compat',
        quirks: 'BackCompat',
        'limited-quirks': 'CSS1Compat',
      };
      return compatMode[treeAdapter.getDocumentMode(this)];
    },
  },

  body: {
    get() {
      return this.querySelector('body');
    },
  },

  createElement(tagName) {
    const node = {
      type: tagName === 'script' || tagName === 'style' ? tagName : 'tag',
      name: tagName,
      attribs: [],
      children: [],
      parent: null,
      prev: null,
      next: null,
    };
    defineProperties(node, ElementExtensions);
    return node;
  },

  querySelector(sel) {
    if (sel === ':root') {
      return this.type === 'root';
    }

    const res = select.selectOne(sel, this.documentElement);
    if (res) defineProperties(res, ElementExtensions);
    return res;
  },

  querySelectorAll(sel) {
    if (sel === ':root') {
      return this.type === 'root';
    }

    const res = select(sel, this.documentElement);

    res.forEach((r) => {
      if (r) defineProperties(r, ElementExtensions);
    });
    return res;
  },
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
    },
  };
}

function createTextNode(text) {
  return parseDOM(text)[0];
}

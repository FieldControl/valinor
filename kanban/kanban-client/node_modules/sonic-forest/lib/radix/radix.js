"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = exports.toRecord = exports.remove = exports.findWithParents = exports.find = exports.insert = void 0;
const printTree_1 = require("../print/printTree");
const TrieNode_1 = require("../trie/TrieNode");
const util_1 = require("../util");
const stringify = JSON.stringify;
const getCommonPrefixLength = (a, b) => {
    const len = Math.min(a.length, b.length);
    let i = 0;
    for (; i < len && a[i] === b[i]; i++)
        ;
    return i;
};
const insert = (root, path, value) => {
    let curr = root;
    let k = path;
    main: while (curr) {
        let child = curr.children;
        if (!child) {
            curr.children = new TrieNode_1.TrieNode(k, value);
            return 1;
        }
        const char = k[0];
        let prevChild = undefined;
        let cmp = false;
        child: while (child) {
            prevChild = child;
            const childChar = child.k[0];
            if (childChar === char) {
                const commonPrefixLength = getCommonPrefixLength(child.k, k);
                const isChildKContained = commonPrefixLength === child.k.length;
                const isKContained = commonPrefixLength === k.length;
                const areKeysEqual = isChildKContained && isKContained;
                if (areKeysEqual) {
                    child.v = value;
                    return 0;
                }
                if (isChildKContained) {
                    k = k.substring(commonPrefixLength);
                    curr = child;
                    continue main;
                }
                if (isKContained) {
                    const newChild = new TrieNode_1.TrieNode(child.k.substring(commonPrefixLength), child.v);
                    newChild.children = child.children;
                    child.k = k.substring(0, commonPrefixLength);
                    child.v = value;
                    child.children = newChild;
                    return 1;
                }
                if (commonPrefixLength) {
                    const newChild = new TrieNode_1.TrieNode(child.k.substring(commonPrefixLength), child.v);
                    newChild.children = child.children;
                    child.k = child.k.substring(0, commonPrefixLength);
                    child.v = undefined;
                    child.children = newChild;
                    curr = child;
                    k = k.substring(commonPrefixLength);
                    continue main;
                }
            }
            cmp = childChar > char;
            if (cmp)
                child = child.l;
            else
                child = child.r;
        }
        if (prevChild) {
            const node = new TrieNode_1.TrieNode(k, value);
            if (cmp)
                (0, util_1.insertLeft)(node, prevChild);
            else
                (0, util_1.insertRight)(node, prevChild);
            return 1;
        }
        break;
    }
    return 0;
};
exports.insert = insert;
const find = (node, key) => {
    if (!key)
        return node;
    const len = key.length;
    let offset = 0;
    while (node) {
        const child = (0, util_1.findOrNextLower)(node.children, key[offset], (cmp1, cmp2) => cmp1[0] > cmp2[0] ? 1 : -1);
        if (!child)
            return undefined;
        const childKey = child.k;
        const childKeyLength = childKey.length;
        let commonPrefixLength = 0;
        const limit = Math.min(childKeyLength, len - offset);
        for (; commonPrefixLength < limit && childKey[commonPrefixLength] === key[offset + commonPrefixLength]; commonPrefixLength++)
            ;
        if (!commonPrefixLength)
            return undefined;
        offset += commonPrefixLength;
        if (offset === len)
            return child;
        if (commonPrefixLength < childKeyLength)
            return undefined;
        node = child;
    }
    return undefined;
};
exports.find = find;
const findWithParents = (node, key) => {
    if (!key)
        return undefined;
    const list = [node];
    const len = key.length;
    let offset = 0;
    while (node) {
        const child = (0, util_1.findOrNextLower)(node.children, key[offset], (cmp1, cmp2) => cmp1[0] > cmp2[0] ? 1 : -1);
        if (!child)
            return undefined;
        const childKey = child.k;
        const childKeyLength = childKey.length;
        let commonPrefixLength = 0;
        const limit = Math.min(childKeyLength, len - offset);
        for (; commonPrefixLength < limit && childKey[commonPrefixLength] === key[offset + commonPrefixLength]; commonPrefixLength++)
            ;
        if (!commonPrefixLength)
            return undefined;
        offset += commonPrefixLength;
        if (commonPrefixLength < childKeyLength)
            return undefined;
        list.push(child);
        if (offset === len)
            return list;
        node = child;
    }
    return undefined;
};
exports.findWithParents = findWithParents;
const remove = (root, key) => {
    if (!key) {
        const deleted = root.v !== undefined;
        root.v = undefined;
        return deleted;
    }
    const list = (0, exports.findWithParents)(root, key);
    if (!list)
        return false;
    const length = list.length;
    const lastIndex = length - 1;
    const last = list[lastIndex];
    const deleted = last.v !== undefined;
    last.v = undefined;
    for (let i = lastIndex; i >= 1; i--) {
        const child = list[i];
        const parent = list[i - 1];
        if (child.v || child.children)
            break;
        parent.children = (0, util_1.remove)(parent.children, child);
    }
    return deleted;
};
exports.remove = remove;
const toRecord = (node, prefix = '', record = {}) => {
    if (!node)
        return record;
    prefix += node.k;
    if (node.v !== undefined)
        record[prefix] = node.v;
    let child = (0, util_1.first)(node.children);
    if (!child)
        return record;
    do
        (0, exports.toRecord)(child, prefix, record);
    while ((child = (0, util_1.next)(child)));
    return record;
};
exports.toRecord = toRecord;
const print = (node, tab = '') => {
    const detailedPrint = node.v && typeof node.v === 'object' && node.v.constructor !== Object;
    const value = node.v && typeof node.v === 'object'
        ? Array.isArray(node.v)
            ? stringify(node.v)
            : node.v.constructor === Object
                ? stringify(node.v)
                : ''
        : node.v === undefined
            ? ''
            : stringify(node.v);
    const childrenNodes = [];
    node.forChildren((child) => childrenNodes.push(child));
    return (`${node.constructor.name} ${JSON.stringify(node.k)}${value ? ' = ' + value : ''}` +
        (0, printTree_1.printTree)(tab, [
            !detailedPrint ? null : (tab) => node.v.toString(tab),
            ...childrenNodes.map((child) => (tab) => (0, exports.print)(child, tab)),
        ]));
};
exports.print = print;

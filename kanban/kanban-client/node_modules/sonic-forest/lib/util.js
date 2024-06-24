"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.insert = exports.insertLeft = exports.insertRight = exports.findOrNextLower = exports.find = exports.size = exports.prev = exports.next = exports.last = exports.first = void 0;
const first = (root) => {
    let curr = root;
    while (curr)
        if (curr.l)
            curr = curr.l;
        else
            return curr;
    return curr;
};
exports.first = first;
const last = (root) => {
    let curr = root;
    while (curr)
        if (curr.r)
            curr = curr.r;
        else
            return curr;
    return curr;
};
exports.last = last;
const next = (curr) => {
    if (curr.r) {
        curr = curr.r;
        while (curr.l)
            curr = curr.l;
        return curr;
    }
    let p = curr.p;
    while (p && p.r === curr) {
        curr = p;
        p = p.p;
    }
    return p;
};
exports.next = next;
const prev = (curr) => {
    if (curr.l) {
        curr = curr.l;
        while (curr.r)
            curr = curr.r;
        return curr;
    }
    let p = curr.p;
    while (p && p.l === curr) {
        curr = p;
        p = p.p;
    }
    return p;
};
exports.prev = prev;
const size_ = (root) => {
    const l = root.l;
    const r = root.r;
    return 1 + (l ? size_(l) : 0) + (r ? size_(r) : 0);
};
const size = (root) => {
    return root ? size_(root) : 0;
};
exports.size = size;
const find = (root, key, comparator) => {
    let curr = root;
    while (curr) {
        const cmp = comparator(key, curr.k);
        if (cmp === 0)
            return curr;
        curr = cmp < 0 ? curr.l : curr.r;
    }
    return curr;
};
exports.find = find;
const findOrNextLower = (root, key, comparator) => {
    let curr = root;
    let result = undefined;
    while (curr) {
        const cmp = comparator(curr.k, key);
        if (cmp === 0)
            return curr;
        if (cmp > 0)
            curr = curr.l;
        else {
            const next = curr.r;
            result = curr;
            if (!next)
                return result;
            curr = next;
        }
    }
    return result;
};
exports.findOrNextLower = findOrNextLower;
const insertRight = (node, p) => {
    const r = (node.r = p.r);
    p.r = node;
    node.p = p;
    if (r)
        r.p = node;
};
exports.insertRight = insertRight;
const insertLeft = (node, p) => {
    const l = (node.l = p.l);
    p.l = node;
    node.p = p;
    if (l)
        l.p = node;
};
exports.insertLeft = insertLeft;
const insert = (root, node, comparator) => {
    if (!root)
        return node;
    const key = node.k;
    let curr = root;
    while (curr) {
        const cmp = comparator(key, curr.k);
        const next = cmp < 0 ? curr.l : curr.r;
        if (!next) {
            if (cmp < 0)
                (0, exports.insertLeft)(node, curr);
            else
                (0, exports.insertRight)(node, curr);
            break;
        }
        else
            curr = next;
    }
    return root;
};
exports.insert = insert;
const remove = (root, node) => {
    const p = node.p;
    const l = node.l;
    const r = node.r;
    node.p = node.l = node.r = undefined;
    if (!l && !r) {
        if (!p)
            return undefined;
        else if (p.l === node)
            p.l = undefined;
        else
            p.r = undefined;
        return root;
    }
    else if (l && r) {
        let mostRightChildFromLeft = l;
        while (mostRightChildFromLeft.r)
            mostRightChildFromLeft = mostRightChildFromLeft.r;
        mostRightChildFromLeft.r = r;
        r.p = mostRightChildFromLeft;
        if (!p) {
            l.p = undefined;
            return l;
        }
        if (p.l === node)
            p.l = l;
        else
            p.r = l;
        l.p = p;
        return root;
    }
    const child = (l || r);
    child.p = p;
    if (!p)
        return child;
    else if (p.l === node)
        p.l = child;
    else
        p.r = child;
    return root;
};
exports.remove = remove;

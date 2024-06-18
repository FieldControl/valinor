"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove2 = exports.insert2 = exports.prev2 = exports.next2 = exports.last2 = exports.first2 = void 0;
const first2 = (root) => {
    let curr = root;
    while (curr)
        if (curr.l2)
            curr = curr.l2;
        else
            return curr;
    return curr;
};
exports.first2 = first2;
const last2 = (root) => {
    let curr = root;
    while (curr)
        if (curr.r2)
            curr = curr.r2;
        else
            return curr;
    return curr;
};
exports.last2 = last2;
const next2 = (curr) => {
    if (curr.r2) {
        curr = curr.r2;
        while (curr.l2)
            curr = curr.l2;
        return curr;
    }
    let p = curr.p2;
    while (p && p.r2 === curr) {
        curr = p;
        p = p.p2;
    }
    return p;
};
exports.next2 = next2;
const prev2 = (curr) => {
    if (curr.l2) {
        curr = curr.l2;
        while (curr.r2)
            curr = curr.r2;
        return curr;
    }
    let p = curr.p2;
    while (p && p.l2 === curr) {
        curr = p;
        p = p.p2;
    }
    return p;
};
exports.prev2 = prev2;
const insertRight2 = (node, p) => {
    const r = (node.r2 = p.r2);
    p.r2 = node;
    node.p2 = p;
    if (r)
        r.p2 = node;
};
const insertLeft2 = (node, p) => {
    const l = (node.l2 = p.l2);
    p.l2 = node;
    node.p2 = p;
    if (l)
        l.p2 = node;
};
const insert2 = (root, node, comparator) => {
    if (!root)
        return node;
    let curr = root;
    while (curr) {
        const cmp = comparator(node, curr);
        const next = cmp < 0 ? curr.l2 : curr.r2;
        if (!next) {
            if (cmp < 0)
                insertLeft2(node, curr);
            else
                insertRight2(node, curr);
            break;
        }
        else
            curr = next;
    }
    return root;
};
exports.insert2 = insert2;
const remove2 = (root, node) => {
    const p = node.p2;
    const l = node.l2;
    const r = node.r2;
    node.p2 = node.l2 = node.r2 = undefined;
    if (!l && !r) {
        if (!p)
            return undefined;
        else if (p.l2 === node)
            p.l2 = undefined;
        else
            p.r2 = undefined;
        return root;
    }
    else if (l && r) {
        let mostRightChildFromLeft = l;
        while (mostRightChildFromLeft.r2)
            mostRightChildFromLeft = mostRightChildFromLeft.r2;
        mostRightChildFromLeft.r2 = r;
        r.p2 = mostRightChildFromLeft;
        if (!p) {
            l.p2 = undefined;
            return l;
        }
        if (p.l2 === node)
            p.l2 = l;
        else
            p.r2 = l;
        l.p2 = p;
        return root;
    }
    const child = (l || r);
    child.p2 = p;
    if (!p)
        return child;
    else if (p.l2 === node)
        p.l2 = child;
    else
        p.r2 = child;
    return root;
};
exports.remove2 = remove2;

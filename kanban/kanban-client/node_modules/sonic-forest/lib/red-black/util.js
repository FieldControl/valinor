"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = exports.remove = exports.insertLeft = exports.insertRight = exports.insert = void 0;
const printBinary_1 = require("../print/printBinary");
const stringify = JSON.stringify;
const insert = (root, n, comparator) => {
    if (!root)
        return (n.b = true), n;
    const key = n.k;
    let curr = root;
    let next = undefined;
    let cmp = 0;
    while ((next = ((cmp = comparator(key, curr.k)) < 0 ? curr.l : curr.r)))
        curr = next;
    return (cmp < 0 ? (0, exports.insertLeft)(root, n, curr) : (0, exports.insertRight)(root, n, curr));
};
exports.insert = insert;
const insertRight = (root, n, p) => {
    const g = p.p;
    p.r = n;
    n.p = p;
    if (p.b || !g)
        return root;
    const top = rRebalance(n, p, g);
    return top.p ? root : top;
};
exports.insertRight = insertRight;
const insertLeft = (root, n, p) => {
    const g = p.p;
    p.l = n;
    n.p = p;
    if (p.b || !g)
        return root;
    const top = lRebalance(n, p, g);
    return top.p ? root : top;
};
exports.insertLeft = insertLeft;
const rRebalance = (n, p, g) => {
    const u = g.l === p ? g.r : g.l;
    const uncleIsBlack = !u || u.b;
    if (uncleIsBlack) {
        const zigzag = g.l === p;
        g.b = false;
        if (zigzag) {
            n.b = true;
            rrRotate(p, n);
            llRotate(g, n);
            return n;
        }
        p.b = true;
        rrRotate(g, p);
        return p;
    }
    return recolor(p, g, u);
};
const lRebalance = (n, p, g) => {
    const u = g.l === p ? g.r : g.l;
    const uncleIsBlack = !u || u.b;
    if (uncleIsBlack) {
        const zigzag = g.r === p;
        g.b = false;
        if (zigzag) {
            n.b = true;
            llRotate(p, n);
            rrRotate(g, n);
            return n;
        }
        p.b = true;
        llRotate(g, p);
        return p;
    }
    return recolor(p, g, u);
};
const recolor = (p, g, u) => {
    p.b = true;
    g.b = false;
    if (u)
        u.b = true;
    const gg = g.p;
    if (!gg)
        return (g.b = true), g;
    if (gg.b)
        return g;
    const ggg = gg.p;
    if (!ggg)
        return (gg.b = true), gg;
    return gg.l === g ? lRebalance(g, gg, ggg) : rRebalance(g, gg, ggg);
};
const llRotate = (n, nl) => {
    const p = n.p;
    const nlr = nl.r;
    nl.p = p;
    nl.r = n;
    n.p = nl;
    n.l = nlr;
    nlr && (nlr.p = n);
    p && (p.l === n ? (p.l = nl) : (p.r = nl));
};
const rrRotate = (n, nr) => {
    const p = n.p;
    const nrl = nr.l;
    nr.p = p;
    nr.l = n;
    n.p = nr;
    n.r = nrl;
    nrl && (nrl.p = n);
    p && (p.l === n ? (p.l = nr) : (p.r = nr));
};
const remove = (root, n) => {
    throw new Error('Not implemented');
};
exports.remove = remove;
const print = (node, tab = '') => {
    if (!node)
        return '∅';
    const { b, l, r, k, v } = node;
    const content = k !== undefined ? ` { ${stringify(k)} = ${stringify(v)} }` : '';
    const bfFormatted = !b ? ` [red]` : '';
    return (node.constructor.name +
        `${bfFormatted}` +
        content +
        (0, printBinary_1.printBinary)(tab, [l ? (tab) => (0, exports.print)(l, tab) : null, r ? (tab) => (0, exports.print)(r, tab) : null]));
};
exports.print = print;

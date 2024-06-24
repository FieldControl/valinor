"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rlSplay = exports.lrSplay = exports.llSplay = exports.rrSplay = exports.lSplay = exports.rSplay = exports.splay = void 0;
const splay = (root, node, repeat) => {
    const p = node.p;
    if (!p)
        return root;
    const pp = p.p;
    const l2 = p.l === node;
    if (!pp) {
        if (l2)
            (0, exports.rSplay)(node, p);
        else
            (0, exports.lSplay)(node, p);
        return node;
    }
    const l1 = pp.l === p;
    if (l1) {
        if (l2) {
            root = (0, exports.llSplay)(root, node, p, pp);
        }
        else {
            root = (0, exports.lrSplay)(root, node, p, pp);
        }
    }
    else {
        if (l2) {
            root = (0, exports.rlSplay)(root, node, p, pp);
        }
        else {
            root = (0, exports.rrSplay)(root, node, p, pp);
        }
    }
    if (repeat > 1)
        return (0, exports.splay)(root, node, repeat - 1);
    return root;
};
exports.splay = splay;
const rSplay = (c2, c1) => {
    const b = c2.r;
    c2.p = undefined;
    c2.r = c1;
    c1.p = c2;
    c1.l = b;
    if (b)
        b.p = c1;
};
exports.rSplay = rSplay;
const lSplay = (c2, c1) => {
    const b = c2.l;
    c2.p = undefined;
    c2.l = c1;
    c1.p = c2;
    c1.r = b;
    if (b)
        b.p = c1;
};
exports.lSplay = lSplay;
const rrSplay = (root, c3, c2, c1) => {
    const b = c2.l;
    const c = c3.l;
    const p = c1.p;
    c3.p = p;
    c3.l = c2;
    c2.p = c3;
    c2.l = c1;
    c2.r = c;
    c1.p = c2;
    c1.r = b;
    if (b)
        b.p = c1;
    if (c)
        c.p = c2;
    if (!p)
        root = c3;
    else if (p.l === c1)
        p.l = c3;
    else
        p.r = c3;
    return root;
};
exports.rrSplay = rrSplay;
const llSplay = (root, c3, c2, c1) => {
    const b = c2.r;
    const c = c3.r;
    const p = c1.p;
    c3.p = p;
    c3.r = c2;
    c2.p = c3;
    c2.l = c;
    c2.r = c1;
    c1.p = c2;
    c1.l = b;
    if (b)
        b.p = c1;
    if (c)
        c.p = c2;
    if (!p)
        root = c3;
    else if (p.l === c1)
        p.l = c3;
    else
        p.r = c3;
    return root;
};
exports.llSplay = llSplay;
const lrSplay = (root, c3, c2, c1) => {
    const c = c3.l;
    const d = c3.r;
    const p = c1.p;
    c3.p = p;
    c3.l = c2;
    c3.r = c1;
    c2.p = c3;
    c2.r = c;
    c1.p = c3;
    c1.l = d;
    if (c)
        c.p = c2;
    if (d)
        d.p = c1;
    if (!p)
        root = c3;
    else if (p.l === c1)
        p.l = c3;
    else
        p.r = c3;
    return root;
};
exports.lrSplay = lrSplay;
const rlSplay = (root, c3, c2, c1) => {
    const c = c3.r;
    const d = c3.l;
    const p = c1.p;
    c3.p = p;
    c3.l = c1;
    c3.r = c2;
    c2.p = c3;
    c2.l = c;
    c1.p = c3;
    c1.r = d;
    if (c)
        c.p = c2;
    if (d)
        d.p = c1;
    if (!p)
        root = c3;
    else if (p.l === c1)
        p.l = c3;
    else
        p.r = c3;
    return root;
};
exports.rlSplay = rlSplay;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splay2 = void 0;
const splay2 = (root, node) => {
    const p = node.p2;
    if (!p)
        return root;
    const pp = p.p2;
    const l2 = p.l2 === node;
    if (!pp) {
        if (l2)
            rSplay2(node, p);
        else
            lSplay2(node, p);
        return node;
    }
    const l1 = pp.l2 === p;
    if (l1) {
        if (l2) {
            root = llSplay2(root, node, p, pp);
        }
        else {
            root = lrSplay2(root, node, p, pp);
        }
    }
    else {
        if (l2) {
            root = rlSplay2(root, node, p, pp);
        }
        else {
            root = rrSplay2(root, node, p, pp);
        }
    }
    return (0, exports.splay2)(root, node);
};
exports.splay2 = splay2;
const rSplay2 = (c2, c1) => {
    const b = c2.r2;
    c2.p2 = undefined;
    c2.r2 = c1;
    c1.p2 = c2;
    c1.l2 = b;
    if (b)
        b.p2 = c1;
};
const lSplay2 = (c2, c1) => {
    const b = c2.l2;
    c2.p2 = undefined;
    c2.l2 = c1;
    c1.p2 = c2;
    c1.r2 = b;
    if (b)
        b.p2 = c1;
};
const rrSplay2 = (root, c3, c2, c1) => {
    const b = c2.l2;
    const c = c3.l2;
    const p = c1.p2;
    c3.p2 = p;
    c3.l2 = c2;
    c2.p2 = c3;
    c2.l2 = c1;
    c2.r2 = c;
    c1.p2 = c2;
    c1.r2 = b;
    if (b)
        b.p2 = c1;
    if (c)
        c.p2 = c2;
    if (!p)
        root = c3;
    else if (p.l2 === c1)
        p.l2 = c3;
    else
        p.r2 = c3;
    return root;
};
const llSplay2 = (root, c3, c2, c1) => {
    const b = c2.r2;
    const c = c3.r2;
    const p = c1.p2;
    c3.p2 = p;
    c3.r2 = c2;
    c2.p2 = c3;
    c2.l2 = c;
    c2.r2 = c1;
    c1.p2 = c2;
    c1.l2 = b;
    if (b)
        b.p2 = c1;
    if (c)
        c.p2 = c2;
    if (!p)
        root = c3;
    else if (p.l2 === c1)
        p.l2 = c3;
    else
        p.r2 = c3;
    return root;
};
const lrSplay2 = (root, c3, c2, c1) => {
    const c = c3.l2;
    const d = c3.r2;
    const p = c1.p2;
    c3.p2 = p;
    c3.l2 = c2;
    c3.r2 = c1;
    c2.p2 = c3;
    c2.r2 = c;
    c1.p2 = c3;
    c1.l2 = d;
    if (c)
        c.p2 = c2;
    if (d)
        d.p2 = c1;
    if (!p)
        root = c3;
    else if (p.l2 === c1)
        p.l2 = c3;
    else
        p.r2 = c3;
    return root;
};
const rlSplay2 = (root, c3, c2, c1) => {
    const c = c3.r2;
    const d = c3.l2;
    const p = c1.p2;
    c3.p2 = p;
    c3.l2 = c1;
    c3.r2 = c2;
    c2.p2 = c3;
    c2.l2 = c;
    c1.p2 = c3;
    c1.r2 = d;
    if (c)
        c.p2 = c2;
    if (d)
        d.p2 = c1;
    if (!p)
        root = c3;
    else if (p.l2 === c1)
        p.l2 = c3;
    else
        p.r2 = c3;
    return root;
};

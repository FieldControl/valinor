"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = exports.remove = exports.insert = exports.insertLeft = exports.insertRight = void 0;
const printBinary_1 = require("../print/printBinary");
const stringify = JSON.stringify;
const rebalanceAfterInsert = (root, node, child) => {
    const p = node.p;
    if (!p)
        return root;
    const isLeft = node === p.l;
    let bf = p.bf | 0;
    if (isLeft)
        p.bf = ++bf;
    else
        p.bf = --bf;
    switch (bf) {
        case 0:
            return root;
        case 1:
        case -1:
            return rebalanceAfterInsert(root, p, node);
        default: {
            const isChildLeft = child === node.l;
            if (isLeft) {
                if (isChildLeft)
                    return llRotate(p, node), node.p ? root : node;
                else
                    return lrRotate(p, node, child), child.p ? root : child;
            }
            else {
                if (isChildLeft)
                    return rlRotate(p, node, child), child.p ? root : child;
                else
                    return rrRotate(p, node), node.p ? root : node;
            }
        }
    }
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
    let nbf = n.bf;
    let nlbf = nl.bf;
    nbf += -1 - (nlbf > 0 ? nlbf : 0);
    nlbf += -1 + (nbf < 0 ? nbf : 0);
    n.bf = nbf;
    nl.bf = nlbf;
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
    let nbf = n.bf;
    let nrbf = nr.bf;
    nbf += 1 - (nrbf < 0 ? nrbf : 0);
    nrbf += 1 + (nbf > 0 ? nbf : 0);
    n.bf = nbf;
    nr.bf = nrbf;
};
const lrRotate = (n, nl, nlr) => {
    rrRotate(nl, nlr);
    llRotate(n, nlr);
};
const rlRotate = (n, nr, nrl) => {
    llRotate(nr, nrl);
    rrRotate(n, nrl);
};
const insertRight = (root, n, p) => {
    p.r = n;
    n.p = p;
    p.bf--;
    return p.l ? root : rebalanceAfterInsert(root, p, n);
};
exports.insertRight = insertRight;
const insertLeft = (root, n, p) => {
    p.l = n;
    n.p = p;
    p.bf++;
    return p.r ? root : rebalanceAfterInsert(root, p, n);
};
exports.insertLeft = insertLeft;
const insert = (root, node, comparator) => {
    if (!root)
        return node;
    const key = node.k;
    let curr = root;
    let next = undefined;
    let cmp = 0;
    while ((next = ((cmp = comparator(key, curr.k)) < 0 ? curr.l : curr.r)))
        curr = next;
    return (cmp < 0 ? (0, exports.insertLeft)(root, node, curr) : (0, exports.insertRight)(root, node, curr));
};
exports.insert = insert;
const remove = (root, n) => {
    if (!root)
        return n;
    const p = n.p;
    const l = n.l;
    const r = n.r;
    n.p = n.l = n.r = undefined;
    if (l && r) {
        const lr = l.r;
        if (!lr) {
            p && (p.l === n ? (p.l = l) : (p.r = l));
            l.p = p;
            l.r = r;
            r.p = l;
            const nbf = n.bf;
            if (p)
                return (l.bf = nbf), lRebalance(root, l, 1);
            const lbf = nbf - 1;
            l.bf = lbf;
            if (lbf >= -1)
                return l;
            const rl = r.l;
            return r.bf > 0 ? (rlRotate(l, r, rl), rl) : (rrRotate(l, r), r);
        }
        else {
            let v = l;
            let tmp = v;
            while ((tmp = v.r))
                v = tmp;
            const vl = v.l;
            const vp = v.p;
            const vc = vl;
            p && (p.l === n ? (p.l = v) : (p.r = v));
            v.p = p;
            v.r = r;
            v.bf = n.bf;
            l !== v && ((v.l = l), (l.p = v));
            r.p = v;
            vp && (vp.l === v ? (vp.l = vc) : (vp.r = vc));
            vc && (vc.p = vp);
            return rRebalance(p ? root : v, vp, 1);
        }
    }
    const c = (l || r);
    c && (c.p = p);
    if (!p)
        return c;
    return p.l === n ? ((p.l = c), lRebalance(root, p, 1)) : ((p.r = c), rRebalance(root, p, 1));
};
exports.remove = remove;
const lRebalance = (root, n, d) => {
    let bf = n.bf | 0;
    bf -= d;
    n.bf = bf;
    let nextD = d;
    if (bf === -1)
        return root;
    if (bf < -1) {
        const u = n.r;
        if (u.bf <= 0) {
            if (u.l && u.bf === 0)
                nextD = 0;
            rrRotate(n, u);
            n = u;
        }
        else {
            const ul = u.l;
            rlRotate(n, u, ul);
            n = ul;
        }
    }
    const p = n.p;
    if (!p)
        return n;
    return p.l === n ? lRebalance(root, p, nextD) : rRebalance(root, p, nextD);
};
const rRebalance = (root, n, d) => {
    let bf = n.bf | 0;
    bf += d;
    n.bf = bf;
    let nextD = d;
    if (bf === 1)
        return root;
    if (bf > 1) {
        const u = n.l;
        if (u.bf >= 0) {
            if (u.r && u.bf === 0)
                nextD = 0;
            llRotate(n, u);
            n = u;
        }
        else {
            const ur = u.r;
            lrRotate(n, u, ur);
            n = ur;
        }
    }
    const p = n.p;
    if (!p)
        return n;
    return p.l === n ? lRebalance(root, p, nextD) : rRebalance(root, p, nextD);
};
const print = (node, tab = '') => {
    if (!node)
        return '∅';
    const { bf, l, r, k, v } = node;
    const vFormatted = v && typeof v === 'object' && v.constructor === Object
        ? stringify(v)
        : v && typeof v === 'object'
            ? v.toString(tab)
            : stringify(v);
    const content = k !== undefined ? ` { ${stringify(k)} = ${vFormatted} }` : '';
    const bfFormatted = bf ? ` [${bf}]` : '';
    return (node.constructor.name +
        `${bfFormatted}` +
        content +
        (0, printBinary_1.printBinary)(tab, [l ? (tab) => (0, exports.print)(l, tab) : null, r ? (tab) => (0, exports.print)(r, tab) : null]));
};
exports.print = print;

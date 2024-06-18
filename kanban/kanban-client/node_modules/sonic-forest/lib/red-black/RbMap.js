"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbMap = exports.RbNode = void 0;
const util_1 = require("./util");
const printTree_1 = require("../print/printTree");
const util_2 = require("../util");
class RbNode {
    constructor(k, v) {
        this.k = k;
        this.v = v;
        this.p = undefined;
        this.l = undefined;
        this.r = undefined;
        this.b = false;
    }
}
exports.RbNode = RbNode;
const defaultComparator = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
class RbMap {
    constructor(comparator) {
        this.root = undefined;
        this.comparator = comparator || defaultComparator;
    }
    insert(k, v) {
        const item = new RbNode(k, v);
        this.root = (0, util_1.insert)(this.root, item, this.comparator);
        return item;
    }
    set(k, v) {
        const root = this.root;
        if (!root)
            return this.insert(k, v);
        const comparator = this.comparator;
        let next = root, curr = next;
        let cmp = 0;
        do {
            curr = next;
            cmp = comparator(k, curr.k);
            if (cmp === 0)
                return (curr.v = v), curr;
        } while ((next = cmp < 0 ? curr.l : curr.r));
        const node = new RbNode(k, v);
        this.root =
            cmp < 0 ? (0, util_1.insertLeft)(root, node, curr) : (0, util_1.insertRight)(root, node, curr);
        return node;
    }
    find(k) {
        const comparator = this.comparator;
        let curr = this.root;
        while (curr) {
            const cmp = comparator(k, curr.k);
            if (cmp === 0)
                return curr;
            curr = cmp < 0 ? curr.l : curr.r;
        }
        return undefined;
    }
    get(k) {
        return this.find(k)?.v;
    }
    has(k) {
        return !!this.find(k);
    }
    getOrNextLower(k) {
        return (0, util_2.findOrNextLower)(this.root, k, this.comparator) || undefined;
    }
    forEach(fn) {
        const root = this.root;
        if (!root)
            return;
        let curr = (0, util_2.first)(root);
        do
            fn(curr);
        while ((curr = (0, util_2.next)(curr)));
    }
    toString(tab) {
        return this.constructor.name + (0, printTree_1.printTree)(tab, [(tab) => (0, util_1.print)(this.root, tab)]);
    }
}
exports.RbMap = RbMap;

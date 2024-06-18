"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvlMap = exports.AvlNode = void 0;
const util_1 = require("./util");
const printTree_1 = require("../print/printTree");
const util_2 = require("../util");
class AvlNode {
    constructor(k, v) {
        this.k = k;
        this.v = v;
        this.p = undefined;
        this.l = undefined;
        this.r = undefined;
        this.bf = 0;
    }
}
exports.AvlNode = AvlNode;
const defaultComparator = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
class AvlMap {
    constructor(comparator) {
        this.root = undefined;
        this._size = 0;
        this.next = util_2.next;
        this.comparator = comparator || defaultComparator;
    }
    insert(k, v) {
        const item = new AvlNode(k, v);
        this.root = (0, util_1.insert)(this.root, item, this.comparator);
        this._size++;
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
        const node = new AvlNode(k, v);
        this.root =
            cmp < 0 ? (0, util_1.insertLeft)(root, node, curr) : (0, util_1.insertRight)(root, node, curr);
        this._size++;
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
    del(k) {
        const node = this.find(k);
        if (!node)
            return false;
        this.root = (0, util_1.remove)(this.root, node);
        this._size--;
        return true;
    }
    clear() {
        this._size = 0;
        this.root = undefined;
    }
    has(k) {
        return !!this.find(k);
    }
    size() {
        return this._size;
    }
    isEmpty() {
        return !this.root;
    }
    getOrNextLower(k) {
        return (0, util_2.findOrNextLower)(this.root, k, this.comparator) || undefined;
    }
    forEach(fn) {
        let curr = this.first();
        if (!curr)
            return;
        do
            fn(curr);
        while ((curr = (0, util_2.next)(curr)));
    }
    first() {
        const root = this.root;
        return root ? (0, util_2.first)(root) : undefined;
    }
    iterator0() {
        let curr = this.first();
        return () => {
            if (!curr)
                return;
            const value = curr;
            curr = (0, util_2.next)(curr);
            return value;
        };
    }
    iterator() {
        const iterator = this.iterator0();
        return {
            next: () => {
                const value = iterator();
                const res = { value, done: !value };
                return res;
            },
        };
    }
    entries() {
        return { [Symbol.iterator]: () => this.iterator() };
    }
    toString(tab) {
        return this.constructor.name + (0, printTree_1.printTree)(tab, [(tab) => (0, util_1.print)(this.root, tab)]);
    }
}
exports.AvlMap = AvlMap;

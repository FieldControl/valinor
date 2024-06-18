"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvlSet = exports.AvlSetNode = void 0;
const util_1 = require("./util");
const printTree_1 = require("../print/printTree");
const util_2 = require("../util");
class AvlSetNode {
    constructor(k) {
        this.k = k;
        this.p = undefined;
        this.l = undefined;
        this.r = undefined;
        this.bf = 0;
        this.v = undefined;
    }
}
exports.AvlSetNode = AvlSetNode;
const defaultComparator = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
class AvlSet {
    constructor(comparator) {
        this.root = undefined;
        this.next = util_2.next;
        this.comparator = comparator || defaultComparator;
    }
    insert(value) {
        const item = new AvlSetNode(value);
        this.root = (0, util_1.insert)(this.root, item, this.comparator);
        return item;
    }
    add(value) {
        const root = this.root;
        if (!root)
            return this.insert(value);
        const comparator = this.comparator;
        let next = root, curr = next;
        let cmp = 0;
        do {
            curr = next;
            cmp = comparator(value, curr.k);
            if (cmp === 0)
                return curr;
        } while ((next = cmp < 0 ? curr.l : curr.r));
        const node = new AvlSetNode(value);
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
    del(k) {
        const node = this.find(k);
        if (!node)
            return;
        this.root = (0, util_1.remove)(this.root, node);
    }
    clear() {
        this.root = undefined;
    }
    has(k) {
        return !!this.find(k);
    }
    size() {
        const root = this.root;
        if (!root)
            return 0;
        let curr = (0, util_2.first)(root);
        let size = 1;
        while ((curr = (0, util_2.next)(curr)))
            size++;
        return size;
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
                return undefined;
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
exports.AvlSet = AvlSet;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = void 0;
const util_1 = require("./util");
const util_2 = require("./splay/util");
const TreeNode_1 = require("./TreeNode");
const defaultComparator = (a, b) => a - b;
class Tree {
    constructor(comparator = defaultComparator) {
        this.comparator = comparator;
        this.root = undefined;
        this.size = 0;
    }
    set(key, value) {
        const node = new TreeNode_1.TreeNode(key, value);
        this.root = (0, util_1.insert)(this.root, node, this.comparator);
        this.root = (0, util_2.splay)(this.root, node, 15);
        this.size++;
    }
    setFast(key, value) {
        const node = new TreeNode_1.TreeNode(key, value);
        this.root = (0, util_1.insert)(this.root, node, this.comparator);
        this.size++;
    }
    get(key) {
        const node = (0, util_1.find)(this.root, key, this.comparator);
        return node ? node.v : undefined;
    }
    getOrNextLower(key) {
        const node = (0, util_1.findOrNextLower)(this.root, key, this.comparator);
        return node ? node.v : undefined;
    }
    has(key) {
        return !!(0, util_1.find)(this.root, key, this.comparator);
    }
    delete(key) {
        const node = (0, util_1.find)(this.root, key, this.comparator);
        if (!node)
            return undefined;
        this.root = (0, util_1.remove)(this.root, node);
        this.size--;
        return node.v;
    }
    max() {
        return (0, util_1.last)(this.root)?.v;
    }
    iterator() {
        let curr = (0, util_1.first)(this.root);
        return () => {
            const res = curr;
            if (curr)
                curr = (0, util_1.next)(curr);
            return res ? res.v : undefined;
        };
    }
    toString(tab = '') {
        return `${this.constructor.name}${this.root ? this.toStringNode(this.root, tab + '', '') : ' ∅'}`;
    }
    toStringNode(node, tab, side) {
        let str = `\n${tab}${side === 'l' ? ' ←' : side === 'r' ? ' →' : '└─'} ${node.constructor.name} ${node.k}`;
        if (node.l)
            str += this.toStringNode(node.l, tab + '  ', 'l');
        if (node.r)
            str += this.toStringNode(node.r, tab + '  ', 'r');
        return str;
    }
}
exports.Tree = Tree;

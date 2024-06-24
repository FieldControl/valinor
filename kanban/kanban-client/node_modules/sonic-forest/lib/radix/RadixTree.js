"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadixTree = void 0;
const TrieNode_1 = require("../trie/TrieNode");
const radix_1 = require("./radix");
class RadixTree extends TrieNode_1.TrieNode {
    constructor() {
        super('', undefined);
        this.size = 0;
    }
    set(key, value) {
        this.size += (0, radix_1.insert)(this, key, value);
    }
    get(key) {
        const node = (0, radix_1.find)(this, key);
        return node && node.v;
    }
    delete(key) {
        const removed = (0, radix_1.remove)(this, key);
        if (removed)
            this.size--;
        return removed;
    }
}
exports.RadixTree = RadixTree;

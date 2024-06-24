"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrieNode = void 0;
const radix_1 = require("../radix/radix");
const util_1 = require("../util");
class TrieNode {
    constructor(k, v) {
        this.k = k;
        this.v = v;
        this.p = undefined;
        this.l = undefined;
        this.r = undefined;
        this.children = undefined;
    }
    forChildren(callback) {
        let child = (0, util_1.first)(this.children);
        let i = 0;
        while (child) {
            callback(child, 0);
            i++;
            child = (0, util_1.next)(child);
        }
    }
    toRecord(prefix, record) {
        return (0, radix_1.toRecord)(this, prefix, record);
    }
    toString(tab = '') {
        return (0, radix_1.print)(this, tab);
    }
}
exports.TrieNode = TrieNode;

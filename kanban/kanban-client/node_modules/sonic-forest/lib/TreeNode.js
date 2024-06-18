"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNode = void 0;
class TreeNode {
    constructor(k, v) {
        this.k = k;
        this.v = v;
        this.p = undefined;
        this.l = undefined;
        this.r = undefined;
    }
}
exports.TreeNode = TreeNode;

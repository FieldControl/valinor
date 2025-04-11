"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopologyTree = void 0;
const tree_node_1 = require("./tree-node");
class TopologyTree {
    constructor(moduleRef) {
        this.links = new Map();
        this.root = new tree_node_1.TreeNode({
            value: moduleRef,
            parent: null,
        });
        this.links.set(moduleRef, this.root);
        this.traverseAndMapToTree(this.root);
    }
    walk(callback) {
        function walkNode(node, depth = 1) {
            callback(node.value, depth);
            node.children.forEach(child => walkNode(child, depth + 1));
        }
        walkNode(this.root);
    }
    traverseAndMapToTree(node, depth = 1) {
        if (!node.value.imports) {
            return;
        }
        node.value.imports.forEach(child => {
            if (!child) {
                return;
            }
            if (this.links.has(child)) {
                const existingSubtree = this.links.get(child);
                if (node.hasCycleWith(child)) {
                    return;
                }
                const existingDepth = existingSubtree.getDepth();
                if (existingDepth < depth) {
                    existingSubtree.relink(node);
                }
                return;
            }
            const childNode = new tree_node_1.TreeNode({
                value: child,
                parent: node,
            });
            node.addChild(childNode);
            this.links.set(child, childNode);
            this.traverseAndMapToTree(childNode, depth + 1);
        });
    }
}
exports.TopologyTree = TopologyTree;

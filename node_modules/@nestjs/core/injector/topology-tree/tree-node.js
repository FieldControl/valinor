"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNode = void 0;
class TreeNode {
    constructor({ value, parent }) {
        this.children = new Set();
        this.value = value;
        this.parent = parent;
    }
    addChild(child) {
        this.children.add(child);
    }
    removeChild(child) {
        this.children.delete(child);
    }
    relink(parent) {
        this.parent?.removeChild(this);
        this.parent = parent;
        this.parent.addChild(this);
    }
    getDepth() {
        const visited = new Set();
        let depth = 0;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = this;
        while (current) {
            depth++;
            current = current.parent;
            // Stop on cycle
            if (visited.has(current)) {
                return -1;
            }
            visited.add(current);
        }
        return depth;
    }
    hasCycleWith(target) {
        const visited = new Set();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = this;
        while (current) {
            if (current.value === target) {
                return true;
            }
            current = current.parent;
            if (visited.has(current)) {
                return false;
            }
            visited.add(current);
        }
        return false;
    }
}
exports.TreeNode = TreeNode;

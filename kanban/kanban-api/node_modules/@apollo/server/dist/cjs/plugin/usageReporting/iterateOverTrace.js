"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateOverTrace = void 0;
function iterateOverTrace(trace, f, includePath) {
    const rootPath = includePath
        ? new RootCollectingPathsResponseNamePath()
        : notCollectingPathsResponseNamePath;
    if (trace.root) {
        if (iterateOverTraceNode(trace.root, rootPath, f))
            return;
    }
    if (trace.queryPlan) {
        if (iterateOverQueryPlan(trace.queryPlan, rootPath, f))
            return;
    }
}
exports.iterateOverTrace = iterateOverTrace;
function iterateOverQueryPlan(node, rootPath, f) {
    if (!node)
        return false;
    if (node.fetch?.trace?.root && node.fetch.serviceName) {
        return iterateOverTraceNode(node.fetch.trace.root, rootPath.child(`service:${node.fetch.serviceName}`), f);
    }
    if (node.flatten?.node) {
        return iterateOverQueryPlan(node.flatten.node, rootPath, f);
    }
    if (node.parallel?.nodes) {
        return node.parallel.nodes.some((node) => iterateOverQueryPlan(node, rootPath, f));
    }
    if (node.sequence?.nodes) {
        return node.sequence.nodes.some((node) => iterateOverQueryPlan(node, rootPath, f));
    }
    return false;
}
function iterateOverTraceNode(node, path, f) {
    if (f(node, path)) {
        return true;
    }
    return (node.child?.some((child) => {
        const childPath = child.responseName
            ? path.child(child.responseName)
            : path;
        return iterateOverTraceNode(child, childPath, f);
    }) ?? false);
}
const notCollectingPathsResponseNamePath = {
    toArray() {
        throw Error('not collecting paths!');
    },
    child() {
        return this;
    },
};
class RootCollectingPathsResponseNamePath {
    toArray() {
        return [];
    }
    child(responseName) {
        return new ChildCollectingPathsResponseNamePath(responseName, this);
    }
}
class ChildCollectingPathsResponseNamePath {
    constructor(responseName, prev) {
        this.responseName = responseName;
        this.prev = prev;
    }
    toArray() {
        const out = [];
        let curr = this;
        while (curr instanceof ChildCollectingPathsResponseNamePath) {
            out.push(curr.responseName);
            curr = curr.prev;
        }
        return out.reverse();
    }
    child(responseName) {
        return new ChildCollectingPathsResponseNamePath(responseName, this);
    }
}
//# sourceMappingURL=iterateOverTrace.js.map
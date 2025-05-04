"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialGraphHost = void 0;
class PartialGraphHost {
    static toJSON() {
        var _a;
        return (_a = this.partialGraph) === null || _a === void 0 ? void 0 : _a.toJSON();
    }
    static toString() {
        var _a;
        return (_a = this.partialGraph) === null || _a === void 0 ? void 0 : _a.toString();
    }
    static register(partialGraph) {
        this.partialGraph = partialGraph;
    }
}
exports.PartialGraphHost = PartialGraphHost;

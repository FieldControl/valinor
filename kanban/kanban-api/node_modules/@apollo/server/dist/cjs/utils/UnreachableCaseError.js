"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnreachableCaseError = void 0;
class UnreachableCaseError extends Error {
    constructor(val) {
        super(`Unreachable case: ${val}`);
    }
}
exports.UnreachableCaseError = UnreachableCaseError;
//# sourceMappingURL=UnreachableCaseError.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannotDetermineInputTypeError = void 0;
class CannotDetermineInputTypeError extends Error {
    constructor(hostType, typeRef) {
        const inputObjectName = typeof typeRef === 'function' && typeRef.name;
        super(`Cannot determine a GraphQL input type ${inputObjectName ? `("${inputObjectName}")` : null} for the "${hostType}". Make sure your class is decorated with an appropriate decorator.`);
    }
}
exports.CannotDetermineInputTypeError = CannotDetermineInputTypeError;

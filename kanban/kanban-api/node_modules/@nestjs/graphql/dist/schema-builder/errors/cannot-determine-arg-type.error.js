"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannotDetermineArgTypeError = void 0;
class CannotDetermineArgTypeError extends Error {
    constructor(hostType, param) {
        super(`"${hostType}" cannot be found in the registry (${param.target.name}#${param.methodName}). This is often caused by missing argument name in the method signature. A potential fix: change @Args() to @Args('argumentName').`);
    }
}
exports.CannotDetermineArgTypeError = CannotDetermineArgTypeError;

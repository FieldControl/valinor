"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannotDetermineHostTypeError = void 0;
class CannotDetermineHostTypeError extends Error {
    constructor(externalField, hostType) {
        super(`Cannot determine a GraphQL host type ${hostType ? ` (${hostType}?) ` : ``}for the "${externalField}" field. Make sure your class is decorated with an appropriate decorator (e.g., @ObjectType()).`);
    }
}
exports.CannotDetermineHostTypeError = CannotDetermineHostTypeError;

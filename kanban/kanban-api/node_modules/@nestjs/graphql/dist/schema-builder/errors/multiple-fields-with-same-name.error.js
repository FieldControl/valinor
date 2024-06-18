"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleFieldsWithSameNameError = void 0;
class MultipleFieldsWithSameNameError extends Error {
    constructor(field, objectTypeName) {
        super(`Cannot define multiple fields with the same name "${field}" for type "${objectTypeName}"`);
    }
}
exports.MultipleFieldsWithSameNameError = MultipleFieldsWithSameNameError;

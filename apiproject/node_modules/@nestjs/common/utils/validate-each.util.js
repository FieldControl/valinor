"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDecoratorItemException = void 0;
exports.validateEach = validateEach;
class InvalidDecoratorItemException extends Error {
    constructor(decorator, item, context) {
        const message = `Invalid ${item} passed to ${decorator}() decorator (${context}).`;
        super(message);
        this.msg = message;
    }
    what() {
        return this.msg;
    }
}
exports.InvalidDecoratorItemException = InvalidDecoratorItemException;
function validateEach(context, arr, predicate, decorator, item) {
    if (!context || !context.name) {
        return true;
    }
    const errors = arr.some(str => !predicate(str));
    if (errors) {
        throw new InvalidDecoratorItemException(decorator, item, context.name);
    }
    return true;
}

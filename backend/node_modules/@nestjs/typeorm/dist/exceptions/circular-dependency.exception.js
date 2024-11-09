"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularDependencyException = void 0;
class CircularDependencyException extends Error {
    constructor(context) {
        const ctx = context ? ` inside ${context}` : ``;
        super(`A circular dependency has been detected${ctx}. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". Also, try to eliminate barrel files because they can lead to an unexpected behavior too.`);
    }
}
exports.CircularDependencyException = CircularDependencyException;

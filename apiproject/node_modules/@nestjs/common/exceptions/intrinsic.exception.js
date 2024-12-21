"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntrinsicException = void 0;
/**
 * Exception that represents an intrinsic error in the application.
 * When thrown, the default exception filter will not log the error message.
 *
 * @publicApi
 */
class IntrinsicException extends Error {
}
exports.IntrinsicException = IntrinsicException;

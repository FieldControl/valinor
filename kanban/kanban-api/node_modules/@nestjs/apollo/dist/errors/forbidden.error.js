"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const graphql_1 = require("graphql");
/**
 * This error is thrown when the user is not authorized to access a resource.
 *
 * "ForbiddenError" class was removed in the latest version of Apollo Server (4.0.0)
 * It was moved to the @nestjs/apollo package to avoid regressions & make migration easier.
 */
class ForbiddenError extends graphql_1.GraphQLError {
    constructor(message, options) {
        super(message, {
            ...options,
            extensions: {
                code: 'FORBIDDEN',
                ...options?.extensions,
            },
        });
    }
}
exports.ForbiddenError = ForbiddenError;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const errors_1 = require("@apollo/server/errors");
const graphql_1 = require("graphql");
/**
 * This error is thrown when the user input does not pass validation.
 *
 * "ValidationError" class was removed in the latest version of Apollo Server (4.0.0)
 * It was moved to the @nestjs/apollo package to avoid regressions & make migration easier.
 */
class ValidationError extends graphql_1.GraphQLError {
    constructor(message, options) {
        super(message, {
            ...options,
            extensions: {
                code: errors_1.ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
                ...options?.extensions,
            },
        });
    }
}
exports.ValidationError = ValidationError;

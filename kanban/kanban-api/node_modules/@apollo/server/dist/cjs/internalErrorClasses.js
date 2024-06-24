"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = exports.OperationResolutionError = exports.UserInputError = exports.PersistedQueryNotSupportedError = exports.PersistedQueryNotFoundError = exports.ValidationError = exports.SyntaxError = void 0;
const graphql_1 = require("graphql");
const index_js_1 = require("./errors/index.js");
const runHttpQuery_js_1 = require("./runHttpQuery.js");
const HeaderMap_js_1 = require("./utils/HeaderMap.js");
class GraphQLErrorWithCode extends graphql_1.GraphQLError {
    constructor(message, code, options) {
        super(message, {
            ...options,
            extensions: { ...options?.extensions, code },
        });
        this.name = this.constructor.name;
    }
}
class SyntaxError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, index_js_1.ApolloServerErrorCode.GRAPHQL_PARSE_FAILED, {
            source: graphqlError.source,
            positions: graphqlError.positions,
            extensions: { http: (0, runHttpQuery_js_1.newHTTPGraphQLHead)(400), ...graphqlError.extensions },
            originalError: graphqlError,
        });
    }
}
exports.SyntaxError = SyntaxError;
class ValidationError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, index_js_1.ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED, {
            nodes: graphqlError.nodes,
            extensions: {
                http: (0, runHttpQuery_js_1.newHTTPGraphQLHead)(400),
                ...graphqlError.extensions,
            },
            originalError: graphqlError.originalError ?? graphqlError,
        });
    }
}
exports.ValidationError = ValidationError;
const getPersistedQueryErrorHttp = () => ({
    status: 200,
    headers: new HeaderMap_js_1.HeaderMap([
        ['cache-control', 'private, no-cache, must-revalidate'],
    ]),
});
class PersistedQueryNotFoundError extends GraphQLErrorWithCode {
    constructor() {
        super('PersistedQueryNotFound', index_js_1.ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND, { extensions: { http: getPersistedQueryErrorHttp() } });
    }
}
exports.PersistedQueryNotFoundError = PersistedQueryNotFoundError;
class PersistedQueryNotSupportedError extends GraphQLErrorWithCode {
    constructor() {
        super('PersistedQueryNotSupported', index_js_1.ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED, { extensions: { http: getPersistedQueryErrorHttp() } });
    }
}
exports.PersistedQueryNotSupportedError = PersistedQueryNotSupportedError;
class UserInputError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, index_js_1.ApolloServerErrorCode.BAD_USER_INPUT, {
            nodes: graphqlError.nodes,
            originalError: graphqlError.originalError ?? graphqlError,
            extensions: graphqlError.extensions,
        });
    }
}
exports.UserInputError = UserInputError;
class OperationResolutionError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, index_js_1.ApolloServerErrorCode.OPERATION_RESOLUTION_FAILURE, {
            nodes: graphqlError.nodes,
            originalError: graphqlError.originalError ?? graphqlError,
            extensions: {
                http: (0, runHttpQuery_js_1.newHTTPGraphQLHead)(400),
                ...graphqlError.extensions,
            },
        });
    }
}
exports.OperationResolutionError = OperationResolutionError;
class BadRequestError extends GraphQLErrorWithCode {
    constructor(message, options) {
        super(message, index_js_1.ApolloServerErrorCode.BAD_REQUEST, {
            ...options,
            extensions: { http: (0, runHttpQuery_js_1.newHTTPGraphQLHead)(400), ...options?.extensions },
        });
    }
}
exports.BadRequestError = BadRequestError;
//# sourceMappingURL=internalErrorClasses.js.map
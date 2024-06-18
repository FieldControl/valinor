import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from './errors/index.js';
import { newHTTPGraphQLHead } from './runHttpQuery.js';
import { HeaderMap } from './utils/HeaderMap.js';
class GraphQLErrorWithCode extends GraphQLError {
    constructor(message, code, options) {
        super(message, {
            ...options,
            extensions: { ...options?.extensions, code },
        });
        this.name = this.constructor.name;
    }
}
export class SyntaxError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, ApolloServerErrorCode.GRAPHQL_PARSE_FAILED, {
            source: graphqlError.source,
            positions: graphqlError.positions,
            extensions: { http: newHTTPGraphQLHead(400), ...graphqlError.extensions },
            originalError: graphqlError,
        });
    }
}
export class ValidationError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED, {
            nodes: graphqlError.nodes,
            extensions: {
                http: newHTTPGraphQLHead(400),
                ...graphqlError.extensions,
            },
            originalError: graphqlError.originalError ?? graphqlError,
        });
    }
}
const getPersistedQueryErrorHttp = () => ({
    status: 200,
    headers: new HeaderMap([
        ['cache-control', 'private, no-cache, must-revalidate'],
    ]),
});
export class PersistedQueryNotFoundError extends GraphQLErrorWithCode {
    constructor() {
        super('PersistedQueryNotFound', ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND, { extensions: { http: getPersistedQueryErrorHttp() } });
    }
}
export class PersistedQueryNotSupportedError extends GraphQLErrorWithCode {
    constructor() {
        super('PersistedQueryNotSupported', ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED, { extensions: { http: getPersistedQueryErrorHttp() } });
    }
}
export class UserInputError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, ApolloServerErrorCode.BAD_USER_INPUT, {
            nodes: graphqlError.nodes,
            originalError: graphqlError.originalError ?? graphqlError,
            extensions: graphqlError.extensions,
        });
    }
}
export class OperationResolutionError extends GraphQLErrorWithCode {
    constructor(graphqlError) {
        super(graphqlError.message, ApolloServerErrorCode.OPERATION_RESOLUTION_FAILURE, {
            nodes: graphqlError.nodes,
            originalError: graphqlError.originalError ?? graphqlError,
            extensions: {
                http: newHTTPGraphQLHead(400),
                ...graphqlError.extensions,
            },
        });
    }
}
export class BadRequestError extends GraphQLErrorWithCode {
    constructor(message, options) {
        super(message, ApolloServerErrorCode.BAD_REQUEST, {
            ...options,
            extensions: { http: newHTTPGraphQLHead(400), ...options?.extensions },
        });
    }
}
//# sourceMappingURL=internalErrorClasses.js.map
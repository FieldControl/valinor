"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureGraphQLError = exports.ensureError = exports.normalizeAndFormatErrors = void 0;
const graphql_1 = require("graphql");
const index_js_1 = require("./errors/index.js");
const runHttpQuery_js_1 = require("./runHttpQuery.js");
const HeaderMap_js_1 = require("./utils/HeaderMap.js");
function normalizeAndFormatErrors(errors, options = {}) {
    const formatError = options.formatError ?? ((error) => error);
    const httpFromErrors = (0, runHttpQuery_js_1.newHTTPGraphQLHead)();
    return {
        httpFromErrors,
        formattedErrors: errors.map((error) => {
            try {
                return formatError(enrichError(error), error);
            }
            catch (formattingError) {
                if (options.includeStacktraceInErrorResponses) {
                    return enrichError(formattingError);
                }
                else {
                    return {
                        message: 'Internal server error',
                        extensions: { code: index_js_1.ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
                    };
                }
            }
        }),
    };
    function enrichError(maybeError) {
        const graphqlError = ensureGraphQLError(maybeError);
        const extensions = {
            ...graphqlError.extensions,
            code: graphqlError.extensions.code ??
                index_js_1.ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        };
        if (isPartialHTTPGraphQLHead(extensions.http)) {
            (0, runHttpQuery_js_1.mergeHTTPGraphQLHead)(httpFromErrors, {
                headers: new HeaderMap_js_1.HeaderMap(),
                ...extensions.http,
            });
            delete extensions.http;
        }
        if (options.includeStacktraceInErrorResponses) {
            extensions.stacktrace = graphqlError.stack?.split('\n');
        }
        return { ...graphqlError.toJSON(), extensions };
    }
}
exports.normalizeAndFormatErrors = normalizeAndFormatErrors;
function ensureError(maybeError) {
    return maybeError instanceof Error
        ? maybeError
        : new graphql_1.GraphQLError('Unexpected error value: ' + String(maybeError));
}
exports.ensureError = ensureError;
function ensureGraphQLError(maybeError, messagePrefixIfNotGraphQLError = '') {
    const error = ensureError(maybeError);
    return error instanceof graphql_1.GraphQLError
        ? error
        : new graphql_1.GraphQLError(messagePrefixIfNotGraphQLError + error.message, {
            originalError: error,
        });
}
exports.ensureGraphQLError = ensureGraphQLError;
function isPartialHTTPGraphQLHead(x) {
    return (!!x &&
        typeof x === 'object' &&
        (!('status' in x) || typeof x.status === 'number') &&
        (!('headers' in x) || x.headers instanceof Map));
}
//# sourceMappingURL=errorNormalize.js.map
import { GraphQLError, } from 'graphql';
import { ApolloServerErrorCode } from './errors/index.js';
import { mergeHTTPGraphQLHead, newHTTPGraphQLHead } from './runHttpQuery.js';
import { HeaderMap } from './utils/HeaderMap.js';
export function normalizeAndFormatErrors(errors, options = {}) {
    const formatError = options.formatError ?? ((error) => error);
    const httpFromErrors = newHTTPGraphQLHead();
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
                        extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
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
                ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        };
        if (isPartialHTTPGraphQLHead(extensions.http)) {
            mergeHTTPGraphQLHead(httpFromErrors, {
                headers: new HeaderMap(),
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
export function ensureError(maybeError) {
    return maybeError instanceof Error
        ? maybeError
        : new GraphQLError('Unexpected error value: ' + String(maybeError));
}
export function ensureGraphQLError(maybeError, messagePrefixIfNotGraphQLError = '') {
    const error = ensureError(maybeError);
    return error instanceof GraphQLError
        ? error
        : new GraphQLError(messagePrefixIfNotGraphQLError + error.message, {
            originalError: error,
        });
}
function isPartialHTTPGraphQLHead(x) {
    return (!!x &&
        typeof x === 'object' &&
        (!('status' in x) || typeof x.status === 'number') &&
        (!('headers' in x) || x.headers instanceof Map));
}
//# sourceMappingURL=errorNormalize.js.map
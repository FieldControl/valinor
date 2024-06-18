import { GraphQLError, type GraphQLFormattedError } from 'graphql';
import type { HTTPGraphQLHead } from './externalTypes/http.js';
export declare function normalizeAndFormatErrors(errors: ReadonlyArray<unknown>, options?: {
    formatError?: (formattedError: GraphQLFormattedError, error: unknown) => GraphQLFormattedError;
    includeStacktraceInErrorResponses?: boolean;
}): {
    formattedErrors: Array<GraphQLFormattedError>;
    httpFromErrors: HTTPGraphQLHead;
};
export declare function ensureError(maybeError: unknown): Error;
export declare function ensureGraphQLError(maybeError: unknown, messagePrefixIfNotGraphQLError?: string): GraphQLError;
//# sourceMappingURL=errorNormalize.d.ts.map
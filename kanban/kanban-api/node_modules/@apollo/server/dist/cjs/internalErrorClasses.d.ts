import { GraphQLError, type GraphQLErrorOptions } from 'graphql';
import { ApolloServerErrorCode } from './errors/index.js';
declare class GraphQLErrorWithCode extends GraphQLError {
    constructor(message: string, code: ApolloServerErrorCode, options?: GraphQLErrorOptions);
}
export declare class SyntaxError extends GraphQLErrorWithCode {
    constructor(graphqlError: GraphQLError);
}
export declare class ValidationError extends GraphQLErrorWithCode {
    constructor(graphqlError: GraphQLError);
}
export declare class PersistedQueryNotFoundError extends GraphQLErrorWithCode {
    constructor();
}
export declare class PersistedQueryNotSupportedError extends GraphQLErrorWithCode {
    constructor();
}
export declare class UserInputError extends GraphQLErrorWithCode {
    constructor(graphqlError: GraphQLError);
}
export declare class OperationResolutionError extends GraphQLErrorWithCode {
    constructor(graphqlError: GraphQLError);
}
export declare class BadRequestError extends GraphQLErrorWithCode {
    constructor(message: string, options?: GraphQLErrorOptions);
}
export {};
//# sourceMappingURL=internalErrorClasses.d.ts.map
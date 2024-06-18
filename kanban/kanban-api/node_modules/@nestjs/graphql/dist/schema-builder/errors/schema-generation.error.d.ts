import { GraphQLError } from 'graphql';
export declare class SchemaGenerationError extends Error {
    readonly details: ReadonlyArray<GraphQLError>;
    constructor(details: ReadonlyArray<GraphQLError>);
}
//# sourceMappingURL=schema-generation.error.d.ts.map
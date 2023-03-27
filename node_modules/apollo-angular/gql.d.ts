import { TypedDocumentNode } from '@apollo/client/core';
declare function typedGQLTag<Result, Variables>(literals: ReadonlyArray<string> | Readonly<string>, ...placeholders: any[]): TypedDocumentNode<Result, Variables>;
export declare const gql: typeof typedGQLTag;
export declare const graphql: typeof typedGQLTag;
export {};

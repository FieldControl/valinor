import { DocumentNode, SelectionNode, FieldNode, ASTNode } from 'graphql';
import { ApolloCache } from '../cache';
import { FragmentMap, StoreObject } from '../utilities';
import { ApolloClient } from './ApolloClient';
import { Resolvers, OperationVariables } from './types';
import { FetchResult } from '../link/core';
export type Resolver = (rootValue?: any, args?: any, context?: any, info?: {
    field: FieldNode;
    fragmentMap: FragmentMap;
}) => any;
export type VariableMap = {
    [name: string]: any;
};
export type FragmentMatcher = (rootValue: any, typeCondition: string, context: any) => boolean;
export type ExecContext = {
    fragmentMap: FragmentMap;
    context: any;
    variables: VariableMap;
    fragmentMatcher: FragmentMatcher;
    defaultOperationType: string;
    exportedVariables: Record<string, any>;
    onlyRunForcedResolvers: boolean;
    selectionsToResolve: Set<SelectionNode>;
};
export type LocalStateOptions<TCacheShape> = {
    cache: ApolloCache<TCacheShape>;
    client?: ApolloClient<TCacheShape>;
    resolvers?: Resolvers | Resolvers[];
    fragmentMatcher?: FragmentMatcher;
};
export declare class LocalState<TCacheShape> {
    private cache;
    private client;
    private resolvers?;
    private fragmentMatcher;
    private selectionsToResolveCache;
    constructor({ cache, client, resolvers, fragmentMatcher, }: LocalStateOptions<TCacheShape>);
    addResolvers(resolvers: Resolvers | Resolvers[]): void;
    setResolvers(resolvers: Resolvers | Resolvers[]): void;
    getResolvers(): Resolvers;
    runResolvers<TData>({ document, remoteResult, context, variables, onlyRunForcedResolvers, }: {
        document: DocumentNode | null;
        remoteResult: FetchResult<TData>;
        context?: Record<string, any>;
        variables?: Record<string, any>;
        onlyRunForcedResolvers?: boolean;
    }): Promise<FetchResult<TData>>;
    setFragmentMatcher(fragmentMatcher: FragmentMatcher): void;
    getFragmentMatcher(): FragmentMatcher;
    clientQuery(document: DocumentNode): DocumentNode | null;
    serverQuery(document: DocumentNode): DocumentNode | null;
    prepareContext(context?: Record<string, any>): {
        cache: ApolloCache<TCacheShape>;
        getCacheKey(obj: StoreObject): string | undefined;
    };
    addExportedVariables(document: DocumentNode, variables?: OperationVariables, context?: {}): Promise<{
        [x: string]: any;
    }>;
    shouldForceResolvers(document: ASTNode): boolean;
    private buildRootValueFromCache;
    private resolveDocument;
    private resolveSelectionSet;
    private resolveField;
    private resolveSubSelectedArray;
    private collectSelectionsToResolve;
}
//# sourceMappingURL=LocalState.d.ts.map
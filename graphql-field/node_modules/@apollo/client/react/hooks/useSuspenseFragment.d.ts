import type { ApolloClient, DocumentNode, OperationVariables, Reference, StoreObject, TypedDocumentNode } from "../../core/index.js";
import type { FragmentType, MaybeMasked } from "../../masking/index.js";
import type { NoInfer, VariablesOption } from "../types/types.js";
type From<TData> = StoreObject | Reference | FragmentType<NoInfer<TData>> | string | null;
export type UseSuspenseFragmentOptions<TData, TVariables extends OperationVariables> = {
    /**
     * A GraphQL document created using the `gql` template string tag from
     * `graphql-tag` with one or more fragments which will be used to determine
     * the shape of data to read. If you provide more than one fragment in this
     * document then you must also specify `fragmentName` to select a single.
     */
    fragment: DocumentNode | TypedDocumentNode<TData, TVariables>;
    /**
     * The name of the fragment in your GraphQL document to be used. If you do
     * not provide a `fragmentName` and there is only one fragment in your
     * `fragment` document then that fragment will be used.
     */
    fragmentName?: string;
    from: From<TData>;
    optimistic?: boolean;
    /**
     * The instance of `ApolloClient` to use to look up the fragment.
     *
     * By default, the instance that's passed down via context is used, but you
     * can provide a different instance here.
     *
     * @docGroup 1. Operation options
     */
    client?: ApolloClient<any>;
} & VariablesOption<NoInfer<TVariables>>;
export type UseSuspenseFragmentResult<TData> = {
    data: MaybeMasked<TData>;
};
export declare function useSuspenseFragment<TData, TVariables extends OperationVariables = OperationVariables>(options: UseSuspenseFragmentOptions<TData, TVariables> & {
    from: NonNullable<From<TData>>;
}): UseSuspenseFragmentResult<TData>;
export declare function useSuspenseFragment<TData, TVariables extends OperationVariables = OperationVariables>(options: UseSuspenseFragmentOptions<TData, TVariables> & {
    from: null;
}): UseSuspenseFragmentResult<null>;
export declare function useSuspenseFragment<TData, TVariables extends OperationVariables = OperationVariables>(options: UseSuspenseFragmentOptions<TData, TVariables> & {
    from: From<TData>;
}): UseSuspenseFragmentResult<TData | null>;
export declare function useSuspenseFragment<TData, TVariables extends OperationVariables = OperationVariables>(options: UseSuspenseFragmentOptions<TData, TVariables>): UseSuspenseFragmentResult<TData>;
export {};
//# sourceMappingURL=useSuspenseFragment.d.ts.map
import * as React from "rehackt";
import { assertWrappedQueryRef, getWrappedPromise, unwrapQueryRef, updateWrappedQueryRef, wrapQueryRef, } from "../internal/index.js";
import { useApolloClient } from "./useApolloClient.js";
import { wrapHook } from "./internal/index.js";
/**
 * A React hook that returns a `refetch` and `fetchMore` function for a given
 * `queryRef`.
 *
 * This is useful to get access to handlers for a `queryRef` that was created by
 * `createQueryPreloader` or when the handlers for a `queryRef` produced in
 * a different component are inaccessible.
 *
 * @example
 * ```tsx
 * const MyComponent({ queryRef }) {
 *   const { refetch, fetchMore } = useQueryRefHandlers(queryRef);
 *
 *   // ...
 * }
 * ```
 * @since 3.9.0
 * @param queryRef - A `QueryRef` returned from `useBackgroundQuery`, `useLoadableQuery`, or `createQueryPreloader`.
 */
export function useQueryRefHandlers(queryRef) {
    var unwrapped = unwrapQueryRef(queryRef);
    var clientOrObsQuery = useApolloClient(unwrapped ?
        // passing an `ObservableQuery` is not supported by the types, but it will
        // return any truthy value that is passed in as an override so we cast the result
        unwrapped["observable"]
        : undefined);
    return wrapHook("useQueryRefHandlers", 
    // eslint-disable-next-line react-compiler/react-compiler
    useQueryRefHandlers_, clientOrObsQuery)(queryRef);
}
function useQueryRefHandlers_(queryRef) {
    assertWrappedQueryRef(queryRef);
    var _a = React.useState(queryRef), previousQueryRef = _a[0], setPreviousQueryRef = _a[1];
    var _b = React.useState(queryRef), wrappedQueryRef = _b[0], setWrappedQueryRef = _b[1];
    var internalQueryRef = unwrapQueryRef(queryRef);
    // To ensure we can support React transitions, this hook needs to manage the
    // queryRef state and apply React's state value immediately to the existing
    // queryRef since this hook doesn't return the queryRef directly
    if (previousQueryRef !== queryRef) {
        setPreviousQueryRef(queryRef);
        setWrappedQueryRef(queryRef);
    }
    else {
        updateWrappedQueryRef(queryRef, getWrappedPromise(wrappedQueryRef));
    }
    var refetch = React.useCallback(function (variables) {
        var promise = internalQueryRef.refetch(variables);
        setWrappedQueryRef(wrapQueryRef(internalQueryRef));
        return promise;
    }, [internalQueryRef]);
    var fetchMore = React.useCallback(function (options) {
        var promise = internalQueryRef.fetchMore(options);
        setWrappedQueryRef(wrapQueryRef(internalQueryRef));
        return promise;
    }, [internalQueryRef]);
    return {
        refetch: refetch,
        fetchMore: fetchMore,
        // TODO: The internalQueryRef doesn't have TVariables' type information so we have to cast it here
        subscribeToMore: internalQueryRef.observable
            .subscribeToMore,
    };
}
//# sourceMappingURL=useQueryRefHandlers.js.map
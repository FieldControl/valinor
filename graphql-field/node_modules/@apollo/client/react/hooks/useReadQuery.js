import * as React from "rehackt";
import { assertWrappedQueryRef, getWrappedPromise, unwrapQueryRef, updateWrappedQueryRef, } from "../internal/index.js";
import { __use, wrapHook } from "./internal/index.js";
import { toApolloError } from "./useSuspenseQuery.js";
import { useSyncExternalStore } from "./useSyncExternalStore.js";
import { useApolloClient } from "./useApolloClient.js";
export function useReadQuery(queryRef) {
    var unwrapped = unwrapQueryRef(queryRef);
    var clientOrObsQuery = useApolloClient(unwrapped ?
        // passing an `ObservableQuery` is not supported by the types, but it will
        // return any truthy value that is passed in as an override so we cast the result
        unwrapped["observable"]
        : undefined);
    return wrapHook("useReadQuery", 
    // eslint-disable-next-line react-compiler/react-compiler
    useReadQuery_, clientOrObsQuery)(queryRef);
}
function useReadQuery_(queryRef) {
    assertWrappedQueryRef(queryRef);
    var internalQueryRef = React.useMemo(function () { return unwrapQueryRef(queryRef); }, [queryRef]);
    var getPromise = React.useCallback(function () { return getWrappedPromise(queryRef); }, [queryRef]);
    if (internalQueryRef.disposed) {
        internalQueryRef.reinitialize();
        updateWrappedQueryRef(queryRef, internalQueryRef.promise);
    }
    React.useEffect(function () { return internalQueryRef.retain(); }, [internalQueryRef]);
    var promise = useSyncExternalStore(React.useCallback(function (forceUpdate) {
        return internalQueryRef.listen(function (promise) {
            updateWrappedQueryRef(queryRef, promise);
            forceUpdate();
        });
    }, [internalQueryRef, queryRef]), getPromise, getPromise);
    var result = __use(promise);
    return React.useMemo(function () {
        return {
            data: result.data,
            networkStatus: result.networkStatus,
            error: toApolloError(result),
        };
    }, [result]);
}
//# sourceMappingURL=useReadQuery.js.map
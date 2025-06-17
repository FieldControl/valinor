import { __assign } from "tslib";
import { canonicalStringify } from "../../cache/index.js";
import { useApolloClient } from "./useApolloClient.js";
import { getSuspenseCache } from "../internal/index.js";
import * as React from "rehackt";
import { __use } from "./internal/__use.js";
import { wrapHook } from "./internal/index.js";
var NULL_PLACEHOLDER = [];
export function useSuspenseFragment(options) {
    return wrapHook("useSuspenseFragment", 
    // eslint-disable-next-line react-compiler/react-compiler
    useSuspenseFragment_, useApolloClient(typeof options === "object" ? options.client : undefined))(options);
}
function useSuspenseFragment_(options) {
    var client = useApolloClient(options.client);
    var from = options.from, variables = options.variables;
    var cache = client.cache;
    var id = React.useMemo(function () {
        return typeof from === "string" ? from
            : from === null ? null
                : cache.identify(from);
    }, [cache, from]);
    var fragmentRef = id === null ? null : (getSuspenseCache(client).getFragmentRef([id, options.fragment, canonicalStringify(variables)], client, __assign(__assign({}, options), { variables: variables, from: id })));
    var _a = React.useState(fragmentRef === null ? NULL_PLACEHOLDER : ([fragmentRef.key, fragmentRef.promise])), current = _a[0], setPromise = _a[1];
    React.useEffect(function () {
        if (fragmentRef === null) {
            return;
        }
        var dispose = fragmentRef.retain();
        var removeListener = fragmentRef.listen(function (promise) {
            setPromise([fragmentRef.key, promise]);
        });
        return function () {
            dispose();
            removeListener();
        };
    }, [fragmentRef]);
    if (fragmentRef === null) {
        return { data: null };
    }
    if (current[0] !== fragmentRef.key) {
        // eslint-disable-next-line react-compiler/react-compiler
        current[0] = fragmentRef.key;
        current[1] = fragmentRef.promise;
    }
    var data = __use(current[1]);
    return { data: data };
}
//# sourceMappingURL=useSuspenseFragment.js.map
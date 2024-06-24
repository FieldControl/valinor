import * as React from "rehackt";
function getRenderDispatcher() {
    var _a, _b;
    return (_b = (_a = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) === null || _a === void 0 ? void 0 : _a.ReactCurrentDispatcher) === null || _b === void 0 ? void 0 : _b.current;
}
var RenderDispatcher = null;
/*
Relay does this too, so we hope this is safe.
https://github.com/facebook/relay/blob/8651fbca19adbfbb79af7a3bc40834d105fd7747/packages/react-relay/relay-hooks/loadQuery.js#L90-L98
*/
export function useRenderGuard() {
    RenderDispatcher = getRenderDispatcher();
    return React.useCallback(function () {
        return (RenderDispatcher != null && RenderDispatcher === getRenderDispatcher());
    }, []);
}
//# sourceMappingURL=useRenderGuard.js.map
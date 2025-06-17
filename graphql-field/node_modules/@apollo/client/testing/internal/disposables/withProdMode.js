import { withCleanup } from "./withCleanup.js";
export function withProdMode() {
    var prev = { prevDEV: globalThis.__DEV__ !== false };
    Object.defineProperty(globalThis, "__DEV__", { value: false });
    return withCleanup(prev, function (_a) {
        var prevDEV = _a.prevDEV;
        Object.defineProperty(globalThis, "__DEV__", { value: prevDEV });
    });
}
//# sourceMappingURL=withProdMode.js.map
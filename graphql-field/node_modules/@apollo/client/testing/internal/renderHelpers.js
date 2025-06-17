import { __assign, __rest } from "tslib";
import * as React from "react";
import { render } from "@testing-library/react";
import { ApolloProvider } from "../../react/index.js";
import { MockedProvider } from "../react/MockedProvider.js";
export function createClientWrapper(client, Wrapper) {
    if (Wrapper === void 0) { Wrapper = React.Fragment; }
    return function (_a) {
        var children = _a.children;
        return (React.createElement(ApolloProvider, { client: client },
            React.createElement(Wrapper, null, children)));
    };
}
export function renderWithClient(ui, _a) {
    var client = _a.client, wrapper = _a.wrapper, renderOptions = __rest(_a, ["client", "wrapper"]);
    return render(ui, __assign(__assign({}, renderOptions), { wrapper: createClientWrapper(client, wrapper) }));
}
export function createMockWrapper(renderOptions, Wrapper) {
    if (Wrapper === void 0) { Wrapper = React.Fragment; }
    return function (_a) {
        var children = _a.children;
        return (React.createElement(MockedProvider, __assign({}, renderOptions),
            React.createElement(Wrapper, null, children)));
    };
}
export function renderWithMocks(ui, _a) {
    var wrapper = _a.wrapper, renderOptions = __rest(_a, ["wrapper"]);
    return render(ui, __assign(__assign({}, renderOptions), { wrapper: createMockWrapper(renderOptions, wrapper) }));
}
//# sourceMappingURL=renderHelpers.js.map
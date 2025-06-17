// This is a helper required for React 19 testing.
// There are currently multiple directions this could play out in RTL and none of
// them has been released yet, so we are inlining this helper for now.
// See https://github.com/testing-library/react-testing-library/pull/1214
// and https://github.com/testing-library/react-testing-library/pull/1365
import { __awaiter, __generator, __rest } from "tslib";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { renderAsync } from "./renderAsync.js";
export function renderHookAsync(renderCallback_1) {
    return __awaiter(this, arguments, void 0, function (renderCallback, options) {
        function TestComponent(_a) {
            var renderCallbackProps = _a.renderCallbackProps;
            var pendingResult = renderCallback(renderCallbackProps);
            React.useEffect(function () {
                result.current = pendingResult;
            });
            return null;
        }
        function rerender(rerenderCallbackProps) {
            return baseRerender(React.createElement(TestComponent, { renderCallbackProps: rerenderCallbackProps }));
        }
        var initialProps, renderOptions, error, result, _a, baseRerender, unmount;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    initialProps = options.initialProps, renderOptions = __rest(options, ["initialProps"]);
                    // @ts-expect-error
                    if (renderOptions.legacyRoot && typeof ReactDOM.render !== "function") {
                        error = new Error("`legacyRoot: true` is not supported in this version of React. " +
                            "If your app runs React 19 or later, you should remove this flag. " +
                            "If your app runs React 18 or earlier, visit https://react.dev/blog/2022/03/08/react-18-upgrade-guide for upgrade instructions.");
                        Error.captureStackTrace(error, renderHookAsync);
                        throw error;
                    }
                    result = React.createRef();
                    return [4 /*yield*/, renderAsync(React.createElement(TestComponent, { renderCallbackProps: initialProps }), renderOptions)];
                case 1:
                    _a = _b.sent(), baseRerender = _a.rerender, unmount = _a.unmount;
                    return [2 /*return*/, { result: result, rerender: rerender, unmount: unmount }];
            }
        });
    });
}
//# sourceMappingURL=renderHookAsync.js.map
// This is a helper required for React 19 testing.
// There are currently multiple directions this could play out in RTL and none of
// them has been released yet, so we are inlining this helper for now.
// See https://github.com/testing-library/react-testing-library/pull/1214
// and https://github.com/testing-library/react-testing-library/pull/1365
import { __awaiter, __generator } from "tslib";
import { act, render } from "@testing-library/react";
export function renderAsync() {
    var _this = this;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return act(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, render.apply(void 0, args)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
//# sourceMappingURL=renderAsync.js.map
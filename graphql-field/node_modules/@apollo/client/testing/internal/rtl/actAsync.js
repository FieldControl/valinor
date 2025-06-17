// This is a helper required for React 19 testing.
// There are currently multiple directions this could play out in RTL and none of
// them has been released yet, so we are inlining this helper for now.
// See https://github.com/testing-library/react-testing-library/pull/1214
// and https://github.com/testing-library/react-testing-library/pull/1365
import { __awaiter, __generator } from "tslib";
import * as React from "react";
import * as DeprecatedReactTestUtils from "react-dom/test-utils";
var reactAct = typeof React.act === "function" ? React.act : DeprecatedReactTestUtils.act;
export function actAsync(scope) {
    var _this = this;
    return reactAct(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, scope()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
//# sourceMappingURL=actAsync.js.map
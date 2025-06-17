import { __spreadArray } from "tslib";
import { iterableEquality } from "@jest/expect-utils";
export var toEqualFetchResult = function (actual, expected) {
    var _this = this;
    var result = actual;
    var hint = this.utils.matcherHint(this.isNot ? ".not.toEqualFetchResult" : "toEqualFetchResult", "result", "expected", { isNot: this.isNot, promise: this.promise });
    var pass = this.equals(result, expected, __spreadArray(__spreadArray([], this.customTesters, true), [iterableEquality], false), true);
    return {
        pass: pass,
        message: function () {
            if (pass) {
                return (hint + "\n\nExpected: not ".concat(_this.utils.printExpected(expected)));
            }
            return (hint +
                "\n\n" +
                _this.utils.printDiffOrStringify(expected, result, "Expected", "Received", true));
        },
    };
};
//# sourceMappingURL=toEqualFetchResult.js.map
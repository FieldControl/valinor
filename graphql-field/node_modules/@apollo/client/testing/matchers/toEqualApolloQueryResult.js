import { __spreadArray } from "tslib";
import { iterableEquality } from "@jest/expect-utils";
export var toEqualApolloQueryResult = function (actual, expected) {
    var _this = this;
    var queryResult = actual;
    var hint = this.utils.matcherHint(this.isNot ? ".not.toEqualApolloQueryResult" : "toEqualApolloQueryResult", "queryResult", "expected", { isNot: this.isNot, promise: this.promise });
    var pass = this.equals(queryResult, expected, __spreadArray(__spreadArray([], this.customTesters, true), [iterableEquality], false), true);
    return {
        pass: pass,
        message: function () {
            if (pass) {
                return hint + "\n\nExpected: not ".concat(_this.utils.printExpected(expected));
            }
            return (hint +
                "\n\n" +
                _this.utils.printDiffOrStringify(expected, queryResult, "Expected", "Received", true));
        },
    };
};
//# sourceMappingURL=toEqualApolloQueryResult.js.map
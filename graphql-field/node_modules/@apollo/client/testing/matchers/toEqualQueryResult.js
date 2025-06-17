import { __spreadArray } from "tslib";
import { iterableEquality } from "@jest/expect-utils";
var CHECKED_KEYS = [
    "loading",
    "error",
    "errors",
    "data",
    "variables",
    "networkStatus",
    "errors",
    "called",
    "previousData",
];
var hasOwnProperty = function (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};
export var toEqualQueryResult = function (actual, expected) {
    var _this = this;
    var queryResult = actual;
    var hint = this.utils.matcherHint(this.isNot ? ".not.toEqualQueryResult" : "toEqualQueryResult", "queryResult", "expected", { isNot: this.isNot, promise: this.promise });
    var checkedQueryResult = CHECKED_KEYS.reduce(function (memo, key) {
        if (hasOwnProperty(queryResult, key)) {
            memo[key] = queryResult[key];
        }
        return memo;
    }, {});
    var pass = this.equals(checkedQueryResult, expected, __spreadArray(__spreadArray([], this.customTesters, true), [iterableEquality], false), true);
    return {
        pass: pass,
        message: function () {
            if (pass) {
                return hint + "\n\nExpected: not ".concat(_this.utils.printExpected(expected));
            }
            return (hint +
                "\n\n" +
                _this.utils.printDiffOrStringify(expected, checkedQueryResult, "Expected", "Received", true));
        },
    };
};
//# sourceMappingURL=toEqualQueryResult.js.map
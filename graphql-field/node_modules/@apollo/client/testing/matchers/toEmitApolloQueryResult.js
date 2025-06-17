import { __awaiter, __generator, __spreadArray } from "tslib";
import { iterableEquality } from "@jest/expect-utils";
export var toEmitApolloQueryResult = function (actual, expected, options) {
    return __awaiter(this, void 0, void 0, function () {
        var stream, hint, value_1, pass_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stream = actual;
                    hint = this.utils.matcherHint(this.isNot ? ".not.toEmitApolloQueryResult" : "toEmitApolloQueryResult", "stream", "expected");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, stream.takeNext(options)];
                case 2:
                    value_1 = _a.sent();
                    pass_1 = this.equals(value_1, expected, __spreadArray(__spreadArray([], this.customTesters, true), [iterableEquality], false), true);
                    return [2 /*return*/, {
                            pass: pass_1,
                            message: function () {
                                if (pass_1) {
                                    return (hint +
                                        "\n\nExpected stream not to emit a query result equal to expected but it did.");
                                }
                                return (hint +
                                    "\n\n" +
                                    _this.utils.printDiffOrStringify(expected, value_1, "Expected", "Recieved", true));
                            },
                        }];
                case 3:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error &&
                        error_1.message === "Timeout waiting for next event") {
                        return [2 /*return*/, {
                                pass: false,
                                message: function () {
                                    return hint + "\n\nExpected stream to emit a value but it did not.";
                                },
                            }];
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=toEmitApolloQueryResult.js.map
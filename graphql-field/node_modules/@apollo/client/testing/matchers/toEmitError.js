import { __awaiter, __generator } from "tslib";
function isErrorEqual(expected, actual) {
    if (typeof expected === "string" && actual instanceof Error) {
        return actual.message === expected;
    }
    return this.equals(expected, actual, this.customTesters);
}
export var toEmitError = function (actual, expected, options) {
    return __awaiter(this, void 0, void 0, function () {
        var stream, hint, error_2, pass_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stream = actual;
                    hint = this.utils.matcherHint(this.isNot ? ".not.toEmitError" : "toEmitError", "stream", "error");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, stream.takeError(options)];
                case 2:
                    error_2 = _a.sent();
                    pass_1 = expected === undefined ? true : isErrorEqual.call(this, expected, error_2);
                    return [2 /*return*/, {
                            pass: pass_1,
                            message: function () {
                                if (pass_1) {
                                    return (hint +
                                        "\n\nExpected stream not to emit error but it did." +
                                        "\n\nReceived:" +
                                        "\n" +
                                        _this.utils.printReceived(error_2));
                                }
                                return (hint +
                                    "\n\n" +
                                    _this.utils.printDiffOrStringify(expected, typeof expected === "string" ? error_2.message : error_2, "Expected", "Recieved", true));
                            },
                        }];
                case 3:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error &&
                        error_1.message === "Timeout waiting for next event") {
                        return [2 /*return*/, {
                                pass: false,
                                message: function () {
                                    return hint + "\n\nExpected stream to emit an error but it did not.";
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
//# sourceMappingURL=toEmitError.js.map
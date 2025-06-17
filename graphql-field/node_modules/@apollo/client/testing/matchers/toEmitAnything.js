import { __awaiter, __generator } from "tslib";
export var toEmitAnything = function (actual, options) {
    return __awaiter(this, void 0, void 0, function () {
        var stream, hint, value_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stream = actual;
                    hint = this.utils.matcherHint("toEmitAnything", "stream", "");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, stream.peek(options)];
                case 2:
                    value_1 = _a.sent();
                    return [2 /*return*/, {
                            pass: true,
                            message: function () {
                                return (hint +
                                    "\n\nExpected stream not to emit anything but it did." +
                                    "\n\nReceived:\n" +
                                    _this.utils.printReceived(value_1));
                            },
                        }];
                case 3:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error &&
                        error_1.message === "Timeout waiting for next event") {
                        return [2 /*return*/, {
                                pass: false,
                                message: function () {
                                    return hint + "\n\nExpected stream to emit an event but it did not.";
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
//# sourceMappingURL=toEmitAnything.js.map
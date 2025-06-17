import { __awaiter, __generator, __spreadArray } from "tslib";
import { equals, iterableEquality } from "@jest/expect-utils";
import { expect } from "@jest/globals";
import * as matcherUtils from "jest-matcher-utils";
import { ReadableStream } from "node:stream/web";
var ObservableStream = /** @class */ (function () {
    function ObservableStream(observable) {
        var _this = this;
        this.readerQueue = [];
        this.reader = new ReadableStream({
            start: function (controller) {
                _this.subscription = observable.subscribe(function (value) { return controller.enqueue({ type: "next", value: value }); }, function (error) { return controller.enqueue({ type: "error", error: error }); }, function () { return controller.enqueue({ type: "complete" }); });
            },
        }).getReader();
    }
    ObservableStream.prototype.peek = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.timeout, timeout = _c === void 0 ? 100 : _c;
        // Calling `peek` multiple times in a row should not advance the reader
        // multiple times until this value has been consumed.
        var readerPromise = this.readerQueue[0];
        if (!readerPromise) {
            // Since this.reader.read() advances the reader in the stream, we don't
            // want to consume this promise entirely, otherwise we will miss it when
            // calling `take`. Instead, we push it into a queue that can be consumed
            // by `take` the next time its called so that we avoid advancing the
            // reader until we are finished processing all peeked values.
            readerPromise = this.readNextValue();
            this.readerQueue.push(readerPromise);
        }
        return Promise.race([
            readerPromise,
            new Promise(function (_, reject) {
                setTimeout(reject, timeout, new Error("Timeout waiting for next event"));
            }),
        ]);
    };
    ObservableStream.prototype.take = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.timeout, timeout = _c === void 0 ? 100 : _c;
        return Promise.race([
            this.readerQueue.shift() || this.readNextValue(),
            new Promise(function (_, reject) {
                setTimeout(reject, timeout, new Error("Timeout waiting for next event"));
            }),
        ]);
    };
    ObservableStream.prototype.unsubscribe = function () {
        this.subscription.unsubscribe();
    };
    ObservableStream.prototype.takeNext = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.take(options)];
                    case 1:
                        event = _a.sent();
                        validateEquals(event, { type: "next", value: expect.anything() });
                        return [2 /*return*/, event.value];
                }
            });
        });
    };
    ObservableStream.prototype.takeError = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.take(options)];
                    case 1:
                        event = _a.sent();
                        validateEquals(event, { type: "error", error: expect.anything() });
                        return [2 /*return*/, event.error];
                }
            });
        });
    };
    ObservableStream.prototype.takeComplete = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.take(options)];
                    case 1:
                        event = _a.sent();
                        validateEquals(event, { type: "complete" });
                        return [2 /*return*/];
                }
            });
        });
    };
    ObservableStream.prototype.readNextValue = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.reader.read().then(function (result) { return result.value; })];
            });
        });
    };
    return ObservableStream;
}());
export { ObservableStream };
// Lightweight expect(...).toEqual(...) check that avoids using `expect` so that
// `expect.assertions(num)` does not double count assertions when using the take*
// functions inside of expect(stream).toEmit* matchers.
function validateEquals(actualEvent, expectedEvent) {
    // Uses the same matchers as expect(...).toEqual(...)
    // https://github.com/jestjs/jest/blob/611d1a4ba0008d67b5dcda485177f0813b2b573e/packages/expect/src/matchers.ts#L626-L629
    var isEqual = equals(actualEvent, expectedEvent, __spreadArray(__spreadArray([], getCustomMatchers(), true), [
        iterableEquality,
    ], false));
    if (isEqual) {
        return;
    }
    var hint = matcherUtils.matcherHint("toEqual", "stream", "expected");
    throw new Error(hint +
        "\n\n" +
        matcherUtils.printDiffOrStringify(expectedEvent, actualEvent, "Expected", "Received", true));
}
function getCustomMatchers() {
    // https://github.com/jestjs/jest/blob/611d1a4ba0008d67b5dcda485177f0813b2b573e/packages/expect/src/jestMatchersObject.ts#L141-L143
    var JEST_MATCHERS_OBJECT = Symbol.for("$$jest-matchers-object");
    return globalThis[JEST_MATCHERS_OBJECT].customEqualityTesters;
}
//# sourceMappingURL=ObservableStream.js.map
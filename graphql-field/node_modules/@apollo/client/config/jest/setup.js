var _a, _b;
import gql from "graphql-tag";
import { TextEncoder, TextDecoder } from "util";
(_a = global.TextEncoder) !== null && _a !== void 0 ? _a : (global.TextEncoder = TextEncoder);
// @ts-ignore
(_b = global.TextDecoder) !== null && _b !== void 0 ? _b : (global.TextDecoder = TextDecoder);
import "@testing-library/jest-dom";
import { loadErrorMessageHandler } from "../../dev/loadErrorMessageHandler.js";
import "../../testing/matchers/index.js";
import { areApolloErrorsEqual } from "./areApolloErrorsEqual.js";
import { areGraphQLErrorsEqual } from "./areGraphQlErrorsEqual.js";
// Turn off warnings for repeated fragment names
gql.disableFragmentWarnings();
process.on("unhandledRejection", function () { });
loadErrorMessageHandler();
function fail(reason) {
    if (reason === void 0) { reason = "fail was called in a test."; }
    expect(reason).toBe(undefined);
}
// @ts-ignore
globalThis.fail = fail;
if (!Symbol.dispose) {
    Object.defineProperty(Symbol, "dispose", {
        value: Symbol("dispose"),
    });
}
if (!Symbol.asyncDispose) {
    Object.defineProperty(Symbol, "asyncDispose", {
        value: Symbol("asyncDispose"),
    });
}
// @ts-ignore
expect.addEqualityTesters([areApolloErrorsEqual, areGraphQLErrorsEqual]);
// not available in JSDOM 🙄
global.structuredClone = function (val) { return JSON.parse(JSON.stringify(val)); };
//# sourceMappingURL=setup.js.map
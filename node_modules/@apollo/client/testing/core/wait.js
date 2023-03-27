import { __awaiter, __generator } from "tslib";
export function wait(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
export function tick() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, wait(0)];
        });
    });
}
//# sourceMappingURL=wait.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPipe = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
function isPipe(value) {
    if (!value) {
        return false;
    }
    if ((0, shared_utils_1.isFunction)(value)) {
        return true;
    }
    return (0, shared_utils_1.isFunction)(value.transform);
}
exports.isPipe = isPipe;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterfacesArray = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
function isNativeClass(fn) {
    return (typeof fn === 'function' &&
        /^class\s/.test(Function.prototype.toString.call(fn)));
}
function getInterfacesArray(interfaces) {
    if (!interfaces) {
        return [];
    }
    if (Array.isArray(interfaces)) {
        return interfaces;
    }
    if ((0, shared_utils_1.isFunction)(interfaces) && !isNativeClass(interfaces)) {
        interfaces = interfaces();
    }
    return [].concat(interfaces);
}
exports.getInterfacesArray = getInterfacesArray;

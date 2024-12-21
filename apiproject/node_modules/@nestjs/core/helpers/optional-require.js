"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalRequire = optionalRequire;
function optionalRequire(packageName, loaderFn) {
    try {
        return loaderFn ? loaderFn() : require(packageName);
    }
    catch (e) {
        return {};
    }
}

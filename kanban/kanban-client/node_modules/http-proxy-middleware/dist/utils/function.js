"use strict";
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionName = void 0;
function getFunctionName(fn) {
    return fn.name || '[anonymous Function]';
}
exports.getFunctionName = getFunctionName;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendTsExtension = appendTsExtension;
const path_1 = require("path");
function appendTsExtension(path) {
    return (0, path_1.extname)(path) === '.ts' ? path : path + '.ts';
}

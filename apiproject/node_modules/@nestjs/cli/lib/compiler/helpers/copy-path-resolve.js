"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyPathResolve = copyPathResolve;
const path = require("path");
/**
 * Helper function for returning a copy destination filename
 *
 * @description used in `assets-manager.ts` (copy from `copyfiles`)
 * @see https://github.com/calvinmetcalf/copyfiles/blob/master/index.js#L22
 */
function copyPathResolve(filePath, outDir, up) {
    return path.join(outDir, dealWith(filePath, up));
}
function dealWith(inPath, up) {
    if (!up) {
        return inPath;
    }
    if (depth(inPath) < up - 1) {
        throw new Error('Path outside of project folder is not allowed');
    }
    return path.join(...path.normalize(inPath).split(path.sep).slice(up));
}
function depth(string) {
    return path.normalize(string).split(path.sep).length - 1;
}

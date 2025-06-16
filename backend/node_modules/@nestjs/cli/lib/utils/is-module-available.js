"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isModuleAvailable = isModuleAvailable;
function isModuleAvailable(path) {
    try {
        require.resolve(path);
        return true;
    }
    catch {
        return false;
    }
}

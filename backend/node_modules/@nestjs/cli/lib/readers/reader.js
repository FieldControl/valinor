"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReaderFileLackPermissionsError = void 0;
class ReaderFileLackPermissionsError extends Error {
    constructor(filePath, fsErrorCode) {
        super(`File ${filePath} lacks read permissions!`);
        this.filePath = filePath;
        this.fsErrorCode = fsErrorCode;
    }
}
exports.ReaderFileLackPermissionsError = ReaderFileLackPermissionsError;

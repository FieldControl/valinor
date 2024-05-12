"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReaderFileLackPersmissionsError = void 0;
class ReaderFileLackPersmissionsError extends Error {
    constructor(filePath, fsErrorCode) {
        super(`File ${filePath} lacks read permissions!`);
        this.filePath = filePath;
        this.fsErrorCode = fsErrorCode;
    }
}
exports.ReaderFileLackPersmissionsError = ReaderFileLackPersmissionsError;

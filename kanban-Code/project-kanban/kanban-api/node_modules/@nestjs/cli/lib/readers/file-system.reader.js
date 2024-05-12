"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemReader = void 0;
const fs = require("fs");
const path = require("path");
const reader_1 = require("./reader");
class FileSystemReader {
    constructor(directory) {
        this.directory = directory;
    }
    list() {
        return fs.readdirSync(this.directory);
    }
    read(name) {
        return fs.readFileSync(path.join(this.directory, name), 'utf8');
    }
    readAnyOf(filenames) {
        let firstFilePathFoundButWithInsufficientPermissions;
        for (let id = 0; id < filenames.length; id++) {
            const file = filenames[id];
            try {
                return this.read(file);
            }
            catch (readErr) {
                if (!firstFilePathFoundButWithInsufficientPermissions &&
                    typeof readErr?.code === 'string') {
                    const isInsufficientPermissionsError = readErr.code === 'EACCES' || readErr.code === 'EPERM';
                    if (isInsufficientPermissionsError) {
                        firstFilePathFoundButWithInsufficientPermissions = readErr.path;
                    }
                }
                const isLastFileToLookFor = id === filenames.length - 1;
                if (!isLastFileToLookFor) {
                    continue;
                }
                if (firstFilePathFoundButWithInsufficientPermissions) {
                    return new reader_1.ReaderFileLackPersmissionsError(firstFilePathFoundButWithInsufficientPermissions, readErr.code);
                }
                else {
                    return undefined;
                }
            }
        }
    }
}
exports.FileSystemReader = FileSystemReader;

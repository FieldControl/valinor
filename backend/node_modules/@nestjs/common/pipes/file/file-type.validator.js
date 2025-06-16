"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTypeValidator = void 0;
const file_validator_interface_1 = require("./file-validator.interface");
/**
 * Defines the built-in FileTypeValidator. It validates incoming files by examining
 * their magic numbers using the file-type package, providing more reliable file type validation
 * than just checking the mimetype string.
 *
 * @see [File Validators](https://docs.nestjs.com/techniques/file-upload#validators)
 *
 * @publicApi
 */
class FileTypeValidator extends file_validator_interface_1.FileValidator {
    buildErrorMessage(file) {
        if (file?.mimetype) {
            return `Validation failed (current file type is ${file.mimetype}, expected type is ${this.validationOptions.fileType})`;
        }
        return `Validation failed (expected type is ${this.validationOptions.fileType})`;
    }
    async isValid(file) {
        if (!this.validationOptions) {
            return true;
        }
        const isFileValid = !!file && 'mimetype' in file;
        if (this.validationOptions.skipMagicNumbersValidation) {
            return (isFileValid && !!file.mimetype.match(this.validationOptions.fileType));
        }
        if (!isFileValid || !file.buffer) {
            return false;
        }
        try {
            const { fileTypeFromBuffer } = (await eval('import ("file-type")'));
            const fileType = await fileTypeFromBuffer(file.buffer);
            return (!!fileType && !!fileType.mime.match(this.validationOptions.fileType));
        }
        catch {
            return false;
        }
    }
}
exports.FileTypeValidator = FileTypeValidator;

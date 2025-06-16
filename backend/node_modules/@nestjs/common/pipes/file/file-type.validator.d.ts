import { FileValidator } from './file-validator.interface';
import { IFile } from './interfaces';
export type FileTypeValidatorOptions = {
    fileType: string | RegExp;
    /**
     * If `true`, the validator will skip the magic numbers validation.
     * This can be useful when you can't identify some files as there are no common magic numbers available for some file types.
     * @default false
     */
    skipMagicNumbersValidation?: boolean;
};
/**
 * Defines the built-in FileTypeValidator. It validates incoming files by examining
 * their magic numbers using the file-type package, providing more reliable file type validation
 * than just checking the mimetype string.
 *
 * @see [File Validators](https://docs.nestjs.com/techniques/file-upload#validators)
 *
 * @publicApi
 */
export declare class FileTypeValidator extends FileValidator<FileTypeValidatorOptions, IFile> {
    buildErrorMessage(file?: IFile): string;
    isValid(file?: IFile): Promise<boolean>;
}

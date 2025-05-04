import { FileValidator } from './file-validator.interface';
export type MaxFileSizeValidatorOptions = {
    maxSize: number;
    message?: string | ((maxSize: number) => string);
};
/**
 * Defines the built-in MaxSize File Validator
 *
 * @see [File Validators](https://docs.nestjs.com/techniques/file-upload#file-validation)
 *
 * @publicApi
 */
export declare class MaxFileSizeValidator extends FileValidator<MaxFileSizeValidatorOptions> {
    buildErrorMessage(): string;
    isValid(file: any): boolean;
}

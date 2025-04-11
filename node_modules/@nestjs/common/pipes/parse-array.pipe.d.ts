import { Type } from '../interfaces';
import { ArgumentMetadata, PipeTransform } from '../interfaces/features/pipe-transform.interface';
import { ValidationPipe, ValidationPipeOptions } from './validation.pipe';
/**
 * @publicApi
 */
export interface ParseArrayOptions extends Omit<ValidationPipeOptions, 'transform' | 'validateCustomDecorators' | 'exceptionFactory'> {
    /**
     * Type for items to be converted into
     */
    items?: Type<unknown>;
    /**
     * Items separator to split string by
     * @default ','
     */
    separator?: string;
    /**
     * If true, the pipe will return null or undefined if the value is not provided
     * @default false
     */
    optional?: boolean;
    /**
     * A factory function that returns an exception object to be thrown
     * if validation fails.
     * @param error Error message or object
     * @returns The exception object
     */
    exceptionFactory?: (error: any) => any;
}
/**
 * Defines the built-in ParseArray Pipe
 *
 * @see [Built-in Pipes](https://docs.nestjs.com/pipes#built-in-pipes)
 *
 * @publicApi
 */
export declare class ParseArrayPipe implements PipeTransform {
    protected readonly options: ParseArrayOptions;
    protected readonly validationPipe: ValidationPipe;
    protected exceptionFactory: (error: string) => any;
    constructor(options?: ParseArrayOptions);
    /**
     * Method that accesses and performs optional transformation on argument for
     * in-flight requests.
     *
     * @param value currently processed route argument
     * @param metadata contains metadata about the currently processed route argument
     */
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
    protected isExpectedTypePrimitive(): boolean;
    protected validatePrimitive(originalValue: any, index?: number): any;
}

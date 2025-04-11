import { ArgumentMetadata, PipeTransform } from '../interfaces/features/pipe-transform.interface';
import { ErrorHttpStatusCode } from '../utils/http-error-by-code.util';
/**
 * @publicApi
 */
export interface ParseIntPipeOptions {
    /**
     * The HTTP status code to be used in the response when the validation fails.
     */
    errorHttpStatusCode?: ErrorHttpStatusCode;
    /**
     * A factory function that returns an exception object to be thrown
     * if validation fails.
     * @param error Error message
     * @returns The exception object
     */
    exceptionFactory?: (error: string) => any;
    /**
     * If true, the pipe will return null or undefined if the value is not provided
     * @default false
     */
    optional?: boolean;
}
/**
 * Defines the built-in ParseInt Pipe
 *
 * @see [Built-in Pipes](https://docs.nestjs.com/pipes#built-in-pipes)
 *
 * @publicApi
 */
export declare class ParseIntPipe implements PipeTransform<string> {
    protected readonly options?: ParseIntPipeOptions | undefined;
    protected exceptionFactory: (error: string) => any;
    constructor(options?: ParseIntPipeOptions | undefined);
    /**
     * Method that accesses and performs optional transformation on argument for
     * in-flight requests.
     *
     * @param value currently processed route argument
     * @param metadata contains metadata about the currently processed route argument
     */
    transform(value: string, metadata: ArgumentMetadata): Promise<number>;
    /**
     * @param value currently processed route argument
     * @returns `true` if `value` is a valid integer number
     */
    protected isNumeric(value: string): boolean;
}

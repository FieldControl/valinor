import { ArgumentMetadata, PipeTransform } from '../interfaces/features/pipe-transform.interface';
import { ErrorHttpStatusCode } from '../utils/http-error-by-code.util';
/**
 * @publicApi
 */
export interface ParseUUIDPipeOptions {
    /**
     * UUID version to validate
     */
    version?: '3' | '4' | '5' | '7';
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
    exceptionFactory?: (errors: string) => any;
    /**
     * If true, the pipe will return null or undefined if the value is not provided
     * @default false
     */
    optional?: boolean;
}
/**
 * Defines the built-in ParseUUID Pipe
 *
 * @see [Built-in Pipes](https://docs.nestjs.com/pipes#built-in-pipes)
 *
 * @publicApi
 */
export declare class ParseUUIDPipe implements PipeTransform<string> {
    protected readonly options?: ParseUUIDPipeOptions | undefined;
    protected static uuidRegExps: {
        3: RegExp;
        4: RegExp;
        5: RegExp;
        7: RegExp;
        all: RegExp;
    };
    private readonly version;
    protected exceptionFactory: (errors: string) => any;
    constructor(options?: ParseUUIDPipeOptions | undefined);
    transform(value: string, metadata: ArgumentMetadata): Promise<string>;
    protected isUUID(str: unknown, version?: string): any;
}

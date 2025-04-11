import { Readable } from 'stream';
import { Logger } from '../services';
import { StreamableFileOptions, StreamableHandlerResponse } from './interfaces';
/**
 * @see [Streaming files](https://docs.nestjs.com/techniques/streaming-files)
 *
 * @publicApi
 */
export declare class StreamableFile {
    readonly options: StreamableFileOptions;
    private readonly stream;
    protected logger: Logger;
    protected handleError: (err: Error, response: StreamableHandlerResponse) => void;
    protected logError: (err: Error) => void;
    constructor(buffer: Uint8Array, options?: StreamableFileOptions);
    constructor(readable: Readable, options?: StreamableFileOptions);
    getStream(): Readable;
    getHeaders(): {
        type: string;
        disposition: string | undefined;
        length: number | undefined;
    };
    get errorHandler(): (err: Error, response: StreamableHandlerResponse) => void;
    setErrorHandler(handler: (err: Error, response: StreamableHandlerResponse) => void): this;
    get errorLogger(): (err: Error) => void;
    setErrorLogger(handler: (err: Error) => void): this;
}

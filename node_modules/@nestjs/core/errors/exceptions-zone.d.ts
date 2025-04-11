export declare class ExceptionsZone {
    private static readonly exceptionHandler;
    static run(callback: () => void, teardown: ((err: any) => void) | undefined, autoFlushLogs: boolean): void;
    static asyncRun(callback: () => Promise<void>, teardown: ((err: any) => void) | undefined, autoFlushLogs: boolean): Promise<void>;
}

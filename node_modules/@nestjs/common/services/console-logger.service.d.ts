import { InspectOptions } from 'util';
import { LoggerService, LogLevel } from './logger.service';
export interface ConsoleLoggerOptions {
    /**
     * Enabled log levels.
     */
    logLevels?: LogLevel[];
    /**
     * If enabled, will print timestamp (time difference) between current and previous log message.
     * Note: This option is not used when `json` is enabled.
     */
    timestamp?: boolean;
    /**
     * A prefix to be used for each log message.
     * Note: This option is not used when `json` is enabled.
     */
    prefix?: string;
    /**
     * If enabled, will print the log message in JSON format.
     */
    json?: boolean;
    /**
     * If enabled, will print the log message in color.
     * Default true if json is disabled, false otherwise
     */
    colors?: boolean;
    /**
     * The context of the logger.
     */
    context?: string;
    /**
     * If enabled, will print the log message in a single line, even if it is an object with multiple properties.
     * If set to a number, the most n inner elements are united on a single line as long as all properties fit into breakLength. Short array elements are also grouped together.
     * Default true when `json` is enabled, false otherwise.
     */
    compact?: boolean | number;
    /**
     * Specifies the maximum number of Array, TypedArray, Map, Set, WeakMap, and WeakSet elements to include when formatting.
     * Set to null or Infinity to show all elements. Set to 0 or negative to show no elements.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default 100
     */
    maxArrayLength?: number;
    /**
     * Specifies the maximum number of characters to include when formatting.
     * Set to null or Infinity to show all elements. Set to 0 or negative to show no characters.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default 10000.
     */
    maxStringLength?: number;
    /**
     * If enabled, will sort keys while formatting objects.
     * Can also be a custom sorting function.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default false
     */
    sorted?: boolean | ((a: string, b: string) => number);
    /**
     * Specifies the number of times to recurse while formatting object. T
     * This is useful for inspecting large objects. To recurse up to the maximum call stack size pass Infinity or null.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default 5
     */
    depth?: number;
    /**
     * If true, object's non-enumerable symbols and properties are included in the formatted result.
     * WeakMap and WeakSet entries are also included as well as user defined prototype properties
     * @default false
     */
    showHidden?: boolean;
    /**
     * The length at which input values are split across multiple lines. Set to Infinity to format the input as a single line (in combination with "compact" set to true).
     * Default Infinity when "compact" is true, 80 otherwise.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     */
    breakLength?: number;
}
export declare class ConsoleLogger implements LoggerService {
    /**
     * The options of the logger.
     */
    protected options: ConsoleLoggerOptions;
    /**
     * The context of the logger (can be set manually or automatically inferred).
     */
    protected context?: string;
    /**
     * The original context of the logger (set in the constructor).
     */
    protected originalContext?: string;
    /**
     * The options used for the "inspect" method.
     */
    protected inspectOptions: InspectOptions;
    /**
     * The last timestamp at which the log message was printed.
     */
    protected static lastTimestampAt?: number;
    constructor();
    constructor(context: string);
    constructor(options: ConsoleLoggerOptions);
    constructor(context: string, options: ConsoleLoggerOptions);
    /**
     * Write a 'log' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    log(message: any, context?: string): void;
    log(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write an 'error' level log, if the configured level allows for it.
     * Prints to `stderr` with newline.
     */
    error(message: any, stackOrContext?: string): void;
    error(message: any, stack?: string, context?: string): void;
    error(message: any, ...optionalParams: [...any, string?, string?]): void;
    /**
     * Write a 'warn' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    warn(message: any, context?: string): void;
    warn(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write a 'debug' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    debug(message: any, context?: string): void;
    debug(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write a 'verbose' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    verbose(message: any, context?: string): void;
    verbose(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write a 'fatal' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    fatal(message: any, context?: string): void;
    fatal(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Set log levels
     * @param levels log levels
     */
    setLogLevels(levels: LogLevel[]): void;
    /**
     * Set logger context
     * @param context context
     */
    setContext(context: string): void;
    /**
     * Resets the logger context to the value that was passed in the constructor.
     */
    resetContext(): void;
    isLevelEnabled(level: LogLevel): boolean;
    protected getTimestamp(): string;
    protected printMessages(messages: unknown[], context?: string, logLevel?: LogLevel, writeStreamType?: 'stdout' | 'stderr', errorStack?: unknown): void;
    protected printAsJson(message: unknown, options: {
        context: string;
        logLevel: LogLevel;
        writeStreamType?: 'stdout' | 'stderr';
        errorStack?: unknown;
    }): void;
    protected formatPid(pid: number): string;
    protected formatContext(context: string): string;
    protected formatMessage(logLevel: LogLevel, message: unknown, pidMessage: string, formattedLogLevel: string, contextMessage: string, timestampDiff: string): string;
    protected stringifyMessage(message: unknown, logLevel: LogLevel): any;
    protected colorize(message: string, logLevel: LogLevel): string;
    protected printStackTrace(stack: string): void;
    protected updateAndGetTimestampDiff(): string;
    protected formatTimestampDiff(timestampDiff: number): string;
    protected getInspectOptions(): InspectOptions;
    protected stringifyReplacer(key: string, value: unknown): unknown;
    private getContextAndMessagesToPrint;
    private getContextAndStackAndMessagesToPrint;
    private isStackFormat;
    private getColorByLogLevel;
}

"use strict";
var ConsoleLogger_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = void 0;
const tslib_1 = require("tslib");
const util_1 = require("util");
const core_1 = require("../decorators/core");
const cli_colors_util_1 = require("../utils/cli-colors.util");
const shared_utils_1 = require("../utils/shared.utils");
const utils_1 = require("./utils");
const DEFAULT_DEPTH = 5;
const DEFAULT_LOG_LEVELS = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
    'fatal',
];
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: '2-digit',
    month: '2-digit',
});
let ConsoleLogger = ConsoleLogger_1 = class ConsoleLogger {
    constructor(contextOrOptions, options) {
        // eslint-disable-next-line prefer-const
        let [context, opts] = (0, shared_utils_1.isString)(contextOrOptions)
            ? [contextOrOptions, options]
            : options
                ? [undefined, options]
                : [contextOrOptions?.context, contextOrOptions];
        opts = opts ?? {};
        opts.logLevels ??= DEFAULT_LOG_LEVELS;
        opts.colors ??= opts.colors ?? (opts.json ? false : true);
        opts.prefix ??= 'Nest';
        this.options = opts;
        this.inspectOptions = this.getInspectOptions();
        if (context) {
            this.context = context;
            this.originalContext = context;
        }
    }
    log(message, ...optionalParams) {
        if (!this.isLevelEnabled('log')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'log');
    }
    error(message, ...optionalParams) {
        if (!this.isLevelEnabled('error')) {
            return;
        }
        const { messages, context, stack } = this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);
        this.printMessages(messages, context, 'error', 'stderr', stack);
        this.printStackTrace(stack);
    }
    warn(message, ...optionalParams) {
        if (!this.isLevelEnabled('warn')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'warn');
    }
    debug(message, ...optionalParams) {
        if (!this.isLevelEnabled('debug')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'debug');
    }
    verbose(message, ...optionalParams) {
        if (!this.isLevelEnabled('verbose')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'verbose');
    }
    fatal(message, ...optionalParams) {
        if (!this.isLevelEnabled('fatal')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'fatal');
    }
    /**
     * Set log levels
     * @param levels log levels
     */
    setLogLevels(levels) {
        if (!this.options) {
            this.options = {};
        }
        this.options.logLevels = levels;
    }
    /**
     * Set logger context
     * @param context context
     */
    setContext(context) {
        this.context = context;
    }
    /**
     * Resets the logger context to the value that was passed in the constructor.
     */
    resetContext() {
        this.context = this.originalContext;
    }
    isLevelEnabled(level) {
        const logLevels = this.options?.logLevels;
        return (0, utils_1.isLogLevelEnabled)(level, logLevels);
    }
    getTimestamp() {
        return dateTimeFormatter.format(Date.now());
    }
    printMessages(messages, context = '', logLevel = 'log', writeStreamType, errorStack) {
        messages.forEach(message => {
            if (this.options.json) {
                this.printAsJson(message, {
                    context,
                    logLevel,
                    writeStreamType,
                    errorStack,
                });
                return;
            }
            const pidMessage = this.formatPid(process.pid);
            const contextMessage = this.formatContext(context);
            const timestampDiff = this.updateAndGetTimestampDiff();
            const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');
            const formattedMessage = this.formatMessage(logLevel, message, pidMessage, formattedLogLevel, contextMessage, timestampDiff);
            process[writeStreamType ?? 'stdout'].write(formattedMessage);
        });
    }
    printAsJson(message, options) {
        const logObject = {
            level: options.logLevel,
            pid: process.pid,
            timestamp: Date.now(),
            message,
        };
        if (options.context) {
            logObject.context = options.context;
        }
        if (options.errorStack) {
            logObject.stack = options.errorStack;
        }
        const formattedMessage = !this.options.colors && this.inspectOptions.compact === true
            ? JSON.stringify(logObject, this.stringifyReplacer)
            : (0, util_1.inspect)(logObject, this.inspectOptions);
        process[options.writeStreamType ?? 'stdout'].write(`${formattedMessage}\n`);
    }
    formatPid(pid) {
        return `[${this.options.prefix}] ${pid}  - `;
    }
    formatContext(context) {
        if (!context) {
            return '';
        }
        context = `[${context}] `;
        return this.options.colors ? (0, cli_colors_util_1.yellow)(context) : context;
    }
    formatMessage(logLevel, message, pidMessage, formattedLogLevel, contextMessage, timestampDiff) {
        const output = this.stringifyMessage(message, logLevel);
        pidMessage = this.colorize(pidMessage, logLevel);
        formattedLogLevel = this.colorize(formattedLogLevel, logLevel);
        return `${pidMessage}${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output}${timestampDiff}\n`;
    }
    stringifyMessage(message, logLevel) {
        if ((0, shared_utils_1.isFunction)(message)) {
            const messageAsStr = Function.prototype.toString.call(message);
            const isClass = messageAsStr.startsWith('class ');
            if (isClass) {
                // If the message is a class, we will display the class name.
                return this.stringifyMessage(message.name, logLevel);
            }
            // If the message is a non-class function, call it and re-resolve its value.
            return this.stringifyMessage(message(), logLevel);
        }
        if (typeof message === 'string') {
            return this.colorize(message, logLevel);
        }
        const outputText = (0, util_1.inspect)(message, this.inspectOptions);
        if ((0, shared_utils_1.isPlainObject)(message)) {
            return `Object(${Object.keys(message).length}) ${outputText}`;
        }
        if (Array.isArray(message)) {
            return `Array(${message.length}) ${outputText}`;
        }
        return outputText;
    }
    colorize(message, logLevel) {
        if (!this.options.colors || this.options.json) {
            return message;
        }
        const color = this.getColorByLogLevel(logLevel);
        return color(message);
    }
    printStackTrace(stack) {
        if (!stack || this.options.json) {
            return;
        }
        process.stderr.write(`${stack}\n`);
    }
    updateAndGetTimestampDiff() {
        const includeTimestamp = ConsoleLogger_1.lastTimestampAt && this.options?.timestamp;
        const result = includeTimestamp
            ? this.formatTimestampDiff(Date.now() - ConsoleLogger_1.lastTimestampAt)
            : '';
        ConsoleLogger_1.lastTimestampAt = Date.now();
        return result;
    }
    formatTimestampDiff(timestampDiff) {
        const formattedDiff = ` +${timestampDiff}ms`;
        return this.options.colors ? (0, cli_colors_util_1.yellow)(formattedDiff) : formattedDiff;
    }
    getInspectOptions() {
        let breakLength = this.options.breakLength;
        if (typeof breakLength === 'undefined') {
            breakLength = this.options.colors
                ? this.options.compact
                    ? Infinity
                    : undefined
                : this.options.compact === false
                    ? undefined
                    : Infinity; // default breakLength to Infinity if inline is not set and colors is false
        }
        const inspectOptions = {
            depth: this.options.depth ?? DEFAULT_DEPTH,
            sorted: this.options.sorted,
            showHidden: this.options.showHidden,
            compact: this.options.compact ?? (this.options.json ? true : false),
            colors: this.options.colors,
            breakLength,
        };
        if (this.options.maxArrayLength) {
            inspectOptions.maxArrayLength = this.options.maxArrayLength;
        }
        if (this.options.maxStringLength) {
            inspectOptions.maxStringLength = this.options.maxStringLength;
        }
        return inspectOptions;
    }
    stringifyReplacer(key, value) {
        // Mimic util.inspect behavior for JSON logger with compact on and colors off
        if (typeof value === 'bigint') {
            return value.toString();
        }
        if (typeof value === 'symbol') {
            return value.toString();
        }
        if (value instanceof Map ||
            value instanceof Set ||
            value instanceof Error) {
            return `${(0, util_1.inspect)(value, this.inspectOptions)}`;
        }
        return value;
    }
    getContextAndMessagesToPrint(args) {
        if (args?.length <= 1) {
            return { messages: args, context: this.context };
        }
        const lastElement = args[args.length - 1];
        const isContext = (0, shared_utils_1.isString)(lastElement);
        if (!isContext) {
            return { messages: args, context: this.context };
        }
        return {
            context: lastElement,
            messages: args.slice(0, args.length - 1),
        };
    }
    getContextAndStackAndMessagesToPrint(args) {
        if (args.length === 2) {
            return this.isStackFormat(args[1])
                ? {
                    messages: [args[0]],
                    stack: args[1],
                    context: this.context,
                }
                : {
                    messages: [args[0]],
                    context: args[1],
                };
        }
        const { messages, context } = this.getContextAndMessagesToPrint(args);
        if (messages?.length <= 1) {
            return { messages, context };
        }
        const lastElement = messages[messages.length - 1];
        const isStack = (0, shared_utils_1.isString)(lastElement);
        // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
        if (!isStack && !(0, shared_utils_1.isUndefined)(lastElement)) {
            return { messages, context };
        }
        return {
            stack: lastElement,
            messages: messages.slice(0, messages.length - 1),
            context,
        };
    }
    isStackFormat(stack) {
        if (!(0, shared_utils_1.isString)(stack) && !(0, shared_utils_1.isUndefined)(stack)) {
            return false;
        }
        return /^(.)+\n\s+at .+:\d+:\d+/.test(stack);
    }
    getColorByLogLevel(level) {
        switch (level) {
            case 'debug':
                return cli_colors_util_1.clc.magentaBright;
            case 'warn':
                return cli_colors_util_1.clc.yellow;
            case 'error':
                return cli_colors_util_1.clc.red;
            case 'verbose':
                return cli_colors_util_1.clc.cyanBright;
            case 'fatal':
                return cli_colors_util_1.clc.bold;
            default:
                return cli_colors_util_1.clc.green;
        }
    }
};
exports.ConsoleLogger = ConsoleLogger;
exports.ConsoleLogger = ConsoleLogger = ConsoleLogger_1 = tslib_1.__decorate([
    (0, core_1.Injectable)(),
    tslib_1.__param(0, (0, core_1.Optional)()),
    tslib_1.__param(1, (0, core_1.Optional)()),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ConsoleLogger);

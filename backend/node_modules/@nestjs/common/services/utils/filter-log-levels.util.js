"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterLogLevels = filterLogLevels;
const logger_service_1 = require("../logger.service");
const is_log_level_util_1 = require("./is-log-level.util");
/**
 * @publicApi
 */
function filterLogLevels(parseableString = '') {
    const sanitizedSring = parseableString.replaceAll(' ', '').toLowerCase();
    if (sanitizedSring[0] === '>') {
        const orEqual = sanitizedSring[1] === '=';
        const logLevelIndex = logger_service_1.LOG_LEVELS.indexOf(sanitizedSring.substring(orEqual ? 2 : 1));
        if (logLevelIndex === -1) {
            throw new Error(`parse error (unknown log level): ${sanitizedSring}`);
        }
        return logger_service_1.LOG_LEVELS.slice(orEqual ? logLevelIndex : logLevelIndex + 1);
    }
    else if (sanitizedSring.includes(',')) {
        return sanitizedSring.split(',').filter(is_log_level_util_1.isLogLevel);
    }
    return (0, is_log_level_util_1.isLogLevel)(sanitizedSring) ? [sanitizedSring] : logger_service_1.LOG_LEVELS;
}

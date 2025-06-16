"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLogLevel = isLogLevel;
const logger_service_1 = require("../logger.service");
/**
 * @publicApi
 */
function isLogLevel(maybeLogLevel) {
    return logger_service_1.LOG_LEVELS.includes(maybeLogLevel);
}

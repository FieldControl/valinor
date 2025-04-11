"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionHandler = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
class ExceptionHandler {
    handle(exception) {
        ExceptionHandler.logger.error(exception);
    }
}
exports.ExceptionHandler = ExceptionHandler;
ExceptionHandler.logger = new logger_service_1.Logger(ExceptionHandler.name);

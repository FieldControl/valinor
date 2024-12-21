"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseDatePipe = void 0;
const tslib_1 = require("tslib");
const injectable_decorator_1 = require("../decorators/core/injectable.decorator");
const http_status_enum_1 = require("../enums/http-status.enum");
const http_error_by_code_util_1 = require("../utils/http-error-by-code.util");
const shared_utils_1 = require("../utils/shared.utils");
let ParseDatePipe = class ParseDatePipe {
    constructor(options = {}) {
        this.options = options;
        const { exceptionFactory, errorHttpStatusCode = http_status_enum_1.HttpStatus.BAD_REQUEST } = options;
        this.exceptionFactory =
            exceptionFactory ||
                (error => new http_error_by_code_util_1.HttpErrorByCode[errorHttpStatusCode](error));
    }
    /**
     * Method that accesses and performs optional transformation on argument for
     * in-flight requests.
     *
     * @param value currently processed route argument
     * @param metadata contains metadata about the currently processed route argument
     */
    transform(value) {
        if (this.options.optional && (0, shared_utils_1.isNil)(value)) {
            return this.options.default ? this.options.default() : value;
        }
        if (!value) {
            throw this.exceptionFactory('Validation failed (no Date provided)');
        }
        const transformedValue = new Date(value);
        if (isNaN(transformedValue.getTime())) {
            throw this.exceptionFactory('Validation failed (invalid date format)');
        }
        return transformedValue;
    }
};
exports.ParseDatePipe = ParseDatePipe;
exports.ParseDatePipe = ParseDatePipe = tslib_1.__decorate([
    (0, injectable_decorator_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], ParseDatePipe);

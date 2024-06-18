"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveProperty = void 0;
const common_1 = require("@nestjs/common");
const resolve_field_decorator_1 = require("./resolve-field.decorator");
const logger = new common_1.Logger('GraphQLModule');
/**
 * Property resolver (method) Decorator.
 */
function ResolveProperty(propertyNameOrFunc, typeFuncOrOptions, options) {
    logger.warn('The "@ResolveProperty()" decorator has been deprecated. Please, use the "@ResolveField()" decorator instead.');
    return (0, resolve_field_decorator_1.ResolveField)(propertyNameOrFunc, typeFuncOrOptions, options);
}
exports.ResolveProperty = ResolveProperty;

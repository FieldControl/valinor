"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClassProvider = isClassProvider;
exports.isValueProvider = isValueProvider;
exports.isFactoryProvider = isFactoryProvider;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
function isClassProvider(provider) {
    return Boolean(provider?.useClass);
}
function isValueProvider(provider) {
    const providerValue = provider?.useValue;
    return !(0, shared_utils_1.isUndefined)(providerValue);
}
function isFactoryProvider(provider) {
    return Boolean(provider.useFactory);
}

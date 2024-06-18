"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectThrottlerStorage = exports.InjectThrottlerOptions = exports.SkipThrottle = exports.Throttle = void 0;
const common_1 = require("@nestjs/common");
const throttler_constants_1 = require("./throttler.constants");
const throttler_providers_1 = require("./throttler.providers");
function setThrottlerMetadata(target, options) {
    for (const name in options) {
        Reflect.defineMetadata(throttler_constants_1.THROTTLER_TTL + name, options[name].ttl, target);
        Reflect.defineMetadata(throttler_constants_1.THROTTLER_LIMIT + name, options[name].limit, target);
        Reflect.defineMetadata(throttler_constants_1.THROTTLER_TRACKER + name, options[name].getTracker, target);
        Reflect.defineMetadata(throttler_constants_1.THROTTLER_KEY_GENERATOR + name, options[name].generateKey, target);
    }
}
const Throttle = (options) => {
    return (target, propertyKey, descriptor) => {
        if (descriptor) {
            setThrottlerMetadata(descriptor.value, options);
            return descriptor;
        }
        setThrottlerMetadata(target, options);
        return target;
    };
};
exports.Throttle = Throttle;
const SkipThrottle = (skip = { default: true }) => {
    return (target, propertyKey, descriptor) => {
        var _a;
        const reflectionTarget = (_a = descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) !== null && _a !== void 0 ? _a : target;
        for (const key in skip) {
            Reflect.defineMetadata(throttler_constants_1.THROTTLER_SKIP + key, skip[key], reflectionTarget);
        }
        return descriptor !== null && descriptor !== void 0 ? descriptor : target;
    };
};
exports.SkipThrottle = SkipThrottle;
const InjectThrottlerOptions = () => (0, common_1.Inject)((0, throttler_providers_1.getOptionsToken)());
exports.InjectThrottlerOptions = InjectThrottlerOptions;
const InjectThrottlerStorage = () => (0, common_1.Inject)((0, throttler_providers_1.getStorageToken)());
exports.InjectThrottlerStorage = InjectThrottlerStorage;
//# sourceMappingURL=throttler.decorator.js.map
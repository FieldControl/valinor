import { Resolvable, ThrottlerGenerateKeyFunction, ThrottlerGetTrackerFunction } from './throttler-module-options.interface';
interface ThrottlerMethodOrControllerOptions {
    limit?: Resolvable<number>;
    ttl?: Resolvable<number>;
    getTracker?: ThrottlerGetTrackerFunction;
    generateKey?: ThrottlerGenerateKeyFunction;
}
export declare const Throttle: (options: Record<string, ThrottlerMethodOrControllerOptions>) => MethodDecorator & ClassDecorator;
export declare const SkipThrottle: (skip?: Record<string, boolean>) => MethodDecorator & ClassDecorator;
export declare const InjectThrottlerOptions: () => PropertyDecorator & ParameterDecorator;
export declare const InjectThrottlerStorage: () => PropertyDecorator & ParameterDecorator;
export {};

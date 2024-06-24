import { Provider } from '@nestjs/common';
import { ThrottlerModuleOptions } from './throttler-module-options.interface';
import { ThrottlerStorage } from './throttler-storage.interface';
export declare function createThrottlerProviders(options: ThrottlerModuleOptions): Provider[];
export declare const ThrottlerStorageProvider: {
    provide: symbol;
    useFactory: (options: ThrottlerModuleOptions) => ThrottlerStorage;
    inject: string[];
};
export declare const getOptionsToken: () => string;
export declare const getStorageToken: () => symbol;

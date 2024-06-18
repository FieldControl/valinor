import { DynamicModule } from '@nestjs/common';
import { ThrottlerModuleOptions, ThrottlerAsyncOptions } from './throttler-module-options.interface';
export declare class ThrottlerModule {
    static forRoot(options?: ThrottlerModuleOptions): DynamicModule;
    static forRootAsync(options: ThrottlerAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}

import { DynamicModule } from '@nestjs/common';
import { JwtModuleAsyncOptions, JwtModuleOptions } from './interfaces/jwt-module-options.interface';
export declare class JwtModule {
    static register(options: JwtModuleOptions): DynamicModule;
    static registerAsync(options: JwtModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}

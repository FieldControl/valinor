import { DynamicModule } from '@nestjs/common/interfaces/modules/dynamic-module.interface';
import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { ModuleOpaqueKeyFactory } from './interfaces/module-opaque-key-factory.interface';
export declare class ByReferenceModuleOpaqueKeyFactory implements ModuleOpaqueKeyFactory {
    private readonly keyGenerationStrategy;
    constructor(options?: {
        keyGenerationStrategy: 'random' | 'shallow';
    });
    createForStatic(moduleCls: Type, originalRef?: Type | ForwardReference): string;
    createForDynamic(moduleCls: Type<unknown>, dynamicMetadata: Omit<DynamicModule, 'module'>, originalRef: DynamicModule | ForwardReference): string;
    private getOrCreateModuleId;
    private hashString;
    private generateRandomString;
}

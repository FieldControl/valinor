import { DynamicModule } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from './interfaces/typeorm-options.interface';
export declare class TypeOrmModule {
    static forRoot(options?: TypeOrmModuleOptions): DynamicModule;
    static forFeature(entities?: EntityClassOrSchema[], dataSource?: DataSource | DataSourceOptions | string): DynamicModule;
    static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule;
}

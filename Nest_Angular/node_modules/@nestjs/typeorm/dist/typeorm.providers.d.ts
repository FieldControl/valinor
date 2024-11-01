import { Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';
export declare function createTypeOrmProviders(entities?: EntityClassOrSchema[], dataSource?: DataSource | DataSourceOptions | string): Provider[];

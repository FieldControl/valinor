"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TypeOrmCoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmCoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const typeorm_1 = require("typeorm");
const typeorm_utils_1 = require("./common/typeorm.utils");
const entities_metadata_storage_1 = require("./entities-metadata.storage");
const typeorm_constants_1 = require("./typeorm.constants");
let TypeOrmCoreModule = exports.TypeOrmCoreModule = TypeOrmCoreModule_1 = class TypeOrmCoreModule {
    constructor(options, moduleRef) {
        this.options = options;
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger('TypeOrmModule');
    }
    static forRoot(options = {}) {
        const typeOrmModuleOptions = {
            provide: typeorm_constants_1.TYPEORM_MODULE_OPTIONS,
            useValue: options,
        };
        const dataSourceProvider = {
            provide: (0, typeorm_utils_1.getDataSourceToken)(options),
            useFactory: async () => await this.createDataSourceFactory(options),
        };
        const entityManagerProvider = this.createEntityManagerProvider(options);
        const providers = [
            entityManagerProvider,
            dataSourceProvider,
            typeOrmModuleOptions,
        ];
        const exports = [entityManagerProvider, dataSourceProvider];
        // TODO: "Connection" class is going to be removed in the next version of "typeorm"
        if (dataSourceProvider.provide === typeorm_1.DataSource) {
            providers.push({
                provide: typeorm_1.Connection,
                useExisting: typeorm_1.DataSource,
            });
            exports.push(typeorm_1.Connection);
        }
        return {
            module: TypeOrmCoreModule_1,
            providers,
            exports,
        };
    }
    static forRootAsync(options) {
        const dataSourceProvider = {
            provide: (0, typeorm_utils_1.getDataSourceToken)(options),
            useFactory: async (typeOrmOptions) => {
                if (options.name) {
                    return await this.createDataSourceFactory({
                        ...typeOrmOptions,
                        name: options.name,
                    }, options.dataSourceFactory);
                }
                return await this.createDataSourceFactory(typeOrmOptions, options.dataSourceFactory);
            },
            inject: [typeorm_constants_1.TYPEORM_MODULE_OPTIONS],
        };
        const entityManagerProvider = {
            provide: (0, typeorm_utils_1.getEntityManagerToken)(options),
            useFactory: (dataSource) => dataSource.manager,
            inject: [(0, typeorm_utils_1.getDataSourceToken)(options)],
        };
        const asyncProviders = this.createAsyncProviders(options);
        const providers = [
            ...asyncProviders,
            entityManagerProvider,
            dataSourceProvider,
            {
                provide: typeorm_constants_1.TYPEORM_MODULE_ID,
                useValue: (0, typeorm_utils_1.generateString)(),
            },
            ...(options.extraProviders || []),
        ];
        const exports = [
            entityManagerProvider,
            dataSourceProvider,
        ];
        // TODO: "Connection" class is going to be removed in the next version of "typeorm"
        if (dataSourceProvider.provide === typeorm_1.DataSource) {
            providers.push({
                provide: typeorm_1.Connection,
                useExisting: typeorm_1.DataSource,
            });
            exports.push(typeorm_1.Connection);
        }
        return {
            module: TypeOrmCoreModule_1,
            imports: options.imports,
            providers,
            exports,
        };
    }
    async onApplicationShutdown() {
        const dataSource = this.moduleRef.get((0, typeorm_utils_1.getDataSourceToken)(this.options));
        try {
            if (dataSource && dataSource.isInitialized) {
                await dataSource.destroy();
            }
        }
        catch (e) {
            this.logger.error(e?.message);
        }
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        const useClass = options.useClass;
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: typeorm_constants_1.TYPEORM_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        // `as Type<TypeOrmOptionsFactory>` is a workaround for microsoft/TypeScript#31603
        const inject = [
            (options.useClass || options.useExisting),
        ];
        return {
            provide: typeorm_constants_1.TYPEORM_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => await optionsFactory.createTypeOrmOptions(options.name),
            inject,
        };
    }
    static createEntityManagerProvider(options) {
        return {
            provide: (0, typeorm_utils_1.getEntityManagerToken)(options),
            useFactory: (dataSource) => dataSource.manager,
            inject: [(0, typeorm_utils_1.getDataSourceToken)(options)],
        };
    }
    static async createDataSourceFactory(options, dataSourceFactory) {
        const dataSourceToken = (0, typeorm_utils_1.getDataSourceName)(options);
        const createTypeormDataSource = dataSourceFactory ??
            ((options) => {
                return typeorm_1.DataSource === undefined
                    ? (0, typeorm_1.createConnection)(options)
                    : new typeorm_1.DataSource(options);
            });
        return await (0, rxjs_1.lastValueFrom)((0, rxjs_1.defer)(async () => {
            let dataSource;
            if (!options.autoLoadEntities) {
                dataSource = await createTypeormDataSource(options);
            }
            else {
                let entities = options.entities;
                if (Array.isArray(entities)) {
                    entities = entities.concat(entities_metadata_storage_1.EntitiesMetadataStorage.getEntitiesByDataSource(dataSourceToken));
                }
                else {
                    entities =
                        entities_metadata_storage_1.EntitiesMetadataStorage.getEntitiesByDataSource(dataSourceToken);
                }
                dataSource = await createTypeormDataSource({
                    ...options,
                    entities,
                });
            }
            // TODO: remove "dataSource.initialize" condition (left for backward compatibility)
            return dataSource.initialize && !dataSource.isInitialized && !options.manualInitialization
                ? dataSource.initialize()
                : dataSource;
        }).pipe((0, typeorm_utils_1.handleRetry)(options.retryAttempts, options.retryDelay, dataSourceToken, options.verboseRetryLog, options.toRetry)));
    }
};
exports.TypeOrmCoreModule = TypeOrmCoreModule = TypeOrmCoreModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({}),
    __param(0, (0, common_1.Inject)(typeorm_constants_1.TYPEORM_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object, core_1.ModuleRef])
], TypeOrmCoreModule);

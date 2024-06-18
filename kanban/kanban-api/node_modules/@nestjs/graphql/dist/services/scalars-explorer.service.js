"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalarsExplorerService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const core_1 = require("@nestjs/core");
const graphql_constants_1 = require("../graphql.constants");
const scalar_types_utils_1 = require("../utils/scalar-types.utils");
const base_explorer_service_1 = require("./base-explorer.service");
let ScalarsExplorerService = class ScalarsExplorerService extends base_explorer_service_1.BaseExplorerService {
    constructor(modulesContainer, gqlOptions) {
        super();
        this.modulesContainer = modulesContainer;
        this.gqlOptions = gqlOptions;
    }
    explore() {
        const modules = this.getModules(this.modulesContainer, this.gqlOptions.include || []);
        return this.flatMap(modules, (instance) => this.filterSchemaFirstScalar(instance));
    }
    filterSchemaFirstScalar(wrapper) {
        const { instance } = wrapper;
        if (!instance) {
            return undefined;
        }
        const scalarName = Reflect.getMetadata(graphql_constants_1.SCALAR_NAME_METADATA, instance.constructor);
        if (!scalarName) {
            return;
        }
        return {
            [scalarName]: (0, scalar_types_utils_1.createScalarType)(scalarName, instance),
        };
    }
    getScalarsMap() {
        const modules = this.getModules(this.modulesContainer, this.gqlOptions.include || []);
        return this.flatMap(modules, (instance) => this.filterCodeFirstScalar(instance));
    }
    filterCodeFirstScalar(wrapper) {
        const { instance } = wrapper;
        if (!instance) {
            return undefined;
        }
        const scalarNameMetadata = Reflect.getMetadata(graphql_constants_1.SCALAR_NAME_METADATA, instance.constructor);
        const scalarTypeMetadata = Reflect.getMetadata(graphql_constants_1.SCALAR_TYPE_METADATA, instance.constructor);
        if (!scalarNameMetadata) {
            return;
        }
        const typeRef = ((0, shared_utils_1.isFunction)(scalarTypeMetadata) && scalarTypeMetadata()) ||
            instance.constructor;
        return {
            type: typeRef,
            scalar: (0, scalar_types_utils_1.createScalarType)(scalarNameMetadata, instance),
        };
    }
};
exports.ScalarsExplorerService = ScalarsExplorerService;
exports.ScalarsExplorerService = ScalarsExplorerService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(1, (0, common_1.Inject)(graphql_constants_1.GRAPHQL_MODULE_OPTIONS)),
    tslib_1.__metadata("design:paramtypes", [core_1.ModulesContainer, Object])
], ScalarsExplorerService);

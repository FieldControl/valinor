"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrphanedTypesFactory = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const orphaned_reference_registry_1 = require("../services/orphaned-reference.registry");
const type_definitions_storage_1 = require("../storages/type-definitions.storage");
const get_interfaces_array_util_1 = require("../utils/get-interfaces-array.util");
let OrphanedTypesFactory = class OrphanedTypesFactory {
    constructor(typeDefinitionsStorage, orphanedReferenceRegistry) {
        this.typeDefinitionsStorage = typeDefinitionsStorage;
        this.orphanedReferenceRegistry = orphanedReferenceRegistry;
    }
    create(types) {
        types = (types || []).concat(this.orphanedReferenceRegistry.getAll());
        if (types.length === 0) {
            return [];
        }
        const interfaceTypeDefs = this.typeDefinitionsStorage.getAllInterfaceDefinitions();
        const objectTypeDefs = this.typeDefinitionsStorage.getAllObjectTypeDefinitions();
        const inputTypeDefs = this.typeDefinitionsStorage.getAllInputTypeDefinitions();
        const classTypeDefs = [
            ...interfaceTypeDefs,
            ...objectTypeDefs,
            ...inputTypeDefs,
        ];
        const enumTypeDefs = this.typeDefinitionsStorage.getAllEnumTypeDefinitions();
        return [
            ...classTypeDefs
                .filter((item) => !item.isAbstract)
                .filter((item) => {
                const implementsReferencedInterface = (0, get_interfaces_array_util_1.getInterfacesArray)(item.interfaces).some((i) => types.includes(i));
                return types.includes(item.target) || implementsReferencedInterface;
            })
                .map(({ type }) => type),
            ...enumTypeDefs
                .filter((item) => types.includes(item.enumRef))
                .map(({ type }) => type),
        ];
    }
};
exports.OrphanedTypesFactory = OrphanedTypesFactory;
exports.OrphanedTypesFactory = OrphanedTypesFactory = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [type_definitions_storage_1.TypeDefinitionsStorage,
        orphaned_reference_registry_1.OrphanedReferenceRegistry])
], OrphanedTypesFactory);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveTypeFactory = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const type_definitions_storage_1 = require("../storages/type-definitions.storage");
let ResolveTypeFactory = class ResolveTypeFactory {
    constructor(typeDefinitionsStorage) {
        this.typeDefinitionsStorage = typeDefinitionsStorage;
    }
    getResolveTypeFunction(resolveType) {
        return (...args) => {
            const typeToString = (resolvedType) => {
                if ((0, shared_utils_1.isString)(resolvedType)) {
                    return resolvedType;
                }
                const typeDef = this.typeDefinitionsStorage.getObjectTypeByTarget(resolvedType);
                return typeDef?.type?.name;
            };
            const resolvedTypeOrPromise = resolveType(...args);
            return resolvedTypeOrPromise && resolvedTypeOrPromise instanceof Promise
                ? resolvedTypeOrPromise.then(typeToString)
                : typeToString(resolvedTypeOrPromise);
        };
    }
};
exports.ResolveTypeFactory = ResolveTypeFactory;
exports.ResolveTypeFactory = ResolveTypeFactory = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [type_definitions_storage_1.TypeDefinitionsStorage])
], ResolveTypeFactory);

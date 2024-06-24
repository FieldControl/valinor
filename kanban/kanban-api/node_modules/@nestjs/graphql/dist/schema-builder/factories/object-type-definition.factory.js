"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeDefinitionFactory = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const graphql_1 = require("graphql");
const decorate_field_resolver_util_1 = require("../../utils/decorate-field-resolver.util");
const orphaned_reference_registry_1 = require("../services/orphaned-reference.registry");
const type_fields_accessor_1 = require("../services/type-fields.accessor");
const storages_1 = require("../storages");
const type_definitions_storage_1 = require("../storages/type-definitions.storage");
const get_interfaces_array_util_1 = require("../utils/get-interfaces-array.util");
const args_factory_1 = require("./args.factory");
const ast_definition_node_factory_1 = require("./ast-definition-node.factory");
const output_type_factory_1 = require("./output-type.factory");
let ObjectTypeDefinitionFactory = class ObjectTypeDefinitionFactory {
    constructor(typeDefinitionsStorage, outputTypeFactory, typeFieldsAccessor, astDefinitionNodeFactory, orphanedReferenceRegistry, argsFactory) {
        this.typeDefinitionsStorage = typeDefinitionsStorage;
        this.outputTypeFactory = outputTypeFactory;
        this.typeFieldsAccessor = typeFieldsAccessor;
        this.astDefinitionNodeFactory = astDefinitionNodeFactory;
        this.orphanedReferenceRegistry = orphanedReferenceRegistry;
        this.argsFactory = argsFactory;
    }
    create(metadata, options) {
        const prototype = Object.getPrototypeOf(metadata.target);
        const getParentType = () => {
            const parentTypeDefinition = this.typeDefinitionsStorage.getObjectTypeByTarget(prototype) ||
                this.typeDefinitionsStorage.getInterfaceByTarget(prototype);
            return parentTypeDefinition ? parentTypeDefinition.type : undefined;
        };
        return {
            target: metadata.target,
            isAbstract: metadata.isAbstract || false,
            interfaces: (0, get_interfaces_array_util_1.getInterfacesArray)(metadata.interfaces),
            type: new graphql_1.GraphQLObjectType({
                name: metadata.name,
                description: metadata.description,
                /**
                 * AST node has to be manually created in order to define directives
                 * (more on this topic here: https://github.com/graphql/graphql-js/issues/1343)
                 */
                astNode: this.astDefinitionNodeFactory.createObjectTypeNode(metadata.name, metadata.directives),
                extensions: metadata.extensions,
                interfaces: this.generateInterfaces(metadata, getParentType),
                fields: this.generateFields(metadata, options, getParentType),
            }),
        };
    }
    generateInterfaces(metadata, getParentType) {
        const prototype = Object.getPrototypeOf(metadata.target);
        return () => {
            const interfaces = (0, get_interfaces_array_util_1.getInterfacesArray)(metadata.interfaces).map((item) => this.typeDefinitionsStorage.getInterfaceByTarget(item).type);
            if (!(0, shared_utils_1.isUndefined)(prototype)) {
                const parentClass = getParentType();
                if (!parentClass) {
                    return interfaces;
                }
                const parentInterfaces = parentClass.getInterfaces?.() ?? [];
                return Array.from(new Set([...interfaces, ...parentInterfaces]));
            }
            return interfaces;
        };
    }
    generateFields(metadata, options, getParentType) {
        const prototype = Object.getPrototypeOf(metadata.target);
        metadata.properties.forEach(({ typeFn }) => this.orphanedReferenceRegistry.addToRegistryIfOrphaned(typeFn()));
        return () => {
            let fields = {};
            let properties = [];
            if (metadata.interfaces) {
                const implementedInterfaces = this.getRecursiveInterfaces([
                    metadata,
                ]).map((it) => it.properties);
                implementedInterfaces.forEach((fields) => properties.push(...(fields || [])));
            }
            properties = properties.concat(metadata.properties);
            properties.forEach((field) => {
                const type = this.outputTypeFactory.create(field.name, field.typeFn(), options, field.options);
                const resolve = this.createFieldResolver(field, options);
                fields[field.schemaName] = {
                    type,
                    args: this.argsFactory.create(field.methodArgs, options),
                    resolve,
                    description: field.description,
                    deprecationReason: field.deprecationReason,
                    /**
                     * AST node has to be manually created in order to define directives
                     * (more on this topic here: https://github.com/graphql/graphql-js/issues/1343)
                     */
                    astNode: this.astDefinitionNodeFactory.createFieldNode(field.name, type, field.directives),
                    extensions: {
                        complexity: field.complexity,
                        ...field.extensions,
                    },
                };
            });
            if (!(0, shared_utils_1.isUndefined)(prototype)) {
                const parent = getParentType();
                if (parent) {
                    const parentFields = this.typeFieldsAccessor.extractFromInterfaceOrObjectType(parent);
                    fields = {
                        ...parentFields,
                        ...fields,
                    };
                }
            }
            return fields;
        };
    }
    getRecursiveInterfaces(metadatas) {
        if (!metadatas || !metadatas.length) {
            return [];
        }
        const interfaces = metadatas.reduce((prev, curr) => {
            return [
                ...prev,
                ...(0, get_interfaces_array_util_1.getInterfacesArray)(curr.interfaces).map((it) => storages_1.TypeMetadataStorage.getInterfaceMetadataByTarget(it)),
            ];
        }, []);
        return [...interfaces, ...this.getRecursiveInterfaces(interfaces)];
    }
    createFieldResolver(field, options) {
        const rootFieldResolver = (root) => {
            const value = root[field.name];
            return typeof value === 'undefined' ? field.options.defaultValue : value;
        };
        const middlewareFunctions = (options.fieldMiddleware || []).concat(field.middleware || []);
        if (middlewareFunctions?.length === 0) {
            return rootFieldResolver;
        }
        const rootResolveFnFactory = (root) => () => rootFieldResolver(root);
        return (0, decorate_field_resolver_util_1.decorateFieldResolverWithMiddleware)(rootResolveFnFactory, middlewareFunctions);
    }
};
exports.ObjectTypeDefinitionFactory = ObjectTypeDefinitionFactory;
exports.ObjectTypeDefinitionFactory = ObjectTypeDefinitionFactory = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [type_definitions_storage_1.TypeDefinitionsStorage,
        output_type_factory_1.OutputTypeFactory,
        type_fields_accessor_1.TypeFieldsAccessor,
        ast_definition_node_factory_1.AstDefinitionNodeFactory,
        orphaned_reference_registry_1.OrphanedReferenceRegistry,
        args_factory_1.ArgsFactory])
], ObjectTypeDefinitionFactory);

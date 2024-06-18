"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeMetadataStorage = exports.TypeMetadataStorageHost = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const decorators_1 = require("../../decorators");
const plugin_constants_1 = require("../../plugin/plugin-constants");
const collections_1 = require("../collections/");
const cannot_determine_host_type_error_1 = require("../errors/cannot-determine-host-type.error");
const undefined_type_error_1 = require("../errors/undefined-type.error");
const is_throwing_util_1 = require("../utils/is-throwing.util");
class TypeMetadataStorageHost {
    constructor() {
        this.queries = new Array();
        this.mutations = new Array();
        this.subscriptions = new Array();
        this.fieldResolvers = new Array();
        this.enums = new Array();
        this.unions = new Array();
        this.metadataByTargetCollection = new collections_1.MetadataByTargetCollection();
    }
    addMutationMetadata(metadata) {
        this.mutations.push(metadata);
    }
    getMutationsMetadata() {
        return this.mutations;
    }
    addQueryMetadata(metadata) {
        this.queries.push(metadata);
    }
    getQueriesMetadata() {
        return this.queries;
    }
    addSubscriptionMetadata(metadata) {
        this.subscriptions.push(metadata);
    }
    getSubscriptionsMetadata() {
        return this.subscriptions;
    }
    addResolverPropertyMetadata(metadata) {
        this.fieldResolvers.push(metadata);
    }
    addArgsMetadata(metadata) {
        this.metadataByTargetCollection.get(metadata.target).argumentType =
            metadata;
    }
    getArgumentsMetadata() {
        return this.metadataByTargetCollection.all.argumentType;
    }
    getArgumentsMetadataByTarget(target) {
        return this.metadataByTargetCollection.get(target).argumentType;
    }
    addInterfaceMetadata(metadata) {
        this.metadataByTargetCollection.get(metadata.target).interface = metadata;
    }
    getInterfacesMetadata() {
        return [...this.metadataByTargetCollection.all.interface.values()];
    }
    getInterfaceMetadataByTarget(target) {
        return this.metadataByTargetCollection.get(target).interface;
    }
    addInputTypeMetadata(metadata) {
        this.metadataByTargetCollection.get(metadata.target).inputType = metadata;
    }
    getInputTypesMetadata() {
        return this.metadataByTargetCollection.all.inputType;
    }
    getInputTypeMetadataByTarget(target) {
        return this.metadataByTargetCollection.get(target).inputType;
    }
    addObjectTypeMetadata(metadata) {
        this.metadataByTargetCollection.get(metadata.target).objectType = metadata;
    }
    getObjectTypesMetadata() {
        return this.metadataByTargetCollection.all.objectType;
    }
    getObjectTypeMetadataByTarget(target) {
        return this.metadataByTargetCollection.get(target).objectType;
    }
    addEnumMetadata(metadata) {
        this.enums.push(metadata);
    }
    getEnumsMetadata() {
        return this.enums;
    }
    addUnionMetadata(metadata) {
        this.unions.push(metadata);
    }
    getUnionsMetadata() {
        return this.unions;
    }
    addDirectiveMetadata(metadata) {
        const classMetadata = this.metadataByTargetCollection.get(metadata.target);
        if (!classMetadata.fieldDirectives.sdls.has(metadata.sdl)) {
            classMetadata.classDirectives.push(metadata);
        }
    }
    addDirectivePropertyMetadata(metadata) {
        this.metadataByTargetCollection
            .get(metadata.target)
            .fieldDirectives.add(metadata);
    }
    addExtensionsMetadata(metadata) {
        this.metadataByTargetCollection
            .get(metadata.target)
            .classExtensions.push(metadata);
    }
    addExtensionsPropertyMetadata(metadata) {
        this.metadataByTargetCollection
            .get(metadata.target)
            .fieldExtensions.add(metadata, metadata.fieldName);
    }
    addResolverMetadata(metadata) {
        this.metadataByTargetCollection.get(metadata.target).resolver = metadata;
    }
    addClassFieldMetadata(metadata) {
        const existingMetadata = this.metadataByTargetCollection
            .get(metadata.target)
            .fields.getByName(metadata.name);
        if (existingMetadata) {
            const options = existingMetadata.options;
            if ((0, shared_utils_1.isUndefined)(options.nullable) && (0, shared_utils_1.isUndefined)(options.defaultValue)) {
                options.nullable = metadata.options.nullable;
            }
            existingMetadata.description ??= metadata.description;
            existingMetadata.deprecationReason ??= metadata.deprecationReason;
        }
        else {
            this.metadataByTargetCollection
                .get(metadata.target)
                .fields.add(metadata, metadata.name);
        }
    }
    addMethodParamMetadata(metadata) {
        this.metadataByTargetCollection
            .get(metadata.target)
            .params.unshift(metadata, metadata.methodName);
    }
    compile(orphanedTypes = []) {
        this.metadataByTargetCollection.compile();
        const classMetadata = [
            ...this.metadataByTargetCollection.all.objectType,
            ...this.metadataByTargetCollection.all.inputType,
            ...this.metadataByTargetCollection.all.argumentType,
            ...this.metadataByTargetCollection.all.interface.values(),
        ];
        this.loadClassPluginMetadata(classMetadata);
        this.compileClassMetadata(classMetadata);
        this.compileFieldResolverMetadata(this.fieldResolvers);
        const resolversMetadata = [
            ...this.queries,
            ...this.mutations,
            ...this.subscriptions,
        ];
        this.compileResolversMetadata(resolversMetadata);
        this.compileExtendedResolversMetadata();
        orphanedTypes.forEach((type) => 'prototype' in type && this.applyPluginMetadata(type.prototype));
    }
    loadClassPluginMetadata(metadata) {
        metadata
            .filter((item) => item?.target)
            .forEach((item) => this.applyPluginMetadata(item.target.prototype));
    }
    applyPluginMetadata(prototype) {
        do {
            if (!prototype.constructor) {
                return;
            }
            if (!prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]) {
                continue;
            }
            const metadata = prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]();
            const properties = Object.keys(metadata);
            properties.forEach((key) => {
                if (metadata[key].type) {
                    const { type, ...options } = metadata[key];
                    (0, decorators_1.addFieldMetadata)(type, options, prototype, key, undefined, true);
                }
                else {
                    (0, decorators_1.addFieldMetadata)(metadata[key], undefined, prototype, key, undefined, true);
                }
            });
        } while ((prototype = Reflect.getPrototypeOf(prototype)) &&
            prototype !== Object.prototype &&
            prototype);
    }
    compileClassMetadata(metadata, options) {
        metadata.forEach((item) => {
            if (!item.properties || options?.overrideFields) {
                item.properties = this.getClassFieldsByPredicate(item);
            }
            if (!item.directives) {
                item.directives = this.metadataByTargetCollection
                    .get(item.target)
                    .classDirectives.getAll();
            }
            if (!item.extensions) {
                item.extensions = this.metadataByTargetCollection
                    .get(item.target)
                    .classExtensions.reduce((curr, acc) => ({ ...curr, ...acc.value }), {});
            }
        });
    }
    clear() {
        Object.assign(this, new TypeMetadataStorageHost());
    }
    getClassFieldsByPredicate(item) {
        const fields = this.metadataByTargetCollection
            .get(item.target)
            .fields.getAll();
        fields.forEach((field) => {
            field.methodArgs = this.metadataByTargetCollection
                .get(item.target)
                .params.getByName(field.name);
            field.directives = this.metadataByTargetCollection
                .get(item.target)
                .fieldDirectives.getByName(field.name);
            field.extensions = this.metadataByTargetCollection
                .get(item.target)
                .fieldExtensions.getByName(field.name)
                .reduce((curr, acc) => ({ ...curr, ...acc.value }), {});
        });
        return fields;
    }
    compileResolversMetadata(metadata) {
        metadata.forEach((item) => {
            item.classMetadata = this.metadataByTargetCollection.get(item.target).resolver;
            item.methodArgs = this.metadataByTargetCollection
                .get(item.target)
                .params.getByName(item.methodName);
            item.directives = this.metadataByTargetCollection
                .get(item.target)
                .fieldDirectives.getByName(item.methodName);
            item.extensions = this.metadataByTargetCollection
                .get(item.target)
                .fieldExtensions.getByName(item.methodName)
                .reduce((curr, acc) => ({ ...curr, ...acc.value }), {});
        });
    }
    compileFieldResolverMetadata(metadata) {
        this.compileResolversMetadata(metadata);
        metadata.forEach((item) => {
            item.directives = this.metadataByTargetCollection
                .get(item.target)
                .fieldDirectives.getByName(item.methodName);
            item.extensions = this.metadataByTargetCollection
                .get(item.target)
                .fieldExtensions.getByName(item.methodName)
                .reduce((curr, acc) => ({ ...curr, ...acc.value }), {});
            item.objectTypeFn =
                item.kind === 'external'
                    ? this.metadataByTargetCollection.get(item.target).resolver.typeFn
                    : () => item.target;
            if (item.kind === 'external') {
                this.compileExternalFieldResolverMetadata(item);
            }
        });
    }
    compileExternalFieldResolverMetadata(item) {
        const [target, objectOrInterfaceTypeMetadata, objectOrInterfaceTypeField] = this.findModelFieldMetadata(item);
        if (!objectOrInterfaceTypeField) {
            if (!item.typeFn || !item.typeOptions) {
                throw new undefined_type_error_1.UndefinedTypeError(item.target.name, item.methodName);
            }
            const fieldMetadata = {
                name: item.methodName,
                schemaName: item.schemaName,
                deprecationReason: item.deprecationReason,
                description: item.description,
                typeFn: item.typeFn,
                target,
                options: item.typeOptions,
                methodArgs: item.methodArgs,
                directives: item.directives,
                extensions: item.extensions,
                complexity: item.complexity,
            };
            this.addClassFieldMetadata(fieldMetadata);
            objectOrInterfaceTypeMetadata.properties.push(fieldMetadata);
        }
        else {
            const isEmpty = (arr) => arr.length === 0;
            if (isEmpty(objectOrInterfaceTypeField.methodArgs)) {
                objectOrInterfaceTypeField.methodArgs = item.methodArgs;
            }
            if (isEmpty(objectOrInterfaceTypeField.directives)) {
                objectOrInterfaceTypeField.directives = item.directives;
            }
            if (!objectOrInterfaceTypeField.extensions) {
                objectOrInterfaceTypeField.extensions = item.extensions;
            }
            objectOrInterfaceTypeField.complexity =
                item.complexity === undefined
                    ? objectOrInterfaceTypeField.complexity
                    : item.complexity;
        }
    }
    findModelFieldMetadata(item) {
        let objectTypeRef = this.metadataByTargetCollection
            .get(item.target)
            .resolver.typeFn();
        const getTypeMetadata = (target) => {
            const metadata = this.metadataByTargetCollection.get(target);
            return metadata.objectType || metadata.interface;
        };
        let objectOrInterfaceTypeMetadata = getTypeMetadata(objectTypeRef);
        if (!objectOrInterfaceTypeMetadata) {
            throw new cannot_determine_host_type_error_1.CannotDetermineHostTypeError(item.schemaName, objectTypeRef?.name);
        }
        let objectOrInterfaceTypeField = objectOrInterfaceTypeMetadata.properties.find((fieldDef) => fieldDef.name === item.methodName);
        for (let _objectTypeRef = objectTypeRef; !objectOrInterfaceTypeField && _objectTypeRef?.prototype; _objectTypeRef = Object.getPrototypeOf(_objectTypeRef)) {
            const possibleTypeMetadata = getTypeMetadata(_objectTypeRef);
            objectOrInterfaceTypeField = possibleTypeMetadata?.properties.find((fieldDef) => fieldDef.name === item.methodName);
            if (objectOrInterfaceTypeField) {
                objectTypeRef = _objectTypeRef;
                objectOrInterfaceTypeMetadata = possibleTypeMetadata;
                break;
            }
        }
        return [
            objectTypeRef,
            objectOrInterfaceTypeMetadata,
            objectOrInterfaceTypeField,
        ];
    }
    compileExtendedResolversMetadata() {
        this.metadataByTargetCollection.all.resolver.forEach((item) => {
            let parentClass = Object.getPrototypeOf(item.target);
            while (parentClass.prototype) {
                const parentMetadata = this.metadataByTargetCollection.get(item.target).resolver;
                if (parentMetadata) {
                    this.queries = this.mergeParentResolverHandlers(this.queries, parentClass, item);
                    this.mutations = this.mergeParentResolverHandlers(this.mutations, parentClass, item);
                    this.subscriptions = this.mergeParentResolverHandlers(this.subscriptions, parentClass, item);
                    this.fieldResolvers = this.mergeParentFieldHandlers(this.fieldResolvers, parentClass, item);
                }
                parentClass = Object.getPrototypeOf(parentClass);
            }
        });
    }
    mergeParentResolverHandlers(metadata, parentClass, classMetadata) {
        return metadata.map((metadata) => {
            return metadata.target !== parentClass
                ? metadata
                : {
                    ...metadata,
                    target: classMetadata.target,
                    classMetadata,
                };
        });
    }
    mergeParentFieldHandlers(metadata, parentClass, classMetadata) {
        const parentMetadata = this.mergeParentResolverHandlers(metadata, parentClass, classMetadata);
        return parentMetadata.map((metadata) => {
            return metadata.target === parentClass
                ? metadata
                : {
                    ...metadata,
                    objectTypeFn: (0, is_throwing_util_1.isThrowing)(metadata.objectTypeFn)
                        ? classMetadata.typeFn
                        : metadata.objectTypeFn,
                };
        });
    }
}
exports.TypeMetadataStorageHost = TypeMetadataStorageHost;
const globalRef = global;
exports.TypeMetadataStorage = globalRef.GqlTypeMetadataStorage ||
    (globalRef.GqlTypeMetadataStorage = new TypeMetadataStorageHost());

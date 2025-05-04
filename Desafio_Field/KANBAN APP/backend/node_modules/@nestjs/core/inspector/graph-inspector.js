"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphInspector = void 0;
const unknown_dependencies_exception_1 = require("../errors/exceptions/unknown-dependencies.exception");
const deterministic_uuid_registry_1 = require("./deterministic-uuid-registry");
const partial_graph_host_1 = require("./partial-graph.host");
class GraphInspector {
    constructor(container) {
        this.container = container;
        this.enhancersMetadataCache = new Array();
        this.graph = container.serializedGraph;
    }
    inspectModules(modules = this.container.getModules()) {
        for (const moduleRef of modules.values()) {
            this.insertModuleNode(moduleRef);
            this.insertClassNodes(moduleRef);
            this.insertModuleToModuleEdges(moduleRef);
        }
        this.enhancersMetadataCache.forEach(entry => this.insertEnhancerEdge(entry));
        deterministic_uuid_registry_1.DeterministicUuidRegistry.clear();
    }
    registerPartial(error) {
        var _a, _b;
        this.graph.status = 'partial';
        if (error instanceof unknown_dependencies_exception_1.UnknownDependenciesException) {
            this.graph.metadata = {
                cause: {
                    type: 'unknown-dependencies',
                    context: error.context,
                    moduleId: (_a = error.moduleRef) === null || _a === void 0 ? void 0 : _a.id,
                    nodeId: (_b = error.metadata) === null || _b === void 0 ? void 0 : _b.id,
                },
            };
        }
        else {
            this.graph.metadata = {
                cause: {
                    type: 'unknown',
                    error,
                },
            };
        }
        partial_graph_host_1.PartialGraphHost.register(this.graph);
    }
    inspectInstanceWrapper(source, moduleRef) {
        const ctorMetadata = source.getCtorMetadata();
        ctorMetadata === null || ctorMetadata === void 0 ? void 0 : ctorMetadata.forEach((target, index) => this.insertClassToClassEdge(source, target, moduleRef, index, 'constructor'));
        const propertiesMetadata = source.getPropertiesMetadata();
        propertiesMetadata === null || propertiesMetadata === void 0 ? void 0 : propertiesMetadata.forEach(({ key, wrapper: target }) => this.insertClassToClassEdge(source, target, moduleRef, key, 'property'));
    }
    insertEnhancerMetadataCache(entry) {
        this.enhancersMetadataCache.push(entry);
    }
    insertOrphanedEnhancer(entry) {
        var _a, _b, _c;
        this.graph.insertOrphanedEnhancer(Object.assign(Object.assign({}, entry), { ref: (_c = (_b = (_a = entry.ref) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Object' }));
    }
    insertAttachedEnhancer(wrapper) {
        const existingNode = this.graph.getNodeById(wrapper.id);
        existingNode.metadata.global = true;
        this.graph.insertAttachedEnhancer(existingNode.id);
    }
    insertEntrypointDefinition(definition, parentId) {
        definition = Object.assign(Object.assign({}, definition), { id: `${definition.classNodeId}_${definition.methodName}` });
        this.graph.insertEntrypoint(definition, parentId);
    }
    insertClassNode(moduleRef, wrapper, type) {
        this.graph.insertNode({
            id: wrapper.id,
            label: wrapper.name,
            parent: moduleRef.id,
            metadata: {
                type,
                internal: wrapper.metatype === moduleRef.metatype,
                sourceModuleName: moduleRef.name,
                durable: wrapper.isDependencyTreeDurable(),
                static: wrapper.isDependencyTreeStatic(),
                scope: wrapper.scope,
                transient: wrapper.isTransient,
                exported: moduleRef.exports.has(wrapper.token),
                token: wrapper.token,
                subtype: wrapper.subtype,
                initTime: wrapper.initTime,
            },
        });
    }
    insertModuleNode(moduleRef) {
        const dynamicMetadata = this.container.getDynamicMetadataByToken(moduleRef.token);
        const node = {
            id: moduleRef.id,
            label: moduleRef.name,
            metadata: {
                type: 'module',
                global: moduleRef.isGlobal,
                dynamic: !!dynamicMetadata,
                internal: moduleRef.name === 'InternalCoreModule',
            },
        };
        this.graph.insertNode(node);
    }
    insertModuleToModuleEdges(moduleRef) {
        for (const targetModuleRef of moduleRef.imports) {
            this.graph.insertEdge({
                source: moduleRef.id,
                target: targetModuleRef.id,
                metadata: {
                    type: 'module-to-module',
                    sourceModuleName: moduleRef.name,
                    targetModuleName: targetModuleRef.name,
                },
            });
        }
    }
    insertEnhancerEdge(entry) {
        var _a, _b, _c, _d;
        const moduleRef = this.container.getModuleByKey(entry.moduleToken);
        const sourceInstanceWrapper = (_a = moduleRef.controllers.get(entry.classRef)) !== null && _a !== void 0 ? _a : moduleRef.providers.get(entry.classRef);
        const existingSourceNode = this.graph.getNodeById(sourceInstanceWrapper.id);
        const enhancers = (_b = existingSourceNode.metadata.enhancers) !== null && _b !== void 0 ? _b : [];
        if (entry.enhancerInstanceWrapper) {
            this.insertClassToClassEdge(sourceInstanceWrapper, entry.enhancerInstanceWrapper, moduleRef, undefined, 'decorator');
            enhancers.push({
                id: entry.enhancerInstanceWrapper.id,
                methodKey: entry.methodKey,
                subtype: entry.subtype,
            });
        }
        else {
            const name = (_d = (_c = entry.enhancerRef.constructor) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : entry.enhancerRef.name;
            enhancers.push({
                name,
                methodKey: entry.methodKey,
                subtype: entry.subtype,
            });
        }
        existingSourceNode.metadata.enhancers = enhancers;
    }
    insertClassToClassEdge(source, target, moduleRef, keyOrIndex, injectionType) {
        var _a;
        this.graph.insertEdge({
            source: source.id,
            target: target.id,
            metadata: {
                type: 'class-to-class',
                sourceModuleName: moduleRef.name,
                sourceClassName: source.name,
                targetClassName: target.name,
                sourceClassToken: source.token,
                targetClassToken: target.token,
                targetModuleName: (_a = target.host) === null || _a === void 0 ? void 0 : _a.name,
                keyOrIndex,
                injectionType,
            },
        });
    }
    insertClassNodes(moduleRef) {
        moduleRef.providers.forEach(value => this.insertClassNode(moduleRef, value, 'provider'));
        moduleRef.injectables.forEach(value => this.insertClassNode(moduleRef, value, 'injectable'));
        moduleRef.controllers.forEach(value => this.insertClassNode(moduleRef, value, 'controller'));
    }
}
exports.GraphInspector = GraphInspector;

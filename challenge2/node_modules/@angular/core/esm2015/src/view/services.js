/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DebugElement__PRE_R3__, DebugEventListener, DebugNode__PRE_R3__, getDebugNode, indexDebugNode, removeDebugNodeFromIndex } from '../debug/debug_node';
import { resolveForwardRef } from '../di';
import { getInjectableDef } from '../di/interface/defs';
import { ErrorHandler } from '../error_handler';
import { RendererFactory2 } from '../render/api';
import { Sanitizer } from '../sanitization/sanitizer';
import { escapeCommentText } from '../util/dom';
import { isDevMode } from '../util/is_dev_mode';
import { normalizeDebugBindingName, normalizeDebugBindingValue } from '../util/ng_reflect';
import { isViewDebugError, viewDestroyedError, viewWrappedDebugError } from './errors';
import { resolveDep } from './provider';
import { dirtyParentQueries, getQueryValue } from './query';
import { createInjector, createNgModuleRef, getComponentViewDefinitionFactory } from './refs';
import { asElementData, asPureExpressionData, Services } from './types';
import { isComponentView, NOOP, renderNode, resolveDefinition, splitDepsDsl, tokenKey, viewParentEl } from './util';
import { checkAndUpdateNode, checkAndUpdateView, checkNoChangesNode, checkNoChangesView, createComponentView, createEmbeddedView, createRootView, destroyView } from './view';
let initialized = false;
export function initServicesIfNeeded() {
    if (initialized) {
        return;
    }
    initialized = true;
    const services = isDevMode() ? createDebugServices() : createProdServices();
    Services.setCurrentNode = services.setCurrentNode;
    Services.createRootView = services.createRootView;
    Services.createEmbeddedView = services.createEmbeddedView;
    Services.createComponentView = services.createComponentView;
    Services.createNgModuleRef = services.createNgModuleRef;
    Services.overrideProvider = services.overrideProvider;
    Services.overrideComponentView = services.overrideComponentView;
    Services.clearOverrides = services.clearOverrides;
    Services.checkAndUpdateView = services.checkAndUpdateView;
    Services.checkNoChangesView = services.checkNoChangesView;
    Services.destroyView = services.destroyView;
    Services.resolveDep = resolveDep;
    Services.createDebugContext = services.createDebugContext;
    Services.handleEvent = services.handleEvent;
    Services.updateDirectives = services.updateDirectives;
    Services.updateRenderer = services.updateRenderer;
    Services.dirtyParentQueries = dirtyParentQueries;
}
function createProdServices() {
    return {
        setCurrentNode: () => { },
        createRootView: createProdRootView,
        createEmbeddedView: createEmbeddedView,
        createComponentView: createComponentView,
        createNgModuleRef: createNgModuleRef,
        overrideProvider: NOOP,
        overrideComponentView: NOOP,
        clearOverrides: NOOP,
        checkAndUpdateView: checkAndUpdateView,
        checkNoChangesView: checkNoChangesView,
        destroyView: destroyView,
        createDebugContext: (view, nodeIndex) => new DebugContext_(view, nodeIndex),
        handleEvent: (view, nodeIndex, eventName, event) => view.def.handleEvent(view, nodeIndex, eventName, event),
        updateDirectives: (view, checkType) => view.def.updateDirectives(checkType === 0 /* CheckAndUpdate */ ? prodCheckAndUpdateNode : prodCheckNoChangesNode, view),
        updateRenderer: (view, checkType) => view.def.updateRenderer(checkType === 0 /* CheckAndUpdate */ ? prodCheckAndUpdateNode : prodCheckNoChangesNode, view),
    };
}
function createDebugServices() {
    return {
        setCurrentNode: debugSetCurrentNode,
        createRootView: debugCreateRootView,
        createEmbeddedView: debugCreateEmbeddedView,
        createComponentView: debugCreateComponentView,
        createNgModuleRef: debugCreateNgModuleRef,
        overrideProvider: debugOverrideProvider,
        overrideComponentView: debugOverrideComponentView,
        clearOverrides: debugClearOverrides,
        checkAndUpdateView: debugCheckAndUpdateView,
        checkNoChangesView: debugCheckNoChangesView,
        destroyView: debugDestroyView,
        createDebugContext: (view, nodeIndex) => new DebugContext_(view, nodeIndex),
        handleEvent: debugHandleEvent,
        updateDirectives: debugUpdateDirectives,
        updateRenderer: debugUpdateRenderer,
    };
}
function createProdRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
    const rendererFactory = ngModule.injector.get(RendererFactory2);
    return createRootView(createRootData(elInjector, ngModule, rendererFactory, projectableNodes, rootSelectorOrNode), def, context);
}
function debugCreateRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
    const rendererFactory = ngModule.injector.get(RendererFactory2);
    const root = createRootData(elInjector, ngModule, new DebugRendererFactory2(rendererFactory), projectableNodes, rootSelectorOrNode);
    const defWithOverride = applyProviderOverridesToView(def);
    return callWithDebugContext(DebugAction.create, createRootView, null, [root, defWithOverride, context]);
}
function createRootData(elInjector, ngModule, rendererFactory, projectableNodes, rootSelectorOrNode) {
    const sanitizer = ngModule.injector.get(Sanitizer);
    const errorHandler = ngModule.injector.get(ErrorHandler);
    const renderer = rendererFactory.createRenderer(null, null);
    return {
        ngModule,
        injector: elInjector,
        projectableNodes,
        selectorOrNode: rootSelectorOrNode,
        sanitizer,
        rendererFactory,
        renderer,
        errorHandler
    };
}
function debugCreateEmbeddedView(parentView, anchorDef, viewDef, context) {
    const defWithOverride = applyProviderOverridesToView(viewDef);
    return callWithDebugContext(DebugAction.create, createEmbeddedView, null, [parentView, anchorDef, defWithOverride, context]);
}
function debugCreateComponentView(parentView, nodeDef, viewDef, hostElement) {
    const overrideComponentView = viewDefOverrides.get(nodeDef.element.componentProvider.provider.token);
    if (overrideComponentView) {
        viewDef = overrideComponentView;
    }
    else {
        viewDef = applyProviderOverridesToView(viewDef);
    }
    return callWithDebugContext(DebugAction.create, createComponentView, null, [parentView, nodeDef, viewDef, hostElement]);
}
function debugCreateNgModuleRef(moduleType, parentInjector, bootstrapComponents, def) {
    const defWithOverride = applyProviderOverridesToNgModule(def);
    return createNgModuleRef(moduleType, parentInjector, bootstrapComponents, defWithOverride);
}
const providerOverrides = new Map();
const providerOverridesWithScope = new Map();
const viewDefOverrides = new Map();
function debugOverrideProvider(override) {
    providerOverrides.set(override.token, override);
    let injectableDef;
    if (typeof override.token === 'function' && (injectableDef = getInjectableDef(override.token)) &&
        typeof injectableDef.providedIn === 'function') {
        providerOverridesWithScope.set(override.token, override);
    }
}
function debugOverrideComponentView(comp, compFactory) {
    const hostViewDef = resolveDefinition(getComponentViewDefinitionFactory(compFactory));
    const compViewDef = resolveDefinition(hostViewDef.nodes[0].element.componentView);
    viewDefOverrides.set(comp, compViewDef);
}
function debugClearOverrides() {
    providerOverrides.clear();
    providerOverridesWithScope.clear();
    viewDefOverrides.clear();
}
// Notes about the algorithm:
// 1) Locate the providers of an element and check if one of them was overwritten
// 2) Change the providers of that element
//
// We only create new data structures if we need to, to keep perf impact
// reasonable.
function applyProviderOverridesToView(def) {
    if (providerOverrides.size === 0) {
        return def;
    }
    const elementIndicesWithOverwrittenProviders = findElementIndicesWithOverwrittenProviders(def);
    if (elementIndicesWithOverwrittenProviders.length === 0) {
        return def;
    }
    // clone the whole view definition,
    // as it maintains references between the nodes that are hard to update.
    def = def.factory(() => NOOP);
    for (let i = 0; i < elementIndicesWithOverwrittenProviders.length; i++) {
        applyProviderOverridesToElement(def, elementIndicesWithOverwrittenProviders[i]);
    }
    return def;
    function findElementIndicesWithOverwrittenProviders(def) {
        const elIndicesWithOverwrittenProviders = [];
        let lastElementDef = null;
        for (let i = 0; i < def.nodes.length; i++) {
            const nodeDef = def.nodes[i];
            if (nodeDef.flags & 1 /* TypeElement */) {
                lastElementDef = nodeDef;
            }
            if (lastElementDef && nodeDef.flags & 3840 /* CatProviderNoDirective */ &&
                providerOverrides.has(nodeDef.provider.token)) {
                elIndicesWithOverwrittenProviders.push(lastElementDef.nodeIndex);
                lastElementDef = null;
            }
        }
        return elIndicesWithOverwrittenProviders;
    }
    function applyProviderOverridesToElement(viewDef, elIndex) {
        for (let i = elIndex + 1; i < viewDef.nodes.length; i++) {
            const nodeDef = viewDef.nodes[i];
            if (nodeDef.flags & 1 /* TypeElement */) {
                // stop at the next element
                return;
            }
            if (nodeDef.flags & 3840 /* CatProviderNoDirective */) {
                const provider = nodeDef.provider;
                const override = providerOverrides.get(provider.token);
                if (override) {
                    nodeDef.flags = (nodeDef.flags & ~3840 /* CatProviderNoDirective */) | override.flags;
                    provider.deps = splitDepsDsl(override.deps);
                    provider.value = override.value;
                }
            }
        }
    }
}
// Notes about the algorithm:
// We only create new data structures if we need to, to keep perf impact
// reasonable.
function applyProviderOverridesToNgModule(def) {
    const { hasOverrides, hasDeprecatedOverrides } = calcHasOverrides(def);
    if (!hasOverrides) {
        return def;
    }
    // clone the whole view definition,
    // as it maintains references between the nodes that are hard to update.
    def = def.factory(() => NOOP);
    applyProviderOverrides(def);
    return def;
    function calcHasOverrides(def) {
        let hasOverrides = false;
        let hasDeprecatedOverrides = false;
        if (providerOverrides.size === 0) {
            return { hasOverrides, hasDeprecatedOverrides };
        }
        def.providers.forEach(node => {
            const override = providerOverrides.get(node.token);
            if ((node.flags & 3840 /* CatProviderNoDirective */) && override) {
                hasOverrides = true;
                hasDeprecatedOverrides = hasDeprecatedOverrides || override.deprecatedBehavior;
            }
        });
        def.modules.forEach(module => {
            providerOverridesWithScope.forEach((override, token) => {
                if (resolveForwardRef(getInjectableDef(token).providedIn) === module) {
                    hasOverrides = true;
                    hasDeprecatedOverrides = hasDeprecatedOverrides || override.deprecatedBehavior;
                }
            });
        });
        return { hasOverrides, hasDeprecatedOverrides };
    }
    function applyProviderOverrides(def) {
        for (let i = 0; i < def.providers.length; i++) {
            const provider = def.providers[i];
            if (hasDeprecatedOverrides) {
                // We had a bug where me made
                // all providers lazy. Keep this logic behind a flag
                // for migrating existing users.
                provider.flags |= 4096 /* LazyProvider */;
            }
            const override = providerOverrides.get(provider.token);
            if (override) {
                provider.flags = (provider.flags & ~3840 /* CatProviderNoDirective */) | override.flags;
                provider.deps = splitDepsDsl(override.deps);
                provider.value = override.value;
            }
        }
        if (providerOverridesWithScope.size > 0) {
            let moduleSet = new Set(def.modules);
            providerOverridesWithScope.forEach((override, token) => {
                if (moduleSet.has(resolveForwardRef(getInjectableDef(token).providedIn))) {
                    let provider = {
                        token: token,
                        flags: override.flags | (hasDeprecatedOverrides ? 4096 /* LazyProvider */ : 0 /* None */),
                        deps: splitDepsDsl(override.deps),
                        value: override.value,
                        index: def.providers.length,
                    };
                    def.providers.push(provider);
                    def.providersByKey[tokenKey(token)] = provider;
                }
            });
        }
    }
}
function prodCheckAndUpdateNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    const nodeDef = view.def.nodes[checkIndex];
    checkAndUpdateNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    return (nodeDef.flags & 224 /* CatPureExpression */) ?
        asPureExpressionData(view, checkIndex).value :
        undefined;
}
function prodCheckNoChangesNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    const nodeDef = view.def.nodes[checkIndex];
    checkNoChangesNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    return (nodeDef.flags & 224 /* CatPureExpression */) ?
        asPureExpressionData(view, checkIndex).value :
        undefined;
}
function debugCheckAndUpdateView(view) {
    return callWithDebugContext(DebugAction.detectChanges, checkAndUpdateView, null, [view]);
}
function debugCheckNoChangesView(view) {
    return callWithDebugContext(DebugAction.checkNoChanges, checkNoChangesView, null, [view]);
}
function debugDestroyView(view) {
    return callWithDebugContext(DebugAction.destroy, destroyView, null, [view]);
}
var DebugAction;
(function (DebugAction) {
    DebugAction[DebugAction["create"] = 0] = "create";
    DebugAction[DebugAction["detectChanges"] = 1] = "detectChanges";
    DebugAction[DebugAction["checkNoChanges"] = 2] = "checkNoChanges";
    DebugAction[DebugAction["destroy"] = 3] = "destroy";
    DebugAction[DebugAction["handleEvent"] = 4] = "handleEvent";
})(DebugAction || (DebugAction = {}));
let _currentAction;
let _currentView;
let _currentNodeIndex;
function debugSetCurrentNode(view, nodeIndex) {
    _currentView = view;
    _currentNodeIndex = nodeIndex;
}
function debugHandleEvent(view, nodeIndex, eventName, event) {
    debugSetCurrentNode(view, nodeIndex);
    return callWithDebugContext(DebugAction.handleEvent, view.def.handleEvent, null, [view, nodeIndex, eventName, event]);
}
function debugUpdateDirectives(view, checkType) {
    if (view.state & 128 /* Destroyed */) {
        throw viewDestroyedError(DebugAction[_currentAction]);
    }
    debugSetCurrentNode(view, nextDirectiveWithBinding(view, 0));
    return view.def.updateDirectives(debugCheckDirectivesFn, view);
    function debugCheckDirectivesFn(view, nodeIndex, argStyle, ...values) {
        const nodeDef = view.def.nodes[nodeIndex];
        if (checkType === 0 /* CheckAndUpdate */) {
            debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
        }
        else {
            debugCheckNoChangesNode(view, nodeDef, argStyle, values);
        }
        if (nodeDef.flags & 16384 /* TypeDirective */) {
            debugSetCurrentNode(view, nextDirectiveWithBinding(view, nodeIndex));
        }
        return (nodeDef.flags & 224 /* CatPureExpression */) ?
            asPureExpressionData(view, nodeDef.nodeIndex).value :
            undefined;
    }
}
function debugUpdateRenderer(view, checkType) {
    if (view.state & 128 /* Destroyed */) {
        throw viewDestroyedError(DebugAction[_currentAction]);
    }
    debugSetCurrentNode(view, nextRenderNodeWithBinding(view, 0));
    return view.def.updateRenderer(debugCheckRenderNodeFn, view);
    function debugCheckRenderNodeFn(view, nodeIndex, argStyle, ...values) {
        const nodeDef = view.def.nodes[nodeIndex];
        if (checkType === 0 /* CheckAndUpdate */) {
            debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
        }
        else {
            debugCheckNoChangesNode(view, nodeDef, argStyle, values);
        }
        if (nodeDef.flags & 3 /* CatRenderNode */) {
            debugSetCurrentNode(view, nextRenderNodeWithBinding(view, nodeIndex));
        }
        return (nodeDef.flags & 224 /* CatPureExpression */) ?
            asPureExpressionData(view, nodeDef.nodeIndex).value :
            undefined;
    }
}
function debugCheckAndUpdateNode(view, nodeDef, argStyle, givenValues) {
    const changed = checkAndUpdateNode(view, nodeDef, argStyle, ...givenValues);
    if (changed) {
        const values = argStyle === 1 /* Dynamic */ ? givenValues[0] : givenValues;
        if (nodeDef.flags & 16384 /* TypeDirective */) {
            const bindingValues = {};
            for (let i = 0; i < nodeDef.bindings.length; i++) {
                const binding = nodeDef.bindings[i];
                const value = values[i];
                if (binding.flags & 8 /* TypeProperty */) {
                    bindingValues[normalizeDebugBindingName(binding.nonMinifiedName)] =
                        normalizeDebugBindingValue(value);
                }
            }
            const elDef = nodeDef.parent;
            const el = asElementData(view, elDef.nodeIndex).renderElement;
            if (!elDef.element.name) {
                // a comment.
                view.renderer.setValue(el, escapeCommentText(`bindings=${JSON.stringify(bindingValues, null, 2)}`));
            }
            else {
                // a regular element.
                for (let attr in bindingValues) {
                    const value = bindingValues[attr];
                    if (value != null) {
                        view.renderer.setAttribute(el, attr, value);
                    }
                    else {
                        view.renderer.removeAttribute(el, attr);
                    }
                }
            }
        }
    }
}
function debugCheckNoChangesNode(view, nodeDef, argStyle, values) {
    checkNoChangesNode(view, nodeDef, argStyle, ...values);
}
function nextDirectiveWithBinding(view, nodeIndex) {
    for (let i = nodeIndex; i < view.def.nodes.length; i++) {
        const nodeDef = view.def.nodes[i];
        if (nodeDef.flags & 16384 /* TypeDirective */ && nodeDef.bindings && nodeDef.bindings.length) {
            return i;
        }
    }
    return null;
}
function nextRenderNodeWithBinding(view, nodeIndex) {
    for (let i = nodeIndex; i < view.def.nodes.length; i++) {
        const nodeDef = view.def.nodes[i];
        if ((nodeDef.flags & 3 /* CatRenderNode */) && nodeDef.bindings && nodeDef.bindings.length) {
            return i;
        }
    }
    return null;
}
class DebugContext_ {
    constructor(view, nodeIndex) {
        this.view = view;
        this.nodeIndex = nodeIndex;
        if (nodeIndex == null) {
            this.nodeIndex = nodeIndex = 0;
        }
        this.nodeDef = view.def.nodes[nodeIndex];
        let elDef = this.nodeDef;
        let elView = view;
        while (elDef && (elDef.flags & 1 /* TypeElement */) === 0) {
            elDef = elDef.parent;
        }
        if (!elDef) {
            while (!elDef && elView) {
                elDef = viewParentEl(elView);
                elView = elView.parent;
            }
        }
        this.elDef = elDef;
        this.elView = elView;
    }
    get elOrCompView() {
        // Has to be done lazily as we use the DebugContext also during creation of elements...
        return asElementData(this.elView, this.elDef.nodeIndex).componentView || this.view;
    }
    get injector() {
        return createInjector(this.elView, this.elDef);
    }
    get component() {
        return this.elOrCompView.component;
    }
    get context() {
        return this.elOrCompView.context;
    }
    get providerTokens() {
        const tokens = [];
        if (this.elDef) {
            for (let i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
                const childDef = this.elView.def.nodes[i];
                if (childDef.flags & 20224 /* CatProvider */) {
                    tokens.push(childDef.provider.token);
                }
                i += childDef.childCount;
            }
        }
        return tokens;
    }
    get references() {
        const references = {};
        if (this.elDef) {
            collectReferences(this.elView, this.elDef, references);
            for (let i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
                const childDef = this.elView.def.nodes[i];
                if (childDef.flags & 20224 /* CatProvider */) {
                    collectReferences(this.elView, childDef, references);
                }
                i += childDef.childCount;
            }
        }
        return references;
    }
    get componentRenderElement() {
        const elData = findHostElement(this.elOrCompView);
        return elData ? elData.renderElement : undefined;
    }
    get renderNode() {
        return this.nodeDef.flags & 2 /* TypeText */ ? renderNode(this.view, this.nodeDef) :
            renderNode(this.elView, this.elDef);
    }
    logError(console, ...values) {
        let logViewDef;
        let logNodeIndex;
        if (this.nodeDef.flags & 2 /* TypeText */) {
            logViewDef = this.view.def;
            logNodeIndex = this.nodeDef.nodeIndex;
        }
        else {
            logViewDef = this.elView.def;
            logNodeIndex = this.elDef.nodeIndex;
        }
        // Note: we only generate a log function for text and element nodes
        // to make the generated code as small as possible.
        const renderNodeIndex = getRenderNodeIndex(logViewDef, logNodeIndex);
        let currRenderNodeIndex = -1;
        let nodeLogger = () => {
            currRenderNodeIndex++;
            if (currRenderNodeIndex === renderNodeIndex) {
                return console.error.bind(console, ...values);
            }
            else {
                return NOOP;
            }
        };
        logViewDef.factory(nodeLogger);
        if (currRenderNodeIndex < renderNodeIndex) {
            console.error('Illegal state: the ViewDefinitionFactory did not call the logger!');
            console.error(...values);
        }
    }
}
function getRenderNodeIndex(viewDef, nodeIndex) {
    let renderNodeIndex = -1;
    for (let i = 0; i <= nodeIndex; i++) {
        const nodeDef = viewDef.nodes[i];
        if (nodeDef.flags & 3 /* CatRenderNode */) {
            renderNodeIndex++;
        }
    }
    return renderNodeIndex;
}
function findHostElement(view) {
    while (view && !isComponentView(view)) {
        view = view.parent;
    }
    if (view.parent) {
        return asElementData(view.parent, viewParentEl(view).nodeIndex);
    }
    return null;
}
function collectReferences(view, nodeDef, references) {
    for (let refName in nodeDef.references) {
        references[refName] = getQueryValue(view, nodeDef, nodeDef.references[refName]);
    }
}
function callWithDebugContext(action, fn, self, args) {
    const oldAction = _currentAction;
    const oldView = _currentView;
    const oldNodeIndex = _currentNodeIndex;
    try {
        _currentAction = action;
        const result = fn.apply(self, args);
        _currentView = oldView;
        _currentNodeIndex = oldNodeIndex;
        _currentAction = oldAction;
        return result;
    }
    catch (e) {
        if (isViewDebugError(e) || !_currentView) {
            throw e;
        }
        throw viewWrappedDebugError(e, getCurrentDebugContext());
    }
}
export function getCurrentDebugContext() {
    return _currentView ? new DebugContext_(_currentView, _currentNodeIndex) : null;
}
export class DebugRendererFactory2 {
    constructor(delegate) {
        this.delegate = delegate;
    }
    createRenderer(element, renderData) {
        return new DebugRenderer2(this.delegate.createRenderer(element, renderData));
    }
    begin() {
        if (this.delegate.begin) {
            this.delegate.begin();
        }
    }
    end() {
        if (this.delegate.end) {
            this.delegate.end();
        }
    }
    whenRenderingDone() {
        if (this.delegate.whenRenderingDone) {
            return this.delegate.whenRenderingDone();
        }
        return Promise.resolve(null);
    }
}
export class DebugRenderer2 {
    constructor(delegate) {
        this.delegate = delegate;
        /**
         * Factory function used to create a `DebugContext` when a node is created.
         *
         * The `DebugContext` allows to retrieve information about the nodes that are useful in tests.
         *
         * The factory is configurable so that the `DebugRenderer2` could instantiate either a View Engine
         * or a Render context.
         */
        this.debugContextFactory = getCurrentDebugContext;
        this.data = this.delegate.data;
    }
    createDebugContext(nativeElement) {
        return this.debugContextFactory(nativeElement);
    }
    destroyNode(node) {
        const debugNode = getDebugNode(node);
        if (debugNode) {
            removeDebugNodeFromIndex(debugNode);
            if (debugNode instanceof DebugNode__PRE_R3__) {
                debugNode.listeners.length = 0;
            }
        }
        if (this.delegate.destroyNode) {
            this.delegate.destroyNode(node);
        }
    }
    destroy() {
        this.delegate.destroy();
    }
    createElement(name, namespace) {
        const el = this.delegate.createElement(name, namespace);
        const debugCtx = this.createDebugContext(el);
        if (debugCtx) {
            const debugEl = new DebugElement__PRE_R3__(el, null, debugCtx);
            debugEl.name = name;
            indexDebugNode(debugEl);
        }
        return el;
    }
    createComment(value) {
        const comment = this.delegate.createComment(escapeCommentText(value));
        const debugCtx = this.createDebugContext(comment);
        if (debugCtx) {
            indexDebugNode(new DebugNode__PRE_R3__(comment, null, debugCtx));
        }
        return comment;
    }
    createText(value) {
        const text = this.delegate.createText(value);
        const debugCtx = this.createDebugContext(text);
        if (debugCtx) {
            indexDebugNode(new DebugNode__PRE_R3__(text, null, debugCtx));
        }
        return text;
    }
    appendChild(parent, newChild) {
        const debugEl = getDebugNode(parent);
        const debugChildEl = getDebugNode(newChild);
        if (debugEl && debugChildEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.addChild(debugChildEl);
        }
        this.delegate.appendChild(parent, newChild);
    }
    insertBefore(parent, newChild, refChild, isMove) {
        const debugEl = getDebugNode(parent);
        const debugChildEl = getDebugNode(newChild);
        const debugRefEl = getDebugNode(refChild);
        if (debugEl && debugChildEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.insertBefore(debugRefEl, debugChildEl);
        }
        this.delegate.insertBefore(parent, newChild, refChild, isMove);
    }
    removeChild(parent, oldChild) {
        const debugEl = getDebugNode(parent);
        const debugChildEl = getDebugNode(oldChild);
        if (debugEl && debugChildEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.removeChild(debugChildEl);
        }
        this.delegate.removeChild(parent, oldChild);
    }
    selectRootElement(selectorOrNode, preserveContent) {
        const el = this.delegate.selectRootElement(selectorOrNode, preserveContent);
        const debugCtx = getCurrentDebugContext();
        if (debugCtx) {
            indexDebugNode(new DebugElement__PRE_R3__(el, null, debugCtx));
        }
        return el;
    }
    setAttribute(el, name, value, namespace) {
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            const fullName = namespace ? namespace + ':' + name : name;
            debugEl.attributes[fullName] = value;
        }
        this.delegate.setAttribute(el, name, value, namespace);
    }
    removeAttribute(el, name, namespace) {
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            const fullName = namespace ? namespace + ':' + name : name;
            debugEl.attributes[fullName] = null;
        }
        this.delegate.removeAttribute(el, name, namespace);
    }
    addClass(el, name) {
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.classes[name] = true;
        }
        this.delegate.addClass(el, name);
    }
    removeClass(el, name) {
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.classes[name] = false;
        }
        this.delegate.removeClass(el, name);
    }
    setStyle(el, style, value, flags) {
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.styles[style] = value;
        }
        this.delegate.setStyle(el, style, value, flags);
    }
    removeStyle(el, style, flags) {
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.styles[style] = null;
        }
        this.delegate.removeStyle(el, style, flags);
    }
    setProperty(el, name, value) {
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.properties[name] = value;
        }
        this.delegate.setProperty(el, name, value);
    }
    listen(target, eventName, callback) {
        if (typeof target !== 'string') {
            const debugEl = getDebugNode(target);
            if (debugEl) {
                debugEl.listeners.push(new DebugEventListener(eventName, callback));
            }
        }
        return this.delegate.listen(target, eventName, callback);
    }
    parentNode(node) {
        return this.delegate.parentNode(node);
    }
    nextSibling(node) {
        return this.delegate.nextSibling(node);
    }
    setValue(node, value) {
        return this.delegate.setValue(node, value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy92aWV3L3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDNUosT0FBTyxFQUFXLGlCQUFpQixFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ2xELE9BQU8sRUFBQyxnQkFBZ0IsRUFBMEMsTUFBTSxzQkFBc0IsQ0FBQztBQUMvRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFJOUMsT0FBTyxFQUFZLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTFELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDOUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzlDLE9BQU8sRUFBQyx5QkFBeUIsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXpGLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNyRixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDMUQsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxpQ0FBaUMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUM1RixPQUFPLEVBQWUsYUFBYSxFQUFFLG9CQUFvQixFQUFzSSxRQUFRLEVBQXNDLE1BQU0s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QVMsRUFBRSxLQUFhO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RlYnVnRWxlbWVudF9fUFJFX1IzX18sIERlYnVnRXZlbnRMaXN0ZW5lciwgRGVidWdOb2RlX19QUkVfUjNfXywgZ2V0RGVidWdOb2RlLCBpbmRleERlYnVnTm9kZSwgcmVtb3ZlRGVidWdOb2RlRnJvbUluZGV4fSBmcm9tICcuLi9kZWJ1Zy9kZWJ1Z19ub2RlJztcbmltcG9ydCB7SW5qZWN0b3IsIHJlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuLi9kaSc7XG5pbXBvcnQge2dldEluamVjdGFibGVEZWYsIEluamVjdGFibGVUeXBlLCDJtcm1SW5qZWN0YWJsZURlY2xhcmF0aW9ufSBmcm9tICcuLi9kaS9pbnRlcmZhY2UvZGVmcyc7XG5pbXBvcnQge0Vycm9ySGFuZGxlcn0gZnJvbSAnLi4vZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7TmdNb2R1bGVSZWZ9IGZyb20gJy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge1JlbmRlcmVyMiwgUmVuZGVyZXJGYWN0b3J5Mn0gZnJvbSAnLi4vcmVuZGVyL2FwaSc7XG5pbXBvcnQge1JlbmRlcmVyU3R5bGVGbGFnczIsIFJlbmRlcmVyVHlwZTJ9IGZyb20gJy4uL3JlbmRlci9hcGlfZmxhZ3MnO1xuaW1wb3J0IHtTYW5pdGl6ZXJ9IGZyb20gJy4uL3Nhbml0aXphdGlvbi9zYW5pdGl6ZXInO1xuaW1wb3J0IHtlc2NhcGVDb21tZW50VGV4dH0gZnJvbSAnLi4vdXRpbC9kb20nO1xuaW1wb3J0IHtpc0Rldk1vZGV9IGZyb20gJy4uL3V0aWwvaXNfZGV2X21vZGUnO1xuaW1wb3J0IHtub3JtYWxpemVEZWJ1Z0JpbmRpbmdOYW1lLCBub3JtYWxpemVEZWJ1Z0JpbmRpbmdWYWx1ZX0gZnJvbSAnLi4vdXRpbC9uZ19yZWZsZWN0JztcblxuaW1wb3J0IHtpc1ZpZXdEZWJ1Z0Vycm9yLCB2aWV3RGVzdHJveWVkRXJyb3IsIHZpZXdXcmFwcGVkRGVidWdFcnJvcn0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtyZXNvbHZlRGVwfSBmcm9tICcuL3Byb3ZpZGVyJztcbmltcG9ydCB7ZGlydHlQYXJlbnRRdWVyaWVzLCBnZXRRdWVyeVZhbHVlfSBmcm9tICcuL3F1ZXJ5JztcbmltcG9ydCB7Y3JlYXRlSW5qZWN0b3IsIGNyZWF0ZU5nTW9kdWxlUmVmLCBnZXRDb21wb25lbnRWaWV3RGVmaW5pdGlvbkZhY3Rvcnl9IGZyb20gJy4vcmVmcyc7XG5pbXBvcnQge0FyZ3VtZW50VHlwZSwgYXNFbGVtZW50RGF0YSwgYXNQdXJlRXhwcmVzc2lvbkRhdGEsIEJpbmRpbmdGbGFncywgQ2hlY2tUeXBlLCBEZWJ1Z0NvbnRleHQsIEVsZW1lbnREYXRhLCBOZ01vZHVsZURlZmluaXRpb24sIE5vZGVEZWYsIE5vZGVGbGFncywgTm9kZUxvZ2dlciwgUHJvdmlkZXJPdmVycmlkZSwgUm9vdERhdGEsIFNlcnZpY2VzLCBWaWV3RGF0YSwgVmlld0RlZmluaXRpb24sIFZpZXdTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge2lzQ29tcG9uZW50VmlldywgTk9PUCwgcmVuZGVyTm9kZSwgcmVzb2x2ZURlZmluaXRpb24sIHNwbGl0RGVwc0RzbCwgdG9rZW5LZXksIHZpZXdQYXJlbnRFbH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7Y2hlY2tBbmRVcGRhdGVOb2RlLCBjaGVja0FuZFVwZGF0ZVZpZXcsIGNoZWNrTm9DaGFuZ2VzTm9kZSwgY2hlY2tOb0NoYW5nZXNWaWV3LCBjcmVhdGVDb21wb25lbnRWaWV3LCBjcmVhdGVFbWJlZGRlZFZpZXcsIGNyZWF0ZVJvb3RWaWV3LCBkZXN0cm95Vmlld30gZnJvbSAnLi92aWV3JztcblxuXG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRTZXJ2aWNlc0lmTmVlZGVkKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBjb25zdCBzZXJ2aWNlcyA9IGlzRGV2TW9kZSgpID8gY3JlYXRlRGVidWdTZXJ2aWNlcygpIDogY3JlYXRlUHJvZFNlcnZpY2VzKCk7XG4gIFNlcnZpY2VzLnNldEN1cnJlbnROb2RlID0gc2VydmljZXMuc2V0Q3VycmVudE5vZGU7XG4gIFNlcnZpY2VzLmNyZWF0ZVJvb3RWaWV3ID0gc2VydmljZXMuY3JlYXRlUm9vdFZpZXc7XG4gIFNlcnZpY2VzLmNyZWF0ZUVtYmVkZGVkVmlldyA9IHNlcnZpY2VzLmNyZWF0ZUVtYmVkZGVkVmlldztcbiAgU2VydmljZXMuY3JlYXRlQ29tcG9uZW50VmlldyA9IHNlcnZpY2VzLmNyZWF0ZUNvbXBvbmVudFZpZXc7XG4gIFNlcnZpY2VzLmNyZWF0ZU5nTW9kdWxlUmVmID0gc2VydmljZXMuY3JlYXRlTmdNb2R1bGVSZWY7XG4gIFNlcnZpY2VzLm92ZXJyaWRlUHJvdmlkZXIgPSBzZXJ2aWNlcy5vdmVycmlkZVByb3ZpZGVyO1xuICBTZXJ2aWNlcy5vdmVycmlkZUNvbXBvbmVudFZpZXcgPSBzZXJ2aWNlcy5vdmVycmlkZUNvbXBvbmVudFZpZXc7XG4gIFNlcnZpY2VzLmNsZWFyT3ZlcnJpZGVzID0gc2VydmljZXMuY2xlYXJPdmVycmlkZXM7XG4gIFNlcnZpY2VzLmNoZWNrQW5kVXBkYXRlVmlldyA9IHNlcnZpY2VzLmNoZWNrQW5kVXBkYXRlVmlldztcbiAgU2VydmljZXMuY2hlY2tOb0NoYW5nZXNWaWV3ID0gc2VydmljZXMuY2hlY2tOb0NoYW5nZXNWaWV3O1xuICBTZXJ2aWNlcy5kZXN0cm95VmlldyA9IHNlcnZpY2VzLmRlc3Ryb3lWaWV3O1xuICBTZXJ2aWNlcy5yZXNvbHZlRGVwID0gcmVzb2x2ZURlcDtcbiAgU2VydmljZXMuY3JlYXRlRGVidWdDb250ZXh0ID0gc2VydmljZXMuY3JlYXRlRGVidWdDb250ZXh0O1xuICBTZXJ2aWNlcy5oYW5kbGVFdmVudCA9IHNlcnZpY2VzLmhhbmRsZUV2ZW50O1xuICBTZXJ2aWNlcy51cGRhdGVEaXJlY3RpdmVzID0gc2VydmljZXMudXBkYXRlRGlyZWN0aXZlcztcbiAgU2VydmljZXMudXBkYXRlUmVuZGVyZXIgPSBzZXJ2aWNlcy51cGRhdGVSZW5kZXJlcjtcbiAgU2VydmljZXMuZGlydHlQYXJlbnRRdWVyaWVzID0gZGlydHlQYXJlbnRRdWVyaWVzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9kU2VydmljZXMoKSB7XG4gIHJldHVybiB7XG4gICAgc2V0Q3VycmVudE5vZGU6ICgpID0+IHt9LFxuICAgIGNyZWF0ZVJvb3RWaWV3OiBjcmVhdGVQcm9kUm9vdFZpZXcsXG4gICAgY3JlYXRlRW1iZWRkZWRWaWV3OiBjcmVhdGVFbWJlZGRlZFZpZXcsXG4gICAgY3JlYXRlQ29tcG9uZW50VmlldzogY3JlYXRlQ29tcG9uZW50VmlldyxcbiAgICBjcmVhdGVOZ01vZHVsZVJlZjogY3JlYXRlTmdNb2R1bGVSZWYsXG4gICAgb3ZlcnJpZGVQcm92aWRlcjogTk9PUCxcbiAgICBvdmVycmlkZUNvbXBvbmVudFZpZXc6IE5PT1AsXG4gICAgY2xlYXJPdmVycmlkZXM6IE5PT1AsXG4gICAgY2hlY2tBbmRVcGRhdGVWaWV3OiBjaGVja0FuZFVwZGF0ZVZpZXcsXG4gICAgY2hlY2tOb0NoYW5nZXNWaWV3OiBjaGVja05vQ2hhbmdlc1ZpZXcsXG4gICAgZGVzdHJveVZpZXc6IGRlc3Ryb3lWaWV3LFxuICAgIGNyZWF0ZURlYnVnQ29udGV4dDogKHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlcikgPT4gbmV3IERlYnVnQ29udGV4dF8odmlldywgbm9kZUluZGV4KSxcbiAgICBoYW5kbGVFdmVudDogKHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpID0+XG4gICAgICAgIHZpZXcuZGVmLmhhbmRsZUV2ZW50KHZpZXcsIG5vZGVJbmRleCwgZXZlbnROYW1lLCBldmVudCksXG4gICAgdXBkYXRlRGlyZWN0aXZlczogKHZpZXc6IFZpZXdEYXRhLCBjaGVja1R5cGU6IENoZWNrVHlwZSkgPT4gdmlldy5kZWYudXBkYXRlRGlyZWN0aXZlcyhcbiAgICAgICAgY2hlY2tUeXBlID09PSBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUgPyBwcm9kQ2hlY2tBbmRVcGRhdGVOb2RlIDogcHJvZENoZWNrTm9DaGFuZ2VzTm9kZSxcbiAgICAgICAgdmlldyksXG4gICAgdXBkYXRlUmVuZGVyZXI6ICh2aWV3OiBWaWV3RGF0YSwgY2hlY2tUeXBlOiBDaGVja1R5cGUpID0+IHZpZXcuZGVmLnVwZGF0ZVJlbmRlcmVyKFxuICAgICAgICBjaGVja1R5cGUgPT09IENoZWNrVHlwZS5DaGVja0FuZFVwZGF0ZSA/IHByb2RDaGVja0FuZFVwZGF0ZU5vZGUgOiBwcm9kQ2hlY2tOb0NoYW5nZXNOb2RlLFxuICAgICAgICB2aWV3KSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGVidWdTZXJ2aWNlcygpIHtcbiAgcmV0dXJuIHtcbiAgICBzZXRDdXJyZW50Tm9kZTogZGVidWdTZXRDdXJyZW50Tm9kZSxcbiAgICBjcmVhdGVSb290VmlldzogZGVidWdDcmVhdGVSb290VmlldyxcbiAgICBjcmVhdGVFbWJlZGRlZFZpZXc6IGRlYnVnQ3JlYXRlRW1iZWRkZWRWaWV3LFxuICAgIGNyZWF0ZUNvbXBvbmVudFZpZXc6IGRlYnVnQ3JlYXRlQ29tcG9uZW50VmlldyxcbiAgICBjcmVhdGVOZ01vZHVsZVJlZjogZGVidWdDcmVhdGVOZ01vZHVsZVJlZixcbiAgICBvdmVycmlkZVByb3ZpZGVyOiBkZWJ1Z092ZXJyaWRlUHJvdmlkZXIsXG4gICAgb3ZlcnJpZGVDb21wb25lbnRWaWV3OiBkZWJ1Z092ZXJyaWRlQ29tcG9uZW50VmlldyxcbiAgICBjbGVhck92ZXJyaWRlczogZGVidWdDbGVhck92ZXJyaWRlcyxcbiAgICBjaGVja0FuZFVwZGF0ZVZpZXc6IGRlYnVnQ2hlY2tBbmRVcGRhdGVWaWV3LFxuICAgIGNoZWNrTm9DaGFuZ2VzVmlldzogZGVidWdDaGVja05vQ2hhbmdlc1ZpZXcsXG4gICAgZGVzdHJveVZpZXc6IGRlYnVnRGVzdHJveVZpZXcsXG4gICAgY3JlYXRlRGVidWdDb250ZXh0OiAodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKSA9PiBuZXcgRGVidWdDb250ZXh0Xyh2aWV3LCBub2RlSW5kZXgpLFxuICAgIGhhbmRsZUV2ZW50OiBkZWJ1Z0hhbmRsZUV2ZW50LFxuICAgIHVwZGF0ZURpcmVjdGl2ZXM6IGRlYnVnVXBkYXRlRGlyZWN0aXZlcyxcbiAgICB1cGRhdGVSZW5kZXJlcjogZGVidWdVcGRhdGVSZW5kZXJlcixcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvZFJvb3RWaWV3KFxuICAgIGVsSW5qZWN0b3I6IEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzOiBhbnlbXVtdLCByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZ3xhbnksXG4gICAgZGVmOiBWaWV3RGVmaW5pdGlvbiwgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4sIGNvbnRleHQ/OiBhbnkpOiBWaWV3RGF0YSB7XG4gIGNvbnN0IHJlbmRlcmVyRmFjdG9yeTogUmVuZGVyZXJGYWN0b3J5MiA9IG5nTW9kdWxlLmluamVjdG9yLmdldChSZW5kZXJlckZhY3RvcnkyKTtcbiAgcmV0dXJuIGNyZWF0ZVJvb3RWaWV3KFxuICAgICAgY3JlYXRlUm9vdERhdGEoZWxJbmplY3RvciwgbmdNb2R1bGUsIHJlbmRlcmVyRmFjdG9yeSwgcHJvamVjdGFibGVOb2Rlcywgcm9vdFNlbGVjdG9yT3JOb2RlKSxcbiAgICAgIGRlZiwgY29udGV4dCk7XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ3JlYXRlUm9vdFZpZXcoXG4gICAgZWxJbmplY3RvcjogSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10sIHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nfGFueSxcbiAgICBkZWY6IFZpZXdEZWZpbml0aW9uLCBuZ01vZHVsZTogTmdNb2R1bGVSZWY8YW55PiwgY29udGV4dD86IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3QgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnkyID0gbmdNb2R1bGUuaW5qZWN0b3IuZ2V0KFJlbmRlcmVyRmFjdG9yeTIpO1xuICBjb25zdCByb290ID0gY3JlYXRlUm9vdERhdGEoXG4gICAgICBlbEluamVjdG9yLCBuZ01vZHVsZSwgbmV3IERlYnVnUmVuZGVyZXJGYWN0b3J5MihyZW5kZXJlckZhY3RvcnkpLCBwcm9qZWN0YWJsZU5vZGVzLFxuICAgICAgcm9vdFNlbGVjdG9yT3JOb2RlKTtcbiAgY29uc3QgZGVmV2l0aE92ZXJyaWRlID0gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvVmlldyhkZWYpO1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoXG4gICAgICBEZWJ1Z0FjdGlvbi5jcmVhdGUsIGNyZWF0ZVJvb3RWaWV3LCBudWxsLCBbcm9vdCwgZGVmV2l0aE92ZXJyaWRlLCBjb250ZXh0XSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJvb3REYXRhKFxuICAgIGVsSW5qZWN0b3I6IEluamVjdG9yLCBuZ01vZHVsZTogTmdNb2R1bGVSZWY8YW55PiwgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnkyLFxuICAgIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10sIHJvb3RTZWxlY3Rvck9yTm9kZTogYW55KTogUm9vdERhdGEge1xuICBjb25zdCBzYW5pdGl6ZXIgPSBuZ01vZHVsZS5pbmplY3Rvci5nZXQoU2FuaXRpemVyKTtcbiAgY29uc3QgZXJyb3JIYW5kbGVyID0gbmdNb2R1bGUuaW5qZWN0b3IuZ2V0KEVycm9ySGFuZGxlcik7XG4gIGNvbnN0IHJlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKG51bGwsIG51bGwpO1xuICByZXR1cm4ge1xuICAgIG5nTW9kdWxlLFxuICAgIGluamVjdG9yOiBlbEluamVjdG9yLFxuICAgIHByb2plY3RhYmxlTm9kZXMsXG4gICAgc2VsZWN0b3JPck5vZGU6IHJvb3RTZWxlY3Rvck9yTm9kZSxcbiAgICBzYW5pdGl6ZXIsXG4gICAgcmVuZGVyZXJGYWN0b3J5LFxuICAgIHJlbmRlcmVyLFxuICAgIGVycm9ySGFuZGxlclxuICB9O1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0NyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICBwYXJlbnRWaWV3OiBWaWV3RGF0YSwgYW5jaG9yRGVmOiBOb2RlRGVmLCB2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgY29udGV4dD86IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3QgZGVmV2l0aE92ZXJyaWRlID0gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvVmlldyh2aWV3RGVmKTtcbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KFxuICAgICAgRGVidWdBY3Rpb24uY3JlYXRlLCBjcmVhdGVFbWJlZGRlZFZpZXcsIG51bGwsXG4gICAgICBbcGFyZW50VmlldywgYW5jaG9yRGVmLCBkZWZXaXRoT3ZlcnJpZGUsIGNvbnRleHRdKTtcbn1cblxuZnVuY3Rpb24gZGVidWdDcmVhdGVDb21wb25lbnRWaWV3KFxuICAgIHBhcmVudFZpZXc6IFZpZXdEYXRhLCBub2RlRGVmOiBOb2RlRGVmLCB2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgaG9zdEVsZW1lbnQ6IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3Qgb3ZlcnJpZGVDb21wb25lbnRWaWV3ID1cbiAgICAgIHZpZXdEZWZPdmVycmlkZXMuZ2V0KG5vZGVEZWYuZWxlbWVudCEuY29tcG9uZW50UHJvdmlkZXIhLnByb3ZpZGVyIS50b2tlbik7XG4gIGlmIChvdmVycmlkZUNvbXBvbmVudFZpZXcpIHtcbiAgICB2aWV3RGVmID0gb3ZlcnJpZGVDb21wb25lbnRWaWV3O1xuICB9IGVsc2Uge1xuICAgIHZpZXdEZWYgPSBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzVG9WaWV3KHZpZXdEZWYpO1xuICB9XG4gIHJldHVybiBjYWxsV2l0aERlYnVnQ29udGV4dChcbiAgICAgIERlYnVnQWN0aW9uLmNyZWF0ZSwgY3JlYXRlQ29tcG9uZW50VmlldywgbnVsbCwgW3BhcmVudFZpZXcsIG5vZGVEZWYsIHZpZXdEZWYsIGhvc3RFbGVtZW50XSk7XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ3JlYXRlTmdNb2R1bGVSZWYoXG4gICAgbW9kdWxlVHlwZTogVHlwZTxhbnk+LCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIGJvb3RzdHJhcENvbXBvbmVudHM6IFR5cGU8YW55PltdLFxuICAgIGRlZjogTmdNb2R1bGVEZWZpbml0aW9uKTogTmdNb2R1bGVSZWY8YW55PiB7XG4gIGNvbnN0IGRlZldpdGhPdmVycmlkZSA9IGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb05nTW9kdWxlKGRlZik7XG4gIHJldHVybiBjcmVhdGVOZ01vZHVsZVJlZihtb2R1bGVUeXBlLCBwYXJlbnRJbmplY3RvciwgYm9vdHN0cmFwQ29tcG9uZW50cywgZGVmV2l0aE92ZXJyaWRlKTtcbn1cblxuY29uc3QgcHJvdmlkZXJPdmVycmlkZXMgPSBuZXcgTWFwPGFueSwgUHJvdmlkZXJPdmVycmlkZT4oKTtcbmNvbnN0IHByb3ZpZGVyT3ZlcnJpZGVzV2l0aFNjb3BlID0gbmV3IE1hcDxJbmplY3RhYmxlVHlwZTxhbnk+LCBQcm92aWRlck92ZXJyaWRlPigpO1xuY29uc3Qgdmlld0RlZk92ZXJyaWRlcyA9IG5ldyBNYXA8YW55LCBWaWV3RGVmaW5pdGlvbj4oKTtcblxuZnVuY3Rpb24gZGVidWdPdmVycmlkZVByb3ZpZGVyKG92ZXJyaWRlOiBQcm92aWRlck92ZXJyaWRlKSB7XG4gIHByb3ZpZGVyT3ZlcnJpZGVzLnNldChvdmVycmlkZS50b2tlbiwgb3ZlcnJpZGUpO1xuICBsZXQgaW5qZWN0YWJsZURlZjogybXJtUluamVjdGFibGVEZWNsYXJhdGlvbjxhbnk+fG51bGw7XG4gIGlmICh0eXBlb2Ygb3ZlcnJpZGUudG9rZW4gPT09ICdmdW5jdGlvbicgJiYgKGluamVjdGFibGVEZWYgPSBnZXRJbmplY3RhYmxlRGVmKG92ZXJyaWRlLnRva2VuKSkgJiZcbiAgICAgIHR5cGVvZiBpbmplY3RhYmxlRGVmLnByb3ZpZGVkSW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcm92aWRlck92ZXJyaWRlc1dpdGhTY29wZS5zZXQob3ZlcnJpZGUudG9rZW4gYXMgSW5qZWN0YWJsZVR5cGU8YW55Piwgb3ZlcnJpZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlYnVnT3ZlcnJpZGVDb21wb25lbnRWaWV3KGNvbXA6IGFueSwgY29tcEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55Pikge1xuICBjb25zdCBob3N0Vmlld0RlZiA9IHJlc29sdmVEZWZpbml0aW9uKGdldENvbXBvbmVudFZpZXdEZWZpbml0aW9uRmFjdG9yeShjb21wRmFjdG9yeSkpO1xuICBjb25zdCBjb21wVmlld0RlZiA9IHJlc29sdmVEZWZpbml0aW9uKGhvc3RWaWV3RGVmLm5vZGVzWzBdLmVsZW1lbnQhLmNvbXBvbmVudFZpZXchKTtcbiAgdmlld0RlZk92ZXJyaWRlcy5zZXQoY29tcCwgY29tcFZpZXdEZWYpO1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0NsZWFyT3ZlcnJpZGVzKCkge1xuICBwcm92aWRlck92ZXJyaWRlcy5jbGVhcigpO1xuICBwcm92aWRlck92ZXJyaWRlc1dpdGhTY29wZS5jbGVhcigpO1xuICB2aWV3RGVmT3ZlcnJpZGVzLmNsZWFyKCk7XG59XG5cbi8vIE5vdGVzIGFib3V0IHRoZSBhbGdvcml0aG06XG4vLyAxKSBMb2NhdGUgdGhlIHByb3ZpZGVycyBvZiBhbiBlbGVtZW50IGFuZCBjaGVjayBpZiBvbmUgb2YgdGhlbSB3YXMgb3ZlcndyaXR0ZW5cbi8vIDIpIENoYW5nZSB0aGUgcHJvdmlkZXJzIG9mIHRoYXQgZWxlbWVudFxuLy9cbi8vIFdlIG9ubHkgY3JlYXRlIG5ldyBkYXRhIHN0cnVjdHVyZXMgaWYgd2UgbmVlZCB0bywgdG8ga2VlcCBwZXJmIGltcGFjdFxuLy8gcmVhc29uYWJsZS5cbmZ1bmN0aW9uIGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb1ZpZXcoZGVmOiBWaWV3RGVmaW5pdGlvbik6IFZpZXdEZWZpbml0aW9uIHtcbiAgaWYgKHByb3ZpZGVyT3ZlcnJpZGVzLnNpemUgPT09IDApIHtcbiAgICByZXR1cm4gZGVmO1xuICB9XG4gIGNvbnN0IGVsZW1lbnRJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzID0gZmluZEVsZW1lbnRJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzKGRlZik7XG4gIGlmIChlbGVtZW50SW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZGVmO1xuICB9XG4gIC8vIGNsb25lIHRoZSB3aG9sZSB2aWV3IGRlZmluaXRpb24sXG4gIC8vIGFzIGl0IG1haW50YWlucyByZWZlcmVuY2VzIGJldHdlZW4gdGhlIG5vZGVzIHRoYXQgYXJlIGhhcmQgdG8gdXBkYXRlLlxuICBkZWYgPSBkZWYuZmFjdG9yeSEoKCkgPT4gTk9PUCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudEluZGljZXNXaXRoT3ZlcndyaXR0ZW5Qcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzVG9FbGVtZW50KGRlZiwgZWxlbWVudEluZGljZXNXaXRoT3ZlcndyaXR0ZW5Qcm92aWRlcnNbaV0pO1xuICB9XG4gIHJldHVybiBkZWY7XG5cbiAgZnVuY3Rpb24gZmluZEVsZW1lbnRJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzKGRlZjogVmlld0RlZmluaXRpb24pOiBudW1iZXJbXSB7XG4gICAgY29uc3QgZWxJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBsYXN0RWxlbWVudERlZjogTm9kZURlZnxudWxsID0gbnVsbDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZi5ub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZURlZiA9IGRlZi5ub2Rlc1tpXTtcbiAgICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50KSB7XG4gICAgICAgIGxhc3RFbGVtZW50RGVmID0gbm9kZURlZjtcbiAgICAgIH1cbiAgICAgIGlmIChsYXN0RWxlbWVudERlZiAmJiBub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFByb3ZpZGVyTm9EaXJlY3RpdmUgJiZcbiAgICAgICAgICBwcm92aWRlck92ZXJyaWRlcy5oYXMobm9kZURlZi5wcm92aWRlciEudG9rZW4pKSB7XG4gICAgICAgIGVsSW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycy5wdXNoKGxhc3RFbGVtZW50RGVmIS5ub2RlSW5kZXgpO1xuICAgICAgICBsYXN0RWxlbWVudERlZiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbEluZGljZXNXaXRoT3ZlcndyaXR0ZW5Qcm92aWRlcnM7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzVG9FbGVtZW50KHZpZXdEZWY6IFZpZXdEZWZpbml0aW9uLCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0gZWxJbmRleCArIDE7IGkgPCB2aWV3RGVmLm5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlRGVmID0gdmlld0RlZi5ub2Rlc1tpXTtcbiAgICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50KSB7XG4gICAgICAgIC8vIHN0b3AgYXQgdGhlIG5leHQgZWxlbWVudFxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlck5vRGlyZWN0aXZlKSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gbm9kZURlZi5wcm92aWRlciE7XG4gICAgICAgIGNvbnN0IG92ZXJyaWRlID0gcHJvdmlkZXJPdmVycmlkZXMuZ2V0KHByb3ZpZGVyLnRva2VuKTtcbiAgICAgICAgaWYgKG92ZXJyaWRlKSB7XG4gICAgICAgICAgbm9kZURlZi5mbGFncyA9IChub2RlRGVmLmZsYWdzICYgfk5vZGVGbGFncy5DYXRQcm92aWRlck5vRGlyZWN0aXZlKSB8IG92ZXJyaWRlLmZsYWdzO1xuICAgICAgICAgIHByb3ZpZGVyLmRlcHMgPSBzcGxpdERlcHNEc2wob3ZlcnJpZGUuZGVwcyk7XG4gICAgICAgICAgcHJvdmlkZXIudmFsdWUgPSBvdmVycmlkZS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBOb3RlcyBhYm91dCB0aGUgYWxnb3JpdGhtOlxuLy8gV2Ugb25seSBjcmVhdGUgbmV3IGRhdGEgc3RydWN0dXJlcyBpZiB3ZSBuZWVkIHRvLCB0byBrZWVwIHBlcmYgaW1wYWN0XG4vLyByZWFzb25hYmxlLlxuZnVuY3Rpb24gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvTmdNb2R1bGUoZGVmOiBOZ01vZHVsZURlZmluaXRpb24pOiBOZ01vZHVsZURlZmluaXRpb24ge1xuICBjb25zdCB7aGFzT3ZlcnJpZGVzLCBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzfSA9IGNhbGNIYXNPdmVycmlkZXMoZGVmKTtcbiAgaWYgKCFoYXNPdmVycmlkZXMpIHtcbiAgICByZXR1cm4gZGVmO1xuICB9XG4gIC8vIGNsb25lIHRoZSB3aG9sZSB2aWV3IGRlZmluaXRpb24sXG4gIC8vIGFzIGl0IG1haW50YWlucyByZWZlcmVuY2VzIGJldHdlZW4gdGhlIG5vZGVzIHRoYXQgYXJlIGhhcmQgdG8gdXBkYXRlLlxuICBkZWYgPSBkZWYuZmFjdG9yeSEoKCkgPT4gTk9PUCk7XG4gIGFwcGx5UHJvdmlkZXJPdmVycmlkZXMoZGVmKTtcbiAgcmV0dXJuIGRlZjtcblxuICBmdW5jdGlvbiBjYWxjSGFzT3ZlcnJpZGVzKGRlZjogTmdNb2R1bGVEZWZpbml0aW9uKTpcbiAgICAgIHtoYXNPdmVycmlkZXM6IGJvb2xlYW4sIGhhc0RlcHJlY2F0ZWRPdmVycmlkZXM6IGJvb2xlYW59IHtcbiAgICBsZXQgaGFzT3ZlcnJpZGVzID0gZmFsc2U7XG4gICAgbGV0IGhhc0RlcHJlY2F0ZWRPdmVycmlkZXMgPSBmYWxzZTtcbiAgICBpZiAocHJvdmlkZXJPdmVycmlkZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtoYXNPdmVycmlkZXMsIGhhc0RlcHJlY2F0ZWRPdmVycmlkZXN9O1xuICAgIH1cbiAgICBkZWYucHJvdmlkZXJzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBjb25zdCBvdmVycmlkZSA9IHByb3ZpZGVyT3ZlcnJpZGVzLmdldChub2RlLnRva2VuKTtcbiAgICAgIGlmICgobm9kZS5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlck5vRGlyZWN0aXZlKSAmJiBvdmVycmlkZSkge1xuICAgICAgICBoYXNPdmVycmlkZXMgPSB0cnVlO1xuICAgICAgICBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzID0gaGFzRGVwcmVjYXRlZE92ZXJyaWRlcyB8fCBvdmVycmlkZS5kZXByZWNhdGVkQmVoYXZpb3I7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZGVmLm1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgcHJvdmlkZXJPdmVycmlkZXNXaXRoU2NvcGUuZm9yRWFjaCgob3ZlcnJpZGUsIHRva2VuKSA9PiB7XG4gICAgICAgIGlmIChyZXNvbHZlRm9yd2FyZFJlZihnZXRJbmplY3RhYmxlRGVmKHRva2VuKSEucHJvdmlkZWRJbikgPT09IG1vZHVsZSkge1xuICAgICAgICAgIGhhc092ZXJyaWRlcyA9IHRydWU7XG4gICAgICAgICAgaGFzRGVwcmVjYXRlZE92ZXJyaWRlcyA9IGhhc0RlcHJlY2F0ZWRPdmVycmlkZXMgfHwgb3ZlcnJpZGUuZGVwcmVjYXRlZEJlaGF2aW9yO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4ge2hhc092ZXJyaWRlcywgaGFzRGVwcmVjYXRlZE92ZXJyaWRlc307XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzKGRlZjogTmdNb2R1bGVEZWZpbml0aW9uKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWYucHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwcm92aWRlciA9IGRlZi5wcm92aWRlcnNbaV07XG4gICAgICBpZiAoaGFzRGVwcmVjYXRlZE92ZXJyaWRlcykge1xuICAgICAgICAvLyBXZSBoYWQgYSBidWcgd2hlcmUgbWUgbWFkZVxuICAgICAgICAvLyBhbGwgcHJvdmlkZXJzIGxhenkuIEtlZXAgdGhpcyBsb2dpYyBiZWhpbmQgYSBmbGFnXG4gICAgICAgIC8vIGZvciBtaWdyYXRpbmcgZXhpc3RpbmcgdXNlcnMuXG4gICAgICAgIHByb3ZpZGVyLmZsYWdzIHw9IE5vZGVGbGFncy5MYXp5UHJvdmlkZXI7XG4gICAgICB9XG4gICAgICBjb25zdCBvdmVycmlkZSA9IHByb3ZpZGVyT3ZlcnJpZGVzLmdldChwcm92aWRlci50b2tlbik7XG4gICAgICBpZiAob3ZlcnJpZGUpIHtcbiAgICAgICAgcHJvdmlkZXIuZmxhZ3MgPSAocHJvdmlkZXIuZmxhZ3MgJiB+Tm9kZUZsYWdzLkNhdFByb3ZpZGVyTm9EaXJlY3RpdmUpIHwgb3ZlcnJpZGUuZmxhZ3M7XG4gICAgICAgIHByb3ZpZGVyLmRlcHMgPSBzcGxpdERlcHNEc2wob3ZlcnJpZGUuZGVwcyk7XG4gICAgICAgIHByb3ZpZGVyLnZhbHVlID0gb3ZlcnJpZGUudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcm92aWRlck92ZXJyaWRlc1dpdGhTY29wZS5zaXplID4gMCkge1xuICAgICAgbGV0IG1vZHVsZVNldCA9IG5ldyBTZXQ8YW55PihkZWYubW9kdWxlcyk7XG4gICAgICBwcm92aWRlck92ZXJyaWRlc1dpdGhTY29wZS5mb3JFYWNoKChvdmVycmlkZSwgdG9rZW4pID0+IHtcbiAgICAgICAgaWYgKG1vZHVsZVNldC5oYXMocmVzb2x2ZUZvcndhcmRSZWYoZ2V0SW5qZWN0YWJsZURlZih0b2tlbikhLnByb3ZpZGVkSW4pKSkge1xuICAgICAgICAgIGxldCBwcm92aWRlciA9IHtcbiAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgIGZsYWdzOlxuICAgICAgICAgICAgICAgIG92ZXJyaWRlLmZsYWdzIHwgKGhhc0RlcHJlY2F0ZWRPdmVycmlkZXMgPyBOb2RlRmxhZ3MuTGF6eVByb3ZpZGVyIDogTm9kZUZsYWdzLk5vbmUpLFxuICAgICAgICAgICAgZGVwczogc3BsaXREZXBzRHNsKG92ZXJyaWRlLmRlcHMpLFxuICAgICAgICAgICAgdmFsdWU6IG92ZXJyaWRlLnZhbHVlLFxuICAgICAgICAgICAgaW5kZXg6IGRlZi5wcm92aWRlcnMubGVuZ3RoLFxuICAgICAgICAgIH07XG4gICAgICAgICAgZGVmLnByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgICAgICAgICBkZWYucHJvdmlkZXJzQnlLZXlbdG9rZW5LZXkodG9rZW4pXSA9IHByb3ZpZGVyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvZENoZWNrQW5kVXBkYXRlTm9kZShcbiAgICB2aWV3OiBWaWV3RGF0YSwgY2hlY2tJbmRleDogbnVtYmVyLCBhcmdTdHlsZTogQXJndW1lbnRUeXBlLCB2MD86IGFueSwgdjE/OiBhbnksIHYyPzogYW55LFxuICAgIHYzPzogYW55LCB2ND86IGFueSwgdjU/OiBhbnksIHY2PzogYW55LCB2Nz86IGFueSwgdjg/OiBhbnksIHY5PzogYW55KTogYW55IHtcbiAgY29uc3Qgbm9kZURlZiA9IHZpZXcuZGVmLm5vZGVzW2NoZWNrSW5kZXhdO1xuICBjaGVja0FuZFVwZGF0ZU5vZGUodmlldywgbm9kZURlZiwgYXJnU3R5bGUsIHYwLCB2MSwgdjIsIHYzLCB2NCwgdjUsIHY2LCB2NywgdjgsIHY5KTtcbiAgcmV0dXJuIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFB1cmVFeHByZXNzaW9uKSA/XG4gICAgICBhc1B1cmVFeHByZXNzaW9uRGF0YSh2aWV3LCBjaGVja0luZGV4KS52YWx1ZSA6XG4gICAgICB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHByb2RDaGVja05vQ2hhbmdlc05vZGUoXG4gICAgdmlldzogVmlld0RhdGEsIGNoZWNrSW5kZXg6IG51bWJlciwgYXJnU3R5bGU6IEFyZ3VtZW50VHlwZSwgdjA/OiBhbnksIHYxPzogYW55LCB2Mj86IGFueSxcbiAgICB2Mz86IGFueSwgdjQ/OiBhbnksIHY1PzogYW55LCB2Nj86IGFueSwgdjc/OiBhbnksIHY4PzogYW55LCB2OT86IGFueSk6IGFueSB7XG4gIGNvbnN0IG5vZGVEZWYgPSB2aWV3LmRlZi5ub2Rlc1tjaGVja0luZGV4XTtcbiAgY2hlY2tOb0NoYW5nZXNOb2RlKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCB2MCwgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcsIHY4LCB2OSk7XG4gIHJldHVybiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQdXJlRXhwcmVzc2lvbikgP1xuICAgICAgYXNQdXJlRXhwcmVzc2lvbkRhdGEodmlldywgY2hlY2tJbmRleCkudmFsdWUgOlxuICAgICAgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0NoZWNrQW5kVXBkYXRlVmlldyh2aWV3OiBWaWV3RGF0YSkge1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoRGVidWdBY3Rpb24uZGV0ZWN0Q2hhbmdlcywgY2hlY2tBbmRVcGRhdGVWaWV3LCBudWxsLCBbdmlld10pO1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0NoZWNrTm9DaGFuZ2VzVmlldyh2aWV3OiBWaWV3RGF0YSkge1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoRGVidWdBY3Rpb24uY2hlY2tOb0NoYW5nZXMsIGNoZWNrTm9DaGFuZ2VzVmlldywgbnVsbCwgW3ZpZXddKTtcbn1cblxuZnVuY3Rpb24gZGVidWdEZXN0cm95Vmlldyh2aWV3OiBWaWV3RGF0YSkge1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoRGVidWdBY3Rpb24uZGVzdHJveSwgZGVzdHJveVZpZXcsIG51bGwsIFt2aWV3XSk7XG59XG5cbmVudW0gRGVidWdBY3Rpb24ge1xuICBjcmVhdGUsXG4gIGRldGVjdENoYW5nZXMsXG4gIGNoZWNrTm9DaGFuZ2VzLFxuICBkZXN0cm95LFxuICBoYW5kbGVFdmVudFxufVxuXG5sZXQgX2N1cnJlbnRBY3Rpb246IERlYnVnQWN0aW9uO1xubGV0IF9jdXJyZW50VmlldzogVmlld0RhdGE7XG5sZXQgX2N1cnJlbnROb2RlSW5kZXg6IG51bWJlcnxudWxsO1xuXG5mdW5jdGlvbiBkZWJ1Z1NldEN1cnJlbnROb2RlKHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlcnxudWxsKSB7XG4gIF9jdXJyZW50VmlldyA9IHZpZXc7XG4gIF9jdXJyZW50Tm9kZUluZGV4ID0gbm9kZUluZGV4O1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0hhbmRsZUV2ZW50KHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpIHtcbiAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBub2RlSW5kZXgpO1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoXG4gICAgICBEZWJ1Z0FjdGlvbi5oYW5kbGVFdmVudCwgdmlldy5kZWYuaGFuZGxlRXZlbnQsIG51bGwsIFt2aWV3LCBub2RlSW5kZXgsIGV2ZW50TmFtZSwgZXZlbnRdKTtcbn1cblxuZnVuY3Rpb24gZGVidWdVcGRhdGVEaXJlY3RpdmVzKHZpZXc6IFZpZXdEYXRhLCBjaGVja1R5cGU6IENoZWNrVHlwZSkge1xuICBpZiAodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5EZXN0cm95ZWQpIHtcbiAgICB0aHJvdyB2aWV3RGVzdHJveWVkRXJyb3IoRGVidWdBY3Rpb25bX2N1cnJlbnRBY3Rpb25dKTtcbiAgfVxuICBkZWJ1Z1NldEN1cnJlbnROb2RlKHZpZXcsIG5leHREaXJlY3RpdmVXaXRoQmluZGluZyh2aWV3LCAwKSk7XG4gIHJldHVybiB2aWV3LmRlZi51cGRhdGVEaXJlY3RpdmVzKGRlYnVnQ2hlY2tEaXJlY3RpdmVzRm4sIHZpZXcpO1xuXG4gIGZ1bmN0aW9uIGRlYnVnQ2hlY2tEaXJlY3RpdmVzRm4oXG4gICAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIsIGFyZ1N0eWxlOiBBcmd1bWVudFR5cGUsIC4uLnZhbHVlczogYW55W10pIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbbm9kZUluZGV4XTtcbiAgICBpZiAoY2hlY2tUeXBlID09PSBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUpIHtcbiAgICAgIGRlYnVnQ2hlY2tBbmRVcGRhdGVOb2RlKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCB2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z0NoZWNrTm9DaGFuZ2VzTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdmFsdWVzKTtcbiAgICB9XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZURpcmVjdGl2ZSkge1xuICAgICAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBuZXh0RGlyZWN0aXZlV2l0aEJpbmRpbmcodmlldywgbm9kZUluZGV4KSk7XG4gICAgfVxuICAgIHJldHVybiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQdXJlRXhwcmVzc2lvbikgP1xuICAgICAgICBhc1B1cmVFeHByZXNzaW9uRGF0YSh2aWV3LCBub2RlRGVmLm5vZGVJbmRleCkudmFsdWUgOlxuICAgICAgICB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVidWdVcGRhdGVSZW5kZXJlcih2aWV3OiBWaWV3RGF0YSwgY2hlY2tUeXBlOiBDaGVja1R5cGUpIHtcbiAgaWYgKHZpZXcuc3RhdGUgJiBWaWV3U3RhdGUuRGVzdHJveWVkKSB7XG4gICAgdGhyb3cgdmlld0Rlc3Ryb3llZEVycm9yKERlYnVnQWN0aW9uW19jdXJyZW50QWN0aW9uXSk7XG4gIH1cbiAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBuZXh0UmVuZGVyTm9kZVdpdGhCaW5kaW5nKHZpZXcsIDApKTtcbiAgcmV0dXJuIHZpZXcuZGVmLnVwZGF0ZVJlbmRlcmVyKGRlYnVnQ2hlY2tSZW5kZXJOb2RlRm4sIHZpZXcpO1xuXG4gIGZ1bmN0aW9uIGRlYnVnQ2hlY2tSZW5kZXJOb2RlRm4oXG4gICAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIsIGFyZ1N0eWxlOiBBcmd1bWVudFR5cGUsIC4uLnZhbHVlczogYW55W10pIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbbm9kZUluZGV4XTtcbiAgICBpZiAoY2hlY2tUeXBlID09PSBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUpIHtcbiAgICAgIGRlYnVnQ2hlY2tBbmRVcGRhdGVOb2RlKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCB2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z0NoZWNrTm9DaGFuZ2VzTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdmFsdWVzKTtcbiAgICB9XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UmVuZGVyTm9kZSkge1xuICAgICAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBuZXh0UmVuZGVyTm9kZVdpdGhCaW5kaW5nKHZpZXcsIG5vZGVJbmRleCkpO1xuICAgIH1cbiAgICByZXR1cm4gKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHVyZUV4cHJlc3Npb24pID9cbiAgICAgICAgYXNQdXJlRXhwcmVzc2lvbkRhdGEodmlldywgbm9kZURlZi5ub2RlSW5kZXgpLnZhbHVlIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ2hlY2tBbmRVcGRhdGVOb2RlKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBub2RlRGVmOiBOb2RlRGVmLCBhcmdTdHlsZTogQXJndW1lbnRUeXBlLCBnaXZlblZhbHVlczogYW55W10pOiB2b2lkIHtcbiAgY29uc3QgY2hhbmdlZCA9ICg8YW55PmNoZWNrQW5kVXBkYXRlTm9kZSkodmlldywgbm9kZURlZiwgYXJnU3R5bGUsIC4uLmdpdmVuVmFsdWVzKTtcbiAgaWYgKGNoYW5nZWQpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBhcmdTdHlsZSA9PT0gQXJndW1lbnRUeXBlLkR5bmFtaWMgPyBnaXZlblZhbHVlc1swXSA6IGdpdmVuVmFsdWVzO1xuICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmUpIHtcbiAgICAgIGNvbnN0IGJpbmRpbmdWYWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVEZWYuYmluZGluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IG5vZGVEZWYuYmluZGluZ3NbaV07XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2ldO1xuICAgICAgICBpZiAoYmluZGluZy5mbGFncyAmIEJpbmRpbmdGbGFncy5UeXBlUHJvcGVydHkpIHtcbiAgICAgICAgICBiaW5kaW5nVmFsdWVzW25vcm1hbGl6ZURlYnVnQmluZGluZ05hbWUoYmluZGluZy5ub25NaW5pZmllZE5hbWUhKV0gPVxuICAgICAgICAgICAgICBub3JtYWxpemVEZWJ1Z0JpbmRpbmdWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGVsRGVmID0gbm9kZURlZi5wYXJlbnQhO1xuICAgICAgY29uc3QgZWwgPSBhc0VsZW1lbnREYXRhKHZpZXcsIGVsRGVmLm5vZGVJbmRleCkucmVuZGVyRWxlbWVudDtcbiAgICAgIGlmICghZWxEZWYuZWxlbWVudCEubmFtZSkge1xuICAgICAgICAvLyBhIGNvbW1lbnQuXG4gICAgICAgIHZpZXcucmVuZGVyZXIuc2V0VmFsdWUoXG4gICAgICAgICAgICBlbCwgZXNjYXBlQ29tbWVudFRleHQoYGJpbmRpbmdzPSR7SlNPTi5zdHJpbmdpZnkoYmluZGluZ1ZhbHVlcywgbnVsbCwgMil9YCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYSByZWd1bGFyIGVsZW1lbnQuXG4gICAgICAgIGZvciAobGV0IGF0dHIgaW4gYmluZGluZ1ZhbHVlcykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gYmluZGluZ1ZhbHVlc1thdHRyXTtcbiAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmlldy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUoZWwsIGF0dHIsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlldy5yZW5kZXJlci5yZW1vdmVBdHRyaWJ1dGUoZWwsIGF0dHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZWJ1Z0NoZWNrTm9DaGFuZ2VzTm9kZShcbiAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZURlZjogTm9kZURlZiwgYXJnU3R5bGU6IEFyZ3VtZW50VHlwZSwgdmFsdWVzOiBhbnlbXSk6IHZvaWQge1xuICAoPGFueT5jaGVja05vQ2hhbmdlc05vZGUpKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCAuLi52YWx1ZXMpO1xufVxuXG5mdW5jdGlvbiBuZXh0RGlyZWN0aXZlV2l0aEJpbmRpbmcodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyfG51bGwge1xuICBmb3IgKGxldCBpID0gbm9kZUluZGV4OyBpIDwgdmlldy5kZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZURpcmVjdGl2ZSAmJiBub2RlRGVmLmJpbmRpbmdzICYmIG5vZGVEZWYuYmluZGluZ3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIG5leHRSZW5kZXJOb2RlV2l0aEJpbmRpbmcodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyfG51bGwge1xuICBmb3IgKGxldCBpID0gbm9kZUluZGV4OyBpIDwgdmlldy5kZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFJlbmRlck5vZGUpICYmIG5vZGVEZWYuYmluZGluZ3MgJiYgbm9kZURlZi5iaW5kaW5ncy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgRGVidWdDb250ZXh0XyBpbXBsZW1lbnRzIERlYnVnQ29udGV4dCB7XG4gIHByaXZhdGUgbm9kZURlZjogTm9kZURlZjtcbiAgcHJpdmF0ZSBlbFZpZXc6IFZpZXdEYXRhO1xuICBwcml2YXRlIGVsRGVmOiBOb2RlRGVmO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3OiBWaWV3RGF0YSwgcHVibGljIG5vZGVJbmRleDogbnVtYmVyfG51bGwpIHtcbiAgICBpZiAobm9kZUluZGV4ID09IG51bGwpIHtcbiAgICAgIHRoaXMubm9kZUluZGV4ID0gbm9kZUluZGV4ID0gMDtcbiAgICB9XG4gICAgdGhpcy5ub2RlRGVmID0gdmlldy5kZWYubm9kZXNbbm9kZUluZGV4XTtcbiAgICBsZXQgZWxEZWYgPSB0aGlzLm5vZGVEZWY7XG4gICAgbGV0IGVsVmlldyA9IHZpZXc7XG4gICAgd2hpbGUgKGVsRGVmICYmIChlbERlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkgPT09IDApIHtcbiAgICAgIGVsRGVmID0gZWxEZWYucGFyZW50ITtcbiAgICB9XG4gICAgaWYgKCFlbERlZikge1xuICAgICAgd2hpbGUgKCFlbERlZiAmJiBlbFZpZXcpIHtcbiAgICAgICAgZWxEZWYgPSB2aWV3UGFyZW50RWwoZWxWaWV3KSE7XG4gICAgICAgIGVsVmlldyA9IGVsVmlldy5wYXJlbnQhO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVsRGVmID0gZWxEZWY7XG4gICAgdGhpcy5lbFZpZXcgPSBlbFZpZXc7XG4gIH1cblxuICBwcml2YXRlIGdldCBlbE9yQ29tcFZpZXcoKSB7XG4gICAgLy8gSGFzIHRvIGJlIGRvbmUgbGF6aWx5IGFzIHdlIHVzZSB0aGUgRGVidWdDb250ZXh0IGFsc28gZHVyaW5nIGNyZWF0aW9uIG9mIGVsZW1lbnRzLi4uXG4gICAgcmV0dXJuIGFzRWxlbWVudERhdGEodGhpcy5lbFZpZXcsIHRoaXMuZWxEZWYubm9kZUluZGV4KS5jb21wb25lbnRWaWV3IHx8IHRoaXMudmlldztcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIGNyZWF0ZUluamVjdG9yKHRoaXMuZWxWaWV3LCB0aGlzLmVsRGVmKTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnQoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5lbE9yQ29tcFZpZXcuY29tcG9uZW50O1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5lbE9yQ29tcFZpZXcuY29udGV4dDtcbiAgfVxuXG4gIGdldCBwcm92aWRlclRva2VucygpOiBhbnlbXSB7XG4gICAgY29uc3QgdG9rZW5zOiBhbnlbXSA9IFtdO1xuICAgIGlmICh0aGlzLmVsRGVmKSB7XG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5lbERlZi5ub2RlSW5kZXggKyAxOyBpIDw9IHRoaXMuZWxEZWYubm9kZUluZGV4ICsgdGhpcy5lbERlZi5jaGlsZENvdW50O1xuICAgICAgICAgICBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGREZWYgPSB0aGlzLmVsVmlldy5kZWYubm9kZXNbaV07XG4gICAgICAgIGlmIChjaGlsZERlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlcikge1xuICAgICAgICAgIHRva2Vucy5wdXNoKGNoaWxkRGVmLnByb3ZpZGVyIS50b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgaSArPSBjaGlsZERlZi5jaGlsZENvdW50O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgZ2V0IHJlZmVyZW5jZXMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGNvbnN0IHJlZmVyZW5jZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgaWYgKHRoaXMuZWxEZWYpIHtcbiAgICAgIGNvbGxlY3RSZWZlcmVuY2VzKHRoaXMuZWxWaWV3LCB0aGlzLmVsRGVmLCByZWZlcmVuY2VzKTtcblxuICAgICAgZm9yIChsZXQgaSA9IHRoaXMuZWxEZWYubm9kZUluZGV4ICsgMTsgaSA8PSB0aGlzLmVsRGVmLm5vZGVJbmRleCArIHRoaXMuZWxEZWYuY2hpbGRDb3VudDtcbiAgICAgICAgICAgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkRGVmID0gdGhpcy5lbFZpZXcuZGVmLm5vZGVzW2ldO1xuICAgICAgICBpZiAoY2hpbGREZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHJvdmlkZXIpIHtcbiAgICAgICAgICBjb2xsZWN0UmVmZXJlbmNlcyh0aGlzLmVsVmlldywgY2hpbGREZWYsIHJlZmVyZW5jZXMpO1xuICAgICAgICB9XG4gICAgICAgIGkgKz0gY2hpbGREZWYuY2hpbGRDb3VudDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlZmVyZW5jZXM7XG4gIH1cblxuICBnZXQgY29tcG9uZW50UmVuZGVyRWxlbWVudCgpIHtcbiAgICBjb25zdCBlbERhdGEgPSBmaW5kSG9zdEVsZW1lbnQodGhpcy5lbE9yQ29tcFZpZXcpO1xuICAgIHJldHVybiBlbERhdGEgPyBlbERhdGEucmVuZGVyRWxlbWVudCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCByZW5kZXJOb2RlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlVGV4dCA/IHJlbmRlck5vZGUodGhpcy52aWV3LCB0aGlzLm5vZGVEZWYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm9kZSh0aGlzLmVsVmlldywgdGhpcy5lbERlZik7XG4gIH1cblxuICBsb2dFcnJvcihjb25zb2xlOiBDb25zb2xlLCAuLi52YWx1ZXM6IGFueVtdKSB7XG4gICAgbGV0IGxvZ1ZpZXdEZWY6IFZpZXdEZWZpbml0aW9uO1xuICAgIGxldCBsb2dOb2RlSW5kZXg6IG51bWJlcjtcbiAgICBpZiAodGhpcy5ub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVUZXh0KSB7XG4gICAgICBsb2dWaWV3RGVmID0gdGhpcy52aWV3LmRlZjtcbiAgICAgIGxvZ05vZGVJbmRleCA9IHRoaXMubm9kZURlZi5ub2RlSW5kZXg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ1ZpZXdEZWYgPSB0aGlzLmVsVmlldy5kZWY7XG4gICAgICBsb2dOb2RlSW5kZXggPSB0aGlzLmVsRGVmLm5vZGVJbmRleDtcbiAgICB9XG4gICAgLy8gTm90ZTogd2Ugb25seSBnZW5lcmF0ZSBhIGxvZyBmdW5jdGlvbiBmb3IgdGV4dCBhbmQgZWxlbWVudCBub2Rlc1xuICAgIC8vIHRvIG1ha2UgdGhlIGdlbmVyYXRlZCBjb2RlIGFzIHNtYWxsIGFzIHBvc3NpYmxlLlxuICAgIGNvbnN0IHJlbmRlck5vZGVJbmRleCA9IGdldFJlbmRlck5vZGVJbmRleChsb2dWaWV3RGVmLCBsb2dOb2RlSW5kZXgpO1xuICAgIGxldCBjdXJyUmVuZGVyTm9kZUluZGV4ID0gLTE7XG4gICAgbGV0IG5vZGVMb2dnZXI6IE5vZGVMb2dnZXIgPSAoKSA9PiB7XG4gICAgICBjdXJyUmVuZGVyTm9kZUluZGV4Kys7XG4gICAgICBpZiAoY3VyclJlbmRlck5vZGVJbmRleCA9PT0gcmVuZGVyTm9kZUluZGV4KSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSwgLi4udmFsdWVzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBOT09QO1xuICAgICAgfVxuICAgIH07XG4gICAgbG9nVmlld0RlZi5mYWN0b3J5IShub2RlTG9nZ2VyKTtcbiAgICBpZiAoY3VyclJlbmRlck5vZGVJbmRleCA8IHJlbmRlck5vZGVJbmRleCkge1xuICAgICAgY29uc29sZS5lcnJvcignSWxsZWdhbCBzdGF0ZTogdGhlIFZpZXdEZWZpbml0aW9uRmFjdG9yeSBkaWQgbm90IGNhbGwgdGhlIGxvZ2dlciEnKTtcbiAgICAgICg8YW55PmNvbnNvbGUuZXJyb3IpKC4uLnZhbHVlcyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFJlbmRlck5vZGVJbmRleCh2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgbm9kZUluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgcmVuZGVyTm9kZUluZGV4ID0gLTE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IG5vZGVJbmRleDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IHZpZXdEZWYubm9kZXNbaV07XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UmVuZGVyTm9kZSkge1xuICAgICAgcmVuZGVyTm9kZUluZGV4Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiByZW5kZXJOb2RlSW5kZXg7XG59XG5cbmZ1bmN0aW9uIGZpbmRIb3N0RWxlbWVudCh2aWV3OiBWaWV3RGF0YSk6IEVsZW1lbnREYXRhfG51bGwge1xuICB3aGlsZSAodmlldyAmJiAhaXNDb21wb25lbnRWaWV3KHZpZXcpKSB7XG4gICAgdmlldyA9IHZpZXcucGFyZW50ITtcbiAgfVxuICBpZiAodmlldy5wYXJlbnQpIHtcbiAgICByZXR1cm4gYXNFbGVtZW50RGF0YSh2aWV3LnBhcmVudCwgdmlld1BhcmVudEVsKHZpZXcpIS5ub2RlSW5kZXgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBjb2xsZWN0UmVmZXJlbmNlcyh2aWV3OiBWaWV3RGF0YSwgbm9kZURlZjogTm9kZURlZiwgcmVmZXJlbmNlczoge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgZm9yIChsZXQgcmVmTmFtZSBpbiBub2RlRGVmLnJlZmVyZW5jZXMpIHtcbiAgICByZWZlcmVuY2VzW3JlZk5hbWVdID0gZ2V0UXVlcnlWYWx1ZSh2aWV3LCBub2RlRGVmLCBub2RlRGVmLnJlZmVyZW5jZXNbcmVmTmFtZV0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxXaXRoRGVidWdDb250ZXh0KGFjdGlvbjogRGVidWdBY3Rpb24sIGZuOiBhbnksIHNlbGY6IGFueSwgYXJnczogYW55W10pIHtcbiAgY29uc3Qgb2xkQWN0aW9uID0gX2N1cnJlbnRBY3Rpb247XG4gIGNvbnN0IG9sZFZpZXcgPSBfY3VycmVudFZpZXc7XG4gIGNvbnN0IG9sZE5vZGVJbmRleCA9IF9jdXJyZW50Tm9kZUluZGV4O1xuICB0cnkge1xuICAgIF9jdXJyZW50QWN0aW9uID0gYWN0aW9uO1xuICAgIGNvbnN0IHJlc3VsdCA9IGZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIF9jdXJyZW50VmlldyA9IG9sZFZpZXc7XG4gICAgX2N1cnJlbnROb2RlSW5kZXggPSBvbGROb2RlSW5kZXg7XG4gICAgX2N1cnJlbnRBY3Rpb24gPSBvbGRBY3Rpb247XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChpc1ZpZXdEZWJ1Z0Vycm9yKGUpIHx8ICFfY3VycmVudFZpZXcpIHtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIHRocm93IHZpZXdXcmFwcGVkRGVidWdFcnJvcihlLCBnZXRDdXJyZW50RGVidWdDb250ZXh0KCkhKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudERlYnVnQ29udGV4dCgpOiBEZWJ1Z0NvbnRleHR8bnVsbCB7XG4gIHJldHVybiBfY3VycmVudFZpZXcgPyBuZXcgRGVidWdDb250ZXh0XyhfY3VycmVudFZpZXcsIF9jdXJyZW50Tm9kZUluZGV4KSA6IG51bGw7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z1JlbmRlcmVyRmFjdG9yeTIgaW1wbGVtZW50cyBSZW5kZXJlckZhY3RvcnkyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWxlZ2F0ZTogUmVuZGVyZXJGYWN0b3J5Mikge31cblxuICBjcmVhdGVSZW5kZXJlcihlbGVtZW50OiBhbnksIHJlbmRlckRhdGE6IFJlbmRlcmVyVHlwZTJ8bnVsbCk6IFJlbmRlcmVyMiB7XG4gICAgcmV0dXJuIG5ldyBEZWJ1Z1JlbmRlcmVyMih0aGlzLmRlbGVnYXRlLmNyZWF0ZVJlbmRlcmVyKGVsZW1lbnQsIHJlbmRlckRhdGEpKTtcbiAgfVxuXG4gIGJlZ2luKCkge1xuICAgIGlmICh0aGlzLmRlbGVnYXRlLmJlZ2luKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLmJlZ2luKCk7XG4gICAgfVxuICB9XG4gIGVuZCgpIHtcbiAgICBpZiAodGhpcy5kZWxlZ2F0ZS5lbmQpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgd2hlblJlbmRlcmluZ0RvbmUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAodGhpcy5kZWxlZ2F0ZS53aGVuUmVuZGVyaW5nRG9uZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUud2hlblJlbmRlcmluZ0RvbmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdSZW5kZXJlcjIgaW1wbGVtZW50cyBSZW5kZXJlcjIge1xuICByZWFkb25seSBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBwcml2YXRlIGNyZWF0ZURlYnVnQ29udGV4dChuYXRpdmVFbGVtZW50OiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5kZWJ1Z0NvbnRleHRGYWN0b3J5KG5hdGl2ZUVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBgRGVidWdDb250ZXh0YCB3aGVuIGEgbm9kZSBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBUaGUgYERlYnVnQ29udGV4dGAgYWxsb3dzIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBub2RlcyB0aGF0IGFyZSB1c2VmdWwgaW4gdGVzdHMuXG4gICAqXG4gICAqIFRoZSBmYWN0b3J5IGlzIGNvbmZpZ3VyYWJsZSBzbyB0aGF0IHRoZSBgRGVidWdSZW5kZXJlcjJgIGNvdWxkIGluc3RhbnRpYXRlIGVpdGhlciBhIFZpZXcgRW5naW5lXG4gICAqIG9yIGEgUmVuZGVyIGNvbnRleHQuXG4gICAqL1xuICBkZWJ1Z0NvbnRleHRGYWN0b3J5OiAobmF0aXZlRWxlbWVudD86IGFueSkgPT4gRGVidWdDb250ZXh0IHwgbnVsbCA9IGdldEN1cnJlbnREZWJ1Z0NvbnRleHQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWxlZ2F0ZTogUmVuZGVyZXIyKSB7XG4gICAgdGhpcy5kYXRhID0gdGhpcy5kZWxlZ2F0ZS5kYXRhO1xuICB9XG5cbiAgZGVzdHJveU5vZGUobm9kZTogYW55KSB7XG4gICAgY29uc3QgZGVidWdOb2RlID0gZ2V0RGVidWdOb2RlKG5vZGUpO1xuXG4gICAgaWYgKGRlYnVnTm9kZSkge1xuICAgICAgcmVtb3ZlRGVidWdOb2RlRnJvbUluZGV4KGRlYnVnTm9kZSk7XG4gICAgICBpZiAoZGVidWdOb2RlIGluc3RhbmNlb2YgRGVidWdOb2RlX19QUkVfUjNfXykge1xuICAgICAgICBkZWJ1Z05vZGUubGlzdGVuZXJzLmxlbmd0aCA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGVsZWdhdGUuZGVzdHJveU5vZGUpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuZGVzdHJveU5vZGUobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmRlbGVnYXRlLmRlc3Ryb3koKTtcbiAgfVxuXG4gIGNyZWF0ZUVsZW1lbnQobmFtZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IGVsID0gdGhpcy5kZWxlZ2F0ZS5jcmVhdGVFbGVtZW50KG5hbWUsIG5hbWVzcGFjZSk7XG4gICAgY29uc3QgZGVidWdDdHggPSB0aGlzLmNyZWF0ZURlYnVnQ29udGV4dChlbCk7XG4gICAgaWYgKGRlYnVnQ3R4KSB7XG4gICAgICBjb25zdCBkZWJ1Z0VsID0gbmV3IERlYnVnRWxlbWVudF9fUFJFX1IzX18oZWwsIG51bGwsIGRlYnVnQ3R4KTtcbiAgICAgIChkZWJ1Z0VsIGFzIHtuYW1lOiBzdHJpbmd9KS5uYW1lID0gbmFtZTtcbiAgICAgIGluZGV4RGVidWdOb2RlKGRlYnVnRWwpO1xuICAgIH1cbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBjcmVhdGVDb21tZW50KHZhbHVlOiBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IGNvbW1lbnQgPSB0aGlzLmRlbGVnYXRlLmNyZWF0ZUNvbW1lbnQoZXNjYXBlQ29tbWVudFRleHQodmFsdWUpKTtcbiAgICBjb25zdCBkZWJ1Z0N0eCA9IHRoaXMuY3JlYXRlRGVidWdDb250ZXh0KGNvbW1lbnQpO1xuICAgIGlmIChkZWJ1Z0N0eCkge1xuICAgICAgaW5kZXhEZWJ1Z05vZGUobmV3IERlYnVnTm9kZV9fUFJFX1IzX18oY29tbWVudCwgbnVsbCwgZGVidWdDdHgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbW1lbnQ7XG4gIH1cblxuICBjcmVhdGVUZXh0KHZhbHVlOiBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLmRlbGVnYXRlLmNyZWF0ZVRleHQodmFsdWUpO1xuICAgIGNvbnN0IGRlYnVnQ3R4ID0gdGhpcy5jcmVhdGVEZWJ1Z0NvbnRleHQodGV4dCk7XG4gICAgaWYgKGRlYnVnQ3R4KSB7XG4gICAgICBpbmRleERlYnVnTm9kZShuZXcgRGVidWdOb2RlX19QUkVfUjNfXyh0ZXh0LCBudWxsLCBkZWJ1Z0N0eCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGFwcGVuZENoaWxkKHBhcmVudDogYW55LCBuZXdDaGlsZDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShwYXJlbnQpO1xuICAgIGNvbnN0IGRlYnVnQ2hpbGRFbCA9IGdldERlYnVnTm9kZShuZXdDaGlsZCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdDaGlsZEVsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLmFkZENoaWxkKGRlYnVnQ2hpbGRFbCk7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuYXBwZW5kQ2hpbGQocGFyZW50LCBuZXdDaGlsZCk7XG4gIH1cblxuICBpbnNlcnRCZWZvcmUocGFyZW50OiBhbnksIG5ld0NoaWxkOiBhbnksIHJlZkNoaWxkOiBhbnksIGlzTW92ZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKHBhcmVudCk7XG4gICAgY29uc3QgZGVidWdDaGlsZEVsID0gZ2V0RGVidWdOb2RlKG5ld0NoaWxkKTtcbiAgICBjb25zdCBkZWJ1Z1JlZkVsID0gZ2V0RGVidWdOb2RlKHJlZkNoaWxkKSE7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdDaGlsZEVsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLmluc2VydEJlZm9yZShkZWJ1Z1JlZkVsLCBkZWJ1Z0NoaWxkRWwpO1xuICAgIH1cblxuICAgIHRoaXMuZGVsZWdhdGUuaW5zZXJ0QmVmb3JlKHBhcmVudCwgbmV3Q2hpbGQsIHJlZkNoaWxkLCBpc01vdmUpO1xuICB9XG5cbiAgcmVtb3ZlQ2hpbGQocGFyZW50OiBhbnksIG9sZENoaWxkOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKHBhcmVudCk7XG4gICAgY29uc3QgZGVidWdDaGlsZEVsID0gZ2V0RGVidWdOb2RlKG9sZENoaWxkKTtcbiAgICBpZiAoZGVidWdFbCAmJiBkZWJ1Z0NoaWxkRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGRlYnVnRWwucmVtb3ZlQ2hpbGQoZGVidWdDaGlsZEVsKTtcbiAgICB9XG4gICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVDaGlsZChwYXJlbnQsIG9sZENoaWxkKTtcbiAgfVxuXG4gIHNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yT3JOb2RlOiBzdHJpbmd8YW55LCBwcmVzZXJ2ZUNvbnRlbnQ/OiBib29sZWFuKTogYW55IHtcbiAgICBjb25zdCBlbCA9IHRoaXMuZGVsZWdhdGUuc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3JPck5vZGUsIHByZXNlcnZlQ29udGVudCk7XG4gICAgY29uc3QgZGVidWdDdHggPSBnZXRDdXJyZW50RGVidWdDb250ZXh0KCk7XG4gICAgaWYgKGRlYnVnQ3R4KSB7XG4gICAgICBpbmRleERlYnVnTm9kZShuZXcgRGVidWdFbGVtZW50X19QUkVfUjNfXyhlbCwgbnVsbCwgZGVidWdDdHgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgc2V0QXR0cmlidXRlKGVsOiBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGNvbnN0IGZ1bGxOYW1lID0gbmFtZXNwYWNlID8gbmFtZXNwYWNlICsgJzonICsgbmFtZSA6IG5hbWU7XG4gICAgICBkZWJ1Z0VsLmF0dHJpYnV0ZXNbZnVsbE5hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuc2V0QXR0cmlidXRlKGVsLCBuYW1lLCB2YWx1ZSwgbmFtZXNwYWNlKTtcbiAgfVxuXG4gIHJlbW92ZUF0dHJpYnV0ZShlbDogYW55LCBuYW1lOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBjb25zdCBmdWxsTmFtZSA9IG5hbWVzcGFjZSA/IG5hbWVzcGFjZSArICc6JyArIG5hbWUgOiBuYW1lO1xuICAgICAgZGVidWdFbC5hdHRyaWJ1dGVzW2Z1bGxOYW1lXSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUucmVtb3ZlQXR0cmlidXRlKGVsLCBuYW1lLCBuYW1lc3BhY2UpO1xuICB9XG5cbiAgYWRkQ2xhc3MoZWw6IGFueSwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGRlYnVnRWwuY2xhc3Nlc1tuYW1lXSA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuYWRkQ2xhc3MoZWwsIG5hbWUpO1xuICB9XG5cbiAgcmVtb3ZlQ2xhc3MoZWw6IGFueSwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGRlYnVnRWwuY2xhc3Nlc1tuYW1lXSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZUNsYXNzKGVsLCBuYW1lKTtcbiAgfVxuXG4gIHNldFN0eWxlKGVsOiBhbnksIHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBhbnksIGZsYWdzOiBSZW5kZXJlclN0eWxlRmxhZ3MyKTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGRlYnVnRWwuc3R5bGVzW3N0eWxlXSA9IHZhbHVlO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnNldFN0eWxlKGVsLCBzdHlsZSwgdmFsdWUsIGZsYWdzKTtcbiAgfVxuXG4gIHJlbW92ZVN0eWxlKGVsOiBhbnksIHN0eWxlOiBzdHJpbmcsIGZsYWdzOiBSZW5kZXJlclN0eWxlRmxhZ3MyKTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGRlYnVnRWwuc3R5bGVzW3N0eWxlXSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUucmVtb3ZlU3R5bGUoZWwsIHN0eWxlLCBmbGFncyk7XG4gIH1cblxuICBzZXRQcm9wZXJ0eShlbDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKGVsKTtcbiAgICBpZiAoZGVidWdFbCAmJiBkZWJ1Z0VsIGluc3RhbmNlb2YgRGVidWdFbGVtZW50X19QUkVfUjNfXykge1xuICAgICAgZGVidWdFbC5wcm9wZXJ0aWVzW25hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuc2V0UHJvcGVydHkoZWwsIG5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIGxpc3RlbihcbiAgICAgIHRhcmdldDogJ2RvY3VtZW50J3wnd2luZG93cyd8J2JvZHknfGFueSwgZXZlbnROYW1lOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHRhcmdldCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUodGFyZ2V0KTtcbiAgICAgIGlmIChkZWJ1Z0VsKSB7XG4gICAgICAgIGRlYnVnRWwubGlzdGVuZXJzLnB1c2gobmV3IERlYnVnRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUubGlzdGVuKHRhcmdldCwgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gIH1cblxuICBwYXJlbnROb2RlKG5vZGU6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUucGFyZW50Tm9kZShub2RlKTtcbiAgfVxuICBuZXh0U2libGluZyhub2RlOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLm5leHRTaWJsaW5nKG5vZGUpO1xuICB9XG4gIHNldFZhbHVlKG5vZGU6IGFueSwgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLnNldFZhbHVlKG5vZGUsIHZhbHVlKTtcbiAgfVxufVxuIl19
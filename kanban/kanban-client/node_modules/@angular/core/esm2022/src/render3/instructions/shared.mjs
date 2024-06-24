/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { ErrorHandler } from '../../error_handler';
import { RuntimeError } from '../../errors';
import { hasSkipHydrationAttrOnRElement } from '../../hydration/skip_hydration';
import { PRESERVE_HOST_CONTENT, PRESERVE_HOST_CONTENT_DEFAULT } from '../../hydration/tokens';
import { processTextNodeMarkersBeforeHydration } from '../../hydration/utils';
import { ViewEncapsulation } from '../../metadata/view';
import { validateAgainstEventAttributes, validateAgainstEventProperties, } from '../../sanitization/sanitization';
import { assertDefined, assertEqual, assertGreaterThan, assertGreaterThanOrEqual, assertIndexInRange, assertNotEqual, assertNotSame, assertSame, assertString, } from '../../util/assert';
import { escapeCommentText } from '../../util/dom';
import { normalizeDebugBindingName, normalizeDebugBindingValue } from '../../util/ng_reflect';
import { stringify } from '../../util/stringify';
import { assertFirstCreatePass, assertFirstUpdatePass, assertLView, assertNoDuplicateDirectives, assertTNodeForLView, assertTNodeForTView, } from '../assert';
import { attachPatchData } from '../context_discovery';
import { getFactoryDef } from '../definition_factory';
import { diPublicInInjector, getNodeInjectable, getOrCreateNodeInjectorForNode } from '../di';
import { throwMultipleComponentError } from '../errors';
import { CONTAINER_HEADER_OFFSET } from '../interfaces/container';
import { NodeInjectorFactory } from '../interfaces/injector';
import { InputFlags } from '../interfaces/input_flags';
import { getUniqueLViewId } from '../interfaces/lview_tracking';
import { isComponentDef, isComponentHost, isContentQueryHost } from '../interfaces/type_checks';
import { CHILD_HEAD, CHILD_TAIL, CLEANUP, CONTEXT, DECLARATION_COMPONENT_VIEW, DECLARATION_VIEW, EMBEDDED_VIEW_INJECTOR, ENVIRONMENT, FLAGS, HEADER_OFFSET, HOST, HYDRATION, ID, INJECTOR, NEXT, PARENT, RENDERER, T_HOST, TVIEW, } from '../interfaces/view';
import { assertPureTNodeType, assertTNodeType } from '../node_assert';
import { clearElementContents, updateTextNode } from '../node_manipulation';
import { isInlineTemplate, isNodeMatchingSelectorList } from '../node_selector_matcher';
import { profiler } from '../profiler';
import { getBindingsEnabled, getCurrentDirectiveIndex, getCurrentParentTNode, getCurrentTNodePlaceholderOk, getSelectedIndex, isCurrentTNodeParent, isInCheckNoChangesMode, isInI18nBlock, isInSkipHydrationBlock, setBindingRootForHostBindings, setCurrentDirectiveIndex, setCurrentQueryIndex, setCurrentTNode, setSelectedIndex, } from '../state';
import { NO_CHANGE } from '../tokens';
import { mergeHostAttrs } from '../util/attrs_utils';
import { INTERPOLATION_DELIMITER } from '../util/misc_utils';
import { renderStringify } from '../util/stringify_utils';
import { getComponentLViewByIndex, getNativeByIndex, getNativeByTNode, resetPreOrderHookFlags, unwrapLView, } from '../util/view_utils';
import { selectIndexInternal } from './advance';
import { ɵɵdirectiveInject } from './di';
import { handleUnknownPropertyError, isPropertyValid, matchingSchemas } from './element_validation';
import { writeToDirectiveInput } from './write_to_directive_input';
/**
 * Invoke `HostBindingsFunction`s for view.
 *
 * This methods executes `TView.hostBindingOpCodes`. It is used to execute the
 * `HostBindingsFunction`s associated with the current `LView`.
 *
 * @param tView Current `TView`.
 * @param lView Current `LView`.
 */
export function processHostBindingOpCodes(tView, lView) {
    const hostBindingOpCodes = tView.hostBindingOpCodes;
    if (hostBindingOpCodes === null)
        return;
    try {
        for (let i = 0; i < hostBindingOpCodes.length; i++) {
            const opCode = hostBindingOpCodes[i];
            if (opCode < 0) {
                // Negative numbers are element indexes.
                setSelectedIndex(~opCode);
            }
            else {
                // Positive numbers are NumberTuple which store bindingRootIndex and directiveIndex.
                const directiveIdx = opCode;
                const bindingRootIndx = hostBindingOpCodes[++i];
                const hostBindingFn = hostBindingOpCodes[++i];
                setBindingRootForHostBindings(bindingRootIndx, directiveIdx);
                const context = lView[directiveIdx];
                hostBindingFn(2 /* RenderFlags.Update */, context);
            }
        }
    }
    finally {
        setSelectedIndex(-1);
    }
}
export function createLView(parentLView, tView, context, flags, host, tHostNode, environment, renderer, injector, embeddedViewInjector, hydrationInfo) {
    const lView = tView.blueprint.slice();
    lView[HOST] = host;
    lView[FLAGS] =
        flags |
            4 /* LViewFlags.CreationMode */ |
            128 /* LViewFlags.Attached */ |
            8 /* LViewFlags.FirstLViewPass */ |
            64 /* LViewFlags.Dirty */;
    if (embeddedViewInjector !== null ||
        (parentLView && parentLView[FLAGS] & 2048 /* LViewFlags.HasEmbeddedViewInjector */)) {
        lView[FLAGS] |= 2048 /* LViewFlags.HasEmbeddedViewInjector */;
    }
    resetPreOrderHookFlags(lView);
    ngDevMode && tView.declTNode && parentLView && assertTNodeForLView(tView.declTNode, parentLView);
    lView[PARENT] = lView[DECLARATION_VIEW] = parentLView;
    lView[CONTEXT] = context;
    lView[ENVIRONMENT] = (environment || (parentLView && parentLView[ENVIRONMENT]));
    ngDevMode && assertDefined(lView[ENVIRONMENT], 'LViewEnvironment is required');
    lView[RENDERER] = (renderer || (parentLView && parentLView[RENDERER]));
    ngDevMode && assertDefined(lView[RENDERER], 'Renderer is required');
    lView[INJECTOR] = injector || (parentLView && parentLView[INJECTOR]) || null;
    lView[T_HOST] = tHostNode;
    lView[ID] = getUniqueLViewId();
    lView[HYDRATION] = hydrationInfo;
    lView[EMBEDDED_VIEW_INJECTOR] = embeddedViewInjector;
    ngDevMode &&
        assertEqual(tView.type == 2 /* TViewType.Embedded */ ? parentLView !== null : true, true, 'Embedded views must have parentLView');
    lView[DECLARATION_COMPONENT_VIEW] =
        tView.type == 2 /* TViewType.Embedded */ ? parentLView[DECLARATION_COMPONENT_VIEW] : lView;
    return lView;
}
export function getOrCreateTNode(tView, index, type, name, attrs) {
    ngDevMode &&
        index !== 0 && // 0 are bogus nodes and they are OK. See `createContainerRef` in
        // `view_engine_compatibility` for additional context.
        assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
    // Keep this function short, so that the VM will inline it.
    ngDevMode && assertPureTNodeType(type);
    let tNode = tView.data[index];
    if (tNode === null) {
        tNode = createTNodeAtIndex(tView, index, type, name, attrs);
        if (isInI18nBlock()) {
            // If we are in i18n block then all elements should be pre declared through `Placeholder`
            // See `TNodeType.Placeholder` and `LFrame.inI18n` for more context.
            // If the `TNode` was not pre-declared than it means it was not mentioned which means it was
            // removed, so we mark it as detached.
            tNode.flags |= 32 /* TNodeFlags.isDetached */;
        }
    }
    else if (tNode.type & 64 /* TNodeType.Placeholder */) {
        tNode.type = type;
        tNode.value = name;
        tNode.attrs = attrs;
        const parent = getCurrentParentTNode();
        tNode.injectorIndex = parent === null ? -1 : parent.injectorIndex;
        ngDevMode && assertTNodeForTView(tNode, tView);
        ngDevMode && assertEqual(index, tNode.index, 'Expecting same index');
    }
    setCurrentTNode(tNode, true);
    return tNode;
}
export function createTNodeAtIndex(tView, index, type, name, attrs) {
    const currentTNode = getCurrentTNodePlaceholderOk();
    const isParent = isCurrentTNodeParent();
    const parent = isParent ? currentTNode : currentTNode && currentTNode.parent;
    // Parents cannot cross component boundaries because components will be used in multiple places.
    const tNode = (tView.data[index] = createTNode(tView, parent, type, index, name, attrs));
    // Assign a pointer to the first child node of a given view. The first node is not always the one
    // at index 0, in case of i18n, index 0 can be the instruction `i18nStart` and the first node has
    // the index 1 or more, so we can't just check node index.
    if (tView.firstChild === null) {
        tView.firstChild = tNode;
    }
    if (currentTNode !== null) {
        if (isParent) {
            // FIXME(misko): This logic looks unnecessarily complicated. Could we simplify?
            if (currentTNode.child == null && tNode.parent !== null) {
                // We are in the same view, which means we are adding content node to the parent view.
                currentTNode.child = tNode;
            }
        }
        else {
            if (currentTNode.next === null) {
                // In the case of i18n the `currentTNode` may already be linked, in which case we don't want
                // to break the links which i18n created.
                currentTNode.next = tNode;
                tNode.prev = currentTNode;
            }
        }
    }
    return tNode;
}
/**
 * When elements are created dynamically after a view blueprint is created (e.g. through
 * i18nApply()), we need to adjust the blueprint for future
 * template passes.
 *
 * @param tView `TView` associated with `LView`
 * @param lView The `LView` containing the blueprint to adjust
 * @param numSlotsToAlloc The number of slots to alloc in the LView, should be >0
 * @param initialValue Initial value to store in blueprint
 */
export function allocExpando(tView, lView, numSlotsToAlloc, initialValue) {
    if (numSlotsToAlloc === 0)
        return -1;
    if (ngDevMode) {
        assertFirstCreatePass(tView);
        assertSame(tView, lView[TVIEW], '`LView` must be associated with `TView`!');
        assertEqual(tView.data.length, lView.length, 'Expecting LView to be same size as TView');
        assertEqual(tView.data.length, tView.blueprint.length, 'Expecting Blueprint to be same size as TView');
        assertFirstUpdatePass(tView);
    }
    const allocIdx = lView.length;
    for (let i = 0; i < numSlotsToAlloc; i++) {
        lView.push(initialValue);
        tView.blueprint.push(initialValue);
        tView.data.push(null);
    }
    return allocIdx;
}
export function executeTemplate(tView, lView, templateFn, rf, context) {
    const prevSelectedIndex = getSelectedIndex();
    const isUpdatePhase = rf & 2 /* RenderFlags.Update */;
    try {
        setSelectedIndex(-1);
        if (isUpdatePhase && lView.length > HEADER_OFFSET) {
            // When we're updating, inherently select 0 so we don't
            // have to generate that instruction for most update blocks.
            selectIndexInternal(tView, lView, HEADER_OFFSET, !!ngDevMode && isInCheckNoChangesMode());
        }
        const preHookType = isUpdatePhase
            ? 2 /* ProfilerEvent.TemplateUpdateStart */
            : 0 /* ProfilerEvent.TemplateCreateStart */;
        profiler(preHookType, context);
        templateFn(rf, context);
    }
    finally {
        setSelectedIndex(prevSelectedIndex);
        const postHookType = isUpdatePhase
            ? 3 /* ProfilerEvent.TemplateUpdateEnd */
            : 1 /* ProfilerEvent.TemplateCreateEnd */;
        profiler(postHookType, context);
    }
}
//////////////////////////
//// Element
//////////////////////////
export function executeContentQueries(tView, tNode, lView) {
    if (isContentQueryHost(tNode)) {
        const prevConsumer = setActiveConsumer(null);
        try {
            const start = tNode.directiveStart;
            const end = tNode.directiveEnd;
            for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
                const def = tView.data[directiveIndex];
                if (def.contentQueries) {
                    const directiveInstance = lView[directiveIndex];
                    ngDevMode &&
                        assertDefined(directiveIndex, 'Incorrect reference to a directive defining a content query');
                    def.contentQueries(1 /* RenderFlags.Create */, directiveInstance, directiveIndex);
                }
            }
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
    }
}
/**
 * Creates directive instances.
 */
export function createDirectivesInstances(tView, lView, tNode) {
    if (!getBindingsEnabled())
        return;
    instantiateAllDirectives(tView, lView, tNode, getNativeByTNode(tNode, lView));
    if ((tNode.flags & 64 /* TNodeFlags.hasHostBindings */) === 64 /* TNodeFlags.hasHostBindings */) {
        invokeDirectivesHostBindings(tView, lView, tNode);
    }
}
/**
 * Takes a list of local names and indices and pushes the resolved local variable values
 * to LView in the same order as they are loaded in the template with load().
 */
export function saveResolvedLocalsInData(viewData, tNode, localRefExtractor = getNativeByTNode) {
    const localNames = tNode.localNames;
    if (localNames !== null) {
        let localIndex = tNode.index + 1;
        for (let i = 0; i < localNames.length; i += 2) {
            const index = localNames[i + 1];
            const value = index === -1
                ? localRefExtractor(tNode, viewData)
                : viewData[index];
            viewData[localIndex++] = value;
        }
    }
}
/**
 * Gets TView from a template function or creates a new TView
 * if it doesn't already exist.
 *
 * @param def ComponentDef
 * @returns TView
 */
export function getOrCreateComponentTView(def) {
    const tView = def.tView;
    // Create a TView if there isn't one, or recreate it if the first create pass didn't
    // complete successfully since we can't know for sure whether it's in a usable shape.
    if (tView === null || tView.incompleteFirstPass) {
        // Declaration node here is null since this function is called when we dynamically create a
        // component and hence there is no declaration.
        const declTNode = null;
        return (def.tView = createTView(1 /* TViewType.Component */, declTNode, def.template, def.decls, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery, def.schemas, def.consts, def.id));
    }
    return tView;
}
/**
 * Creates a TView instance
 *
 * @param type Type of `TView`.
 * @param declTNode Declaration location of this `TView`.
 * @param templateFn Template function
 * @param decls The number of nodes, local refs, and pipes in this template
 * @param directives Registry of directives for this view
 * @param pipes Registry of pipes for this view
 * @param viewQuery View queries for this view
 * @param schemas Schemas for this view
 * @param consts Constants for this view
 */
export function createTView(type, declTNode, templateFn, decls, vars, directives, pipes, viewQuery, schemas, constsOrFactory, ssrId) {
    ngDevMode && ngDevMode.tView++;
    const bindingStartIndex = HEADER_OFFSET + decls;
    // This length does not yet contain host bindings from child directives because at this point,
    // we don't know which directives are active on this template. As soon as a directive is matched
    // that has a host binding, we will update the blueprint with that def's hostVars count.
    const initialViewLength = bindingStartIndex + vars;
    const blueprint = createViewBlueprint(bindingStartIndex, initialViewLength);
    const consts = typeof constsOrFactory === 'function' ? constsOrFactory() : constsOrFactory;
    const tView = (blueprint[TVIEW] = {
        type: type,
        blueprint: blueprint,
        template: templateFn,
        queries: null,
        viewQuery: viewQuery,
        declTNode: declTNode,
        data: blueprint.slice().fill(null, bindingStartIndex),
        bindingStartIndex: bindingStartIndex,
        expandoStartIndex: initialViewLength,
        hostBindingOpCodes: null,
        firstCreatePass: true,
        firstUpdatePass: true,
        staticViewQueries: false,
        staticContentQueries: false,
        preOrderHooks: null,
        preOrderCheckHooks: null,
        contentHooks: null,
        contentCheckHooks: null,
        viewHooks: null,
        viewCheckHooks: null,
        destroyHooks: null,
        cleanup: null,
        contentQueries: null,
        components: null,
        directiveRegistry: typeof directives === 'function' ? directives() : directives,
        pipeRegistry: typeof pipes === 'function' ? pipes() : pipes,
        firstChild: null,
        schemas: schemas,
        consts: consts,
        incompleteFirstPass: false,
        ssrId,
    });
    if (ngDevMode) {
        // For performance reasons it is important that the tView retains the same shape during runtime.
        // (To make sure that all of the code is monomorphic.) For this reason we seal the object to
        // prevent class transitions.
        Object.seal(tView);
    }
    return tView;
}
function createViewBlueprint(bindingStartIndex, initialViewLength) {
    const blueprint = [];
    for (let i = 0; i < initialViewLength; i++) {
        blueprint.push(i < bindingStartIndex ? null : NO_CHANGE);
    }
    return blueprint;
}
/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param renderer the renderer used to locate the element.
 * @param elementOrSelector Render element or CSS selector to locate the element.
 * @param encapsulation View Encapsulation defined for component that requests host element.
 * @param injector Root view injector instance.
 */
export function locateHostElement(renderer, elementOrSelector, encapsulation, injector) {
    // Note: we use default value for the `PRESERVE_HOST_CONTENT` here even though it's a
    // tree-shakable one (providedIn:'root'). This code path can be triggered during dynamic
    // component creation (after calling ViewContainerRef.createComponent) when an injector
    // instance can be provided. The injector instance might be disconnected from the main DI
    // tree, thus the `PRESERVE_HOST_CONTENT` would not be able to instantiate. In this case, the
    // default value will be used.
    const preserveHostContent = injector.get(PRESERVE_HOST_CONTENT, PRESERVE_HOST_CONTENT_DEFAULT);
    // When using native Shadow DOM, do not clear host element to allow native slot
    // projection.
    const preserveContent = preserveHostContent || encapsulation === ViewEncapsulation.ShadowDom;
    const rootElement = renderer.selectRootElement(elementOrSelector, preserveContent);
    applyRootElementTransform(rootElement);
    return rootElement;
}
/**
 * Applies any root element transformations that are needed. If hydration is enabled,
 * this will process corrupted text nodes.
 *
 * @param rootElement the app root HTML Element
 */
export function applyRootElementTransform(rootElement) {
    _applyRootElementTransformImpl(rootElement);
}
/**
 * Reference to a function that applies transformations to the root HTML element
 * of an app. When hydration is enabled, this processes any corrupt text nodes
 * so they are properly hydratable on the client.
 *
 * @param rootElement the app root HTML Element
 */
let _applyRootElementTransformImpl = () => null;
/**
 * Processes text node markers before hydration begins. This replaces any special comment
 * nodes that were added prior to serialization are swapped out to restore proper text
 * nodes before hydration.
 *
 * @param rootElement the app root HTML Element
 */
export function applyRootElementTransformImpl(rootElement) {
    if (hasSkipHydrationAttrOnRElement(rootElement)) {
        // Handle a situation when the `ngSkipHydration` attribute is applied
        // to the root node of an application. In this case, we should clear
        // the contents and render everything from scratch.
        clearElementContents(rootElement);
    }
    else {
        processTextNodeMarkersBeforeHydration(rootElement);
    }
}
/**
 * Sets the implementation for the `applyRootElementTransform` function.
 */
export function enableApplyRootElementTransformImpl() {
    _applyRootElementTransformImpl = applyRootElementTransformImpl;
}
/**
 * Saves context for this cleanup function in LView.cleanupInstances.
 *
 * On the first template pass, saves in TView:
 * - Cleanup function
 * - Index of context we just saved in LView.cleanupInstances
 */
export function storeCleanupWithContext(tView, lView, context, cleanupFn) {
    const lCleanup = getOrCreateLViewCleanup(lView);
    // Historically the `storeCleanupWithContext` was used to register both framework-level and
    // user-defined cleanup callbacks, but over time those two types of cleanups were separated.
    // This dev mode checks assures that user-level cleanup callbacks are _not_ stored in data
    // structures reserved for framework-specific hooks.
    ngDevMode &&
        assertDefined(context, 'Cleanup context is mandatory when registering framework-level destroy hooks');
    lCleanup.push(context);
    if (tView.firstCreatePass) {
        getOrCreateTViewCleanup(tView).push(cleanupFn, lCleanup.length - 1);
    }
    else {
        // Make sure that no new framework-level cleanup functions are registered after the first
        // template pass is done (and TView data structures are meant to fully constructed).
        if (ngDevMode) {
            Object.freeze(getOrCreateTViewCleanup(tView));
        }
    }
}
export function createTNode(tView, tParent, type, index, value, attrs) {
    ngDevMode &&
        index !== 0 && // 0 are bogus nodes and they are OK. See `createContainerRef` in
        // `view_engine_compatibility` for additional context.
        assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
    ngDevMode && assertNotSame(attrs, undefined, "'undefined' is not valid value for 'attrs'");
    ngDevMode && ngDevMode.tNode++;
    ngDevMode && tParent && assertTNodeForTView(tParent, tView);
    let injectorIndex = tParent ? tParent.injectorIndex : -1;
    let flags = 0;
    if (isInSkipHydrationBlock()) {
        flags |= 128 /* TNodeFlags.inSkipHydrationBlock */;
    }
    const tNode = {
        type,
        index,
        insertBeforeIndex: null,
        injectorIndex,
        directiveStart: -1,
        directiveEnd: -1,
        directiveStylingLast: -1,
        componentOffset: -1,
        propertyBindings: null,
        flags,
        providerIndexes: 0,
        value: value,
        attrs: attrs,
        mergedAttrs: null,
        localNames: null,
        initialInputs: undefined,
        inputs: null,
        outputs: null,
        tView: null,
        next: null,
        prev: null,
        projectionNext: null,
        child: null,
        parent: tParent,
        projection: null,
        styles: null,
        stylesWithoutHost: null,
        residualStyles: undefined,
        classes: null,
        classesWithoutHost: null,
        residualClasses: undefined,
        classBindings: 0,
        styleBindings: 0,
    };
    if (ngDevMode) {
        // For performance reasons it is important that the tNode retains the same shape during runtime.
        // (To make sure that all of the code is monomorphic.) For this reason we seal the object to
        // prevent class transitions.
        Object.seal(tNode);
    }
    return tNode;
}
function captureNodeBindings(mode, aliasMap, directiveIndex, bindingsResult, hostDirectiveAliasMap) {
    for (let publicName in aliasMap) {
        if (!aliasMap.hasOwnProperty(publicName)) {
            continue;
        }
        const value = aliasMap[publicName];
        if (value === undefined) {
            continue;
        }
        bindingsResult ??= {};
        let internalName;
        let inputFlags = InputFlags.None;
        // For inputs, the value might be an array capturing additional
        // input flags.
        if (Array.isArray(value)) {
            internalName = value[0];
            inputFlags = value[1];
        }
        else {
            internalName = value;
        }
        // If there are no host directive mappings, we want to remap using the alias map from the
        // definition itself. If there is an alias map, it has two functions:
        // 1. It serves as an allowlist of bindings that are exposed by the host directives. Only the
        // ones inside the host directive map will be exposed on the host.
        // 2. The public name of the property is aliased using the host directive alias map, rather
        // than the alias map from the definition.
        let finalPublicName = publicName;
        if (hostDirectiveAliasMap !== null) {
            // If there is no mapping, it's not part of the allowlist and this input/output
            // is not captured and should be ignored.
            if (!hostDirectiveAliasMap.hasOwnProperty(publicName)) {
                continue;
            }
            finalPublicName = hostDirectiveAliasMap[publicName];
        }
        if (mode === 0 /* CaptureNodeBindingMode.Inputs */) {
            addPropertyBinding(bindingsResult, directiveIndex, finalPublicName, internalName, inputFlags);
        }
        else {
            addPropertyBinding(bindingsResult, directiveIndex, finalPublicName, internalName);
        }
    }
    return bindingsResult;
}
function addPropertyBinding(bindings, directiveIndex, publicName, internalName, inputFlags) {
    let values;
    if (bindings.hasOwnProperty(publicName)) {
        (values = bindings[publicName]).push(directiveIndex, internalName);
    }
    else {
        values = bindings[publicName] = [directiveIndex, internalName];
    }
    if (inputFlags !== undefined) {
        values.push(inputFlags);
    }
}
/**
 * Initializes data structures required to work with directive inputs and outputs.
 * Initialization is done for all directives matched on a given TNode.
 */
function initializeInputAndOutputAliases(tView, tNode, hostDirectiveDefinitionMap) {
    ngDevMode && assertFirstCreatePass(tView);
    const start = tNode.directiveStart;
    const end = tNode.directiveEnd;
    const tViewData = tView.data;
    const tNodeAttrs = tNode.attrs;
    const inputsFromAttrs = [];
    let inputsStore = null;
    let outputsStore = null;
    for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
        const directiveDef = tViewData[directiveIndex];
        const aliasData = hostDirectiveDefinitionMap
            ? hostDirectiveDefinitionMap.get(directiveDef)
            : null;
        const aliasedInputs = aliasData ? aliasData.inputs : null;
        const aliasedOutputs = aliasData ? aliasData.outputs : null;
        inputsStore = captureNodeBindings(0 /* CaptureNodeBindingMode.Inputs */, directiveDef.inputs, directiveIndex, inputsStore, aliasedInputs);
        outputsStore = captureNodeBindings(1 /* CaptureNodeBindingMode.Outputs */, directiveDef.outputs, directiveIndex, outputsStore, aliasedOutputs);
        // Do not use unbound attributes as inputs to structural directives, since structural
        // directive inputs can only be set using microsyntax (e.g. `<div *dir="exp">`).
        // TODO(FW-1930): microsyntax expressions may also contain unbound/static attributes, which
        // should be set for inline templates.
        const initialInputs = inputsStore !== null && tNodeAttrs !== null && !isInlineTemplate(tNode)
            ? generateInitialInputs(inputsStore, directiveIndex, tNodeAttrs)
            : null;
        inputsFromAttrs.push(initialInputs);
    }
    if (inputsStore !== null) {
        if (inputsStore.hasOwnProperty('class')) {
            tNode.flags |= 8 /* TNodeFlags.hasClassInput */;
        }
        if (inputsStore.hasOwnProperty('style')) {
            tNode.flags |= 16 /* TNodeFlags.hasStyleInput */;
        }
    }
    tNode.initialInputs = inputsFromAttrs;
    tNode.inputs = inputsStore;
    tNode.outputs = outputsStore;
}
/**
 * Mapping between attributes names that don't correspond to their element property names.
 *
 * Performance note: this function is written as a series of if checks (instead of, say, a property
 * object lookup) for performance reasons - the series of `if` checks seems to be the fastest way of
 * mapping property names. Do NOT change without benchmarking.
 *
 * Note: this mapping has to be kept in sync with the equally named mapping in the template
 * type-checking machinery of ngtsc.
 */
function mapPropName(name) {
    if (name === 'class')
        return 'className';
    if (name === 'for')
        return 'htmlFor';
    if (name === 'formaction')
        return 'formAction';
    if (name === 'innerHtml')
        return 'innerHTML';
    if (name === 'readonly')
        return 'readOnly';
    if (name === 'tabindex')
        return 'tabIndex';
    return name;
}
export function elementPropertyInternal(tView, tNode, lView, propName, value, renderer, sanitizer, nativeOnly) {
    ngDevMode && assertNotSame(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');
    const element = getNativeByTNode(tNode, lView);
    let inputData = tNode.inputs;
    let dataValue;
    if (!nativeOnly && inputData != null && (dataValue = inputData[propName])) {
        setInputsForProperty(tView, lView, dataValue, propName, value);
        if (isComponentHost(tNode))
            markDirtyIfOnPush(lView, tNode.index);
        if (ngDevMode) {
            setNgReflectProperties(lView, element, tNode.type, dataValue, value);
        }
    }
    else if (tNode.type & 3 /* TNodeType.AnyRNode */) {
        propName = mapPropName(propName);
        if (ngDevMode) {
            validateAgainstEventProperties(propName);
            if (!isPropertyValid(element, propName, tNode.value, tView.schemas)) {
                handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
            }
            ngDevMode.rendererSetProperty++;
        }
        // It is assumed that the sanitizer is only added when the compiler determines that the
        // property is risky, so sanitization can be done without further checks.
        value = sanitizer != null ? sanitizer(value, tNode.value || '', propName) : value;
        renderer.setProperty(element, propName, value);
    }
    else if (tNode.type & 12 /* TNodeType.AnyContainer */) {
        // If the node is a container and the property didn't
        // match any of the inputs or schemas we should throw.
        if (ngDevMode && !matchingSchemas(tView.schemas, tNode.value)) {
            handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
        }
    }
}
/** If node is an OnPush component, marks its LView dirty. */
export function markDirtyIfOnPush(lView, viewIndex) {
    ngDevMode && assertLView(lView);
    const childComponentLView = getComponentLViewByIndex(viewIndex, lView);
    if (!(childComponentLView[FLAGS] & 16 /* LViewFlags.CheckAlways */)) {
        childComponentLView[FLAGS] |= 64 /* LViewFlags.Dirty */;
    }
}
function setNgReflectProperty(lView, element, type, attrName, value) {
    const renderer = lView[RENDERER];
    attrName = normalizeDebugBindingName(attrName);
    const debugValue = normalizeDebugBindingValue(value);
    if (type & 3 /* TNodeType.AnyRNode */) {
        if (value == null) {
            renderer.removeAttribute(element, attrName);
        }
        else {
            renderer.setAttribute(element, attrName, debugValue);
        }
    }
    else {
        const textContent = escapeCommentText(`bindings=${JSON.stringify({ [attrName]: debugValue }, null, 2)}`);
        renderer.setValue(element, textContent);
    }
}
export function setNgReflectProperties(lView, element, type, dataValue, value) {
    if (type & (3 /* TNodeType.AnyRNode */ | 4 /* TNodeType.Container */)) {
        /**
         * dataValue is an array containing runtime input or output names for the directives:
         * i+0: directive instance index
         * i+1: privateName
         *
         * e.g. [0, 'change', 'change-minified']
         * we want to set the reflected property with the privateName: dataValue[i+1]
         */
        for (let i = 0; i < dataValue.length; i += 3) {
            setNgReflectProperty(lView, element, type, dataValue[i + 1], value);
        }
    }
}
/**
 * Resolve the matched directives on a node.
 */
export function resolveDirectives(tView, lView, tNode, localRefs) {
    // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in
    // tsickle.
    ngDevMode && assertFirstCreatePass(tView);
    if (getBindingsEnabled()) {
        const exportsMap = localRefs === null ? null : { '': -1 };
        const matchResult = findDirectiveDefMatches(tView, tNode);
        let directiveDefs;
        let hostDirectiveDefs;
        if (matchResult === null) {
            directiveDefs = hostDirectiveDefs = null;
        }
        else {
            [directiveDefs, hostDirectiveDefs] = matchResult;
        }
        if (directiveDefs !== null) {
            initializeDirectives(tView, lView, tNode, directiveDefs, exportsMap, hostDirectiveDefs);
        }
        if (exportsMap)
            cacheMatchingLocalNames(tNode, localRefs, exportsMap);
    }
    // Merge the template attrs last so that they have the highest priority.
    tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
}
/** Initializes the data structures necessary for a list of directives to be instantiated. */
export function initializeDirectives(tView, lView, tNode, directives, exportsMap, hostDirectiveDefs) {
    ngDevMode && assertFirstCreatePass(tView);
    // Publishes the directive types to DI so they can be injected. Needs to
    // happen in a separate pass before the TNode flags have been initialized.
    for (let i = 0; i < directives.length; i++) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, directives[i].type);
    }
    initTNodeFlags(tNode, tView.data.length, directives.length);
    // When the same token is provided by several directives on the same node, some rules apply in
    // the viewEngine:
    // - viewProviders have priority over providers
    // - the last directive in NgModule.declarations has priority over the previous one
    // So to match these rules, the order in which providers are added in the arrays is very
    // important.
    for (let i = 0; i < directives.length; i++) {
        const def = directives[i];
        if (def.providersResolver)
            def.providersResolver(def);
    }
    let preOrderHooksFound = false;
    let preOrderCheckHooksFound = false;
    let directiveIdx = allocExpando(tView, lView, directives.length, null);
    ngDevMode &&
        assertSame(directiveIdx, tNode.directiveStart, 'TNode.directiveStart should point to just allocated space');
    for (let i = 0; i < directives.length; i++) {
        const def = directives[i];
        // Merge the attrs in the order of matches. This assumes that the first directive is the
        // component itself, so that the component has the least priority.
        tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);
        configureViewWithDirective(tView, tNode, lView, directiveIdx, def);
        saveNameToExportMap(directiveIdx, def, exportsMap);
        if (def.contentQueries !== null)
            tNode.flags |= 4 /* TNodeFlags.hasContentQuery */;
        if (def.hostBindings !== null || def.hostAttrs !== null || def.hostVars !== 0)
            tNode.flags |= 64 /* TNodeFlags.hasHostBindings */;
        const lifeCycleHooks = def.type.prototype;
        // Only push a node index into the preOrderHooks array if this is the first
        // pre-order hook found on this node.
        if (!preOrderHooksFound &&
            (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngOnInit || lifeCycleHooks.ngDoCheck)) {
            // We will push the actual hook function into this array later during dir instantiation.
            // We cannot do it now because we must ensure hooks are registered in the same
            // order that directives are created (i.e. injection order).
            (tView.preOrderHooks ??= []).push(tNode.index);
            preOrderHooksFound = true;
        }
        if (!preOrderCheckHooksFound && (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngDoCheck)) {
            (tView.preOrderCheckHooks ??= []).push(tNode.index);
            preOrderCheckHooksFound = true;
        }
        directiveIdx++;
    }
    initializeInputAndOutputAliases(tView, tNode, hostDirectiveDefs);
}
/**
 * Add `hostBindings` to the `TView.hostBindingOpCodes`.
 *
 * @param tView `TView` to which the `hostBindings` should be added.
 * @param tNode `TNode` the element which contains the directive
 * @param directiveIdx Directive index in view.
 * @param directiveVarsIdx Where will the directive's vars be stored
 * @param def `ComponentDef`/`DirectiveDef`, which contains the `hostVars`/`hostBindings` to add.
 */
export function registerHostBindingOpCodes(tView, tNode, directiveIdx, directiveVarsIdx, def) {
    ngDevMode && assertFirstCreatePass(tView);
    const hostBindings = def.hostBindings;
    if (hostBindings) {
        let hostBindingOpCodes = tView.hostBindingOpCodes;
        if (hostBindingOpCodes === null) {
            hostBindingOpCodes = tView.hostBindingOpCodes = [];
        }
        const elementIndx = ~tNode.index;
        if (lastSelectedElementIdx(hostBindingOpCodes) != elementIndx) {
            // Conditionally add select element so that we are more efficient in execution.
            // NOTE: this is strictly not necessary and it trades code size for runtime perf.
            // (We could just always add it.)
            hostBindingOpCodes.push(elementIndx);
        }
        hostBindingOpCodes.push(directiveIdx, directiveVarsIdx, hostBindings);
    }
}
/**
 * Returns the last selected element index in the `HostBindingOpCodes`
 *
 * For perf reasons we don't need to update the selected element index in `HostBindingOpCodes` only
 * if it changes. This method returns the last index (or '0' if not found.)
 *
 * Selected element index are only the ones which are negative.
 */
function lastSelectedElementIdx(hostBindingOpCodes) {
    let i = hostBindingOpCodes.length;
    while (i > 0) {
        const value = hostBindingOpCodes[--i];
        if (typeof value === 'number' && value < 0) {
            return value;
        }
    }
    return 0;
}
/**
 * Instantiate all the directives that were previously resolved on the current node.
 */
function instantiateAllDirectives(tView, lView, tNode, native) {
    const start = tNode.directiveStart;
    const end = tNode.directiveEnd;
    // The component view needs to be created before creating the node injector
    // since it is used to inject some special symbols like `ChangeDetectorRef`.
    if (isComponentHost(tNode)) {
        ngDevMode && assertTNodeType(tNode, 3 /* TNodeType.AnyRNode */);
        addComponentLogic(lView, tNode, tView.data[start + tNode.componentOffset]);
    }
    if (!tView.firstCreatePass) {
        getOrCreateNodeInjectorForNode(tNode, lView);
    }
    attachPatchData(native, lView);
    const initialInputs = tNode.initialInputs;
    for (let i = start; i < end; i++) {
        const def = tView.data[i];
        const directive = getNodeInjectable(lView, tView, i, tNode);
        attachPatchData(directive, lView);
        if (initialInputs !== null) {
            setInputsFromAttrs(lView, i - start, directive, def, tNode, initialInputs);
        }
        if (isComponentDef(def)) {
            const componentView = getComponentLViewByIndex(tNode.index, lView);
            componentView[CONTEXT] = getNodeInjectable(lView, tView, i, tNode);
        }
    }
}
export function invokeDirectivesHostBindings(tView, lView, tNode) {
    const start = tNode.directiveStart;
    const end = tNode.directiveEnd;
    const elementIndex = tNode.index;
    const currentDirectiveIndex = getCurrentDirectiveIndex();
    try {
        setSelectedIndex(elementIndex);
        for (let dirIndex = start; dirIndex < end; dirIndex++) {
            const def = tView.data[dirIndex];
            const directive = lView[dirIndex];
            setCurrentDirectiveIndex(dirIndex);
            if (def.hostBindings !== null || def.hostVars !== 0 || def.hostAttrs !== null) {
                invokeHostBindingsInCreationMode(def, directive);
            }
        }
    }
    finally {
        setSelectedIndex(-1);
        setCurrentDirectiveIndex(currentDirectiveIndex);
    }
}
/**
 * Invoke the host bindings in creation mode.
 *
 * @param def `DirectiveDef` which may contain the `hostBindings` function.
 * @param directive Instance of directive.
 */
export function invokeHostBindingsInCreationMode(def, directive) {
    if (def.hostBindings !== null) {
        def.hostBindings(1 /* RenderFlags.Create */, directive);
    }
}
/**
 * Matches the current node against all available selectors.
 * If a component is matched (at most one), it is returned in first position in the array.
 */
function findDirectiveDefMatches(tView, tNode) {
    ngDevMode && assertFirstCreatePass(tView);
    ngDevMode && assertTNodeType(tNode, 3 /* TNodeType.AnyRNode */ | 12 /* TNodeType.AnyContainer */);
    const registry = tView.directiveRegistry;
    let matches = null;
    let hostDirectiveDefs = null;
    if (registry) {
        for (let i = 0; i < registry.length; i++) {
            const def = registry[i];
            if (isNodeMatchingSelectorList(tNode, def.selectors, /* isProjectionMode */ false)) {
                matches || (matches = []);
                if (isComponentDef(def)) {
                    if (ngDevMode) {
                        assertTNodeType(tNode, 2 /* TNodeType.Element */, `"${tNode.value}" tags cannot be used as component hosts. ` +
                            `Please use a different tag to activate the ${stringify(def.type)} component.`);
                        if (isComponentHost(tNode)) {
                            throwMultipleComponentError(tNode, matches.find(isComponentDef).type, def.type);
                        }
                    }
                    // Components are inserted at the front of the matches array so that their lifecycle
                    // hooks run before any directive lifecycle hooks. This appears to be for ViewEngine
                    // compatibility. This logic doesn't make sense with host directives, because it
                    // would allow the host directives to undo any overrides the host may have made.
                    // To handle this case, the host directives of components are inserted at the beginning
                    // of the array, followed by the component. As such, the insertion order is as follows:
                    // 1. Host directives belonging to the selector-matched component.
                    // 2. Selector-matched component.
                    // 3. Host directives belonging to selector-matched directives.
                    // 4. Selector-matched directives.
                    if (def.findHostDirectiveDefs !== null) {
                        const hostDirectiveMatches = [];
                        hostDirectiveDefs = hostDirectiveDefs || new Map();
                        def.findHostDirectiveDefs(def, hostDirectiveMatches, hostDirectiveDefs);
                        // Add all host directives declared on this component, followed by the component itself.
                        // Host directives should execute first so the host has a chance to override changes
                        // to the DOM made by them.
                        matches.unshift(...hostDirectiveMatches, def);
                        // Component is offset starting from the beginning of the host directives array.
                        const componentOffset = hostDirectiveMatches.length;
                        markAsComponentHost(tView, tNode, componentOffset);
                    }
                    else {
                        // No host directives on this component, just add the
                        // component def to the beginning of the matches.
                        matches.unshift(def);
                        markAsComponentHost(tView, tNode, 0);
                    }
                }
                else {
                    // Append any host directives to the matches first.
                    hostDirectiveDefs = hostDirectiveDefs || new Map();
                    def.findHostDirectiveDefs?.(def, matches, hostDirectiveDefs);
                    matches.push(def);
                }
            }
        }
    }
    ngDevMode && matches !== null && assertNoDuplicateDirectives(matches);
    return matches === null ? null : [matches, hostDirectiveDefs];
}
/**
 * Marks a given TNode as a component's host. This consists of:
 * - setting the component offset on the TNode.
 * - storing index of component's host element so it will be queued for view refresh during CD.
 */
export function markAsComponentHost(tView, hostTNode, componentOffset) {
    ngDevMode && assertFirstCreatePass(tView);
    ngDevMode && assertGreaterThan(componentOffset, -1, 'componentOffset must be great than -1');
    hostTNode.componentOffset = componentOffset;
    (tView.components ??= []).push(hostTNode.index);
}
/** Caches local names and their matching directive indices for query and template lookups. */
function cacheMatchingLocalNames(tNode, localRefs, exportsMap) {
    if (localRefs) {
        const localNames = (tNode.localNames = []);
        // Local names must be stored in tNode in the same order that localRefs are defined
        // in the template to ensure the data is loaded in the same slots as their refs
        // in the template (for template queries).
        for (let i = 0; i < localRefs.length; i += 2) {
            const index = exportsMap[localRefs[i + 1]];
            if (index == null)
                throw new RuntimeError(-301 /* RuntimeErrorCode.EXPORT_NOT_FOUND */, ngDevMode && `Export of name '${localRefs[i + 1]}' not found!`);
            localNames.push(localRefs[i], index);
        }
    }
}
/**
 * Builds up an export map as directives are created, so local refs can be quickly mapped
 * to their directive instances.
 */
function saveNameToExportMap(directiveIdx, def, exportsMap) {
    if (exportsMap) {
        if (def.exportAs) {
            for (let i = 0; i < def.exportAs.length; i++) {
                exportsMap[def.exportAs[i]] = directiveIdx;
            }
        }
        if (isComponentDef(def))
            exportsMap[''] = directiveIdx;
    }
}
/**
 * Initializes the flags on the current node, setting all indices to the initial index,
 * the directive count to 0, and adding the isComponent flag.
 * @param index the initial index
 */
export function initTNodeFlags(tNode, index, numberOfDirectives) {
    ngDevMode &&
        assertNotEqual(numberOfDirectives, tNode.directiveEnd - tNode.directiveStart, 'Reached the max number of directives');
    tNode.flags |= 1 /* TNodeFlags.isDirectiveHost */;
    // When the first directive is created on a node, save the index
    tNode.directiveStart = index;
    tNode.directiveEnd = index + numberOfDirectives;
    tNode.providerIndexes = index;
}
/**
 * Setup directive for instantiation.
 *
 * We need to create a `NodeInjectorFactory` which is then inserted in both the `Blueprint` as well
 * as `LView`. `TView` gets the `DirectiveDef`.
 *
 * @param tView `TView`
 * @param tNode `TNode`
 * @param lView `LView`
 * @param directiveIndex Index where the directive will be stored in the Expando.
 * @param def `DirectiveDef`
 */
export function configureViewWithDirective(tView, tNode, lView, directiveIndex, def) {
    ngDevMode &&
        assertGreaterThanOrEqual(directiveIndex, HEADER_OFFSET, 'Must be in Expando section');
    tView.data[directiveIndex] = def;
    const directiveFactory = def.factory || (def.factory = getFactoryDef(def.type, true));
    // Even though `directiveFactory` will already be using `ɵɵdirectiveInject` in its generated code,
    // we also want to support `inject()` directly from the directive constructor context so we set
    // `ɵɵdirectiveInject` as the inject implementation here too.
    const nodeInjectorFactory = new NodeInjectorFactory(directiveFactory, isComponentDef(def), ɵɵdirectiveInject);
    tView.blueprint[directiveIndex] = nodeInjectorFactory;
    lView[directiveIndex] = nodeInjectorFactory;
    registerHostBindingOpCodes(tView, tNode, directiveIndex, allocExpando(tView, lView, def.hostVars, NO_CHANGE), def);
}
function addComponentLogic(lView, hostTNode, def) {
    const native = getNativeByTNode(hostTNode, lView);
    const tView = getOrCreateComponentTView(def);
    // Only component views should be added to the view tree directly. Embedded views are
    // accessed through their containers because they may be removed / re-added later.
    const rendererFactory = lView[ENVIRONMENT].rendererFactory;
    let lViewFlags = 16 /* LViewFlags.CheckAlways */;
    if (def.signals) {
        lViewFlags = 4096 /* LViewFlags.SignalView */;
    }
    else if (def.onPush) {
        lViewFlags = 64 /* LViewFlags.Dirty */;
    }
    const componentView = addToViewTree(lView, createLView(lView, tView, null, lViewFlags, native, hostTNode, null, rendererFactory.createRenderer(native, def), null, null, null));
    // Component view will always be created before any injected LContainers,
    // so this is a regular element, wrap it with the component view
    lView[hostTNode.index] = componentView;
}
export function elementAttributeInternal(tNode, lView, name, value, sanitizer, namespace) {
    if (ngDevMode) {
        assertNotSame(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');
        validateAgainstEventAttributes(name);
        assertTNodeType(tNode, 2 /* TNodeType.Element */, `Attempted to set attribute \`${name}\` on a container node. ` +
            `Host bindings are not valid on ng-container or ng-template.`);
    }
    const element = getNativeByTNode(tNode, lView);
    setElementAttribute(lView[RENDERER], element, namespace, tNode.value, name, value, sanitizer);
}
export function setElementAttribute(renderer, element, namespace, tagName, name, value, sanitizer) {
    if (value == null) {
        ngDevMode && ngDevMode.rendererRemoveAttribute++;
        renderer.removeAttribute(element, name, namespace);
    }
    else {
        ngDevMode && ngDevMode.rendererSetAttribute++;
        const strValue = sanitizer == null ? renderStringify(value) : sanitizer(value, tagName || '', name);
        renderer.setAttribute(element, name, strValue, namespace);
    }
}
/**
 * Sets initial input properties on directive instances from attribute data
 *
 * @param lView Current LView that is being processed.
 * @param directiveIndex Index of the directive in directives array
 * @param instance Instance of the directive on which to set the initial inputs
 * @param def The directive def that contains the list of inputs
 * @param tNode The static data for this node
 */
function setInputsFromAttrs(lView, directiveIndex, instance, def, tNode, initialInputData) {
    const initialInputs = initialInputData[directiveIndex];
    if (initialInputs !== null) {
        for (let i = 0; i < initialInputs.length;) {
            const publicName = initialInputs[i++];
            const privateName = initialInputs[i++];
            const flags = initialInputs[i++];
            const value = initialInputs[i++];
            writeToDirectiveInput(def, instance, publicName, privateName, flags, value);
            if (ngDevMode) {
                const nativeElement = getNativeByTNode(tNode, lView);
                setNgReflectProperty(lView, nativeElement, tNode.type, privateName, value);
            }
        }
    }
}
/**
 * Generates initialInputData for a node and stores it in the template's static storage
 * so subsequent template invocations don't have to recalculate it.
 *
 * initialInputData is an array containing values that need to be set as input properties
 * for directives on this node, but only once on creation. We need this array to support
 * the case where you set an @Input property of a directive using attribute-like syntax.
 * e.g. if you have a `name` @Input, you can set it once like this:
 *
 * <my-component name="Bess"></my-component>
 *
 * @param inputs Input alias map that was generated from the directive def inputs.
 * @param directiveIndex Index of the directive that is currently being processed.
 * @param attrs Static attrs on this node.
 */
function generateInitialInputs(inputs, directiveIndex, attrs) {
    let inputsToStore = null;
    let i = 0;
    while (i < attrs.length) {
        const attrName = attrs[i];
        if (attrName === 0 /* AttributeMarker.NamespaceURI */) {
            // We do not allow inputs on namespaced attributes.
            i += 4;
            continue;
        }
        else if (attrName === 5 /* AttributeMarker.ProjectAs */) {
            // Skip over the `ngProjectAs` value.
            i += 2;
            continue;
        }
        // If we hit any other attribute markers, we're done anyway. None of those are valid inputs.
        if (typeof attrName === 'number')
            break;
        if (inputs.hasOwnProperty(attrName)) {
            if (inputsToStore === null)
                inputsToStore = [];
            // Find the input's public name from the input store. Note that we can be found easier
            // through the directive def, but we want to do it using the inputs store so that it can
            // account for host directive aliases.
            const inputConfig = inputs[attrName];
            for (let j = 0; j < inputConfig.length; j += 3) {
                if (inputConfig[j] === directiveIndex) {
                    inputsToStore.push(attrName, inputConfig[j + 1], inputConfig[j + 2], attrs[i + 1]);
                    // A directive can't have multiple inputs with the same name so we can break here.
                    break;
                }
            }
        }
        i += 2;
    }
    return inputsToStore;
}
//////////////////////////
//// ViewContainer & View
//////////////////////////
/**
 * Creates a LContainer, either from a container instruction, or for a ViewContainerRef.
 *
 * @param hostNative The host element for the LContainer
 * @param hostTNode The host TNode for the LContainer
 * @param currentView The parent view of the LContainer
 * @param native The native comment element
 * @param isForViewContainerRef Optional a flag indicating the ViewContainerRef case
 * @returns LContainer
 */
export function createLContainer(hostNative, currentView, native, tNode) {
    ngDevMode && assertLView(currentView);
    const lContainer = [
        hostNative, // host native
        true, // Boolean `true` in this position signifies that this is an `LContainer`
        0, // flags
        currentView, // parent
        null, // next
        tNode, // t_host
        null, // dehydrated views
        native, // native,
        null, // view refs
        null, // moved views
    ];
    ngDevMode &&
        assertEqual(lContainer.length, CONTAINER_HEADER_OFFSET, 'Should allocate correct number of slots for LContainer header.');
    return lContainer;
}
/** Refreshes all content queries declared by directives in a given view */
export function refreshContentQueries(tView, lView) {
    const contentQueries = tView.contentQueries;
    if (contentQueries !== null) {
        const prevConsumer = setActiveConsumer(null);
        try {
            for (let i = 0; i < contentQueries.length; i += 2) {
                const queryStartIdx = contentQueries[i];
                const directiveDefIdx = contentQueries[i + 1];
                if (directiveDefIdx !== -1) {
                    const directiveDef = tView.data[directiveDefIdx];
                    ngDevMode && assertDefined(directiveDef, 'DirectiveDef not found.');
                    ngDevMode &&
                        assertDefined(directiveDef.contentQueries, 'contentQueries function should be defined');
                    setCurrentQueryIndex(queryStartIdx);
                    directiveDef.contentQueries(2 /* RenderFlags.Update */, lView[directiveDefIdx], directiveDefIdx);
                }
            }
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
    }
}
/**
 * Adds LView or LContainer to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param lView The view where LView or LContainer should be added
 * @param adjustedHostIndex Index of the view's host node in LView[], adjusted for header
 * @param lViewOrLContainer The LView or LContainer to add to the view tree
 * @returns The state passed in
 */
export function addToViewTree(lView, lViewOrLContainer) {
    // TODO(benlesh/misko): This implementation is incorrect, because it always adds the LContainer
    // to the end of the queue, which means if the developer retrieves the LContainers from RNodes out
    // of order, the change detection will run out of order, as the act of retrieving the the
    // LContainer from the RNode is what adds it to the queue.
    if (lView[CHILD_HEAD]) {
        lView[CHILD_TAIL][NEXT] = lViewOrLContainer;
    }
    else {
        lView[CHILD_HEAD] = lViewOrLContainer;
    }
    lView[CHILD_TAIL] = lViewOrLContainer;
    return lViewOrLContainer;
}
///////////////////////////////
//// Change detection
///////////////////////////////
export function executeViewQueryFn(flags, viewQueryFn, component) {
    ngDevMode && assertDefined(viewQueryFn, 'View queries function to execute must be defined.');
    setCurrentQueryIndex(0);
    const prevConsumer = setActiveConsumer(null);
    try {
        viewQueryFn(flags, component);
    }
    finally {
        setActiveConsumer(prevConsumer);
    }
}
///////////////////////////////
//// Bindings & interpolations
///////////////////////////////
/**
 * Stores meta-data for a property binding to be used by TestBed's `DebugElement.properties`.
 *
 * In order to support TestBed's `DebugElement.properties` we need to save, for each binding:
 * - a bound property name;
 * - a static parts of interpolated strings;
 *
 * A given property metadata is saved at the binding's index in the `TView.data` (in other words, a
 * property binding metadata will be stored in `TView.data` at the same index as a bound value in
 * `LView`). Metadata are represented as `INTERPOLATION_DELIMITER`-delimited string with the
 * following format:
 * - `propertyName` for bound properties;
 * - `propertyName�prefix�interpolation_static_part1�..interpolation_static_partN�suffix` for
 * interpolated properties.
 *
 * @param tData `TData` where meta-data will be saved;
 * @param tNode `TNode` that is a target of the binding;
 * @param propertyName bound property name;
 * @param bindingIndex binding index in `LView`
 * @param interpolationParts static interpolation parts (for property interpolations)
 */
export function storePropertyBindingMetadata(tData, tNode, propertyName, bindingIndex, ...interpolationParts) {
    // Binding meta-data are stored only the first time a given property instruction is processed.
    // Since we don't have a concept of the "first update pass" we need to check for presence of the
    // binding meta-data to decide if one should be stored (or if was stored already).
    if (tData[bindingIndex] === null) {
        if (tNode.inputs == null || !tNode.inputs[propertyName]) {
            const propBindingIdxs = tNode.propertyBindings || (tNode.propertyBindings = []);
            propBindingIdxs.push(bindingIndex);
            let bindingMetadata = propertyName;
            if (interpolationParts.length > 0) {
                bindingMetadata +=
                    INTERPOLATION_DELIMITER + interpolationParts.join(INTERPOLATION_DELIMITER);
            }
            tData[bindingIndex] = bindingMetadata;
        }
    }
}
export function getOrCreateLViewCleanup(view) {
    // top level variables should not be exported for performance reasons (PERF_NOTES.md)
    return (view[CLEANUP] ??= []);
}
export function getOrCreateTViewCleanup(tView) {
    return (tView.cleanup ??= []);
}
/**
 * There are cases where the sub component's renderer needs to be included
 * instead of the current renderer (see the componentSyntheticHost* instructions).
 */
export function loadComponentRenderer(currentDef, tNode, lView) {
    // TODO(FW-2043): the `currentDef` is null when host bindings are invoked while creating root
    // component (see packages/core/src/render3/component.ts). This is not consistent with the process
    // of creating inner components, when current directive index is available in the state. In order
    // to avoid relying on current def being `null` (thus special-casing root component creation), the
    // process of creating root component should be unified with the process of creating inner
    // components.
    if (currentDef === null || isComponentDef(currentDef)) {
        lView = unwrapLView(lView[tNode.index]);
    }
    return lView[RENDERER];
}
/** Handles an error thrown in an LView. */
export function handleError(lView, error) {
    const injector = lView[INJECTOR];
    const errorHandler = injector ? injector.get(ErrorHandler, null) : null;
    errorHandler && errorHandler.handleError(error);
}
/**
 * Set the inputs of directives at the current node to corresponding value.
 *
 * @param tView The current TView
 * @param lView the `LView` which contains the directives.
 * @param inputs mapping between the public "input" name and privately-known,
 *        possibly minified, property names to write to.
 * @param value Value to set.
 */
export function setInputsForProperty(tView, lView, inputs, publicName, value) {
    for (let i = 0; i < inputs.length;) {
        const index = inputs[i++];
        const privateName = inputs[i++];
        const flags = inputs[i++];
        const instance = lView[index];
        ngDevMode && assertIndexInRange(lView, index);
        const def = tView.data[index];
        writeToDirectiveInput(def, instance, publicName, privateName, flags, value);
    }
}
/**
 * Updates a text binding at a given index in a given LView.
 */
export function textBindingInternal(lView, index, value) {
    ngDevMode && assertString(value, 'Value should be a string');
    ngDevMode && assertNotSame(value, NO_CHANGE, 'value should not be NO_CHANGE');
    ngDevMode && assertIndexInRange(lView, index);
    const element = getNativeByIndex(index, lView);
    ngDevMode && assertDefined(element, 'native element should exist');
    updateTextNode(lView[RENDERER], element, value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9pbnN0cnVjdGlvbnMvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBR25FLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsWUFBWSxFQUFtQixNQUFNLGNBQWMsQ0FBQztBQUU1RCxPQUFPLEVBQUMsOEJBQThCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM5RSxPQUFPLEVBQUMscUJBQXFCLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RixPQUFPLEVBQUMscUNBQXFDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUk1RSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQ0wsOEJBQThCLEVBQzlCLDhCQUE4QixHQUMvQixNQUFNLGlDQUFpQyxDQUFDO0FBQ3pDLE9BQU8sRUFDTCxhQUFhLEVBQ2IsV0FBVyxFQUNYLGlCQUFpQixFQUNqQix3QkFBd0IsRUFDeEIsa0JBQWtCLEVBQ2xCLGNBQWMsRUFDZCxhQUFhLEVBQ2IsVUFBVSxFQUNWLFlBQVksR0FDYixNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2pELE9BQU8sRUFBQyx5QkFBeUIsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzVGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUUvQyxPQUFPLEVBQ0wscUJBQXFCLEVBQ3JCLHFCQUFxQixFQUNyQixXQUFXLEVBQ1gsMkJBQTJCLEVBQzNCLG1CQUFt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WSxDQUFDLEtBQUssRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQzdELFNBQVMsSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFLFNBQWdCLEVBQUUsK0JBQStCLENBQUMsQ0FBQztJQUNyRixTQUFTLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQWlCLENBQUM7SUFDL0QsU0FBUyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUNuRSxjQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNsRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c2V0QWN0aXZlQ29uc3VtZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvcHJpbWl0aXZlcy9zaWduYWxzJztcblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtFcnJvckhhbmRsZXJ9IGZyb20gJy4uLy4uL2Vycm9yX2hhbmRsZXInO1xuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge0RlaHlkcmF0ZWRWaWV3fSBmcm9tICcuLi8uLi9oeWRyYXRpb24vaW50ZXJmYWNlcyc7XG5pbXBvcnQge2hhc1NraXBIeWRyYXRpb25BdHRyT25SRWxlbWVudH0gZnJvbSAnLi4vLi4vaHlkcmF0aW9uL3NraXBfaHlkcmF0aW9uJztcbmltcG9ydCB7UFJFU0VSVkVfSE9TVF9DT05URU5ULCBQUkVTRVJWRV9IT1NUX0NPTlRFTlRfREVGQVVMVH0gZnJvbSAnLi4vLi4vaHlkcmF0aW9uL3Rva2Vucyc7XG5pbXBvcnQge3Byb2Nlc3NUZXh0Tm9kZU1hcmtlcnNCZWZvcmVIeWRyYXRpb259IGZyb20gJy4uLy4uL2h5ZHJhdGlvbi91dGlscyc7XG5pbXBvcnQge0RvQ2hlY2ssIE9uQ2hhbmdlcywgT25Jbml0fSBmcm9tICcuLi8uLi9pbnRlcmZhY2UvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7V3JpdGFibGV9IGZyb20gJy4uLy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7U2NoZW1hTWV0YWRhdGF9IGZyb20gJy4uLy4uL21ldGFkYXRhL3NjaGVtYSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi8uLi9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7XG4gIHZhbGlkYXRlQWdhaW5zdEV2ZW50QXR0cmlidXRlcyxcbiAgdmFsaWRhdGVBZ2FpbnN0RXZlbnRQcm9wZXJ0aWVzLFxufSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vc2FuaXRpemF0aW9uJztcbmltcG9ydCB7XG4gIGFzc2VydERlZmluZWQsXG4gIGFzc2VydEVxdWFsLFxuICBhc3NlcnRHcmVhdGVyVGhhbixcbiAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsLFxuICBhc3NlcnRJbmRleEluUmFuZ2UsXG4gIGFzc2VydE5vdEVxdWFsLFxuICBhc3NlcnROb3RTYW1lLFxuICBhc3NlcnRTYW1lLFxuICBhc3NlcnRTdHJpbmcsXG59IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7ZXNjYXBlQ29tbWVudFRleHR9IGZyb20gJy4uLy4uL3V0aWwvZG9tJztcbmltcG9ydCB7bm9ybWFsaXplRGVidWdCaW5kaW5nTmFtZSwgbm9ybWFsaXplRGVidWdCaW5kaW5nVmFsdWV9IGZyb20gJy4uLy4uL3V0aWwvbmdfcmVmbGVjdCc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vLi4vdXRpbC9zdHJpbmdpZnknO1xuaW1wb3J0IHthcHBseVZhbHVlVG9JbnB1dEZpZWxkfSBmcm9tICcuLi9hcHBseV92YWx1ZV9pbnB1dF9maWVsZCc7XG5pbXBvcnQge1xuICBhc3NlcnRGaXJzdENyZWF0ZVBhc3MsXG4gIGFzc2VydEZpcnN0VXBkYXRlUGFzcyxcbiAgYXNzZXJ0TFZpZXcsXG4gIGFzc2VydE5vRHVwbGljYXRlRGlyZWN0aXZlcyxcbiAgYXNzZXJ0VE5vZGVGb3JMVmlldyxcbiAgYXNzZXJ0VE5vZGVGb3JUVmlldyxcbn0gZnJvbSAnLi4vYXNzZXJ0JztcbmltcG9ydCB7YXR0YWNoUGF0Y2hEYXRhfSBmcm9tICcuLi9jb250ZXh0X2Rpc2NvdmVyeSc7XG5pbXBvcnQge2dldEZhY3RvcnlEZWZ9IGZyb20gJy4uL2RlZmluaXRpb25fZmFjdG9yeSc7XG5pbXBvcnQge2RpUHVibGljSW5JbmplY3RvciwgZ2V0Tm9kZUluamVjdGFibGUsIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZX0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHt0aHJvd011bHRpcGxlQ29tcG9uZW50RXJyb3J9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge0F0dHJpYnV0ZU1hcmtlcn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9hdHRyaWJ1dGVfbWFya2VyJztcbmltcG9ydCB7Q09OVEFJTkVSX0hFQURFUl9PRkZTRVQsIExDb250YWluZXJ9IGZyb20gJy4uL2ludGVyZmFjZXMvY29udGFpbmVyJztcbmltcG9ydCB7XG4gIENvbXBvbmVudERlZixcbiAgQ29tcG9uZW50VGVtcGxhdGUsXG4gIERpcmVjdGl2ZURlZixcbiAgRGlyZWN0aXZlRGVmTGlzdE9yRmFjdG9yeSxcbiAgSG9zdEJpbmRpbmdzRnVuY3Rpb24sXG4gIEhvc3REaXJlY3RpdmVCaW5kaW5nTWFwLFxuICBIb3N0RGlyZWN0aXZlRGVmcyxcbiAgUGlwZURlZkxpc3RPckZhY3RvcnksXG4gIFJlbmRlckZsYWdzLFxuICBWaWV3UXVlcmllc0Z1bmN0aW9uLFxufSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtOb2RlSW5qZWN0b3JGYWN0b3J5fSBmcm9tICcuLi9pbnRlcmZhY2VzL2luamVjdG9yJztcbmltcG9ydCB7SW5wdXRGbGFnc30gZnJvbSAnLi4vaW50ZXJmYWNlcy9pbnB1dF9mbGFncyc7XG5pbXBvcnQge2dldFVuaXF1ZUxWaWV3SWR9IGZyb20gJy4uL2ludGVyZmFjZXMvbHZpZXdfdHJhY2tpbmcnO1xuaW1wb3J0IHtcbiAgSW5pdGlhbElucHV0RGF0YSxcbiAgSW5pdGlhbElucHV0cyxcbiAgTG9jYWxSZWZFeHRyYWN0b3IsXG4gIE5vZGVJbnB1dEJpbmRpbmdzLFxuICBOb2RlT3V0cHV0QmluZGluZ3MsXG4gIFRBdHRyaWJ1dGVzLFxuICBUQ29uc3RhbnRzT3JGYWN0b3J5LFxuICBUQ29udGFpbmVyTm9kZSxcbiAgVERpcmVjdGl2ZUhvc3ROb2RlLFxuICBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gIFRFbGVtZW50Tm9kZSxcbiAgVEljdUNvbnRhaW5lck5vZGUsXG4gIFROb2RlLFxuICBUTm9kZUZsYWdzLFxuICBUTm9kZVR5cGUsXG4gIFRQcm9qZWN0aW9uTm9kZSxcbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7UmVuZGVyZXJ9IGZyb20gJy4uL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtSQ29tbWVudCwgUkVsZW1lbnQsIFJOb2RlLCBSVGV4dH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtTYW5pdGl6ZXJGbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zYW5pdGl6YXRpb24nO1xuaW1wb3J0IHtUU3R5bGluZ1JhbmdlfSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0eWxpbmcnO1xuaW1wb3J0IHtpc0NvbXBvbmVudERlZiwgaXNDb21wb25lbnRIb3N0LCBpc0NvbnRlbnRRdWVyeUhvc3R9IGZyb20gJy4uL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHtcbiAgQ0hJTERfSEVBRCxcbiAgQ0hJTERfVEFJTCxcbiAgQ0xFQU5VUCxcbiAgQ09OVEVYVCxcbiAgREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVcsXG4gIERFQ0xBUkFUSU9OX1ZJRVcsXG4gIEVNQkVEREVEX1ZJRVdfSU5KRUNUT1IsXG4gIEVOVklST05NRU5ULFxuICBGTEFHUyxcbiAgSEVBREVSX09GRlNFVCxcbiAgSE9TVCxcbiAgSG9zdEJpbmRpbmdPcENvZGVzLFxuICBIWURSQVRJT04sXG4gIElELFxuICBJTkpFQ1RPUixcbiAgTFZpZXcsXG4gIExWaWV3RW52aXJvbm1lbnQsXG4gIExWaWV3RmxhZ3MsXG4gIE5FWFQsXG4gIFBBUkVOVCxcbiAgUkVOREVSRVIsXG4gIFRfSE9TVCxcbiAgVERhdGEsXG4gIFRWSUVXLFxuICBUVmlldyxcbiAgVFZpZXdUeXBlLFxufSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHthc3NlcnRQdXJlVE5vZGVUeXBlLCBhc3NlcnRUTm9kZVR5cGV9IGZyb20gJy4uL25vZGVfYXNzZXJ0JztcbmltcG9ydCB7Y2xlYXJFbGVtZW50Q29udGVudHMsIHVwZGF0ZVRleHROb2RlfSBmcm9tICcuLi9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge2lzSW5saW5lVGVtcGxhdGUsIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JMaXN0fSBmcm9tICcuLi9ub2RlX3NlbGVjdG9yX21hdGNoZXInO1xuaW1wb3J0IHtwcm9maWxlciwgUHJvZmlsZXJFdmVudH0gZnJvbSAnLi4vcHJvZmlsZXInO1xuaW1wb3J0IHtcbiAgZ2V0QmluZGluZ3NFbmFibGVkLFxuICBnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgsXG4gIGdldEN1cnJlbnRQYXJlbnRUTm9kZSxcbiAgZ2V0Q3VycmVudFROb2RlUGxhY2Vob2xkZXJPayxcbiAgZ2V0U2VsZWN0ZWRJbmRleCxcbiAgaXNDdXJyZW50VE5vZGVQYXJlbnQsXG4gIGlzSW5DaGVja05vQ2hhbmdlc01vZGUsXG4gIGlzSW5JMThuQmxvY2ssXG4gIGlzSW5Ta2lwSHlkcmF0aW9uQmxvY2ssXG4gIHNldEJpbmRpbmdSb290Rm9ySG9zdEJpbmRpbmdzLFxuICBzZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgsXG4gIHNldEN1cnJlbnRRdWVyeUluZGV4LFxuICBzZXRDdXJyZW50VE5vZGUsXG4gIHNldFNlbGVjdGVkSW5kZXgsXG59IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7Tk9fQ0hBTkdFfSBmcm9tICcuLi90b2tlbnMnO1xuaW1wb3J0IHttZXJnZUhvc3RBdHRyc30gZnJvbSAnLi4vdXRpbC9hdHRyc191dGlscyc7XG5pbXBvcnQge0lOVEVSUE9MQVRJT05fREVMSU1JVEVSfSBmcm9tICcuLi91dGlsL21pc2NfdXRpbHMnO1xuaW1wb3J0IHtyZW5kZXJTdHJpbmdpZnl9IGZyb20gJy4uL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcbmltcG9ydCB7XG4gIGdldENvbXBvbmVudExWaWV3QnlJbmRleCxcbiAgZ2V0TmF0aXZlQnlJbmRleCxcbiAgZ2V0TmF0aXZlQnlUTm9kZSxcbiAgcmVzZXRQcmVPcmRlckhvb2tGbGFncyxcbiAgdW53cmFwTFZpZXcsXG59IGZyb20gJy4uL3V0aWwvdmlld191dGlscyc7XG5cbmltcG9ydCB7c2VsZWN0SW5kZXhJbnRlcm5hbH0gZnJvbSAnLi9hZHZhbmNlJztcbmltcG9ydCB7ybXJtWRpcmVjdGl2ZUluamVjdH0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge2hhbmRsZVVua25vd25Qcm9wZXJ0eUVycm9yLCBpc1Byb3BlcnR5VmFsaWQsIG1hdGNoaW5nU2NoZW1hc30gZnJvbSAnLi9lbGVtZW50X3ZhbGlkYXRpb24nO1xuaW1wb3J0IHt3cml0ZVRvRGlyZWN0aXZlSW5wdXR9IGZyb20gJy4vd3JpdGVfdG9fZGlyZWN0aXZlX2lucHV0JztcblxuLyoqXG4gKiBJbnZva2UgYEhvc3RCaW5kaW5nc0Z1bmN0aW9uYHMgZm9yIHZpZXcuXG4gKlxuICogVGhpcyBtZXRob2RzIGV4ZWN1dGVzIGBUVmlldy5ob3N0QmluZGluZ09wQ29kZXNgLiBJdCBpcyB1c2VkIHRvIGV4ZWN1dGUgdGhlXG4gKiBgSG9zdEJpbmRpbmdzRnVuY3Rpb25gcyBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnQgYExWaWV3YC5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgQ3VycmVudCBgVFZpZXdgLlxuICogQHBhcmFtIGxWaWV3IEN1cnJlbnQgYExWaWV3YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NIb3N0QmluZGluZ09wQ29kZXModFZpZXc6IFRWaWV3LCBsVmlldzogTFZpZXcpOiB2b2lkIHtcbiAgY29uc3QgaG9zdEJpbmRpbmdPcENvZGVzID0gdFZpZXcuaG9zdEJpbmRpbmdPcENvZGVzO1xuICBpZiAoaG9zdEJpbmRpbmdPcENvZGVzID09PSBudWxsKSByZXR1cm47XG4gIHRyeSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3N0QmluZGluZ09wQ29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG9wQ29kZSA9IGhvc3RCaW5kaW5nT3BDb2Rlc1tpXSBhcyBudW1iZXI7XG4gICAgICBpZiAob3BDb2RlIDwgMCkge1xuICAgICAgICAvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBlbGVtZW50IGluZGV4ZXMuXG4gICAgICAgIHNldFNlbGVjdGVkSW5kZXgofm9wQ29kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBQb3NpdGl2ZSBudW1iZXJzIGFyZSBOdW1iZXJUdXBsZSB3aGljaCBzdG9yZSBiaW5kaW5nUm9vdEluZGV4IGFuZCBkaXJlY3RpdmVJbmRleC5cbiAgICAgICAgY29uc3QgZGlyZWN0aXZlSWR4ID0gb3BDb2RlO1xuICAgICAgICBjb25zdCBiaW5kaW5nUm9vdEluZHggPSBob3N0QmluZGluZ09wQ29kZXNbKytpXSBhcyBudW1iZXI7XG4gICAgICAgIGNvbnN0IGhvc3RCaW5kaW5nRm4gPSBob3N0QmluZGluZ09wQ29kZXNbKytpXSBhcyBIb3N0QmluZGluZ3NGdW5jdGlvbjxhbnk+O1xuICAgICAgICBzZXRCaW5kaW5nUm9vdEZvckhvc3RCaW5kaW5ncyhiaW5kaW5nUm9vdEluZHgsIGRpcmVjdGl2ZUlkeCk7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBsVmlld1tkaXJlY3RpdmVJZHhdO1xuICAgICAgICBob3N0QmluZGluZ0ZuKFJlbmRlckZsYWdzLlVwZGF0ZSwgY29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIHNldFNlbGVjdGVkSW5kZXgoLTEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMVmlldzxUPihcbiAgcGFyZW50TFZpZXc6IExWaWV3IHwgbnVsbCxcbiAgdFZpZXc6IFRWaWV3LFxuICBjb250ZXh0OiBUIHwgbnVsbCxcbiAgZmxhZ3M6IExWaWV3RmxhZ3MsXG4gIGhvc3Q6IFJFbGVtZW50IHwgbnVsbCxcbiAgdEhvc3ROb2RlOiBUTm9kZSB8IG51bGwsXG4gIGVudmlyb25tZW50OiBMVmlld0Vudmlyb25tZW50IHwgbnVsbCxcbiAgcmVuZGVyZXI6IFJlbmRlcmVyIHwgbnVsbCxcbiAgaW5qZWN0b3I6IEluamVjdG9yIHwgbnVsbCxcbiAgZW1iZWRkZWRWaWV3SW5qZWN0b3I6IEluamVjdG9yIHwgbnVsbCxcbiAgaHlkcmF0aW9uSW5mbzogRGVoeWRyYXRlZFZpZXcgfCBudWxsLFxuKTogTFZpZXc8VD4ge1xuICBjb25zdCBsVmlldyA9IHRWaWV3LmJsdWVwcmludC5zbGljZSgpIGFzIExWaWV3O1xuICBsVmlld1tIT1NUXSA9IGhvc3Q7XG4gIGxWaWV3W0ZMQUdTXSA9XG4gICAgZmxhZ3MgfFxuICAgIExWaWV3RmxhZ3MuQ3JlYXRpb25Nb2RlIHxcbiAgICBMVmlld0ZsYWdzLkF0dGFjaGVkIHxcbiAgICBMVmlld0ZsYWdzLkZpcnN0TFZpZXdQYXNzIHxcbiAgICBMVmlld0ZsYWdzLkRpcnR5O1xuICBpZiAoXG4gICAgZW1iZWRkZWRWaWV3SW5qZWN0b3IgIT09IG51bGwgfHxcbiAgICAocGFyZW50TFZpZXcgJiYgcGFyZW50TFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5IYXNFbWJlZGRlZFZpZXdJbmplY3RvcilcbiAgKSB7XG4gICAgbFZpZXdbRkxBR1NdIHw9IExWaWV3RmxhZ3MuSGFzRW1iZWRkZWRWaWV3SW5qZWN0b3I7XG4gIH1cbiAgcmVzZXRQcmVPcmRlckhvb2tGbGFncyhsVmlldyk7XG4gIG5nRGV2TW9kZSAmJiB0Vmlldy5kZWNsVE5vZGUgJiYgcGFyZW50TFZpZXcgJiYgYXNzZXJ0VE5vZGVGb3JMVmlldyh0Vmlldy5kZWNsVE5vZGUsIHBhcmVudExWaWV3KTtcbiAgbFZpZXdbUEFSRU5UXSA9IGxWaWV3W0RFQ0xBUkFUSU9OX1ZJRVddID0gcGFyZW50TFZpZXc7XG4gIGxWaWV3W0NPTlRFWFRdID0gY29udGV4dDtcbiAgbFZpZXdbRU5WSVJPTk1FTlRdID0gKGVudmlyb25tZW50IHx8IChwYXJlbnRMVmlldyAmJiBwYXJlbnRMVmlld1tFTlZJUk9OTUVOVF0pKSE7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGxWaWV3W0VOVklST05NRU5UXSwgJ0xWaWV3RW52aXJvbm1lbnQgaXMgcmVxdWlyZWQnKTtcbiAgbFZpZXdbUkVOREVSRVJdID0gKHJlbmRlcmVyIHx8IChwYXJlbnRMVmlldyAmJiBwYXJlbnRMVmlld1tSRU5ERVJFUl0pKSE7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGxWaWV3W1JFTkRFUkVSXSwgJ1JlbmRlcmVyIGlzIHJlcXVpcmVkJyk7XG4gIGxWaWV3W0lOSkVDVE9SIGFzIGFueV0gPSBpbmplY3RvciB8fCAocGFyZW50TFZpZXcgJiYgcGFyZW50TFZpZXdbSU5KRUNUT1JdKSB8fCBudWxsO1xuICBsVmlld1tUX0hPU1RdID0gdEhvc3ROb2RlO1xuICBsVmlld1tJRF0gPSBnZXRVbmlxdWVMVmlld0lkKCk7XG4gIGxWaWV3W0hZRFJBVElPTl0gPSBoeWRyYXRpb25JbmZvO1xuICBsVmlld1tFTUJFRERFRF9WSUVXX0lOSkVDVE9SIGFzIGFueV0gPSBlbWJlZGRlZFZpZXdJbmplY3RvcjtcblxuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnRFcXVhbChcbiAgICAgIHRWaWV3LnR5cGUgPT0gVFZpZXdUeXBlLkVtYmVkZGVkID8gcGFyZW50TFZpZXcgIT09IG51bGwgOiB0cnVlLFxuICAgICAgdHJ1ZSxcbiAgICAgICdFbWJlZGRlZCB2aWV3cyBtdXN0IGhhdmUgcGFyZW50TFZpZXcnLFxuICAgICk7XG4gIGxWaWV3W0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXSA9XG4gICAgdFZpZXcudHlwZSA9PSBUVmlld1R5cGUuRW1iZWRkZWQgPyBwYXJlbnRMVmlldyFbREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVddIDogbFZpZXc7XG4gIHJldHVybiBsVmlldyBhcyBMVmlldzxUPjtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW5kIHN0b3JlcyB0aGUgVE5vZGUsIGFuZCBob29rcyBpdCB1cCB0byB0aGUgdHJlZS5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgVGhlIGN1cnJlbnQgYFRWaWV3YC5cbiAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggYXQgd2hpY2ggdGhlIFROb2RlIHNob3VsZCBiZSBzYXZlZCAobnVsbCBpZiB2aWV3LCBzaW5jZSB0aGV5IGFyZSBub3RcbiAqIHNhdmVkKS5cbiAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIFROb2RlIHRvIGNyZWF0ZVxuICogQHBhcmFtIG5hdGl2ZSBUaGUgbmF0aXZlIGVsZW1lbnQgZm9yIHRoaXMgbm9kZSwgaWYgYXBwbGljYWJsZVxuICogQHBhcmFtIG5hbWUgVGhlIHRhZyBuYW1lIG9mIHRoZSBhc3NvY2lhdGVkIG5hdGl2ZSBlbGVtZW50LCBpZiBhcHBsaWNhYmxlXG4gKiBAcGFyYW0gYXR0cnMgQW55IGF0dHJzIGZvciB0aGUgbmF0aXZlIGVsZW1lbnQsIGlmIGFwcGxpY2FibGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlVE5vZGUoXG4gIHRWaWV3OiBUVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbiAgdHlwZTogVE5vZGVUeXBlLkVsZW1lbnQgfCBUTm9kZVR5cGUuVGV4dCxcbiAgbmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCxcbik6IFRFbGVtZW50Tm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRPckNyZWF0ZVROb2RlKFxuICB0VmlldzogVFZpZXcsXG4gIGluZGV4OiBudW1iZXIsXG4gIHR5cGU6IFROb2RlVHlwZS5Db250YWluZXIsXG4gIG5hbWU6IHN0cmluZyB8IG51bGwsXG4gIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsXG4pOiBUQ29udGFpbmVyTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRPckNyZWF0ZVROb2RlKFxuICB0VmlldzogVFZpZXcsXG4gIGluZGV4OiBudW1iZXIsXG4gIHR5cGU6IFROb2RlVHlwZS5Qcm9qZWN0aW9uLFxuICBuYW1lOiBudWxsLFxuICBhdHRyczogVEF0dHJpYnV0ZXMgfCBudWxsLFxuKTogVFByb2plY3Rpb25Ob2RlO1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlVE5vZGUoXG4gIHRWaWV3OiBUVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbiAgdHlwZTogVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIsXG4gIG5hbWU6IHN0cmluZyB8IG51bGwsXG4gIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsXG4pOiBURWxlbWVudENvbnRhaW5lck5vZGU7XG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JDcmVhdGVUTm9kZShcbiAgdFZpZXc6IFRWaWV3LFxuICBpbmRleDogbnVtYmVyLFxuICB0eXBlOiBUTm9kZVR5cGUuSWN1LFxuICBuYW1lOiBudWxsLFxuICBhdHRyczogVEF0dHJpYnV0ZXMgfCBudWxsLFxuKTogVEVsZW1lbnRDb250YWluZXJOb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlVE5vZGUoXG4gIHRWaWV3OiBUVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbiAgdHlwZTogVE5vZGVUeXBlLFxuICBuYW1lOiBzdHJpbmcgfCBudWxsLFxuICBhdHRyczogVEF0dHJpYnV0ZXMgfCBudWxsLFxuKTogVEVsZW1lbnROb2RlICYgVENvbnRhaW5lck5vZGUgJiBURWxlbWVudENvbnRhaW5lck5vZGUgJiBUUHJvamVjdGlvbk5vZGUgJiBUSWN1Q29udGFpbmVyTm9kZSB7XG4gIG5nRGV2TW9kZSAmJlxuICAgIGluZGV4ICE9PSAwICYmIC8vIDAgYXJlIGJvZ3VzIG5vZGVzIGFuZCB0aGV5IGFyZSBPSy4gU2VlIGBjcmVhdGVDb250YWluZXJSZWZgIGluXG4gICAgLy8gYHZpZXdfZW5naW5lX2NvbXBhdGliaWxpdHlgIGZvciBhZGRpdGlvbmFsIGNvbnRleHQuXG4gICAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsKGluZGV4LCBIRUFERVJfT0ZGU0VULCBcIlROb2RlcyBjYW4ndCBiZSBpbiB0aGUgTFZpZXcgaGVhZGVyLlwiKTtcbiAgLy8gS2VlcCB0aGlzIGZ1bmN0aW9uIHNob3J0LCBzbyB0aGF0IHRoZSBWTSB3aWxsIGlubGluZSBpdC5cbiAgbmdEZXZNb2RlICYmIGFzc2VydFB1cmVUTm9kZVR5cGUodHlwZSk7XG4gIGxldCB0Tm9kZSA9IHRWaWV3LmRhdGFbaW5kZXhdIGFzIFROb2RlO1xuICBpZiAodE5vZGUgPT09IG51bGwpIHtcbiAgICB0Tm9kZSA9IGNyZWF0ZVROb2RlQXRJbmRleCh0VmlldywgaW5kZXgsIHR5cGUsIG5hbWUsIGF0dHJzKTtcbiAgICBpZiAoaXNJbkkxOG5CbG9jaygpKSB7XG4gICAgICAvLyBJZiB3ZSBhcmUgaW4gaTE4biBibG9jayB0aGVuIGFsbCBlbGVtZW50cyBzaG91bGQgYmUgcHJlIGRlY2xhcmVkIHRocm91Z2ggYFBsYWNlaG9sZGVyYFxuICAgICAgLy8gU2VlIGBUTm9kZVR5cGUuUGxhY2Vob2xkZXJgIGFuZCBgTEZyYW1lLmluSTE4bmAgZm9yIG1vcmUgY29udGV4dC5cbiAgICAgIC8vIElmIHRoZSBgVE5vZGVgIHdhcyBub3QgcHJlLWRlY2xhcmVkIHRoYW4gaXQgbWVhbnMgaXQgd2FzIG5vdCBtZW50aW9uZWQgd2hpY2ggbWVhbnMgaXQgd2FzXG4gICAgICAvLyByZW1vdmVkLCBzbyB3ZSBtYXJrIGl0IGFzIGRldGFjaGVkLlxuICAgICAgdE5vZGUuZmxhZ3MgfD0gVE5vZGVGbGFncy5pc0RldGFjaGVkO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLlBsYWNlaG9sZGVyKSB7XG4gICAgdE5vZGUudHlwZSA9IHR5cGU7XG4gICAgdE5vZGUudmFsdWUgPSBuYW1lO1xuICAgIHROb2RlLmF0dHJzID0gYXR0cnM7XG4gICAgY29uc3QgcGFyZW50ID0gZ2V0Q3VycmVudFBhcmVudFROb2RlKCk7XG4gICAgdE5vZGUuaW5qZWN0b3JJbmRleCA9IHBhcmVudCA9PT0gbnVsbCA/IC0xIDogcGFyZW50LmluamVjdG9ySW5kZXg7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydFROb2RlRm9yVFZpZXcodE5vZGUsIHRWaWV3KTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RXF1YWwoaW5kZXgsIHROb2RlLmluZGV4LCAnRXhwZWN0aW5nIHNhbWUgaW5kZXgnKTtcbiAgfVxuICBzZXRDdXJyZW50VE5vZGUodE5vZGUsIHRydWUpO1xuICByZXR1cm4gdE5vZGUgYXMgVEVsZW1lbnROb2RlICZcbiAgICBUQ29udGFpbmVyTm9kZSAmXG4gICAgVEVsZW1lbnRDb250YWluZXJOb2RlICZcbiAgICBUUHJvamVjdGlvbk5vZGUgJlxuICAgIFRJY3VDb250YWluZXJOb2RlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVE5vZGVBdEluZGV4KFxuICB0VmlldzogVFZpZXcsXG4gIGluZGV4OiBudW1iZXIsXG4gIHR5cGU6IFROb2RlVHlwZSxcbiAgbmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCxcbikge1xuICBjb25zdCBjdXJyZW50VE5vZGUgPSBnZXRDdXJyZW50VE5vZGVQbGFjZWhvbGRlck9rKCk7XG4gIGNvbnN0IGlzUGFyZW50ID0gaXNDdXJyZW50VE5vZGVQYXJlbnQoKTtcbiAgY29uc3QgcGFyZW50ID0gaXNQYXJlbnQgPyBjdXJyZW50VE5vZGUgOiBjdXJyZW50VE5vZGUgJiYgY3VycmVudFROb2RlLnBhcmVudDtcbiAgLy8gUGFyZW50cyBjYW5ub3QgY3Jvc3MgY29tcG9uZW50IGJvdW5kYXJpZXMgYmVjYXVzZSBjb21wb25lbnRzIHdpbGwgYmUgdXNlZCBpbiBtdWx0aXBsZSBwbGFjZXMuXG4gIGNvbnN0IHROb2RlID0gKHRWaWV3LmRhdGFbaW5kZXhdID0gY3JlYXRlVE5vZGUoXG4gICAgdFZpZXcsXG4gICAgcGFyZW50IGFzIFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlLFxuICAgIHR5cGUsXG4gICAgaW5kZXgsXG4gICAgbmFtZSxcbiAgICBhdHRycyxcbiAgKSk7XG4gIC8vIEFzc2lnbiBhIHBvaW50ZXIgdG8gdGhlIGZpcnN0IGNoaWxkIG5vZGUgb2YgYSBnaXZlbiB2aWV3LiBUaGUgZmlyc3Qgbm9kZSBpcyBub3QgYWx3YXlzIHRoZSBvbmVcbiAgLy8gYXQgaW5kZXggMCwgaW4gY2FzZSBvZiBpMThuLCBpbmRleCAwIGNhbiBiZSB0aGUgaW5zdHJ1Y3Rpb24gYGkxOG5TdGFydGAgYW5kIHRoZSBmaXJzdCBub2RlIGhhc1xuICAvLyB0aGUgaW5kZXggMSBvciBtb3JlLCBzbyB3ZSBjYW4ndCBqdXN0IGNoZWNrIG5vZGUgaW5kZXguXG4gIGlmICh0Vmlldy5maXJzdENoaWxkID09PSBudWxsKSB7XG4gICAgdFZpZXcuZmlyc3RDaGlsZCA9IHROb2RlO1xuICB9XG4gIGlmIChjdXJyZW50VE5vZGUgIT09IG51bGwpIHtcbiAgICBpZiAoaXNQYXJlbnQpIHtcbiAgICAgIC8vIEZJWE1FKG1pc2tvKTogVGhpcyBsb2dpYyBsb29rcyB1bm5lY2Vzc2FyaWx5IGNvbXBsaWNhdGVkLiBDb3VsZCB3ZSBzaW1wbGlmeT9cbiAgICAgIGlmIChjdXJyZW50VE5vZGUuY2hpbGQgPT0gbnVsbCAmJiB0Tm9kZS5wYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgLy8gV2UgYXJlIGluIHRoZSBzYW1lIHZpZXcsIHdoaWNoIG1lYW5zIHdlIGFyZSBhZGRpbmcgY29udGVudCBub2RlIHRvIHRoZSBwYXJlbnQgdmlldy5cbiAgICAgICAgY3VycmVudFROb2RlLmNoaWxkID0gdE5vZGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjdXJyZW50VE5vZGUubmV4dCA9PT0gbnVsbCkge1xuICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiBpMThuIHRoZSBgY3VycmVudFROb2RlYCBtYXkgYWxyZWFkeSBiZSBsaW5rZWQsIGluIHdoaWNoIGNhc2Ugd2UgZG9uJ3Qgd2FudFxuICAgICAgICAvLyB0byBicmVhayB0aGUgbGlua3Mgd2hpY2ggaTE4biBjcmVhdGVkLlxuICAgICAgICBjdXJyZW50VE5vZGUubmV4dCA9IHROb2RlO1xuICAgICAgICB0Tm9kZS5wcmV2ID0gY3VycmVudFROb2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdE5vZGU7XG59XG5cbi8qKlxuICogV2hlbiBlbGVtZW50cyBhcmUgY3JlYXRlZCBkeW5hbWljYWxseSBhZnRlciBhIHZpZXcgYmx1ZXByaW50IGlzIGNyZWF0ZWQgKGUuZy4gdGhyb3VnaFxuICogaTE4bkFwcGx5KCkpLCB3ZSBuZWVkIHRvIGFkanVzdCB0aGUgYmx1ZXByaW50IGZvciBmdXR1cmVcbiAqIHRlbXBsYXRlIHBhc3Nlcy5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgYFRWaWV3YCBhc3NvY2lhdGVkIHdpdGggYExWaWV3YFxuICogQHBhcmFtIGxWaWV3IFRoZSBgTFZpZXdgIGNvbnRhaW5pbmcgdGhlIGJsdWVwcmludCB0byBhZGp1c3RcbiAqIEBwYXJhbSBudW1TbG90c1RvQWxsb2MgVGhlIG51bWJlciBvZiBzbG90cyB0byBhbGxvYyBpbiB0aGUgTFZpZXcsIHNob3VsZCBiZSA+MFxuICogQHBhcmFtIGluaXRpYWxWYWx1ZSBJbml0aWFsIHZhbHVlIHRvIHN0b3JlIGluIGJsdWVwcmludFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsb2NFeHBhbmRvKFxuICB0VmlldzogVFZpZXcsXG4gIGxWaWV3OiBMVmlldyxcbiAgbnVtU2xvdHNUb0FsbG9jOiBudW1iZXIsXG4gIGluaXRpYWxWYWx1ZTogYW55LFxuKTogbnVtYmVyIHtcbiAgaWYgKG51bVNsb3RzVG9BbGxvYyA9PT0gMCkgcmV0dXJuIC0xO1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgYXNzZXJ0Rmlyc3RDcmVhdGVQYXNzKHRWaWV3KTtcbiAgICBhc3NlcnRTYW1lKHRWaWV3LCBsVmlld1tUVklFV10sICdgTFZpZXdgIG11c3QgYmUgYXNzb2NpYXRlZCB3aXRoIGBUVmlld2AhJyk7XG4gICAgYXNzZXJ0RXF1YWwodFZpZXcuZGF0YS5sZW5ndGgsIGxWaWV3Lmxlbmd0aCwgJ0V4cGVjdGluZyBMVmlldyB0byBiZSBzYW1lIHNpemUgYXMgVFZpZXcnKTtcbiAgICBhc3NlcnRFcXVhbChcbiAgICAgIHRWaWV3LmRhdGEubGVuZ3RoLFxuICAgICAgdFZpZXcuYmx1ZXByaW50Lmxlbmd0aCxcbiAgICAgICdFeHBlY3RpbmcgQmx1ZXByaW50IHRvIGJlIHNhbWUgc2l6ZSBhcyBUVmlldycsXG4gICAgKTtcbiAgICBhc3NlcnRGaXJzdFVwZGF0ZVBhc3ModFZpZXcpO1xuICB9XG4gIGNvbnN0IGFsbG9jSWR4ID0gbFZpZXcubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVNsb3RzVG9BbGxvYzsgaSsrKSB7XG4gICAgbFZpZXcucHVzaChpbml0aWFsVmFsdWUpO1xuICAgIHRWaWV3LmJsdWVwcmludC5wdXNoKGluaXRpYWxWYWx1ZSk7XG4gICAgdFZpZXcuZGF0YS5wdXNoKG51bGwpO1xuICB9XG4gIHJldHVybiBhbGxvY0lkeDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVUZW1wbGF0ZTxUPihcbiAgdFZpZXc6IFRWaWV3LFxuICBsVmlldzogTFZpZXc8VD4sXG4gIHRlbXBsYXRlRm46IENvbXBvbmVudFRlbXBsYXRlPFQ+LFxuICByZjogUmVuZGVyRmxhZ3MsXG4gIGNvbnRleHQ6IFQsXG4pIHtcbiAgY29uc3QgcHJldlNlbGVjdGVkSW5kZXggPSBnZXRTZWxlY3RlZEluZGV4KCk7XG4gIGNvbnN0IGlzVXBkYXRlUGhhc2UgPSByZiAmIFJlbmRlckZsYWdzLlVwZGF0ZTtcbiAgdHJ5IHtcbiAgICBzZXRTZWxlY3RlZEluZGV4KC0xKTtcbiAgICBpZiAoaXNVcGRhdGVQaGFzZSAmJiBsVmlldy5sZW5ndGggPiBIRUFERVJfT0ZGU0VUKSB7XG4gICAgICAvLyBXaGVuIHdlJ3JlIHVwZGF0aW5nLCBpbmhlcmVudGx5IHNlbGVjdCAwIHNvIHdlIGRvbid0XG4gICAgICAvLyBoYXZlIHRvIGdlbmVyYXRlIHRoYXQgaW5zdHJ1Y3Rpb24gZm9yIG1vc3QgdXBkYXRlIGJsb2Nrcy5cbiAgICAgIHNlbGVjdEluZGV4SW50ZXJuYWwodFZpZXcsIGxWaWV3LCBIRUFERVJfT0ZGU0VULCAhIW5nRGV2TW9kZSAmJiBpc0luQ2hlY2tOb0NoYW5nZXNNb2RlKCkpO1xuICAgIH1cblxuICAgIGNvbnN0IHByZUhvb2tUeXBlID0gaXNVcGRhdGVQaGFzZVxuICAgICAgPyBQcm9maWxlckV2ZW50LlRlbXBsYXRlVXBkYXRlU3RhcnRcbiAgICAgIDogUHJvZmlsZXJFdmVudC5UZW1wbGF0ZUNyZWF0ZVN0YXJ0O1xuICAgIHByb2ZpbGVyKHByZUhvb2tUeXBlLCBjb250ZXh0IGFzIHVua25vd24gYXMge30pO1xuICAgIHRlbXBsYXRlRm4ocmYsIGNvbnRleHQpO1xuICB9IGZpbmFsbHkge1xuICAgIHNldFNlbGVjdGVkSW5kZXgocHJldlNlbGVjdGVkSW5kZXgpO1xuXG4gICAgY29uc3QgcG9zdEhvb2tUeXBlID0gaXNVcGRhdGVQaGFzZVxuICAgICAgPyBQcm9maWxlckV2ZW50LlRlbXBsYXRlVXBkYXRlRW5kXG4gICAgICA6IFByb2ZpbGVyRXZlbnQuVGVtcGxhdGVDcmVhdGVFbmQ7XG4gICAgcHJvZmlsZXIocG9zdEhvb2tUeXBlLCBjb250ZXh0IGFzIHVua25vd24gYXMge30pO1xuICB9XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vIEVsZW1lbnRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlQ29udGVudFF1ZXJpZXModFZpZXc6IFRWaWV3LCB0Tm9kZTogVE5vZGUsIGxWaWV3OiBMVmlldykge1xuICBpZiAoaXNDb250ZW50UXVlcnlIb3N0KHROb2RlKSkge1xuICAgIGNvbnN0IHByZXZDb25zdW1lciA9IHNldEFjdGl2ZUNvbnN1bWVyKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdGFydCA9IHROb2RlLmRpcmVjdGl2ZVN0YXJ0O1xuICAgICAgY29uc3QgZW5kID0gdE5vZGUuZGlyZWN0aXZlRW5kO1xuICAgICAgZm9yIChsZXQgZGlyZWN0aXZlSW5kZXggPSBzdGFydDsgZGlyZWN0aXZlSW5kZXggPCBlbmQ7IGRpcmVjdGl2ZUluZGV4KyspIHtcbiAgICAgICAgY29uc3QgZGVmID0gdFZpZXcuZGF0YVtkaXJlY3RpdmVJbmRleF0gYXMgRGlyZWN0aXZlRGVmPGFueT47XG4gICAgICAgIGlmIChkZWYuY29udGVudFF1ZXJpZXMpIHtcbiAgICAgICAgICBjb25zdCBkaXJlY3RpdmVJbnN0YW5jZSA9IGxWaWV3W2RpcmVjdGl2ZUluZGV4XTtcbiAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgIGFzc2VydERlZmluZWQoXG4gICAgICAgICAgICAgIGRpcmVjdGl2ZUluZGV4LFxuICAgICAgICAgICAgICAnSW5jb3JyZWN0IHJlZmVyZW5jZSB0byBhIGRpcmVjdGl2ZSBkZWZpbmluZyBhIGNvbnRlbnQgcXVlcnknLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICBkZWYuY29udGVudFF1ZXJpZXMoUmVuZGVyRmxhZ3MuQ3JlYXRlLCBkaXJlY3RpdmVJbnN0YW5jZSwgZGlyZWN0aXZlSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBkaXJlY3RpdmUgaW5zdGFuY2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGlyZWN0aXZlc0luc3RhbmNlcyh0VmlldzogVFZpZXcsIGxWaWV3OiBMVmlldywgdE5vZGU6IFREaXJlY3RpdmVIb3N0Tm9kZSkge1xuICBpZiAoIWdldEJpbmRpbmdzRW5hYmxlZCgpKSByZXR1cm47XG4gIGluc3RhbnRpYXRlQWxsRGlyZWN0aXZlcyh0VmlldywgbFZpZXcsIHROb2RlLCBnZXROYXRpdmVCeVROb2RlKHROb2RlLCBsVmlldykpO1xuICBpZiAoKHROb2RlLmZsYWdzICYgVE5vZGVGbGFncy5oYXNIb3N0QmluZGluZ3MpID09PSBUTm9kZUZsYWdzLmhhc0hvc3RCaW5kaW5ncykge1xuICAgIGludm9rZURpcmVjdGl2ZXNIb3N0QmluZGluZ3ModFZpZXcsIGxWaWV3LCB0Tm9kZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyBhIGxpc3Qgb2YgbG9jYWwgbmFtZXMgYW5kIGluZGljZXMgYW5kIHB1c2hlcyB0aGUgcmVzb2x2ZWQgbG9jYWwgdmFyaWFibGUgdmFsdWVzXG4gKiB0byBMVmlldyBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IGFyZSBsb2FkZWQgaW4gdGhlIHRlbXBsYXRlIHdpdGggbG9hZCgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2F2ZVJlc29sdmVkTG9jYWxzSW5EYXRhKFxuICB2aWV3RGF0YTogTFZpZXcsXG4gIHROb2RlOiBURGlyZWN0aXZlSG9zdE5vZGUsXG4gIGxvY2FsUmVmRXh0cmFjdG9yOiBMb2NhbFJlZkV4dHJhY3RvciA9IGdldE5hdGl2ZUJ5VE5vZGUsXG4pOiB2b2lkIHtcbiAgY29uc3QgbG9jYWxOYW1lcyA9IHROb2RlLmxvY2FsTmFtZXM7XG4gIGlmIChsb2NhbE5hbWVzICE9PSBudWxsKSB7XG4gICAgbGV0IGxvY2FsSW5kZXggPSB0Tm9kZS5pbmRleCArIDE7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbE5hbWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBjb25zdCBpbmRleCA9IGxvY2FsTmFtZXNbaSArIDFdIGFzIG51bWJlcjtcbiAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgaW5kZXggPT09IC0xXG4gICAgICAgICAgPyBsb2NhbFJlZkV4dHJhY3RvcihcbiAgICAgICAgICAgICAgdE5vZGUgYXMgVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gICAgICAgICAgICAgIHZpZXdEYXRhLFxuICAgICAgICAgICAgKVxuICAgICAgICAgIDogdmlld0RhdGFbaW5kZXhdO1xuICAgICAgdmlld0RhdGFbbG9jYWxJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEdldHMgVFZpZXcgZnJvbSBhIHRlbXBsYXRlIGZ1bmN0aW9uIG9yIGNyZWF0ZXMgYSBuZXcgVFZpZXdcbiAqIGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBleGlzdC5cbiAqXG4gKiBAcGFyYW0gZGVmIENvbXBvbmVudERlZlxuICogQHJldHVybnMgVFZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlQ29tcG9uZW50VFZpZXcoZGVmOiBDb21wb25lbnREZWY8YW55Pik6IFRWaWV3IHtcbiAgY29uc3QgdFZpZXcgPSBkZWYudFZpZXc7XG5cbiAgLy8gQ3JlYXRlIGEgVFZpZXcgaWYgdGhlcmUgaXNuJ3Qgb25lLCBvciByZWNyZWF0ZSBpdCBpZiB0aGUgZmlyc3QgY3JlYXRlIHBhc3MgZGlkbid0XG4gIC8vIGNvbXBsZXRlIHN1Y2Nlc3NmdWxseSBzaW5jZSB3ZSBjYW4ndCBrbm93IGZvciBzdXJlIHdoZXRoZXIgaXQncyBpbiBhIHVzYWJsZSBzaGFwZS5cbiAgaWYgKHRWaWV3ID09PSBudWxsIHx8IHRWaWV3LmluY29tcGxldGVGaXJzdFBhc3MpIHtcbiAgICAvLyBEZWNsYXJhdGlvbiBub2RlIGhlcmUgaXMgbnVsbCBzaW5jZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIHdlIGR5bmFtaWNhbGx5IGNyZWF0ZSBhXG4gICAgLy8gY29tcG9uZW50IGFuZCBoZW5jZSB0aGVyZSBpcyBubyBkZWNsYXJhdGlvbi5cbiAgICBjb25zdCBkZWNsVE5vZGUgPSBudWxsO1xuICAgIHJldHVybiAoZGVmLnRWaWV3ID0gY3JlYXRlVFZpZXcoXG4gICAgICBUVmlld1R5cGUuQ29tcG9uZW50LFxuICAgICAgZGVjbFROb2RlLFxuICAgICAgZGVmLnRlbXBsYXRlLFxuICAgICAgZGVmLmRlY2xzLFxuICAgICAgZGVmLnZhcnMsXG4gICAgICBkZWYuZGlyZWN0aXZlRGVmcyxcbiAgICAgIGRlZi5waXBlRGVmcyxcbiAgICAgIGRlZi52aWV3UXVlcnksXG4gICAgICBkZWYuc2NoZW1hcyxcbiAgICAgIGRlZi5jb25zdHMsXG4gICAgICBkZWYuaWQsXG4gICAgKSk7XG4gIH1cblxuICByZXR1cm4gdFZpZXc7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIFRWaWV3IGluc3RhbmNlXG4gKlxuICogQHBhcmFtIHR5cGUgVHlwZSBvZiBgVFZpZXdgLlxuICogQHBhcmFtIGRlY2xUTm9kZSBEZWNsYXJhdGlvbiBsb2NhdGlvbiBvZiB0aGlzIGBUVmlld2AuXG4gKiBAcGFyYW0gdGVtcGxhdGVGbiBUZW1wbGF0ZSBmdW5jdGlvblxuICogQHBhcmFtIGRlY2xzIFRoZSBudW1iZXIgb2Ygbm9kZXMsIGxvY2FsIHJlZnMsIGFuZCBwaXBlcyBpbiB0aGlzIHRlbXBsYXRlXG4gKiBAcGFyYW0gZGlyZWN0aXZlcyBSZWdpc3RyeSBvZiBkaXJlY3RpdmVzIGZvciB0aGlzIHZpZXdcbiAqIEBwYXJhbSBwaXBlcyBSZWdpc3RyeSBvZiBwaXBlcyBmb3IgdGhpcyB2aWV3XG4gKiBAcGFyYW0gdmlld1F1ZXJ5IFZpZXcgcXVlcmllcyBmb3IgdGhpcyB2aWV3XG4gKiBAcGFyYW0gc2NoZW1hcyBTY2hlbWFzIGZvciB0aGlzIHZpZXdcbiAqIEBwYXJhbSBjb25zdHMgQ29uc3RhbnRzIGZvciB0aGlzIHZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRWaWV3KFxuICB0eXBlOiBUVmlld1R5cGUsXG4gIGRlY2xUTm9kZTogVE5vZGUgfCBudWxsLFxuICB0ZW1wbGF0ZUZuOiBDb21wb25lbnRUZW1wbGF0ZTxhbnk+IHwgbnVsbCxcbiAgZGVjbHM6IG51bWJlcixcbiAgdmFyczogbnVtYmVyLFxuICBkaXJlY3RpdmVzOiBEaXJlY3RpdmVEZWZMaXN0T3JGYWN0b3J5IHwgbnVsbCxcbiAgcGlwZXM6IFBpcGVEZWZMaXN0T3JGYWN0b3J5IHwgbnVsbCxcbiAgdmlld1F1ZXJ5OiBWaWV3UXVlcmllc0Z1bmN0aW9uPGFueT4gfCBudWxsLFxuICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdIHwgbnVsbCxcbiAgY29uc3RzT3JGYWN0b3J5OiBUQ29uc3RhbnRzT3JGYWN0b3J5IHwgbnVsbCxcbiAgc3NySWQ6IHN0cmluZyB8IG51bGwsXG4pOiBUVmlldyB7XG4gIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUudFZpZXcrKztcbiAgY29uc3QgYmluZGluZ1N0YXJ0SW5kZXggPSBIRUFERVJfT0ZGU0VUICsgZGVjbHM7XG4gIC8vIFRoaXMgbGVuZ3RoIGRvZXMgbm90IHlldCBjb250YWluIGhvc3QgYmluZGluZ3MgZnJvbSBjaGlsZCBkaXJlY3RpdmVzIGJlY2F1c2UgYXQgdGhpcyBwb2ludCxcbiAgLy8gd2UgZG9uJ3Qga25vdyB3aGljaCBkaXJlY3RpdmVzIGFyZSBhY3RpdmUgb24gdGhpcyB0ZW1wbGF0ZS4gQXMgc29vbiBhcyBhIGRpcmVjdGl2ZSBpcyBtYXRjaGVkXG4gIC8vIHRoYXQgaGFzIGEgaG9zdCBiaW5kaW5nLCB3ZSB3aWxsIHVwZGF0ZSB0aGUgYmx1ZXByaW50IHdpdGggdGhhdCBkZWYncyBob3N0VmFycyBjb3VudC5cbiAgY29uc3QgaW5pdGlhbFZpZXdMZW5ndGggPSBiaW5kaW5nU3RhcnRJbmRleCArIHZhcnM7XG4gIGNvbnN0IGJsdWVwcmludCA9IGNyZWF0ZVZpZXdCbHVlcHJpbnQoYmluZGluZ1N0YXJ0SW5kZXgsIGluaXRpYWxWaWV3TGVuZ3RoKTtcbiAgY29uc3QgY29uc3RzID0gdHlwZW9mIGNvbnN0c09yRmFjdG9yeSA9PT0gJ2Z1bmN0aW9uJyA/IGNvbnN0c09yRmFjdG9yeSgpIDogY29uc3RzT3JGYWN0b3J5O1xuICBjb25zdCB0VmlldyA9IChibHVlcHJpbnRbVFZJRVcgYXMgYW55XSA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGJsdWVwcmludDogYmx1ZXByaW50LFxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZUZuLFxuICAgIHF1ZXJpZXM6IG51bGwsXG4gICAgdmlld1F1ZXJ5OiB2aWV3UXVlcnksXG4gICAgZGVjbFROb2RlOiBkZWNsVE5vZGUsXG4gICAgZGF0YTogYmx1ZXByaW50LnNsaWNlKCkuZmlsbChudWxsLCBiaW5kaW5nU3RhcnRJbmRleCksXG4gICAgYmluZGluZ1N0YXJ0SW5kZXg6IGJpbmRpbmdTdGFydEluZGV4LFxuICAgIGV4cGFuZG9TdGFydEluZGV4OiBpbml0aWFsVmlld0xlbmd0aCxcbiAgICBob3N0QmluZGluZ09wQ29kZXM6IG51bGwsXG4gICAgZmlyc3RDcmVhdGVQYXNzOiB0cnVlLFxuICAgIGZpcnN0VXBkYXRlUGFzczogdHJ1ZSxcbiAgICBzdGF0aWNWaWV3UXVlcmllczogZmFsc2UsXG4gICAgc3RhdGljQ29udGVudFF1ZXJpZXM6IGZhbHNlLFxuICAgIHByZU9yZGVySG9va3M6IG51bGwsXG4gICAgcHJlT3JkZXJDaGVja0hvb2tzOiBudWxsLFxuICAgIGNvbnRlbnRIb29rczogbnVsbCxcbiAgICBjb250ZW50Q2hlY2tIb29rczogbnVsbCxcbiAgICB2aWV3SG9va3M6IG51bGwsXG4gICAgdmlld0NoZWNrSG9va3M6IG51bGwsXG4gICAgZGVzdHJveUhvb2tzOiBudWxsLFxuICAgIGNsZWFudXA6IG51bGwsXG4gICAgY29udGVudFF1ZXJpZXM6IG51bGwsXG4gICAgY29tcG9uZW50czogbnVsbCxcbiAgICBkaXJlY3RpdmVSZWdpc3RyeTogdHlwZW9mIGRpcmVjdGl2ZXMgPT09ICdmdW5jdGlvbicgPyBkaXJlY3RpdmVzKCkgOiBkaXJlY3RpdmVzLFxuICAgIHBpcGVSZWdpc3RyeTogdHlwZW9mIHBpcGVzID09PSAnZnVuY3Rpb24nID8gcGlwZXMoKSA6IHBpcGVzLFxuICAgIGZpcnN0Q2hpbGQ6IG51bGwsXG4gICAgc2NoZW1hczogc2NoZW1hcyxcbiAgICBjb25zdHM6IGNvbnN0cyxcbiAgICBpbmNvbXBsZXRlRmlyc3RQYXNzOiBmYWxzZSxcbiAgICBzc3JJZCxcbiAgfSk7XG4gIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAvLyBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucyBpdCBpcyBpbXBvcnRhbnQgdGhhdCB0aGUgdFZpZXcgcmV0YWlucyB0aGUgc2FtZSBzaGFwZSBkdXJpbmcgcnVudGltZS5cbiAgICAvLyAoVG8gbWFrZSBzdXJlIHRoYXQgYWxsIG9mIHRoZSBjb2RlIGlzIG1vbm9tb3JwaGljLikgRm9yIHRoaXMgcmVhc29uIHdlIHNlYWwgdGhlIG9iamVjdCB0b1xuICAgIC8vIHByZXZlbnQgY2xhc3MgdHJhbnNpdGlvbnMuXG4gICAgT2JqZWN0LnNlYWwodFZpZXcpO1xuICB9XG4gIHJldHVybiB0Vmlldztcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld0JsdWVwcmludChiaW5kaW5nU3RhcnRJbmRleDogbnVtYmVyLCBpbml0aWFsVmlld0xlbmd0aDogbnVtYmVyKTogTFZpZXcge1xuICBjb25zdCBibHVlcHJpbnQgPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGluaXRpYWxWaWV3TGVuZ3RoOyBpKyspIHtcbiAgICBibHVlcHJpbnQucHVzaChpIDwgYmluZGluZ1N0YXJ0SW5kZXggPyBudWxsIDogTk9fQ0hBTkdFKTtcbiAgfVxuXG4gIHJldHVybiBibHVlcHJpbnQgYXMgTFZpZXc7XG59XG5cbi8qKlxuICogTG9jYXRlcyB0aGUgaG9zdCBuYXRpdmUgZWxlbWVudCwgdXNlZCBmb3IgYm9vdHN0cmFwcGluZyBleGlzdGluZyBub2RlcyBpbnRvIHJlbmRlcmluZyBwaXBlbGluZS5cbiAqXG4gKiBAcGFyYW0gcmVuZGVyZXIgdGhlIHJlbmRlcmVyIHVzZWQgdG8gbG9jYXRlIHRoZSBlbGVtZW50LlxuICogQHBhcmFtIGVsZW1lbnRPclNlbGVjdG9yIFJlbmRlciBlbGVtZW50IG9yIENTUyBzZWxlY3RvciB0byBsb2NhdGUgdGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0gZW5jYXBzdWxhdGlvbiBWaWV3IEVuY2Fwc3VsYXRpb24gZGVmaW5lZCBmb3IgY29tcG9uZW50IHRoYXQgcmVxdWVzdHMgaG9zdCBlbGVtZW50LlxuICogQHBhcmFtIGluamVjdG9yIFJvb3QgdmlldyBpbmplY3RvciBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2F0ZUhvc3RFbGVtZW50KFxuICByZW5kZXJlcjogUmVuZGVyZXIsXG4gIGVsZW1lbnRPclNlbGVjdG9yOiBSRWxlbWVudCB8IHN0cmluZyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24sXG4gIGluamVjdG9yOiBJbmplY3Rvcixcbik6IFJFbGVtZW50IHtcbiAgLy8gTm90ZTogd2UgdXNlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBgUFJFU0VSVkVfSE9TVF9DT05URU5UYCBoZXJlIGV2ZW4gdGhvdWdoIGl0J3MgYVxuICAvLyB0cmVlLXNoYWthYmxlIG9uZSAocHJvdmlkZWRJbjoncm9vdCcpLiBUaGlzIGNvZGUgcGF0aCBjYW4gYmUgdHJpZ2dlcmVkIGR1cmluZyBkeW5hbWljXG4gIC8vIGNvbXBvbmVudCBjcmVhdGlvbiAoYWZ0ZXIgY2FsbGluZyBWaWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCkgd2hlbiBhbiBpbmplY3RvclxuICAvLyBpbnN0YW5jZSBjYW4gYmUgcHJvdmlkZWQuIFRoZSBpbmplY3RvciBpbnN0YW5jZSBtaWdodCBiZSBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgbWFpbiBESVxuICAvLyB0cmVlLCB0aHVzIHRoZSBgUFJFU0VSVkVfSE9TVF9DT05URU5UYCB3b3VsZCBub3QgYmUgYWJsZSB0byBpbnN0YW50aWF0ZS4gSW4gdGhpcyBjYXNlLCB0aGVcbiAgLy8gZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQuXG4gIGNvbnN0IHByZXNlcnZlSG9zdENvbnRlbnQgPSBpbmplY3Rvci5nZXQoUFJFU0VSVkVfSE9TVF9DT05URU5ULCBQUkVTRVJWRV9IT1NUX0NPTlRFTlRfREVGQVVMVCk7XG5cbiAgLy8gV2hlbiB1c2luZyBuYXRpdmUgU2hhZG93IERPTSwgZG8gbm90IGNsZWFyIGhvc3QgZWxlbWVudCB0byBhbGxvdyBuYXRpdmUgc2xvdFxuICAvLyBwcm9qZWN0aW9uLlxuICBjb25zdCBwcmVzZXJ2ZUNvbnRlbnQgPSBwcmVzZXJ2ZUhvc3RDb250ZW50IHx8IGVuY2Fwc3VsYXRpb24gPT09IFZpZXdFbmNhcHN1bGF0aW9uLlNoYWRvd0RvbTtcbiAgY29uc3Qgcm9vdEVsZW1lbnQgPSByZW5kZXJlci5zZWxlY3RSb290RWxlbWVudChlbGVtZW50T3JTZWxlY3RvciwgcHJlc2VydmVDb250ZW50KTtcbiAgYXBwbHlSb290RWxlbWVudFRyYW5zZm9ybShyb290RWxlbWVudCBhcyBIVE1MRWxlbWVudCk7XG4gIHJldHVybiByb290RWxlbWVudDtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGFueSByb290IGVsZW1lbnQgdHJhbnNmb3JtYXRpb25zIHRoYXQgYXJlIG5lZWRlZC4gSWYgaHlkcmF0aW9uIGlzIGVuYWJsZWQsXG4gKiB0aGlzIHdpbGwgcHJvY2VzcyBjb3JydXB0ZWQgdGV4dCBub2Rlcy5cbiAqXG4gKiBAcGFyYW0gcm9vdEVsZW1lbnQgdGhlIGFwcCByb290IEhUTUwgRWxlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlSb290RWxlbWVudFRyYW5zZm9ybShyb290RWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgX2FwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm1JbXBsKHJvb3RFbGVtZW50IGFzIEhUTUxFbGVtZW50KTtcbn1cblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gYSBmdW5jdGlvbiB0aGF0IGFwcGxpZXMgdHJhbnNmb3JtYXRpb25zIHRvIHRoZSByb290IEhUTUwgZWxlbWVudFxuICogb2YgYW4gYXBwLiBXaGVuIGh5ZHJhdGlvbiBpcyBlbmFibGVkLCB0aGlzIHByb2Nlc3NlcyBhbnkgY29ycnVwdCB0ZXh0IG5vZGVzXG4gKiBzbyB0aGV5IGFyZSBwcm9wZXJseSBoeWRyYXRhYmxlIG9uIHRoZSBjbGllbnQuXG4gKlxuICogQHBhcmFtIHJvb3RFbGVtZW50IHRoZSBhcHAgcm9vdCBIVE1MIEVsZW1lbnRcbiAqL1xubGV0IF9hcHBseVJvb3RFbGVtZW50VHJhbnNmb3JtSW1wbDogdHlwZW9mIGFwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm1JbXBsID0gKCkgPT4gbnVsbDtcblxuLyoqXG4gKiBQcm9jZXNzZXMgdGV4dCBub2RlIG1hcmtlcnMgYmVmb3JlIGh5ZHJhdGlvbiBiZWdpbnMuIFRoaXMgcmVwbGFjZXMgYW55IHNwZWNpYWwgY29tbWVudFxuICogbm9kZXMgdGhhdCB3ZXJlIGFkZGVkIHByaW9yIHRvIHNlcmlhbGl6YXRpb24gYXJlIHN3YXBwZWQgb3V0IHRvIHJlc3RvcmUgcHJvcGVyIHRleHRcbiAqIG5vZGVzIGJlZm9yZSBoeWRyYXRpb24uXG4gKlxuICogQHBhcmFtIHJvb3RFbGVtZW50IHRoZSBhcHAgcm9vdCBIVE1MIEVsZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm1JbXBsKHJvb3RFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICBpZiAoaGFzU2tpcEh5ZHJhdGlvbkF0dHJPblJFbGVtZW50KHJvb3RFbGVtZW50KSkge1xuICAgIC8vIEhhbmRsZSBhIHNpdHVhdGlvbiB3aGVuIHRoZSBgbmdTa2lwSHlkcmF0aW9uYCBhdHRyaWJ1dGUgaXMgYXBwbGllZFxuICAgIC8vIHRvIHRoZSByb290IG5vZGUgb2YgYW4gYXBwbGljYXRpb24uIEluIHRoaXMgY2FzZSwgd2Ugc2hvdWxkIGNsZWFyXG4gICAgLy8gdGhlIGNvbnRlbnRzIGFuZCByZW5kZXIgZXZlcnl0aGluZyBmcm9tIHNjcmF0Y2guXG4gICAgY2xlYXJFbGVtZW50Q29udGVudHMocm9vdEVsZW1lbnQgYXMgUkVsZW1lbnQpO1xuICB9IGVsc2Uge1xuICAgIHByb2Nlc3NUZXh0Tm9kZU1hcmtlcnNCZWZvcmVIeWRyYXRpb24ocm9vdEVsZW1lbnQpO1xuICB9XG59XG5cbi8qKlxuICogU2V0cyB0aGUgaW1wbGVtZW50YXRpb24gZm9yIHRoZSBgYXBwbHlSb290RWxlbWVudFRyYW5zZm9ybWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVBcHBseVJvb3RFbGVtZW50VHJhbnNmb3JtSW1wbCgpIHtcbiAgX2FwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm1JbXBsID0gYXBwbHlSb290RWxlbWVudFRyYW5zZm9ybUltcGw7XG59XG5cbi8qKlxuICogU2F2ZXMgY29udGV4dCBmb3IgdGhpcyBjbGVhbnVwIGZ1bmN0aW9uIGluIExWaWV3LmNsZWFudXBJbnN0YW5jZXMuXG4gKlxuICogT24gdGhlIGZpcnN0IHRlbXBsYXRlIHBhc3MsIHNhdmVzIGluIFRWaWV3OlxuICogLSBDbGVhbnVwIGZ1bmN0aW9uXG4gKiAtIEluZGV4IG9mIGNvbnRleHQgd2UganVzdCBzYXZlZCBpbiBMVmlldy5jbGVhbnVwSW5zdGFuY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZUNsZWFudXBXaXRoQ29udGV4dChcbiAgdFZpZXc6IFRWaWV3LFxuICBsVmlldzogTFZpZXcsXG4gIGNvbnRleHQ6IGFueSxcbiAgY2xlYW51cEZuOiBGdW5jdGlvbixcbik6IHZvaWQge1xuICBjb25zdCBsQ2xlYW51cCA9IGdldE9yQ3JlYXRlTFZpZXdDbGVhbnVwKGxWaWV3KTtcblxuICAvLyBIaXN0b3JpY2FsbHkgdGhlIGBzdG9yZUNsZWFudXBXaXRoQ29udGV4dGAgd2FzIHVzZWQgdG8gcmVnaXN0ZXIgYm90aCBmcmFtZXdvcmstbGV2ZWwgYW5kXG4gIC8vIHVzZXItZGVmaW5lZCBjbGVhbnVwIGNhbGxiYWNrcywgYnV0IG92ZXIgdGltZSB0aG9zZSB0d28gdHlwZXMgb2YgY2xlYW51cHMgd2VyZSBzZXBhcmF0ZWQuXG4gIC8vIFRoaXMgZGV2IG1vZGUgY2hlY2tzIGFzc3VyZXMgdGhhdCB1c2VyLWxldmVsIGNsZWFudXAgY2FsbGJhY2tzIGFyZSBfbm90XyBzdG9yZWQgaW4gZGF0YVxuICAvLyBzdHJ1Y3R1cmVzIHJlc2VydmVkIGZvciBmcmFtZXdvcmstc3BlY2lmaWMgaG9va3MuXG4gIG5nRGV2TW9kZSAmJlxuICAgIGFzc2VydERlZmluZWQoXG4gICAgICBjb250ZXh0LFxuICAgICAgJ0NsZWFudXAgY29udGV4dCBpcyBtYW5kYXRvcnkgd2hlbiByZWdpc3RlcmluZyBmcmFtZXdvcmstbGV2ZWwgZGVzdHJveSBob29rcycsXG4gICAgKTtcbiAgbENsZWFudXAucHVzaChjb250ZXh0KTtcblxuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzKSB7XG4gICAgZ2V0T3JDcmVhdGVUVmlld0NsZWFudXAodFZpZXcpLnB1c2goY2xlYW51cEZuLCBsQ2xlYW51cC5sZW5ndGggLSAxKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCBubyBuZXcgZnJhbWV3b3JrLWxldmVsIGNsZWFudXAgZnVuY3Rpb25zIGFyZSByZWdpc3RlcmVkIGFmdGVyIHRoZSBmaXJzdFxuICAgIC8vIHRlbXBsYXRlIHBhc3MgaXMgZG9uZSAoYW5kIFRWaWV3IGRhdGEgc3RydWN0dXJlcyBhcmUgbWVhbnQgdG8gZnVsbHkgY29uc3RydWN0ZWQpLlxuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIE9iamVjdC5mcmVlemUoZ2V0T3JDcmVhdGVUVmlld0NsZWFudXAodFZpZXcpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgVE5vZGUgb2JqZWN0IGZyb20gdGhlIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgYFRWaWV3YCB0byB3aGljaCB0aGlzIGBUTm9kZWAgYmVsb25nc1xuICogQHBhcmFtIHRQYXJlbnQgUGFyZW50IGBUTm9kZWBcbiAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBub2RlXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBUTm9kZSBpbiBUVmlldy5kYXRhLCBhZGp1c3RlZCBmb3IgSEVBREVSX09GRlNFVFxuICogQHBhcmFtIHRhZ05hbWUgVGhlIHRhZyBuYW1lIG9mIHRoZSBub2RlXG4gKiBAcGFyYW0gYXR0cnMgVGhlIGF0dHJpYnV0ZXMgZGVmaW5lZCBvbiB0aGlzIG5vZGVcbiAqIEByZXR1cm5zIHRoZSBUTm9kZSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVROb2RlKFxuICB0VmlldzogVFZpZXcsXG4gIHRQYXJlbnQ6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgbnVsbCxcbiAgdHlwZTogVE5vZGVUeXBlLkNvbnRhaW5lcixcbiAgaW5kZXg6IG51bWJlcixcbiAgdGFnTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCxcbik6IFRDb250YWluZXJOb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVROb2RlKFxuICB0VmlldzogVFZpZXcsXG4gIHRQYXJlbnQ6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgbnVsbCxcbiAgdHlwZTogVE5vZGVUeXBlLkVsZW1lbnQgfCBUTm9kZVR5cGUuVGV4dCxcbiAgaW5kZXg6IG51bWJlcixcbiAgdGFnTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCxcbik6IFRFbGVtZW50Tm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUTm9kZShcbiAgdFZpZXc6IFRWaWV3LFxuICB0UGFyZW50OiBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IG51bGwsXG4gIHR5cGU6IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyLFxuICBpbmRleDogbnVtYmVyLFxuICB0YWdOYW1lOiBzdHJpbmcgfCBudWxsLFxuICBhdHRyczogVEF0dHJpYnV0ZXMgfCBudWxsLFxuKTogVEVsZW1lbnRDb250YWluZXJOb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVROb2RlKFxuICB0VmlldzogVFZpZXcsXG4gIHRQYXJlbnQ6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgbnVsbCxcbiAgdHlwZTogVE5vZGVUeXBlLkljdSxcbiAgaW5kZXg6IG51bWJlcixcbiAgdGFnTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnM6IFRBdHRyaWJ1dGVzIHwgbnVsbCxcbik6IFRJY3VDb250YWluZXJOb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVROb2RlKFxuICB0VmlldzogVFZpZXcsXG4gIHRQYXJlbnQ6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgbnVsbCxcbiAgdHlwZTogVE5vZGVUeXBlLlByb2plY3Rpb24sXG4gIGluZGV4OiBudW1iZXIsXG4gIHRhZ05hbWU6IHN0cmluZyB8IG51bGwsXG4gIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsXG4pOiBUUHJvamVjdGlvbk5vZGU7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVE5vZGUoXG4gIHRWaWV3OiBUVmlldyxcbiAgdFBhcmVudDogVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBudWxsLFxuICB0eXBlOiBUTm9kZVR5cGUsXG4gIGluZGV4OiBudW1iZXIsXG4gIHRhZ05hbWU6IHN0cmluZyB8IG51bGwsXG4gIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsXG4pOiBUTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUTm9kZShcbiAgdFZpZXc6IFRWaWV3LFxuICB0UGFyZW50OiBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IG51bGwsXG4gIHR5cGU6IFROb2RlVHlwZSxcbiAgaW5kZXg6IG51bWJlcixcbiAgdmFsdWU6IHN0cmluZyB8IG51bGwsXG4gIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsXG4pOiBUTm9kZSB7XG4gIG5nRGV2TW9kZSAmJlxuICAgIGluZGV4ICE9PSAwICYmIC8vIDAgYXJlIGJvZ3VzIG5vZGVzIGFuZCB0aGV5IGFyZSBPSy4gU2VlIGBjcmVhdGVDb250YWluZXJSZWZgIGluXG4gICAgLy8gYHZpZXdfZW5naW5lX2NvbXBhdGliaWxpdHlgIGZvciBhZGRpdGlvbmFsIGNvbnRleHQuXG4gICAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsKGluZGV4LCBIRUFERVJfT0ZGU0VULCBcIlROb2RlcyBjYW4ndCBiZSBpbiB0aGUgTFZpZXcgaGVhZGVyLlwiKTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydE5vdFNhbWUoYXR0cnMsIHVuZGVmaW5lZCwgXCIndW5kZWZpbmVkJyBpcyBub3QgdmFsaWQgdmFsdWUgZm9yICdhdHRycydcIik7XG4gIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUudE5vZGUrKztcbiAgbmdEZXZNb2RlICYmIHRQYXJlbnQgJiYgYXNzZXJ0VE5vZGVGb3JUVmlldyh0UGFyZW50LCB0Vmlldyk7XG4gIGxldCBpbmplY3RvckluZGV4ID0gdFBhcmVudCA/IHRQYXJlbnQuaW5qZWN0b3JJbmRleCA6IC0xO1xuICBsZXQgZmxhZ3MgPSAwO1xuICBpZiAoaXNJblNraXBIeWRyYXRpb25CbG9jaygpKSB7XG4gICAgZmxhZ3MgfD0gVE5vZGVGbGFncy5pblNraXBIeWRyYXRpb25CbG9jaztcbiAgfVxuICBjb25zdCB0Tm9kZSA9IHtcbiAgICB0eXBlLFxuICAgIGluZGV4LFxuICAgIGluc2VydEJlZm9yZUluZGV4OiBudWxsLFxuICAgIGluamVjdG9ySW5kZXgsXG4gICAgZGlyZWN0aXZlU3RhcnQ6IC0xLFxuICAgIGRpcmVjdGl2ZUVuZDogLTEsXG4gICAgZGlyZWN0aXZlU3R5bGluZ0xhc3Q6IC0xLFxuICAgIGNvbXBvbmVudE9mZnNldDogLTEsXG4gICAgcHJvcGVydHlCaW5kaW5nczogbnVsbCxcbiAgICBmbGFncyxcbiAgICBwcm92aWRlckluZGV4ZXM6IDAsXG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGF0dHJzOiBhdHRycyxcbiAgICBtZXJnZWRBdHRyczogbnVsbCxcbiAgICBsb2NhbE5hbWVzOiBudWxsLFxuICAgIGluaXRpYWxJbnB1dHM6IHVuZGVmaW5lZCxcbiAgICBpbnB1dHM6IG51bGwsXG4gICAgb3V0cHV0czogbnVsbCxcbiAgICB0VmlldzogbnVsbCxcbiAgICBuZXh0OiBudWxsLFxuICAgIHByZXY6IG51bGwsXG4gICAgcHJvamVjdGlvbk5leHQ6IG51bGwsXG4gICAgY2hpbGQ6IG51bGwsXG4gICAgcGFyZW50OiB0UGFyZW50LFxuICAgIHByb2plY3Rpb246IG51bGwsXG4gICAgc3R5bGVzOiBudWxsLFxuICAgIHN0eWxlc1dpdGhvdXRIb3N0OiBudWxsLFxuICAgIHJlc2lkdWFsU3R5bGVzOiB1bmRlZmluZWQsXG4gICAgY2xhc3NlczogbnVsbCxcbiAgICBjbGFzc2VzV2l0aG91dEhvc3Q6IG51bGwsXG4gICAgcmVzaWR1YWxDbGFzc2VzOiB1bmRlZmluZWQsXG4gICAgY2xhc3NCaW5kaW5nczogMCBhcyBUU3R5bGluZ1JhbmdlLFxuICAgIHN0eWxlQmluZGluZ3M6IDAgYXMgVFN0eWxpbmdSYW5nZSxcbiAgfTtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIC8vIEZvciBwZXJmb3JtYW5jZSByZWFzb25zIGl0IGlzIGltcG9ydGFudCB0aGF0IHRoZSB0Tm9kZSByZXRhaW5zIHRoZSBzYW1lIHNoYXBlIGR1cmluZyBydW50aW1lLlxuICAgIC8vIChUbyBtYWtlIHN1cmUgdGhhdCBhbGwgb2YgdGhlIGNvZGUgaXMgbW9ub21vcnBoaWMuKSBGb3IgdGhpcyByZWFzb24gd2Ugc2VhbCB0aGUgb2JqZWN0IHRvXG4gICAgLy8gcHJldmVudCBjbGFzcyB0cmFuc2l0aW9ucy5cbiAgICBPYmplY3Quc2VhbCh0Tm9kZSk7XG4gIH1cbiAgcmV0dXJuIHROb2RlO1xufVxuXG4vKiogTW9kZSBmb3IgY2FwdHVyaW5nIG5vZGUgYmluZGluZ3MuICovXG5jb25zdCBlbnVtIENhcHR1cmVOb2RlQmluZGluZ01vZGUge1xuICBJbnB1dHMsXG4gIE91dHB1dHMsXG59XG5cbi8qKlxuICogQ2FwdHVyZXMgbm9kZSBpbnB1dCBiaW5kaW5ncyBmb3IgdGhlIGdpdmVuIGRpcmVjdGl2ZSBiYXNlZCBvbiB0aGUgaW5wdXRzIG1ldGFkYXRhLlxuICogVGhpcyB3aWxsIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBjb21iaW5lIGlucHV0cyBmcm9tIHZhcmlvdXMgZGlyZWN0aXZlcyBvbiBhIG5vZGUuXG4gKlxuICogVGhlIGhvc3QgYmluZGluZyBhbGlhcyBtYXAgaXMgdXNlZCB0byBhbGlhcyBhbmQgZmlsdGVyIG91dCBwcm9wZXJ0aWVzIGZvciBob3N0IGRpcmVjdGl2ZXMuXG4gKiBJZiB0aGUgbWFwcGluZyBpcyBwcm92aWRlZCwgaXQnbGwgYWN0IGFzIGFuIGFsbG93bGlzdCwgYXMgd2VsbCBhcyBhIG1hcHBpbmcgb2Ygd2hhdCBwdWJsaWNcbiAqIG5hbWUgaW5wdXRzL291dHB1dHMgc2hvdWxkIGJlIGV4cG9zZWQgdW5kZXIuXG4gKi9cbmZ1bmN0aW9uIGNhcHR1cmVOb2RlQmluZGluZ3M8VD4oXG4gIG1vZGU6IENhcHR1cmVOb2RlQmluZGluZ01vZGUuSW5wdXRzLFxuICBpbnB1dHM6IERpcmVjdGl2ZURlZjxUPlsnaW5wdXRzJ10sXG4gIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsXG4gIGJpbmRpbmdzUmVzdWx0OiBOb2RlSW5wdXRCaW5kaW5ncyB8IG51bGwsXG4gIGhvc3REaXJlY3RpdmVBbGlhc01hcDogSG9zdERpcmVjdGl2ZUJpbmRpbmdNYXAgfCBudWxsLFxuKTogTm9kZUlucHV0QmluZGluZ3MgfCBudWxsO1xuLyoqXG4gKiBDYXB0dXJlcyBub2RlIG91dHB1dCBiaW5kaW5ncyBmb3IgdGhlIGdpdmVuIGRpcmVjdGl2ZSBiYXNlZCBvbiB0aGUgb3V0cHV0IG1ldGFkYXRhLlxuICogVGhpcyB3aWxsIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBjb21iaW5lIGlucHV0cyBmcm9tIHZhcmlvdXMgZGlyZWN0aXZlcyBvbiBhIG5vZGUuXG4gKlxuICogVGhlIGhvc3QgYmluZGluZyBhbGlhcyBtYXAgaXMgdXNlZCB0byBhbGlhcyBhbmQgZmlsdGVyIG91dCBwcm9wZXJ0aWVzIGZvciBob3N0IGRpcmVjdGl2ZXMuXG4gKiBJZiB0aGUgbWFwcGluZyBpcyBwcm92aWRlZCwgaXQnbGwgYWN0IGFzIGFuIGFsbG93bGlzdCwgYXMgd2VsbCBhcyBhIG1hcHBpbmcgb2Ygd2hhdCBwdWJsaWNcbiAqIG5hbWUgaW5wdXRzL291dHB1dHMgc2hvdWxkIGJlIGV4cG9zZWQgdW5kZXIuXG4gKi9cbmZ1bmN0aW9uIGNhcHR1cmVOb2RlQmluZGluZ3M8VD4oXG4gIG1vZGU6IENhcHR1cmVOb2RlQmluZGluZ01vZGUuT3V0cHV0cyxcbiAgb3V0cHV0czogRGlyZWN0aXZlRGVmPFQ+WydvdXRwdXRzJ10sXG4gIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsXG4gIGJpbmRpbmdzUmVzdWx0OiBOb2RlT3V0cHV0QmluZGluZ3MgfCBudWxsLFxuICBob3N0RGlyZWN0aXZlQWxpYXNNYXA6IEhvc3REaXJlY3RpdmVCaW5kaW5nTWFwIHwgbnVsbCxcbik6IE5vZGVPdXRwdXRCaW5kaW5ncyB8IG51bGw7XG5cbmZ1bmN0aW9uIGNhcHR1cmVOb2RlQmluZGluZ3M8VD4oXG4gIG1vZGU6IENhcHR1cmVOb2RlQmluZGluZ01vZGUsXG4gIGFsaWFzTWFwOiBEaXJlY3RpdmVEZWY8VD5bJ2lucHV0cyddIHwgRGlyZWN0aXZlRGVmPFQ+WydvdXRwdXRzJ10sXG4gIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsXG4gIGJpbmRpbmdzUmVzdWx0OiBOb2RlSW5wdXRCaW5kaW5ncyB8IE5vZGVPdXRwdXRCaW5kaW5ncyB8IG51bGwsXG4gIGhvc3REaXJlY3RpdmVBbGlhc01hcDogSG9zdERpcmVjdGl2ZUJpbmRpbmdNYXAgfCBudWxsLFxuKTogTm9kZUlucHV0QmluZGluZ3MgfCBOb2RlT3V0cHV0QmluZGluZ3MgfCBudWxsIHtcbiAgZm9yIChsZXQgcHVibGljTmFtZSBpbiBhbGlhc01hcCkge1xuICAgIGlmICghYWxpYXNNYXAuaGFzT3duUHJvcGVydHkocHVibGljTmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gYWxpYXNNYXBbcHVibGljTmFtZV07XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGJpbmRpbmdzUmVzdWx0ID8/PSB7fTtcblxuICAgIGxldCBpbnRlcm5hbE5hbWU6IHN0cmluZztcbiAgICBsZXQgaW5wdXRGbGFncyA9IElucHV0RmxhZ3MuTm9uZTtcblxuICAgIC8vIEZvciBpbnB1dHMsIHRoZSB2YWx1ZSBtaWdodCBiZSBhbiBhcnJheSBjYXB0dXJpbmcgYWRkaXRpb25hbFxuICAgIC8vIGlucHV0IGZsYWdzLlxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgaW50ZXJuYWxOYW1lID0gdmFsdWVbMF07XG4gICAgICBpbnB1dEZsYWdzID0gdmFsdWVbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGludGVybmFsTmFtZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZXJlIGFyZSBubyBob3N0IGRpcmVjdGl2ZSBtYXBwaW5ncywgd2Ugd2FudCB0byByZW1hcCB1c2luZyB0aGUgYWxpYXMgbWFwIGZyb20gdGhlXG4gICAgLy8gZGVmaW5pdGlvbiBpdHNlbGYuIElmIHRoZXJlIGlzIGFuIGFsaWFzIG1hcCwgaXQgaGFzIHR3byBmdW5jdGlvbnM6XG4gICAgLy8gMS4gSXQgc2VydmVzIGFzIGFuIGFsbG93bGlzdCBvZiBiaW5kaW5ncyB0aGF0IGFyZSBleHBvc2VkIGJ5IHRoZSBob3N0IGRpcmVjdGl2ZXMuIE9ubHkgdGhlXG4gICAgLy8gb25lcyBpbnNpZGUgdGhlIGhvc3QgZGlyZWN0aXZlIG1hcCB3aWxsIGJlIGV4cG9zZWQgb24gdGhlIGhvc3QuXG4gICAgLy8gMi4gVGhlIHB1YmxpYyBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBpcyBhbGlhc2VkIHVzaW5nIHRoZSBob3N0IGRpcmVjdGl2ZSBhbGlhcyBtYXAsIHJhdGhlclxuICAgIC8vIHRoYW4gdGhlIGFsaWFzIG1hcCBmcm9tIHRoZSBkZWZpbml0aW9uLlxuICAgIGxldCBmaW5hbFB1YmxpY05hbWU6IHN0cmluZyA9IHB1YmxpY05hbWU7XG4gICAgaWYgKGhvc3REaXJlY3RpdmVBbGlhc01hcCAhPT0gbnVsbCkge1xuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gbWFwcGluZywgaXQncyBub3QgcGFydCBvZiB0aGUgYWxsb3dsaXN0IGFuZCB0aGlzIGlucHV0L291dHB1dFxuICAgICAgLy8gaXMgbm90IGNhcHR1cmVkIGFuZCBzaG91bGQgYmUgaWdub3JlZC5cbiAgICAgIGlmICghaG9zdERpcmVjdGl2ZUFsaWFzTWFwLmhhc093blByb3BlcnR5KHB1YmxpY05hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZmluYWxQdWJsaWNOYW1lID0gaG9zdERpcmVjdGl2ZUFsaWFzTWFwW3B1YmxpY05hbWVdO1xuICAgIH1cblxuICAgIGlmIChtb2RlID09PSBDYXB0dXJlTm9kZUJpbmRpbmdNb2RlLklucHV0cykge1xuICAgICAgYWRkUHJvcGVydHlCaW5kaW5nKFxuICAgICAgICBiaW5kaW5nc1Jlc3VsdCBhcyBOb2RlSW5wdXRCaW5kaW5ncyxcbiAgICAgICAgZGlyZWN0aXZlSW5kZXgsXG4gICAgICAgIGZpbmFsUHVibGljTmFtZSxcbiAgICAgICAgaW50ZXJuYWxOYW1lLFxuICAgICAgICBpbnB1dEZsYWdzLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkUHJvcGVydHlCaW5kaW5nKFxuICAgICAgICBiaW5kaW5nc1Jlc3VsdCBhcyBOb2RlT3V0cHV0QmluZGluZ3MsXG4gICAgICAgIGRpcmVjdGl2ZUluZGV4LFxuICAgICAgICBmaW5hbFB1YmxpY05hbWUsXG4gICAgICAgIGludGVybmFsTmFtZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBiaW5kaW5nc1Jlc3VsdDtcbn1cblxuZnVuY3Rpb24gYWRkUHJvcGVydHlCaW5kaW5nKFxuICBiaW5kaW5nczogTm9kZUlucHV0QmluZGluZ3MsXG4gIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsXG4gIHB1YmxpY05hbWU6IHN0cmluZyxcbiAgaW50ZXJuYWxOYW1lOiBzdHJpbmcsXG4gIGlucHV0RmxhZ3M6IElucHV0RmxhZ3MsXG4pOiB2b2lkO1xuZnVuY3Rpb24gYWRkUHJvcGVydHlCaW5kaW5nKFxuICBiaW5kaW5nczogTm9kZU91dHB1dEJpbmRpbmdzLFxuICBkaXJlY3RpdmVJbmRleDogbnVtYmVyLFxuICBwdWJsaWNOYW1lOiBzdHJpbmcsXG4gIGludGVybmFsTmFtZTogc3RyaW5nLFxuKTogdm9pZDtcblxuZnVuY3Rpb24gYWRkUHJvcGVydHlCaW5kaW5nKFxuICBiaW5kaW5nczogTm9kZUlucHV0QmluZGluZ3MgfCBOb2RlT3V0cHV0QmluZGluZ3MsXG4gIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsXG4gIHB1YmxpY05hbWU6IHN0cmluZyxcbiAgaW50ZXJuYWxOYW1lOiBzdHJpbmcsXG4gIGlucHV0RmxhZ3M/OiBJbnB1dEZsYWdzLFxuKSB7XG4gIGxldCB2YWx1ZXM6ICh0eXBlb2YgYmluZGluZ3MpW3R5cGVvZiBwdWJsaWNOYW1lXTtcblxuICBpZiAoYmluZGluZ3MuaGFzT3duUHJvcGVydHkocHVibGljTmFtZSkpIHtcbiAgICAodmFsdWVzID0gYmluZGluZ3NbcHVibGljTmFtZV0pLnB1c2goZGlyZWN0aXZlSW5kZXgsIGludGVybmFsTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFsdWVzID0gYmluZGluZ3NbcHVibGljTmFtZV0gPSBbZGlyZWN0aXZlSW5kZXgsIGludGVybmFsTmFtZV07XG4gIH1cblxuICBpZiAoaW5wdXRGbGFncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgKHZhbHVlcyBhcyBOb2RlSW5wdXRCaW5kaW5nc1t0eXBlb2YgcHVibGljTmFtZV0pLnB1c2goaW5wdXRGbGFncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbml0aWFsaXplcyBkYXRhIHN0cnVjdHVyZXMgcmVxdWlyZWQgdG8gd29yayB3aXRoIGRpcmVjdGl2ZSBpbnB1dHMgYW5kIG91dHB1dHMuXG4gKiBJbml0aWFsaXphdGlvbiBpcyBkb25lIGZvciBhbGwgZGlyZWN0aXZlcyBtYXRjaGVkIG9uIGEgZ2l2ZW4gVE5vZGUuXG4gKi9cbmZ1bmN0aW9uIGluaXRpYWxpemVJbnB1dEFuZE91dHB1dEFsaWFzZXMoXG4gIHRWaWV3OiBUVmlldyxcbiAgdE5vZGU6IFROb2RlLFxuICBob3N0RGlyZWN0aXZlRGVmaW5pdGlvbk1hcDogSG9zdERpcmVjdGl2ZURlZnMgfCBudWxsLFxuKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRGaXJzdENyZWF0ZVBhc3ModFZpZXcpO1xuXG4gIGNvbnN0IHN0YXJ0ID0gdE5vZGUuZGlyZWN0aXZlU3RhcnQ7XG4gIGNvbnN0IGVuZCA9IHROb2RlLmRpcmVjdGl2ZUVuZDtcbiAgY29uc3QgdFZpZXdEYXRhID0gdFZpZXcuZGF0YTtcblxuICBjb25zdCB0Tm9kZUF0dHJzID0gdE5vZGUuYXR0cnM7XG4gIGNvbnN0IGlucHV0c0Zyb21BdHRyczogSW5pdGlhbElucHV0RGF0YSA9IFtdO1xuICBsZXQgaW5wdXRzU3RvcmU6IE5vZGVJbnB1dEJpbmRpbmdzIHwgbnVsbCA9IG51bGw7XG4gIGxldCBvdXRwdXRzU3RvcmU6IE5vZGVPdXRwdXRCaW5kaW5ncyB8IG51bGwgPSBudWxsO1xuXG4gIGZvciAobGV0IGRpcmVjdGl2ZUluZGV4ID0gc3RhcnQ7IGRpcmVjdGl2ZUluZGV4IDwgZW5kOyBkaXJlY3RpdmVJbmRleCsrKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlRGVmID0gdFZpZXdEYXRhW2RpcmVjdGl2ZUluZGV4XSBhcyBEaXJlY3RpdmVEZWY8YW55PjtcbiAgICBjb25zdCBhbGlhc0RhdGEgPSBob3N0RGlyZWN0aXZlRGVmaW5pdGlvbk1hcFxuICAgICAgPyBob3N0RGlyZWN0aXZlRGVmaW5pdGlvbk1hcC5nZXQoZGlyZWN0aXZlRGVmKVxuICAgICAgOiBudWxsO1xuICAgIGNvbnN0IGFsaWFzZWRJbnB1dHMgPSBhbGlhc0RhdGEgPyBhbGlhc0RhdGEuaW5wdXRzIDogbnVsbDtcbiAgICBjb25zdCBhbGlhc2VkT3V0cHV0cyA9IGFsaWFzRGF0YSA/IGFsaWFzRGF0YS5vdXRwdXRzIDogbnVsbDtcblxuICAgIGlucHV0c1N0b3JlID0gY2FwdHVyZU5vZGVCaW5kaW5ncyhcbiAgICAgIENhcHR1cmVOb2RlQmluZGluZ01vZGUuSW5wdXRzLFxuICAgICAgZGlyZWN0aXZlRGVmLmlucHV0cyxcbiAgICAgIGRpcmVjdGl2ZUluZGV4LFxuICAgICAgaW5wdXRzU3RvcmUsXG4gICAgICBhbGlhc2VkSW5wdXRzLFxuICAgICk7XG4gICAgb3V0cHV0c1N0b3JlID0gY2FwdHVyZU5vZGVCaW5kaW5ncyhcbiAgICAgIENhcHR1cmVOb2RlQmluZGluZ01vZGUuT3V0cHV0cyxcbiAgICAgIGRpcmVjdGl2ZURlZi5vdXRwdXRzLFxuICAgICAgZGlyZWN0aXZlSW5kZXgsXG4gICAgICBvdXRwdXRzU3RvcmUsXG4gICAgICBhbGlhc2VkT3V0cHV0cyxcbiAgICApO1xuICAgIC8vIERvIG5vdCB1c2UgdW5ib3VuZCBhdHRyaWJ1dGVzIGFzIGlucHV0cyB0byBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZXMsIHNpbmNlIHN0cnVjdHVyYWxcbiAgICAvLyBkaXJlY3RpdmUgaW5wdXRzIGNhbiBvbmx5IGJlIHNldCB1c2luZyBtaWNyb3N5bnRheCAoZS5nLiBgPGRpdiAqZGlyPVwiZXhwXCI+YCkuXG4gICAgLy8gVE9ETyhGVy0xOTMwKTogbWljcm9zeW50YXggZXhwcmVzc2lvbnMgbWF5IGFsc28gY29udGFpbiB1bmJvdW5kL3N0YXRpYyBhdHRyaWJ1dGVzLCB3aGljaFxuICAgIC8vIHNob3VsZCBiZSBzZXQgZm9yIGlubGluZSB0ZW1wbGF0ZXMuXG4gICAgY29uc3QgaW5pdGlhbElucHV0cyA9XG4gICAgICBpbnB1dHNTdG9yZSAhPT0gbnVsbCAmJiB0Tm9kZUF0dHJzICE9PSBudWxsICYmICFpc0lubGluZVRlbXBsYXRlKHROb2RlKVxuICAgICAgICA/IGdlbmVyYXRlSW5pdGlhbElucHV0cyhpbnB1dHNTdG9yZSwgZGlyZWN0aXZlSW5kZXgsIHROb2RlQXR0cnMpXG4gICAgICAgIDogbnVsbDtcbiAgICBpbnB1dHNGcm9tQXR0cnMucHVzaChpbml0aWFsSW5wdXRzKTtcbiAgfVxuXG4gIGlmIChpbnB1dHNTdG9yZSAhPT0gbnVsbCkge1xuICAgIGlmIChpbnB1dHNTdG9yZS5oYXNPd25Qcm9wZXJ0eSgnY2xhc3MnKSkge1xuICAgICAgdE5vZGUuZmxhZ3MgfD0gVE5vZGVGbGFncy5oYXNDbGFzc0lucHV0O1xuICAgIH1cbiAgICBpZiAoaW5wdXRzU3RvcmUuaGFzT3duUHJvcGVydHkoJ3N0eWxlJykpIHtcbiAgICAgIHROb2RlLmZsYWdzIHw9IFROb2RlRmxhZ3MuaGFzU3R5bGVJbnB1dDtcbiAgICB9XG4gIH1cblxuICB0Tm9kZS5pbml0aWFsSW5wdXRzID0gaW5wdXRzRnJvbUF0dHJzO1xuICB0Tm9kZS5pbnB1dHMgPSBpbnB1dHNTdG9yZTtcbiAgdE5vZGUub3V0cHV0cyA9IG91dHB1dHNTdG9yZTtcbn1cblxuLyoqXG4gKiBNYXBwaW5nIGJldHdlZW4gYXR0cmlidXRlcyBuYW1lcyB0aGF0IGRvbid0IGNvcnJlc3BvbmQgdG8gdGhlaXIgZWxlbWVudCBwcm9wZXJ0eSBuYW1lcy5cbiAqXG4gKiBQZXJmb3JtYW5jZSBub3RlOiB0aGlzIGZ1bmN0aW9uIGlzIHdyaXR0ZW4gYXMgYSBzZXJpZXMgb2YgaWYgY2hlY2tzIChpbnN0ZWFkIG9mLCBzYXksIGEgcHJvcGVydHlcbiAqIG9iamVjdCBsb29rdXApIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIC0gdGhlIHNlcmllcyBvZiBgaWZgIGNoZWNrcyBzZWVtcyB0byBiZSB0aGUgZmFzdGVzdCB3YXkgb2ZcbiAqIG1hcHBpbmcgcHJvcGVydHkgbmFtZXMuIERvIE5PVCBjaGFuZ2Ugd2l0aG91dCBiZW5jaG1hcmtpbmcuXG4gKlxuICogTm90ZTogdGhpcyBtYXBwaW5nIGhhcyB0byBiZSBrZXB0IGluIHN5bmMgd2l0aCB0aGUgZXF1YWxseSBuYW1lZCBtYXBwaW5nIGluIHRoZSB0ZW1wbGF0ZVxuICogdHlwZS1jaGVja2luZyBtYWNoaW5lcnkgb2Ygbmd0c2MuXG4gKi9cbmZ1bmN0aW9uIG1hcFByb3BOYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChuYW1lID09PSAnY2xhc3MnKSByZXR1cm4gJ2NsYXNzTmFtZSc7XG4gIGlmIChuYW1lID09PSAnZm9yJykgcmV0dXJuICdodG1sRm9yJztcbiAgaWYgKG5hbWUgPT09ICdmb3JtYWN0aW9uJykgcmV0dXJuICdmb3JtQWN0aW9uJztcbiAgaWYgKG5hbWUgPT09ICdpbm5lckh0bWwnKSByZXR1cm4gJ2lubmVySFRNTCc7XG4gIGlmIChuYW1lID09PSAncmVhZG9ubHknKSByZXR1cm4gJ3JlYWRPbmx5JztcbiAgaWYgKG5hbWUgPT09ICd0YWJpbmRleCcpIHJldHVybiAndGFiSW5kZXgnO1xuICByZXR1cm4gbmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnRQcm9wZXJ0eUludGVybmFsPFQ+KFxuICB0VmlldzogVFZpZXcsXG4gIHROb2RlOiBUTm9kZSxcbiAgbFZpZXc6IExWaWV3LFxuICBwcm9wTmFtZTogc3RyaW5nLFxuICB2YWx1ZTogVCxcbiAgcmVuZGVyZXI6IFJlbmRlcmVyLFxuICBzYW5pdGl6ZXI6IFNhbml0aXplckZuIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgbmF0aXZlT25seTogYm9vbGVhbixcbik6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm90U2FtZSh2YWx1ZSwgTk9fQ0hBTkdFIGFzIGFueSwgJ0luY29taW5nIHZhbHVlIHNob3VsZCBuZXZlciBiZSBOT19DSEFOR0UuJyk7XG4gIGNvbnN0IGVsZW1lbnQgPSBnZXROYXRpdmVCeVROb2RlKHROb2RlLCBsVmlldykgYXMgUkVsZW1lbnQgfCBSQ29tbWVudDtcbiAgbGV0IGlucHV0RGF0YSA9IHROb2RlLmlucHV0cztcbiAgbGV0IGRhdGFWYWx1ZTogTm9kZUlucHV0QmluZGluZ3NbdHlwZW9mIHByb3BOYW1lXSB8IHVuZGVmaW5lZDtcbiAgaWYgKCFuYXRpdmVPbmx5ICYmIGlucHV0RGF0YSAhPSBudWxsICYmIChkYXRhVmFsdWUgPSBpbnB1dERhdGFbcHJvcE5hbWVdKSkge1xuICAgIHNldElucHV0c0ZvclByb3BlcnR5KHRWaWV3LCBsVmlldywgZGF0YVZhbHVlLCBwcm9wTmFtZSwgdmFsdWUpO1xuICAgIGlmIChpc0NvbXBvbmVudEhvc3QodE5vZGUpKSBtYXJrRGlydHlJZk9uUHVzaChsVmlldywgdE5vZGUuaW5kZXgpO1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIHNldE5nUmVmbGVjdFByb3BlcnRpZXMobFZpZXcsIGVsZW1lbnQsIHROb2RlLnR5cGUsIGRhdGFWYWx1ZSwgdmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLkFueVJOb2RlKSB7XG4gICAgcHJvcE5hbWUgPSBtYXBQcm9wTmFtZShwcm9wTmFtZSk7XG5cbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICB2YWxpZGF0ZUFnYWluc3RFdmVudFByb3BlcnRpZXMocHJvcE5hbWUpO1xuICAgICAgaWYgKCFpc1Byb3BlcnR5VmFsaWQoZWxlbWVudCwgcHJvcE5hbWUsIHROb2RlLnZhbHVlLCB0Vmlldy5zY2hlbWFzKSkge1xuICAgICAgICBoYW5kbGVVbmtub3duUHJvcGVydHlFcnJvcihwcm9wTmFtZSwgdE5vZGUudmFsdWUsIHROb2RlLnR5cGUsIGxWaWV3KTtcbiAgICAgIH1cbiAgICAgIG5nRGV2TW9kZS5yZW5kZXJlclNldFByb3BlcnR5Kys7XG4gICAgfVxuXG4gICAgLy8gSXQgaXMgYXNzdW1lZCB0aGF0IHRoZSBzYW5pdGl6ZXIgaXMgb25seSBhZGRlZCB3aGVuIHRoZSBjb21waWxlciBkZXRlcm1pbmVzIHRoYXQgdGhlXG4gICAgLy8gcHJvcGVydHkgaXMgcmlza3ksIHNvIHNhbml0aXphdGlvbiBjYW4gYmUgZG9uZSB3aXRob3V0IGZ1cnRoZXIgY2hlY2tzLlxuICAgIHZhbHVlID0gc2FuaXRpemVyICE9IG51bGwgPyAoc2FuaXRpemVyKHZhbHVlLCB0Tm9kZS52YWx1ZSB8fCAnJywgcHJvcE5hbWUpIGFzIGFueSkgOiB2YWx1ZTtcbiAgICByZW5kZXJlci5zZXRQcm9wZXJ0eShlbGVtZW50IGFzIFJFbGVtZW50LCBwcm9wTmFtZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHROb2RlLnR5cGUgJiBUTm9kZVR5cGUuQW55Q29udGFpbmVyKSB7XG4gICAgLy8gSWYgdGhlIG5vZGUgaXMgYSBjb250YWluZXIgYW5kIHRoZSBwcm9wZXJ0eSBkaWRuJ3RcbiAgICAvLyBtYXRjaCBhbnkgb2YgdGhlIGlucHV0cyBvciBzY2hlbWFzIHdlIHNob3VsZCB0aHJvdy5cbiAgICBpZiAobmdEZXZNb2RlICYmICFtYXRjaGluZ1NjaGVtYXModFZpZXcuc2NoZW1hcywgdE5vZGUudmFsdWUpKSB7XG4gICAgICBoYW5kbGVVbmtub3duUHJvcGVydHlFcnJvcihwcm9wTmFtZSwgdE5vZGUudmFsdWUsIHROb2RlLnR5cGUsIGxWaWV3KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIElmIG5vZGUgaXMgYW4gT25QdXNoIGNvbXBvbmVudCwgbWFya3MgaXRzIExWaWV3IGRpcnR5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcmtEaXJ0eUlmT25QdXNoKGxWaWV3OiBMVmlldywgdmlld0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydExWaWV3KGxWaWV3KTtcbiAgY29uc3QgY2hpbGRDb21wb25lbnRMVmlldyA9IGdldENvbXBvbmVudExWaWV3QnlJbmRleCh2aWV3SW5kZXgsIGxWaWV3KTtcbiAgaWYgKCEoY2hpbGRDb21wb25lbnRMVmlld1tGTEFHU10gJiBMVmlld0ZsYWdzLkNoZWNrQWx3YXlzKSkge1xuICAgIGNoaWxkQ29tcG9uZW50TFZpZXdbRkxBR1NdIHw9IExWaWV3RmxhZ3MuRGlydHk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0TmdSZWZsZWN0UHJvcGVydHkoXG4gIGxWaWV3OiBMVmlldyxcbiAgZWxlbWVudDogUkVsZW1lbnQgfCBSQ29tbWVudCxcbiAgdHlwZTogVE5vZGVUeXBlLFxuICBhdHRyTmFtZTogc3RyaW5nLFxuICB2YWx1ZTogYW55LFxuKSB7XG4gIGNvbnN0IHJlbmRlcmVyID0gbFZpZXdbUkVOREVSRVJdO1xuICBhdHRyTmFtZSA9IG5vcm1hbGl6ZURlYnVnQmluZGluZ05hbWUoYXR0ck5hbWUpO1xuICBjb25zdCBkZWJ1Z1ZhbHVlID0gbm9ybWFsaXplRGVidWdCaW5kaW5nVmFsdWUodmFsdWUpO1xuICBpZiAodHlwZSAmIFROb2RlVHlwZS5BbnlSTm9kZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZW5kZXJlci5yZW1vdmVBdHRyaWJ1dGUoZWxlbWVudCBhcyBSRWxlbWVudCwgYXR0ck5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW5kZXJlci5zZXRBdHRyaWJ1dGUoZWxlbWVudCBhcyBSRWxlbWVudCwgYXR0ck5hbWUsIGRlYnVnVmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCB0ZXh0Q29udGVudCA9IGVzY2FwZUNvbW1lbnRUZXh0KFxuICAgICAgYGJpbmRpbmdzPSR7SlNPTi5zdHJpbmdpZnkoe1thdHRyTmFtZV06IGRlYnVnVmFsdWV9LCBudWxsLCAyKX1gLFxuICAgICk7XG4gICAgcmVuZGVyZXIuc2V0VmFsdWUoZWxlbWVudCBhcyBSQ29tbWVudCwgdGV4dENvbnRlbnQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXROZ1JlZmxlY3RQcm9wZXJ0aWVzKFxuICBsVmlldzogTFZpZXcsXG4gIGVsZW1lbnQ6IFJFbGVtZW50IHwgUkNvbW1lbnQsXG4gIHR5cGU6IFROb2RlVHlwZSxcbiAgZGF0YVZhbHVlOiBOb2RlSW5wdXRCaW5kaW5nc1tzdHJpbmddLFxuICB2YWx1ZTogYW55LFxuKSB7XG4gIGlmICh0eXBlICYgKFROb2RlVHlwZS5BbnlSTm9kZSB8IFROb2RlVHlwZS5Db250YWluZXIpKSB7XG4gICAgLyoqXG4gICAgICogZGF0YVZhbHVlIGlzIGFuIGFycmF5IGNvbnRhaW5pbmcgcnVudGltZSBpbnB1dCBvciBvdXRwdXQgbmFtZXMgZm9yIHRoZSBkaXJlY3RpdmVzOlxuICAgICAqIGkrMDogZGlyZWN0aXZlIGluc3RhbmNlIGluZGV4XG4gICAgICogaSsxOiBwcml2YXRlTmFtZVxuICAgICAqXG4gICAgICogZS5nLiBbMCwgJ2NoYW5nZScsICdjaGFuZ2UtbWluaWZpZWQnXVxuICAgICAqIHdlIHdhbnQgdG8gc2V0IHRoZSByZWZsZWN0ZWQgcHJvcGVydHkgd2l0aCB0aGUgcHJpdmF0ZU5hbWU6IGRhdGFWYWx1ZVtpKzFdXG4gICAgICovXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhVmFsdWUubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgIHNldE5nUmVmbGVjdFByb3BlcnR5KGxWaWV3LCBlbGVtZW50LCB0eXBlLCBkYXRhVmFsdWVbaSArIDFdIGFzIHN0cmluZywgdmFsdWUpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmUgdGhlIG1hdGNoZWQgZGlyZWN0aXZlcyBvbiBhIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRGlyZWN0aXZlcyhcbiAgdFZpZXc6IFRWaWV3LFxuICBsVmlldzogTFZpZXcsXG4gIHROb2RlOiBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgbG9jYWxSZWZzOiBzdHJpbmdbXSB8IG51bGwsXG4pOiB2b2lkIHtcbiAgLy8gUGxlYXNlIG1ha2Ugc3VyZSB0byBoYXZlIGV4cGxpY2l0IHR5cGUgZm9yIGBleHBvcnRzTWFwYC4gSW5mZXJyZWQgdHlwZSB0cmlnZ2VycyBidWcgaW5cbiAgLy8gdHNpY2tsZS5cbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0Q3JlYXRlUGFzcyh0Vmlldyk7XG5cbiAgaWYgKGdldEJpbmRpbmdzRW5hYmxlZCgpKSB7XG4gICAgY29uc3QgZXhwb3J0c01hcDoge1trZXk6IHN0cmluZ106IG51bWJlcn0gfCBudWxsID0gbG9jYWxSZWZzID09PSBudWxsID8gbnVsbCA6IHsnJzogLTF9O1xuICAgIGNvbnN0IG1hdGNoUmVzdWx0ID0gZmluZERpcmVjdGl2ZURlZk1hdGNoZXModFZpZXcsIHROb2RlKTtcbiAgICBsZXQgZGlyZWN0aXZlRGVmczogRGlyZWN0aXZlRGVmPHVua25vd24+W10gfCBudWxsO1xuICAgIGxldCBob3N0RGlyZWN0aXZlRGVmczogSG9zdERpcmVjdGl2ZURlZnMgfCBudWxsO1xuXG4gICAgaWYgKG1hdGNoUmVzdWx0ID09PSBudWxsKSB7XG4gICAgICBkaXJlY3RpdmVEZWZzID0gaG9zdERpcmVjdGl2ZURlZnMgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBbZGlyZWN0aXZlRGVmcywgaG9zdERpcmVjdGl2ZURlZnNdID0gbWF0Y2hSZXN1bHQ7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGl2ZURlZnMgIT09IG51bGwpIHtcbiAgICAgIGluaXRpYWxpemVEaXJlY3RpdmVzKHRWaWV3LCBsVmlldywgdE5vZGUsIGRpcmVjdGl2ZURlZnMsIGV4cG9ydHNNYXAsIGhvc3REaXJlY3RpdmVEZWZzKTtcbiAgICB9XG4gICAgaWYgKGV4cG9ydHNNYXApIGNhY2hlTWF0Y2hpbmdMb2NhbE5hbWVzKHROb2RlLCBsb2NhbFJlZnMsIGV4cG9ydHNNYXApO1xuICB9XG4gIC8vIE1lcmdlIHRoZSB0ZW1wbGF0ZSBhdHRycyBsYXN0IHNvIHRoYXQgdGhleSBoYXZlIHRoZSBoaWdoZXN0IHByaW9yaXR5LlxuICB0Tm9kZS5tZXJnZWRBdHRycyA9IG1lcmdlSG9zdEF0dHJzKHROb2RlLm1lcmdlZEF0dHJzLCB0Tm9kZS5hdHRycyk7XG59XG5cbi8qKiBJbml0aWFsaXplcyB0aGUgZGF0YSBzdHJ1Y3R1cmVzIG5lY2Vzc2FyeSBmb3IgYSBsaXN0IG9mIGRpcmVjdGl2ZXMgdG8gYmUgaW5zdGFudGlhdGVkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVEaXJlY3RpdmVzKFxuICB0VmlldzogVFZpZXcsXG4gIGxWaWV3OiBMVmlldzx1bmtub3duPixcbiAgdE5vZGU6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuICBkaXJlY3RpdmVzOiBEaXJlY3RpdmVEZWY8dW5rbm93bj5bXSxcbiAgZXhwb3J0c01hcDoge1trZXk6IHN0cmluZ106IG51bWJlcn0gfCBudWxsLFxuICBob3N0RGlyZWN0aXZlRGVmczogSG9zdERpcmVjdGl2ZURlZnMgfCBudWxsLFxuKSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRGaXJzdENyZWF0ZVBhc3ModFZpZXcpO1xuXG4gIC8vIFB1Ymxpc2hlcyB0aGUgZGlyZWN0aXZlIHR5cGVzIHRvIERJIHNvIHRoZXkgY2FuIGJlIGluamVjdGVkLiBOZWVkcyB0b1xuICAvLyBoYXBwZW4gaW4gYSBzZXBhcmF0ZSBwYXNzIGJlZm9yZSB0aGUgVE5vZGUgZmxhZ3MgaGF2ZSBiZWVuIGluaXRpYWxpemVkLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpcmVjdGl2ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBkaVB1YmxpY0luSW5qZWN0b3IoZ2V0T3JDcmVhdGVOb2RlSW5qZWN0b3JGb3JOb2RlKHROb2RlLCBsVmlldyksIHRWaWV3LCBkaXJlY3RpdmVzW2ldLnR5cGUpO1xuICB9XG5cbiAgaW5pdFROb2RlRmxhZ3ModE5vZGUsIHRWaWV3LmRhdGEubGVuZ3RoLCBkaXJlY3RpdmVzLmxlbmd0aCk7XG5cbiAgLy8gV2hlbiB0aGUgc2FtZSB0b2tlbiBpcyBwcm92aWRlZCBieSBzZXZlcmFsIGRpcmVjdGl2ZXMgb24gdGhlIHNhbWUgbm9kZSwgc29tZSBydWxlcyBhcHBseSBpblxuICAvLyB0aGUgdmlld0VuZ2luZTpcbiAgLy8gLSB2aWV3UHJvdmlkZXJzIGhhdmUgcHJpb3JpdHkgb3ZlciBwcm92aWRlcnNcbiAgLy8gLSB0aGUgbGFzdCBkaXJlY3RpdmUgaW4gTmdNb2R1bGUuZGVjbGFyYXRpb25zIGhhcyBwcmlvcml0eSBvdmVyIHRoZSBwcmV2aW91cyBvbmVcbiAgLy8gU28gdG8gbWF0Y2ggdGhlc2UgcnVsZXMsIHRoZSBvcmRlciBpbiB3aGljaCBwcm92aWRlcnMgYXJlIGFkZGVkIGluIHRoZSBhcnJheXMgaXMgdmVyeVxuICAvLyBpbXBvcnRhbnQuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlyZWN0aXZlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGRlZiA9IGRpcmVjdGl2ZXNbaV07XG4gICAgaWYgKGRlZi5wcm92aWRlcnNSZXNvbHZlcikgZGVmLnByb3ZpZGVyc1Jlc29sdmVyKGRlZik7XG4gIH1cbiAgbGV0IHByZU9yZGVySG9va3NGb3VuZCA9IGZhbHNlO1xuICBsZXQgcHJlT3JkZXJDaGVja0hvb2tzRm91bmQgPSBmYWxzZTtcbiAgbGV0IGRpcmVjdGl2ZUlkeCA9IGFsbG9jRXhwYW5kbyh0VmlldywgbFZpZXcsIGRpcmVjdGl2ZXMubGVuZ3RoLCBudWxsKTtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0U2FtZShcbiAgICAgIGRpcmVjdGl2ZUlkeCxcbiAgICAgIHROb2RlLmRpcmVjdGl2ZVN0YXJ0LFxuICAgICAgJ1ROb2RlLmRpcmVjdGl2ZVN0YXJ0IHNob3VsZCBwb2ludCB0byBqdXN0IGFsbG9jYXRlZCBzcGFjZScsXG4gICAgKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpcmVjdGl2ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkZWYgPSBkaXJlY3RpdmVzW2ldO1xuICAgIC8vIE1lcmdlIHRoZSBhdHRycyBpbiB0aGUgb3JkZXIgb2YgbWF0Y2hlcy4gVGhpcyBhc3N1bWVzIHRoYXQgdGhlIGZpcnN0IGRpcmVjdGl2ZSBpcyB0aGVcbiAgICAvLyBjb21wb25lbnQgaXRzZWxmLCBzbyB0aGF0IHRoZSBjb21wb25lbnQgaGFzIHRoZSBsZWFzdCBwcmlvcml0eS5cbiAgICB0Tm9kZS5tZXJnZWRBdHRycyA9IG1lcmdlSG9zdEF0dHJzKHROb2RlLm1lcmdlZEF0dHJzLCBkZWYuaG9zdEF0dHJzKTtcblxuICAgIGNvbmZpZ3VyZVZpZXdXaXRoRGlyZWN0aXZlKHRWaWV3LCB0Tm9kZSwgbFZpZXcsIGRpcmVjdGl2ZUlkeCwgZGVmKTtcbiAgICBzYXZlTmFtZVRvRXhwb3J0TWFwKGRpcmVjdGl2ZUlkeCwgZGVmLCBleHBvcnRzTWFwKTtcblxuICAgIGlmIChkZWYuY29udGVudFF1ZXJpZXMgIT09IG51bGwpIHROb2RlLmZsYWdzIHw9IFROb2RlRmxhZ3MuaGFzQ29udGVudFF1ZXJ5O1xuICAgIGlmIChkZWYuaG9zdEJpbmRpbmdzICE9PSBudWxsIHx8IGRlZi5ob3N0QXR0cnMgIT09IG51bGwgfHwgZGVmLmhvc3RWYXJzICE9PSAwKVxuICAgICAgdE5vZGUuZmxhZ3MgfD0gVE5vZGVGbGFncy5oYXNIb3N0QmluZGluZ3M7XG5cbiAgICBjb25zdCBsaWZlQ3ljbGVIb29rczogUGFydGlhbDxPbkNoYW5nZXMgJiBPbkluaXQgJiBEb0NoZWNrPiA9IGRlZi50eXBlLnByb3RvdHlwZTtcbiAgICAvLyBPbmx5IHB1c2ggYSBub2RlIGluZGV4IGludG8gdGhlIHByZU9yZGVySG9va3MgYXJyYXkgaWYgdGhpcyBpcyB0aGUgZmlyc3RcbiAgICAvLyBwcmUtb3JkZXIgaG9vayBmb3VuZCBvbiB0aGlzIG5vZGUuXG4gICAgaWYgKFxuICAgICAgIXByZU9yZGVySG9va3NGb3VuZCAmJlxuICAgICAgKGxpZmVDeWNsZUhvb2tzLm5nT25DaGFuZ2VzIHx8IGxpZmVDeWNsZUhvb2tzLm5nT25Jbml0IHx8IGxpZmVDeWNsZUhvb2tzLm5nRG9DaGVjaylcbiAgICApIHtcbiAgICAgIC8vIFdlIHdpbGwgcHVzaCB0aGUgYWN0dWFsIGhvb2sgZnVuY3Rpb24gaW50byB0aGlzIGFycmF5IGxhdGVyIGR1cmluZyBkaXIgaW5zdGFudGlhdGlvbi5cbiAgICAgIC8vIFdlIGNhbm5vdCBkbyBpdCBub3cgYmVjYXVzZSB3ZSBtdXN0IGVuc3VyZSBob29rcyBhcmUgcmVnaXN0ZXJlZCBpbiB0aGUgc2FtZVxuICAgICAgLy8gb3JkZXIgdGhhdCBkaXJlY3RpdmVzIGFyZSBjcmVhdGVkIChpLmUuIGluamVjdGlvbiBvcmRlcikuXG4gICAgICAodFZpZXcucHJlT3JkZXJIb29rcyA/Pz0gW10pLnB1c2godE5vZGUuaW5kZXgpO1xuICAgICAgcHJlT3JkZXJIb29rc0ZvdW5kID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIXByZU9yZGVyQ2hlY2tIb29rc0ZvdW5kICYmIChsaWZlQ3ljbGVIb29rcy5uZ09uQ2hhbmdlcyB8fCBsaWZlQ3ljbGVIb29rcy5uZ0RvQ2hlY2spKSB7XG4gICAgICAodFZpZXcucHJlT3JkZXJDaGVja0hvb2tzID8/PSBbXSkucHVzaCh0Tm9kZS5pbmRleCk7XG4gICAgICBwcmVPcmRlckNoZWNrSG9va3NGb3VuZCA9IHRydWU7XG4gICAgfVxuXG4gICAgZGlyZWN0aXZlSWR4Kys7XG4gIH1cblxuICBpbml0aWFsaXplSW5wdXRBbmRPdXRwdXRBbGlhc2VzKHRWaWV3LCB0Tm9kZSwgaG9zdERpcmVjdGl2ZURlZnMpO1xufVxuXG4vKipcbiAqIEFkZCBgaG9zdEJpbmRpbmdzYCB0byB0aGUgYFRWaWV3Lmhvc3RCaW5kaW5nT3BDb2Rlc2AuXG4gKlxuICogQHBhcmFtIHRWaWV3IGBUVmlld2AgdG8gd2hpY2ggdGhlIGBob3N0QmluZGluZ3NgIHNob3VsZCBiZSBhZGRlZC5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIHRoZSBlbGVtZW50IHdoaWNoIGNvbnRhaW5zIHRoZSBkaXJlY3RpdmVcbiAqIEBwYXJhbSBkaXJlY3RpdmVJZHggRGlyZWN0aXZlIGluZGV4IGluIHZpZXcuXG4gKiBAcGFyYW0gZGlyZWN0aXZlVmFyc0lkeCBXaGVyZSB3aWxsIHRoZSBkaXJlY3RpdmUncyB2YXJzIGJlIHN0b3JlZFxuICogQHBhcmFtIGRlZiBgQ29tcG9uZW50RGVmYC9gRGlyZWN0aXZlRGVmYCwgd2hpY2ggY29udGFpbnMgdGhlIGBob3N0VmFyc2AvYGhvc3RCaW5kaW5nc2AgdG8gYWRkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJIb3N0QmluZGluZ09wQ29kZXMoXG4gIHRWaWV3OiBUVmlldyxcbiAgdE5vZGU6IFROb2RlLFxuICBkaXJlY3RpdmVJZHg6IG51bWJlcixcbiAgZGlyZWN0aXZlVmFyc0lkeDogbnVtYmVyLFxuICBkZWY6IENvbXBvbmVudERlZjxhbnk+IHwgRGlyZWN0aXZlRGVmPGFueT4sXG4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0Q3JlYXRlUGFzcyh0Vmlldyk7XG5cbiAgY29uc3QgaG9zdEJpbmRpbmdzID0gZGVmLmhvc3RCaW5kaW5ncztcbiAgaWYgKGhvc3RCaW5kaW5ncykge1xuICAgIGxldCBob3N0QmluZGluZ09wQ29kZXMgPSB0Vmlldy5ob3N0QmluZGluZ09wQ29kZXM7XG4gICAgaWYgKGhvc3RCaW5kaW5nT3BDb2RlcyA9PT0gbnVsbCkge1xuICAgICAgaG9zdEJpbmRpbmdPcENvZGVzID0gdFZpZXcuaG9zdEJpbmRpbmdPcENvZGVzID0gW10gYXMgYW55IGFzIEhvc3RCaW5kaW5nT3BDb2RlcztcbiAgICB9XG4gICAgY29uc3QgZWxlbWVudEluZHggPSB+dE5vZGUuaW5kZXg7XG4gICAgaWYgKGxhc3RTZWxlY3RlZEVsZW1lbnRJZHgoaG9zdEJpbmRpbmdPcENvZGVzKSAhPSBlbGVtZW50SW5keCkge1xuICAgICAgLy8gQ29uZGl0aW9uYWxseSBhZGQgc2VsZWN0IGVsZW1lbnQgc28gdGhhdCB3ZSBhcmUgbW9yZSBlZmZpY2llbnQgaW4gZXhlY3V0aW9uLlxuICAgICAgLy8gTk9URTogdGhpcyBpcyBzdHJpY3RseSBub3QgbmVjZXNzYXJ5IGFuZCBpdCB0cmFkZXMgY29kZSBzaXplIGZvciBydW50aW1lIHBlcmYuXG4gICAgICAvLyAoV2UgY291bGQganVzdCBhbHdheXMgYWRkIGl0LilcbiAgICAgIGhvc3RCaW5kaW5nT3BDb2Rlcy5wdXNoKGVsZW1lbnRJbmR4KTtcbiAgICB9XG4gICAgaG9zdEJpbmRpbmdPcENvZGVzLnB1c2goZGlyZWN0aXZlSWR4LCBkaXJlY3RpdmVWYXJzSWR4LCBob3N0QmluZGluZ3MpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGFzdCBzZWxlY3RlZCBlbGVtZW50IGluZGV4IGluIHRoZSBgSG9zdEJpbmRpbmdPcENvZGVzYFxuICpcbiAqIEZvciBwZXJmIHJlYXNvbnMgd2UgZG9uJ3QgbmVlZCB0byB1cGRhdGUgdGhlIHNlbGVjdGVkIGVsZW1lbnQgaW5kZXggaW4gYEhvc3RCaW5kaW5nT3BDb2Rlc2Agb25seVxuICogaWYgaXQgY2hhbmdlcy4gVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgbGFzdCBpbmRleCAob3IgJzAnIGlmIG5vdCBmb3VuZC4pXG4gKlxuICogU2VsZWN0ZWQgZWxlbWVudCBpbmRleCBhcmUgb25seSB0aGUgb25lcyB3aGljaCBhcmUgbmVnYXRpdmUuXG4gKi9cbmZ1bmN0aW9uIGxhc3RTZWxlY3RlZEVsZW1lbnRJZHgoaG9zdEJpbmRpbmdPcENvZGVzOiBIb3N0QmluZGluZ09wQ29kZXMpOiBudW1iZXIge1xuICBsZXQgaSA9IGhvc3RCaW5kaW5nT3BDb2Rlcy5sZW5ndGg7XG4gIHdoaWxlIChpID4gMCkge1xuICAgIGNvbnN0IHZhbHVlID0gaG9zdEJpbmRpbmdPcENvZGVzWy0taV07XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgPCAwKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiAwO1xufVxuXG4vKipcbiAqIEluc3RhbnRpYXRlIGFsbCB0aGUgZGlyZWN0aXZlcyB0aGF0IHdlcmUgcHJldmlvdXNseSByZXNvbHZlZCBvbiB0aGUgY3VycmVudCBub2RlLlxuICovXG5mdW5jdGlvbiBpbnN0YW50aWF0ZUFsbERpcmVjdGl2ZXMoXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3LFxuICB0Tm9kZTogVERpcmVjdGl2ZUhvc3ROb2RlLFxuICBuYXRpdmU6IFJOb2RlLFxuKSB7XG4gIGNvbnN0IHN0YXJ0ID0gdE5vZGUuZGlyZWN0aXZlU3RhcnQ7XG4gIGNvbnN0IGVuZCA9IHROb2RlLmRpcmVjdGl2ZUVuZDtcblxuICAvLyBUaGUgY29tcG9uZW50IHZpZXcgbmVlZHMgdG8gYmUgY3JlYXRlZCBiZWZvcmUgY3JlYXRpbmcgdGhlIG5vZGUgaW5qZWN0b3JcbiAgLy8gc2luY2UgaXQgaXMgdXNlZCB0byBpbmplY3Qgc29tZSBzcGVjaWFsIHN5bWJvbHMgbGlrZSBgQ2hhbmdlRGV0ZWN0b3JSZWZgLlxuICBpZiAoaXNDb21wb25lbnRIb3N0KHROb2RlKSkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZVR5cGUodE5vZGUsIFROb2RlVHlwZS5BbnlSTm9kZSk7XG4gICAgYWRkQ29tcG9uZW50TG9naWMoXG4gICAgICBsVmlldyxcbiAgICAgIHROb2RlIGFzIFRFbGVtZW50Tm9kZSxcbiAgICAgIHRWaWV3LmRhdGFbc3RhcnQgKyB0Tm9kZS5jb21wb25lbnRPZmZzZXRdIGFzIENvbXBvbmVudERlZjx1bmtub3duPixcbiAgICApO1xuICB9XG5cbiAgaWYgKCF0Vmlldy5maXJzdENyZWF0ZVBhc3MpIHtcbiAgICBnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGUodE5vZGUsIGxWaWV3KTtcbiAgfVxuXG4gIGF0dGFjaFBhdGNoRGF0YShuYXRpdmUsIGxWaWV3KTtcblxuICBjb25zdCBpbml0aWFsSW5wdXRzID0gdE5vZGUuaW5pdGlhbElucHV0cztcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBjb25zdCBkZWYgPSB0Vmlldy5kYXRhW2ldIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGdldE5vZGVJbmplY3RhYmxlKGxWaWV3LCB0VmlldywgaSwgdE5vZGUpO1xuICAgIGF0dGFjaFBhdGNoRGF0YShkaXJlY3RpdmUsIGxWaWV3KTtcblxuICAgIGlmIChpbml0aWFsSW5wdXRzICE9PSBudWxsKSB7XG4gICAgICBzZXRJbnB1dHNGcm9tQXR0cnMobFZpZXcsIGkgLSBzdGFydCwgZGlyZWN0aXZlLCBkZWYsIHROb2RlLCBpbml0aWFsSW5wdXRzISk7XG4gICAgfVxuXG4gICAgaWYgKGlzQ29tcG9uZW50RGVmKGRlZikpIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudFZpZXcgPSBnZXRDb21wb25lbnRMVmlld0J5SW5kZXgodE5vZGUuaW5kZXgsIGxWaWV3KTtcbiAgICAgIGNvbXBvbmVudFZpZXdbQ09OVEVYVF0gPSBnZXROb2RlSW5qZWN0YWJsZShsVmlldywgdFZpZXcsIGksIHROb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludm9rZURpcmVjdGl2ZXNIb3N0QmluZGluZ3ModFZpZXc6IFRWaWV3LCBsVmlldzogTFZpZXcsIHROb2RlOiBUTm9kZSkge1xuICBjb25zdCBzdGFydCA9IHROb2RlLmRpcmVjdGl2ZVN0YXJ0O1xuICBjb25zdCBlbmQgPSB0Tm9kZS5kaXJlY3RpdmVFbmQ7XG4gIGNvbnN0IGVsZW1lbnRJbmRleCA9IHROb2RlLmluZGV4O1xuICBjb25zdCBjdXJyZW50RGlyZWN0aXZlSW5kZXggPSBnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgoKTtcbiAgdHJ5IHtcbiAgICBzZXRTZWxlY3RlZEluZGV4KGVsZW1lbnRJbmRleCk7XG4gICAgZm9yIChsZXQgZGlySW5kZXggPSBzdGFydDsgZGlySW5kZXggPCBlbmQ7IGRpckluZGV4KyspIHtcbiAgICAgIGNvbnN0IGRlZiA9IHRWaWV3LmRhdGFbZGlySW5kZXhdIGFzIERpcmVjdGl2ZURlZjx1bmtub3duPjtcbiAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGxWaWV3W2RpckluZGV4XTtcbiAgICAgIHNldEN1cnJlbnREaXJlY3RpdmVJbmRleChkaXJJbmRleCk7XG4gICAgICBpZiAoZGVmLmhvc3RCaW5kaW5ncyAhPT0gbnVsbCB8fCBkZWYuaG9zdFZhcnMgIT09IDAgfHwgZGVmLmhvc3RBdHRycyAhPT0gbnVsbCkge1xuICAgICAgICBpbnZva2VIb3N0QmluZGluZ3NJbkNyZWF0aW9uTW9kZShkZWYsIGRpcmVjdGl2ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIHNldFNlbGVjdGVkSW5kZXgoLTEpO1xuICAgIHNldEN1cnJlbnREaXJlY3RpdmVJbmRleChjdXJyZW50RGlyZWN0aXZlSW5kZXgpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlIHRoZSBob3N0IGJpbmRpbmdzIGluIGNyZWF0aW9uIG1vZGUuXG4gKlxuICogQHBhcmFtIGRlZiBgRGlyZWN0aXZlRGVmYCB3aGljaCBtYXkgY29udGFpbiB0aGUgYGhvc3RCaW5kaW5nc2AgZnVuY3Rpb24uXG4gKiBAcGFyYW0gZGlyZWN0aXZlIEluc3RhbmNlIG9mIGRpcmVjdGl2ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludm9rZUhvc3RCaW5kaW5nc0luQ3JlYXRpb25Nb2RlKGRlZjogRGlyZWN0aXZlRGVmPGFueT4sIGRpcmVjdGl2ZTogYW55KSB7XG4gIGlmIChkZWYuaG9zdEJpbmRpbmdzICE9PSBudWxsKSB7XG4gICAgZGVmLmhvc3RCaW5kaW5ncyEoUmVuZGVyRmxhZ3MuQ3JlYXRlLCBkaXJlY3RpdmUpO1xuICB9XG59XG5cbi8qKlxuICogTWF0Y2hlcyB0aGUgY3VycmVudCBub2RlIGFnYWluc3QgYWxsIGF2YWlsYWJsZSBzZWxlY3RvcnMuXG4gKiBJZiBhIGNvbXBvbmVudCBpcyBtYXRjaGVkIChhdCBtb3N0IG9uZSksIGl0IGlzIHJldHVybmVkIGluIGZpcnN0IHBvc2l0aW9uIGluIHRoZSBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZmluZERpcmVjdGl2ZURlZk1hdGNoZXMoXG4gIHRWaWV3OiBUVmlldyxcbiAgdE5vZGU6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuKTogW21hdGNoZXM6IERpcmVjdGl2ZURlZjx1bmtub3duPltdLCBob3N0RGlyZWN0aXZlRGVmczogSG9zdERpcmVjdGl2ZURlZnMgfCBudWxsXSB8IG51bGwge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Rmlyc3RDcmVhdGVQYXNzKHRWaWV3KTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydFROb2RlVHlwZSh0Tm9kZSwgVE5vZGVUeXBlLkFueVJOb2RlIHwgVE5vZGVUeXBlLkFueUNvbnRhaW5lcik7XG5cbiAgY29uc3QgcmVnaXN0cnkgPSB0Vmlldy5kaXJlY3RpdmVSZWdpc3RyeTtcbiAgbGV0IG1hdGNoZXM6IERpcmVjdGl2ZURlZjx1bmtub3duPltdIHwgbnVsbCA9IG51bGw7XG4gIGxldCBob3N0RGlyZWN0aXZlRGVmczogSG9zdERpcmVjdGl2ZURlZnMgfCBudWxsID0gbnVsbDtcbiAgaWYgKHJlZ2lzdHJ5KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWdpc3RyeS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZGVmID0gcmVnaXN0cnlbaV0gYXMgQ29tcG9uZW50RGVmPGFueT4gfCBEaXJlY3RpdmVEZWY8YW55PjtcbiAgICAgIGlmIChpc05vZGVNYXRjaGluZ1NlbGVjdG9yTGlzdCh0Tm9kZSwgZGVmLnNlbGVjdG9ycyEsIC8qIGlzUHJvamVjdGlvbk1vZGUgKi8gZmFsc2UpKSB7XG4gICAgICAgIG1hdGNoZXMgfHwgKG1hdGNoZXMgPSBbXSk7XG5cbiAgICAgICAgaWYgKGlzQ29tcG9uZW50RGVmKGRlZikpIHtcbiAgICAgICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgICAgICBhc3NlcnRUTm9kZVR5cGUoXG4gICAgICAgICAgICAgIHROb2RlLFxuICAgICAgICAgICAgICBUTm9kZVR5cGUuRWxlbWVudCxcbiAgICAgICAgICAgICAgYFwiJHt0Tm9kZS52YWx1ZX1cIiB0YWdzIGNhbm5vdCBiZSB1c2VkIGFzIGNvbXBvbmVudCBob3N0cy4gYCArXG4gICAgICAgICAgICAgICAgYFBsZWFzZSB1c2UgYSBkaWZmZXJlbnQgdGFnIHRvIGFjdGl2YXRlIHRoZSAke3N0cmluZ2lmeShkZWYudHlwZSl9IGNvbXBvbmVudC5gLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGlzQ29tcG9uZW50SG9zdCh0Tm9kZSkpIHtcbiAgICAgICAgICAgICAgdGhyb3dNdWx0aXBsZUNvbXBvbmVudEVycm9yKHROb2RlLCBtYXRjaGVzLmZpbmQoaXNDb21wb25lbnREZWYpIS50eXBlLCBkZWYudHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ29tcG9uZW50cyBhcmUgaW5zZXJ0ZWQgYXQgdGhlIGZyb250IG9mIHRoZSBtYXRjaGVzIGFycmF5IHNvIHRoYXQgdGhlaXIgbGlmZWN5Y2xlXG4gICAgICAgICAgLy8gaG9va3MgcnVuIGJlZm9yZSBhbnkgZGlyZWN0aXZlIGxpZmVjeWNsZSBob29rcy4gVGhpcyBhcHBlYXJzIHRvIGJlIGZvciBWaWV3RW5naW5lXG4gICAgICAgICAgLy8gY29tcGF0aWJpbGl0eS4gVGhpcyBsb2dpYyBkb2Vzbid0IG1ha2Ugc2Vuc2Ugd2l0aCBob3N0IGRpcmVjdGl2ZXMsIGJlY2F1c2UgaXRcbiAgICAgICAgICAvLyB3b3VsZCBhbGxvdyB0aGUgaG9zdCBkaXJlY3RpdmVzIHRvIHVuZG8gYW55IG92ZXJyaWRlcyB0aGUgaG9zdCBtYXkgaGF2ZSBtYWRlLlxuICAgICAgICAgIC8vIFRvIGhhbmRsZSB0aGlzIGNhc2UsIHRoZSBob3N0IGRpcmVjdGl2ZXMgb2YgY29tcG9uZW50cyBhcmUgaW5zZXJ0ZWQgYXQgdGhlIGJlZ2lubmluZ1xuICAgICAgICAgIC8vIG9mIHRoZSBhcnJheSwgZm9sbG93ZWQgYnkgdGhlIGNvbXBvbmVudC4gQXMgc3VjaCwgdGhlIGluc2VydGlvbiBvcmRlciBpcyBhcyBmb2xsb3dzOlxuICAgICAgICAgIC8vIDEuIEhvc3QgZGlyZWN0aXZlcyBiZWxvbmdpbmcgdG8gdGhlIHNlbGVjdG9yLW1hdGNoZWQgY29tcG9uZW50LlxuICAgICAgICAgIC8vIDIuIFNlbGVjdG9yLW1hdGNoZWQgY29tcG9uZW50LlxuICAgICAgICAgIC8vIDMuIEhvc3QgZGlyZWN0aXZlcyBiZWxvbmdpbmcgdG8gc2VsZWN0b3ItbWF0Y2hlZCBkaXJlY3RpdmVzLlxuICAgICAgICAgIC8vIDQuIFNlbGVjdG9yLW1hdGNoZWQgZGlyZWN0aXZlcy5cbiAgICAgICAgICBpZiAoZGVmLmZpbmRIb3N0RGlyZWN0aXZlRGVmcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgaG9zdERpcmVjdGl2ZU1hdGNoZXM6IERpcmVjdGl2ZURlZjx1bmtub3duPltdID0gW107XG4gICAgICAgICAgICBob3N0RGlyZWN0aXZlRGVmcyA9IGhvc3REaXJlY3RpdmVEZWZzIHx8IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGRlZi5maW5kSG9zdERpcmVjdGl2ZURlZnMoZGVmLCBob3N0RGlyZWN0aXZlTWF0Y2hlcywgaG9zdERpcmVjdGl2ZURlZnMpO1xuICAgICAgICAgICAgLy8gQWRkIGFsbCBob3N0IGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gdGhpcyBjb21wb25lbnQsIGZvbGxvd2VkIGJ5IHRoZSBjb21wb25lbnQgaXRzZWxmLlxuICAgICAgICAgICAgLy8gSG9zdCBkaXJlY3RpdmVzIHNob3VsZCBleGVjdXRlIGZpcnN0IHNvIHRoZSBob3N0IGhhcyBhIGNoYW5jZSB0byBvdmVycmlkZSBjaGFuZ2VzXG4gICAgICAgICAgICAvLyB0byB0aGUgRE9NIG1hZGUgYnkgdGhlbS5cbiAgICAgICAgICAgIG1hdGNoZXMudW5zaGlmdCguLi5ob3N0RGlyZWN0aXZlTWF0Y2hlcywgZGVmKTtcbiAgICAgICAgICAgIC8vIENvbXBvbmVudCBpcyBvZmZzZXQgc3RhcnRpbmcgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBob3N0IGRpcmVjdGl2ZXMgYXJyYXkuXG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnRPZmZzZXQgPSBob3N0RGlyZWN0aXZlTWF0Y2hlcy5sZW5ndGg7XG4gICAgICAgICAgICBtYXJrQXNDb21wb25lbnRIb3N0KHRWaWV3LCB0Tm9kZSwgY29tcG9uZW50T2Zmc2V0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gaG9zdCBkaXJlY3RpdmVzIG9uIHRoaXMgY29tcG9uZW50LCBqdXN0IGFkZCB0aGVcbiAgICAgICAgICAgIC8vIGNvbXBvbmVudCBkZWYgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbWF0Y2hlcy5cbiAgICAgICAgICAgIG1hdGNoZXMudW5zaGlmdChkZWYpO1xuICAgICAgICAgICAgbWFya0FzQ29tcG9uZW50SG9zdCh0VmlldywgdE5vZGUsIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBBcHBlbmQgYW55IGhvc3QgZGlyZWN0aXZlcyB0byB0aGUgbWF0Y2hlcyBmaXJzdC5cbiAgICAgICAgICBob3N0RGlyZWN0aXZlRGVmcyA9IGhvc3REaXJlY3RpdmVEZWZzIHx8IG5ldyBNYXAoKTtcbiAgICAgICAgICBkZWYuZmluZEhvc3REaXJlY3RpdmVEZWZzPy4oZGVmLCBtYXRjaGVzLCBob3N0RGlyZWN0aXZlRGVmcyk7XG4gICAgICAgICAgbWF0Y2hlcy5wdXNoKGRlZik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmdEZXZNb2RlICYmIG1hdGNoZXMgIT09IG51bGwgJiYgYXNzZXJ0Tm9EdXBsaWNhdGVEaXJlY3RpdmVzKG1hdGNoZXMpO1xuICByZXR1cm4gbWF0Y2hlcyA9PT0gbnVsbCA/IG51bGwgOiBbbWF0Y2hlcywgaG9zdERpcmVjdGl2ZURlZnNdO1xufVxuXG4vKipcbiAqIE1hcmtzIGEgZ2l2ZW4gVE5vZGUgYXMgYSBjb21wb25lbnQncyBob3N0LiBUaGlzIGNvbnNpc3RzIG9mOlxuICogLSBzZXR0aW5nIHRoZSBjb21wb25lbnQgb2Zmc2V0IG9uIHRoZSBUTm9kZS5cbiAqIC0gc3RvcmluZyBpbmRleCBvZiBjb21wb25lbnQncyBob3N0IGVsZW1lbnQgc28gaXQgd2lsbCBiZSBxdWV1ZWQgZm9yIHZpZXcgcmVmcmVzaCBkdXJpbmcgQ0QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXJrQXNDb21wb25lbnRIb3N0KHRWaWV3OiBUVmlldywgaG9zdFROb2RlOiBUTm9kZSwgY29tcG9uZW50T2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0Q3JlYXRlUGFzcyh0Vmlldyk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRHcmVhdGVyVGhhbihjb21wb25lbnRPZmZzZXQsIC0xLCAnY29tcG9uZW50T2Zmc2V0IG11c3QgYmUgZ3JlYXQgdGhhbiAtMScpO1xuICBob3N0VE5vZGUuY29tcG9uZW50T2Zmc2V0ID0gY29tcG9uZW50T2Zmc2V0O1xuICAodFZpZXcuY29tcG9uZW50cyA/Pz0gW10pLnB1c2goaG9zdFROb2RlLmluZGV4KTtcbn1cblxuLyoqIENhY2hlcyBsb2NhbCBuYW1lcyBhbmQgdGhlaXIgbWF0Y2hpbmcgZGlyZWN0aXZlIGluZGljZXMgZm9yIHF1ZXJ5IGFuZCB0ZW1wbGF0ZSBsb29rdXBzLiAqL1xuZnVuY3Rpb24gY2FjaGVNYXRjaGluZ0xvY2FsTmFtZXMoXG4gIHROb2RlOiBUTm9kZSxcbiAgbG9jYWxSZWZzOiBzdHJpbmdbXSB8IG51bGwsXG4gIGV4cG9ydHNNYXA6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9LFxuKTogdm9pZCB7XG4gIGlmIChsb2NhbFJlZnMpIHtcbiAgICBjb25zdCBsb2NhbE5hbWVzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gKHROb2RlLmxvY2FsTmFtZXMgPSBbXSk7XG5cbiAgICAvLyBMb2NhbCBuYW1lcyBtdXN0IGJlIHN0b3JlZCBpbiB0Tm9kZSBpbiB0aGUgc2FtZSBvcmRlciB0aGF0IGxvY2FsUmVmcyBhcmUgZGVmaW5lZFxuICAgIC8vIGluIHRoZSB0ZW1wbGF0ZSB0byBlbnN1cmUgdGhlIGRhdGEgaXMgbG9hZGVkIGluIHRoZSBzYW1lIHNsb3RzIGFzIHRoZWlyIHJlZnNcbiAgICAvLyBpbiB0aGUgdGVtcGxhdGUgKGZvciB0ZW1wbGF0ZSBxdWVyaWVzKS5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2FsUmVmcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgY29uc3QgaW5kZXggPSBleHBvcnRzTWFwW2xvY2FsUmVmc1tpICsgMV1dO1xuICAgICAgaWYgKGluZGV4ID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5FWFBPUlRfTk9UX0ZPVU5ELFxuICAgICAgICAgIG5nRGV2TW9kZSAmJiBgRXhwb3J0IG9mIG5hbWUgJyR7bG9jYWxSZWZzW2kgKyAxXX0nIG5vdCBmb3VuZCFgLFxuICAgICAgICApO1xuICAgICAgbG9jYWxOYW1lcy5wdXNoKGxvY2FsUmVmc1tpXSwgaW5kZXgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyB1cCBhbiBleHBvcnQgbWFwIGFzIGRpcmVjdGl2ZXMgYXJlIGNyZWF0ZWQsIHNvIGxvY2FsIHJlZnMgY2FuIGJlIHF1aWNrbHkgbWFwcGVkXG4gKiB0byB0aGVpciBkaXJlY3RpdmUgaW5zdGFuY2VzLlxuICovXG5mdW5jdGlvbiBzYXZlTmFtZVRvRXhwb3J0TWFwKFxuICBkaXJlY3RpdmVJZHg6IG51bWJlcixcbiAgZGVmOiBEaXJlY3RpdmVEZWY8YW55PiB8IENvbXBvbmVudERlZjxhbnk+LFxuICBleHBvcnRzTWFwOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSB8IG51bGwsXG4pIHtcbiAgaWYgKGV4cG9ydHNNYXApIHtcbiAgICBpZiAoZGVmLmV4cG9ydEFzKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZi5leHBvcnRBcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBvcnRzTWFwW2RlZi5leHBvcnRBc1tpXV0gPSBkaXJlY3RpdmVJZHg7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc0NvbXBvbmVudERlZihkZWYpKSBleHBvcnRzTWFwWycnXSA9IGRpcmVjdGl2ZUlkeDtcbiAgfVxufVxuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBmbGFncyBvbiB0aGUgY3VycmVudCBub2RlLCBzZXR0aW5nIGFsbCBpbmRpY2VzIHRvIHRoZSBpbml0aWFsIGluZGV4LFxuICogdGhlIGRpcmVjdGl2ZSBjb3VudCB0byAwLCBhbmQgYWRkaW5nIHRoZSBpc0NvbXBvbmVudCBmbGFnLlxuICogQHBhcmFtIGluZGV4IHRoZSBpbml0aWFsIGluZGV4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0VE5vZGVGbGFncyh0Tm9kZTogVE5vZGUsIGluZGV4OiBudW1iZXIsIG51bWJlck9mRGlyZWN0aXZlczogbnVtYmVyKSB7XG4gIG5nRGV2TW9kZSAmJlxuICAgIGFzc2VydE5vdEVxdWFsKFxuICAgICAgbnVtYmVyT2ZEaXJlY3RpdmVzLFxuICAgICAgdE5vZGUuZGlyZWN0aXZlRW5kIC0gdE5vZGUuZGlyZWN0aXZlU3RhcnQsXG4gICAgICAnUmVhY2hlZCB0aGUgbWF4IG51bWJlciBvZiBkaXJlY3RpdmVzJyxcbiAgICApO1xuICB0Tm9kZS5mbGFncyB8PSBUTm9kZUZsYWdzLmlzRGlyZWN0aXZlSG9zdDtcbiAgLy8gV2hlbiB0aGUgZmlyc3QgZGlyZWN0aXZlIGlzIGNyZWF0ZWQgb24gYSBub2RlLCBzYXZlIHRoZSBpbmRleFxuICB0Tm9kZS5kaXJlY3RpdmVTdGFydCA9IGluZGV4O1xuICB0Tm9kZS5kaXJlY3RpdmVFbmQgPSBpbmRleCArIG51bWJlck9mRGlyZWN0aXZlcztcbiAgdE5vZGUucHJvdmlkZXJJbmRleGVzID0gaW5kZXg7XG59XG5cbi8qKlxuICogU2V0dXAgZGlyZWN0aXZlIGZvciBpbnN0YW50aWF0aW9uLlxuICpcbiAqIFdlIG5lZWQgdG8gY3JlYXRlIGEgYE5vZGVJbmplY3RvckZhY3RvcnlgIHdoaWNoIGlzIHRoZW4gaW5zZXJ0ZWQgaW4gYm90aCB0aGUgYEJsdWVwcmludGAgYXMgd2VsbFxuICogYXMgYExWaWV3YC4gYFRWaWV3YCBnZXRzIHRoZSBgRGlyZWN0aXZlRGVmYC5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgYFRWaWV3YFxuICogQHBhcmFtIHROb2RlIGBUTm9kZWBcbiAqIEBwYXJhbSBsVmlldyBgTFZpZXdgXG4gKiBAcGFyYW0gZGlyZWN0aXZlSW5kZXggSW5kZXggd2hlcmUgdGhlIGRpcmVjdGl2ZSB3aWxsIGJlIHN0b3JlZCBpbiB0aGUgRXhwYW5kby5cbiAqIEBwYXJhbSBkZWYgYERpcmVjdGl2ZURlZmBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZVZpZXdXaXRoRGlyZWN0aXZlPFQ+KFxuICB0VmlldzogVFZpZXcsXG4gIHROb2RlOiBUTm9kZSxcbiAgbFZpZXc6IExWaWV3LFxuICBkaXJlY3RpdmVJbmRleDogbnVtYmVyLFxuICBkZWY6IERpcmVjdGl2ZURlZjxUPixcbik6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnRHcmVhdGVyVGhhbk9yRXF1YWwoZGlyZWN0aXZlSW5kZXgsIEhFQURFUl9PRkZTRVQsICdNdXN0IGJlIGluIEV4cGFuZG8gc2VjdGlvbicpO1xuICB0Vmlldy5kYXRhW2RpcmVjdGl2ZUluZGV4XSA9IGRlZjtcbiAgY29uc3QgZGlyZWN0aXZlRmFjdG9yeSA9XG4gICAgZGVmLmZhY3RvcnkgfHwgKChkZWYgYXMgV3JpdGFibGU8RGlyZWN0aXZlRGVmPFQ+PikuZmFjdG9yeSA9IGdldEZhY3RvcnlEZWYoZGVmLnR5cGUsIHRydWUpKTtcbiAgLy8gRXZlbiB0aG91Z2ggYGRpcmVjdGl2ZUZhY3RvcnlgIHdpbGwgYWxyZWFkeSBiZSB1c2luZyBgybXJtWRpcmVjdGl2ZUluamVjdGAgaW4gaXRzIGdlbmVyYXRlZCBjb2RlLFxuICAvLyB3ZSBhbHNvIHdhbnQgdG8gc3VwcG9ydCBgaW5qZWN0KClgIGRpcmVjdGx5IGZyb20gdGhlIGRpcmVjdGl2ZSBjb25zdHJ1Y3RvciBjb250ZXh0IHNvIHdlIHNldFxuICAvLyBgybXJtWRpcmVjdGl2ZUluamVjdGAgYXMgdGhlIGluamVjdCBpbXBsZW1lbnRhdGlvbiBoZXJlIHRvby5cbiAgY29uc3Qgbm9kZUluamVjdG9yRmFjdG9yeSA9IG5ldyBOb2RlSW5qZWN0b3JGYWN0b3J5KFxuICAgIGRpcmVjdGl2ZUZhY3RvcnksXG4gICAgaXNDb21wb25lbnREZWYoZGVmKSxcbiAgICDJtcm1ZGlyZWN0aXZlSW5qZWN0LFxuICApO1xuICB0Vmlldy5ibHVlcHJpbnRbZGlyZWN0aXZlSW5kZXhdID0gbm9kZUluamVjdG9yRmFjdG9yeTtcbiAgbFZpZXdbZGlyZWN0aXZlSW5kZXhdID0gbm9kZUluamVjdG9yRmFjdG9yeTtcblxuICByZWdpc3Rlckhvc3RCaW5kaW5nT3BDb2RlcyhcbiAgICB0VmlldyxcbiAgICB0Tm9kZSxcbiAgICBkaXJlY3RpdmVJbmRleCxcbiAgICBhbGxvY0V4cGFuZG8odFZpZXcsIGxWaWV3LCBkZWYuaG9zdFZhcnMsIE5PX0NIQU5HRSksXG4gICAgZGVmLFxuICApO1xufVxuXG5mdW5jdGlvbiBhZGRDb21wb25lbnRMb2dpYzxUPihsVmlldzogTFZpZXcsIGhvc3RUTm9kZTogVEVsZW1lbnROb2RlLCBkZWY6IENvbXBvbmVudERlZjxUPik6IHZvaWQge1xuICBjb25zdCBuYXRpdmUgPSBnZXROYXRpdmVCeVROb2RlKGhvc3RUTm9kZSwgbFZpZXcpIGFzIFJFbGVtZW50O1xuICBjb25zdCB0VmlldyA9IGdldE9yQ3JlYXRlQ29tcG9uZW50VFZpZXcoZGVmKTtcblxuICAvLyBPbmx5IGNvbXBvbmVudCB2aWV3cyBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHZpZXcgdHJlZSBkaXJlY3RseS4gRW1iZWRkZWQgdmlld3MgYXJlXG4gIC8vIGFjY2Vzc2VkIHRocm91Z2ggdGhlaXIgY29udGFpbmVycyBiZWNhdXNlIHRoZXkgbWF5IGJlIHJlbW92ZWQgLyByZS1hZGRlZCBsYXRlci5cbiAgY29uc3QgcmVuZGVyZXJGYWN0b3J5ID0gbFZpZXdbRU5WSVJPTk1FTlRdLnJlbmRlcmVyRmFjdG9yeTtcbiAgbGV0IGxWaWV3RmxhZ3MgPSBMVmlld0ZsYWdzLkNoZWNrQWx3YXlzO1xuICBpZiAoZGVmLnNpZ25hbHMpIHtcbiAgICBsVmlld0ZsYWdzID0gTFZpZXdGbGFncy5TaWduYWxWaWV3O1xuICB9IGVsc2UgaWYgKGRlZi5vblB1c2gpIHtcbiAgICBsVmlld0ZsYWdzID0gTFZpZXdGbGFncy5EaXJ0eTtcbiAgfVxuICBjb25zdCBjb21wb25lbnRWaWV3ID0gYWRkVG9WaWV3VHJlZShcbiAgICBsVmlldyxcbiAgICBjcmVhdGVMVmlldyhcbiAgICAgIGxWaWV3LFxuICAgICAgdFZpZXcsXG4gICAgICBudWxsLFxuICAgICAgbFZpZXdGbGFncyxcbiAgICAgIG5hdGl2ZSxcbiAgICAgIGhvc3RUTm9kZSBhcyBURWxlbWVudE5vZGUsXG4gICAgICBudWxsLFxuICAgICAgcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKG5hdGl2ZSwgZGVmKSxcbiAgICAgIG51bGwsXG4gICAgICBudWxsLFxuICAgICAgbnVsbCxcbiAgICApLFxuICApO1xuXG4gIC8vIENvbXBvbmVudCB2aWV3IHdpbGwgYWx3YXlzIGJlIGNyZWF0ZWQgYmVmb3JlIGFueSBpbmplY3RlZCBMQ29udGFpbmVycyxcbiAgLy8gc28gdGhpcyBpcyBhIHJlZ3VsYXIgZWxlbWVudCwgd3JhcCBpdCB3aXRoIHRoZSBjb21wb25lbnQgdmlld1xuICBsVmlld1tob3N0VE5vZGUuaW5kZXhdID0gY29tcG9uZW50Vmlldztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnRBdHRyaWJ1dGVJbnRlcm5hbChcbiAgdE5vZGU6IFROb2RlLFxuICBsVmlldzogTFZpZXcsXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IGFueSxcbiAgc2FuaXRpemVyOiBTYW5pdGl6ZXJGbiB8IG51bGwgfCB1bmRlZmluZWQsXG4gIG5hbWVzcGFjZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCxcbikge1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgYXNzZXJ0Tm90U2FtZSh2YWx1ZSwgTk9fQ0hBTkdFIGFzIGFueSwgJ0luY29taW5nIHZhbHVlIHNob3VsZCBuZXZlciBiZSBOT19DSEFOR0UuJyk7XG4gICAgdmFsaWRhdGVBZ2FpbnN0RXZlbnRBdHRyaWJ1dGVzKG5hbWUpO1xuICAgIGFzc2VydFROb2RlVHlwZShcbiAgICAgIHROb2RlLFxuICAgICAgVE5vZGVUeXBlLkVsZW1lbnQsXG4gICAgICBgQXR0ZW1wdGVkIHRvIHNldCBhdHRyaWJ1dGUgXFxgJHtuYW1lfVxcYCBvbiBhIGNvbnRhaW5lciBub2RlLiBgICtcbiAgICAgICAgYEhvc3QgYmluZGluZ3MgYXJlIG5vdCB2YWxpZCBvbiBuZy1jb250YWluZXIgb3IgbmctdGVtcGxhdGUuYCxcbiAgICApO1xuICB9XG4gIGNvbnN0IGVsZW1lbnQgPSBnZXROYXRpdmVCeVROb2RlKHROb2RlLCBsVmlldykgYXMgUkVsZW1lbnQ7XG4gIHNldEVsZW1lbnRBdHRyaWJ1dGUobFZpZXdbUkVOREVSRVJdLCBlbGVtZW50LCBuYW1lc3BhY2UsIHROb2RlLnZhbHVlLCBuYW1lLCB2YWx1ZSwgc2FuaXRpemVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEVsZW1lbnRBdHRyaWJ1dGUoXG4gIHJlbmRlcmVyOiBSZW5kZXJlcixcbiAgZWxlbWVudDogUkVsZW1lbnQsXG4gIG5hbWVzcGFjZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgdGFnTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogYW55LFxuICBzYW5pdGl6ZXI6IFNhbml0aXplckZuIHwgbnVsbCB8IHVuZGVmaW5lZCxcbikge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJSZW1vdmVBdHRyaWJ1dGUrKztcbiAgICByZW5kZXJlci5yZW1vdmVBdHRyaWJ1dGUoZWxlbWVudCwgbmFtZSwgbmFtZXNwYWNlKTtcbiAgfSBlbHNlIHtcbiAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyU2V0QXR0cmlidXRlKys7XG4gICAgY29uc3Qgc3RyVmFsdWUgPVxuICAgICAgc2FuaXRpemVyID09IG51bGwgPyByZW5kZXJTdHJpbmdpZnkodmFsdWUpIDogc2FuaXRpemVyKHZhbHVlLCB0YWdOYW1lIHx8ICcnLCBuYW1lKTtcblxuICAgIHJlbmRlcmVyLnNldEF0dHJpYnV0ZShlbGVtZW50LCBuYW1lLCBzdHJWYWx1ZSBhcyBzdHJpbmcsIG5hbWVzcGFjZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXRzIGluaXRpYWwgaW5wdXQgcHJvcGVydGllcyBvbiBkaXJlY3RpdmUgaW5zdGFuY2VzIGZyb20gYXR0cmlidXRlIGRhdGFcbiAqXG4gKiBAcGFyYW0gbFZpZXcgQ3VycmVudCBMVmlldyB0aGF0IGlzIGJlaW5nIHByb2Nlc3NlZC5cbiAqIEBwYXJhbSBkaXJlY3RpdmVJbmRleCBJbmRleCBvZiB0aGUgZGlyZWN0aXZlIGluIGRpcmVjdGl2ZXMgYXJyYXlcbiAqIEBwYXJhbSBpbnN0YW5jZSBJbnN0YW5jZSBvZiB0aGUgZGlyZWN0aXZlIG9uIHdoaWNoIHRvIHNldCB0aGUgaW5pdGlhbCBpbnB1dHNcbiAqIEBwYXJhbSBkZWYgVGhlIGRpcmVjdGl2ZSBkZWYgdGhhdCBjb250YWlucyB0aGUgbGlzdCBvZiBpbnB1dHNcbiAqIEBwYXJhbSB0Tm9kZSBUaGUgc3RhdGljIGRhdGEgZm9yIHRoaXMgbm9kZVxuICovXG5mdW5jdGlvbiBzZXRJbnB1dHNGcm9tQXR0cnM8VD4oXG4gIGxWaWV3OiBMVmlldyxcbiAgZGlyZWN0aXZlSW5kZXg6IG51bWJlcixcbiAgaW5zdGFuY2U6IFQsXG4gIGRlZjogRGlyZWN0aXZlRGVmPFQ+LFxuICB0Tm9kZTogVE5vZGUsXG4gIGluaXRpYWxJbnB1dERhdGE6IEluaXRpYWxJbnB1dERhdGEsXG4pOiB2b2lkIHtcbiAgY29uc3QgaW5pdGlhbElucHV0czogSW5pdGlhbElucHV0cyB8IG51bGwgPSBpbml0aWFsSW5wdXREYXRhIVtkaXJlY3RpdmVJbmRleF07XG4gIGlmIChpbml0aWFsSW5wdXRzICE9PSBudWxsKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbml0aWFsSW5wdXRzLmxlbmd0aDsgKSB7XG4gICAgICBjb25zdCBwdWJsaWNOYW1lID0gaW5pdGlhbElucHV0c1tpKytdIGFzIHN0cmluZztcbiAgICAgIGNvbnN0IHByaXZhdGVOYW1lID0gaW5pdGlhbElucHV0c1tpKytdIGFzIHN0cmluZztcbiAgICAgIGNvbnN0IGZsYWdzID0gaW5pdGlhbElucHV0c1tpKytdIGFzIElucHV0RmxhZ3M7XG4gICAgICBjb25zdCB2YWx1ZSA9IGluaXRpYWxJbnB1dHNbaSsrXSBhcyBzdHJpbmc7XG5cbiAgICAgIHdyaXRlVG9EaXJlY3RpdmVJbnB1dDxUPihkZWYsIGluc3RhbmNlLCBwdWJsaWNOYW1lLCBwcml2YXRlTmFtZSwgZmxhZ3MsIHZhbHVlKTtcblxuICAgICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZ2V0TmF0aXZlQnlUTm9kZSh0Tm9kZSwgbFZpZXcpIGFzIFJFbGVtZW50O1xuICAgICAgICBzZXROZ1JlZmxlY3RQcm9wZXJ0eShsVmlldywgbmF0aXZlRWxlbWVudCwgdE5vZGUudHlwZSwgcHJpdmF0ZU5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgaW5pdGlhbElucHV0RGF0YSBmb3IgYSBub2RlIGFuZCBzdG9yZXMgaXQgaW4gdGhlIHRlbXBsYXRlJ3Mgc3RhdGljIHN0b3JhZ2VcbiAqIHNvIHN1YnNlcXVlbnQgdGVtcGxhdGUgaW52b2NhdGlvbnMgZG9uJ3QgaGF2ZSB0byByZWNhbGN1bGF0ZSBpdC5cbiAqXG4gKiBpbml0aWFsSW5wdXREYXRhIGlzIGFuIGFycmF5IGNvbnRhaW5pbmcgdmFsdWVzIHRoYXQgbmVlZCB0byBiZSBzZXQgYXMgaW5wdXQgcHJvcGVydGllc1xuICogZm9yIGRpcmVjdGl2ZXMgb24gdGhpcyBub2RlLCBidXQgb25seSBvbmNlIG9uIGNyZWF0aW9uLiBXZSBuZWVkIHRoaXMgYXJyYXkgdG8gc3VwcG9ydFxuICogdGhlIGNhc2Ugd2hlcmUgeW91IHNldCBhbiBASW5wdXQgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmUgdXNpbmcgYXR0cmlidXRlLWxpa2Ugc3ludGF4LlxuICogZS5nLiBpZiB5b3UgaGF2ZSBhIGBuYW1lYCBASW5wdXQsIHlvdSBjYW4gc2V0IGl0IG9uY2UgbGlrZSB0aGlzOlxuICpcbiAqIDxteS1jb21wb25lbnQgbmFtZT1cIkJlc3NcIj48L215LWNvbXBvbmVudD5cbiAqXG4gKiBAcGFyYW0gaW5wdXRzIElucHV0IGFsaWFzIG1hcCB0aGF0IHdhcyBnZW5lcmF0ZWQgZnJvbSB0aGUgZGlyZWN0aXZlIGRlZiBpbnB1dHMuXG4gKiBAcGFyYW0gZGlyZWN0aXZlSW5kZXggSW5kZXggb2YgdGhlIGRpcmVjdGl2ZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBwcm9jZXNzZWQuXG4gKiBAcGFyYW0gYXR0cnMgU3RhdGljIGF0dHJzIG9uIHRoaXMgbm9kZS5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVJbml0aWFsSW5wdXRzKFxuICBpbnB1dHM6IE5vZGVJbnB1dEJpbmRpbmdzLFxuICBkaXJlY3RpdmVJbmRleDogbnVtYmVyLFxuICBhdHRyczogVEF0dHJpYnV0ZXMsXG4pOiBJbml0aWFsSW5wdXRzIHwgbnVsbCB7XG4gIGxldCBpbnB1dHNUb1N0b3JlOiBJbml0aWFsSW5wdXRzIHwgbnVsbCA9IG51bGw7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBhdHRycy5sZW5ndGgpIHtcbiAgICBjb25zdCBhdHRyTmFtZSA9IGF0dHJzW2ldO1xuICAgIGlmIChhdHRyTmFtZSA9PT0gQXR0cmlidXRlTWFya2VyLk5hbWVzcGFjZVVSSSkge1xuICAgICAgLy8gV2UgZG8gbm90IGFsbG93IGlucHV0cyBvbiBuYW1lc3BhY2VkIGF0dHJpYnV0ZXMuXG4gICAgICBpICs9IDQ7XG4gICAgICBjb250aW51ZTtcbiAgICB9IGVsc2UgaWYgKGF0dHJOYW1lID09PSBBdHRyaWJ1dGVNYXJrZXIuUHJvamVjdEFzKSB7XG4gICAgICAvLyBTa2lwIG92ZXIgdGhlIGBuZ1Byb2plY3RBc2AgdmFsdWUuXG4gICAgICBpICs9IDI7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBoaXQgYW55IG90aGVyIGF0dHJpYnV0ZSBtYXJrZXJzLCB3ZSdyZSBkb25lIGFueXdheS4gTm9uZSBvZiB0aG9zZSBhcmUgdmFsaWQgaW5wdXRzLlxuICAgIGlmICh0eXBlb2YgYXR0ck5hbWUgPT09ICdudW1iZXInKSBicmVhaztcblxuICAgIGlmIChpbnB1dHMuaGFzT3duUHJvcGVydHkoYXR0ck5hbWUgYXMgc3RyaW5nKSkge1xuICAgICAgaWYgKGlucHV0c1RvU3RvcmUgPT09IG51bGwpIGlucHV0c1RvU3RvcmUgPSBbXTtcblxuICAgICAgLy8gRmluZCB0aGUgaW5wdXQncyBwdWJsaWMgbmFtZSBmcm9tIHRoZSBpbnB1dCBzdG9yZS4gTm90ZSB0aGF0IHdlIGNhbiBiZSBmb3VuZCBlYXNpZXJcbiAgICAgIC8vIHRocm91Z2ggdGhlIGRpcmVjdGl2ZSBkZWYsIGJ1dCB3ZSB3YW50IHRvIGRvIGl0IHVzaW5nIHRoZSBpbnB1dHMgc3RvcmUgc28gdGhhdCBpdCBjYW5cbiAgICAgIC8vIGFjY291bnQgZm9yIGhvc3QgZGlyZWN0aXZlIGFsaWFzZXMuXG4gICAgICBjb25zdCBpbnB1dENvbmZpZyA9IGlucHV0c1thdHRyTmFtZSBhcyBzdHJpbmddO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBpbnB1dENvbmZpZy5sZW5ndGg7IGogKz0gMykge1xuICAgICAgICBpZiAoaW5wdXRDb25maWdbal0gPT09IGRpcmVjdGl2ZUluZGV4KSB7XG4gICAgICAgICAgaW5wdXRzVG9TdG9yZS5wdXNoKFxuICAgICAgICAgICAgYXR0ck5hbWUgYXMgc3RyaW5nLFxuICAgICAgICAgICAgaW5wdXRDb25maWdbaiArIDFdIGFzIHN0cmluZyxcbiAgICAgICAgICAgIGlucHV0Q29uZmlnW2ogKyAyXSBhcyBJbnB1dEZsYWdzLFxuICAgICAgICAgICAgYXR0cnNbaSArIDFdIGFzIHN0cmluZyxcbiAgICAgICAgICApO1xuICAgICAgICAgIC8vIEEgZGlyZWN0aXZlIGNhbid0IGhhdmUgbXVsdGlwbGUgaW5wdXRzIHdpdGggdGhlIHNhbWUgbmFtZSBzbyB3ZSBjYW4gYnJlYWsgaGVyZS5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGkgKz0gMjtcbiAgfVxuICByZXR1cm4gaW5wdXRzVG9TdG9yZTtcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8gVmlld0NvbnRhaW5lciAmIFZpZXdcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogQ3JlYXRlcyBhIExDb250YWluZXIsIGVpdGhlciBmcm9tIGEgY29udGFpbmVyIGluc3RydWN0aW9uLCBvciBmb3IgYSBWaWV3Q29udGFpbmVyUmVmLlxuICpcbiAqIEBwYXJhbSBob3N0TmF0aXZlIFRoZSBob3N0IGVsZW1lbnQgZm9yIHRoZSBMQ29udGFpbmVyXG4gKiBAcGFyYW0gaG9zdFROb2RlIFRoZSBob3N0IFROb2RlIGZvciB0aGUgTENvbnRhaW5lclxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBwYXJlbnQgdmlldyBvZiB0aGUgTENvbnRhaW5lclxuICogQHBhcmFtIG5hdGl2ZSBUaGUgbmF0aXZlIGNvbW1lbnQgZWxlbWVudFxuICogQHBhcmFtIGlzRm9yVmlld0NvbnRhaW5lclJlZiBPcHRpb25hbCBhIGZsYWcgaW5kaWNhdGluZyB0aGUgVmlld0NvbnRhaW5lclJlZiBjYXNlXG4gKiBAcmV0dXJucyBMQ29udGFpbmVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMQ29udGFpbmVyKFxuICBob3N0TmF0aXZlOiBSRWxlbWVudCB8IFJDb21tZW50IHwgTFZpZXcsXG4gIGN1cnJlbnRWaWV3OiBMVmlldyxcbiAgbmF0aXZlOiBSQ29tbWVudCxcbiAgdE5vZGU6IFROb2RlLFxuKTogTENvbnRhaW5lciB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMVmlldyhjdXJyZW50Vmlldyk7XG4gIGNvbnN0IGxDb250YWluZXI6IExDb250YWluZXIgPSBbXG4gICAgaG9zdE5hdGl2ZSwgLy8gaG9zdCBuYXRpdmVcbiAgICB0cnVlLCAvLyBCb29sZWFuIGB0cnVlYCBpbiB0aGlzIHBvc2l0aW9uIHNpZ25pZmllcyB0aGF0IHRoaXMgaXMgYW4gYExDb250YWluZXJgXG4gICAgMCwgLy8gZmxhZ3NcbiAgICBjdXJyZW50VmlldywgLy8gcGFyZW50XG4gICAgbnVsbCwgLy8gbmV4dFxuICAgIHROb2RlLCAvLyB0X2hvc3RcbiAgICBudWxsLCAvLyBkZWh5ZHJhdGVkIHZpZXdzXG4gICAgbmF0aXZlLCAvLyBuYXRpdmUsXG4gICAgbnVsbCwgLy8gdmlldyByZWZzXG4gICAgbnVsbCwgLy8gbW92ZWQgdmlld3NcbiAgXTtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0RXF1YWwoXG4gICAgICBsQ29udGFpbmVyLmxlbmd0aCxcbiAgICAgIENPTlRBSU5FUl9IRUFERVJfT0ZGU0VULFxuICAgICAgJ1Nob3VsZCBhbGxvY2F0ZSBjb3JyZWN0IG51bWJlciBvZiBzbG90cyBmb3IgTENvbnRhaW5lciBoZWFkZXIuJyxcbiAgICApO1xuICByZXR1cm4gbENvbnRhaW5lcjtcbn1cblxuLyoqIFJlZnJlc2hlcyBhbGwgY29udGVudCBxdWVyaWVzIGRlY2xhcmVkIGJ5IGRpcmVjdGl2ZXMgaW4gYSBnaXZlbiB2aWV3ICovXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaENvbnRlbnRRdWVyaWVzKHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3KTogdm9pZCB7XG4gIGNvbnN0IGNvbnRlbnRRdWVyaWVzID0gdFZpZXcuY29udGVudFF1ZXJpZXM7XG4gIGlmIChjb250ZW50UXVlcmllcyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHByZXZDb25zdW1lciA9IHNldEFjdGl2ZUNvbnN1bWVyKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnRRdWVyaWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RhcnRJZHggPSBjb250ZW50UXVlcmllc1tpXTtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlRGVmSWR4ID0gY29udGVudFF1ZXJpZXNbaSArIDFdO1xuICAgICAgICBpZiAoZGlyZWN0aXZlRGVmSWR4ICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZURlZiA9IHRWaWV3LmRhdGFbZGlyZWN0aXZlRGVmSWR4XSBhcyBEaXJlY3RpdmVEZWY8YW55PjtcbiAgICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChkaXJlY3RpdmVEZWYsICdEaXJlY3RpdmVEZWYgbm90IGZvdW5kLicpO1xuICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgYXNzZXJ0RGVmaW5lZChkaXJlY3RpdmVEZWYuY29udGVudFF1ZXJpZXMsICdjb250ZW50UXVlcmllcyBmdW5jdGlvbiBzaG91bGQgYmUgZGVmaW5lZCcpO1xuICAgICAgICAgIHNldEN1cnJlbnRRdWVyeUluZGV4KHF1ZXJ5U3RhcnRJZHgpO1xuICAgICAgICAgIGRpcmVjdGl2ZURlZi5jb250ZW50UXVlcmllcyEoUmVuZGVyRmxhZ3MuVXBkYXRlLCBsVmlld1tkaXJlY3RpdmVEZWZJZHhdLCBkaXJlY3RpdmVEZWZJZHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkcyBMVmlldyBvciBMQ29udGFpbmVyIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgdmlldyB0cmVlLlxuICpcbiAqIFRoaXMgc3RydWN0dXJlIHdpbGwgYmUgdXNlZCB0byB0cmF2ZXJzZSB0aHJvdWdoIG5lc3RlZCB2aWV3cyB0byByZW1vdmUgbGlzdGVuZXJzXG4gKiBhbmQgY2FsbCBvbkRlc3Ryb3kgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSBsVmlldyBUaGUgdmlldyB3aGVyZSBMVmlldyBvciBMQ29udGFpbmVyIHNob3VsZCBiZSBhZGRlZFxuICogQHBhcmFtIGFkanVzdGVkSG9zdEluZGV4IEluZGV4IG9mIHRoZSB2aWV3J3MgaG9zdCBub2RlIGluIExWaWV3W10sIGFkanVzdGVkIGZvciBoZWFkZXJcbiAqIEBwYXJhbSBsVmlld09yTENvbnRhaW5lciBUaGUgTFZpZXcgb3IgTENvbnRhaW5lciB0byBhZGQgdG8gdGhlIHZpZXcgdHJlZVxuICogQHJldHVybnMgVGhlIHN0YXRlIHBhc3NlZCBpblxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9WaWV3VHJlZTxUIGV4dGVuZHMgTFZpZXcgfCBMQ29udGFpbmVyPihsVmlldzogTFZpZXcsIGxWaWV3T3JMQ29udGFpbmVyOiBUKTogVCB7XG4gIC8vIFRPRE8oYmVubGVzaC9taXNrbyk6IFRoaXMgaW1wbGVtZW50YXRpb24gaXMgaW5jb3JyZWN0LCBiZWNhdXNlIGl0IGFsd2F5cyBhZGRzIHRoZSBMQ29udGFpbmVyXG4gIC8vIHRvIHRoZSBlbmQgb2YgdGhlIHF1ZXVlLCB3aGljaCBtZWFucyBpZiB0aGUgZGV2ZWxvcGVyIHJldHJpZXZlcyB0aGUgTENvbnRhaW5lcnMgZnJvbSBSTm9kZXMgb3V0XG4gIC8vIG9mIG9yZGVyLCB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aWxsIHJ1biBvdXQgb2Ygb3JkZXIsIGFzIHRoZSBhY3Qgb2YgcmV0cmlldmluZyB0aGUgdGhlXG4gIC8vIExDb250YWluZXIgZnJvbSB0aGUgUk5vZGUgaXMgd2hhdCBhZGRzIGl0IHRvIHRoZSBxdWV1ZS5cbiAgaWYgKGxWaWV3W0NISUxEX0hFQURdKSB7XG4gICAgbFZpZXdbQ0hJTERfVEFJTF0hW05FWFRdID0gbFZpZXdPckxDb250YWluZXI7XG4gIH0gZWxzZSB7XG4gICAgbFZpZXdbQ0hJTERfSEVBRF0gPSBsVmlld09yTENvbnRhaW5lcjtcbiAgfVxuICBsVmlld1tDSElMRF9UQUlMXSA9IGxWaWV3T3JMQ29udGFpbmVyO1xuICByZXR1cm4gbFZpZXdPckxDb250YWluZXI7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8gQ2hhbmdlIGRldGVjdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZVZpZXdRdWVyeUZuPFQ+KFxuICBmbGFnczogUmVuZGVyRmxhZ3MsXG4gIHZpZXdRdWVyeUZuOiBWaWV3UXVlcmllc0Z1bmN0aW9uPFQ+LFxuICBjb21wb25lbnQ6IFQsXG4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQodmlld1F1ZXJ5Rm4sICdWaWV3IHF1ZXJpZXMgZnVuY3Rpb24gdG8gZXhlY3V0ZSBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIHNldEN1cnJlbnRRdWVyeUluZGV4KDApO1xuICBjb25zdCBwcmV2Q29uc3VtZXIgPSBzZXRBY3RpdmVDb25zdW1lcihudWxsKTtcbiAgdHJ5IHtcbiAgICB2aWV3UXVlcnlGbihmbGFncywgY29tcG9uZW50KTtcbiAgfSBmaW5hbGx5IHtcbiAgICBzZXRBY3RpdmVDb25zdW1lcihwcmV2Q29uc3VtZXIpO1xuICB9XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8gQmluZGluZ3MgJiBpbnRlcnBvbGF0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIFN0b3JlcyBtZXRhLWRhdGEgZm9yIGEgcHJvcGVydHkgYmluZGluZyB0byBiZSB1c2VkIGJ5IFRlc3RCZWQncyBgRGVidWdFbGVtZW50LnByb3BlcnRpZXNgLlxuICpcbiAqIEluIG9yZGVyIHRvIHN1cHBvcnQgVGVzdEJlZCdzIGBEZWJ1Z0VsZW1lbnQucHJvcGVydGllc2Agd2UgbmVlZCB0byBzYXZlLCBmb3IgZWFjaCBiaW5kaW5nOlxuICogLSBhIGJvdW5kIHByb3BlcnR5IG5hbWU7XG4gKiAtIGEgc3RhdGljIHBhcnRzIG9mIGludGVycG9sYXRlZCBzdHJpbmdzO1xuICpcbiAqIEEgZ2l2ZW4gcHJvcGVydHkgbWV0YWRhdGEgaXMgc2F2ZWQgYXQgdGhlIGJpbmRpbmcncyBpbmRleCBpbiB0aGUgYFRWaWV3LmRhdGFgIChpbiBvdGhlciB3b3JkcywgYVxuICogcHJvcGVydHkgYmluZGluZyBtZXRhZGF0YSB3aWxsIGJlIHN0b3JlZCBpbiBgVFZpZXcuZGF0YWAgYXQgdGhlIHNhbWUgaW5kZXggYXMgYSBib3VuZCB2YWx1ZSBpblxuICogYExWaWV3YCkuIE1ldGFkYXRhIGFyZSByZXByZXNlbnRlZCBhcyBgSU5URVJQT0xBVElPTl9ERUxJTUlURVJgLWRlbGltaXRlZCBzdHJpbmcgd2l0aCB0aGVcbiAqIGZvbGxvd2luZyBmb3JtYXQ6XG4gKiAtIGBwcm9wZXJ0eU5hbWVgIGZvciBib3VuZCBwcm9wZXJ0aWVzO1xuICogLSBgcHJvcGVydHlOYW1l77+9cHJlZml477+9aW50ZXJwb2xhdGlvbl9zdGF0aWNfcGFydDHvv70uLmludGVycG9sYXRpb25fc3RhdGljX3BhcnRO77+9c3VmZml4YCBmb3JcbiAqIGludGVycG9sYXRlZCBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB0RGF0YSBgVERhdGFgIHdoZXJlIG1ldGEtZGF0YSB3aWxsIGJlIHNhdmVkO1xuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgdGhhdCBpcyBhIHRhcmdldCBvZiB0aGUgYmluZGluZztcbiAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgYm91bmQgcHJvcGVydHkgbmFtZTtcbiAqIEBwYXJhbSBiaW5kaW5nSW5kZXggYmluZGluZyBpbmRleCBpbiBgTFZpZXdgXG4gKiBAcGFyYW0gaW50ZXJwb2xhdGlvblBhcnRzIHN0YXRpYyBpbnRlcnBvbGF0aW9uIHBhcnRzIChmb3IgcHJvcGVydHkgaW50ZXJwb2xhdGlvbnMpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZVByb3BlcnR5QmluZGluZ01ldGFkYXRhKFxuICB0RGF0YTogVERhdGEsXG4gIHROb2RlOiBUTm9kZSxcbiAgcHJvcGVydHlOYW1lOiBzdHJpbmcsXG4gIGJpbmRpbmdJbmRleDogbnVtYmVyLFxuICAuLi5pbnRlcnBvbGF0aW9uUGFydHM6IHN0cmluZ1tdXG4pIHtcbiAgLy8gQmluZGluZyBtZXRhLWRhdGEgYXJlIHN0b3JlZCBvbmx5IHRoZSBmaXJzdCB0aW1lIGEgZ2l2ZW4gcHJvcGVydHkgaW5zdHJ1Y3Rpb24gaXMgcHJvY2Vzc2VkLlxuICAvLyBTaW5jZSB3ZSBkb24ndCBoYXZlIGEgY29uY2VwdCBvZiB0aGUgXCJmaXJzdCB1cGRhdGUgcGFzc1wiIHdlIG5lZWQgdG8gY2hlY2sgZm9yIHByZXNlbmNlIG9mIHRoZVxuICAvLyBiaW5kaW5nIG1ldGEtZGF0YSB0byBkZWNpZGUgaWYgb25lIHNob3VsZCBiZSBzdG9yZWQgKG9yIGlmIHdhcyBzdG9yZWQgYWxyZWFkeSkuXG4gIGlmICh0RGF0YVtiaW5kaW5nSW5kZXhdID09PSBudWxsKSB7XG4gICAgaWYgKHROb2RlLmlucHV0cyA9PSBudWxsIHx8ICF0Tm9kZS5pbnB1dHNbcHJvcGVydHlOYW1lXSkge1xuICAgICAgY29uc3QgcHJvcEJpbmRpbmdJZHhzID0gdE5vZGUucHJvcGVydHlCaW5kaW5ncyB8fCAodE5vZGUucHJvcGVydHlCaW5kaW5ncyA9IFtdKTtcbiAgICAgIHByb3BCaW5kaW5nSWR4cy5wdXNoKGJpbmRpbmdJbmRleCk7XG4gICAgICBsZXQgYmluZGluZ01ldGFkYXRhID0gcHJvcGVydHlOYW1lO1xuICAgICAgaWYgKGludGVycG9sYXRpb25QYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGJpbmRpbmdNZXRhZGF0YSArPVxuICAgICAgICAgIElOVEVSUE9MQVRJT05fREVMSU1JVEVSICsgaW50ZXJwb2xhdGlvblBhcnRzLmpvaW4oSU5URVJQT0xBVElPTl9ERUxJTUlURVIpO1xuICAgICAgfVxuICAgICAgdERhdGFbYmluZGluZ0luZGV4XSA9IGJpbmRpbmdNZXRhZGF0YTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlTFZpZXdDbGVhbnVwKHZpZXc6IExWaWV3KTogYW55W10ge1xuICAvLyB0b3AgbGV2ZWwgdmFyaWFibGVzIHNob3VsZCBub3QgYmUgZXhwb3J0ZWQgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgKFBFUkZfTk9URVMubWQpXG4gIHJldHVybiAodmlld1tDTEVBTlVQXSA/Pz0gW10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JDcmVhdGVUVmlld0NsZWFudXAodFZpZXc6IFRWaWV3KTogYW55W10ge1xuICByZXR1cm4gKHRWaWV3LmNsZWFudXAgPz89IFtdKTtcbn1cblxuLyoqXG4gKiBUaGVyZSBhcmUgY2FzZXMgd2hlcmUgdGhlIHN1YiBjb21wb25lbnQncyByZW5kZXJlciBuZWVkcyB0byBiZSBpbmNsdWRlZFxuICogaW5zdGVhZCBvZiB0aGUgY3VycmVudCByZW5kZXJlciAoc2VlIHRoZSBjb21wb25lbnRTeW50aGV0aWNIb3N0KiBpbnN0cnVjdGlvbnMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZENvbXBvbmVudFJlbmRlcmVyKFxuICBjdXJyZW50RGVmOiBEaXJlY3RpdmVEZWY8YW55PiB8IG51bGwsXG4gIHROb2RlOiBUTm9kZSxcbiAgbFZpZXc6IExWaWV3LFxuKTogUmVuZGVyZXIge1xuICAvLyBUT0RPKEZXLTIwNDMpOiB0aGUgYGN1cnJlbnREZWZgIGlzIG51bGwgd2hlbiBob3N0IGJpbmRpbmdzIGFyZSBpbnZva2VkIHdoaWxlIGNyZWF0aW5nIHJvb3RcbiAgLy8gY29tcG9uZW50IChzZWUgcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMpLiBUaGlzIGlzIG5vdCBjb25zaXN0ZW50IHdpdGggdGhlIHByb2Nlc3NcbiAgLy8gb2YgY3JlYXRpbmcgaW5uZXIgY29tcG9uZW50cywgd2hlbiBjdXJyZW50IGRpcmVjdGl2ZSBpbmRleCBpcyBhdmFpbGFibGUgaW4gdGhlIHN0YXRlLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCByZWx5aW5nIG9uIGN1cnJlbnQgZGVmIGJlaW5nIGBudWxsYCAodGh1cyBzcGVjaWFsLWNhc2luZyByb290IGNvbXBvbmVudCBjcmVhdGlvbiksIHRoZVxuICAvLyBwcm9jZXNzIG9mIGNyZWF0aW5nIHJvb3QgY29tcG9uZW50IHNob3VsZCBiZSB1bmlmaWVkIHdpdGggdGhlIHByb2Nlc3Mgb2YgY3JlYXRpbmcgaW5uZXJcbiAgLy8gY29tcG9uZW50cy5cbiAgaWYgKGN1cnJlbnREZWYgPT09IG51bGwgfHwgaXNDb21wb25lbnREZWYoY3VycmVudERlZikpIHtcbiAgICBsVmlldyA9IHVud3JhcExWaWV3KGxWaWV3W3ROb2RlLmluZGV4XSkhO1xuICB9XG4gIHJldHVybiBsVmlld1tSRU5ERVJFUl07XG59XG5cbi8qKiBIYW5kbGVzIGFuIGVycm9yIHRocm93biBpbiBhbiBMVmlldy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVFcnJvcihsVmlldzogTFZpZXcsIGVycm9yOiBhbnkpOiB2b2lkIHtcbiAgY29uc3QgaW5qZWN0b3IgPSBsVmlld1tJTkpFQ1RPUl07XG4gIGNvbnN0IGVycm9ySGFuZGxlciA9IGluamVjdG9yID8gaW5qZWN0b3IuZ2V0KEVycm9ySGFuZGxlciwgbnVsbCkgOiBudWxsO1xuICBlcnJvckhhbmRsZXIgJiYgZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKGVycm9yKTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGlucHV0cyBvZiBkaXJlY3RpdmVzIGF0IHRoZSBjdXJyZW50IG5vZGUgdG8gY29ycmVzcG9uZGluZyB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgVGhlIGN1cnJlbnQgVFZpZXdcbiAqIEBwYXJhbSBsVmlldyB0aGUgYExWaWV3YCB3aGljaCBjb250YWlucyB0aGUgZGlyZWN0aXZlcy5cbiAqIEBwYXJhbSBpbnB1dHMgbWFwcGluZyBiZXR3ZWVuIHRoZSBwdWJsaWMgXCJpbnB1dFwiIG5hbWUgYW5kIHByaXZhdGVseS1rbm93bixcbiAqICAgICAgICBwb3NzaWJseSBtaW5pZmllZCwgcHJvcGVydHkgbmFtZXMgdG8gd3JpdGUgdG8uXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gc2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0SW5wdXRzRm9yUHJvcGVydHkoXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3LFxuICBpbnB1dHM6IE5vZGVJbnB1dEJpbmRpbmdzW3R5cGVvZiBwdWJsaWNOYW1lXSxcbiAgcHVibGljTmFtZTogc3RyaW5nLFxuICB2YWx1ZTogdW5rbm93bixcbik6IHZvaWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7ICkge1xuICAgIGNvbnN0IGluZGV4ID0gaW5wdXRzW2krK10gYXMgbnVtYmVyO1xuICAgIGNvbnN0IHByaXZhdGVOYW1lID0gaW5wdXRzW2krK10gYXMgc3RyaW5nO1xuICAgIGNvbnN0IGZsYWdzID0gaW5wdXRzW2krK10gYXMgSW5wdXRGbGFncztcbiAgICBjb25zdCBpbnN0YW5jZSA9IGxWaWV3W2luZGV4XTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0SW5kZXhJblJhbmdlKGxWaWV3LCBpbmRleCk7XG4gICAgY29uc3QgZGVmID0gdFZpZXcuZGF0YVtpbmRleF0gYXMgRGlyZWN0aXZlRGVmPGFueT47XG5cbiAgICB3cml0ZVRvRGlyZWN0aXZlSW5wdXQoZGVmLCBpbnN0YW5jZSwgcHVibGljTmFtZSwgcHJpdmF0ZU5hbWUsIGZsYWdzLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBVcGRhdGVzIGEgdGV4dCBiaW5kaW5nIGF0IGEgZ2l2ZW4gaW5kZXggaW4gYSBnaXZlbiBMVmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRleHRCaW5kaW5nSW50ZXJuYWwobFZpZXc6IExWaWV3LCBpbmRleDogbnVtYmVyLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRTdHJpbmcodmFsdWUsICdWYWx1ZSBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydE5vdFNhbWUodmFsdWUsIE5PX0NIQU5HRSBhcyBhbnksICd2YWx1ZSBzaG91bGQgbm90IGJlIE5PX0NIQU5HRScpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0SW5kZXhJblJhbmdlKGxWaWV3LCBpbmRleCk7XG4gIGNvbnN0IGVsZW1lbnQgPSBnZXROYXRpdmVCeUluZGV4KGluZGV4LCBsVmlldykgYXMgYW55IGFzIFJUZXh0O1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChlbGVtZW50LCAnbmF0aXZlIGVsZW1lbnQgc2hvdWxkIGV4aXN0Jyk7XG4gIHVwZGF0ZVRleHROb2RlKGxWaWV3W1JFTkRFUkVSXSwgZWxlbWVudCwgdmFsdWUpO1xufVxuIl19
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { isForwardRef, resolveForwardRef } from '../di/forward_ref';
import { injectRootLimpMode, setInjectImplementation } from '../di/inject_switch';
import { convertToBitFlags } from '../di/injector_compatibility';
import { InjectFlags } from '../di/interface/injector';
import { assertDefined, assertEqual, assertIndexInRange } from '../util/assert';
import { noSideEffects } from '../util/closure';
import { assertDirectiveDef, assertNodeInjector, assertTNodeForLView } from './assert';
import { emitInstanceCreatedByInjectorEvent, runInInjectorProfilerContext, setInjectorProfilerContext, } from './debug/injector_profiler';
import { getFactoryDef } from './definition_factory';
import { throwCyclicDependencyError, throwProviderNotFoundError } from './errors_di';
import { NG_ELEMENT_ID, NG_FACTORY_DEF } from './fields';
import { registerPreOrderHooks } from './hooks';
import { isFactory, NO_PARENT_INJECTOR, } from './interfaces/injector';
import { isComponentDef, isComponentHost } from './interfaces/type_checks';
import { DECLARATION_COMPONENT_VIEW, DECLARATION_VIEW, EMBEDDED_VIEW_INJECTOR, FLAGS, INJECTOR, T_HOST, TVIEW, } from './interfaces/view';
import { assertTNodeType } from './node_assert';
import { enterDI, getCurrentTNode, getLView, leaveDI } from './state';
import { isNameOnlyAttributeMarker } from './util/attrs_utils';
import { getParentInjectorIndex, getParentInjectorView, hasParentInjector, } from './util/injector_utils';
import { stringifyForError } from './util/stringify_utils';
/**
 * Defines if the call to `inject` should include `viewProviders` in its resolution.
 *
 * This is set to true when we try to instantiate a component. This value is reset in
 * `getNodeInjectable` to a value which matches the declaration location of the token about to be
 * instantiated. This is done so that if we are injecting a token which was declared outside of
 * `viewProviders` we don't accidentally pull `viewProviders` in.
 *
 * Example:
 *
 * ```
 * @Injectable()
 * class MyService {
 *   constructor(public value: String) {}
 * }
 *
 * @Component({
 *   providers: [
 *     MyService,
 *     {provide: String, value: 'providers' }
 *   ]
 *   viewProviders: [
 *     {provide: String, value: 'viewProviders'}
 *   ]
 * })
 * class MyComponent {
 *   constructor(myService: MyService, value: String) {
 *     // We expect that Component can see into `viewProviders`.
 *     expect(value).toEqual('viewProviders');
 *     // `MyService` was not declared in `viewProviders` hence it can't see it.
 *     expect(myService.value).toEqual('providers');
 *   }
 * }
 *
 * ```
 */
let includeViewProviders = true;
export function setIncludeViewProviders(v) {
    const oldValue = includeViewProviders;
    includeViewProviders = v;
    return oldValue;
}
/**
 * The number of slots in each bloom filter (used by DI). The larger this number, the fewer
 * directives that will share slots, and thus, the fewer false positives when checking for
 * the existence of a directive.
 */
const BLOOM_SIZE = 256;
const BLOOM_MASK = BLOOM_SIZE - 1;
/**
 * The number of bits that is represented by a single bloom bucket. JS bit operations are 32 bits,
 * so each bucket represents 32 distinct tokens which accounts for log2(32) = 5 bits of a bloom hash
 * number.
 */
const BLOOM_BUCKET_BITS = 5;
/** Counter used to generate unique IDs for directives. */
let nextNgElementId = 0;
/** Value used when something wasn't found by an injector. */
const NOT_FOUND = {};
/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injectorIndex The index of the node injector where this token should be registered
 * @param tView The TView for the injector's bloom filters
 * @param type The directive token to register
 */
export function bloomAdd(injectorIndex, tView, type) {
    ngDevMode && assertEqual(tView.firstCreatePass, true, 'expected firstCreatePass to be true');
    let id;
    if (typeof type === 'string') {
        id = type.charCodeAt(0) || 0;
    }
    else if (type.hasOwnProperty(NG_ELEMENT_ID)) {
        id = type[NG_ELEMENT_ID];
    }
    // Set a unique ID on the directive type, so if something tries to inject the directive,
    // we can easily retrieve the ID and hash it into the bloom bit that should be checked.
    if (id == null) {
        id = type[NG_ELEMENT_ID] = nextNgElementId++;
    }
    // We only have BLOOM_SIZE (256) slots in our bloom filter (8 buckets * 32 bits each),
    // so all unique IDs must be modulo-ed into a number from 0 - 255 to fit into the filter.
    const bloomHash = id & BLOOM_MASK;
    // Create a mask that targets the specific bit associated with the directive.
    // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
    // to bit positions 0 - 31 in a 32 bit integer.
    const mask = 1 << bloomHash;
    // Each bloom bucket in `tData` represents `BLOOM_BUCKET_BITS` number of bits of `bloomHash`.
    // Any bits in `bloomHash` beyond `BLOOM_BUCKET_BITS` indicate the bucket offset that the mask
    // should be written to.
    tView.data[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)] |= mask;
}
/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param tNode for which an injector should be retrieved / created.
 * @param lView View where the node is stored
 * @returns Node injector
 */
export function getOrCreateNodeInjectorForNode(tNode, lView) {
    const existingInjectorIndex = getInjectorIndex(tNode, lView);
    if (existingInjectorIndex !== -1) {
        return existingInjectorIndex;
    }
    const tView = lView[TVIEW];
    if (tView.firstCreatePass) {
        tNode.injectorIndex = lView.length;
        insertBloom(tView.data, tNode); // foundation for node bloom
        insertBloom(lView, null); // foundation for cumulative bloom
        insertBloom(tView.blueprint, null);
    }
    const parentLoc = getParentInjectorLocation(tNode, lView);
    const injectorIndex = tNode.injectorIndex;
    // If a parent injector can't be found, its location is set to -1.
    // In that case, we don't need to set up a cumulative bloom
    if (hasParentInjector(parentLoc)) {
        const parentIndex = getParentInjectorIndex(parentLoc);
        const parentLView = getParentInjectorView(parentLoc, lView);
        const parentData = parentLView[TVIEW].data;
        // Creates a cumulative bloom filter that merges the parent's bloom filter
        // and its own cumulative bloom (which contains tokens for all ancestors)
        for (let i = 0; i < 8 /* NodeInjectorOffset.BLOOM_SIZE */; i++) {
            lView[injectorIndex + i] = parentLView[parentIndex + i] | parentData[parentIndex + i];
        }
    }
    lView[injectorIndex + 8 /* NodeInjectorOffset.PARENT */] = parentLoc;
    return injectorIndex;
}
function insertBloom(arr, footer) {
    arr.push(0, 0, 0, 0, 0, 0, 0, 0, footer);
}
export function getInjectorIndex(tNode, lView) {
    if (tNode.injectorIndex === -1 ||
        // If the injector index is the same as its parent's injector index, then the index has been
        // copied down from the parent node. No injector has been created yet on this node.
        (tNode.parent && tNode.parent.injectorIndex === tNode.injectorIndex) ||
        // After the first template pass, the injector index might exist but the parent values
        // might not have been calculated yet for this instance
        lView[tNode.injectorIndex + 8 /* NodeInjectorOffset.PARENT */] === null) {
        return -1;
    }
    else {
        ngDevMode && assertIndexInRange(lView, tNode.injectorIndex);
        return tNode.injectorIndex;
    }
}
/**
 * Finds the index of the parent injector, with a view offset if applicable. Used to set the
 * parent injector initially.
 *
 * @returns Returns a number that is the combination of the number of LViews that we have to go up
 * to find the LView containing the parent inject AND the index of the injector within that LView.
 */
export function getParentInjectorLocation(tNode, lView) {
    if (tNode.parent && tNode.parent.injectorIndex !== -1) {
        // If we have a parent `TNode` and there is an injector associated with it we are done, because
        // the parent injector is within the current `LView`.
        return tNode.parent.injectorIndex; // ViewOffset is 0
    }
    // When parent injector location is computed it may be outside of the current view. (ie it could
    // be pointing to a declared parent location). This variable stores number of declaration parents
    // we need to walk up in order to find the parent injector location.
    let declarationViewOffset = 0;
    let parentTNode = null;
    let lViewCursor = lView;
    // The parent injector is not in the current `LView`. We will have to walk the declared parent
    // `LView` hierarchy and look for it. If we walk of the top, that means that there is no parent
    // `NodeInjector`.
    while (lViewCursor !== null) {
        parentTNode = getTNodeFromLView(lViewCursor);
        if (parentTNode === null) {
            // If we have no parent, than we are done.
            return NO_PARENT_INJECTOR;
        }
        ngDevMode && parentTNode && assertTNodeForLView(parentTNode, lViewCursor[DECLARATION_VIEW]);
        // Every iteration of the loop requires that we go to the declared parent.
        declarationViewOffset++;
        lViewCursor = lViewCursor[DECLARATION_VIEW];
        if (parentTNode.injectorIndex !== -1) {
            // We found a NodeInjector which points to something.
            return (parentTNode.injectorIndex |
                (declarationViewOffset <<
                    16 /* RelativeInjectorLocationFlags.ViewOffsetShift */));
        }
    }
    return NO_PARENT_INJECTOR;
}
/**
 * Makes a type or an injection token public to the DI system by adding it to an
 * injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param token The type or the injection token to be made public
 */
export function diPublicInInjector(injectorIndex, tView, token) {
    bloomAdd(injectorIndex, tView, token);
}
/**
 * Inject static attribute value into directive constructor.
 *
 * This method is used with `factory` functions which are generated as part of
 * `defineDirective` or `defineComponent`. The method retrieves the static value
 * of an attribute. (Dynamic attributes are not supported since they are not resolved
 *  at the time of injection and can change over time.)
 *
 * # Example
 * Given:
 * ```
 * @Component(...)
 * class MyComponent {
 *   constructor(@Attribute('title') title: string) { ... }
 * }
 * ```
 * When instantiated with
 * ```
 * <my-component title="Hello"></my-component>
 * ```
 *
 * Then factory method generated is:
 * ```
 * MyComponent.ɵcmp = defineComponent({
 *   factory: () => new MyComponent(injectAttribute('title'))
 *   ...
 * })
 * ```
 *
 * @publicApi
 */
export function injectAttributeImpl(tNode, attrNameToInject) {
    ngDevMode && assertTNodeType(tNode, 12 /* TNodeType.AnyContainer */ | 3 /* TNodeType.AnyRNode */);
    ngDevMode && assertDefined(tNode, 'expecting tNode');
    if (attrNameToInject === 'class') {
        return tNode.classes;
    }
    if (attrNameToInject === 'style') {
        return tNode.styles;
    }
    const attrs = tNode.attrs;
    if (attrs) {
        const attrsLength = attrs.length;
        let i = 0;
        while (i < attrsLength) {
            const value = attrs[i];
            // If we hit a `Bindings` or `Template` marker then we are done.
            if (isNameOnlyAttributeMarker(value))
                break;
            // Skip namespaced attributes
            if (value === 0 /* AttributeMarker.NamespaceURI */) {
                // we skip the next two values
                // as namespaced attributes looks like
                // [..., AttributeMarker.NamespaceURI, 'http://someuri.com/test', 'test:exist',
                // 'existValue', ...]
                i = i + 2;
            }
            else if (typeof value === 'number') {
                // Skip to the first value of the marked attribute.
                i++;
                while (i < attrsLength && typeof attrs[i] === 'string') {
                    i++;
                }
            }
            else if (value === attrNameToInject) {
                return attrs[i + 1];
            }
            else {
                i = i + 2;
            }
        }
    }
    return null;
}
function notFoundValueOrThrow(notFoundValue, token, flags) {
    if (flags & InjectFlags.Optional || notFoundValue !== undefined) {
        return notFoundValue;
    }
    else {
        throwProviderNotFoundError(token, 'NodeInjector');
    }
}
/**
 * Returns the value associated to the given token from the ModuleInjector or throws exception
 *
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector or throws an exception
 */
function lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue) {
    if (flags & InjectFlags.Optional && notFoundValue === undefined) {
        // This must be set or the NullInjector will throw for optional deps
        notFoundValue = null;
    }
    if ((flags & (InjectFlags.Self | InjectFlags.Host)) === 0) {
        const moduleInjector = lView[INJECTOR];
        // switch to `injectInjectorOnly` implementation for module injector, since module injector
        // should not have access to Component/Directive DI scope (that may happen through
        // `directiveInject` implementation)
        const previousInjectImplementation = setInjectImplementation(undefined);
        try {
            if (moduleInjector) {
                return moduleInjector.get(token, notFoundValue, flags & InjectFlags.Optional);
            }
            else {
                return injectRootLimpMode(token, notFoundValue, flags & InjectFlags.Optional);
            }
        }
        finally {
            setInjectImplementation(previousInjectImplementation);
        }
    }
    return notFoundValueOrThrow(notFoundValue, token, flags);
}
/**
 * Returns the value associated to the given token from the NodeInjectors => ModuleInjector.
 *
 * Look for the injector providing the token by walking up the node injector tree and then
 * the module injector tree.
 *
 * This function patches `token` with `__NG_ELEMENT_ID__` which contains the id for the bloom
 * filter. `-1` is reserved for injecting `Injector` (implemented by `NodeInjector`)
 *
 * @param tNode The Node where the search for the injector should start
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
export function getOrCreateInjectable(tNode, lView, token, flags = InjectFlags.Default, notFoundValue) {
    if (tNode !== null) {
        // If the view or any of its ancestors have an embedded
        // view injector, we have to look it up there first.
        if (lView[FLAGS] & 2048 /* LViewFlags.HasEmbeddedViewInjector */ &&
            // The token must be present on the current node injector when the `Self`
            // flag is set, so the lookup on embedded view injector(s) can be skipped.
            !(flags & InjectFlags.Self)) {
            const embeddedInjectorValue = lookupTokenUsingEmbeddedInjector(tNode, lView, token, flags, NOT_FOUND);
            if (embeddedInjectorValue !== NOT_FOUND) {
                return embeddedInjectorValue;
            }
        }
        // Otherwise try the node injector.
        const value = lookupTokenUsingNodeInjector(tNode, lView, token, flags, NOT_FOUND);
        if (value !== NOT_FOUND) {
            return value;
        }
    }
    // Finally, fall back to the module injector.
    return lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue);
}
/**
 * Returns the value associated to the given token from the node injector.
 *
 * @param tNode The Node where the search for the injector should start
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
function lookupTokenUsingNodeInjector(tNode, lView, token, flags, notFoundValue) {
    const bloomHash = bloomHashBitOrFactory(token);
    // If the ID stored here is a function, this is a special object like ElementRef or TemplateRef
    // so just call the factory function to create it.
    if (typeof bloomHash === 'function') {
        if (!enterDI(lView, tNode, flags)) {
            // Failed to enter DI, try module injector instead. If a token is injected with the @Host
            // flag, the module injector is not searched for that token in Ivy.
            return flags & InjectFlags.Host
                ? notFoundValueOrThrow(notFoundValue, token, flags)
                : lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue);
        }
        try {
            let value;
            if (ngDevMode) {
                runInInjectorProfilerContext(new NodeInjector(getCurrentTNode(), getLView()), token, () => {
                    value = bloomHash(flags);
                    if (value != null) {
                        emitInstanceCreatedByInjectorEvent(value);
                    }
                });
            }
            else {
                value = bloomHash(flags);
            }
            if (value == null && !(flags & InjectFlags.Optional)) {
                throwProviderNotFoundError(token);
            }
            else {
                return value;
            }
        }
        finally {
            leaveDI();
        }
    }
    else if (typeof bloomHash === 'number') {
        // A reference to the previous injector TView that was found while climbing the element
        // injector tree. This is used to know if viewProviders can be accessed on the current
        // injector.
        let previousTView = null;
        let injectorIndex = getInjectorIndex(tNode, lView);
        let parentLocation = NO_PARENT_INJECTOR;
        let hostTElementNode = flags & InjectFlags.Host ? lView[DECLARATION_COMPONENT_VIEW][T_HOST] : null;
        // If we should skip this injector, or if there is no injector on this node, start by
        // searching the parent injector.
        if (injectorIndex === -1 || flags & InjectFlags.SkipSelf) {
            parentLocation =
                injectorIndex === -1
                    ? getParentInjectorLocation(tNode, lView)
                    : lView[injectorIndex + 8 /* NodeInjectorOffset.PARENT */];
            if (parentLocation === NO_PARENT_INJECTOR || !shouldSearchParent(flags, false)) {
                injectorIndex = -1;
            }
            else {
                previousTView = lView[TVIEW];
                injectorIndex = getParentInjectorIndex(parentLocation);
                lView = getParentInjectorView(parentLocation, lView);
            }
        }
        // Traverse up the injector tree until we find a potential match or until we know there
        // *isn't* a match.
        while (injectorIndex !== -1) {
            ngDevMode && assertNodeInjector(lView, injectorIndex);
            // Check the current injector. If it matches, see if it contains token.
            const tView = lView[TVIEW];
            ngDevMode &&
                assertTNodeForLView(tView.data[injectorIndex + 8 /* NodeInjectorOffset.TNODE */], lView);
            if (bloomHasToken(bloomHash, injectorIndex, tView.data)) {
                // At this point, we have an injector which *may* contain the token, so we step through
                // the providers and directives associated with the injector's corresponding node to get
                // the instance.
                const instance = searchTokensOnInjector(injectorIndex, lView, token, previousTView, flags, hostTElementNode);
                if (instance !== NOT_FOUND) {
                    return instance;
                }
            }
            parentLocation = lView[injectorIndex + 8 /* NodeInjectorOffset.PARENT */];
            if (parentLocation !== NO_PARENT_INJECTOR &&
                shouldSearchParent(flags, lView[TVIEW].data[injectorIndex + 8 /* NodeInjectorOffset.TNODE */] === hostTElementNode) &&
                bloomHasToken(bloomHash, injectorIndex, lView)) {
                // The def wasn't found anywhere on this node, so it was a false positive.
                // Traverse up the tree and continue searching.
                previousTView = tView;
                injectorIndex = getParentInjectorIndex(parentLocation);
                lView = getParentInjectorView(parentLocation, lView);
            }
            else {
                // If we should not search parent OR If the ancestor bloom filter value does not have the
                // bit corresponding to the directive we can give up on traversing up to find the specific
                // injector.
                injectorIndex = -1;
            }
        }
    }
    return notFoundValue;
}
function searchTokensOnInjector(injectorIndex, lView, token, previousTView, flags, hostTElementNode) {
    const currentTView = lView[TVIEW];
    const tNode = currentTView.data[injectorIndex + 8 /* NodeInjectorOffset.TNODE */];
    // First, we need to determine if view providers can be accessed by the starting element.
    // There are two possibilities
    const canAccessViewProviders = previousTView == null
        ? // 1) This is the first invocation `previousTView == null` which means that we are at the
            // `TNode` of where injector is starting to look. In such a case the only time we are allowed
            // to look into the ViewProviders is if:
            // - we are on a component
            // - AND the injector set `includeViewProviders` to true (implying that the token can see
            // ViewProviders because it is the Component or a Service which itself was declared in
            // ViewProviders)
            isComponentHost(tNode) && includeViewProviders
        : // 2) `previousTView != null` which means that we are now walking across the parent nodes.
            // In such a case we are only allowed to look into the ViewProviders if:
            // - We just crossed from child View to Parent View `previousTView != currentTView`
            // - AND the parent TNode is an Element.
            // This means that we just came from the Component's View and therefore are allowed to see
            // into the ViewProviders.
            previousTView != currentTView && (tNode.type & 3 /* TNodeType.AnyRNode */) !== 0;
    // This special case happens when there is a @host on the inject and when we are searching
    // on the host element node.
    const isHostSpecialCase = flags & InjectFlags.Host && hostTElementNode === tNode;
    const injectableIdx = locateDirectiveOrProvider(tNode, currentTView, token, canAccessViewProviders, isHostSpecialCase);
    if (injectableIdx !== null) {
        return getNodeInjectable(lView, currentTView, injectableIdx, tNode);
    }
    else {
        return NOT_FOUND;
    }
}
/**
 * Searches for the given token among the node's directives and providers.
 *
 * @param tNode TNode on which directives are present.
 * @param tView The tView we are currently processing
 * @param token Provider token or type of a directive to look for.
 * @param canAccessViewProviders Whether view providers should be considered.
 * @param isHostSpecialCase Whether the host special case applies.
 * @returns Index of a found directive or provider, or null when none found.
 */
export function locateDirectiveOrProvider(tNode, tView, token, canAccessViewProviders, isHostSpecialCase) {
    const nodeProviderIndexes = tNode.providerIndexes;
    const tInjectables = tView.data;
    const injectablesStart = nodeProviderIndexes & 1048575 /* TNodeProviderIndexes.ProvidersStartIndexMask */;
    const directivesStart = tNode.directiveStart;
    const directiveEnd = tNode.directiveEnd;
    const cptViewProvidersCount = nodeProviderIndexes >> 20 /* TNodeProviderIndexes.CptViewProvidersCountShift */;
    const startingIndex = canAccessViewProviders
        ? injectablesStart
        : injectablesStart + cptViewProvidersCount;
    // When the host special case applies, only the viewProviders and the component are visible
    const endIndex = isHostSpecialCase ? injectablesStart + cptViewProvidersCount : directiveEnd;
    for (let i = startingIndex; i < endIndex; i++) {
        const providerTokenOrDef = tInjectables[i];
        if ((i < directivesStart && token === providerTokenOrDef) ||
            (i >= directivesStart && providerTokenOrDef.type === token)) {
            return i;
        }
    }
    if (isHostSpecialCase) {
        const dirDef = tInjectables[directivesStart];
        if (dirDef && isComponentDef(dirDef) && dirDef.type === token) {
            return directivesStart;
        }
    }
    return null;
}
/**
 * Retrieve or instantiate the injectable from the `LView` at particular `index`.
 *
 * This function checks to see if the value has already been instantiated and if so returns the
 * cached `injectable`. Otherwise if it detects that the value is still a factory it
 * instantiates the `injectable` and caches the value.
 */
export function getNodeInjectable(lView, tView, index, tNode) {
    let value = lView[index];
    const tData = tView.data;
    if (isFactory(value)) {
        const factory = value;
        if (factory.resolving) {
            throwCyclicDependencyError(stringifyForError(tData[index]));
        }
        const previousIncludeViewProviders = setIncludeViewProviders(factory.canSeeViewProviders);
        factory.resolving = true;
        let prevInjectContext;
        if (ngDevMode) {
            // tData indexes mirror the concrete instances in its corresponding LView.
            // lView[index] here is either the injectable instace itself or a factory,
            // therefore tData[index] is the constructor of that injectable or a
            // definition object that contains the constructor in a `.type` field.
            const token = tData[index].type || tData[index];
            const injector = new NodeInjector(tNode, lView);
            prevInjectContext = setInjectorProfilerContext({ injector, token });
        }
        const previousInjectImplementation = factory.injectImpl
            ? setInjectImplementation(factory.injectImpl)
            : null;
        const success = enterDI(lView, tNode, InjectFlags.Default);
        ngDevMode &&
            assertEqual(success, true, "Because flags do not contain `SkipSelf' we expect this to always succeed.");
        try {
            value = lView[index] = factory.factory(undefined, tData, lView, tNode);
            ngDevMode && emitInstanceCreatedByInjectorEvent(value);
            // This code path is hit for both directives and providers.
            // For perf reasons, we want to avoid searching for hooks on providers.
            // It does no harm to try (the hooks just won't exist), but the extra
            // checks are unnecessary and this is a hot path. So we check to see
            // if the index of the dependency is in the directive range for this
            // tNode. If it's not, we know it's a provider and skip hook registration.
            if (tView.firstCreatePass && index >= tNode.directiveStart) {
                ngDevMode && assertDirectiveDef(tData[index]);
                registerPreOrderHooks(index, tData[index], tView);
            }
        }
        finally {
            ngDevMode && setInjectorProfilerContext(prevInjectContext);
            previousInjectImplementation !== null &&
                setInjectImplementation(previousInjectImplementation);
            setIncludeViewProviders(previousIncludeViewProviders);
            factory.resolving = false;
            leaveDI();
        }
    }
    return value;
}
/**
 * Returns the bit in an injector's bloom filter that should be used to determine whether or not
 * the directive might be provided by the injector.
 *
 * When a directive is public, it is added to the bloom filter and given a unique ID that can be
 * retrieved on the Type. When the directive isn't public or the token is not a directive `null`
 * is returned as the node injector can not possibly provide that token.
 *
 * @param token the injection token
 * @returns the matching bit to check in the bloom filter or `null` if the token is not known.
 *   When the returned value is negative then it represents special values such as `Injector`.
 */
export function bloomHashBitOrFactory(token) {
    ngDevMode && assertDefined(token, 'token must be defined');
    if (typeof token === 'string') {
        return token.charCodeAt(0) || 0;
    }
    const tokenId = 
    // First check with `hasOwnProperty` so we don't get an inherited ID.
    token.hasOwnProperty(NG_ELEMENT_ID) ? token[NG_ELEMENT_ID] : undefined;
    // Negative token IDs are used for special objects such as `Injector`
    if (typeof tokenId === 'number') {
        if (tokenId >= 0) {
            return tokenId & BLOOM_MASK;
        }
        else {
            ngDevMode &&
                assertEqual(tokenId, -1 /* InjectorMarkers.Injector */, 'Expecting to get Special Injector Id');
            return createNodeInjector;
        }
    }
    else {
        return tokenId;
    }
}
export function bloomHasToken(bloomHash, injectorIndex, injectorView) {
    // Create a mask that targets the specific bit associated with the directive we're looking for.
    // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
    // to bit positions 0 - 31 in a 32 bit integer.
    const mask = 1 << bloomHash;
    // Each bloom bucket in `injectorView` represents `BLOOM_BUCKET_BITS` number of bits of
    // `bloomHash`. Any bits in `bloomHash` beyond `BLOOM_BUCKET_BITS` indicate the bucket offset
    // that should be used.
    const value = injectorView[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)];
    // If the bloom filter value has the bit corresponding to the directive's bloomBit flipped on,
    // this injector is a potential match.
    return !!(value & mask);
}
/** Returns true if flags prevent parent injector from being searched for tokens */
function shouldSearchParent(flags, isFirstHostTNode) {
    return !(flags & InjectFlags.Self) && !(flags & InjectFlags.Host && isFirstHostTNode);
}
export function getNodeInjectorLView(nodeInjector) {
    return nodeInjector._lView;
}
export function getNodeInjectorTNode(nodeInjector) {
    return nodeInjector._tNode;
}
export class NodeInjector {
    constructor(_tNode, _lView) {
        this._tNode = _tNode;
        this._lView = _lView;
    }
    get(token, notFoundValue, flags) {
        return getOrCreateInjectable(this._tNode, this._lView, token, convertToBitFlags(flags), notFoundValue);
    }
}
/** Creates a `NodeInjector` for the current node. */
export function createNodeInjector() {
    return new NodeInjector(getCurrentTNode(), getLView());
}
/**
 * @codeGenApi
 */
export function ɵɵgetInheritedFactory(type) {
    return noSideEffects(() => {
        const ownConstructor = type.prototype.constructor;
        const ownFactory = ownConstructor[NG_FACTORY_DEF] || getFactoryOf(ownConstructor);
        const objectPrototype = Object.prototype;
        let parent = Object.getPrototypeOf(type.prototype).constructor;
        // Go up the prototype until we hit `Object`.
        while (parent && parent !== objectPrototype) {
            const factory = parent[NG_FACTORY_DEF] || getFactoryOf(parent);
            // If we hit something that has a factory and the factory isn't the same as the type,
            // we've found the inherited factory. Note the check that the factory isn't the type's
            // own factory is redundant in most cases, but if the user has custom decorators on the
            // class, this lookup will start one level down in the prototype chain, causing us to
            // find the own factory first and potentially triggering an infinite loop downstream.
            if (factory && factory !== ownFactory) {
                return factory;
            }
            parent = Object.getPrototypeOf(parent);
        }
        // There is no factory defined. Either this was improper usage of inheritance
        // (no Angular decorator on the superclass) or there is no constructor at all
        // in the inheritance chain. Since the two cases cannot be distinguished, the
        // latter has to be assumed.
        return (t) => new t();
    });
}
function getFactoryOf(type) {
    if (isForwardRef(type)) {
        return () => {
            const factory = getFactoryOf(resolveForwardRef(type));
            return factory && factory();
        };
    }
    return getFactoryDef(type);
}
/**
 * Returns a value from the closest embedded or node injector.
 *
 * @param tNode The Node where the search for the injector should start
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
function lookupTokenUsingEmbeddedInjector(tNode, lView, token, flags, notFoundValue) {
    let currentTNode = tNode;
    let currentLView = lView;
    // When an LView with an embedded view injector is inserted, it'll likely be interlaced with
    // nodes who may have injectors (e.g. node injector -> embedded view injector -> node injector).
    // Since the bloom filters for the node injectors have already been constructed and we don't
    // have a way of extracting the records from an injector, the only way to maintain the correct
    // hierarchy when resolving the value is to walk it node-by-node while attempting to resolve
    // the token at each level.
    while (currentTNode !== null &&
        currentLView !== null &&
        currentLView[FLAGS] & 2048 /* LViewFlags.HasEmbeddedViewInjector */ &&
        !(currentLView[FLAGS] & 512 /* LViewFlags.IsRoot */)) {
        ngDevMode && assertTNodeForLView(currentTNode, currentLView);
        // Note that this lookup on the node injector is using the `Self` flag, because
        // we don't want the node injector to look at any parent injectors since we
        // may hit the embedded view injector first.
        const nodeInjectorValue = lookupTokenUsingNodeInjector(currentTNode, currentLView, token, flags | InjectFlags.Self, NOT_FOUND);
        if (nodeInjectorValue !== NOT_FOUND) {
            return nodeInjectorValue;
        }
        // Has an explicit type due to a TS bug: https://github.com/microsoft/TypeScript/issues/33191
        let parentTNode = currentTNode.parent;
        // `TNode.parent` includes the parent within the current view only. If it doesn't exist,
        // it means that we've hit the view boundary and we need to go up to the next view.
        if (!parentTNode) {
            // Before we go to the next LView, check if the token exists on the current embedded injector.
            const embeddedViewInjector = currentLView[EMBEDDED_VIEW_INJECTOR];
            if (embeddedViewInjector) {
                const embeddedViewInjectorValue = embeddedViewInjector.get(token, NOT_FOUND, flags);
                if (embeddedViewInjectorValue !== NOT_FOUND) {
                    return embeddedViewInjectorValue;
                }
            }
            // Otherwise keep going up the tree.
            parentTNode = getTNodeFromLView(currentLView);
            currentLView = currentLView[DECLARATION_VIEW];
        }
        currentTNode = parentTNode;
    }
    return notFoundValue;
}
/** Gets the TNode associated with an LView inside of the declaration view. */
function getTNodeFromLView(lView) {
    const tView = lView[TVIEW];
    const tViewType = tView.type;
    // The parent pointer differs based on `TView.type`.
    if (tViewType === 2 /* TViewType.Embedded */) {
        ngDevMode && assertDefined(tView.declTNode, 'Embedded TNodes should have declaration parents.');
        return tView.declTNode;
    }
    else if (tViewType === 1 /* TViewType.Component */) {
        // Components don't have `TView.declTNode` because each instance of component could be
        // inserted in different location, hence `TView.declTNode` is meaningless.
        return lView[T_HOST];
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2RpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUVoRixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUUvRCxPQUFPLEVBQUMsV0FBVyxFQUFnQixNQUFNLDBCQUEwQixDQUFDO0FBR3BFLE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRTlDLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNyRixPQUFPLEVBQ0wsa0NBQWtDLEVBRWxDLDRCQUE0QixFQUM1QiwwQkFBMEIsR0FDM0IsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLDBCQUEwQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ25GLE9BQU8sRUFBQyxhQUFhLEVBQUUsY0FBYyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUc5QyxPQUFPLEVBQ0wsU0FBUyxFQUNULGtCQUFrQixHQUtuQixNQUFNLHVCQUF1QixDQUFDO0FBVS9CLE9BQU8sRUFBQyxjQUFjLEVBQUUsZUFBZSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDekUsT0FBTyxFQUNMLDBCQUEwQixFQUMxQixnQkFBZ0IsRUFDaEIsc0JBQXNCLEVBQ3RCLEtBQUssRUFDTCxRQUFRLEVBR1IsTUFBTSxFQUVOLEtBQUssR0FHTixNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNwRSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3RCxPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLHFCQUFxQixFQUNyQixpQkFBaUIsR0FDbEIsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUV6RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQ0c7QUFDSCxJQUFJLG9CQUFvQixHQUFHLElBQUksQ0FBQztBQUVoQyxNQUFNLFVBQVUsdUJBQXVCLENBQUMsQ0FBVTtJQUNoRCxNQUFNLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQztJQUN0QyxvQkFBb0IsR0FBRyxDQUFDLENBQUM7SUFDekIsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFDdkIsTUFBTSxVQUFVLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUVsQzs7OztHQUlHO0FBQ0gsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFFNUIsMERBQTBEO0FBQzFELElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztBQUV4Qiw2REFBNkQ7QUFDN0QsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBRXJCOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsUUFBUSxDQUN0QixhQUFxQixFQUNyQixLQUFZLEVBQ1osSUFBaUM7SUFFakMsU0FBUyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO0lBQzdGLElBQUksRUFBc0IsQ0FBQztJQUMzQixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzdCLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO1NBQU0sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDOUMsRUFBRSxHQUFJLElBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsd0ZBQXdGO0lBQ3hGLHVGQUF1RjtJQUN2RixJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNmLEVBQUUsR0FBSSxJQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsZUFBZSxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELHNGQUFzRjtJQUN0Rix5RkFBeUY7SUFDekYsTUFBTSxTQUFTLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQztJQUVsQyw2RUFBNkU7SUFDN0UsOEZBQThGO0lBQzlGLCtDQUErQztJQUMvQyxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDO0lBRTVCLDZGQUE2RjtJQUM3Riw4RkFBOEY7SUFDOUYsd0JBQXdCO0lBQ3ZCLEtBQUssQ0FBQyxJQUFpQixDQUFDLGFBQWEsR0FBRyxDQUFDLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ3JGLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsOEJBQThCLENBQzVDLEtBQTRELEVBQzVELEtBQVk7SUFFWixNQUFNLHFCQUFxQixHQUFHLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RCxJQUFJLHFCQUFxQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDakMsT0FBTyxxQkFBcUIsQ0FBQztJQUMvQixDQUFDO0lBRUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzFCLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtRQUM1RCxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsa0NBQWtDO1FBQzVELFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxNQUFNLFNBQVMsR0FBRyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUQsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztJQUUxQyxrRUFBa0U7SUFDbEUsMkRBQTJEO0lBQzNELElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUNqQyxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxNQUFNLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQVcsQ0FBQztRQUNsRCwwRUFBMEU7UUFDMUUseUVBQXlFO1FBQ3pFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsd0NBQWdDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2RCxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLG9DQUE0QixDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQzdELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxHQUFVLEVBQUUsTUFBb0I7SUFDbkQsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsS0FBWSxFQUFFLEtBQVk7SUFDekQsSUFDRSxLQUFLLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQztRQUMxQiw0RkFBNEY7UUFDNUYsbUZBQW1GO1FBQ25GLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsS0FBSyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQ3BFLHNGQUFzRjtRQUN0Rix1REFBdUQ7UUFDdkQsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLG9DQUE0QixDQUFDLEtBQUssSUFBSSxFQUMvRCxDQUFDO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNaLENBQUM7U0FBTSxDQUFDO1FBQ04sU0FBUyxJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUQsT0FBTyxLQUFLLENBQUMsYUFBYSxDQUFDO0lBQzdCLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUFDLEtBQVksRUFBRSxLQUFZO0lBQ2xFLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3RELCtGQUErRjtRQUMvRixxREFBcUQ7UUFDckQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQXlDLENBQUMsQ0FBQyxrQkFBa0I7SUFDbkYsQ0FBQztJQUVELGdHQUFnRztJQUNoRyxpR0FBaUc7SUFDakcsb0VBQW9FO0lBQ3BFLElBQUkscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLElBQUksV0FBVyxHQUFpQixJQUFJLENBQUM7SUFDckMsSUFBSSxXQUFXLEdBQWlCLEtBQUssQ0FBQztJQUV0Qyw4RkFBOEY7SUFDOUYsK0ZBQStGO0lBQy9GLGtCQUFrQjtJQUNsQixPQUFPLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUM1QixXQUFXLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFN0MsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDekIsMENBQTBDO1lBQzFDLE9BQU8sa0JBQWtCLENBQUM7UUFDNUIsQ0FBQztRQUVELFNBQVMsSUFBSSxXQUFXLElBQUksbUJBQW1CLENBQUMsV0FBWSxFQUFFLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDLENBQUM7UUFDOUYsMEVBQTBFO1FBQzFFLHFCQUFxQixFQUFFLENBQUM7UUFDeEIsV0FBVyxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTVDLElBQUksV0FBVyxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3JDLHFEQUFxRDtZQUNyRCxPQUFPLENBQUMsV0FBVyxDQUFDLGFBQWE7Z0JBQy9CLENBQUMscUJBQXFCOzBFQUN5QixDQUFDLENBQTZCLENBQUM7UUFDbEYsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLGtCQUFrQixDQUFDO0FBQzVCLENBQUM7QUFDRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQ2hDLGFBQXFCLEVBQ3JCLEtBQVksRUFDWixLQUF5QjtJQUV6QixRQUFRLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxLQUFZLEVBQUUsZ0JBQXdCO0lBQ3hFLFNBQVMsSUFBSSxlQUFlLENBQUMsS0FBSyxFQUFFLDREQUEyQyxDQUFDLENBQUM7SUFDakYsU0FBUyxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUNyRCxJQUFJLGdCQUFnQixLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQ2pDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxnQkFBZ0IsS0FBSyxPQUFPLEVBQUUsQ0FBQztRQUNqQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNWLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUM7WUFDdkIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZCLGdFQUFnRTtZQUNoRSxJQUFJLHlCQUF5QixDQUFDLEtBQUssQ0FBQztnQkFBRSxNQUFNO1lBRTVDLDZCQUE2QjtZQUM3QixJQUFJLEtBQUsseUNBQWlDLEVBQUUsQ0FBQztnQkFDM0MsOEJBQThCO2dCQUM5QixzQ0FBc0M7Z0JBQ3RDLCtFQUErRTtnQkFDL0UscUJBQXFCO2dCQUNyQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUM7aUJBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDckMsbURBQW1EO2dCQUNuRCxDQUFDLEVBQUUsQ0FBQztnQkFDSixPQUFPLENBQUMsR0FBRyxXQUFXLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ3ZELENBQUMsRUFBRSxDQUFDO2dCQUNOLENBQUM7WUFDSCxDQUFDO2lCQUFNLElBQUksS0FBSyxLQUFLLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3RDLE9BQU8sS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQVcsQ0FBQztZQUNoQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUMzQixhQUF1QixFQUN2QixLQUF1QixFQUN2QixLQUFrQjtJQUVsQixJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsUUFBUSxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNoRSxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO1NBQU0sQ0FBQztRQUNOLDBCQUEwQixDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUyw4QkFBOEIsQ0FDckMsS0FBWSxFQUNaLEtBQXVCLEVBQ3ZCLEtBQWtCLEVBQ2xCLGFBQW1CO0lBRW5CLElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ2hFLG9FQUFvRTtRQUNwRSxhQUFhLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsMkZBQTJGO1FBQzNGLGtGQUFrRjtRQUNsRixvQ0FBb0M7UUFDcEMsTUFBTSw0QkFBNEIsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUM7WUFDSCxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxLQUFLLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hGLENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLGtCQUFrQixDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRixDQUFDO1FBQ0gsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsdUJBQXVCLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUN4RCxDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sb0JBQW9CLENBQUksYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5RCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUNuQyxLQUFnQyxFQUNoQyxLQUFZLEVBQ1osS0FBdUIsRUFDdkIsUUFBcUIsV0FBVyxDQUFDLE9BQU8sRUFDeEMsYUFBbUI7SUFFbkIsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDbkIsdURBQXVEO1FBQ3ZELG9EQUFvRDtRQUNwRCxJQUNFLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0RBQXFDO1lBQ2pELHlFQUF5RTtZQUN6RSwwRUFBMEU7WUFDMUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQzNCLENBQUM7WUFDRCxNQUFNLHFCQUFxQixHQUFHLGdDQUFnQyxDQUM1RCxLQUFLLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLEVBQ0wsU0FBUyxDQUNWLENBQUM7WUFDRixJQUFJLHFCQUFxQixLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN4QyxPQUFPLHFCQUFxQixDQUFDO1lBQy9CLENBQUM7UUFDSCxDQUFDO1FBRUQsbUNBQW1DO1FBQ25DLE1BQU0sS0FBSyxHQUFHLDRCQUE0QixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsRixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN4QixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLE9BQU8sOEJBQThCLENBQUksS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILFNBQVMsNEJBQTRCLENBQ25DLEtBQXlCLEVBQ3pCLEtBQVksRUFDWixLQUF1QixFQUN2QixLQUFrQixFQUNsQixhQUFtQjtJQUVuQixNQUFNLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQywrRkFBK0Y7SUFDL0Ysa0RBQWtEO0lBQ2xELElBQUksT0FBTyxTQUFTLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbEMseUZBQXlGO1lBQ3pGLG1FQUFtRTtZQUNuRSxPQUFPLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSTtnQkFDN0IsQ0FBQyxDQUFDLG9CQUFvQixDQUFJLGFBQWEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO2dCQUN0RCxDQUFDLENBQUMsOEJBQThCLENBQUksS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUNELElBQUksQ0FBQztZQUNILElBQUksS0FBYyxDQUFDO1lBRW5CLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ2QsNEJBQTRCLENBQzFCLElBQUksWUFBWSxDQUFDLGVBQWUsRUFBa0IsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUMvRCxLQUFnQixFQUNoQixHQUFHLEVBQUU7b0JBQ0gsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFekIsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ2xCLGtDQUFrQyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QyxDQUFDO2dCQUNILENBQUMsQ0FDRixDQUFDO1lBQ0osQ0FBQztpQkFBTSxDQUFDO2dCQUNOLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUVELElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNyRCwwQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxLQUFLLENBQUM7WUFDZixDQUFDO1FBQ0gsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0gsQ0FBQztTQUFNLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDekMsdUZBQXVGO1FBQ3ZGLHNGQUFzRjtRQUN0RixZQUFZO1FBQ1osSUFBSSxhQUFhLEdBQWlCLElBQUksQ0FBQztRQUN2QyxJQUFJLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsSUFBSSxjQUFjLEdBQUcsa0JBQWtCLENBQUM7UUFDeEMsSUFBSSxnQkFBZ0IsR0FDbEIsS0FBSyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFOUUscUZBQXFGO1FBQ3JGLGlDQUFpQztRQUNqQyxJQUFJLGFBQWEsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3pELGNBQWM7Z0JBQ1osYUFBYSxLQUFLLENBQUMsQ0FBQztvQkFDbEIsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7b0JBQ3pDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxvQ0FBNEIsQ0FBQyxDQUFDO1lBRXZELElBQUksY0FBYyxLQUFLLGtCQUFrQixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQy9FLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sYUFBYSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0IsYUFBYSxHQUFHLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUN2RCxLQUFLLEdBQUcscUJBQXFCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELENBQUM7UUFDSCxDQUFDO1FBRUQsdUZBQXVGO1FBQ3ZGLG1CQUFtQjtRQUNuQixPQUFPLGFBQWEsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzVCLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFdEQsdUVBQXVFO1lBQ3ZFLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixTQUFTO2dCQUNQLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxtQ0FBMkIsQ0FBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVGLElBQUksYUFBYSxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3hELHVGQUF1RjtnQkFDdkYsd0ZBQXdGO2dCQUN4RixnQkFBZ0I7Z0JBQ2hCLE1BQU0sUUFBUSxHQUFrQixzQkFBc0IsQ0FDcEQsYUFBYSxFQUNiLEtBQUssRUFDTCxLQUFLLEVBQ0wsYUFBYSxFQUNiLEtBQUssRUFDTCxnQkFBZ0IsQ0FDakIsQ0FBQztnQkFDRixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDM0IsT0FBTyxRQUFRLENBQUM7Z0JBQ2xCLENBQUM7WUFDSCxDQUFDO1lBQ0QsY0FBYyxHQUFHLEtBQUssQ0FBQyxhQUFhLG9DQUE0QixDQUFDLENBQUM7WUFDbEUsSUFDRSxjQUFjLEtBQUssa0JBQWtCO2dCQUNyQyxrQkFBa0IsQ0FDaEIsS0FBSyxFQUNMLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxtQ0FBMkIsQ0FBQyxLQUFLLGdCQUFnQixDQUNqRjtnQkFDRCxhQUFhLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsRUFDOUMsQ0FBQztnQkFDRCwwRUFBMEU7Z0JBQzFFLCtDQUErQztnQkFDL0MsYUFBYSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsYUFBYSxHQUFHLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUN2RCxLQUFLLEdBQUcscUJBQXFCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELENBQUM7aUJBQU0sQ0FBQztnQkFDTix5RkFBeUY7Z0JBQ3pGLDBGQUEwRjtnQkFDMUYsWUFBWTtnQkFDWixhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQzdCLGFBQXFCLEVBQ3JCLEtBQVksRUFDWixLQUF1QixFQUN2QixhQUEyQixFQUMzQixLQUFrQixFQUNsQixnQkFBOEI7SUFFOUIsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxtQ0FBMkIsQ0FBVSxDQUFDO0lBQ25GLHlGQUF5RjtJQUN6Riw4QkFBOEI7SUFDOUIsTUFBTSxzQkFBc0IsR0FDMUIsYUFBYSxJQUFJLElBQUk7UUFDbkIsQ0FBQyxDQUFDLHlGQUF5RjtZQUN6Riw2RkFBNkY7WUFDN0Ysd0NBQXdDO1lBQ3hDLDBCQUEwQjtZQUMxQix5RkFBeUY7WUFDekYsc0ZBQXNGO1lBQ3RGLGlCQUFpQjtZQUNqQixlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CO1FBQ2hELENBQUMsQ0FBQywwRkFBMEY7WUFDMUYsd0VBQXdFO1lBQ3hFLG1GQUFtRjtZQUNuRix3Q0FBd0M7WUFDeEMsMEZBQTBGO1lBQzFGLDBCQUEwQjtZQUMxQixhQUFhLElBQUksWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksNkJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFL0UsMEZBQTBGO0lBQzFGLDRCQUE0QjtJQUM1QixNQUFNLGlCQUFpQixHQUFHLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxJQUFJLGdCQUFnQixLQUFLLEtBQUssQ0FBQztJQUVqRixNQUFNLGFBQWEsR0FBRyx5QkFBeUIsQ0FDN0MsS0FBSyxFQUNMLFlBQVksRUFDWixLQUFLLEVBQ0wsc0JBQXNCLEVBQ3RCLGlCQUFpQixDQUNsQixDQUFDO0lBQ0YsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDM0IsT0FBTyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxLQUFxQixDQUFDLENBQUM7SUFDdEYsQ0FBQztTQUFNLENBQUM7UUFDTixPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FDdkMsS0FBWSxFQUNaLEtBQVksRUFDWixLQUFnQyxFQUNoQyxzQkFBK0IsRUFDL0IsaUJBQW1DO0lBRW5DLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztJQUNsRCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRWhDLE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLDZEQUErQyxDQUFDO0lBQzVGLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUM7SUFDN0MsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztJQUN4QyxNQUFNLHFCQUFxQixHQUN6QixtQkFBbUIsNERBQW1ELENBQUM7SUFDekUsTUFBTSxhQUFhLEdBQUcsc0JBQXNCO1FBQzFDLENBQUMsQ0FBQyxnQkFBZ0I7UUFDbEIsQ0FBQyxDQUFDLGdCQUFnQixHQUFHLHFCQUFxQixDQUFDO0lBQzdDLDJGQUEyRjtJQUMzRixNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztJQUM3RixLQUFLLElBQUksQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDOUMsTUFBTSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFvRCxDQUFDO1FBQzlGLElBQ0UsQ0FBQyxDQUFDLEdBQUcsZUFBZSxJQUFJLEtBQUssS0FBSyxrQkFBa0IsQ0FBQztZQUNyRCxDQUFDLENBQUMsSUFBSSxlQUFlLElBQUssa0JBQXdDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUNsRixDQUFDO1lBQ0QsT0FBTyxDQUFDLENBQUM7UUFDWCxDQUFDO0lBQ0gsQ0FBQztJQUNELElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUN0QixNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFzQixDQUFDO1FBQ2xFLElBQUksTUFBTSxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQzlELE9BQU8sZUFBZSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUMvQixLQUFZLEVBQ1osS0FBWSxFQUNaLEtBQWEsRUFDYixLQUF5QjtJQUV6QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN6QixJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sT0FBTyxHQUF3QixLQUFLLENBQUM7UUFDM0MsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEIsMEJBQTBCLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBQ0QsTUFBTSw0QkFBNEIsR0FBRyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUMxRixPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUV6QixJQUFJLGlCQUFzRCxDQUFDO1FBQzNELElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCwwRUFBMEU7WUFDMUUsMEVBQTBFO1lBQzFFLG9FQUFvRTtZQUNwRSxzRUFBc0U7WUFDdEUsTUFBTSxLQUFLLEdBQ1IsS0FBSyxDQUFDLEtBQUssQ0FBbUQsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sUUFBUSxHQUFHLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxpQkFBaUIsR0FBRywwQkFBMEIsQ0FBQyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFRCxNQUFNLDRCQUE0QixHQUFHLE9BQU8sQ0FBQyxVQUFVO1lBQ3JELENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQzdDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDVCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0QsU0FBUztZQUNQLFdBQVcsQ0FDVCxPQUFPLEVBQ1AsSUFBSSxFQUNKLDJFQUEyRSxDQUM1RSxDQUFDO1FBQ0osSUFBSSxDQUFDO1lBQ0gsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXZFLFNBQVMsSUFBSSxrQ0FBa0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV2RCwyREFBMkQ7WUFDM0QsdUVBQXVFO1lBQ3ZFLHFFQUFxRTtZQUNyRSxvRUFBb0U7WUFDcEUsb0VBQW9FO1lBQ3BFLDBFQUEwRTtZQUMxRSxJQUFJLEtBQUssQ0FBQyxlQUFlLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDM0QsU0FBUyxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBc0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6RSxDQUFDO1FBQ0gsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsU0FBUyxJQUFJLDBCQUEwQixDQUFDLGlCQUFrQixDQUFDLENBQUM7WUFFNUQsNEJBQTRCLEtBQUssSUFBSTtnQkFDbkMsdUJBQXVCLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUN4RCx1QkFBdUIsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsS0FBa0M7SUFFbEMsU0FBUyxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUMzRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELE1BQU0sT0FBTztJQUNYLHFFQUFxRTtJQUNyRSxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBRSxLQUFhLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUNsRixxRUFBcUU7SUFDckUsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNoQyxJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqQixPQUFPLE9BQU8sR0FBRyxVQUFVLENBQUM7UUFDOUIsQ0FBQzthQUFNLENBQUM7WUFDTixTQUFTO2dCQUNQLFdBQVcsQ0FBQyxPQUFPLHFDQUE0QixzQ0FBc0MsQ0FBQyxDQUFDO1lBQ3pGLE9BQU8sa0JBQWtCLENBQUM7UUFDNUIsQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUMzQixTQUFpQixFQUNqQixhQUFxQixFQUNyQixZQUEyQjtJQUUzQiwrRkFBK0Y7SUFDL0YsOEZBQThGO0lBQzlGLCtDQUErQztJQUMvQyxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDO0lBRTVCLHVGQUF1RjtJQUN2Riw2RkFBNkY7SUFDN0YsdUJBQXVCO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxTQUFTLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0lBRTdFLDhGQUE4RjtJQUM5RixzQ0FBc0M7SUFDdEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELG1GQUFtRjtBQUNuRixTQUFTLGtCQUFrQixDQUFDLEtBQWtCLEVBQUUsZ0JBQXlCO0lBQ3ZFLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxJQUFJLGdCQUFnQixDQUFDLENBQUM7QUFDeEYsQ0FBQztBQUVELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxZQUEwQjtJQUM3RCxPQUFRLFlBQW9CLENBQUMsTUFBZSxDQUFDO0FBQy9DLENBQUM7QUFFRCxNQUFNLFVBQVUsb0JBQW9CLENBQ2xDLFlBQTBCO0lBRTFCLE9BQVEsWUFBb0IsQ0FBQyxNQUlyQixDQUFDO0FBQ1gsQ0FBQztBQUVELE1BQU0sT0FBTyxZQUFZO0lBQ3ZCLFlBQ1UsTUFBb0UsRUFDcEUsTUFBYTtRQURiLFdBQU0sR0FBTixNQUFNLENBQThEO1FBQ3BFLFdBQU0sR0FBTixNQUFNLENBQU87SUFDcEIsQ0FBQztJQUVKLEdBQUcsQ0FBQyxLQUFVLEVBQUUsYUFBbUIsRUFBRSxLQUFtQztRQUN0RSxPQUFPLHFCQUFxQixDQUMxQixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxNQUFNLEVBQ1gsS0FBSyxFQUNMLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUN4QixhQUFhLENBQ2QsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELHFEQUFxRDtBQUNyRCxNQUFNLFVBQVUsa0JBQWtCO0lBQ2hDLE9BQU8sSUFBSSxZQUFZLENBQUMsZUFBZSxFQUF5QixFQUFFLFFBQVEsRUFBRSxDQUFRLENBQUM7QUFDdkYsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUFJLElBQWU7SUFDdEQsT0FBTyxhQUFhLENBQUMsR0FBRyxFQUFFO1FBQ3hCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO1FBQ2xELE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbEYsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUN6QyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFFL0QsNkNBQTZDO1FBQzdDLE9BQU8sTUFBTSxJQUFJLE1BQU0sS0FBSyxlQUFlLEVBQUUsQ0FBQztZQUM1QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELHFGQUFxRjtZQUNyRixzRkFBc0Y7WUFDdEYsdUZBQXVGO1lBQ3ZGLHFGQUFxRjtZQUNyRixxRkFBcUY7WUFDckYsSUFBSSxPQUFPLElBQUksT0FBTyxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUN0QyxPQUFPLE9BQU8sQ0FBQztZQUNqQixDQUFDO1lBRUQsTUFBTSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELDZFQUE2RTtRQUM3RSw2RUFBNkU7UUFDN0UsNkVBQTZFO1FBQzdFLDRCQUE0QjtRQUM1QixPQUFPLENBQUMsQ0FBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFJLElBQWU7SUFDdEMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN2QixPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE9BQU8sT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRCxPQUFPLGFBQWEsQ0FBSSxJQUFJLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBUyxnQ0FBZ0MsQ0FDdkMsS0FBeUIsRUFDekIsS0FBWSxFQUNaLEtBQXVCLEVBQ3ZCLEtBQWtCLEVBQ2xCLGFBQW1CO0lBRW5CLElBQUksWUFBWSxHQUE4QixLQUFLLENBQUM7SUFDcEQsSUFBSSxZQUFZLEdBQWlCLEtBQUssQ0FBQztJQUV2Qyw0RkFBNEY7SUFDNUYsZ0dBQWdHO0lBQ2hHLDRGQUE0RjtJQUM1Riw4RkFBOEY7SUFDOUYsNEZBQTRGO0lBQzVGLDJCQUEyQjtJQUMzQixPQUNFLFlBQVksS0FBSyxJQUFJO1FBQ3JCLFlBQVksS0FBSyxJQUFJO1FBQ3JCLFlBQVksQ0FBQyxLQUFLLENBQUMsZ0RBQXFDO1FBQ3hELENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLDhCQUFvQixDQUFDLEVBQzFDLENBQUM7UUFDRCxTQUFTLElBQUksbUJBQW1CLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRTdELCtFQUErRTtRQUMvRSwyRUFBMkU7UUFDM0UsNENBQTRDO1FBQzVDLE1BQU0saUJBQWlCLEdBQUcsNEJBQTRCLENBQ3BELFlBQVksRUFDWixZQUFZLEVBQ1osS0FBSyxFQUNMLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxFQUN4QixTQUFTLENBQ1YsQ0FBQztRQUNGLElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDcEMsT0FBTyxpQkFBaUIsQ0FBQztRQUMzQixDQUFDO1FBRUQsNkZBQTZGO1FBQzdGLElBQUksV0FBVyxHQUF5QyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBRTVFLHdGQUF3RjtRQUN4RixtRkFBbUY7UUFDbkYsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pCLDhGQUE4RjtZQUM5RixNQUFNLG9CQUFvQixHQUFHLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ2xFLElBQUksb0JBQW9CLEVBQUUsQ0FBQztnQkFDekIsTUFBTSx5QkFBeUIsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQ3hELEtBQUssRUFDTCxTQUFtQixFQUNuQixLQUFLLENBQ04sQ0FBQztnQkFDRixJQUFJLHlCQUF5QixLQUFLLFNBQVMsRUFBRSxDQUFDO29CQUM1QyxPQUFPLHlCQUF5QixDQUFDO2dCQUNuQyxDQUFDO1lBQ0gsQ0FBQztZQUVELG9DQUFvQztZQUNwQyxXQUFXLEdBQUcsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDOUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQzdCLENBQUM7SUFFRCxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBRUQsOEVBQThFO0FBQzlFLFNBQVMsaUJBQWlCLENBQUMsS0FBWTtJQUNyQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUU3QixvREFBb0Q7SUFDcEQsSUFBSSxTQUFTLCtCQUF1QixFQUFFLENBQUM7UUFDckMsU0FBUyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLGtEQUFrRCxDQUFDLENBQUM7UUFDaEcsT0FBTyxLQUFLLENBQUMsU0FBa0MsQ0FBQztJQUNsRCxDQUFDO1NBQU0sSUFBSSxTQUFTLGdDQUF3QixFQUFFLENBQUM7UUFDN0Msc0ZBQXNGO1FBQ3RGLDBFQUEwRTtRQUMxRSxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQWlCLENBQUM7SUFDdkMsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc0ZvcndhcmRSZWYsIHJlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuLi9kaS9mb3J3YXJkX3JlZic7XG5pbXBvcnQge2luamVjdFJvb3RMaW1wTW9kZSwgc2V0SW5qZWN0SW1wbGVtZW50YXRpb259IGZyb20gJy4uL2RpL2luamVjdF9zd2l0Y2gnO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtjb252ZXJ0VG9CaXRGbGFnc30gZnJvbSAnLi4vZGkvaW5qZWN0b3JfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge0luamVjdG9yTWFya2Vyc30gZnJvbSAnLi4vZGkvaW5qZWN0b3JfbWFya2VyJztcbmltcG9ydCB7SW5qZWN0RmxhZ3MsIEluamVjdE9wdGlvbnN9IGZyb20gJy4uL2RpL2ludGVyZmFjZS9pbmplY3Rvcic7XG5pbXBvcnQge1Byb3ZpZGVyVG9rZW59IGZyb20gJy4uL2RpL3Byb3ZpZGVyX3Rva2VuJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCBhc3NlcnRFcXVhbCwgYXNzZXJ0SW5kZXhJblJhbmdlfSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge25vU2lkZUVmZmVjdHN9IGZyb20gJy4uL3V0aWwvY2xvc3VyZSc7XG5cbmltcG9ydCB7YXNzZXJ0RGlyZWN0aXZlRGVmLCBhc3NlcnROb2RlSW5qZWN0b3IsIGFzc2VydFROb2RlRm9yTFZpZXd9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7XG4gIGVtaXRJbnN0YW5jZUNyZWF0ZWRCeUluamVjdG9yRXZlbnQsXG4gIEluamVjdG9yUHJvZmlsZXJDb250ZXh0LFxuICBydW5JbkluamVjdG9yUHJvZmlsZXJDb250ZXh0LFxuICBzZXRJbmplY3RvclByb2ZpbGVyQ29udGV4dCxcbn0gZnJvbSAnLi9kZWJ1Zy9pbmplY3Rvcl9wcm9maWxlcic7XG5pbXBvcnQge2dldEZhY3RvcnlEZWZ9IGZyb20gJy4vZGVmaW5pdGlvbl9mYWN0b3J5JztcbmltcG9ydCB7dGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3IsIHRocm93UHJvdmlkZXJOb3RGb3VuZEVycm9yfSBmcm9tICcuL2Vycm9yc19kaSc7XG5pbXBvcnQge05HX0VMRU1FTlRfSUQsIE5HX0ZBQ1RPUllfREVGfSBmcm9tICcuL2ZpZWxkcyc7XG5pbXBvcnQge3JlZ2lzdGVyUHJlT3JkZXJIb29rc30gZnJvbSAnLi9ob29rcyc7XG5pbXBvcnQge0F0dHJpYnV0ZU1hcmtlcn0gZnJvbSAnLi9pbnRlcmZhY2VzL2F0dHJpYnV0ZV9tYXJrZXInO1xuaW1wb3J0IHtDb21wb25lbnREZWYsIERpcmVjdGl2ZURlZn0gZnJvbSAnLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtcbiAgaXNGYWN0b3J5LFxuICBOT19QQVJFTlRfSU5KRUNUT1IsXG4gIE5vZGVJbmplY3RvckZhY3RvcnksXG4gIE5vZGVJbmplY3Rvck9mZnNldCxcbiAgUmVsYXRpdmVJbmplY3RvckxvY2F0aW9uLFxuICBSZWxhdGl2ZUluamVjdG9yTG9jYXRpb25GbGFncyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL2luamVjdG9yJztcbmltcG9ydCB7XG4gIFRDb250YWluZXJOb2RlLFxuICBURGlyZWN0aXZlSG9zdE5vZGUsXG4gIFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgVEVsZW1lbnROb2RlLFxuICBUTm9kZSxcbiAgVE5vZGVQcm92aWRlckluZGV4ZXMsXG4gIFROb2RlVHlwZSxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtpc0NvbXBvbmVudERlZiwgaXNDb21wb25lbnRIb3N0fSBmcm9tICcuL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHtcbiAgREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVcsXG4gIERFQ0xBUkFUSU9OX1ZJRVcsXG4gIEVNQkVEREVEX1ZJRVdfSU5KRUNUT1IsXG4gIEZMQUdTLFxuICBJTkpFQ1RPUixcbiAgTFZpZXcsXG4gIExWaWV3RmxhZ3MsXG4gIFRfSE9TVCxcbiAgVERhdGEsXG4gIFRWSUVXLFxuICBUVmlldyxcbiAgVFZpZXdUeXBlLFxufSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2Fzc2VydFROb2RlVHlwZX0gZnJvbSAnLi9ub2RlX2Fzc2VydCc7XG5pbXBvcnQge2VudGVyREksIGdldEN1cnJlbnRUTm9kZSwgZ2V0TFZpZXcsIGxlYXZlREl9IGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHtpc05hbWVPbmx5QXR0cmlidXRlTWFya2VyfSBmcm9tICcuL3V0aWwvYXR0cnNfdXRpbHMnO1xuaW1wb3J0IHtcbiAgZ2V0UGFyZW50SW5qZWN0b3JJbmRleCxcbiAgZ2V0UGFyZW50SW5qZWN0b3JWaWV3LFxuICBoYXNQYXJlbnRJbmplY3Rvcixcbn0gZnJvbSAnLi91dGlsL2luamVjdG9yX3V0aWxzJztcbmltcG9ydCB7c3RyaW5naWZ5Rm9yRXJyb3J9IGZyb20gJy4vdXRpbC9zdHJpbmdpZnlfdXRpbHMnO1xuXG4vKipcbiAqIERlZmluZXMgaWYgdGhlIGNhbGwgdG8gYGluamVjdGAgc2hvdWxkIGluY2x1ZGUgYHZpZXdQcm92aWRlcnNgIGluIGl0cyByZXNvbHV0aW9uLlxuICpcbiAqIFRoaXMgaXMgc2V0IHRvIHRydWUgd2hlbiB3ZSB0cnkgdG8gaW5zdGFudGlhdGUgYSBjb21wb25lbnQuIFRoaXMgdmFsdWUgaXMgcmVzZXQgaW5cbiAqIGBnZXROb2RlSW5qZWN0YWJsZWAgdG8gYSB2YWx1ZSB3aGljaCBtYXRjaGVzIHRoZSBkZWNsYXJhdGlvbiBsb2NhdGlvbiBvZiB0aGUgdG9rZW4gYWJvdXQgdG8gYmVcbiAqIGluc3RhbnRpYXRlZC4gVGhpcyBpcyBkb25lIHNvIHRoYXQgaWYgd2UgYXJlIGluamVjdGluZyBhIHRva2VuIHdoaWNoIHdhcyBkZWNsYXJlZCBvdXRzaWRlIG9mXG4gKiBgdmlld1Byb3ZpZGVyc2Agd2UgZG9uJ3QgYWNjaWRlbnRhbGx5IHB1bGwgYHZpZXdQcm92aWRlcnNgIGluLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBNeVNlcnZpY2Uge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IFN0cmluZykge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgTXlTZXJ2aWNlLFxuICogICAgIHtwcm92aWRlOiBTdHJpbmcsIHZhbHVlOiAncHJvdmlkZXJzJyB9XG4gKiAgIF1cbiAqICAgdmlld1Byb3ZpZGVyczogW1xuICogICAgIHtwcm92aWRlOiBTdHJpbmcsIHZhbHVlOiAndmlld1Byb3ZpZGVycyd9XG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKG15U2VydmljZTogTXlTZXJ2aWNlLCB2YWx1ZTogU3RyaW5nKSB7XG4gKiAgICAgLy8gV2UgZXhwZWN0IHRoYXQgQ29tcG9uZW50IGNhbiBzZWUgaW50byBgdmlld1Byb3ZpZGVyc2AuXG4gKiAgICAgZXhwZWN0KHZhbHVlKS50b0VxdWFsKCd2aWV3UHJvdmlkZXJzJyk7XG4gKiAgICAgLy8gYE15U2VydmljZWAgd2FzIG5vdCBkZWNsYXJlZCBpbiBgdmlld1Byb3ZpZGVyc2AgaGVuY2UgaXQgY2FuJ3Qgc2VlIGl0LlxuICogICAgIGV4cGVjdChteVNlcnZpY2UudmFsdWUpLnRvRXF1YWwoJ3Byb3ZpZGVycycpO1xuICogICB9XG4gKiB9XG4gKlxuICogYGBgXG4gKi9cbmxldCBpbmNsdWRlVmlld1Byb3ZpZGVycyA9IHRydWU7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRJbmNsdWRlVmlld1Byb3ZpZGVycyh2OiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGNvbnN0IG9sZFZhbHVlID0gaW5jbHVkZVZpZXdQcm92aWRlcnM7XG4gIGluY2x1ZGVWaWV3UHJvdmlkZXJzID0gdjtcbiAgcmV0dXJuIG9sZFZhbHVlO1xufVxuXG4vKipcbiAqIFRoZSBudW1iZXIgb2Ygc2xvdHMgaW4gZWFjaCBibG9vbSBmaWx0ZXIgKHVzZWQgYnkgREkpLiBUaGUgbGFyZ2VyIHRoaXMgbnVtYmVyLCB0aGUgZmV3ZXJcbiAqIGRpcmVjdGl2ZXMgdGhhdCB3aWxsIHNoYXJlIHNsb3RzLCBhbmQgdGh1cywgdGhlIGZld2VyIGZhbHNlIHBvc2l0aXZlcyB3aGVuIGNoZWNraW5nIGZvclxuICogdGhlIGV4aXN0ZW5jZSBvZiBhIGRpcmVjdGl2ZS5cbiAqL1xuY29uc3QgQkxPT01fU0laRSA9IDI1NjtcbmNvbnN0IEJMT09NX01BU0sgPSBCTE9PTV9TSVpFIC0gMTtcblxuLyoqXG4gKiBUaGUgbnVtYmVyIG9mIGJpdHMgdGhhdCBpcyByZXByZXNlbnRlZCBieSBhIHNpbmdsZSBibG9vbSBidWNrZXQuIEpTIGJpdCBvcGVyYXRpb25zIGFyZSAzMiBiaXRzLFxuICogc28gZWFjaCBidWNrZXQgcmVwcmVzZW50cyAzMiBkaXN0aW5jdCB0b2tlbnMgd2hpY2ggYWNjb3VudHMgZm9yIGxvZzIoMzIpID0gNSBiaXRzIG9mIGEgYmxvb20gaGFzaFxuICogbnVtYmVyLlxuICovXG5jb25zdCBCTE9PTV9CVUNLRVRfQklUUyA9IDU7XG5cbi8qKiBDb3VudGVyIHVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcyBmb3IgZGlyZWN0aXZlcy4gKi9cbmxldCBuZXh0TmdFbGVtZW50SWQgPSAwO1xuXG4vKiogVmFsdWUgdXNlZCB3aGVuIHNvbWV0aGluZyB3YXNuJ3QgZm91bmQgYnkgYW4gaW5qZWN0b3IuICovXG5jb25zdCBOT1RfRk9VTkQgPSB7fTtcblxuLyoqXG4gKiBSZWdpc3RlcnMgdGhpcyBkaXJlY3RpdmUgYXMgcHJlc2VudCBpbiBpdHMgbm9kZSdzIGluamVjdG9yIGJ5IGZsaXBwaW5nIHRoZSBkaXJlY3RpdmUnc1xuICogY29ycmVzcG9uZGluZyBiaXQgaW4gdGhlIGluamVjdG9yJ3MgYmxvb20gZmlsdGVyLlxuICpcbiAqIEBwYXJhbSBpbmplY3RvckluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSBpbmplY3RvciB3aGVyZSB0aGlzIHRva2VuIHNob3VsZCBiZSByZWdpc3RlcmVkXG4gKiBAcGFyYW0gdFZpZXcgVGhlIFRWaWV3IGZvciB0aGUgaW5qZWN0b3IncyBibG9vbSBmaWx0ZXJzXG4gKiBAcGFyYW0gdHlwZSBUaGUgZGlyZWN0aXZlIHRva2VuIHRvIHJlZ2lzdGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibG9vbUFkZChcbiAgaW5qZWN0b3JJbmRleDogbnVtYmVyLFxuICB0VmlldzogVFZpZXcsXG4gIHR5cGU6IFByb3ZpZGVyVG9rZW48YW55PiB8IHN0cmluZyxcbik6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RXF1YWwodFZpZXcuZmlyc3RDcmVhdGVQYXNzLCB0cnVlLCAnZXhwZWN0ZWQgZmlyc3RDcmVhdGVQYXNzIHRvIGJlIHRydWUnKTtcbiAgbGV0IGlkOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZCA9IHR5cGUuY2hhckNvZGVBdCgwKSB8fCAwO1xuICB9IGVsc2UgaWYgKHR5cGUuaGFzT3duUHJvcGVydHkoTkdfRUxFTUVOVF9JRCkpIHtcbiAgICBpZCA9ICh0eXBlIGFzIGFueSlbTkdfRUxFTUVOVF9JRF07XG4gIH1cblxuICAvLyBTZXQgYSB1bmlxdWUgSUQgb24gdGhlIGRpcmVjdGl2ZSB0eXBlLCBzbyBpZiBzb21ldGhpbmcgdHJpZXMgdG8gaW5qZWN0IHRoZSBkaXJlY3RpdmUsXG4gIC8vIHdlIGNhbiBlYXNpbHkgcmV0cmlldmUgdGhlIElEIGFuZCBoYXNoIGl0IGludG8gdGhlIGJsb29tIGJpdCB0aGF0IHNob3VsZCBiZSBjaGVja2VkLlxuICBpZiAoaWQgPT0gbnVsbCkge1xuICAgIGlkID0gKHR5cGUgYXMgYW55KVtOR19FTEVNRU5UX0lEXSA9IG5leHROZ0VsZW1lbnRJZCsrO1xuICB9XG5cbiAgLy8gV2Ugb25seSBoYXZlIEJMT09NX1NJWkUgKDI1Nikgc2xvdHMgaW4gb3VyIGJsb29tIGZpbHRlciAoOCBidWNrZXRzICogMzIgYml0cyBlYWNoKSxcbiAgLy8gc28gYWxsIHVuaXF1ZSBJRHMgbXVzdCBiZSBtb2R1bG8tZWQgaW50byBhIG51bWJlciBmcm9tIDAgLSAyNTUgdG8gZml0IGludG8gdGhlIGZpbHRlci5cbiAgY29uc3QgYmxvb21IYXNoID0gaWQgJiBCTE9PTV9NQVNLO1xuXG4gIC8vIENyZWF0ZSBhIG1hc2sgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpYyBiaXQgYXNzb2NpYXRlZCB3aXRoIHRoZSBkaXJlY3RpdmUuXG4gIC8vIEpTIGJpdCBvcGVyYXRpb25zIGFyZSAzMiBiaXRzLCBzbyB0aGlzIHdpbGwgYmUgYSBudW1iZXIgYmV0d2VlbiAyXjAgYW5kIDJeMzEsIGNvcnJlc3BvbmRpbmdcbiAgLy8gdG8gYml0IHBvc2l0aW9ucyAwIC0gMzEgaW4gYSAzMiBiaXQgaW50ZWdlci5cbiAgY29uc3QgbWFzayA9IDEgPDwgYmxvb21IYXNoO1xuXG4gIC8vIEVhY2ggYmxvb20gYnVja2V0IGluIGB0RGF0YWAgcmVwcmVzZW50cyBgQkxPT01fQlVDS0VUX0JJVFNgIG51bWJlciBvZiBiaXRzIG9mIGBibG9vbUhhc2hgLlxuICAvLyBBbnkgYml0cyBpbiBgYmxvb21IYXNoYCBiZXlvbmQgYEJMT09NX0JVQ0tFVF9CSVRTYCBpbmRpY2F0ZSB0aGUgYnVja2V0IG9mZnNldCB0aGF0IHRoZSBtYXNrXG4gIC8vIHNob3VsZCBiZSB3cml0dGVuIHRvLlxuICAodFZpZXcuZGF0YSBhcyBudW1iZXJbXSlbaW5qZWN0b3JJbmRleCArIChibG9vbUhhc2ggPj4gQkxPT01fQlVDS0VUX0JJVFMpXSB8PSBtYXNrO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgKG9yIGdldHMgYW4gZXhpc3RpbmcpIGluamVjdG9yIGZvciBhIGdpdmVuIGVsZW1lbnQgb3IgY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB0Tm9kZSBmb3Igd2hpY2ggYW4gaW5qZWN0b3Igc2hvdWxkIGJlIHJldHJpZXZlZCAvIGNyZWF0ZWQuXG4gKiBAcGFyYW0gbFZpZXcgVmlldyB3aGVyZSB0aGUgbm9kZSBpcyBzdG9yZWRcbiAqIEByZXR1cm5zIE5vZGUgaW5qZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZShcbiAgdE5vZGU6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuICBsVmlldzogTFZpZXcsXG4pOiBudW1iZXIge1xuICBjb25zdCBleGlzdGluZ0luamVjdG9ySW5kZXggPSBnZXRJbmplY3RvckluZGV4KHROb2RlLCBsVmlldyk7XG4gIGlmIChleGlzdGluZ0luamVjdG9ySW5kZXggIT09IC0xKSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nSW5qZWN0b3JJbmRleDtcbiAgfVxuXG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzKSB7XG4gICAgdE5vZGUuaW5qZWN0b3JJbmRleCA9IGxWaWV3Lmxlbmd0aDtcbiAgICBpbnNlcnRCbG9vbSh0Vmlldy5kYXRhLCB0Tm9kZSk7IC8vIGZvdW5kYXRpb24gZm9yIG5vZGUgYmxvb21cbiAgICBpbnNlcnRCbG9vbShsVmlldywgbnVsbCk7IC8vIGZvdW5kYXRpb24gZm9yIGN1bXVsYXRpdmUgYmxvb21cbiAgICBpbnNlcnRCbG9vbSh0Vmlldy5ibHVlcHJpbnQsIG51bGwpO1xuICB9XG5cbiAgY29uc3QgcGFyZW50TG9jID0gZ2V0UGFyZW50SW5qZWN0b3JMb2NhdGlvbih0Tm9kZSwgbFZpZXcpO1xuICBjb25zdCBpbmplY3RvckluZGV4ID0gdE5vZGUuaW5qZWN0b3JJbmRleDtcblxuICAvLyBJZiBhIHBhcmVudCBpbmplY3RvciBjYW4ndCBiZSBmb3VuZCwgaXRzIGxvY2F0aW9uIGlzIHNldCB0byAtMS5cbiAgLy8gSW4gdGhhdCBjYXNlLCB3ZSBkb24ndCBuZWVkIHRvIHNldCB1cCBhIGN1bXVsYXRpdmUgYmxvb21cbiAgaWYgKGhhc1BhcmVudEluamVjdG9yKHBhcmVudExvYykpIHtcbiAgICBjb25zdCBwYXJlbnRJbmRleCA9IGdldFBhcmVudEluamVjdG9ySW5kZXgocGFyZW50TG9jKTtcbiAgICBjb25zdCBwYXJlbnRMVmlldyA9IGdldFBhcmVudEluamVjdG9yVmlldyhwYXJlbnRMb2MsIGxWaWV3KTtcbiAgICBjb25zdCBwYXJlbnREYXRhID0gcGFyZW50TFZpZXdbVFZJRVddLmRhdGEgYXMgYW55O1xuICAgIC8vIENyZWF0ZXMgYSBjdW11bGF0aXZlIGJsb29tIGZpbHRlciB0aGF0IG1lcmdlcyB0aGUgcGFyZW50J3MgYmxvb20gZmlsdGVyXG4gICAgLy8gYW5kIGl0cyBvd24gY3VtdWxhdGl2ZSBibG9vbSAod2hpY2ggY29udGFpbnMgdG9rZW5zIGZvciBhbGwgYW5jZXN0b3JzKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTm9kZUluamVjdG9yT2Zmc2V0LkJMT09NX1NJWkU7IGkrKykge1xuICAgICAgbFZpZXdbaW5qZWN0b3JJbmRleCArIGldID0gcGFyZW50TFZpZXdbcGFyZW50SW5kZXggKyBpXSB8IHBhcmVudERhdGFbcGFyZW50SW5kZXggKyBpXTtcbiAgICB9XG4gIH1cblxuICBsVmlld1tpbmplY3RvckluZGV4ICsgTm9kZUluamVjdG9yT2Zmc2V0LlBBUkVOVF0gPSBwYXJlbnRMb2M7XG4gIHJldHVybiBpbmplY3RvckluZGV4O1xufVxuXG5mdW5jdGlvbiBpbnNlcnRCbG9vbShhcnI6IGFueVtdLCBmb290ZXI6IFROb2RlIHwgbnVsbCk6IHZvaWQge1xuICBhcnIucHVzaCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCBmb290ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5qZWN0b3JJbmRleCh0Tm9kZTogVE5vZGUsIGxWaWV3OiBMVmlldyk6IG51bWJlciB7XG4gIGlmIChcbiAgICB0Tm9kZS5pbmplY3RvckluZGV4ID09PSAtMSB8fFxuICAgIC8vIElmIHRoZSBpbmplY3RvciBpbmRleCBpcyB0aGUgc2FtZSBhcyBpdHMgcGFyZW50J3MgaW5qZWN0b3IgaW5kZXgsIHRoZW4gdGhlIGluZGV4IGhhcyBiZWVuXG4gICAgLy8gY29waWVkIGRvd24gZnJvbSB0aGUgcGFyZW50IG5vZGUuIE5vIGluamVjdG9yIGhhcyBiZWVuIGNyZWF0ZWQgeWV0IG9uIHRoaXMgbm9kZS5cbiAgICAodE5vZGUucGFyZW50ICYmIHROb2RlLnBhcmVudC5pbmplY3RvckluZGV4ID09PSB0Tm9kZS5pbmplY3RvckluZGV4KSB8fFxuICAgIC8vIEFmdGVyIHRoZSBmaXJzdCB0ZW1wbGF0ZSBwYXNzLCB0aGUgaW5qZWN0b3IgaW5kZXggbWlnaHQgZXhpc3QgYnV0IHRoZSBwYXJlbnQgdmFsdWVzXG4gICAgLy8gbWlnaHQgbm90IGhhdmUgYmVlbiBjYWxjdWxhdGVkIHlldCBmb3IgdGhpcyBpbnN0YW5jZVxuICAgIGxWaWV3W3ROb2RlLmluamVjdG9ySW5kZXggKyBOb2RlSW5qZWN0b3JPZmZzZXQuUEFSRU5UXSA9PT0gbnVsbFxuICApIHtcbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydEluZGV4SW5SYW5nZShsVmlldywgdE5vZGUuaW5qZWN0b3JJbmRleCk7XG4gICAgcmV0dXJuIHROb2RlLmluamVjdG9ySW5kZXg7XG4gIH1cbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgaW5kZXggb2YgdGhlIHBhcmVudCBpbmplY3Rvciwgd2l0aCBhIHZpZXcgb2Zmc2V0IGlmIGFwcGxpY2FibGUuIFVzZWQgdG8gc2V0IHRoZVxuICogcGFyZW50IGluamVjdG9yIGluaXRpYWxseS5cbiAqXG4gKiBAcmV0dXJucyBSZXR1cm5zIGEgbnVtYmVyIHRoYXQgaXMgdGhlIGNvbWJpbmF0aW9uIG9mIHRoZSBudW1iZXIgb2YgTFZpZXdzIHRoYXQgd2UgaGF2ZSB0byBnbyB1cFxuICogdG8gZmluZCB0aGUgTFZpZXcgY29udGFpbmluZyB0aGUgcGFyZW50IGluamVjdCBBTkQgdGhlIGluZGV4IG9mIHRoZSBpbmplY3RvciB3aXRoaW4gdGhhdCBMVmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmVudEluamVjdG9yTG9jYXRpb24odE5vZGU6IFROb2RlLCBsVmlldzogTFZpZXcpOiBSZWxhdGl2ZUluamVjdG9yTG9jYXRpb24ge1xuICBpZiAodE5vZGUucGFyZW50ICYmIHROb2RlLnBhcmVudC5pbmplY3RvckluZGV4ICE9PSAtMSkge1xuICAgIC8vIElmIHdlIGhhdmUgYSBwYXJlbnQgYFROb2RlYCBhbmQgdGhlcmUgaXMgYW4gaW5qZWN0b3IgYXNzb2NpYXRlZCB3aXRoIGl0IHdlIGFyZSBkb25lLCBiZWNhdXNlXG4gICAgLy8gdGhlIHBhcmVudCBpbmplY3RvciBpcyB3aXRoaW4gdGhlIGN1cnJlbnQgYExWaWV3YC5cbiAgICByZXR1cm4gdE5vZGUucGFyZW50LmluamVjdG9ySW5kZXggYXMgUmVsYXRpdmVJbmplY3RvckxvY2F0aW9uOyAvLyBWaWV3T2Zmc2V0IGlzIDBcbiAgfVxuXG4gIC8vIFdoZW4gcGFyZW50IGluamVjdG9yIGxvY2F0aW9uIGlzIGNvbXB1dGVkIGl0IG1heSBiZSBvdXRzaWRlIG9mIHRoZSBjdXJyZW50IHZpZXcuIChpZSBpdCBjb3VsZFxuICAvLyBiZSBwb2ludGluZyB0byBhIGRlY2xhcmVkIHBhcmVudCBsb2NhdGlvbikuIFRoaXMgdmFyaWFibGUgc3RvcmVzIG51bWJlciBvZiBkZWNsYXJhdGlvbiBwYXJlbnRzXG4gIC8vIHdlIG5lZWQgdG8gd2FsayB1cCBpbiBvcmRlciB0byBmaW5kIHRoZSBwYXJlbnQgaW5qZWN0b3IgbG9jYXRpb24uXG4gIGxldCBkZWNsYXJhdGlvblZpZXdPZmZzZXQgPSAwO1xuICBsZXQgcGFyZW50VE5vZGU6IFROb2RlIHwgbnVsbCA9IG51bGw7XG4gIGxldCBsVmlld0N1cnNvcjogTFZpZXcgfCBudWxsID0gbFZpZXc7XG5cbiAgLy8gVGhlIHBhcmVudCBpbmplY3RvciBpcyBub3QgaW4gdGhlIGN1cnJlbnQgYExWaWV3YC4gV2Ugd2lsbCBoYXZlIHRvIHdhbGsgdGhlIGRlY2xhcmVkIHBhcmVudFxuICAvLyBgTFZpZXdgIGhpZXJhcmNoeSBhbmQgbG9vayBmb3IgaXQuIElmIHdlIHdhbGsgb2YgdGhlIHRvcCwgdGhhdCBtZWFucyB0aGF0IHRoZXJlIGlzIG5vIHBhcmVudFxuICAvLyBgTm9kZUluamVjdG9yYC5cbiAgd2hpbGUgKGxWaWV3Q3Vyc29yICE9PSBudWxsKSB7XG4gICAgcGFyZW50VE5vZGUgPSBnZXRUTm9kZUZyb21MVmlldyhsVmlld0N1cnNvcik7XG5cbiAgICBpZiAocGFyZW50VE5vZGUgPT09IG51bGwpIHtcbiAgICAgIC8vIElmIHdlIGhhdmUgbm8gcGFyZW50LCB0aGFuIHdlIGFyZSBkb25lLlxuICAgICAgcmV0dXJuIE5PX1BBUkVOVF9JTkpFQ1RPUjtcbiAgICB9XG5cbiAgICBuZ0Rldk1vZGUgJiYgcGFyZW50VE5vZGUgJiYgYXNzZXJ0VE5vZGVGb3JMVmlldyhwYXJlbnRUTm9kZSEsIGxWaWV3Q3Vyc29yW0RFQ0xBUkFUSU9OX1ZJRVddISk7XG4gICAgLy8gRXZlcnkgaXRlcmF0aW9uIG9mIHRoZSBsb29wIHJlcXVpcmVzIHRoYXQgd2UgZ28gdG8gdGhlIGRlY2xhcmVkIHBhcmVudC5cbiAgICBkZWNsYXJhdGlvblZpZXdPZmZzZXQrKztcbiAgICBsVmlld0N1cnNvciA9IGxWaWV3Q3Vyc29yW0RFQ0xBUkFUSU9OX1ZJRVddO1xuXG4gICAgaWYgKHBhcmVudFROb2RlLmluamVjdG9ySW5kZXggIT09IC0xKSB7XG4gICAgICAvLyBXZSBmb3VuZCBhIE5vZGVJbmplY3RvciB3aGljaCBwb2ludHMgdG8gc29tZXRoaW5nLlxuICAgICAgcmV0dXJuIChwYXJlbnRUTm9kZS5pbmplY3RvckluZGV4IHxcbiAgICAgICAgKGRlY2xhcmF0aW9uVmlld09mZnNldCA8PFxuICAgICAgICAgIFJlbGF0aXZlSW5qZWN0b3JMb2NhdGlvbkZsYWdzLlZpZXdPZmZzZXRTaGlmdCkpIGFzIFJlbGF0aXZlSW5qZWN0b3JMb2NhdGlvbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIE5PX1BBUkVOVF9JTkpFQ1RPUjtcbn1cbi8qKlxuICogTWFrZXMgYSB0eXBlIG9yIGFuIGluamVjdGlvbiB0b2tlbiBwdWJsaWMgdG8gdGhlIERJIHN5c3RlbSBieSBhZGRpbmcgaXQgdG8gYW5cbiAqIGluamVjdG9yJ3MgYmxvb20gZmlsdGVyLlxuICpcbiAqIEBwYXJhbSBkaSBUaGUgbm9kZSBpbmplY3RvciBpbiB3aGljaCBhIGRpcmVjdGl2ZSB3aWxsIGJlIGFkZGVkXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHR5cGUgb3IgdGhlIGluamVjdGlvbiB0b2tlbiB0byBiZSBtYWRlIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGlQdWJsaWNJbkluamVjdG9yKFxuICBpbmplY3RvckluZGV4OiBudW1iZXIsXG4gIHRWaWV3OiBUVmlldyxcbiAgdG9rZW46IFByb3ZpZGVyVG9rZW48YW55Pixcbik6IHZvaWQge1xuICBibG9vbUFkZChpbmplY3RvckluZGV4LCB0VmlldywgdG9rZW4pO1xufVxuXG4vKipcbiAqIEluamVjdCBzdGF0aWMgYXR0cmlidXRlIHZhbHVlIGludG8gZGlyZWN0aXZlIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgd2l0aCBgZmFjdG9yeWAgZnVuY3Rpb25zIHdoaWNoIGFyZSBnZW5lcmF0ZWQgYXMgcGFydCBvZlxuICogYGRlZmluZURpcmVjdGl2ZWAgb3IgYGRlZmluZUNvbXBvbmVudGAuIFRoZSBtZXRob2QgcmV0cmlldmVzIHRoZSBzdGF0aWMgdmFsdWVcbiAqIG9mIGFuIGF0dHJpYnV0ZS4gKER5bmFtaWMgYXR0cmlidXRlcyBhcmUgbm90IHN1cHBvcnRlZCBzaW5jZSB0aGV5IGFyZSBub3QgcmVzb2x2ZWRcbiAqICBhdCB0aGUgdGltZSBvZiBpbmplY3Rpb24gYW5kIGNhbiBjaGFuZ2Ugb3ZlciB0aW1lLilcbiAqXG4gKiAjIEV4YW1wbGVcbiAqIEdpdmVuOlxuICogYGBgXG4gKiBAQ29tcG9uZW50KC4uLilcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgndGl0bGUnKSB0aXRsZTogc3RyaW5nKSB7IC4uLiB9XG4gKiB9XG4gKiBgYGBcbiAqIFdoZW4gaW5zdGFudGlhdGVkIHdpdGhcbiAqIGBgYFxuICogPG15LWNvbXBvbmVudCB0aXRsZT1cIkhlbGxvXCI+PC9teS1jb21wb25lbnQ+XG4gKiBgYGBcbiAqXG4gKiBUaGVuIGZhY3RvcnkgbWV0aG9kIGdlbmVyYXRlZCBpczpcbiAqIGBgYFxuICogTXlDb21wb25lbnQuybVjbXAgPSBkZWZpbmVDb21wb25lbnQoe1xuICogICBmYWN0b3J5OiAoKSA9PiBuZXcgTXlDb21wb25lbnQoaW5qZWN0QXR0cmlidXRlKCd0aXRsZScpKVxuICogICAuLi5cbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RBdHRyaWJ1dGVJbXBsKHROb2RlOiBUTm9kZSwgYXR0ck5hbWVUb0luamVjdDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZVR5cGUodE5vZGUsIFROb2RlVHlwZS5BbnlDb250YWluZXIgfCBUTm9kZVR5cGUuQW55Uk5vZGUpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0Tm9kZSwgJ2V4cGVjdGluZyB0Tm9kZScpO1xuICBpZiAoYXR0ck5hbWVUb0luamVjdCA9PT0gJ2NsYXNzJykge1xuICAgIHJldHVybiB0Tm9kZS5jbGFzc2VzO1xuICB9XG4gIGlmIChhdHRyTmFtZVRvSW5qZWN0ID09PSAnc3R5bGUnKSB7XG4gICAgcmV0dXJuIHROb2RlLnN0eWxlcztcbiAgfVxuXG4gIGNvbnN0IGF0dHJzID0gdE5vZGUuYXR0cnM7XG4gIGlmIChhdHRycykge1xuICAgIGNvbnN0IGF0dHJzTGVuZ3RoID0gYXR0cnMubGVuZ3RoO1xuICAgIGxldCBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGF0dHJzTGVuZ3RoKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGF0dHJzW2ldO1xuXG4gICAgICAvLyBJZiB3ZSBoaXQgYSBgQmluZGluZ3NgIG9yIGBUZW1wbGF0ZWAgbWFya2VyIHRoZW4gd2UgYXJlIGRvbmUuXG4gICAgICBpZiAoaXNOYW1lT25seUF0dHJpYnV0ZU1hcmtlcih2YWx1ZSkpIGJyZWFrO1xuXG4gICAgICAvLyBTa2lwIG5hbWVzcGFjZWQgYXR0cmlidXRlc1xuICAgICAgaWYgKHZhbHVlID09PSBBdHRyaWJ1dGVNYXJrZXIuTmFtZXNwYWNlVVJJKSB7XG4gICAgICAgIC8vIHdlIHNraXAgdGhlIG5leHQgdHdvIHZhbHVlc1xuICAgICAgICAvLyBhcyBuYW1lc3BhY2VkIGF0dHJpYnV0ZXMgbG9va3MgbGlrZVxuICAgICAgICAvLyBbLi4uLCBBdHRyaWJ1dGVNYXJrZXIuTmFtZXNwYWNlVVJJLCAnaHR0cDovL3NvbWV1cmkuY29tL3Rlc3QnLCAndGVzdDpleGlzdCcsXG4gICAgICAgIC8vICdleGlzdFZhbHVlJywgLi4uXVxuICAgICAgICBpID0gaSArIDI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgLy8gU2tpcCB0byB0aGUgZmlyc3QgdmFsdWUgb2YgdGhlIG1hcmtlZCBhdHRyaWJ1dGUuXG4gICAgICAgIGkrKztcbiAgICAgICAgd2hpbGUgKGkgPCBhdHRyc0xlbmd0aCAmJiB0eXBlb2YgYXR0cnNbaV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBhdHRyTmFtZVRvSW5qZWN0KSB7XG4gICAgICAgIHJldHVybiBhdHRyc1tpICsgMV0gYXMgc3RyaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IGkgKyAyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gbm90Rm91bmRWYWx1ZU9yVGhyb3c8VD4oXG4gIG5vdEZvdW5kVmFsdWU6IFQgfCBudWxsLFxuICB0b2tlbjogUHJvdmlkZXJUb2tlbjxUPixcbiAgZmxhZ3M6IEluamVjdEZsYWdzLFxuKTogVCB8IG51bGwge1xuICBpZiAoZmxhZ3MgJiBJbmplY3RGbGFncy5PcHRpb25hbCB8fCBub3RGb3VuZFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbm90Rm91bmRWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvd1Byb3ZpZGVyTm90Rm91bmRFcnJvcih0b2tlbiwgJ05vZGVJbmplY3RvcicpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB0byB0aGUgZ2l2ZW4gdG9rZW4gZnJvbSB0aGUgTW9kdWxlSW5qZWN0b3Igb3IgdGhyb3dzIGV4Y2VwdGlvblxuICpcbiAqIEBwYXJhbSBsVmlldyBUaGUgYExWaWV3YCB0aGF0IGNvbnRhaW5zIHRoZSBgdE5vZGVgXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHRvIGxvb2sgZm9yXG4gKiBAcGFyYW0gZmxhZ3MgSW5qZWN0aW9uIGZsYWdzXG4gKiBAcGFyYW0gbm90Rm91bmRWYWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIHdoZW4gdGhlIGluamVjdGlvbiBmbGFncyBpcyBgSW5qZWN0RmxhZ3MuT3B0aW9uYWxgXG4gKiBAcmV0dXJucyB0aGUgdmFsdWUgZnJvbSB0aGUgaW5qZWN0b3Igb3IgdGhyb3dzIGFuIGV4Y2VwdGlvblxuICovXG5mdW5jdGlvbiBsb29rdXBUb2tlblVzaW5nTW9kdWxlSW5qZWN0b3I8VD4oXG4gIGxWaWV3OiBMVmlldyxcbiAgdG9rZW46IFByb3ZpZGVyVG9rZW48VD4sXG4gIGZsYWdzOiBJbmplY3RGbGFncyxcbiAgbm90Rm91bmRWYWx1ZT86IGFueSxcbik6IFQgfCBudWxsIHtcbiAgaWYgKGZsYWdzICYgSW5qZWN0RmxhZ3MuT3B0aW9uYWwgJiYgbm90Rm91bmRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gVGhpcyBtdXN0IGJlIHNldCBvciB0aGUgTnVsbEluamVjdG9yIHdpbGwgdGhyb3cgZm9yIG9wdGlvbmFsIGRlcHNcbiAgICBub3RGb3VuZFZhbHVlID0gbnVsbDtcbiAgfVxuXG4gIGlmICgoZmxhZ3MgJiAoSW5qZWN0RmxhZ3MuU2VsZiB8IEluamVjdEZsYWdzLkhvc3QpKSA9PT0gMCkge1xuICAgIGNvbnN0IG1vZHVsZUluamVjdG9yID0gbFZpZXdbSU5KRUNUT1JdO1xuICAgIC8vIHN3aXRjaCB0byBgaW5qZWN0SW5qZWN0b3JPbmx5YCBpbXBsZW1lbnRhdGlvbiBmb3IgbW9kdWxlIGluamVjdG9yLCBzaW5jZSBtb2R1bGUgaW5qZWN0b3JcbiAgICAvLyBzaG91bGQgbm90IGhhdmUgYWNjZXNzIHRvIENvbXBvbmVudC9EaXJlY3RpdmUgREkgc2NvcGUgKHRoYXQgbWF5IGhhcHBlbiB0aHJvdWdoXG4gICAgLy8gYGRpcmVjdGl2ZUluamVjdGAgaW1wbGVtZW50YXRpb24pXG4gICAgY29uc3QgcHJldmlvdXNJbmplY3RJbXBsZW1lbnRhdGlvbiA9IHNldEluamVjdEltcGxlbWVudGF0aW9uKHVuZGVmaW5lZCk7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChtb2R1bGVJbmplY3Rvcikge1xuICAgICAgICByZXR1cm4gbW9kdWxlSW5qZWN0b3IuZ2V0KHRva2VuLCBub3RGb3VuZFZhbHVlLCBmbGFncyAmIEluamVjdEZsYWdzLk9wdGlvbmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbmplY3RSb290TGltcE1vZGUodG9rZW4sIG5vdEZvdW5kVmFsdWUsIGZsYWdzICYgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRJbmplY3RJbXBsZW1lbnRhdGlvbihwcmV2aW91c0luamVjdEltcGxlbWVudGF0aW9uKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5vdEZvdW5kVmFsdWVPclRocm93PFQ+KG5vdEZvdW5kVmFsdWUsIHRva2VuLCBmbGFncyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB0byB0aGUgZ2l2ZW4gdG9rZW4gZnJvbSB0aGUgTm9kZUluamVjdG9ycyA9PiBNb2R1bGVJbmplY3Rvci5cbiAqXG4gKiBMb29rIGZvciB0aGUgaW5qZWN0b3IgcHJvdmlkaW5nIHRoZSB0b2tlbiBieSB3YWxraW5nIHVwIHRoZSBub2RlIGluamVjdG9yIHRyZWUgYW5kIHRoZW5cbiAqIHRoZSBtb2R1bGUgaW5qZWN0b3IgdHJlZS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHBhdGNoZXMgYHRva2VuYCB3aXRoIGBfX05HX0VMRU1FTlRfSURfX2Agd2hpY2ggY29udGFpbnMgdGhlIGlkIGZvciB0aGUgYmxvb21cbiAqIGZpbHRlci4gYC0xYCBpcyByZXNlcnZlZCBmb3IgaW5qZWN0aW5nIGBJbmplY3RvcmAgKGltcGxlbWVudGVkIGJ5IGBOb2RlSW5qZWN0b3JgKVxuICpcbiAqIEBwYXJhbSB0Tm9kZSBUaGUgTm9kZSB3aGVyZSB0aGUgc2VhcmNoIGZvciB0aGUgaW5qZWN0b3Igc2hvdWxkIHN0YXJ0XG4gKiBAcGFyYW0gbFZpZXcgVGhlIGBMVmlld2AgdGhhdCBjb250YWlucyB0aGUgYHROb2RlYFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiB0byBsb29rIGZvclxuICogQHBhcmFtIGZsYWdzIEluamVjdGlvbiBmbGFnc1xuICogQHBhcmFtIG5vdEZvdW5kVmFsdWUgVGhlIHZhbHVlIHRvIHJldHVybiB3aGVuIHRoZSBpbmplY3Rpb24gZmxhZ3MgaXMgYEluamVjdEZsYWdzLk9wdGlvbmFsYFxuICogQHJldHVybnMgdGhlIHZhbHVlIGZyb20gdGhlIGluamVjdG9yLCBgbnVsbGAgd2hlbiBub3QgZm91bmQsIG9yIGBub3RGb3VuZFZhbHVlYCBpZiBwcm92aWRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JDcmVhdGVJbmplY3RhYmxlPFQ+KFxuICB0Tm9kZTogVERpcmVjdGl2ZUhvc3ROb2RlIHwgbnVsbCxcbiAgbFZpZXc6IExWaWV3LFxuICB0b2tlbjogUHJvdmlkZXJUb2tlbjxUPixcbiAgZmxhZ3M6IEluamVjdEZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdCxcbiAgbm90Rm91bmRWYWx1ZT86IGFueSxcbik6IFQgfCBudWxsIHtcbiAgaWYgKHROb2RlICE9PSBudWxsKSB7XG4gICAgLy8gSWYgdGhlIHZpZXcgb3IgYW55IG9mIGl0cyBhbmNlc3RvcnMgaGF2ZSBhbiBlbWJlZGRlZFxuICAgIC8vIHZpZXcgaW5qZWN0b3IsIHdlIGhhdmUgdG8gbG9vayBpdCB1cCB0aGVyZSBmaXJzdC5cbiAgICBpZiAoXG4gICAgICBsVmlld1tGTEFHU10gJiBMVmlld0ZsYWdzLkhhc0VtYmVkZGVkVmlld0luamVjdG9yICYmXG4gICAgICAvLyBUaGUgdG9rZW4gbXVzdCBiZSBwcmVzZW50IG9uIHRoZSBjdXJyZW50IG5vZGUgaW5qZWN0b3Igd2hlbiB0aGUgYFNlbGZgXG4gICAgICAvLyBmbGFnIGlzIHNldCwgc28gdGhlIGxvb2t1cCBvbiBlbWJlZGRlZCB2aWV3IGluamVjdG9yKHMpIGNhbiBiZSBza2lwcGVkLlxuICAgICAgIShmbGFncyAmIEluamVjdEZsYWdzLlNlbGYpXG4gICAgKSB7XG4gICAgICBjb25zdCBlbWJlZGRlZEluamVjdG9yVmFsdWUgPSBsb29rdXBUb2tlblVzaW5nRW1iZWRkZWRJbmplY3RvcihcbiAgICAgICAgdE5vZGUsXG4gICAgICAgIGxWaWV3LFxuICAgICAgICB0b2tlbixcbiAgICAgICAgZmxhZ3MsXG4gICAgICAgIE5PVF9GT1VORCxcbiAgICAgICk7XG4gICAgICBpZiAoZW1iZWRkZWRJbmplY3RvclZhbHVlICE9PSBOT1RfRk9VTkQpIHtcbiAgICAgICAgcmV0dXJuIGVtYmVkZGVkSW5qZWN0b3JWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UgdHJ5IHRoZSBub2RlIGluamVjdG9yLlxuICAgIGNvbnN0IHZhbHVlID0gbG9va3VwVG9rZW5Vc2luZ05vZGVJbmplY3Rvcih0Tm9kZSwgbFZpZXcsIHRva2VuLCBmbGFncywgTk9UX0ZPVU5EKTtcbiAgICBpZiAodmFsdWUgIT09IE5PVF9GT1VORCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmFsbHksIGZhbGwgYmFjayB0byB0aGUgbW9kdWxlIGluamVjdG9yLlxuICByZXR1cm4gbG9va3VwVG9rZW5Vc2luZ01vZHVsZUluamVjdG9yPFQ+KGxWaWV3LCB0b2tlbiwgZmxhZ3MsIG5vdEZvdW5kVmFsdWUpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgdG8gdGhlIGdpdmVuIHRva2VuIGZyb20gdGhlIG5vZGUgaW5qZWN0b3IuXG4gKlxuICogQHBhcmFtIHROb2RlIFRoZSBOb2RlIHdoZXJlIHRoZSBzZWFyY2ggZm9yIHRoZSBpbmplY3RvciBzaG91bGQgc3RhcnRcbiAqIEBwYXJhbSBsVmlldyBUaGUgYExWaWV3YCB0aGF0IGNvbnRhaW5zIHRoZSBgdE5vZGVgXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHRvIGxvb2sgZm9yXG4gKiBAcGFyYW0gZmxhZ3MgSW5qZWN0aW9uIGZsYWdzXG4gKiBAcGFyYW0gbm90Rm91bmRWYWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIHdoZW4gdGhlIGluamVjdGlvbiBmbGFncyBpcyBgSW5qZWN0RmxhZ3MuT3B0aW9uYWxgXG4gKiBAcmV0dXJucyB0aGUgdmFsdWUgZnJvbSB0aGUgaW5qZWN0b3IsIGBudWxsYCB3aGVuIG5vdCBmb3VuZCwgb3IgYG5vdEZvdW5kVmFsdWVgIGlmIHByb3ZpZGVkXG4gKi9cbmZ1bmN0aW9uIGxvb2t1cFRva2VuVXNpbmdOb2RlSW5qZWN0b3I8VD4oXG4gIHROb2RlOiBURGlyZWN0aXZlSG9zdE5vZGUsXG4gIGxWaWV3OiBMVmlldyxcbiAgdG9rZW46IFByb3ZpZGVyVG9rZW48VD4sXG4gIGZsYWdzOiBJbmplY3RGbGFncyxcbiAgbm90Rm91bmRWYWx1ZT86IGFueSxcbikge1xuICBjb25zdCBibG9vbUhhc2ggPSBibG9vbUhhc2hCaXRPckZhY3RvcnkodG9rZW4pO1xuICAvLyBJZiB0aGUgSUQgc3RvcmVkIGhlcmUgaXMgYSBmdW5jdGlvbiwgdGhpcyBpcyBhIHNwZWNpYWwgb2JqZWN0IGxpa2UgRWxlbWVudFJlZiBvciBUZW1wbGF0ZVJlZlxuICAvLyBzbyBqdXN0IGNhbGwgdGhlIGZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGl0LlxuICBpZiAodHlwZW9mIGJsb29tSGFzaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICghZW50ZXJESShsVmlldywgdE5vZGUsIGZsYWdzKSkge1xuICAgICAgLy8gRmFpbGVkIHRvIGVudGVyIERJLCB0cnkgbW9kdWxlIGluamVjdG9yIGluc3RlYWQuIElmIGEgdG9rZW4gaXMgaW5qZWN0ZWQgd2l0aCB0aGUgQEhvc3RcbiAgICAgIC8vIGZsYWcsIHRoZSBtb2R1bGUgaW5qZWN0b3IgaXMgbm90IHNlYXJjaGVkIGZvciB0aGF0IHRva2VuIGluIEl2eS5cbiAgICAgIHJldHVybiBmbGFncyAmIEluamVjdEZsYWdzLkhvc3RcbiAgICAgICAgPyBub3RGb3VuZFZhbHVlT3JUaHJvdzxUPihub3RGb3VuZFZhbHVlLCB0b2tlbiwgZmxhZ3MpXG4gICAgICAgIDogbG9va3VwVG9rZW5Vc2luZ01vZHVsZUluamVjdG9yPFQ+KGxWaWV3LCB0b2tlbiwgZmxhZ3MsIG5vdEZvdW5kVmFsdWUpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgbGV0IHZhbHVlOiB1bmtub3duO1xuXG4gICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgIHJ1bkluSW5qZWN0b3JQcm9maWxlckNvbnRleHQoXG4gICAgICAgICAgbmV3IE5vZGVJbmplY3RvcihnZXRDdXJyZW50VE5vZGUoKSBhcyBURWxlbWVudE5vZGUsIGdldExWaWV3KCkpLFxuICAgICAgICAgIHRva2VuIGFzIFR5cGU8VD4sXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdmFsdWUgPSBibG9vbUhhc2goZmxhZ3MpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBlbWl0SW5zdGFuY2VDcmVhdGVkQnlJbmplY3RvckV2ZW50KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBibG9vbUhhc2goZmxhZ3MpO1xuICAgICAgfVxuXG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCAmJiAhKGZsYWdzICYgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpKSB7XG4gICAgICAgIHRocm93UHJvdmlkZXJOb3RGb3VuZEVycm9yKHRva2VuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgbGVhdmVESSgpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgYmxvb21IYXNoID09PSAnbnVtYmVyJykge1xuICAgIC8vIEEgcmVmZXJlbmNlIHRvIHRoZSBwcmV2aW91cyBpbmplY3RvciBUVmlldyB0aGF0IHdhcyBmb3VuZCB3aGlsZSBjbGltYmluZyB0aGUgZWxlbWVudFxuICAgIC8vIGluamVjdG9yIHRyZWUuIFRoaXMgaXMgdXNlZCB0byBrbm93IGlmIHZpZXdQcm92aWRlcnMgY2FuIGJlIGFjY2Vzc2VkIG9uIHRoZSBjdXJyZW50XG4gICAgLy8gaW5qZWN0b3IuXG4gICAgbGV0IHByZXZpb3VzVFZpZXc6IFRWaWV3IHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGluamVjdG9ySW5kZXggPSBnZXRJbmplY3RvckluZGV4KHROb2RlLCBsVmlldyk7XG4gICAgbGV0IHBhcmVudExvY2F0aW9uID0gTk9fUEFSRU5UX0lOSkVDVE9SO1xuICAgIGxldCBob3N0VEVsZW1lbnROb2RlOiBUTm9kZSB8IG51bGwgPVxuICAgICAgZmxhZ3MgJiBJbmplY3RGbGFncy5Ib3N0ID8gbFZpZXdbREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVddW1RfSE9TVF0gOiBudWxsO1xuXG4gICAgLy8gSWYgd2Ugc2hvdWxkIHNraXAgdGhpcyBpbmplY3Rvciwgb3IgaWYgdGhlcmUgaXMgbm8gaW5qZWN0b3Igb24gdGhpcyBub2RlLCBzdGFydCBieVxuICAgIC8vIHNlYXJjaGluZyB0aGUgcGFyZW50IGluamVjdG9yLlxuICAgIGlmIChpbmplY3RvckluZGV4ID09PSAtMSB8fCBmbGFncyAmIEluamVjdEZsYWdzLlNraXBTZWxmKSB7XG4gICAgICBwYXJlbnRMb2NhdGlvbiA9XG4gICAgICAgIGluamVjdG9ySW5kZXggPT09IC0xXG4gICAgICAgICAgPyBnZXRQYXJlbnRJbmplY3RvckxvY2F0aW9uKHROb2RlLCBsVmlldylcbiAgICAgICAgICA6IGxWaWV3W2luamVjdG9ySW5kZXggKyBOb2RlSW5qZWN0b3JPZmZzZXQuUEFSRU5UXTtcblxuICAgICAgaWYgKHBhcmVudExvY2F0aW9uID09PSBOT19QQVJFTlRfSU5KRUNUT1IgfHwgIXNob3VsZFNlYXJjaFBhcmVudChmbGFncywgZmFsc2UpKSB7XG4gICAgICAgIGluamVjdG9ySW5kZXggPSAtMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByZXZpb3VzVFZpZXcgPSBsVmlld1tUVklFV107XG4gICAgICAgIGluamVjdG9ySW5kZXggPSBnZXRQYXJlbnRJbmplY3RvckluZGV4KHBhcmVudExvY2F0aW9uKTtcbiAgICAgICAgbFZpZXcgPSBnZXRQYXJlbnRJbmplY3RvclZpZXcocGFyZW50TG9jYXRpb24sIGxWaWV3KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUcmF2ZXJzZSB1cCB0aGUgaW5qZWN0b3IgdHJlZSB1bnRpbCB3ZSBmaW5kIGEgcG90ZW50aWFsIG1hdGNoIG9yIHVudGlsIHdlIGtub3cgdGhlcmVcbiAgICAvLyAqaXNuJ3QqIGEgbWF0Y2guXG4gICAgd2hpbGUgKGluamVjdG9ySW5kZXggIT09IC0xKSB7XG4gICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm9kZUluamVjdG9yKGxWaWV3LCBpbmplY3RvckluZGV4KTtcblxuICAgICAgLy8gQ2hlY2sgdGhlIGN1cnJlbnQgaW5qZWN0b3IuIElmIGl0IG1hdGNoZXMsIHNlZSBpZiBpdCBjb250YWlucyB0b2tlbi5cbiAgICAgIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgIGFzc2VydFROb2RlRm9yTFZpZXcodFZpZXcuZGF0YVtpbmplY3RvckluZGV4ICsgTm9kZUluamVjdG9yT2Zmc2V0LlROT0RFXSBhcyBUTm9kZSwgbFZpZXcpO1xuICAgICAgaWYgKGJsb29tSGFzVG9rZW4oYmxvb21IYXNoLCBpbmplY3RvckluZGV4LCB0Vmlldy5kYXRhKSkge1xuICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB3ZSBoYXZlIGFuIGluamVjdG9yIHdoaWNoICptYXkqIGNvbnRhaW4gdGhlIHRva2VuLCBzbyB3ZSBzdGVwIHRocm91Z2hcbiAgICAgICAgLy8gdGhlIHByb3ZpZGVycyBhbmQgZGlyZWN0aXZlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGluamVjdG9yJ3MgY29ycmVzcG9uZGluZyBub2RlIHRvIGdldFxuICAgICAgICAvLyB0aGUgaW5zdGFuY2UuXG4gICAgICAgIGNvbnN0IGluc3RhbmNlOiBUIHwge30gfCBudWxsID0gc2VhcmNoVG9rZW5zT25JbmplY3RvcjxUPihcbiAgICAgICAgICBpbmplY3RvckluZGV4LFxuICAgICAgICAgIGxWaWV3LFxuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIHByZXZpb3VzVFZpZXcsXG4gICAgICAgICAgZmxhZ3MsXG4gICAgICAgICAgaG9zdFRFbGVtZW50Tm9kZSxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGluc3RhbmNlICE9PSBOT1RfRk9VTkQpIHtcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBhcmVudExvY2F0aW9uID0gbFZpZXdbaW5qZWN0b3JJbmRleCArIE5vZGVJbmplY3Rvck9mZnNldC5QQVJFTlRdO1xuICAgICAgaWYgKFxuICAgICAgICBwYXJlbnRMb2NhdGlvbiAhPT0gTk9fUEFSRU5UX0lOSkVDVE9SICYmXG4gICAgICAgIHNob3VsZFNlYXJjaFBhcmVudChcbiAgICAgICAgICBmbGFncyxcbiAgICAgICAgICBsVmlld1tUVklFV10uZGF0YVtpbmplY3RvckluZGV4ICsgTm9kZUluamVjdG9yT2Zmc2V0LlROT0RFXSA9PT0gaG9zdFRFbGVtZW50Tm9kZSxcbiAgICAgICAgKSAmJlxuICAgICAgICBibG9vbUhhc1Rva2VuKGJsb29tSGFzaCwgaW5qZWN0b3JJbmRleCwgbFZpZXcpXG4gICAgICApIHtcbiAgICAgICAgLy8gVGhlIGRlZiB3YXNuJ3QgZm91bmQgYW55d2hlcmUgb24gdGhpcyBub2RlLCBzbyBpdCB3YXMgYSBmYWxzZSBwb3NpdGl2ZS5cbiAgICAgICAgLy8gVHJhdmVyc2UgdXAgdGhlIHRyZWUgYW5kIGNvbnRpbnVlIHNlYXJjaGluZy5cbiAgICAgICAgcHJldmlvdXNUVmlldyA9IHRWaWV3O1xuICAgICAgICBpbmplY3RvckluZGV4ID0gZ2V0UGFyZW50SW5qZWN0b3JJbmRleChwYXJlbnRMb2NhdGlvbik7XG4gICAgICAgIGxWaWV3ID0gZ2V0UGFyZW50SW5qZWN0b3JWaWV3KHBhcmVudExvY2F0aW9uLCBsVmlldyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB3ZSBzaG91bGQgbm90IHNlYXJjaCBwYXJlbnQgT1IgSWYgdGhlIGFuY2VzdG9yIGJsb29tIGZpbHRlciB2YWx1ZSBkb2VzIG5vdCBoYXZlIHRoZVxuICAgICAgICAvLyBiaXQgY29ycmVzcG9uZGluZyB0byB0aGUgZGlyZWN0aXZlIHdlIGNhbiBnaXZlIHVwIG9uIHRyYXZlcnNpbmcgdXAgdG8gZmluZCB0aGUgc3BlY2lmaWNcbiAgICAgICAgLy8gaW5qZWN0b3IuXG4gICAgICAgIGluamVjdG9ySW5kZXggPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbm90Rm91bmRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gc2VhcmNoVG9rZW5zT25JbmplY3RvcjxUPihcbiAgaW5qZWN0b3JJbmRleDogbnVtYmVyLFxuICBsVmlldzogTFZpZXcsXG4gIHRva2VuOiBQcm92aWRlclRva2VuPFQ+LFxuICBwcmV2aW91c1RWaWV3OiBUVmlldyB8IG51bGwsXG4gIGZsYWdzOiBJbmplY3RGbGFncyxcbiAgaG9zdFRFbGVtZW50Tm9kZTogVE5vZGUgfCBudWxsLFxuKSB7XG4gIGNvbnN0IGN1cnJlbnRUVmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3QgdE5vZGUgPSBjdXJyZW50VFZpZXcuZGF0YVtpbmplY3RvckluZGV4ICsgTm9kZUluamVjdG9yT2Zmc2V0LlROT0RFXSBhcyBUTm9kZTtcbiAgLy8gRmlyc3QsIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIGlmIHZpZXcgcHJvdmlkZXJzIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgc3RhcnRpbmcgZWxlbWVudC5cbiAgLy8gVGhlcmUgYXJlIHR3byBwb3NzaWJpbGl0aWVzXG4gIGNvbnN0IGNhbkFjY2Vzc1ZpZXdQcm92aWRlcnMgPVxuICAgIHByZXZpb3VzVFZpZXcgPT0gbnVsbFxuICAgICAgPyAvLyAxKSBUaGlzIGlzIHRoZSBmaXJzdCBpbnZvY2F0aW9uIGBwcmV2aW91c1RWaWV3ID09IG51bGxgIHdoaWNoIG1lYW5zIHRoYXQgd2UgYXJlIGF0IHRoZVxuICAgICAgICAvLyBgVE5vZGVgIG9mIHdoZXJlIGluamVjdG9yIGlzIHN0YXJ0aW5nIHRvIGxvb2suIEluIHN1Y2ggYSBjYXNlIHRoZSBvbmx5IHRpbWUgd2UgYXJlIGFsbG93ZWRcbiAgICAgICAgLy8gdG8gbG9vayBpbnRvIHRoZSBWaWV3UHJvdmlkZXJzIGlzIGlmOlxuICAgICAgICAvLyAtIHdlIGFyZSBvbiBhIGNvbXBvbmVudFxuICAgICAgICAvLyAtIEFORCB0aGUgaW5qZWN0b3Igc2V0IGBpbmNsdWRlVmlld1Byb3ZpZGVyc2AgdG8gdHJ1ZSAoaW1wbHlpbmcgdGhhdCB0aGUgdG9rZW4gY2FuIHNlZVxuICAgICAgICAvLyBWaWV3UHJvdmlkZXJzIGJlY2F1c2UgaXQgaXMgdGhlIENvbXBvbmVudCBvciBhIFNlcnZpY2Ugd2hpY2ggaXRzZWxmIHdhcyBkZWNsYXJlZCBpblxuICAgICAgICAvLyBWaWV3UHJvdmlkZXJzKVxuICAgICAgICBpc0NvbXBvbmVudEhvc3QodE5vZGUpICYmIGluY2x1ZGVWaWV3UHJvdmlkZXJzXG4gICAgICA6IC8vIDIpIGBwcmV2aW91c1RWaWV3ICE9IG51bGxgIHdoaWNoIG1lYW5zIHRoYXQgd2UgYXJlIG5vdyB3YWxraW5nIGFjcm9zcyB0aGUgcGFyZW50IG5vZGVzLlxuICAgICAgICAvLyBJbiBzdWNoIGEgY2FzZSB3ZSBhcmUgb25seSBhbGxvd2VkIHRvIGxvb2sgaW50byB0aGUgVmlld1Byb3ZpZGVycyBpZjpcbiAgICAgICAgLy8gLSBXZSBqdXN0IGNyb3NzZWQgZnJvbSBjaGlsZCBWaWV3IHRvIFBhcmVudCBWaWV3IGBwcmV2aW91c1RWaWV3ICE9IGN1cnJlbnRUVmlld2BcbiAgICAgICAgLy8gLSBBTkQgdGhlIHBhcmVudCBUTm9kZSBpcyBhbiBFbGVtZW50LlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgd2UganVzdCBjYW1lIGZyb20gdGhlIENvbXBvbmVudCdzIFZpZXcgYW5kIHRoZXJlZm9yZSBhcmUgYWxsb3dlZCB0byBzZWVcbiAgICAgICAgLy8gaW50byB0aGUgVmlld1Byb3ZpZGVycy5cbiAgICAgICAgcHJldmlvdXNUVmlldyAhPSBjdXJyZW50VFZpZXcgJiYgKHROb2RlLnR5cGUgJiBUTm9kZVR5cGUuQW55Uk5vZGUpICE9PSAwO1xuXG4gIC8vIFRoaXMgc3BlY2lhbCBjYXNlIGhhcHBlbnMgd2hlbiB0aGVyZSBpcyBhIEBob3N0IG9uIHRoZSBpbmplY3QgYW5kIHdoZW4gd2UgYXJlIHNlYXJjaGluZ1xuICAvLyBvbiB0aGUgaG9zdCBlbGVtZW50IG5vZGUuXG4gIGNvbnN0IGlzSG9zdFNwZWNpYWxDYXNlID0gZmxhZ3MgJiBJbmplY3RGbGFncy5Ib3N0ICYmIGhvc3RURWxlbWVudE5vZGUgPT09IHROb2RlO1xuXG4gIGNvbnN0IGluamVjdGFibGVJZHggPSBsb2NhdGVEaXJlY3RpdmVPclByb3ZpZGVyKFxuICAgIHROb2RlLFxuICAgIGN1cnJlbnRUVmlldyxcbiAgICB0b2tlbixcbiAgICBjYW5BY2Nlc3NWaWV3UHJvdmlkZXJzLFxuICAgIGlzSG9zdFNwZWNpYWxDYXNlLFxuICApO1xuICBpZiAoaW5qZWN0YWJsZUlkeCAhPT0gbnVsbCkge1xuICAgIHJldHVybiBnZXROb2RlSW5qZWN0YWJsZShsVmlldywgY3VycmVudFRWaWV3LCBpbmplY3RhYmxlSWR4LCB0Tm9kZSBhcyBURWxlbWVudE5vZGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBOT1RfRk9VTkQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTZWFyY2hlcyBmb3IgdGhlIGdpdmVuIHRva2VuIGFtb25nIHRoZSBub2RlJ3MgZGlyZWN0aXZlcyBhbmQgcHJvdmlkZXJzLlxuICpcbiAqIEBwYXJhbSB0Tm9kZSBUTm9kZSBvbiB3aGljaCBkaXJlY3RpdmVzIGFyZSBwcmVzZW50LlxuICogQHBhcmFtIHRWaWV3IFRoZSB0VmlldyB3ZSBhcmUgY3VycmVudGx5IHByb2Nlc3NpbmdcbiAqIEBwYXJhbSB0b2tlbiBQcm92aWRlciB0b2tlbiBvciB0eXBlIG9mIGEgZGlyZWN0aXZlIHRvIGxvb2sgZm9yLlxuICogQHBhcmFtIGNhbkFjY2Vzc1ZpZXdQcm92aWRlcnMgV2hldGhlciB2aWV3IHByb3ZpZGVycyBzaG91bGQgYmUgY29uc2lkZXJlZC5cbiAqIEBwYXJhbSBpc0hvc3RTcGVjaWFsQ2FzZSBXaGV0aGVyIHRoZSBob3N0IHNwZWNpYWwgY2FzZSBhcHBsaWVzLlxuICogQHJldHVybnMgSW5kZXggb2YgYSBmb3VuZCBkaXJlY3RpdmUgb3IgcHJvdmlkZXIsIG9yIG51bGwgd2hlbiBub25lIGZvdW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9jYXRlRGlyZWN0aXZlT3JQcm92aWRlcjxUPihcbiAgdE5vZGU6IFROb2RlLFxuICB0VmlldzogVFZpZXcsXG4gIHRva2VuOiBQcm92aWRlclRva2VuPFQ+IHwgc3RyaW5nLFxuICBjYW5BY2Nlc3NWaWV3UHJvdmlkZXJzOiBib29sZWFuLFxuICBpc0hvc3RTcGVjaWFsQ2FzZTogYm9vbGVhbiB8IG51bWJlcixcbik6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBub2RlUHJvdmlkZXJJbmRleGVzID0gdE5vZGUucHJvdmlkZXJJbmRleGVzO1xuICBjb25zdCB0SW5qZWN0YWJsZXMgPSB0Vmlldy5kYXRhO1xuXG4gIGNvbnN0IGluamVjdGFibGVzU3RhcnQgPSBub2RlUHJvdmlkZXJJbmRleGVzICYgVE5vZGVQcm92aWRlckluZGV4ZXMuUHJvdmlkZXJzU3RhcnRJbmRleE1hc2s7XG4gIGNvbnN0IGRpcmVjdGl2ZXNTdGFydCA9IHROb2RlLmRpcmVjdGl2ZVN0YXJ0O1xuICBjb25zdCBkaXJlY3RpdmVFbmQgPSB0Tm9kZS5kaXJlY3RpdmVFbmQ7XG4gIGNvbnN0IGNwdFZpZXdQcm92aWRlcnNDb3VudCA9XG4gICAgbm9kZVByb3ZpZGVySW5kZXhlcyA+PiBUTm9kZVByb3ZpZGVySW5kZXhlcy5DcHRWaWV3UHJvdmlkZXJzQ291bnRTaGlmdDtcbiAgY29uc3Qgc3RhcnRpbmdJbmRleCA9IGNhbkFjY2Vzc1ZpZXdQcm92aWRlcnNcbiAgICA/IGluamVjdGFibGVzU3RhcnRcbiAgICA6IGluamVjdGFibGVzU3RhcnQgKyBjcHRWaWV3UHJvdmlkZXJzQ291bnQ7XG4gIC8vIFdoZW4gdGhlIGhvc3Qgc3BlY2lhbCBjYXNlIGFwcGxpZXMsIG9ubHkgdGhlIHZpZXdQcm92aWRlcnMgYW5kIHRoZSBjb21wb25lbnQgYXJlIHZpc2libGVcbiAgY29uc3QgZW5kSW5kZXggPSBpc0hvc3RTcGVjaWFsQ2FzZSA/IGluamVjdGFibGVzU3RhcnQgKyBjcHRWaWV3UHJvdmlkZXJzQ291bnQgOiBkaXJlY3RpdmVFbmQ7XG4gIGZvciAobGV0IGkgPSBzdGFydGluZ0luZGV4OyBpIDwgZW5kSW5kZXg7IGkrKykge1xuICAgIGNvbnN0IHByb3ZpZGVyVG9rZW5PckRlZiA9IHRJbmplY3RhYmxlc1tpXSBhcyBQcm92aWRlclRva2VuPGFueT4gfCBEaXJlY3RpdmVEZWY8YW55PiB8IHN0cmluZztcbiAgICBpZiAoXG4gICAgICAoaSA8IGRpcmVjdGl2ZXNTdGFydCAmJiB0b2tlbiA9PT0gcHJvdmlkZXJUb2tlbk9yRGVmKSB8fFxuICAgICAgKGkgPj0gZGlyZWN0aXZlc1N0YXJ0ICYmIChwcm92aWRlclRva2VuT3JEZWYgYXMgRGlyZWN0aXZlRGVmPGFueT4pLnR5cGUgPT09IHRva2VuKVxuICAgICkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIGlmIChpc0hvc3RTcGVjaWFsQ2FzZSkge1xuICAgIGNvbnN0IGRpckRlZiA9IHRJbmplY3RhYmxlc1tkaXJlY3RpdmVzU3RhcnRdIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xuICAgIGlmIChkaXJEZWYgJiYgaXNDb21wb25lbnREZWYoZGlyRGVmKSAmJiBkaXJEZWYudHlwZSA9PT0gdG9rZW4pIHtcbiAgICAgIHJldHVybiBkaXJlY3RpdmVzU3RhcnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIG9yIGluc3RhbnRpYXRlIHRoZSBpbmplY3RhYmxlIGZyb20gdGhlIGBMVmlld2AgYXQgcGFydGljdWxhciBgaW5kZXhgLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIHRvIHNlZSBpZiB0aGUgdmFsdWUgaGFzIGFscmVhZHkgYmVlbiBpbnN0YW50aWF0ZWQgYW5kIGlmIHNvIHJldHVybnMgdGhlXG4gKiBjYWNoZWQgYGluamVjdGFibGVgLiBPdGhlcndpc2UgaWYgaXQgZGV0ZWN0cyB0aGF0IHRoZSB2YWx1ZSBpcyBzdGlsbCBhIGZhY3RvcnkgaXRcbiAqIGluc3RhbnRpYXRlcyB0aGUgYGluamVjdGFibGVgIGFuZCBjYWNoZXMgdGhlIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZUluamVjdGFibGUoXG4gIGxWaWV3OiBMVmlldyxcbiAgdFZpZXc6IFRWaWV3LFxuICBpbmRleDogbnVtYmVyLFxuICB0Tm9kZTogVERpcmVjdGl2ZUhvc3ROb2RlLFxuKTogYW55IHtcbiAgbGV0IHZhbHVlID0gbFZpZXdbaW5kZXhdO1xuICBjb25zdCB0RGF0YSA9IHRWaWV3LmRhdGE7XG4gIGlmIChpc0ZhY3RvcnkodmFsdWUpKSB7XG4gICAgY29uc3QgZmFjdG9yeTogTm9kZUluamVjdG9yRmFjdG9yeSA9IHZhbHVlO1xuICAgIGlmIChmYWN0b3J5LnJlc29sdmluZykge1xuICAgICAgdGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3Ioc3RyaW5naWZ5Rm9yRXJyb3IodERhdGFbaW5kZXhdKSk7XG4gICAgfVxuICAgIGNvbnN0IHByZXZpb3VzSW5jbHVkZVZpZXdQcm92aWRlcnMgPSBzZXRJbmNsdWRlVmlld1Byb3ZpZGVycyhmYWN0b3J5LmNhblNlZVZpZXdQcm92aWRlcnMpO1xuICAgIGZhY3RvcnkucmVzb2x2aW5nID0gdHJ1ZTtcblxuICAgIGxldCBwcmV2SW5qZWN0Q29udGV4dDogSW5qZWN0b3JQcm9maWxlckNvbnRleHQgfCB1bmRlZmluZWQ7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgLy8gdERhdGEgaW5kZXhlcyBtaXJyb3IgdGhlIGNvbmNyZXRlIGluc3RhbmNlcyBpbiBpdHMgY29ycmVzcG9uZGluZyBMVmlldy5cbiAgICAgIC8vIGxWaWV3W2luZGV4XSBoZXJlIGlzIGVpdGhlciB0aGUgaW5qZWN0YWJsZSBpbnN0YWNlIGl0c2VsZiBvciBhIGZhY3RvcnksXG4gICAgICAvLyB0aGVyZWZvcmUgdERhdGFbaW5kZXhdIGlzIHRoZSBjb25zdHJ1Y3RvciBvZiB0aGF0IGluamVjdGFibGUgb3IgYVxuICAgICAgLy8gZGVmaW5pdGlvbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgY29uc3RydWN0b3IgaW4gYSBgLnR5cGVgIGZpZWxkLlxuICAgICAgY29uc3QgdG9rZW4gPVxuICAgICAgICAodERhdGFbaW5kZXhdIGFzIERpcmVjdGl2ZURlZjx1bmtub3duPiB8IENvbXBvbmVudERlZjx1bmtub3duPikudHlwZSB8fCB0RGF0YVtpbmRleF07XG4gICAgICBjb25zdCBpbmplY3RvciA9IG5ldyBOb2RlSW5qZWN0b3IodE5vZGUsIGxWaWV3KTtcbiAgICAgIHByZXZJbmplY3RDb250ZXh0ID0gc2V0SW5qZWN0b3JQcm9maWxlckNvbnRleHQoe2luamVjdG9yLCB0b2tlbn0pO1xuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzSW5qZWN0SW1wbGVtZW50YXRpb24gPSBmYWN0b3J5LmluamVjdEltcGxcbiAgICAgID8gc2V0SW5qZWN0SW1wbGVtZW50YXRpb24oZmFjdG9yeS5pbmplY3RJbXBsKVxuICAgICAgOiBudWxsO1xuICAgIGNvbnN0IHN1Y2Nlc3MgPSBlbnRlckRJKGxWaWV3LCB0Tm9kZSwgSW5qZWN0RmxhZ3MuRGVmYXVsdCk7XG4gICAgbmdEZXZNb2RlICYmXG4gICAgICBhc3NlcnRFcXVhbChcbiAgICAgICAgc3VjY2VzcyxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgXCJCZWNhdXNlIGZsYWdzIGRvIG5vdCBjb250YWluIGBTa2lwU2VsZicgd2UgZXhwZWN0IHRoaXMgdG8gYWx3YXlzIHN1Y2NlZWQuXCIsXG4gICAgICApO1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IGxWaWV3W2luZGV4XSA9IGZhY3RvcnkuZmFjdG9yeSh1bmRlZmluZWQsIHREYXRhLCBsVmlldywgdE5vZGUpO1xuXG4gICAgICBuZ0Rldk1vZGUgJiYgZW1pdEluc3RhbmNlQ3JlYXRlZEJ5SW5qZWN0b3JFdmVudCh2YWx1ZSk7XG5cbiAgICAgIC8vIFRoaXMgY29kZSBwYXRoIGlzIGhpdCBmb3IgYm90aCBkaXJlY3RpdmVzIGFuZCBwcm92aWRlcnMuXG4gICAgICAvLyBGb3IgcGVyZiByZWFzb25zLCB3ZSB3YW50IHRvIGF2b2lkIHNlYXJjaGluZyBmb3IgaG9va3Mgb24gcHJvdmlkZXJzLlxuICAgICAgLy8gSXQgZG9lcyBubyBoYXJtIHRvIHRyeSAodGhlIGhvb2tzIGp1c3Qgd29uJ3QgZXhpc3QpLCBidXQgdGhlIGV4dHJhXG4gICAgICAvLyBjaGVja3MgYXJlIHVubmVjZXNzYXJ5IGFuZCB0aGlzIGlzIGEgaG90IHBhdGguIFNvIHdlIGNoZWNrIHRvIHNlZVxuICAgICAgLy8gaWYgdGhlIGluZGV4IG9mIHRoZSBkZXBlbmRlbmN5IGlzIGluIHRoZSBkaXJlY3RpdmUgcmFuZ2UgZm9yIHRoaXNcbiAgICAgIC8vIHROb2RlLiBJZiBpdCdzIG5vdCwgd2Uga25vdyBpdCdzIGEgcHJvdmlkZXIgYW5kIHNraXAgaG9vayByZWdpc3RyYXRpb24uXG4gICAgICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzICYmIGluZGV4ID49IHROb2RlLmRpcmVjdGl2ZVN0YXJ0KSB7XG4gICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREaXJlY3RpdmVEZWYodERhdGFbaW5kZXhdKTtcbiAgICAgICAgcmVnaXN0ZXJQcmVPcmRlckhvb2tzKGluZGV4LCB0RGF0YVtpbmRleF0gYXMgRGlyZWN0aXZlRGVmPGFueT4sIHRWaWV3KTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgbmdEZXZNb2RlICYmIHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0KHByZXZJbmplY3RDb250ZXh0ISk7XG5cbiAgICAgIHByZXZpb3VzSW5qZWN0SW1wbGVtZW50YXRpb24gIT09IG51bGwgJiZcbiAgICAgICAgc2V0SW5qZWN0SW1wbGVtZW50YXRpb24ocHJldmlvdXNJbmplY3RJbXBsZW1lbnRhdGlvbik7XG4gICAgICBzZXRJbmNsdWRlVmlld1Byb3ZpZGVycyhwcmV2aW91c0luY2x1ZGVWaWV3UHJvdmlkZXJzKTtcbiAgICAgIGZhY3RvcnkucmVzb2x2aW5nID0gZmFsc2U7XG4gICAgICBsZWF2ZURJKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiaXQgaW4gYW4gaW5qZWN0b3IncyBibG9vbSBmaWx0ZXIgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciBvciBub3RcbiAqIHRoZSBkaXJlY3RpdmUgbWlnaHQgYmUgcHJvdmlkZWQgYnkgdGhlIGluamVjdG9yLlxuICpcbiAqIFdoZW4gYSBkaXJlY3RpdmUgaXMgcHVibGljLCBpdCBpcyBhZGRlZCB0byB0aGUgYmxvb20gZmlsdGVyIGFuZCBnaXZlbiBhIHVuaXF1ZSBJRCB0aGF0IGNhbiBiZVxuICogcmV0cmlldmVkIG9uIHRoZSBUeXBlLiBXaGVuIHRoZSBkaXJlY3RpdmUgaXNuJ3QgcHVibGljIG9yIHRoZSB0b2tlbiBpcyBub3QgYSBkaXJlY3RpdmUgYG51bGxgXG4gKiBpcyByZXR1cm5lZCBhcyB0aGUgbm9kZSBpbmplY3RvciBjYW4gbm90IHBvc3NpYmx5IHByb3ZpZGUgdGhhdCB0b2tlbi5cbiAqXG4gKiBAcGFyYW0gdG9rZW4gdGhlIGluamVjdGlvbiB0b2tlblxuICogQHJldHVybnMgdGhlIG1hdGNoaW5nIGJpdCB0byBjaGVjayBpbiB0aGUgYmxvb20gZmlsdGVyIG9yIGBudWxsYCBpZiB0aGUgdG9rZW4gaXMgbm90IGtub3duLlxuICogICBXaGVuIHRoZSByZXR1cm5lZCB2YWx1ZSBpcyBuZWdhdGl2ZSB0aGVuIGl0IHJlcHJlc2VudHMgc3BlY2lhbCB2YWx1ZXMgc3VjaCBhcyBgSW5qZWN0b3JgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvb21IYXNoQml0T3JGYWN0b3J5KFxuICB0b2tlbjogUHJvdmlkZXJUb2tlbjxhbnk+IHwgc3RyaW5nLFxuKTogbnVtYmVyIHwgRnVuY3Rpb24gfCB1bmRlZmluZWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0b2tlbiwgJ3Rva2VuIG11c3QgYmUgZGVmaW5lZCcpO1xuICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB0b2tlbi5jaGFyQ29kZUF0KDApIHx8IDA7XG4gIH1cbiAgY29uc3QgdG9rZW5JZDogbnVtYmVyIHwgdW5kZWZpbmVkID1cbiAgICAvLyBGaXJzdCBjaGVjayB3aXRoIGBoYXNPd25Qcm9wZXJ0eWAgc28gd2UgZG9uJ3QgZ2V0IGFuIGluaGVyaXRlZCBJRC5cbiAgICB0b2tlbi5oYXNPd25Qcm9wZXJ0eShOR19FTEVNRU5UX0lEKSA/ICh0b2tlbiBhcyBhbnkpW05HX0VMRU1FTlRfSURdIDogdW5kZWZpbmVkO1xuICAvLyBOZWdhdGl2ZSB0b2tlbiBJRHMgYXJlIHVzZWQgZm9yIHNwZWNpYWwgb2JqZWN0cyBzdWNoIGFzIGBJbmplY3RvcmBcbiAgaWYgKHR5cGVvZiB0b2tlbklkID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0b2tlbklkID49IDApIHtcbiAgICAgIHJldHVybiB0b2tlbklkICYgQkxPT01fTUFTSztcbiAgICB9IGVsc2Uge1xuICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgIGFzc2VydEVxdWFsKHRva2VuSWQsIEluamVjdG9yTWFya2Vycy5JbmplY3RvciwgJ0V4cGVjdGluZyB0byBnZXQgU3BlY2lhbCBJbmplY3RvciBJZCcpO1xuICAgICAgcmV0dXJuIGNyZWF0ZU5vZGVJbmplY3RvcjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRva2VuSWQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb29tSGFzVG9rZW4oXG4gIGJsb29tSGFzaDogbnVtYmVyLFxuICBpbmplY3RvckluZGV4OiBudW1iZXIsXG4gIGluamVjdG9yVmlldzogTFZpZXcgfCBURGF0YSxcbikge1xuICAvLyBDcmVhdGUgYSBtYXNrIHRoYXQgdGFyZ2V0cyB0aGUgc3BlY2lmaWMgYml0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZGlyZWN0aXZlIHdlJ3JlIGxvb2tpbmcgZm9yLlxuICAvLyBKUyBiaXQgb3BlcmF0aW9ucyBhcmUgMzIgYml0cywgc28gdGhpcyB3aWxsIGJlIGEgbnVtYmVyIGJldHdlZW4gMl4wIGFuZCAyXjMxLCBjb3JyZXNwb25kaW5nXG4gIC8vIHRvIGJpdCBwb3NpdGlvbnMgMCAtIDMxIGluIGEgMzIgYml0IGludGVnZXIuXG4gIGNvbnN0IG1hc2sgPSAxIDw8IGJsb29tSGFzaDtcblxuICAvLyBFYWNoIGJsb29tIGJ1Y2tldCBpbiBgaW5qZWN0b3JWaWV3YCByZXByZXNlbnRzIGBCTE9PTV9CVUNLRVRfQklUU2AgbnVtYmVyIG9mIGJpdHMgb2ZcbiAgLy8gYGJsb29tSGFzaGAuIEFueSBiaXRzIGluIGBibG9vbUhhc2hgIGJleW9uZCBgQkxPT01fQlVDS0VUX0JJVFNgIGluZGljYXRlIHRoZSBidWNrZXQgb2Zmc2V0XG4gIC8vIHRoYXQgc2hvdWxkIGJlIHVzZWQuXG4gIGNvbnN0IHZhbHVlID0gaW5qZWN0b3JWaWV3W2luamVjdG9ySW5kZXggKyAoYmxvb21IYXNoID4+IEJMT09NX0JVQ0tFVF9CSVRTKV07XG5cbiAgLy8gSWYgdGhlIGJsb29tIGZpbHRlciB2YWx1ZSBoYXMgdGhlIGJpdCBjb3JyZXNwb25kaW5nIHRvIHRoZSBkaXJlY3RpdmUncyBibG9vbUJpdCBmbGlwcGVkIG9uLFxuICAvLyB0aGlzIGluamVjdG9yIGlzIGEgcG90ZW50aWFsIG1hdGNoLlxuICByZXR1cm4gISEodmFsdWUgJiBtYXNrKTtcbn1cblxuLyoqIFJldHVybnMgdHJ1ZSBpZiBmbGFncyBwcmV2ZW50IHBhcmVudCBpbmplY3RvciBmcm9tIGJlaW5nIHNlYXJjaGVkIGZvciB0b2tlbnMgKi9cbmZ1bmN0aW9uIHNob3VsZFNlYXJjaFBhcmVudChmbGFnczogSW5qZWN0RmxhZ3MsIGlzRmlyc3RIb3N0VE5vZGU6IGJvb2xlYW4pOiBib29sZWFuIHwgbnVtYmVyIHtcbiAgcmV0dXJuICEoZmxhZ3MgJiBJbmplY3RGbGFncy5TZWxmKSAmJiAhKGZsYWdzICYgSW5qZWN0RmxhZ3MuSG9zdCAmJiBpc0ZpcnN0SG9zdFROb2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVJbmplY3RvckxWaWV3KG5vZGVJbmplY3RvcjogTm9kZUluamVjdG9yKTogTFZpZXcge1xuICByZXR1cm4gKG5vZGVJbmplY3RvciBhcyBhbnkpLl9sVmlldyBhcyBMVmlldztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVJbmplY3RvclROb2RlKFxuICBub2RlSW5qZWN0b3I6IE5vZGVJbmplY3Rvcixcbik6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlIHwgbnVsbCB7XG4gIHJldHVybiAobm9kZUluamVjdG9yIGFzIGFueSkuX3ROb2RlIGFzXG4gICAgfCBURWxlbWVudE5vZGVcbiAgICB8IFRDb250YWluZXJOb2RlXG4gICAgfCBURWxlbWVudENvbnRhaW5lck5vZGVcbiAgICB8IG51bGw7XG59XG5cbmV4cG9ydCBjbGFzcyBOb2RlSW5qZWN0b3IgaW1wbGVtZW50cyBJbmplY3RvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3ROb2RlOiBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSB8IG51bGwsXG4gICAgcHJpdmF0ZSBfbFZpZXc6IExWaWV3LFxuICApIHt9XG5cbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU/OiBhbnksIGZsYWdzPzogSW5qZWN0RmxhZ3MgfCBJbmplY3RPcHRpb25zKTogYW55IHtcbiAgICByZXR1cm4gZ2V0T3JDcmVhdGVJbmplY3RhYmxlKFxuICAgICAgdGhpcy5fdE5vZGUsXG4gICAgICB0aGlzLl9sVmlldyxcbiAgICAgIHRva2VuLFxuICAgICAgY29udmVydFRvQml0RmxhZ3MoZmxhZ3MpLFxuICAgICAgbm90Rm91bmRWYWx1ZSxcbiAgICApO1xuICB9XG59XG5cbi8qKiBDcmVhdGVzIGEgYE5vZGVJbmplY3RvcmAgZm9yIHRoZSBjdXJyZW50IG5vZGUuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTm9kZUluamVjdG9yKCk6IEluamVjdG9yIHtcbiAgcmV0dXJuIG5ldyBOb2RlSW5qZWN0b3IoZ2V0Q3VycmVudFROb2RlKCkhIGFzIFREaXJlY3RpdmVIb3N0Tm9kZSwgZ2V0TFZpZXcoKSkgYXMgYW55O1xufVxuXG4vKipcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1Z2V0SW5oZXJpdGVkRmFjdG9yeTxUPih0eXBlOiBUeXBlPGFueT4pOiAodHlwZTogVHlwZTxUPikgPT4gVCB7XG4gIHJldHVybiBub1NpZGVFZmZlY3RzKCgpID0+IHtcbiAgICBjb25zdCBvd25Db25zdHJ1Y3RvciA9IHR5cGUucHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuICAgIGNvbnN0IG93bkZhY3RvcnkgPSBvd25Db25zdHJ1Y3RvcltOR19GQUNUT1JZX0RFRl0gfHwgZ2V0RmFjdG9yeU9mKG93bkNvbnN0cnVjdG9yKTtcbiAgICBjb25zdCBvYmplY3RQcm90b3R5cGUgPSBPYmplY3QucHJvdG90eXBlO1xuICAgIGxldCBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpLmNvbnN0cnVjdG9yO1xuXG4gICAgLy8gR28gdXAgdGhlIHByb3RvdHlwZSB1bnRpbCB3ZSBoaXQgYE9iamVjdGAuXG4gICAgd2hpbGUgKHBhcmVudCAmJiBwYXJlbnQgIT09IG9iamVjdFByb3RvdHlwZSkge1xuICAgICAgY29uc3QgZmFjdG9yeSA9IHBhcmVudFtOR19GQUNUT1JZX0RFRl0gfHwgZ2V0RmFjdG9yeU9mKHBhcmVudCk7XG5cbiAgICAgIC8vIElmIHdlIGhpdCBzb21ldGhpbmcgdGhhdCBoYXMgYSBmYWN0b3J5IGFuZCB0aGUgZmFjdG9yeSBpc24ndCB0aGUgc2FtZSBhcyB0aGUgdHlwZSxcbiAgICAgIC8vIHdlJ3ZlIGZvdW5kIHRoZSBpbmhlcml0ZWQgZmFjdG9yeS4gTm90ZSB0aGUgY2hlY2sgdGhhdCB0aGUgZmFjdG9yeSBpc24ndCB0aGUgdHlwZSdzXG4gICAgICAvLyBvd24gZmFjdG9yeSBpcyByZWR1bmRhbnQgaW4gbW9zdCBjYXNlcywgYnV0IGlmIHRoZSB1c2VyIGhhcyBjdXN0b20gZGVjb3JhdG9ycyBvbiB0aGVcbiAgICAgIC8vIGNsYXNzLCB0aGlzIGxvb2t1cCB3aWxsIHN0YXJ0IG9uZSBsZXZlbCBkb3duIGluIHRoZSBwcm90b3R5cGUgY2hhaW4sIGNhdXNpbmcgdXMgdG9cbiAgICAgIC8vIGZpbmQgdGhlIG93biBmYWN0b3J5IGZpcnN0IGFuZCBwb3RlbnRpYWxseSB0cmlnZ2VyaW5nIGFuIGluZmluaXRlIGxvb3AgZG93bnN0cmVhbS5cbiAgICAgIGlmIChmYWN0b3J5ICYmIGZhY3RvcnkgIT09IG93bkZhY3RvcnkpIHtcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgICB9XG5cbiAgICAgIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwYXJlbnQpO1xuICAgIH1cblxuICAgIC8vIFRoZXJlIGlzIG5vIGZhY3RvcnkgZGVmaW5lZC4gRWl0aGVyIHRoaXMgd2FzIGltcHJvcGVyIHVzYWdlIG9mIGluaGVyaXRhbmNlXG4gICAgLy8gKG5vIEFuZ3VsYXIgZGVjb3JhdG9yIG9uIHRoZSBzdXBlcmNsYXNzKSBvciB0aGVyZSBpcyBubyBjb25zdHJ1Y3RvciBhdCBhbGxcbiAgICAvLyBpbiB0aGUgaW5oZXJpdGFuY2UgY2hhaW4uIFNpbmNlIHRoZSB0d28gY2FzZXMgY2Fubm90IGJlIGRpc3Rpbmd1aXNoZWQsIHRoZVxuICAgIC8vIGxhdHRlciBoYXMgdG8gYmUgYXNzdW1lZC5cbiAgICByZXR1cm4gKHQ6IFR5cGU8VD4pID0+IG5ldyB0KCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRGYWN0b3J5T2Y8VD4odHlwZTogVHlwZTxhbnk+KTogKCh0eXBlPzogVHlwZTxUPikgPT4gVCB8IG51bGwpIHwgbnVsbCB7XG4gIGlmIChpc0ZvcndhcmRSZWYodHlwZSkpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3QgZmFjdG9yeSA9IGdldEZhY3RvcnlPZjxUPihyZXNvbHZlRm9yd2FyZFJlZih0eXBlKSk7XG4gICAgICByZXR1cm4gZmFjdG9yeSAmJiBmYWN0b3J5KCk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZ2V0RmFjdG9yeURlZjxUPih0eXBlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgdmFsdWUgZnJvbSB0aGUgY2xvc2VzdCBlbWJlZGRlZCBvciBub2RlIGluamVjdG9yLlxuICpcbiAqIEBwYXJhbSB0Tm9kZSBUaGUgTm9kZSB3aGVyZSB0aGUgc2VhcmNoIGZvciB0aGUgaW5qZWN0b3Igc2hvdWxkIHN0YXJ0XG4gKiBAcGFyYW0gbFZpZXcgVGhlIGBMVmlld2AgdGhhdCBjb250YWlucyB0aGUgYHROb2RlYFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiB0byBsb29rIGZvclxuICogQHBhcmFtIGZsYWdzIEluamVjdGlvbiBmbGFnc1xuICogQHBhcmFtIG5vdEZvdW5kVmFsdWUgVGhlIHZhbHVlIHRvIHJldHVybiB3aGVuIHRoZSBpbmplY3Rpb24gZmxhZ3MgaXMgYEluamVjdEZsYWdzLk9wdGlvbmFsYFxuICogQHJldHVybnMgdGhlIHZhbHVlIGZyb20gdGhlIGluamVjdG9yLCBgbnVsbGAgd2hlbiBub3QgZm91bmQsIG9yIGBub3RGb3VuZFZhbHVlYCBpZiBwcm92aWRlZFxuICovXG5mdW5jdGlvbiBsb29rdXBUb2tlblVzaW5nRW1iZWRkZWRJbmplY3RvcjxUPihcbiAgdE5vZGU6IFREaXJlY3RpdmVIb3N0Tm9kZSxcbiAgbFZpZXc6IExWaWV3LFxuICB0b2tlbjogUHJvdmlkZXJUb2tlbjxUPixcbiAgZmxhZ3M6IEluamVjdEZsYWdzLFxuICBub3RGb3VuZFZhbHVlPzogYW55LFxuKSB7XG4gIGxldCBjdXJyZW50VE5vZGU6IFREaXJlY3RpdmVIb3N0Tm9kZSB8IG51bGwgPSB0Tm9kZTtcbiAgbGV0IGN1cnJlbnRMVmlldzogTFZpZXcgfCBudWxsID0gbFZpZXc7XG5cbiAgLy8gV2hlbiBhbiBMVmlldyB3aXRoIGFuIGVtYmVkZGVkIHZpZXcgaW5qZWN0b3IgaXMgaW5zZXJ0ZWQsIGl0J2xsIGxpa2VseSBiZSBpbnRlcmxhY2VkIHdpdGhcbiAgLy8gbm9kZXMgd2hvIG1heSBoYXZlIGluamVjdG9ycyAoZS5nLiBub2RlIGluamVjdG9yIC0+IGVtYmVkZGVkIHZpZXcgaW5qZWN0b3IgLT4gbm9kZSBpbmplY3RvcikuXG4gIC8vIFNpbmNlIHRoZSBibG9vbSBmaWx0ZXJzIGZvciB0aGUgbm9kZSBpbmplY3RvcnMgaGF2ZSBhbHJlYWR5IGJlZW4gY29uc3RydWN0ZWQgYW5kIHdlIGRvbid0XG4gIC8vIGhhdmUgYSB3YXkgb2YgZXh0cmFjdGluZyB0aGUgcmVjb3JkcyBmcm9tIGFuIGluamVjdG9yLCB0aGUgb25seSB3YXkgdG8gbWFpbnRhaW4gdGhlIGNvcnJlY3RcbiAgLy8gaGllcmFyY2h5IHdoZW4gcmVzb2x2aW5nIHRoZSB2YWx1ZSBpcyB0byB3YWxrIGl0IG5vZGUtYnktbm9kZSB3aGlsZSBhdHRlbXB0aW5nIHRvIHJlc29sdmVcbiAgLy8gdGhlIHRva2VuIGF0IGVhY2ggbGV2ZWwuXG4gIHdoaWxlIChcbiAgICBjdXJyZW50VE5vZGUgIT09IG51bGwgJiZcbiAgICBjdXJyZW50TFZpZXcgIT09IG51bGwgJiZcbiAgICBjdXJyZW50TFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5IYXNFbWJlZGRlZFZpZXdJbmplY3RvciAmJlxuICAgICEoY3VycmVudExWaWV3W0ZMQUdTXSAmIExWaWV3RmxhZ3MuSXNSb290KVxuICApIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VE5vZGVGb3JMVmlldyhjdXJyZW50VE5vZGUsIGN1cnJlbnRMVmlldyk7XG5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBsb29rdXAgb24gdGhlIG5vZGUgaW5qZWN0b3IgaXMgdXNpbmcgdGhlIGBTZWxmYCBmbGFnLCBiZWNhdXNlXG4gICAgLy8gd2UgZG9uJ3Qgd2FudCB0aGUgbm9kZSBpbmplY3RvciB0byBsb29rIGF0IGFueSBwYXJlbnQgaW5qZWN0b3JzIHNpbmNlIHdlXG4gICAgLy8gbWF5IGhpdCB0aGUgZW1iZWRkZWQgdmlldyBpbmplY3RvciBmaXJzdC5cbiAgICBjb25zdCBub2RlSW5qZWN0b3JWYWx1ZSA9IGxvb2t1cFRva2VuVXNpbmdOb2RlSW5qZWN0b3IoXG4gICAgICBjdXJyZW50VE5vZGUsXG4gICAgICBjdXJyZW50TFZpZXcsXG4gICAgICB0b2tlbixcbiAgICAgIGZsYWdzIHwgSW5qZWN0RmxhZ3MuU2VsZixcbiAgICAgIE5PVF9GT1VORCxcbiAgICApO1xuICAgIGlmIChub2RlSW5qZWN0b3JWYWx1ZSAhPT0gTk9UX0ZPVU5EKSB7XG4gICAgICByZXR1cm4gbm9kZUluamVjdG9yVmFsdWU7XG4gICAgfVxuXG4gICAgLy8gSGFzIGFuIGV4cGxpY2l0IHR5cGUgZHVlIHRvIGEgVFMgYnVnOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzMzMTkxXG4gICAgbGV0IHBhcmVudFROb2RlOiBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IG51bGwgPSBjdXJyZW50VE5vZGUucGFyZW50O1xuXG4gICAgLy8gYFROb2RlLnBhcmVudGAgaW5jbHVkZXMgdGhlIHBhcmVudCB3aXRoaW4gdGhlIGN1cnJlbnQgdmlldyBvbmx5LiBJZiBpdCBkb2Vzbid0IGV4aXN0LFxuICAgIC8vIGl0IG1lYW5zIHRoYXQgd2UndmUgaGl0IHRoZSB2aWV3IGJvdW5kYXJ5IGFuZCB3ZSBuZWVkIHRvIGdvIHVwIHRvIHRoZSBuZXh0IHZpZXcuXG4gICAgaWYgKCFwYXJlbnRUTm9kZSkge1xuICAgICAgLy8gQmVmb3JlIHdlIGdvIHRvIHRoZSBuZXh0IExWaWV3LCBjaGVjayBpZiB0aGUgdG9rZW4gZXhpc3RzIG9uIHRoZSBjdXJyZW50IGVtYmVkZGVkIGluamVjdG9yLlxuICAgICAgY29uc3QgZW1iZWRkZWRWaWV3SW5qZWN0b3IgPSBjdXJyZW50TFZpZXdbRU1CRURERURfVklFV19JTkpFQ1RPUl07XG4gICAgICBpZiAoZW1iZWRkZWRWaWV3SW5qZWN0b3IpIHtcbiAgICAgICAgY29uc3QgZW1iZWRkZWRWaWV3SW5qZWN0b3JWYWx1ZSA9IGVtYmVkZGVkVmlld0luamVjdG9yLmdldChcbiAgICAgICAgICB0b2tlbixcbiAgICAgICAgICBOT1RfRk9VTkQgYXMgVCB8IHt9LFxuICAgICAgICAgIGZsYWdzLFxuICAgICAgICApO1xuICAgICAgICBpZiAoZW1iZWRkZWRWaWV3SW5qZWN0b3JWYWx1ZSAhPT0gTk9UX0ZPVU5EKSB7XG4gICAgICAgICAgcmV0dXJuIGVtYmVkZGVkVmlld0luamVjdG9yVmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT3RoZXJ3aXNlIGtlZXAgZ29pbmcgdXAgdGhlIHRyZWUuXG4gICAgICBwYXJlbnRUTm9kZSA9IGdldFROb2RlRnJvbUxWaWV3KGN1cnJlbnRMVmlldyk7XG4gICAgICBjdXJyZW50TFZpZXcgPSBjdXJyZW50TFZpZXdbREVDTEFSQVRJT05fVklFV107XG4gICAgfVxuXG4gICAgY3VycmVudFROb2RlID0gcGFyZW50VE5vZGU7XG4gIH1cblxuICByZXR1cm4gbm90Rm91bmRWYWx1ZTtcbn1cblxuLyoqIEdldHMgdGhlIFROb2RlIGFzc29jaWF0ZWQgd2l0aCBhbiBMVmlldyBpbnNpZGUgb2YgdGhlIGRlY2xhcmF0aW9uIHZpZXcuICovXG5mdW5jdGlvbiBnZXRUTm9kZUZyb21MVmlldyhsVmlldzogTFZpZXcpOiBURWxlbWVudE5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUgfCBudWxsIHtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGNvbnN0IHRWaWV3VHlwZSA9IHRWaWV3LnR5cGU7XG5cbiAgLy8gVGhlIHBhcmVudCBwb2ludGVyIGRpZmZlcnMgYmFzZWQgb24gYFRWaWV3LnR5cGVgLlxuICBpZiAodFZpZXdUeXBlID09PSBUVmlld1R5cGUuRW1iZWRkZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0Vmlldy5kZWNsVE5vZGUsICdFbWJlZGRlZCBUTm9kZXMgc2hvdWxkIGhhdmUgZGVjbGFyYXRpb24gcGFyZW50cy4nKTtcbiAgICByZXR1cm4gdFZpZXcuZGVjbFROb2RlIGFzIFRFbGVtZW50Q29udGFpbmVyTm9kZTtcbiAgfSBlbHNlIGlmICh0Vmlld1R5cGUgPT09IFRWaWV3VHlwZS5Db21wb25lbnQpIHtcbiAgICAvLyBDb21wb25lbnRzIGRvbid0IGhhdmUgYFRWaWV3LmRlY2xUTm9kZWAgYmVjYXVzZSBlYWNoIGluc3RhbmNlIG9mIGNvbXBvbmVudCBjb3VsZCBiZVxuICAgIC8vIGluc2VydGVkIGluIGRpZmZlcmVudCBsb2NhdGlvbiwgaGVuY2UgYFRWaWV3LmRlY2xUTm9kZWAgaXMgbWVhbmluZ2xlc3MuXG4gICAgcmV0dXJuIGxWaWV3W1RfSE9TVF0gYXMgVEVsZW1lbnROb2RlO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=
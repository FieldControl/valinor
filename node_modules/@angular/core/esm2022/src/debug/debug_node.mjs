/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertTNodeForLView } from '../render3/assert';
import { getLContext } from '../render3/context_discovery';
import { CONTAINER_HEADER_OFFSET, NATIVE } from '../render3/interfaces/container';
import { isComponentHost, isLContainer } from '../render3/interfaces/type_checks';
import { DECLARATION_COMPONENT_VIEW, PARENT, T_HOST, TVIEW, } from '../render3/interfaces/view';
import { getComponent, getContext, getInjectionTokens, getInjector, getListeners, getLocalRefs, getOwningComponent, } from '../render3/util/discovery_utils';
import { INTERPOLATION_DELIMITER } from '../render3/util/misc_utils';
import { renderStringify } from '../render3/util/stringify_utils';
import { getComponentLViewByIndex, getNativeByTNodeOrNull } from '../render3/util/view_utils';
import { assertDomNode } from '../util/assert';
/**
 * @publicApi
 */
export class DebugEventListener {
    constructor(name, callback) {
        this.name = name;
        this.callback = callback;
    }
}
/**
 * @publicApi
 */
export function asNativeElements(debugEls) {
    return debugEls.map((el) => el.nativeElement);
}
/**
 * @publicApi
 */
export class DebugNode {
    constructor(nativeNode) {
        this.nativeNode = nativeNode;
    }
    /**
     * The `DebugElement` parent. Will be `null` if this is the root element.
     */
    get parent() {
        const parent = this.nativeNode.parentNode;
        return parent ? new DebugElement(parent) : null;
    }
    /**
     * The host dependency injector. For example, the root element's component instance injector.
     */
    get injector() {
        return getInjector(this.nativeNode);
    }
    /**
     * The element's own component instance, if it has one.
     */
    get componentInstance() {
        const nativeElement = this.nativeNode;
        return (nativeElement && (getComponent(nativeElement) || getOwningComponent(nativeElement)));
    }
    /**
     * An object that provides parent context for this element. Often an ancestor component instance
     * that governs this element.
     *
     * When an element is repeated within *ngFor, the context is an `NgForOf` whose `$implicit`
     * property is the value of the row instance value. For example, the `hero` in `*ngFor="let hero
     * of heroes"`.
     */
    get context() {
        return getComponent(this.nativeNode) || getContext(this.nativeNode);
    }
    /**
     * The callbacks attached to the component's @Output properties and/or the element's event
     * properties.
     */
    get listeners() {
        return getListeners(this.nativeNode).filter((listener) => listener.type === 'dom');
    }
    /**
     * Dictionary of objects associated with template local variables (e.g. #foo), keyed by the local
     * variable name.
     */
    get references() {
        return getLocalRefs(this.nativeNode);
    }
    /**
     * This component's injector lookup tokens. Includes the component itself plus the tokens that the
     * component lists in its providers metadata.
     */
    get providerTokens() {
        return getInjectionTokens(this.nativeNode);
    }
}
/**
 * @publicApi
 *
 * @see [Component testing scenarios](guide/testing/components-scenarios)
 * @see [Basics of testing components](guide/testing/components-basics)
 * @see [Testing utility APIs](guide/testing/utility-apis)
 */
export class DebugElement extends DebugNode {
    constructor(nativeNode) {
        ngDevMode && assertDomNode(nativeNode);
        super(nativeNode);
    }
    /**
     * The underlying DOM element at the root of the component.
     */
    get nativeElement() {
        return this.nativeNode.nodeType == Node.ELEMENT_NODE ? this.nativeNode : null;
    }
    /**
     * The element tag name, if it is an element.
     */
    get name() {
        const context = getLContext(this.nativeNode);
        const lView = context ? context.lView : null;
        if (lView !== null) {
            const tData = lView[TVIEW].data;
            const tNode = tData[context.nodeIndex];
            return tNode.value;
        }
        else {
            return this.nativeNode.nodeName;
        }
    }
    /**
     *  Gets a map of property names to property values for an element.
     *
     *  This map includes:
     *  - Regular property bindings (e.g. `[id]="id"`)
     *  - Host property bindings (e.g. `host: { '[id]': "id" }`)
     *  - Interpolated property bindings (e.g. `id="{{ value }}")
     *
     *  It does not include:
     *  - input property bindings (e.g. `[myCustomInput]="value"`)
     *  - attribute bindings (e.g. `[attr.role]="menu"`)
     */
    get properties() {
        const context = getLContext(this.nativeNode);
        const lView = context ? context.lView : null;
        if (lView === null) {
            return {};
        }
        const tData = lView[TVIEW].data;
        const tNode = tData[context.nodeIndex];
        const properties = {};
        // Collect properties from the DOM.
        copyDomProperties(this.nativeElement, properties);
        // Collect properties from the bindings. This is needed for animation renderer which has
        // synthetic properties which don't get reflected into the DOM.
        collectPropertyBindings(properties, tNode, lView, tData);
        return properties;
    }
    /**
     *  A map of attribute names to attribute values for an element.
     */
    // TODO: replace null by undefined in the return type
    get attributes() {
        const attributes = {};
        const element = this.nativeElement;
        if (!element) {
            return attributes;
        }
        const context = getLContext(element);
        const lView = context ? context.lView : null;
        if (lView === null) {
            return {};
        }
        const tNodeAttrs = lView[TVIEW].data[context.nodeIndex].attrs;
        const lowercaseTNodeAttrs = [];
        // For debug nodes we take the element's attribute directly from the DOM since it allows us
        // to account for ones that weren't set via bindings (e.g. ViewEngine keeps track of the ones
        // that are set through `Renderer2`). The problem is that the browser will lowercase all names,
        // however since we have the attributes already on the TNode, we can preserve the case by going
        // through them once, adding them to the `attributes` map and putting their lower-cased name
        // into an array. Afterwards when we're going through the native DOM attributes, we can check
        // whether we haven't run into an attribute already through the TNode.
        if (tNodeAttrs) {
            let i = 0;
            while (i < tNodeAttrs.length) {
                const attrName = tNodeAttrs[i];
                // Stop as soon as we hit a marker. We only care about the regular attributes. Everything
                // else will be handled below when we read the final attributes off the DOM.
                if (typeof attrName !== 'string')
                    break;
                const attrValue = tNodeAttrs[i + 1];
                attributes[attrName] = attrValue;
                lowercaseTNodeAttrs.push(attrName.toLowerCase());
                i += 2;
            }
        }
        for (const attr of element.attributes) {
            // Make sure that we don't assign the same attribute both in its
            // case-sensitive form and the lower-cased one from the browser.
            if (!lowercaseTNodeAttrs.includes(attr.name)) {
                attributes[attr.name] = attr.value;
            }
        }
        return attributes;
    }
    /**
     * The inline styles of the DOM element.
     */
    // TODO: replace null by undefined in the return type
    get styles() {
        const element = this.nativeElement;
        return (element?.style ?? {});
    }
    /**
     * A map containing the class names on the element as keys.
     *
     * This map is derived from the `className` property of the DOM element.
     *
     * Note: The values of this object will always be `true`. The class key will not appear in the KV
     * object if it does not exist on the element.
     *
     * @see [Element.className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)
     */
    get classes() {
        const result = {};
        const element = this.nativeElement;
        // SVG elements return an `SVGAnimatedString` instead of a plain string for the `className`.
        const className = element.className;
        const classes = typeof className !== 'string' ? className.baseVal.split(' ') : className.split(' ');
        classes.forEach((value) => (result[value] = true));
        return result;
    }
    /**
     * The `childNodes` of the DOM element as a `DebugNode` array.
     *
     * @see [Node.childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes)
     */
    get childNodes() {
        const childNodes = this.nativeNode.childNodes;
        const children = [];
        for (let i = 0; i < childNodes.length; i++) {
            const element = childNodes[i];
            children.push(getDebugNode(element));
        }
        return children;
    }
    /**
     * The immediate `DebugElement` children. Walk the tree by descending through `children`.
     */
    get children() {
        const nativeElement = this.nativeElement;
        if (!nativeElement)
            return [];
        const childNodes = nativeElement.children;
        const children = [];
        for (let i = 0; i < childNodes.length; i++) {
            const element = childNodes[i];
            children.push(getDebugNode(element));
        }
        return children;
    }
    /**
     * @returns the first `DebugElement` that matches the predicate at any depth in the subtree.
     */
    query(predicate) {
        const results = this.queryAll(predicate);
        return results[0] || null;
    }
    /**
     * @returns All `DebugElement` matches for the predicate at any depth in the subtree.
     */
    queryAll(predicate) {
        const matches = [];
        _queryAll(this, predicate, matches, true);
        return matches;
    }
    /**
     * @returns All `DebugNode` matches for the predicate at any depth in the subtree.
     */
    queryAllNodes(predicate) {
        const matches = [];
        _queryAll(this, predicate, matches, false);
        return matches;
    }
    /**
     * Triggers the event by its name if there is a corresponding listener in the element's
     * `listeners` collection.
     *
     * If the event lacks a listener or there's some other problem, consider
     * calling `nativeElement.dispatchEvent(eventObject)`.
     *
     * @param eventName The name of the event to trigger
     * @param eventObj The _event object_ expected by the handler
     *
     * @see [Testing components scenarios](guide/testing/components-scenarios#trigger-event-handler)
     */
    triggerEventHandler(eventName, eventObj) {
        const node = this.nativeNode;
        const invokedListeners = [];
        this.listeners.forEach((listener) => {
            if (listener.name === eventName) {
                const callback = listener.callback;
                callback.call(node, eventObj);
                invokedListeners.push(callback);
            }
        });
        // We need to check whether `eventListeners` exists, because it's something
        // that Zone.js only adds to `EventTarget` in browser environments.
        if (typeof node.eventListeners === 'function') {
            // Note that in Ivy we wrap event listeners with a call to `event.preventDefault` in some
            // cases. We use '__ngUnwrap__' as a special token that gives us access to the actual event
            // listener.
            node.eventListeners(eventName).forEach((listener) => {
                // In order to ensure that we can detect the special __ngUnwrap__ token described above, we
                // use `toString` on the listener and see if it contains the token. We use this approach to
                // ensure that it still worked with compiled code since it cannot remove or rename string
                // literals. We also considered using a special function name (i.e. if(listener.name ===
                // special)) but that was more cumbersome and we were also concerned the compiled code could
                // strip the name, turning the condition in to ("" === "") and always returning true.
                if (listener.toString().indexOf('__ngUnwrap__') !== -1) {
                    const unwrappedListener = listener('__ngUnwrap__');
                    return (invokedListeners.indexOf(unwrappedListener) === -1 &&
                        unwrappedListener.call(node, eventObj));
                }
            });
        }
    }
}
function copyDomProperties(element, properties) {
    if (element) {
        // Skip own properties (as those are patched)
        let obj = Object.getPrototypeOf(element);
        const NodePrototype = Node.prototype;
        while (obj !== null && obj !== NodePrototype) {
            const descriptors = Object.getOwnPropertyDescriptors(obj);
            for (let key in descriptors) {
                if (!key.startsWith('__') && !key.startsWith('on')) {
                    // don't include properties starting with `__` and `on`.
                    // `__` are patched values which should not be included.
                    // `on` are listeners which also should not be included.
                    const value = element[key];
                    if (isPrimitiveValue(value)) {
                        properties[key] = value;
                    }
                }
            }
            obj = Object.getPrototypeOf(obj);
        }
    }
}
function isPrimitiveValue(value) {
    return (typeof value === 'string' ||
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        value === null);
}
function _queryAll(parentElement, predicate, matches, elementsOnly) {
    const context = getLContext(parentElement.nativeNode);
    const lView = context ? context.lView : null;
    if (lView !== null) {
        const parentTNode = lView[TVIEW].data[context.nodeIndex];
        _queryNodeChildren(parentTNode, lView, predicate, matches, elementsOnly, parentElement.nativeNode);
    }
    else {
        // If the context is null, then `parentElement` was either created with Renderer2 or native DOM
        // APIs.
        _queryNativeNodeDescendants(parentElement.nativeNode, predicate, matches, elementsOnly);
    }
}
/**
 * Recursively match the current TNode against the predicate, and goes on with the next ones.
 *
 * @param tNode the current TNode
 * @param lView the LView of this TNode
 * @param predicate the predicate to match
 * @param matches the list of positive matches
 * @param elementsOnly whether only elements should be searched
 * @param rootNativeNode the root native node on which predicate should not be matched
 */
function _queryNodeChildren(tNode, lView, predicate, matches, elementsOnly, rootNativeNode) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    const nativeNode = getNativeByTNodeOrNull(tNode, lView);
    // For each type of TNode, specific logic is executed.
    if (tNode.type & (3 /* TNodeType.AnyRNode */ | 8 /* TNodeType.ElementContainer */)) {
        // Case 1: the TNode is an element
        // The native node has to be checked.
        _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode);
        if (isComponentHost(tNode)) {
            // If the element is the host of a component, then all nodes in its view have to be processed.
            // Note: the component's content (tNode.child) will be processed from the insertion points.
            const componentView = getComponentLViewByIndex(tNode.index, lView);
            if (componentView && componentView[TVIEW].firstChild) {
                _queryNodeChildren(componentView[TVIEW].firstChild, componentView, predicate, matches, elementsOnly, rootNativeNode);
            }
        }
        else {
            if (tNode.child) {
                // Otherwise, its children have to be processed.
                _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
            }
            // We also have to query the DOM directly in order to catch elements inserted through
            // Renderer2. Note that this is __not__ optimal, because we're walking similar trees multiple
            // times. ViewEngine could do it more efficiently, because all the insertions go through
            // Renderer2, however that's not the case in Ivy. This approach is being used because:
            // 1. Matching the ViewEngine behavior would mean potentially introducing a dependency
            //    from `Renderer2` to Ivy which could bring Ivy code into ViewEngine.
            // 2. It allows us to capture nodes that were inserted directly via the DOM.
            nativeNode && _queryNativeNodeDescendants(nativeNode, predicate, matches, elementsOnly);
        }
        // In all cases, if a dynamic container exists for this node, each view inside it has to be
        // processed.
        const nodeOrContainer = lView[tNode.index];
        if (isLContainer(nodeOrContainer)) {
            _queryNodeChildrenInContainer(nodeOrContainer, predicate, matches, elementsOnly, rootNativeNode);
        }
    }
    else if (tNode.type & 4 /* TNodeType.Container */) {
        // Case 2: the TNode is a container
        // The native node has to be checked.
        const lContainer = lView[tNode.index];
        _addQueryMatch(lContainer[NATIVE], predicate, matches, elementsOnly, rootNativeNode);
        // Each view inside the container has to be processed.
        _queryNodeChildrenInContainer(lContainer, predicate, matches, elementsOnly, rootNativeNode);
    }
    else if (tNode.type & 16 /* TNodeType.Projection */) {
        // Case 3: the TNode is a projection insertion point (i.e. a <ng-content>).
        // The nodes projected at this location all need to be processed.
        const componentView = lView[DECLARATION_COMPONENT_VIEW];
        const componentHost = componentView[T_HOST];
        const head = componentHost.projection[tNode.projection];
        if (Array.isArray(head)) {
            for (let nativeNode of head) {
                _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode);
            }
        }
        else if (head) {
            const nextLView = componentView[PARENT];
            const nextTNode = nextLView[TVIEW].data[head.index];
            _queryNodeChildren(nextTNode, nextLView, predicate, matches, elementsOnly, rootNativeNode);
        }
    }
    else if (tNode.child) {
        // Case 4: the TNode is a view.
        _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
    }
    // We don't want to go to the next sibling of the root node.
    if (rootNativeNode !== nativeNode) {
        // To determine the next node to be processed, we need to use the next or the projectionNext
        // link, depending on whether the current node has been projected.
        const nextTNode = tNode.flags & 2 /* TNodeFlags.isProjected */ ? tNode.projectionNext : tNode.next;
        if (nextTNode) {
            _queryNodeChildren(nextTNode, lView, predicate, matches, elementsOnly, rootNativeNode);
        }
    }
}
/**
 * Process all TNodes in a given container.
 *
 * @param lContainer the container to be processed
 * @param predicate the predicate to match
 * @param matches the list of positive matches
 * @param elementsOnly whether only elements should be searched
 * @param rootNativeNode the root native node on which predicate should not be matched
 */
function _queryNodeChildrenInContainer(lContainer, predicate, matches, elementsOnly, rootNativeNode) {
    for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
        const childView = lContainer[i];
        const firstChild = childView[TVIEW].firstChild;
        if (firstChild) {
            _queryNodeChildren(firstChild, childView, predicate, matches, elementsOnly, rootNativeNode);
        }
    }
}
/**
 * Match the current native node against the predicate.
 *
 * @param nativeNode the current native node
 * @param predicate the predicate to match
 * @param matches the list of positive matches
 * @param elementsOnly whether only elements should be searched
 * @param rootNativeNode the root native node on which predicate should not be matched
 */
function _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode) {
    if (rootNativeNode !== nativeNode) {
        const debugNode = getDebugNode(nativeNode);
        if (!debugNode) {
            return;
        }
        // Type of the "predicate and "matches" array are set based on the value of
        // the "elementsOnly" parameter. TypeScript is not able to properly infer these
        // types with generics, so we manually cast the parameters accordingly.
        if (elementsOnly &&
            debugNode instanceof DebugElement &&
            predicate(debugNode) &&
            matches.indexOf(debugNode) === -1) {
            matches.push(debugNode);
        }
        else if (!elementsOnly &&
            predicate(debugNode) &&
            matches.indexOf(debugNode) === -1) {
            matches.push(debugNode);
        }
    }
}
/**
 * Match all the descendants of a DOM node against a predicate.
 *
 * @param nativeNode the current native node
 * @param predicate the predicate to match
 * @param matches the list where matches are stored
 * @param elementsOnly whether only elements should be searched
 */
function _queryNativeNodeDescendants(parentNode, predicate, matches, elementsOnly) {
    const nodes = parentNode.childNodes;
    const length = nodes.length;
    for (let i = 0; i < length; i++) {
        const node = nodes[i];
        const debugNode = getDebugNode(node);
        if (debugNode) {
            if (elementsOnly &&
                debugNode instanceof DebugElement &&
                predicate(debugNode) &&
                matches.indexOf(debugNode) === -1) {
                matches.push(debugNode);
            }
            else if (!elementsOnly &&
                predicate(debugNode) &&
                matches.indexOf(debugNode) === -1) {
                matches.push(debugNode);
            }
            _queryNativeNodeDescendants(node, predicate, matches, elementsOnly);
        }
    }
}
/**
 * Iterates through the property bindings for a given node and generates
 * a map of property names to values. This map only contains property bindings
 * defined in templates, not in host bindings.
 */
function collectPropertyBindings(properties, tNode, lView, tData) {
    let bindingIndexes = tNode.propertyBindings;
    if (bindingIndexes !== null) {
        for (let i = 0; i < bindingIndexes.length; i++) {
            const bindingIndex = bindingIndexes[i];
            const propMetadata = tData[bindingIndex];
            const metadataParts = propMetadata.split(INTERPOLATION_DELIMITER);
            const propertyName = metadataParts[0];
            if (metadataParts.length > 1) {
                let value = metadataParts[1];
                for (let j = 1; j < metadataParts.length - 1; j++) {
                    value += renderStringify(lView[bindingIndex + j - 1]) + metadataParts[j + 1];
                }
                properties[propertyName] = value;
            }
            else {
                properties[propertyName] = lView[bindingIndex];
            }
        }
    }
}
// Need to keep the nodes in a global Map so that multiple angular apps are supported.
const _nativeNodeToDebugNode = new Map();
const NG_DEBUG_PROPERTY = '__ng_debug__';
/**
 * @publicApi
 */
export function getDebugNode(nativeNode) {
    if (nativeNode instanceof Node) {
        if (!nativeNode.hasOwnProperty(NG_DEBUG_PROPERTY)) {
            nativeNode[NG_DEBUG_PROPERTY] =
                nativeNode.nodeType == Node.ELEMENT_NODE
                    ? new DebugElement(nativeNode)
                    : new DebugNode(nativeNode);
        }
        return nativeNode[NG_DEBUG_PROPERTY];
    }
    return null;
}
export function getAllDebugNodes() {
    return Array.from(_nativeNodeToDebugNode.values());
}
export function indexDebugNode(node) {
    _nativeNodeToDebugNode.set(node.nativeNode, node);
}
export function removeDebugNodeFromIndex(node) {
    _nativeNodeToDebugNode.delete(node.nativeNode);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfbm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2RlYnVnL2RlYnVnX25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDdEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3pELE9BQU8sRUFBQyx1QkFBdUIsRUFBYyxNQUFNLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUU1RixPQUFPLEVBQUMsZUFBZSxFQUFFLFlBQVksRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ2hGLE9BQU8sRUFDTCwwQkFBMEIsRUFFMUIsTUFBTSxFQUNOLE1BQU0sRUFFTixLQUFLLEdBQ04sTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsV0FBVyxFQUNYLFlBQVksRUFDWixZQUFZLEVBQ1osa0JBQWtCLEdBQ25CLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDbkUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyx3QkFBd0IsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzVGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3Qzs7R0FFRztBQUNILE1BQU0sT0FBTyxrQkFBa0I7SUFDN0IsWUFDUyxJQUFZLEVBQ1osUUFBa0I7UUFEbEIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGFBQVEsR0FBUixRQUFRLENBQVU7SUFDeEIsQ0FBQztDQUNMO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsUUFB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QUMsaUJBQWlCLENBQUM7Z0JBQ3BDLFVBQVUsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVk7b0JBQ3RDLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxVQUFxQixDQUFDO29CQUN6QyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELE9BQVEsVUFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCO0lBQzlCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLElBQWU7SUFDNUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUVELE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxJQUFlO0lBQ3RELHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHthc3NlcnRUTm9kZUZvckxWaWV3fSBmcm9tICcuLi9yZW5kZXIzL2Fzc2VydCc7XG5pbXBvcnQge2dldExDb250ZXh0fSBmcm9tICcuLi9yZW5kZXIzL2NvbnRleHRfZGlzY292ZXJ5JztcbmltcG9ydCB7Q09OVEFJTkVSX0hFQURFUl9PRkZTRVQsIExDb250YWluZXIsIE5BVElWRX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5pbXBvcnQge1RFbGVtZW50Tm9kZSwgVE5vZGUsIFROb2RlRmxhZ3MsIFROb2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtpc0NvbXBvbmVudEhvc3QsIGlzTENvbnRhaW5lcn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7XG4gIERFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXLFxuICBMVmlldyxcbiAgUEFSRU5ULFxuICBUX0hPU1QsXG4gIFREYXRhLFxuICBUVklFVyxcbn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtcbiAgZ2V0Q29tcG9uZW50LFxuICBnZXRDb250ZXh0LFxuICBnZXRJbmplY3Rpb25Ub2tlbnMsXG4gIGdldEluamVjdG9yLFxuICBnZXRMaXN0ZW5lcnMsXG4gIGdldExvY2FsUmVmcyxcbiAgZ2V0T3duaW5nQ29tcG9uZW50LFxufSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvZGlzY292ZXJ5X3V0aWxzJztcbmltcG9ydCB7SU5URVJQT0xBVElPTl9ERUxJTUlURVJ9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC9taXNjX3V0aWxzJztcbmltcG9ydCB7cmVuZGVyU3RyaW5naWZ5fSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50TFZpZXdCeUluZGV4LCBnZXROYXRpdmVCeVROb2RlT3JOdWxsfSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvdmlld191dGlscyc7XG5pbXBvcnQge2Fzc2VydERvbU5vZGV9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWJ1Z0V2ZW50TGlzdGVuZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyBjYWxsYmFjazogRnVuY3Rpb24sXG4gICkge31cbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc05hdGl2ZUVsZW1lbnRzKGRlYnVnRWxzOiBEZWJ1Z0VsZW1lbnRbXSk6IGFueSB7XG4gIHJldHVybiBkZWJ1Z0Vscy5tYXAoKGVsKSA9PiBlbC5uYXRpdmVFbGVtZW50KTtcbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWJ1Z05vZGUge1xuICAvKipcbiAgICogVGhlIHVuZGVybHlpbmcgRE9NIG5vZGUuXG4gICAqL1xuICByZWFkb25seSBuYXRpdmVOb2RlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IobmF0aXZlTm9kZTogTm9kZSkge1xuICAgIHRoaXMubmF0aXZlTm9kZSA9IG5hdGl2ZU5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGBEZWJ1Z0VsZW1lbnRgIHBhcmVudC4gV2lsbCBiZSBgbnVsbGAgaWYgdGhpcyBpcyB0aGUgcm9vdCBlbGVtZW50LlxuICAgKi9cbiAgZ2V0IHBhcmVudCgpOiBEZWJ1Z0VsZW1lbnQgfCBudWxsIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLm5hdGl2ZU5vZGUucGFyZW50Tm9kZSBhcyBFbGVtZW50O1xuICAgIHJldHVybiBwYXJlbnQgPyBuZXcgRGVidWdFbGVtZW50KHBhcmVudCkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBob3N0IGRlcGVuZGVuY3kgaW5qZWN0b3IuIEZvciBleGFtcGxlLCB0aGUgcm9vdCBlbGVtZW50J3MgY29tcG9uZW50IGluc3RhbmNlIGluamVjdG9yLlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHtcbiAgICByZXR1cm4gZ2V0SW5qZWN0b3IodGhpcy5uYXRpdmVOb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZWxlbWVudCdzIG93biBjb21wb25lbnQgaW5zdGFuY2UsIGlmIGl0IGhhcyBvbmUuXG4gICAqL1xuICBnZXQgY29tcG9uZW50SW5zdGFuY2UoKTogYW55IHtcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gdGhpcy5uYXRpdmVOb2RlO1xuICAgIHJldHVybiAoXG4gICAgICBuYXRpdmVFbGVtZW50ICYmIChnZXRDb21wb25lbnQobmF0aXZlRWxlbWVudCBhcyBFbGVtZW50KSB8fCBnZXRPd25pbmdDb21wb25lbnQobmF0aXZlRWxlbWVudCkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBvYmplY3QgdGhhdCBwcm92aWRlcyBwYXJlbnQgY29udGV4dCBmb3IgdGhpcyBlbGVtZW50LiBPZnRlbiBhbiBhbmNlc3RvciBjb21wb25lbnQgaW5zdGFuY2VcbiAgICogdGhhdCBnb3Zlcm5zIHRoaXMgZWxlbWVudC5cbiAgICpcbiAgICogV2hlbiBhbiBlbGVtZW50IGlzIHJlcGVhdGVkIHdpdGhpbiAqbmdGb3IsIHRoZSBjb250ZXh0IGlzIGFuIGBOZ0Zvck9mYCB3aG9zZSBgJGltcGxpY2l0YFxuICAgKiBwcm9wZXJ0eSBpcyB0aGUgdmFsdWUgb2YgdGhlIHJvdyBpbnN0YW5jZSB2YWx1ZS4gRm9yIGV4YW1wbGUsIHRoZSBgaGVyb2AgaW4gYCpuZ0Zvcj1cImxldCBoZXJvXG4gICAqIG9mIGhlcm9lc1wiYC5cbiAgICovXG4gIGdldCBjb250ZXh0KCk6IGFueSB7XG4gICAgcmV0dXJuIGdldENvbXBvbmVudCh0aGlzLm5hdGl2ZU5vZGUgYXMgRWxlbWVudCkgfHwgZ2V0Q29udGV4dCh0aGlzLm5hdGl2ZU5vZGUgYXMgRWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrcyBhdHRhY2hlZCB0byB0aGUgY29tcG9uZW50J3MgQE91dHB1dCBwcm9wZXJ0aWVzIGFuZC9vciB0aGUgZWxlbWVudCdzIGV2ZW50XG4gICAqIHByb3BlcnRpZXMuXG4gICAqL1xuICBnZXQgbGlzdGVuZXJzKCk6IERlYnVnRXZlbnRMaXN0ZW5lcltdIHtcbiAgICByZXR1cm4gZ2V0TGlzdGVuZXJzKHRoaXMubmF0aXZlTm9kZSBhcyBFbGVtZW50KS5maWx0ZXIoKGxpc3RlbmVyKSA9PiBsaXN0ZW5lci50eXBlID09PSAnZG9tJyk7XG4gIH1cblxuICAvKipcbiAgICogRGljdGlvbmFyeSBvZiBvYmplY3RzIGFzc29jaWF0ZWQgd2l0aCB0ZW1wbGF0ZSBsb2NhbCB2YXJpYWJsZXMgKGUuZy4gI2ZvbyksIGtleWVkIGJ5IHRoZSBsb2NhbFxuICAgKiB2YXJpYWJsZSBuYW1lLlxuICAgKi9cbiAgZ2V0IHJlZmVyZW5jZXMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiBnZXRMb2NhbFJlZnModGhpcy5uYXRpdmVOb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCdzIGluamVjdG9yIGxvb2t1cCB0b2tlbnMuIEluY2x1ZGVzIHRoZSBjb21wb25lbnQgaXRzZWxmIHBsdXMgdGhlIHRva2VucyB0aGF0IHRoZVxuICAgKiBjb21wb25lbnQgbGlzdHMgaW4gaXRzIHByb3ZpZGVycyBtZXRhZGF0YS5cbiAgICovXG4gIGdldCBwcm92aWRlclRva2VucygpOiBhbnlbXSB7XG4gICAgcmV0dXJuIGdldEluamVjdGlvblRva2Vucyh0aGlzLm5hdGl2ZU5vZGUgYXMgRWxlbWVudCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbQ29tcG9uZW50IHRlc3Rpbmcgc2NlbmFyaW9zXShndWlkZS90ZXN0aW5nL2NvbXBvbmVudHMtc2NlbmFyaW9zKVxuICogQHNlZSBbQmFzaWNzIG9mIHRlc3RpbmcgY29tcG9uZW50c10oZ3VpZGUvdGVzdGluZy9jb21wb25lbnRzLWJhc2ljcylcbiAqIEBzZWUgW1Rlc3RpbmcgdXRpbGl0eSBBUElzXShndWlkZS90ZXN0aW5nL3V0aWxpdHktYXBpcylcbiAqL1xuZXhwb3J0IGNsYXNzIERlYnVnRWxlbWVudCBleHRlbmRzIERlYnVnTm9kZSB7XG4gIGNvbnN0cnVjdG9yKG5hdGl2ZU5vZGU6IEVsZW1lbnQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RG9tTm9kZShuYXRpdmVOb2RlKTtcbiAgICBzdXBlcihuYXRpdmVOb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgdW5kZXJseWluZyBET00gZWxlbWVudCBhdCB0aGUgcm9vdCBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgZ2V0IG5hdGl2ZUVsZW1lbnQoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5uYXRpdmVOb2RlLm5vZGVUeXBlID09IE5vZGUuRUxFTUVOVF9OT0RFID8gKHRoaXMubmF0aXZlTm9kZSBhcyBFbGVtZW50KSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQgdGFnIG5hbWUsIGlmIGl0IGlzIGFuIGVsZW1lbnQuXG4gICAqL1xuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNvbnRleHQgPSBnZXRMQ29udGV4dCh0aGlzLm5hdGl2ZU5vZGUpITtcbiAgICBjb25zdCBsVmlldyA9IGNvbnRleHQgPyBjb250ZXh0LmxWaWV3IDogbnVsbDtcblxuICAgIGlmIChsVmlldyAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgdERhdGEgPSBsVmlld1tUVklFV10uZGF0YTtcbiAgICAgIGNvbnN0IHROb2RlID0gdERhdGFbY29udGV4dC5ub2RlSW5kZXhdIGFzIFROb2RlO1xuICAgICAgcmV0dXJuIHROb2RlLnZhbHVlITtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMubmF0aXZlTm9kZS5ub2RlTmFtZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogIEdldHMgYSBtYXAgb2YgcHJvcGVydHkgbmFtZXMgdG8gcHJvcGVydHkgdmFsdWVzIGZvciBhbiBlbGVtZW50LlxuICAgKlxuICAgKiAgVGhpcyBtYXAgaW5jbHVkZXM6XG4gICAqICAtIFJlZ3VsYXIgcHJvcGVydHkgYmluZGluZ3MgKGUuZy4gYFtpZF09XCJpZFwiYClcbiAgICogIC0gSG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyAoZS5nLiBgaG9zdDogeyAnW2lkXSc6IFwiaWRcIiB9YClcbiAgICogIC0gSW50ZXJwb2xhdGVkIHByb3BlcnR5IGJpbmRpbmdzIChlLmcuIGBpZD1cInt7IHZhbHVlIH19XCIpXG4gICAqXG4gICAqICBJdCBkb2VzIG5vdCBpbmNsdWRlOlxuICAgKiAgLSBpbnB1dCBwcm9wZXJ0eSBiaW5kaW5ncyAoZS5nLiBgW215Q3VzdG9tSW5wdXRdPVwidmFsdWVcImApXG4gICAqICAtIGF0dHJpYnV0ZSBiaW5kaW5ncyAoZS5nLiBgW2F0dHIucm9sZV09XCJtZW51XCJgKVxuICAgKi9cbiAgZ2V0IHByb3BlcnRpZXMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGNvbnN0IGNvbnRleHQgPSBnZXRMQ29udGV4dCh0aGlzLm5hdGl2ZU5vZGUpITtcbiAgICBjb25zdCBsVmlldyA9IGNvbnRleHQgPyBjb250ZXh0LmxWaWV3IDogbnVsbDtcblxuICAgIGlmIChsVmlldyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGNvbnN0IHREYXRhID0gbFZpZXdbVFZJRVddLmRhdGE7XG4gICAgY29uc3QgdE5vZGUgPSB0RGF0YVtjb250ZXh0Lm5vZGVJbmRleF0gYXMgVE5vZGU7XG5cbiAgICBjb25zdCBwcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIC8vIENvbGxlY3QgcHJvcGVydGllcyBmcm9tIHRoZSBET00uXG4gICAgY29weURvbVByb3BlcnRpZXModGhpcy5uYXRpdmVFbGVtZW50LCBwcm9wZXJ0aWVzKTtcbiAgICAvLyBDb2xsZWN0IHByb3BlcnRpZXMgZnJvbSB0aGUgYmluZGluZ3MuIFRoaXMgaXMgbmVlZGVkIGZvciBhbmltYXRpb24gcmVuZGVyZXIgd2hpY2ggaGFzXG4gICAgLy8gc3ludGhldGljIHByb3BlcnRpZXMgd2hpY2ggZG9uJ3QgZ2V0IHJlZmxlY3RlZCBpbnRvIHRoZSBET00uXG4gICAgY29sbGVjdFByb3BlcnR5QmluZGluZ3MocHJvcGVydGllcywgdE5vZGUsIGxWaWV3LCB0RGF0YSk7XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuICAvKipcbiAgICogIEEgbWFwIG9mIGF0dHJpYnV0ZSBuYW1lcyB0byBhdHRyaWJ1dGUgdmFsdWVzIGZvciBhbiBlbGVtZW50LlxuICAgKi9cbiAgLy8gVE9ETzogcmVwbGFjZSBudWxsIGJ5IHVuZGVmaW5lZCBpbiB0aGUgcmV0dXJuIHR5cGVcbiAgZ2V0IGF0dHJpYnV0ZXMoKToge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bGx9IHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbH0gPSB7fTtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5uYXRpdmVFbGVtZW50IGFzIEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgPSBnZXRMQ29udGV4dChlbGVtZW50KSE7XG4gICAgY29uc3QgbFZpZXcgPSBjb250ZXh0ID8gY29udGV4dC5sVmlldyA6IG51bGw7XG5cbiAgICBpZiAobFZpZXcgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBjb25zdCB0Tm9kZUF0dHJzID0gKGxWaWV3W1RWSUVXXS5kYXRhW2NvbnRleHQubm9kZUluZGV4XSBhcyBUTm9kZSkuYXR0cnM7XG4gICAgY29uc3QgbG93ZXJjYXNlVE5vZGVBdHRyczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIEZvciBkZWJ1ZyBub2RlcyB3ZSB0YWtlIHRoZSBlbGVtZW50J3MgYXR0cmlidXRlIGRpcmVjdGx5IGZyb20gdGhlIERPTSBzaW5jZSBpdCBhbGxvd3MgdXNcbiAgICAvLyB0byBhY2NvdW50IGZvciBvbmVzIHRoYXQgd2VyZW4ndCBzZXQgdmlhIGJpbmRpbmdzIChlLmcuIFZpZXdFbmdpbmUga2VlcHMgdHJhY2sgb2YgdGhlIG9uZXNcbiAgICAvLyB0aGF0IGFyZSBzZXQgdGhyb3VnaCBgUmVuZGVyZXIyYCkuIFRoZSBwcm9ibGVtIGlzIHRoYXQgdGhlIGJyb3dzZXIgd2lsbCBsb3dlcmNhc2UgYWxsIG5hbWVzLFxuICAgIC8vIGhvd2V2ZXIgc2luY2Ugd2UgaGF2ZSB0aGUgYXR0cmlidXRlcyBhbHJlYWR5IG9uIHRoZSBUTm9kZSwgd2UgY2FuIHByZXNlcnZlIHRoZSBjYXNlIGJ5IGdvaW5nXG4gICAgLy8gdGhyb3VnaCB0aGVtIG9uY2UsIGFkZGluZyB0aGVtIHRvIHRoZSBgYXR0cmlidXRlc2AgbWFwIGFuZCBwdXR0aW5nIHRoZWlyIGxvd2VyLWNhc2VkIG5hbWVcbiAgICAvLyBpbnRvIGFuIGFycmF5LiBBZnRlcndhcmRzIHdoZW4gd2UncmUgZ29pbmcgdGhyb3VnaCB0aGUgbmF0aXZlIERPTSBhdHRyaWJ1dGVzLCB3ZSBjYW4gY2hlY2tcbiAgICAvLyB3aGV0aGVyIHdlIGhhdmVuJ3QgcnVuIGludG8gYW4gYXR0cmlidXRlIGFscmVhZHkgdGhyb3VnaCB0aGUgVE5vZGUuXG4gICAgaWYgKHROb2RlQXR0cnMpIHtcbiAgICAgIGxldCBpID0gMDtcbiAgICAgIHdoaWxlIChpIDwgdE5vZGVBdHRycy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSB0Tm9kZUF0dHJzW2ldO1xuXG4gICAgICAgIC8vIFN0b3AgYXMgc29vbiBhcyB3ZSBoaXQgYSBtYXJrZXIuIFdlIG9ubHkgY2FyZSBhYm91dCB0aGUgcmVndWxhciBhdHRyaWJ1dGVzLiBFdmVyeXRoaW5nXG4gICAgICAgIC8vIGVsc2Ugd2lsbCBiZSBoYW5kbGVkIGJlbG93IHdoZW4gd2UgcmVhZCB0aGUgZmluYWwgYXR0cmlidXRlcyBvZmYgdGhlIERPTS5cbiAgICAgICAgaWYgKHR5cGVvZiBhdHRyTmFtZSAhPT0gJ3N0cmluZycpIGJyZWFrO1xuXG4gICAgICAgIGNvbnN0IGF0dHJWYWx1ZSA9IHROb2RlQXR0cnNbaSArIDFdO1xuICAgICAgICBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHJWYWx1ZSBhcyBzdHJpbmc7XG4gICAgICAgIGxvd2VyY2FzZVROb2RlQXR0cnMucHVzaChhdHRyTmFtZS50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICBpICs9IDI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhdHRyIG9mIGVsZW1lbnQuYXR0cmlidXRlcykge1xuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgd2UgZG9uJ3QgYXNzaWduIHRoZSBzYW1lIGF0dHJpYnV0ZSBib3RoIGluIGl0c1xuICAgICAgLy8gY2FzZS1zZW5zaXRpdmUgZm9ybSBhbmQgdGhlIGxvd2VyLWNhc2VkIG9uZSBmcm9tIHRoZSBicm93c2VyLlxuICAgICAgaWYgKCFsb3dlcmNhc2VUTm9kZUF0dHJzLmluY2x1ZGVzKGF0dHIubmFtZSkpIHtcbiAgICAgICAgYXR0cmlidXRlc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXR0cmlidXRlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5saW5lIHN0eWxlcyBvZiB0aGUgRE9NIGVsZW1lbnQuXG4gICAqL1xuICAvLyBUT0RPOiByZXBsYWNlIG51bGwgYnkgdW5kZWZpbmVkIGluIHRoZSByZXR1cm4gdHlwZVxuICBnZXQgc3R5bGVzKCk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudWxsfSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgcmV0dXJuIChlbGVtZW50Py5zdHlsZSA/PyB7fSkgYXMge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bGx9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbWFwIGNvbnRhaW5pbmcgdGhlIGNsYXNzIG5hbWVzIG9uIHRoZSBlbGVtZW50IGFzIGtleXMuXG4gICAqXG4gICAqIFRoaXMgbWFwIGlzIGRlcml2ZWQgZnJvbSB0aGUgYGNsYXNzTmFtZWAgcHJvcGVydHkgb2YgdGhlIERPTSBlbGVtZW50LlxuICAgKlxuICAgKiBOb3RlOiBUaGUgdmFsdWVzIG9mIHRoaXMgb2JqZWN0IHdpbGwgYWx3YXlzIGJlIGB0cnVlYC4gVGhlIGNsYXNzIGtleSB3aWxsIG5vdCBhcHBlYXIgaW4gdGhlIEtWXG4gICAqIG9iamVjdCBpZiBpdCBkb2VzIG5vdCBleGlzdCBvbiB0aGUgZWxlbWVudC5cbiAgICpcbiAgICogQHNlZSBbRWxlbWVudC5jbGFzc05hbWVdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L2NsYXNzTmFtZSlcbiAgICovXG4gIGdldCBjbGFzc2VzKCk6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgY29uc3QgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7fTtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5uYXRpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudDtcblxuICAgIC8vIFNWRyBlbGVtZW50cyByZXR1cm4gYW4gYFNWR0FuaW1hdGVkU3RyaW5nYCBpbnN0ZWFkIG9mIGEgcGxhaW4gc3RyaW5nIGZvciB0aGUgYGNsYXNzTmFtZWAuXG4gICAgY29uc3QgY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUgYXMgc3RyaW5nIHwgU1ZHQW5pbWF0ZWRTdHJpbmc7XG4gICAgY29uc3QgY2xhc3NlcyA9XG4gICAgICB0eXBlb2YgY2xhc3NOYW1lICE9PSAnc3RyaW5nJyA/IGNsYXNzTmFtZS5iYXNlVmFsLnNwbGl0KCcgJykgOiBjbGFzc05hbWUuc3BsaXQoJyAnKTtcblxuICAgIGNsYXNzZXMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4gKHJlc3VsdFt2YWx1ZV0gPSB0cnVlKSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBgY2hpbGROb2Rlc2Agb2YgdGhlIERPTSBlbGVtZW50IGFzIGEgYERlYnVnTm9kZWAgYXJyYXkuXG4gICAqXG4gICAqIEBzZWUgW05vZGUuY2hpbGROb2Rlc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvY2hpbGROb2RlcylcbiAgICovXG4gIGdldCBjaGlsZE5vZGVzKCk6IERlYnVnTm9kZVtdIHtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gdGhpcy5uYXRpdmVOb2RlLmNoaWxkTm9kZXM7XG4gICAgY29uc3QgY2hpbGRyZW46IERlYnVnTm9kZVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gY2hpbGROb2Rlc1tpXTtcbiAgICAgIGNoaWxkcmVuLnB1c2goZ2V0RGVidWdOb2RlKGVsZW1lbnQpISk7XG4gICAgfVxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW1tZWRpYXRlIGBEZWJ1Z0VsZW1lbnRgIGNoaWxkcmVuLiBXYWxrIHRoZSB0cmVlIGJ5IGRlc2NlbmRpbmcgdGhyb3VnaCBgY2hpbGRyZW5gLlxuICAgKi9cbiAgZ2V0IGNoaWxkcmVuKCk6IERlYnVnRWxlbWVudFtdIHtcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gdGhpcy5uYXRpdmVFbGVtZW50O1xuICAgIGlmICghbmF0aXZlRWxlbWVudCkgcmV0dXJuIFtdO1xuICAgIGNvbnN0IGNoaWxkTm9kZXMgPSBuYXRpdmVFbGVtZW50LmNoaWxkcmVuO1xuICAgIGNvbnN0IGNoaWxkcmVuOiBEZWJ1Z0VsZW1lbnRbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGNoaWxkTm9kZXNbaV07XG4gICAgICBjaGlsZHJlbi5wdXNoKGdldERlYnVnTm9kZShlbGVtZW50KSBhcyBEZWJ1Z0VsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgdGhlIGZpcnN0IGBEZWJ1Z0VsZW1lbnRgIHRoYXQgbWF0Y2hlcyB0aGUgcHJlZGljYXRlIGF0IGFueSBkZXB0aCBpbiB0aGUgc3VidHJlZS5cbiAgICovXG4gIHF1ZXJ5KHByZWRpY2F0ZTogUHJlZGljYXRlPERlYnVnRWxlbWVudD4pOiBEZWJ1Z0VsZW1lbnQge1xuICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLnF1ZXJ5QWxsKHByZWRpY2F0ZSk7XG4gICAgcmV0dXJuIHJlc3VsdHNbMF0gfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBBbGwgYERlYnVnRWxlbWVudGAgbWF0Y2hlcyBmb3IgdGhlIHByZWRpY2F0ZSBhdCBhbnkgZGVwdGggaW4gdGhlIHN1YnRyZWUuXG4gICAqL1xuICBxdWVyeUFsbChwcmVkaWNhdGU6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+KTogRGVidWdFbGVtZW50W10ge1xuICAgIGNvbnN0IG1hdGNoZXM6IERlYnVnRWxlbWVudFtdID0gW107XG4gICAgX3F1ZXJ5QWxsKHRoaXMsIHByZWRpY2F0ZSwgbWF0Y2hlcywgdHJ1ZSk7XG4gICAgcmV0dXJuIG1hdGNoZXM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgQWxsIGBEZWJ1Z05vZGVgIG1hdGNoZXMgZm9yIHRoZSBwcmVkaWNhdGUgYXQgYW55IGRlcHRoIGluIHRoZSBzdWJ0cmVlLlxuICAgKi9cbiAgcXVlcnlBbGxOb2RlcyhwcmVkaWNhdGU6IFByZWRpY2F0ZTxEZWJ1Z05vZGU+KTogRGVidWdOb2RlW10ge1xuICAgIGNvbnN0IG1hdGNoZXM6IERlYnVnTm9kZVtdID0gW107XG4gICAgX3F1ZXJ5QWxsKHRoaXMsIHByZWRpY2F0ZSwgbWF0Y2hlcywgZmFsc2UpO1xuICAgIHJldHVybiBtYXRjaGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHRoZSBldmVudCBieSBpdHMgbmFtZSBpZiB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgbGlzdGVuZXIgaW4gdGhlIGVsZW1lbnQnc1xuICAgKiBgbGlzdGVuZXJzYCBjb2xsZWN0aW9uLlxuICAgKlxuICAgKiBJZiB0aGUgZXZlbnQgbGFja3MgYSBsaXN0ZW5lciBvciB0aGVyZSdzIHNvbWUgb3RoZXIgcHJvYmxlbSwgY29uc2lkZXJcbiAgICogY2FsbGluZyBgbmF0aXZlRWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50T2JqZWN0KWAuXG4gICAqXG4gICAqIEBwYXJhbSBldmVudE5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHRyaWdnZXJcbiAgICogQHBhcmFtIGV2ZW50T2JqIFRoZSBfZXZlbnQgb2JqZWN0XyBleHBlY3RlZCBieSB0aGUgaGFuZGxlclxuICAgKlxuICAgKiBAc2VlIFtUZXN0aW5nIGNvbXBvbmVudHMgc2NlbmFyaW9zXShndWlkZS90ZXN0aW5nL2NvbXBvbmVudHMtc2NlbmFyaW9zI3RyaWdnZXItZXZlbnQtaGFuZGxlcilcbiAgICovXG4gIHRyaWdnZXJFdmVudEhhbmRsZXIoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50T2JqPzogYW55KTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMubmF0aXZlTm9kZSBhcyBhbnk7XG4gICAgY29uc3QgaW52b2tlZExpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGlmIChsaXN0ZW5lci5uYW1lID09PSBldmVudE5hbWUpIHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2sgPSBsaXN0ZW5lci5jYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2suY2FsbChub2RlLCBldmVudE9iaik7XG4gICAgICAgIGludm9rZWRMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGNoZWNrIHdoZXRoZXIgYGV2ZW50TGlzdGVuZXJzYCBleGlzdHMsIGJlY2F1c2UgaXQncyBzb21ldGhpbmdcbiAgICAvLyB0aGF0IFpvbmUuanMgb25seSBhZGRzIHRvIGBFdmVudFRhcmdldGAgaW4gYnJvd3NlciBlbnZpcm9ubWVudHMuXG4gICAgaWYgKHR5cGVvZiBub2RlLmV2ZW50TGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBOb3RlIHRoYXQgaW4gSXZ5IHdlIHdyYXAgZXZlbnQgbGlzdGVuZXJzIHdpdGggYSBjYWxsIHRvIGBldmVudC5wcmV2ZW50RGVmYXVsdGAgaW4gc29tZVxuICAgICAgLy8gY2FzZXMuIFdlIHVzZSAnX19uZ1Vud3JhcF9fJyBhcyBhIHNwZWNpYWwgdG9rZW4gdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIGFjdHVhbCBldmVudFxuICAgICAgLy8gbGlzdGVuZXIuXG4gICAgICBub2RlLmV2ZW50TGlzdGVuZXJzKGV2ZW50TmFtZSkuZm9yRWFjaCgobGlzdGVuZXI6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIC8vIEluIG9yZGVyIHRvIGVuc3VyZSB0aGF0IHdlIGNhbiBkZXRlY3QgdGhlIHNwZWNpYWwgX19uZ1Vud3JhcF9fIHRva2VuIGRlc2NyaWJlZCBhYm92ZSwgd2VcbiAgICAgICAgLy8gdXNlIGB0b1N0cmluZ2Agb24gdGhlIGxpc3RlbmVyIGFuZCBzZWUgaWYgaXQgY29udGFpbnMgdGhlIHRva2VuLiBXZSB1c2UgdGhpcyBhcHByb2FjaCB0b1xuICAgICAgICAvLyBlbnN1cmUgdGhhdCBpdCBzdGlsbCB3b3JrZWQgd2l0aCBjb21waWxlZCBjb2RlIHNpbmNlIGl0IGNhbm5vdCByZW1vdmUgb3IgcmVuYW1lIHN0cmluZ1xuICAgICAgICAvLyBsaXRlcmFscy4gV2UgYWxzbyBjb25zaWRlcmVkIHVzaW5nIGEgc3BlY2lhbCBmdW5jdGlvbiBuYW1lIChpLmUuIGlmKGxpc3RlbmVyLm5hbWUgPT09XG4gICAgICAgIC8vIHNwZWNpYWwpKSBidXQgdGhhdCB3YXMgbW9yZSBjdW1iZXJzb21lIGFuZCB3ZSB3ZXJlIGFsc28gY29uY2VybmVkIHRoZSBjb21waWxlZCBjb2RlIGNvdWxkXG4gICAgICAgIC8vIHN0cmlwIHRoZSBuYW1lLCB0dXJuaW5nIHRoZSBjb25kaXRpb24gaW4gdG8gKFwiXCIgPT09IFwiXCIpIGFuZCBhbHdheXMgcmV0dXJuaW5nIHRydWUuXG4gICAgICAgIGlmIChsaXN0ZW5lci50b1N0cmluZygpLmluZGV4T2YoJ19fbmdVbndyYXBfXycpICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IHVud3JhcHBlZExpc3RlbmVyID0gbGlzdGVuZXIoJ19fbmdVbndyYXBfXycpO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBpbnZva2VkTGlzdGVuZXJzLmluZGV4T2YodW53cmFwcGVkTGlzdGVuZXIpID09PSAtMSAmJlxuICAgICAgICAgICAgdW53cmFwcGVkTGlzdGVuZXIuY2FsbChub2RlLCBldmVudE9iailcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weURvbVByb3BlcnRpZXMoZWxlbWVudDogRWxlbWVudCB8IG51bGwsIHByb3BlcnRpZXM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSk6IHZvaWQge1xuICBpZiAoZWxlbWVudCkge1xuICAgIC8vIFNraXAgb3duIHByb3BlcnRpZXMgKGFzIHRob3NlIGFyZSBwYXRjaGVkKVxuICAgIGxldCBvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZWxlbWVudCk7XG4gICAgY29uc3QgTm9kZVByb3RvdHlwZTogYW55ID0gTm9kZS5wcm90b3R5cGU7XG4gICAgd2hpbGUgKG9iaiAhPT0gbnVsbCAmJiBvYmogIT09IE5vZGVQcm90b3R5cGUpIHtcbiAgICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMob2JqKTtcbiAgICAgIGZvciAobGV0IGtleSBpbiBkZXNjcmlwdG9ycykge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKCdfXycpICYmICFrZXkuc3RhcnRzV2l0aCgnb24nKSkge1xuICAgICAgICAgIC8vIGRvbid0IGluY2x1ZGUgcHJvcGVydGllcyBzdGFydGluZyB3aXRoIGBfX2AgYW5kIGBvbmAuXG4gICAgICAgICAgLy8gYF9fYCBhcmUgcGF0Y2hlZCB2YWx1ZXMgd2hpY2ggc2hvdWxkIG5vdCBiZSBpbmNsdWRlZC5cbiAgICAgICAgICAvLyBgb25gIGFyZSBsaXN0ZW5lcnMgd2hpY2ggYWxzbyBzaG91bGQgbm90IGJlIGluY2x1ZGVkLlxuICAgICAgICAgIGNvbnN0IHZhbHVlID0gKGVsZW1lbnQgYXMgYW55KVtrZXldO1xuICAgICAgICAgIGlmIChpc1ByaW1pdGl2ZVZhbHVlKHZhbHVlKSkge1xuICAgICAgICAgICAgcHJvcGVydGllc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmVWYWx1ZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fFxuICAgIHZhbHVlID09PSBudWxsXG4gICk7XG59XG5cbi8qKlxuICogV2FsayB0aGUgVE5vZGUgdHJlZSB0byBmaW5kIG1hdGNoZXMgZm9yIHRoZSBwcmVkaWNhdGUuXG4gKlxuICogQHBhcmFtIHBhcmVudEVsZW1lbnQgdGhlIGVsZW1lbnQgZnJvbSB3aGljaCB0aGUgd2FsayBpcyBzdGFydGVkXG4gKiBAcGFyYW0gcHJlZGljYXRlIHRoZSBwcmVkaWNhdGUgdG8gbWF0Y2hcbiAqIEBwYXJhbSBtYXRjaGVzIHRoZSBsaXN0IG9mIHBvc2l0aXZlIG1hdGNoZXNcbiAqIEBwYXJhbSBlbGVtZW50c09ubHkgd2hldGhlciBvbmx5IGVsZW1lbnRzIHNob3VsZCBiZSBzZWFyY2hlZFxuICovXG5mdW5jdGlvbiBfcXVlcnlBbGwoXG4gIHBhcmVudEVsZW1lbnQ6IERlYnVnRWxlbWVudCxcbiAgcHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PixcbiAgbWF0Y2hlczogRGVidWdFbGVtZW50W10sXG4gIGVsZW1lbnRzT25seTogdHJ1ZSxcbik6IHZvaWQ7XG5mdW5jdGlvbiBfcXVlcnlBbGwoXG4gIHBhcmVudEVsZW1lbnQ6IERlYnVnRWxlbWVudCxcbiAgcHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdOb2RlPixcbiAgbWF0Y2hlczogRGVidWdOb2RlW10sXG4gIGVsZW1lbnRzT25seTogZmFsc2UsXG4pOiB2b2lkO1xuZnVuY3Rpb24gX3F1ZXJ5QWxsKFxuICBwYXJlbnRFbGVtZW50OiBEZWJ1Z0VsZW1lbnQsXG4gIHByZWRpY2F0ZTogUHJlZGljYXRlPERlYnVnRWxlbWVudD4gfCBQcmVkaWNhdGU8RGVidWdOb2RlPixcbiAgbWF0Y2hlczogRGVidWdFbGVtZW50W10gfCBEZWJ1Z05vZGVbXSxcbiAgZWxlbWVudHNPbmx5OiBib29sZWFuLFxuKSB7XG4gIGNvbnN0IGNvbnRleHQgPSBnZXRMQ29udGV4dChwYXJlbnRFbGVtZW50Lm5hdGl2ZU5vZGUpITtcbiAgY29uc3QgbFZpZXcgPSBjb250ZXh0ID8gY29udGV4dC5sVmlldyA6IG51bGw7XG4gIGlmIChsVmlldyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHBhcmVudFROb2RlID0gbFZpZXdbVFZJRVddLmRhdGFbY29udGV4dC5ub2RlSW5kZXhdIGFzIFROb2RlO1xuICAgIF9xdWVyeU5vZGVDaGlsZHJlbihcbiAgICAgIHBhcmVudFROb2RlLFxuICAgICAgbFZpZXcsXG4gICAgICBwcmVkaWNhdGUsXG4gICAgICBtYXRjaGVzLFxuICAgICAgZWxlbWVudHNPbmx5LFxuICAgICAgcGFyZW50RWxlbWVudC5uYXRpdmVOb2RlLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSWYgdGhlIGNvbnRleHQgaXMgbnVsbCwgdGhlbiBgcGFyZW50RWxlbWVudGAgd2FzIGVpdGhlciBjcmVhdGVkIHdpdGggUmVuZGVyZXIyIG9yIG5hdGl2ZSBET01cbiAgICAvLyBBUElzLlxuICAgIF9xdWVyeU5hdGl2ZU5vZGVEZXNjZW5kYW50cyhwYXJlbnRFbGVtZW50Lm5hdGl2ZU5vZGUsIHByZWRpY2F0ZSwgbWF0Y2hlcywgZWxlbWVudHNPbmx5KTtcbiAgfVxufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IG1hdGNoIHRoZSBjdXJyZW50IFROb2RlIGFnYWluc3QgdGhlIHByZWRpY2F0ZSwgYW5kIGdvZXMgb24gd2l0aCB0aGUgbmV4dCBvbmVzLlxuICpcbiAqIEBwYXJhbSB0Tm9kZSB0aGUgY3VycmVudCBUTm9kZVxuICogQHBhcmFtIGxWaWV3IHRoZSBMVmlldyBvZiB0aGlzIFROb2RlXG4gKiBAcGFyYW0gcHJlZGljYXRlIHRoZSBwcmVkaWNhdGUgdG8gbWF0Y2hcbiAqIEBwYXJhbSBtYXRjaGVzIHRoZSBsaXN0IG9mIHBvc2l0aXZlIG1hdGNoZXNcbiAqIEBwYXJhbSBlbGVtZW50c09ubHkgd2hldGhlciBvbmx5IGVsZW1lbnRzIHNob3VsZCBiZSBzZWFyY2hlZFxuICogQHBhcmFtIHJvb3ROYXRpdmVOb2RlIHRoZSByb290IG5hdGl2ZSBub2RlIG9uIHdoaWNoIHByZWRpY2F0ZSBzaG91bGQgbm90IGJlIG1hdGNoZWRcbiAqL1xuZnVuY3Rpb24gX3F1ZXJ5Tm9kZUNoaWxkcmVuKFxuICB0Tm9kZTogVE5vZGUsXG4gIGxWaWV3OiBMVmlldyxcbiAgcHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB8IFByZWRpY2F0ZTxEZWJ1Z05vZGU+LFxuICBtYXRjaGVzOiBEZWJ1Z0VsZW1lbnRbXSB8IERlYnVnTm9kZVtdLFxuICBlbGVtZW50c09ubHk6IGJvb2xlYW4sXG4gIHJvb3ROYXRpdmVOb2RlOiBhbnksXG4pIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydFROb2RlRm9yTFZpZXcodE5vZGUsIGxWaWV3KTtcbiAgY29uc3QgbmF0aXZlTm9kZSA9IGdldE5hdGl2ZUJ5VE5vZGVPck51bGwodE5vZGUsIGxWaWV3KTtcbiAgLy8gRm9yIGVhY2ggdHlwZSBvZiBUTm9kZSwgc3BlY2lmaWMgbG9naWMgaXMgZXhlY3V0ZWQuXG4gIGlmICh0Tm9kZS50eXBlICYgKFROb2RlVHlwZS5BbnlSTm9kZSB8IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyKSkge1xuICAgIC8vIENhc2UgMTogdGhlIFROb2RlIGlzIGFuIGVsZW1lbnRcbiAgICAvLyBUaGUgbmF0aXZlIG5vZGUgaGFzIHRvIGJlIGNoZWNrZWQuXG4gICAgX2FkZFF1ZXJ5TWF0Y2gobmF0aXZlTm9kZSwgcHJlZGljYXRlLCBtYXRjaGVzLCBlbGVtZW50c09ubHksIHJvb3ROYXRpdmVOb2RlKTtcbiAgICBpZiAoaXNDb21wb25lbnRIb3N0KHROb2RlKSkge1xuICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgdGhlIGhvc3Qgb2YgYSBjb21wb25lbnQsIHRoZW4gYWxsIG5vZGVzIGluIGl0cyB2aWV3IGhhdmUgdG8gYmUgcHJvY2Vzc2VkLlxuICAgICAgLy8gTm90ZTogdGhlIGNvbXBvbmVudCdzIGNvbnRlbnQgKHROb2RlLmNoaWxkKSB3aWxsIGJlIHByb2Nlc3NlZCBmcm9tIHRoZSBpbnNlcnRpb24gcG9pbnRzLlxuICAgICAgY29uc3QgY29tcG9uZW50VmlldyA9IGdldENvbXBvbmVudExWaWV3QnlJbmRleCh0Tm9kZS5pbmRleCwgbFZpZXcpO1xuICAgICAgaWYgKGNvbXBvbmVudFZpZXcgJiYgY29tcG9uZW50Vmlld1tUVklFV10uZmlyc3RDaGlsZCkge1xuICAgICAgICBfcXVlcnlOb2RlQ2hpbGRyZW4oXG4gICAgICAgICAgY29tcG9uZW50Vmlld1tUVklFV10uZmlyc3RDaGlsZCEsXG4gICAgICAgICAgY29tcG9uZW50VmlldyxcbiAgICAgICAgICBwcmVkaWNhdGUsXG4gICAgICAgICAgbWF0Y2hlcyxcbiAgICAgICAgICBlbGVtZW50c09ubHksXG4gICAgICAgICAgcm9vdE5hdGl2ZU5vZGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0Tm9kZS5jaGlsZCkge1xuICAgICAgICAvLyBPdGhlcndpc2UsIGl0cyBjaGlsZHJlbiBoYXZlIHRvIGJlIHByb2Nlc3NlZC5cbiAgICAgICAgX3F1ZXJ5Tm9kZUNoaWxkcmVuKHROb2RlLmNoaWxkLCBsVmlldywgcHJlZGljYXRlLCBtYXRjaGVzLCBlbGVtZW50c09ubHksIHJvb3ROYXRpdmVOb2RlKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgYWxzbyBoYXZlIHRvIHF1ZXJ5IHRoZSBET00gZGlyZWN0bHkgaW4gb3JkZXIgdG8gY2F0Y2ggZWxlbWVudHMgaW5zZXJ0ZWQgdGhyb3VnaFxuICAgICAgLy8gUmVuZGVyZXIyLiBOb3RlIHRoYXQgdGhpcyBpcyBfX25vdF9fIG9wdGltYWwsIGJlY2F1c2Ugd2UncmUgd2Fsa2luZyBzaW1pbGFyIHRyZWVzIG11bHRpcGxlXG4gICAgICAvLyB0aW1lcy4gVmlld0VuZ2luZSBjb3VsZCBkbyBpdCBtb3JlIGVmZmljaWVudGx5LCBiZWNhdXNlIGFsbCB0aGUgaW5zZXJ0aW9ucyBnbyB0aHJvdWdoXG4gICAgICAvLyBSZW5kZXJlcjIsIGhvd2V2ZXIgdGhhdCdzIG5vdCB0aGUgY2FzZSBpbiBJdnkuIFRoaXMgYXBwcm9hY2ggaXMgYmVpbmcgdXNlZCBiZWNhdXNlOlxuICAgICAgLy8gMS4gTWF0Y2hpbmcgdGhlIFZpZXdFbmdpbmUgYmVoYXZpb3Igd291bGQgbWVhbiBwb3RlbnRpYWxseSBpbnRyb2R1Y2luZyBhIGRlcGVuZGVuY3lcbiAgICAgIC8vICAgIGZyb20gYFJlbmRlcmVyMmAgdG8gSXZ5IHdoaWNoIGNvdWxkIGJyaW5nIEl2eSBjb2RlIGludG8gVmlld0VuZ2luZS5cbiAgICAgIC8vIDIuIEl0IGFsbG93cyB1cyB0byBjYXB0dXJlIG5vZGVzIHRoYXQgd2VyZSBpbnNlcnRlZCBkaXJlY3RseSB2aWEgdGhlIERPTS5cbiAgICAgIG5hdGl2ZU5vZGUgJiYgX3F1ZXJ5TmF0aXZlTm9kZURlc2NlbmRhbnRzKG5hdGl2ZU5vZGUsIHByZWRpY2F0ZSwgbWF0Y2hlcywgZWxlbWVudHNPbmx5KTtcbiAgICB9XG4gICAgLy8gSW4gYWxsIGNhc2VzLCBpZiBhIGR5bmFtaWMgY29udGFpbmVyIGV4aXN0cyBmb3IgdGhpcyBub2RlLCBlYWNoIHZpZXcgaW5zaWRlIGl0IGhhcyB0byBiZVxuICAgIC8vIHByb2Nlc3NlZC5cbiAgICBjb25zdCBub2RlT3JDb250YWluZXIgPSBsVmlld1t0Tm9kZS5pbmRleF07XG4gICAgaWYgKGlzTENvbnRhaW5lcihub2RlT3JDb250YWluZXIpKSB7XG4gICAgICBfcXVlcnlOb2RlQ2hpbGRyZW5JbkNvbnRhaW5lcihcbiAgICAgICAgbm9kZU9yQ29udGFpbmVyLFxuICAgICAgICBwcmVkaWNhdGUsXG4gICAgICAgIG1hdGNoZXMsXG4gICAgICAgIGVsZW1lbnRzT25seSxcbiAgICAgICAgcm9vdE5hdGl2ZU5vZGUsXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLkNvbnRhaW5lcikge1xuICAgIC8vIENhc2UgMjogdGhlIFROb2RlIGlzIGEgY29udGFpbmVyXG4gICAgLy8gVGhlIG5hdGl2ZSBub2RlIGhhcyB0byBiZSBjaGVja2VkLlxuICAgIGNvbnN0IGxDb250YWluZXIgPSBsVmlld1t0Tm9kZS5pbmRleF07XG4gICAgX2FkZFF1ZXJ5TWF0Y2gobENvbnRhaW5lcltOQVRJVkVdLCBwcmVkaWNhdGUsIG1hdGNoZXMsIGVsZW1lbnRzT25seSwgcm9vdE5hdGl2ZU5vZGUpO1xuICAgIC8vIEVhY2ggdmlldyBpbnNpZGUgdGhlIGNvbnRhaW5lciBoYXMgdG8gYmUgcHJvY2Vzc2VkLlxuICAgIF9xdWVyeU5vZGVDaGlsZHJlbkluQ29udGFpbmVyKGxDb250YWluZXIsIHByZWRpY2F0ZSwgbWF0Y2hlcywgZWxlbWVudHNPbmx5LCByb290TmF0aXZlTm9kZSk7XG4gIH0gZWxzZSBpZiAodE5vZGUudHlwZSAmIFROb2RlVHlwZS5Qcm9qZWN0aW9uKSB7XG4gICAgLy8gQ2FzZSAzOiB0aGUgVE5vZGUgaXMgYSBwcm9qZWN0aW9uIGluc2VydGlvbiBwb2ludCAoaS5lLiBhIDxuZy1jb250ZW50PikuXG4gICAgLy8gVGhlIG5vZGVzIHByb2plY3RlZCBhdCB0aGlzIGxvY2F0aW9uIGFsbCBuZWVkIHRvIGJlIHByb2Nlc3NlZC5cbiAgICBjb25zdCBjb21wb25lbnRWaWV3ID0gbFZpZXchW0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXTtcbiAgICBjb25zdCBjb21wb25lbnRIb3N0ID0gY29tcG9uZW50Vmlld1tUX0hPU1RdIGFzIFRFbGVtZW50Tm9kZTtcbiAgICBjb25zdCBoZWFkOiBUTm9kZSB8IG51bGwgPSAoY29tcG9uZW50SG9zdC5wcm9qZWN0aW9uIGFzIChUTm9kZSB8IG51bGwpW10pW1xuICAgICAgdE5vZGUucHJvamVjdGlvbiBhcyBudW1iZXJcbiAgICBdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaGVhZCkpIHtcbiAgICAgIGZvciAobGV0IG5hdGl2ZU5vZGUgb2YgaGVhZCkge1xuICAgICAgICBfYWRkUXVlcnlNYXRjaChuYXRpdmVOb2RlLCBwcmVkaWNhdGUsIG1hdGNoZXMsIGVsZW1lbnRzT25seSwgcm9vdE5hdGl2ZU5vZGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGVhZCkge1xuICAgICAgY29uc3QgbmV4dExWaWV3ID0gY29tcG9uZW50Vmlld1tQQVJFTlRdISBhcyBMVmlldztcbiAgICAgIGNvbnN0IG5leHRUTm9kZSA9IG5leHRMVmlld1tUVklFV10uZGF0YVtoZWFkLmluZGV4XSBhcyBUTm9kZTtcbiAgICAgIF9xdWVyeU5vZGVDaGlsZHJlbihuZXh0VE5vZGUsIG5leHRMVmlldywgcHJlZGljYXRlLCBtYXRjaGVzLCBlbGVtZW50c09ubHksIHJvb3ROYXRpdmVOb2RlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodE5vZGUuY2hpbGQpIHtcbiAgICAvLyBDYXNlIDQ6IHRoZSBUTm9kZSBpcyBhIHZpZXcuXG4gICAgX3F1ZXJ5Tm9kZUNoaWxkcmVuKHROb2RlLmNoaWxkLCBsVmlldywgcHJlZGljYXRlLCBtYXRjaGVzLCBlbGVtZW50c09ubHksIHJvb3ROYXRpdmVOb2RlKTtcbiAgfVxuXG4gIC8vIFdlIGRvbid0IHdhbnQgdG8gZ28gdG8gdGhlIG5leHQgc2libGluZyBvZiB0aGUgcm9vdCBub2RlLlxuICBpZiAocm9vdE5hdGl2ZU5vZGUgIT09IG5hdGl2ZU5vZGUpIHtcbiAgICAvLyBUbyBkZXRlcm1pbmUgdGhlIG5leHQgbm9kZSB0byBiZSBwcm9jZXNzZWQsIHdlIG5lZWQgdG8gdXNlIHRoZSBuZXh0IG9yIHRoZSBwcm9qZWN0aW9uTmV4dFxuICAgIC8vIGxpbmssIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBjdXJyZW50IG5vZGUgaGFzIGJlZW4gcHJvamVjdGVkLlxuICAgIGNvbnN0IG5leHRUTm9kZSA9IHROb2RlLmZsYWdzICYgVE5vZGVGbGFncy5pc1Byb2plY3RlZCA/IHROb2RlLnByb2plY3Rpb25OZXh0IDogdE5vZGUubmV4dDtcbiAgICBpZiAobmV4dFROb2RlKSB7XG4gICAgICBfcXVlcnlOb2RlQ2hpbGRyZW4obmV4dFROb2RlLCBsVmlldywgcHJlZGljYXRlLCBtYXRjaGVzLCBlbGVtZW50c09ubHksIHJvb3ROYXRpdmVOb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzIGFsbCBUTm9kZXMgaW4gYSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIGxDb250YWluZXIgdGhlIGNvbnRhaW5lciB0byBiZSBwcm9jZXNzZWRcbiAqIEBwYXJhbSBwcmVkaWNhdGUgdGhlIHByZWRpY2F0ZSB0byBtYXRjaFxuICogQHBhcmFtIG1hdGNoZXMgdGhlIGxpc3Qgb2YgcG9zaXRpdmUgbWF0Y2hlc1xuICogQHBhcmFtIGVsZW1lbnRzT25seSB3aGV0aGVyIG9ubHkgZWxlbWVudHMgc2hvdWxkIGJlIHNlYXJjaGVkXG4gKiBAcGFyYW0gcm9vdE5hdGl2ZU5vZGUgdGhlIHJvb3QgbmF0aXZlIG5vZGUgb24gd2hpY2ggcHJlZGljYXRlIHNob3VsZCBub3QgYmUgbWF0Y2hlZFxuICovXG5mdW5jdGlvbiBfcXVlcnlOb2RlQ2hpbGRyZW5JbkNvbnRhaW5lcihcbiAgbENvbnRhaW5lcjogTENvbnRhaW5lcixcbiAgcHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB8IFByZWRpY2F0ZTxEZWJ1Z05vZGU+LFxuICBtYXRjaGVzOiBEZWJ1Z0VsZW1lbnRbXSB8IERlYnVnTm9kZVtdLFxuICBlbGVtZW50c09ubHk6IGJvb2xlYW4sXG4gIHJvb3ROYXRpdmVOb2RlOiBhbnksXG4pIHtcbiAgZm9yIChsZXQgaSA9IENPTlRBSU5FUl9IRUFERVJfT0ZGU0VUOyBpIDwgbENvbnRhaW5lci5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoaWxkVmlldyA9IGxDb250YWluZXJbaV0gYXMgTFZpZXc7XG4gICAgY29uc3QgZmlyc3RDaGlsZCA9IGNoaWxkVmlld1tUVklFV10uZmlyc3RDaGlsZDtcbiAgICBpZiAoZmlyc3RDaGlsZCkge1xuICAgICAgX3F1ZXJ5Tm9kZUNoaWxkcmVuKGZpcnN0Q2hpbGQsIGNoaWxkVmlldywgcHJlZGljYXRlLCBtYXRjaGVzLCBlbGVtZW50c09ubHksIHJvb3ROYXRpdmVOb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBNYXRjaCB0aGUgY3VycmVudCBuYXRpdmUgbm9kZSBhZ2FpbnN0IHRoZSBwcmVkaWNhdGUuXG4gKlxuICogQHBhcmFtIG5hdGl2ZU5vZGUgdGhlIGN1cnJlbnQgbmF0aXZlIG5vZGVcbiAqIEBwYXJhbSBwcmVkaWNhdGUgdGhlIHByZWRpY2F0ZSB0byBtYXRjaFxuICogQHBhcmFtIG1hdGNoZXMgdGhlIGxpc3Qgb2YgcG9zaXRpdmUgbWF0Y2hlc1xuICogQHBhcmFtIGVsZW1lbnRzT25seSB3aGV0aGVyIG9ubHkgZWxlbWVudHMgc2hvdWxkIGJlIHNlYXJjaGVkXG4gKiBAcGFyYW0gcm9vdE5hdGl2ZU5vZGUgdGhlIHJvb3QgbmF0aXZlIG5vZGUgb24gd2hpY2ggcHJlZGljYXRlIHNob3VsZCBub3QgYmUgbWF0Y2hlZFxuICovXG5mdW5jdGlvbiBfYWRkUXVlcnlNYXRjaChcbiAgbmF0aXZlTm9kZTogYW55LFxuICBwcmVkaWNhdGU6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+IHwgUHJlZGljYXRlPERlYnVnTm9kZT4sXG4gIG1hdGNoZXM6IERlYnVnRWxlbWVudFtdIHwgRGVidWdOb2RlW10sXG4gIGVsZW1lbnRzT25seTogYm9vbGVhbixcbiAgcm9vdE5hdGl2ZU5vZGU6IGFueSxcbikge1xuICBpZiAocm9vdE5hdGl2ZU5vZGUgIT09IG5hdGl2ZU5vZGUpIHtcbiAgICBjb25zdCBkZWJ1Z05vZGUgPSBnZXREZWJ1Z05vZGUobmF0aXZlTm9kZSk7XG4gICAgaWYgKCFkZWJ1Z05vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVHlwZSBvZiB0aGUgXCJwcmVkaWNhdGUgYW5kIFwibWF0Y2hlc1wiIGFycmF5IGFyZSBzZXQgYmFzZWQgb24gdGhlIHZhbHVlIG9mXG4gICAgLy8gdGhlIFwiZWxlbWVudHNPbmx5XCIgcGFyYW1ldGVyLiBUeXBlU2NyaXB0IGlzIG5vdCBhYmxlIHRvIHByb3Blcmx5IGluZmVyIHRoZXNlXG4gICAgLy8gdHlwZXMgd2l0aCBnZW5lcmljcywgc28gd2UgbWFudWFsbHkgY2FzdCB0aGUgcGFyYW1ldGVycyBhY2NvcmRpbmdseS5cbiAgICBpZiAoXG4gICAgICBlbGVtZW50c09ubHkgJiZcbiAgICAgIGRlYnVnTm9kZSBpbnN0YW5jZW9mIERlYnVnRWxlbWVudCAmJlxuICAgICAgcHJlZGljYXRlKGRlYnVnTm9kZSkgJiZcbiAgICAgIG1hdGNoZXMuaW5kZXhPZihkZWJ1Z05vZGUpID09PSAtMVxuICAgICkge1xuICAgICAgbWF0Y2hlcy5wdXNoKGRlYnVnTm9kZSk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICFlbGVtZW50c09ubHkgJiZcbiAgICAgIChwcmVkaWNhdGUgYXMgUHJlZGljYXRlPERlYnVnTm9kZT4pKGRlYnVnTm9kZSkgJiZcbiAgICAgIChtYXRjaGVzIGFzIERlYnVnTm9kZVtdKS5pbmRleE9mKGRlYnVnTm9kZSkgPT09IC0xXG4gICAgKSB7XG4gICAgICAobWF0Y2hlcyBhcyBEZWJ1Z05vZGVbXSkucHVzaChkZWJ1Z05vZGUpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1hdGNoIGFsbCB0aGUgZGVzY2VuZGFudHMgb2YgYSBET00gbm9kZSBhZ2FpbnN0IGEgcHJlZGljYXRlLlxuICpcbiAqIEBwYXJhbSBuYXRpdmVOb2RlIHRoZSBjdXJyZW50IG5hdGl2ZSBub2RlXG4gKiBAcGFyYW0gcHJlZGljYXRlIHRoZSBwcmVkaWNhdGUgdG8gbWF0Y2hcbiAqIEBwYXJhbSBtYXRjaGVzIHRoZSBsaXN0IHdoZXJlIG1hdGNoZXMgYXJlIHN0b3JlZFxuICogQHBhcmFtIGVsZW1lbnRzT25seSB3aGV0aGVyIG9ubHkgZWxlbWVudHMgc2hvdWxkIGJlIHNlYXJjaGVkXG4gKi9cbmZ1bmN0aW9uIF9xdWVyeU5hdGl2ZU5vZGVEZXNjZW5kYW50cyhcbiAgcGFyZW50Tm9kZTogYW55LFxuICBwcmVkaWNhdGU6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+IHwgUHJlZGljYXRlPERlYnVnTm9kZT4sXG4gIG1hdGNoZXM6IERlYnVnRWxlbWVudFtdIHwgRGVidWdOb2RlW10sXG4gIGVsZW1lbnRzT25seTogYm9vbGVhbixcbikge1xuICBjb25zdCBub2RlcyA9IHBhcmVudE5vZGUuY2hpbGROb2RlcztcbiAgY29uc3QgbGVuZ3RoID0gbm9kZXMubGVuZ3RoO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgY29uc3QgZGVidWdOb2RlID0gZ2V0RGVidWdOb2RlKG5vZGUpO1xuXG4gICAgaWYgKGRlYnVnTm9kZSkge1xuICAgICAgaWYgKFxuICAgICAgICBlbGVtZW50c09ubHkgJiZcbiAgICAgICAgZGVidWdOb2RlIGluc3RhbmNlb2YgRGVidWdFbGVtZW50ICYmXG4gICAgICAgIHByZWRpY2F0ZShkZWJ1Z05vZGUpICYmXG4gICAgICAgIG1hdGNoZXMuaW5kZXhPZihkZWJ1Z05vZGUpID09PSAtMVxuICAgICAgKSB7XG4gICAgICAgIG1hdGNoZXMucHVzaChkZWJ1Z05vZGUpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgIWVsZW1lbnRzT25seSAmJlxuICAgICAgICAocHJlZGljYXRlIGFzIFByZWRpY2F0ZTxEZWJ1Z05vZGU+KShkZWJ1Z05vZGUpICYmXG4gICAgICAgIChtYXRjaGVzIGFzIERlYnVnTm9kZVtdKS5pbmRleE9mKGRlYnVnTm9kZSkgPT09IC0xXG4gICAgICApIHtcbiAgICAgICAgKG1hdGNoZXMgYXMgRGVidWdOb2RlW10pLnB1c2goZGVidWdOb2RlKTtcbiAgICAgIH1cblxuICAgICAgX3F1ZXJ5TmF0aXZlTm9kZURlc2NlbmRhbnRzKG5vZGUsIHByZWRpY2F0ZSwgbWF0Y2hlcywgZWxlbWVudHNPbmx5KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBwcm9wZXJ0eSBiaW5kaW5ncyBmb3IgYSBnaXZlbiBub2RlIGFuZCBnZW5lcmF0ZXNcbiAqIGEgbWFwIG9mIHByb3BlcnR5IG5hbWVzIHRvIHZhbHVlcy4gVGhpcyBtYXAgb25seSBjb250YWlucyBwcm9wZXJ0eSBiaW5kaW5nc1xuICogZGVmaW5lZCBpbiB0ZW1wbGF0ZXMsIG5vdCBpbiBob3N0IGJpbmRpbmdzLlxuICovXG5mdW5jdGlvbiBjb2xsZWN0UHJvcGVydHlCaW5kaW5ncyhcbiAgcHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gIHROb2RlOiBUTm9kZSxcbiAgbFZpZXc6IExWaWV3LFxuICB0RGF0YTogVERhdGEsXG4pOiB2b2lkIHtcbiAgbGV0IGJpbmRpbmdJbmRleGVzID0gdE5vZGUucHJvcGVydHlCaW5kaW5ncztcblxuICBpZiAoYmluZGluZ0luZGV4ZXMgIT09IG51bGwpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmRpbmdJbmRleGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBiaW5kaW5nSW5kZXggPSBiaW5kaW5nSW5kZXhlc1tpXTtcbiAgICAgIGNvbnN0IHByb3BNZXRhZGF0YSA9IHREYXRhW2JpbmRpbmdJbmRleF0gYXMgc3RyaW5nO1xuICAgICAgY29uc3QgbWV0YWRhdGFQYXJ0cyA9IHByb3BNZXRhZGF0YS5zcGxpdChJTlRFUlBPTEFUSU9OX0RFTElNSVRFUik7XG4gICAgICBjb25zdCBwcm9wZXJ0eU5hbWUgPSBtZXRhZGF0YVBhcnRzWzBdO1xuICAgICAgaWYgKG1ldGFkYXRhUGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgdmFsdWUgPSBtZXRhZGF0YVBhcnRzWzFdO1xuICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8IG1ldGFkYXRhUGFydHMubGVuZ3RoIC0gMTsgaisrKSB7XG4gICAgICAgICAgdmFsdWUgKz0gcmVuZGVyU3RyaW5naWZ5KGxWaWV3W2JpbmRpbmdJbmRleCArIGogLSAxXSkgKyBtZXRhZGF0YVBhcnRzW2ogKyAxXTtcbiAgICAgICAgfVxuICAgICAgICBwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IGxWaWV3W2JpbmRpbmdJbmRleF07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIE5lZWQgdG8ga2VlcCB0aGUgbm9kZXMgaW4gYSBnbG9iYWwgTWFwIHNvIHRoYXQgbXVsdGlwbGUgYW5ndWxhciBhcHBzIGFyZSBzdXBwb3J0ZWQuXG5jb25zdCBfbmF0aXZlTm9kZVRvRGVidWdOb2RlID0gbmV3IE1hcDxhbnksIERlYnVnTm9kZT4oKTtcblxuY29uc3QgTkdfREVCVUdfUFJPUEVSVFkgPSAnX19uZ19kZWJ1Z19fJztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWJ1Z05vZGUobmF0aXZlTm9kZTogYW55KTogRGVidWdOb2RlIHwgbnVsbCB7XG4gIGlmIChuYXRpdmVOb2RlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgIGlmICghbmF0aXZlTm9kZS5oYXNPd25Qcm9wZXJ0eShOR19ERUJVR19QUk9QRVJUWSkpIHtcbiAgICAgIChuYXRpdmVOb2RlIGFzIGFueSlbTkdfREVCVUdfUFJPUEVSVFldID1cbiAgICAgICAgbmF0aXZlTm9kZS5ub2RlVHlwZSA9PSBOb2RlLkVMRU1FTlRfTk9ERVxuICAgICAgICAgID8gbmV3IERlYnVnRWxlbWVudChuYXRpdmVOb2RlIGFzIEVsZW1lbnQpXG4gICAgICAgICAgOiBuZXcgRGVidWdOb2RlKG5hdGl2ZU5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gKG5hdGl2ZU5vZGUgYXMgYW55KVtOR19ERUJVR19QUk9QRVJUWV07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZWJ1Z05vZGVzKCk6IERlYnVnTm9kZVtdIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oX25hdGl2ZU5vZGVUb0RlYnVnTm9kZS52YWx1ZXMoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmRleERlYnVnTm9kZShub2RlOiBEZWJ1Z05vZGUpIHtcbiAgX25hdGl2ZU5vZGVUb0RlYnVnTm9kZS5zZXQobm9kZS5uYXRpdmVOb2RlLCBub2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZURlYnVnTm9kZUZyb21JbmRleChub2RlOiBEZWJ1Z05vZGUpIHtcbiAgX25hdGl2ZU5vZGVUb0RlYnVnTm9kZS5kZWxldGUobm9kZS5uYXRpdmVOb2RlKTtcbn1cblxuLyoqXG4gKiBBIGJvb2xlYW4tdmFsdWVkIGZ1bmN0aW9uIG92ZXIgYSB2YWx1ZSwgcG9zc2libHkgaW5jbHVkaW5nIGNvbnRleHQgaW5mb3JtYXRpb25cbiAqIHJlZ2FyZGluZyB0aGF0IHZhbHVlJ3MgcG9zaXRpb24gaW4gYW4gYXJyYXkuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBQcmVkaWNhdGU8VD4gPSAodmFsdWU6IFQpID0+IGJvb2xlYW47XG4iXX0=
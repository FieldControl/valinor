/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../util/ng_dev_mode';
import { assertDefined, assertEqual, assertNotEqual } from '../util/assert';
import { classIndexOf } from './styling/class_differ';
import { isNameOnlyAttributeMarker } from './util/attrs_utils';
const NG_TEMPLATE_SELECTOR = 'ng-template';
/**
 * Search the `TAttributes` to see if it contains `cssClassToMatch` (case insensitive)
 *
 * @param tNode static data of the node to match
 * @param attrs `TAttributes` to search through.
 * @param cssClassToMatch class to match (lowercase)
 * @param isProjectionMode Whether or not class matching should look into the attribute `class` in
 *    addition to the `AttributeMarker.Classes`.
 */
function isCssClassMatching(tNode, attrs, cssClassToMatch, isProjectionMode) {
    ngDevMode &&
        assertEqual(cssClassToMatch, cssClassToMatch.toLowerCase(), 'Class name expected to be lowercase.');
    let i = 0;
    if (isProjectionMode) {
        for (; i < attrs.length && typeof attrs[i] === 'string'; i += 2) {
            // Search for an implicit `class` attribute and check if its value matches `cssClassToMatch`.
            if (attrs[i] === 'class' &&
                classIndexOf(attrs[i + 1].toLowerCase(), cssClassToMatch, 0) !== -1) {
                return true;
            }
        }
    }
    else if (isInlineTemplate(tNode)) {
        // Matching directives (i.e. when not matching for projection mode) should not consider the
        // class bindings that are present on inline templates, as those class bindings only target
        // the root node of the template, not the template itself.
        return false;
    }
    // Resume the search for classes after the `Classes` marker.
    i = attrs.indexOf(1 /* AttributeMarker.Classes */, i);
    if (i > -1) {
        // We found the classes section. Start searching for the class.
        let item;
        while (++i < attrs.length && typeof (item = attrs[i]) === 'string') {
            if (item.toLowerCase() === cssClassToMatch) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Checks whether the `tNode` represents an inline template (e.g. `*ngFor`).
 *
 * @param tNode current TNode
 */
export function isInlineTemplate(tNode) {
    return tNode.type === 4 /* TNodeType.Container */ && tNode.value !== NG_TEMPLATE_SELECTOR;
}
/**
 * Function that checks whether a given tNode matches tag-based selector and has a valid type.
 *
 * Matching can be performed in 2 modes: projection mode (when we project nodes) and regular
 * directive matching mode:
 * - in the "directive matching" mode we do _not_ take TContainer's tagName into account if it is
 * different from NG_TEMPLATE_SELECTOR (value different from NG_TEMPLATE_SELECTOR indicates that a
 * tag name was extracted from * syntax so we would match the same directive twice);
 * - in the "projection" mode, we use a tag name potentially extracted from the * syntax processing
 * (applicable to TNodeType.Container only).
 */
function hasTagAndTypeMatch(tNode, currentSelector, isProjectionMode) {
    const tagNameToCompare = tNode.type === 4 /* TNodeType.Container */ && !isProjectionMode ? NG_TEMPLATE_SELECTOR : tNode.value;
    return currentSelector === tagNameToCompare;
}
/**
 * A utility function to match an Ivy node static data against a simple CSS selector
 *
 * @param tNode static data of the node to match
 * @param selector The selector to try matching against the node.
 * @param isProjectionMode if `true` we are matching for content projection, otherwise we are doing
 * directive matching.
 * @returns true if node matches the selector.
 */
export function isNodeMatchingSelector(tNode, selector, isProjectionMode) {
    ngDevMode && assertDefined(selector[0], 'Selector should have a tag name');
    let mode = 4 /* SelectorFlags.ELEMENT */;
    const nodeAttrs = tNode.attrs;
    // Find the index of first attribute that has no value, only a name.
    const nameOnlyMarkerIdx = nodeAttrs !== null ? getNameOnlyMarkerIndex(nodeAttrs) : 0;
    // When processing ":not" selectors, we skip to the next ":not" if the
    // current one doesn't match
    let skipToNextSelector = false;
    for (let i = 0; i < selector.length; i++) {
        const current = selector[i];
        if (typeof current === 'number') {
            // If we finish processing a :not selector and it hasn't failed, return false
            if (!skipToNextSelector && !isPositive(mode) && !isPositive(current)) {
                return false;
            }
            // If we are skipping to the next :not() and this mode flag is positive,
            // it's a part of the current :not() selector, and we should keep skipping
            if (skipToNextSelector && isPositive(current))
                continue;
            skipToNextSelector = false;
            mode = current | (mode & 1 /* SelectorFlags.NOT */);
            continue;
        }
        if (skipToNextSelector)
            continue;
        if (mode & 4 /* SelectorFlags.ELEMENT */) {
            mode = 2 /* SelectorFlags.ATTRIBUTE */ | (mode & 1 /* SelectorFlags.NOT */);
            if ((current !== '' && !hasTagAndTypeMatch(tNode, current, isProjectionMode)) ||
                (current === '' && selector.length === 1)) {
                if (isPositive(mode))
                    return false;
                skipToNextSelector = true;
            }
        }
        else if (mode & 8 /* SelectorFlags.CLASS */) {
            if (nodeAttrs === null || !isCssClassMatching(tNode, nodeAttrs, current, isProjectionMode)) {
                if (isPositive(mode))
                    return false;
                skipToNextSelector = true;
            }
        }
        else {
            const selectorAttrValue = selector[++i];
            const attrIndexInNode = findAttrIndexInNode(current, nodeAttrs, isInlineTemplate(tNode), isProjectionMode);
            if (attrIndexInNode === -1) {
                if (isPositive(mode))
                    return false;
                skipToNextSelector = true;
                continue;
            }
            if (selectorAttrValue !== '') {
                let nodeAttrValue;
                if (attrIndexInNode > nameOnlyMarkerIdx) {
                    nodeAttrValue = '';
                }
                else {
                    ngDevMode &&
                        assertNotEqual(nodeAttrs[attrIndexInNode], 0 /* AttributeMarker.NamespaceURI */, 'We do not match directives on namespaced attributes');
                    // we lowercase the attribute value to be able to match
                    // selectors without case-sensitivity
                    // (selectors are already in lowercase when generated)
                    nodeAttrValue = nodeAttrs[attrIndexInNode + 1].toLowerCase();
                }
                if (mode & 2 /* SelectorFlags.ATTRIBUTE */ && selectorAttrValue !== nodeAttrValue) {
                    if (isPositive(mode))
                        return false;
                    skipToNextSelector = true;
                }
            }
        }
    }
    return isPositive(mode) || skipToNextSelector;
}
function isPositive(mode) {
    return (mode & 1 /* SelectorFlags.NOT */) === 0;
}
/**
 * Examines the attribute's definition array for a node to find the index of the
 * attribute that matches the given `name`.
 *
 * NOTE: This will not match namespaced attributes.
 *
 * Attribute matching depends upon `isInlineTemplate` and `isProjectionMode`.
 * The following table summarizes which types of attributes we attempt to match:
 *
 * ===========================================================================================================
 * Modes                   | Normal Attributes | Bindings Attributes | Template Attributes | I18n
 * Attributes
 * ===========================================================================================================
 * Inline + Projection     | YES               | YES                 | NO                  | YES
 * -----------------------------------------------------------------------------------------------------------
 * Inline + Directive      | NO                | NO                  | YES                 | NO
 * -----------------------------------------------------------------------------------------------------------
 * Non-inline + Projection | YES               | YES                 | NO                  | YES
 * -----------------------------------------------------------------------------------------------------------
 * Non-inline + Directive  | YES               | YES                 | NO                  | YES
 * ===========================================================================================================
 *
 * @param name the name of the attribute to find
 * @param attrs the attribute array to examine
 * @param isInlineTemplate true if the node being matched is an inline template (e.g. `*ngFor`)
 * rather than a manually expanded template node (e.g `<ng-template>`).
 * @param isProjectionMode true if we are matching against content projection otherwise we are
 * matching against directives.
 */
function findAttrIndexInNode(name, attrs, isInlineTemplate, isProjectionMode) {
    if (attrs === null)
        return -1;
    let i = 0;
    if (isProjectionMode || !isInlineTemplate) {
        let bindingsMode = false;
        while (i < attrs.length) {
            const maybeAttrName = attrs[i];
            if (maybeAttrName === name) {
                return i;
            }
            else if (maybeAttrName === 3 /* AttributeMarker.Bindings */ ||
                maybeAttrName === 6 /* AttributeMarker.I18n */) {
                bindingsMode = true;
            }
            else if (maybeAttrName === 1 /* AttributeMarker.Classes */ ||
                maybeAttrName === 2 /* AttributeMarker.Styles */) {
                let value = attrs[++i];
                // We should skip classes here because we have a separate mechanism for
                // matching classes in projection mode.
                while (typeof value === 'string') {
                    value = attrs[++i];
                }
                continue;
            }
            else if (maybeAttrName === 4 /* AttributeMarker.Template */) {
                // We do not care about Template attributes in this scenario.
                break;
            }
            else if (maybeAttrName === 0 /* AttributeMarker.NamespaceURI */) {
                // Skip the whole namespaced attribute and value. This is by design.
                i += 4;
                continue;
            }
            // In binding mode there are only names, rather than name-value pairs.
            i += bindingsMode ? 1 : 2;
        }
        // We did not match the attribute
        return -1;
    }
    else {
        return matchTemplateAttribute(attrs, name);
    }
}
export function isNodeMatchingSelectorList(tNode, selector, isProjectionMode = false) {
    for (let i = 0; i < selector.length; i++) {
        if (isNodeMatchingSelector(tNode, selector[i], isProjectionMode)) {
            return true;
        }
    }
    return false;
}
export function getProjectAsAttrValue(tNode) {
    const nodeAttrs = tNode.attrs;
    if (nodeAttrs != null) {
        const ngProjectAsAttrIdx = nodeAttrs.indexOf(5 /* AttributeMarker.ProjectAs */);
        // only check for ngProjectAs in attribute names, don't accidentally match attribute's value
        // (attribute names are stored at even indexes)
        if ((ngProjectAsAttrIdx & 1) === 0) {
            return nodeAttrs[ngProjectAsAttrIdx + 1];
        }
    }
    return null;
}
function getNameOnlyMarkerIndex(nodeAttrs) {
    for (let i = 0; i < nodeAttrs.length; i++) {
        const nodeAttr = nodeAttrs[i];
        if (isNameOnlyAttributeMarker(nodeAttr)) {
            return i;
        }
    }
    return nodeAttrs.length;
}
function matchTemplateAttribute(attrs, name) {
    let i = attrs.indexOf(4 /* AttributeMarker.Template */);
    if (i > -1) {
        i++;
        while (i < attrs.length) {
            const attr = attrs[i];
            // Return in case we checked all template attrs and are switching to the next section in the
            // attrs array (that starts with a number that represents an attribute marker).
            if (typeof attr === 'number')
                return -1;
            if (attr === name)
                return i;
            i++;
        }
    }
    return -1;
}
/**
 * Checks whether a selector is inside a CssSelectorList
 * @param selector Selector to be checked.
 * @param list List in which to look for the selector.
 */
export function isSelectorInSelectorList(selector, list) {
    selectorListLoop: for (let i = 0; i < list.length; i++) {
        const currentSelectorInList = list[i];
        if (selector.length !== currentSelectorInList.length) {
            continue;
        }
        for (let j = 0; j < selector.length; j++) {
            if (selector[j] !== currentSelectorInList[j]) {
                continue selectorListLoop;
            }
        }
        return true;
    }
    return false;
}
function maybeWrapInNotSelector(isNegativeMode, chunk) {
    return isNegativeMode ? ':not(' + chunk.trim() + ')' : chunk;
}
function stringifyCSSSelector(selector) {
    let result = selector[0];
    let i = 1;
    let mode = 2 /* SelectorFlags.ATTRIBUTE */;
    let currentChunk = '';
    let isNegativeMode = false;
    while (i < selector.length) {
        let valueOrMarker = selector[i];
        if (typeof valueOrMarker === 'string') {
            if (mode & 2 /* SelectorFlags.ATTRIBUTE */) {
                const attrValue = selector[++i];
                currentChunk +=
                    '[' + valueOrMarker + (attrValue.length > 0 ? '="' + attrValue + '"' : '') + ']';
            }
            else if (mode & 8 /* SelectorFlags.CLASS */) {
                currentChunk += '.' + valueOrMarker;
            }
            else if (mode & 4 /* SelectorFlags.ELEMENT */) {
                currentChunk += ' ' + valueOrMarker;
            }
        }
        else {
            //
            // Append current chunk to the final result in case we come across SelectorFlag, which
            // indicates that the previous section of a selector is over. We need to accumulate content
            // between flags to make sure we wrap the chunk later in :not() selector if needed, e.g.
            // ```
            //  ['', Flags.CLASS, '.classA', Flags.CLASS | Flags.NOT, '.classB', '.classC']
            // ```
            // should be transformed to `.classA :not(.classB .classC)`.
            //
            // Note: for negative selector part, we accumulate content between flags until we find the
            // next negative flag. This is needed to support a case where `:not()` rule contains more than
            // one chunk, e.g. the following selector:
            // ```
            //  ['', Flags.ELEMENT | Flags.NOT, 'p', Flags.CLASS, 'foo', Flags.CLASS | Flags.NOT, 'bar']
            // ```
            // should be stringified to `:not(p.foo) :not(.bar)`
            //
            if (currentChunk !== '' && !isPositive(valueOrMarker)) {
                result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
                currentChunk = '';
            }
            mode = valueOrMarker;
            // According to CssSelector spec, once we come across `SelectorFlags.NOT` flag, the negative
            // mode is maintained for remaining chunks of a selector.
            isNegativeMode = isNegativeMode || !isPositive(mode);
        }
        i++;
    }
    if (currentChunk !== '') {
        result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
    }
    return result;
}
/**
 * Generates string representation of CSS selector in parsed form.
 *
 * ComponentDef and DirectiveDef are generated with the selector in parsed form to avoid doing
 * additional parsing at runtime (for example, for directive matching). However in some cases (for
 * example, while bootstrapping a component), a string version of the selector is required to query
 * for the host element on the page. This function takes the parsed form of a selector and returns
 * its string representation.
 *
 * @param selectorList selector in parsed form
 * @returns string representation of a given selector
 */
export function stringifyCSSSelectorList(selectorList) {
    return selectorList.map(stringifyCSSSelector).join(',');
}
/**
 * Extracts attributes and classes information from a given CSS selector.
 *
 * This function is used while creating a component dynamically. In this case, the host element
 * (that is created dynamically) should contain attributes and classes specified in component's CSS
 * selector.
 *
 * @param selector CSS selector in parsed form (in a form of array)
 * @returns object with `attrs` and `classes` fields that contain extracted information
 */
export function extractAttrsAndClassesFromSelector(selector) {
    const attrs = [];
    const classes = [];
    let i = 1;
    let mode = 2 /* SelectorFlags.ATTRIBUTE */;
    while (i < selector.length) {
        let valueOrMarker = selector[i];
        if (typeof valueOrMarker === 'string') {
            if (mode === 2 /* SelectorFlags.ATTRIBUTE */) {
                if (valueOrMarker !== '') {
                    attrs.push(valueOrMarker, selector[++i]);
                }
            }
            else if (mode === 8 /* SelectorFlags.CLASS */) {
                classes.push(valueOrMarker);
            }
        }
        else {
            // According to CssSelector spec, once we come across `SelectorFlags.NOT` flag, the negative
            // mode is maintained for remaining chunks of a selector. Since attributes and classes are
            // extracted only for "positive" part of the selector, we can stop here.
            if (!isPositive(mode))
                break;
            mode = valueOrMarker;
        }
        i++;
    }
    return { attrs, classes };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9zZWxlY3Rvcl9tYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9ub2RlX3NlbGVjdG9yX21hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxxQkFBcUIsQ0FBQztBQUU3QixPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUsxRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFN0QsTUFBTSxvQkFBb0IsR0FBRyxhQUFhLENBQUM7QUFFM0M7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFTLGtCQUFrQixDQUN6QixLQUFZLEVBQ1osS0FBa0IsRUFDbEIsZUFBdUIsRUFDdkIsZ0JBQXlCO0lBRXpCLFNBQVM7UUFDUCxXQUFXLENBQ1QsZUFBZSxFQUNmLGVBQWUsQ0FBQyxXQUFXLEVBQUUsRUFDN0Isc0NBQXNDLENBQ3ZDLENBQUM7SUFDSixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLGdCQUFnQixFQUFFLENBQUM7UUFDckIsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2hFLDZGQUE2RjtZQUM3RixJQUNFLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPO2dCQUNwQixZQUFZLENBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQVksQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQy9FLENBQUM7Z0JBQ0QsT0FBTyxJQUFJ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VUFBVSxrQ0FBa0MsQ0FBQyxRQUFxQjtJQUl0RSxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO0lBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLElBQUksSUFBSSxrQ0FBMEIsQ0FBQztJQUNuQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBSSxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksT0FBTyxhQUFhLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsSUFBSSxJQUFJLG9DQUE0QixFQUFFLENBQUM7Z0JBQ3JDLElBQUksYUFBYSxLQUFLLEVBQUUsRUFBRSxDQUFDO29CQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQVcsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO1lBQ0gsQ0FBQztpQkFBTSxJQUFJLElBQUksZ0NBQXdCLEVBQUUsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTiw0RkFBNEY7WUFDNUYsMEZBQTBGO1lBQzFGLHdFQUF3RTtZQUN4RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztnQkFBRSxNQUFNO1lBQzdCLElBQUksR0FBRyxhQUFhLENBQUM7UUFDdkIsQ0FBQztRQUNELENBQUMsRUFBRSxDQUFDO0lBQ04sQ0FBQztJQUNELE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7QUFDMUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICcuLi91dGlsL25nX2Rldl9tb2RlJztcblxuaW1wb3J0IHthc3NlcnREZWZpbmVkLCBhc3NlcnRFcXVhbCwgYXNzZXJ0Tm90RXF1YWx9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcblxuaW1wb3J0IHtBdHRyaWJ1dGVNYXJrZXJ9IGZyb20gJy4vaW50ZXJmYWNlcy9hdHRyaWJ1dGVfbWFya2VyJztcbmltcG9ydCB7VEF0dHJpYnV0ZXMsIFROb2RlLCBUTm9kZVR5cGV9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7Q3NzU2VsZWN0b3IsIENzc1NlbGVjdG9yTGlzdCwgU2VsZWN0b3JGbGFnc30gZnJvbSAnLi9pbnRlcmZhY2VzL3Byb2plY3Rpb24nO1xuaW1wb3J0IHtjbGFzc0luZGV4T2Z9IGZyb20gJy4vc3R5bGluZy9jbGFzc19kaWZmZXInO1xuaW1wb3J0IHtpc05hbWVPbmx5QXR0cmlidXRlTWFya2VyfSBmcm9tICcuL3V0aWwvYXR0cnNfdXRpbHMnO1xuXG5jb25zdCBOR19URU1QTEFURV9TRUxFQ1RPUiA9ICduZy10ZW1wbGF0ZSc7XG5cbi8qKlxuICogU2VhcmNoIHRoZSBgVEF0dHJpYnV0ZXNgIHRvIHNlZSBpZiBpdCBjb250YWlucyBgY3NzQ2xhc3NUb01hdGNoYCAoY2FzZSBpbnNlbnNpdGl2ZSlcbiAqXG4gKiBAcGFyYW0gdE5vZGUgc3RhdGljIGRhdGEgb2YgdGhlIG5vZGUgdG8gbWF0Y2hcbiAqIEBwYXJhbSBhdHRycyBgVEF0dHJpYnV0ZXNgIHRvIHNlYXJjaCB0aHJvdWdoLlxuICogQHBhcmFtIGNzc0NsYXNzVG9NYXRjaCBjbGFzcyB0byBtYXRjaCAobG93ZXJjYXNlKVxuICogQHBhcmFtIGlzUHJvamVjdGlvbk1vZGUgV2hldGhlciBvciBub3QgY2xhc3MgbWF0Y2hpbmcgc2hvdWxkIGxvb2sgaW50byB0aGUgYXR0cmlidXRlIGBjbGFzc2AgaW5cbiAqICAgIGFkZGl0aW9uIHRvIHRoZSBgQXR0cmlidXRlTWFya2VyLkNsYXNzZXNgLlxuICovXG5mdW5jdGlvbiBpc0Nzc0NsYXNzTWF0Y2hpbmcoXG4gIHROb2RlOiBUTm9kZSxcbiAgYXR0cnM6IFRBdHRyaWJ1dGVzLFxuICBjc3NDbGFzc1RvTWF0Y2g6IHN0cmluZyxcbiAgaXNQcm9qZWN0aW9uTW9kZTogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnRFcXVhbChcbiAgICAgIGNzc0NsYXNzVG9NYXRjaCxcbiAgICAgIGNzc0NsYXNzVG9NYXRjaC50b0xvd2VyQ2FzZSgpLFxuICAgICAgJ0NsYXNzIG5hbWUgZXhwZWN0ZWQgdG8gYmUgbG93ZXJjYXNlLicsXG4gICAgKTtcbiAgbGV0IGkgPSAwO1xuICBpZiAoaXNQcm9qZWN0aW9uTW9kZSkge1xuICAgIGZvciAoOyBpIDwgYXR0cnMubGVuZ3RoICYmIHR5cGVvZiBhdHRyc1tpXSA9PT0gJ3N0cmluZyc7IGkgKz0gMikge1xuICAgICAgLy8gU2VhcmNoIGZvciBhbiBpbXBsaWNpdCBgY2xhc3NgIGF0dHJpYnV0ZSBhbmQgY2hlY2sgaWYgaXRzIHZhbHVlIG1hdGNoZXMgYGNzc0NsYXNzVG9NYXRjaGAuXG4gICAgICBpZiAoXG4gICAgICAgIGF0dHJzW2ldID09PSAnY2xhc3MnICYmXG4gICAgICAgIGNsYXNzSW5kZXhPZigoYXR0cnNbaSArIDFdIGFzIHN0cmluZykudG9Mb3dlckNhc2UoKSwgY3NzQ2xhc3NUb01hdGNoLCAwKSAhPT0gLTFcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNJbmxpbmVUZW1wbGF0ZSh0Tm9kZSkpIHtcbiAgICAvLyBNYXRjaGluZyBkaXJlY3RpdmVzIChpLmUuIHdoZW4gbm90IG1hdGNoaW5nIGZvciBwcm9qZWN0aW9uIG1vZGUpIHNob3VsZCBub3QgY29uc2lkZXIgdGhlXG4gICAgLy8gY2xhc3MgYmluZGluZ3MgdGhhdCBhcmUgcHJlc2VudCBvbiBpbmxpbmUgdGVtcGxhdGVzLCBhcyB0aG9zZSBjbGFzcyBiaW5kaW5ncyBvbmx5IHRhcmdldFxuICAgIC8vIHRoZSByb290IG5vZGUgb2YgdGhlIHRlbXBsYXRlLCBub3QgdGhlIHRlbXBsYXRlIGl0c2VsZi5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBSZXN1bWUgdGhlIHNlYXJjaCBmb3IgY2xhc3NlcyBhZnRlciB0aGUgYENsYXNzZXNgIG1hcmtlci5cbiAgaSA9IGF0dHJzLmluZGV4T2YoQXR0cmlidXRlTWFya2VyLkNsYXNzZXMsIGkpO1xuICBpZiAoaSA+IC0xKSB7XG4gICAgLy8gV2UgZm91bmQgdGhlIGNsYXNzZXMgc2VjdGlvbi4gU3RhcnQgc2VhcmNoaW5nIGZvciB0aGUgY2xhc3MuXG4gICAgbGV0IGl0ZW06IFRBdHRyaWJ1dGVzW251bWJlcl07XG4gICAgd2hpbGUgKCsraSA8IGF0dHJzLmxlbmd0aCAmJiB0eXBlb2YgKGl0ZW0gPSBhdHRyc1tpXSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoaXRlbS50b0xvd2VyQ2FzZSgpID09PSBjc3NDbGFzc1RvTWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYHROb2RlYCByZXByZXNlbnRzIGFuIGlubGluZSB0ZW1wbGF0ZSAoZS5nLiBgKm5nRm9yYCkuXG4gKlxuICogQHBhcmFtIHROb2RlIGN1cnJlbnQgVE5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSW5saW5lVGVtcGxhdGUodE5vZGU6IFROb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiB0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuQ29udGFpbmVyICYmIHROb2RlLnZhbHVlICE9PSBOR19URU1QTEFURV9TRUxFQ1RPUjtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGNoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gdE5vZGUgbWF0Y2hlcyB0YWctYmFzZWQgc2VsZWN0b3IgYW5kIGhhcyBhIHZhbGlkIHR5cGUuXG4gKlxuICogTWF0Y2hpbmcgY2FuIGJlIHBlcmZvcm1lZCBpbiAyIG1vZGVzOiBwcm9qZWN0aW9uIG1vZGUgKHdoZW4gd2UgcHJvamVjdCBub2RlcykgYW5kIHJlZ3VsYXJcbiAqIGRpcmVjdGl2ZSBtYXRjaGluZyBtb2RlOlxuICogLSBpbiB0aGUgXCJkaXJlY3RpdmUgbWF0Y2hpbmdcIiBtb2RlIHdlIGRvIF9ub3RfIHRha2UgVENvbnRhaW5lcidzIHRhZ05hbWUgaW50byBhY2NvdW50IGlmIGl0IGlzXG4gKiBkaWZmZXJlbnQgZnJvbSBOR19URU1QTEFURV9TRUxFQ1RPUiAodmFsdWUgZGlmZmVyZW50IGZyb20gTkdfVEVNUExBVEVfU0VMRUNUT1IgaW5kaWNhdGVzIHRoYXQgYVxuICogdGFnIG5hbWUgd2FzIGV4dHJhY3RlZCBmcm9tICogc3ludGF4IHNvIHdlIHdvdWxkIG1hdGNoIHRoZSBzYW1lIGRpcmVjdGl2ZSB0d2ljZSk7XG4gKiAtIGluIHRoZSBcInByb2plY3Rpb25cIiBtb2RlLCB3ZSB1c2UgYSB0YWcgbmFtZSBwb3RlbnRpYWxseSBleHRyYWN0ZWQgZnJvbSB0aGUgKiBzeW50YXggcHJvY2Vzc2luZ1xuICogKGFwcGxpY2FibGUgdG8gVE5vZGVUeXBlLkNvbnRhaW5lciBvbmx5KS5cbiAqL1xuZnVuY3Rpb24gaGFzVGFnQW5kVHlwZU1hdGNoKFxuICB0Tm9kZTogVE5vZGUsXG4gIGN1cnJlbnRTZWxlY3Rvcjogc3RyaW5nLFxuICBpc1Byb2plY3Rpb25Nb2RlOiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHRhZ05hbWVUb0NvbXBhcmUgPVxuICAgIHROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5Db250YWluZXIgJiYgIWlzUHJvamVjdGlvbk1vZGUgPyBOR19URU1QTEFURV9TRUxFQ1RPUiA6IHROb2RlLnZhbHVlO1xuICByZXR1cm4gY3VycmVudFNlbGVjdG9yID09PSB0YWdOYW1lVG9Db21wYXJlO1xufVxuXG4vKipcbiAqIEEgdXRpbGl0eSBmdW5jdGlvbiB0byBtYXRjaCBhbiBJdnkgbm9kZSBzdGF0aWMgZGF0YSBhZ2FpbnN0IGEgc2ltcGxlIENTUyBzZWxlY3RvclxuICpcbiAqIEBwYXJhbSB0Tm9kZSBzdGF0aWMgZGF0YSBvZiB0aGUgbm9kZSB0byBtYXRjaFxuICogQHBhcmFtIHNlbGVjdG9yIFRoZSBzZWxlY3RvciB0byB0cnkgbWF0Y2hpbmcgYWdhaW5zdCB0aGUgbm9kZS5cbiAqIEBwYXJhbSBpc1Byb2plY3Rpb25Nb2RlIGlmIGB0cnVlYCB3ZSBhcmUgbWF0Y2hpbmcgZm9yIGNvbnRlbnQgcHJvamVjdGlvbiwgb3RoZXJ3aXNlIHdlIGFyZSBkb2luZ1xuICogZGlyZWN0aXZlIG1hdGNoaW5nLlxuICogQHJldHVybnMgdHJ1ZSBpZiBub2RlIG1hdGNoZXMgdGhlIHNlbGVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlTWF0Y2hpbmdTZWxlY3RvcihcbiAgdE5vZGU6IFROb2RlLFxuICBzZWxlY3RvcjogQ3NzU2VsZWN0b3IsXG4gIGlzUHJvamVjdGlvbk1vZGU6IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoc2VsZWN0b3JbMF0sICdTZWxlY3RvciBzaG91bGQgaGF2ZSBhIHRhZyBuYW1lJyk7XG4gIGxldCBtb2RlOiBTZWxlY3RvckZsYWdzID0gU2VsZWN0b3JGbGFncy5FTEVNRU5UO1xuICBjb25zdCBub2RlQXR0cnMgPSB0Tm9kZS5hdHRycztcblxuICAvLyBGaW5kIHRoZSBpbmRleCBvZiBmaXJzdCBhdHRyaWJ1dGUgdGhhdCBoYXMgbm8gdmFsdWUsIG9ubHkgYSBuYW1lLlxuICBjb25zdCBuYW1lT25seU1hcmtlcklkeCA9IG5vZGVBdHRycyAhPT0gbnVsbCA/IGdldE5hbWVPbmx5TWFya2VySW5kZXgobm9kZUF0dHJzKSA6IDA7XG5cbiAgLy8gV2hlbiBwcm9jZXNzaW5nIFwiOm5vdFwiIHNlbGVjdG9ycywgd2Ugc2tpcCB0byB0aGUgbmV4dCBcIjpub3RcIiBpZiB0aGVcbiAgLy8gY3VycmVudCBvbmUgZG9lc24ndCBtYXRjaFxuICBsZXQgc2tpcFRvTmV4dFNlbGVjdG9yID0gZmFsc2U7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBzZWxlY3RvcltpXTtcbiAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBJZiB3ZSBmaW5pc2ggcHJvY2Vzc2luZyBhIDpub3Qgc2VsZWN0b3IgYW5kIGl0IGhhc24ndCBmYWlsZWQsIHJldHVybiBmYWxzZVxuICAgICAgaWYgKCFza2lwVG9OZXh0U2VsZWN0b3IgJiYgIWlzUG9zaXRpdmUobW9kZSkgJiYgIWlzUG9zaXRpdmUoY3VycmVudCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgYXJlIHNraXBwaW5nIHRvIHRoZSBuZXh0IDpub3QoKSBhbmQgdGhpcyBtb2RlIGZsYWcgaXMgcG9zaXRpdmUsXG4gICAgICAvLyBpdCdzIGEgcGFydCBvZiB0aGUgY3VycmVudCA6bm90KCkgc2VsZWN0b3IsIGFuZCB3ZSBzaG91bGQga2VlcCBza2lwcGluZ1xuICAgICAgaWYgKHNraXBUb05leHRTZWxlY3RvciAmJiBpc1Bvc2l0aXZlKGN1cnJlbnQpKSBjb250aW51ZTtcbiAgICAgIHNraXBUb05leHRTZWxlY3RvciA9IGZhbHNlO1xuICAgICAgbW9kZSA9IChjdXJyZW50IGFzIG51bWJlcikgfCAobW9kZSAmIFNlbGVjdG9yRmxhZ3MuTk9UKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChza2lwVG9OZXh0U2VsZWN0b3IpIGNvbnRpbnVlO1xuXG4gICAgaWYgKG1vZGUgJiBTZWxlY3RvckZsYWdzLkVMRU1FTlQpIHtcbiAgICAgIG1vZGUgPSBTZWxlY3RvckZsYWdzLkFUVFJJQlVURSB8IChtb2RlICYgU2VsZWN0b3JGbGFncy5OT1QpO1xuICAgICAgaWYgKFxuICAgICAgICAoY3VycmVudCAhPT0gJycgJiYgIWhhc1RhZ0FuZFR5cGVNYXRjaCh0Tm9kZSwgY3VycmVudCwgaXNQcm9qZWN0aW9uTW9kZSkpIHx8XG4gICAgICAgIChjdXJyZW50ID09PSAnJyAmJiBzZWxlY3Rvci5sZW5ndGggPT09IDEpXG4gICAgICApIHtcbiAgICAgICAgaWYgKGlzUG9zaXRpdmUobW9kZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc2tpcFRvTmV4dFNlbGVjdG9yID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG1vZGUgJiBTZWxlY3RvckZsYWdzLkNMQVNTKSB7XG4gICAgICBpZiAobm9kZUF0dHJzID09PSBudWxsIHx8ICFpc0Nzc0NsYXNzTWF0Y2hpbmcodE5vZGUsIG5vZGVBdHRycywgY3VycmVudCwgaXNQcm9qZWN0aW9uTW9kZSkpIHtcbiAgICAgICAgaWYgKGlzUG9zaXRpdmUobW9kZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc2tpcFRvTmV4dFNlbGVjdG9yID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2VsZWN0b3JBdHRyVmFsdWUgPSBzZWxlY3RvclsrK2ldO1xuICAgICAgY29uc3QgYXR0ckluZGV4SW5Ob2RlID0gZmluZEF0dHJJbmRleEluTm9kZShcbiAgICAgICAgY3VycmVudCxcbiAgICAgICAgbm9kZUF0dHJzLFxuICAgICAgICBpc0lubGluZVRlbXBsYXRlKHROb2RlKSxcbiAgICAgICAgaXNQcm9qZWN0aW9uTW9kZSxcbiAgICAgICk7XG5cbiAgICAgIGlmIChhdHRySW5kZXhJbk5vZGUgPT09IC0xKSB7XG4gICAgICAgIGlmIChpc1Bvc2l0aXZlKG1vZGUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHNraXBUb05leHRTZWxlY3RvciA9IHRydWU7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZWN0b3JBdHRyVmFsdWUgIT09ICcnKSB7XG4gICAgICAgIGxldCBub2RlQXR0clZhbHVlOiBzdHJpbmc7XG4gICAgICAgIGlmIChhdHRySW5kZXhJbk5vZGUgPiBuYW1lT25seU1hcmtlcklkeCkge1xuICAgICAgICAgIG5vZGVBdHRyVmFsdWUgPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgIGFzc2VydE5vdEVxdWFsKFxuICAgICAgICAgICAgICBub2RlQXR0cnMhW2F0dHJJbmRleEluTm9kZV0sXG4gICAgICAgICAgICAgIEF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkksXG4gICAgICAgICAgICAgICdXZSBkbyBub3QgbWF0Y2ggZGlyZWN0aXZlcyBvbiBuYW1lc3BhY2VkIGF0dHJpYnV0ZXMnLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAvLyB3ZSBsb3dlcmNhc2UgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBiZSBhYmxlIHRvIG1hdGNoXG4gICAgICAgICAgLy8gc2VsZWN0b3JzIHdpdGhvdXQgY2FzZS1zZW5zaXRpdml0eVxuICAgICAgICAgIC8vIChzZWxlY3RvcnMgYXJlIGFscmVhZHkgaW4gbG93ZXJjYXNlIHdoZW4gZ2VuZXJhdGVkKVxuICAgICAgICAgIG5vZGVBdHRyVmFsdWUgPSAobm9kZUF0dHJzIVthdHRySW5kZXhJbk5vZGUgKyAxXSBhcyBzdHJpbmcpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9kZSAmIFNlbGVjdG9yRmxhZ3MuQVRUUklCVVRFICYmIHNlbGVjdG9yQXR0clZhbHVlICE9PSBub2RlQXR0clZhbHVlKSB7XG4gICAgICAgICAgaWYgKGlzUG9zaXRpdmUobW9kZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICBza2lwVG9OZXh0U2VsZWN0b3IgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGlzUG9zaXRpdmUobW9kZSkgfHwgc2tpcFRvTmV4dFNlbGVjdG9yO1xufVxuXG5mdW5jdGlvbiBpc1Bvc2l0aXZlKG1vZGU6IFNlbGVjdG9yRmxhZ3MpOiBib29sZWFuIHtcbiAgcmV0dXJuIChtb2RlICYgU2VsZWN0b3JGbGFncy5OT1QpID09PSAwO1xufVxuXG4vKipcbiAqIEV4YW1pbmVzIHRoZSBhdHRyaWJ1dGUncyBkZWZpbml0aW9uIGFycmF5IGZvciBhIG5vZGUgdG8gZmluZCB0aGUgaW5kZXggb2YgdGhlXG4gKiBhdHRyaWJ1dGUgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogTk9URTogVGhpcyB3aWxsIG5vdCBtYXRjaCBuYW1lc3BhY2VkIGF0dHJpYnV0ZXMuXG4gKlxuICogQXR0cmlidXRlIG1hdGNoaW5nIGRlcGVuZHMgdXBvbiBgaXNJbmxpbmVUZW1wbGF0ZWAgYW5kIGBpc1Byb2plY3Rpb25Nb2RlYC5cbiAqIFRoZSBmb2xsb3dpbmcgdGFibGUgc3VtbWFyaXplcyB3aGljaCB0eXBlcyBvZiBhdHRyaWJ1dGVzIHdlIGF0dGVtcHQgdG8gbWF0Y2g6XG4gKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIE1vZGVzICAgICAgICAgICAgICAgICAgIHwgTm9ybWFsIEF0dHJpYnV0ZXMgfCBCaW5kaW5ncyBBdHRyaWJ1dGVzIHwgVGVtcGxhdGUgQXR0cmlidXRlcyB8IEkxOG5cbiAqIEF0dHJpYnV0ZXNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBJbmxpbmUgKyBQcm9qZWN0aW9uICAgICB8IFlFUyAgICAgICAgICAgICAgIHwgWUVTICAgICAgICAgICAgICAgICB8IE5PICAgICAgICAgICAgICAgICAgfCBZRVNcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBJbmxpbmUgKyBEaXJlY3RpdmUgICAgICB8IE5PICAgICAgICAgICAgICAgIHwgTk8gICAgICAgICAgICAgICAgICB8IFlFUyAgICAgICAgICAgICAgICAgfCBOT1xuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIE5vbi1pbmxpbmUgKyBQcm9qZWN0aW9uIHwgWUVTICAgICAgICAgICAgICAgfCBZRVMgICAgICAgICAgICAgICAgIHwgTk8gICAgICAgICAgICAgICAgICB8IFlFU1xuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIE5vbi1pbmxpbmUgKyBEaXJlY3RpdmUgIHwgWUVTICAgICAgICAgICAgICAgfCBZRVMgICAgICAgICAgICAgICAgIHwgTk8gICAgICAgICAgICAgICAgICB8IFlFU1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqXG4gKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRvIGZpbmRcbiAqIEBwYXJhbSBhdHRycyB0aGUgYXR0cmlidXRlIGFycmF5IHRvIGV4YW1pbmVcbiAqIEBwYXJhbSBpc0lubGluZVRlbXBsYXRlIHRydWUgaWYgdGhlIG5vZGUgYmVpbmcgbWF0Y2hlZCBpcyBhbiBpbmxpbmUgdGVtcGxhdGUgKGUuZy4gYCpuZ0ZvcmApXG4gKiByYXRoZXIgdGhhbiBhIG1hbnVhbGx5IGV4cGFuZGVkIHRlbXBsYXRlIG5vZGUgKGUuZyBgPG5nLXRlbXBsYXRlPmApLlxuICogQHBhcmFtIGlzUHJvamVjdGlvbk1vZGUgdHJ1ZSBpZiB3ZSBhcmUgbWF0Y2hpbmcgYWdhaW5zdCBjb250ZW50IHByb2plY3Rpb24gb3RoZXJ3aXNlIHdlIGFyZVxuICogbWF0Y2hpbmcgYWdhaW5zdCBkaXJlY3RpdmVzLlxuICovXG5mdW5jdGlvbiBmaW5kQXR0ckluZGV4SW5Ob2RlKFxuICBuYW1lOiBzdHJpbmcsXG4gIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsXG4gIGlzSW5saW5lVGVtcGxhdGU6IGJvb2xlYW4sXG4gIGlzUHJvamVjdGlvbk1vZGU6IGJvb2xlYW4sXG4pOiBudW1iZXIge1xuICBpZiAoYXR0cnMgPT09IG51bGwpIHJldHVybiAtMTtcblxuICBsZXQgaSA9IDA7XG5cbiAgaWYgKGlzUHJvamVjdGlvbk1vZGUgfHwgIWlzSW5saW5lVGVtcGxhdGUpIHtcbiAgICBsZXQgYmluZGluZ3NNb2RlID0gZmFsc2U7XG4gICAgd2hpbGUgKGkgPCBhdHRycy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG1heWJlQXR0ck5hbWUgPSBhdHRyc1tpXTtcbiAgICAgIGlmIChtYXliZUF0dHJOYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgbWF5YmVBdHRyTmFtZSA9PT0gQXR0cmlidXRlTWFya2VyLkJpbmRpbmdzIHx8XG4gICAgICAgIG1heWJlQXR0ck5hbWUgPT09IEF0dHJpYnV0ZU1hcmtlci5JMThuXG4gICAgICApIHtcbiAgICAgICAgYmluZGluZ3NNb2RlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIG1heWJlQXR0ck5hbWUgPT09IEF0dHJpYnV0ZU1hcmtlci5DbGFzc2VzIHx8XG4gICAgICAgIG1heWJlQXR0ck5hbWUgPT09IEF0dHJpYnV0ZU1hcmtlci5TdHlsZXNcbiAgICAgICkge1xuICAgICAgICBsZXQgdmFsdWUgPSBhdHRyc1srK2ldO1xuICAgICAgICAvLyBXZSBzaG91bGQgc2tpcCBjbGFzc2VzIGhlcmUgYmVjYXVzZSB3ZSBoYXZlIGEgc2VwYXJhdGUgbWVjaGFuaXNtIGZvclxuICAgICAgICAvLyBtYXRjaGluZyBjbGFzc2VzIGluIHByb2plY3Rpb24gbW9kZS5cbiAgICAgICAgd2hpbGUgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB2YWx1ZSA9IGF0dHJzWysraV07XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKG1heWJlQXR0ck5hbWUgPT09IEF0dHJpYnV0ZU1hcmtlci5UZW1wbGF0ZSkge1xuICAgICAgICAvLyBXZSBkbyBub3QgY2FyZSBhYm91dCBUZW1wbGF0ZSBhdHRyaWJ1dGVzIGluIHRoaXMgc2NlbmFyaW8uXG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmIChtYXliZUF0dHJOYW1lID09PSBBdHRyaWJ1dGVNYXJrZXIuTmFtZXNwYWNlVVJJKSB7XG4gICAgICAgIC8vIFNraXAgdGhlIHdob2xlIG5hbWVzcGFjZWQgYXR0cmlidXRlIGFuZCB2YWx1ZS4gVGhpcyBpcyBieSBkZXNpZ24uXG4gICAgICAgIGkgKz0gNDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvLyBJbiBiaW5kaW5nIG1vZGUgdGhlcmUgYXJlIG9ubHkgbmFtZXMsIHJhdGhlciB0aGFuIG5hbWUtdmFsdWUgcGFpcnMuXG4gICAgICBpICs9IGJpbmRpbmdzTW9kZSA/IDEgOiAyO1xuICAgIH1cbiAgICAvLyBXZSBkaWQgbm90IG1hdGNoIHRoZSBhdHRyaWJ1dGVcbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG1hdGNoVGVtcGxhdGVBdHRyaWJ1dGUoYXR0cnMsIG5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05vZGVNYXRjaGluZ1NlbGVjdG9yTGlzdChcbiAgdE5vZGU6IFROb2RlLFxuICBzZWxlY3RvcjogQ3NzU2VsZWN0b3JMaXN0LFxuICBpc1Byb2plY3Rpb25Nb2RlOiBib29sZWFuID0gZmFsc2UsXG4pOiBib29sZWFuIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpc05vZGVNYXRjaGluZ1NlbGVjdG9yKHROb2RlLCBzZWxlY3RvcltpXSwgaXNQcm9qZWN0aW9uTW9kZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2plY3RBc0F0dHJWYWx1ZSh0Tm9kZTogVE5vZGUpOiBDc3NTZWxlY3RvciB8IG51bGwge1xuICBjb25zdCBub2RlQXR0cnMgPSB0Tm9kZS5hdHRycztcbiAgaWYgKG5vZGVBdHRycyAhPSBudWxsKSB7XG4gICAgY29uc3QgbmdQcm9qZWN0QXNBdHRySWR4ID0gbm9kZUF0dHJzLmluZGV4T2YoQXR0cmlidXRlTWFya2VyLlByb2plY3RBcyk7XG4gICAgLy8gb25seSBjaGVjayBmb3IgbmdQcm9qZWN0QXMgaW4gYXR0cmlidXRlIG5hbWVzLCBkb24ndCBhY2NpZGVudGFsbHkgbWF0Y2ggYXR0cmlidXRlJ3MgdmFsdWVcbiAgICAvLyAoYXR0cmlidXRlIG5hbWVzIGFyZSBzdG9yZWQgYXQgZXZlbiBpbmRleGVzKVxuICAgIGlmICgobmdQcm9qZWN0QXNBdHRySWR4ICYgMSkgPT09IDApIHtcbiAgICAgIHJldHVybiBub2RlQXR0cnNbbmdQcm9qZWN0QXNBdHRySWR4ICsgMV0gYXMgQ3NzU2VsZWN0b3I7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXROYW1lT25seU1hcmtlckluZGV4KG5vZGVBdHRyczogVEF0dHJpYnV0ZXMpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlQXR0ciA9IG5vZGVBdHRyc1tpXTtcbiAgICBpZiAoaXNOYW1lT25seUF0dHJpYnV0ZU1hcmtlcihub2RlQXR0cikpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbm9kZUF0dHJzLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gbWF0Y2hUZW1wbGF0ZUF0dHJpYnV0ZShhdHRyczogVEF0dHJpYnV0ZXMsIG5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBpID0gYXR0cnMuaW5kZXhPZihBdHRyaWJ1dGVNYXJrZXIuVGVtcGxhdGUpO1xuICBpZiAoaSA+IC0xKSB7XG4gICAgaSsrO1xuICAgIHdoaWxlIChpIDwgYXR0cnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBhdHRyID0gYXR0cnNbaV07XG4gICAgICAvLyBSZXR1cm4gaW4gY2FzZSB3ZSBjaGVja2VkIGFsbCB0ZW1wbGF0ZSBhdHRycyBhbmQgYXJlIHN3aXRjaGluZyB0byB0aGUgbmV4dCBzZWN0aW9uIGluIHRoZVxuICAgICAgLy8gYXR0cnMgYXJyYXkgKHRoYXQgc3RhcnRzIHdpdGggYSBudW1iZXIgdGhhdCByZXByZXNlbnRzIGFuIGF0dHJpYnV0ZSBtYXJrZXIpLlxuICAgICAgaWYgKHR5cGVvZiBhdHRyID09PSAnbnVtYmVyJykgcmV0dXJuIC0xO1xuICAgICAgaWYgKGF0dHIgPT09IG5hbWUpIHJldHVybiBpO1xuICAgICAgaSsrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBzZWxlY3RvciBpcyBpbnNpZGUgYSBDc3NTZWxlY3Rvckxpc3RcbiAqIEBwYXJhbSBzZWxlY3RvciBTZWxlY3RvciB0byBiZSBjaGVja2VkLlxuICogQHBhcmFtIGxpc3QgTGlzdCBpbiB3aGljaCB0byBsb29rIGZvciB0aGUgc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NlbGVjdG9ySW5TZWxlY3Rvckxpc3Qoc2VsZWN0b3I6IENzc1NlbGVjdG9yLCBsaXN0OiBDc3NTZWxlY3Rvckxpc3QpOiBib29sZWFuIHtcbiAgc2VsZWN0b3JMaXN0TG9vcDogZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY3VycmVudFNlbGVjdG9ySW5MaXN0ID0gbGlzdFtpXTtcbiAgICBpZiAoc2VsZWN0b3IubGVuZ3RoICE9PSBjdXJyZW50U2VsZWN0b3JJbkxpc3QubGVuZ3RoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzZWxlY3Rvci5sZW5ndGg7IGorKykge1xuICAgICAgaWYgKHNlbGVjdG9yW2pdICE9PSBjdXJyZW50U2VsZWN0b3JJbkxpc3Rbal0pIHtcbiAgICAgICAgY29udGludWUgc2VsZWN0b3JMaXN0TG9vcDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBtYXliZVdyYXBJbk5vdFNlbGVjdG9yKGlzTmVnYXRpdmVNb2RlOiBib29sZWFuLCBjaHVuazogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzTmVnYXRpdmVNb2RlID8gJzpub3QoJyArIGNodW5rLnRyaW0oKSArICcpJyA6IGNodW5rO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlDU1NTZWxlY3RvcihzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gc2VsZWN0b3JbMF0gYXMgc3RyaW5nO1xuICBsZXQgaSA9IDE7XG4gIGxldCBtb2RlID0gU2VsZWN0b3JGbGFncy5BVFRSSUJVVEU7XG4gIGxldCBjdXJyZW50Q2h1bmsgPSAnJztcbiAgbGV0IGlzTmVnYXRpdmVNb2RlID0gZmFsc2U7XG4gIHdoaWxlIChpIDwgc2VsZWN0b3IubGVuZ3RoKSB7XG4gICAgbGV0IHZhbHVlT3JNYXJrZXIgPSBzZWxlY3RvcltpXTtcbiAgICBpZiAodHlwZW9mIHZhbHVlT3JNYXJrZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAobW9kZSAmIFNlbGVjdG9yRmxhZ3MuQVRUUklCVVRFKSB7XG4gICAgICAgIGNvbnN0IGF0dHJWYWx1ZSA9IHNlbGVjdG9yWysraV0gYXMgc3RyaW5nO1xuICAgICAgICBjdXJyZW50Q2h1bmsgKz1cbiAgICAgICAgICAnWycgKyB2YWx1ZU9yTWFya2VyICsgKGF0dHJWYWx1ZS5sZW5ndGggPiAwID8gJz1cIicgKyBhdHRyVmFsdWUgKyAnXCInIDogJycpICsgJ10nO1xuICAgICAgfSBlbHNlIGlmIChtb2RlICYgU2VsZWN0b3JGbGFncy5DTEFTUykge1xuICAgICAgICBjdXJyZW50Q2h1bmsgKz0gJy4nICsgdmFsdWVPck1hcmtlcjtcbiAgICAgIH0gZWxzZSBpZiAobW9kZSAmIFNlbGVjdG9yRmxhZ3MuRUxFTUVOVCkge1xuICAgICAgICBjdXJyZW50Q2h1bmsgKz0gJyAnICsgdmFsdWVPck1hcmtlcjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy9cbiAgICAgIC8vIEFwcGVuZCBjdXJyZW50IGNodW5rIHRvIHRoZSBmaW5hbCByZXN1bHQgaW4gY2FzZSB3ZSBjb21lIGFjcm9zcyBTZWxlY3RvckZsYWcsIHdoaWNoXG4gICAgICAvLyBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJldmlvdXMgc2VjdGlvbiBvZiBhIHNlbGVjdG9yIGlzIG92ZXIuIFdlIG5lZWQgdG8gYWNjdW11bGF0ZSBjb250ZW50XG4gICAgICAvLyBiZXR3ZWVuIGZsYWdzIHRvIG1ha2Ugc3VyZSB3ZSB3cmFwIHRoZSBjaHVuayBsYXRlciBpbiA6bm90KCkgc2VsZWN0b3IgaWYgbmVlZGVkLCBlLmcuXG4gICAgICAvLyBgYGBcbiAgICAgIC8vICBbJycsIEZsYWdzLkNMQVNTLCAnLmNsYXNzQScsIEZsYWdzLkNMQVNTIHwgRmxhZ3MuTk9ULCAnLmNsYXNzQicsICcuY2xhc3NDJ11cbiAgICAgIC8vIGBgYFxuICAgICAgLy8gc2hvdWxkIGJlIHRyYW5zZm9ybWVkIHRvIGAuY2xhc3NBIDpub3QoLmNsYXNzQiAuY2xhc3NDKWAuXG4gICAgICAvL1xuICAgICAgLy8gTm90ZTogZm9yIG5lZ2F0aXZlIHNlbGVjdG9yIHBhcnQsIHdlIGFjY3VtdWxhdGUgY29udGVudCBiZXR3ZWVuIGZsYWdzIHVudGlsIHdlIGZpbmQgdGhlXG4gICAgICAvLyBuZXh0IG5lZ2F0aXZlIGZsYWcuIFRoaXMgaXMgbmVlZGVkIHRvIHN1cHBvcnQgYSBjYXNlIHdoZXJlIGA6bm90KClgIHJ1bGUgY29udGFpbnMgbW9yZSB0aGFuXG4gICAgICAvLyBvbmUgY2h1bmssIGUuZy4gdGhlIGZvbGxvd2luZyBzZWxlY3RvcjpcbiAgICAgIC8vIGBgYFxuICAgICAgLy8gIFsnJywgRmxhZ3MuRUxFTUVOVCB8IEZsYWdzLk5PVCwgJ3AnLCBGbGFncy5DTEFTUywgJ2ZvbycsIEZsYWdzLkNMQVNTIHwgRmxhZ3MuTk9ULCAnYmFyJ11cbiAgICAgIC8vIGBgYFxuICAgICAgLy8gc2hvdWxkIGJlIHN0cmluZ2lmaWVkIHRvIGA6bm90KHAuZm9vKSA6bm90KC5iYXIpYFxuICAgICAgLy9cbiAgICAgIGlmIChjdXJyZW50Q2h1bmsgIT09ICcnICYmICFpc1Bvc2l0aXZlKHZhbHVlT3JNYXJrZXIpKSB7XG4gICAgICAgIHJlc3VsdCArPSBtYXliZVdyYXBJbk5vdFNlbGVjdG9yKGlzTmVnYXRpdmVNb2RlLCBjdXJyZW50Q2h1bmspO1xuICAgICAgICBjdXJyZW50Q2h1bmsgPSAnJztcbiAgICAgIH1cbiAgICAgIG1vZGUgPSB2YWx1ZU9yTWFya2VyO1xuICAgICAgLy8gQWNjb3JkaW5nIHRvIENzc1NlbGVjdG9yIHNwZWMsIG9uY2Ugd2UgY29tZSBhY3Jvc3MgYFNlbGVjdG9yRmxhZ3MuTk9UYCBmbGFnLCB0aGUgbmVnYXRpdmVcbiAgICAgIC8vIG1vZGUgaXMgbWFpbnRhaW5lZCBmb3IgcmVtYWluaW5nIGNodW5rcyBvZiBhIHNlbGVjdG9yLlxuICAgICAgaXNOZWdhdGl2ZU1vZGUgPSBpc05lZ2F0aXZlTW9kZSB8fCAhaXNQb3NpdGl2ZShtb2RlKTtcbiAgICB9XG4gICAgaSsrO1xuICB9XG4gIGlmIChjdXJyZW50Q2h1bmsgIT09ICcnKSB7XG4gICAgcmVzdWx0ICs9IG1heWJlV3JhcEluTm90U2VsZWN0b3IoaXNOZWdhdGl2ZU1vZGUsIGN1cnJlbnRDaHVuayk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIENTUyBzZWxlY3RvciBpbiBwYXJzZWQgZm9ybS5cbiAqXG4gKiBDb21wb25lbnREZWYgYW5kIERpcmVjdGl2ZURlZiBhcmUgZ2VuZXJhdGVkIHdpdGggdGhlIHNlbGVjdG9yIGluIHBhcnNlZCBmb3JtIHRvIGF2b2lkIGRvaW5nXG4gKiBhZGRpdGlvbmFsIHBhcnNpbmcgYXQgcnVudGltZSAoZm9yIGV4YW1wbGUsIGZvciBkaXJlY3RpdmUgbWF0Y2hpbmcpLiBIb3dldmVyIGluIHNvbWUgY2FzZXMgKGZvclxuICogZXhhbXBsZSwgd2hpbGUgYm9vdHN0cmFwcGluZyBhIGNvbXBvbmVudCksIGEgc3RyaW5nIHZlcnNpb24gb2YgdGhlIHNlbGVjdG9yIGlzIHJlcXVpcmVkIHRvIHF1ZXJ5XG4gKiBmb3IgdGhlIGhvc3QgZWxlbWVudCBvbiB0aGUgcGFnZS4gVGhpcyBmdW5jdGlvbiB0YWtlcyB0aGUgcGFyc2VkIGZvcm0gb2YgYSBzZWxlY3RvciBhbmQgcmV0dXJuc1xuICogaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3JMaXN0IHNlbGVjdG9yIGluIHBhcnNlZCBmb3JtXG4gKiBAcmV0dXJucyBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBnaXZlbiBzZWxlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5Q1NTU2VsZWN0b3JMaXN0KHNlbGVjdG9yTGlzdDogQ3NzU2VsZWN0b3JMaXN0KTogc3RyaW5nIHtcbiAgcmV0dXJuIHNlbGVjdG9yTGlzdC5tYXAoc3RyaW5naWZ5Q1NTU2VsZWN0b3IpLmpvaW4oJywnKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBhdHRyaWJ1dGVzIGFuZCBjbGFzc2VzIGluZm9ybWF0aW9uIGZyb20gYSBnaXZlbiBDU1Mgc2VsZWN0b3IuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHdoaWxlIGNyZWF0aW5nIGEgY29tcG9uZW50IGR5bmFtaWNhbGx5LiBJbiB0aGlzIGNhc2UsIHRoZSBob3N0IGVsZW1lbnRcbiAqICh0aGF0IGlzIGNyZWF0ZWQgZHluYW1pY2FsbHkpIHNob3VsZCBjb250YWluIGF0dHJpYnV0ZXMgYW5kIGNsYXNzZXMgc3BlY2lmaWVkIGluIGNvbXBvbmVudCdzIENTU1xuICogc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yIENTUyBzZWxlY3RvciBpbiBwYXJzZWQgZm9ybSAoaW4gYSBmb3JtIG9mIGFycmF5KVxuICogQHJldHVybnMgb2JqZWN0IHdpdGggYGF0dHJzYCBhbmQgYGNsYXNzZXNgIGZpZWxkcyB0aGF0IGNvbnRhaW4gZXh0cmFjdGVkIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0QXR0cnNBbmRDbGFzc2VzRnJvbVNlbGVjdG9yKHNlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IHtcbiAgYXR0cnM6IHN0cmluZ1tdO1xuICBjbGFzc2VzOiBzdHJpbmdbXTtcbn0ge1xuICBjb25zdCBhdHRyczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgY2xhc3Nlczogc3RyaW5nW10gPSBbXTtcbiAgbGV0IGkgPSAxO1xuICBsZXQgbW9kZSA9IFNlbGVjdG9yRmxhZ3MuQVRUUklCVVRFO1xuICB3aGlsZSAoaSA8IHNlbGVjdG9yLmxlbmd0aCkge1xuICAgIGxldCB2YWx1ZU9yTWFya2VyID0gc2VsZWN0b3JbaV07XG4gICAgaWYgKHR5cGVvZiB2YWx1ZU9yTWFya2VyID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKG1vZGUgPT09IFNlbGVjdG9yRmxhZ3MuQVRUUklCVVRFKSB7XG4gICAgICAgIGlmICh2YWx1ZU9yTWFya2VyICE9PSAnJykge1xuICAgICAgICAgIGF0dHJzLnB1c2godmFsdWVPck1hcmtlciwgc2VsZWN0b3JbKytpXSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IFNlbGVjdG9yRmxhZ3MuQ0xBU1MpIHtcbiAgICAgICAgY2xhc3Nlcy5wdXNoKHZhbHVlT3JNYXJrZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBY2NvcmRpbmcgdG8gQ3NzU2VsZWN0b3Igc3BlYywgb25jZSB3ZSBjb21lIGFjcm9zcyBgU2VsZWN0b3JGbGFncy5OT1RgIGZsYWcsIHRoZSBuZWdhdGl2ZVxuICAgICAgLy8gbW9kZSBpcyBtYWludGFpbmVkIGZvciByZW1haW5pbmcgY2h1bmtzIG9mIGEgc2VsZWN0b3IuIFNpbmNlIGF0dHJpYnV0ZXMgYW5kIGNsYXNzZXMgYXJlXG4gICAgICAvLyBleHRyYWN0ZWQgb25seSBmb3IgXCJwb3NpdGl2ZVwiIHBhcnQgb2YgdGhlIHNlbGVjdG9yLCB3ZSBjYW4gc3RvcCBoZXJlLlxuICAgICAgaWYgKCFpc1Bvc2l0aXZlKG1vZGUpKSBicmVhaztcbiAgICAgIG1vZGUgPSB2YWx1ZU9yTWFya2VyO1xuICAgIH1cbiAgICBpKys7XG4gIH1cbiAgcmV0dXJuIHthdHRycywgY2xhc3Nlc307XG59XG4iXX0=
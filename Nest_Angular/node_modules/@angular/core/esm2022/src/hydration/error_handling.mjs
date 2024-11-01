/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../errors';
import { getDeclarationComponentDef } from '../render3/instructions/element_validation';
import { HOST, TVIEW } from '../render3/interfaces/view';
import { getParentRElement } from '../render3/node_manipulation';
import { unwrapRNode } from '../render3/util/view_utils';
import { markRNodeAsHavingHydrationMismatch } from './utils';
const AT_THIS_LOCATION = '<-- AT THIS LOCATION';
/**
 * Retrieves a user friendly string for a given TNodeType for use in
 * friendly error messages
 *
 * @param tNodeType
 * @returns
 */
function getFriendlyStringFromTNodeType(tNodeType) {
    switch (tNodeType) {
        case 4 /* TNodeType.Container */:
            return 'view container';
        case 2 /* TNodeType.Element */:
            return 'element';
        case 8 /* TNodeType.ElementContainer */:
            return 'ng-container';
        case 32 /* TNodeType.Icu */:
            return 'icu';
        case 64 /* TNodeType.Placeholder */:
            return 'i18n';
        case 16 /* TNodeType.Projection */:
            return 'projection';
        case 1 /* TNodeType.Text */:
            return 'text';
        case 128 /* TNodeType.LetDeclaration */:
            return '@let';
        default:
            // This should not happen as we cover all possible TNode types above.
            return '<unknown>';
    }
}
/**
 * Validates that provided nodes match during the hydration process.
 */
export function validateMatchingNode(node, nodeType, tagName, lView, tNode, isViewContainerAnchor = false) {
    if (!node ||
        node.nodeType !== nodeType ||
        (node.nodeType === Node.ELEMENT_NODE &&
            node.tagName.toLowerCase() !== tagName?.toLowerCase())) {
        const expectedNode = shortRNodeDescription(nodeType, tagName, null);
        let header = `During hydration Angular expected ${expectedNode} but `;
        const hostComponentDef = getDeclarationComponentDef(lView);
        const componentClassName = hostComponentDef?.type?.name;
        const expectedDom = describeExpectedDom(lView, tNode, isViewContainerAnchor);
        const expected = `Angular expected this DOM:\n\n${expectedDom}\n\n`;
        let actual = '';
        const componentHostElement = unwrapRNode(lView[HOST]);
        if (!node) {
            // No node found during hydration.
            header += `the node was not found.\n\n`;
            // Since the node is missing, we use the closest node to attach the error to
            markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom);
        }
        else {
            const actualNode = shortRNodeDescription(node.nodeType, node.tagName ?? null, node.textContent ?? null);
            header += `found ${actualNode}.\n\n`;
            const actualDom = describeDomFromNode(node);
            actual = `Actual DOM is:\n\n${actualDom}\n\n`;
            // DevTools only report hydration issues on the component level, so we attach extra debug
            // info to a component host element to make it available to DevTools.
            markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom, actualDom);
        }
        const footer = getHydrationErrorFooter(componentClassName);
        const message = header + expected + actual + getHydrationAttributeNote() + footer;
        throw new RuntimeError(-500 /* RuntimeErrorCode.HYDRATION_NODE_MISMATCH */, message);
    }
}
/**
 * Validates that a given node has sibling nodes
 */
export function validateSiblingNodeExists(node) {
    validateNodeExists(node);
    if (!node.nextSibling) {
        const header = 'During hydration Angular expected more sibling nodes to be present.\n\n';
        const actual = `Actual DOM is:\n\n${describeDomFromNode(node)}\n\n`;
        const footer = getHydrationErrorFooter();
        const message = header + actual + footer;
        markRNodeAsHavingHydrationMismatch(node, '', actual);
        throw new RuntimeError(-501 /* RuntimeErrorCode.HYDRATION_MISSING_SIBLINGS */, message);
    }
}
/**
 * Validates that a node exists or throws
 */
export function validateNodeExists(node, lView = null, tNode = null) {
    if (!node) {
        const header = 'During hydration, Angular expected an element to be present at this location.\n\n';
        let expected = '';
        let footer = '';
        if (lView !== null && tNode !== null) {
            expected = describeExpectedDom(lView, tNode, false);
            footer = getHydrationErrorFooter();
            // Since the node is missing, we use the closest node to attach the error to
            markRNodeAsHavingHydrationMismatch(unwrapRNode(lView[HOST]), expected, '');
        }
        throw new RuntimeError(-502 /* RuntimeErrorCode.HYDRATION_MISSING_NODE */, `${header}${expected}\n\n${footer}`);
    }
}
/**
 * Builds the hydration error message when a node is not found
 *
 * @param lView the LView where the node exists
 * @param tNode the TNode
 */
export function nodeNotFoundError(lView, tNode) {
    const header = 'During serialization, Angular was unable to find an element in the DOM:\n\n';
    const expected = `${describeExpectedDom(lView, tNode, false)}\n\n`;
    const footer = getHydrationErrorFooter();
    throw new RuntimeError(-502 /* RuntimeErrorCode.HYDRATION_MISSING_NODE */, header + expected + footer);
}
/**
 * Builds a hydration error message when a node is not found at a path location
 *
 * @param host the Host Node
 * @param path the path to the node
 */
export function nodeNotFoundAtPathError(host, path) {
    const header = `During hydration Angular was unable to locate a node ` +
        `using the "${path}" path, starting from the ${describeRNode(host)} node.\n\n`;
    const footer = getHydrationErrorFooter();
    markRNodeAsHavingHydrationMismatch(host);
    throw new RuntimeError(-502 /* RuntimeErrorCode.HYDRATION_MISSING_NODE */, header + footer);
}
/**
 * Builds the hydration error message in the case that dom nodes are created outside of
 * the Angular context and are being used as projected nodes
 *
 * @param lView the LView
 * @param tNode the TNode
 * @returns an error
 */
export function unsupportedProjectionOfDomNodes(rNode) {
    const header = 'During serialization, Angular detected DOM nodes ' +
        'that were created outside of Angular context and provided as projectable nodes ' +
        '(likely via `ViewContainerRef.createComponent` or `createComponent` APIs). ' +
        'Hydration is not supported for such cases, consider refactoring the code to avoid ' +
        'this pattern or using `ngSkipHydration` on the host element of the component.\n\n';
    const actual = `${describeDomFromNode(rNode)}\n\n`;
    const message = header + actual + getHydrationAttributeNote();
    return new RuntimeError(-503 /* RuntimeErrorCode.UNSUPPORTED_PROJECTION_DOM_NODES */, message);
}
/**
 * Builds the hydration error message in the case that ngSkipHydration was used on a
 * node that is not a component host element or host binding
 *
 * @param rNode the HTML Element
 * @returns an error
 */
export function invalidSkipHydrationHost(rNode) {
    const header = 'The `ngSkipHydration` flag is applied on a node ' +
        "that doesn't act as a component host. Hydration can be " +
        'skipped only on per-component basis.\n\n';
    const actual = `${describeDomFromNode(rNode)}\n\n`;
    const footer = 'Please move the `ngSkipHydration` attribute to the component host element.\n\n';
    const message = header + actual + footer;
    return new RuntimeError(-504 /* RuntimeErrorCode.INVALID_SKIP_HYDRATION_HOST */, message);
}
// Stringification methods
/**
 * Stringifies a given TNode's attributes
 *
 * @param tNode a provided TNode
 * @returns string
 */
function stringifyTNodeAttrs(tNode) {
    const results = [];
    if (tNode.attrs) {
        for (let i = 0; i < tNode.attrs.length;) {
            const attrName = tNode.attrs[i++];
            // Once we reach the first flag, we know that the list of
            // attributes is over.
            if (typeof attrName == 'number') {
                break;
            }
            const attrValue = tNode.attrs[i++];
            results.push(`${attrName}="${shorten(attrValue)}"`);
        }
    }
    return results.join(' ');
}
/**
 * The list of internal attributes that should be filtered out while
 * producing an error message.
 */
const internalAttrs = new Set(['ngh', 'ng-version', 'ng-server-context']);
/**
 * Stringifies an HTML Element's attributes
 *
 * @param rNode an HTML Element
 * @returns string
 */
function stringifyRNodeAttrs(rNode) {
    const results = [];
    for (let i = 0; i < rNode.attributes.length; i++) {
        const attr = rNode.attributes[i];
        if (internalAttrs.has(attr.name))
            continue;
        results.push(`${attr.name}="${shorten(attr.value)}"`);
    }
    return results.join(' ');
}
// Methods for Describing the DOM
/**
 * Converts a tNode to a helpful readable string value for use in error messages
 *
 * @param tNode a given TNode
 * @param innerContent the content of the node
 * @returns string
 */
function describeTNode(tNode, innerContent = '…') {
    switch (tNode.type) {
        case 1 /* TNodeType.Text */:
            const content = tNode.value ? `(${tNode.value})` : '';
            return `#text${content}`;
        case 2 /* TNodeType.Element */:
            const attrs = stringifyTNodeAttrs(tNode);
            const tag = tNode.value.toLowerCase();
            return `<${tag}${attrs ? ' ' + attrs : ''}>${innerContent}</${tag}>`;
        case 8 /* TNodeType.ElementContainer */:
            return '<!-- ng-container -->';
        case 4 /* TNodeType.Container */:
            return '<!-- container -->';
        default:
            const typeAsString = getFriendlyStringFromTNodeType(tNode.type);
            return `#node(${typeAsString})`;
    }
}
/**
 * Converts an RNode to a helpful readable string value for use in error messages
 *
 * @param rNode a given RNode
 * @param innerContent the content of the node
 * @returns string
 */
function describeRNode(rNode, innerContent = '…') {
    const node = rNode;
    switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            const tag = node.tagName.toLowerCase();
            const attrs = stringifyRNodeAttrs(node);
            return `<${tag}${attrs ? ' ' + attrs : ''}>${innerContent}</${tag}>`;
        case Node.TEXT_NODE:
            const content = node.textContent ? shorten(node.textContent) : '';
            return `#text${content ? `(${content})` : ''}`;
        case Node.COMMENT_NODE:
            return `<!-- ${shorten(node.textContent ?? '')} -->`;
        default:
            return `#node(${node.nodeType})`;
    }
}
/**
 * Builds the string containing the expected DOM present given the LView and TNode
 * values for a readable error message
 *
 * @param lView the lView containing the DOM
 * @param tNode the tNode
 * @param isViewContainerAnchor boolean
 * @returns string
 */
function describeExpectedDom(lView, tNode, isViewContainerAnchor) {
    const spacer = '  ';
    let content = '';
    if (tNode.prev) {
        content += spacer + '…\n';
        content += spacer + describeTNode(tNode.prev) + '\n';
    }
    else if (tNode.type && tNode.type & 12 /* TNodeType.AnyContainer */) {
        content += spacer + '…\n';
    }
    if (isViewContainerAnchor) {
        content += spacer + describeTNode(tNode) + '\n';
        content += spacer + `<!-- container -->  ${AT_THIS_LOCATION}\n`;
    }
    else {
        content += spacer + describeTNode(tNode) + `  ${AT_THIS_LOCATION}\n`;
    }
    content += spacer + '…\n';
    const parentRNode = tNode.type ? getParentRElement(lView[TVIEW], tNode, lView) : null;
    if (parentRNode) {
        content = describeRNode(parentRNode, '\n' + content);
    }
    return content;
}
/**
 * Builds the string containing the DOM present around a given RNode for a
 * readable error message
 *
 * @param node the RNode
 * @returns string
 */
function describeDomFromNode(node) {
    const spacer = '  ';
    let content = '';
    const currentNode = node;
    if (currentNode.previousSibling) {
        content += spacer + '…\n';
        content += spacer + describeRNode(currentNode.previousSibling) + '\n';
    }
    content += spacer + describeRNode(currentNode) + `  ${AT_THIS_LOCATION}\n`;
    if (node.nextSibling) {
        content += spacer + '…\n';
    }
    if (node.parentNode) {
        content = describeRNode(currentNode.parentNode, '\n' + content);
    }
    return content;
}
/**
 * Shortens the description of a given RNode by its type for readability
 *
 * @param nodeType the type of node
 * @param tagName the node tag name
 * @param textContent the text content in the node
 * @returns string
 */
function shortRNodeDescription(nodeType, tagName, textContent) {
    switch (nodeType) {
        case Node.ELEMENT_NODE:
            return `<${tagName.toLowerCase()}>`;
        case Node.TEXT_NODE:
            const content = textContent ? ` (with the "${shorten(textContent)}" content)` : '';
            return `a text node${content}`;
        case Node.COMMENT_NODE:
            return 'a comment node';
        default:
            return `#node(nodeType=${nodeType})`;
    }
}
/**
 * Builds the footer hydration error message
 *
 * @param componentClassName the name of the component class
 * @returns string
 */
function getHydrationErrorFooter(componentClassName) {
    const componentInfo = componentClassName ? `the "${componentClassName}"` : 'corresponding';
    return (`To fix this problem:\n` +
        `  * check ${componentInfo} component for hydration-related issues\n` +
        `  * check to see if your template has valid HTML structure\n` +
        `  * or skip hydration by adding the \`ngSkipHydration\` attribute ` +
        `to its host node in a template\n\n`);
}
/**
 * An attribute related note for hydration errors
 */
function getHydrationAttributeNote() {
    return ('Note: attributes are only displayed to better represent the DOM' +
        ' but have no effect on hydration mismatches.\n\n');
}
// Node string utility functions
/**
 * Strips all newlines out of a given string
 *
 * @param input a string to be cleared of new line characters
 * @returns
 */
function stripNewlines(input) {
    return input.replace(/\s+/gm, '');
}
/**
 * Reduces a string down to a maximum length of characters with ellipsis for readability
 *
 * @param input a string input
 * @param maxLength a maximum length in characters
 * @returns string
 */
function shorten(input, maxLength = 50) {
    if (!input) {
        return '';
    }
    input = stripNewlines(input);
    return input.length > maxLength ? `${input.substring(0, maxLength - 1)}…` : input;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfaGFuZGxpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9oeWRyYXRpb24vZXJyb3JfaGFuZGxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFDekQsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sNENBQTRDLENBQUM7QUFHdEYsT0FBTyxFQUFDLElBQUksRUFBUyxLQUFLLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFdkQsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTNELE1BQU0sZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUM7QUFFaEQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyw4QkFBOEIsQ0FBQyxTQUFvQjtJQUMxRCxRQUFRLFNBQVMsRUFBRSxDQUFDO1FBQ2xCO1lBQ0UsT0FBTyxnQkFBZ0IsQ0FBQztRQUMxQjtZQUNFLE9BQU8sU0FBUyxDQUFDO1FBQ25CO1lBQ0UsT0FBTyxjQUFjLENBQUM7UUFDeEI7WUFDRSxPQUFPLEtBQUssQ0FBQztRQUNmO1lBQ0UsT0FBTyxNQUFNLENBQUM7UUFDaEI7WUFDRSxPQUFPLFlBQVksQ0FBQztRQUN0QjtZQUNFLE9BQU8sTUFBTSxDQUFDO1FBQ2hCO1lBQ0UsT0FBTyxNQUFNLENBQUM7UUFDaEI7WUFDRSxxRUFBcUU7WUFDckUsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxvQkFBb0IsQ0FDbEMsSUFBa0IsRUFDbEIsUUFBZ0IsRUFDaEIsT0FBc0IsRUFDdEIsS0FBWSxF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QUFFRDs7R0FFRztBQUNILFNBQVMseUJBQXlCO0lBQ2hDLE9BQU8sQ0FDTCxpRUFBaUU7UUFDakUsa0RBQWtELENBQ25ELENBQUM7QUFDSixDQUFDO0FBRUQsZ0NBQWdDO0FBRWhDOzs7OztHQUtHO0FBQ0gsU0FBUyxhQUFhLENBQUMsS0FBYTtJQUNsQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFTLE9BQU8sQ0FBQyxLQUFvQixFQUFFLFNBQVMsR0FBRyxFQUFFO0lBQ25ELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUNELEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0IsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3BGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtnZXREZWNsYXJhdGlvbkNvbXBvbmVudERlZn0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvZWxlbWVudF92YWxpZGF0aW9uJztcbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5pbXBvcnQge0hPU1QsIExWaWV3LCBUVklFV30gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRQYXJlbnRSRWxlbWVudH0gZnJvbSAnLi4vcmVuZGVyMy9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge3Vud3JhcFJOb2RlfSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvdmlld191dGlscyc7XG5cbmltcG9ydCB7bWFya1JOb2RlQXNIYXZpbmdIeWRyYXRpb25NaXNtYXRjaH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IEFUX1RISVNfTE9DQVRJT04gPSAnPC0tIEFUIFRISVMgTE9DQVRJT04nO1xuXG4vKipcbiAqIFJldHJpZXZlcyBhIHVzZXIgZnJpZW5kbHkgc3RyaW5nIGZvciBhIGdpdmVuIFROb2RlVHlwZSBmb3IgdXNlIGluXG4gKiBmcmllbmRseSBlcnJvciBtZXNzYWdlc1xuICpcbiAqIEBwYXJhbSB0Tm9kZVR5cGVcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGdldEZyaWVuZGx5U3RyaW5nRnJvbVROb2RlVHlwZSh0Tm9kZVR5cGU6IFROb2RlVHlwZSk6IHN0cmluZyB7XG4gIHN3aXRjaCAodE5vZGVUeXBlKSB7XG4gICAgY2FzZSBUTm9kZVR5cGUuQ29udGFpbmVyOlxuICAgICAgcmV0dXJuICd2aWV3IGNvbnRhaW5lcic7XG4gICAgY2FzZSBUTm9kZVR5cGUuRWxlbWVudDpcbiAgICAgIHJldHVybiAnZWxlbWVudCc7XG4gICAgY2FzZSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcjpcbiAgICAgIHJldHVybiAnbmctY29udGFpbmVyJztcbiAgICBjYXNlIFROb2RlVHlwZS5JY3U6XG4gICAgICByZXR1cm4gJ2ljdSc7XG4gICAgY2FzZSBUTm9kZVR5cGUuUGxhY2Vob2xkZXI6XG4gICAgICByZXR1cm4gJ2kxOG4nO1xuICAgIGNhc2UgVE5vZGVUeXBlLlByb2plY3Rpb246XG4gICAgICByZXR1cm4gJ3Byb2plY3Rpb24nO1xuICAgIGNhc2UgVE5vZGVUeXBlLlRleHQ6XG4gICAgICByZXR1cm4gJ3RleHQnO1xuICAgIGNhc2UgVE5vZGVUeXBlLkxldERlY2xhcmF0aW9uOlxuICAgICAgcmV0dXJuICdAbGV0JztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbiBhcyB3ZSBjb3ZlciBhbGwgcG9zc2libGUgVE5vZGUgdHlwZXMgYWJvdmUuXG4gICAgICByZXR1cm4gJzx1bmtub3duPic7XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCBwcm92aWRlZCBub2RlcyBtYXRjaCBkdXJpbmcgdGhlIGh5ZHJhdGlvbiBwcm9jZXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVNYXRjaGluZ05vZGUoXG4gIG5vZGU6IFJOb2RlIHwgbnVsbCxcbiAgbm9kZVR5cGU6IG51bWJlcixcbiAgdGFnTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgbFZpZXc6IExWaWV3LFxuICB0Tm9kZTogVE5vZGUsXG4gIGlzVmlld0NvbnRhaW5lckFuY2hvciA9IGZhbHNlLFxuKTogdm9pZCB7XG4gIGlmIChcbiAgICAhbm9kZSB8fFxuICAgIChub2RlIGFzIE5vZGUpLm5vZGVUeXBlICE9PSBub2RlVHlwZSB8fFxuICAgICgobm9kZSBhcyBOb2RlKS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgJiZcbiAgICAgIChub2RlIGFzIEhUTUxFbGVtZW50KS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRhZ05hbWU/LnRvTG93ZXJDYXNlKCkpXG4gICkge1xuICAgIGNvbnN0IGV4cGVjdGVkTm9kZSA9IHNob3J0Uk5vZGVEZXNjcmlwdGlvbihub2RlVHlwZSwgdGFnTmFtZSwgbnVsbCk7XG4gICAgbGV0IGhlYWRlciA9IGBEdXJpbmcgaHlkcmF0aW9uIEFuZ3VsYXIgZXhwZWN0ZWQgJHtleHBlY3RlZE5vZGV9IGJ1dCBgO1xuXG4gICAgY29uc3QgaG9zdENvbXBvbmVudERlZiA9IGdldERlY2xhcmF0aW9uQ29tcG9uZW50RGVmKGxWaWV3KTtcbiAgICBjb25zdCBjb21wb25lbnRDbGFzc05hbWUgPSBob3N0Q29tcG9uZW50RGVmPy50eXBlPy5uYW1lO1xuXG4gICAgY29uc3QgZXhwZWN0ZWREb20gPSBkZXNjcmliZUV4cGVjdGVkRG9tKGxWaWV3LCB0Tm9kZSwgaXNWaWV3Q29udGFpbmVyQW5jaG9yKTtcbiAgICBjb25zdCBleHBlY3RlZCA9IGBBbmd1bGFyIGV4cGVjdGVkIHRoaXMgRE9NOlxcblxcbiR7ZXhwZWN0ZWREb219XFxuXFxuYDtcblxuICAgIGxldCBhY3R1YWwgPSAnJztcbiAgICBjb25zdCBjb21wb25lbnRIb3N0RWxlbWVudCA9IHVud3JhcFJOb2RlKGxWaWV3W0hPU1RdISk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAvLyBObyBub2RlIGZvdW5kIGR1cmluZyBoeWRyYXRpb24uXG4gICAgICBoZWFkZXIgKz0gYHRoZSBub2RlIHdhcyBub3QgZm91bmQuXFxuXFxuYDtcblxuICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMgbWlzc2luZywgd2UgdXNlIHRoZSBjbG9zZXN0IG5vZGUgdG8gYXR0YWNoIHRoZSBlcnJvciB0b1xuICAgICAgbWFya1JOb2RlQXNIYXZpbmdIeWRyYXRpb25NaXNtYXRjaChjb21wb25lbnRIb3N0RWxlbWVudCwgZXhwZWN0ZWREb20pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBhY3R1YWxOb2RlID0gc2hvcnRSTm9kZURlc2NyaXB0aW9uKFxuICAgICAgICAobm9kZSBhcyBOb2RlKS5ub2RlVHlwZSxcbiAgICAgICAgKG5vZGUgYXMgSFRNTEVsZW1lbnQpLnRhZ05hbWUgPz8gbnVsbCxcbiAgICAgICAgKG5vZGUgYXMgSFRNTEVsZW1lbnQpLnRleHRDb250ZW50ID8/IG51bGwsXG4gICAgICApO1xuXG4gICAgICBoZWFkZXIgKz0gYGZvdW5kICR7YWN0dWFsTm9kZX0uXFxuXFxuYDtcbiAgICAgIGNvbnN0IGFjdHVhbERvbSA9IGRlc2NyaWJlRG9tRnJvbU5vZGUobm9kZSk7XG4gICAgICBhY3R1YWwgPSBgQWN0dWFsIERPTSBpczpcXG5cXG4ke2FjdHVhbERvbX1cXG5cXG5gO1xuXG4gICAgICAvLyBEZXZUb29scyBvbmx5IHJlcG9ydCBoeWRyYXRpb24gaXNzdWVzIG9uIHRoZSBjb21wb25lbnQgbGV2ZWwsIHNvIHdlIGF0dGFjaCBleHRyYSBkZWJ1Z1xuICAgICAgLy8gaW5mbyB0byBhIGNvbXBvbmVudCBob3N0IGVsZW1lbnQgdG8gbWFrZSBpdCBhdmFpbGFibGUgdG8gRGV2VG9vbHMuXG4gICAgICBtYXJrUk5vZGVBc0hhdmluZ0h5ZHJhdGlvbk1pc21hdGNoKGNvbXBvbmVudEhvc3RFbGVtZW50LCBleHBlY3RlZERvbSwgYWN0dWFsRG9tKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb290ZXIgPSBnZXRIeWRyYXRpb25FcnJvckZvb3Rlcihjb21wb25lbnRDbGFzc05hbWUpO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBoZWFkZXIgKyBleHBlY3RlZCArIGFjdHVhbCArIGdldEh5ZHJhdGlvbkF0dHJpYnV0ZU5vdGUoKSArIGZvb3RlcjtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFJ1bnRpbWVFcnJvckNvZGUuSFlEUkFUSU9OX05PREVfTUlTTUFUQ0gsIG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgYSBnaXZlbiBub2RlIGhhcyBzaWJsaW5nIG5vZGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpYmxpbmdOb2RlRXhpc3RzKG5vZGU6IFJOb2RlIHwgbnVsbCk6IHZvaWQge1xuICB2YWxpZGF0ZU5vZGVFeGlzdHMobm9kZSk7XG4gIGlmICghbm9kZSEubmV4dFNpYmxpbmcpIHtcbiAgICBjb25zdCBoZWFkZXIgPSAnRHVyaW5nIGh5ZHJhdGlvbiBBbmd1bGFyIGV4cGVjdGVkIG1vcmUgc2libGluZyBub2RlcyB0byBiZSBwcmVzZW50Llxcblxcbic7XG4gICAgY29uc3QgYWN0dWFsID0gYEFjdHVhbCBET00gaXM6XFxuXFxuJHtkZXNjcmliZURvbUZyb21Ob2RlKG5vZGUhKX1cXG5cXG5gO1xuICAgIGNvbnN0IGZvb3RlciA9IGdldEh5ZHJhdGlvbkVycm9yRm9vdGVyKCk7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gaGVhZGVyICsgYWN0dWFsICsgZm9vdGVyO1xuXG4gICAgbWFya1JOb2RlQXNIYXZpbmdIeWRyYXRpb25NaXNtYXRjaChub2RlISwgJycsIGFjdHVhbCk7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLkhZRFJBVElPTl9NSVNTSU5HX1NJQkxJTkdTLCBtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGF0IGEgbm9kZSBleGlzdHMgb3IgdGhyb3dzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU5vZGVFeGlzdHMoXG4gIG5vZGU6IFJOb2RlIHwgbnVsbCxcbiAgbFZpZXc6IExWaWV3IHwgbnVsbCA9IG51bGwsXG4gIHROb2RlOiBUTm9kZSB8IG51bGwgPSBudWxsLFxuKTogdm9pZCB7XG4gIGlmICghbm9kZSkge1xuICAgIGNvbnN0IGhlYWRlciA9XG4gICAgICAnRHVyaW5nIGh5ZHJhdGlvbiwgQW5ndWxhciBleHBlY3RlZCBhbiBlbGVtZW50IHRvIGJlIHByZXNlbnQgYXQgdGhpcyBsb2NhdGlvbi5cXG5cXG4nO1xuICAgIGxldCBleHBlY3RlZCA9ICcnO1xuICAgIGxldCBmb290ZXIgPSAnJztcbiAgICBpZiAobFZpZXcgIT09IG51bGwgJiYgdE5vZGUgIT09IG51bGwpIHtcbiAgICAgIGV4cGVjdGVkID0gZGVzY3JpYmVFeHBlY3RlZERvbShsVmlldywgdE5vZGUsIGZhbHNlKTtcbiAgICAgIGZvb3RlciA9IGdldEh5ZHJhdGlvbkVycm9yRm9vdGVyKCk7XG5cbiAgICAgIC8vIFNpbmNlIHRoZSBub2RlIGlzIG1pc3NpbmcsIHdlIHVzZSB0aGUgY2xvc2VzdCBub2RlIHRvIGF0dGFjaCB0aGUgZXJyb3IgdG9cbiAgICAgIG1hcmtSTm9kZUFzSGF2aW5nSHlkcmF0aW9uTWlzbWF0Y2godW53cmFwUk5vZGUobFZpZXdbSE9TVF0hKSwgZXhwZWN0ZWQsICcnKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5IWURSQVRJT05fTUlTU0lOR19OT0RFLFxuICAgICAgYCR7aGVhZGVyfSR7ZXhwZWN0ZWR9XFxuXFxuJHtmb290ZXJ9YCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIHRoZSBoeWRyYXRpb24gZXJyb3IgbWVzc2FnZSB3aGVuIGEgbm9kZSBpcyBub3QgZm91bmRcbiAqXG4gKiBAcGFyYW0gbFZpZXcgdGhlIExWaWV3IHdoZXJlIHRoZSBub2RlIGV4aXN0c1xuICogQHBhcmFtIHROb2RlIHRoZSBUTm9kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9kZU5vdEZvdW5kRXJyb3IobFZpZXc6IExWaWV3LCB0Tm9kZTogVE5vZGUpOiBFcnJvciB7XG4gIGNvbnN0IGhlYWRlciA9ICdEdXJpbmcgc2VyaWFsaXphdGlvbiwgQW5ndWxhciB3YXMgdW5hYmxlIHRvIGZpbmQgYW4gZWxlbWVudCBpbiB0aGUgRE9NOlxcblxcbic7XG4gIGNvbnN0IGV4cGVjdGVkID0gYCR7ZGVzY3JpYmVFeHBlY3RlZERvbShsVmlldywgdE5vZGUsIGZhbHNlKX1cXG5cXG5gO1xuICBjb25zdCBmb290ZXIgPSBnZXRIeWRyYXRpb25FcnJvckZvb3RlcigpO1xuXG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5IWURSQVRJT05fTUlTU0lOR19OT0RFLCBoZWFkZXIgKyBleHBlY3RlZCArIGZvb3Rlcik7XG59XG5cbi8qKlxuICogQnVpbGRzIGEgaHlkcmF0aW9uIGVycm9yIG1lc3NhZ2Ugd2hlbiBhIG5vZGUgaXMgbm90IGZvdW5kIGF0IGEgcGF0aCBsb2NhdGlvblxuICpcbiAqIEBwYXJhbSBob3N0IHRoZSBIb3N0IE5vZGVcbiAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoIHRvIHRoZSBub2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub2RlTm90Rm91bmRBdFBhdGhFcnJvcihob3N0OiBOb2RlLCBwYXRoOiBzdHJpbmcpOiBFcnJvciB7XG4gIGNvbnN0IGhlYWRlciA9XG4gICAgYER1cmluZyBoeWRyYXRpb24gQW5ndWxhciB3YXMgdW5hYmxlIHRvIGxvY2F0ZSBhIG5vZGUgYCArXG4gICAgYHVzaW5nIHRoZSBcIiR7cGF0aH1cIiBwYXRoLCBzdGFydGluZyBmcm9tIHRoZSAke2Rlc2NyaWJlUk5vZGUoaG9zdCl9IG5vZGUuXFxuXFxuYDtcbiAgY29uc3QgZm9vdGVyID0gZ2V0SHlkcmF0aW9uRXJyb3JGb290ZXIoKTtcblxuICBtYXJrUk5vZGVBc0hhdmluZ0h5ZHJhdGlvbk1pc21hdGNoKGhvc3QpO1xuICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFJ1bnRpbWVFcnJvckNvZGUuSFlEUkFUSU9OX01JU1NJTkdfTk9ERSwgaGVhZGVyICsgZm9vdGVyKTtcbn1cblxuLyoqXG4gKiBCdWlsZHMgdGhlIGh5ZHJhdGlvbiBlcnJvciBtZXNzYWdlIGluIHRoZSBjYXNlIHRoYXQgZG9tIG5vZGVzIGFyZSBjcmVhdGVkIG91dHNpZGUgb2ZcbiAqIHRoZSBBbmd1bGFyIGNvbnRleHQgYW5kIGFyZSBiZWluZyB1c2VkIGFzIHByb2plY3RlZCBub2Rlc1xuICpcbiAqIEBwYXJhbSBsVmlldyB0aGUgTFZpZXdcbiAqIEBwYXJhbSB0Tm9kZSB0aGUgVE5vZGVcbiAqIEByZXR1cm5zIGFuIGVycm9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnN1cHBvcnRlZFByb2plY3Rpb25PZkRvbU5vZGVzKHJOb2RlOiBSTm9kZSk6IEVycm9yIHtcbiAgY29uc3QgaGVhZGVyID1cbiAgICAnRHVyaW5nIHNlcmlhbGl6YXRpb24sIEFuZ3VsYXIgZGV0ZWN0ZWQgRE9NIG5vZGVzICcgK1xuICAgICd0aGF0IHdlcmUgY3JlYXRlZCBvdXRzaWRlIG9mIEFuZ3VsYXIgY29udGV4dCBhbmQgcHJvdmlkZWQgYXMgcHJvamVjdGFibGUgbm9kZXMgJyArXG4gICAgJyhsaWtlbHkgdmlhIGBWaWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudGAgb3IgYGNyZWF0ZUNvbXBvbmVudGAgQVBJcykuICcgK1xuICAgICdIeWRyYXRpb24gaXMgbm90IHN1cHBvcnRlZCBmb3Igc3VjaCBjYXNlcywgY29uc2lkZXIgcmVmYWN0b3JpbmcgdGhlIGNvZGUgdG8gYXZvaWQgJyArXG4gICAgJ3RoaXMgcGF0dGVybiBvciB1c2luZyBgbmdTa2lwSHlkcmF0aW9uYCBvbiB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBjb21wb25lbnQuXFxuXFxuJztcbiAgY29uc3QgYWN0dWFsID0gYCR7ZGVzY3JpYmVEb21Gcm9tTm9kZShyTm9kZSl9XFxuXFxuYDtcbiAgY29uc3QgbWVzc2FnZSA9IGhlYWRlciArIGFjdHVhbCArIGdldEh5ZHJhdGlvbkF0dHJpYnV0ZU5vdGUoKTtcbiAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5VTlNVUFBPUlRFRF9QUk9KRUNUSU9OX0RPTV9OT0RFUywgbWVzc2FnZSk7XG59XG5cbi8qKlxuICogQnVpbGRzIHRoZSBoeWRyYXRpb24gZXJyb3IgbWVzc2FnZSBpbiB0aGUgY2FzZSB0aGF0IG5nU2tpcEh5ZHJhdGlvbiB3YXMgdXNlZCBvbiBhXG4gKiBub2RlIHRoYXQgaXMgbm90IGEgY29tcG9uZW50IGhvc3QgZWxlbWVudCBvciBob3N0IGJpbmRpbmdcbiAqXG4gKiBAcGFyYW0gck5vZGUgdGhlIEhUTUwgRWxlbWVudFxuICogQHJldHVybnMgYW4gZXJyb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmFsaWRTa2lwSHlkcmF0aW9uSG9zdChyTm9kZTogUk5vZGUpOiBFcnJvciB7XG4gIGNvbnN0IGhlYWRlciA9XG4gICAgJ1RoZSBgbmdTa2lwSHlkcmF0aW9uYCBmbGFnIGlzIGFwcGxpZWQgb24gYSBub2RlICcgK1xuICAgIFwidGhhdCBkb2Vzbid0IGFjdCBhcyBhIGNvbXBvbmVudCBob3N0LiBIeWRyYXRpb24gY2FuIGJlIFwiICtcbiAgICAnc2tpcHBlZCBvbmx5IG9uIHBlci1jb21wb25lbnQgYmFzaXMuXFxuXFxuJztcbiAgY29uc3QgYWN0dWFsID0gYCR7ZGVzY3JpYmVEb21Gcm9tTm9kZShyTm9kZSl9XFxuXFxuYDtcbiAgY29uc3QgZm9vdGVyID0gJ1BsZWFzZSBtb3ZlIHRoZSBgbmdTa2lwSHlkcmF0aW9uYCBhdHRyaWJ1dGUgdG8gdGhlIGNvbXBvbmVudCBob3N0IGVsZW1lbnQuXFxuXFxuJztcbiAgY29uc3QgbWVzc2FnZSA9IGhlYWRlciArIGFjdHVhbCArIGZvb3RlcjtcbiAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1NLSVBfSFlEUkFUSU9OX0hPU1QsIG1lc3NhZ2UpO1xufVxuXG4vLyBTdHJpbmdpZmljYXRpb24gbWV0aG9kc1xuXG4vKipcbiAqIFN0cmluZ2lmaWVzIGEgZ2l2ZW4gVE5vZGUncyBhdHRyaWJ1dGVzXG4gKlxuICogQHBhcmFtIHROb2RlIGEgcHJvdmlkZWQgVE5vZGVcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlUTm9kZUF0dHJzKHROb2RlOiBUTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgaWYgKHROb2RlLmF0dHJzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0Tm9kZS5hdHRycy5sZW5ndGg7ICkge1xuICAgICAgY29uc3QgYXR0ck5hbWUgPSB0Tm9kZS5hdHRyc1tpKytdO1xuICAgICAgLy8gT25jZSB3ZSByZWFjaCB0aGUgZmlyc3QgZmxhZywgd2Uga25vdyB0aGF0IHRoZSBsaXN0IG9mXG4gICAgICAvLyBhdHRyaWJ1dGVzIGlzIG92ZXIuXG4gICAgICBpZiAodHlwZW9mIGF0dHJOYW1lID09ICdudW1iZXInKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc3QgYXR0clZhbHVlID0gdE5vZGUuYXR0cnNbaSsrXTtcbiAgICAgIHJlc3VsdHMucHVzaChgJHthdHRyTmFtZX09XCIke3Nob3J0ZW4oYXR0clZhbHVlIGFzIHN0cmluZyl9XCJgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMuam9pbignICcpO1xufVxuXG4vKipcbiAqIFRoZSBsaXN0IG9mIGludGVybmFsIGF0dHJpYnV0ZXMgdGhhdCBzaG91bGQgYmUgZmlsdGVyZWQgb3V0IHdoaWxlXG4gKiBwcm9kdWNpbmcgYW4gZXJyb3IgbWVzc2FnZS5cbiAqL1xuY29uc3QgaW50ZXJuYWxBdHRycyA9IG5ldyBTZXQoWyduZ2gnLCAnbmctdmVyc2lvbicsICduZy1zZXJ2ZXItY29udGV4dCddKTtcblxuLyoqXG4gKiBTdHJpbmdpZmllcyBhbiBIVE1MIEVsZW1lbnQncyBhdHRyaWJ1dGVzXG4gKlxuICogQHBhcmFtIHJOb2RlIGFuIEhUTUwgRWxlbWVudFxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVJOb2RlQXR0cnMock5vZGU6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJOb2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhdHRyID0gck5vZGUuYXR0cmlidXRlc1tpXTtcbiAgICBpZiAoaW50ZXJuYWxBdHRycy5oYXMoYXR0ci5uYW1lKSkgY29udGludWU7XG4gICAgcmVzdWx0cy5wdXNoKGAke2F0dHIubmFtZX09XCIke3Nob3J0ZW4oYXR0ci52YWx1ZSl9XCJgKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cy5qb2luKCcgJyk7XG59XG5cbi8vIE1ldGhvZHMgZm9yIERlc2NyaWJpbmcgdGhlIERPTVxuXG4vKipcbiAqIENvbnZlcnRzIGEgdE5vZGUgdG8gYSBoZWxwZnVsIHJlYWRhYmxlIHN0cmluZyB2YWx1ZSBmb3IgdXNlIGluIGVycm9yIG1lc3NhZ2VzXG4gKlxuICogQHBhcmFtIHROb2RlIGEgZ2l2ZW4gVE5vZGVcbiAqIEBwYXJhbSBpbm5lckNvbnRlbnQgdGhlIGNvbnRlbnQgb2YgdGhlIG5vZGVcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5mdW5jdGlvbiBkZXNjcmliZVROb2RlKHROb2RlOiBUTm9kZSwgaW5uZXJDb250ZW50OiBzdHJpbmcgPSAn4oCmJyk6IHN0cmluZyB7XG4gIHN3aXRjaCAodE5vZGUudHlwZSkge1xuICAgIGNhc2UgVE5vZGVUeXBlLlRleHQ6XG4gICAgICBjb25zdCBjb250ZW50ID0gdE5vZGUudmFsdWUgPyBgKCR7dE5vZGUudmFsdWV9KWAgOiAnJztcbiAgICAgIHJldHVybiBgI3RleHQke2NvbnRlbnR9YDtcbiAgICBjYXNlIFROb2RlVHlwZS5FbGVtZW50OlxuICAgICAgY29uc3QgYXR0cnMgPSBzdHJpbmdpZnlUTm9kZUF0dHJzKHROb2RlKTtcbiAgICAgIGNvbnN0IHRhZyA9IHROb2RlLnZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICByZXR1cm4gYDwke3RhZ30ke2F0dHJzID8gJyAnICsgYXR0cnMgOiAnJ30+JHtpbm5lckNvbnRlbnR9PC8ke3RhZ30+YDtcbiAgICBjYXNlIFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyOlxuICAgICAgcmV0dXJuICc8IS0tIG5nLWNvbnRhaW5lciAtLT4nO1xuICAgIGNhc2UgVE5vZGVUeXBlLkNvbnRhaW5lcjpcbiAgICAgIHJldHVybiAnPCEtLSBjb250YWluZXIgLS0+JztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc3QgdHlwZUFzU3RyaW5nID0gZ2V0RnJpZW5kbHlTdHJpbmdGcm9tVE5vZGVUeXBlKHROb2RlLnR5cGUpO1xuICAgICAgcmV0dXJuIGAjbm9kZSgke3R5cGVBc1N0cmluZ30pYDtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIFJOb2RlIHRvIGEgaGVscGZ1bCByZWFkYWJsZSBzdHJpbmcgdmFsdWUgZm9yIHVzZSBpbiBlcnJvciBtZXNzYWdlc1xuICpcbiAqIEBwYXJhbSByTm9kZSBhIGdpdmVuIFJOb2RlXG4gKiBAcGFyYW0gaW5uZXJDb250ZW50IHRoZSBjb250ZW50IG9mIHRoZSBub2RlXG4gKiBAcmV0dXJucyBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZGVzY3JpYmVSTm9kZShyTm9kZTogUk5vZGUsIGlubmVyQ29udGVudDogc3RyaW5nID0gJ+KApicpOiBzdHJpbmcge1xuICBjb25zdCBub2RlID0gck5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gIHN3aXRjaCAobm9kZS5ub2RlVHlwZSkge1xuICAgIGNhc2UgTm9kZS5FTEVNRU5UX05PREU6XG4gICAgICBjb25zdCB0YWcgPSBub2RlLnRhZ05hbWUhLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBhdHRycyA9IHN0cmluZ2lmeVJOb2RlQXR0cnMobm9kZSk7XG4gICAgICByZXR1cm4gYDwke3RhZ30ke2F0dHJzID8gJyAnICsgYXR0cnMgOiAnJ30+JHtpbm5lckNvbnRlbnR9PC8ke3RhZ30+YDtcbiAgICBjYXNlIE5vZGUuVEVYVF9OT0RFOlxuICAgICAgY29uc3QgY29udGVudCA9IG5vZGUudGV4dENvbnRlbnQgPyBzaG9ydGVuKG5vZGUudGV4dENvbnRlbnQpIDogJyc7XG4gICAgICByZXR1cm4gYCN0ZXh0JHtjb250ZW50ID8gYCgke2NvbnRlbnR9KWAgOiAnJ31gO1xuICAgIGNhc2UgTm9kZS5DT01NRU5UX05PREU6XG4gICAgICByZXR1cm4gYDwhLS0gJHtzaG9ydGVuKG5vZGUudGV4dENvbnRlbnQgPz8gJycpfSAtLT5gO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gYCNub2RlKCR7bm9kZS5ub2RlVHlwZX0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyB0aGUgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGV4cGVjdGVkIERPTSBwcmVzZW50IGdpdmVuIHRoZSBMVmlldyBhbmQgVE5vZGVcbiAqIHZhbHVlcyBmb3IgYSByZWFkYWJsZSBlcnJvciBtZXNzYWdlXG4gKlxuICogQHBhcmFtIGxWaWV3IHRoZSBsVmlldyBjb250YWluaW5nIHRoZSBET01cbiAqIEBwYXJhbSB0Tm9kZSB0aGUgdE5vZGVcbiAqIEBwYXJhbSBpc1ZpZXdDb250YWluZXJBbmNob3IgYm9vbGVhblxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0ZWREb20obFZpZXc6IExWaWV3LCB0Tm9kZTogVE5vZGUsIGlzVmlld0NvbnRhaW5lckFuY2hvcjogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IHNwYWNlciA9ICcgICc7XG4gIGxldCBjb250ZW50ID0gJyc7XG4gIGlmICh0Tm9kZS5wcmV2KSB7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyAn4oCmXFxuJztcbiAgICBjb250ZW50ICs9IHNwYWNlciArIGRlc2NyaWJlVE5vZGUodE5vZGUucHJldikgKyAnXFxuJztcbiAgfSBlbHNlIGlmICh0Tm9kZS50eXBlICYmIHROb2RlLnR5cGUgJiBUTm9kZVR5cGUuQW55Q29udGFpbmVyKSB7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyAn4oCmXFxuJztcbiAgfVxuICBpZiAoaXNWaWV3Q29udGFpbmVyQW5jaG9yKSB7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyBkZXNjcmliZVROb2RlKHROb2RlKSArICdcXG4nO1xuICAgIGNvbnRlbnQgKz0gc3BhY2VyICsgYDwhLS0gY29udGFpbmVyIC0tPiAgJHtBVF9USElTX0xPQ0FUSU9OfVxcbmA7XG4gIH0gZWxzZSB7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyBkZXNjcmliZVROb2RlKHROb2RlKSArIGAgICR7QVRfVEhJU19MT0NBVElPTn1cXG5gO1xuICB9XG4gIGNvbnRlbnQgKz0gc3BhY2VyICsgJ+KAplxcbic7XG5cbiAgY29uc3QgcGFyZW50Uk5vZGUgPSB0Tm9kZS50eXBlID8gZ2V0UGFyZW50UkVsZW1lbnQobFZpZXdbVFZJRVddLCB0Tm9kZSwgbFZpZXcpIDogbnVsbDtcbiAgaWYgKHBhcmVudFJOb2RlKSB7XG4gICAgY29udGVudCA9IGRlc2NyaWJlUk5vZGUocGFyZW50Uk5vZGUgYXMgdW5rbm93biBhcyBOb2RlLCAnXFxuJyArIGNvbnRlbnQpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIEJ1aWxkcyB0aGUgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIERPTSBwcmVzZW50IGFyb3VuZCBhIGdpdmVuIFJOb2RlIGZvciBhXG4gKiByZWFkYWJsZSBlcnJvciBtZXNzYWdlXG4gKlxuICogQHBhcmFtIG5vZGUgdGhlIFJOb2RlXG4gKiBAcmV0dXJucyBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZGVzY3JpYmVEb21Gcm9tTm9kZShub2RlOiBSTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHNwYWNlciA9ICcgICc7XG4gIGxldCBjb250ZW50ID0gJyc7XG4gIGNvbnN0IGN1cnJlbnROb2RlID0gbm9kZSBhcyBIVE1MRWxlbWVudDtcbiAgaWYgKGN1cnJlbnROb2RlLnByZXZpb3VzU2libGluZykge1xuICAgIGNvbnRlbnQgKz0gc3BhY2VyICsgJ+KAplxcbic7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyBkZXNjcmliZVJOb2RlKGN1cnJlbnROb2RlLnByZXZpb3VzU2libGluZykgKyAnXFxuJztcbiAgfVxuICBjb250ZW50ICs9IHNwYWNlciArIGRlc2NyaWJlUk5vZGUoY3VycmVudE5vZGUpICsgYCAgJHtBVF9USElTX0xPQ0FUSU9OfVxcbmA7XG4gIGlmIChub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyAn4oCmXFxuJztcbiAgfVxuICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgY29udGVudCA9IGRlc2NyaWJlUk5vZGUoY3VycmVudE5vZGUucGFyZW50Tm9kZSBhcyBOb2RlLCAnXFxuJyArIGNvbnRlbnQpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiAqIFNob3J0ZW5zIHRoZSBkZXNjcmlwdGlvbiBvZiBhIGdpdmVuIFJOb2RlIGJ5IGl0cyB0eXBlIGZvciByZWFkYWJpbGl0eVxuICpcbiAqIEBwYXJhbSBub2RlVHlwZSB0aGUgdHlwZSBvZiBub2RlXG4gKiBAcGFyYW0gdGFnTmFtZSB0aGUgbm9kZSB0YWcgbmFtZVxuICogQHBhcmFtIHRleHRDb250ZW50IHRoZSB0ZXh0IGNvbnRlbnQgaW4gdGhlIG5vZGVcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5mdW5jdGlvbiBzaG9ydFJOb2RlRGVzY3JpcHRpb24oXG4gIG5vZGVUeXBlOiBudW1iZXIsXG4gIHRhZ05hbWU6IHN0cmluZyB8IG51bGwsXG4gIHRleHRDb250ZW50OiBzdHJpbmcgfCBudWxsLFxuKTogc3RyaW5nIHtcbiAgc3dpdGNoIChub2RlVHlwZSkge1xuICAgIGNhc2UgTm9kZS5FTEVNRU5UX05PREU6XG4gICAgICByZXR1cm4gYDwke3RhZ05hbWUhLnRvTG93ZXJDYXNlKCl9PmA7XG4gICAgY2FzZSBOb2RlLlRFWFRfTk9ERTpcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0Q29udGVudCA/IGAgKHdpdGggdGhlIFwiJHtzaG9ydGVuKHRleHRDb250ZW50KX1cIiBjb250ZW50KWAgOiAnJztcbiAgICAgIHJldHVybiBgYSB0ZXh0IG5vZGUke2NvbnRlbnR9YDtcbiAgICBjYXNlIE5vZGUuQ09NTUVOVF9OT0RFOlxuICAgICAgcmV0dXJuICdhIGNvbW1lbnQgbm9kZSc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgI25vZGUobm9kZVR5cGU9JHtub2RlVHlwZX0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyB0aGUgZm9vdGVyIGh5ZHJhdGlvbiBlcnJvciBtZXNzYWdlXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudENsYXNzTmFtZSB0aGUgbmFtZSBvZiB0aGUgY29tcG9uZW50IGNsYXNzXG4gKiBAcmV0dXJucyBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZ2V0SHlkcmF0aW9uRXJyb3JGb290ZXIoY29tcG9uZW50Q2xhc3NOYW1lPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY29tcG9uZW50SW5mbyA9IGNvbXBvbmVudENsYXNzTmFtZSA/IGB0aGUgXCIke2NvbXBvbmVudENsYXNzTmFtZX1cImAgOiAnY29ycmVzcG9uZGluZyc7XG4gIHJldHVybiAoXG4gICAgYFRvIGZpeCB0aGlzIHByb2JsZW06XFxuYCArXG4gICAgYCAgKiBjaGVjayAke2NvbXBvbmVudEluZm99IGNvbXBvbmVudCBmb3IgaHlkcmF0aW9uLXJlbGF0ZWQgaXNzdWVzXFxuYCArXG4gICAgYCAgKiBjaGVjayB0byBzZWUgaWYgeW91ciB0ZW1wbGF0ZSBoYXMgdmFsaWQgSFRNTCBzdHJ1Y3R1cmVcXG5gICtcbiAgICBgICAqIG9yIHNraXAgaHlkcmF0aW9uIGJ5IGFkZGluZyB0aGUgXFxgbmdTa2lwSHlkcmF0aW9uXFxgIGF0dHJpYnV0ZSBgICtcbiAgICBgdG8gaXRzIGhvc3Qgbm9kZSBpbiBhIHRlbXBsYXRlXFxuXFxuYFxuICApO1xufVxuXG4vKipcbiAqIEFuIGF0dHJpYnV0ZSByZWxhdGVkIG5vdGUgZm9yIGh5ZHJhdGlvbiBlcnJvcnNcbiAqL1xuZnVuY3Rpb24gZ2V0SHlkcmF0aW9uQXR0cmlidXRlTm90ZSgpOiBzdHJpbmcge1xuICByZXR1cm4gKFxuICAgICdOb3RlOiBhdHRyaWJ1dGVzIGFyZSBvbmx5IGRpc3BsYXllZCB0byBiZXR0ZXIgcmVwcmVzZW50IHRoZSBET00nICtcbiAgICAnIGJ1dCBoYXZlIG5vIGVmZmVjdCBvbiBoeWRyYXRpb24gbWlzbWF0Y2hlcy5cXG5cXG4nXG4gICk7XG59XG5cbi8vIE5vZGUgc3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXG5cbi8qKlxuICogU3RyaXBzIGFsbCBuZXdsaW5lcyBvdXQgb2YgYSBnaXZlbiBzdHJpbmdcbiAqXG4gKiBAcGFyYW0gaW5wdXQgYSBzdHJpbmcgdG8gYmUgY2xlYXJlZCBvZiBuZXcgbGluZSBjaGFyYWN0ZXJzXG4gKiBAcmV0dXJuc1xuICovXG5mdW5jdGlvbiBzdHJpcE5ld2xpbmVzKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5wdXQucmVwbGFjZSgvXFxzKy9nbSwgJycpO1xufVxuXG4vKipcbiAqIFJlZHVjZXMgYSBzdHJpbmcgZG93biB0byBhIG1heGltdW0gbGVuZ3RoIG9mIGNoYXJhY3RlcnMgd2l0aCBlbGxpcHNpcyBmb3IgcmVhZGFiaWxpdHlcbiAqXG4gKiBAcGFyYW0gaW5wdXQgYSBzdHJpbmcgaW5wdXRcbiAqIEBwYXJhbSBtYXhMZW5ndGggYSBtYXhpbXVtIGxlbmd0aCBpbiBjaGFyYWN0ZXJzXG4gKiBAcmV0dXJucyBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gc2hvcnRlbihpbnB1dDogc3RyaW5nIHwgbnVsbCwgbWF4TGVuZ3RoID0gNTApOiBzdHJpbmcge1xuICBpZiAoIWlucHV0KSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGlucHV0ID0gc3RyaXBOZXdsaW5lcyhpbnB1dCk7XG4gIHJldHVybiBpbnB1dC5sZW5ndGggPiBtYXhMZW5ndGggPyBgJHtpbnB1dC5zdWJzdHJpbmcoMCwgbWF4TGVuZ3RoIC0gMSl94oCmYCA6IGlucHV0O1xufVxuIl19
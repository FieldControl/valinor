/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfaGFuZGxpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9oeWRyYXRpb24vZXJyb3JfaGFuZGxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFDekQsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sNENBQTRDLENBQUM7QUFHdEYsT0FBTyxFQUFDLElBQUksRUFBUyxLQUFLLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFdkQsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTNELE1BQU0sZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUM7QUFFaEQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyw4QkFBOEIsQ0FBQyxTQUFvQjtJQUMxRCxRQUFRLFNBQVMsRUFBRSxDQUFDO1FBQ2xCO1lBQ0UsT0FBTyxnQkFBZ0IsQ0FBQztRQUMxQjtZQUNFLE9BQU8sU0FBUyxDQUFDO1FBQ25CO1lBQ0UsT0FBTyxjQUFjLENBQUM7UUFDeEI7WUFDRSxPQUFPLEtBQUssQ0FBQztRQUNmO1lBQ0UsT0FBTyxNQUFNLENBQUM7UUFDaEI7WUFDRSxPQUFPLFlBQVksQ0FBQztRQUN0QjtZQUNFLE9BQU8sTUFBTSxDQUFDO1FBQ2hCO1lBQ0UscUVBQXFFO1lBQ3JFLE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQ2xDLElBQWtCLEVBQ2xCLFFBQWdCLEVBQ2hCLE9BQXNCLEVBQ3RCLEtBQVksRUFDWixLQUFZLEVBQ1oscUJBQXFCLEdBQUcs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QjtJQUNoQyxPQUFPLENBQ0wsaUVBQWlFO1FBQ2pFLGtEQUFrRCxDQUNuRCxDQUFDO0FBQ0osQ0FBQztBQUVELGdDQUFnQztBQUVoQzs7Ozs7R0FLRztBQUNILFNBQVMsYUFBYSxDQUFDLEtBQWE7SUFDbEMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyxPQUFPLENBQUMsS0FBb0IsRUFBRSxTQUFTLEdBQUcsRUFBRTtJQUNuRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFDRCxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNwRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtnZXREZWNsYXJhdGlvbkNvbXBvbmVudERlZn0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvZWxlbWVudF92YWxpZGF0aW9uJztcbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5pbXBvcnQge0hPU1QsIExWaWV3LCBUVklFV30gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRQYXJlbnRSRWxlbWVudH0gZnJvbSAnLi4vcmVuZGVyMy9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge3Vud3JhcFJOb2RlfSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvdmlld191dGlscyc7XG5cbmltcG9ydCB7bWFya1JOb2RlQXNIYXZpbmdIeWRyYXRpb25NaXNtYXRjaH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IEFUX1RISVNfTE9DQVRJT04gPSAnPC0tIEFUIFRISVMgTE9DQVRJT04nO1xuXG4vKipcbiAqIFJldHJpZXZlcyBhIHVzZXIgZnJpZW5kbHkgc3RyaW5nIGZvciBhIGdpdmVuIFROb2RlVHlwZSBmb3IgdXNlIGluXG4gKiBmcmllbmRseSBlcnJvciBtZXNzYWdlc1xuICpcbiAqIEBwYXJhbSB0Tm9kZVR5cGVcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGdldEZyaWVuZGx5U3RyaW5nRnJvbVROb2RlVHlwZSh0Tm9kZVR5cGU6IFROb2RlVHlwZSk6IHN0cmluZyB7XG4gIHN3aXRjaCAodE5vZGVUeXBlKSB7XG4gICAgY2FzZSBUTm9kZVR5cGUuQ29udGFpbmVyOlxuICAgICAgcmV0dXJuICd2aWV3IGNvbnRhaW5lcic7XG4gICAgY2FzZSBUTm9kZVR5cGUuRWxlbWVudDpcbiAgICAgIHJldHVybiAnZWxlbWVudCc7XG4gICAgY2FzZSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcjpcbiAgICAgIHJldHVybiAnbmctY29udGFpbmVyJztcbiAgICBjYXNlIFROb2RlVHlwZS5JY3U6XG4gICAgICByZXR1cm4gJ2ljdSc7XG4gICAgY2FzZSBUTm9kZVR5cGUuUGxhY2Vob2xkZXI6XG4gICAgICByZXR1cm4gJ2kxOG4nO1xuICAgIGNhc2UgVE5vZGVUeXBlLlByb2plY3Rpb246XG4gICAgICByZXR1cm4gJ3Byb2plY3Rpb24nO1xuICAgIGNhc2UgVE5vZGVUeXBlLlRleHQ6XG4gICAgICByZXR1cm4gJ3RleHQnO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuIGFzIHdlIGNvdmVyIGFsbCBwb3NzaWJsZSBUTm9kZSB0eXBlcyBhYm92ZS5cbiAgICAgIHJldHVybiAnPHVua25vd24+JztcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGF0IHByb3ZpZGVkIG5vZGVzIG1hdGNoIGR1cmluZyB0aGUgaHlkcmF0aW9uIHByb2Nlc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU1hdGNoaW5nTm9kZShcbiAgbm9kZTogUk5vZGUgfCBudWxsLFxuICBub2RlVHlwZTogbnVtYmVyLFxuICB0YWdOYW1lOiBzdHJpbmcgfCBudWxsLFxuICBsVmlldzogTFZpZXcsXG4gIHROb2RlOiBUTm9kZSxcbiAgaXNWaWV3Q29udGFpbmVyQW5jaG9yID0gZmFsc2UsXG4pOiB2b2lkIHtcbiAgaWYgKFxuICAgICFub2RlIHx8XG4gICAgKG5vZGUgYXMgTm9kZSkubm9kZVR5cGUgIT09IG5vZGVUeXBlIHx8XG4gICAgKChub2RlIGFzIE5vZGUpLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJlxuICAgICAgKG5vZGUgYXMgSFRNTEVsZW1lbnQpLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gdGFnTmFtZT8udG9Mb3dlckNhc2UoKSlcbiAgKSB7XG4gICAgY29uc3QgZXhwZWN0ZWROb2RlID0gc2hvcnRSTm9kZURlc2NyaXB0aW9uKG5vZGVUeXBlLCB0YWdOYW1lLCBudWxsKTtcbiAgICBsZXQgaGVhZGVyID0gYER1cmluZyBoeWRyYXRpb24gQW5ndWxhciBleHBlY3RlZCAke2V4cGVjdGVkTm9kZX0gYnV0IGA7XG5cbiAgICBjb25zdCBob3N0Q29tcG9uZW50RGVmID0gZ2V0RGVjbGFyYXRpb25Db21wb25lbnREZWYobFZpZXcpO1xuICAgIGNvbnN0IGNvbXBvbmVudENsYXNzTmFtZSA9IGhvc3RDb21wb25lbnREZWY/LnR5cGU/Lm5hbWU7XG5cbiAgICBjb25zdCBleHBlY3RlZERvbSA9IGRlc2NyaWJlRXhwZWN0ZWREb20obFZpZXcsIHROb2RlLCBpc1ZpZXdDb250YWluZXJBbmNob3IpO1xuICAgIGNvbnN0IGV4cGVjdGVkID0gYEFuZ3VsYXIgZXhwZWN0ZWQgdGhpcyBET006XFxuXFxuJHtleHBlY3RlZERvbX1cXG5cXG5gO1xuXG4gICAgbGV0IGFjdHVhbCA9ICcnO1xuICAgIGNvbnN0IGNvbXBvbmVudEhvc3RFbGVtZW50ID0gdW53cmFwUk5vZGUobFZpZXdbSE9TVF0hKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIC8vIE5vIG5vZGUgZm91bmQgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICAgIGhlYWRlciArPSBgdGhlIG5vZGUgd2FzIG5vdCBmb3VuZC5cXG5cXG5gO1xuXG4gICAgICAvLyBTaW5jZSB0aGUgbm9kZSBpcyBtaXNzaW5nLCB3ZSB1c2UgdGhlIGNsb3Nlc3Qgbm9kZSB0byBhdHRhY2ggdGhlIGVycm9yIHRvXG4gICAgICBtYXJrUk5vZGVBc0hhdmluZ0h5ZHJhdGlvbk1pc21hdGNoKGNvbXBvbmVudEhvc3RFbGVtZW50LCBleHBlY3RlZERvbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFjdHVhbE5vZGUgPSBzaG9ydFJOb2RlRGVzY3JpcHRpb24oXG4gICAgICAgIChub2RlIGFzIE5vZGUpLm5vZGVUeXBlLFxuICAgICAgICAobm9kZSBhcyBIVE1MRWxlbWVudCkudGFnTmFtZSA/PyBudWxsLFxuICAgICAgICAobm9kZSBhcyBIVE1MRWxlbWVudCkudGV4dENvbnRlbnQgPz8gbnVsbCxcbiAgICAgICk7XG5cbiAgICAgIGhlYWRlciArPSBgZm91bmQgJHthY3R1YWxOb2RlfS5cXG5cXG5gO1xuICAgICAgY29uc3QgYWN0dWFsRG9tID0gZGVzY3JpYmVEb21Gcm9tTm9kZShub2RlKTtcbiAgICAgIGFjdHVhbCA9IGBBY3R1YWwgRE9NIGlzOlxcblxcbiR7YWN0dWFsRG9tfVxcblxcbmA7XG5cbiAgICAgIC8vIERldlRvb2xzIG9ubHkgcmVwb3J0IGh5ZHJhdGlvbiBpc3N1ZXMgb24gdGhlIGNvbXBvbmVudCBsZXZlbCwgc28gd2UgYXR0YWNoIGV4dHJhIGRlYnVnXG4gICAgICAvLyBpbmZvIHRvIGEgY29tcG9uZW50IGhvc3QgZWxlbWVudCB0byBtYWtlIGl0IGF2YWlsYWJsZSB0byBEZXZUb29scy5cbiAgICAgIG1hcmtSTm9kZUFzSGF2aW5nSHlkcmF0aW9uTWlzbWF0Y2goY29tcG9uZW50SG9zdEVsZW1lbnQsIGV4cGVjdGVkRG9tLCBhY3R1YWxEb20pO1xuICAgIH1cblxuICAgIGNvbnN0IGZvb3RlciA9IGdldEh5ZHJhdGlvbkVycm9yRm9vdGVyKGNvbXBvbmVudENsYXNzTmFtZSk7XG4gICAgY29uc3QgbWVzc2FnZSA9IGhlYWRlciArIGV4cGVjdGVkICsgYWN0dWFsICsgZ2V0SHlkcmF0aW9uQXR0cmlidXRlTm90ZSgpICsgZm9vdGVyO1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5IWURSQVRJT05fTk9ERV9NSVNNQVRDSCwgbWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCBhIGdpdmVuIG5vZGUgaGFzIHNpYmxpbmcgbm9kZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2libGluZ05vZGVFeGlzdHMobm9kZTogUk5vZGUgfCBudWxsKTogdm9pZCB7XG4gIHZhbGlkYXRlTm9kZUV4aXN0cyhub2RlKTtcbiAgaWYgKCFub2RlIS5uZXh0U2libGluZykge1xuICAgIGNvbnN0IGhlYWRlciA9ICdEdXJpbmcgaHlkcmF0aW9uIEFuZ3VsYXIgZXhwZWN0ZWQgbW9yZSBzaWJsaW5nIG5vZGVzIHRvIGJlIHByZXNlbnQuXFxuXFxuJztcbiAgICBjb25zdCBhY3R1YWwgPSBgQWN0dWFsIERPTSBpczpcXG5cXG4ke2Rlc2NyaWJlRG9tRnJvbU5vZGUobm9kZSEpfVxcblxcbmA7XG4gICAgY29uc3QgZm9vdGVyID0gZ2V0SHlkcmF0aW9uRXJyb3JGb290ZXIoKTtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSBoZWFkZXIgKyBhY3R1YWwgKyBmb290ZXI7XG5cbiAgICBtYXJrUk5vZGVBc0hhdmluZ0h5ZHJhdGlvbk1pc21hdGNoKG5vZGUhLCAnJywgYWN0dWFsKTtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFJ1bnRpbWVFcnJvckNvZGUuSFlEUkFUSU9OX01JU1NJTkdfU0lCTElOR1MsIG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgYSBub2RlIGV4aXN0cyBvciB0aHJvd3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTm9kZUV4aXN0cyhcbiAgbm9kZTogUk5vZGUgfCBudWxsLFxuICBsVmlldzogTFZpZXcgfCBudWxsID0gbnVsbCxcbiAgdE5vZGU6IFROb2RlIHwgbnVsbCA9IG51bGwsXG4pOiB2b2lkIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgY29uc3QgaGVhZGVyID1cbiAgICAgICdEdXJpbmcgaHlkcmF0aW9uLCBBbmd1bGFyIGV4cGVjdGVkIGFuIGVsZW1lbnQgdG8gYmUgcHJlc2VudCBhdCB0aGlzIGxvY2F0aW9uLlxcblxcbic7XG4gICAgbGV0IGV4cGVjdGVkID0gJyc7XG4gICAgbGV0IGZvb3RlciA9ICcnO1xuICAgIGlmIChsVmlldyAhPT0gbnVsbCAmJiB0Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgZXhwZWN0ZWQgPSBkZXNjcmliZUV4cGVjdGVkRG9tKGxWaWV3LCB0Tm9kZSwgZmFsc2UpO1xuICAgICAgZm9vdGVyID0gZ2V0SHlkcmF0aW9uRXJyb3JGb290ZXIoKTtcblxuICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMgbWlzc2luZywgd2UgdXNlIHRoZSBjbG9zZXN0IG5vZGUgdG8gYXR0YWNoIHRoZSBlcnJvciB0b1xuICAgICAgbWFya1JOb2RlQXNIYXZpbmdIeWRyYXRpb25NaXNtYXRjaCh1bndyYXBSTm9kZShsVmlld1tIT1NUXSEpLCBleHBlY3RlZCwgJycpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLkhZRFJBVElPTl9NSVNTSU5HX05PREUsXG4gICAgICBgJHtoZWFkZXJ9JHtleHBlY3RlZH1cXG5cXG4ke2Zvb3Rlcn1gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgdGhlIGh5ZHJhdGlvbiBlcnJvciBtZXNzYWdlIHdoZW4gYSBub2RlIGlzIG5vdCBmb3VuZFxuICpcbiAqIEBwYXJhbSBsVmlldyB0aGUgTFZpZXcgd2hlcmUgdGhlIG5vZGUgZXhpc3RzXG4gKiBAcGFyYW0gdE5vZGUgdGhlIFROb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub2RlTm90Rm91bmRFcnJvcihsVmlldzogTFZpZXcsIHROb2RlOiBUTm9kZSk6IEVycm9yIHtcbiAgY29uc3QgaGVhZGVyID0gJ0R1cmluZyBzZXJpYWxpemF0aW9uLCBBbmd1bGFyIHdhcyB1bmFibGUgdG8gZmluZCBhbiBlbGVtZW50IGluIHRoZSBET006XFxuXFxuJztcbiAgY29uc3QgZXhwZWN0ZWQgPSBgJHtkZXNjcmliZUV4cGVjdGVkRG9tKGxWaWV3LCB0Tm9kZSwgZmFsc2UpfVxcblxcbmA7XG4gIGNvbnN0IGZvb3RlciA9IGdldEh5ZHJhdGlvbkVycm9yRm9vdGVyKCk7XG5cbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLkhZRFJBVElPTl9NSVNTSU5HX05PREUsIGhlYWRlciArIGV4cGVjdGVkICsgZm9vdGVyKTtcbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBoeWRyYXRpb24gZXJyb3IgbWVzc2FnZSB3aGVuIGEgbm9kZSBpcyBub3QgZm91bmQgYXQgYSBwYXRoIGxvY2F0aW9uXG4gKlxuICogQHBhcmFtIGhvc3QgdGhlIEhvc3QgTm9kZVxuICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gdGhlIG5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vZGVOb3RGb3VuZEF0UGF0aEVycm9yKGhvc3Q6IE5vZGUsIHBhdGg6IHN0cmluZyk6IEVycm9yIHtcbiAgY29uc3QgaGVhZGVyID1cbiAgICBgRHVyaW5nIGh5ZHJhdGlvbiBBbmd1bGFyIHdhcyB1bmFibGUgdG8gbG9jYXRlIGEgbm9kZSBgICtcbiAgICBgdXNpbmcgdGhlIFwiJHtwYXRofVwiIHBhdGgsIHN0YXJ0aW5nIGZyb20gdGhlICR7ZGVzY3JpYmVSTm9kZShob3N0KX0gbm9kZS5cXG5cXG5gO1xuICBjb25zdCBmb290ZXIgPSBnZXRIeWRyYXRpb25FcnJvckZvb3RlcigpO1xuXG4gIG1hcmtSTm9kZUFzSGF2aW5nSHlkcmF0aW9uTWlzbWF0Y2goaG9zdCk7XG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5IWURSQVRJT05fTUlTU0lOR19OT0RFLCBoZWFkZXIgKyBmb290ZXIpO1xufVxuXG4vKipcbiAqIEJ1aWxkcyB0aGUgaHlkcmF0aW9uIGVycm9yIG1lc3NhZ2UgaW4gdGhlIGNhc2UgdGhhdCBkb20gbm9kZXMgYXJlIGNyZWF0ZWQgb3V0c2lkZSBvZlxuICogdGhlIEFuZ3VsYXIgY29udGV4dCBhbmQgYXJlIGJlaW5nIHVzZWQgYXMgcHJvamVjdGVkIG5vZGVzXG4gKlxuICogQHBhcmFtIGxWaWV3IHRoZSBMVmlld1xuICogQHBhcmFtIHROb2RlIHRoZSBUTm9kZVxuICogQHJldHVybnMgYW4gZXJyb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuc3VwcG9ydGVkUHJvamVjdGlvbk9mRG9tTm9kZXMock5vZGU6IFJOb2RlKTogRXJyb3Ige1xuICBjb25zdCBoZWFkZXIgPVxuICAgICdEdXJpbmcgc2VyaWFsaXphdGlvbiwgQW5ndWxhciBkZXRlY3RlZCBET00gbm9kZXMgJyArXG4gICAgJ3RoYXQgd2VyZSBjcmVhdGVkIG91dHNpZGUgb2YgQW5ndWxhciBjb250ZXh0IGFuZCBwcm92aWRlZCBhcyBwcm9qZWN0YWJsZSBub2RlcyAnICtcbiAgICAnKGxpa2VseSB2aWEgYFZpZXdDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50YCBvciBgY3JlYXRlQ29tcG9uZW50YCBBUElzKS4gJyArXG4gICAgJ0h5ZHJhdGlvbiBpcyBub3Qgc3VwcG9ydGVkIGZvciBzdWNoIGNhc2VzLCBjb25zaWRlciByZWZhY3RvcmluZyB0aGUgY29kZSB0byBhdm9pZCAnICtcbiAgICAndGhpcyBwYXR0ZXJuIG9yIHVzaW5nIGBuZ1NraXBIeWRyYXRpb25gIG9uIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudC5cXG5cXG4nO1xuICBjb25zdCBhY3R1YWwgPSBgJHtkZXNjcmliZURvbUZyb21Ob2RlKHJOb2RlKX1cXG5cXG5gO1xuICBjb25zdCBtZXNzYWdlID0gaGVhZGVyICsgYWN0dWFsICsgZ2V0SHlkcmF0aW9uQXR0cmlidXRlTm90ZSgpO1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLlVOU1VQUE9SVEVEX1BST0pFQ1RJT05fRE9NX05PREVTLCBtZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBCdWlsZHMgdGhlIGh5ZHJhdGlvbiBlcnJvciBtZXNzYWdlIGluIHRoZSBjYXNlIHRoYXQgbmdTa2lwSHlkcmF0aW9uIHdhcyB1c2VkIG9uIGFcbiAqIG5vZGUgdGhhdCBpcyBub3QgYSBjb21wb25lbnQgaG9zdCBlbGVtZW50IG9yIGhvc3QgYmluZGluZ1xuICpcbiAqIEBwYXJhbSByTm9kZSB0aGUgSFRNTCBFbGVtZW50XG4gKiBAcmV0dXJucyBhbiBlcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52YWxpZFNraXBIeWRyYXRpb25Ib3N0KHJOb2RlOiBSTm9kZSk6IEVycm9yIHtcbiAgY29uc3QgaGVhZGVyID1cbiAgICAnVGhlIGBuZ1NraXBIeWRyYXRpb25gIGZsYWcgaXMgYXBwbGllZCBvbiBhIG5vZGUgJyArXG4gICAgXCJ0aGF0IGRvZXNuJ3QgYWN0IGFzIGEgY29tcG9uZW50IGhvc3QuIEh5ZHJhdGlvbiBjYW4gYmUgXCIgK1xuICAgICdza2lwcGVkIG9ubHkgb24gcGVyLWNvbXBvbmVudCBiYXNpcy5cXG5cXG4nO1xuICBjb25zdCBhY3R1YWwgPSBgJHtkZXNjcmliZURvbUZyb21Ob2RlKHJOb2RlKX1cXG5cXG5gO1xuICBjb25zdCBmb290ZXIgPSAnUGxlYXNlIG1vdmUgdGhlIGBuZ1NraXBIeWRyYXRpb25gIGF0dHJpYnV0ZSB0byB0aGUgY29tcG9uZW50IGhvc3QgZWxlbWVudC5cXG5cXG4nO1xuICBjb25zdCBtZXNzYWdlID0gaGVhZGVyICsgYWN0dWFsICsgZm9vdGVyO1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfU0tJUF9IWURSQVRJT05fSE9TVCwgbWVzc2FnZSk7XG59XG5cbi8vIFN0cmluZ2lmaWNhdGlvbiBtZXRob2RzXG5cbi8qKlxuICogU3RyaW5naWZpZXMgYSBnaXZlbiBUTm9kZSdzIGF0dHJpYnV0ZXNcbiAqXG4gKiBAcGFyYW0gdE5vZGUgYSBwcm92aWRlZCBUTm9kZVxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVROb2RlQXR0cnModE5vZGU6IFROb2RlKTogc3RyaW5nIHtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICBpZiAodE5vZGUuYXR0cnMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHROb2RlLmF0dHJzLmxlbmd0aDsgKSB7XG4gICAgICBjb25zdCBhdHRyTmFtZSA9IHROb2RlLmF0dHJzW2krK107XG4gICAgICAvLyBPbmNlIHdlIHJlYWNoIHRoZSBmaXJzdCBmbGFnLCB3ZSBrbm93IHRoYXQgdGhlIGxpc3Qgb2ZcbiAgICAgIC8vIGF0dHJpYnV0ZXMgaXMgb3Zlci5cbiAgICAgIGlmICh0eXBlb2YgYXR0ck5hbWUgPT0gJ251bWJlcicpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zdCBhdHRyVmFsdWUgPSB0Tm9kZS5hdHRyc1tpKytdO1xuICAgICAgcmVzdWx0cy5wdXNoKGAke2F0dHJOYW1lfT1cIiR7c2hvcnRlbihhdHRyVmFsdWUgYXMgc3RyaW5nKX1cImApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0cy5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogVGhlIGxpc3Qgb2YgaW50ZXJuYWwgYXR0cmlidXRlcyB0aGF0IHNob3VsZCBiZSBmaWx0ZXJlZCBvdXQgd2hpbGVcbiAqIHByb2R1Y2luZyBhbiBlcnJvciBtZXNzYWdlLlxuICovXG5jb25zdCBpbnRlcm5hbEF0dHJzID0gbmV3IFNldChbJ25naCcsICduZy12ZXJzaW9uJywgJ25nLXNlcnZlci1jb250ZXh0J10pO1xuXG4vKipcbiAqIFN0cmluZ2lmaWVzIGFuIEhUTUwgRWxlbWVudCdzIGF0dHJpYnV0ZXNcbiAqXG4gKiBAcGFyYW0gck5vZGUgYW4gSFRNTCBFbGVtZW50XG4gKiBAcmV0dXJucyBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5Uk5vZGVBdHRycyhyTm9kZTogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICBjb25zdCByZXN1bHRzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgck5vZGUuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGF0dHIgPSByTm9kZS5hdHRyaWJ1dGVzW2ldO1xuICAgIGlmIChpbnRlcm5hbEF0dHJzLmhhcyhhdHRyLm5hbWUpKSBjb250aW51ZTtcbiAgICByZXN1bHRzLnB1c2goYCR7YXR0ci5uYW1lfT1cIiR7c2hvcnRlbihhdHRyLnZhbHVlKX1cImApO1xuICB9XG4gIHJldHVybiByZXN1bHRzLmpvaW4oJyAnKTtcbn1cblxuLy8gTWV0aG9kcyBmb3IgRGVzY3JpYmluZyB0aGUgRE9NXG5cbi8qKlxuICogQ29udmVydHMgYSB0Tm9kZSB0byBhIGhlbHBmdWwgcmVhZGFibGUgc3RyaW5nIHZhbHVlIGZvciB1c2UgaW4gZXJyb3IgbWVzc2FnZXNcbiAqXG4gKiBAcGFyYW0gdE5vZGUgYSBnaXZlbiBUTm9kZVxuICogQHBhcmFtIGlubmVyQ29udGVudCB0aGUgY29udGVudCBvZiB0aGUgbm9kZVxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGRlc2NyaWJlVE5vZGUodE5vZGU6IFROb2RlLCBpbm5lckNvbnRlbnQ6IHN0cmluZyA9ICfigKYnKTogc3RyaW5nIHtcbiAgc3dpdGNoICh0Tm9kZS50eXBlKSB7XG4gICAgY2FzZSBUTm9kZVR5cGUuVGV4dDpcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0Tm9kZS52YWx1ZSA/IGAoJHt0Tm9kZS52YWx1ZX0pYCA6ICcnO1xuICAgICAgcmV0dXJuIGAjdGV4dCR7Y29udGVudH1gO1xuICAgIGNhc2UgVE5vZGVUeXBlLkVsZW1lbnQ6XG4gICAgICBjb25zdCBhdHRycyA9IHN0cmluZ2lmeVROb2RlQXR0cnModE5vZGUpO1xuICAgICAgY29uc3QgdGFnID0gdE5vZGUudmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIHJldHVybiBgPCR7dGFnfSR7YXR0cnMgPyAnICcgKyBhdHRycyA6ICcnfT4ke2lubmVyQ29udGVudH08LyR7dGFnfT5gO1xuICAgIGNhc2UgVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXI6XG4gICAgICByZXR1cm4gJzwhLS0gbmctY29udGFpbmVyIC0tPic7XG4gICAgY2FzZSBUTm9kZVR5cGUuQ29udGFpbmVyOlxuICAgICAgcmV0dXJuICc8IS0tIGNvbnRhaW5lciAtLT4nO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zdCB0eXBlQXNTdHJpbmcgPSBnZXRGcmllbmRseVN0cmluZ0Zyb21UTm9kZVR5cGUodE5vZGUudHlwZSk7XG4gICAgICByZXR1cm4gYCNub2RlKCR7dHlwZUFzU3RyaW5nfSlgO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gUk5vZGUgdG8gYSBoZWxwZnVsIHJlYWRhYmxlIHN0cmluZyB2YWx1ZSBmb3IgdXNlIGluIGVycm9yIG1lc3NhZ2VzXG4gKlxuICogQHBhcmFtIHJOb2RlIGEgZ2l2ZW4gUk5vZGVcbiAqIEBwYXJhbSBpbm5lckNvbnRlbnQgdGhlIGNvbnRlbnQgb2YgdGhlIG5vZGVcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5mdW5jdGlvbiBkZXNjcmliZVJOb2RlKHJOb2RlOiBSTm9kZSwgaW5uZXJDb250ZW50OiBzdHJpbmcgPSAn4oCmJyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vZGUgPSByTm9kZSBhcyBIVE1MRWxlbWVudDtcbiAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgY2FzZSBOb2RlLkVMRU1FTlRfTk9ERTpcbiAgICAgIGNvbnN0IHRhZyA9IG5vZGUudGFnTmFtZSEudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IGF0dHJzID0gc3RyaW5naWZ5Uk5vZGVBdHRycyhub2RlKTtcbiAgICAgIHJldHVybiBgPCR7dGFnfSR7YXR0cnMgPyAnICcgKyBhdHRycyA6ICcnfT4ke2lubmVyQ29udGVudH08LyR7dGFnfT5gO1xuICAgIGNhc2UgTm9kZS5URVhUX05PREU6XG4gICAgICBjb25zdCBjb250ZW50ID0gbm9kZS50ZXh0Q29udGVudCA/IHNob3J0ZW4obm9kZS50ZXh0Q29udGVudCkgOiAnJztcbiAgICAgIHJldHVybiBgI3RleHQke2NvbnRlbnQgPyBgKCR7Y29udGVudH0pYCA6ICcnfWA7XG4gICAgY2FzZSBOb2RlLkNPTU1FTlRfTk9ERTpcbiAgICAgIHJldHVybiBgPCEtLSAke3Nob3J0ZW4obm9kZS50ZXh0Q29udGVudCA/PyAnJyl9IC0tPmA7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgI25vZGUoJHtub2RlLm5vZGVUeXBlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIHRoZSBzdHJpbmcgY29udGFpbmluZyB0aGUgZXhwZWN0ZWQgRE9NIHByZXNlbnQgZ2l2ZW4gdGhlIExWaWV3IGFuZCBUTm9kZVxuICogdmFsdWVzIGZvciBhIHJlYWRhYmxlIGVycm9yIG1lc3NhZ2VcbiAqXG4gKiBAcGFyYW0gbFZpZXcgdGhlIGxWaWV3IGNvbnRhaW5pbmcgdGhlIERPTVxuICogQHBhcmFtIHROb2RlIHRoZSB0Tm9kZVxuICogQHBhcmFtIGlzVmlld0NvbnRhaW5lckFuY2hvciBib29sZWFuXG4gKiBAcmV0dXJucyBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZGVzY3JpYmVFeHBlY3RlZERvbShsVmlldzogTFZpZXcsIHROb2RlOiBUTm9kZSwgaXNWaWV3Q29udGFpbmVyQW5jaG9yOiBib29sZWFuKTogc3RyaW5nIHtcbiAgY29uc3Qgc3BhY2VyID0gJyAgJztcbiAgbGV0IGNvbnRlbnQgPSAnJztcbiAgaWYgKHROb2RlLnByZXYpIHtcbiAgICBjb250ZW50ICs9IHNwYWNlciArICfigKZcXG4nO1xuICAgIGNvbnRlbnQgKz0gc3BhY2VyICsgZGVzY3JpYmVUTm9kZSh0Tm9kZS5wcmV2KSArICdcXG4nO1xuICB9IGVsc2UgaWYgKHROb2RlLnR5cGUgJiYgdE5vZGUudHlwZSAmIFROb2RlVHlwZS5BbnlDb250YWluZXIpIHtcbiAgICBjb250ZW50ICs9IHNwYWNlciArICfigKZcXG4nO1xuICB9XG4gIGlmIChpc1ZpZXdDb250YWluZXJBbmNob3IpIHtcbiAgICBjb250ZW50ICs9IHNwYWNlciArIGRlc2NyaWJlVE5vZGUodE5vZGUpICsgJ1xcbic7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyBgPCEtLSBjb250YWluZXIgLS0+ICAke0FUX1RISVNfTE9DQVRJT059XFxuYDtcbiAgfSBlbHNlIHtcbiAgICBjb250ZW50ICs9IHNwYWNlciArIGRlc2NyaWJlVE5vZGUodE5vZGUpICsgYCAgJHtBVF9USElTX0xPQ0FUSU9OfVxcbmA7XG4gIH1cbiAgY29udGVudCArPSBzcGFjZXIgKyAn4oCmXFxuJztcblxuICBjb25zdCBwYXJlbnRSTm9kZSA9IHROb2RlLnR5cGUgPyBnZXRQYXJlbnRSRWxlbWVudChsVmlld1tUVklFV10sIHROb2RlLCBsVmlldykgOiBudWxsO1xuICBpZiAocGFyZW50Uk5vZGUpIHtcbiAgICBjb250ZW50ID0gZGVzY3JpYmVSTm9kZShwYXJlbnRSTm9kZSBhcyB1bmtub3duIGFzIE5vZGUsICdcXG4nICsgY29udGVudCk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICogQnVpbGRzIHRoZSBzdHJpbmcgY29udGFpbmluZyB0aGUgRE9NIHByZXNlbnQgYXJvdW5kIGEgZ2l2ZW4gUk5vZGUgZm9yIGFcbiAqIHJlYWRhYmxlIGVycm9yIG1lc3NhZ2VcbiAqXG4gKiBAcGFyYW0gbm9kZSB0aGUgUk5vZGVcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5mdW5jdGlvbiBkZXNjcmliZURvbUZyb21Ob2RlKG5vZGU6IFJOb2RlKTogc3RyaW5nIHtcbiAgY29uc3Qgc3BhY2VyID0gJyAgJztcbiAgbGV0IGNvbnRlbnQgPSAnJztcbiAgY29uc3QgY3VycmVudE5vZGUgPSBub2RlIGFzIEhUTUxFbGVtZW50O1xuICBpZiAoY3VycmVudE5vZGUucHJldmlvdXNTaWJsaW5nKSB7XG4gICAgY29udGVudCArPSBzcGFjZXIgKyAn4oCmXFxuJztcbiAgICBjb250ZW50ICs9IHNwYWNlciArIGRlc2NyaWJlUk5vZGUoY3VycmVudE5vZGUucHJldmlvdXNTaWJsaW5nKSArICdcXG4nO1xuICB9XG4gIGNvbnRlbnQgKz0gc3BhY2VyICsgZGVzY3JpYmVSTm9kZShjdXJyZW50Tm9kZSkgKyBgICAke0FUX1RISVNfTE9DQVRJT059XFxuYDtcbiAgaWYgKG5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICBjb250ZW50ICs9IHNwYWNlciArICfigKZcXG4nO1xuICB9XG4gIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICBjb250ZW50ID0gZGVzY3JpYmVSTm9kZShjdXJyZW50Tm9kZS5wYXJlbnROb2RlIGFzIE5vZGUsICdcXG4nICsgY29udGVudCk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICogU2hvcnRlbnMgdGhlIGRlc2NyaXB0aW9uIG9mIGEgZ2l2ZW4gUk5vZGUgYnkgaXRzIHR5cGUgZm9yIHJlYWRhYmlsaXR5XG4gKlxuICogQHBhcmFtIG5vZGVUeXBlIHRoZSB0eXBlIG9mIG5vZGVcbiAqIEBwYXJhbSB0YWdOYW1lIHRoZSBub2RlIHRhZyBuYW1lXG4gKiBAcGFyYW0gdGV4dENvbnRlbnQgdGhlIHRleHQgY29udGVudCBpbiB0aGUgbm9kZVxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHNob3J0Uk5vZGVEZXNjcmlwdGlvbihcbiAgbm9kZVR5cGU6IG51bWJlcixcbiAgdGFnTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgdGV4dENvbnRlbnQ6IHN0cmluZyB8IG51bGwsXG4pOiBzdHJpbmcge1xuICBzd2l0Y2ggKG5vZGVUeXBlKSB7XG4gICAgY2FzZSBOb2RlLkVMRU1FTlRfTk9ERTpcbiAgICAgIHJldHVybiBgPCR7dGFnTmFtZSEudG9Mb3dlckNhc2UoKX0+YDtcbiAgICBjYXNlIE5vZGUuVEVYVF9OT0RFOlxuICAgICAgY29uc3QgY29udGVudCA9IHRleHRDb250ZW50ID8gYCAod2l0aCB0aGUgXCIke3Nob3J0ZW4odGV4dENvbnRlbnQpfVwiIGNvbnRlbnQpYCA6ICcnO1xuICAgICAgcmV0dXJuIGBhIHRleHQgbm9kZSR7Y29udGVudH1gO1xuICAgIGNhc2UgTm9kZS5DT01NRU5UX05PREU6XG4gICAgICByZXR1cm4gJ2EgY29tbWVudCBub2RlJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGAjbm9kZShub2RlVHlwZT0ke25vZGVUeXBlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIHRoZSBmb290ZXIgaHlkcmF0aW9uIGVycm9yIG1lc3NhZ2VcbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50Q2xhc3NOYW1lIHRoZSBuYW1lIG9mIHRoZSBjb21wb25lbnQgY2xhc3NcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5mdW5jdGlvbiBnZXRIeWRyYXRpb25FcnJvckZvb3Rlcihjb21wb25lbnRDbGFzc05hbWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjb21wb25lbnRJbmZvID0gY29tcG9uZW50Q2xhc3NOYW1lID8gYHRoZSBcIiR7Y29tcG9uZW50Q2xhc3NOYW1lfVwiYCA6ICdjb3JyZXNwb25kaW5nJztcbiAgcmV0dXJuIChcbiAgICBgVG8gZml4IHRoaXMgcHJvYmxlbTpcXG5gICtcbiAgICBgICAqIGNoZWNrICR7Y29tcG9uZW50SW5mb30gY29tcG9uZW50IGZvciBoeWRyYXRpb24tcmVsYXRlZCBpc3N1ZXNcXG5gICtcbiAgICBgICAqIGNoZWNrIHRvIHNlZSBpZiB5b3VyIHRlbXBsYXRlIGhhcyB2YWxpZCBIVE1MIHN0cnVjdHVyZVxcbmAgK1xuICAgIGAgICogb3Igc2tpcCBoeWRyYXRpb24gYnkgYWRkaW5nIHRoZSBcXGBuZ1NraXBIeWRyYXRpb25cXGAgYXR0cmlidXRlIGAgK1xuICAgIGB0byBpdHMgaG9zdCBub2RlIGluIGEgdGVtcGxhdGVcXG5cXG5gXG4gICk7XG59XG5cbi8qKlxuICogQW4gYXR0cmlidXRlIHJlbGF0ZWQgbm90ZSBmb3IgaHlkcmF0aW9uIGVycm9yc1xuICovXG5mdW5jdGlvbiBnZXRIeWRyYXRpb25BdHRyaWJ1dGVOb3RlKCk6IHN0cmluZyB7XG4gIHJldHVybiAoXG4gICAgJ05vdGU6IGF0dHJpYnV0ZXMgYXJlIG9ubHkgZGlzcGxheWVkIHRvIGJldHRlciByZXByZXNlbnQgdGhlIERPTScgK1xuICAgICcgYnV0IGhhdmUgbm8gZWZmZWN0IG9uIGh5ZHJhdGlvbiBtaXNtYXRjaGVzLlxcblxcbidcbiAgKTtcbn1cblxuLy8gTm9kZSBzdHJpbmcgdXRpbGl0eSBmdW5jdGlvbnNcblxuLyoqXG4gKiBTdHJpcHMgYWxsIG5ld2xpbmVzIG91dCBvZiBhIGdpdmVuIHN0cmluZ1xuICpcbiAqIEBwYXJhbSBpbnB1dCBhIHN0cmluZyB0byBiZSBjbGVhcmVkIG9mIG5ldyBsaW5lIGNoYXJhY3RlcnNcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIHN0cmlwTmV3bGluZXMoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXHMrL2dtLCAnJyk7XG59XG5cbi8qKlxuICogUmVkdWNlcyBhIHN0cmluZyBkb3duIHRvIGEgbWF4aW11bSBsZW5ndGggb2YgY2hhcmFjdGVycyB3aXRoIGVsbGlwc2lzIGZvciByZWFkYWJpbGl0eVxuICpcbiAqIEBwYXJhbSBpbnB1dCBhIHN0cmluZyBpbnB1dFxuICogQHBhcmFtIG1heExlbmd0aCBhIG1heGltdW0gbGVuZ3RoIGluIGNoYXJhY3RlcnNcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5mdW5jdGlvbiBzaG9ydGVuKGlucHV0OiBzdHJpbmcgfCBudWxsLCBtYXhMZW5ndGggPSA1MCk6IHN0cmluZyB7XG4gIGlmICghaW5wdXQpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaW5wdXQgPSBzdHJpcE5ld2xpbmVzKGlucHV0KTtcbiAgcmV0dXJuIGlucHV0Lmxlbmd0aCA+IG1heExlbmd0aCA/IGAke2lucHV0LnN1YnN0cmluZygwLCBtYXhMZW5ndGggLSAxKX3igKZgIDogaW5wdXQ7XG59XG4iXX0=
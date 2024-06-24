/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Determines if one node is contained within another. Adapted from
 * {@see goog.dom.contains}.
 * @param node Node that should contain otherNode.
 * @param otherNode Node being contained.
 * @return True if otherNode is contained within node.
 */
export function contains(node, otherNode) {
    if (otherNode === null) {
        return false;
    }
    // We use browser specific methods for this if available since it is faster
    // that way.
    // IE DOM
    if ('contains' in node && otherNode.nodeType === 1) {
        return node.contains(otherNode);
    }
    // W3C DOM Level 3
    if ('compareDocumentPosition' in node) {
        return node === otherNode || Boolean(node.compareDocumentPosition(otherNode) & 16);
    }
    // W3C DOM Level 1
    while (otherNode && node !== otherNode) {
        otherNode = otherNode.parentNode;
    }
    return otherNode === node;
}
/**
 * Helper method for broadcastCustomEvent. Returns true if any member of
 * the set is an ancestor of element.
 */
export function hasAncestorInNodeList(element, nodeList) {
    for (let idx = 0; idx < nodeList.length; ++idx) {
        const member = nodeList[idx];
        if (member !== element && contains(member, element)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9wcmltaXRpdmVzL2V2ZW50LWRpc3BhdGNoL3NyYy9kb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFFBQVEsQ0FBQyxJQUFVLEVBQUUsU0FBc0I7SUFDekQsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDdkIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsMkVBQTJFO0lBQzNFLFlBQVk7SUFFWixTQUFTO0lBQ1QsSUFBSSxVQUFVLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxrQkFBa0I7SUFDbEIsSUFBSSx5QkFBeUIsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN0QyxPQUFPLElBQUksS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLE9BQU8sU0FBUyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN2QyxTQUFTLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztJQUNuQyxDQUFDO0lBQ0QsT0FBTyxTQUFTLEtBQUssSUFBSSxDQUFDO0FBQzVCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUscUJBQXFCLENBQUMsT0FBZ0IsRUFBRSxRQUFrQjtJQUN4RSxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQy9DLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLE1BQU0sS0FBSyxPQUFPLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIG9uZSBub2RlIGlzIGNvbnRhaW5lZCB3aXRoaW4gYW5vdGhlci4gQWRhcHRlZCBmcm9tXG4gKiB7QHNlZSBnb29nLmRvbS5jb250YWluc30uXG4gKiBAcGFyYW0gbm9kZSBOb2RlIHRoYXQgc2hvdWxkIGNvbnRhaW4gb3RoZXJOb2RlLlxuICogQHBhcmFtIG90aGVyTm9kZSBOb2RlIGJlaW5nIGNvbnRhaW5lZC5cbiAqIEByZXR1cm4gVHJ1ZSBpZiBvdGhlck5vZGUgaXMgY29udGFpbmVkIHdpdGhpbiBub2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnMobm9kZTogTm9kZSwgb3RoZXJOb2RlOiBOb2RlIHwgbnVsbCk6IGJvb2xlYW4ge1xuICBpZiAob3RoZXJOb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gV2UgdXNlIGJyb3dzZXIgc3BlY2lmaWMgbWV0aG9kcyBmb3IgdGhpcyBpZiBhdmFpbGFibGUgc2luY2UgaXQgaXMgZmFzdGVyXG4gIC8vIHRoYXQgd2F5LlxuXG4gIC8vIElFIERPTVxuICBpZiAoJ2NvbnRhaW5zJyBpbiBub2RlICYmIG90aGVyTm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgIHJldHVybiBub2RlLmNvbnRhaW5zKG90aGVyTm9kZSk7XG4gIH1cblxuICAvLyBXM0MgRE9NIExldmVsIDNcbiAgaWYgKCdjb21wYXJlRG9jdW1lbnRQb3NpdGlvbicgaW4gbm9kZSkge1xuICAgIHJldHVybiBub2RlID09PSBvdGhlck5vZGUgfHwgQm9vbGVhbihub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKG90aGVyTm9kZSkgJiAxNik7XG4gIH1cblxuICAvLyBXM0MgRE9NIExldmVsIDFcbiAgd2hpbGUgKG90aGVyTm9kZSAmJiBub2RlICE9PSBvdGhlck5vZGUpIHtcbiAgICBvdGhlck5vZGUgPSBvdGhlck5vZGUucGFyZW50Tm9kZTtcbiAgfVxuICByZXR1cm4gb3RoZXJOb2RlID09PSBub2RlO1xufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgZm9yIGJyb2FkY2FzdEN1c3RvbUV2ZW50LiBSZXR1cm5zIHRydWUgaWYgYW55IG1lbWJlciBvZlxuICogdGhlIHNldCBpcyBhbiBhbmNlc3RvciBvZiBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzQW5jZXN0b3JJbk5vZGVMaXN0KGVsZW1lbnQ6IEVsZW1lbnQsIG5vZGVMaXN0OiBOb2RlTGlzdCk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBub2RlTGlzdC5sZW5ndGg7ICsraWR4KSB7XG4gICAgY29uc3QgbWVtYmVyID0gbm9kZUxpc3RbaWR4XTtcbiAgICBpZiAobWVtYmVyICE9PSBlbGVtZW50ICYmIGNvbnRhaW5zKG1lbWJlciwgZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=
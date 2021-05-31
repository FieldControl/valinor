"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeElementFromArrayExpression = exports.getParentSyntaxList = void 0;
const ts = require("typescript");
/**
 * Retrieves the parent syntax list of the given node. A syntax list node is usually
 * hidden from the default AST node hierarchy because it only contains information that
 * is need when printing a node. e.g. it contains information about comma positions in
 * an array literal expression.
 */
function getParentSyntaxList(node) {
    if (!node.parent) {
        return null;
    }
    const parent = node.parent;
    const { pos, end } = node;
    for (const child of parent.getChildren()) {
        if (child.pos > end || child === node) {
            return null;
        }
        if (child.kind === ts.SyntaxKind.SyntaxList && child.pos <= pos && child.end >= end) {
            return child;
        }
    }
    return null;
}
exports.getParentSyntaxList = getParentSyntaxList;
/** Looks for the trailing comma of the given element within the syntax list. */
function findTrailingCommaToken(list, element) {
    let foundElement = false;
    for (let child of list.getChildren()) {
        if (!foundElement && child === element) {
            foundElement = true;
        }
        else if (foundElement) {
            if (child.kind === ts.SyntaxKind.CommaToken) {
                return child;
            }
            break;
        }
    }
    return null;
}
/** Removes a given element from its parent array literal expression. */
function removeElementFromArrayExpression(element, recorder) {
    recorder.remove(element.getFullStart(), element.getFullWidth());
    const syntaxList = getParentSyntaxList(element);
    if (!syntaxList) {
        return;
    }
    // if there is a trailing comma token for the element, we need to remove it
    // because otherwise the array literal expression will have syntax failures.
    const trailingComma = findTrailingCommaToken(syntaxList, element);
    if (trailingComma !== null) {
        recorder.remove(trailingComma.getFullStart(), trailingComma.getFullWidth());
    }
}
exports.removeElementFromArrayExpression = removeElementFromArrayExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWFycmF5LWVsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9oYW1tZXItZ2VzdHVyZXMtdjkvcmVtb3ZlLWFycmF5LWVsZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsaUNBQWlDO0FBRWpDOzs7OztHQUtHO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsSUFBYTtJQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNoQixPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUMzQixNQUFNLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztJQUN4QixLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUN4QyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDckMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRTtZQUNuRixPQUFPLEtBQXNCLENBQUM7U0FDL0I7S0FDRjtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQWhCRCxrREFnQkM7QUFFRCxnRkFBZ0Y7QUFDaEYsU0FBUyxzQkFBc0IsQ0FBQyxJQUFtQixFQUFFLE9BQWdCO0lBQ25FLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztJQUN6QixLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUNwQyxJQUFJLENBQUMsWUFBWSxJQUFJLEtBQUssS0FBSyxPQUFPLEVBQUU7WUFDdEMsWUFBWSxHQUFHLElBQUksQ0FBQztTQUNyQjthQUFNLElBQUksWUFBWSxFQUFFO1lBQ3ZCLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtnQkFDM0MsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE1BQU07U0FDUDtLQUNGO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsd0VBQXdFO0FBQ3hFLFNBQWdCLGdDQUFnQyxDQUFDLE9BQWdCLEVBQUUsUUFBd0I7SUFDekYsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFFaEUsTUFBTSxVQUFVLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNmLE9BQU87S0FDUjtJQUVELDJFQUEyRTtJQUMzRSw0RUFBNEU7SUFDNUUsTUFBTSxhQUFhLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTtRQUMxQixRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztLQUM3RTtBQUNILENBQUM7QUFkRCw0RUFjQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1VwZGF0ZVJlY29yZGVyfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHBhcmVudCBzeW50YXggbGlzdCBvZiB0aGUgZ2l2ZW4gbm9kZS4gQSBzeW50YXggbGlzdCBub2RlIGlzIHVzdWFsbHlcbiAqIGhpZGRlbiBmcm9tIHRoZSBkZWZhdWx0IEFTVCBub2RlIGhpZXJhcmNoeSBiZWNhdXNlIGl0IG9ubHkgY29udGFpbnMgaW5mb3JtYXRpb24gdGhhdFxuICogaXMgbmVlZCB3aGVuIHByaW50aW5nIGEgbm9kZS4gZS5nLiBpdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBjb21tYSBwb3NpdGlvbnMgaW5cbiAqIGFuIGFycmF5IGxpdGVyYWwgZXhwcmVzc2lvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmVudFN5bnRheExpc3Qobm9kZTogdHMuTm9kZSk6IHRzLlN5bnRheExpc3R8bnVsbCB7XG4gIGlmICghbm9kZS5wYXJlbnQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgY29uc3Qge3BvcywgZW5kfSA9IG5vZGU7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgcGFyZW50LmdldENoaWxkcmVuKCkpIHtcbiAgICBpZiAoY2hpbGQucG9zID4gZW5kIHx8IGNoaWxkID09PSBub2RlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGQua2luZCA9PT0gdHMuU3ludGF4S2luZC5TeW50YXhMaXN0ICYmIGNoaWxkLnBvcyA8PSBwb3MgJiYgY2hpbGQuZW5kID49IGVuZCkge1xuICAgICAgcmV0dXJuIGNoaWxkIGFzIHRzLlN5bnRheExpc3Q7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogTG9va3MgZm9yIHRoZSB0cmFpbGluZyBjb21tYSBvZiB0aGUgZ2l2ZW4gZWxlbWVudCB3aXRoaW4gdGhlIHN5bnRheCBsaXN0LiAqL1xuZnVuY3Rpb24gZmluZFRyYWlsaW5nQ29tbWFUb2tlbihsaXN0OiB0cy5TeW50YXhMaXN0LCBlbGVtZW50OiB0cy5Ob2RlKTogdHMuTm9kZXxudWxsIHtcbiAgbGV0IGZvdW5kRWxlbWVudCA9IGZhbHNlO1xuICBmb3IgKGxldCBjaGlsZCBvZiBsaXN0LmdldENoaWxkcmVuKCkpIHtcbiAgICBpZiAoIWZvdW5kRWxlbWVudCAmJiBjaGlsZCA9PT0gZWxlbWVudCkge1xuICAgICAgZm91bmRFbGVtZW50ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZvdW5kRWxlbWVudCkge1xuICAgICAgaWYgKGNoaWxkLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ29tbWFUb2tlbikge1xuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKiBSZW1vdmVzIGEgZ2l2ZW4gZWxlbWVudCBmcm9tIGl0cyBwYXJlbnQgYXJyYXkgbGl0ZXJhbCBleHByZXNzaW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUVsZW1lbnRGcm9tQXJyYXlFeHByZXNzaW9uKGVsZW1lbnQ6IHRzLk5vZGUsIHJlY29yZGVyOiBVcGRhdGVSZWNvcmRlcikge1xuICByZWNvcmRlci5yZW1vdmUoZWxlbWVudC5nZXRGdWxsU3RhcnQoKSwgZWxlbWVudC5nZXRGdWxsV2lkdGgoKSk7XG5cbiAgY29uc3Qgc3ludGF4TGlzdCA9IGdldFBhcmVudFN5bnRheExpc3QoZWxlbWVudCk7XG4gIGlmICghc3ludGF4TGlzdCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGlmIHRoZXJlIGlzIGEgdHJhaWxpbmcgY29tbWEgdG9rZW4gZm9yIHRoZSBlbGVtZW50LCB3ZSBuZWVkIHRvIHJlbW92ZSBpdFxuICAvLyBiZWNhdXNlIG90aGVyd2lzZSB0aGUgYXJyYXkgbGl0ZXJhbCBleHByZXNzaW9uIHdpbGwgaGF2ZSBzeW50YXggZmFpbHVyZXMuXG4gIGNvbnN0IHRyYWlsaW5nQ29tbWEgPSBmaW5kVHJhaWxpbmdDb21tYVRva2VuKHN5bnRheExpc3QsIGVsZW1lbnQpO1xuICBpZiAodHJhaWxpbmdDb21tYSAhPT0gbnVsbCkge1xuICAgIHJlY29yZGVyLnJlbW92ZSh0cmFpbGluZ0NvbW1hLmdldEZ1bGxTdGFydCgpLCB0cmFpbGluZ0NvbW1hLmdldEZ1bGxXaWR0aCgpKTtcbiAgfVxufVxuIl19
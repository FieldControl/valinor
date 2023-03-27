"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeywords = void 0;
const core_1 = require("@babel/core");
/**
 * The name of the Angular class metadata function created by the Angular compiler.
 */
const SET_CLASS_METADATA_NAME = 'ɵsetClassMetadata';
/**
 * Provides one or more keywords that if found within the content of a source file indicate
 * that this plugin should be used with a source file.
 *
 * @returns An a string iterable containing one or more keywords.
 */
function getKeywords() {
    return [SET_CLASS_METADATA_NAME];
}
exports.getKeywords = getKeywords;
/**
 * A babel plugin factory function for eliding the Angular class metadata function (`ɵsetClassMetadata`).
 *
 * @returns A babel plugin object instance.
 */
function default_1() {
    return {
        visitor: {
            CallExpression(path) {
                var _a;
                const callee = path.node.callee;
                // The function being called must be the metadata function name
                let calleeName;
                if (core_1.types.isMemberExpression(callee) && core_1.types.isIdentifier(callee.property)) {
                    calleeName = callee.property.name;
                }
                else if (core_1.types.isIdentifier(callee)) {
                    calleeName = callee.name;
                }
                if (calleeName !== SET_CLASS_METADATA_NAME) {
                    return;
                }
                // There must be four arguments that meet the following criteria:
                // * First must be an identifier
                // * Second must be an array literal
                const callArguments = path.node.arguments;
                if (callArguments.length !== 4 ||
                    !core_1.types.isIdentifier(callArguments[0]) ||
                    !core_1.types.isArrayExpression(callArguments[1])) {
                    return;
                }
                // The metadata function is always emitted inside a function expression
                if (!((_a = path.getFunctionParent()) === null || _a === void 0 ? void 0 : _a.isFunctionExpression())) {
                    return;
                }
                // Replace the metadata function with `void 0` which is the equivalent return value
                // of the metadata function.
                path.replaceWith(path.scope.buildUndefinedNode());
            },
        },
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxpZGUtYW5ndWxhci1tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2JhYmVsL3BsdWdpbnMvZWxpZGUtYW5ndWxhci1tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxzQ0FBeUQ7QUFFekQ7O0dBRUc7QUFDSCxNQUFNLHVCQUF1QixHQUFHLG1CQUFtQixDQUFDO0FBRXBEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsV0FBVztJQUN6QixPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRkQsa0NBRUM7QUFFRDs7OztHQUlHO0FBQ0g7SUFDRSxPQUFPO1FBQ0wsT0FBTyxFQUFFO1lBQ1AsY0FBYyxDQUFDLElBQW9DOztnQkFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBRWhDLCtEQUErRDtnQkFDL0QsSUFBSSxVQUFVLENBQUM7Z0JBQ2YsSUFBSSxZQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksWUFBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzNFLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztpQkFDbkM7cUJBQU0sSUFBSSxZQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNyQyxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDMUI7Z0JBQ0QsSUFBSSxVQUFVLEtBQUssdUJBQXVCLEVBQUU7b0JBQzFDLE9BQU87aUJBQ1I7Z0JBRUQsaUVBQWlFO2dCQUNqRSxnQ0FBZ0M7Z0JBQ2hDLG9DQUFvQztnQkFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQzFDLElBQ0UsYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDO29CQUMxQixDQUFDLFlBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxDQUFDLFlBQUssQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDMUM7b0JBQ0EsT0FBTztpQkFDUjtnQkFFRCx1RUFBdUU7Z0JBQ3ZFLElBQUksQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLGlCQUFpQixFQUFFLDBDQUFFLG9CQUFvQixFQUFFLENBQUEsRUFBRTtvQkFDckQsT0FBTztpQkFDUjtnQkFFRCxtRkFBbUY7Z0JBQ25GLDRCQUE0QjtnQkFDNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztZQUNwRCxDQUFDO1NBQ0Y7S0FDRixDQUFDO0FBQ0osQ0FBQztBQXhDRCw0QkF3Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgTm9kZVBhdGgsIFBsdWdpbk9iaiwgdHlwZXMgfSBmcm9tICdAYmFiZWwvY29yZSc7XG5cbi8qKlxuICogVGhlIG5hbWUgb2YgdGhlIEFuZ3VsYXIgY2xhc3MgbWV0YWRhdGEgZnVuY3Rpb24gY3JlYXRlZCBieSB0aGUgQW5ndWxhciBjb21waWxlci5cbiAqL1xuY29uc3QgU0VUX0NMQVNTX01FVEFEQVRBX05BTUUgPSAnybVzZXRDbGFzc01ldGFkYXRhJztcblxuLyoqXG4gKiBQcm92aWRlcyBvbmUgb3IgbW9yZSBrZXl3b3JkcyB0aGF0IGlmIGZvdW5kIHdpdGhpbiB0aGUgY29udGVudCBvZiBhIHNvdXJjZSBmaWxlIGluZGljYXRlXG4gKiB0aGF0IHRoaXMgcGx1Z2luIHNob3VsZCBiZSB1c2VkIHdpdGggYSBzb3VyY2UgZmlsZS5cbiAqXG4gKiBAcmV0dXJucyBBbiBhIHN0cmluZyBpdGVyYWJsZSBjb250YWluaW5nIG9uZSBvciBtb3JlIGtleXdvcmRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0S2V5d29yZHMoKTogSXRlcmFibGU8c3RyaW5nPiB7XG4gIHJldHVybiBbU0VUX0NMQVNTX01FVEFEQVRBX05BTUVdO1xufVxuXG4vKipcbiAqIEEgYmFiZWwgcGx1Z2luIGZhY3RvcnkgZnVuY3Rpb24gZm9yIGVsaWRpbmcgdGhlIEFuZ3VsYXIgY2xhc3MgbWV0YWRhdGEgZnVuY3Rpb24gKGDJtXNldENsYXNzTWV0YWRhdGFgKS5cbiAqXG4gKiBAcmV0dXJucyBBIGJhYmVsIHBsdWdpbiBvYmplY3QgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpOiBQbHVnaW5PYmoge1xuICByZXR1cm4ge1xuICAgIHZpc2l0b3I6IHtcbiAgICAgIENhbGxFeHByZXNzaW9uKHBhdGg6IE5vZGVQYXRoPHR5cGVzLkNhbGxFeHByZXNzaW9uPikge1xuICAgICAgICBjb25zdCBjYWxsZWUgPSBwYXRoLm5vZGUuY2FsbGVlO1xuXG4gICAgICAgIC8vIFRoZSBmdW5jdGlvbiBiZWluZyBjYWxsZWQgbXVzdCBiZSB0aGUgbWV0YWRhdGEgZnVuY3Rpb24gbmFtZVxuICAgICAgICBsZXQgY2FsbGVlTmFtZTtcbiAgICAgICAgaWYgKHR5cGVzLmlzTWVtYmVyRXhwcmVzc2lvbihjYWxsZWUpICYmIHR5cGVzLmlzSWRlbnRpZmllcihjYWxsZWUucHJvcGVydHkpKSB7XG4gICAgICAgICAgY2FsbGVlTmFtZSA9IGNhbGxlZS5wcm9wZXJ0eS5uYW1lO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVzLmlzSWRlbnRpZmllcihjYWxsZWUpKSB7XG4gICAgICAgICAgY2FsbGVlTmFtZSA9IGNhbGxlZS5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsZWVOYW1lICE9PSBTRVRfQ0xBU1NfTUVUQURBVEFfTkFNRSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZXJlIG11c3QgYmUgZm91ciBhcmd1bWVudHMgdGhhdCBtZWV0IHRoZSBmb2xsb3dpbmcgY3JpdGVyaWE6XG4gICAgICAgIC8vICogRmlyc3QgbXVzdCBiZSBhbiBpZGVudGlmaWVyXG4gICAgICAgIC8vICogU2Vjb25kIG11c3QgYmUgYW4gYXJyYXkgbGl0ZXJhbFxuICAgICAgICBjb25zdCBjYWxsQXJndW1lbnRzID0gcGF0aC5ub2RlLmFyZ3VtZW50cztcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGNhbGxBcmd1bWVudHMubGVuZ3RoICE9PSA0IHx8XG4gICAgICAgICAgIXR5cGVzLmlzSWRlbnRpZmllcihjYWxsQXJndW1lbnRzWzBdKSB8fFxuICAgICAgICAgICF0eXBlcy5pc0FycmF5RXhwcmVzc2lvbihjYWxsQXJndW1lbnRzWzFdKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbWV0YWRhdGEgZnVuY3Rpb24gaXMgYWx3YXlzIGVtaXR0ZWQgaW5zaWRlIGEgZnVuY3Rpb24gZXhwcmVzc2lvblxuICAgICAgICBpZiAoIXBhdGguZ2V0RnVuY3Rpb25QYXJlbnQoKT8uaXNGdW5jdGlvbkV4cHJlc3Npb24oKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIG1ldGFkYXRhIGZ1bmN0aW9uIHdpdGggYHZvaWQgMGAgd2hpY2ggaXMgdGhlIGVxdWl2YWxlbnQgcmV0dXJuIHZhbHVlXG4gICAgICAgIC8vIG9mIHRoZSBtZXRhZGF0YSBmdW5jdGlvbi5cbiAgICAgICAgcGF0aC5yZXBsYWNlV2l0aChwYXRoLnNjb3BlLmJ1aWxkVW5kZWZpbmVkTm9kZSgpKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/core/schematics/migrations/activated-route-snapshot-fragment/util", ["require", "exports", "typescript", "@angular/core/schematics/utils/typescript/nodes", "@angular/core/schematics/utils/typescript/symbol"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateActivatedRouteSnapshotFragment = exports.findFragmentAccesses = void 0;
    const ts = require("typescript");
    const nodes_1 = require("@angular/core/schematics/utils/typescript/nodes");
    const symbol_1 = require("@angular/core/schematics/utils/typescript/symbol");
    /**
     * Finds all the accesses of `ActivatedRouteSnapshot.fragment`
     * that need to be migrated within a particular file.
     */
    function findFragmentAccesses(typeChecker, sourceFile) {
        const results = new Set();
        sourceFile.forEachChild(function walk(node) {
            if (ts.isPropertyAccessExpression(node) && node.name.text === 'fragment' &&
                !results.has(node) && !nodes_1.isNullCheck(node) && !nodes_1.isSafeAccess(node) &&
                symbol_1.hasOneOfTypes(typeChecker, node.expression, ['ActivatedRouteSnapshot']) &&
                symbol_1.isNullableType(typeChecker, node)) {
                results.add(node);
            }
            node.forEachChild(walk);
        });
        return results;
    }
    exports.findFragmentAccesses = findFragmentAccesses;
    /** Migrates an `ActivatedRouteSnapshot.fragment` access. */
    function migrateActivatedRouteSnapshotFragment(node) {
        // Turns `foo.fragment` into `foo.fragment!`.
        return ts.createNonNullExpression(node);
    }
    exports.migrateActivatedRouteSnapshotFragment = migrateActivatedRouteSnapshotFragment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc2NoZW1hdGljcy9taWdyYXRpb25zL2FjdGl2YXRlZC1yb3V0ZS1zbmFwc2hvdC1mcmFnbWVudC91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILGlDQUFpQztJQUNqQywyRUFBdUU7SUFDdkUsNkVBQTRFO0lBRTVFOzs7T0FHRztJQUNILFNBQWdCLG9CQUFvQixDQUNoQyxXQUEyQixFQUFFLFVBQXlCO1FBQ3hELE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO1FBRXZELFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBYTtZQUNqRCxJQUFJLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVO2dCQUNwRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9ELHNCQUFhLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUN2RSx1QkFBYyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNuQjtZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBaEJELG9EQWdCQztJQUVELDREQUE0RDtJQUM1RCxTQUFnQixxQ0FBcUMsQ0FBQyxJQUFpQztRQUNyRiw2Q0FBNkM7UUFDN0MsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUhELHNGQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtpc051bGxDaGVjaywgaXNTYWZlQWNjZXNzfSBmcm9tICcuLi8uLi91dGlscy90eXBlc2NyaXB0L25vZGVzJztcbmltcG9ydCB7aGFzT25lT2ZUeXBlcywgaXNOdWxsYWJsZVR5cGV9IGZyb20gJy4uLy4uL3V0aWxzL3R5cGVzY3JpcHQvc3ltYm9sJztcblxuLyoqXG4gKiBGaW5kcyBhbGwgdGhlIGFjY2Vzc2VzIG9mIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LmZyYWdtZW50YFxuICogdGhhdCBuZWVkIHRvIGJlIG1pZ3JhdGVkIHdpdGhpbiBhIHBhcnRpY3VsYXIgZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRGcmFnbWVudEFjY2Vzc2VzKFxuICAgIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFNldDx0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24+IHtcbiAgY29uc3QgcmVzdWx0cyA9IG5ldyBTZXQ8dHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uPigpO1xuXG4gIHNvdXJjZUZpbGUuZm9yRWFjaENoaWxkKGZ1bmN0aW9uIHdhbGsobm9kZTogdHMuTm9kZSkge1xuICAgIGlmICh0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlKSAmJiBub2RlLm5hbWUudGV4dCA9PT0gJ2ZyYWdtZW50JyAmJlxuICAgICAgICAhcmVzdWx0cy5oYXMobm9kZSkgJiYgIWlzTnVsbENoZWNrKG5vZGUpICYmICFpc1NhZmVBY2Nlc3Mobm9kZSkgJiZcbiAgICAgICAgaGFzT25lT2ZUeXBlcyh0eXBlQ2hlY2tlciwgbm9kZS5leHByZXNzaW9uLCBbJ0FjdGl2YXRlZFJvdXRlU25hcHNob3QnXSkgJiZcbiAgICAgICAgaXNOdWxsYWJsZVR5cGUodHlwZUNoZWNrZXIsIG5vZGUpKSB7XG4gICAgICByZXN1bHRzLmFkZChub2RlKTtcbiAgICB9XG5cbiAgICBub2RlLmZvckVhY2hDaGlsZCh3YWxrKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKiBNaWdyYXRlcyBhbiBgQWN0aXZhdGVkUm91dGVTbmFwc2hvdC5mcmFnbWVudGAgYWNjZXNzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pZ3JhdGVBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90RnJhZ21lbnQobm9kZTogdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKTogdHMuTm9kZSB7XG4gIC8vIFR1cm5zIGBmb28uZnJhZ21lbnRgIGludG8gYGZvby5mcmFnbWVudCFgLlxuICByZXR1cm4gdHMuY3JlYXRlTm9uTnVsbEV4cHJlc3Npb24obm9kZSk7XG59XG4iXX0=
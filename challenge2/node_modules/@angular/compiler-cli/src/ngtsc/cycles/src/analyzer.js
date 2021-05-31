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
        define("@angular/compiler-cli/src/ngtsc/cycles/src/analyzer", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Cycle = exports.CycleAnalyzer = void 0;
    var tslib_1 = require("tslib");
    /**
     * Analyzes a `ts.Program` for cycles.
     */
    var CycleAnalyzer = /** @class */ (function () {
        function CycleAnalyzer(importGraph) {
            this.importGraph = importGraph;
        }
        /**
         * Check for a cycle to be created in the `ts.Program` by adding an import between `from` and
         * `to`.
         *
         * @returns a `Cycle` object if an import between `from` and `to` would create a cycle; `null`
         *     otherwise.
         */
        CycleAnalyzer.prototype.wouldCreateCycle = function (from, to) {
            // Import of 'from' -> 'to' is illegal if an edge 'to' -> 'from' already exists.
            return this.importGraph.transitiveImportsOf(to).has(from) ?
                new Cycle(this.importGraph, from, to) :
                null;
        };
        /**
         * Record a synthetic import from `from` to `to`.
         *
         * This is an import that doesn't exist in the `ts.Program` but will be considered as part of the
         * import graph for cycle creation.
         */
        CycleAnalyzer.prototype.recordSyntheticImport = function (from, to) {
            this.importGraph.addSyntheticImport(from, to);
        };
        return CycleAnalyzer;
    }());
    exports.CycleAnalyzer = CycleAnalyzer;
    /**
     * Represents an import cycle between `from` and `to` in the program.
     *
     * This class allows us to do the work to compute the cyclic path between `from` and `to` only if
     * needed.
     */
    var Cycle = /** @class */ (function () {
        function Cycle(importGraph, from, to) {
            this.importGraph = importGraph;
            this.from = from;
            this.to = to;
        }
        /**
         * Compute an array of source-files that illustrates the cyclic path between `from` and `to`.
         *
         * Note that a `Cycle` will not be created unless a path is available between `to` and `from`,
         * so `findPath()` will never return `null`.
         */
        Cycle.prototype.getPath = function () {
            return tslib_1.__spreadArray([this.from], tslib_1.__read(this.importGraph.findPath(this.to, this.from)));
        };
        return Cycle;
    }());
    exports.Cycle = Cycle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2N5Y2xlcy9zcmMvYW5hbHl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQU1IOztPQUVHO0lBQ0g7UUFDRSx1QkFBb0IsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBRyxDQUFDO1FBRWhEOzs7Ozs7V0FNRztRQUNILHdDQUFnQixHQUFoQixVQUFpQixJQUFtQixFQUFFLEVBQWlCO1lBQ3JELGdGQUFnRjtZQUNoRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQztRQUNYLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILDZDQUFxQixHQUFyQixVQUFzQixJQUFtQixFQUFFLEVBQWlCO1lBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDSCxvQkFBQztJQUFELENBQUMsQUExQkQsSUEwQkM7SUExQlksc0NBQWE7SUE0QjFCOzs7OztPQUtHO0lBQ0g7UUFDRSxlQUNZLFdBQXdCLEVBQVcsSUFBbUIsRUFBVyxFQUFpQjtZQUFsRixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUFXLFNBQUksR0FBSixJQUFJLENBQWU7WUFBVyxPQUFFLEdBQUYsRUFBRSxDQUFlO1FBQUcsQ0FBQztRQUVsRzs7Ozs7V0FLRztRQUNILHVCQUFPLEdBQVA7WUFDRSw4QkFBUSxJQUFJLENBQUMsSUFBSSxrQkFBSyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsR0FBRTtRQUN4RSxDQUFDO1FBQ0gsWUFBQztJQUFELENBQUMsQUFiRCxJQWFDO0lBYlksc0JBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7SW1wb3J0R3JhcGh9IGZyb20gJy4vaW1wb3J0cyc7XG5cbi8qKlxuICogQW5hbHl6ZXMgYSBgdHMuUHJvZ3JhbWAgZm9yIGN5Y2xlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEN5Y2xlQW5hbHl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGltcG9ydEdyYXBoOiBJbXBvcnRHcmFwaCkge31cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIGEgY3ljbGUgdG8gYmUgY3JlYXRlZCBpbiB0aGUgYHRzLlByb2dyYW1gIGJ5IGFkZGluZyBhbiBpbXBvcnQgYmV0d2VlbiBgZnJvbWAgYW5kXG4gICAqIGB0b2AuXG4gICAqXG4gICAqIEByZXR1cm5zIGEgYEN5Y2xlYCBvYmplY3QgaWYgYW4gaW1wb3J0IGJldHdlZW4gYGZyb21gIGFuZCBgdG9gIHdvdWxkIGNyZWF0ZSBhIGN5Y2xlOyBgbnVsbGBcbiAgICogICAgIG90aGVyd2lzZS5cbiAgICovXG4gIHdvdWxkQ3JlYXRlQ3ljbGUoZnJvbTogdHMuU291cmNlRmlsZSwgdG86IHRzLlNvdXJjZUZpbGUpOiBDeWNsZXxudWxsIHtcbiAgICAvLyBJbXBvcnQgb2YgJ2Zyb20nIC0+ICd0bycgaXMgaWxsZWdhbCBpZiBhbiBlZGdlICd0bycgLT4gJ2Zyb20nIGFscmVhZHkgZXhpc3RzLlxuICAgIHJldHVybiB0aGlzLmltcG9ydEdyYXBoLnRyYW5zaXRpdmVJbXBvcnRzT2YodG8pLmhhcyhmcm9tKSA/XG4gICAgICAgIG5ldyBDeWNsZSh0aGlzLmltcG9ydEdyYXBoLCBmcm9tLCB0bykgOlxuICAgICAgICBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29yZCBhIHN5bnRoZXRpYyBpbXBvcnQgZnJvbSBgZnJvbWAgdG8gYHRvYC5cbiAgICpcbiAgICogVGhpcyBpcyBhbiBpbXBvcnQgdGhhdCBkb2Vzbid0IGV4aXN0IGluIHRoZSBgdHMuUHJvZ3JhbWAgYnV0IHdpbGwgYmUgY29uc2lkZXJlZCBhcyBwYXJ0IG9mIHRoZVxuICAgKiBpbXBvcnQgZ3JhcGggZm9yIGN5Y2xlIGNyZWF0aW9uLlxuICAgKi9cbiAgcmVjb3JkU3ludGhldGljSW1wb3J0KGZyb206IHRzLlNvdXJjZUZpbGUsIHRvOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgdGhpcy5pbXBvcnRHcmFwaC5hZGRTeW50aGV0aWNJbXBvcnQoZnJvbSwgdG8pO1xuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBpbXBvcnQgY3ljbGUgYmV0d2VlbiBgZnJvbWAgYW5kIGB0b2AgaW4gdGhlIHByb2dyYW0uXG4gKlxuICogVGhpcyBjbGFzcyBhbGxvd3MgdXMgdG8gZG8gdGhlIHdvcmsgdG8gY29tcHV0ZSB0aGUgY3ljbGljIHBhdGggYmV0d2VlbiBgZnJvbWAgYW5kIGB0b2Agb25seSBpZlxuICogbmVlZGVkLlxuICovXG5leHBvcnQgY2xhc3MgQ3ljbGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaW1wb3J0R3JhcGg6IEltcG9ydEdyYXBoLCByZWFkb25seSBmcm9tOiB0cy5Tb3VyY2VGaWxlLCByZWFkb25seSB0bzogdHMuU291cmNlRmlsZSkge31cblxuICAvKipcbiAgICogQ29tcHV0ZSBhbiBhcnJheSBvZiBzb3VyY2UtZmlsZXMgdGhhdCBpbGx1c3RyYXRlcyB0aGUgY3ljbGljIHBhdGggYmV0d2VlbiBgZnJvbWAgYW5kIGB0b2AuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBhIGBDeWNsZWAgd2lsbCBub3QgYmUgY3JlYXRlZCB1bmxlc3MgYSBwYXRoIGlzIGF2YWlsYWJsZSBiZXR3ZWVuIGB0b2AgYW5kIGBmcm9tYCxcbiAgICogc28gYGZpbmRQYXRoKClgIHdpbGwgbmV2ZXIgcmV0dXJuIGBudWxsYC5cbiAgICovXG4gIGdldFBhdGgoKTogdHMuU291cmNlRmlsZVtdIHtcbiAgICByZXR1cm4gW3RoaXMuZnJvbSwgLi4udGhpcy5pbXBvcnRHcmFwaC5maW5kUGF0aCh0aGlzLnRvLCB0aGlzLmZyb20pIV07XG4gIH1cbn1cblxuXG4vKipcbiAqIFdoYXQgdG8gZG8gaWYgYSBjeWNsZSBpcyBkZXRlY3RlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQ3ljbGVIYW5kbGluZ1N0cmF0ZWd5IHtcbiAgLyoqIEFkZCBcInJlbW90ZSBzY29waW5nXCIgY29kZSB0byBhdm9pZCBjcmVhdGluZyBhIGN5Y2xlLiAqL1xuICBVc2VSZW1vdGVTY29waW5nLFxuICAvKiogRmFpbCB0aGUgY29tcGlsYXRpb24gd2l0aCBhbiBlcnJvci4gKi9cbiAgRXJyb3IsXG59XG4iXX0=
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
        define("@angular/compiler-cli/src/ngtsc/cycles/src/imports", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/perf"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImportGraph = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    /**
     * A cached graph of imports in the `ts.Program`.
     *
     * The `ImportGraph` keeps track of dependencies (imports) of individual `ts.SourceFile`s. Only
     * dependencies within the same program are tracked; imports into packages on NPM are not.
     */
    var ImportGraph = /** @class */ (function () {
        function ImportGraph(checker, perf) {
            this.checker = checker;
            this.perf = perf;
            this.map = new Map();
        }
        /**
         * List the direct (not transitive) imports of a given `ts.SourceFile`.
         *
         * This operation is cached.
         */
        ImportGraph.prototype.importsOf = function (sf) {
            if (!this.map.has(sf)) {
                this.map.set(sf, this.scanImports(sf));
            }
            return this.map.get(sf);
        };
        /**
         * Lists the transitive imports of a given `ts.SourceFile`.
         */
        ImportGraph.prototype.transitiveImportsOf = function (sf) {
            var imports = new Set();
            this.transitiveImportsOfHelper(sf, imports);
            return imports;
        };
        ImportGraph.prototype.transitiveImportsOfHelper = function (sf, results) {
            var _this = this;
            if (results.has(sf)) {
                return;
            }
            results.add(sf);
            this.importsOf(sf).forEach(function (imported) {
                _this.transitiveImportsOfHelper(imported, results);
            });
        };
        /**
         * Find an import path from the `start` SourceFile to the `end` SourceFile.
         *
         * This function implements a breadth first search that results in finding the
         * shortest path between the `start` and `end` points.
         *
         * @param start the starting point of the path.
         * @param end the ending point of the path.
         * @returns an array of source files that connect the `start` and `end` source files, or `null` if
         *     no path could be found.
         */
        ImportGraph.prototype.findPath = function (start, end) {
            var e_1, _a;
            if (start === end) {
                // Escape early for the case where `start` and `end` are the same.
                return [start];
            }
            var found = new Set([start]);
            var queue = [new Found(start, null)];
            while (queue.length > 0) {
                var current = queue.shift();
                var imports = this.importsOf(current.sourceFile);
                try {
                    for (var imports_1 = (e_1 = void 0, tslib_1.__values(imports)), imports_1_1 = imports_1.next(); !imports_1_1.done; imports_1_1 = imports_1.next()) {
                        var importedFile = imports_1_1.value;
                        if (!found.has(importedFile)) {
                            var next = new Found(importedFile, current);
                            if (next.sourceFile === end) {
                                // We have hit the target `end` path so we can stop here.
                                return next.toPath();
                            }
                            found.add(importedFile);
                            queue.push(next);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (imports_1_1 && !imports_1_1.done && (_a = imports_1.return)) _a.call(imports_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return null;
        };
        /**
         * Add a record of an import from `sf` to `imported`, that's not present in the original
         * `ts.Program` but will be remembered by the `ImportGraph`.
         */
        ImportGraph.prototype.addSyntheticImport = function (sf, imported) {
            if (isLocalFile(imported)) {
                this.importsOf(sf).add(imported);
            }
        };
        ImportGraph.prototype.scanImports = function (sf) {
            var _this = this;
            return this.perf.inPhase(perf_1.PerfPhase.CycleDetection, function () {
                var e_2, _a;
                var imports = new Set();
                try {
                    // Look through the source file for import and export statements.
                    for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var stmt = _c.value;
                        if ((!ts.isImportDeclaration(stmt) && !ts.isExportDeclaration(stmt)) ||
                            stmt.moduleSpecifier === undefined) {
                            continue;
                        }
                        var symbol = _this.checker.getSymbolAtLocation(stmt.moduleSpecifier);
                        if (symbol === undefined || symbol.valueDeclaration === undefined) {
                            // No symbol could be found to skip over this import/export.
                            continue;
                        }
                        var moduleFile = symbol.valueDeclaration;
                        if (ts.isSourceFile(moduleFile) && isLocalFile(moduleFile)) {
                            // Record this local import.
                            imports.add(moduleFile);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return imports;
            });
        };
        return ImportGraph;
    }());
    exports.ImportGraph = ImportGraph;
    function isLocalFile(sf) {
        return !sf.isDeclarationFile;
    }
    /**
     * A helper class to track which SourceFiles are being processed when searching for a path in
     * `getPath()` above.
     */
    var Found = /** @class */ (function () {
        function Found(sourceFile, parent) {
            this.sourceFile = sourceFile;
            this.parent = parent;
        }
        /**
         * Back track through this found SourceFile and its ancestors to generate an array of
         * SourceFiles that form am import path between two SourceFiles.
         */
        Found.prototype.toPath = function () {
            var array = [];
            var current = this;
            while (current !== null) {
                array.push(current.sourceFile);
                current = current.parent;
            }
            // Pushing and then reversing, O(n), rather than unshifting repeatedly, O(n^2), avoids
            // manipulating the array on every iteration: https://stackoverflow.com/a/26370620
            return array.reverse();
        };
        return Found;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvY3ljbGVzL3NyYy9pbXBvcnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsNkRBQW1EO0lBRW5EOzs7OztPQUtHO0lBQ0g7UUFHRSxxQkFBb0IsT0FBdUIsRUFBVSxJQUFrQjtZQUFuRCxZQUFPLEdBQVAsT0FBTyxDQUFnQjtZQUFVLFNBQUksR0FBSixJQUFJLENBQWM7WUFGL0QsUUFBRyxHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO1FBRWUsQ0FBQztRQUUzRTs7OztXQUlHO1FBQ0gsK0JBQVMsR0FBVCxVQUFVLEVBQWlCO1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN4QztZQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVEOztXQUVHO1FBQ0gseUNBQW1CLEdBQW5CLFVBQW9CLEVBQWlCO1lBQ25DLElBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1lBQ3pDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUMsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUVPLCtDQUF5QixHQUFqQyxVQUFrQyxFQUFpQixFQUFFLE9BQTJCO1lBQWhGLGlCQVFDO1lBUEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNu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O3lCQUNWO3dCQUNELElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDM0MsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRTs0QkFDMUQsNEJBQTRCOzRCQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lCQUN6QjtxQkFDRjs7Ozs7Ozs7O2dCQUNELE9BQU8sT0FBTyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNILGtCQUFDO0lBQUQsQ0FBQyxBQTVHRCxJQTRHQztJQTVHWSxrQ0FBVztJQThHeEIsU0FBUyxXQUFXLENBQUMsRUFBaUI7UUFDcEMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUMvQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0g7UUFDRSxlQUFxQixVQUF5QixFQUFXLE1BQWtCO1lBQXRELGVBQVUsR0FBVixVQUFVLENBQWU7WUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFZO1FBQUcsQ0FBQztRQUUvRTs7O1dBR0c7UUFDSCxzQkFBTSxHQUFOO1lBQ0UsSUFBTSxLQUFLLEdBQW9CLEVBQUUsQ0FBQztZQUNsQyxJQUFJLE9BQU8sR0FBZSxJQUFJLENBQUM7WUFDL0IsT0FBTyxPQUFPLEtBQUssSUFBSSxFQUFFO2dCQUN2QixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7YUFDMUI7WUFDRCxzRkFBc0Y7WUFDdEYsa0ZBQWtGO1lBQ2xGLE9BQU8sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFDSCxZQUFDO0lBQUQsQ0FBQyxBQWxCRCxJQWtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtQZXJmUGhhc2UsIFBlcmZSZWNvcmRlcn0gZnJvbSAnLi4vLi4vcGVyZic7XG5cbi8qKlxuICogQSBjYWNoZWQgZ3JhcGggb2YgaW1wb3J0cyBpbiB0aGUgYHRzLlByb2dyYW1gLlxuICpcbiAqIFRoZSBgSW1wb3J0R3JhcGhgIGtlZXBzIHRyYWNrIG9mIGRlcGVuZGVuY2llcyAoaW1wb3J0cykgb2YgaW5kaXZpZHVhbCBgdHMuU291cmNlRmlsZWBzLiBPbmx5XG4gKiBkZXBlbmRlbmNpZXMgd2l0aGluIHRoZSBzYW1lIHByb2dyYW0gYXJlIHRyYWNrZWQ7IGltcG9ydHMgaW50byBwYWNrYWdlcyBvbiBOUE0gYXJlIG5vdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEltcG9ydEdyYXBoIHtcbiAgcHJpdmF0ZSBtYXAgPSBuZXcgTWFwPHRzLlNvdXJjZUZpbGUsIFNldDx0cy5Tb3VyY2VGaWxlPj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIHBlcmY6IFBlcmZSZWNvcmRlcikge31cblxuICAvKipcbiAgICogTGlzdCB0aGUgZGlyZWN0IChub3QgdHJhbnNpdGl2ZSkgaW1wb3J0cyBvZiBhIGdpdmVuIGB0cy5Tb3VyY2VGaWxlYC5cbiAgICpcbiAgICogVGhpcyBvcGVyYXRpb24gaXMgY2FjaGVkLlxuICAgKi9cbiAgaW1wb3J0c09mKHNmOiB0cy5Tb3VyY2VGaWxlKTogU2V0PHRzLlNvdXJjZUZpbGU+IHtcbiAgICBpZiAoIXRoaXMubWFwLmhhcyhzZikpIHtcbiAgICAgIHRoaXMubWFwLnNldChzZiwgdGhpcy5zY2FuSW1wb3J0cyhzZikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KHNmKSE7XG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIHRyYW5zaXRpdmUgaW1wb3J0cyBvZiBhIGdpdmVuIGB0cy5Tb3VyY2VGaWxlYC5cbiAgICovXG4gIHRyYW5zaXRpdmVJbXBvcnRzT2Yoc2Y6IHRzLlNvdXJjZUZpbGUpOiBTZXQ8dHMuU291cmNlRmlsZT4ge1xuICAgIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHRzLlNvdXJjZUZpbGU+KCk7XG4gICAgdGhpcy50cmFuc2l0aXZlSW1wb3J0c09mSGVscGVyKHNmLCBpbXBvcnRzKTtcbiAgICByZXR1cm4gaW1wb3J0cztcbiAgfVxuXG4gIHByaXZhdGUgdHJhbnNpdGl2ZUltcG9ydHNPZkhlbHBlcihzZjogdHMuU291cmNlRmlsZSwgcmVzdWx0czogU2V0PHRzLlNvdXJjZUZpbGU+KTogdm9pZCB7XG4gICAgaWYgKHJlc3VsdHMuaGFzKHNmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXN1bHRzLmFkZChzZik7XG4gICAgdGhpcy5pbXBvcnRzT2Yoc2YpLmZvckVhY2goaW1wb3J0ZWQgPT4ge1xuICAgICAgdGhpcy50cmFuc2l0aXZlSW1wb3J0c09mSGVscGVyKGltcG9ydGVkLCByZXN1bHRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGFuIGltcG9ydCBwYXRoIGZyb20gdGhlIGBzdGFydGAgU291cmNlRmlsZSB0byB0aGUgYGVuZGAgU291cmNlRmlsZS5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpbXBsZW1lbnRzIGEgYnJlYWR0aCBmaXJzdCBzZWFyY2ggdGhhdCByZXN1bHRzIGluIGZpbmRpbmcgdGhlXG4gICAqIHNob3J0ZXN0IHBhdGggYmV0d2VlbiB0aGUgYHN0YXJ0YCBhbmQgYGVuZGAgcG9pbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgdGhlIHN0YXJ0aW5nIHBvaW50IG9mIHRoZSBwYXRoLlxuICAgKiBAcGFyYW0gZW5kIHRoZSBlbmRpbmcgcG9pbnQgb2YgdGhlIHBhdGguXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHNvdXJjZSBmaWxlcyB0aGF0IGNvbm5lY3QgdGhlIGBzdGFydGAgYW5kIGBlbmRgIHNvdXJjZSBmaWxlcywgb3IgYG51bGxgIGlmXG4gICAqICAgICBubyBwYXRoIGNvdWxkIGJlIGZvdW5kLlxuICAgKi9cbiAgZmluZFBhdGgoc3RhcnQ6IHRzLlNvdXJjZUZpbGUsIGVuZDogdHMuU291cmNlRmlsZSk6IHRzLlNvdXJjZUZpbGVbXXxudWxsIHtcbiAgICBpZiAoc3RhcnQgPT09IGVuZCkge1xuICAgICAgLy8gRXNjYXBlIGVhcmx5IGZvciB0aGUgY2FzZSB3aGVyZSBgc3RhcnRgIGFuZCBgZW5kYCBhcmUgdGhlIHNhbWUuXG4gICAgICByZXR1cm4gW3N0YXJ0XTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3VuZCA9IG5ldyBTZXQ8dHMuU291cmNlRmlsZT4oW3N0YXJ0XSk7XG4gICAgY29uc3QgcXVldWU6IEZvdW5kW10gPSBbbmV3IEZvdW5kKHN0YXJ0LCBudWxsKV07XG5cbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY3VycmVudCA9IHF1ZXVlLnNoaWZ0KCkhO1xuICAgICAgY29uc3QgaW1wb3J0cyA9IHRoaXMuaW1wb3J0c09mKGN1cnJlbnQuc291cmNlRmlsZSk7XG4gICAgICBmb3IgKGNvbnN0IGltcG9ydGVkRmlsZSBvZiBpbXBvcnRzKSB7XG4gICAgICAgIGlmICghZm91bmQuaGFzKGltcG9ydGVkRmlsZSkpIHtcbiAgICAgICAgICBjb25zdCBuZXh0ID0gbmV3IEZvdW5kKGltcG9ydGVkRmlsZSwgY3VycmVudCk7XG4gICAgICAgICAgaWYgKG5leHQuc291cmNlRmlsZSA9PT0gZW5kKSB7XG4gICAgICAgICAgICAvLyBXZSBoYXZlIGhpdCB0aGUgdGFyZ2V0IGBlbmRgIHBhdGggc28gd2UgY2FuIHN0b3AgaGVyZS5cbiAgICAgICAgICAgIHJldHVybiBuZXh0LnRvUGF0aCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3VuZC5hZGQoaW1wb3J0ZWRGaWxlKTtcbiAgICAgICAgICBxdWV1ZS5wdXNoKG5leHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlY29yZCBvZiBhbiBpbXBvcnQgZnJvbSBgc2ZgIHRvIGBpbXBvcnRlZGAsIHRoYXQncyBub3QgcHJlc2VudCBpbiB0aGUgb3JpZ2luYWxcbiAgICogYHRzLlByb2dyYW1gIGJ1dCB3aWxsIGJlIHJlbWVtYmVyZWQgYnkgdGhlIGBJbXBvcnRHcmFwaGAuXG4gICAqL1xuICBhZGRTeW50aGV0aWNJbXBvcnQoc2Y6IHRzLlNvdXJjZUZpbGUsIGltcG9ydGVkOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgaWYgKGlzTG9jYWxGaWxlKGltcG9ydGVkKSkge1xuICAgICAgdGhpcy5pbXBvcnRzT2Yoc2YpLmFkZChpbXBvcnRlZCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY2FuSW1wb3J0cyhzZjogdHMuU291cmNlRmlsZSk6IFNldDx0cy5Tb3VyY2VGaWxlPiB7XG4gICAgcmV0dXJuIHRoaXMucGVyZi5pblBoYXNlKFBlcmZQaGFzZS5DeWNsZURldGVjdGlvbiwgKCkgPT4ge1xuICAgICAgY29uc3QgaW1wb3J0cyA9IG5ldyBTZXQ8dHMuU291cmNlRmlsZT4oKTtcbiAgICAgIC8vIExvb2sgdGhyb3VnaCB0aGUgc291cmNlIGZpbGUgZm9yIGltcG9ydCBhbmQgZXhwb3J0IHN0YXRlbWVudHMuXG4gICAgICBmb3IgKGNvbnN0IHN0bXQgb2Ygc2Yuc3RhdGVtZW50cykge1xuICAgICAgICBpZiAoKCF0cy5pc0ltcG9ydERlY2xhcmF0aW9uKHN0bXQpICYmICF0cy5pc0V4cG9ydERlY2xhcmF0aW9uKHN0bXQpKSB8fFxuICAgICAgICAgICAgc3RtdC5tb2R1bGVTcGVjaWZpZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3ltYm9sID0gdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oc3RtdC5tb2R1bGVTcGVjaWZpZXIpO1xuICAgICAgICBpZiAoc3ltYm9sID09PSB1bmRlZmluZWQgfHwgc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIE5vIHN5bWJvbCBjb3VsZCBiZSBmb3VuZCB0byBza2lwIG92ZXIgdGhpcyBpbXBvcnQvZXhwb3J0LlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1vZHVsZUZpbGUgPSBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbjtcbiAgICAgICAgaWYgKHRzLmlzU291cmNlRmlsZShtb2R1bGVGaWxlKSAmJiBpc0xvY2FsRmlsZShtb2R1bGVGaWxlKSkge1xuICAgICAgICAgIC8vIFJlY29yZCB0aGlzIGxvY2FsIGltcG9ydC5cbiAgICAgICAgICBpbXBvcnRzLmFkZChtb2R1bGVGaWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGltcG9ydHM7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNMb2NhbEZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiBib29sZWFuIHtcbiAgcmV0dXJuICFzZi5pc0RlY2xhcmF0aW9uRmlsZTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBjbGFzcyB0byB0cmFjayB3aGljaCBTb3VyY2VGaWxlcyBhcmUgYmVpbmcgcHJvY2Vzc2VkIHdoZW4gc2VhcmNoaW5nIGZvciBhIHBhdGggaW5cbiAqIGBnZXRQYXRoKClgIGFib3ZlLlxuICovXG5jbGFzcyBGb3VuZCB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHJlYWRvbmx5IHBhcmVudDogRm91bmR8bnVsbCkge31cblxuICAvKipcbiAgICogQmFjayB0cmFjayB0aHJvdWdoIHRoaXMgZm91bmQgU291cmNlRmlsZSBhbmQgaXRzIGFuY2VzdG9ycyB0byBnZW5lcmF0ZSBhbiBhcnJheSBvZlxuICAgKiBTb3VyY2VGaWxlcyB0aGF0IGZvcm0gYW0gaW1wb3J0IHBhdGggYmV0d2VlbiB0d28gU291cmNlRmlsZXMuXG4gICAqL1xuICB0b1BhdGgoKTogdHMuU291cmNlRmlsZVtdIHtcbiAgICBjb25zdCBhcnJheTogdHMuU291cmNlRmlsZVtdID0gW107XG4gICAgbGV0IGN1cnJlbnQ6IEZvdW5kfG51bGwgPSB0aGlzO1xuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICBhcnJheS5wdXNoKGN1cnJlbnQuc291cmNlRmlsZSk7XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgfVxuICAgIC8vIFB1c2hpbmcgYW5kIHRoZW4gcmV2ZXJzaW5nLCBPKG4pLCByYXRoZXIgdGhhbiB1bnNoaWZ0aW5nIHJlcGVhdGVkbHksIE8obl4yKSwgYXZvaWRzXG4gICAgLy8gbWFuaXB1bGF0aW5nIHRoZSBhcnJheSBvbiBldmVyeSBpdGVyYXRpb246IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjM3MDYyMFxuICAgIHJldHVybiBhcnJheS5yZXZlcnNlKCk7XG4gIH1cbn1cbiJdfQ==
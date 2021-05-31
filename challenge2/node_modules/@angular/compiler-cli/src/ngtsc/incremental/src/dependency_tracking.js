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
        define("@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileDependencyGraph = void 0;
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    /**
     * An implementation of the `DependencyTracker` dependency graph API.
     *
     * The `FileDependencyGraph`'s primary job is to determine whether a given file has "logically"
     * changed, given the set of physical changes (direct changes to files on disk).
     *
     * A file is logically changed if at least one of three conditions is met:
     *
     * 1. The file itself has physically changed.
     * 2. One of its dependencies has physically changed.
     * 3. One of its resource dependencies has physically changed.
     */
    var FileDependencyGraph = /** @class */ (function () {
        function FileDependencyGraph() {
            this.nodes = new Map();
        }
        FileDependencyGraph.prototype.addDependency = function (from, on) {
            this.nodeFor(from).dependsOn.add(file_system_1.absoluteFromSourceFile(on));
        };
        FileDependencyGraph.prototype.addResourceDependency = function (from, resource) {
            this.nodeFor(from).usesResources.add(resource);
        };
        FileDependencyGraph.prototype.recordDependencyAnalysisFailure = function (file) {
            this.nodeFor(file).failedAnalysis = true;
        };
        FileDependencyGraph.prototype.getResourceDependencies = function (from) {
            var node = this.nodes.get(from);
            return node ? tslib_1.__spreadArray([], tslib_1.__read(node.usesResources)) : [];
        };
        /**
         * Update the current dependency graph from a previous one, incorporating a set of physical
         * changes.
         *
         * This method performs two tasks:
         *
         * 1. For files which have not logically changed, their dependencies from `previous` are added to
         *    `this` graph.
         * 2. For files which have logically changed, they're added to a set of logically changed files
         *    which is eventually returned.
         *
         * In essence, for build `n`, this method performs:
         *
         * G(n) + L(n) = G(n - 1) + P(n)
         *
         * where:
         *
         * G(n) = the dependency graph of build `n`
         * L(n) = the logically changed files from build n - 1 to build n.
         * P(n) = the physically changed files from build n - 1 to build n.
         */
        FileDependencyGraph.prototype.updateWithPhysicalChanges = function (previous, changedTsPaths, deletedTsPaths, changedResources) {
            var e_1, _a;
            var logicallyChanged = new Set();
            try {
                for (var _b = tslib_1.__values(previous.nodes.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sf = _c.value;
                    var sfPath = file_system_1.absoluteFromSourceFile(sf);
                    var node = previous.nodeFor(sf);
                    if (isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources)) {
                        logicallyChanged.add(sfPath);
                    }
                    else if (!deletedTsPaths.has(sfPath)) {
                        this.nodes.set(sf, {
                            dependsOn: new Set(node.dependsOn),
                            usesResources: new Set(node.usesResources),
                            failedAnalysis: false,
                        });
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return logicallyChanged;
        };
        FileDependencyGraph.prototype.nodeFor = function (sf) {
            if (!this.nodes.has(sf)) {
                this.nodes.set(sf, {
                    dependsOn: new Set(),
                    usesResources: new Set(),
                    failedAnalysis: false,
                });
            }
            return this.nodes.get(sf);
        };
        return FileDependencyGraph;
    }());
    exports.FileDependencyGraph = FileDependencyGraph;
    /**
     * Determine whether `sf` has logically changed, given its dependencies and the set of physically
     * changed files and resources.
     */
    function isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources) {
        var e_2, _a, e_3, _b;
        // A file is assumed to have logically changed if its dependencies could not be determined
        // accurately.
        if (node.failedAnalysis) {
            return true;
        }
        var sfPath = file_system_1.absoluteFromSourceFile(sf);
        // A file is logically changed if it has physically changed itself (including being deleted).
        if (changedTsPaths.has(sfPath) || deletedTsPaths.has(sfPath)) {
            return true;
        }
        try {
            // A file is logically changed if one of its dependencies has physically changed.
            for (var _c = tslib_1.__values(node.dependsOn), _d = _c.next(); !_d.done; _d = _c.next()) {
                var dep = _d.value;
                if (changedTsPaths.has(dep) || deletedTsPaths.has(dep)) {
                    return true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            // A file is logically changed if one of its resources has physically changed.
            for (var _e = tslib_1.__values(node.usesResources), _f = _e.next(); !_f.done; _f = _e.next()) {
                var dep = _f.value;
                if (changedResources.has(dep)) {
                    return true;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return false;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeV90cmFja2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvaW5jcmVtZW50YWwvc3JjL2RlcGVuZGVuY3lfdHJhY2tpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILDJFQUF5RTtJQUd6RTs7Ozs7Ozs7Ozs7T0FXRztJQUNIO1FBQUE7WUFFVSxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQTBFekMsQ0FBQztRQXhFQywyQ0FBYSxHQUFiLFVBQWMsSUFBTyxFQUFFLEVBQUs7WUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELG1EQUFxQixHQUFyQixVQUFzQixJQUFPLEVBQUUsUUFBd0I7WUFDckQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCw2REFBK0IsR0FBL0IsVUFBZ0MsSUFBTztZQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDM0MsQ0FBQztRQUVELHFEQUF1QixHQUF2QixVQUF3QixJQUFPO1lBQzdCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxDLE9BQU8sSUFBSSxDQUFDLENBQUMsMENBQUssSUFBSSxDQUFDLGFBQWEsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdDLENBQUM7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FvQkc7UUFDSCx1REFB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LENBQUM7aUJBQ2I7YUFDRjs7Ozs7Ozs7O1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbVNvdXJjZUZpbGUsIEFic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0RlcGVuZGVuY3lUcmFja2VyfSBmcm9tICcuLi9hcGknO1xuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBgRGVwZW5kZW5jeVRyYWNrZXJgIGRlcGVuZGVuY3kgZ3JhcGggQVBJLlxuICpcbiAqIFRoZSBgRmlsZURlcGVuZGVuY3lHcmFwaGAncyBwcmltYXJ5IGpvYiBpcyB0byBkZXRlcm1pbmUgd2hldGhlciBhIGdpdmVuIGZpbGUgaGFzIFwibG9naWNhbGx5XCJcbiAqIGNoYW5nZWQsIGdpdmVuIHRoZSBzZXQgb2YgcGh5c2ljYWwgY2hhbmdlcyAoZGlyZWN0IGNoYW5nZXMgdG8gZmlsZXMgb24gZGlzaykuXG4gKlxuICogQSBmaWxlIGlzIGxvZ2ljYWxseSBjaGFuZ2VkIGlmIGF0IGxlYXN0IG9uZSBvZiB0aHJlZSBjb25kaXRpb25zIGlzIG1ldDpcbiAqXG4gKiAxLiBUaGUgZmlsZSBpdHNlbGYgaGFzIHBoeXNpY2FsbHkgY2hhbmdlZC5cbiAqIDIuIE9uZSBvZiBpdHMgZGVwZW5kZW5jaWVzIGhhcyBwaHlzaWNhbGx5IGNoYW5nZWQuXG4gKiAzLiBPbmUgb2YgaXRzIHJlc291cmNlIGRlcGVuZGVuY2llcyBoYXMgcGh5c2ljYWxseSBjaGFuZ2VkLlxuICovXG5leHBvcnQgY2xhc3MgRmlsZURlcGVuZGVuY3lHcmFwaDxUIGV4dGVuZHMge2ZpbGVOYW1lOiBzdHJpbmd9ID0gdHMuU291cmNlRmlsZT4gaW1wbGVtZW50c1xuICAgIERlcGVuZGVuY3lUcmFja2VyPFQ+IHtcbiAgcHJpdmF0ZSBub2RlcyA9IG5ldyBNYXA8VCwgRmlsZU5vZGU+KCk7XG5cbiAgYWRkRGVwZW5kZW5jeShmcm9tOiBULCBvbjogVCk6IHZvaWQge1xuICAgIHRoaXMubm9kZUZvcihmcm9tKS5kZXBlbmRzT24uYWRkKGFic29sdXRlRnJvbVNvdXJjZUZpbGUob24pKTtcbiAgfVxuXG4gIGFkZFJlc291cmNlRGVwZW5kZW5jeShmcm9tOiBULCByZXNvdXJjZTogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICB0aGlzLm5vZGVGb3IoZnJvbSkudXNlc1Jlc291cmNlcy5hZGQocmVzb3VyY2UpO1xuICB9XG5cbiAgcmVjb3JkRGVwZW5kZW5jeUFuYWx5c2lzRmFpbHVyZShmaWxlOiBUKTogdm9pZCB7XG4gICAgdGhpcy5ub2RlRm9yKGZpbGUpLmZhaWxlZEFuYWx5c2lzID0gdHJ1ZTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVwZW5kZW5jaWVzKGZyb206IFQpOiBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5ub2Rlcy5nZXQoZnJvbSk7XG5cbiAgICByZXR1cm4gbm9kZSA/IFsuLi5ub2RlLnVzZXNSZXNvdXJjZXNdIDogW107XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjdXJyZW50IGRlcGVuZGVuY3kgZ3JhcGggZnJvbSBhIHByZXZpb3VzIG9uZSwgaW5jb3Jwb3JhdGluZyBhIHNldCBvZiBwaHlzaWNhbFxuICAgKiBjaGFuZ2VzLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBwZXJmb3JtcyB0d28gdGFza3M6XG4gICAqXG4gICAqIDEuIEZvciBmaWxlcyB3aGljaCBoYXZlIG5vdCBsb2dpY2FsbHkgY2hhbmdlZCwgdGhlaXIgZGVwZW5kZW5jaWVzIGZyb20gYHByZXZpb3VzYCBhcmUgYWRkZWQgdG9cbiAgICogICAgYHRoaXNgIGdyYXBoLlxuICAgKiAyLiBGb3IgZmlsZXMgd2hpY2ggaGF2ZSBsb2dpY2FsbHkgY2hhbmdlZCwgdGhleSdyZSBhZGRlZCB0byBhIHNldCBvZiBsb2dpY2FsbHkgY2hhbmdlZCBmaWxlc1xuICAgKiAgICB3aGljaCBpcyBldmVudHVhbGx5IHJldHVybmVkLlxuICAgKlxuICAgKiBJbiBlc3NlbmNlLCBmb3IgYnVpbGQgYG5gLCB0aGlzIG1ldGhvZCBwZXJmb3JtczpcbiAgICpcbiAgICogRyhuKSArIEwobikgPSBHKG4gLSAxKSArIFAobilcbiAgICpcbiAgICogd2hlcmU6XG4gICAqXG4gICAqIEcobikgPSB0aGUgZGVwZW5kZW5jeSBncmFwaCBvZiBidWlsZCBgbmBcbiAgICogTChuKSA9IHRoZSBsb2dpY2FsbHkgY2hhbmdlZCBmaWxlcyBmcm9tIGJ1aWxkIG4gLSAxIHRvIGJ1aWxkIG4uXG4gICAqIFAobikgPSB0aGUgcGh5c2ljYWxseSBjaGFuZ2VkIGZpbGVzIGZyb20gYnVpbGQgbiAtIDEgdG8gYnVpbGQgbi5cbiAgICovXG4gIHVwZGF0ZVdpdGhQaHlzaWNhbENoYW5nZXMoXG4gICAgICBwcmV2aW91czogRmlsZURlcGVuZGVuY3lHcmFwaDxUPiwgY2hhbmdlZFRzUGF0aHM6IFNldDxBYnNvbHV0ZUZzUGF0aD4sXG4gICAgICBkZWxldGVkVHNQYXRoczogU2V0PEFic29sdXRlRnNQYXRoPixcbiAgICAgIGNoYW5nZWRSZXNvdXJjZXM6IFNldDxBYnNvbHV0ZUZzUGF0aD4pOiBTZXQ8QWJzb2x1dGVGc1BhdGg+IHtcbiAgICBjb25zdCBsb2dpY2FsbHlDaGFuZ2VkID0gbmV3IFNldDxBYnNvbHV0ZUZzUGF0aD4oKTtcblxuICAgIGZvciAoY29uc3Qgc2Ygb2YgcHJldmlvdXMubm9kZXMua2V5cygpKSB7XG4gICAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICAgIGNvbnN0IG5vZGUgPSBwcmV2aW91cy5ub2RlRm9yKHNmKTtcbiAgICAgIGlmIChpc0xvZ2ljYWxseUNoYW5nZWQoc2YsIG5vZGUsIGNoYW5nZWRUc1BhdGhzLCBkZWxldGVkVHNQYXRocywgY2hhbmdlZFJlc291cmNlcykpIHtcbiAgICAgICAgbG9naWNhbGx5Q2hhbmdlZC5hZGQoc2ZQYXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoIWRlbGV0ZWRUc1BhdGhzLmhhcyhzZlBhdGgpKSB7XG4gICAgICAgIHRoaXMubm9kZXMuc2V0KHNmLCB7XG4gICAgICAgICAgZGVwZW5kc09uOiBuZXcgU2V0KG5vZGUuZGVwZW5kc09uKSxcbiAgICAgICAgICB1c2VzUmVzb3VyY2VzOiBuZXcgU2V0KG5vZGUudXNlc1Jlc291cmNlcyksXG4gICAgICAgICAgZmFpbGVkQW5hbHlzaXM6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9naWNhbGx5Q2hhbmdlZDtcbiAgfVxuXG4gIHByaXZhdGUgbm9kZUZvcihzZjogVCk6IEZpbGVOb2RlIHtcbiAgICBpZiAoIXRoaXMubm9kZXMuaGFzKHNmKSkge1xuICAgICAgdGhpcy5ub2Rlcy5zZXQoc2YsIHtcbiAgICAgICAgZGVwZW5kc09uOiBuZXcgU2V0PEFic29sdXRlRnNQYXRoPigpLFxuICAgICAgICB1c2VzUmVzb3VyY2VzOiBuZXcgU2V0PEFic29sdXRlRnNQYXRoPigpLFxuICAgICAgICBmYWlsZWRBbmFseXNpczogZmFsc2UsXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubm9kZXMuZ2V0KHNmKSE7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hldGhlciBgc2ZgIGhhcyBsb2dpY2FsbHkgY2hhbmdlZCwgZ2l2ZW4gaXRzIGRlcGVuZGVuY2llcyBhbmQgdGhlIHNldCBvZiBwaHlzaWNhbGx5XG4gKiBjaGFuZ2VkIGZpbGVzIGFuZCByZXNvdXJjZXMuXG4gKi9cbmZ1bmN0aW9uIGlzTG9naWNhbGx5Q2hhbmdlZDxUIGV4dGVuZHMge2ZpbGVOYW1lOiBzdHJpbmd9PihcbiAgICBzZjogVCwgbm9kZTogRmlsZU5vZGUsIGNoYW5nZWRUc1BhdGhzOiBSZWFkb25seVNldDxBYnNvbHV0ZUZzUGF0aD4sXG4gICAgZGVsZXRlZFRzUGF0aHM6IFJlYWRvbmx5U2V0PEFic29sdXRlRnNQYXRoPixcbiAgICBjaGFuZ2VkUmVzb3VyY2VzOiBSZWFkb25seVNldDxBYnNvbHV0ZUZzUGF0aD4pOiBib29sZWFuIHtcbiAgLy8gQSBmaWxlIGlzIGFzc3VtZWQgdG8gaGF2ZSBsb2dpY2FsbHkgY2hhbmdlZCBpZiBpdHMgZGVwZW5kZW5jaWVzIGNvdWxkIG5vdCBiZSBkZXRlcm1pbmVkXG4gIC8vIGFjY3VyYXRlbHkuXG4gIGlmIChub2RlLmZhaWxlZEFuYWx5c2lzKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcblxuICAvLyBBIGZpbGUgaXMgbG9naWNhbGx5IGNoYW5nZWQgaWYgaXQgaGFzIHBoeXNpY2FsbHkgY2hhbmdlZCBpdHNlbGYgKGluY2x1ZGluZyBiZWluZyBkZWxldGVkKS5cbiAgaWYgKGNoYW5nZWRUc1BhdGhzLmhhcyhzZlBhdGgpIHx8IGRlbGV0ZWRUc1BhdGhzLmhhcyhzZlBhdGgpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBBIGZpbGUgaXMgbG9naWNhbGx5IGNoYW5nZWQgaWYgb25lIG9mIGl0cyBkZXBlbmRlbmNpZXMgaGFzIHBoeXNpY2FsbHkgY2hhbmdlZC5cbiAgZm9yIChjb25zdCBkZXAgb2Ygbm9kZS5kZXBlbmRzT24pIHtcbiAgICBpZiAoY2hhbmdlZFRzUGF0aHMuaGFzKGRlcCkgfHwgZGVsZXRlZFRzUGF0aHMuaGFzKGRlcCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEEgZmlsZSBpcyBsb2dpY2FsbHkgY2hhbmdlZCBpZiBvbmUgb2YgaXRzIHJlc291cmNlcyBoYXMgcGh5c2ljYWxseSBjaGFuZ2VkLlxuICBmb3IgKGNvbnN0IGRlcCBvZiBub2RlLnVzZXNSZXNvdXJjZXMpIHtcbiAgICBpZiAoY2hhbmdlZFJlc291cmNlcy5oYXMoZGVwKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuaW50ZXJmYWNlIEZpbGVOb2RlIHtcbiAgZGVwZW5kc09uOiBTZXQ8QWJzb2x1dGVGc1BhdGg+O1xuICB1c2VzUmVzb3VyY2VzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+O1xuICBmYWlsZWRBbmFseXNpczogYm9vbGVhbjtcbn1cbiJdfQ==
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
        define("@angular/compiler-cli/src/ngtsc/incremental/src/incremental", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph", "@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking", "@angular/compiler-cli/src/ngtsc/incremental/src/state"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IncrementalCompilation = void 0;
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var semantic_graph_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph");
    var dependency_tracking_1 = require("@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking");
    var state_1 = require("@angular/compiler-cli/src/ngtsc/incremental/src/state");
    /**
     * Discriminant of the `Phase` type union.
     */
    var PhaseKind;
    (function (PhaseKind) {
        PhaseKind[PhaseKind["Analysis"] = 0] = "Analysis";
        PhaseKind[PhaseKind["TypeCheckAndEmit"] = 1] = "TypeCheckAndEmit";
    })(PhaseKind || (PhaseKind = {}));
    /**
     * Manages the incremental portion of an Angular compilation, allowing for reuse of a prior
     * compilation if available, and producing an output state for reuse of the current compilation in a
     * future one.
     */
    var IncrementalCompilation = /** @class */ (function () {
        function IncrementalCompilation(state, depGraph, versions, step) {
            this.depGraph = depGraph;
            this.versions = versions;
            this.step = step;
            this._state = state;
            // The compilation begins in analysis phase.
            this.phase = {
                kind: PhaseKind.Analysis,
                semanticDepGraphUpdater: new semantic_graph_1.SemanticDepGraphUpdater(step !== null ? step.priorState.semanticDepGraph : null),
            };
        }
        /**
         * Begin a fresh `IncrementalCompilation`.
         */
        IncrementalCompilation.fresh = function (program, versions) {
            var state = {
                kind: state_1.IncrementalStateKind.Fresh,
            };
            return new IncrementalCompilation(state, new dependency_tracking_1.FileDependencyGraph(), versions, /* reuse */ null);
        };
        IncrementalCompilation.incremental = function (program, newVersions, oldProgram, oldState, modifiedResourceFiles, perf) {
            return perf.inPhase(perf_1.PerfPhase.Reconciliation, function () {
                var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e;
                var physicallyChangedTsFiles = new Set();
                var changedResourceFiles = new Set(modifiedResourceFiles !== null && modifiedResourceFiles !== void 0 ? modifiedResourceFiles : []);
                var priorAnalysis;
                switch (oldState.kind) {
                    case state_1.IncrementalStateKind.Fresh:
                        // Since this line of program has never been successfully analyzed to begin with, treat
                        // this as a fresh compilation.
                        return IncrementalCompilation.fresh(program, newVersions);
                    case state_1.IncrementalStateKind.Analyzed:
                        // The most recent program was analyzed successfully, so we can use that as our prior
                        // state and don't need to consider any other deltas except changes in the most recent
                        // program.
                        priorAnalysis = oldState;
                        break;
                    case state_1.IncrementalStateKind.Delta:
                        // There is an ancestor program which was analyzed successfully and can be used as a
                        // starting point, but we need to determine what's changed since that program.
                        priorAnalysis = oldState.lastAnalyzedState;
                        try {
                            for (var _f = tslib_1.__values(oldState.physicallyChangedTsFiles), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var sfPath = _g.value;
                                physicallyChangedTsFiles.add(sfPath);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        try {
                            for (var _h = tslib_1.__values(oldState.changedResourceFiles), _j = _h.next(); !_j.done; _j = _h.next()) {
                                var resourcePath = _j.value;
                                changedResourceFiles.add(resourcePath);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        break;
                }
                var oldVersions = priorAnalysis.versions;
                var oldFilesArray = oldProgram.getSourceFiles().map(function (sf) { return typescript_1.toUnredirectedSourceFile(sf); });
                var oldFiles = new Set(oldFilesArray);
                var deletedTsFiles = new Set(oldFilesArray.map(function (sf) { return file_system_1.absoluteFromSourceFile(sf); }));
                try {
                    for (var _k = tslib_1.__values(program.getSourceFiles()), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var possiblyRedirectedNewFile = _l.value;
                        var sf = typescript_1.toUnredirectedSourceFile(possiblyRedirectedNewFile);
                        var sfPath = file_system_1.absoluteFromSourceFile(sf);
                        // Since we're seeing a file in the incoming program with this name, it can't have been
                        // deleted.
                        deletedTsFiles.delete(sfPath);
                        if (oldFiles.has(sf)) {
                            // This source file has the same object identity as in the previous program. We need to
                            // determine if it's really the same file, or if it might have changed versions since the
                            // last program without changing its identity.
                            // If there's no version information available, then this is the same file, and we can
                            // skip it.
                            if (oldVersions === null || newVersions === null) {
                                continue;
                            }
                            // If a version is available for the file from both the prior and the current program, and
                            // that version is the same, then this is the same file, and we can skip it.
                            if (oldVersions.has(sfPath) && newVersions.has(sfPath) &&
                                oldVersions.get(sfPath) === newVersions.get(sfPath)) {
                                continue;
                            }
                            // Otherwise, assume that the file has changed. Either its versions didn't match, or we
                            // were missing version information about it on one side for some reason.
                        }
                        // Bail out if a .d.ts file changes - the semantic dep graph is not able to process such
                        // changes correctly yet.
                        if (sf.isDeclarationFile) {
                            return IncrementalCompilation.fresh(program, newVersions);
                        }
                        // The file has changed physically, so record it.
                        physicallyChangedTsFiles.add(sfPath);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                try {
                    // Remove any files that have been deleted from the list of physical changes.
                    for (var deletedTsFiles_1 = tslib_1.__values(deletedTsFiles), deletedTsFiles_1_1 = deletedTsFiles_1.next(); !deletedTsFiles_1_1.done; deletedTsFiles_1_1 = deletedTsFiles_1.next()) {
                        var deletedFileName = deletedTsFiles_1_1.value;
                        physicallyChangedTsFiles.delete(file_system_1.resolve(deletedFileName));
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (deletedTsFiles_1_1 && !deletedTsFiles_1_1.done && (_d = deletedTsFiles_1.return)) _d.call(deletedTsFiles_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                // Use the prior dependency graph to project physical changes into a set of logically changed
                // files.
                var depGraph = new dependency_tracking_1.FileDependencyGraph();
                var logicallyChangedTsFiles = depGraph.updateWithPhysicalChanges(priorAnalysis.depGraph, physicallyChangedTsFiles, deletedTsFiles, changedResourceFiles);
                try {
                    // Physically changed files aren't necessarily counted as logically changed by the dependency
                    // graph (files do not have edges to themselves), so add them to the logical changes
                    // explicitly.
                    for (var physicallyChangedTsFiles_1 = tslib_1.__values(physicallyChangedTsFiles), physicallyChangedTsFiles_1_1 = physicallyChangedTsFiles_1.next(); !physicallyChangedTsFiles_1_1.done; physicallyChangedTsFiles_1_1 = physicallyChangedTsFiles_1.next()) {
                        var sfPath = physicallyChangedTsFiles_1_1.value;
                        logicallyChangedTsFiles.add(sfPath);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (physicallyChangedTsFiles_1_1 && !physicallyChangedTsFiles_1_1.done && (_e = physicallyChangedTsFiles_1.return)) _e.call(physicallyChangedTsFiles_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                // Start off in a `DeltaIncrementalState` as a delta against the previous successful analysis,
                // until this compilation completes its own analysis.
                var state = {
                    kind: state_1.IncrementalStateKind.Delta,
                    physicallyChangedTsFiles: physicallyChangedTsFiles,
                    changedResourceFiles: changedResourceFiles,
                    lastAnalyzedState: priorAnalysis,
                };
                return new IncrementalCompilation(state, depGraph, newVersions, {
                    priorState: priorAnalysis,
                    logicallyChangedTsFiles: logicallyChangedTsFiles,
                });
            });
        };
        Object.defineProperty(IncrementalCompilation.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(IncrementalCompilation.prototype, "semanticDepGraphUpdater", {
            get: function () {
                if (this.phase.kind !== PhaseKind.Analysis) {
                    throw new Error("AssertionError: Cannot update the SemanticDepGraph after analysis completes");
                }
                return this.phase.semanticDepGraphUpdater;
            },
            enumerable: false,
            configurable: true
        });
        IncrementalCompilation.prototype.recordSuccessfulAnalysis = function (traitCompiler) {
            var e_6, _a, e_7, _b;
            if (this.phase.kind !== PhaseKind.Analysis) {
                throw new Error("AssertionError: Incremental compilation in phase " + PhaseKind[this.phase.kind] + ", expected Analysis");
            }
            var _c = this.phase.semanticDepGraphUpdater.finalize(), needsEmit = _c.needsEmit, needsTypeCheckEmit = _c.needsTypeCheckEmit, newGraph = _c.newGraph;
            // Determine the set of files which have already been emitted.
            var emitted;
            if (this.step === null) {
                // Since there is no prior compilation, no files have yet been emitted.
                emitted = new Set();
            }
            else {
                // Begin with the files emitted by the prior successful compilation, but remove those which we
                // know need to bee re-emitted.
                emitted = new Set(this.step.priorState.emitted);
                try {
                    // Files need re-emitted if they've logically changed.
                    for (var _d = tslib_1.__values(this.step.logicallyChangedTsFiles), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var sfPath = _e.value;
                        emitted.delete(sfPath);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                try {
                    // Files need re-emitted if they've semantically changed.
                    for (var needsEmit_1 = tslib_1.__values(needsEmit), needsEmit_1_1 = needsEmit_1.next(); !needsEmit_1_1.done; needsEmit_1_1 = needsEmit_1.next()) {
                        var sfPath = needsEmit_1_1.value;
                        emitted.delete(sfPath);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (needsEmit_1_1 && !needsEmit_1_1.done && (_b = needsEmit_1.return)) _b.call(needsEmit_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
            // Transition to a successfully analyzed compilation. At this point, a subsequent compilation
            // could use this state as a starting point.
            this._state = {
                kind: state_1.IncrementalStateKind.Analyzed,
                versions: this.versions,
                depGraph: this.depGraph,
                semanticDepGraph: newGraph,
                traitCompiler: traitCompiler,
                typeCheckResults: null,
                emitted: emitted,
            };
            // We now enter the type-check and emit phase of compilation.
            this.phase = {
                kind: PhaseKind.TypeCheckAndEmit,
                needsEmit: needsEmit,
                needsTypeCheckEmit: needsTypeCheckEmit,
            };
        };
        IncrementalCompilation.prototype.recordSuccessfulTypeCheck = function (results) {
            if (this._state.kind !== state_1.IncrementalStateKind.Analyzed) {
                throw new Error("AssertionError: Expected successfully analyzed compilation.");
            }
            else if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
                throw new Error("AssertionError: Incremental compilation in phase " + PhaseKind[this.phase.kind] + ", expected TypeCheck");
            }
            this._state.typeCheckResults = results;
        };
        IncrementalCompilation.prototype.recordSuccessfulEmit = function (sf) {
            if (this._state.kind !== state_1.IncrementalStateKind.Analyzed) {
                throw new Error("AssertionError: Expected successfully analyzed compilation.");
            }
            this._state.emitted.add(file_system_1.absoluteFromSourceFile(sf));
        };
        IncrementalCompilation.prototype.priorAnalysisFor = function (sf) {
            if (this.step === null) {
                return null;
            }
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            // If the file has logically changed, its previous analysis cannot be reused.
            if (this.step.logicallyChangedTsFiles.has(sfPath)) {
                return null;
            }
            return this.step.priorState.traitCompiler.recordsFor(sf);
        };
        IncrementalCompilation.prototype.priorTypeCheckingResultsFor = function (sf) {
            if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
                throw new Error("AssertionError: Expected successfully analyzed compilation.");
            }
            if (this.step === null) {
                return null;
            }
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            // If the file has logically changed, or its template type-checking results have semantically
            // changed, then past type-checking results cannot be reused.
            if (this.step.logicallyChangedTsFiles.has(sfPath) ||
                this.phase.needsTypeCheckEmit.has(sfPath)) {
                return null;
            }
            // Past results also cannot be reused if they're not available.
            if (this.step.priorState.typeCheckResults === null ||
                !this.step.priorState.typeCheckResults.has(sfPath)) {
                return null;
            }
            var priorResults = this.step.priorState.typeCheckResults.get(sfPath);
            // If the past results relied on inlining, they're not safe for reuse.
            if (priorResults.hasInlines) {
                return null;
            }
            return priorResults;
        };
        IncrementalCompilation.prototype.safeToSkipEmit = function (sf) {
            // If this is a fresh compilation, it's never safe to skip an emit.
            if (this.step === null) {
                return false;
            }
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            // If the file has itself logically changed, it must be emitted.
            if (this.step.logicallyChangedTsFiles.has(sfPath)) {
                return false;
            }
            if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
                throw new Error("AssertionError: Expected successful analysis before attempting to emit files");
            }
            // If during analysis it was determined that this file has semantically changed, it must be
            // emitted.
            if (this.phase.needsEmit.has(sfPath)) {
                return false;
            }
            // Generally it should be safe to assume here that the file was previously emitted by the last
            // successful compilation. However, as a defense-in-depth against incorrectness, we explicitly
            // check that the last emit included this file, and re-emit it otherwise.
            return this.step.priorState.emitted.has(sfPath);
        };
        return IncrementalCompilation;
    }());
    exports.IncrementalCompilation = IncrementalCompilation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jcmVtZW50YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luY3JlbWVudGFsL3NyYy9pbmNyZW1lbnRhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsMkVBQWtGO0lBQ2xGLDZEQUFtRDtJQUduRCxrRkFBbUU7SUFFbkUsNkZBQTBEO0lBQzFELDJHQUEwRDtJQUMxRCwrRUFBZ0g7SUFXaEg7O09BRUc7SUFDSCxJQUFLLFNBR0o7SUFIRCxXQUFLLFNBQVM7UUFDWixpREFBUSxDQUFBO1FBQ1IsaUVBQWdCLENBQUE7SUFDbEIsQ0FBQyxFQUhJLFNBQVMsS0FBVCxTQUFTLFFBR2I7SUF5QkQ7Ozs7T0FJRztJQUNIO1FBV0UsZ0NBQ0ksS0FBdUIsRUFBVyxRQUE2QixFQUN2RCxRQUEwQyxFQUFVLElBQTBCO1lBRHBELGFBQVEsR0FBUixRQUFRLENBQXFCO1lBQ3ZELGFBQVEsR0FBUixRQUFRLENBQWtDO1lBQVUsU0FBSSxHQUFKLElBQUksQ0FBc0I7WUFDeEYsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFFcEIsNENBQTRDO1lBQzVDLElBQUksQ0FBQyxLQUFLLEdBQUc7Z0JBQ1gsSUFBSSxFQUFFLFNBQVMsQ0FBQyxRQUFRO2dCQUN4Qix1QkFBdUIsRUFDbkIsSUFBSSx3Q0FBdUIsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7YUFDekYsQ0FBQztRQUNKLENBQUM7UUFFRDs7V0FFRztRQUNJLDRCQUFLLEdBQVosVUFBYSxPQUFtQixFQUFFLFFBQTBDO1lBRTFFLElBQU0sS0FBSyxHQUFxQjtnQkFDOUIsSUFBSSxFQUFFLDRCQUFvQixDQUFDLEtBQUs7YUFD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QUVELE9BQU8sWUFBWSxDQUFDO1FBQ3RCLENBQUM7UUFFRCwrQ0FBYyxHQUFkLFVBQWUsRUFBaUI7WUFDOUIsbUVBQW1FO1lBQ25FLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ3RCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxJQUFNLE1BQU0sR0FBRyxvQ0FBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUUxQyxnRUFBZ0U7WUFDaEUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDakQsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLGdCQUFnQixFQUFFO2dCQUNsRCxNQUFNLElBQUksS0FBSyxDQUNYLDhFQUE4RSxDQUFDLENBQUM7YUFDckY7WUFFRCwyRkFBMkY7WUFDM0YsV0FBVztZQUNYLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNwQyxPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsOEZBQThGO1lBQzlGLDhGQUE4RjtZQUM5Rix5RUFBeUU7WUFDekUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUFqVEQsSUFpVEM7SUFqVFksd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbVNvdXJjZUZpbGUsIEFic29sdXRlRnNQYXRoLCByZXNvbHZlfSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge1BlcmZQaGFzZSwgUGVyZlJlY29yZGVyfSBmcm9tICcuLi8uLi9wZXJmJztcbmltcG9ydCB7Q2xhc3NSZWNvcmQsIFRyYWl0Q29tcGlsZXJ9IGZyb20gJy4uLy4uL3RyYW5zZm9ybSc7XG5pbXBvcnQge0ZpbGVUeXBlQ2hlY2tpbmdEYXRhfSBmcm9tICcuLi8uLi90eXBlY2hlY2snO1xuaW1wb3J0IHt0b1VucmVkaXJlY3RlZFNvdXJjZUZpbGV9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtJbmNyZW1lbnRhbEJ1aWxkfSBmcm9tICcuLi9hcGknO1xuaW1wb3J0IHtTZW1hbnRpY0RlcEdyYXBoVXBkYXRlcn0gZnJvbSAnLi4vc2VtYW50aWNfZ3JhcGgnO1xuaW1wb3J0IHtGaWxlRGVwZW5kZW5jeUdyYXBofSBmcm9tICcuL2RlcGVuZGVuY3lfdHJhY2tpbmcnO1xuaW1wb3J0IHtBbmFseXplZEluY3JlbWVudGFsU3RhdGUsIERlbHRhSW5jcmVtZW50YWxTdGF0ZSwgSW5jcmVtZW50YWxTdGF0ZSwgSW5jcmVtZW50YWxTdGF0ZUtpbmR9IGZyb20gJy4vc3RhdGUnO1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBwcmV2aW91cyBjb21waWxhdGlvbiBiZWluZyB1c2VkIGFzIGEgc3RhcnRpbmcgcG9pbnQgZm9yIHRoZSBjdXJyZW50IG9uZSxcbiAqIGluY2x1ZGluZyB0aGUgZGVsdGEgb2YgZmlsZXMgd2hpY2ggaGF2ZSBsb2dpY2FsbHkgY2hhbmdlZCBhbmQgbmVlZCB0byBiZSByZWFuYWx5emVkLlxuICovXG5pbnRlcmZhY2UgSW5jcmVtZW50YWxTdGVwIHtcbiAgcHJpb3JTdGF0ZTogQW5hbHl6ZWRJbmNyZW1lbnRhbFN0YXRlO1xuICBsb2dpY2FsbHlDaGFuZ2VkVHNGaWxlczogU2V0PEFic29sdXRlRnNQYXRoPjtcbn1cblxuLyoqXG4gKiBEaXNjcmltaW5hbnQgb2YgdGhlIGBQaGFzZWAgdHlwZSB1bmlvbi5cbiAqL1xuZW51bSBQaGFzZUtpbmQge1xuICBBbmFseXNpcyxcbiAgVHlwZUNoZWNrQW5kRW1pdCxcbn1cblxuLyoqXG4gKiBBbiBpbmNyZW1lbnRhbCBjb21waWxhdGlvbiB1bmRlcmdvaW5nIGFuYWx5c2lzLCBhbmQgYnVpbGRpbmcgYSBzZW1hbnRpYyBkZXBlbmRlbmN5IGdyYXBoLlxuICovXG5pbnRlcmZhY2UgQW5hbHlzaXNQaGFzZSB7XG4gIGtpbmQ6IFBoYXNlS2luZC5BbmFseXNpcztcbiAgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXI6IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyO1xufVxuXG4vKipcbiAqIEFuIGluY3JlbWVudGFsIGNvbXBpbGF0aW9uIHRoYXQgY29tcGxldGVkIGFuYWx5c2lzIGFuZCBpcyB1bmRlcmdvaW5nIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgYW5kXG4gKiBlbWl0LlxuICovXG5pbnRlcmZhY2UgVHlwZUNoZWNrQW5kRW1pdFBoYXNlIHtcbiAga2luZDogUGhhc2VLaW5kLlR5cGVDaGVja0FuZEVtaXQ7XG4gIG5lZWRzRW1pdDogU2V0PEFic29sdXRlRnNQYXRoPjtcbiAgbmVlZHNUeXBlQ2hlY2tFbWl0OiBTZXQ8QWJzb2x1dGVGc1BhdGg+O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGN1cnJlbnQgcGhhc2Ugb2YgYSBjb21waWxhdGlvbi5cbiAqL1xudHlwZSBQaGFzZSA9IEFuYWx5c2lzUGhhc2V8VHlwZUNoZWNrQW5kRW1pdFBoYXNlO1xuXG4vKipcbiAqIE1hbmFnZXMgdGhlIGluY3JlbWVudGFsIHBvcnRpb24gb2YgYW4gQW5ndWxhciBjb21waWxhdGlvbiwgYWxsb3dpbmcgZm9yIHJldXNlIG9mIGEgcHJpb3JcbiAqIGNvbXBpbGF0aW9uIGlmIGF2YWlsYWJsZSwgYW5kIHByb2R1Y2luZyBhbiBvdXRwdXQgc3RhdGUgZm9yIHJldXNlIG9mIHRoZSBjdXJyZW50IGNvbXBpbGF0aW9uIGluIGFcbiAqIGZ1dHVyZSBvbmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmNyZW1lbnRhbENvbXBpbGF0aW9uIGltcGxlbWVudHMgSW5jcmVtZW50YWxCdWlsZDxDbGFzc1JlY29yZCwgRmlsZVR5cGVDaGVja2luZ0RhdGE+IHtcbiAgcHJpdmF0ZSBwaGFzZTogUGhhc2U7XG5cbiAgLyoqXG4gICAqIGBJbmNyZW1lbnRhbFN0YXRlYCBvZiB0aGlzIGNvbXBpbGF0aW9uIGlmIGl0IHdlcmUgdG8gYmUgcmV1c2VkIGluIGEgc3Vic2VxdWVudCBpbmNyZW1lbnRhbFxuICAgKiBjb21waWxhdGlvbiBhdCB0aGUgY3VycmVudCBtb21lbnQuXG4gICAqXG4gICAqIEV4cG9zZWQgdmlhIHRoZSBgc3RhdGVgIHJlYWQtb25seSBnZXR0ZXIuXG4gICAqL1xuICBwcml2YXRlIF9zdGF0ZTogSW5jcmVtZW50YWxTdGF0ZTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgc3RhdGU6IEluY3JlbWVudGFsU3RhdGUsIHJlYWRvbmx5IGRlcEdyYXBoOiBGaWxlRGVwZW5kZW5jeUdyYXBoLFxuICAgICAgcHJpdmF0ZSB2ZXJzaW9uczogTWFwPEFic29sdXRlRnNQYXRoLCBzdHJpbmc+fG51bGwsIHByaXZhdGUgc3RlcDogSW5jcmVtZW50YWxTdGVwfG51bGwpIHtcbiAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuXG4gICAgLy8gVGhlIGNvbXBpbGF0aW9uIGJlZ2lucyBpbiBhbmFseXNpcyBwaGFzZS5cbiAgICB0aGlzLnBoYXNlID0ge1xuICAgICAga2luZDogUGhhc2VLaW5kLkFuYWx5c2lzLFxuICAgICAgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXI6XG4gICAgICAgICAgbmV3IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyKHN0ZXAgIT09IG51bGwgPyBzdGVwLnByaW9yU3RhdGUuc2VtYW50aWNEZXBHcmFwaCA6IG51bGwpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQmVnaW4gYSBmcmVzaCBgSW5jcmVtZW50YWxDb21waWxhdGlvbmAuXG4gICAqL1xuICBzdGF0aWMgZnJlc2gocHJvZ3JhbTogdHMuUHJvZ3JhbSwgdmVyc2lvbnM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgc3RyaW5nPnxudWxsKTpcbiAgICAgIEluY3JlbWVudGFsQ29tcGlsYXRpb24ge1xuICAgIGNvbnN0IHN0YXRlOiBJbmNyZW1lbnRhbFN0YXRlID0ge1xuICAgICAga2luZDogSW5jcmVtZW50YWxTdGF0ZUtpbmQuRnJlc2gsXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IEluY3JlbWVudGFsQ29tcGlsYXRpb24oc3RhdGUsIG5ldyBGaWxlRGVwZW5kZW5jeUdyYXBoKCksIHZlcnNpb25zLCAvKiByZXVzZSAqLyBudWxsKTtcbiAgfVxuXG4gIHN0YXRpYyBpbmNyZW1lbnRhbChcbiAgICAgIHByb2dyYW06IHRzLlByb2dyYW0sIG5ld1ZlcnNpb25zOiBNYXA8QWJzb2x1dGVGc1BhdGgsIHN0cmluZz58bnVsbCwgb2xkUHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICAgIG9sZFN0YXRlOiBJbmNyZW1lbnRhbFN0YXRlLCBtb2RpZmllZFJlc291cmNlRmlsZXM6IFNldDxBYnNvbHV0ZUZzUGF0aD58bnVsbCxcbiAgICAgIHBlcmY6IFBlcmZSZWNvcmRlcik6IEluY3JlbWVudGFsQ29tcGlsYXRpb24ge1xuICAgIHJldHVybiBwZXJmLmluUGhhc2UoUGVyZlBoYXNlLlJlY29uY2lsaWF0aW9uLCAoKSA9PiB7XG4gICAgICBjb25zdCBwaHlzaWNhbGx5Q2hhbmdlZFRzRmlsZXMgPSBuZXcgU2V0PEFic29sdXRlRnNQYXRoPigpO1xuICAgICAgY29uc3QgY2hhbmdlZFJlc291cmNlRmlsZXMgPSBuZXcgU2V0PEFic29sdXRlRnNQYXRoPihtb2RpZmllZFJlc291cmNlRmlsZXMgPz8gW10pO1xuXG5cbiAgICAgIGxldCBwcmlvckFuYWx5c2lzOiBBbmFseXplZEluY3JlbWVudGFsU3RhdGU7XG4gICAgICBzd2l0Y2ggKG9sZFN0YXRlLmtpbmQpIHtcbiAgICAgICAgY2FzZSBJbmNyZW1lbnRhbFN0YXRlS2luZC5GcmVzaDpcbiAgICAgICAgICAvLyBTaW5jZSB0aGlzIGxpbmUgb2YgcHJvZ3JhbSBoYXMgbmV2ZXIgYmVlbiBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgdG8gYmVnaW4gd2l0aCwgdHJlYXRcbiAgICAgICAgICAvLyB0aGlzIGFzIGEgZnJlc2ggY29tcGlsYXRpb24uXG4gICAgICAgICAgcmV0dXJuIEluY3JlbWVudGFsQ29tcGlsYXRpb24uZnJlc2gocHJvZ3JhbSwgbmV3VmVyc2lvbnMpO1xuICAgICAgICBjYXNlIEluY3JlbWVudGFsU3RhdGVLaW5kLkFuYWx5emVkOlxuICAgICAgICAgIC8vIFRoZSBtb3N0IHJlY2VudCBwcm9ncmFtIHdhcyBhbmFseXplZCBzdWNjZXNzZnVsbHksIHNvIHdlIGNhbiB1c2UgdGhhdCBhcyBvdXIgcHJpb3JcbiAgICAgICAgICAvLyBzdGF0ZSBhbmQgZG9uJ3QgbmVlZCB0byBjb25zaWRlciBhbnkgb3RoZXIgZGVsdGFzIGV4Y2VwdCBjaGFuZ2VzIGluIHRoZSBtb3N0IHJlY2VudFxuICAgICAgICAgIC8vIHByb2dyYW0uXG4gICAgICAgICAgcHJpb3JBbmFseXNpcyA9IG9sZFN0YXRlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEluY3JlbWVudGFsU3RhdGVLaW5kLkRlbHRhOlxuICAgICAgICAgIC8vIFRoZXJlIGlzIGFuIGFuY2VzdG9yIHByb2dyYW0gd2hpY2ggd2FzIGFuYWx5emVkIHN1Y2Nlc3NmdWxseSBhbmQgY2FuIGJlIHVzZWQgYXMgYVxuICAgICAgICAgIC8vIHN0YXJ0aW5nIHBvaW50LCBidXQgd2UgbmVlZCB0byBkZXRlcm1pbmUgd2hhdCdzIGNoYW5nZWQgc2luY2UgdGhhdCBwcm9ncmFtLlxuICAgICAgICAgIHByaW9yQW5hbHlzaXMgPSBvbGRTdGF0ZS5sYXN0QW5hbHl6ZWRTdGF0ZTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHNmUGF0aCBvZiBvbGRTdGF0ZS5waHlzaWNhbGx5Q2hhbmdlZFRzRmlsZXMpIHtcbiAgICAgICAgICAgIHBoeXNpY2FsbHlDaGFuZ2VkVHNGaWxlcy5hZGQoc2ZQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yIChjb25zdCByZXNvdXJjZVBhdGggb2Ygb2xkU3RhdGUuY2hhbmdlZFJlc291cmNlRmlsZXMpIHtcbiAgICAgICAgICAgIGNoYW5nZWRSZXNvdXJjZUZpbGVzLmFkZChyZXNvdXJjZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb2xkVmVyc2lvbnMgPSBwcmlvckFuYWx5c2lzLnZlcnNpb25zO1xuXG4gICAgICBjb25zdCBvbGRGaWxlc0FycmF5ID0gb2xkUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLm1hcChzZiA9PiB0b1VucmVkaXJlY3RlZFNvdXJjZUZpbGUoc2YpKTtcbiAgICAgIGNvbnN0IG9sZEZpbGVzID0gbmV3IFNldChvbGRGaWxlc0FycmF5KTtcbiAgICAgIGNvbnN0IGRlbGV0ZWRUc0ZpbGVzID0gbmV3IFNldChvbGRGaWxlc0FycmF5Lm1hcChzZiA9PiBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKSkpO1xuXG4gICAgICBmb3IgKGNvbnN0IHBvc3NpYmx5UmVkaXJlY3RlZE5ld0ZpbGUgb2YgcHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpKSB7XG4gICAgICAgIGNvbnN0IHNmID0gdG9VbnJlZGlyZWN0ZWRTb3VyY2VGaWxlKHBvc3NpYmx5UmVkaXJlY3RlZE5ld0ZpbGUpO1xuICAgICAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICAgICAgLy8gU2luY2Ugd2UncmUgc2VlaW5nIGEgZmlsZSBpbiB0aGUgaW5jb21pbmcgcHJvZ3JhbSB3aXRoIHRoaXMgbmFtZSwgaXQgY2FuJ3QgaGF2ZSBiZWVuXG4gICAgICAgIC8vIGRlbGV0ZWQuXG4gICAgICAgIGRlbGV0ZWRUc0ZpbGVzLmRlbGV0ZShzZlBhdGgpO1xuXG4gICAgICAgIGlmIChvbGRGaWxlcy5oYXMoc2YpKSB7XG4gICAgICAgICAgLy8gVGhpcyBzb3VyY2UgZmlsZSBoYXMgdGhlIHNhbWUgb2JqZWN0IGlkZW50aXR5IGFzIGluIHRoZSBwcmV2aW91cyBwcm9ncmFtLiBXZSBuZWVkIHRvXG4gICAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIGl0J3MgcmVhbGx5IHRoZSBzYW1lIGZpbGUsIG9yIGlmIGl0IG1pZ2h0IGhhdmUgY2hhbmdlZCB2ZXJzaW9ucyBzaW5jZSB0aGVcbiAgICAgICAgICAvLyBsYXN0IHByb2dyYW0gd2l0aG91dCBjaGFuZ2luZyBpdHMgaWRlbnRpdHkuXG5cbiAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIHZlcnNpb24gaW5mb3JtYXRpb24gYXZhaWxhYmxlLCB0aGVuIHRoaXMgaXMgdGhlIHNhbWUgZmlsZSwgYW5kIHdlIGNhblxuICAgICAgICAgIC8vIHNraXAgaXQuXG4gICAgICAgICAgaWYgKG9sZFZlcnNpb25zID09PSBudWxsIHx8IG5ld1ZlcnNpb25zID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiBhIHZlcnNpb24gaXMgYXZhaWxhYmxlIGZvciB0aGUgZmlsZSBmcm9tIGJvdGggdGhlIHByaW9yIGFuZCB0aGUgY3VycmVudCBwcm9ncmFtLCBhbmRcbiAgICAgICAgICAvLyB0aGF0IHZlcnNpb24gaXMgdGhlIHNhbWUsIHRoZW4gdGhpcyBpcyB0aGUgc2FtZSBmaWxlLCBhbmQgd2UgY2FuIHNraXAgaXQuXG4gICAgICAgICAgaWYgKG9sZFZlcnNpb25zLmhhcyhzZlBhdGgpICYmIG5ld1ZlcnNpb25zLmhhcyhzZlBhdGgpICYmXG4gICAgICAgICAgICAgIG9sZFZlcnNpb25zLmdldChzZlBhdGgpISA9PT0gbmV3VmVyc2lvbnMuZ2V0KHNmUGF0aCkhKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPdGhlcndpc2UsIGFzc3VtZSB0aGF0IHRoZSBmaWxlIGhhcyBjaGFuZ2VkLiBFaXRoZXIgaXRzIHZlcnNpb25zIGRpZG4ndCBtYXRjaCwgb3Igd2VcbiAgICAgICAgICAvLyB3ZXJlIG1pc3NpbmcgdmVyc2lvbiBpbmZvcm1hdGlvbiBhYm91dCBpdCBvbiBvbmUgc2lkZSBmb3Igc29tZSByZWFzb24uXG4gICAgICAgIH1cblxuICAgICAgICAvLyBCYWlsIG91dCBpZiBhIC5kLnRzIGZpbGUgY2hhbmdlcyAtIHRoZSBzZW1hbnRpYyBkZXAgZ3JhcGggaXMgbm90IGFibGUgdG8gcHJvY2VzcyBzdWNoXG4gICAgICAgIC8vIGNoYW5nZXMgY29ycmVjdGx5IHlldC5cbiAgICAgICAgaWYgKHNmLmlzRGVjbGFyYXRpb25GaWxlKSB7XG4gICAgICAgICAgcmV0dXJuIEluY3JlbWVudGFsQ29tcGlsYXRpb24uZnJlc2gocHJvZ3JhbSwgbmV3VmVyc2lvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGZpbGUgaGFzIGNoYW5nZWQgcGh5c2ljYWxseSwgc28gcmVjb3JkIGl0LlxuICAgICAgICBwaHlzaWNhbGx5Q2hhbmdlZFRzRmlsZXMuYWRkKHNmUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgZmlsZXMgdGhhdCBoYXZlIGJlZW4gZGVsZXRlZCBmcm9tIHRoZSBsaXN0IG9mIHBoeXNpY2FsIGNoYW5nZXMuXG4gICAgICBmb3IgKGNvbnN0IGRlbGV0ZWRGaWxlTmFtZSBvZiBkZWxldGVkVHNGaWxlcykge1xuICAgICAgICBwaHlzaWNhbGx5Q2hhbmdlZFRzRmlsZXMuZGVsZXRlKHJlc29sdmUoZGVsZXRlZEZpbGVOYW1lKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFVzZSB0aGUgcHJpb3IgZGVwZW5kZW5jeSBncmFwaCB0byBwcm9qZWN0IHBoeXNpY2FsIGNoYW5nZXMgaW50byBhIHNldCBvZiBsb2dpY2FsbHkgY2hhbmdlZFxuICAgICAgLy8gZmlsZXMuXG4gICAgICBjb25zdCBkZXBHcmFwaCA9IG5ldyBGaWxlRGVwZW5kZW5jeUdyYXBoKCk7XG4gICAgICBjb25zdCBsb2dpY2FsbHlDaGFuZ2VkVHNGaWxlcyA9IGRlcEdyYXBoLnVwZGF0ZVdpdGhQaHlzaWNhbENoYW5nZXMoXG4gICAgICAgICAgcHJpb3JBbmFseXNpcy5kZXBHcmFwaCwgcGh5c2ljYWxseUNoYW5nZWRUc0ZpbGVzLCBkZWxldGVkVHNGaWxlcywgY2hhbmdlZFJlc291cmNlRmlsZXMpO1xuXG4gICAgICAvLyBQaHlzaWNhbGx5IGNoYW5nZWQgZmlsZXMgYXJlbid0IG5lY2Vzc2FyaWx5IGNvdW50ZWQgYXMgbG9naWNhbGx5IGNoYW5nZWQgYnkgdGhlIGRlcGVuZGVuY3lcbiAgICAgIC8vIGdyYXBoIChmaWxlcyBkbyBub3QgaGF2ZSBlZGdlcyB0byB0aGVtc2VsdmVzKSwgc28gYWRkIHRoZW0gdG8gdGhlIGxvZ2ljYWwgY2hhbmdlc1xuICAgICAgLy8gZXhwbGljaXRseS5cbiAgICAgIGZvciAoY29uc3Qgc2ZQYXRoIG9mIHBoeXNpY2FsbHlDaGFuZ2VkVHNGaWxlcykge1xuICAgICAgICBsb2dpY2FsbHlDaGFuZ2VkVHNGaWxlcy5hZGQoc2ZQYXRoKTtcbiAgICAgIH1cblxuICAgICAgLy8gU3RhcnQgb2ZmIGluIGEgYERlbHRhSW5jcmVtZW50YWxTdGF0ZWAgYXMgYSBkZWx0YSBhZ2FpbnN0IHRoZSBwcmV2aW91cyBzdWNjZXNzZnVsIGFuYWx5c2lzLFxuICAgICAgLy8gdW50aWwgdGhpcyBjb21waWxhdGlvbiBjb21wbGV0ZXMgaXRzIG93biBhbmFseXNpcy5cbiAgICAgIGNvbnN0IHN0YXRlOiBEZWx0YUluY3JlbWVudGFsU3RhdGUgPSB7XG4gICAgICAgIGtpbmQ6IEluY3JlbWVudGFsU3RhdGVLaW5kLkRlbHRhLFxuICAgICAgICBwaHlzaWNhbGx5Q2hhbmdlZFRzRmlsZXMsXG4gICAgICAgIGNoYW5nZWRSZXNvdXJjZUZpbGVzLFxuICAgICAgICBsYXN0QW5hbHl6ZWRTdGF0ZTogcHJpb3JBbmFseXNpcyxcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBuZXcgSW5jcmVtZW50YWxDb21waWxhdGlvbihzdGF0ZSwgZGVwR3JhcGgsIG5ld1ZlcnNpb25zLCB7XG4gICAgICAgIHByaW9yU3RhdGU6IHByaW9yQW5hbHlzaXMsXG4gICAgICAgIGxvZ2ljYWxseUNoYW5nZWRUc0ZpbGVzLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgc3RhdGUoKTogSW5jcmVtZW50YWxTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgZ2V0IHNlbWFudGljRGVwR3JhcGhVcGRhdGVyKCk6IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyIHtcbiAgICBpZiAodGhpcy5waGFzZS5raW5kICE9PSBQaGFzZUtpbmQuQW5hbHlzaXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQXNzZXJ0aW9uRXJyb3I6IENhbm5vdCB1cGRhdGUgdGhlIFNlbWFudGljRGVwR3JhcGggYWZ0ZXIgYW5hbHlzaXMgY29tcGxldGVzYCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBoYXNlLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyO1xuICB9XG5cbiAgcmVjb3JkU3VjY2Vzc2Z1bEFuYWx5c2lzKHRyYWl0Q29tcGlsZXI6IFRyYWl0Q29tcGlsZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5waGFzZS5raW5kICE9PSBQaGFzZUtpbmQuQW5hbHlzaXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IEluY3JlbWVudGFsIGNvbXBpbGF0aW9uIGluIHBoYXNlICR7XG4gICAgICAgICAgUGhhc2VLaW5kW3RoaXMucGhhc2Uua2luZF19LCBleHBlY3RlZCBBbmFseXNpc2ApO1xuICAgIH1cblxuICAgIGNvbnN0IHtuZWVkc0VtaXQsIG5lZWRzVHlwZUNoZWNrRW1pdCwgbmV3R3JhcGh9ID0gdGhpcy5waGFzZS5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlci5maW5hbGl6ZSgpO1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBzZXQgb2YgZmlsZXMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gZW1pdHRlZC5cbiAgICBsZXQgZW1pdHRlZDogU2V0PEFic29sdXRlRnNQYXRoPjtcbiAgICBpZiAodGhpcy5zdGVwID09PSBudWxsKSB7XG4gICAgICAvLyBTaW5jZSB0aGVyZSBpcyBubyBwcmlvciBjb21waWxhdGlvbiwgbm8gZmlsZXMgaGF2ZSB5ZXQgYmVlbiBlbWl0dGVkLlxuICAgICAgZW1pdHRlZCA9IG5ldyBTZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQmVnaW4gd2l0aCB0aGUgZmlsZXMgZW1pdHRlZCBieSB0aGUgcHJpb3Igc3VjY2Vzc2Z1bCBjb21waWxhdGlvbiwgYnV0IHJlbW92ZSB0aG9zZSB3aGljaCB3ZVxuICAgICAgLy8ga25vdyBuZWVkIHRvIGJlZSByZS1lbWl0dGVkLlxuICAgICAgZW1pdHRlZCA9IG5ldyBTZXQodGhpcy5zdGVwLnByaW9yU3RhdGUuZW1pdHRlZCk7XG5cbiAgICAgIC8vIEZpbGVzIG5lZWQgcmUtZW1pdHRlZCBpZiB0aGV5J3ZlIGxvZ2ljYWxseSBjaGFuZ2VkLlxuICAgICAgZm9yIChjb25zdCBzZlBhdGggb2YgdGhpcy5zdGVwLmxvZ2ljYWxseUNoYW5nZWRUc0ZpbGVzKSB7XG4gICAgICAgIGVtaXR0ZWQuZGVsZXRlKHNmUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbGVzIG5lZWQgcmUtZW1pdHRlZCBpZiB0aGV5J3ZlIHNlbWFudGljYWxseSBjaGFuZ2VkLlxuICAgICAgZm9yIChjb25zdCBzZlBhdGggb2YgbmVlZHNFbWl0KSB7XG4gICAgICAgIGVtaXR0ZWQuZGVsZXRlKHNmUGF0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVHJhbnNpdGlvbiB0byBhIHN1Y2Nlc3NmdWxseSBhbmFseXplZCBjb21waWxhdGlvbi4gQXQgdGhpcyBwb2ludCwgYSBzdWJzZXF1ZW50IGNvbXBpbGF0aW9uXG4gICAgLy8gY291bGQgdXNlIHRoaXMgc3RhdGUgYXMgYSBzdGFydGluZyBwb2ludC5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIGtpbmQ6IEluY3JlbWVudGFsU3RhdGVLaW5kLkFuYWx5emVkLFxuICAgICAgdmVyc2lvbnM6IHRoaXMudmVyc2lvbnMsXG4gICAgICBkZXBHcmFwaDogdGhpcy5kZXBHcmFwaCxcbiAgICAgIHNlbWFudGljRGVwR3JhcGg6IG5ld0dyYXBoLFxuICAgICAgdHJhaXRDb21waWxlcixcbiAgICAgIHR5cGVDaGVja1Jlc3VsdHM6IG51bGwsXG4gICAgICBlbWl0dGVkLFxuICAgIH07XG5cbiAgICAvLyBXZSBub3cgZW50ZXIgdGhlIHR5cGUtY2hlY2sgYW5kIGVtaXQgcGhhc2Ugb2YgY29tcGlsYXRpb24uXG4gICAgdGhpcy5waGFzZSA9IHtcbiAgICAgIGtpbmQ6IFBoYXNlS2luZC5UeXBlQ2hlY2tBbmRFbWl0LFxuICAgICAgbmVlZHNFbWl0LFxuICAgICAgbmVlZHNUeXBlQ2hlY2tFbWl0LFxuICAgIH07XG4gIH1cblxuICByZWNvcmRTdWNjZXNzZnVsVHlwZUNoZWNrKHJlc3VsdHM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgRmlsZVR5cGVDaGVja2luZ0RhdGE+KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0YXRlLmtpbmQgIT09IEluY3JlbWVudGFsU3RhdGVLaW5kLkFuYWx5emVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBFeHBlY3RlZCBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgY29tcGlsYXRpb24uYCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBoYXNlLmtpbmQgIT09IFBoYXNlS2luZC5UeXBlQ2hlY2tBbmRFbWl0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBJbmNyZW1lbnRhbCBjb21waWxhdGlvbiBpbiBwaGFzZSAke1xuICAgICAgICAgIFBoYXNlS2luZFt0aGlzLnBoYXNlLmtpbmRdfSwgZXhwZWN0ZWQgVHlwZUNoZWNrYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhdGUudHlwZUNoZWNrUmVzdWx0cyA9IHJlc3VsdHM7XG4gIH1cblxuXG4gIHJlY29yZFN1Y2Nlc3NmdWxFbWl0KHNmOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0YXRlLmtpbmQgIT09IEluY3JlbWVudGFsU3RhdGVLaW5kLkFuYWx5emVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBFeHBlY3RlZCBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgY29tcGlsYXRpb24uYCk7XG4gICAgfVxuICAgIHRoaXMuX3N0YXRlLmVtaXR0ZWQuYWRkKGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpKTtcbiAgfVxuXG4gIHByaW9yQW5hbHlzaXNGb3Ioc2Y6IHRzLlNvdXJjZUZpbGUpOiBDbGFzc1JlY29yZFtdfG51bGwge1xuICAgIGlmICh0aGlzLnN0ZXAgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuXG4gICAgLy8gSWYgdGhlIGZpbGUgaGFzIGxvZ2ljYWxseSBjaGFuZ2VkLCBpdHMgcHJldmlvdXMgYW5hbHlzaXMgY2Fubm90IGJlIHJldXNlZC5cbiAgICBpZiAodGhpcy5zdGVwLmxvZ2ljYWxseUNoYW5nZWRUc0ZpbGVzLmhhcyhzZlBhdGgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdGVwLnByaW9yU3RhdGUudHJhaXRDb21waWxlci5yZWNvcmRzRm9yKHNmKTtcbiAgfVxuXG4gIHByaW9yVHlwZUNoZWNraW5nUmVzdWx0c0ZvcihzZjogdHMuU291cmNlRmlsZSk6IEZpbGVUeXBlQ2hlY2tpbmdEYXRhfG51bGwge1xuICAgIGlmICh0aGlzLnBoYXNlLmtpbmQgIT09IFBoYXNlS2luZC5UeXBlQ2hlY2tBbmRFbWl0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBFeHBlY3RlZCBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgY29tcGlsYXRpb24uYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RlcCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc2ZQYXRoID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShzZik7XG5cbiAgICAvLyBJZiB0aGUgZmlsZSBoYXMgbG9naWNhbGx5IGNoYW5nZWQsIG9yIGl0cyB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIHJlc3VsdHMgaGF2ZSBzZW1hbnRpY2FsbHlcbiAgICAvLyBjaGFuZ2VkLCB0aGVuIHBhc3QgdHlwZS1jaGVja2luZyByZXN1bHRzIGNhbm5vdCBiZSByZXVzZWQuXG4gICAgaWYgKHRoaXMuc3RlcC5sb2dpY2FsbHlDaGFuZ2VkVHNGaWxlcy5oYXMoc2ZQYXRoKSB8fFxuICAgICAgICB0aGlzLnBoYXNlLm5lZWRzVHlwZUNoZWNrRW1pdC5oYXMoc2ZQYXRoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUGFzdCByZXN1bHRzIGFsc28gY2Fubm90IGJlIHJldXNlZCBpZiB0aGV5J3JlIG5vdCBhdmFpbGFibGUuXG4gICAgaWYgKHRoaXMuc3RlcC5wcmlvclN0YXRlLnR5cGVDaGVja1Jlc3VsdHMgPT09IG51bGwgfHxcbiAgICAgICAgIXRoaXMuc3RlcC5wcmlvclN0YXRlLnR5cGVDaGVja1Jlc3VsdHMuaGFzKHNmUGF0aCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yUmVzdWx0cyA9IHRoaXMuc3RlcC5wcmlvclN0YXRlLnR5cGVDaGVja1Jlc3VsdHMuZ2V0KHNmUGF0aCkhO1xuICAgIC8vIElmIHRoZSBwYXN0IHJlc3VsdHMgcmVsaWVkIG9uIGlubGluaW5nLCB0aGV5J3JlIG5vdCBzYWZlIGZvciByZXVzZS5cbiAgICBpZiAocHJpb3JSZXN1bHRzLmhhc0lubGluZXMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBwcmlvclJlc3VsdHM7XG4gIH1cblxuICBzYWZlVG9Ta2lwRW1pdChzZjogdHMuU291cmNlRmlsZSk6IGJvb2xlYW4ge1xuICAgIC8vIElmIHRoaXMgaXMgYSBmcmVzaCBjb21waWxhdGlvbiwgaXQncyBuZXZlciBzYWZlIHRvIHNraXAgYW4gZW1pdC5cbiAgICBpZiAodGhpcy5zdGVwID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc2ZQYXRoID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShzZik7XG5cbiAgICAvLyBJZiB0aGUgZmlsZSBoYXMgaXRzZWxmIGxvZ2ljYWxseSBjaGFuZ2VkLCBpdCBtdXN0IGJlIGVtaXR0ZWQuXG4gICAgaWYgKHRoaXMuc3RlcC5sb2dpY2FsbHlDaGFuZ2VkVHNGaWxlcy5oYXMoc2ZQYXRoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBoYXNlLmtpbmQgIT09IFBoYXNlS2luZC5UeXBlQ2hlY2tBbmRFbWl0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEFzc2VydGlvbkVycm9yOiBFeHBlY3RlZCBzdWNjZXNzZnVsIGFuYWx5c2lzIGJlZm9yZSBhdHRlbXB0aW5nIHRvIGVtaXQgZmlsZXNgKTtcbiAgICB9XG5cbiAgICAvLyBJZiBkdXJpbmcgYW5hbHlzaXMgaXQgd2FzIGRldGVybWluZWQgdGhhdCB0aGlzIGZpbGUgaGFzIHNlbWFudGljYWxseSBjaGFuZ2VkLCBpdCBtdXN0IGJlXG4gICAgLy8gZW1pdHRlZC5cbiAgICBpZiAodGhpcy5waGFzZS5uZWVkc0VtaXQuaGFzKHNmUGF0aCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmFsbHkgaXQgc2hvdWxkIGJlIHNhZmUgdG8gYXNzdW1lIGhlcmUgdGhhdCB0aGUgZmlsZSB3YXMgcHJldmlvdXNseSBlbWl0dGVkIGJ5IHRoZSBsYXN0XG4gICAgLy8gc3VjY2Vzc2Z1bCBjb21waWxhdGlvbi4gSG93ZXZlciwgYXMgYSBkZWZlbnNlLWluLWRlcHRoIGFnYWluc3QgaW5jb3JyZWN0bmVzcywgd2UgZXhwbGljaXRseVxuICAgIC8vIGNoZWNrIHRoYXQgdGhlIGxhc3QgZW1pdCBpbmNsdWRlZCB0aGlzIGZpbGUsIGFuZCByZS1lbWl0IGl0IG90aGVyd2lzZS5cbiAgICByZXR1cm4gdGhpcy5zdGVwLnByaW9yU3RhdGUuZW1pdHRlZC5oYXMoc2ZQYXRoKTtcbiAgfVxufVxuIl19
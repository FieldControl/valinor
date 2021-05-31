(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/analysis/migration_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/ngcc/src/analysis/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultMigrationHost = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var util_1 = require("@angular/compiler-cli/ngcc/src/analysis/util");
    /**
     * The standard implementation of `MigrationHost`, which is created by the `DecorationAnalyzer`.
     */
    var DefaultMigrationHost = /** @class */ (function () {
        function DefaultMigrationHost(reflectionHost, metadata, evaluator, compiler, entryPointPath) {
            this.reflectionHost = reflectionHost;
            this.metadata = metadata;
            this.evaluator = evaluator;
            this.compiler = compiler;
            this.entryPointPath = entryPointPath;
        }
        DefaultMigrationHost.prototype.injectSyntheticDecorator = function (clazz, decorator, flags) {
            var e_1, _a;
            var migratedTraits = this.compiler.injectSyntheticDecorator(clazz, decorator, flags);
            try {
                for (var migratedTraits_1 = tslib_1.__values(migratedTraits), migratedTraits_1_1 = migratedTraits_1.next(); !migratedTraits_1_1.done; migratedTraits_1_1 = migratedTraits_1.next()) {
                    var trait = migratedTraits_1_1.value;
                    if ((trait.state === transform_1.TraitState.Analyzed || trait.state === transform_1.TraitState.Resolved) &&
                        trait.analysisDiagnostics !== null) {
                        trait.analysisDiagnostics = trait.analysisDiagnostics.map(function (diag) { return createMigrationDiagnostic(diag, clazz, decorator); });
                    }
                    if (trait.state === transform_1.TraitState.Resolved && trait.resolveDiagnostics !== null) {
                        trait.resolveDiagnostics =
                            trait.resolveDiagnostics.map(function (diag) { return createMigrationDiagnostic(diag, clazz, decorator); });
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (migratedTraits_1_1 && !migratedTraits_1_1.done && (_a = migratedTraits_1.return)) _a.call(migratedTraits_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        DefaultMigrationHost.prototype.getAllDecorators = function (clazz) {
            return this.compiler.getAllDecorators(clazz);
        };
        DefaultMigrationHost.prototype.isInScope = function (clazz) {
            return util_1.isWithinPackage(this.entryPointPath, file_system_1.absoluteFromSourceFile(clazz.getSourceFile()));
        };
        return DefaultMigrationHost;
    }());
    exports.DefaultMigrationHost = DefaultMigrationHost;
    /**
     * Creates a diagnostic from another one, containing additional information about the synthetic
     * decorator.
     */
    function createMigrationDiagnostic(diagnostic, source, decorator) {
        var _a;
        var clone = tslib_1.__assign({}, diagnostic);
        var chain = [{
                messageText: "Occurs for @" + decorator.name + " decorator inserted by an automatic migration",
                category: ts.DiagnosticCategory.Message,
                code: 0,
            }];
        if (decorator.args !== null) {
            var args = decorator.args.map(function (arg) { return arg.getText(); }).join(', ');
            chain.push({
                messageText: "@" + decorator.name + "(" + args + ")",
                category: ts.DiagnosticCategory.Message,
                code: 0,
            });
        }
        if (typeof clone.messageText === 'string') {
            clone.messageText = {
                messageText: clone.messageText,
                category: diagnostic.category,
                code: diagnostic.code,
                next: chain,
            };
        }
        else {
            if (clone.messageText.next === undefined) {
                clone.messageText.next = chain;
            }
            else {
                (_a = clone.messageText.next).push.apply(_a, tslib_1.__spreadArray([], tslib_1.__read(chain)));
            }
        }
        return clone;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0aW9uX2hvc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvYW5hbHlzaXMvbWlncmF0aW9uX2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUVqQywyRUFBc0Y7SUFJdEYsdUVBQXNFO0lBS3RFLHFFQUF1QztJQUV2Qzs7T0FFRztJQUNIO1FBQ0UsOEJBQ2EsY0FBa0MsRUFBVyxRQUF3QixFQUNyRSxTQUEyQixFQUFVLFFBQTJCLEVBQ2pFLGNBQThCO1lBRjdCLG1CQUFjLEdBQWQsY0FBYyxDQUFvQjtZQUFXLGFBQVEsR0FBUixRQUFRLENBQWdCO1lBQ3JFLGNBQVMsR0FBVCxTQUFTLENBQWtCO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDakUsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQUcsQ0FBQztRQUU5Qyx1REFBd0IsR0FBeEIsVUFBeUIsS0FBdUIsRUFBRSxTQUFvQixFQUFFLEtBQW9COztZQUUxRixJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7O2dCQUV2RixLQUFvQixJQUFBLG1CQUFBLGlCQUFBLGNBQWMsQ0FBQSw4Q0FBQSwwRUFBRTtvQkFBL0IsSUFBTSxLQUFLLDJCQUFBO29CQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLHNCQUFVLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssc0JBQVUsQ0FBQyxRQUFRLENBQUM7d0JBQzVFLEtBQUssQ0FBQyxtQkFBbUIsS0FBSyxJQUFJLEVBQUU7d0JBQ3RDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUNyRCxVQUFBLElBQUksSUFBSSxPQUFBLHlCQUF5QixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQWpELENBQWlELENBQUMsQ0FBQztxQkFDaEU7b0JBQ0QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLHNCQUFVLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7d0JBQzVFLEtBQUssQ0FBQyxrQkFBa0I7NEJBQ3BCLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUM7cUJBQzdGO2lCQUNGOzs7Ozs7Ozs7UUFDSCxDQUFDO1FBRUQsK0NBQWdCLEdBQWhCLFVBQWlCLEtBQXVCO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsd0NBQVMsR0FBVCxVQUFVLEtBQXVCO1lBQy9CLE9BQU8sc0JBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLG9DQUFzQixDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQTlCRCxJQThCQztJQTlCWSxvREFBb0I7SUFnQ2pDOzs7T0FHRztJQUNILFNBQVMseUJBQXlCLENBQzlCLFVBQXlCLEVBQUUsTUFBZSxFQUFFLFNBQW9COztRQUNsRSxJQUFNLEtBQUssd0JBQU8sVUFBVSxDQUFDLENBQUM7UUFFOUIsSUFBTSxLQUFLLEdBQWdDLENBQUM7Z0JBQzFDLFdBQVcsRUFBRSxpQkFBZSxTQUFTLENBQUMsSUFBSSxrREFBK0M7Z0JBQ3pGLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTztnQkFDdkMsSUFBSSxFQUFFLENBQUM7YUFDUixDQUFDLENBQUM7UUFFSCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQzNCLElBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFiLENBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRSxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNULFdBQVcsRUFBRSxNQUFJLFNBQVMsQ0FBQyxJQUFJLFNBQUksSUFBSSxNQUFHO2dCQUMxQyxRQUFRLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU87Z0JBQ3ZDLElBQUksRUFBRSxDQUFDO2FBQ1IsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxJQUFJLE9BQU8sS0FBSyxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUU7WUFDekMsS0FBSyxDQUFDLFdBQVcsR0FBRztnQkFDbEIsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO2dCQUM5QixRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7Z0JBQzdCLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtnQkFDckIsSUFBSSxFQUFFLEtBQUs7YUFDWixDQUFDO1NBQ0g7YUFBTTtZQUNMLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN4QyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7YUFDaEM7aUJBQU07Z0JBQ0wsQ0FBQSxLQUFBLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFBLENBQUMsSUFBSSxvREFBSSxLQUFLLElBQUU7YUFDdkM7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7YWJzb2x1dGVGcm9tU291cmNlRmlsZSwgQWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge01ldGFkYXRhUmVhZGVyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvbWV0YWRhdGEnO1xuaW1wb3J0IHtQYXJ0aWFsRXZhbHVhdG9yfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvcGFydGlhbF9ldmFsdWF0b3InO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBEZWNvcmF0b3J9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7SGFuZGxlckZsYWdzLCBUcmFpdFN0YXRlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdHJhbnNmb3JtJztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5pbXBvcnQge01pZ3JhdGlvbkhvc3R9IGZyb20gJy4uL21pZ3JhdGlvbnMvbWlncmF0aW9uJztcblxuaW1wb3J0IHtOZ2NjVHJhaXRDb21waWxlcn0gZnJvbSAnLi9uZ2NjX3RyYWl0X2NvbXBpbGVyJztcbmltcG9ydCB7aXNXaXRoaW5QYWNrYWdlfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIFRoZSBzdGFuZGFyZCBpbXBsZW1lbnRhdGlvbiBvZiBgTWlncmF0aW9uSG9zdGAsIHdoaWNoIGlzIGNyZWF0ZWQgYnkgdGhlIGBEZWNvcmF0aW9uQW5hbHl6ZXJgLlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdE1pZ3JhdGlvbkhvc3QgaW1wbGVtZW50cyBNaWdyYXRpb25Ib3N0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSByZWZsZWN0aW9uSG9zdDogTmdjY1JlZmxlY3Rpb25Ib3N0LCByZWFkb25seSBtZXRhZGF0YTogTWV0YWRhdGFSZWFkZXIsXG4gICAgICByZWFkb25seSBldmFsdWF0b3I6IFBhcnRpYWxFdmFsdWF0b3IsIHByaXZhdGUgY29tcGlsZXI6IE5nY2NUcmFpdENvbXBpbGVyLFxuICAgICAgcHJpdmF0ZSBlbnRyeVBvaW50UGF0aDogQWJzb2x1dGVGc1BhdGgpIHt9XG5cbiAgaW5qZWN0U3ludGhldGljRGVjb3JhdG9yKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IERlY29yYXRvciwgZmxhZ3M/OiBIYW5kbGVyRmxhZ3MpOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgbWlncmF0ZWRUcmFpdHMgPSB0aGlzLmNvbXBpbGVyLmluamVjdFN5bnRoZXRpY0RlY29yYXRvcihjbGF6eiwgZGVjb3JhdG9yLCBmbGFncyk7XG5cbiAgICBmb3IgKGNvbnN0IHRyYWl0IG9mIG1pZ3JhdGVkVHJhaXRzKSB7XG4gICAgICBpZiAoKHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLkFuYWx5emVkIHx8IHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLlJlc29sdmVkKSAmJlxuICAgICAgICAgIHRyYWl0LmFuYWx5c2lzRGlhZ25vc3RpY3MgIT09IG51bGwpIHtcbiAgICAgICAgdHJhaXQuYW5hbHlzaXNEaWFnbm9zdGljcyA9IHRyYWl0LmFuYWx5c2lzRGlhZ25vc3RpY3MubWFwKFxuICAgICAgICAgICAgZGlhZyA9PiBjcmVhdGVNaWdyYXRpb25EaWFnbm9zdGljKGRpYWcsIGNsYXp6LCBkZWNvcmF0b3IpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFpdC5zdGF0ZSA9PT0gVHJhaXRTdGF0ZS5SZXNvbHZlZCAmJiB0cmFpdC5yZXNvbHZlRGlhZ25vc3RpY3MgIT09IG51bGwpIHtcbiAgICAgICAgdHJhaXQucmVzb2x2ZURpYWdub3N0aWNzID1cbiAgICAgICAgICAgIHRyYWl0LnJlc29sdmVEaWFnbm9zdGljcy5tYXAoZGlhZyA9PiBjcmVhdGVNaWdyYXRpb25EaWFnbm9zdGljKGRpYWcsIGNsYXp6LCBkZWNvcmF0b3IpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRBbGxEZWNvcmF0b3JzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogRGVjb3JhdG9yW118bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZXIuZ2V0QWxsRGVjb3JhdG9ycyhjbGF6eik7XG4gIH1cblxuICBpc0luU2NvcGUoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNXaXRoaW5QYWNrYWdlKHRoaXMuZW50cnlQb2ludFBhdGgsIGFic29sdXRlRnJvbVNvdXJjZUZpbGUoY2xhenouZ2V0U291cmNlRmlsZSgpKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZGlhZ25vc3RpYyBmcm9tIGFub3RoZXIgb25lLCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHN5bnRoZXRpY1xuICogZGVjb3JhdG9yLlxuICovXG5mdW5jdGlvbiBjcmVhdGVNaWdyYXRpb25EaWFnbm9zdGljKFxuICAgIGRpYWdub3N0aWM6IHRzLkRpYWdub3N0aWMsIHNvdXJjZTogdHMuTm9kZSwgZGVjb3JhdG9yOiBEZWNvcmF0b3IpOiB0cy5EaWFnbm9zdGljIHtcbiAgY29uc3QgY2xvbmUgPSB7Li4uZGlhZ25vc3RpY307XG5cbiAgY29uc3QgY2hhaW46IHRzLkRpYWdub3N0aWNNZXNzYWdlQ2hhaW5bXSA9IFt7XG4gICAgbWVzc2FnZVRleHQ6IGBPY2N1cnMgZm9yIEAke2RlY29yYXRvci5uYW1lfSBkZWNvcmF0b3IgaW5zZXJ0ZWQgYnkgYW4gYXV0b21hdGljIG1pZ3JhdGlvbmAsXG4gICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5NZXNzYWdlLFxuICAgIGNvZGU6IDAsXG4gIH1dO1xuXG4gIGlmIChkZWNvcmF0b3IuYXJncyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGFyZ3MgPSBkZWNvcmF0b3IuYXJncy5tYXAoYXJnID0+IGFyZy5nZXRUZXh0KCkpLmpvaW4oJywgJyk7XG4gICAgY2hhaW4ucHVzaCh7XG4gICAgICBtZXNzYWdlVGV4dDogYEAke2RlY29yYXRvci5uYW1lfSgke2FyZ3N9KWAsXG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lk1lc3NhZ2UsXG4gICAgICBjb2RlOiAwLFxuICAgIH0pO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBjbG9uZS5tZXNzYWdlVGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICBjbG9uZS5tZXNzYWdlVGV4dCA9IHtcbiAgICAgIG1lc3NhZ2VUZXh0OiBjbG9uZS5tZXNzYWdlVGV4dCxcbiAgICAgIGNhdGVnb3J5OiBkaWFnbm9zdGljLmNhdGVnb3J5LFxuICAgICAgY29kZTogZGlhZ25vc3RpYy5jb2RlLFxuICAgICAgbmV4dDogY2hhaW4sXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY2xvbmUubWVzc2FnZVRleHQubmV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbG9uZS5tZXNzYWdlVGV4dC5uZXh0ID0gY2hhaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsb25lLm1lc3NhZ2VUZXh0Lm5leHQucHVzaCguLi5jaGFpbik7XG4gICAgfVxuICB9XG4gIHJldHVybiBjbG9uZTtcbn1cbiJdfQ==
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_linker_selector", ["require", "exports", "tslib", "semver", "@angular/compiler-cli/linker/src/file_linker/get_source_file", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_class_metadata_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_component_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_directive_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_factory_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_injectable_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_injector_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_ng_module_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_pipe_linker_1"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartialLinkerSelector = exports.createLinkerMap = exports.declarationFunctions = exports.ɵɵngDeclarePipe = exports.ɵɵngDeclareNgModule = exports.ɵɵngDeclareInjector = exports.ɵɵngDeclareInjectable = exports.ɵɵngDeclareFactory = exports.ɵɵngDeclareComponent = exports.ɵɵngDeclareClassMetadata = exports.ɵɵngDeclareDirective = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var semver_1 = require("semver");
    var get_source_file_1 = require("@angular/compiler-cli/linker/src/file_linker/get_source_file");
    var partial_class_metadata_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_class_metadata_linker_1");
    var partial_component_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_component_linker_1");
    var partial_directive_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_directive_linker_1");
    var partial_factory_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_factory_linker_1");
    var partial_injectable_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_injectable_linker_1");
    var partial_injector_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_injector_linker_1");
    var partial_ng_module_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_ng_module_linker_1");
    var partial_pipe_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_pipe_linker_1");
    exports.ɵɵngDeclareDirective = 'ɵɵngDeclareDirective';
    exports.ɵɵngDeclareClassMetadata = 'ɵɵngDeclareClassMetadata';
    exports.ɵɵngDeclareComponent = 'ɵɵngDeclareComponent';
    exports.ɵɵngDeclareFactory = 'ɵɵngDeclareFactory';
    exports.ɵɵngDeclareInjectable = 'ɵɵngDeclareInjectable';
    exports.ɵɵngDeclareInjector = 'ɵɵngDeclareInjector';
    exports.ɵɵngDeclareNgModule = 'ɵɵngDeclareNgModule';
    exports.ɵɵngDeclarePipe = 'ɵɵngDeclarePipe';
    exports.declarationFunctions = [
        exports.ɵɵngDeclareDirective, exports.ɵɵngDeclareClassMetadata, exports.ɵɵngDeclareComponent, exports.ɵɵngDeclareFactory,
        exports.ɵɵngDeclareInjectable, exports.ɵɵngDeclareInjector, exports.ɵɵngDeclareNgModule, exports.ɵɵngDeclarePipe
    ];
    /**
     * Create a mapping between partial-declaration call name and collections of partial-linkers.
     *
     * Each collection of partial-linkers will contain a version range that will be matched against the
     * `minVersion` of the partial-declaration. (Additionally, a partial-linker may modify its behaviour
     * internally based on the `version` property of the declaration.)
     *
     * Versions should be sorted in ascending order. The most recent partial-linker will be used as the
     * fallback linker if none of the other version ranges match. For example:
     *
     * ```
     * {range: getRange('<=', '13.0.0'), linker PartialDirectiveLinkerVersion2(...) },
     * {range: getRange('<=', '13.1.0'), linker PartialDirectiveLinkerVersion3(...) },
     * {range: getRange('<=', '14.0.0'), linker PartialDirectiveLinkerVersion4(...) },
     * {range: LATEST_VERSION_RANGE, linker: new PartialDirectiveLinkerVersion1(...)},
     * ```
     *
     * If the `LATEST_VERSION_RANGE` is `<=15.0.0` then the fallback linker would be
     * `PartialDirectiveLinkerVersion1` for any version greater than `15.0.0`.
     *
     * When there is a change to a declaration interface that requires a new partial-linker, the
     * `minVersion` of the partial-declaration should be updated, the new linker implementation should
     * be added to the end of the collection, and the version of the previous linker should be updated.
     */
    function createLinkerMap(environment, sourceUrl, code) {
        var linkers = new Map();
        var LATEST_VERSION_RANGE = getRange('<=', '12.0.2');
        linkers.set(exports.ɵɵngDeclareDirective, [
            { range: LATEST_VERSION_RANGE, linker: new partial_directive_linker_1_1.PartialDirectiveLinkerVersion1(sourceUrl, code) },
        ]);
        linkers.set(exports.ɵɵngDeclareClassMetadata, [
            { range: LATEST_VERSION_RANGE, linker: new partial_class_metadata_linker_1_1.PartialClassMetadataLinkerVersion1() },
        ]);
        linkers.set(exports.ɵɵngDeclareComponent, [
            {
                range: LATEST_VERSION_RANGE,
                linker: new partial_component_linker_1_1.PartialComponentLinkerVersion1(get_source_file_1.createGetSourceFile(sourceUrl, code, environment.sourceFileLoader), sourceUrl, code)
            },
        ]);
        linkers.set(exports.ɵɵngDeclareFactory, [
            { range: LATEST_VERSION_RANGE, linker: new partial_factory_linker_1_1.PartialFactoryLinkerVersion1() },
        ]);
        linkers.set(exports.ɵɵngDeclareInjectable, [
            { range: LATEST_VERSION_RANGE, linker: new partial_injectable_linker_1_1.PartialInjectableLinkerVersion1() },
        ]);
        linkers.set(exports.ɵɵngDeclareInjector, [
            { range: LATEST_VERSION_RANGE, linker: new partial_injector_linker_1_1.PartialInjectorLinkerVersion1() },
        ]);
        linkers.set(exports.ɵɵngDeclareNgModule, [
            {
                range: LATEST_VERSION_RANGE,
                linker: new partial_ng_module_linker_1_1.PartialNgModuleLinkerVersion1(environment.options.linkerJitMode)
            },
        ]);
        linkers.set(exports.ɵɵngDeclarePipe, [
            { range: LATEST_VERSION_RANGE, linker: new partial_pipe_linker_1_1.PartialPipeLinkerVersion1() },
        ]);
        return linkers;
    }
    exports.createLinkerMap = createLinkerMap;
    /**
     * A helper that selects the appropriate `PartialLinker` for a given declaration.
     *
     * The selection is made from a database of linker instances, chosen if their given semver range
     * satisfies the `minVersion` of the partial declaration to be linked.
     *
     * Note that the ranges are checked in order, and the first matching range will be selected. So
     * ranges should be most restrictive first. In practice, since ranges are always `<=X.Y.Z` this
     * means that ranges should be in ascending order.
     *
     * Note that any "pre-release" versions are stripped from ranges. Therefore if a `minVersion` is
     * `11.1.0-next.1` then this would match `11.1.0-next.2` and also `12.0.0-next.1`. (This is
     * different to standard semver range checking, where pre-release versions do not cross full version
     * boundaries.)
     */
    var PartialLinkerSelector = /** @class */ (function () {
        function PartialLinkerSelector(linkers, logger, unknownDeclarationVersionHandling) {
            this.linkers = linkers;
            this.logger = logger;
            this.unknownDeclarationVersionHandling = unknownDeclarationVersionHandling;
        }
        /**
         * Returns true if there are `PartialLinker` classes that can handle functions with this name.
         */
        PartialLinkerSelector.prototype.supportsDeclaration = function (functionName) {
            return this.linkers.has(functionName);
        };
        /**
         * Returns the `PartialLinker` that can handle functions with the given name and version.
         * Throws an error if there is none.
         */
        PartialLinkerSelector.prototype.getLinker = function (functionName, minVersion, version) {
            var e_1, _a;
            if (!this.linkers.has(functionName)) {
                throw new Error("Unknown partial declaration function " + functionName + ".");
            }
            var linkerRanges = this.linkers.get(functionName);
            if (version === '12.0.2') {
                // Special case if the `version` is the same as the current compiler version.
                // This helps with compliance tests where the version placeholders have not been replaced.
                return linkerRanges[linkerRanges.length - 1].linker;
            }
            var declarationRange = getRange('>=', minVersion);
            try {
                for (var linkerRanges_1 = tslib_1.__values(linkerRanges), linkerRanges_1_1 = linkerRanges_1.next(); !linkerRanges_1_1.done; linkerRanges_1_1 = linkerRanges_1.next()) {
                    var _b = linkerRanges_1_1.value, linkerRange = _b.range, linker = _b.linker;
                    if (semver_1.intersects(declarationRange, linkerRange)) {
                        return linker;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (linkerRanges_1_1 && !linkerRanges_1_1.done && (_a = linkerRanges_1.return)) _a.call(linkerRanges_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var message = "This application depends upon a library published using Angular version " + version + ", " +
                ("which requires Angular version " + minVersion + " or newer to work correctly.\n") +
                "Consider upgrading your application to use a more recent version of Angular.";
            if (this.unknownDeclarationVersionHandling === 'error') {
                throw new Error(message);
            }
            else if (this.unknownDeclarationVersionHandling === 'warn') {
                this.logger.warn(message + "\nAttempting to continue using this version of Angular.");
            }
            // No linker was matched for this declaration, so just use the most recent one.
            return linkerRanges[linkerRanges.length - 1].linker;
        };
        return PartialLinkerSelector;
    }());
    exports.PartialLinkerSelector = PartialLinkerSelector;
    /**
     * Compute a semver Range from the `version` and comparator.
     *
     * The range is computed as any version greater/less than or equal to the given `versionStr`
     * depending upon the `comparator` (ignoring any prerelease versions).
     *
     * @param comparator a string that determines whether the version specifies a minimum or a maximum
     *     range.
     * @param versionStr the version given in the partial declaration
     * @returns A semver range for the provided `version` and comparator.
     */
    function getRange(comparator, versionStr) {
        var version = new semver_1.SemVer(versionStr);
        // Wipe out any prerelease versions
        version.prerelease = [];
        return new semver_1.Range("" + comparator + version.format());
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9saW5rZXJfc2VsZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL3NyYy9maWxlX2xpbmtlci9wYXJ0aWFsX2xpbmtlcnMvcGFydGlhbF9saW5rZXJfc2VsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlDQUFpRDtJQUlqRCxnR0FBdUQ7SUFHdkQsZ0pBQXFGO0lBQ3JGLHNJQUE0RTtJQUM1RSxzSUFBNEU7SUFDNUUsa0lBQXdFO0lBQ3hFLHdJQUE4RTtJQUM5RSxvSUFBMEU7SUFFMUUsc0lBQTJFO0lBQzNFLDRIQUFrRTtJQUVyRCxRQUFBLG9CQUFvQixHQUFHLHNCQUFzQixDQUFDO0lBQzlDLFFBQUEsd0JBQXdCLEdBQUcsMEJBQTBCLENBQUM7SUFDdEQsUUFBQSxvQkFBb0IsR0FBRyxzQkFBc0IsQ0FBQztJQUM5QyxRQUFBLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0lBQzFDLFFBQUEscUJBQXFCLEdBQUcsdUJBQXVCLENBQUM7SUFDaEQsUUFBQSxtQkFBbUIsR0FBRyxxQkFBcUIsQ0FBQztJQUM1QyxRQUFBLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0lBQzVDLFFBQUEsZUFBZSxHQUFHLGlCQUFpQixDQUFDO0lBQ3BDLFFBQUEsb0JBQW9CLEdBQUc7UUFDbEMsNEJBQW9CLEVBQUUsZ0NBQXdCLEVBQUUsNEJBQW9CLEVBQUUsMEJBQWtCO1FBQ3hGLDZCQUFxQixFQUFFLDJCQUFtQixFQUFFLDJCQUFtQixFQUFFLHVCQUFlO0tBQ2pGLENBQUM7SUFPRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F1Qkc7SUFDSCxTQUFnQixlQUFlLENBQzNCLFdBQXVELEVBQUUsU0FBeUIsRUFDbEYsSUFBWTtRQUNkLElBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFz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LEtBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUksQ0FBQyxDQUFDO0lBQ3ZELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7aW50ZXJzZWN0cywgUmFuZ2UsIFNlbVZlcn0gZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aH0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge2NyZWF0ZUdldFNvdXJjZUZpbGV9IGZyb20gJy4uL2dldF9zb3VyY2VfZmlsZSc7XG5pbXBvcnQge0xpbmtlckVudmlyb25tZW50fSBmcm9tICcuLi9saW5rZXJfZW52aXJvbm1lbnQnO1xuXG5pbXBvcnQge1BhcnRpYWxDbGFzc01ldGFkYXRhTGlua2VyVmVyc2lvbjF9IGZyb20gJy4vcGFydGlhbF9jbGFzc19tZXRhZGF0YV9saW5rZXJfMSc7XG5pbXBvcnQge1BhcnRpYWxDb21wb25lbnRMaW5rZXJWZXJzaW9uMX0gZnJvbSAnLi9wYXJ0aWFsX2NvbXBvbmVudF9saW5rZXJfMSc7XG5pbXBvcnQge1BhcnRpYWxEaXJlY3RpdmVMaW5rZXJWZXJzaW9uMX0gZnJvbSAnLi9wYXJ0aWFsX2RpcmVjdGl2ZV9saW5rZXJfMSc7XG5pbXBvcnQge1BhcnRpYWxGYWN0b3J5TGlua2VyVmVyc2lvbjF9IGZyb20gJy4vcGFydGlhbF9mYWN0b3J5X2xpbmtlcl8xJztcbmltcG9ydCB7UGFydGlhbEluamVjdGFibGVMaW5rZXJWZXJzaW9uMX0gZnJvbSAnLi9wYXJ0aWFsX2luamVjdGFibGVfbGlua2VyXzEnO1xuaW1wb3J0IHtQYXJ0aWFsSW5qZWN0b3JMaW5rZXJWZXJzaW9uMX0gZnJvbSAnLi9wYXJ0aWFsX2luamVjdG9yX2xpbmtlcl8xJztcbmltcG9ydCB7UGFydGlhbExpbmtlcn0gZnJvbSAnLi9wYXJ0aWFsX2xpbmtlcic7XG5pbXBvcnQge1BhcnRpYWxOZ01vZHVsZUxpbmtlclZlcnNpb24xfSBmcm9tICcuL3BhcnRpYWxfbmdfbW9kdWxlX2xpbmtlcl8xJztcbmltcG9ydCB7UGFydGlhbFBpcGVMaW5rZXJWZXJzaW9uMX0gZnJvbSAnLi9wYXJ0aWFsX3BpcGVfbGlua2VyXzEnO1xuXG5leHBvcnQgY29uc3QgybXJtW5nRGVjbGFyZURpcmVjdGl2ZSA9ICfJtcm1bmdEZWNsYXJlRGlyZWN0aXZlJztcbmV4cG9ydCBjb25zdCDJtcm1bmdEZWNsYXJlQ2xhc3NNZXRhZGF0YSA9ICfJtcm1bmdEZWNsYXJlQ2xhc3NNZXRhZGF0YSc7XG5leHBvcnQgY29uc3QgybXJtW5nRGVjbGFyZUNvbXBvbmVudCA9ICfJtcm1bmdEZWNsYXJlQ29tcG9uZW50JztcbmV4cG9ydCBjb25zdCDJtcm1bmdEZWNsYXJlRmFjdG9yeSA9ICfJtcm1bmdEZWNsYXJlRmFjdG9yeSc7XG5leHBvcnQgY29uc3QgybXJtW5nRGVjbGFyZUluamVjdGFibGUgPSAnybXJtW5nRGVjbGFyZUluamVjdGFibGUnO1xuZXhwb3J0IGNvbnN0IMm1ybVuZ0RlY2xhcmVJbmplY3RvciA9ICfJtcm1bmdEZWNsYXJlSW5qZWN0b3InO1xuZXhwb3J0IGNvbnN0IMm1ybVuZ0RlY2xhcmVOZ01vZHVsZSA9ICfJtcm1bmdEZWNsYXJlTmdNb2R1bGUnO1xuZXhwb3J0IGNvbnN0IMm1ybVuZ0RlY2xhcmVQaXBlID0gJ8m1ybVuZ0RlY2xhcmVQaXBlJztcbmV4cG9ydCBjb25zdCBkZWNsYXJhdGlvbkZ1bmN0aW9ucyA9IFtcbiAgybXJtW5nRGVjbGFyZURpcmVjdGl2ZSwgybXJtW5nRGVjbGFyZUNsYXNzTWV0YWRhdGEsIMm1ybVuZ0RlY2xhcmVDb21wb25lbnQsIMm1ybVuZ0RlY2xhcmVGYWN0b3J5LFxuICDJtcm1bmdEZWNsYXJlSW5qZWN0YWJsZSwgybXJtW5nRGVjbGFyZUluamVjdG9yLCDJtcm1bmdEZWNsYXJlTmdNb2R1bGUsIMm1ybVuZ0RlY2xhcmVQaXBlXG5dO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpbmtlclJhbmdlPFRFeHByZXNzaW9uPiB7XG4gIHJhbmdlOiBSYW5nZTtcbiAgbGlua2VyOiBQYXJ0aWFsTGlua2VyPFRFeHByZXNzaW9uPjtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBtYXBwaW5nIGJldHdlZW4gcGFydGlhbC1kZWNsYXJhdGlvbiBjYWxsIG5hbWUgYW5kIGNvbGxlY3Rpb25zIG9mIHBhcnRpYWwtbGlua2Vycy5cbiAqXG4gKiBFYWNoIGNvbGxlY3Rpb24gb2YgcGFydGlhbC1saW5rZXJzIHdpbGwgY29udGFpbiBhIHZlcnNpb24gcmFuZ2UgdGhhdCB3aWxsIGJlIG1hdGNoZWQgYWdhaW5zdCB0aGVcbiAqIGBtaW5WZXJzaW9uYCBvZiB0aGUgcGFydGlhbC1kZWNsYXJhdGlvbi4gKEFkZGl0aW9uYWxseSwgYSBwYXJ0aWFsLWxpbmtlciBtYXkgbW9kaWZ5IGl0cyBiZWhhdmlvdXJcbiAqIGludGVybmFsbHkgYmFzZWQgb24gdGhlIGB2ZXJzaW9uYCBwcm9wZXJ0eSBvZiB0aGUgZGVjbGFyYXRpb24uKVxuICpcbiAqIFZlcnNpb25zIHNob3VsZCBiZSBzb3J0ZWQgaW4gYXNjZW5kaW5nIG9yZGVyLiBUaGUgbW9zdCByZWNlbnQgcGFydGlhbC1saW5rZXIgd2lsbCBiZSB1c2VkIGFzIHRoZVxuICogZmFsbGJhY2sgbGlua2VyIGlmIG5vbmUgb2YgdGhlIG90aGVyIHZlcnNpb24gcmFuZ2VzIG1hdGNoLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIHtyYW5nZTogZ2V0UmFuZ2UoJzw9JywgJzEzLjAuMCcpLCBsaW5rZXIgUGFydGlhbERpcmVjdGl2ZUxpbmtlclZlcnNpb24yKC4uLikgfSxcbiAqIHtyYW5nZTogZ2V0UmFuZ2UoJzw9JywgJzEzLjEuMCcpLCBsaW5rZXIgUGFydGlhbERpcmVjdGl2ZUxpbmtlclZlcnNpb24zKC4uLikgfSxcbiAqIHtyYW5nZTogZ2V0UmFuZ2UoJzw9JywgJzE0LjAuMCcpLCBsaW5rZXIgUGFydGlhbERpcmVjdGl2ZUxpbmtlclZlcnNpb240KC4uLikgfSxcbiAqIHtyYW5nZTogTEFURVNUX1ZFUlNJT05fUkFOR0UsIGxpbmtlcjogbmV3IFBhcnRpYWxEaXJlY3RpdmVMaW5rZXJWZXJzaW9uMSguLi4pfSxcbiAqIGBgYFxuICpcbiAqIElmIHRoZSBgTEFURVNUX1ZFUlNJT05fUkFOR0VgIGlzIGA8PTE1LjAuMGAgdGhlbiB0aGUgZmFsbGJhY2sgbGlua2VyIHdvdWxkIGJlXG4gKiBgUGFydGlhbERpcmVjdGl2ZUxpbmtlclZlcnNpb24xYCBmb3IgYW55IHZlcnNpb24gZ3JlYXRlciB0aGFuIGAxNS4wLjBgLlxuICpcbiAqIFdoZW4gdGhlcmUgaXMgYSBjaGFuZ2UgdG8gYSBkZWNsYXJhdGlvbiBpbnRlcmZhY2UgdGhhdCByZXF1aXJlcyBhIG5ldyBwYXJ0aWFsLWxpbmtlciwgdGhlXG4gKiBgbWluVmVyc2lvbmAgb2YgdGhlIHBhcnRpYWwtZGVjbGFyYXRpb24gc2hvdWxkIGJlIHVwZGF0ZWQsIHRoZSBuZXcgbGlua2VyIGltcGxlbWVudGF0aW9uIHNob3VsZFxuICogYmUgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgY29sbGVjdGlvbiwgYW5kIHRoZSB2ZXJzaW9uIG9mIHRoZSBwcmV2aW91cyBsaW5rZXIgc2hvdWxkIGJlIHVwZGF0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMaW5rZXJNYXA8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+KFxuICAgIGVudmlyb25tZW50OiBMaW5rZXJFbnZpcm9ubWVudDxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4sIHNvdXJjZVVybDogQWJzb2x1dGVGc1BhdGgsXG4gICAgY29kZTogc3RyaW5nKTogTWFwPHN0cmluZywgTGlua2VyUmFuZ2U8VEV4cHJlc3Npb24+W10+IHtcbiAgY29uc3QgbGlua2VycyA9IG5ldyBNYXA8c3RyaW5nLCBMaW5rZXJSYW5nZTxURXhwcmVzc2lvbj5bXT4oKTtcbiAgY29uc3QgTEFURVNUX1ZFUlNJT05fUkFOR0UgPSBnZXRSYW5nZSgnPD0nLCAnMC4wLjAtUExBQ0VIT0xERVInKTtcblxuICBsaW5rZXJzLnNldCjJtcm1bmdEZWNsYXJlRGlyZWN0aXZlLCBbXG4gICAge3JhbmdlOiBMQVRFU1RfVkVSU0lPTl9SQU5HRSwgbGlua2VyOiBuZXcgUGFydGlhbERpcmVjdGl2ZUxpbmtlclZlcnNpb24xKHNvdXJjZVVybCwgY29kZSl9LFxuICBdKTtcbiAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZUNsYXNzTWV0YWRhdGEsIFtcbiAgICB7cmFuZ2U6IExBVEVTVF9WRVJTSU9OX1JBTkdFLCBsaW5rZXI6IG5ldyBQYXJ0aWFsQ2xhc3NNZXRhZGF0YUxpbmtlclZlcnNpb24xKCl9LFxuICBdKTtcbiAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZUNvbXBvbmVudCwgW1xuICAgIHtcbiAgICAgIHJhbmdlOiBMQVRFU1RfVkVSU0lPTl9SQU5HRSxcbiAgICAgIGxpbmtlcjogbmV3IFBhcnRpYWxDb21wb25lbnRMaW5rZXJWZXJzaW9uMShcbiAgICAgICAgICBjcmVhdGVHZXRTb3VyY2VGaWxlKHNvdXJjZVVybCwgY29kZSwgZW52aXJvbm1lbnQuc291cmNlRmlsZUxvYWRlciksIHNvdXJjZVVybCwgY29kZSlcbiAgICB9LFxuICBdKTtcbiAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZUZhY3RvcnksIFtcbiAgICB7cmFuZ2U6IExBVEVTVF9WRVJTSU9OX1JBTkdFLCBsaW5rZXI6IG5ldyBQYXJ0aWFsRmFjdG9yeUxpbmtlclZlcnNpb24xKCl9LFxuICBdKTtcbiAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZUluamVjdGFibGUsIFtcbiAgICB7cmFuZ2U6IExBVEVTVF9WRVJTSU9OX1JBTkdFLCBsaW5rZXI6IG5ldyBQYXJ0aWFsSW5qZWN0YWJsZUxpbmtlclZlcnNpb24xKCl9LFxuICBdKTtcbiAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZUluamVjdG9yLCBbXG4gICAge3JhbmdlOiBMQVRFU1RfVkVSU0lPTl9SQU5HRSwgbGlua2VyOiBuZXcgUGFydGlhbEluamVjdG9yTGlua2VyVmVyc2lvbjEoKX0sXG4gIF0pO1xuICBsaW5rZXJzLnNldCjJtcm1bmdEZWNsYXJlTmdNb2R1bGUsIFtcbiAgICB7XG4gICAgICByYW5nZTogTEFURVNUX1ZFUlNJT05fUkFOR0UsXG4gICAgICBsaW5rZXI6IG5ldyBQYXJ0aWFsTmdNb2R1bGVMaW5rZXJWZXJzaW9uMShlbnZpcm9ubWVudC5vcHRpb25zLmxpbmtlckppdE1vZGUpXG4gICAgfSxcbiAgXSk7XG4gIGxpbmtlcnMuc2V0KMm1ybVuZ0RlY2xhcmVQaXBlLCBbXG4gICAge3JhbmdlOiBMQVRFU1RfVkVSU0lPTl9SQU5HRSwgbGlua2VyOiBuZXcgUGFydGlhbFBpcGVMaW5rZXJWZXJzaW9uMSgpfSxcbiAgXSk7XG5cbiAgcmV0dXJuIGxpbmtlcnM7XG59XG5cbi8qKlxuICogQSBoZWxwZXIgdGhhdCBzZWxlY3RzIHRoZSBhcHByb3ByaWF0ZSBgUGFydGlhbExpbmtlcmAgZm9yIGEgZ2l2ZW4gZGVjbGFyYXRpb24uXG4gKlxuICogVGhlIHNlbGVjdGlvbiBpcyBtYWRlIGZyb20gYSBkYXRhYmFzZSBvZiBsaW5rZXIgaW5zdGFuY2VzLCBjaG9zZW4gaWYgdGhlaXIgZ2l2ZW4gc2VtdmVyIHJhbmdlXG4gKiBzYXRpc2ZpZXMgdGhlIGBtaW5WZXJzaW9uYCBvZiB0aGUgcGFydGlhbCBkZWNsYXJhdGlvbiB0byBiZSBsaW5rZWQuXG4gKlxuICogTm90ZSB0aGF0IHRoZSByYW5nZXMgYXJlIGNoZWNrZWQgaW4gb3JkZXIsIGFuZCB0aGUgZmlyc3QgbWF0Y2hpbmcgcmFuZ2Ugd2lsbCBiZSBzZWxlY3RlZC4gU29cbiAqIHJhbmdlcyBzaG91bGQgYmUgbW9zdCByZXN0cmljdGl2ZSBmaXJzdC4gSW4gcHJhY3RpY2UsIHNpbmNlIHJhbmdlcyBhcmUgYWx3YXlzIGA8PVguWS5aYCB0aGlzXG4gKiBtZWFucyB0aGF0IHJhbmdlcyBzaG91bGQgYmUgaW4gYXNjZW5kaW5nIG9yZGVyLlxuICpcbiAqIE5vdGUgdGhhdCBhbnkgXCJwcmUtcmVsZWFzZVwiIHZlcnNpb25zIGFyZSBzdHJpcHBlZCBmcm9tIHJhbmdlcy4gVGhlcmVmb3JlIGlmIGEgYG1pblZlcnNpb25gIGlzXG4gKiBgMTEuMS4wLW5leHQuMWAgdGhlbiB0aGlzIHdvdWxkIG1hdGNoIGAxMS4xLjAtbmV4dC4yYCBhbmQgYWxzbyBgMTIuMC4wLW5leHQuMWAuIChUaGlzIGlzXG4gKiBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgc2VtdmVyIHJhbmdlIGNoZWNraW5nLCB3aGVyZSBwcmUtcmVsZWFzZSB2ZXJzaW9ucyBkbyBub3QgY3Jvc3MgZnVsbCB2ZXJzaW9uXG4gKiBib3VuZGFyaWVzLilcbiAqL1xuZXhwb3J0IGNsYXNzIFBhcnRpYWxMaW5rZXJTZWxlY3RvcjxURXhwcmVzc2lvbj4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgbGlua2VyczogTWFwPHN0cmluZywgTGlua2VyUmFuZ2U8VEV4cHJlc3Npb24+W10+LFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IExvZ2dlcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgdW5rbm93bkRlY2xhcmF0aW9uVmVyc2lvbkhhbmRsaW5nOiAnaWdub3JlJ3wnd2Fybid8J2Vycm9yJykge31cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZXJlIGFyZSBgUGFydGlhbExpbmtlcmAgY2xhc3NlcyB0aGF0IGNhbiBoYW5kbGUgZnVuY3Rpb25zIHdpdGggdGhpcyBuYW1lLlxuICAgKi9cbiAgc3VwcG9ydHNEZWNsYXJhdGlvbihmdW5jdGlvbk5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpbmtlcnMuaGFzKGZ1bmN0aW9uTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYFBhcnRpYWxMaW5rZXJgIHRoYXQgY2FuIGhhbmRsZSBmdW5jdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgdmVyc2lvbi5cbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZXJlIGlzIG5vbmUuXG4gICAqL1xuICBnZXRMaW5rZXIoZnVuY3Rpb25OYW1lOiBzdHJpbmcsIG1pblZlcnNpb246IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKTogUGFydGlhbExpbmtlcjxURXhwcmVzc2lvbj4ge1xuICAgIGlmICghdGhpcy5saW5rZXJzLmhhcyhmdW5jdGlvbk5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGFydGlhbCBkZWNsYXJhdGlvbiBmdW5jdGlvbiAke2Z1bmN0aW9uTmFtZX0uYCk7XG4gICAgfVxuICAgIGNvbnN0IGxpbmtlclJhbmdlcyA9IHRoaXMubGlua2Vycy5nZXQoZnVuY3Rpb25OYW1lKSE7XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gJzAuMC4wLVBMQUNFSE9MREVSJykge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlIGlmIHRoZSBgdmVyc2lvbmAgaXMgdGhlIHNhbWUgYXMgdGhlIGN1cnJlbnQgY29tcGlsZXIgdmVyc2lvbi5cbiAgICAgIC8vIFRoaXMgaGVscHMgd2l0aCBjb21wbGlhbmNlIHRlc3RzIHdoZXJlIHRoZSB2ZXJzaW9uIHBsYWNlaG9sZGVycyBoYXZlIG5vdCBiZWVuIHJlcGxhY2VkLlxuICAgICAgcmV0dXJuIGxpbmtlclJhbmdlc1tsaW5rZXJSYW5nZXMubGVuZ3RoIC0gMV0ubGlua2VyO1xuICAgIH1cblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uUmFuZ2UgPSBnZXRSYW5nZSgnPj0nLCBtaW5WZXJzaW9uKTtcbiAgICBmb3IgKGNvbnN0IHtyYW5nZTogbGlua2VyUmFuZ2UsIGxpbmtlcn0gb2YgbGlua2VyUmFuZ2VzKSB7XG4gICAgICBpZiAoaW50ZXJzZWN0cyhkZWNsYXJhdGlvblJhbmdlLCBsaW5rZXJSYW5nZSkpIHtcbiAgICAgICAgcmV0dXJuIGxpbmtlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgICAgYFRoaXMgYXBwbGljYXRpb24gZGVwZW5kcyB1cG9uIGEgbGlicmFyeSBwdWJsaXNoZWQgdXNpbmcgQW5ndWxhciB2ZXJzaW9uICR7dmVyc2lvbn0sIGAgK1xuICAgICAgICBgd2hpY2ggcmVxdWlyZXMgQW5ndWxhciB2ZXJzaW9uICR7bWluVmVyc2lvbn0gb3IgbmV3ZXIgdG8gd29yayBjb3JyZWN0bHkuXFxuYCArXG4gICAgICAgIGBDb25zaWRlciB1cGdyYWRpbmcgeW91ciBhcHBsaWNhdGlvbiB0byB1c2UgYSBtb3JlIHJlY2VudCB2ZXJzaW9uIG9mIEFuZ3VsYXIuYDtcblxuICAgIGlmICh0aGlzLnVua25vd25EZWNsYXJhdGlvblZlcnNpb25IYW5kbGluZyA9PT0gJ2Vycm9yJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSBpZiAodGhpcy51bmtub3duRGVjbGFyYXRpb25WZXJzaW9uSGFuZGxpbmcgPT09ICd3YXJuJykge1xuICAgICAgdGhpcy5sb2dnZXIud2FybihgJHttZXNzYWdlfVxcbkF0dGVtcHRpbmcgdG8gY29udGludWUgdXNpbmcgdGhpcyB2ZXJzaW9uIG9mIEFuZ3VsYXIuYCk7XG4gICAgfVxuXG4gICAgLy8gTm8gbGlua2VyIHdhcyBtYXRjaGVkIGZvciB0aGlzIGRlY2xhcmF0aW9uLCBzbyBqdXN0IHVzZSB0aGUgbW9zdCByZWNlbnQgb25lLlxuICAgIHJldHVybiBsaW5rZXJSYW5nZXNbbGlua2VyUmFuZ2VzLmxlbmd0aCAtIDFdLmxpbmtlcjtcbiAgfVxufVxuXG4vKipcbiAqIENvbXB1dGUgYSBzZW12ZXIgUmFuZ2UgZnJvbSB0aGUgYHZlcnNpb25gIGFuZCBjb21wYXJhdG9yLlxuICpcbiAqIFRoZSByYW5nZSBpcyBjb21wdXRlZCBhcyBhbnkgdmVyc2lvbiBncmVhdGVyL2xlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgZ2l2ZW4gYHZlcnNpb25TdHJgXG4gKiBkZXBlbmRpbmcgdXBvbiB0aGUgYGNvbXBhcmF0b3JgIChpZ25vcmluZyBhbnkgcHJlcmVsZWFzZSB2ZXJzaW9ucykuXG4gKlxuICogQHBhcmFtIGNvbXBhcmF0b3IgYSBzdHJpbmcgdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHZlcnNpb24gc3BlY2lmaWVzIGEgbWluaW11bSBvciBhIG1heGltdW1cbiAqICAgICByYW5nZS5cbiAqIEBwYXJhbSB2ZXJzaW9uU3RyIHRoZSB2ZXJzaW9uIGdpdmVuIGluIHRoZSBwYXJ0aWFsIGRlY2xhcmF0aW9uXG4gKiBAcmV0dXJucyBBIHNlbXZlciByYW5nZSBmb3IgdGhlIHByb3ZpZGVkIGB2ZXJzaW9uYCBhbmQgY29tcGFyYXRvci5cbiAqL1xuZnVuY3Rpb24gZ2V0UmFuZ2UoY29tcGFyYXRvcjogJzw9J3wnPj0nLCB2ZXJzaW9uU3RyOiBzdHJpbmcpOiBSYW5nZSB7XG4gIGNvbnN0IHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb25TdHIpO1xuICAvLyBXaXBlIG91dCBhbnkgcHJlcmVsZWFzZSB2ZXJzaW9uc1xuICB2ZXJzaW9uLnByZXJlbGVhc2UgPSBbXTtcbiAgcmV0dXJuIG5ldyBSYW5nZShgJHtjb21wYXJhdG9yfSR7dmVyc2lvbi5mb3JtYXQoKX1gKTtcbn1cbiJdfQ==
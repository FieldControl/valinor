(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/ngcc/src/writing/in_place_file_writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NewEntryPointFileWriter = exports.NGCC_PROPERTY_EXTENSION = exports.NGCC_DIRECTORY = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var in_place_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer");
    exports.NGCC_DIRECTORY = '__ivy_ngcc__';
    exports.NGCC_PROPERTY_EXTENSION = '_ivy_ngcc';
    /**
     * This FileWriter creates a copy of the original entry-point, then writes the transformed
     * files onto the files in this copy, and finally updates the package.json with a new
     * entry-point format property that points to this new entry-point.
     *
     * If there are transformed typings files in this bundle, they are updated in-place (see the
     * `InPlaceFileWriter`).
     */
    var NewEntryPointFileWriter = /** @class */ (function (_super) {
        tslib_1.__extends(NewEntryPointFileWriter, _super);
        function NewEntryPointFileWriter(fs, logger, errorOnFailedEntryPoint, pkgJsonUpdater) {
            var _this = _super.call(this, fs, logger, errorOnFailedEntryPoint) || this;
            _this.pkgJsonUpdater = pkgJsonUpdater;
            return _this;
        }
        NewEntryPointFileWriter.prototype.writeBundle = function (bundle, transformedFiles, formatProperties) {
            var _this = this;
            // The new folder is at the root of the overall package
            var entryPoint = bundle.entryPoint;
            var ngccFolder = this.fs.join(entryPoint.packagePath, exports.NGCC_DIRECTORY);
            this.copyBundle(bundle, entryPoint.packagePath, ngccFolder, transformedFiles);
            transformedFiles.forEach(function (file) { return _this.writeFile(file, entryPoint.packagePath, ngccFolder); });
            this.updatePackageJson(entryPoint, formatProperties, ngccFolder);
        };
        NewEntryPointFileWriter.prototype.revertBundle = function (entryPoint, transformedFilePaths, formatProperties) {
            // IMPLEMENTATION NOTE:
            //
            // The changes made by `copyBundle()` are not reverted here. The non-transformed copied files
            // are identical to the original ones and they will be overwritten when re-processing the
            // entry-point anyway.
            //
            // This way, we avoid the overhead of having to inform the master process about all source files
            // being copied in `copyBundle()`.
            var e_1, _a;
            try {
                // Revert the transformed files.
                for (var transformedFilePaths_1 = tslib_1.__values(transformedFilePaths), transformedFilePaths_1_1 = transformedFilePaths_1.next(); !transformedFilePaths_1_1.done; transformedFilePaths_1_1 = transformedFilePaths_1.next()) {
                    var filePath = transformedFilePaths_1_1.value;
                    this.revertFile(filePath, entryPoint.packagePath);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (transformedFilePaths_1_1 && !transformedFilePaths_1_1.done && (_a = transformedFilePaths_1.return)) _a.call(transformedFilePaths_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Revert any changes to `package.json`.
            this.revertPackageJson(entryPoint, formatProperties);
        };
        NewEntryPointFileWriter.prototype.copyBundle = function (bundle, packagePath, ngccFolder, transformedFiles) {
            var _this = this;
            var doNotCopy = new Set(transformedFiles.map(function (f) { return f.path; }));
            bundle.src.program.getSourceFiles().forEach(function (sourceFile) {
                var originalPath = file_system_1.absoluteFromSourceFile(sourceFile);
                if (doNotCopy.has(originalPath)) {
                    return;
                }
                var relativePath = _this.fs.relative(packagePath, originalPath);
                var isInsidePackage = file_system_1.isLocalRelativePath(relativePath);
                if (!sourceFile.isDeclarationFile && isInsidePackage) {
                    var newPath = _this.fs.resolve(ngccFolder, relativePath);
                    _this.fs.ensureDir(_this.fs.dirname(newPath));
                    _this.fs.copyFile(originalPath, newPath);
                    _this.copyAndUpdateSourceMap(originalPath, newPath);
                }
            });
        };
        /**
         * If a source file has an associated source-map, then copy this, while updating its sourceRoot
         * accordingly.
         *
         * For now don't try to parse the source for inline source-maps or external source-map links,
         * since that is more complex and will slow ngcc down.
         * Instead just check for a source-map file residing next to the source file, which is by far
         * the most common case.
         *
         * @param originalSrcPath absolute path to the original source file being copied.
         * @param newSrcPath absolute path to where the source will be written.
         */
        NewEntryPointFileWriter.prototype.copyAndUpdateSourceMap = function (originalSrcPath, newSrcPath) {
            var _a;
            var sourceMapPath = (originalSrcPath + '.map');
            if (this.fs.exists(sourceMapPath)) {
                try {
                    var sourceMap = JSON.parse(this.fs.readFile(sourceMapPath));
                    var newSourceMapPath = (newSrcPath + '.map');
                    var relativePath = this.fs.relative(this.fs.dirname(newSourceMapPath), this.fs.dirname(sourceMapPath));
                    sourceMap.sourceRoot = this.fs.join(relativePath, sourceMap.sourceRoot || '.');
                    this.fs.ensureDir(this.fs.dirname(newSourceMapPath));
                    this.fs.writeFile(newSourceMapPath, JSON.stringify(sourceMap));
                }
                catch (e) {
                    this.logger.warn("Failed to process source-map at " + sourceMapPath);
                    this.logger.warn((_a = e.message) !== null && _a !== void 0 ? _a : e);
                }
            }
        };
        NewEntryPointFileWriter.prototype.writeFile = function (file, packagePath, ngccFolder) {
            if (typescript_1.isDtsPath(file.path.replace(/\.map$/, ''))) {
                // This is either `.d.ts` or `.d.ts.map` file
                _super.prototype.writeFileAndBackup.call(this, file);
            }
            else {
                var relativePath = this.fs.relative(packagePath, file.path);
                var newFilePath = this.fs.resolve(ngccFolder, relativePath);
                this.fs.ensureDir(this.fs.dirname(newFilePath));
                this.fs.writeFile(newFilePath, file.contents);
            }
        };
        NewEntryPointFileWriter.prototype.revertFile = function (filePath, packagePath) {
            if (typescript_1.isDtsPath(filePath.replace(/\.map$/, ''))) {
                // This is either `.d.ts` or `.d.ts.map` file
                _super.prototype.revertFileAndBackup.call(this, filePath);
            }
            else if (this.fs.exists(filePath)) {
                var relativePath = this.fs.relative(packagePath, filePath);
                var newFilePath = this.fs.resolve(packagePath, exports.NGCC_DIRECTORY, relativePath);
                this.fs.removeFile(newFilePath);
            }
        };
        NewEntryPointFileWriter.prototype.updatePackageJson = function (entryPoint, formatProperties, ngccFolder) {
            var e_2, _a;
            if (formatProperties.length === 0) {
                // No format properties need updating.
                return;
            }
            var packageJson = entryPoint.packageJson;
            var packageJsonPath = this.fs.join(entryPoint.path, 'package.json');
            // All format properties point to the same format-path.
            var oldFormatProp = formatProperties[0];
            var oldFormatPath = packageJson[oldFormatProp];
            var oldAbsFormatPath = this.fs.resolve(entryPoint.path, oldFormatPath);
            var newAbsFormatPath = this.fs.resolve(ngccFolder, this.fs.relative(entryPoint.packagePath, oldAbsFormatPath));
            var newFormatPath = this.fs.relative(entryPoint.path, newAbsFormatPath);
            // Update all properties in `package.json` (both in memory and on disk).
            var update = this.pkgJsonUpdater.createUpdate();
            try {
                for (var formatProperties_1 = tslib_1.__values(formatProperties), formatProperties_1_1 = formatProperties_1.next(); !formatProperties_1_1.done; formatProperties_1_1 = formatProperties_1.next()) {
                    var formatProperty = formatProperties_1_1.value;
                    if (packageJson[formatProperty] !== oldFormatPath) {
                        throw new Error("Unable to update '" + packageJsonPath + "': Format properties " +
                            ("(" + formatProperties.join(', ') + ") map to more than one format-path."));
                    }
                    update.addChange(["" + formatProperty + exports.NGCC_PROPERTY_EXTENSION], newFormatPath, { before: formatProperty });
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (formatProperties_1_1 && !formatProperties_1_1.done && (_a = formatProperties_1.return)) _a.call(formatProperties_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            update.writeChanges(packageJsonPath, packageJson);
        };
        NewEntryPointFileWriter.prototype.revertPackageJson = function (entryPoint, formatProperties) {
            var e_3, _a;
            if (formatProperties.length === 0) {
                // No format properties need reverting.
                return;
            }
            var packageJson = entryPoint.packageJson;
            var packageJsonPath = this.fs.join(entryPoint.path, 'package.json');
            // Revert all properties in `package.json` (both in memory and on disk).
            // Since `updatePackageJson()` only adds properties, it is safe to just remove them (if they
            // exist).
            var update = this.pkgJsonUpdater.createUpdate();
            try {
                for (var formatProperties_2 = tslib_1.__values(formatProperties), formatProperties_2_1 = formatProperties_2.next(); !formatProperties_2_1.done; formatProperties_2_1 = formatProperties_2.next()) {
                    var formatProperty = formatProperties_2_1.value;
                    update.addChange(["" + formatProperty + exports.NGCC_PROPERTY_EXTENSION], undefined);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (formatProperties_2_1 && !formatProperties_2_1.done && (_a = formatProperties_2.return)) _a.call(formatProperties_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            update.writeChanges(packageJsonPath, packageJson);
        };
        return NewEntryPointFileWriter;
    }(in_place_file_writer_1.InPlaceFileWriter));
    exports.NewEntryPointFileWriter = NewEntryPointFileWriter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3X2VudHJ5X3BvaW50X2ZpbGVfd3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3dyaXRpbmcvbmV3X2VudHJ5X3BvaW50X2ZpbGVfd3JpdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCwyRUFBdUg7SUFFdkgsa0ZBQWlFO0lBS2pFLG9HQUF5RDtJQUc1QyxRQUFBLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDaEMsUUFBQSx1QkFBdUIsR0FBRyxXQUFXLENBQUM7SUFFbkQ7Ozs7Ozs7T0FPRztJQUNIO1FBQTZDLG1EQUFpQjtRQUM1RCxpQ0FDSSxFQUFjLEVBQUUsTUFBYyxFQUFFLHVCQUFnQyxFQUN4RCxjQUFrQztZQUY5QyxZQUdFLGtCQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsdUJBQXVCLENBQUMsU0FDM0M7WUFGVyxvQkFBYyxHQUFkLGNBQWMsQ0FBb0I7O1FBRTlDLENBQUM7UUFFRCw2Q0FBVyxHQUFYLFVBQ0ksTUFBd0IsRUFBRSxnQkFBK0IsRUFDekQsZ0JBQTBDO1lBRjlDLGlCQVNDO1lBTkMsdURBQXVEO1lBQ3ZELElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDckMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxzQkFBYyxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUM5RSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsV0FBVyxFQUFFLFVBQVUs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VUFBNEIsVUFBc0IsRUFBRSxnQkFBMEM7O1lBQzVGLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakMsdUNBQXVDO2dCQUN2QyxPQUFPO2FBQ1I7WUFFRCxJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQzNDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFdEUsd0VBQXdFO1lBQ3hFLDRGQUE0RjtZQUM1RixVQUFVO1lBQ1YsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7Z0JBRWxELEtBQTZCLElBQUEscUJBQUEsaUJBQUEsZ0JBQWdCLENBQUEsa0RBQUEsZ0ZBQUU7b0JBQTFDLElBQU0sY0FBYyw2QkFBQTtvQkFDdkIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUcsY0FBYyxHQUFHLCtCQUF5QixDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQzlFOzs7Ozs7Ozs7WUFFRCxNQUFNLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBM0tELENBQTZDLHdDQUFpQixHQTJLN0Q7SUEzS1ksMERBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7YWJzb2x1dGVGcm9tU291cmNlRmlsZSwgQWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGlzTG9jYWxSZWxhdGl2ZVBhdGh9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtpc0R0c1BhdGh9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy91dGlsL3NyYy90eXBlc2NyaXB0JztcbmltcG9ydCB7RW50cnlQb2ludCwgRW50cnlQb2ludEpzb25Qcm9wZXJ0eX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtFbnRyeVBvaW50QnVuZGxlfSBmcm9tICcuLi9wYWNrYWdlcy9lbnRyeV9wb2ludF9idW5kbGUnO1xuaW1wb3J0IHtGaWxlVG9Xcml0ZX0gZnJvbSAnLi4vcmVuZGVyaW5nL3V0aWxzJztcblxuaW1wb3J0IHtJblBsYWNlRmlsZVdyaXRlcn0gZnJvbSAnLi9pbl9wbGFjZV9maWxlX3dyaXRlcic7XG5pbXBvcnQge1BhY2thZ2VKc29uVXBkYXRlcn0gZnJvbSAnLi9wYWNrYWdlX2pzb25fdXBkYXRlcic7XG5cbmV4cG9ydCBjb25zdCBOR0NDX0RJUkVDVE9SWSA9ICdfX2l2eV9uZ2NjX18nO1xuZXhwb3J0IGNvbnN0IE5HQ0NfUFJPUEVSVFlfRVhURU5TSU9OID0gJ19pdnlfbmdjYyc7XG5cbi8qKlxuICogVGhpcyBGaWxlV3JpdGVyIGNyZWF0ZXMgYSBjb3B5IG9mIHRoZSBvcmlnaW5hbCBlbnRyeS1wb2ludCwgdGhlbiB3cml0ZXMgdGhlIHRyYW5zZm9ybWVkXG4gKiBmaWxlcyBvbnRvIHRoZSBmaWxlcyBpbiB0aGlzIGNvcHksIGFuZCBmaW5hbGx5IHVwZGF0ZXMgdGhlIHBhY2thZ2UuanNvbiB3aXRoIGEgbmV3XG4gKiBlbnRyeS1wb2ludCBmb3JtYXQgcHJvcGVydHkgdGhhdCBwb2ludHMgdG8gdGhpcyBuZXcgZW50cnktcG9pbnQuXG4gKlxuICogSWYgdGhlcmUgYXJlIHRyYW5zZm9ybWVkIHR5cGluZ3MgZmlsZXMgaW4gdGhpcyBidW5kbGUsIHRoZXkgYXJlIHVwZGF0ZWQgaW4tcGxhY2UgKHNlZSB0aGVcbiAqIGBJblBsYWNlRmlsZVdyaXRlcmApLlxuICovXG5leHBvcnQgY2xhc3MgTmV3RW50cnlQb2ludEZpbGVXcml0ZXIgZXh0ZW5kcyBJblBsYWNlRmlsZVdyaXRlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZnM6IEZpbGVTeXN0ZW0sIGxvZ2dlcjogTG9nZ2VyLCBlcnJvck9uRmFpbGVkRW50cnlQb2ludDogYm9vbGVhbixcbiAgICAgIHByaXZhdGUgcGtnSnNvblVwZGF0ZXI6IFBhY2thZ2VKc29uVXBkYXRlcikge1xuICAgIHN1cGVyKGZzLCBsb2dnZXIsIGVycm9yT25GYWlsZWRFbnRyeVBvaW50KTtcbiAgfVxuXG4gIHdyaXRlQnVuZGxlKFxuICAgICAgYnVuZGxlOiBFbnRyeVBvaW50QnVuZGxlLCB0cmFuc2Zvcm1lZEZpbGVzOiBGaWxlVG9Xcml0ZVtdLFxuICAgICAgZm9ybWF0UHJvcGVydGllczogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdKSB7XG4gICAgLy8gVGhlIG5ldyBmb2xkZXIgaXMgYXQgdGhlIHJvb3Qgb2YgdGhlIG92ZXJhbGwgcGFja2FnZVxuICAgIGNvbnN0IGVudHJ5UG9pbnQgPSBidW5kbGUuZW50cnlQb2ludDtcbiAgICBjb25zdCBuZ2NjRm9sZGVyID0gdGhpcy5mcy5qb2luKGVudHJ5UG9pbnQucGFja2FnZVBhdGgsIE5HQ0NfRElSRUNUT1JZKTtcbiAgICB0aGlzLmNvcHlCdW5kbGUoYnVuZGxlLCBlbnRyeVBvaW50LnBhY2thZ2VQYXRoLCBuZ2NjRm9sZGVyLCB0cmFuc2Zvcm1lZEZpbGVzKTtcbiAgICB0cmFuc2Zvcm1lZEZpbGVzLmZvckVhY2goZmlsZSA9PiB0aGlzLndyaXRlRmlsZShmaWxlLCBlbnRyeVBvaW50LnBhY2thZ2VQYXRoLCBuZ2NjRm9sZGVyKSk7XG4gICAgdGhpcy51cGRhdGVQYWNrYWdlSnNvbihlbnRyeVBvaW50LCBmb3JtYXRQcm9wZXJ0aWVzLCBuZ2NjRm9sZGVyKTtcbiAgfVxuXG4gIHJldmVydEJ1bmRsZShcbiAgICAgIGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQsIHRyYW5zZm9ybWVkRmlsZVBhdGhzOiBBYnNvbHV0ZUZzUGF0aFtdLFxuICAgICAgZm9ybWF0UHJvcGVydGllczogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdKTogdm9pZCB7XG4gICAgLy8gSU1QTEVNRU5UQVRJT04gTk9URTpcbiAgICAvL1xuICAgIC8vIFRoZSBjaGFuZ2VzIG1hZGUgYnkgYGNvcHlCdW5kbGUoKWAgYXJlIG5vdCByZXZlcnRlZCBoZXJlLiBUaGUgbm9uLXRyYW5zZm9ybWVkIGNvcGllZCBmaWxlc1xuICAgIC8vIGFyZSBpZGVudGljYWwgdG8gdGhlIG9yaWdpbmFsIG9uZXMgYW5kIHRoZXkgd2lsbCBiZSBvdmVyd3JpdHRlbiB3aGVuIHJlLXByb2Nlc3NpbmcgdGhlXG4gICAgLy8gZW50cnktcG9pbnQgYW55d2F5LlxuICAgIC8vXG4gICAgLy8gVGhpcyB3YXksIHdlIGF2b2lkIHRoZSBvdmVyaGVhZCBvZiBoYXZpbmcgdG8gaW5mb3JtIHRoZSBtYXN0ZXIgcHJvY2VzcyBhYm91dCBhbGwgc291cmNlIGZpbGVzXG4gICAgLy8gYmVpbmcgY29waWVkIGluIGBjb3B5QnVuZGxlKClgLlxuXG4gICAgLy8gUmV2ZXJ0IHRoZSB0cmFuc2Zvcm1lZCBmaWxlcy5cbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIHRyYW5zZm9ybWVkRmlsZVBhdGhzKSB7XG4gICAgICB0aGlzLnJldmVydEZpbGUoZmlsZVBhdGgsIGVudHJ5UG9pbnQucGFja2FnZVBhdGgpO1xuICAgIH1cblxuICAgIC8vIFJldmVydCBhbnkgY2hhbmdlcyB0byBgcGFja2FnZS5qc29uYC5cbiAgICB0aGlzLnJldmVydFBhY2thZ2VKc29uKGVudHJ5UG9pbnQsIGZvcm1hdFByb3BlcnRpZXMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNvcHlCdW5kbGUoXG4gICAgICBidW5kbGU6IEVudHJ5UG9pbnRCdW5kbGUsIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgbmdjY0ZvbGRlcjogQWJzb2x1dGVGc1BhdGgsXG4gICAgICB0cmFuc2Zvcm1lZEZpbGVzOiBGaWxlVG9Xcml0ZVtdKSB7XG4gICAgY29uc3QgZG9Ob3RDb3B5ID0gbmV3IFNldCh0cmFuc2Zvcm1lZEZpbGVzLm1hcChmID0+IGYucGF0aCkpO1xuICAgIGJ1bmRsZS5zcmMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goc291cmNlRmlsZSA9PiB7XG4gICAgICBjb25zdCBvcmlnaW5hbFBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNvdXJjZUZpbGUpO1xuICAgICAgaWYgKGRvTm90Q29weS5oYXMob3JpZ2luYWxQYXRoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSB0aGlzLmZzLnJlbGF0aXZlKHBhY2thZ2VQYXRoLCBvcmlnaW5hbFBhdGgpO1xuICAgICAgY29uc3QgaXNJbnNpZGVQYWNrYWdlID0gaXNMb2NhbFJlbGF0aXZlUGF0aChyZWxhdGl2ZVBhdGgpO1xuICAgICAgaWYgKCFzb3VyY2VGaWxlLmlzRGVjbGFyYXRpb25GaWxlICYmIGlzSW5zaWRlUGFja2FnZSkge1xuICAgICAgICBjb25zdCBuZXdQYXRoID0gdGhpcy5mcy5yZXNvbHZlKG5nY2NGb2xkZXIsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIHRoaXMuZnMuZW5zdXJlRGlyKHRoaXMuZnMuZGlybmFtZShuZXdQYXRoKSk7XG4gICAgICAgIHRoaXMuZnMuY29weUZpbGUob3JpZ2luYWxQYXRoLCBuZXdQYXRoKTtcbiAgICAgICAgdGhpcy5jb3B5QW5kVXBkYXRlU291cmNlTWFwKG9yaWdpbmFsUGF0aCwgbmV3UGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSWYgYSBzb3VyY2UgZmlsZSBoYXMgYW4gYXNzb2NpYXRlZCBzb3VyY2UtbWFwLCB0aGVuIGNvcHkgdGhpcywgd2hpbGUgdXBkYXRpbmcgaXRzIHNvdXJjZVJvb3RcbiAgICogYWNjb3JkaW5nbHkuXG4gICAqXG4gICAqIEZvciBub3cgZG9uJ3QgdHJ5IHRvIHBhcnNlIHRoZSBzb3VyY2UgZm9yIGlubGluZSBzb3VyY2UtbWFwcyBvciBleHRlcm5hbCBzb3VyY2UtbWFwIGxpbmtzLFxuICAgKiBzaW5jZSB0aGF0IGlzIG1vcmUgY29tcGxleCBhbmQgd2lsbCBzbG93IG5nY2MgZG93bi5cbiAgICogSW5zdGVhZCBqdXN0IGNoZWNrIGZvciBhIHNvdXJjZS1tYXAgZmlsZSByZXNpZGluZyBuZXh0IHRvIHRoZSBzb3VyY2UgZmlsZSwgd2hpY2ggaXMgYnkgZmFyXG4gICAqIHRoZSBtb3N0IGNvbW1vbiBjYXNlLlxuICAgKlxuICAgKiBAcGFyYW0gb3JpZ2luYWxTcmNQYXRoIGFic29sdXRlIHBhdGggdG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIGJlaW5nIGNvcGllZC5cbiAgICogQHBhcmFtIG5ld1NyY1BhdGggYWJzb2x1dGUgcGF0aCB0byB3aGVyZSB0aGUgc291cmNlIHdpbGwgYmUgd3JpdHRlbi5cbiAgICovXG4gIHByb3RlY3RlZCBjb3B5QW5kVXBkYXRlU291cmNlTWFwKG9yaWdpbmFsU3JjUGF0aDogQWJzb2x1dGVGc1BhdGgsIG5ld1NyY1BhdGg6IEFic29sdXRlRnNQYXRoKTpcbiAgICAgIHZvaWQge1xuICAgIGNvbnN0IHNvdXJjZU1hcFBhdGggPSAob3JpZ2luYWxTcmNQYXRoICsgJy5tYXAnKSBhcyBBYnNvbHV0ZUZzUGF0aDtcbiAgICBpZiAodGhpcy5mcy5leGlzdHMoc291cmNlTWFwUGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZU1hcCA9XG4gICAgICAgICAgICBKU09OLnBhcnNlKHRoaXMuZnMucmVhZEZpbGUoc291cmNlTWFwUGF0aCkpIGFzIHtzb3VyY2VSb290OiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG4gICAgICAgIGNvbnN0IG5ld1NvdXJjZU1hcFBhdGggPSAobmV3U3JjUGF0aCArICcubWFwJykgYXMgQWJzb2x1dGVGc1BhdGg7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9XG4gICAgICAgICAgICB0aGlzLmZzLnJlbGF0aXZlKHRoaXMuZnMuZGlybmFtZShuZXdTb3VyY2VNYXBQYXRoKSwgdGhpcy5mcy5kaXJuYW1lKHNvdXJjZU1hcFBhdGgpKTtcbiAgICAgICAgc291cmNlTWFwLnNvdXJjZVJvb3QgPSB0aGlzLmZzLmpvaW4ocmVsYXRpdmVQYXRoLCBzb3VyY2VNYXAuc291cmNlUm9vdCB8fCAnLicpO1xuICAgICAgICB0aGlzLmZzLmVuc3VyZURpcih0aGlzLmZzLmRpcm5hbWUobmV3U291cmNlTWFwUGF0aCkpO1xuICAgICAgICB0aGlzLmZzLndyaXRlRmlsZShuZXdTb3VyY2VNYXBQYXRoLCBKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybihgRmFpbGVkIHRvIHByb2Nlc3Mgc291cmNlLW1hcCBhdCAke3NvdXJjZU1hcFBhdGh9YCk7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oZS5tZXNzYWdlID8/IGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCB3cml0ZUZpbGUoZmlsZTogRmlsZVRvV3JpdGUsIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgbmdjY0ZvbGRlcjogQWJzb2x1dGVGc1BhdGgpOlxuICAgICAgdm9pZCB7XG4gICAgaWYgKGlzRHRzUGF0aChmaWxlLnBhdGgucmVwbGFjZSgvXFwubWFwJC8sICcnKSkpIHtcbiAgICAgIC8vIFRoaXMgaXMgZWl0aGVyIGAuZC50c2Agb3IgYC5kLnRzLm1hcGAgZmlsZVxuICAgICAgc3VwZXIud3JpdGVGaWxlQW5kQmFja3VwKGZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSB0aGlzLmZzLnJlbGF0aXZlKHBhY2thZ2VQYXRoLCBmaWxlLnBhdGgpO1xuICAgICAgY29uc3QgbmV3RmlsZVBhdGggPSB0aGlzLmZzLnJlc29sdmUobmdjY0ZvbGRlciwgcmVsYXRpdmVQYXRoKTtcbiAgICAgIHRoaXMuZnMuZW5zdXJlRGlyKHRoaXMuZnMuZGlybmFtZShuZXdGaWxlUGF0aCkpO1xuICAgICAgdGhpcy5mcy53cml0ZUZpbGUobmV3RmlsZVBhdGgsIGZpbGUuY29udGVudHMpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCByZXZlcnRGaWxlKGZpbGVQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgcGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgaWYgKGlzRHRzUGF0aChmaWxlUGF0aC5yZXBsYWNlKC9cXC5tYXAkLywgJycpKSkge1xuICAgICAgLy8gVGhpcyBpcyBlaXRoZXIgYC5kLnRzYCBvciBgLmQudHMubWFwYCBmaWxlXG4gICAgICBzdXBlci5yZXZlcnRGaWxlQW5kQmFja3VwKGZpbGVQYXRoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZnMuZXhpc3RzKGZpbGVQYXRoKSkge1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gdGhpcy5mcy5yZWxhdGl2ZShwYWNrYWdlUGF0aCwgZmlsZVBhdGgpO1xuICAgICAgY29uc3QgbmV3RmlsZVBhdGggPSB0aGlzLmZzLnJlc29sdmUocGFja2FnZVBhdGgsIE5HQ0NfRElSRUNUT1JZLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgdGhpcy5mcy5yZW1vdmVGaWxlKG5ld0ZpbGVQYXRoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgdXBkYXRlUGFja2FnZUpzb24oXG4gICAgICBlbnRyeVBvaW50OiBFbnRyeVBvaW50LCBmb3JtYXRQcm9wZXJ0aWVzOiBFbnRyeVBvaW50SnNvblByb3BlcnR5W10sXG4gICAgICBuZ2NjRm9sZGVyOiBBYnNvbHV0ZUZzUGF0aCkge1xuICAgIGlmIChmb3JtYXRQcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gTm8gZm9ybWF0IHByb3BlcnRpZXMgbmVlZCB1cGRhdGluZy5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSnNvbiA9IGVudHJ5UG9pbnQucGFja2FnZUpzb247XG4gICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gdGhpcy5mcy5qb2luKGVudHJ5UG9pbnQucGF0aCwgJ3BhY2thZ2UuanNvbicpO1xuXG4gICAgLy8gQWxsIGZvcm1hdCBwcm9wZXJ0aWVzIHBvaW50IHRvIHRoZSBzYW1lIGZvcm1hdC1wYXRoLlxuICAgIGNvbnN0IG9sZEZvcm1hdFByb3AgPSBmb3JtYXRQcm9wZXJ0aWVzWzBdITtcbiAgICBjb25zdCBvbGRGb3JtYXRQYXRoID0gcGFja2FnZUpzb25bb2xkRm9ybWF0UHJvcF0hO1xuICAgIGNvbnN0IG9sZEFic0Zvcm1hdFBhdGggPSB0aGlzLmZzLnJlc29sdmUoZW50cnlQb2ludC5wYXRoLCBvbGRGb3JtYXRQYXRoKTtcbiAgICBjb25zdCBuZXdBYnNGb3JtYXRQYXRoID1cbiAgICAgICAgdGhpcy5mcy5yZXNvbHZlKG5nY2NGb2xkZXIsIHRoaXMuZnMucmVsYXRpdmUoZW50cnlQb2ludC5wYWNrYWdlUGF0aCwgb2xkQWJzRm9ybWF0UGF0aCkpO1xuICAgIGNvbnN0IG5ld0Zvcm1hdFBhdGggPSB0aGlzLmZzLnJlbGF0aXZlKGVudHJ5UG9pbnQucGF0aCwgbmV3QWJzRm9ybWF0UGF0aCk7XG5cbiAgICAvLyBVcGRhdGUgYWxsIHByb3BlcnRpZXMgaW4gYHBhY2thZ2UuanNvbmAgKGJvdGggaW4gbWVtb3J5IGFuZCBvbiBkaXNrKS5cbiAgICBjb25zdCB1cGRhdGUgPSB0aGlzLnBrZ0pzb25VcGRhdGVyLmNyZWF0ZVVwZGF0ZSgpO1xuXG4gICAgZm9yIChjb25zdCBmb3JtYXRQcm9wZXJ0eSBvZiBmb3JtYXRQcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAocGFja2FnZUpzb25bZm9ybWF0UHJvcGVydHldICE9PSBvbGRGb3JtYXRQYXRoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gdXBkYXRlICcke3BhY2thZ2VKc29uUGF0aH0nOiBGb3JtYXQgcHJvcGVydGllcyBgICtcbiAgICAgICAgICAgIGAoJHtmb3JtYXRQcm9wZXJ0aWVzLmpvaW4oJywgJyl9KSBtYXAgdG8gbW9yZSB0aGFuIG9uZSBmb3JtYXQtcGF0aC5gKTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlLmFkZENoYW5nZShcbiAgICAgICAgICBbYCR7Zm9ybWF0UHJvcGVydHl9JHtOR0NDX1BST1BFUlRZX0VYVEVOU0lPTn1gXSwgbmV3Rm9ybWF0UGF0aCwge2JlZm9yZTogZm9ybWF0UHJvcGVydHl9KTtcbiAgICB9XG5cbiAgICB1cGRhdGUud3JpdGVDaGFuZ2VzKHBhY2thZ2VKc29uUGF0aCwgcGFja2FnZUpzb24pO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJldmVydFBhY2thZ2VKc29uKGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQsIGZvcm1hdFByb3BlcnRpZXM6IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXSkge1xuICAgIGlmIChmb3JtYXRQcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gTm8gZm9ybWF0IHByb3BlcnRpZXMgbmVlZCByZXZlcnRpbmcuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFja2FnZUpzb24gPSBlbnRyeVBvaW50LnBhY2thZ2VKc29uO1xuICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHRoaXMuZnMuam9pbihlbnRyeVBvaW50LnBhdGgsICdwYWNrYWdlLmpzb24nKTtcblxuICAgIC8vIFJldmVydCBhbGwgcHJvcGVydGllcyBpbiBgcGFja2FnZS5qc29uYCAoYm90aCBpbiBtZW1vcnkgYW5kIG9uIGRpc2spLlxuICAgIC8vIFNpbmNlIGB1cGRhdGVQYWNrYWdlSnNvbigpYCBvbmx5IGFkZHMgcHJvcGVydGllcywgaXQgaXMgc2FmZSB0byBqdXN0IHJlbW92ZSB0aGVtIChpZiB0aGV5XG4gICAgLy8gZXhpc3QpLlxuICAgIGNvbnN0IHVwZGF0ZSA9IHRoaXMucGtnSnNvblVwZGF0ZXIuY3JlYXRlVXBkYXRlKCk7XG5cbiAgICBmb3IgKGNvbnN0IGZvcm1hdFByb3BlcnR5IG9mIGZvcm1hdFByb3BlcnRpZXMpIHtcbiAgICAgIHVwZGF0ZS5hZGRDaGFuZ2UoW2Ake2Zvcm1hdFByb3BlcnR5fSR7TkdDQ19QUk9QRVJUWV9FWFRFTlNJT059YF0sIHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgdXBkYXRlLndyaXRlQ2hhbmdlcyhwYWNrYWdlSnNvblBhdGgsIHBhY2thZ2VKc29uKTtcbiAgfVxufVxuIl19
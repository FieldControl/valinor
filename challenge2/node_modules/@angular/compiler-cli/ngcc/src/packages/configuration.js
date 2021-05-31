(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/configuration", ["require", "exports", "tslib", "crypto", "semver", "vm"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgccConfiguration = exports.ProcessedNgccPackageConfig = exports.DEFAULT_NGCC_CONFIG = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var crypto_1 = require("crypto");
    var semver_1 = require("semver");
    var vm = require("vm");
    /**
     * The default configuration for ngcc.
     *
     * This is the ultimate fallback configuration that ngcc will use if there is no configuration
     * for a package at the package level or project level.
     *
     * This configuration is for packages that are "dead" - i.e. no longer maintained and so are
     * unlikely to be fixed to work with ngcc, nor provide a package level config of their own.
     *
     * The fallback process for looking up configuration is:
     *
     * Project -> Package -> Default
     *
     * If a package provides its own configuration then that would override this default one.
     *
     * Also application developers can always provide configuration at their project level which
     * will override everything else.
     *
     * Note that the fallback is package based not entry-point based.
     * For example, if a there is configuration for a package at the project level this will replace all
     * entry-point configurations that may have been provided in the package level or default level
     * configurations, even if the project level configuration does not provide for a given entry-point.
     */
    exports.DEFAULT_NGCC_CONFIG = {
        packages: {
            // Add default package configuration here. For example:
            // '@angular/fire@^5.2.0': {
            //   entryPoints: {
            //     './database-deprecated': {ignore: true},
            //   },
            // },
            // The package does not contain any `.metadata.json` files in the root directory but only inside
            // `dist/`. Without this config, ngcc does not realize this is a ViewEngine-built Angular
            // package that needs to be compiled to Ivy.
            'angular2-highcharts': {
                entryPoints: {
                    '.': {
                        override: {
                            main: './index.js',
                        },
                    },
                },
            },
            // The `dist/` directory has a duplicate `package.json` pointing to the same files, which (under
            // certain configurations) can causes ngcc to try to process the files twice and fail.
            // Ignore the `dist/` entry-point.
            'ng2-dragula': {
                entryPoints: {
                    './dist': { ignore: true },
                },
            },
        },
        locking: {
            retryDelay: 500,
            retryAttempts: 500,
        }
    };
    var NGCC_CONFIG_FILENAME = 'ngcc.config.js';
    /**
     * The processed package level configuration as a result of processing a raw package level config.
     */
    var ProcessedNgccPackageConfig = /** @class */ (function () {
        function ProcessedNgccPackageConfig(fs, packagePath, _a) {
            var _b = _a.entryPoints, entryPoints = _b === void 0 ? {} : _b, _c = _a.ignorableDeepImportMatchers, ignorableDeepImportMatchers = _c === void 0 ? [] : _c;
            var absolutePathEntries = Object.entries(entryPoints).map(function (_a) {
                var _b = tslib_1.__read(_a, 2), relativePath = _b[0], config = _b[1];
                return [fs.resolve(packagePath, relativePath), config];
            });
            this.packagePath = packagePath;
            this.entryPoints = new Map(absolutePathEntries);
            this.ignorableDeepImportMatchers = ignorableDeepImportMatchers;
        }
        return ProcessedNgccPackageConfig;
    }());
    exports.ProcessedNgccPackageConfig = ProcessedNgccPackageConfig;
    /**
     * Ngcc has a hierarchical configuration system that lets us "fix up" packages that do not
     * work with ngcc out of the box.
     *
     * There are three levels at which configuration can be declared:
     *
     * * Default level - ngcc comes with built-in configuration for well known cases.
     * * Package level - a library author publishes a configuration with their package to fix known
     *   issues.
     * * Project level - the application developer provides a configuration that fixes issues specific
     *   to the libraries used in their application.
     *
     * Ngcc will match configuration based on the package name but also on its version. This allows
     * configuration to provide different fixes to different version ranges of a package.
     *
     * * Package level configuration is specific to the package version where the configuration is
     *   found.
     * * Default and project level configuration should provide version ranges to ensure that the
     *   configuration is only applied to the appropriate versions of a package.
     *
     * When getting a configuration for a package (via `getConfig()`) the caller should provide the
     * version of the package in question, if available. If it is not provided then the first available
     * configuration for a package is returned.
     */
    var NgccConfiguration = /** @class */ (function () {
        function NgccConfiguration(fs, baseDir) {
            this.fs = fs;
            this.cache = new Map();
            this.defaultConfig = this.processProjectConfig(exports.DEFAULT_NGCC_CONFIG);
            this.projectConfig = this.processProjectConfig(this.loadProjectConfig(baseDir));
            this.hash = this.computeHash();
        }
        /**
         * Get the configuration options for locking the ngcc process.
         */
        NgccConfiguration.prototype.getLockingConfig = function () {
            var _a = this.projectConfig.locking, retryAttempts = _a.retryAttempts, retryDelay = _a.retryDelay;
            if (retryAttempts === undefined) {
                retryAttempts = this.defaultConfig.locking.retryAttempts;
            }
            if (retryDelay === undefined) {
                retryDelay = this.defaultConfig.locking.retryDelay;
            }
            return { retryAttempts: retryAttempts, retryDelay: retryDelay };
        };
        /**
         * Get a configuration for the given `version` of a package at `packagePath`.
         *
         * @param packageName The name of the package whose config we want.
         * @param packagePath The path to the package whose config we want.
         * @param version The version of the package whose config we want, or `null` if the package's
         * package.json did not exist or was invalid.
         */
        NgccConfiguration.prototype.getPackageConfig = function (packageName, packagePath, version) {
            var rawPackageConfig = this.getRawPackageConfig(packageName, packagePath, version);
            return new ProcessedNgccPackageConfig(this.fs, packagePath, rawPackageConfig);
        };
        NgccConfiguration.prototype.getRawPackageConfig = function (packageName, packagePath, version) {
            var cacheKey = packageName + (version !== null ? "@" + version : '');
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            var projectLevelConfig = this.projectConfig.packages ?
                findSatisfactoryVersion(this.projectConfig.packages[packageName], version) :
                null;
            if (projectLevelConfig !== null) {
                this.cache.set(cacheKey, projectLevelConfig);
                return projectLevelConfig;
            }
            var packageLevelConfig = this.loadPackageConfig(packagePath, version);
            if (packageLevelConfig !== null) {
                this.cache.set(cacheKey, packageLevelConfig);
                return packageLevelConfig;
            }
            var defaultLevelConfig = this.defaultConfig.packages ?
                findSatisfactoryVersion(this.defaultConfig.packages[packageName], version) :
                null;
            if (defaultLevelConfig !== null) {
                this.cache.set(cacheKey, defaultLevelConfig);
                return defaultLevelConfig;
            }
            return { versionRange: '*' };
        };
        NgccConfiguration.prototype.processProjectConfig = function (projectConfig) {
            var processedConfig = { packages: {}, locking: {} };
            // locking configuration
            if (projectConfig.locking !== undefined) {
                processedConfig.locking = projectConfig.locking;
            }
            // packages configuration
            for (var packageNameAndVersion in projectConfig.packages) {
                var packageConfig = projectConfig.packages[packageNameAndVersion];
                if (packageConfig) {
                    var _a = tslib_1.__read(this.splitNameAndVersion(packageNameAndVersion), 2), packageName = _a[0], _b = _a[1], versionRange = _b === void 0 ? '*' : _b;
                    var packageConfigs = processedConfig.packages[packageName] || (processedConfig.packages[packageName] = []);
                    packageConfigs.push(tslib_1.__assign(tslib_1.__assign({}, packageConfig), { versionRange: versionRange }));
                }
            }
            return processedConfig;
        };
        NgccConfiguration.prototype.loadProjectConfig = function (baseDir) {
            var configFilePath = this.fs.join(baseDir, NGCC_CONFIG_FILENAME);
            if (this.fs.exists(configFilePath)) {
                try {
                    return this.evalSrcFile(configFilePath);
                }
                catch (e) {
                    throw new Error("Invalid project configuration file at \"" + configFilePath + "\": " + e.message);
                }
            }
            else {
                return { packages: {} };
            }
        };
        NgccConfiguration.prototype.loadPackageConfig = function (packagePath, version) {
            var configFilePath = this.fs.join(packagePath, NGCC_CONFIG_FILENAME);
            if (this.fs.exists(configFilePath)) {
                try {
                    var packageConfig = this.evalSrcFile(configFilePath);
                    return tslib_1.__assign(tslib_1.__assign({}, packageConfig), { versionRange: version || '*' });
                }
                catch (e) {
                    throw new Error("Invalid package configuration file at \"" + configFilePath + "\": " + e.message);
                }
            }
            else {
                return null;
            }
        };
        NgccConfiguration.prototype.evalSrcFile = function (srcPath) {
            var src = this.fs.readFile(srcPath);
            var theExports = {};
            var sandbox = {
                module: { exports: theExports },
                exports: theExports,
                require: require,
                __dirname: this.fs.dirname(srcPath),
                __filename: srcPath
            };
            vm.runInNewContext(src, sandbox, { filename: srcPath });
            return sandbox.module.exports;
        };
        NgccConfiguration.prototype.splitNameAndVersion = function (packageNameAndVersion) {
            var versionIndex = packageNameAndVersion.lastIndexOf('@');
            // Note that > 0 is because we don't want to match @ at the start of the line
            // which is what you would have with a namespaced package, e.g. `@angular/common`.
            return versionIndex > 0 ?
                [
                    packageNameAndVersion.substring(0, versionIndex),
                    packageNameAndVersion.substring(versionIndex + 1),
                ] :
                [packageNameAndVersion, undefined];
        };
        NgccConfiguration.prototype.computeHash = function () {
            return crypto_1.createHash('md5').update(JSON.stringify(this.projectConfig)).digest('hex');
        };
        return NgccConfiguration;
    }());
    exports.NgccConfiguration = NgccConfiguration;
    function findSatisfactoryVersion(configs, version) {
        if (configs === undefined) {
            return null;
        }
        if (version === null) {
            // The package has no version (!) - perhaps the entry-point was from a deep import, which made
            // it impossible to find the package.json.
            // So just return the first config that matches the package name.
            return configs[0];
        }
        return configs.find(function (config) { return semver_1.satisfies(version, config.versionRange, { includePrerelease: true }); }) ||
            null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9wYWNrYWdlcy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxpQ0FBa0M7SUFDbEMsaUNBQWlDO0lBQ2pDLHVCQUF5QjtJQTJGekI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FzQkc7SUFDVSxRQUFBLG1CQUFtQixHQUFzQjtRQUNwRCxRQUFRLEVBQUU7WUFDUix1REFBdUQ7WUFDdkQsNEJBQTRCO1lBQzVCLG1CQUFtQjtZQUNuQiwrQ0FBK0M7WUFDL0MsT0FBTztZQUNQLEtBQUs7WUFFTCxnR0FBZ0c7WUFDaEcseUZBQXlGO1lBQ3pGLDRDQUE0QztZQUM1QyxxQkFBcUIsRUFBRTtnQkFDckIsV0FBVyxFQUFFO29CQUNYLEdBQUcsRUFBRTt3QkFDSCxRQUFRLEVBQUU7NEJBQ1IsSUFBSSxFQUFFLFlBQVk7eUJBQ25CO3FCQUNGO2lCQUNGO2FBQ0Y7WUFFRCxnR0FBZ0c7WUFDaEcsc0ZBQXNGO1lBQ3RGLGtDQUFrQztZQUNsQyxhQUFhLEVBQUU7Z0JBQ2IsV0FBVyxFQUFFO29CQUNYLFFBQVEsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUM7aUJBQ3pCO2FBQ0Y7U0FDRjtRQUNELE9BQU8sRUFBRTtZQUNQLFVBQVUsRUFBRSxHQUFHO1lBQ2YsYUFBYSxFQUFFLEdBQUc7U0FDbkI7S0FDRixDQUFDO0lBRUYsSUFBTSxvQkFBb0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUU5Qzs7T0FFRztJQUNIO1FBdUJFLG9DQUFZLEVBQW9CLEVBQUUsV0FBMkIsRUFBRSxFQUd4QztnQkFGckIsbUJBQWdCLEVBQWhCLFdBQVcsbUJBQUcsRUFBRSxLQUFBLEVBQ2hCLG1DQUFnQyxFQUFoQywyQkFBMkIsbUJBQUcsRUFB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QVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1RCw2RUFBNkU7WUFDN0Usa0ZBQWtGO1lBQ2xGLE9BQU8sWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyQjtvQkFDRSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQztvQkFDaEQscUJBQXFCLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7aUJBQ2xELENBQUMsQ0FBQztnQkFDSCxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFTyx1Q0FBVyxHQUFuQjtZQUNFLE9BQU8sbUJBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUNILHdCQUFDO0lBQUQsQ0FBQyxBQTNKRCxJQTJKQztJQTNKWSw4Q0FBaUI7SUE2SjlCLFNBQVMsdUJBQXVCLENBQUMsT0FBMkMsRUFBRSxPQUFvQjtRQUVoRyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUNwQiw4RkFBOEY7WUFDOUYsMENBQTBDO1lBQzFDLGlFQUFpRTtZQUNqRSxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuQjtRQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FDUixVQUFBLE1BQU0sSUFBSSxPQUFBLGtCQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFsRSxDQUFrRSxDQUFDO1lBQ3BGLElBQUksQ0FBQztJQUNYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Y3JlYXRlSGFzaH0gZnJvbSAnY3J5cHRvJztcbmltcG9ydCB7c2F0aXNmaWVzfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0ICogYXMgdm0gZnJvbSAndm0nO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBQYXRoTWFuaXB1bGF0aW9uLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5cbmltcG9ydCB7UGFja2FnZUpzb25Gb3JtYXRQcm9wZXJ0aWVzTWFwfSBmcm9tICcuL2VudHJ5X3BvaW50JztcblxuLyoqXG4gKiBUaGUgZm9ybWF0IG9mIGEgcHJvamVjdCBsZXZlbCBjb25maWd1cmF0aW9uIGZpbGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdjY1Byb2plY3RDb25maWc8VCA9IFJhd05nY2NQYWNrYWdlQ29uZmlnPiB7XG4gIC8qKlxuICAgKiBUaGUgcGFja2FnZXMgdGhhdCBhcmUgY29uZmlndXJlZCBieSB0aGlzIHByb2plY3QgY29uZmlnLlxuICAgKi9cbiAgcGFja2FnZXM/OiB7W3BhY2thZ2VQYXRoOiBzdHJpbmddOiBUfHVuZGVmaW5lZH07XG4gIC8qKlxuICAgKiBPcHRpb25zIHRoYXQgY29udHJvbCBob3cgbG9ja2luZyB0aGUgcHJvY2VzcyBpcyBoYW5kbGVkLlxuICAgKi9cbiAgbG9ja2luZz86IFByb2Nlc3NMb2NraW5nQ29uZmlndXJhdGlvbjtcbn1cblxuLyoqXG4gKiBPcHRpb25zIHRoYXQgY29udHJvbCBob3cgbG9ja2luZyB0aGUgcHJvY2VzcyBpcyBoYW5kbGVkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb2Nlc3NMb2NraW5nQ29uZmlndXJhdGlvbiB7XG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRoZSBBc3luY0xvY2tlciB3aWxsIGF0dGVtcHQgdG8gbG9jayB0aGUgcHJvY2VzcyBiZWZvcmUgZmFpbGluZy5cbiAgICogRGVmYXVsdHMgdG8gNTAwLlxuICAgKi9cbiAgcmV0cnlBdHRlbXB0cz86IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGJldHdlZW4gYXR0ZW1wdHMgdG8gbG9jayB0aGUgcHJvY2Vzcy5cbiAgICogRGVmYXVsdHMgdG8gNTAwbXMuXG4gICAqICovXG4gIHJldHJ5RGVsYXk/OiBudW1iZXI7XG59XG5cbi8qKlxuICogVGhlIHJhdyBmb3JtYXQgb2YgYSBwYWNrYWdlIGxldmVsIGNvbmZpZ3VyYXRpb24gKGFzIGl0IGFwcGVhcnMgaW4gY29uZmlndXJhdGlvbiBmaWxlcykuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmF3TmdjY1BhY2thZ2VDb25maWcge1xuICAvKipcbiAgICogVGhlIGVudHJ5LXBvaW50cyB0byBjb25maWd1cmUgZm9yIHRoaXMgcGFja2FnZS5cbiAgICpcbiAgICogSW4gdGhlIGNvbmZpZyBmaWxlIHRoZSBrZXlzIGFyZSBwYXRocyByZWxhdGl2ZSB0byB0aGUgcGFja2FnZSBwYXRoLlxuICAgKi9cbiAgZW50cnlQb2ludHM/OiB7W2VudHJ5UG9pbnRQYXRoOiBzdHJpbmddOiBOZ2NjRW50cnlQb2ludENvbmZpZ307XG5cbiAgLyoqXG4gICAqIEEgY29sbGVjdGlvbiBvZiByZWdleGVzIHRoYXQgbWF0Y2ggZGVlcCBpbXBvcnRzIHRvIGlnbm9yZSwgZm9yIHRoaXMgcGFja2FnZSwgcmF0aGVyIHRoYW5cbiAgICogZGlzcGxheWluZyBhIHdhcm5pbmcuXG4gICAqL1xuICBpZ25vcmFibGVEZWVwSW1wb3J0TWF0Y2hlcnM/OiBSZWdFeHBbXTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIGFuIGVudHJ5LXBvaW50LlxuICpcbiAqIFRoZSBleGlzdGVuY2Ugb2YgYSBjb25maWd1cmF0aW9uIGZvciBhIHBhdGggdGVsbHMgbmdjYyB0aGF0IHRoaXMgc2hvdWxkIGJlIGNvbnNpZGVyZWQgZm9yXG4gKiBwcm9jZXNzaW5nIGFzIGFuIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nY2NFbnRyeVBvaW50Q29uZmlnIHtcbiAgLyoqIERvIG5vdCBwcm9jZXNzIChvciBldmVuIGFja25vd2xlZGdlIHRoZSBleGlzdGVuY2Ugb2YpIHRoaXMgZW50cnktcG9pbnQsIGlmIHRydWUuICovXG4gIGlnbm9yZT86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRoaXMgcHJvcGVydHksIGlmIHByb3ZpZGVkLCBob2xkcyB2YWx1ZXMgdGhhdCB3aWxsIG92ZXJyaWRlIGVxdWl2YWxlbnQgcHJvcGVydGllcyBpbiBhblxuICAgKiBlbnRyeS1wb2ludCdzIHBhY2thZ2UuanNvbiBmaWxlLlxuICAgKi9cbiAgb3ZlcnJpZGU/OiBQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXNNYXA7XG5cbiAgLyoqXG4gICAqIE5vcm1hbGx5LCBuZ2NjIHdpbGwgc2tpcCBjb21waWxhdGlvbiBvZiBlbnRyeXBvaW50cyB0aGF0IGNvbnRhaW4gaW1wb3J0cyB0aGF0IGNhbid0IGJlIHJlc29sdmVkXG4gICAqIG9yIHVuZGVyc3Rvb2QuIElmIHRoaXMgb3B0aW9uIGlzIHNwZWNpZmllZCwgbmdjYyB3aWxsIHByb2NlZWQgd2l0aCBjb21waWxpbmcgdGhlIGVudHJ5cG9pbnRcbiAgICogZXZlbiBpbiB0aGUgZmFjZSBvZiBzdWNoIG1pc3NpbmcgZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgaWdub3JlTWlzc2luZ0RlcGVuZGVuY2llcz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEVuYWJsaW5nIHRoaXMgb3B0aW9uIGZvciBhbiBlbnRyeXBvaW50IHRlbGxzIG5nY2MgdGhhdCBkZWVwIGltcG9ydHMgbWlnaHQgYmUgdXNlZCBmb3IgdGhlIGZpbGVzXG4gICAqIGl0IGNvbnRhaW5zLCBhbmQgdGhhdCBpdCBzaG91bGQgZ2VuZXJhdGUgcHJpdmF0ZSByZS1leHBvcnRzIGFsb25nc2lkZSB0aGUgTmdNb2R1bGUgb2YgYWxsIHRoZVxuICAgKiBkaXJlY3RpdmVzL3BpcGVzIGl0IG1ha2VzIGF2YWlsYWJsZSBpbiBzdXBwb3J0IG9mIHRob3NlIGltcG9ydHMuXG4gICAqL1xuICBnZW5lcmF0ZURlZXBSZWV4cG9ydHM/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgVmVyc2lvbmVkUGFja2FnZUNvbmZpZyBleHRlbmRzIFJhd05nY2NQYWNrYWdlQ29uZmlnIHtcbiAgdmVyc2lvblJhbmdlOiBzdHJpbmc7XG59XG5cbnR5cGUgUGFydGlhbGx5UHJvY2Vzc2VkQ29uZmlnID0gUmVxdWlyZWQ8TmdjY1Byb2plY3RDb25maWc8VmVyc2lvbmVkUGFja2FnZUNvbmZpZ1tdPj47XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBmb3IgbmdjYy5cbiAqXG4gKiBUaGlzIGlzIHRoZSB1bHRpbWF0ZSBmYWxsYmFjayBjb25maWd1cmF0aW9uIHRoYXQgbmdjYyB3aWxsIHVzZSBpZiB0aGVyZSBpcyBubyBjb25maWd1cmF0aW9uXG4gKiBmb3IgYSBwYWNrYWdlIGF0IHRoZSBwYWNrYWdlIGxldmVsIG9yIHByb2plY3QgbGV2ZWwuXG4gKlxuICogVGhpcyBjb25maWd1cmF0aW9uIGlzIGZvciBwYWNrYWdlcyB0aGF0IGFyZSBcImRlYWRcIiAtIGkuZS4gbm8gbG9uZ2VyIG1haW50YWluZWQgYW5kIHNvIGFyZVxuICogdW5saWtlbHkgdG8gYmUgZml4ZWQgdG8gd29yayB3aXRoIG5nY2MsIG5vciBwcm92aWRlIGEgcGFja2FnZSBsZXZlbCBjb25maWcgb2YgdGhlaXIgb3duLlxuICpcbiAqIFRoZSBmYWxsYmFjayBwcm9jZXNzIGZvciBsb29raW5nIHVwIGNvbmZpZ3VyYXRpb24gaXM6XG4gKlxuICogUHJvamVjdCAtPiBQYWNrYWdlIC0+IERlZmF1bHRcbiAqXG4gKiBJZiBhIHBhY2thZ2UgcHJvdmlkZXMgaXRzIG93biBjb25maWd1cmF0aW9uIHRoZW4gdGhhdCB3b3VsZCBvdmVycmlkZSB0aGlzIGRlZmF1bHQgb25lLlxuICpcbiAqIEFsc28gYXBwbGljYXRpb24gZGV2ZWxvcGVycyBjYW4gYWx3YXlzIHByb3ZpZGUgY29uZmlndXJhdGlvbiBhdCB0aGVpciBwcm9qZWN0IGxldmVsIHdoaWNoXG4gKiB3aWxsIG92ZXJyaWRlIGV2ZXJ5dGhpbmcgZWxzZS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGZhbGxiYWNrIGlzIHBhY2thZ2UgYmFzZWQgbm90IGVudHJ5LXBvaW50IGJhc2VkLlxuICogRm9yIGV4YW1wbGUsIGlmIGEgdGhlcmUgaXMgY29uZmlndXJhdGlvbiBmb3IgYSBwYWNrYWdlIGF0IHRoZSBwcm9qZWN0IGxldmVsIHRoaXMgd2lsbCByZXBsYWNlIGFsbFxuICogZW50cnktcG9pbnQgY29uZmlndXJhdGlvbnMgdGhhdCBtYXkgaGF2ZSBiZWVuIHByb3ZpZGVkIGluIHRoZSBwYWNrYWdlIGxldmVsIG9yIGRlZmF1bHQgbGV2ZWxcbiAqIGNvbmZpZ3VyYXRpb25zLCBldmVuIGlmIHRoZSBwcm9qZWN0IGxldmVsIGNvbmZpZ3VyYXRpb24gZG9lcyBub3QgcHJvdmlkZSBmb3IgYSBnaXZlbiBlbnRyeS1wb2ludC5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTkdDQ19DT05GSUc6IE5nY2NQcm9qZWN0Q29uZmlnID0ge1xuICBwYWNrYWdlczoge1xuICAgIC8vIEFkZCBkZWZhdWx0IHBhY2thZ2UgY29uZmlndXJhdGlvbiBoZXJlLiBGb3IgZXhhbXBsZTpcbiAgICAvLyAnQGFuZ3VsYXIvZmlyZUBeNS4yLjAnOiB7XG4gICAgLy8gICBlbnRyeVBvaW50czoge1xuICAgIC8vICAgICAnLi9kYXRhYmFzZS1kZXByZWNhdGVkJzoge2lnbm9yZTogdHJ1ZX0sXG4gICAgLy8gICB9LFxuICAgIC8vIH0sXG5cbiAgICAvLyBUaGUgcGFja2FnZSBkb2VzIG5vdCBjb250YWluIGFueSBgLm1ldGFkYXRhLmpzb25gIGZpbGVzIGluIHRoZSByb290IGRpcmVjdG9yeSBidXQgb25seSBpbnNpZGVcbiAgICAvLyBgZGlzdC9gLiBXaXRob3V0IHRoaXMgY29uZmlnLCBuZ2NjIGRvZXMgbm90IHJlYWxpemUgdGhpcyBpcyBhIFZpZXdFbmdpbmUtYnVpbHQgQW5ndWxhclxuICAgIC8vIHBhY2thZ2UgdGhhdCBuZWVkcyB0byBiZSBjb21waWxlZCB0byBJdnkuXG4gICAgJ2FuZ3VsYXIyLWhpZ2hjaGFydHMnOiB7XG4gICAgICBlbnRyeVBvaW50czoge1xuICAgICAgICAnLic6IHtcbiAgICAgICAgICBvdmVycmlkZToge1xuICAgICAgICAgICAgbWFpbjogJy4vaW5kZXguanMnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyBUaGUgYGRpc3QvYCBkaXJlY3RvcnkgaGFzIGEgZHVwbGljYXRlIGBwYWNrYWdlLmpzb25gIHBvaW50aW5nIHRvIHRoZSBzYW1lIGZpbGVzLCB3aGljaCAodW5kZXJcbiAgICAvLyBjZXJ0YWluIGNvbmZpZ3VyYXRpb25zKSBjYW4gY2F1c2VzIG5nY2MgdG8gdHJ5IHRvIHByb2Nlc3MgdGhlIGZpbGVzIHR3aWNlIGFuZCBmYWlsLlxuICAgIC8vIElnbm9yZSB0aGUgYGRpc3QvYCBlbnRyeS1wb2ludC5cbiAgICAnbmcyLWRyYWd1bGEnOiB7XG4gICAgICBlbnRyeVBvaW50czoge1xuICAgICAgICAnLi9kaXN0Jzoge2lnbm9yZTogdHJ1ZX0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIGxvY2tpbmc6IHtcbiAgICByZXRyeURlbGF5OiA1MDAsXG4gICAgcmV0cnlBdHRlbXB0czogNTAwLFxuICB9XG59O1xuXG5jb25zdCBOR0NDX0NPTkZJR19GSUxFTkFNRSA9ICduZ2NjLmNvbmZpZy5qcyc7XG5cbi8qKlxuICogVGhlIHByb2Nlc3NlZCBwYWNrYWdlIGxldmVsIGNvbmZpZ3VyYXRpb24gYXMgYSByZXN1bHQgb2YgcHJvY2Vzc2luZyBhIHJhdyBwYWNrYWdlIGxldmVsIGNvbmZpZy5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb2Nlc3NlZE5nY2NQYWNrYWdlQ29uZmlnIGltcGxlbWVudHMgT21pdDxSYXdOZ2NjUGFja2FnZUNvbmZpZywgJ2VudHJ5UG9pbnRzJz4ge1xuICAvKipcbiAgICogVGhlIGFic29sdXRlIHBhdGggdG8gdGhpcyBpbnN0YW5jZSBvZiB0aGUgcGFja2FnZS5cbiAgICogTm90ZSB0aGF0IHRoZXJlIG1heSBiZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgYSBwYWNrYWdlIGluc2lkZSBhIHByb2plY3QgaW4gbmVzdGVkXG4gICAqIGBub2RlX21vZHVsZXMvYC4gRm9yIGV4YW1wbGUsIG9uZSBhdCBgPHByb2plY3Qtcm9vdD4vbm9kZV9tb2R1bGVzL3NvbWUtcGFja2FnZS9gIGFuZCBvbmUgYXRcbiAgICogYDxwcm9qZWN0LXJvb3Q+L25vZGVfbW9kdWxlcy9vdGhlci1wYWNrYWdlL25vZGVfbW9kdWxlcy9zb21lLXBhY2thZ2UvYC5cbiAgICovXG4gIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aDtcblxuICAvKipcbiAgICogVGhlIGVudHJ5LXBvaW50cyB0byBjb25maWd1cmUgZm9yIHRoaXMgcGFja2FnZS5cbiAgICpcbiAgICogSW4gY29udHJhc3QgdG8gYFJhd05nY2NQYWNrYWdlQ29uZmlnYCwgdGhlIHBhdGhzIGFyZSBhYnNvbHV0ZSBhbmQgdGFrZSB0aGUgcGF0aCBvZiB0aGUgc3BlY2lmaWNcbiAgICogaW5zdGFuY2Ugb2YgdGhlIHBhY2thZ2UgaW50byBhY2NvdW50LlxuICAgKi9cbiAgZW50cnlQb2ludHM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgTmdjY0VudHJ5UG9pbnRDb25maWc+O1xuXG4gIC8qKlxuICAgKiBBIGNvbGxlY3Rpb24gb2YgcmVnZXhlcyB0aGF0IG1hdGNoIGRlZXAgaW1wb3J0cyB0byBpZ25vcmUsIGZvciB0aGlzIHBhY2thZ2UsIHJhdGhlciB0aGFuXG4gICAqIGRpc3BsYXlpbmcgYSB3YXJuaW5nLlxuICAgKi9cbiAgaWdub3JhYmxlRGVlcEltcG9ydE1hdGNoZXJzOiBSZWdFeHBbXTtcblxuICBjb25zdHJ1Y3RvcihmczogUGF0aE1hbmlwdWxhdGlvbiwgcGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoLCB7XG4gICAgZW50cnlQb2ludHMgPSB7fSxcbiAgICBpZ25vcmFibGVEZWVwSW1wb3J0TWF0Y2hlcnMgPSBbXSxcbiAgfTogUmF3TmdjY1BhY2thZ2VDb25maWcpIHtcbiAgICBjb25zdCBhYnNvbHV0ZVBhdGhFbnRyaWVzOiBbQWJzb2x1dGVGc1BhdGgsIE5nY2NFbnRyeVBvaW50Q29uZmlnXVtdID1cbiAgICAgICAgT2JqZWN0LmVudHJpZXMoZW50cnlQb2ludHMpLm1hcCgoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVQYXRoLCBjb25maWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA9PiBbZnMucmVzb2x2ZShwYWNrYWdlUGF0aCwgcmVsYXRpdmVQYXRoKSwgY29uZmlnXSk7XG5cbiAgICB0aGlzLnBhY2thZ2VQYXRoID0gcGFja2FnZVBhdGg7XG4gICAgdGhpcy5lbnRyeVBvaW50cyA9IG5ldyBNYXAoYWJzb2x1dGVQYXRoRW50cmllcyk7XG4gICAgdGhpcy5pZ25vcmFibGVEZWVwSW1wb3J0TWF0Y2hlcnMgPSBpZ25vcmFibGVEZWVwSW1wb3J0TWF0Y2hlcnM7XG4gIH1cbn1cblxuLyoqXG4gKiBOZ2NjIGhhcyBhIGhpZXJhcmNoaWNhbCBjb25maWd1cmF0aW9uIHN5c3RlbSB0aGF0IGxldHMgdXMgXCJmaXggdXBcIiBwYWNrYWdlcyB0aGF0IGRvIG5vdFxuICogd29yayB3aXRoIG5nY2Mgb3V0IG9mIHRoZSBib3guXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIGxldmVscyBhdCB3aGljaCBjb25maWd1cmF0aW9uIGNhbiBiZSBkZWNsYXJlZDpcbiAqXG4gKiAqIERlZmF1bHQgbGV2ZWwgLSBuZ2NjIGNvbWVzIHdpdGggYnVpbHQtaW4gY29uZmlndXJhdGlvbiBmb3Igd2VsbCBrbm93biBjYXNlcy5cbiAqICogUGFja2FnZSBsZXZlbCAtIGEgbGlicmFyeSBhdXRob3IgcHVibGlzaGVzIGEgY29uZmlndXJhdGlvbiB3aXRoIHRoZWlyIHBhY2thZ2UgdG8gZml4IGtub3duXG4gKiAgIGlzc3Vlcy5cbiAqICogUHJvamVjdCBsZXZlbCAtIHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgcHJvdmlkZXMgYSBjb25maWd1cmF0aW9uIHRoYXQgZml4ZXMgaXNzdWVzIHNwZWNpZmljXG4gKiAgIHRvIHRoZSBsaWJyYXJpZXMgdXNlZCBpbiB0aGVpciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBOZ2NjIHdpbGwgbWF0Y2ggY29uZmlndXJhdGlvbiBiYXNlZCBvbiB0aGUgcGFja2FnZSBuYW1lIGJ1dCBhbHNvIG9uIGl0cyB2ZXJzaW9uLiBUaGlzIGFsbG93c1xuICogY29uZmlndXJhdGlvbiB0byBwcm92aWRlIGRpZmZlcmVudCBmaXhlcyB0byBkaWZmZXJlbnQgdmVyc2lvbiByYW5nZXMgb2YgYSBwYWNrYWdlLlxuICpcbiAqICogUGFja2FnZSBsZXZlbCBjb25maWd1cmF0aW9uIGlzIHNwZWNpZmljIHRvIHRoZSBwYWNrYWdlIHZlcnNpb24gd2hlcmUgdGhlIGNvbmZpZ3VyYXRpb24gaXNcbiAqICAgZm91bmQuXG4gKiAqIERlZmF1bHQgYW5kIHByb2plY3QgbGV2ZWwgY29uZmlndXJhdGlvbiBzaG91bGQgcHJvdmlkZSB2ZXJzaW9uIHJhbmdlcyB0byBlbnN1cmUgdGhhdCB0aGVcbiAqICAgY29uZmlndXJhdGlvbiBpcyBvbmx5IGFwcGxpZWQgdG8gdGhlIGFwcHJvcHJpYXRlIHZlcnNpb25zIG9mIGEgcGFja2FnZS5cbiAqXG4gKiBXaGVuIGdldHRpbmcgYSBjb25maWd1cmF0aW9uIGZvciBhIHBhY2thZ2UgKHZpYSBgZ2V0Q29uZmlnKClgKSB0aGUgY2FsbGVyIHNob3VsZCBwcm92aWRlIHRoZVxuICogdmVyc2lvbiBvZiB0aGUgcGFja2FnZSBpbiBxdWVzdGlvbiwgaWYgYXZhaWxhYmxlLiBJZiBpdCBpcyBub3QgcHJvdmlkZWQgdGhlbiB0aGUgZmlyc3QgYXZhaWxhYmxlXG4gKiBjb25maWd1cmF0aW9uIGZvciBhIHBhY2thZ2UgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ2NjQ29uZmlndXJhdGlvbiB7XG4gIHByaXZhdGUgZGVmYXVsdENvbmZpZzogUGFydGlhbGx5UHJvY2Vzc2VkQ29uZmlnO1xuICBwcml2YXRlIHByb2plY3RDb25maWc6IFBhcnRpYWxseVByb2Nlc3NlZENvbmZpZztcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBWZXJzaW9uZWRQYWNrYWdlQ29uZmlnPigpO1xuICByZWFkb25seSBoYXNoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBiYXNlRGlyOiBBYnNvbHV0ZUZzUGF0aCkge1xuICAgIHRoaXMuZGVmYXVsdENvbmZpZyA9IHRoaXMucHJvY2Vzc1Byb2plY3RDb25maWcoREVGQVVMVF9OR0NDX0NPTkZJRyk7XG4gICAgdGhpcy5wcm9qZWN0Q29uZmlnID0gdGhpcy5wcm9jZXNzUHJvamVjdENvbmZpZyh0aGlzLmxvYWRQcm9qZWN0Q29uZmlnKGJhc2VEaXIpKTtcbiAgICB0aGlzLmhhc2ggPSB0aGlzLmNvbXB1dGVIYXNoKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIGxvY2tpbmcgdGhlIG5nY2MgcHJvY2Vzcy5cbiAgICovXG4gIGdldExvY2tpbmdDb25maWcoKTogUmVxdWlyZWQ8UHJvY2Vzc0xvY2tpbmdDb25maWd1cmF0aW9uPiB7XG4gICAgbGV0IHtyZXRyeUF0dGVtcHRzLCByZXRyeURlbGF5fSA9IHRoaXMucHJvamVjdENvbmZpZy5sb2NraW5nO1xuICAgIGlmIChyZXRyeUF0dGVtcHRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHJ5QXR0ZW1wdHMgPSB0aGlzLmRlZmF1bHRDb25maWcubG9ja2luZy5yZXRyeUF0dGVtcHRzITtcbiAgICB9XG4gICAgaWYgKHJldHJ5RGVsYXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0cnlEZWxheSA9IHRoaXMuZGVmYXVsdENvbmZpZy5sb2NraW5nLnJldHJ5RGVsYXkhO1xuICAgIH1cbiAgICByZXR1cm4ge3JldHJ5QXR0ZW1wdHMsIHJldHJ5RGVsYXl9O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBnaXZlbiBgdmVyc2lvbmAgb2YgYSBwYWNrYWdlIGF0IGBwYWNrYWdlUGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSBwYWNrYWdlTmFtZSBUaGUgbmFtZSBvZiB0aGUgcGFja2FnZSB3aG9zZSBjb25maWcgd2Ugd2FudC5cbiAgICogQHBhcmFtIHBhY2thZ2VQYXRoIFRoZSBwYXRoIHRvIHRoZSBwYWNrYWdlIHdob3NlIGNvbmZpZyB3ZSB3YW50LlxuICAgKiBAcGFyYW0gdmVyc2lvbiBUaGUgdmVyc2lvbiBvZiB0aGUgcGFja2FnZSB3aG9zZSBjb25maWcgd2Ugd2FudCwgb3IgYG51bGxgIGlmIHRoZSBwYWNrYWdlJ3NcbiAgICogcGFja2FnZS5qc29uIGRpZCBub3QgZXhpc3Qgb3Igd2FzIGludmFsaWQuXG4gICAqL1xuICBnZXRQYWNrYWdlQ29uZmlnKHBhY2thZ2VOYW1lOiBzdHJpbmcsIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgdmVyc2lvbjogc3RyaW5nfG51bGwpOlxuICAgICAgUHJvY2Vzc2VkTmdjY1BhY2thZ2VDb25maWcge1xuICAgIGNvbnN0IHJhd1BhY2thZ2VDb25maWcgPSB0aGlzLmdldFJhd1BhY2thZ2VDb25maWcocGFja2FnZU5hbWUsIHBhY2thZ2VQYXRoLCB2ZXJzaW9uKTtcbiAgICByZXR1cm4gbmV3IFByb2Nlc3NlZE5nY2NQYWNrYWdlQ29uZmlnKHRoaXMuZnMsIHBhY2thZ2VQYXRoLCByYXdQYWNrYWdlQ29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmF3UGFja2FnZUNvbmZpZyhcbiAgICAgIHBhY2thZ2VOYW1lOiBzdHJpbmcsIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCxcbiAgICAgIHZlcnNpb246IHN0cmluZ3xudWxsKTogVmVyc2lvbmVkUGFja2FnZUNvbmZpZyB7XG4gICAgY29uc3QgY2FjaGVLZXkgPSBwYWNrYWdlTmFtZSArICh2ZXJzaW9uICE9PSBudWxsID8gYEAke3ZlcnNpb259YCA6ICcnKTtcbiAgICBpZiAodGhpcy5jYWNoZS5oYXMoY2FjaGVLZXkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoY2FjaGVLZXkpITtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9qZWN0TGV2ZWxDb25maWcgPSB0aGlzLnByb2plY3RDb25maWcucGFja2FnZXMgP1xuICAgICAgICBmaW5kU2F0aXNmYWN0b3J5VmVyc2lvbih0aGlzLnByb2plY3RDb25maWcucGFja2FnZXNbcGFja2FnZU5hbWVdLCB2ZXJzaW9uKSA6XG4gICAgICAgIG51bGw7XG4gICAgaWYgKHByb2plY3RMZXZlbENvbmZpZyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jYWNoZS5zZXQoY2FjaGVLZXksIHByb2plY3RMZXZlbENvbmZpZyk7XG4gICAgICByZXR1cm4gcHJvamVjdExldmVsQ29uZmlnO1xuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VMZXZlbENvbmZpZyA9IHRoaXMubG9hZFBhY2thZ2VDb25maWcocGFja2FnZVBhdGgsIHZlcnNpb24pO1xuICAgIGlmIChwYWNrYWdlTGV2ZWxDb25maWcgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY2FjaGUuc2V0KGNhY2hlS2V5LCBwYWNrYWdlTGV2ZWxDb25maWcpO1xuICAgICAgcmV0dXJuIHBhY2thZ2VMZXZlbENvbmZpZztcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0TGV2ZWxDb25maWcgPSB0aGlzLmRlZmF1bHRDb25maWcucGFja2FnZXMgP1xuICAgICAgICBmaW5kU2F0aXNmYWN0b3J5VmVyc2lvbih0aGlzLmRlZmF1bHRDb25maWcucGFja2FnZXNbcGFja2FnZU5hbWVdLCB2ZXJzaW9uKSA6XG4gICAgICAgIG51bGw7XG4gICAgaWYgKGRlZmF1bHRMZXZlbENvbmZpZyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jYWNoZS5zZXQoY2FjaGVLZXksIGRlZmF1bHRMZXZlbENvbmZpZyk7XG4gICAgICByZXR1cm4gZGVmYXVsdExldmVsQ29uZmlnO1xuICAgIH1cblxuICAgIHJldHVybiB7dmVyc2lvblJhbmdlOiAnKid9O1xuICB9XG5cbiAgcHJpdmF0ZSBwcm9jZXNzUHJvamVjdENvbmZpZyhwcm9qZWN0Q29uZmlnOiBOZ2NjUHJvamVjdENvbmZpZyk6IFBhcnRpYWxseVByb2Nlc3NlZENvbmZpZyB7XG4gICAgY29uc3QgcHJvY2Vzc2VkQ29uZmlnOiBQYXJ0aWFsbHlQcm9jZXNzZWRDb25maWcgPSB7cGFja2FnZXM6IHt9LCBsb2NraW5nOiB7fX07XG5cbiAgICAvLyBsb2NraW5nIGNvbmZpZ3VyYXRpb25cbiAgICBpZiAocHJvamVjdENvbmZpZy5sb2NraW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHByb2Nlc3NlZENvbmZpZy5sb2NraW5nID0gcHJvamVjdENvbmZpZy5sb2NraW5nO1xuICAgIH1cblxuICAgIC8vIHBhY2thZ2VzIGNvbmZpZ3VyYXRpb25cbiAgICBmb3IgKGNvbnN0IHBhY2thZ2VOYW1lQW5kVmVyc2lvbiBpbiBwcm9qZWN0Q29uZmlnLnBhY2thZ2VzKSB7XG4gICAgICBjb25zdCBwYWNrYWdlQ29uZmlnID0gcHJvamVjdENvbmZpZy5wYWNrYWdlc1twYWNrYWdlTmFtZUFuZFZlcnNpb25dO1xuICAgICAgaWYgKHBhY2thZ2VDb25maWcpIHtcbiAgICAgICAgY29uc3QgW3BhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UgPSAnKiddID0gdGhpcy5zcGxpdE5hbWVBbmRWZXJzaW9uKHBhY2thZ2VOYW1lQW5kVmVyc2lvbik7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VDb25maWdzID1cbiAgICAgICAgICAgIHByb2Nlc3NlZENvbmZpZy5wYWNrYWdlc1twYWNrYWdlTmFtZV0gfHwgKHByb2Nlc3NlZENvbmZpZy5wYWNrYWdlc1twYWNrYWdlTmFtZV0gPSBbXSk7XG4gICAgICAgIHBhY2thZ2VDb25maWdzIS5wdXNoKHsuLi5wYWNrYWdlQ29uZmlnLCB2ZXJzaW9uUmFuZ2V9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcHJvY2Vzc2VkQ29uZmlnO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkUHJvamVjdENvbmZpZyhiYXNlRGlyOiBBYnNvbHV0ZUZzUGF0aCk6IE5nY2NQcm9qZWN0Q29uZmlnIHtcbiAgICBjb25zdCBjb25maWdGaWxlUGF0aCA9IHRoaXMuZnMuam9pbihiYXNlRGlyLCBOR0NDX0NPTkZJR19GSUxFTkFNRSk7XG4gICAgaWYgKHRoaXMuZnMuZXhpc3RzKGNvbmZpZ0ZpbGVQYXRoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZhbFNyY0ZpbGUoY29uZmlnRmlsZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcHJvamVjdCBjb25maWd1cmF0aW9uIGZpbGUgYXQgXCIke2NvbmZpZ0ZpbGVQYXRofVwiOiBgICsgZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtwYWNrYWdlczoge319O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbG9hZFBhY2thZ2VDb25maWcocGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoLCB2ZXJzaW9uOiBzdHJpbmd8bnVsbCk6XG4gICAgICBWZXJzaW9uZWRQYWNrYWdlQ29uZmlnfG51bGwge1xuICAgIGNvbnN0IGNvbmZpZ0ZpbGVQYXRoID0gdGhpcy5mcy5qb2luKHBhY2thZ2VQYXRoLCBOR0NDX0NPTkZJR19GSUxFTkFNRSk7XG4gICAgaWYgKHRoaXMuZnMuZXhpc3RzKGNvbmZpZ0ZpbGVQYXRoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFja2FnZUNvbmZpZyA9IHRoaXMuZXZhbFNyY0ZpbGUoY29uZmlnRmlsZVBhdGgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnBhY2thZ2VDb25maWcsXG4gICAgICAgICAgdmVyc2lvblJhbmdlOiB2ZXJzaW9uIHx8ICcqJyxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhY2thZ2UgY29uZmlndXJhdGlvbiBmaWxlIGF0IFwiJHtjb25maWdGaWxlUGF0aH1cIjogYCArIGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZXZhbFNyY0ZpbGUoc3JjUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBhbnkge1xuICAgIGNvbnN0IHNyYyA9IHRoaXMuZnMucmVhZEZpbGUoc3JjUGF0aCk7XG4gICAgY29uc3QgdGhlRXhwb3J0cyA9IHt9O1xuICAgIGNvbnN0IHNhbmRib3ggPSB7XG4gICAgICBtb2R1bGU6IHtleHBvcnRzOiB0aGVFeHBvcnRzfSxcbiAgICAgIGV4cG9ydHM6IHRoZUV4cG9ydHMsXG4gICAgICByZXF1aXJlLFxuICAgICAgX19kaXJuYW1lOiB0aGlzLmZzLmRpcm5hbWUoc3JjUGF0aCksXG4gICAgICBfX2ZpbGVuYW1lOiBzcmNQYXRoXG4gICAgfTtcbiAgICB2bS5ydW5Jbk5ld0NvbnRleHQoc3JjLCBzYW5kYm94LCB7ZmlsZW5hbWU6IHNyY1BhdGh9KTtcbiAgICByZXR1cm4gc2FuZGJveC5tb2R1bGUuZXhwb3J0cztcbiAgfVxuXG4gIHByaXZhdGUgc3BsaXROYW1lQW5kVmVyc2lvbihwYWNrYWdlTmFtZUFuZFZlcnNpb246IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ3x1bmRlZmluZWRdIHtcbiAgICBjb25zdCB2ZXJzaW9uSW5kZXggPSBwYWNrYWdlTmFtZUFuZFZlcnNpb24ubGFzdEluZGV4T2YoJ0AnKTtcbiAgICAvLyBOb3RlIHRoYXQgPiAwIGlzIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0byBtYXRjaCBAIGF0IHRoZSBzdGFydCBvZiB0aGUgbGluZVxuICAgIC8vIHdoaWNoIGlzIHdoYXQgeW91IHdvdWxkIGhhdmUgd2l0aCBhIG5hbWVzcGFjZWQgcGFja2FnZSwgZS5nLiBgQGFuZ3VsYXIvY29tbW9uYC5cbiAgICByZXR1cm4gdmVyc2lvbkluZGV4ID4gMCA/XG4gICAgICAgIFtcbiAgICAgICAgICBwYWNrYWdlTmFtZUFuZFZlcnNpb24uc3Vic3RyaW5nKDAsIHZlcnNpb25JbmRleCksXG4gICAgICAgICAgcGFja2FnZU5hbWVBbmRWZXJzaW9uLnN1YnN0cmluZyh2ZXJzaW9uSW5kZXggKyAxKSxcbiAgICAgICAgXSA6XG4gICAgICAgIFtwYWNrYWdlTmFtZUFuZFZlcnNpb24sIHVuZGVmaW5lZF07XG4gIH1cblxuICBwcml2YXRlIGNvbXB1dGVIYXNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShKU09OLnN0cmluZ2lmeSh0aGlzLnByb2plY3RDb25maWcpKS5kaWdlc3QoJ2hleCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRTYXRpc2ZhY3RvcnlWZXJzaW9uKGNvbmZpZ3M6IFZlcnNpb25lZFBhY2thZ2VDb25maWdbXXx1bmRlZmluZWQsIHZlcnNpb246IHN0cmluZ3xudWxsKTpcbiAgICBWZXJzaW9uZWRQYWNrYWdlQ29uZmlnfG51bGwge1xuICBpZiAoY29uZmlncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHZlcnNpb24gPT09IG51bGwpIHtcbiAgICAvLyBUaGUgcGFja2FnZSBoYXMgbm8gdmVyc2lvbiAoISkgLSBwZXJoYXBzIHRoZSBlbnRyeS1wb2ludCB3YXMgZnJvbSBhIGRlZXAgaW1wb3J0LCB3aGljaCBtYWRlXG4gICAgLy8gaXQgaW1wb3NzaWJsZSB0byBmaW5kIHRoZSBwYWNrYWdlLmpzb24uXG4gICAgLy8gU28ganVzdCByZXR1cm4gdGhlIGZpcnN0IGNvbmZpZyB0aGF0IG1hdGNoZXMgdGhlIHBhY2thZ2UgbmFtZS5cbiAgICByZXR1cm4gY29uZmlnc1swXTtcbiAgfVxuICByZXR1cm4gY29uZmlncy5maW5kKFxuICAgICAgICAgICAgIGNvbmZpZyA9PiBzYXRpc2ZpZXModmVyc2lvbiwgY29uZmlnLnZlcnNpb25SYW5nZSwge2luY2x1ZGVQcmVyZWxlYXNlOiB0cnVlfSkpIHx8XG4gICAgICBudWxsO1xufVxuIl19
"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NgccProcessor = void 0;
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const benchmark_1 = require("./benchmark");
// We cannot create a plugin for this, because NGTSC requires addition type
// information which ngcc creates when processing a package which was compiled with NGC.
// Example of such errors:
// ERROR in node_modules/@angular/platform-browser/platform-browser.d.ts(42,22):
// error TS-996002: Appears in the NgModule.imports of AppModule,
// but could not be resolved to an NgModule class
// We now transform a package and it's typings when NGTSC is resolving a module.
class NgccProcessor {
    constructor(compilerNgcc, propertiesToConsider, compilationWarnings, compilationErrors, basePath, tsConfigPath, inputFileSystem, resolver) {
        this.compilerNgcc = compilerNgcc;
        this.propertiesToConsider = propertiesToConsider;
        this.compilationWarnings = compilationWarnings;
        this.compilationErrors = compilationErrors;
        this.basePath = basePath;
        this.tsConfigPath = tsConfigPath;
        this.inputFileSystem = inputFileSystem;
        this.resolver = resolver;
        this._processedModules = new Set();
        this._logger = new NgccLogger(this.compilationWarnings, this.compilationErrors, compilerNgcc.LogLevel.info);
        this._nodeModulesDirectory = this.findNodeModulesDirectory(this.basePath);
    }
    /** Process the entire node modules tree. */
    process() {
        // Under Bazel when running in sandbox mode parts of the filesystem is read-only, or when using
        // Yarn PnP there may not be a node_modules directory. ngcc can't run in those cases, so the
        // processing is skipped.
        if (process.env.BAZEL_TARGET || !this._nodeModulesDirectory) {
            return;
        }
        // Skip if node_modules are read-only
        const corePackage = this.tryResolvePackage('@angular/core', this._nodeModulesDirectory);
        if (corePackage && isReadOnlyFile(corePackage)) {
            return;
        }
        // Perform a ngcc run check to determine if an initial execution is required.
        // If a run hash file exists that matches the current package manager lock file and the
        // project's tsconfig, then an initial ngcc run has already been performed.
        let skipProcessing = false;
        let runHashFilePath;
        const runHashBasePath = path.join(this._nodeModulesDirectory, '.cli-ngcc');
        const projectBasePath = path.join(this._nodeModulesDirectory, '..');
        try {
            let ngccConfigData;
            try {
                ngccConfigData = (0, fs_1.readFileSync)(path.join(projectBasePath, 'ngcc.config.js'));
            }
            catch (_a) {
                ngccConfigData = '';
            }
            const relativeTsconfigPath = path.relative(projectBasePath, this.tsConfigPath);
            const tsconfigData = (0, fs_1.readFileSync)(this.tsConfigPath);
            const { lockFileData, lockFilePath } = this.findPackageManagerLockFile(projectBasePath);
            // Generate a hash that represents the state of the package lock file and used tsconfig
            const runHash = (0, crypto_1.createHash)('sha256')
                .update(lockFileData)
                .update(lockFilePath)
                .update(ngccConfigData)
                .update(tsconfigData)
                .update(relativeTsconfigPath)
                .digest('hex');
            // The hash is used directly in the file name to mitigate potential read/write race
            // conditions as well as to only require a file existence check
            runHashFilePath = path.join(runHashBasePath, runHash + '.lock');
            // If the run hash lock file exists, then ngcc was already run against this project state
            if ((0, fs_1.existsSync)(runHashFilePath)) {
                skipProcessing = true;
            }
        }
        catch (_b) {
            // Any error means an ngcc execution is needed
        }
        if (skipProcessing) {
            return;
        }
        const timeLabel = 'NgccProcessor.process';
        (0, benchmark_1.time)(timeLabel);
        // We spawn instead of using the API because:
        // - NGCC Async uses clustering which is problematic when used via the API which means
        // that we cannot setup multiple cluster masters with different options.
        // - We will not be able to have concurrent builds otherwise Ex: App-Shell,
        // as NGCC will create a lock file for both builds and it will cause builds to fails.
        const originalProcessTitle = process.title;
        try {
            const { status, error } = (0, child_process_1.spawnSync)(process.execPath, [
                this.compilerNgcc.ngccMainFilePath,
                '--source' /** basePath */,
                this._nodeModulesDirectory,
                '--properties' /** propertiesToConsider */,
                ...this.propertiesToConsider,
                '--first-only' /** compileAllFormats */,
                '--create-ivy-entry-points' /** createNewEntryPointFormats */,
                '--async',
                '--tsconfig' /** tsConfigPath */,
                this.tsConfigPath,
                '--use-program-dependencies',
            ], {
                stdio: ['inherit', process.stderr, process.stderr],
            });
            if (status !== 0) {
                const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || '';
                throw new Error(errorMessage + `NGCC failed${errorMessage ? ', see above' : ''}.`);
            }
        }
        finally {
            process.title = originalProcessTitle;
        }
        (0, benchmark_1.timeEnd)(timeLabel);
        // ngcc was successful so if a run hash was generated, write it for next time
        if (runHashFilePath) {
            try {
                if (!(0, fs_1.existsSync)(runHashBasePath)) {
                    (0, fs_1.mkdirSync)(runHashBasePath, { recursive: true });
                }
                (0, fs_1.writeFileSync)(runHashFilePath, '');
            }
            catch (_c) {
                // Errors are non-fatal
            }
        }
    }
    /** Process a module and its dependencies. */
    processModule(moduleName, resolvedModule) {
        var _a, _b;
        const resolvedFileName = resolvedModule.resolvedFileName;
        if (!this._nodeModulesDirectory ||
            !resolvedFileName ||
            moduleName.startsWith('.') ||
            this._processedModules.has(resolvedFileName)) {
            // Skip when module_modules directory is not present, module is unknown, relative or the
            // NGCC compiler is not found or already processed.
            return;
        }
        const packageJsonPath = this.tryResolvePackage(moduleName, resolvedFileName);
        // If the package.json is read only we should skip calling NGCC.
        // With Bazel when running under sandbox the filesystem is read-only.
        if (!packageJsonPath || isReadOnlyFile(packageJsonPath)) {
            // add it to processed so the second time round we skip this.
            this._processedModules.add(resolvedFileName);
            return;
        }
        const timeLabel = `NgccProcessor.processModule.ngcc.process+${moduleName}`;
        (0, benchmark_1.time)(timeLabel);
        this.compilerNgcc.process({
            basePath: this._nodeModulesDirectory,
            targetEntryPointPath: path.dirname(packageJsonPath),
            propertiesToConsider: this.propertiesToConsider,
            compileAllFormats: false,
            createNewEntryPointFormats: true,
            logger: this._logger,
            tsConfigPath: this.tsConfigPath,
        });
        (0, benchmark_1.timeEnd)(timeLabel);
        // Purge this file from cache, since NGCC add new mainFields. Ex: module_ivy_ngcc
        // which are unknown in the cached file.
        (_b = (_a = this.inputFileSystem).purge) === null || _b === void 0 ? void 0 : _b.call(_a, packageJsonPath);
        this._processedModules.add(resolvedFileName);
    }
    invalidate(fileName) {
        this._processedModules.delete(fileName);
    }
    /**
     * Try resolve a package.json file from the resolved .d.ts file.
     */
    tryResolvePackage(moduleName, resolvedFileName) {
        try {
            const resolvedPath = this.resolver.resolveSync({}, resolvedFileName, `${moduleName}/package.json`);
            return resolvedPath || undefined;
        }
        catch (_a) {
            // Ex: @angular/compiler/src/i18n/i18n_ast/package.json
            // or local libraries which don't reside in node_modules
            const packageJsonPath = path.resolve(resolvedFileName, '../package.json');
            return (0, fs_1.existsSync)(packageJsonPath) ? packageJsonPath : undefined;
        }
    }
    findNodeModulesDirectory(startPoint) {
        let current = startPoint;
        while (path.dirname(current) !== current) {
            const nodePath = path.join(current, 'node_modules');
            if ((0, fs_1.existsSync)(nodePath)) {
                return nodePath;
            }
            current = path.dirname(current);
        }
        return null;
    }
    findPackageManagerLockFile(projectBasePath) {
        for (const lockFile of ['yarn.lock', 'pnpm-lock.yaml', 'package-lock.json']) {
            const lockFilePath = path.join(projectBasePath, lockFile);
            try {
                return {
                    lockFilePath,
                    lockFileData: (0, fs_1.readFileSync)(lockFilePath),
                };
            }
            catch (_a) { }
        }
        throw new Error('Cannot locate a package manager lock file.');
    }
}
exports.NgccProcessor = NgccProcessor;
class NgccLogger {
    constructor(compilationWarnings, compilationErrors, level) {
        this.compilationWarnings = compilationWarnings;
        this.compilationErrors = compilationErrors;
        this.level = level;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    debug() { }
    info(...args) {
        // Log to stderr because it's a progress-like info message.
        process.stderr.write(`\n${args.join(' ')}\n`);
    }
    warn(...args) {
        this.compilationWarnings.push(args.join(' '));
    }
    error(...args) {
        this.compilationErrors.push(new Error(args.join(' ')));
    }
}
function isReadOnlyFile(fileName) {
    try {
        (0, fs_1.accessSync)(fileName, fs_1.constants.W_OK);
        return false;
    }
    catch (_a) {
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdjY19wcm9jZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9uZ3Rvb2xzL3dlYnBhY2svc3JjL25nY2NfcHJvY2Vzc29yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0gsaURBQTBDO0FBQzFDLG1DQUFvQztBQUNwQywyQkFBK0Y7QUFDL0YsMkNBQTZCO0FBRzdCLDJDQUE0QztBQU01QywyRUFBMkU7QUFDM0Usd0ZBQXdGO0FBRXhGLDBCQUEwQjtBQUMxQixnRkFBZ0Y7QUFDaEYsaUVBQWlFO0FBQ2pFLGlEQUFpRDtBQUVqRCxnRkFBZ0Y7QUFFaEYsTUFBYSxhQUFhO0lBS3hCLFlBQ21CLFlBQXlELEVBQ3pELG9CQUE4QixFQUM5QixtQkFBdUMsRUFDdkMsaUJBQXFDLEVBQ3JDLFFBQWdCLEVBQ2hCLFlBQW9CLEVBQ3BCLGVBQWdDLEVBQ2hDLFFBQTZCO1FBUDdCLGlCQUFZLEdBQVosWUFBWSxDQUE2QztRQUN6RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQVU7UUFDOUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvQjtRQUN2QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1FBQ3JDLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDaEIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2hDLGFBQVEsR0FBUixRQUFRLENBQXFCO1FBWnhDLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFjNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FDM0IsSUFBSSxDQUFDLG1CQUFtQixFQUN4QixJQUFJLENBQUMsaUJBQWlCLEVBQ3RCLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUMzQixDQUFDO1FBQ0YsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElB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LEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0Y7QUFFRCxTQUFTLGNBQWMsQ0FBQyxRQUFnQjtJQUN0QyxJQUFJO1FBQ0YsSUFBQSxlQUFVLEVBQUMsUUFBUSxFQUFFLGNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyQyxPQUFPLEtBQUssQ0FBQztLQUNkO0lBQUMsV0FBTTtRQUNOLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB0eXBlIHsgTG9nTGV2ZWwsIExvZ2dlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaS9uZ2NjJztcbmltcG9ydCB7IHNwYXduU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgeyBhY2Nlc3NTeW5jLCBjb25zdGFudHMsIGV4aXN0c1N5bmMsIG1rZGlyU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlciB9IGZyb20gJ3dlYnBhY2snO1xuaW1wb3J0IHsgdGltZSwgdGltZUVuZCB9IGZyb20gJy4vYmVuY2htYXJrJztcbmltcG9ydCB7IElucHV0RmlsZVN5c3RlbSB9IGZyb20gJy4vaXZ5L3N5c3RlbSc7XG5cbi8vIEV4dHJhY3QgUmVzb2x2ZXIgdHlwZSBmcm9tIFdlYnBhY2sgdHlwZXMgc2luY2UgaXQgaXMgbm90IGRpcmVjdGx5IGV4cG9ydGVkXG50eXBlIFJlc29sdmVyV2l0aE9wdGlvbnMgPSBSZXR1cm5UeXBlPENvbXBpbGVyWydyZXNvbHZlckZhY3RvcnknXVsnZ2V0J10+O1xuXG4vLyBXZSBjYW5ub3QgY3JlYXRlIGEgcGx1Z2luIGZvciB0aGlzLCBiZWNhdXNlIE5HVFNDIHJlcXVpcmVzIGFkZGl0aW9uIHR5cGVcbi8vIGluZm9ybWF0aW9uIHdoaWNoIG5nY2MgY3JlYXRlcyB3aGVuIHByb2Nlc3NpbmcgYSBwYWNrYWdlIHdoaWNoIHdhcyBjb21waWxlZCB3aXRoIE5HQy5cblxuLy8gRXhhbXBsZSBvZiBzdWNoIGVycm9yczpcbi8vIEVSUk9SIGluIG5vZGVfbW9kdWxlcy9AYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL3BsYXRmb3JtLWJyb3dzZXIuZC50cyg0MiwyMik6XG4vLyBlcnJvciBUUy05OTYwMDI6IEFwcGVhcnMgaW4gdGhlIE5nTW9kdWxlLmltcG9ydHMgb2YgQXBwTW9kdWxlLFxuLy8gYnV0IGNvdWxkIG5vdCBiZSByZXNvbHZlZCB0byBhbiBOZ01vZHVsZSBjbGFzc1xuXG4vLyBXZSBub3cgdHJhbnNmb3JtIGEgcGFja2FnZSBhbmQgaXQncyB0eXBpbmdzIHdoZW4gTkdUU0MgaXMgcmVzb2x2aW5nIGEgbW9kdWxlLlxuXG5leHBvcnQgY2xhc3MgTmdjY1Byb2Nlc3NvciB7XG4gIHByaXZhdGUgX3Byb2Nlc3NlZE1vZHVsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSBfbG9nZ2VyOiBOZ2NjTG9nZ2VyO1xuICBwcml2YXRlIF9ub2RlTW9kdWxlc0RpcmVjdG9yeTogc3RyaW5nIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbXBpbGVyTmdjYzogdHlwZW9mIGltcG9ydCgnQGFuZ3VsYXIvY29tcGlsZXItY2xpL25nY2MnKSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByb3BlcnRpZXNUb0NvbnNpZGVyOiBzdHJpbmdbXSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbXBpbGF0aW9uV2FybmluZ3M6IChFcnJvciB8IHN0cmluZylbXSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbXBpbGF0aW9uRXJyb3JzOiAoRXJyb3IgfCBzdHJpbmcpW10sXG4gICAgcHJpdmF0ZSByZWFkb25seSBiYXNlUGF0aDogc3RyaW5nLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdHNDb25maWdQYXRoOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnB1dEZpbGVTeXN0ZW06IElucHV0RmlsZVN5c3RlbSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlc29sdmVyOiBSZXNvbHZlcldpdGhPcHRpb25zLFxuICApIHtcbiAgICB0aGlzLl9sb2dnZXIgPSBuZXcgTmdjY0xvZ2dlcihcbiAgICAgIHRoaXMuY29tcGlsYXRpb25XYXJuaW5ncyxcbiAgICAgIHRoaXMuY29tcGlsYXRpb25FcnJvcnMsXG4gICAgICBjb21waWxlck5nY2MuTG9nTGV2ZWwuaW5mbyxcbiAgICApO1xuICAgIHRoaXMuX25vZGVNb2R1bGVzRGlyZWN0b3J5ID0gdGhpcy5maW5kTm9kZU1vZHVsZXNEaXJlY3RvcnkodGhpcy5iYXNlUGF0aCk7XG4gIH1cblxuICAvKiogUHJvY2VzcyB0aGUgZW50aXJlIG5vZGUgbW9kdWxlcyB0cmVlLiAqL1xuICBwcm9jZXNzKCkge1xuICAgIC8vIFVuZGVyIEJhemVsIHdoZW4gcnVubmluZyBpbiBzYW5kYm94IG1vZGUgcGFydHMgb2YgdGhlIGZpbGVzeXN0ZW0gaXMgcmVhZC1vbmx5LCBvciB3aGVuIHVzaW5nXG4gICAgLy8gWWFybiBQblAgdGhlcmUgbWF5IG5vdCBiZSBhIG5vZGVfbW9kdWxlcyBkaXJlY3RvcnkuIG5nY2MgY2FuJ3QgcnVuIGluIHRob3NlIGNhc2VzLCBzbyB0aGVcbiAgICAvLyBwcm9jZXNzaW5nIGlzIHNraXBwZWQuXG4gICAgaWYgKHByb2Nlc3MuZW52LkJBWkVMX1RBUkdFVCB8fCAhdGhpcy5fbm9kZU1vZHVsZXNEaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTa2lwIGlmIG5vZGVfbW9kdWxlcyBhcmUgcmVhZC1vbmx5XG4gICAgY29uc3QgY29yZVBhY2thZ2UgPSB0aGlzLnRyeVJlc29sdmVQYWNrYWdlKCdAYW5ndWxhci9jb3JlJywgdGhpcy5fbm9kZU1vZHVsZXNEaXJlY3RvcnkpO1xuICAgIGlmIChjb3JlUGFja2FnZSAmJiBpc1JlYWRPbmx5RmlsZShjb3JlUGFja2FnZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGEgbmdjYyBydW4gY2hlY2sgdG8gZGV0ZXJtaW5lIGlmIGFuIGluaXRpYWwgZXhlY3V0aW9uIGlzIHJlcXVpcmVkLlxuICAgIC8vIElmIGEgcnVuIGhhc2ggZmlsZSBleGlzdHMgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHBhY2thZ2UgbWFuYWdlciBsb2NrIGZpbGUgYW5kIHRoZVxuICAgIC8vIHByb2plY3QncyB0c2NvbmZpZywgdGhlbiBhbiBpbml0aWFsIG5nY2MgcnVuIGhhcyBhbHJlYWR5IGJlZW4gcGVyZm9ybWVkLlxuICAgIGxldCBza2lwUHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIGxldCBydW5IYXNoRmlsZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBydW5IYXNoQmFzZVBhdGggPSBwYXRoLmpvaW4odGhpcy5fbm9kZU1vZHVsZXNEaXJlY3RvcnksICcuY2xpLW5nY2MnKTtcbiAgICBjb25zdCBwcm9qZWN0QmFzZVBhdGggPSBwYXRoLmpvaW4odGhpcy5fbm9kZU1vZHVsZXNEaXJlY3RvcnksICcuLicpO1xuICAgIHRyeSB7XG4gICAgICBsZXQgbmdjY0NvbmZpZ0RhdGE7XG4gICAgICB0cnkge1xuICAgICAgICBuZ2NjQ29uZmlnRGF0YSA9IHJlYWRGaWxlU3luYyhwYXRoLmpvaW4ocHJvamVjdEJhc2VQYXRoLCAnbmdjYy5jb25maWcuanMnKSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgbmdjY0NvbmZpZ0RhdGEgPSAnJztcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVsYXRpdmVUc2NvbmZpZ1BhdGggPSBwYXRoLnJlbGF0aXZlKHByb2plY3RCYXNlUGF0aCwgdGhpcy50c0NvbmZpZ1BhdGgpO1xuICAgICAgY29uc3QgdHNjb25maWdEYXRhID0gcmVhZEZpbGVTeW5jKHRoaXMudHNDb25maWdQYXRoKTtcbiAgICAgIGNvbnN0IHsgbG9ja0ZpbGVEYXRhLCBsb2NrRmlsZVBhdGggfSA9IHRoaXMuZmluZFBhY2thZ2VNYW5hZ2VyTG9ja0ZpbGUocHJvamVjdEJhc2VQYXRoKTtcblxuICAgICAgLy8gR2VuZXJhdGUgYSBoYXNoIHRoYXQgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgdGhlIHBhY2thZ2UgbG9jayBmaWxlIGFuZCB1c2VkIHRzY29uZmlnXG4gICAgICBjb25zdCBydW5IYXNoID0gY3JlYXRlSGFzaCgnc2hhMjU2JylcbiAgICAgICAgLnVwZGF0ZShsb2NrRmlsZURhdGEpXG4gICAgICAgIC51cGRhdGUobG9ja0ZpbGVQYXRoKVxuICAgICAgICAudXBkYXRlKG5nY2NDb25maWdEYXRhKVxuICAgICAgICAudXBkYXRlKHRzY29uZmlnRGF0YSlcbiAgICAgICAgLnVwZGF0ZShyZWxhdGl2ZVRzY29uZmlnUGF0aClcbiAgICAgICAgLmRpZ2VzdCgnaGV4Jyk7XG5cbiAgICAgIC8vIFRoZSBoYXNoIGlzIHVzZWQgZGlyZWN0bHkgaW4gdGhlIGZpbGUgbmFtZSB0byBtaXRpZ2F0ZSBwb3RlbnRpYWwgcmVhZC93cml0ZSByYWNlXG4gICAgICAvLyBjb25kaXRpb25zIGFzIHdlbGwgYXMgdG8gb25seSByZXF1aXJlIGEgZmlsZSBleGlzdGVuY2UgY2hlY2tcbiAgICAgIHJ1bkhhc2hGaWxlUGF0aCA9IHBhdGguam9pbihydW5IYXNoQmFzZVBhdGgsIHJ1bkhhc2ggKyAnLmxvY2snKTtcblxuICAgICAgLy8gSWYgdGhlIHJ1biBoYXNoIGxvY2sgZmlsZSBleGlzdHMsIHRoZW4gbmdjYyB3YXMgYWxyZWFkeSBydW4gYWdhaW5zdCB0aGlzIHByb2plY3Qgc3RhdGVcbiAgICAgIGlmIChleGlzdHNTeW5jKHJ1bkhhc2hGaWxlUGF0aCkpIHtcbiAgICAgICAgc2tpcFByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gQW55IGVycm9yIG1lYW5zIGFuIG5nY2MgZXhlY3V0aW9uIGlzIG5lZWRlZFxuICAgIH1cblxuICAgIGlmIChza2lwUHJvY2Vzc2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVMYWJlbCA9ICdOZ2NjUHJvY2Vzc29yLnByb2Nlc3MnO1xuICAgIHRpbWUodGltZUxhYmVsKTtcblxuICAgIC8vIFdlIHNwYXduIGluc3RlYWQgb2YgdXNpbmcgdGhlIEFQSSBiZWNhdXNlOlxuICAgIC8vIC0gTkdDQyBBc3luYyB1c2VzIGNsdXN0ZXJpbmcgd2hpY2ggaXMgcHJvYmxlbWF0aWMgd2hlbiB1c2VkIHZpYSB0aGUgQVBJIHdoaWNoIG1lYW5zXG4gICAgLy8gdGhhdCB3ZSBjYW5ub3Qgc2V0dXAgbXVsdGlwbGUgY2x1c3RlciBtYXN0ZXJzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gICAgLy8gLSBXZSB3aWxsIG5vdCBiZSBhYmxlIHRvIGhhdmUgY29uY3VycmVudCBidWlsZHMgb3RoZXJ3aXNlIEV4OiBBcHAtU2hlbGwsXG4gICAgLy8gYXMgTkdDQyB3aWxsIGNyZWF0ZSBhIGxvY2sgZmlsZSBmb3IgYm90aCBidWlsZHMgYW5kIGl0IHdpbGwgY2F1c2UgYnVpbGRzIHRvIGZhaWxzLlxuICAgIGNvbnN0IG9yaWdpbmFsUHJvY2Vzc1RpdGxlID0gcHJvY2Vzcy50aXRsZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGF0dXMsIGVycm9yIH0gPSBzcGF3blN5bmMoXG4gICAgICAgIHByb2Nlc3MuZXhlY1BhdGgsXG4gICAgICAgIFtcbiAgICAgICAgICB0aGlzLmNvbXBpbGVyTmdjYy5uZ2NjTWFpbkZpbGVQYXRoLFxuICAgICAgICAgICctLXNvdXJjZScgLyoqIGJhc2VQYXRoICovLFxuICAgICAgICAgIHRoaXMuX25vZGVNb2R1bGVzRGlyZWN0b3J5LFxuICAgICAgICAgICctLXByb3BlcnRpZXMnIC8qKiBwcm9wZXJ0aWVzVG9Db25zaWRlciAqLyxcbiAgICAgICAgICAuLi50aGlzLnByb3BlcnRpZXNUb0NvbnNpZGVyLFxuICAgICAgICAgICctLWZpcnN0LW9ubHknIC8qKiBjb21waWxlQWxsRm9ybWF0cyAqLyxcbiAgICAgICAgICAnLS1jcmVhdGUtaXZ5LWVudHJ5LXBvaW50cycgLyoqIGNyZWF0ZU5ld0VudHJ5UG9pbnRGb3JtYXRzICovLFxuICAgICAgICAgICctLWFzeW5jJyxcbiAgICAgICAgICAnLS10c2NvbmZpZycgLyoqIHRzQ29uZmlnUGF0aCAqLyxcbiAgICAgICAgICB0aGlzLnRzQ29uZmlnUGF0aCxcbiAgICAgICAgICAnLS11c2UtcHJvZ3JhbS1kZXBlbmRlbmNpZXMnLFxuICAgICAgICBdLFxuICAgICAgICB7XG4gICAgICAgICAgc3RkaW86IFsnaW5oZXJpdCcsIHByb2Nlc3Muc3RkZXJyLCBwcm9jZXNzLnN0ZGVycl0sXG4gICAgICAgIH0sXG4gICAgICApO1xuXG4gICAgICBpZiAoc3RhdHVzICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yPy5tZXNzYWdlIHx8ICcnO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlICsgYE5HQ0MgZmFpbGVkJHtlcnJvck1lc3NhZ2UgPyAnLCBzZWUgYWJvdmUnIDogJyd9LmApO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBwcm9jZXNzLnRpdGxlID0gb3JpZ2luYWxQcm9jZXNzVGl0bGU7XG4gICAgfVxuXG4gICAgdGltZUVuZCh0aW1lTGFiZWwpO1xuXG4gICAgLy8gbmdjYyB3YXMgc3VjY2Vzc2Z1bCBzbyBpZiBhIHJ1biBoYXNoIHdhcyBnZW5lcmF0ZWQsIHdyaXRlIGl0IGZvciBuZXh0IHRpbWVcbiAgICBpZiAocnVuSGFzaEZpbGVQYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIWV4aXN0c1N5bmMocnVuSGFzaEJhc2VQYXRoKSkge1xuICAgICAgICAgIG1rZGlyU3luYyhydW5IYXNoQmFzZVBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdyaXRlRmlsZVN5bmMocnVuSGFzaEZpbGVQYXRoLCAnJyk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gRXJyb3JzIGFyZSBub24tZmF0YWxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUHJvY2VzcyBhIG1vZHVsZSBhbmQgaXRzIGRlcGVuZGVuY2llcy4gKi9cbiAgcHJvY2Vzc01vZHVsZShcbiAgICBtb2R1bGVOYW1lOiBzdHJpbmcsXG4gICAgcmVzb2x2ZWRNb2R1bGU6IHRzLlJlc29sdmVkTW9kdWxlIHwgdHMuUmVzb2x2ZWRUeXBlUmVmZXJlbmNlRGlyZWN0aXZlLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCByZXNvbHZlZEZpbGVOYW1lID0gcmVzb2x2ZWRNb2R1bGUucmVzb2x2ZWRGaWxlTmFtZTtcbiAgICBpZiAoXG4gICAgICAhdGhpcy5fbm9kZU1vZHVsZXNEaXJlY3RvcnkgfHxcbiAgICAgICFyZXNvbHZlZEZpbGVOYW1lIHx8XG4gICAgICBtb2R1bGVOYW1lLnN0YXJ0c1dpdGgoJy4nKSB8fFxuICAgICAgdGhpcy5fcHJvY2Vzc2VkTW9kdWxlcy5oYXMocmVzb2x2ZWRGaWxlTmFtZSlcbiAgICApIHtcbiAgICAgIC8vIFNraXAgd2hlbiBtb2R1bGVfbW9kdWxlcyBkaXJlY3RvcnkgaXMgbm90IHByZXNlbnQsIG1vZHVsZSBpcyB1bmtub3duLCByZWxhdGl2ZSBvciB0aGVcbiAgICAgIC8vIE5HQ0MgY29tcGlsZXIgaXMgbm90IGZvdW5kIG9yIGFscmVhZHkgcHJvY2Vzc2VkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHRoaXMudHJ5UmVzb2x2ZVBhY2thZ2UobW9kdWxlTmFtZSwgcmVzb2x2ZWRGaWxlTmFtZSk7XG4gICAgLy8gSWYgdGhlIHBhY2thZ2UuanNvbiBpcyByZWFkIG9ubHkgd2Ugc2hvdWxkIHNraXAgY2FsbGluZyBOR0NDLlxuICAgIC8vIFdpdGggQmF6ZWwgd2hlbiBydW5uaW5nIHVuZGVyIHNhbmRib3ggdGhlIGZpbGVzeXN0ZW0gaXMgcmVhZC1vbmx5LlxuICAgIGlmICghcGFja2FnZUpzb25QYXRoIHx8IGlzUmVhZE9ubHlGaWxlKHBhY2thZ2VKc29uUGF0aCkpIHtcbiAgICAgIC8vIGFkZCBpdCB0byBwcm9jZXNzZWQgc28gdGhlIHNlY29uZCB0aW1lIHJvdW5kIHdlIHNraXAgdGhpcy5cbiAgICAgIHRoaXMuX3Byb2Nlc3NlZE1vZHVsZXMuYWRkKHJlc29sdmVkRmlsZU5hbWUpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGltZUxhYmVsID0gYE5nY2NQcm9jZXNzb3IucHJvY2Vzc01vZHVsZS5uZ2NjLnByb2Nlc3MrJHttb2R1bGVOYW1lfWA7XG4gICAgdGltZSh0aW1lTGFiZWwpO1xuICAgIHRoaXMuY29tcGlsZXJOZ2NjLnByb2Nlc3Moe1xuICAgICAgYmFzZVBhdGg6IHRoaXMuX25vZGVNb2R1bGVzRGlyZWN0b3J5LFxuICAgICAgdGFyZ2V0RW50cnlQb2ludFBhdGg6IHBhdGguZGlybmFtZShwYWNrYWdlSnNvblBhdGgpLFxuICAgICAgcHJvcGVydGllc1RvQ29uc2lkZXI6IHRoaXMucHJvcGVydGllc1RvQ29uc2lkZXIsXG4gICAgICBjb21waWxlQWxsRm9ybWF0czogZmFsc2UsXG4gICAgICBjcmVhdGVOZXdFbnRyeVBvaW50Rm9ybWF0czogdHJ1ZSxcbiAgICAgIGxvZ2dlcjogdGhpcy5fbG9nZ2VyLFxuICAgICAgdHNDb25maWdQYXRoOiB0aGlzLnRzQ29uZmlnUGF0aCxcbiAgICB9KTtcbiAgICB0aW1lRW5kKHRpbWVMYWJlbCk7XG5cbiAgICAvLyBQdXJnZSB0aGlzIGZpbGUgZnJvbSBjYWNoZSwgc2luY2UgTkdDQyBhZGQgbmV3IG1haW5GaWVsZHMuIEV4OiBtb2R1bGVfaXZ5X25nY2NcbiAgICAvLyB3aGljaCBhcmUgdW5rbm93biBpbiB0aGUgY2FjaGVkIGZpbGUuXG4gICAgdGhpcy5pbnB1dEZpbGVTeXN0ZW0ucHVyZ2U/LihwYWNrYWdlSnNvblBhdGgpO1xuXG4gICAgdGhpcy5fcHJvY2Vzc2VkTW9kdWxlcy5hZGQocmVzb2x2ZWRGaWxlTmFtZSk7XG4gIH1cblxuICBpbnZhbGlkYXRlKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9wcm9jZXNzZWRNb2R1bGVzLmRlbGV0ZShmaWxlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogVHJ5IHJlc29sdmUgYSBwYWNrYWdlLmpzb24gZmlsZSBmcm9tIHRoZSByZXNvbHZlZCAuZC50cyBmaWxlLlxuICAgKi9cbiAgcHJpdmF0ZSB0cnlSZXNvbHZlUGFja2FnZShtb2R1bGVOYW1lOiBzdHJpbmcsIHJlc29sdmVkRmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHRoaXMucmVzb2x2ZXIucmVzb2x2ZVN5bmMoXG4gICAgICAgIHt9LFxuICAgICAgICByZXNvbHZlZEZpbGVOYW1lLFxuICAgICAgICBgJHttb2R1bGVOYW1lfS9wYWNrYWdlLmpzb25gLFxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aCB8fCB1bmRlZmluZWQ7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBFeDogQGFuZ3VsYXIvY29tcGlsZXIvc3JjL2kxOG4vaTE4bl9hc3QvcGFja2FnZS5qc29uXG4gICAgICAvLyBvciBsb2NhbCBsaWJyYXJpZXMgd2hpY2ggZG9uJ3QgcmVzaWRlIGluIG5vZGVfbW9kdWxlc1xuICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGF0aC5yZXNvbHZlKHJlc29sdmVkRmlsZU5hbWUsICcuLi9wYWNrYWdlLmpzb24nKTtcblxuICAgICAgcmV0dXJuIGV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKSA/IHBhY2thZ2VKc29uUGF0aCA6IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmROb2RlTW9kdWxlc0RpcmVjdG9yeShzdGFydFBvaW50OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBsZXQgY3VycmVudCA9IHN0YXJ0UG9pbnQ7XG4gICAgd2hpbGUgKHBhdGguZGlybmFtZShjdXJyZW50KSAhPT0gY3VycmVudCkge1xuICAgICAgY29uc3Qgbm9kZVBhdGggPSBwYXRoLmpvaW4oY3VycmVudCwgJ25vZGVfbW9kdWxlcycpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMobm9kZVBhdGgpKSB7XG4gICAgICAgIHJldHVybiBub2RlUGF0aDtcbiAgICAgIH1cblxuICAgICAgY3VycmVudCA9IHBhdGguZGlybmFtZShjdXJyZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZmluZFBhY2thZ2VNYW5hZ2VyTG9ja0ZpbGUocHJvamVjdEJhc2VQYXRoOiBzdHJpbmcpOiB7XG4gICAgbG9ja0ZpbGVQYXRoOiBzdHJpbmc7XG4gICAgbG9ja0ZpbGVEYXRhOiBCdWZmZXI7XG4gIH0ge1xuICAgIGZvciAoY29uc3QgbG9ja0ZpbGUgb2YgWyd5YXJuLmxvY2snLCAncG5wbS1sb2NrLnlhbWwnLCAncGFja2FnZS1sb2NrLmpzb24nXSkge1xuICAgICAgY29uc3QgbG9ja0ZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RCYXNlUGF0aCwgbG9ja0ZpbGUpO1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2tGaWxlUGF0aCxcbiAgICAgICAgICBsb2NrRmlsZURhdGE6IHJlYWRGaWxlU3luYyhsb2NrRmlsZVBhdGgpLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCB7fVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGxvY2F0ZSBhIHBhY2thZ2UgbWFuYWdlciBsb2NrIGZpbGUuJyk7XG4gIH1cbn1cblxuY2xhc3MgTmdjY0xvZ2dlciBpbXBsZW1lbnRzIExvZ2dlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29tcGlsYXRpb25XYXJuaW5nczogKEVycm9yIHwgc3RyaW5nKVtdLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29tcGlsYXRpb25FcnJvcnM6IChFcnJvciB8IHN0cmluZylbXSxcbiAgICBwdWJsaWMgbGV2ZWw6IExvZ0xldmVsLFxuICApIHt9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1mdW5jdGlvblxuICBkZWJ1ZygpIHt9XG5cbiAgaW5mbyguLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIExvZyB0byBzdGRlcnIgYmVjYXVzZSBpdCdzIGEgcHJvZ3Jlc3MtbGlrZSBpbmZvIG1lc3NhZ2UuXG4gICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUoYFxcbiR7YXJncy5qb2luKCcgJyl9XFxuYCk7XG4gIH1cblxuICB3YXJuKC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5jb21waWxhdGlvbldhcm5pbmdzLnB1c2goYXJncy5qb2luKCcgJykpO1xuICB9XG5cbiAgZXJyb3IoLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmNvbXBpbGF0aW9uRXJyb3JzLnB1c2gobmV3IEVycm9yKGFyZ3Muam9pbignICcpKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNSZWFkT25seUZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIGFjY2Vzc1N5bmMoZmlsZU5hbWUsIGNvbnN0YW50cy5XX09LKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==
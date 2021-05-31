"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NgccProcessor = void 0;
const ngcc_1 = require("@angular/compiler-cli/ngcc");
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const enhanced_resolve_1 = require("enhanced-resolve");
const fs_1 = require("fs");
const path = require("path");
const benchmark_1 = require("./benchmark");
// We cannot create a plugin for this, because NGTSC requires addition type
// information which ngcc creates when processing a package which was compiled with NGC.
// Example of such errors:
// ERROR in node_modules/@angular/platform-browser/platform-browser.d.ts(42,22):
// error TS-996002: Appears in the NgModule.imports of AppModule,
// but could not be resolved to an NgModule class
// We now transform a package and it's typings when NGTSC is resolving a module.
class NgccProcessor {
    constructor(propertiesToConsider, compilationWarnings, compilationErrors, basePath, tsConfigPath, inputFileSystem, symlinks) {
        this.propertiesToConsider = propertiesToConsider;
        this.compilationWarnings = compilationWarnings;
        this.compilationErrors = compilationErrors;
        this.basePath = basePath;
        this.tsConfigPath = tsConfigPath;
        this.inputFileSystem = inputFileSystem;
        this.symlinks = symlinks;
        this._processedModules = new Set();
        this._logger = new NgccLogger(this.compilationWarnings, this.compilationErrors);
        this._nodeModulesDirectory = this.findNodeModulesDirectory(this.basePath);
        this._resolver = enhanced_resolve_1.ResolverFactory.createResolver({
            // NOTE: @types/webpack InputFileSystem is missing some methods
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fileSystem: this.inputFileSystem,
            extensions: ['.json'],
            useSyncFileSystemCalls: true,
            symlinks,
        });
    }
    /** Process the entire node modules tree. */
    process() {
        // Under Bazel when running in sandbox mode parts of the filesystem is read-only.
        if (process.env.BAZEL_TARGET) {
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
            let lockData;
            let lockFile = 'yarn.lock';
            try {
                lockData = fs_1.readFileSync(path.join(projectBasePath, lockFile));
            }
            catch {
                lockFile = 'package-lock.json';
                lockData = fs_1.readFileSync(path.join(projectBasePath, lockFile));
            }
            let ngccConfigData;
            try {
                ngccConfigData = fs_1.readFileSync(path.join(projectBasePath, 'ngcc.config.js'));
            }
            catch {
                ngccConfigData = '';
            }
            const relativeTsconfigPath = path.relative(projectBasePath, this.tsConfigPath);
            const tsconfigData = fs_1.readFileSync(this.tsConfigPath);
            // Generate a hash that represents the state of the package lock file and used tsconfig
            const runHash = crypto_1.createHash('sha256')
                .update(lockData)
                .update(lockFile)
                .update(ngccConfigData)
                .update(tsconfigData)
                .update(relativeTsconfigPath)
                .digest('hex');
            // The hash is used directly in the file name to mitigate potential read/write race
            // conditions as well as to only require a file existence check
            runHashFilePath = path.join(runHashBasePath, runHash + '.lock');
            // If the run hash lock file exists, then ngcc was already run against this project state
            if (fs_1.existsSync(runHashFilePath)) {
                skipProcessing = true;
            }
        }
        catch {
            // Any error means an ngcc execution is needed
        }
        if (skipProcessing) {
            return;
        }
        const timeLabel = 'NgccProcessor.process';
        benchmark_1.time(timeLabel);
        // We spawn instead of using the API because:
        // - NGCC Async uses clustering which is problematic when used via the API which means
        // that we cannot setup multiple cluster masters with different options.
        // - We will not be able to have concurrent builds otherwise Ex: App-Shell,
        // as NGCC will create a lock file for both builds and it will cause builds to fails.
        const { status, error } = child_process_1.spawnSync(process.execPath, [
            require.resolve('@angular/compiler-cli/ngcc/main-ngcc.js'),
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
        benchmark_1.timeEnd(timeLabel);
        // ngcc was successful so if a run hash was generated, write it for next time
        if (runHashFilePath) {
            try {
                if (!fs_1.existsSync(runHashBasePath)) {
                    fs_1.mkdirSync(runHashBasePath, { recursive: true });
                }
                fs_1.writeFileSync(runHashFilePath, '');
            }
            catch {
                // Errors are non-fatal
            }
        }
    }
    /** Process a module and it's depedencies. */
    processModule(moduleName, resolvedModule) {
        const resolvedFileName = resolvedModule.resolvedFileName;
        if (!resolvedFileName ||
            moduleName.startsWith('.') ||
            this._processedModules.has(resolvedFileName)) {
            // Skip when module is unknown, relative or NGCC compiler is not found or already processed.
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
        benchmark_1.time(timeLabel);
        ngcc_1.process({
            basePath: this._nodeModulesDirectory,
            targetEntryPointPath: path.dirname(packageJsonPath),
            propertiesToConsider: this.propertiesToConsider,
            compileAllFormats: false,
            createNewEntryPointFormats: true,
            logger: this._logger,
            tsConfigPath: this.tsConfigPath,
        });
        benchmark_1.timeEnd(timeLabel);
        // Purge this file from cache, since NGCC add new mainFields. Ex: module_ivy_ngcc
        // which are unknown in the cached file.
        if (this.inputFileSystem.purge) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.inputFileSystem.purge(packageJsonPath);
        }
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
            const resolvedPath = this._resolver.resolveSync({}, resolvedFileName, `${moduleName}/package.json`);
            return resolvedPath || undefined;
        }
        catch {
            // Ex: @angular/compiler/src/i18n/i18n_ast/package.json
            // or local libraries which don't reside in node_modules
            const packageJsonPath = path.resolve(resolvedFileName, '../package.json');
            return fs_1.existsSync(packageJsonPath) ? packageJsonPath : undefined;
        }
    }
    findNodeModulesDirectory(startPoint) {
        let current = startPoint;
        while (path.dirname(current) !== current) {
            const nodePath = path.join(current, 'node_modules');
            if (fs_1.existsSync(nodePath)) {
                return nodePath;
            }
            current = path.dirname(current);
        }
        throw new Error(`Cannot locate the 'node_modules' directory.`);
    }
}
exports.NgccProcessor = NgccProcessor;
class NgccLogger {
    constructor(compilationWarnings, compilationErrors) {
        this.compilationWarnings = compilationWarnings;
        this.compilationErrors = compilationErrors;
        this.level = ngcc_1.LogLevel.info;
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
        fs_1.accessSync(fileName, fs_1.constants.W_OK);
        return false;
    }
    catch {
        return true;
    }
}

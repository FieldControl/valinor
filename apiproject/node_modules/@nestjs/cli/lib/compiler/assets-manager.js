"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsManager = void 0;
const chokidar = require("chokidar");
const fs_1 = require("fs");
const glob_1 = require("glob");
const path_1 = require("path");
const copy_path_resolve_1 = require("./helpers/copy-path-resolve");
const get_value_or_default_1 = require("./helpers/get-value-or-default");
class AssetsManager {
    constructor() {
        this.watchAssetsKeyValue = {};
        this.watchers = [];
        this.actionInProgress = false;
    }
    /**
     * Using on `nest build` to close file watch or the build process will not end
     * Interval like process
     * If no action has been taken recently close watchers
     * If action has been taken recently flag and try again
     */
    closeWatchers() {
        // Consider adjusting this for larger files
        const timeoutMs = 500;
        const closeFn = () => {
            if (this.actionInProgress) {
                this.actionInProgress = false;
                setTimeout(closeFn, timeoutMs);
            }
            else {
                this.watchers.forEach((watcher) => watcher.close());
            }
        };
        setTimeout(closeFn, timeoutMs);
    }
    copyAssets(configuration, appName, outDir, watchAssetsMode) {
        const assets = (0, get_value_or_default_1.getValueOrDefault)(configuration, 'compilerOptions.assets', appName) || [];
        if (assets.length <= 0) {
            return;
        }
        try {
            let sourceRoot = (0, get_value_or_default_1.getValueOrDefault)(configuration, 'sourceRoot', appName);
            sourceRoot = (0, path_1.join)(process.cwd(), sourceRoot);
            const filesToCopy = assets.map((item) => {
                let includePath = typeof item === 'string' ? item : item.include;
                let excludePath = typeof item !== 'string' && item.exclude ? item.exclude : undefined;
                includePath = (0, path_1.join)(sourceRoot, includePath).replace(/\\/g, '/');
                excludePath = excludePath
                    ? (0, path_1.join)(sourceRoot, excludePath).replace(/\\/g, '/')
                    : undefined;
                return {
                    outDir: typeof item !== 'string' ? item.outDir || outDir : outDir,
                    glob: includePath,
                    exclude: excludePath,
                    flat: typeof item !== 'string' ? item.flat : undefined, // deprecated field
                    watchAssets: typeof item !== 'string' ? item.watchAssets : undefined,
                };
            });
            const isWatchEnabled = (0, get_value_or_default_1.getValueOrDefault)(configuration, 'compilerOptions.watchAssets', appName) || watchAssetsMode;
            for (const item of filesToCopy) {
                const option = {
                    action: 'change',
                    item,
                    path: '',
                    sourceRoot,
                    watchAssetsMode: isWatchEnabled,
                };
                if (isWatchEnabled || item.watchAssets) {
                    // prettier-ignore
                    const watcher = chokidar
                        .watch(item.glob, { ignored: item.exclude })
                        .on('add', (path) => this.actionOnFile({ ...option, path, action: 'change' }))
                        .on('change', (path) => this.actionOnFile({ ...option, path, action: 'change' }))
                        .on('unlink', (path) => this.actionOnFile({ ...option, path, action: 'unlink' }));
                    this.watchers.push(watcher);
                }
                else {
                    const matchedPaths = (0, glob_1.sync)(item.glob, {
                        ignore: item.exclude,
                        dot: true,
                    });
                    const files = item.glob.endsWith('*')
                        ? matchedPaths.filter((matched) => (0, fs_1.statSync)(matched).isFile())
                        : matchedPaths.flatMap((matched) => {
                            if ((0, fs_1.statSync)(matched).isDirectory()) {
                                return (0, glob_1.sync)(`${matched}/**/*`, {
                                    ignore: item.exclude,
                                }).filter((file) => (0, fs_1.statSync)(file).isFile());
                            }
                            return matched;
                        });
                    for (const path of files) {
                        this.actionOnFile({ ...option, path, action: 'change' });
                    }
                }
            }
        }
        catch (err) {
            throw new Error(`An error occurred during the assets copying process. ${err.message}`);
        }
    }
    actionOnFile(option) {
        const { action, item, path, sourceRoot, watchAssetsMode } = option;
        const isWatchEnabled = watchAssetsMode || item.watchAssets;
        const assetCheckKey = path + (item.outDir ?? '');
        // Allow to do action for the first time before check watchMode
        if (!isWatchEnabled && this.watchAssetsKeyValue[assetCheckKey]) {
            return;
        }
        // Set path value to true for watching the first time
        this.watchAssetsKeyValue[assetCheckKey] = true;
        // Set action to true to avoid watches getting cutoff
        this.actionInProgress = true;
        const dest = (0, copy_path_resolve_1.copyPathResolve)(path, item.outDir, sourceRoot.split(path_1.sep).length);
        // Copy to output dir if file is changed or added
        if (action === 'change') {
            (0, fs_1.mkdirSync)((0, path_1.dirname)(dest), { recursive: true });
            (0, fs_1.copyFileSync)(path, dest);
        }
        else if (action === 'unlink') {
            // Remove from output dir if file is deleted
            (0, fs_1.rmSync)(dest, { force: true });
        }
    }
}
exports.AssetsManager = AssetsManager;

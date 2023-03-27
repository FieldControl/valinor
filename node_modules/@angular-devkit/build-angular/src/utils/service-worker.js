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
exports.augmentAppWithServiceWorkerCore = exports.augmentAppWithServiceWorkerEsbuild = exports.augmentAppWithServiceWorker = void 0;
const crypto = __importStar(require("crypto"));
const fs_1 = require("fs");
const path = __importStar(require("path"));
const error_1 = require("./error");
const load_esm_1 = require("./load-esm");
class CliFilesystem {
    constructor(fs, base) {
        this.fs = fs;
        this.base = base;
    }
    list(dir) {
        return this._recursiveList(this._resolve(dir), []);
    }
    read(file) {
        return this.fs.readFile(this._resolve(file), 'utf-8');
    }
    async hash(file) {
        return crypto
            .createHash('sha1')
            .update(await this.fs.readFile(this._resolve(file)))
            .digest('hex');
    }
    write(_file, _content) {
        throw new Error('This should never happen.');
    }
    _resolve(file) {
        return path.join(this.base, file);
    }
    async _recursiveList(dir, items) {
        const subdirectories = [];
        for (const entry of await this.fs.readdir(dir)) {
            const entryPath = path.join(dir, entry);
            const stats = await this.fs.stat(entryPath);
            if (stats.isFile()) {
                // Uses posix paths since the service worker expects URLs
                items.push('/' + path.relative(this.base, entryPath).replace(/\\/g, '/'));
            }
            else if (stats.isDirectory()) {
                subdirectories.push(entryPath);
            }
        }
        for (const subdirectory of subdirectories) {
            await this._recursiveList(subdirectory, items);
        }
        return items;
    }
}
async function augmentAppWithServiceWorker(appRoot, workspaceRoot, outputPath, baseHref, ngswConfigPath, inputputFileSystem = fs_1.promises, outputFileSystem = fs_1.promises) {
    // Determine the configuration file path
    const configPath = ngswConfigPath
        ? path.join(workspaceRoot, ngswConfigPath)
        : path.join(appRoot, 'ngsw-config.json');
    // Read the configuration file
    let config;
    try {
        const configurationData = await inputputFileSystem.readFile(configPath, 'utf-8');
        config = JSON.parse(configurationData);
    }
    catch (error) {
        (0, error_1.assertIsError)(error);
        if (error.code === 'ENOENT') {
            throw new Error('Error: Expected to find an ngsw-config.json configuration file' +
                ` in the ${appRoot} folder. Either provide one or` +
                ' disable Service Worker in the angular.json configuration file.');
        }
        else {
            throw error;
        }
    }
    return augmentAppWithServiceWorkerCore(config, outputPath, baseHref, inputputFileSystem, outputFileSystem);
}
exports.augmentAppWithServiceWorker = augmentAppWithServiceWorker;
// This is currently used by the esbuild-based builder
async function augmentAppWithServiceWorkerEsbuild(workspaceRoot, configPath, outputPath, baseHref) {
    // Read the configuration file
    let config;
    try {
        const configurationData = await fs_1.promises.readFile(configPath, 'utf-8');
        config = JSON.parse(configurationData);
    }
    catch (error) {
        (0, error_1.assertIsError)(error);
        if (error.code === 'ENOENT') {
            // TODO: Generate an error object that can be consumed by the esbuild-based builder
            const message = `Service worker configuration file "${path.relative(workspaceRoot, configPath)}" could not be found.`;
            throw new Error(message);
        }
        else {
            throw error;
        }
    }
    // TODO: Return the output files and any errors/warnings
    return augmentAppWithServiceWorkerCore(config, outputPath, baseHref);
}
exports.augmentAppWithServiceWorkerEsbuild = augmentAppWithServiceWorkerEsbuild;
async function augmentAppWithServiceWorkerCore(config, outputPath, baseHref, inputputFileSystem = fs_1.promises, outputFileSystem = fs_1.promises) {
    // Load ESM `@angular/service-worker/config` using the TypeScript dynamic import workaround.
    // Once TypeScript provides support for keeping the dynamic import this workaround can be
    // changed to a direct dynamic import.
    const GeneratorConstructor = (await (0, load_esm_1.loadEsmModule)('@angular/service-worker/config')).Generator;
    // Generate the manifest
    const generator = new GeneratorConstructor(new CliFilesystem(outputFileSystem, outputPath), baseHref);
    const output = await generator.process(config);
    // Write the manifest
    const manifest = JSON.stringify(output, null, 2);
    await outputFileSystem.writeFile(path.join(outputPath, 'ngsw.json'), manifest);
    // Find the service worker package
    const workerPath = require.resolve('@angular/service-worker/ngsw-worker.js');
    const copy = async (src, dest) => {
        const resolvedDest = path.join(outputPath, dest);
        return inputputFileSystem === outputFileSystem
            ? // Native FS (Builder).
                inputputFileSystem.copyFile(src, resolvedDest, fs_1.constants.COPYFILE_FICLONE)
            : // memfs (Webpack): Read the file from the input FS (disk) and write it to the output FS (memory).
                outputFileSystem.writeFile(resolvedDest, await inputputFileSystem.readFile(src));
    };
    // Write the worker code
    await copy(workerPath, 'ngsw-worker.js');
    // If present, write the safety worker code
    try {
        const safetyPath = path.join(path.dirname(workerPath), 'safety-worker.js');
        await copy(safetyPath, 'worker-basic.min.js');
        await copy(safetyPath, 'safety-worker.js');
    }
    catch (error) {
        (0, error_1.assertIsError)(error);
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}
exports.augmentAppWithServiceWorkerCore = augmentAppWithServiceWorkerCore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS13b3JrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy91dGlscy9zZXJ2aWNlLXdvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdILCtDQUFpQztBQUNqQywyQkFBc0U7QUFDdEUsMkNBQTZCO0FBQzdCLG1DQUF3QztBQUN4Qyx5Q0FBMkM7QUFFM0MsTUFBTSxhQUFhO0lBQ2pCLFlBQW9CLEVBQXFCLEVBQVUsSUFBWTtRQUEzQyxPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7SUFBRyxDQUFDO0lBRW5FLElBQUksQ0FBQyxHQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELElBQUksQ0FBQyxJQUFZO1FBQ2YsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7UUFDckIsT0FBTyxNQUFNO2FBQ1YsVUFBVSxDQUFDLE1BQU0sQ0FBQzthQUNsQixNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBYSxFQUFFLFFBQWdCO1FBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMs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LEtBQUssUUFBUSxFQUFFO1lBQzNCLE1BQU0sS0FBSyxDQUFDO1NBQ2I7S0FDRjtBQUNILENBQUM7QUF0REQsMEVBc0RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB0eXBlIHsgQ29uZmlnLCBGaWxlc3lzdGVtIH0gZnJvbSAnQGFuZ3VsYXIvc2VydmljZS13b3JrZXIvY29uZmlnJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgY29uc3RhbnRzIGFzIGZzQ29uc3RhbnRzLCBwcm9taXNlcyBhcyBmc1Byb21pc2VzIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGFzc2VydElzRXJyb3IgfSBmcm9tICcuL2Vycm9yJztcbmltcG9ydCB7IGxvYWRFc21Nb2R1bGUgfSBmcm9tICcuL2xvYWQtZXNtJztcblxuY2xhc3MgQ2xpRmlsZXN5c3RlbSBpbXBsZW1lbnRzIEZpbGVzeXN0ZW0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZzOiB0eXBlb2YgZnNQcm9taXNlcywgcHJpdmF0ZSBiYXNlOiBzdHJpbmcpIHt9XG5cbiAgbGlzdChkaXI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVjdXJzaXZlTGlzdCh0aGlzLl9yZXNvbHZlKGRpciksIFtdKTtcbiAgfVxuXG4gIHJlYWQoZmlsZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5mcy5yZWFkRmlsZSh0aGlzLl9yZXNvbHZlKGZpbGUpLCAndXRmLTgnKTtcbiAgfVxuXG4gIGFzeW5jIGhhc2goZmlsZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gY3J5cHRvXG4gICAgICAuY3JlYXRlSGFzaCgnc2hhMScpXG4gICAgICAudXBkYXRlKGF3YWl0IHRoaXMuZnMucmVhZEZpbGUodGhpcy5fcmVzb2x2ZShmaWxlKSkpXG4gICAgICAuZGlnZXN0KCdoZXgnKTtcbiAgfVxuXG4gIHdyaXRlKF9maWxlOiBzdHJpbmcsIF9jb250ZW50OiBzdHJpbmcpOiBuZXZlciB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4uJyk7XG4gIH1cblxuICBwcml2YXRlIF9yZXNvbHZlKGZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLmJhc2UsIGZpbGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfcmVjdXJzaXZlTGlzdChkaXI6IHN0cmluZywgaXRlbXM6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IHN1YmRpcmVjdG9yaWVzID0gW107XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBhd2FpdCB0aGlzLmZzLnJlYWRkaXIoZGlyKSkge1xuICAgICAgY29uc3QgZW50cnlQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkpO1xuICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCB0aGlzLmZzLnN0YXQoZW50cnlQYXRoKTtcblxuICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIC8vIFVzZXMgcG9zaXggcGF0aHMgc2luY2UgdGhlIHNlcnZpY2Ugd29ya2VyIGV4cGVjdHMgVVJMc1xuICAgICAgICBpdGVtcy5wdXNoKCcvJyArIHBhdGgucmVsYXRpdmUodGhpcy5iYXNlLCBlbnRyeVBhdGgpLnJlcGxhY2UoL1xcXFwvZywgJy8nKSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgc3ViZGlyZWN0b3JpZXMucHVzaChlbnRyeVBhdGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qgc3ViZGlyZWN0b3J5IG9mIHN1YmRpcmVjdG9yaWVzKSB7XG4gICAgICBhd2FpdCB0aGlzLl9yZWN1cnNpdmVMaXN0KHN1YmRpcmVjdG9yeSwgaXRlbXMpO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXVnbWVudEFwcFdpdGhTZXJ2aWNlV29ya2VyKFxuICBhcHBSb290OiBzdHJpbmcsXG4gIHdvcmtzcGFjZVJvb3Q6IHN0cmluZyxcbiAgb3V0cHV0UGF0aDogc3RyaW5nLFxuICBiYXNlSHJlZjogc3RyaW5nLFxuICBuZ3N3Q29uZmlnUGF0aD86IHN0cmluZyxcbiAgaW5wdXRwdXRGaWxlU3lzdGVtID0gZnNQcm9taXNlcyxcbiAgb3V0cHV0RmlsZVN5c3RlbSA9IGZzUHJvbWlzZXMsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gRGV0ZXJtaW5lIHRoZSBjb25maWd1cmF0aW9uIGZpbGUgcGF0aFxuICBjb25zdCBjb25maWdQYXRoID0gbmdzd0NvbmZpZ1BhdGhcbiAgICA/IHBhdGguam9pbih3b3Jrc3BhY2VSb290LCBuZ3N3Q29uZmlnUGF0aClcbiAgICA6IHBhdGguam9pbihhcHBSb290LCAnbmdzdy1jb25maWcuanNvbicpO1xuXG4gIC8vIFJlYWQgdGhlIGNvbmZpZ3VyYXRpb24gZmlsZVxuICBsZXQgY29uZmlnOiBDb25maWcgfCB1bmRlZmluZWQ7XG4gIHRyeSB7XG4gICAgY29uc3QgY29uZmlndXJhdGlvbkRhdGEgPSBhd2FpdCBpbnB1dHB1dEZpbGVTeXN0ZW0ucmVhZEZpbGUoY29uZmlnUGF0aCwgJ3V0Zi04Jyk7XG4gICAgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWd1cmF0aW9uRGF0YSkgYXMgQ29uZmlnO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGFzc2VydElzRXJyb3IoZXJyb3IpO1xuICAgIGlmIChlcnJvci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnRXJyb3I6IEV4cGVjdGVkIHRvIGZpbmQgYW4gbmdzdy1jb25maWcuanNvbiBjb25maWd1cmF0aW9uIGZpbGUnICtcbiAgICAgICAgICBgIGluIHRoZSAke2FwcFJvb3R9IGZvbGRlci4gRWl0aGVyIHByb3ZpZGUgb25lIG9yYCArXG4gICAgICAgICAgJyBkaXNhYmxlIFNlcnZpY2UgV29ya2VyIGluIHRoZSBhbmd1bGFyLmpzb24gY29uZmlndXJhdGlvbiBmaWxlLicsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXVnbWVudEFwcFdpdGhTZXJ2aWNlV29ya2VyQ29yZShcbiAgICBjb25maWcsXG4gICAgb3V0cHV0UGF0aCxcbiAgICBiYXNlSHJlZixcbiAgICBpbnB1dHB1dEZpbGVTeXN0ZW0sXG4gICAgb3V0cHV0RmlsZVN5c3RlbSxcbiAgKTtcbn1cblxuLy8gVGhpcyBpcyBjdXJyZW50bHkgdXNlZCBieSB0aGUgZXNidWlsZC1iYXNlZCBidWlsZGVyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXVnbWVudEFwcFdpdGhTZXJ2aWNlV29ya2VyRXNidWlsZChcbiAgd29ya3NwYWNlUm9vdDogc3RyaW5nLFxuICBjb25maWdQYXRoOiBzdHJpbmcsXG4gIG91dHB1dFBhdGg6IHN0cmluZyxcbiAgYmFzZUhyZWY6IHN0cmluZyxcbik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBSZWFkIHRoZSBjb25maWd1cmF0aW9uIGZpbGVcbiAgbGV0IGNvbmZpZzogQ29uZmlnIHwgdW5kZWZpbmVkO1xuICB0cnkge1xuICAgIGNvbnN0IGNvbmZpZ3VyYXRpb25EYXRhID0gYXdhaXQgZnNQcm9taXNlcy5yZWFkRmlsZShjb25maWdQYXRoLCAndXRmLTgnKTtcbiAgICBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZ3VyYXRpb25EYXRhKSBhcyBDb25maWc7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXNzZXJ0SXNFcnJvcihlcnJvcik7XG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAvLyBUT0RPOiBHZW5lcmF0ZSBhbiBlcnJvciBvYmplY3QgdGhhdCBjYW4gYmUgY29uc3VtZWQgYnkgdGhlIGVzYnVpbGQtYmFzZWQgYnVpbGRlclxuICAgICAgY29uc3QgbWVzc2FnZSA9IGBTZXJ2aWNlIHdvcmtlciBjb25maWd1cmF0aW9uIGZpbGUgXCIke3BhdGgucmVsYXRpdmUoXG4gICAgICAgIHdvcmtzcGFjZVJvb3QsXG4gICAgICAgIGNvbmZpZ1BhdGgsXG4gICAgICApfVwiIGNvdWxkIG5vdCBiZSBmb3VuZC5gO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPOiBSZXR1cm4gdGhlIG91dHB1dCBmaWxlcyBhbmQgYW55IGVycm9ycy93YXJuaW5nc1xuICByZXR1cm4gYXVnbWVudEFwcFdpdGhTZXJ2aWNlV29ya2VyQ29yZShjb25maWcsIG91dHB1dFBhdGgsIGJhc2VIcmVmKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGF1Z21lbnRBcHBXaXRoU2VydmljZVdvcmtlckNvcmUoXG4gIGNvbmZpZzogQ29uZmlnLFxuICBvdXRwdXRQYXRoOiBzdHJpbmcsXG4gIGJhc2VIcmVmOiBzdHJpbmcsXG4gIGlucHV0cHV0RmlsZVN5c3RlbSA9IGZzUHJvbWlzZXMsXG4gIG91dHB1dEZpbGVTeXN0ZW0gPSBmc1Byb21pc2VzLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIExvYWQgRVNNIGBAYW5ndWxhci9zZXJ2aWNlLXdvcmtlci9jb25maWdgIHVzaW5nIHRoZSBUeXBlU2NyaXB0IGR5bmFtaWMgaW1wb3J0IHdvcmthcm91bmQuXG4gIC8vIE9uY2UgVHlwZVNjcmlwdCBwcm92aWRlcyBzdXBwb3J0IGZvciBrZWVwaW5nIHRoZSBkeW5hbWljIGltcG9ydCB0aGlzIHdvcmthcm91bmQgY2FuIGJlXG4gIC8vIGNoYW5nZWQgdG8gYSBkaXJlY3QgZHluYW1pYyBpbXBvcnQuXG4gIGNvbnN0IEdlbmVyYXRvckNvbnN0cnVjdG9yID0gKFxuICAgIGF3YWl0IGxvYWRFc21Nb2R1bGU8dHlwZW9mIGltcG9ydCgnQGFuZ3VsYXIvc2VydmljZS13b3JrZXIvY29uZmlnJyk+KFxuICAgICAgJ0Bhbmd1bGFyL3NlcnZpY2Utd29ya2VyL2NvbmZpZycsXG4gICAgKVxuICApLkdlbmVyYXRvcjtcblxuICAvLyBHZW5lcmF0ZSB0aGUgbWFuaWZlc3RcbiAgY29uc3QgZ2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvckNvbnN0cnVjdG9yKFxuICAgIG5ldyBDbGlGaWxlc3lzdGVtKG91dHB1dEZpbGVTeXN0ZW0sIG91dHB1dFBhdGgpLFxuICAgIGJhc2VIcmVmLFxuICApO1xuICBjb25zdCBvdXRwdXQgPSBhd2FpdCBnZW5lcmF0b3IucHJvY2Vzcyhjb25maWcpO1xuXG4gIC8vIFdyaXRlIHRoZSBtYW5pZmVzdFxuICBjb25zdCBtYW5pZmVzdCA9IEpTT04uc3RyaW5naWZ5KG91dHB1dCwgbnVsbCwgMik7XG4gIGF3YWl0IG91dHB1dEZpbGVTeXN0ZW0ud3JpdGVGaWxlKHBhdGguam9pbihvdXRwdXRQYXRoLCAnbmdzdy5qc29uJyksIG1hbmlmZXN0KTtcblxuICAvLyBGaW5kIHRoZSBzZXJ2aWNlIHdvcmtlciBwYWNrYWdlXG4gIGNvbnN0IHdvcmtlclBhdGggPSByZXF1aXJlLnJlc29sdmUoJ0Bhbmd1bGFyL3NlcnZpY2Utd29ya2VyL25nc3ctd29ya2VyLmpzJyk7XG5cbiAgY29uc3QgY29weSA9IGFzeW5jIChzcmM6IHN0cmluZywgZGVzdDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgcmVzb2x2ZWREZXN0ID0gcGF0aC5qb2luKG91dHB1dFBhdGgsIGRlc3QpO1xuXG4gICAgcmV0dXJuIGlucHV0cHV0RmlsZVN5c3RlbSA9PT0gb3V0cHV0RmlsZVN5c3RlbVxuICAgICAgPyAvLyBOYXRpdmUgRlMgKEJ1aWxkZXIpLlxuICAgICAgICBpbnB1dHB1dEZpbGVTeXN0ZW0uY29weUZpbGUoc3JjLCByZXNvbHZlZERlc3QsIGZzQ29uc3RhbnRzLkNPUFlGSUxFX0ZJQ0xPTkUpXG4gICAgICA6IC8vIG1lbWZzIChXZWJwYWNrKTogUmVhZCB0aGUgZmlsZSBmcm9tIHRoZSBpbnB1dCBGUyAoZGlzaykgYW5kIHdyaXRlIGl0IHRvIHRoZSBvdXRwdXQgRlMgKG1lbW9yeSkuXG4gICAgICAgIG91dHB1dEZpbGVTeXN0ZW0ud3JpdGVGaWxlKHJlc29sdmVkRGVzdCwgYXdhaXQgaW5wdXRwdXRGaWxlU3lzdGVtLnJlYWRGaWxlKHNyYykpO1xuICB9O1xuXG4gIC8vIFdyaXRlIHRoZSB3b3JrZXIgY29kZVxuICBhd2FpdCBjb3B5KHdvcmtlclBhdGgsICduZ3N3LXdvcmtlci5qcycpO1xuXG4gIC8vIElmIHByZXNlbnQsIHdyaXRlIHRoZSBzYWZldHkgd29ya2VyIGNvZGVcbiAgdHJ5IHtcbiAgICBjb25zdCBzYWZldHlQYXRoID0gcGF0aC5qb2luKHBhdGguZGlybmFtZSh3b3JrZXJQYXRoKSwgJ3NhZmV0eS13b3JrZXIuanMnKTtcbiAgICBhd2FpdCBjb3B5KHNhZmV0eVBhdGgsICd3b3JrZXItYmFzaWMubWluLmpzJyk7XG4gICAgYXdhaXQgY29weShzYWZldHlQYXRoLCAnc2FmZXR5LXdvcmtlci5qcycpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGFzc2VydElzRXJyb3IoZXJyb3IpO1xuICAgIGlmIChlcnJvci5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG59XG4iXX0=
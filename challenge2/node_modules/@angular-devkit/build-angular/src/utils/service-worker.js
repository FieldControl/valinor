"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.augmentAppWithServiceWorker = void 0;
const core_1 = require("@angular-devkit/core");
const crypto = require("crypto");
const fs_1 = require("fs");
const path = require("path");
const stream_1 = require("stream");
class CliFilesystem {
    constructor(base) {
        this.base = base;
    }
    list(dir) {
        return this._recursiveList(this._resolve(dir), []);
    }
    read(file) {
        return fs_1.promises.readFile(this._resolve(file), 'utf-8');
    }
    hash(file) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha1').setEncoding('hex');
            stream_1.pipeline(fs_1.createReadStream(this._resolve(file)), hash, (error) => error ? reject(error) : resolve(hash.read()));
        });
    }
    write(file, content) {
        return fs_1.promises.writeFile(this._resolve(file), content);
    }
    _resolve(file) {
        return path.join(this.base, file);
    }
    async _recursiveList(dir, items) {
        const subdirectories = [];
        for await (const entry of await fs_1.promises.opendir(dir)) {
            if (entry.isFile()) {
                // Uses posix paths since the service worker expects URLs
                items.push('/' + path.relative(this.base, path.join(dir, entry.name)).replace(/\\/g, '/'));
            }
            else if (entry.isDirectory()) {
                subdirectories.push(path.join(dir, entry.name));
            }
        }
        for (const subdirectory of subdirectories) {
            await this._recursiveList(subdirectory, items);
        }
        return items;
    }
}
async function augmentAppWithServiceWorker(projectRoot, appRoot, outputPath, baseHref, ngswConfigPath) {
    const distPath = core_1.getSystemPath(core_1.normalize(outputPath));
    const systemProjectRoot = core_1.getSystemPath(projectRoot);
    // Find the service worker package
    const workerPath = require.resolve('@angular/service-worker/ngsw-worker.js', {
        paths: [systemProjectRoot],
    });
    const swConfigPath = require.resolve('@angular/service-worker/config', {
        paths: [systemProjectRoot],
    });
    // Determine the configuration file path
    let configPath;
    if (ngswConfigPath) {
        configPath = core_1.getSystemPath(core_1.normalize(ngswConfigPath));
    }
    else {
        configPath = path.join(core_1.getSystemPath(appRoot), 'ngsw-config.json');
    }
    // Read the configuration file
    let config;
    try {
        const configurationData = await fs_1.promises.readFile(configPath, 'utf-8');
        config = JSON.parse(configurationData);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error('Error: Expected to find an ngsw-config.json configuration file' +
                ` in the ${core_1.getSystemPath(appRoot)} folder. Either provide one or` +
                ' disable Service Worker in the angular.json configuration file.');
        }
        else {
            throw error;
        }
    }
    // Generate the manifest
    const GeneratorConstructor = require(swConfigPath).Generator;
    const generator = new GeneratorConstructor(new CliFilesystem(distPath), baseHref);
    const output = await generator.process(config);
    // Write the manifest
    const manifest = JSON.stringify(output, null, 2);
    await fs_1.promises.writeFile(path.join(distPath, 'ngsw.json'), manifest);
    // Write the worker code
    await fs_1.promises.copyFile(workerPath, path.join(distPath, 'ngsw-worker.js'), fs_1.constants.COPYFILE_FICLONE);
    // If present, write the safety worker code
    const safetyPath = path.join(path.dirname(workerPath), 'safety-worker.js');
    try {
        await fs_1.promises.copyFile(safetyPath, path.join(distPath, 'worker-basic.min.js'), fs_1.constants.COPYFILE_FICLONE);
        await fs_1.promises.copyFile(safetyPath, path.join(distPath, 'safety-worker.js'), fs_1.constants.COPYFILE_FICLONE);
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}
exports.augmentAppWithServiceWorker = augmentAppWithServiceWorker;

"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeJsSyncHost = exports.NodeJsAsyncHost = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const src_1 = require("../src");
async function exists(path) {
    try {
        await fs_1.promises.access(path, fs_1.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
// This will only be initialized if the watch() method is called.
// Otherwise chokidar appears only in type positions, and shouldn't be referenced
// in the JavaScript output.
let FSWatcher;
function loadFSWatcher() {
    if (!FSWatcher) {
        try {
            // eslint-disable-next-line import/no-extraneous-dependencies
            FSWatcher = require('chokidar').FSWatcher;
        }
        catch (e) {
            if (e.code !== 'MODULE_NOT_FOUND') {
                throw new Error('As of angular-devkit version 8.0, the "chokidar" package ' +
                    'must be installed in order to use watch() features.');
            }
            throw e;
        }
    }
}
/**
 * An implementation of the Virtual FS using Node as the background. There are two versions; one
 * synchronous and one asynchronous.
 */
class NodeJsAsyncHost {
    get capabilities() {
        return { synchronous: false };
    }
    write(path, content) {
        return rxjs_1.from(fs_1.promises.mkdir(src_1.getSystemPath(src_1.dirname(path)), { recursive: true })).pipe(operators_1.mergeMap(() => fs_1.promises.writeFile(src_1.getSystemPath(path), new Uint8Array(content))));
    }
    read(path) {
        return rxjs_1.from(fs_1.promises.readFile(src_1.getSystemPath(path))).pipe(operators_1.map((buffer) => new Uint8Array(buffer).buffer));
    }
    delete(path) {
        return this.isDirectory(path).pipe(operators_1.mergeMap(async (isDirectory) => {
            if (isDirectory) {
                const recursiveDelete = async (dirPath) => {
                    for (const fragment of await fs_1.promises.readdir(dirPath)) {
                        const sysPath = path_1.join(dirPath, fragment);
                        const stats = await fs_1.promises.stat(sysPath);
                        if (stats.isDirectory()) {
                            await recursiveDelete(sysPath);
                            await fs_1.promises.rmdir(sysPath);
                        }
                        else {
                            await fs_1.promises.unlink(sysPath);
                        }
                    }
                };
                await recursiveDelete(src_1.getSystemPath(path));
            }
            else {
                await fs_1.promises.unlink(src_1.getSystemPath(path));
            }
        }));
    }
    rename(from, to) {
        return rxjs_1.from(fs_1.promises.rename(src_1.getSystemPath(from), src_1.getSystemPath(to)));
    }
    list(path) {
        return rxjs_1.from(fs_1.promises.readdir(src_1.getSystemPath(path))).pipe(operators_1.map((names) => names.map((name) => src_1.fragment(name))));
    }
    exists(path) {
        return rxjs_1.from(exists(src_1.getSystemPath(path)));
    }
    isDirectory(path) {
        return this.stat(path).pipe(operators_1.map((stat) => stat.isDirectory()));
    }
    isFile(path) {
        return this.stat(path).pipe(operators_1.map((stat) => stat.isFile()));
    }
    // Some hosts may not support stat.
    stat(path) {
        return rxjs_1.from(fs_1.promises.stat(src_1.getSystemPath(path)));
    }
    // Some hosts may not support watching.
    watch(path, _options) {
        return new rxjs_1.Observable((obs) => {
            loadFSWatcher();
            const watcher = new FSWatcher({ persistent: true }).add(src_1.getSystemPath(path));
            watcher
                .on('change', (path) => {
                obs.next({
                    path: src_1.normalize(path),
                    time: new Date(),
                    type: 0 /* Changed */,
                });
            })
                .on('add', (path) => {
                obs.next({
                    path: src_1.normalize(path),
                    time: new Date(),
                    type: 1 /* Created */,
                });
            })
                .on('unlink', (path) => {
                obs.next({
                    path: src_1.normalize(path),
                    time: new Date(),
                    type: 2 /* Deleted */,
                });
            });
            return () => watcher.close();
        }).pipe(operators_1.publish(), operators_1.refCount());
    }
}
exports.NodeJsAsyncHost = NodeJsAsyncHost;
/**
 * An implementation of the Virtual FS using Node as the backend, synchronously.
 */
class NodeJsSyncHost {
    get capabilities() {
        return { synchronous: true };
    }
    write(path, content) {
        return new rxjs_1.Observable((obs) => {
            fs_1.mkdirSync(src_1.getSystemPath(src_1.dirname(path)), { recursive: true });
            fs_1.writeFileSync(src_1.getSystemPath(path), new Uint8Array(content));
            obs.next();
            obs.complete();
        });
    }
    read(path) {
        return new rxjs_1.Observable((obs) => {
            const buffer = fs_1.readFileSync(src_1.getSystemPath(path));
            obs.next(new Uint8Array(buffer).buffer);
            obs.complete();
        });
    }
    delete(path) {
        return this.isDirectory(path).pipe(operators_1.concatMap((isDir) => {
            if (isDir) {
                const dirPaths = fs_1.readdirSync(src_1.getSystemPath(path));
                const rmDirComplete = new rxjs_1.Observable((obs) => {
                    fs_1.rmdirSync(src_1.getSystemPath(path));
                    obs.complete();
                });
                return rxjs_1.concat(...dirPaths.map((name) => this.delete(src_1.join(path, name))), rmDirComplete);
            }
            else {
                try {
                    fs_1.unlinkSync(src_1.getSystemPath(path));
                }
                catch (err) {
                    return rxjs_1.throwError(err);
                }
                return rxjs_1.of(undefined);
            }
        }));
    }
    rename(from, to) {
        return new rxjs_1.Observable((obs) => {
            const toSystemPath = src_1.getSystemPath(to);
            fs_1.mkdirSync(path_1.dirname(toSystemPath), { recursive: true });
            fs_1.renameSync(src_1.getSystemPath(from), toSystemPath);
            obs.next();
            obs.complete();
        });
    }
    list(path) {
        return new rxjs_1.Observable((obs) => {
            const names = fs_1.readdirSync(src_1.getSystemPath(path));
            obs.next(names.map((name) => src_1.fragment(name)));
            obs.complete();
        });
    }
    exists(path) {
        return new rxjs_1.Observable((obs) => {
            obs.next(fs_1.existsSync(src_1.getSystemPath(path)));
            obs.complete();
        });
    }
    isDirectory(path) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.stat(path).pipe(operators_1.map((stat) => stat.isDirectory()));
    }
    isFile(path) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.stat(path).pipe(operators_1.map((stat) => stat.isFile()));
    }
    // Some hosts may not support stat.
    stat(path) {
        return new rxjs_1.Observable((obs) => {
            obs.next(fs_1.statSync(src_1.getSystemPath(path)));
            obs.complete();
        });
    }
    // Some hosts may not support watching.
    watch(path, _options) {
        return new rxjs_1.Observable((obs) => {
            const opts = { persistent: false };
            loadFSWatcher();
            const watcher = new FSWatcher(opts).add(src_1.getSystemPath(path));
            watcher
                .on('change', (path) => {
                obs.next({
                    path: src_1.normalize(path),
                    time: new Date(),
                    type: 0 /* Changed */,
                });
            })
                .on('add', (path) => {
                obs.next({
                    path: src_1.normalize(path),
                    time: new Date(),
                    type: 1 /* Created */,
                });
            })
                .on('unlink', (path) => {
                obs.next({
                    path: src_1.normalize(path),
                    time: new Date(),
                    type: 2 /* Deleted */,
                });
            });
            return () => watcher.close();
        }).pipe(operators_1.publish(), operators_1.refCount());
    }
}
exports.NodeJsSyncHost = NodeJsSyncHost;

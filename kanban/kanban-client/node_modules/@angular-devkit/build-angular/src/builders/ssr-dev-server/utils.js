"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitUntilServerIsListening = exports.spawnAsObservable = exports.getAvailablePort = void 0;
const child_process_1 = require("child_process");
const net_1 = require("net");
const rxjs_1 = require("rxjs");
const tree_kill_1 = __importDefault(require("tree-kill"));
function getAvailablePort() {
    return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)();
        server
            .unref()
            .on('error', reject)
            .listen(0, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
    });
}
exports.getAvailablePort = getAvailablePort;
function spawnAsObservable(command, args = [], options = {}) {
    return new rxjs_1.Observable((obs) => {
        const proc = (0, child_process_1.spawn)(command, args, options);
        if (proc.stdout) {
            proc.stdout.on('data', (data) => obs.next({ stdout: data.toString() }));
        }
        if (proc.stderr) {
            proc.stderr.on('data', (data) => obs.next({ stderr: data.toString() }));
        }
        proc
            .on('error', (err) => obs.error(err))
            .on('close', (code) => {
            if (code !== 0) {
                obs.error(new Error(`${command} exited with ${code} code.`));
            }
            obs.complete();
        });
        return () => {
            if (!proc.killed && proc.pid) {
                (0, tree_kill_1.default)(proc.pid, 'SIGTERM');
            }
        };
    });
}
exports.spawnAsObservable = spawnAsObservable;
function waitUntilServerIsListening(port, host) {
    const allowedErrorCodes = ['ECONNREFUSED', 'ECONNRESET'];
    return new rxjs_1.Observable((obs) => {
        const client = (0, net_1.createConnection)({ host, port }, () => {
            obs.next(undefined);
            obs.complete();
        }).on('error', (err) => obs.error(err));
        return () => {
            if (!client.destroyed) {
                client.destroy();
            }
        };
    }).pipe((0, rxjs_1.retryWhen)((err) => err.pipe((0, rxjs_1.mergeMap)((error, attempts) => {
        return attempts > 10 || !allowedErrorCodes.includes(error.code)
            ? (0, rxjs_1.throwError)(error)
            : (0, rxjs_1.timer)(100 * (attempts * 1));
    }))));
}
exports.waitUntilServerIsListening = waitUntilServerIsListening;

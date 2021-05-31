"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPort = void 0;
const inquirer_1 = require("inquirer");
const net = require("net");
const tty_1 = require("./tty");
function createInUseError(port) {
    return new Error(`Port ${port} is already in use. Use '--port' to specify a different port.`);
}
async function checkPort(port, host) {
    if (port === 0) {
        return 0;
    }
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server
            .once('error', (err) => {
            if (err.code !== 'EADDRINUSE') {
                reject(err);
                return;
            }
            if (!tty_1.isTTY) {
                reject(createInUseError(port));
                return;
            }
            inquirer_1.prompt({
                type: 'confirm',
                name: 'useDifferent',
                message: `Port ${port} is already in use.\nWould you like to use a different port?`,
                default: true,
            }).then((answers) => (answers.useDifferent ? resolve(0) : reject(createInUseError(port))), () => reject(createInUseError(port)));
        })
            .once('listening', () => {
            server.close();
            resolve(port);
        })
            .listen(port, host);
    });
}
exports.checkPort = checkPort;

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
exports.checkPort = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const node_net_1 = require("node:net");
const load_esm_1 = require("./load-esm");
const tty_1 = require("./tty");
function createInUseError(port) {
    return new Error(`Port ${port} is already in use. Use '--port' to specify a different port.`);
}
async function checkPort(port, host) {
    // Disabled due to Vite not handling port 0 and instead always using the default value (5173)
    // TODO: Enable this again once Vite is fixed
    // if (port === 0) {
    //   return 0;
    // }
    return new Promise((resolve, reject) => {
        const server = (0, node_net_1.createServer)();
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
            (0, load_esm_1.loadEsmModule)('inquirer')
                .then(({ default: { prompt } }) => prompt({
                type: 'confirm',
                name: 'useDifferent',
                message: `Port ${port} is already in use.\nWould you like to use a different port?`,
                default: true,
            }))
                .then((answers) => answers.useDifferent ? resolve(checkPort(0, host)) : reject(createInUseError(port)), () => reject(createInUseError(port)));
        })
            .once('listening', () => {
            // Get the actual address from the listening server instance
            const address = server.address();
            (0, node_assert_1.default)(address && typeof address !== 'string', 'Port check server address should always be an object.');
            server.close();
            resolve(address.port);
        })
            .listen(port, host);
    });
}
exports.checkPort = checkPort;

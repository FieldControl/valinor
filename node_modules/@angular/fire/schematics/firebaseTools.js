"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseTools = void 0;
const child_process_1 = require("child_process");
const ora_1 = __importDefault(require("ora"));
const semver = __importStar(require("semver"));
const getFirebaseTools = () => globalThis.firebaseTools ?
    Promise.resolve(globalThis.firebaseTools) :
    new Promise((resolve, reject) => {
        try {
            resolve(require('firebase-tools'));
        }
        catch (e) {
            try {
                const root = child_process_1.execSync('npm root -g').toString().trim();
                resolve(require(`${root}/firebase-tools`));
            }
            catch (e) {
                const spinner = ora_1.default({
                    text: `Installing firebase-tools...`,
                    discardStdin: process.platform !== 'win32',
                }).start();
                child_process_1.spawn('npm', ['i', '-g', 'firebase-tools'], {
                    stdio: 'pipe',
                    shell: true,
                }).on('close', (code) => {
                    if (code === 0) {
                        spinner.succeed('firebase-tools installed globally.');
                        spinner.stop();
                        const root = child_process_1.execSync('npm root -g').toString().trim();
                        resolve(require(`${root}/firebase-tools`));
                    }
                    else {
                        spinner.fail('Package install failed.');
                        reject();
                    }
                });
            }
        }
    }).then(firebaseTools => {
        globalThis.firebaseTools = firebaseTools;
        const version = firebaseTools.cli.version();
        console.log(`Using firebase-tools version ${version}`);
        if (semver.compare(version, '9.9.0') === -1) {
            console.error('firebase-tools version 9.9+ is required, please upgrade and run again');
            return Promise.reject();
        }
        return firebaseTools;
    });
exports.getFirebaseTools = getFirebaseTools;

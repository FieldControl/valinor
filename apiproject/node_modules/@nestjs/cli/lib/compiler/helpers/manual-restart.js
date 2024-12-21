"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForManualRestart = listenForManualRestart;
exports.displayManualRestartTip = displayManualRestartTip;
const chalk = require("chalk");
function listenForManualRestart(callback) {
    const stdinListener = (data) => {
        if (data.toString().trim() === 'rs') {
            process.stdin.removeListener('data', stdinListener);
            callback();
        }
    };
    process.stdin.on('data', stdinListener);
}
function displayManualRestartTip() {
    console.log(`To restart at any time, enter ${chalk.gray('rs')}.\n`);
}

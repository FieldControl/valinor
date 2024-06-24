"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.askChoices = exports.askQuestion = exports.askConfirmation = void 0;
const load_esm_1 = require("./load-esm");
const tty_1 = require("./tty");
async function askConfirmation(message, defaultResponse, noTTYResponse) {
    if (!(0, tty_1.isTTY)()) {
        return noTTYResponse ?? defaultResponse;
    }
    const question = {
        type: 'confirm',
        name: 'confirmation',
        prefix: '',
        message,
        default: defaultResponse,
    };
    const { default: inquirer } = await (0, load_esm_1.loadEsmModule)('inquirer');
    const answers = await inquirer.prompt([question]);
    return answers['confirmation'];
}
exports.askConfirmation = askConfirmation;
async function askQuestion(message, choices, defaultResponseIndex, noTTYResponse) {
    if (!(0, tty_1.isTTY)()) {
        return noTTYResponse;
    }
    const question = {
        type: 'list',
        name: 'answer',
        prefix: '',
        message,
        choices,
        default: defaultResponseIndex,
    };
    const { default: inquirer } = await (0, load_esm_1.loadEsmModule)('inquirer');
    const answers = await inquirer.prompt([question]);
    return answers['answer'];
}
exports.askQuestion = askQuestion;
async function askChoices(message, choices, noTTYResponse) {
    if (!(0, tty_1.isTTY)()) {
        return noTTYResponse;
    }
    const question = {
        type: 'checkbox',
        name: 'answer',
        prefix: '',
        message,
        choices,
    };
    const { default: inquirer } = await (0, load_esm_1.loadEsmModule)('inquirer');
    const answers = await inquirer.prompt([question]);
    return answers['answer'];
}
exports.askChoices = askChoices;

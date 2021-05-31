"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = exports.removeColor = void 0;
const ansiColors = require("ansi-colors");
const tty_1 = require("tty");
const supportsColor = process.stdout instanceof tty_1.WriteStream && process.stdout.getColorDepth() > 1;
function removeColor(text) {
    // This has been created because when colors.enabled is false unstyle doesn't work
    // see: https://github.com/doowb/ansi-colors/blob/a4794363369d7b4d1872d248fc43a12761640d8e/index.js#L38
    return text.replace(ansiColors.ansiRegex, '');
}
exports.removeColor = removeColor;
// Create a separate instance to prevent unintended global changes to the color configuration
// Create function is not defined in the typings. See: https://github.com/doowb/ansi-colors/pull/44
const colors = ansiColors.create();
exports.colors = colors;
colors.enabled = supportsColor;

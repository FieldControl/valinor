"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_1 = require("@angular-devkit/schematics/tasks"); // eslint-disable-line import/no-extraneous-dependencies
const path = require("path");
function default_1(options) {
    return (_, context) => {
        context.addTask(new tasks_1.TslintFixTask({
            rulesDirectory: path.join(__dirname, 'rules'),
            rules: {
                'custom-rule': [true, options.shouldPass],
            },
        }, {
            includes: '*.ts',
            silent: false,
        }));
    };
}
exports.default = default_1;

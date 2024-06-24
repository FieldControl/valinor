"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const architect_command_module_1 = require("../../command-builder/architect-command-module");
class ExtractI18nCommandModule extends architect_command_module_1.ArchitectCommandModule {
    multiTarget = false;
    command = 'extract-i18n [project]';
    describe = 'Extracts i18n messages from source code.';
    longDescriptionPath;
}
exports.default = ExtractI18nCommandModule;

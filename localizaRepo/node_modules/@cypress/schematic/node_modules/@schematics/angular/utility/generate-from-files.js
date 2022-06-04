"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFromFiles = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const lint_fix_1 = require("./lint-fix");
const parse_name_1 = require("./parse-name");
const workspace_1 = require("./workspace");
function generateFromFiles(options, extraTemplateValues = {}) {
    return async (host) => {
        var _a, _b, _c;
        (_a = options.path) !== null && _a !== void 0 ? _a : (options.path = await workspace_1.createDefaultPath(host, options.project));
        (_b = options.prefix) !== null && _b !== void 0 ? _b : (options.prefix = '');
        (_c = options.flat) !== null && _c !== void 0 ? _c : (options.flat = true);
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.skipTests ? schematics_1.filter((path) => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
            schematics_1.applyTemplates({
                ...core_1.strings,
                ...options,
                ...extraTemplateValues,
            }),
            schematics_1.move(parsedPath.path + (options.flat ? '' : '/' + core_1.strings.dasherize(options.name))),
        ]);
        return schematics_1.chain([
            schematics_1.mergeWith(templateSource),
            options.lintFix ? lint_fix_1.applyLintFix(options.path) : schematics_1.noop(),
        ]);
    };
}
exports.generateFromFiles = generateFromFiles;

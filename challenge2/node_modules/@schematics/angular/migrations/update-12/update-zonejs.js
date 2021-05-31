"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const dependencies_1 = require("../../utility/dependencies");
const fileExtensionRegexp = /\.(([cm]?j|t)sx?)$/;
function* visitJavaScriptFiles(directory) {
    for (const path of directory.subfiles) {
        if (!fileExtensionRegexp.test(path)) {
            continue;
        }
        yield core_1.join(directory.path, path);
    }
    for (const path of directory.subdirs) {
        if (path === 'node_modules' || path.startsWith('.') || path === 'dist') {
            continue;
        }
        yield* visitJavaScriptFiles(directory.dir(path));
    }
}
function default_1() {
    return (tree, context) => {
        const current = dependencies_1.getPackageJsonDependency(tree, 'zone.js');
        if (current && current.version !== '~0.11.4') {
            dependencies_1.addPackageJsonDependency(tree, {
                type: current.type,
                name: 'zone.js',
                version: '~0.11.4',
                overwrite: true,
            });
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
        for (const path of visitJavaScriptFiles(tree.root)) {
            const buffer = tree.read(path);
            if (!buffer) {
                return;
            }
            const content = buffer.toString();
            if (!content.includes('zone.js/dist/')) {
                continue;
            }
            // RegExp that replaces
            // - import 'zone.js/dist/zone-testing' -> import 'zone.js/testing'
            // - require('zone.js/dist/zone-testing') -> require('zone.js/testing')
            // - import 'zone.js/dist/zone' -> import 'zone.js'
            // - require('zone.js/dist/zone') -> require('zone.js')
            // - import 'zone.js/dist/zone-error' -> import 'zone.js/plugins/zone-error'
            // - require('zone.js/dist/zone-error') -> require('zone.js/plugins/zone-error')
            tree.overwrite(path, content.replace(/(?<=(?:require\s*\(|import\s+)['"]zone\.js)\/dist\/zone-?\w*(?=['"]\)?)/g, (match) => {
                switch (match) {
                    case '/dist/zone':
                    case '/dist/zone-evergreen':
                        return '';
                    case '/dist/zone-testing':
                    case '/dist/zone-evergreen-testing':
                        return '/testing';
                    case '/dist/zone-node':
                        return '/node';
                    case '/dist/zone-mix':
                        return '/mix';
                    default:
                        return `/plugins${match.substr(5)}`;
                }
            }));
        }
    };
}
exports.default = default_1;

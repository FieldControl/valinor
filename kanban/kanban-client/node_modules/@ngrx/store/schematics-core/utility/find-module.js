"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRelativePath = exports.findModule = exports.findModuleFromOptions = void 0;
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var core_1 = require("@angular-devkit/core");
/**
 * Find the module referred by a set of options passed to the schematics.
 */
function findModuleFromOptions(host, options) {
    if (options.hasOwnProperty('skipImport') && options.skipImport) {
        return undefined;
    }
    if (!options.module) {
        var pathToCheck = (options.path || '') +
            (options.flat ? '' : '/' + core_1.strings.dasherize(options.name));
        return (0, core_1.normalize)(findModule(host, pathToCheck));
    }
    else {
        var modulePath = (0, core_1.normalize)('/' + options.path + '/' + options.module);
        var moduleBaseName = (0, core_1.normalize)(modulePath).split('/').pop();
        if (host.exists(modulePath)) {
            return (0, core_1.normalize)(modulePath);
        }
        else if (host.exists(modulePath + '.ts')) {
            return (0, core_1.normalize)(modulePath + '.ts');
        }
        else if (host.exists(modulePath + '.module.ts')) {
            return (0, core_1.normalize)(modulePath + '.module.ts');
        }
        else if (host.exists(modulePath + '/' + moduleBaseName + '.module.ts')) {
            return (0, core_1.normalize)(modulePath + '/' + moduleBaseName + '.module.ts');
        }
        else {
            throw new Error("Specified module path ".concat(modulePath, " does not exist"));
        }
    }
}
exports.findModuleFromOptions = findModuleFromOptions;
/**
 * Function to find the "closest" module to a generated file's path.
 */
function findModule(host, generateDir) {
    var dir = host.getDir('/' + generateDir);
    var moduleRe = /\.module\.ts$/;
    var routingModuleRe = /-routing\.module\.ts/;
    while (dir) {
        var matches = dir.subfiles.filter(function (p) { return moduleRe.test(p) && !routingModuleRe.test(p); });
        if (matches.length == 1) {
            return (0, core_1.join)(dir.path, matches[0]);
        }
        else if (matches.length > 1) {
            throw new Error('More than one module matches. Use skip-import option to skip importing ' +
                'the component into the closest module.');
        }
        dir = dir.parent;
    }
    throw new Error('Could not find an NgModule. Use the skip-import ' +
        'option to skip importing in NgModule.');
}
exports.findModule = findModule;
/**
 * Build a relative path from one file path to another file path.
 */
function buildRelativePath(from, to) {
    var _a = parsePath(from), fromPath = _a.path, fromFileName = _a.filename, fromDirectory = _a.directory;
    var _b = parsePath(to), toPath = _b.path, toFileName = _b.filename, toDirectory = _b.directory;
    var relativePath = (0, core_1.relative)(fromDirectory, toDirectory);
    var fixedRelativePath = relativePath.startsWith('.')
        ? relativePath
        : "./".concat(relativePath);
    return !toFileName || toFileName === 'index.ts'
        ? fixedRelativePath
        : "".concat(fixedRelativePath.endsWith('/')
            ? fixedRelativePath
            : fixedRelativePath + '/').concat(convertToTypeScriptFileName(toFileName));
}
exports.buildRelativePath = buildRelativePath;
function parsePath(path) {
    var pathNormalized = (0, core_1.normalize)(path);
    var filename = (0, core_1.extname)(pathNormalized) ? (0, core_1.basename)(pathNormalized) : '';
    var directory = filename ? (0, core_1.dirname)(pathNormalized) : pathNormalized;
    return {
        path: pathNormalized,
        filename: filename,
        directory: directory,
    };
}
/**
 * Strips the typescript extension and clears index filenames
 * foo.ts -> foo
 * index.ts -> empty
 */
function convertToTypeScriptFileName(filename) {
    return filename ? filename.replace(/(\.ts)|(index\.ts)$/, '') : '';
}
//# sourceMappingURL=find-module.js.map
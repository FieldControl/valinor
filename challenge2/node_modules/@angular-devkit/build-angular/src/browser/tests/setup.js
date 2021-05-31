"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_OPTIONS = exports.BROWSER_BUILDER_INFO = exports.describeBuilder = void 0;
var testing_1 = require("../../testing");
Object.defineProperty(exports, "describeBuilder", { enumerable: true, get: function () { return testing_1.describeBuilder; } });
exports.BROWSER_BUILDER_INFO = Object.freeze({
    name: '@angular-devkit/build-angular:browser',
    schemaPath: __dirname + '/../schema.json',
});
/**
 * Contains all required browser builder fields.
 * Also disables progress reporting to minimize logging output.
 */
exports.BASE_OPTIONS = Object.freeze({
    index: 'src/index.html',
    main: 'src/main.ts',
    outputPath: 'dist',
    tsConfig: 'src/tsconfig.app.json',
    progress: false,
    // Disable optimizations
    optimization: false,
    buildOptimizer: false,
});

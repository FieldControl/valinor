"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBrowserTarget = exports.BUILD_TIMEOUT = exports.BASE_OPTIONS = exports.DEV_SERVER_BUILDER_INFO = exports.describeBuilder = void 0;
const fs_1 = require("fs");
const browser_1 = require("../../browser");
const setup_1 = require("../../browser/tests/setup");
var testing_1 = require("../../testing");
Object.defineProperty(exports, "describeBuilder", { enumerable: true, get: function () { return testing_1.describeBuilder; } });
exports.DEV_SERVER_BUILDER_INFO = Object.freeze({
    name: '@angular-devkit/build-angular:dev-server',
    schemaPath: __dirname + '/../schema.json',
});
/**
 * Contains all required dev-server builder fields.
 * The port is also set to zero to ensure a free port is used for each test which
 * supports parallel test execution.
 */
exports.BASE_OPTIONS = Object.freeze({
    browserTarget: 'test:build',
    port: 0,
});
/**
 * Maximum time for single build/rebuild
 * This accounts for CI variability.
 */
exports.BUILD_TIMEOUT = 15000;
/**
 * Cached browser builder option schema
 */
let browserSchema = undefined;
/**
 * Adds a `build` target to a builder test harness for the browser builder with the base options
 * used by the browser builder tests.
 *
 * @param harness The builder harness to use when setting up the browser builder target
 * @param extraOptions The additional options that should be used when executing the target.
 */
function setupBrowserTarget(harness, extraOptions) {
    if (!browserSchema) {
        browserSchema = JSON.parse(fs_1.readFileSync(setup_1.BROWSER_BUILDER_INFO.schemaPath, 'utf8'));
    }
    harness.withBuilderTarget('build', browser_1.buildWebpackBrowser, {
        ...setup_1.BASE_OPTIONS,
        ...extraOptions,
    }, {
        builderName: setup_1.BROWSER_BUILDER_INFO.name,
        optionSchema: browserSchema,
    });
}
exports.setupBrowserTarget = setupBrowserTarget;

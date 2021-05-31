"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectFile = exports.describeBuilder = void 0;
const fs_1 = require("fs");
const test_utils_1 = require("../test-utils");
const builder_harness_1 = require("./builder-harness");
const optionSchemaCache = new Map();
function describeBuilder(builderHandler, options, specDefinitions) {
    let optionSchema = optionSchemaCache.get(options.schemaPath);
    if (optionSchema === undefined) {
        optionSchema = JSON.parse(fs_1.readFileSync(options.schemaPath, 'utf8'));
        optionSchemaCache.set(options.schemaPath, optionSchema);
    }
    const harness = new JasmineBuilderHarness(builderHandler, test_utils_1.host, {
        builderName: options.name,
        optionSchema,
    });
    describe(options.name || builderHandler.name, () => {
        beforeEach(() => test_utils_1.host.initialize().toPromise());
        afterEach(() => test_utils_1.host.restore().toPromise());
        specDefinitions(harness);
    });
}
exports.describeBuilder = describeBuilder;
class JasmineBuilderHarness extends builder_harness_1.BuilderHarness {
    expectFile(path) {
        return expectFile(path, this);
    }
}
/**
 * Add a Jasmine expectation filter to an expectation that always fails with a message.
 * @param base The base expectation (`expect(...)`) to use.
 * @param message The message to provide in the expectation failure.
 */
function createFailureExpectation(base, message) {
    // Needed typings are not included in the Jasmine types
    const expectation = base;
    expectation.expector = expectation.expector.addFilter({
        selectComparisonFunc() {
            return () => ({
                pass: false,
                message,
            });
        },
    });
    return expectation;
}
function expectFile(path, harness) {
    return {
        toExist() {
            const exists = harness.hasFile(path);
            expect(exists).toBe(true, 'Expected file to exist: ' + path);
            return exists;
        },
        toNotExist() {
            const exists = harness.hasFile(path);
            expect(exists).toBe(false, 'Expected file to not exist: ' + path);
            return !exists;
        },
        get content() {
            try {
                return expect(harness.readFile(path)).withContext(`With file content for '${path}'`);
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
                // File does not exist so always fail the expectation
                return createFailureExpectation(expect(''), `Expected file content but file does not exist: '${path}'`);
            }
        },
        get size() {
            try {
                return expect(Buffer.byteLength(harness.readFile(path))).withContext(`With file size for '${path}'`);
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
                // File does not exist so always fail the expectation
                return createFailureExpectation(expect(0), `Expected file size but file does not exist: '${path}'`);
            }
        },
    };
}
exports.expectFile = expectFile;

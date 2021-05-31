"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOnceAndFetch = void 0;
const node_fetch_1 = require("node-fetch"); // eslint-disable-line import/no-extraneous-dependencies
const operators_1 = require("rxjs/operators");
const url_1 = require("url");
async function executeOnceAndFetch(harness, url, options) {
    return harness
        .execute()
        .pipe(operators_1.timeout(30000), operators_1.mergeMap(async (executionResult) => {
        var _a;
        let response = undefined;
        if ((_a = executionResult.result) === null || _a === void 0 ? void 0 : _a.success) {
            const resolvedUrl = new url_1.URL(url, `${executionResult.result.baseUrl}/`);
            response = await node_fetch_1.default(resolvedUrl, options === null || options === void 0 ? void 0 : options.request);
        }
        return { ...executionResult, response };
    }), operators_1.take(1))
        .toPromise();
}
exports.executeOnceAndFetch = executeOnceAndFetch;

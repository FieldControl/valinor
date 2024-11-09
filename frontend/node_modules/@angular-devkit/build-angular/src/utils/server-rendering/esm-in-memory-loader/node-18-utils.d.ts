/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Call the initialize hook when running on Node.js 18 */
export declare function callInitializeIfNeeded(initialize: (typeof import('./loader-hooks'))['initialize']): void;
export declare function getESMLoaderArgs(): string[];

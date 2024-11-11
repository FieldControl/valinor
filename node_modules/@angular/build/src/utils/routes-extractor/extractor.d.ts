/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef, Type } from '@angular/core';
interface RouterResult {
    route: string;
    success: boolean;
    redirect: boolean;
}
export declare function extractRoutes(bootstrapAppFnOrModule: (() => Promise<ApplicationRef>) | Type<unknown>, document: string): AsyncIterableIterator<RouterResult>;
export {};

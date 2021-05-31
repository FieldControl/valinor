/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="jasmine" />
import { BuilderHandlerFn } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { BuilderHarness } from './builder-harness';
export declare function describeBuilder<T>(builderHandler: BuilderHandlerFn<T & json.JsonObject>, options: {
    name?: string;
    schemaPath: string;
}, specDefinitions: (harness: JasmineBuilderHarness<T>) => void): void;
declare class JasmineBuilderHarness<T> extends BuilderHarness<T> {
    expectFile(path: string): HarnessFileMatchers;
}
export interface HarnessFileMatchers {
    toExist(): boolean;
    toNotExist(): boolean;
    readonly content: jasmine.ArrayLikeMatchers<string>;
    readonly size: jasmine.Matchers<number>;
}
export declare function expectFile<T>(path: string, harness: BuilderHarness<T>): HarnessFileMatchers;
export {};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { Plugin } from 'vite';
/**
 * The base module location used to search for locale specific data.
 */
export declare const LOCALE_DATA_BASE_MODULE = "@angular/common/locales/global";
/**
 * Creates a Vite plugin that resolves Angular locale data files from `@angular/common`.
 *
 * @returns A Vite plugin.
 */
export declare function createAngularLocaleDataPlugin(): Plugin;

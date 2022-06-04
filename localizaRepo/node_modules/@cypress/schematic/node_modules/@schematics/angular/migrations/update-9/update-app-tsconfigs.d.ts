/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Rule } from '@angular-devkit/schematics';
/**
 * Update the tsconfig files for applications
 * - Removes enableIvy: true
 * - Sets stricter file inclusions
 * - Sets module compiler option to esnext or commonjs
 */
export declare function updateApplicationTsConfigs(): Rule;

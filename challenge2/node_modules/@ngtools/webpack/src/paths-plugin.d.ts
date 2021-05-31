/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilerOptions } from 'typescript';
export interface TypeScriptPathsPluginOptions extends Pick<CompilerOptions, 'paths' | 'baseUrl'> {
}
export declare class TypeScriptPathsPlugin {
    private options?;
    constructor(options?: TypeScriptPathsPluginOptions | undefined);
    update(options: TypeScriptPathsPluginOptions): void;
    apply(resolver: any): void;
}

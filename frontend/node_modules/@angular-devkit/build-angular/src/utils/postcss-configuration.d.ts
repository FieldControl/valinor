/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface PostcssConfiguration {
    plugins: [name: string, options?: object | string][];
}
export declare function loadPostcssConfiguration(workspaceRoot: string, projectRoot: string): Promise<PostcssConfiguration | undefined>;

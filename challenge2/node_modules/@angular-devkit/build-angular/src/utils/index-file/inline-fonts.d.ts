/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface InlineFontsOptions {
    minify?: boolean;
    WOFFSupportNeeded: boolean;
}
export declare class InlineFontsProcessor {
    private options;
    constructor(options: InlineFontsOptions);
    process(content: string): Promise<string>;
    private getResponse;
    private processHrefs;
}

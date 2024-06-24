/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OutputFile } from 'esbuild';
import { BundleStylesheetOptions } from '../stylesheets/bundle-options';
/**
 * Bundles component stylesheets. A stylesheet can be either an inline stylesheet that
 * is contained within the Component's metadata definition or an external file referenced
 * from the Component's metadata definition.
 */
export declare class ComponentStylesheetBundler {
    #private;
    private readonly options;
    private readonly incremental;
    /**
     *
     * @param options An object containing the stylesheet bundling options.
     * @param cache A load result cache to use when bundling.
     */
    constructor(options: BundleStylesheetOptions, incremental: boolean);
    bundleFile(entry: string): Promise<{
        errors: import("esbuild").Message[] | undefined;
        warnings: import("esbuild").Message[];
        contents: string;
        outputFiles: OutputFile[];
        metafile: import("esbuild").Metafile | undefined;
        referencedFiles: Set<string> | undefined;
    }>;
    bundleInline(data: string, filename: string, language: string): Promise<{
        errors: import("esbuild").Message[] | undefined;
        warnings: import("esbuild").Message[];
        contents: string;
        outputFiles: OutputFile[];
        metafile: import("esbuild").Metafile | undefined;
        referencedFiles: Set<string> | undefined;
    }>;
    invalidate(files: Iterable<string>): void;
    dispose(): Promise<void>;
    private extractResult;
}

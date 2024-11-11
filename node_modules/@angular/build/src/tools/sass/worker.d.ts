/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MessagePort } from 'node:worker_threads';
import { SourceSpan, StringOptions } from 'sass';
import type { SerializableWarningMessage } from './sass-service';
/**
 * A request to render a Sass stylesheet using the supplied options.
 */
interface RenderRequestMessage {
    /**
     * The contents to compile.
     */
    source: string;
    /**
     * The Sass options to provide to the `dart-sass` compile function.
     */
    options: Omit<StringOptions<'sync'>, 'url'> & {
        url: string;
    };
    /**
     * Indicates the request has a custom importer function on the main thread.
     */
    importerChannel?: {
        port: MessagePort;
        signal: Int32Array;
    };
    /**
     * Indicates the request has a custom logger for warning messages.
     */
    hasLogger: boolean;
    /**
     * Indicates paths within url() CSS functions should be rebased.
     */
    rebase: boolean;
}
export default function renderSassStylesheet(request: RenderRequestMessage): Promise<{
    warnings: SerializableWarningMessage[] | undefined;
    result: {
        loadedUrls: string[];
        css: string;
        sourceMap?: import("source-map-js").RawSourceMap;
    };
    error?: undefined;
} | {
    warnings: SerializableWarningMessage[] | undefined;
    error: {
        span: Omit<SourceSpan, "url"> & {
            url?: string;
        };
        message: string;
        stack: string | undefined;
        sassMessage: string;
        sassStack: string;
    };
    result?: undefined;
} | {
    warnings: SerializableWarningMessage[] | undefined;
    error: {
        message: string;
        stack: string | undefined;
        span?: undefined;
        sassMessage?: undefined;
        sassStack?: undefined;
    };
    result?: undefined;
} | {
    warnings: SerializableWarningMessage[] | undefined;
    error: {
        message: string;
        span?: undefined;
        stack?: undefined;
        sassMessage?: undefined;
        sassStack?: undefined;
    };
    result?: undefined;
}>;
export {};

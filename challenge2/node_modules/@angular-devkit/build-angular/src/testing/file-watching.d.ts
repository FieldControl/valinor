/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuilderWatcherCallback, BuilderWatcherFactory } from '../webpack/plugins/builder-watch-plugin';
export declare class WatcherNotifier implements BuilderWatcherFactory {
    private readonly descriptors;
    notify(events: Iterable<{
        path: string;
        type: 'modified' | 'deleted';
    }>): void;
    watch(files: Iterable<string>, directories: Iterable<string>, callback: BuilderWatcherCallback): {
        close(): void;
    };
}
export { BuilderWatcherFactory };

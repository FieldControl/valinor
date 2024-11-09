/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare class FileReferenceTracker {
    #private;
    get referencedFiles(): IterableIterator<string>;
    add(containingFile: string, referencedFiles: Iterable<string>): void;
    /**
     *
     * @param changed The set of changed files.
     */
    update(changed: Set<string>): Set<string>;
}

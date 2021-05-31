/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system" />
import { AbsoluteFsPath, FileStats, FileSystem, PathSegment, PathString } from '../../src/types';
/**
 * An in-memory file system that can be used in unit tests.
 */
export declare abstract class MockFileSystem implements FileSystem {
    private _isCaseSensitive;
    private _fileTree;
    private _cwd;
    constructor(_isCaseSensitive?: boolean, cwd?: AbsoluteFsPath);
    isCaseSensitive(): boolean;
    exists(path: AbsoluteFsPath): boolean;
    readFile(path: AbsoluteFsPath): string;
    readFileBuffer(path: AbsoluteFsPath): Uint8Array;
    writeFile(path: AbsoluteFsPath, data: string | Uint8Array, exclusive?: boolean): void;
    removeFile(path: AbsoluteFsPath): void;
    symlink(target: AbsoluteFsPath, path: AbsoluteFsPath): void;
    readdir(path: AbsoluteFsPath): PathSegment[];
    lstat(path: AbsoluteFsPath): FileStats;
    stat(path: AbsoluteFsPath): FileStats;
    copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
    moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
    ensureDir(path: AbsoluteFsPath): Folder;
    removeDeep(path: AbsoluteFsPath): void;
    isRoot(path: AbsoluteFsPath): boolean;
    extname(path: AbsoluteFsPath | PathSegment): string;
    realpath(filePath: AbsoluteFsPath): AbsoluteFsPath;
    pwd(): AbsoluteFsPath;
    chdir(path: AbsoluteFsPath): void;
    getDefaultLibLocation(): AbsoluteFsPath;
    abstract resolve(...paths: string[]): AbsoluteFsPath;
    abstract dirname<T extends string>(file: T): T;
    abstract join<T extends string>(basePath: T, ...paths: string[]): T;
    abstract relative<T extends PathString>(from: T, to: T): PathSegment | AbsoluteFsPath;
    abstract basename(filePath: string, extension?: string): PathSegment;
    abstract isRooted(path: string): boolean;
    abstract normalize<T extends PathString>(path: T): T;
    protected abstract splitPath<T extends PathString>(path: T): string[];
    dump(): Folder;
    init(folder: Folder): void;
    mount(path: AbsoluteFsPath, folder: Folder): void;
    private cloneFolder;
    private copyInto;
    protected findFromPath(path: AbsoluteFsPath, options?: {
        followSymLinks: boolean;
    }): FindResult;
    protected splitIntoFolderAndFile(path: AbsoluteFsPath): [AbsoluteFsPath, string];
    protected getCanonicalPath<T extends string>(p: T): T;
}
export interface FindResult {
    path: AbsoluteFsPath;
    entity: Entity | null;
}
export declare type Entity = Folder | File | SymLink;
export interface Folder {
    [pathSegments: string]: Entity;
}
export declare type File = string | Uint8Array;
export declare class SymLink {
    path: AbsoluteFsPath;
    constructor(path: AbsoluteFsPath);
}
export declare function isFile(item: Entity | null): item is File;
export declare function isSymLink(item: Entity | null): item is SymLink;
export declare function isFolder(item: Entity | null): item is Folder;

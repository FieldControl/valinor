/// <amd-module name="@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native" />
import { AbsoluteFsPath, PathSegment, PathString } from '../../src/types';
import { MockFileSystem } from './mock_file_system';
export declare class MockFileSystemNative extends MockFileSystem {
    constructor(cwd?: AbsoluteFsPath);
    resolve(...paths: string[]): AbsoluteFsPath;
    dirname<T extends string>(file: T): T;
    join<T extends string>(basePath: T, ...paths: string[]): T;
    relative<T extends PathString>(from: T, to: T): PathSegment | AbsoluteFsPath;
    basename(filePath: string, extension?: string): PathSegment;
    isCaseSensitive(): boolean;
    isRooted(path: string): boolean;
    isRoot(path: AbsoluteFsPath): boolean;
    normalize<T extends PathString>(path: T): T;
    protected splitPath<T>(path: string): string[];
}

/// <amd-module name="@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows" />
import { AbsoluteFsPath, PathSegment, PathString } from '../../src/types';
import { MockFileSystem } from './mock_file_system';
export declare class MockFileSystemWindows extends MockFileSystem {
    resolve(...paths: string[]): AbsoluteFsPath;
    dirname<T extends string>(path: T): T;
    join<T extends string>(basePath: T, ...paths: string[]): T;
    relative<T extends PathString>(from: T, to: T): PathSegment | AbsoluteFsPath;
    basename(filePath: string, extension?: string): PathSegment;
    isRooted(path: string): boolean;
    protected splitPath<T extends PathString>(path: T): string[];
    normalize<T extends PathString>(path: T): T;
}

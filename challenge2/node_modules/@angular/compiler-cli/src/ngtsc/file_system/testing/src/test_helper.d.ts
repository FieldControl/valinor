/// <amd-module name="@angular/compiler-cli/src/ngtsc/file_system/testing/src/test_helper" />
import { AbsoluteFsPath } from '../../src/types';
import { MockFileSystem } from './mock_file_system';
export interface TestFile {
    name: AbsoluteFsPath;
    contents: string;
    isRoot?: boolean | undefined;
}
export interface RunInEachFileSystemFn {
    (callback: (os: string) => void): void;
    windows(callback: (os: string) => void): void;
    unix(callback: (os: string) => void): void;
    native(callback: (os: string) => void): void;
    osX(callback: (os: string) => void): void;
}
export declare const runInEachFileSystem: RunInEachFileSystemFn;
export declare function initMockFileSystem(os: string, cwd?: AbsoluteFsPath): MockFileSystem;

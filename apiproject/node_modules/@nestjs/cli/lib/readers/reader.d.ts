export declare class ReaderFileLackPermissionsError extends Error {
    readonly filePath: string;
    readonly fsErrorCode: string;
    constructor(filePath: string, fsErrorCode: string);
}
export interface Reader {
    list(): string[];
    read(name: string): string;
    readAnyOf(filenames: string[]): string | undefined | ReaderFileLackPermissionsError;
}

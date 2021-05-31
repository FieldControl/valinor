/// <reference types="node" />
import { WebpackChunkModule } from './WebpackChunkModule';
declare class WebpackModuleFileIterator {
    private requireResolve;
    constructor(requireResolve: RequireResolve);
    iterateFiles(chunkModule: WebpackChunkModule, callback: (filename: string | null | undefined) => void): void;
    private internalCallback;
    getActualFilename(filename: string | null | undefined): string | null;
}
export { WebpackModuleFileIterator };

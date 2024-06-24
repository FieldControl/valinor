/// <reference types="node" />
export interface FetcherRequestInit {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Buffer;
    signal?: any;
}
export interface FetcherResponse {
    readonly bodyUsed: boolean;
    readonly url: string;
    readonly redirected: boolean;
    readonly status: number;
    readonly ok: boolean;
    readonly statusText: string;
    readonly headers: FetcherHeaders;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json(): Promise<any>;
    clone(): FetcherResponse;
}
export interface FetcherHeaders extends Iterable<[string, string]> {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    entries(): Iterator<[string, string]>;
    keys(): Iterator<string>;
    values(): Iterator<string>;
    [Symbol.iterator](): Iterator<[string, string]>;
}
export type Fetcher = (url: string, init?: FetcherRequestInit) => Promise<FetcherResponse>;
//# sourceMappingURL=index.d.ts.map
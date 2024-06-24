import type { HeaderMap } from '../utils/HeaderMap.js';
export interface HTTPGraphQLRequest {
    method: string;
    headers: HeaderMap;
    search: string;
    body: unknown;
}
export interface HTTPGraphQLHead {
    status?: number;
    headers: HeaderMap;
}
export type HTTPGraphQLResponseBody = {
    kind: 'complete';
    string: string;
} | {
    kind: 'chunked';
    asyncIterator: AsyncIterableIterator<string>;
};
export type HTTPGraphQLResponse = HTTPGraphQLHead & {
    body: HTTPGraphQLResponseBody;
};
//# sourceMappingURL=http.d.ts.map
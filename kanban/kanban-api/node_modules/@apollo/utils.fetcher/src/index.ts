export interface FetcherRequestInit {
  method?: string;
  // We explicitly do not allow you to pass in a Headers (or FetcherHeaders)
  // object here, because not all implementations recognize "foreign" Headers
  // objects.
  headers?: Record<string, string>;
  body?: string | Buffer;

  // A provided `signal` should be an object created by a class named
  // `AbortSignal` (the constructor name is checked by some implementations like
  // node-fetch and make-fetch-happen!) which follows the DOM AbortSignal API.
  // Notably, it should have `aborted: boolean` and methods `addEventListener`
  // and `removeEventListener`. We do not provide a precise interface for it
  // because we have found that runtime implementations are more consistent than
  // TypeScript definitions; for example, the methods such as addEventListener
  // end up being defined in terms of complex DOM types which vary by
  // implementation.
  //
  // Note that a relatively recent addition to the spec
  // (https://github.com/whatwg/dom/pull/1027) is the concept of an abort
  // reason. None of the polyfill Node AbortController/AbortSignal
  // implementations seems to support this yet (though Node's built-in
  // implementation does as of v18). It is possible that some Fetch
  // implementations might rely on the existence of this new functionality, say
  // by calling signal.throwIfAborted(). If so, you would need to use an
  // AbortSignal that supports this (such as the Node v18 implementation). As of
  // now, it does not appear that node-fetch, make-fetch-happen, or undici rely
  // on throwIfAborted, although undici does look at signal.reason if it is
  // provided.
  //
  // The main motivation for providing this as `any` (rather than, say, an
  // interface where the functions take `any` arguments to avoid linking in DOM)
  // is because if we leave out the newer `reason`/`throwIfAborted` fields, then
  // implementations like undici that use the Node v18 definitions won't
  // typecheck, but if we include those fields, then `AbortSignal`s from
  // `AbortController` polyfill libraries such as `node-abort-controller` won't
  // typecheck because they don't provide those fields. While in a sense that's
  // correct, we don't want to provide an interface for which there are no
  // existing implementations for Node v16 or older! (We may later choose to
  // publish our own polyfill and make this type more exact.)
  signal?: any;

  // We explicitly do not support non-portable options like `node-fetch`'s
  // `agent`.
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

export type Fetcher = (
  url: string,
  // We explicitly do not allow you to pass in a Request object here, because
  // not all implementations recognize "foreign" Request objects.
  init?: FetcherRequestInit,
) => Promise<FetcherResponse>;

/// <reference types="node" />
import type { Options, RequestHandler, NextFunction } from './types';
import type * as http from 'http';
export declare function createProxyMiddleware<TReq = http.IncomingMessage, TRes = http.ServerResponse, TNext = NextFunction>(options: Options<TReq, TRes>): RequestHandler<TReq, TRes, TNext>;
export * from './handlers';
export type { Filter, Options, RequestHandler } from './types';
/**
 * Default plugins
 */
export * from './plugins/default';
/**
 * Legacy exports
 */
export * from './legacy';

import { ExceptionsHandler } from '../exceptions/exceptions-handler';
export type RouterProxyCallback = <TRequest, TResponse>(req: TRequest, res: TResponse, next: () => void) => void | Promise<void>;
export declare class RouterProxy {
    createProxy(targetCallback: RouterProxyCallback, exceptionsHandler: ExceptionsHandler): <TRequest, TResponse>(req: TRequest, res: TResponse, next: () => void) => Promise<TResponse | undefined>;
    createExceptionLayerProxy(targetCallback: <TError, TRequest, TResponse>(err: TError, req: TRequest, res: TResponse, next: () => void) => void | Promise<void>, exceptionsHandler: ExceptionsHandler): <TError, TRequest, TResponse>(err: TError, req: TRequest, res: TResponse, next: () => void) => Promise<TResponse | undefined>;
}

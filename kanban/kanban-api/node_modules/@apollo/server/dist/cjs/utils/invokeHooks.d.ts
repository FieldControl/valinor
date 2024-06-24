type AsyncDidEndHook<TArgs extends any[]> = (...args: TArgs) => Promise<void>;
type SyncDidEndHook<TArgs extends any[]> = (...args: TArgs) => void;
export declare function invokeDidStartHook<T, TEndHookArgs extends unknown[]>(targets: T[], hook: (t: T) => Promise<AsyncDidEndHook<TEndHookArgs> | undefined | void>): Promise<AsyncDidEndHook<TEndHookArgs>>;
export declare function invokeSyncDidStartHook<T, TEndHookArgs extends unknown[]>(targets: T[], hook: (t: T) => SyncDidEndHook<TEndHookArgs> | undefined | void): SyncDidEndHook<TEndHookArgs>;
export declare function invokeHooksUntilDefinedAndNonNull<T, TOut>(targets: T[], hook: (t: T) => Promise<TOut | null | undefined>): Promise<TOut | null>;
export {};
//# sourceMappingURL=invokeHooks.d.ts.map
export declare const MapImpl: WeakMapConstructor;
export declare const SetImpl: WeakSetConstructor;
/** @internal */
export declare const disableWarningsSlot: {
    readonly id: string;
    hasValue(): boolean;
    getValue(): boolean | undefined;
    withValue<TResult, TArgs extends any[], TThis = any>(value: boolean, callback: (this: TThis, ...args: TArgs) => TResult, args?: TArgs | undefined, thisArg?: TThis | undefined): TResult;
};
export declare function warnOnImproperCacheImplementation(): void;
//# sourceMappingURL=utils.d.ts.map
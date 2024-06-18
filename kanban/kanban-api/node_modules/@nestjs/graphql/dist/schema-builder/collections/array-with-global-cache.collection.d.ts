export declare class ArrayWithGlobalCacheCollection<T> {
    private globalArray;
    private readonly internalArray;
    constructor(globalArray: Array<T>);
    getAll(): T[];
    push(...items: T[]): number;
    unshift(...items: T[]): number;
    reverse(): T[];
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
}
//# sourceMappingURL=array-with-global-cache.collection.d.ts.map
export declare class MetadataByNameCollection<T> {
    protected internalCollection: Map<string, T>;
    protected all: (T extends any[] ? T[number] : T)[];
    getAll(): (T extends any[] ? T[number] : T)[];
    getByName(name: string): T;
    add(value: T extends any[] ? T[number] : T, name: string): void;
    unshift(value: T extends any[] ? T[number] : T, name: string): void;
}
//# sourceMappingURL=metadata-by-name.collection.d.ts.map
export declare class MetadataLoader {
    private static readonly refreshHooks;
    static addRefreshHook(hook: () => void): number;
    load(metadata: Record<string, any>): Promise<void>;
    private runHooks;
    private applyMetadata;
}
//# sourceMappingURL=metadata-loader.d.ts.map
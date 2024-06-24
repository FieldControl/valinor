export interface PluginOptions {
    typeFileNameSuffix?: string | string[];
    introspectComments?: boolean;
    readonly?: boolean;
    pathToSource?: string;
    debug?: boolean;
}
export declare const mergePluginOptions: (options?: Record<string, any>) => PluginOptions;
//# sourceMappingURL=merge-options.d.ts.map
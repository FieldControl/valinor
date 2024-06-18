export interface ExtensionsMetadata {
    target: Function;
    value: Record<string, unknown>;
}
export type ClassExtensionsMetadata = ExtensionsMetadata;
export interface PropertyExtensionsMetadata extends ExtensionsMetadata {
    fieldName: string;
}
//# sourceMappingURL=extensions.metadata.d.ts.map
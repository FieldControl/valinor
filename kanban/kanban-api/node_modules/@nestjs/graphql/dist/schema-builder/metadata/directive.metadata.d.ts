export interface DirectiveMetadata {
    sdl: string;
    target: Function;
}
export type ClassDirectiveMetadata = DirectiveMetadata;
export interface PropertyDirectiveMetadata extends DirectiveMetadata {
    fieldName: string;
}
//# sourceMappingURL=directive.metadata.d.ts.map
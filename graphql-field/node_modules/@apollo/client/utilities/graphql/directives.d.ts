import type { SelectionNode, DirectiveNode, DocumentNode, ArgumentNode, ASTNode, FragmentSpreadNode } from "graphql";
export type DirectiveInfo = {
    [fieldName: string]: {
        [argName: string]: any;
    };
};
export declare function shouldInclude({ directives }: SelectionNode, variables?: Record<string, any>): boolean;
export declare function getDirectiveNames(root: ASTNode): string[];
export declare const hasAnyDirectives: (names: string[], root: ASTNode) => boolean;
export declare const hasAllDirectives: (names: string[], root: ASTNode) => boolean;
export declare function hasDirectives(names: string[], root: ASTNode, all?: boolean): boolean;
export declare function hasClientExports(document: DocumentNode): boolean;
export type InclusionDirectives = Array<{
    directive: DirectiveNode;
    ifArgument: ArgumentNode;
}>;
export declare function getInclusionDirectives(directives: ReadonlyArray<DirectiveNode>): InclusionDirectives;
/** @internal */
export declare function getFragmentMaskMode(fragment: FragmentSpreadNode): "mask" | "migrate" | "unmask";
//# sourceMappingURL=directives.d.ts.map
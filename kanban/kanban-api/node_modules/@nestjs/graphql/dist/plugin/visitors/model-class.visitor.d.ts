import * as ts from 'typescript';
import { PluginOptions } from '../merge-options';
type ClassMetadata = Record<string, ts.ObjectLiteralExpression>;
export declare class ModelClassVisitor {
    private importsToAdd;
    private readonly _typeImports;
    private readonly _collectedMetadata;
    get typeImports(): Record<string, string>;
    get collectedMetadata(): Array<[
        ts.CallExpression,
        Record<string, ClassMetadata>
    ]>;
    visit(sourceFile: ts.SourceFile, ctx: ts.TransformationContext, program: ts.Program, pluginOptions: PluginOptions): ts.Node;
    private addDescriptionToClassDecorators;
    private amendFieldsDecorators;
    private collectMetadataFromClassMembers;
    private updateClassDeclaration;
    private getOptionsFromFieldDecoratorOrUndefined;
    private getTypeFromFieldDecoratorOrUndefined;
    private createFieldMetadata;
    private getTypeUsingTypeChecker;
    private createEagerImports;
    private normalizeImportPath;
}
export {};
//# sourceMappingURL=model-class.visitor.d.ts.map
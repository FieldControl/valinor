import * as ts from 'typescript';
import { PluginOptions } from '../merge-options';
export declare class ReadonlyVisitor {
    private readonly options;
    readonly key = "@nestjs/graphql";
    private readonly modelClassVisitor;
    get typeImports(): Record<string, string>;
    constructor(options: PluginOptions);
    visit(program: ts.Program, sf: ts.SourceFile): ts.Node;
    collect(): {
        models: [ts.CallExpression, Record<string, {
            [x: string]: ts.ObjectLiteralExpression;
        }>][];
    };
}
//# sourceMappingURL=readonly.visitor.d.ts.map
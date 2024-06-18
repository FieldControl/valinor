import * as ts from 'typescript';
import { PluginOptions } from '../merge-options';
export declare function typeReferenceToIdentifier(typeReferenceDescriptor: {
    typeName: string;
    isArray?: boolean;
    arrayDepth?: number;
}, hostFilename: string, options: PluginOptions, factory: ts.NodeFactory, type: ts.Type, typeImports: Record<string, string>, importsToAdd: Set<string>): ts.Identifier;
//# sourceMappingURL=type-reference-to-identifier.util.d.ts.map
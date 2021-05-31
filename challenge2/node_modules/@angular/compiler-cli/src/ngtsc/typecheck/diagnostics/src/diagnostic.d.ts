/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/typecheck/diagnostics/src/diagnostic" />
import { ParseSourceSpan } from '@angular/compiler';
import * as ts from 'typescript';
import { TemplateId, TemplateSourceMapping } from '../../api';
/**
 * A `ts.Diagnostic` with additional information about the diagnostic related to template
 * type-checking.
 */
export interface TemplateDiagnostic extends ts.Diagnostic {
    /**
     * The component with the template that resulted in this diagnostic.
     */
    componentFile: ts.SourceFile;
    /**
     * The template id of the component that resulted in this diagnostic.
     */
    templateId: TemplateId;
}
/**
 * Constructs a `ts.Diagnostic` for a given `ParseSourceSpan` within a template.
 */
export declare function makeTemplateDiagnostic(templateId: TemplateId, mapping: TemplateSourceMapping, span: ParseSourceSpan, category: ts.DiagnosticCategory, code: number, messageText: string | ts.DiagnosticMessageChain, relatedMessage?: {
    text: string;
    span: ParseSourceSpan;
}): TemplateDiagnostic;
export declare function isTemplateDiagnostic(diagnostic: ts.Diagnostic): diagnostic is TemplateDiagnostic;

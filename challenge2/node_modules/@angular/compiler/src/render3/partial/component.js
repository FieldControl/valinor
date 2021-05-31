(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/partial/component", ["require", "exports", "tslib", "@angular/compiler/src/core", "@angular/compiler/src/ml_parser/interpolation_config", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/parse_util", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/view/compiler", "@angular/compiler/src/render3/view/util", "@angular/compiler/src/render3/partial/directive", "@angular/compiler/src/render3/partial/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createComponentDefinitionMap = exports.compileDeclareComponentFromMetadata = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var core = require("@angular/compiler/src/core");
    var interpolation_config_1 = require("@angular/compiler/src/ml_parser/interpolation_config");
    var o = require("@angular/compiler/src/output/output_ast");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var compiler_1 = require("@angular/compiler/src/render3/view/compiler");
    var util_1 = require("@angular/compiler/src/render3/view/util");
    var directive_1 = require("@angular/compiler/src/render3/partial/directive");
    var util_2 = require("@angular/compiler/src/render3/partial/util");
    /**
     * Compile a component declaration defined by the `R3ComponentMetadata`.
     */
    function compileDeclareComponentFromMetadata(meta, template, additionalTemplateInfo) {
        var definitionMap = createComponentDefinitionMap(meta, template, additionalTemplateInfo);
        var expression = o.importExpr(r3_identifiers_1.Identifiers.declareComponent).callFn([definitionMap.toLiteralMap()]);
        var type = compiler_1.createComponentType(meta);
        return { expression: expression, type: type, statements: [] };
    }
    exports.compileDeclareComponentFromMetadata = compileDeclareComponentFromMetadata;
    /**
     * Gathers the declaration fields for a component into a `DefinitionMap`.
     */
    function createComponentDefinitionMap(meta, template, templateInfo) {
        var definitionMap = directive_1.createDirectiveDefinitionMap(meta);
        definitionMap.set('template', getTemplateExpression(template, templateInfo));
        if (templateInfo.isInline) {
            definitionMap.set('isInline', o.literal(true));
        }
        definitionMap.set('styles', util_2.toOptionalLiteralArray(meta.styles, o.literal));
        definitionMap.set('components', compileUsedDirectiveMetadata(meta, function (directive) { return directive.isComponent === true; }));
        definitionMap.set('directives', compileUsedDirectiveMetadata(meta, function (directive) { return directive.isComponent !== true; }));
        definitionMap.set('pipes', compileUsedPipeMetadata(meta));
        definitionMap.set('viewProviders', meta.viewProviders);
        definitionMap.set('animations', meta.animations);
        if (meta.changeDetection !== undefined) {
            definitionMap.set('changeDetection', o.importExpr(r3_identifiers_1.Identifiers.ChangeDetectionStrategy)
                .prop(core.ChangeDetectionStrategy[meta.changeDetection]));
        }
        if (meta.encapsulation !== core.ViewEncapsulation.Emulated) {
            definitionMap.set('encapsulation', o.importExpr(r3_identifiers_1.Identifiers.ViewEncapsulation).prop(core.ViewEncapsulation[meta.encapsulation]));
        }
        if (meta.interpolation !== interpolation_config_1.DEFAULT_INTERPOLATION_CONFIG) {
            definitionMap.set('interpolation', o.literalArr([o.literal(meta.interpolation.start), o.literal(meta.interpolation.end)]));
        }
        if (template.preserveWhitespaces === true) {
            definitionMap.set('preserveWhitespaces', o.literal(true));
        }
        return definitionMap;
    }
    exports.createComponentDefinitionMap = createComponentDefinitionMap;
    function getTemplateExpression(template, templateInfo) {
        // If the template has been defined using a direct literal, we use that expression directly
        // without any modifications. This is ensures proper source mapping from the partially
        // compiled code to the source file declaring the template. Note that this does not capture
        // template literals referenced indirectly through an identifier.
        if (templateInfo.inlineTemplateLiteralExpression !== null) {
            return templateInfo.inlineTemplateLiteralExpression;
        }
        // If the template is defined inline but not through a literal, the template has been resolved
        // through static interpretation. We create a literal but cannot provide any source span. Note
        // that we cannot use the expression defining the template because the linker expects the template
        // to be defined as a literal in the declaration.
        if (templateInfo.isInline) {
            return o.literal(templateInfo.content, null, null);
        }
        // The template is external so we must synthesize an expression node with
        // the appropriate source-span.
        var contents = templateInfo.content;
        var file = new parse_util_1.ParseSourceFile(contents, templateInfo.sourceUrl);
        var start = new parse_util_1.ParseLocation(file, 0, 0, 0);
        var end = computeEndLocation(file, contents);
        var span = new parse_util_1.ParseSourceSpan(start, end);
        return o.literal(contents, null, span);
    }
    function computeEndLocation(file, contents) {
        var length = contents.length;
        var lineStart = 0;
        var lastLineStart = 0;
        var line = 0;
        do {
            lineStart = contents.indexOf('\n', lastLineStart);
            if (lineStart !== -1) {
                lastLineStart = lineStart + 1;
                line++;
            }
        } while (lineStart !== -1);
        return new parse_util_1.ParseLocation(file, length, line, length - lastLineStart);
    }
    /**
     * Compiles the directives as registered in the component metadata into an array literal of the
     * individual directives. If the component does not use any directives, then null is returned.
     */
    function compileUsedDirectiveMetadata(meta, predicate) {
        var wrapType = meta.declarationListEmitMode !== 0 /* Direct */ ?
            util_2.generateForwardRef :
            function (expr) { return expr; };
        var directives = meta.directives.filter(predicate);
        return util_2.toOptionalLiteralArray(directives, function (directive) {
            var dirMeta = new util_1.DefinitionMap();
            dirMeta.set('type', wrapType(directive.type));
            dirMeta.set('selector', o.literal(directive.selector));
            dirMeta.set('inputs', util_2.toOptionalLiteralArray(directive.inputs, o.literal));
            dirMeta.set('outputs', util_2.toOptionalLiteralArray(directive.outputs, o.literal));
            dirMeta.set('exportAs', util_2.toOptionalLiteralArray(directive.exportAs, o.literal));
            return dirMeta.toLiteralMap();
        });
    }
    /**
     * Compiles the pipes as registered in the component metadata into an object literal, where the
     * pipe's name is used as key and a reference to its type as value. If the component does not use
     * any pipes, then null is returned.
     */
    function compileUsedPipeMetadata(meta) {
        var e_1, _a;
        if (meta.pipes.size === 0) {
            return null;
        }
        var wrapType = meta.declarationListEmitMode !== 0 /* Direct */ ?
            util_2.generateForwardRef :
            function (expr) { return expr; };
        var entries = [];
        try {
            for (var _b = tslib_1.__values(meta.pipes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), name_1 = _d[0], pipe = _d[1];
                entries.push({ key: name_1, value: wrapType(pipe), quoted: true });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return o.literalMap(entries);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcGFydGlhbC9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlEQUFtQztJQUNuQyw2RkFBa0Y7SUFDbEYsMkRBQTZDO0lBQzdDLCtEQUFpRjtJQUNqRiwrRUFBb0Q7SUFHcEQsd0VBQXFEO0lBRXJELGdFQUEyQztJQUczQyw2RUFBeUQ7SUFDekQsbUVBQWtFO0lBK0JsRTs7T0FFRztJQUNILFNBQWdCLG1DQUFtQyxDQUMvQyxJQUF5QixFQUFFLFFBQXdCLEVBQ25ELHNCQUFvRDtRQUN0RCxJQUFNLGFBQWEsR0FBRyw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFFM0YsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RixJQUFNLElBQUksR0FBRyw4QkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2QyxPQUFPLEVBQUMsVUFBVSxZQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQzVDLENBQUM7SUFURCxrRkFTQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsNEJBQTRCLENBQ3hDLElBQXlCLEVBQUUsUUFBd0IsRUFDbkQsWUFBMEM7UUFDNUMsSUFBTSxhQUFhLEdBQ2Ysd0NBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDN0Us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O1FBQ3hELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLG1CQUFtQyxDQUFDLENBQUM7WUFDOUUseUJBQWtCLENBQUMsQ0FBQztZQUNwQixVQUFDLElBQWtCLElBQUssT0FBQSxJQUFJLEVBQUosQ0FBSSxDQUFDO1FBRWpDLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQzs7WUFDbkIsS0FBMkIsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxLQUFLLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQTVCLElBQUEsS0FBQSwyQkFBWSxFQUFYLE1BQUksUUFBQSxFQUFFLElBQUksUUFBQTtnQkFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxNQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzthQUNoRTs7Ozs7Ozs7O1FBQ0QsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnLi4vLi4vY29yZSc7XG5pbXBvcnQge0RFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUd9IGZyb20gJy4uLy4uL21sX3BhcnNlci9pbnRlcnBvbGF0aW9uX2NvbmZpZyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VMb2NhdGlvbiwgUGFyc2VTb3VyY2VGaWxlLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtSM0NvbXBpbGVkRXhwcmVzc2lvbn0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge0RlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLCBSM0NvbXBvbmVudE1ldGFkYXRhLCBSM1VzZWREaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSAnLi4vdmlldy9hcGknO1xuaW1wb3J0IHtjcmVhdGVDb21wb25lbnRUeXBlfSBmcm9tICcuLi92aWV3L2NvbXBpbGVyJztcbmltcG9ydCB7UGFyc2VkVGVtcGxhdGV9IGZyb20gJy4uL3ZpZXcvdGVtcGxhdGUnO1xuaW1wb3J0IHtEZWZpbml0aW9uTWFwfSBmcm9tICcuLi92aWV3L3V0aWwnO1xuXG5pbXBvcnQge1IzRGVjbGFyZUNvbXBvbmVudE1ldGFkYXRhLCBSM0RlY2xhcmVVc2VkRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7Y3JlYXRlRGlyZWN0aXZlRGVmaW5pdGlvbk1hcH0gZnJvbSAnLi9kaXJlY3RpdmUnO1xuaW1wb3J0IHtnZW5lcmF0ZUZvcndhcmRSZWYsIHRvT3B0aW9uYWxMaXRlcmFsQXJyYXl9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVjbGFyZUNvbXBvbmVudFRlbXBsYXRlSW5mbyB7XG4gIC8qKlxuICAgKiBUaGUgc3RyaW5nIGNvbnRlbnRzIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgXCJsb2dpY2FsXCIgdGVtcGxhdGUgc3RyaW5nLCBhZnRlciBleHBhbnNpb24gb2YgYW55IGVzY2FwZWQgY2hhcmFjdGVycyAoZm9yIGlubGluZVxuICAgKiB0ZW1wbGF0ZXMpLiBUaGlzIG1heSBkaWZmZXIgZnJvbSB0aGUgYWN0dWFsIHRlbXBsYXRlIGJ5dGVzIGFzIHRoZXkgYXBwZWFyIGluIHRoZSAudHMgZmlsZS5cbiAgICovXG4gIGNvbnRlbnQ6IHN0cmluZztcblxuICAvKipcbiAgICogQSBmdWxsIHBhdGggdG8gdGhlIGZpbGUgd2hpY2ggY29udGFpbnMgdGhlIHRlbXBsYXRlLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSBlaXRoZXIgdGhlIG9yaWdpbmFsIC50cyBmaWxlIGlmIHRoZSB0ZW1wbGF0ZSBpcyBpbmxpbmUsIG9yIHRoZSAuaHRtbCBmaWxlIGlmIGFuXG4gICAqIGV4dGVybmFsIGZpbGUgd2FzIHVzZWQuXG4gICAqL1xuICBzb3VyY2VVcmw6IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdGVtcGxhdGUgd2FzIGlubGluZSAodXNpbmcgYHRlbXBsYXRlYCkgb3IgZXh0ZXJuYWwgKHVzaW5nIGB0ZW1wbGF0ZVVybGApLlxuICAgKi9cbiAgaXNJbmxpbmU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIElmIHRoZSB0ZW1wbGF0ZSB3YXMgZGVmaW5lZCBpbmxpbmUgYnkgYSBkaXJlY3Qgc3RyaW5nIGxpdGVyYWwsIHRoZW4gdGhpcyBpcyB0aGF0IGxpdGVyYWxcbiAgICogZXhwcmVzc2lvbi4gT3RoZXJ3aXNlIGBudWxsYCwgaWYgdGhlIHRlbXBsYXRlIHdhcyBub3QgZGVmaW5lZCBpbmxpbmUgb3Igd2FzIG5vdCBhIGxpdGVyYWwuXG4gICAqL1xuICBpbmxpbmVUZW1wbGF0ZUxpdGVyYWxFeHByZXNzaW9uOiBvLkV4cHJlc3Npb258bnVsbDtcbn1cblxuLyoqXG4gKiBDb21waWxlIGEgY29tcG9uZW50IGRlY2xhcmF0aW9uIGRlZmluZWQgYnkgdGhlIGBSM0NvbXBvbmVudE1ldGFkYXRhYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEZWNsYXJlQ29tcG9uZW50RnJvbU1ldGFkYXRhKFxuICAgIG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGEsIHRlbXBsYXRlOiBQYXJzZWRUZW1wbGF0ZSxcbiAgICBhZGRpdGlvbmFsVGVtcGxhdGVJbmZvOiBEZWNsYXJlQ29tcG9uZW50VGVtcGxhdGVJbmZvKTogUjNDb21waWxlZEV4cHJlc3Npb24ge1xuICBjb25zdCBkZWZpbml0aW9uTWFwID0gY3JlYXRlQ29tcG9uZW50RGVmaW5pdGlvbk1hcChtZXRhLCB0ZW1wbGF0ZSwgYWRkaXRpb25hbFRlbXBsYXRlSW5mbyk7XG5cbiAgY29uc3QgZXhwcmVzc2lvbiA9IG8uaW1wb3J0RXhwcihSMy5kZWNsYXJlQ29tcG9uZW50KS5jYWxsRm4oW2RlZmluaXRpb25NYXAudG9MaXRlcmFsTWFwKCldKTtcbiAgY29uc3QgdHlwZSA9IGNyZWF0ZUNvbXBvbmVudFR5cGUobWV0YSk7XG5cbiAgcmV0dXJuIHtleHByZXNzaW9uLCB0eXBlLCBzdGF0ZW1lbnRzOiBbXX07XG59XG5cbi8qKlxuICogR2F0aGVycyB0aGUgZGVjbGFyYXRpb24gZmllbGRzIGZvciBhIGNvbXBvbmVudCBpbnRvIGEgYERlZmluaXRpb25NYXBgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50RGVmaW5pdGlvbk1hcChcbiAgICBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhLCB0ZW1wbGF0ZTogUGFyc2VkVGVtcGxhdGUsXG4gICAgdGVtcGxhdGVJbmZvOiBEZWNsYXJlQ29tcG9uZW50VGVtcGxhdGVJbmZvKTogRGVmaW5pdGlvbk1hcDxSM0RlY2xhcmVDb21wb25lbnRNZXRhZGF0YT4ge1xuICBjb25zdCBkZWZpbml0aW9uTWFwOiBEZWZpbml0aW9uTWFwPFIzRGVjbGFyZUNvbXBvbmVudE1ldGFkYXRhPiA9XG4gICAgICBjcmVhdGVEaXJlY3RpdmVEZWZpbml0aW9uTWFwKG1ldGEpO1xuXG4gIGRlZmluaXRpb25NYXAuc2V0KCd0ZW1wbGF0ZScsIGdldFRlbXBsYXRlRXhwcmVzc2lvbih0ZW1wbGF0ZSwgdGVtcGxhdGVJbmZvKSk7XG4gIGlmICh0ZW1wbGF0ZUluZm8uaXNJbmxpbmUpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnaXNJbmxpbmUnLCBvLmxpdGVyYWwodHJ1ZSkpO1xuICB9XG5cbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3N0eWxlcycsIHRvT3B0aW9uYWxMaXRlcmFsQXJyYXkobWV0YS5zdHlsZXMsIG8ubGl0ZXJhbCkpO1xuICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICdjb21wb25lbnRzJyxcbiAgICAgIGNvbXBpbGVVc2VkRGlyZWN0aXZlTWV0YWRhdGEobWV0YSwgZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5pc0NvbXBvbmVudCA9PT0gdHJ1ZSkpO1xuICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICdkaXJlY3RpdmVzJyxcbiAgICAgIGNvbXBpbGVVc2VkRGlyZWN0aXZlTWV0YWRhdGEobWV0YSwgZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5pc0NvbXBvbmVudCAhPT0gdHJ1ZSkpO1xuICBkZWZpbml0aW9uTWFwLnNldCgncGlwZXMnLCBjb21waWxlVXNlZFBpcGVNZXRhZGF0YShtZXRhKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCd2aWV3UHJvdmlkZXJzJywgbWV0YS52aWV3UHJvdmlkZXJzKTtcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ2FuaW1hdGlvbnMnLCBtZXRhLmFuaW1hdGlvbnMpO1xuXG4gIGlmIChtZXRhLmNoYW5nZURldGVjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoXG4gICAgICAgICdjaGFuZ2VEZXRlY3Rpb24nLFxuICAgICAgICBvLmltcG9ydEV4cHIoUjMuQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpXG4gICAgICAgICAgICAucHJvcChjb3JlLkNoYW5nZURldGVjdGlvblN0cmF0ZWd5W21ldGEuY2hhbmdlRGV0ZWN0aW9uXSkpO1xuICB9XG4gIGlmIChtZXRhLmVuY2Fwc3VsYXRpb24gIT09IGNvcmUuVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICAgJ2VuY2Fwc3VsYXRpb24nLFxuICAgICAgICBvLmltcG9ydEV4cHIoUjMuVmlld0VuY2Fwc3VsYXRpb24pLnByb3AoY29yZS5WaWV3RW5jYXBzdWxhdGlvblttZXRhLmVuY2Fwc3VsYXRpb25dKSk7XG4gIH1cbiAgaWYgKG1ldGEuaW50ZXJwb2xhdGlvbiAhPT0gREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRykge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KFxuICAgICAgICAnaW50ZXJwb2xhdGlvbicsXG4gICAgICAgIG8ubGl0ZXJhbEFycihbby5saXRlcmFsKG1ldGEuaW50ZXJwb2xhdGlvbi5zdGFydCksIG8ubGl0ZXJhbChtZXRhLmludGVycG9sYXRpb24uZW5kKV0pKTtcbiAgfVxuXG4gIGlmICh0ZW1wbGF0ZS5wcmVzZXJ2ZVdoaXRlc3BhY2VzID09PSB0cnVlKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3ByZXNlcnZlV2hpdGVzcGFjZXMnLCBvLmxpdGVyYWwodHJ1ZSkpO1xuICB9XG5cbiAgcmV0dXJuIGRlZmluaXRpb25NYXA7XG59XG5cbmZ1bmN0aW9uIGdldFRlbXBsYXRlRXhwcmVzc2lvbihcbiAgICB0ZW1wbGF0ZTogUGFyc2VkVGVtcGxhdGUsIHRlbXBsYXRlSW5mbzogRGVjbGFyZUNvbXBvbmVudFRlbXBsYXRlSW5mbyk6IG8uRXhwcmVzc2lvbiB7XG4gIC8vIElmIHRoZSB0ZW1wbGF0ZSBoYXMgYmVlbiBkZWZpbmVkIHVzaW5nIGEgZGlyZWN0IGxpdGVyYWwsIHdlIHVzZSB0aGF0IGV4cHJlc3Npb24gZGlyZWN0bHlcbiAgLy8gd2l0aG91dCBhbnkgbW9kaWZpY2F0aW9ucy4gVGhpcyBpcyBlbnN1cmVzIHByb3BlciBzb3VyY2UgbWFwcGluZyBmcm9tIHRoZSBwYXJ0aWFsbHlcbiAgLy8gY29tcGlsZWQgY29kZSB0byB0aGUgc291cmNlIGZpbGUgZGVjbGFyaW5nIHRoZSB0ZW1wbGF0ZS4gTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgY2FwdHVyZVxuICAvLyB0ZW1wbGF0ZSBsaXRlcmFscyByZWZlcmVuY2VkIGluZGlyZWN0bHkgdGhyb3VnaCBhbiBpZGVudGlmaWVyLlxuICBpZiAodGVtcGxhdGVJbmZvLmlubGluZVRlbXBsYXRlTGl0ZXJhbEV4cHJlc3Npb24gIT09IG51bGwpIHtcbiAgICByZXR1cm4gdGVtcGxhdGVJbmZvLmlubGluZVRlbXBsYXRlTGl0ZXJhbEV4cHJlc3Npb247XG4gIH1cblxuICAvLyBJZiB0aGUgdGVtcGxhdGUgaXMgZGVmaW5lZCBpbmxpbmUgYnV0IG5vdCB0aHJvdWdoIGEgbGl0ZXJhbCwgdGhlIHRlbXBsYXRlIGhhcyBiZWVuIHJlc29sdmVkXG4gIC8vIHRocm91Z2ggc3RhdGljIGludGVycHJldGF0aW9uLiBXZSBjcmVhdGUgYSBsaXRlcmFsIGJ1dCBjYW5ub3QgcHJvdmlkZSBhbnkgc291cmNlIHNwYW4uIE5vdGVcbiAgLy8gdGhhdCB3ZSBjYW5ub3QgdXNlIHRoZSBleHByZXNzaW9uIGRlZmluaW5nIHRoZSB0ZW1wbGF0ZSBiZWNhdXNlIHRoZSBsaW5rZXIgZXhwZWN0cyB0aGUgdGVtcGxhdGVcbiAgLy8gdG8gYmUgZGVmaW5lZCBhcyBhIGxpdGVyYWwgaW4gdGhlIGRlY2xhcmF0aW9uLlxuICBpZiAodGVtcGxhdGVJbmZvLmlzSW5saW5lKSB7XG4gICAgcmV0dXJuIG8ubGl0ZXJhbCh0ZW1wbGF0ZUluZm8uY29udGVudCwgbnVsbCwgbnVsbCk7XG4gIH1cblxuICAvLyBUaGUgdGVtcGxhdGUgaXMgZXh0ZXJuYWwgc28gd2UgbXVzdCBzeW50aGVzaXplIGFuIGV4cHJlc3Npb24gbm9kZSB3aXRoXG4gIC8vIHRoZSBhcHByb3ByaWF0ZSBzb3VyY2Utc3Bhbi5cbiAgY29uc3QgY29udGVudHMgPSB0ZW1wbGF0ZUluZm8uY29udGVudDtcbiAgY29uc3QgZmlsZSA9IG5ldyBQYXJzZVNvdXJjZUZpbGUoY29udGVudHMsIHRlbXBsYXRlSW5mby5zb3VyY2VVcmwpO1xuICBjb25zdCBzdGFydCA9IG5ldyBQYXJzZUxvY2F0aW9uKGZpbGUsIDAsIDAsIDApO1xuICBjb25zdCBlbmQgPSBjb21wdXRlRW5kTG9jYXRpb24oZmlsZSwgY29udGVudHMpO1xuICBjb25zdCBzcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihzdGFydCwgZW5kKTtcbiAgcmV0dXJuIG8ubGl0ZXJhbChjb250ZW50cywgbnVsbCwgc3Bhbik7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVFbmRMb2NhdGlvbihmaWxlOiBQYXJzZVNvdXJjZUZpbGUsIGNvbnRlbnRzOiBzdHJpbmcpOiBQYXJzZUxvY2F0aW9uIHtcbiAgY29uc3QgbGVuZ3RoID0gY29udGVudHMubGVuZ3RoO1xuICBsZXQgbGluZVN0YXJ0ID0gMDtcbiAgbGV0IGxhc3RMaW5lU3RhcnQgPSAwO1xuICBsZXQgbGluZSA9IDA7XG4gIGRvIHtcbiAgICBsaW5lU3RhcnQgPSBjb250ZW50cy5pbmRleE9mKCdcXG4nLCBsYXN0TGluZVN0YXJ0KTtcbiAgICBpZiAobGluZVN0YXJ0ICE9PSAtMSkge1xuICAgICAgbGFzdExpbmVTdGFydCA9IGxpbmVTdGFydCArIDE7XG4gICAgICBsaW5lKys7XG4gICAgfVxuICB9IHdoaWxlIChsaW5lU3RhcnQgIT09IC0xKTtcblxuICByZXR1cm4gbmV3IFBhcnNlTG9jYXRpb24oZmlsZSwgbGVuZ3RoLCBsaW5lLCBsZW5ndGggLSBsYXN0TGluZVN0YXJ0KTtcbn1cblxuLyoqXG4gKiBDb21waWxlcyB0aGUgZGlyZWN0aXZlcyBhcyByZWdpc3RlcmVkIGluIHRoZSBjb21wb25lbnQgbWV0YWRhdGEgaW50byBhbiBhcnJheSBsaXRlcmFsIG9mIHRoZVxuICogaW5kaXZpZHVhbCBkaXJlY3RpdmVzLiBJZiB0aGUgY29tcG9uZW50IGRvZXMgbm90IHVzZSBhbnkgZGlyZWN0aXZlcywgdGhlbiBudWxsIGlzIHJldHVybmVkLlxuICovXG5mdW5jdGlvbiBjb21waWxlVXNlZERpcmVjdGl2ZU1ldGFkYXRhKFxuICAgIG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGEsXG4gICAgcHJlZGljYXRlOiAoZGlyZWN0aXZlOiBSM1VzZWREaXJlY3RpdmVNZXRhZGF0YSkgPT4gYm9vbGVhbik6IG8uTGl0ZXJhbEFycmF5RXhwcnxudWxsIHtcbiAgY29uc3Qgd3JhcFR5cGUgPSBtZXRhLmRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlICE9PSBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5EaXJlY3QgP1xuICAgICAgZ2VuZXJhdGVGb3J3YXJkUmVmIDpcbiAgICAgIChleHByOiBvLkV4cHJlc3Npb24pID0+IGV4cHI7XG5cbiAgY29uc3QgZGlyZWN0aXZlcyA9IG1ldGEuZGlyZWN0aXZlcy5maWx0ZXIocHJlZGljYXRlKTtcbiAgcmV0dXJuIHRvT3B0aW9uYWxMaXRlcmFsQXJyYXkoZGlyZWN0aXZlcywgZGlyZWN0aXZlID0+IHtcbiAgICBjb25zdCBkaXJNZXRhID0gbmV3IERlZmluaXRpb25NYXA8UjNEZWNsYXJlVXNlZERpcmVjdGl2ZU1ldGFkYXRhPigpO1xuICAgIGRpck1ldGEuc2V0KCd0eXBlJywgd3JhcFR5cGUoZGlyZWN0aXZlLnR5cGUpKTtcbiAgICBkaXJNZXRhLnNldCgnc2VsZWN0b3InLCBvLmxpdGVyYWwoZGlyZWN0aXZlLnNlbGVjdG9yKSk7XG4gICAgZGlyTWV0YS5zZXQoJ2lucHV0cycsIHRvT3B0aW9uYWxMaXRlcmFsQXJyYXkoZGlyZWN0aXZlLmlucHV0cywgby5saXRlcmFsKSk7XG4gICAgZGlyTWV0YS5zZXQoJ291dHB1dHMnLCB0b09wdGlvbmFsTGl0ZXJhbEFycmF5KGRpcmVjdGl2ZS5vdXRwdXRzLCBvLmxpdGVyYWwpKTtcbiAgICBkaXJNZXRhLnNldCgnZXhwb3J0QXMnLCB0b09wdGlvbmFsTGl0ZXJhbEFycmF5KGRpcmVjdGl2ZS5leHBvcnRBcywgby5saXRlcmFsKSk7XG4gICAgcmV0dXJuIGRpck1ldGEudG9MaXRlcmFsTWFwKCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIENvbXBpbGVzIHRoZSBwaXBlcyBhcyByZWdpc3RlcmVkIGluIHRoZSBjb21wb25lbnQgbWV0YWRhdGEgaW50byBhbiBvYmplY3QgbGl0ZXJhbCwgd2hlcmUgdGhlXG4gKiBwaXBlJ3MgbmFtZSBpcyB1c2VkIGFzIGtleSBhbmQgYSByZWZlcmVuY2UgdG8gaXRzIHR5cGUgYXMgdmFsdWUuIElmIHRoZSBjb21wb25lbnQgZG9lcyBub3QgdXNlXG4gKiBhbnkgcGlwZXMsIHRoZW4gbnVsbCBpcyByZXR1cm5lZC5cbiAqL1xuZnVuY3Rpb24gY29tcGlsZVVzZWRQaXBlTWV0YWRhdGEobWV0YTogUjNDb21wb25lbnRNZXRhZGF0YSk6IG8uTGl0ZXJhbE1hcEV4cHJ8bnVsbCB7XG4gIGlmIChtZXRhLnBpcGVzLnNpemUgPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHdyYXBUeXBlID0gbWV0YS5kZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSAhPT0gRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUuRGlyZWN0ID9cbiAgICAgIGdlbmVyYXRlRm9yd2FyZFJlZiA6XG4gICAgICAoZXhwcjogby5FeHByZXNzaW9uKSA9PiBleHByO1xuXG4gIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgZm9yIChjb25zdCBbbmFtZSwgcGlwZV0gb2YgbWV0YS5waXBlcykge1xuICAgIGVudHJpZXMucHVzaCh7a2V5OiBuYW1lLCB2YWx1ZTogd3JhcFR5cGUocGlwZSksIHF1b3RlZDogdHJ1ZX0pO1xuICB9XG4gIHJldHVybiBvLmxpdGVyYWxNYXAoZW50cmllcyk7XG59XG4iXX0=
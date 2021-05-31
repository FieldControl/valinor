(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_component_linker_1", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler/src/core", "@angular/compiler-cli/linker/src/fatal_linker_error", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_directive_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartialComponentLinkerVersion1 = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var core_1 = require("@angular/compiler/src/core");
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    var partial_directive_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_directive_linker_1");
    var util_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/util");
    /**
     * A `PartialLinker` that is designed to process `ɵɵngDeclareComponent()` call expressions.
     */
    var PartialComponentLinkerVersion1 = /** @class */ (function () {
        function PartialComponentLinkerVersion1(getSourceFile, sourceUrl, code) {
            this.getSourceFile = getSourceFile;
            this.sourceUrl = sourceUrl;
            this.code = code;
        }
        PartialComponentLinkerVersion1.prototype.linkPartialDeclaration = function (constantPool, metaObj) {
            var meta = this.toR3ComponentMeta(metaObj);
            var def = compiler_1.compileComponentFromMetadata(meta, constantPool, compiler_1.makeBindingParser());
            return def.expression;
        };
        /**
         * This function derives the `R3ComponentMetadata` from the provided AST object.
         */
        PartialComponentLinkerVersion1.prototype.toR3ComponentMeta = function (metaObj) {
            var interpolation = parseInterpolationConfig(metaObj);
            var templateSource = metaObj.getValue('template');
            var isInline = metaObj.has('isInline') ? metaObj.getBoolean('isInline') : false;
            var templateInfo = this.getTemplateInfo(templateSource, isInline);
            var template = compiler_1.parseTemplate(templateInfo.code, templateInfo.sourceUrl, {
                escapedString: templateInfo.isEscaped,
                interpolationConfig: interpolation,
                range: templateInfo.range,
                enableI18nLegacyMessageIdFormat: false,
                preserveWhitespaces: metaObj.has('preserveWhitespaces') ? metaObj.getBoolean('preserveWhitespaces') : false,
                // We normalize line endings if the template is was inline.
                i18nNormalizeLineEndingsInICUs: isInline,
            });
            if (template.errors !== null) {
                var errors = template.errors.map(function (err) { return err.toString(); }).join('\n');
                throw new fatal_linker_error_1.FatalLinkerError(templateSource.expression, "Errors found in the template:\n" + errors);
            }
            var declarationListEmitMode = 0 /* Direct */;
            var collectUsedDirectives = function (directives) {
                return directives.map(function (directive) {
                    var directiveExpr = directive.getObject();
                    var type = directiveExpr.getValue('type');
                    var selector = directiveExpr.getString('selector');
                    var _a = util_1.extractForwardRef(type), typeExpr = _a.expression, isForwardRef = _a.isForwardRef;
                    if (isForwardRef) {
                        declarationListEmitMode = 1 /* Closure */;
                    }
                    return {
                        type: typeExpr,
                        selector: selector,
                        inputs: directiveExpr.has('inputs') ?
                            directiveExpr.getArray('inputs').map(function (input) { return input.getString(); }) :
                            [],
                        outputs: directiveExpr.has('outputs') ?
                            directiveExpr.getArray('outputs').map(function (input) { return input.getString(); }) :
                            [],
                        exportAs: directiveExpr.has('exportAs') ?
                            directiveExpr.getArray('exportAs').map(function (exportAs) { return exportAs.getString(); }) :
                            null,
                    };
                });
            };
            var directives = [];
            if (metaObj.has('components')) {
                directives.push.apply(directives, tslib_1.__spreadArray([], tslib_1.__read(collectUsedDirectives(metaObj.getArray('components')))));
            }
            if (metaObj.has('directives')) {
                directives.push.apply(directives, tslib_1.__spreadArray([], tslib_1.__read(collectUsedDirectives(metaObj.getArray('directives')))));
            }
            var pipes = new Map();
            if (metaObj.has('pipes')) {
                pipes = metaObj.getObject('pipes').toMap(function (pipe) {
                    var _a = util_1.extractForwardRef(pipe), pipeType = _a.expression, isForwardRef = _a.isForwardRef;
                    if (isForwardRef) {
                        declarationListEmitMode = 1 /* Closure */;
                    }
                    return pipeType;
                });
            }
            return tslib_1.__assign(tslib_1.__assign({}, partial_directive_linker_1_1.toR3DirectiveMeta(metaObj, this.code, this.sourceUrl)), { viewProviders: metaObj.has('viewProviders') ? metaObj.getOpaque('viewProviders') : null, template: {
                    nodes: template.nodes,
                    ngContentSelectors: template.ngContentSelectors,
                }, declarationListEmitMode: declarationListEmitMode, styles: metaObj.has('styles') ? metaObj.getArray('styles').map(function (entry) { return entry.getString(); }) :
                    [], encapsulation: metaObj.has('encapsulation') ?
                    parseEncapsulation(metaObj.getValue('encapsulation')) :
                    core_1.ViewEncapsulation.Emulated, interpolation: interpolation, changeDetection: metaObj.has('changeDetection') ?
                    parseChangeDetectionStrategy(metaObj.getValue('changeDetection')) :
                    core_1.ChangeDetectionStrategy.Default, animations: metaObj.has('animations') ? metaObj.getOpaque('animations') : null, relativeContextFilePath: this.sourceUrl, i18nUseExternalIds: false, pipes: pipes,
                directives: directives });
        };
        /**
         * Update the range to remove the start and end chars, which should be quotes around the template.
         */
        PartialComponentLinkerVersion1.prototype.getTemplateInfo = function (templateNode, isInline) {
            var range = templateNode.getRange();
            if (!isInline) {
                // If not marked as inline, then we try to get the template info from the original external
                // template file, via source-mapping.
                var externalTemplate = this.tryExternalTemplate(range);
                if (externalTemplate !== null) {
                    return externalTemplate;
                }
            }
            // Either the template is marked inline or we failed to find the original external template.
            // So just use the literal string from the partially compiled component declaration.
            return this.templateFromPartialCode(templateNode, range);
        };
        PartialComponentLinkerVersion1.prototype.tryExternalTemplate = function (range) {
            var sourceFile = this.getSourceFile();
            if (sourceFile === null) {
                return null;
            }
            var pos = sourceFile.getOriginalLocation(range.startLine, range.startCol);
            // Only interested if the original location is in an "external" template file:
            // * the file is different to the current file
            // * the file does not end in `.js` or `.ts` (we expect it to be something like `.html`).
            // * the range starts at the beginning of the file
            if (pos === null || pos.file === this.sourceUrl || /\.[jt]s$/.test(pos.file) ||
                pos.line !== 0 || pos.column !== 0) {
                return null;
            }
            var templateContents = sourceFile.sources.find(function (src) { return (src === null || src === void 0 ? void 0 : src.sourcePath) === pos.file; }).contents;
            return {
                code: templateContents,
                sourceUrl: pos.file,
                range: { startPos: 0, startLine: 0, startCol: 0, endPos: templateContents.length },
                isEscaped: false,
            };
        };
        PartialComponentLinkerVersion1.prototype.templateFromPartialCode = function (templateNode, _a) {
            var startPos = _a.startPos, endPos = _a.endPos, startLine = _a.startLine, startCol = _a.startCol;
            if (!/["'`]/.test(this.code[startPos]) || this.code[startPos] !== this.code[endPos - 1]) {
                throw new fatal_linker_error_1.FatalLinkerError(templateNode.expression, "Expected the template string to be wrapped in quotes but got: " + this.code.substring(startPos, endPos));
            }
            return {
                code: this.code,
                sourceUrl: this.sourceUrl,
                range: { startPos: startPos + 1, endPos: endPos - 1, startLine: startLine, startCol: startCol + 1 },
                isEscaped: true,
            };
        };
        return PartialComponentLinkerVersion1;
    }());
    exports.PartialComponentLinkerVersion1 = PartialComponentLinkerVersion1;
    /**
     * Extract an `InterpolationConfig` from the component declaration.
     */
    function parseInterpolationConfig(metaObj) {
        if (!metaObj.has('interpolation')) {
            return compiler_1.DEFAULT_INTERPOLATION_CONFIG;
        }
        var interpolationExpr = metaObj.getValue('interpolation');
        var values = interpolationExpr.getArray().map(function (entry) { return entry.getString(); });
        if (values.length !== 2) {
            throw new fatal_linker_error_1.FatalLinkerError(interpolationExpr.expression, 'Unsupported interpolation config, expected an array containing exactly two strings');
        }
        return compiler_1.InterpolationConfig.fromArray(values);
    }
    /**
     * Determines the `ViewEncapsulation` mode from the AST value's symbol name.
     */
    function parseEncapsulation(encapsulation) {
        var symbolName = encapsulation.getSymbolName();
        if (symbolName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(encapsulation.expression, 'Expected encapsulation to have a symbol name');
        }
        var enumValue = core_1.ViewEncapsulation[symbolName];
        if (enumValue === undefined) {
            throw new fatal_linker_error_1.FatalLinkerError(encapsulation.expression, 'Unsupported encapsulation');
        }
        return enumValue;
    }
    /**
     * Determines the `ChangeDetectionStrategy` from the AST value's symbol name.
     */
    function parseChangeDetectionStrategy(changeDetectionStrategy) {
        var symbolName = changeDetectionStrategy.getSymbolName();
        if (symbolName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(changeDetectionStrategy.expression, 'Expected change detection strategy to have a symbol name');
        }
        var enumValue = core_1.ChangeDetectionStrategy[symbolName];
        if (enumValue === undefined) {
            throw new fatal_linker_error_1.FatalLinkerError(changeDetectionStrategy.expression, 'Unsupported change detection strategy');
        }
        return enumValue;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9jb21wb25lbnRfbGlua2VyXzEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL3NyYy9maWxlX2xpbmtlci9wYXJ0aWFsX2xpbmtlcnMvcGFydGlhbF9jb21wb25lbnRfbGlua2VyXzEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhDQUEyVDtJQUMzVCxtREFBc0Y7SUFNdEYsMEZBQTBEO0lBRzFELHNJQUErRDtJQUUvRCwwRkFBeUM7SUFFekM7O09BRUc7SUFDSDtRQUVFLHdDQUNxQixhQUE4QixFQUFVLFNBQXlCLEVBQzFFLElBQVk7WUFESCxrQkFBYSxHQUFiLGFBQWEsQ0FBaUI7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFnQjtZQUMxRSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQUcsQ0FBQztRQUU1QiwrREFBc0IsR0FBdEIsVUFDSSxZQUEwQixFQUMxQixPQUFxRDtZQUN2RCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsSUFBTSxHQUFHLEdBQUcsdUNBQTRCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSw0QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDbEYsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7UUFFRDs7V0FFRztRQUNLLDBEQUFpQixHQUF6QixVQUEwQixPQUEyRDtZQUVuRixJQUFNLGFBQWEsR0FBRyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNsRixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVwRSxJQUFNLFFBQVEsR0FBRyx3QkFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLFNBQVMsRUFBRTtnQkFDeEUsYUFBYSxFQUFFLFlBQVksQ0FBQyxTQUFTO2dCQUNyQyxtQkFBbUIsRUFBRSxhQUFhO2dCQUNsQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEtBQUs7Z0JBQ3pCLCtCQUErQixFQUFFLEtBQUs7Z0JBQ3RDLG1CQUFtQixFQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO2dCQUMxRiwyREFBMkQ7Z0JBQzNELDhCQUE4QixFQUFFLFFBQVE7YUFDekMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRTtnQkFDNUIsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQWQsQ0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRSxNQUFNLElBQUkscUNBQWdCLENBQ3RCLGNBQWMsQ0FBQyxVQUFVLEVBQUUsb0NBQWtDLE1BQVEsQ0FBQyxDQUFDO2FBQzVFO1lBRUQsSUFBSSx1QkFBdUIsaUJBQWlDLENBQUM7WUFFN0QsSUFBTSxxQkFBcUIsR0FDdkIsVUFBQyxVQUFtRTtnQkFDbEUsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUztvQkFDN0IsSUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUM1QyxJQUFNLElBQUksR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1QyxJQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUUvQyxJQUFBLEtBQXVDLHdCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFqRCxRQUFRLGdCQUFBLEVBQUUsWUFBWSxrQkFBMkIsQ0FBQztvQkFDckUsSUFBSSxZQUFZLEVBQUU7d0JBQ2hCLHVCQUF1QixrQkFBa0MsQ0FBQztxQkFDM0Q7b0JBRUQsT0FBTzt3QkFDTCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxRQUFRLEVBQUUsUUFBUTt3QkFDbEIsTUFBTSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDakMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQWpCLENBQWlCLENBQUMsQ0FBQyxDQUFDOzRCQUNsRSxFQUFFO3dCQUNOLE9BQU8sRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ25DLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFqQixDQUFpQixDQUFDLENBQUMsQ0FBQzs0QkFDbkUsRUFBRTt3QkFDTixRQUFRLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzRCQUNyQyxhQUFhLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDLENBQUM7NEJBQzFFLElBQUk7cUJBQ1QsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQztZQUVOLElBQUksVUFBVSxHQUE4QixFQUFFLENBQUM7WUFDL0MsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUM3QixVQUFVLENBQUMsSUFBSSxPQUFmLFVBQVUsMkNBQVMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFFO2FBQzNFO1lBQ0QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUM3QixVQUFVLENBQUMsSUFBSSxPQUFmLFVBQVUsMkNBQVMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFFO2FBQzNFO1lBRUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7WUFDNUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN4QixLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxJQUFJO29CQUNyQyxJQUFBLEtBQXVDLHdCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFqRCxRQUFRLGdCQUFBLEVBQUUsWUFBWSxrQkFBMkIsQ0FBQztvQkFDckUsSUFBSSxZQUFZLEVBQUU7d0JBQ2hCLHVCQUF1QixrQkFBa0MsQ0FBQztxQkFDM0Q7b0JBQ0QsT0FBTyxRQUFRLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCw2Q0FDSyw4Q0FBaUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQ3hELGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ3ZGLFFBQVEsRUFBRTtvQkFDUixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7b0JBQ3JCLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxrQkFBa0I7aUJBQ2hELEVBQ0QsdUJBQXVCLHlCQUFBLEVBQ3ZCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDLENBQUM7b0JBQzVELEVBQUUsRUFDbEMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztvQkFDekMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELHdCQUFpQixDQUFDLFFBQVEsRUFDOUIsYUFBYSxlQUFBLEVBQ2IsZUFBZSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO29CQUM3Qyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNuRSw4QkFBdUIsQ0FBQyxPQUFPLEVBQ25DLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQzlFLHVCQUF1QixFQUFFLElBQUksQ0FBQyxTQUFTLEVBQ3ZDLGtCQUFrQixFQUFFLEtBQUssRUFDekIsS0FBSyxPQUFBO2dCQUNMLFVBQVUsWUFBQSxJQUNWO1FBQ0osQ0FBQztRQUVEOztXQUVHO1FBQ0ssd0RBQWUsR0FBdkIsVUFBd0IsWUFBNEMsRUFBRSxRQUFpQjtZQUVyRixJQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFdEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDYiwyRkFBMkY7Z0JBQzNGLHFDQUFxQztnQkFDckMsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pELElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO29CQUM3QixPQUFPLGdCQUFnQixDQUFDO2lCQUN6QjthQUNGO1lBRUQsNEZBQTRGO1lBQzVGLG9GQUFvRjtZQUNwRixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVPLDREQUFtQixHQUEzQixVQUE0QixLQUFZO1lBQ3RDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN4QyxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxJQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUUsOEVBQThFO1lBQzlFLDhDQUE4QztZQUM5Qyx5RkFBeUY7WUFDekYsa0RBQWtEO1lBQ2xELElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUN4RSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELElBQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxDQUFBLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxVQUFVLE1BQUssR0FBRyxDQUFDLElBQUksRUFBNUIsQ0FBNEIsQ0FBRSxDQUFDLFFBQVEsQ0FBQztZQUVoRyxPQUFPO2dCQUNMLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSTtnQkFDbkIsS0FBSyxFQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sRUFBQztnQkFDaEYsU0FBUyxFQUFFLEtBQUs7YUFDakIsQ0FBQztRQUNKLENBQUM7UUFFTyxnRUFBdUIsR0FBL0IsVUFDSSxZQUE0QyxFQUM1QyxFQUE4QztnQkFBN0MsUUFBUSxjQUFBLEVBQUUsTUFBTSxZQUFBLEVBQUUsU0FBUyxlQUFBLEVBQUUsUUFBUSxjQUFBO1lBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN2RixNQUFNLElBQUkscUNBQWdCLENBQ3RCLFlBQVksQ0FBQyxVQUFVLEVBQ3ZCLG1FQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUcsQ0FBQyxDQUFDO2FBQ2xEO1lBQ0QsT0FBTztnQkFDTCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2YsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxTQUFTLFdBQUEsRUFBRSxRQUFRLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBQztnQkFDdEYsU0FBUyxFQUFFLElBQUk7YUFDaEIsQ0FBQztRQUNKLENBQUM7UUFDSCxxQ0FBQztJQUFELENBQUMsQUFqTEQsSUFpTEM7SUFqTFksd0VBQThCO0lBMEwzQzs7T0FFRztJQUNILFNBQVMsd0JBQXdCLENBQzdCLE9BQTJEO1FBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sdUNBQTRCLENBQUM7U0FDckM7UUFFRCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDNUQsSUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFqQixDQUFpQixDQUFDLENBQUM7UUFDNUUsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QixNQUFNLElBQUkscUNBQWdCLENBQ3RCLGlCQUFpQixDQUFDLFVBQVUsRUFDNUIsb0ZBQW9GLENBQUMsQ0FBQztTQUMzRjtRQUNELE9BQU8sOEJBQW1CLENBQUMsU0FBUyxDQUFDLE1BQTBCLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLGtCQUFrQixDQUFjLGFBQXVEO1FBRTlGLElBQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNqRCxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsTUFBTSxJQUFJLHFDQUFnQixDQUN0QixhQUFhLENBQUMsVUFBVSxFQUFFLDhDQUE4QyxDQUFDLENBQUM7U0FDL0U7UUFDRCxJQUFNLFNBQVMsR0FBRyx3QkFBaUIsQ0FBQyxVQUE0QyxDQUFDLENBQUM7UUFDbEYsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQzNCLE1BQU0sSUFBSSxxQ0FBZ0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLDJCQUEyQixDQUFDLENBQUM7U0FDbkY7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLDRCQUE0QixDQUNqQyx1QkFBdUU7UUFFekUsSUFBTSxVQUFVLEdBQUcsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDM0QsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxxQ0FBZ0IsQ0FDdEIsdUJBQXVCLENBQUMsVUFBVSxFQUNsQywwREFBMEQsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsSUFBTSxTQUFTLEdBQUcsOEJBQXVCLENBQUMsVUFBa0QsQ0FBQyxDQUFDO1FBQzlGLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUMzQixNQUFNLElBQUkscUNBQWdCLENBQ3RCLHVCQUF1QixDQUFDLFVBQVUsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1NBQ2xGO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtjb21waWxlQ29tcG9uZW50RnJvbU1ldGFkYXRhLCBDb25zdGFudFBvb2wsIERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLCBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHLCBJbnRlcnBvbGF0aW9uQ29uZmlnLCBtYWtlQmluZGluZ1BhcnNlciwgcGFyc2VUZW1wbGF0ZSwgUjNDb21wb25lbnRNZXRhZGF0YSwgUjNEZWNsYXJlQ29tcG9uZW50TWV0YWRhdGEsIFIzRGVjbGFyZVVzZWREaXJlY3RpdmVNZXRhZGF0YSwgUjNQYXJ0aWFsRGVjbGFyYXRpb24sIFIzVXNlZERpcmVjdGl2ZU1ldGFkYXRhfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXIvc3JjL2NvcmUnO1xuaW1wb3J0ICogYXMgbyBmcm9tICdAYW5ndWxhci9jb21waWxlci9zcmMvb3V0cHV0L291dHB1dF9hc3QnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtSYW5nZX0gZnJvbSAnLi4vLi4vYXN0L2FzdF9ob3N0JztcbmltcG9ydCB7QXN0T2JqZWN0LCBBc3RWYWx1ZX0gZnJvbSAnLi4vLi4vYXN0L2FzdF92YWx1ZSc7XG5pbXBvcnQge0ZhdGFsTGlua2VyRXJyb3J9IGZyb20gJy4uLy4uL2ZhdGFsX2xpbmtlcl9lcnJvcic7XG5pbXBvcnQge0dldFNvdXJjZUZpbGVGbn0gZnJvbSAnLi4vZ2V0X3NvdXJjZV9maWxlJztcblxuaW1wb3J0IHt0b1IzRGlyZWN0aXZlTWV0YX0gZnJvbSAnLi9wYXJ0aWFsX2RpcmVjdGl2ZV9saW5rZXJfMSc7XG5pbXBvcnQge1BhcnRpYWxMaW5rZXJ9IGZyb20gJy4vcGFydGlhbF9saW5rZXInO1xuaW1wb3J0IHtleHRyYWN0Rm9yd2FyZFJlZn0gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBBIGBQYXJ0aWFsTGlua2VyYCB0aGF0IGlzIGRlc2lnbmVkIHRvIHByb2Nlc3MgYMm1ybVuZ0RlY2xhcmVDb21wb25lbnQoKWAgY2FsbCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFBhcnRpYWxDb21wb25lbnRMaW5rZXJWZXJzaW9uMTxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4gaW1wbGVtZW50c1xuICAgIFBhcnRpYWxMaW5rZXI8VEV4cHJlc3Npb24+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGdldFNvdXJjZUZpbGU6IEdldFNvdXJjZUZpbGVGbiwgcHJpdmF0ZSBzb3VyY2VVcmw6IEFic29sdXRlRnNQYXRoLFxuICAgICAgcHJpdmF0ZSBjb2RlOiBzdHJpbmcpIHt9XG5cbiAgbGlua1BhcnRpYWxEZWNsYXJhdGlvbihcbiAgICAgIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLFxuICAgICAgbWV0YU9iajogQXN0T2JqZWN0PFIzUGFydGlhbERlY2xhcmF0aW9uLCBURXhwcmVzc2lvbj4pOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IG1ldGEgPSB0aGlzLnRvUjNDb21wb25lbnRNZXRhKG1ldGFPYmopO1xuICAgIGNvbnN0IGRlZiA9IGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEobWV0YSwgY29uc3RhbnRQb29sLCBtYWtlQmluZGluZ1BhcnNlcigpKTtcbiAgICByZXR1cm4gZGVmLmV4cHJlc3Npb247XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBkZXJpdmVzIHRoZSBgUjNDb21wb25lbnRNZXRhZGF0YWAgZnJvbSB0aGUgcHJvdmlkZWQgQVNUIG9iamVjdC5cbiAgICovXG4gIHByaXZhdGUgdG9SM0NvbXBvbmVudE1ldGEobWV0YU9iajogQXN0T2JqZWN0PFIzRGVjbGFyZUNvbXBvbmVudE1ldGFkYXRhLCBURXhwcmVzc2lvbj4pOlxuICAgICAgUjNDb21wb25lbnRNZXRhZGF0YSB7XG4gICAgY29uc3QgaW50ZXJwb2xhdGlvbiA9IHBhcnNlSW50ZXJwb2xhdGlvbkNvbmZpZyhtZXRhT2JqKTtcbiAgICBjb25zdCB0ZW1wbGF0ZVNvdXJjZSA9IG1ldGFPYmouZ2V0VmFsdWUoJ3RlbXBsYXRlJyk7XG4gICAgY29uc3QgaXNJbmxpbmUgPSBtZXRhT2JqLmhhcygnaXNJbmxpbmUnKSA/IG1ldGFPYmouZ2V0Qm9vbGVhbignaXNJbmxpbmUnKSA6IGZhbHNlO1xuICAgIGNvbnN0IHRlbXBsYXRlSW5mbyA9IHRoaXMuZ2V0VGVtcGxhdGVJbmZvKHRlbXBsYXRlU291cmNlLCBpc0lubGluZSk7XG5cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHBhcnNlVGVtcGxhdGUodGVtcGxhdGVJbmZvLmNvZGUsIHRlbXBsYXRlSW5mby5zb3VyY2VVcmwsIHtcbiAgICAgIGVzY2FwZWRTdHJpbmc6IHRlbXBsYXRlSW5mby5pc0VzY2FwZWQsXG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiBpbnRlcnBvbGF0aW9uLFxuICAgICAgcmFuZ2U6IHRlbXBsYXRlSW5mby5yYW5nZSxcbiAgICAgIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQ6IGZhbHNlLFxuICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczpcbiAgICAgICAgICBtZXRhT2JqLmhhcygncHJlc2VydmVXaGl0ZXNwYWNlcycpID8gbWV0YU9iai5nZXRCb29sZWFuKCdwcmVzZXJ2ZVdoaXRlc3BhY2VzJykgOiBmYWxzZSxcbiAgICAgIC8vIFdlIG5vcm1hbGl6ZSBsaW5lIGVuZGluZ3MgaWYgdGhlIHRlbXBsYXRlIGlzIHdhcyBpbmxpbmUuXG4gICAgICBpMThuTm9ybWFsaXplTGluZUVuZGluZ3NJbklDVXM6IGlzSW5saW5lLFxuICAgIH0pO1xuICAgIGlmICh0ZW1wbGF0ZS5lcnJvcnMgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGVycm9ycyA9IHRlbXBsYXRlLmVycm9ycy5tYXAoZXJyID0+IGVyci50b1N0cmluZygpKS5qb2luKCdcXG4nKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbExpbmtlckVycm9yKFxuICAgICAgICAgIHRlbXBsYXRlU291cmNlLmV4cHJlc3Npb24sIGBFcnJvcnMgZm91bmQgaW4gdGhlIHRlbXBsYXRlOlxcbiR7ZXJyb3JzfWApO1xuICAgIH1cblxuICAgIGxldCBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSA9IERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkRpcmVjdDtcblxuICAgIGNvbnN0IGNvbGxlY3RVc2VkRGlyZWN0aXZlcyA9XG4gICAgICAgIChkaXJlY3RpdmVzOiBBc3RWYWx1ZTxSM0RlY2xhcmVVc2VkRGlyZWN0aXZlTWV0YWRhdGEsIFRFeHByZXNzaW9uPltdKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmVFeHByID0gZGlyZWN0aXZlLmdldE9iamVjdCgpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGRpcmVjdGl2ZUV4cHIuZ2V0VmFsdWUoJ3R5cGUnKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZGlyZWN0aXZlRXhwci5nZXRTdHJpbmcoJ3NlbGVjdG9yJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHtleHByZXNzaW9uOiB0eXBlRXhwciwgaXNGb3J3YXJkUmVmfSA9IGV4dHJhY3RGb3J3YXJkUmVmKHR5cGUpO1xuICAgICAgICAgICAgaWYgKGlzRm9yd2FyZFJlZikge1xuICAgICAgICAgICAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSA9IERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkNsb3N1cmU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHR5cGU6IHR5cGVFeHByLFxuICAgICAgICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICAgICAgICAgIGlucHV0czogZGlyZWN0aXZlRXhwci5oYXMoJ2lucHV0cycpID9cbiAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZUV4cHIuZ2V0QXJyYXkoJ2lucHV0cycpLm1hcChpbnB1dCA9PiBpbnB1dC5nZXRTdHJpbmcoKSkgOlxuICAgICAgICAgICAgICAgICAgW10sXG4gICAgICAgICAgICAgIG91dHB1dHM6IGRpcmVjdGl2ZUV4cHIuaGFzKCdvdXRwdXRzJykgP1xuICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlRXhwci5nZXRBcnJheSgnb3V0cHV0cycpLm1hcChpbnB1dCA9PiBpbnB1dC5nZXRTdHJpbmcoKSkgOlxuICAgICAgICAgICAgICAgICAgW10sXG4gICAgICAgICAgICAgIGV4cG9ydEFzOiBkaXJlY3RpdmVFeHByLmhhcygnZXhwb3J0QXMnKSA/XG4gICAgICAgICAgICAgICAgICBkaXJlY3RpdmVFeHByLmdldEFycmF5KCdleHBvcnRBcycpLm1hcChleHBvcnRBcyA9PiBleHBvcnRBcy5nZXRTdHJpbmcoKSkgOlxuICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICBsZXQgZGlyZWN0aXZlczogUjNVc2VkRGlyZWN0aXZlTWV0YWRhdGFbXSA9IFtdO1xuICAgIGlmIChtZXRhT2JqLmhhcygnY29tcG9uZW50cycpKSB7XG4gICAgICBkaXJlY3RpdmVzLnB1c2goLi4uY29sbGVjdFVzZWREaXJlY3RpdmVzKG1ldGFPYmouZ2V0QXJyYXkoJ2NvbXBvbmVudHMnKSkpO1xuICAgIH1cbiAgICBpZiAobWV0YU9iai5oYXMoJ2RpcmVjdGl2ZXMnKSkge1xuICAgICAgZGlyZWN0aXZlcy5wdXNoKC4uLmNvbGxlY3RVc2VkRGlyZWN0aXZlcyhtZXRhT2JqLmdldEFycmF5KCdkaXJlY3RpdmVzJykpKTtcbiAgICB9XG5cbiAgICBsZXQgcGlwZXMgPSBuZXcgTWFwPHN0cmluZywgby5FeHByZXNzaW9uPigpO1xuICAgIGlmIChtZXRhT2JqLmhhcygncGlwZXMnKSkge1xuICAgICAgcGlwZXMgPSBtZXRhT2JqLmdldE9iamVjdCgncGlwZXMnKS50b01hcChwaXBlID0+IHtcbiAgICAgICAgY29uc3Qge2V4cHJlc3Npb246IHBpcGVUeXBlLCBpc0ZvcndhcmRSZWZ9ID0gZXh0cmFjdEZvcndhcmRSZWYocGlwZSk7XG4gICAgICAgIGlmIChpc0ZvcndhcmRSZWYpIHtcbiAgICAgICAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSA9IERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkNsb3N1cmU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBpcGVUeXBlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnRvUjNEaXJlY3RpdmVNZXRhKG1ldGFPYmosIHRoaXMuY29kZSwgdGhpcy5zb3VyY2VVcmwpLFxuICAgICAgdmlld1Byb3ZpZGVyczogbWV0YU9iai5oYXMoJ3ZpZXdQcm92aWRlcnMnKSA/IG1ldGFPYmouZ2V0T3BhcXVlKCd2aWV3UHJvdmlkZXJzJykgOiBudWxsLFxuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgbm9kZXM6IHRlbXBsYXRlLm5vZGVzLFxuICAgICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycyxcbiAgICAgIH0sXG4gICAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSxcbiAgICAgIHN0eWxlczogbWV0YU9iai5oYXMoJ3N0eWxlcycpID8gbWV0YU9iai5nZXRBcnJheSgnc3R5bGVzJykubWFwKGVudHJ5ID0+IGVudHJ5LmdldFN0cmluZygpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLFxuICAgICAgZW5jYXBzdWxhdGlvbjogbWV0YU9iai5oYXMoJ2VuY2Fwc3VsYXRpb24nKSA/XG4gICAgICAgICAgcGFyc2VFbmNhcHN1bGF0aW9uKG1ldGFPYmouZ2V0VmFsdWUoJ2VuY2Fwc3VsYXRpb24nKSkgOlxuICAgICAgICAgIFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLFxuICAgICAgaW50ZXJwb2xhdGlvbixcbiAgICAgIGNoYW5nZURldGVjdGlvbjogbWV0YU9iai5oYXMoJ2NoYW5nZURldGVjdGlvbicpID9cbiAgICAgICAgICBwYXJzZUNoYW5nZURldGVjdGlvblN0cmF0ZWd5KG1ldGFPYmouZ2V0VmFsdWUoJ2NoYW5nZURldGVjdGlvbicpKSA6XG4gICAgICAgICAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgICAgIGFuaW1hdGlvbnM6IG1ldGFPYmouaGFzKCdhbmltYXRpb25zJykgPyBtZXRhT2JqLmdldE9wYXF1ZSgnYW5pbWF0aW9ucycpIDogbnVsbCxcbiAgICAgIHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoOiB0aGlzLnNvdXJjZVVybCxcbiAgICAgIGkxOG5Vc2VFeHRlcm5hbElkczogZmFsc2UsXG4gICAgICBwaXBlcyxcbiAgICAgIGRpcmVjdGl2ZXMsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHJhbmdlIHRvIHJlbW92ZSB0aGUgc3RhcnQgYW5kIGVuZCBjaGFycywgd2hpY2ggc2hvdWxkIGJlIHF1b3RlcyBhcm91bmQgdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRUZW1wbGF0ZUluZm8odGVtcGxhdGVOb2RlOiBBc3RWYWx1ZTx1bmtub3duLCBURXhwcmVzc2lvbj4sIGlzSW5saW5lOiBib29sZWFuKTpcbiAgICAgIFRlbXBsYXRlSW5mbyB7XG4gICAgY29uc3QgcmFuZ2UgPSB0ZW1wbGF0ZU5vZGUuZ2V0UmFuZ2UoKTtcblxuICAgIGlmICghaXNJbmxpbmUpIHtcbiAgICAgIC8vIElmIG5vdCBtYXJrZWQgYXMgaW5saW5lLCB0aGVuIHdlIHRyeSB0byBnZXQgdGhlIHRlbXBsYXRlIGluZm8gZnJvbSB0aGUgb3JpZ2luYWwgZXh0ZXJuYWxcbiAgICAgIC8vIHRlbXBsYXRlIGZpbGUsIHZpYSBzb3VyY2UtbWFwcGluZy5cbiAgICAgIGNvbnN0IGV4dGVybmFsVGVtcGxhdGUgPSB0aGlzLnRyeUV4dGVybmFsVGVtcGxhdGUocmFuZ2UpO1xuICAgICAgaWYgKGV4dGVybmFsVGVtcGxhdGUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGV4dGVybmFsVGVtcGxhdGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRWl0aGVyIHRoZSB0ZW1wbGF0ZSBpcyBtYXJrZWQgaW5saW5lIG9yIHdlIGZhaWxlZCB0byBmaW5kIHRoZSBvcmlnaW5hbCBleHRlcm5hbCB0ZW1wbGF0ZS5cbiAgICAvLyBTbyBqdXN0IHVzZSB0aGUgbGl0ZXJhbCBzdHJpbmcgZnJvbSB0aGUgcGFydGlhbGx5IGNvbXBpbGVkIGNvbXBvbmVudCBkZWNsYXJhdGlvbi5cbiAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZUZyb21QYXJ0aWFsQ29kZSh0ZW1wbGF0ZU5vZGUsIHJhbmdlKTtcbiAgfVxuXG4gIHByaXZhdGUgdHJ5RXh0ZXJuYWxUZW1wbGF0ZShyYW5nZTogUmFuZ2UpOiBUZW1wbGF0ZUluZm98bnVsbCB7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHRoaXMuZ2V0U291cmNlRmlsZSgpO1xuICAgIGlmIChzb3VyY2VGaWxlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBwb3MgPSBzb3VyY2VGaWxlLmdldE9yaWdpbmFsTG9jYXRpb24ocmFuZ2Uuc3RhcnRMaW5lLCByYW5nZS5zdGFydENvbCk7XG4gICAgLy8gT25seSBpbnRlcmVzdGVkIGlmIHRoZSBvcmlnaW5hbCBsb2NhdGlvbiBpcyBpbiBhbiBcImV4dGVybmFsXCIgdGVtcGxhdGUgZmlsZTpcbiAgICAvLyAqIHRoZSBmaWxlIGlzIGRpZmZlcmVudCB0byB0aGUgY3VycmVudCBmaWxlXG4gICAgLy8gKiB0aGUgZmlsZSBkb2VzIG5vdCBlbmQgaW4gYC5qc2Agb3IgYC50c2AgKHdlIGV4cGVjdCBpdCB0byBiZSBzb21ldGhpbmcgbGlrZSBgLmh0bWxgKS5cbiAgICAvLyAqIHRoZSByYW5nZSBzdGFydHMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZVxuICAgIGlmIChwb3MgPT09IG51bGwgfHwgcG9zLmZpbGUgPT09IHRoaXMuc291cmNlVXJsIHx8IC9cXC5banRdcyQvLnRlc3QocG9zLmZpbGUpIHx8XG4gICAgICAgIHBvcy5saW5lICE9PSAwIHx8IHBvcy5jb2x1bW4gIT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlQ29udGVudHMgPSBzb3VyY2VGaWxlLnNvdXJjZXMuZmluZChzcmMgPT4gc3JjPy5zb3VyY2VQYXRoID09PSBwb3MuZmlsZSkhLmNvbnRlbnRzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IHRlbXBsYXRlQ29udGVudHMsXG4gICAgICBzb3VyY2VVcmw6IHBvcy5maWxlLFxuICAgICAgcmFuZ2U6IHtzdGFydFBvczogMCwgc3RhcnRMaW5lOiAwLCBzdGFydENvbDogMCwgZW5kUG9zOiB0ZW1wbGF0ZUNvbnRlbnRzLmxlbmd0aH0sXG4gICAgICBpc0VzY2FwZWQ6IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHRlbXBsYXRlRnJvbVBhcnRpYWxDb2RlKFxuICAgICAgdGVtcGxhdGVOb2RlOiBBc3RWYWx1ZTx1bmtub3duLCBURXhwcmVzc2lvbj4sXG4gICAgICB7c3RhcnRQb3MsIGVuZFBvcywgc3RhcnRMaW5lLCBzdGFydENvbH06IFJhbmdlKTogVGVtcGxhdGVJbmZvIHtcbiAgICBpZiAoIS9bXCInYF0vLnRlc3QodGhpcy5jb2RlW3N0YXJ0UG9zXSkgfHwgdGhpcy5jb2RlW3N0YXJ0UG9zXSAhPT0gdGhpcy5jb2RlW2VuZFBvcyAtIDFdKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgICB0ZW1wbGF0ZU5vZGUuZXhwcmVzc2lvbixcbiAgICAgICAgICBgRXhwZWN0ZWQgdGhlIHRlbXBsYXRlIHN0cmluZyB0byBiZSB3cmFwcGVkIGluIHF1b3RlcyBidXQgZ290OiAke1xuICAgICAgICAgICAgICB0aGlzLmNvZGUuc3Vic3RyaW5nKHN0YXJ0UG9zLCBlbmRQb3MpfWApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc291cmNlVXJsOiB0aGlzLnNvdXJjZVVybCxcbiAgICAgIHJhbmdlOiB7c3RhcnRQb3M6IHN0YXJ0UG9zICsgMSwgZW5kUG9zOiBlbmRQb3MgLSAxLCBzdGFydExpbmUsIHN0YXJ0Q29sOiBzdGFydENvbCArIDF9LFxuICAgICAgaXNFc2NhcGVkOiB0cnVlLFxuICAgIH07XG4gIH1cbn1cblxuaW50ZXJmYWNlIFRlbXBsYXRlSW5mbyB7XG4gIGNvZGU6IHN0cmluZztcbiAgc291cmNlVXJsOiBzdHJpbmc7XG4gIHJhbmdlOiBSYW5nZTtcbiAgaXNFc2NhcGVkOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgYW4gYEludGVycG9sYXRpb25Db25maWdgIGZyb20gdGhlIGNvbXBvbmVudCBkZWNsYXJhdGlvbi5cbiAqL1xuZnVuY3Rpb24gcGFyc2VJbnRlcnBvbGF0aW9uQ29uZmlnPFRFeHByZXNzaW9uPihcbiAgICBtZXRhT2JqOiBBc3RPYmplY3Q8UjNEZWNsYXJlQ29tcG9uZW50TWV0YWRhdGEsIFRFeHByZXNzaW9uPik6IEludGVycG9sYXRpb25Db25maWcge1xuICBpZiAoIW1ldGFPYmouaGFzKCdpbnRlcnBvbGF0aW9uJykpIHtcbiAgICByZXR1cm4gREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRztcbiAgfVxuXG4gIGNvbnN0IGludGVycG9sYXRpb25FeHByID0gbWV0YU9iai5nZXRWYWx1ZSgnaW50ZXJwb2xhdGlvbicpO1xuICBjb25zdCB2YWx1ZXMgPSBpbnRlcnBvbGF0aW9uRXhwci5nZXRBcnJheSgpLm1hcChlbnRyeSA9PiBlbnRyeS5nZXRTdHJpbmcoKSk7XG4gIGlmICh2YWx1ZXMubGVuZ3RoICE9PSAyKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgIGludGVycG9sYXRpb25FeHByLmV4cHJlc3Npb24sXG4gICAgICAgICdVbnN1cHBvcnRlZCBpbnRlcnBvbGF0aW9uIGNvbmZpZywgZXhwZWN0ZWQgYW4gYXJyYXkgY29udGFpbmluZyBleGFjdGx5IHR3byBzdHJpbmdzJyk7XG4gIH1cbiAgcmV0dXJuIEludGVycG9sYXRpb25Db25maWcuZnJvbUFycmF5KHZhbHVlcyBhcyBbc3RyaW5nLCBzdHJpbmddKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBgVmlld0VuY2Fwc3VsYXRpb25gIG1vZGUgZnJvbSB0aGUgQVNUIHZhbHVlJ3Mgc3ltYm9sIG5hbWUuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlRW5jYXBzdWxhdGlvbjxURXhwcmVzc2lvbj4oZW5jYXBzdWxhdGlvbjogQXN0VmFsdWU8Vmlld0VuY2Fwc3VsYXRpb24sIFRFeHByZXNzaW9uPik6XG4gICAgVmlld0VuY2Fwc3VsYXRpb24ge1xuICBjb25zdCBzeW1ib2xOYW1lID0gZW5jYXBzdWxhdGlvbi5nZXRTeW1ib2xOYW1lKCk7XG4gIGlmIChzeW1ib2xOYW1lID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgIGVuY2Fwc3VsYXRpb24uZXhwcmVzc2lvbiwgJ0V4cGVjdGVkIGVuY2Fwc3VsYXRpb24gdG8gaGF2ZSBhIHN5bWJvbCBuYW1lJyk7XG4gIH1cbiAgY29uc3QgZW51bVZhbHVlID0gVmlld0VuY2Fwc3VsYXRpb25bc3ltYm9sTmFtZSBhcyBrZXlvZiB0eXBlb2YgVmlld0VuY2Fwc3VsYXRpb25dO1xuICBpZiAoZW51bVZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihlbmNhcHN1bGF0aW9uLmV4cHJlc3Npb24sICdVbnN1cHBvcnRlZCBlbmNhcHN1bGF0aW9uJyk7XG4gIH1cbiAgcmV0dXJuIGVudW1WYWx1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lgIGZyb20gdGhlIEFTVCB2YWx1ZSdzIHN5bWJvbCBuYW1lLlxuICovXG5mdW5jdGlvbiBwYXJzZUNoYW5nZURldGVjdGlvblN0cmF0ZWd5PFRFeHByZXNzaW9uPihcbiAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogQXN0VmFsdWU8Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFRFeHByZXNzaW9uPik6XG4gICAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICBjb25zdCBzeW1ib2xOYW1lID0gY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuZ2V0U3ltYm9sTmFtZSgpO1xuICBpZiAoc3ltYm9sTmFtZSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBGYXRhbExpbmtlckVycm9yKFxuICAgICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5leHByZXNzaW9uLFxuICAgICAgICAnRXhwZWN0ZWQgY2hhbmdlIGRldGVjdGlvbiBzdHJhdGVneSB0byBoYXZlIGEgc3ltYm9sIG5hbWUnKTtcbiAgfVxuICBjb25zdCBlbnVtVmFsdWUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneVtzeW1ib2xOYW1lIGFzIGtleW9mIHR5cGVvZiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneV07XG4gIGlmIChlbnVtVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBGYXRhbExpbmtlckVycm9yKFxuICAgICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5leHByZXNzaW9uLCAnVW5zdXBwb3J0ZWQgY2hhbmdlIGRldGVjdGlvbiBzdHJhdGVneScpO1xuICB9XG4gIHJldHVybiBlbnVtVmFsdWU7XG59XG4iXX0=
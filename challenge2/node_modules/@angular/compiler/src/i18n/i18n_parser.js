/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/i18n/i18n_parser", ["require", "exports", "@angular/compiler/src/expression_parser/lexer", "@angular/compiler/src/expression_parser/parser", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/html_tags", "@angular/compiler/src/parse_util", "@angular/compiler/src/i18n/i18n_ast", "@angular/compiler/src/i18n/serializers/placeholder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createI18nMessageFactory = void 0;
    var lexer_1 = require("@angular/compiler/src/expression_parser/lexer");
    var parser_1 = require("@angular/compiler/src/expression_parser/parser");
    var html = require("@angular/compiler/src/ml_parser/ast");
    var html_tags_1 = require("@angular/compiler/src/ml_parser/html_tags");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var placeholder_1 = require("@angular/compiler/src/i18n/serializers/placeholder");
    var _expParser = new parser_1.Parser(new lexer_1.Lexer());
    /**
     * Returns a function converting html nodes to an i18n Message given an interpolationConfig
     */
    function createI18nMessageFactory(interpolationConfig) {
        var visitor = new _I18nVisitor(_expParser, interpolationConfig);
        return function (nodes, meaning, description, customId, visitNodeFn) {
            return visitor.toI18nMessage(nodes, meaning, description, customId, visitNodeFn);
        };
    }
    exports.createI18nMessageFactory = createI18nMessageFactory;
    function noopVisitNodeFn(_html, i18n) {
        return i18n;
    }
    var _I18nVisitor = /** @class */ (function () {
        function _I18nVisitor(_expressionParser, _interpolationConfig) {
            this._expressionParser = _expressionParser;
            this._interpolationConfig = _interpolationConfig;
        }
        _I18nVisitor.prototype.toI18nMessage = function (nodes, meaning, description, customId, visitNodeFn) {
            if (meaning === void 0) { meaning = ''; }
            if (description === void 0) { description = ''; }
            if (customId === void 0) { customId = ''; }
            var context = {
                isIcu: nodes.length == 1 && nodes[0] instanceof html.Expansion,
                icuDepth: 0,
                placeholderRegistry: new placeholder_1.PlaceholderRegistry(),
                placeholderToContent: {},
                placeholderToMessage: {},
                visitNodeFn: visitNodeFn || noopVisitNodeFn,
            };
            var i18nodes = html.visitAll(this, nodes, context);
            return new i18n.Message(i18nodes, context.placeholderToContent, context.placeholderToMessage, meaning, description, customId);
        };
        _I18nVisitor.prototype.visitElement = function (el, context) {
            var _a;
            var children = html.visitAll(this, el.children, context);
            var attrs = {};
            el.attrs.forEach(function (attr) {
                // Do not visit the attributes, translatable ones are top-level ASTs
                attrs[attr.name] = attr.value;
            });
            var isVoid = html_tags_1.getHtmlTagDefinition(el.name).isVoid;
            var startPhName = context.placeholderRegistry.getStartTagPlaceholderName(el.name, attrs, isVoid);
            context.placeholderToContent[startPhName] = {
                text: el.startSourceSpan.toString(),
                sourceSpan: el.startSourceSpan,
            };
            var closePhName = '';
            if (!isVoid) {
                closePhName = context.placeholderRegistry.getCloseTagPlaceholderName(el.name);
                context.placeholderToContent[closePhName] = {
                    text: "</" + el.name + ">",
                    sourceSpan: (_a = el.endSourceSpan) !== null && _a !== void 0 ? _a : el.sourceSpan,
                };
            }
            var node = new i18n.TagPlaceholder(el.name, attrs, startPhName, closePhName, children, isVoid, el.sourceSpan, el.startSourceSpan, el.endSourceSpan);
            return context.visitNodeFn(el, node);
        };
        _I18nVisitor.prototype.visitAttribute = function (attribute, context) {
            var node = this._visitTextWithInterpolation(attribute.value, attribute.valueSpan || attribute.sourceSpan, context, attribute.i18n);
            return context.visitNodeFn(attribute, node);
        };
        _I18nVisitor.prototype.visitText = function (text, context) {
            var node = this._visitTextWithInterpolation(text.value, text.sourceSpan, context, text.i18n);
            return context.visitNodeFn(text, node);
        };
        _I18nVisitor.prototype.visitComment = function (comment, context) {
            return null;
        };
        _I18nVisitor.prototype.visitExpansion = function (icu, context) {
            var _this = this;
            context.icuDepth++;
            var i18nIcuCases = {};
            var i18nIcu = new i18n.Icu(icu.switchValue, icu.type, i18nIcuCases, icu.sourceSpan);
            icu.cases.forEach(function (caze) {
                i18nIcuCases[caze.value] = new i18n.Container(caze.expression.map(function (node) { return node.visit(_this, context); }), caze.expSourceSpan);
            });
            context.icuDepth--;
            if (context.isIcu || context.icuDepth > 0) {
                // Returns an ICU node when:
                // - the message (vs a part of the message) is an ICU message, or
                // - the ICU message is nested.
                var expPh = context.placeholderRegistry.getUniquePlaceholder("VAR_" + icu.type);
                i18nIcu.expressionPlaceholder = expPh;
                context.placeholderToContent[expPh] = {
                    text: icu.switchValue,
                    sourceSpan: icu.switchValueSourceSpan,
                };
                return context.visitNodeFn(icu, i18nIcu);
            }
            // Else returns a placeholder
            // ICU placeholders should not be replaced with their original content but with the their
            // translations.
            // TODO(vicb): add a html.Node -> i18n.Message cache to avoid having to re-create the msg
            var phName = context.placeholderRegistry.getPlaceholderName('ICU', icu.sourceSpan.toString());
            context.placeholderToMessage[phName] = this.toI18nMessage([icu], '', '', '', undefined);
            var node = new i18n.IcuPlaceholder(i18nIcu, phName, icu.sourceSpan);
            return context.visitNodeFn(icu, node);
        };
        _I18nVisitor.prototype.visitExpansionCase = function (_icuCase, _context) {
            throw new Error('Unreachable code');
        };
        /**
         * Split the, potentially interpolated, text up into text and placeholder pieces.
         *
         * @param text The potentially interpolated string to be split.
         * @param sourceSpan The span of the whole of the `text` string.
         * @param context The current context of the visitor, used to compute and store placeholders.
         * @param previousI18n Any i18n metadata associated with this `text` from a previous pass.
         */
        _I18nVisitor.prototype._visitTextWithInterpolation = function (text, sourceSpan, context, previousI18n) {
            var _a = this._expressionParser.splitInterpolation(text, sourceSpan.start.toString(), this._interpolationConfig), strings = _a.strings, expressions = _a.expressions;
            // No expressions, return a single text.
            if (expressions.length === 0) {
                return new i18n.Text(text, sourceSpan);
            }
            // Return a sequence of `Text` and `Placeholder` nodes grouped in a `Container`.
            var nodes = [];
            for (var i = 0; i < strings.length - 1; i++) {
                this._addText(nodes, strings[i], sourceSpan);
                this._addPlaceholder(nodes, context, expressions[i], sourceSpan);
            }
            // The last index contains no expression
            this._addText(nodes, strings[strings.length - 1], sourceSpan);
            // Whitespace removal may have invalidated the interpolation source-spans.
            reusePreviousSourceSpans(nodes, previousI18n);
            return new i18n.Container(nodes, sourceSpan);
        };
        /**
         * Create a new `Text` node from the `textPiece` and add it to the `nodes` collection.
         *
         * @param nodes The nodes to which the created `Text` node should be added.
         * @param textPiece The text and relative span information for this `Text` node.
         * @param interpolationSpan The span of the whole interpolated text.
         */
        _I18nVisitor.prototype._addText = function (nodes, textPiece, interpolationSpan) {
            if (textPiece.text.length > 0) {
                // No need to add empty strings
                var stringSpan = getOffsetSourceSpan(interpolationSpan, textPiece);
                nodes.push(new i18n.Text(textPiece.text, stringSpan));
            }
        };
        /**
         * Create a new `Placeholder` node from the `expression` and add it to the `nodes` collection.
         *
         * @param nodes The nodes to which the created `Text` node should be added.
         * @param context The current context of the visitor, used to compute and store placeholders.
         * @param expression The expression text and relative span information for this `Placeholder`
         *     node.
         * @param interpolationSpan The span of the whole interpolated text.
         */
        _I18nVisitor.prototype._addPlaceholder = function (nodes, context, expression, interpolationSpan) {
            var sourceSpan = getOffsetSourceSpan(interpolationSpan, expression);
            var baseName = extractPlaceholderName(expression.text) || 'INTERPOLATION';
            var phName = context.placeholderRegistry.getPlaceholderName(baseName, expression.text);
            var text = this._interpolationConfig.start + expression.text + this._interpolationConfig.end;
            context.placeholderToContent[phName] = { text: text, sourceSpan: sourceSpan };
            nodes.push(new i18n.Placeholder(expression.text, phName, sourceSpan));
        };
        return _I18nVisitor;
    }());
    /**
     * Re-use the source-spans from `previousI18n` metadata for the `nodes`.
     *
     * Whitespace removal can invalidate the source-spans of interpolation nodes, so we
     * reuse the source-span stored from a previous pass before the whitespace was removed.
     *
     * @param nodes The `Text` and `Placeholder` nodes to be processed.
     * @param previousI18n Any i18n metadata for these `nodes` stored from a previous pass.
     */
    function reusePreviousSourceSpans(nodes, previousI18n) {
        if (previousI18n instanceof i18n.Message) {
            // The `previousI18n` is an i18n `Message`, so we are processing an `Attribute` with i18n
            // metadata. The `Message` should consist only of a single `Container` that contains the
            // parts (`Text` and `Placeholder`) to process.
            assertSingleContainerMessage(previousI18n);
            previousI18n = previousI18n.nodes[0];
        }
        if (previousI18n instanceof i18n.Container) {
            // The `previousI18n` is a `Container`, which means that this is a second i18n extraction pass
            // after whitespace has been removed from the AST ndoes.
            assertEquivalentNodes(previousI18n.children, nodes);
            // Reuse the source-spans from the first pass.
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].sourceSpan = previousI18n.children[i].sourceSpan;
            }
        }
    }
    /**
     * Asserts that the `message` contains exactly one `Container` node.
     */
    function assertSingleContainerMessage(message) {
        var nodes = message.nodes;
        if (nodes.length !== 1 || !(nodes[0] instanceof i18n.Container)) {
            throw new Error('Unexpected previous i18n message - expected it to consist of only a single `Container` node.');
        }
    }
    /**
     * Asserts that the `previousNodes` and `node` collections have the same number of elements and
     * corresponding elements have the same node type.
     */
    function assertEquivalentNodes(previousNodes, nodes) {
        if (previousNodes.length !== nodes.length) {
            throw new Error('The number of i18n message children changed between first and second pass.');
        }
        if (previousNodes.some(function (node, i) { return nodes[i].constructor !== node.constructor; })) {
            throw new Error('The types of the i18n message children changed between first and second pass.');
        }
    }
    /**
     * Create a new `ParseSourceSpan` from the `sourceSpan`, offset by the `start` and `end` values.
     */
    function getOffsetSourceSpan(sourceSpan, _a) {
        var start = _a.start, end = _a.end;
        return new parse_util_1.ParseSourceSpan(sourceSpan.fullStart.moveBy(start), sourceSpan.fullStart.moveBy(end));
    }
    var _CUSTOM_PH_EXP = /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*("|')([\s\S]*?)\1[\s\S]*\)/g;
    function extractPlaceholderName(input) {
        return input.split(_CUSTOM_PH_EXP)[2];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaTE4bi9pMThuX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCx1RUFBb0U7SUFDcEUseUVBQTJGO0lBQzNGLDBEQUF5QztJQUN6Qyx1RUFBNEQ7SUFFNUQsK0RBQThDO0lBRTlDLDBEQUFtQztJQUNuQyxrRkFBOEQ7SUFFOUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFnQixDQUFDLElBQUksYUFBZSxFQUFFLENBQUMsQ0FBQztJQVMvRDs7T0FFRztJQUNILFNBQWdCLHdCQUF3QixDQUFDLG1CQUF3QztRQUUvRSxJQUFNLE9BQU8sR0FBRyxJQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUNsRSxPQUFPLFVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFdBQVc7WUFDL0MsT0FBQSxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUM7UUFBekUsQ0FBeUUsQ0FBQztJQUN2RixDQUFDO0lBTEQsNERBS0M7SUFXRCxTQUFTLGVBQWUsQ0FBQyxLQUFnQixFQUFFLElBQWU7UUFDeEQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7UUFDRSxzQkFDWSxpQkFBbUMsRUFDbkMsb0JBQXlDO1lBRHpDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7WUFDbkMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtRQUFHLENBQUM7UUFFbEQsb0NBQWEsR0FBcEIsVUFDSSxLQUFrQixFQUFFLE9BQVksRUFBRSxXQUFnQixFQUFFLFFBQWEsRUFDakUsV0FBa0M7WUFEZCx3QkFBQSxFQUFBLFlBQVk7WUFBRSw0QkFBQSxF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QVMscUJBQXFCLENBQUMsYUFBMEIsRUFBRSxLQUFrQjtRQUMzRSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLDRFQUE0RSxDQUFDLENBQUM7U0FDL0Y7UUFDRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUUsQ0FBQyxJQUFLLE9BQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUF6QyxDQUF5QyxDQUFDLEVBQUU7WUFDOUUsTUFBTSxJQUFJLEtBQUssQ0FDWCwrRUFBK0UsQ0FBQyxDQUFDO1NBQ3RGO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxtQkFBbUIsQ0FDeEIsVUFBMkIsRUFBRSxFQUFnQztZQUEvQixLQUFLLFdBQUEsRUFBRSxHQUFHLFNBQUE7UUFDMUMsT0FBTyxJQUFJLDRCQUFlLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuRyxDQUFDO0lBRUQsSUFBTSxjQUFjLEdBQ2hCLDZFQUE2RSxDQUFDO0lBRWxGLFNBQVMsc0JBQXNCLENBQUMsS0FBYTtRQUMzQyxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xleGVyIGFzIEV4cHJlc3Npb25MZXhlcn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvbGV4ZXInO1xuaW1wb3J0IHtJbnRlcnBvbGF0aW9uUGllY2UsIFBhcnNlciBhcyBFeHByZXNzaW9uUGFyc2VyfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7Z2V0SHRtbFRhZ0RlZmluaXRpb259IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3RhZ3MnO1xuaW1wb3J0IHtJbnRlcnBvbGF0aW9uQ29uZmlnfSBmcm9tICcuLi9tbF9wYXJzZXIvaW50ZXJwb2xhdGlvbl9jb25maWcnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4vaTE4bl9hc3QnO1xuaW1wb3J0IHtQbGFjZWhvbGRlclJlZ2lzdHJ5fSBmcm9tICcuL3NlcmlhbGl6ZXJzL3BsYWNlaG9sZGVyJztcblxuY29uc3QgX2V4cFBhcnNlciA9IG5ldyBFeHByZXNzaW9uUGFyc2VyKG5ldyBFeHByZXNzaW9uTGV4ZXIoKSk7XG5cbmV4cG9ydCB0eXBlIFZpc2l0Tm9kZUZuID0gKGh0bWw6IGh0bWwuTm9kZSwgaTE4bjogaTE4bi5Ob2RlKSA9PiBpMThuLk5vZGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSTE4bk1lc3NhZ2VGYWN0b3J5IHtcbiAgKG5vZGVzOiBodG1sLk5vZGVbXSwgbWVhbmluZzogc3RyaW5nfHVuZGVmaW5lZCwgZGVzY3JpcHRpb246IHN0cmluZ3x1bmRlZmluZWQsXG4gICBjdXN0b21JZDogc3RyaW5nfHVuZGVmaW5lZCwgdmlzaXROb2RlRm4/OiBWaXNpdE5vZGVGbik6IGkxOG4uTWVzc2FnZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gY29udmVydGluZyBodG1sIG5vZGVzIHRvIGFuIGkxOG4gTWVzc2FnZSBnaXZlbiBhbiBpbnRlcnBvbGF0aW9uQ29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJMThuTWVzc2FnZUZhY3RvcnkoaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyk6XG4gICAgSTE4bk1lc3NhZ2VGYWN0b3J5IHtcbiAgY29uc3QgdmlzaXRvciA9IG5ldyBfSTE4blZpc2l0b3IoX2V4cFBhcnNlciwgaW50ZXJwb2xhdGlvbkNvbmZpZyk7XG4gIHJldHVybiAobm9kZXMsIG1lYW5pbmcsIGRlc2NyaXB0aW9uLCBjdXN0b21JZCwgdmlzaXROb2RlRm4pID0+XG4gICAgICAgICAgICAgdmlzaXRvci50b0kxOG5NZXNzYWdlKG5vZGVzLCBtZWFuaW5nLCBkZXNjcmlwdGlvbiwgY3VzdG9tSWQsIHZpc2l0Tm9kZUZuKTtcbn1cblxuaW50ZXJmYWNlIEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQge1xuICBpc0ljdTogYm9vbGVhbjtcbiAgaWN1RGVwdGg6IG51bWJlcjtcbiAgcGxhY2Vob2xkZXJSZWdpc3RyeTogUGxhY2Vob2xkZXJSZWdpc3RyeTtcbiAgcGxhY2Vob2xkZXJUb0NvbnRlbnQ6IHtbcGhOYW1lOiBzdHJpbmddOiBpMThuLk1lc3NhZ2VQbGFjZWhvbGRlcn07XG4gIHBsYWNlaG9sZGVyVG9NZXNzYWdlOiB7W3BoTmFtZTogc3RyaW5nXTogaTE4bi5NZXNzYWdlfTtcbiAgdmlzaXROb2RlRm46IFZpc2l0Tm9kZUZuO1xufVxuXG5mdW5jdGlvbiBub29wVmlzaXROb2RlRm4oX2h0bWw6IGh0bWwuTm9kZSwgaTE4bjogaTE4bi5Ob2RlKTogaTE4bi5Ob2RlIHtcbiAgcmV0dXJuIGkxOG47XG59XG5cbmNsYXNzIF9JMThuVmlzaXRvciBpbXBsZW1lbnRzIGh0bWwuVmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZXhwcmVzc2lvblBhcnNlcjogRXhwcmVzc2lvblBhcnNlcixcbiAgICAgIHByaXZhdGUgX2ludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcpIHt9XG5cbiAgcHVibGljIHRvSTE4bk1lc3NhZ2UoXG4gICAgICBub2RlczogaHRtbC5Ob2RlW10sIG1lYW5pbmcgPSAnJywgZGVzY3JpcHRpb24gPSAnJywgY3VzdG9tSWQgPSAnJyxcbiAgICAgIHZpc2l0Tm9kZUZuOiBWaXNpdE5vZGVGbnx1bmRlZmluZWQpOiBpMThuLk1lc3NhZ2Uge1xuICAgIGNvbnN0IGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQgPSB7XG4gICAgICBpc0ljdTogbm9kZXMubGVuZ3RoID09IDEgJiYgbm9kZXNbMF0gaW5zdGFuY2VvZiBodG1sLkV4cGFuc2lvbixcbiAgICAgIGljdURlcHRoOiAwLFxuICAgICAgcGxhY2Vob2xkZXJSZWdpc3RyeTogbmV3IFBsYWNlaG9sZGVyUmVnaXN0cnkoKSxcbiAgICAgIHBsYWNlaG9sZGVyVG9Db250ZW50OiB7fSxcbiAgICAgIHBsYWNlaG9sZGVyVG9NZXNzYWdlOiB7fSxcbiAgICAgIHZpc2l0Tm9kZUZuOiB2aXNpdE5vZGVGbiB8fCBub29wVmlzaXROb2RlRm4sXG4gICAgfTtcblxuICAgIGNvbnN0IGkxOG5vZGVzOiBpMThuLk5vZGVbXSA9IGh0bWwudmlzaXRBbGwodGhpcywgbm9kZXMsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIG5ldyBpMThuLk1lc3NhZ2UoXG4gICAgICAgIGkxOG5vZGVzLCBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50LCBjb250ZXh0LnBsYWNlaG9sZGVyVG9NZXNzYWdlLCBtZWFuaW5nLCBkZXNjcmlwdGlvbixcbiAgICAgICAgY3VzdG9tSWQpO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsOiBodG1sLkVsZW1lbnQsIGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQpOiBpMThuLk5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gaHRtbC52aXNpdEFsbCh0aGlzLCBlbC5jaGlsZHJlbiwgY29udGV4dCk7XG4gICAgY29uc3QgYXR0cnM6IHtbazogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGVsLmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAvLyBEbyBub3QgdmlzaXQgdGhlIGF0dHJpYnV0ZXMsIHRyYW5zbGF0YWJsZSBvbmVzIGFyZSB0b3AtbGV2ZWwgQVNUc1xuICAgICAgYXR0cnNbYXR0ci5uYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgfSk7XG5cbiAgICBjb25zdCBpc1ZvaWQ6IGJvb2xlYW4gPSBnZXRIdG1sVGFnRGVmaW5pdGlvbihlbC5uYW1lKS5pc1ZvaWQ7XG4gICAgY29uc3Qgc3RhcnRQaE5hbWUgPVxuICAgICAgICBjb250ZXh0LnBsYWNlaG9sZGVyUmVnaXN0cnkuZ2V0U3RhcnRUYWdQbGFjZWhvbGRlck5hbWUoZWwubmFtZSwgYXR0cnMsIGlzVm9pZCk7XG4gICAgY29udGV4dC5wbGFjZWhvbGRlclRvQ29udGVudFtzdGFydFBoTmFtZV0gPSB7XG4gICAgICB0ZXh0OiBlbC5zdGFydFNvdXJjZVNwYW4udG9TdHJpbmcoKSxcbiAgICAgIHNvdXJjZVNwYW46IGVsLnN0YXJ0U291cmNlU3BhbixcbiAgICB9O1xuXG4gICAgbGV0IGNsb3NlUGhOYW1lID0gJyc7XG5cbiAgICBpZiAoIWlzVm9pZCkge1xuICAgICAgY2xvc2VQaE5hbWUgPSBjb250ZXh0LnBsYWNlaG9sZGVyUmVnaXN0cnkuZ2V0Q2xvc2VUYWdQbGFjZWhvbGRlck5hbWUoZWwubmFtZSk7XG4gICAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50W2Nsb3NlUGhOYW1lXSA9IHtcbiAgICAgICAgdGV4dDogYDwvJHtlbC5uYW1lfT5gLFxuICAgICAgICBzb3VyY2VTcGFuOiBlbC5lbmRTb3VyY2VTcGFuID8/IGVsLnNvdXJjZVNwYW4sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSBuZXcgaTE4bi5UYWdQbGFjZWhvbGRlcihcbiAgICAgICAgZWwubmFtZSwgYXR0cnMsIHN0YXJ0UGhOYW1lLCBjbG9zZVBoTmFtZSwgY2hpbGRyZW4sIGlzVm9pZCwgZWwuc291cmNlU3BhbixcbiAgICAgICAgZWwuc3RhcnRTb3VyY2VTcGFuLCBlbC5lbmRTb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gY29udGV4dC52aXNpdE5vZGVGbihlbCwgbm9kZSk7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24oXG4gICAgICAgIGF0dHJpYnV0ZS52YWx1ZSwgYXR0cmlidXRlLnZhbHVlU3BhbiB8fCBhdHRyaWJ1dGUuc291cmNlU3BhbiwgY29udGV4dCwgYXR0cmlidXRlLmkxOG4pO1xuICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKGF0dHJpYnV0ZSwgbm9kZSk7XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogaHRtbC5UZXh0LCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24odGV4dC52YWx1ZSwgdGV4dC5zb3VyY2VTcGFuLCBjb250ZXh0LCB0ZXh0LmkxOG4pO1xuICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKHRleHQsIG5vZGUpO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IGh0bWwuQ29tbWVudCwgY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCk6IGkxOG4uTm9kZXxudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGljdTogaHRtbC5FeHBhbnNpb24sIGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQpOiBpMThuLk5vZGUge1xuICAgIGNvbnRleHQuaWN1RGVwdGgrKztcbiAgICBjb25zdCBpMThuSWN1Q2FzZXM6IHtbazogc3RyaW5nXTogaTE4bi5Ob2RlfSA9IHt9O1xuICAgIGNvbnN0IGkxOG5JY3UgPSBuZXcgaTE4bi5JY3UoaWN1LnN3aXRjaFZhbHVlLCBpY3UudHlwZSwgaTE4bkljdUNhc2VzLCBpY3Uuc291cmNlU3Bhbik7XG4gICAgaWN1LmNhc2VzLmZvckVhY2goKGNhemUpOiB2b2lkID0+IHtcbiAgICAgIGkxOG5JY3VDYXNlc1tjYXplLnZhbHVlXSA9IG5ldyBpMThuLkNvbnRhaW5lcihcbiAgICAgICAgICBjYXplLmV4cHJlc3Npb24ubWFwKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMsIGNvbnRleHQpKSwgY2F6ZS5leHBTb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgICBjb250ZXh0LmljdURlcHRoLS07XG5cbiAgICBpZiAoY29udGV4dC5pc0ljdSB8fCBjb250ZXh0LmljdURlcHRoID4gMCkge1xuICAgICAgLy8gUmV0dXJucyBhbiBJQ1Ugbm9kZSB3aGVuOlxuICAgICAgLy8gLSB0aGUgbWVzc2FnZSAodnMgYSBwYXJ0IG9mIHRoZSBtZXNzYWdlKSBpcyBhbiBJQ1UgbWVzc2FnZSwgb3JcbiAgICAgIC8vIC0gdGhlIElDVSBtZXNzYWdlIGlzIG5lc3RlZC5cbiAgICAgIGNvbnN0IGV4cFBoID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldFVuaXF1ZVBsYWNlaG9sZGVyKGBWQVJfJHtpY3UudHlwZX1gKTtcbiAgICAgIGkxOG5JY3UuZXhwcmVzc2lvblBsYWNlaG9sZGVyID0gZXhwUGg7XG4gICAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50W2V4cFBoXSA9IHtcbiAgICAgICAgdGV4dDogaWN1LnN3aXRjaFZhbHVlLFxuICAgICAgICBzb3VyY2VTcGFuOiBpY3Uuc3dpdGNoVmFsdWVTb3VyY2VTcGFuLFxuICAgICAgfTtcbiAgICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKGljdSwgaTE4bkljdSk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSByZXR1cm5zIGEgcGxhY2Vob2xkZXJcbiAgICAvLyBJQ1UgcGxhY2Vob2xkZXJzIHNob3VsZCBub3QgYmUgcmVwbGFjZWQgd2l0aCB0aGVpciBvcmlnaW5hbCBjb250ZW50IGJ1dCB3aXRoIHRoZSB0aGVpclxuICAgIC8vIHRyYW5zbGF0aW9ucy5cbiAgICAvLyBUT0RPKHZpY2IpOiBhZGQgYSBodG1sLk5vZGUgLT4gaTE4bi5NZXNzYWdlIGNhY2hlIHRvIGF2b2lkIGhhdmluZyB0byByZS1jcmVhdGUgdGhlIG1zZ1xuICAgIGNvbnN0IHBoTmFtZSA9IGNvbnRleHQucGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRQbGFjZWhvbGRlck5hbWUoJ0lDVScsIGljdS5zb3VyY2VTcGFuLnRvU3RyaW5nKCkpO1xuICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb01lc3NhZ2VbcGhOYW1lXSA9IHRoaXMudG9JMThuTWVzc2FnZShbaWN1XSwgJycsICcnLCAnJywgdW5kZWZpbmVkKTtcbiAgICBjb25zdCBub2RlID0gbmV3IGkxOG4uSWN1UGxhY2Vob2xkZXIoaTE4bkljdSwgcGhOYW1lLCBpY3Uuc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIGNvbnRleHQudmlzaXROb2RlRm4oaWN1LCBub2RlKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShfaWN1Q2FzZTogaHRtbC5FeHBhbnNpb25DYXNlLCBfY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCk6IGkxOG4uTm9kZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlYWNoYWJsZSBjb2RlJyk7XG4gIH1cblxuICAvKipcbiAgICogU3BsaXQgdGhlLCBwb3RlbnRpYWxseSBpbnRlcnBvbGF0ZWQsIHRleHQgdXAgaW50byB0ZXh0IGFuZCBwbGFjZWhvbGRlciBwaWVjZXMuXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0IFRoZSBwb3RlbnRpYWxseSBpbnRlcnBvbGF0ZWQgc3RyaW5nIHRvIGJlIHNwbGl0LlxuICAgKiBAcGFyYW0gc291cmNlU3BhbiBUaGUgc3BhbiBvZiB0aGUgd2hvbGUgb2YgdGhlIGB0ZXh0YCBzdHJpbmcuXG4gICAqIEBwYXJhbSBjb250ZXh0IFRoZSBjdXJyZW50IGNvbnRleHQgb2YgdGhlIHZpc2l0b3IsIHVzZWQgdG8gY29tcHV0ZSBhbmQgc3RvcmUgcGxhY2Vob2xkZXJzLlxuICAgKiBAcGFyYW0gcHJldmlvdXNJMThuIEFueSBpMThuIG1ldGFkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGB0ZXh0YCBmcm9tIGEgcHJldmlvdXMgcGFzcy5cbiAgICovXG4gIHByaXZhdGUgX3Zpc2l0VGV4dFdpdGhJbnRlcnBvbGF0aW9uKFxuICAgICAgdGV4dDogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQsXG4gICAgICBwcmV2aW91c0kxOG46IGkxOG4uSTE4bk1ldGF8dW5kZWZpbmVkKTogaTE4bi5Ob2RlIHtcbiAgICBjb25zdCB7c3RyaW5ncywgZXhwcmVzc2lvbnN9ID0gdGhpcy5fZXhwcmVzc2lvblBhcnNlci5zcGxpdEludGVycG9sYXRpb24oXG4gICAgICAgIHRleHQsIHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKSwgdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZyk7XG5cbiAgICAvLyBObyBleHByZXNzaW9ucywgcmV0dXJuIGEgc2luZ2xlIHRleHQuXG4gICAgaWYgKGV4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBpMThuLlRleHQodGV4dCwgc291cmNlU3Bhbik7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGEgc2VxdWVuY2Ugb2YgYFRleHRgIGFuZCBgUGxhY2Vob2xkZXJgIG5vZGVzIGdyb3VwZWQgaW4gYSBgQ29udGFpbmVyYC5cbiAgICBjb25zdCBub2RlczogaTE4bi5Ob2RlW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICB0aGlzLl9hZGRUZXh0KG5vZGVzLCBzdHJpbmdzW2ldLCBzb3VyY2VTcGFuKTtcbiAgICAgIHRoaXMuX2FkZFBsYWNlaG9sZGVyKG5vZGVzLCBjb250ZXh0LCBleHByZXNzaW9uc1tpXSwgc291cmNlU3Bhbik7XG4gICAgfVxuICAgIC8vIFRoZSBsYXN0IGluZGV4IGNvbnRhaW5zIG5vIGV4cHJlc3Npb25cbiAgICB0aGlzLl9hZGRUZXh0KG5vZGVzLCBzdHJpbmdzW3N0cmluZ3MubGVuZ3RoIC0gMV0sIHNvdXJjZVNwYW4pO1xuXG4gICAgLy8gV2hpdGVzcGFjZSByZW1vdmFsIG1heSBoYXZlIGludmFsaWRhdGVkIHRoZSBpbnRlcnBvbGF0aW9uIHNvdXJjZS1zcGFucy5cbiAgICByZXVzZVByZXZpb3VzU291cmNlU3BhbnMobm9kZXMsIHByZXZpb3VzSTE4bik7XG5cbiAgICByZXR1cm4gbmV3IGkxOG4uQ29udGFpbmVyKG5vZGVzLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFRleHRgIG5vZGUgZnJvbSB0aGUgYHRleHRQaWVjZWAgYW5kIGFkZCBpdCB0byB0aGUgYG5vZGVzYCBjb2xsZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbm9kZXMgVGhlIG5vZGVzIHRvIHdoaWNoIHRoZSBjcmVhdGVkIGBUZXh0YCBub2RlIHNob3VsZCBiZSBhZGRlZC5cbiAgICogQHBhcmFtIHRleHRQaWVjZSBUaGUgdGV4dCBhbmQgcmVsYXRpdmUgc3BhbiBpbmZvcm1hdGlvbiBmb3IgdGhpcyBgVGV4dGAgbm9kZS5cbiAgICogQHBhcmFtIGludGVycG9sYXRpb25TcGFuIFRoZSBzcGFuIG9mIHRoZSB3aG9sZSBpbnRlcnBvbGF0ZWQgdGV4dC5cbiAgICovXG4gIHByaXZhdGUgX2FkZFRleHQoXG4gICAgICBub2RlczogaTE4bi5Ob2RlW10sIHRleHRQaWVjZTogSW50ZXJwb2xhdGlvblBpZWNlLCBpbnRlcnBvbGF0aW9uU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogdm9pZCB7XG4gICAgaWYgKHRleHRQaWVjZS50ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIE5vIG5lZWQgdG8gYWRkIGVtcHR5IHN0cmluZ3NcbiAgICAgIGNvbnN0IHN0cmluZ1NwYW4gPSBnZXRPZmZzZXRTb3VyY2VTcGFuKGludGVycG9sYXRpb25TcGFuLCB0ZXh0UGllY2UpO1xuICAgICAgbm9kZXMucHVzaChuZXcgaTE4bi5UZXh0KHRleHRQaWVjZS50ZXh0LCBzdHJpbmdTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgUGxhY2Vob2xkZXJgIG5vZGUgZnJvbSB0aGUgYGV4cHJlc3Npb25gIGFuZCBhZGQgaXQgdG8gdGhlIGBub2Rlc2AgY29sbGVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5vZGVzIFRoZSBub2RlcyB0byB3aGljaCB0aGUgY3JlYXRlZCBgVGV4dGAgbm9kZSBzaG91bGQgYmUgYWRkZWQuXG4gICAqIEBwYXJhbSBjb250ZXh0IFRoZSBjdXJyZW50IGNvbnRleHQgb2YgdGhlIHZpc2l0b3IsIHVzZWQgdG8gY29tcHV0ZSBhbmQgc3RvcmUgcGxhY2Vob2xkZXJzLlxuICAgKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgZXhwcmVzc2lvbiB0ZXh0IGFuZCByZWxhdGl2ZSBzcGFuIGluZm9ybWF0aW9uIGZvciB0aGlzIGBQbGFjZWhvbGRlcmBcbiAgICogICAgIG5vZGUuXG4gICAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uU3BhbiBUaGUgc3BhbiBvZiB0aGUgd2hvbGUgaW50ZXJwb2xhdGVkIHRleHQuXG4gICAqL1xuICBwcml2YXRlIF9hZGRQbGFjZWhvbGRlcihcbiAgICAgIG5vZGVzOiBpMThuLk5vZGVbXSwgY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCwgZXhwcmVzc2lvbjogSW50ZXJwb2xhdGlvblBpZWNlLFxuICAgICAgaW50ZXJwb2xhdGlvblNwYW46IFBhcnNlU291cmNlU3Bhbik6IHZvaWQge1xuICAgIGNvbnN0IHNvdXJjZVNwYW4gPSBnZXRPZmZzZXRTb3VyY2VTcGFuKGludGVycG9sYXRpb25TcGFuLCBleHByZXNzaW9uKTtcbiAgICBjb25zdCBiYXNlTmFtZSA9IGV4dHJhY3RQbGFjZWhvbGRlck5hbWUoZXhwcmVzc2lvbi50ZXh0KSB8fCAnSU5URVJQT0xBVElPTic7XG4gICAgY29uc3QgcGhOYW1lID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldFBsYWNlaG9sZGVyTmFtZShiYXNlTmFtZSwgZXhwcmVzc2lvbi50ZXh0KTtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZy5zdGFydCArIGV4cHJlc3Npb24udGV4dCArIHRoaXMuX2ludGVycG9sYXRpb25Db25maWcuZW5kO1xuICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb0NvbnRlbnRbcGhOYW1lXSA9IHt0ZXh0LCBzb3VyY2VTcGFufTtcbiAgICBub2Rlcy5wdXNoKG5ldyBpMThuLlBsYWNlaG9sZGVyKGV4cHJlc3Npb24udGV4dCwgcGhOYW1lLCBzb3VyY2VTcGFuKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZS11c2UgdGhlIHNvdXJjZS1zcGFucyBmcm9tIGBwcmV2aW91c0kxOG5gIG1ldGFkYXRhIGZvciB0aGUgYG5vZGVzYC5cbiAqXG4gKiBXaGl0ZXNwYWNlIHJlbW92YWwgY2FuIGludmFsaWRhdGUgdGhlIHNvdXJjZS1zcGFucyBvZiBpbnRlcnBvbGF0aW9uIG5vZGVzLCBzbyB3ZVxuICogcmV1c2UgdGhlIHNvdXJjZS1zcGFuIHN0b3JlZCBmcm9tIGEgcHJldmlvdXMgcGFzcyBiZWZvcmUgdGhlIHdoaXRlc3BhY2Ugd2FzIHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIG5vZGVzIFRoZSBgVGV4dGAgYW5kIGBQbGFjZWhvbGRlcmAgbm9kZXMgdG8gYmUgcHJvY2Vzc2VkLlxuICogQHBhcmFtIHByZXZpb3VzSTE4biBBbnkgaTE4biBtZXRhZGF0YSBmb3IgdGhlc2UgYG5vZGVzYCBzdG9yZWQgZnJvbSBhIHByZXZpb3VzIHBhc3MuXG4gKi9cbmZ1bmN0aW9uIHJldXNlUHJldmlvdXNTb3VyY2VTcGFucyhub2RlczogaTE4bi5Ob2RlW10sIHByZXZpb3VzSTE4bjogaTE4bi5JMThuTWV0YXx1bmRlZmluZWQpOiB2b2lkIHtcbiAgaWYgKHByZXZpb3VzSTE4biBpbnN0YW5jZW9mIGkxOG4uTWVzc2FnZSkge1xuICAgIC8vIFRoZSBgcHJldmlvdXNJMThuYCBpcyBhbiBpMThuIGBNZXNzYWdlYCwgc28gd2UgYXJlIHByb2Nlc3NpbmcgYW4gYEF0dHJpYnV0ZWAgd2l0aCBpMThuXG4gICAgLy8gbWV0YWRhdGEuIFRoZSBgTWVzc2FnZWAgc2hvdWxkIGNvbnNpc3Qgb25seSBvZiBhIHNpbmdsZSBgQ29udGFpbmVyYCB0aGF0IGNvbnRhaW5zIHRoZVxuICAgIC8vIHBhcnRzIChgVGV4dGAgYW5kIGBQbGFjZWhvbGRlcmApIHRvIHByb2Nlc3MuXG4gICAgYXNzZXJ0U2luZ2xlQ29udGFpbmVyTWVzc2FnZShwcmV2aW91c0kxOG4pO1xuICAgIHByZXZpb3VzSTE4biA9IHByZXZpb3VzSTE4bi5ub2Rlc1swXTtcbiAgfVxuXG4gIGlmIChwcmV2aW91c0kxOG4gaW5zdGFuY2VvZiBpMThuLkNvbnRhaW5lcikge1xuICAgIC8vIFRoZSBgcHJldmlvdXNJMThuYCBpcyBhIGBDb250YWluZXJgLCB3aGljaCBtZWFucyB0aGF0IHRoaXMgaXMgYSBzZWNvbmQgaTE4biBleHRyYWN0aW9uIHBhc3NcbiAgICAvLyBhZnRlciB3aGl0ZXNwYWNlIGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgQVNUIG5kb2VzLlxuICAgIGFzc2VydEVxdWl2YWxlbnROb2RlcyhwcmV2aW91c0kxOG4uY2hpbGRyZW4sIG5vZGVzKTtcblxuICAgIC8vIFJldXNlIHRoZSBzb3VyY2Utc3BhbnMgZnJvbSB0aGUgZmlyc3QgcGFzcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBub2Rlc1tpXS5zb3VyY2VTcGFuID0gcHJldmlvdXNJMThuLmNoaWxkcmVuW2ldLnNvdXJjZVNwYW47XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZSBgbWVzc2FnZWAgY29udGFpbnMgZXhhY3RseSBvbmUgYENvbnRhaW5lcmAgbm9kZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0U2luZ2xlQ29udGFpbmVyTWVzc2FnZShtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiB2b2lkIHtcbiAgY29uc3Qgbm9kZXMgPSBtZXNzYWdlLm5vZGVzO1xuICBpZiAobm9kZXMubGVuZ3RoICE9PSAxIHx8ICEobm9kZXNbMF0gaW5zdGFuY2VvZiBpMThuLkNvbnRhaW5lcikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdVbmV4cGVjdGVkIHByZXZpb3VzIGkxOG4gbWVzc2FnZSAtIGV4cGVjdGVkIGl0IHRvIGNvbnNpc3Qgb2Ygb25seSBhIHNpbmdsZSBgQ29udGFpbmVyYCBub2RlLicpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZSBgcHJldmlvdXNOb2Rlc2AgYW5kIGBub2RlYCBjb2xsZWN0aW9ucyBoYXZlIHRoZSBzYW1lIG51bWJlciBvZiBlbGVtZW50cyBhbmRcbiAqIGNvcnJlc3BvbmRpbmcgZWxlbWVudHMgaGF2ZSB0aGUgc2FtZSBub2RlIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVxdWl2YWxlbnROb2RlcyhwcmV2aW91c05vZGVzOiBpMThuLk5vZGVbXSwgbm9kZXM6IGkxOG4uTm9kZVtdKTogdm9pZCB7XG4gIGlmIChwcmV2aW91c05vZGVzLmxlbmd0aCAhPT0gbm9kZXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgbnVtYmVyIG9mIGkxOG4gbWVzc2FnZSBjaGlsZHJlbiBjaGFuZ2VkIGJldHdlZW4gZmlyc3QgYW5kIHNlY29uZCBwYXNzLicpO1xuICB9XG4gIGlmIChwcmV2aW91c05vZGVzLnNvbWUoKG5vZGUsIGkpID0+IG5vZGVzW2ldLmNvbnN0cnVjdG9yICE9PSBub2RlLmNvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1RoZSB0eXBlcyBvZiB0aGUgaTE4biBtZXNzYWdlIGNoaWxkcmVuIGNoYW5nZWQgYmV0d2VlbiBmaXJzdCBhbmQgc2Vjb25kIHBhc3MuJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgYFBhcnNlU291cmNlU3BhbmAgZnJvbSB0aGUgYHNvdXJjZVNwYW5gLCBvZmZzZXQgYnkgdGhlIGBzdGFydGAgYW5kIGBlbmRgIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gZ2V0T2Zmc2V0U291cmNlU3BhbihcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHtzdGFydCwgZW5kfTogSW50ZXJwb2xhdGlvblBpZWNlKTogUGFyc2VTb3VyY2VTcGFuIHtcbiAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oc291cmNlU3Bhbi5mdWxsU3RhcnQubW92ZUJ5KHN0YXJ0KSwgc291cmNlU3Bhbi5mdWxsU3RhcnQubW92ZUJ5KGVuZCkpO1xufVxuXG5jb25zdCBfQ1VTVE9NX1BIX0VYUCA9XG4gICAgL1xcL1xcL1tcXHNcXFNdKmkxOG5bXFxzXFxTXSpcXChbXFxzXFxTXSpwaFtcXHNcXFNdKj1bXFxzXFxTXSooXCJ8JykoW1xcc1xcU10qPylcXDFbXFxzXFxTXSpcXCkvZztcblxuZnVuY3Rpb24gZXh0cmFjdFBsYWNlaG9sZGVyTmFtZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnNwbGl0KF9DVVNUT01fUEhfRVhQKVsyXTtcbn1cbiJdfQ==
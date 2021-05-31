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
        define("@angular/compiler/src/i18n/translation_bundle", ["require", "exports", "tslib", "@angular/compiler/src/core", "@angular/compiler/src/ml_parser/html_parser", "@angular/compiler/src/i18n/parse_util", "@angular/compiler/src/i18n/serializers/xml_helper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TranslationBundle = void 0;
    var tslib_1 = require("tslib");
    var core_1 = require("@angular/compiler/src/core");
    var html_parser_1 = require("@angular/compiler/src/ml_parser/html_parser");
    var parse_util_1 = require("@angular/compiler/src/i18n/parse_util");
    var xml_helper_1 = require("@angular/compiler/src/i18n/serializers/xml_helper");
    /**
     * A container for translated messages
     */
    var TranslationBundle = /** @class */ (function () {
        function TranslationBundle(_i18nNodesByMsgId, locale, digest, mapperFactory, missingTranslationStrategy, console) {
            if (_i18nNodesByMsgId === void 0) { _i18nNodesByMsgId = {}; }
            if (missingTranslationStrategy === void 0) { missingTranslationStrategy = core_1.MissingTranslationStrategy.Warning; }
            this._i18nNodesByMsgId = _i18nNodesByMsgId;
            this.digest = digest;
            this.mapperFactory = mapperFactory;
            this._i18nToHtml = new I18nToHtmlVisitor(_i18nNodesByMsgId, locale, digest, mapperFactory, missingTranslationStrategy, console);
        }
        // Creates a `TranslationBundle` by parsing the given `content` with the `serializer`.
        TranslationBundle.load = function (content, url, serializer, missingTranslationStrategy, console) {
            var _a = serializer.load(content, url), locale = _a.locale, i18nNodesByMsgId = _a.i18nNodesByMsgId;
            var digestFn = function (m) { return serializer.digest(m); };
            var mapperFactory = function (m) { return serializer.createNameMapper(m); };
            return new TranslationBundle(i18nNodesByMsgId, locale, digestFn, mapperFactory, missingTranslationStrategy, console);
        };
        // Returns the translation as HTML nodes from the given source message.
        TranslationBundle.prototype.get = function (srcMsg) {
            var html = this._i18nToHtml.convert(srcMsg);
            if (html.errors.length) {
                throw new Error(html.errors.join('\n'));
            }
            return html.nodes;
        };
        TranslationBundle.prototype.has = function (srcMsg) {
            return this.digest(srcMsg) in this._i18nNodesByMsgId;
        };
        return TranslationBundle;
    }());
    exports.TranslationBundle = TranslationBundle;
    var I18nToHtmlVisitor = /** @class */ (function () {
        function I18nToHtmlVisitor(_i18nNodesByMsgId, _locale, _digest, _mapperFactory, _missingTranslationStrategy, _console) {
            if (_i18nNodesByMsgId === void 0) { _i18nNodesByMsgId = {}; }
            this._i18nNodesByMsgId = _i18nNodesByMsgId;
            this._locale = _locale;
            this._digest = _digest;
            this._mapperFactory = _mapperFactory;
            this._missingTranslationStrategy = _missingTranslationStrategy;
            this._console = _console;
            this._contextStack = [];
            this._errors = [];
        }
        I18nToHtmlVisitor.prototype.convert = function (srcMsg) {
            this._contextStack.length = 0;
            this._errors.length = 0;
            // i18n to text
            var text = this._convertToText(srcMsg);
            // text to html
            var url = srcMsg.nodes[0].sourceSpan.start.file.url;
            var html = new html_parser_1.HtmlParser().parse(text, url, { tokenizeExpansionForms: true });
            return {
                nodes: html.rootNodes,
                errors: tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(this._errors)), tslib_1.__read(html.errors)),
            };
        };
        I18nToHtmlVisitor.prototype.visitText = function (text, context) {
            // `convert()` uses an `HtmlParser` to return `html.Node`s
            // we should then make sure that any special characters are escaped
            return xml_helper_1.escapeXml(text.value);
        };
        I18nToHtmlVisitor.prototype.visitContainer = function (container, context) {
            var _this = this;
            return container.children.map(function (n) { return n.visit(_this); }).join('');
        };
        I18nToHtmlVisitor.prototype.visitIcu = function (icu, context) {
            var _this = this;
            var cases = Object.keys(icu.cases).map(function (k) { return k + " {" + icu.cases[k].visit(_this) + "}"; });
            // TODO(vicb): Once all format switch to using expression placeholders
            // we should throw when the placeholder is not in the source message
            var exp = this._srcMsg.placeholders.hasOwnProperty(icu.expression) ?
                this._srcMsg.placeholders[icu.expression].text :
                icu.expression;
            return "{" + exp + ", " + icu.type + ", " + cases.join(' ') + "}";
        };
        I18nToHtmlVisitor.prototype.visitPlaceholder = function (ph, context) {
            var phName = this._mapper(ph.name);
            if (this._srcMsg.placeholders.hasOwnProperty(phName)) {
                return this._srcMsg.placeholders[phName].text;
            }
            if (this._srcMsg.placeholderToMessage.hasOwnProperty(phName)) {
                return this._convertToText(this._srcMsg.placeholderToMessage[phName]);
            }
            this._addError(ph, "Unknown placeholder \"" + ph.name + "\"");
            return '';
        };
        // Loaded message contains only placeholders (vs tag and icu placeholders).
        // However when a translation can not be found, we need to serialize the source message
        // which can contain tag placeholders
        I18nToHtmlVisitor.prototype.visitTagPlaceholder = function (ph, context) {
            var _this = this;
            var tag = "" + ph.tag;
            var attrs = Object.keys(ph.attrs).map(function (name) { return name + "=\"" + ph.attrs[name] + "\""; }).join(' ');
            if (ph.isVoid) {
                return "<" + tag + " " + attrs + "/>";
            }
            var children = ph.children.map(function (c) { return c.visit(_this); }).join('');
            return "<" + tag + " " + attrs + ">" + children + "</" + tag + ">";
        };
        // Loaded message contains only placeholders (vs tag and icu placeholders).
        // However when a translation can not be found, we need to serialize the source message
        // which can contain tag placeholders
        I18nToHtmlVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
            // An ICU placeholder references the source message to be serialized
            return this._convertToText(this._srcMsg.placeholderToMessage[ph.name]);
        };
        /**
         * Convert a source message to a translated text string:
         * - text nodes are replaced with their translation,
         * - placeholders are replaced with their content,
         * - ICU nodes are converted to ICU expressions.
         */
        I18nToHtmlVisitor.prototype._convertToText = function (srcMsg) {
            var _this = this;
            var id = this._digest(srcMsg);
            var mapper = this._mapperFactory ? this._mapperFactory(srcMsg) : null;
            var nodes;
            this._contextStack.push({ msg: this._srcMsg, mapper: this._mapper });
            this._srcMsg = srcMsg;
            if (this._i18nNodesByMsgId.hasOwnProperty(id)) {
                // When there is a translation use its nodes as the source
                // And create a mapper to convert serialized placeholder names to internal names
                nodes = this._i18nNodesByMsgId[id];
                this._mapper = function (name) { return mapper ? mapper.toInternalName(name) : name; };
            }
            else {
                // When no translation has been found
                // - report an error / a warning / nothing,
                // - use the nodes from the original message
                // - placeholders are already internal and need no mapper
                if (this._missingTranslationStrategy === core_1.MissingTranslationStrategy.Error) {
                    var ctx = this._locale ? " for locale \"" + this._locale + "\"" : '';
                    this._addError(srcMsg.nodes[0], "Missing translation for message \"" + id + "\"" + ctx);
                }
                else if (this._console &&
                    this._missingTranslationStrategy === core_1.MissingTranslationStrategy.Warning) {
                    var ctx = this._locale ? " for locale \"" + this._locale + "\"" : '';
                    this._console.warn("Missing translation for message \"" + id + "\"" + ctx);
                }
                nodes = srcMsg.nodes;
                this._mapper = function (name) { return name; };
            }
            var text = nodes.map(function (node) { return node.visit(_this); }).join('');
            var context = this._contextStack.pop();
            this._srcMsg = context.msg;
            this._mapper = context.mapper;
            return text;
        };
        I18nToHtmlVisitor.prototype._addError = function (el, msg) {
            this._errors.push(new parse_util_1.I18nError(el.sourceSpan, msg));
        };
        return I18nToHtmlVisitor;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRpb25fYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2kxOG4vdHJhbnNsYXRpb25fYnVuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxtREFBbUQ7SUFFbkQsMkVBQW9EO0lBSXBELG9FQUF1QztJQUV2QyxnRkFBbUQ7SUFHbkQ7O09BRUc7SUFDSDtRQUdFLDJCQUNZLGlCQUFzRCxFQUFFLE1BQW1CLEVBQzVFLE1BQW1DLEVBQ25DLGFBQXNELEVBQzdELDBCQUEyRixFQUMzRixPQUFpQjtZQUpULGtDQUFBLEVBQUEsc0JBQXNEO1lBRzlELDJDQUFBLEVBQUEsNkJBQXlELGlDQUEwQixDQUFDLE9BQU87WUFIbkYsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFxQztZQUN2RCxXQUFNLEdBQU4sTUFBTSxDQUE2QjtZQUNuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBeUM7WUFHL0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGlCQUFpQixDQUNwQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWMsRUFBRSwwQkFBMEIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RixDQUFDO1FBRUQsc0ZBQXNGO1FBQy9FLHNCQUFJLEdBQVgsVUFDSSxPQUFlLEVBQUUsR0FBVyxFQUFFLFVBQXNCLEVBQ3BELDBCQUFzRCxFQUN0RCxPQUFpQjtZQUNiLElBQUEsS0FBNkIsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQXpELE1BQU0sWUFBQSxFQUFFLGdCQUFnQixzQkFBaUMsQ0FBQztZQUNqRSxJQUFNLFFBQVEsR0FBRyxVQUFDLENBQWUsSUFBSyxPQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQXBCLENBQW9CLENBQUM7WUFDM0QsSUFBTSxhQUFh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QUFDLElBQUksc0JBQVMsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNILHdCQUFDO0lBQUQsQ0FBQyxBQXZJRCxJQXVJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge01pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5fSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIGh0bWwgZnJvbSAnLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge0NvbnNvbGV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4vaTE4bl9hc3QnO1xuaW1wb3J0IHtJMThuRXJyb3J9IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge1BsYWNlaG9sZGVyTWFwcGVyLCBTZXJpYWxpemVyfSBmcm9tICcuL3NlcmlhbGl6ZXJzL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtlc2NhcGVYbWx9IGZyb20gJy4vc2VyaWFsaXplcnMveG1sX2hlbHBlcic7XG5cblxuLyoqXG4gKiBBIGNvbnRhaW5lciBmb3IgdHJhbnNsYXRlZCBtZXNzYWdlc1xuICovXG5leHBvcnQgY2xhc3MgVHJhbnNsYXRpb25CdW5kbGUge1xuICBwcml2YXRlIF9pMThuVG9IdG1sOiBJMThuVG9IdG1sVmlzaXRvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2kxOG5Ob2Rlc0J5TXNnSWQ6IHtbbXNnSWQ6IHN0cmluZ106IGkxOG4uTm9kZVtdfSA9IHt9LCBsb2NhbGU6IHN0cmluZ3xudWxsLFxuICAgICAgcHVibGljIGRpZ2VzdDogKG06IGkxOG4uTWVzc2FnZSkgPT4gc3RyaW5nLFxuICAgICAgcHVibGljIG1hcHBlckZhY3Rvcnk/OiAobTogaTE4bi5NZXNzYWdlKSA9PiBQbGFjZWhvbGRlck1hcHBlcixcbiAgICAgIG1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5OiBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneSA9IE1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5Lldhcm5pbmcsXG4gICAgICBjb25zb2xlPzogQ29uc29sZSkge1xuICAgIHRoaXMuX2kxOG5Ub0h0bWwgPSBuZXcgSTE4blRvSHRtbFZpc2l0b3IoXG4gICAgICAgIF9pMThuTm9kZXNCeU1zZ0lkLCBsb2NhbGUsIGRpZ2VzdCwgbWFwcGVyRmFjdG9yeSEsIG1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5LCBjb25zb2xlKTtcbiAgfVxuXG4gIC8vIENyZWF0ZXMgYSBgVHJhbnNsYXRpb25CdW5kbGVgIGJ5IHBhcnNpbmcgdGhlIGdpdmVuIGBjb250ZW50YCB3aXRoIHRoZSBgc2VyaWFsaXplcmAuXG4gIHN0YXRpYyBsb2FkKFxuICAgICAgY29udGVudDogc3RyaW5nLCB1cmw6IHN0cmluZywgc2VyaWFsaXplcjogU2VyaWFsaXplcixcbiAgICAgIG1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5OiBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneSxcbiAgICAgIGNvbnNvbGU/OiBDb25zb2xlKTogVHJhbnNsYXRpb25CdW5kbGUge1xuICAgIGNvbnN0IHtsb2NhbGUsIGkxOG5Ob2Rlc0J5TXNnSWR9ID0gc2VyaWFsaXplci5sb2FkKGNvbnRlbnQsIHVybCk7XG4gICAgY29uc3QgZGlnZXN0Rm4gPSAobTogaTE4bi5NZXNzYWdlKSA9PiBzZXJpYWxpemVyLmRpZ2VzdChtKTtcbiAgICBjb25zdCBtYXBwZXJGYWN0b3J5ID0gKG06IGkxOG4uTWVzc2FnZSkgPT4gc2VyaWFsaXplci5jcmVhdGVOYW1lTWFwcGVyKG0pITtcbiAgICByZXR1cm4gbmV3IFRyYW5zbGF0aW9uQnVuZGxlKFxuICAgICAgICBpMThuTm9kZXNCeU1zZ0lkLCBsb2NhbGUsIGRpZ2VzdEZuLCBtYXBwZXJGYWN0b3J5LCBtaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneSwgY29uc29sZSk7XG4gIH1cblxuICAvLyBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiBhcyBIVE1MIG5vZGVzIGZyb20gdGhlIGdpdmVuIHNvdXJjZSBtZXNzYWdlLlxuICBnZXQoc3JjTXNnOiBpMThuLk1lc3NhZ2UpOiBodG1sLk5vZGVbXSB7XG4gICAgY29uc3QgaHRtbCA9IHRoaXMuX2kxOG5Ub0h0bWwuY29udmVydChzcmNNc2cpO1xuXG4gICAgaWYgKGh0bWwuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGh0bWwuZXJyb3JzLmpvaW4oJ1xcbicpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaHRtbC5ub2RlcztcbiAgfVxuXG4gIGhhcyhzcmNNc2c6IGkxOG4uTWVzc2FnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmRpZ2VzdChzcmNNc2cpIGluIHRoaXMuX2kxOG5Ob2Rlc0J5TXNnSWQ7XG4gIH1cbn1cblxuY2xhc3MgSTE4blRvSHRtbFZpc2l0b3IgaW1wbGVtZW50cyBpMThuLlZpc2l0b3Ige1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfc3JjTXNnITogaTE4bi5NZXNzYWdlO1xuICBwcml2YXRlIF9jb250ZXh0U3RhY2s6IHttc2c6IGkxOG4uTWVzc2FnZSwgbWFwcGVyOiAobmFtZTogc3RyaW5nKSA9PiBzdHJpbmd9W10gPSBbXTtcbiAgcHJpdmF0ZSBfZXJyb3JzOiBJMThuRXJyb3JbXSA9IFtdO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfbWFwcGVyITogKG5hbWU6IHN0cmluZykgPT4gc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfaTE4bk5vZGVzQnlNc2dJZDoge1ttc2dJZDogc3RyaW5nXTogaTE4bi5Ob2RlW119ID0ge30sIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nfG51bGwsXG4gICAgICBwcml2YXRlIF9kaWdlc3Q6IChtOiBpMThuLk1lc3NhZ2UpID0+IHN0cmluZyxcbiAgICAgIHByaXZhdGUgX21hcHBlckZhY3Rvcnk6IChtOiBpMThuLk1lc3NhZ2UpID0+IFBsYWNlaG9sZGVyTWFwcGVyLFxuICAgICAgcHJpdmF0ZSBfbWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3k6IE1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5LCBwcml2YXRlIF9jb25zb2xlPzogQ29uc29sZSkge1xuICB9XG5cbiAgY29udmVydChzcmNNc2c6IGkxOG4uTWVzc2FnZSk6IHtub2RlczogaHRtbC5Ob2RlW10sIGVycm9yczogSTE4bkVycm9yW119IHtcbiAgICB0aGlzLl9jb250ZXh0U3RhY2subGVuZ3RoID0gMDtcbiAgICB0aGlzLl9lcnJvcnMubGVuZ3RoID0gMDtcblxuICAgIC8vIGkxOG4gdG8gdGV4dFxuICAgIGNvbnN0IHRleHQgPSB0aGlzLl9jb252ZXJ0VG9UZXh0KHNyY01zZyk7XG5cbiAgICAvLyB0ZXh0IHRvIGh0bWxcbiAgICBjb25zdCB1cmwgPSBzcmNNc2cubm9kZXNbMF0uc291cmNlU3Bhbi5zdGFydC5maWxlLnVybDtcbiAgICBjb25zdCBodG1sID0gbmV3IEh0bWxQYXJzZXIoKS5wYXJzZSh0ZXh0LCB1cmwsIHt0b2tlbml6ZUV4cGFuc2lvbkZvcm1zOiB0cnVlfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbm9kZXM6IGh0bWwucm9vdE5vZGVzLFxuICAgICAgZXJyb3JzOiBbLi4udGhpcy5fZXJyb3JzLCAuLi5odG1sLmVycm9yc10sXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBpMThuLlRleHQsIGNvbnRleHQ/OiBhbnkpOiBzdHJpbmcge1xuICAgIC8vIGBjb252ZXJ0KClgIHVzZXMgYW4gYEh0bWxQYXJzZXJgIHRvIHJldHVybiBgaHRtbC5Ob2RlYHNcbiAgICAvLyB3ZSBzaG91bGQgdGhlbiBtYWtlIHN1cmUgdGhhdCBhbnkgc3BlY2lhbCBjaGFyYWN0ZXJzIGFyZSBlc2NhcGVkXG4gICAgcmV0dXJuIGVzY2FwZVhtbCh0ZXh0LnZhbHVlKTtcbiAgfVxuXG4gIHZpc2l0Q29udGFpbmVyKGNvbnRhaW5lcjogaTE4bi5Db250YWluZXIsIGNvbnRleHQ/OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBjb250YWluZXIuY2hpbGRyZW4ubWFwKG4gPT4gbi52aXNpdCh0aGlzKSkuam9pbignJyk7XG4gIH1cblxuICB2aXNpdEljdShpY3U6IGkxOG4uSWN1LCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICBjb25zdCBjYXNlcyA9IE9iamVjdC5rZXlzKGljdS5jYXNlcykubWFwKGsgPT4gYCR7a30geyR7aWN1LmNhc2VzW2tdLnZpc2l0KHRoaXMpfX1gKTtcblxuICAgIC8vIFRPRE8odmljYik6IE9uY2UgYWxsIGZvcm1hdCBzd2l0Y2ggdG8gdXNpbmcgZXhwcmVzc2lvbiBwbGFjZWhvbGRlcnNcbiAgICAvLyB3ZSBzaG91bGQgdGhyb3cgd2hlbiB0aGUgcGxhY2Vob2xkZXIgaXMgbm90IGluIHRoZSBzb3VyY2UgbWVzc2FnZVxuICAgIGNvbnN0IGV4cCA9IHRoaXMuX3NyY01zZy5wbGFjZWhvbGRlcnMuaGFzT3duUHJvcGVydHkoaWN1LmV4cHJlc3Npb24pID9cbiAgICAgICAgdGhpcy5fc3JjTXNnLnBsYWNlaG9sZGVyc1tpY3UuZXhwcmVzc2lvbl0udGV4dCA6XG4gICAgICAgIGljdS5leHByZXNzaW9uO1xuXG4gICAgcmV0dXJuIGB7JHtleHB9LCAke2ljdS50eXBlfSwgJHtjYXNlcy5qb2luKCcgJyl9fWA7XG4gIH1cblxuICB2aXNpdFBsYWNlaG9sZGVyKHBoOiBpMThuLlBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogc3RyaW5nIHtcbiAgICBjb25zdCBwaE5hbWUgPSB0aGlzLl9tYXBwZXIocGgubmFtZSk7XG4gICAgaWYgKHRoaXMuX3NyY01zZy5wbGFjZWhvbGRlcnMuaGFzT3duUHJvcGVydHkocGhOYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NyY01zZy5wbGFjZWhvbGRlcnNbcGhOYW1lXS50ZXh0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zcmNNc2cucGxhY2Vob2xkZXJUb01lc3NhZ2UuaGFzT3duUHJvcGVydHkocGhOYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRUb1RleHQodGhpcy5fc3JjTXNnLnBsYWNlaG9sZGVyVG9NZXNzYWdlW3BoTmFtZV0pO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZEVycm9yKHBoLCBgVW5rbm93biBwbGFjZWhvbGRlciBcIiR7cGgubmFtZX1cImApO1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8vIExvYWRlZCBtZXNzYWdlIGNvbnRhaW5zIG9ubHkgcGxhY2Vob2xkZXJzICh2cyB0YWcgYW5kIGljdSBwbGFjZWhvbGRlcnMpLlxuICAvLyBIb3dldmVyIHdoZW4gYSB0cmFuc2xhdGlvbiBjYW4gbm90IGJlIGZvdW5kLCB3ZSBuZWVkIHRvIHNlcmlhbGl6ZSB0aGUgc291cmNlIG1lc3NhZ2VcbiAgLy8gd2hpY2ggY2FuIGNvbnRhaW4gdGFnIHBsYWNlaG9sZGVyc1xuICB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogc3RyaW5nIHtcbiAgICBjb25zdCB0YWcgPSBgJHtwaC50YWd9YDtcbiAgICBjb25zdCBhdHRycyA9IE9iamVjdC5rZXlzKHBoLmF0dHJzKS5tYXAobmFtZSA9PiBgJHtuYW1lfT1cIiR7cGguYXR0cnNbbmFtZV19XCJgKS5qb2luKCcgJyk7XG4gICAgaWYgKHBoLmlzVm9pZCkge1xuICAgICAgcmV0dXJuIGA8JHt0YWd9ICR7YXR0cnN9Lz5gO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZHJlbiA9IHBoLmNoaWxkcmVuLm1hcCgoYzogaTE4bi5Ob2RlKSA9PiBjLnZpc2l0KHRoaXMpKS5qb2luKCcnKTtcbiAgICByZXR1cm4gYDwke3RhZ30gJHthdHRyc30+JHtjaGlsZHJlbn08LyR7dGFnfT5gO1xuICB9XG5cbiAgLy8gTG9hZGVkIG1lc3NhZ2UgY29udGFpbnMgb25seSBwbGFjZWhvbGRlcnMgKHZzIHRhZyBhbmQgaWN1IHBsYWNlaG9sZGVycykuXG4gIC8vIEhvd2V2ZXIgd2hlbiBhIHRyYW5zbGF0aW9uIGNhbiBub3QgYmUgZm91bmQsIHdlIG5lZWQgdG8gc2VyaWFsaXplIHRoZSBzb3VyY2UgbWVzc2FnZVxuICAvLyB3aGljaCBjYW4gY29udGFpbiB0YWcgcGxhY2Vob2xkZXJzXG4gIHZpc2l0SWN1UGxhY2Vob2xkZXIocGg6IGkxOG4uSWN1UGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiBzdHJpbmcge1xuICAgIC8vIEFuIElDVSBwbGFjZWhvbGRlciByZWZlcmVuY2VzIHRoZSBzb3VyY2UgbWVzc2FnZSB0byBiZSBzZXJpYWxpemVkXG4gICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRUb1RleHQodGhpcy5fc3JjTXNnLnBsYWNlaG9sZGVyVG9NZXNzYWdlW3BoLm5hbWVdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgc291cmNlIG1lc3NhZ2UgdG8gYSB0cmFuc2xhdGVkIHRleHQgc3RyaW5nOlxuICAgKiAtIHRleHQgbm9kZXMgYXJlIHJlcGxhY2VkIHdpdGggdGhlaXIgdHJhbnNsYXRpb24sXG4gICAqIC0gcGxhY2Vob2xkZXJzIGFyZSByZXBsYWNlZCB3aXRoIHRoZWlyIGNvbnRlbnQsXG4gICAqIC0gSUNVIG5vZGVzIGFyZSBjb252ZXJ0ZWQgdG8gSUNVIGV4cHJlc3Npb25zLlxuICAgKi9cbiAgcHJpdmF0ZSBfY29udmVydFRvVGV4dChzcmNNc2c6IGkxOG4uTWVzc2FnZSk6IHN0cmluZyB7XG4gICAgY29uc3QgaWQgPSB0aGlzLl9kaWdlc3Qoc3JjTXNnKTtcbiAgICBjb25zdCBtYXBwZXIgPSB0aGlzLl9tYXBwZXJGYWN0b3J5ID8gdGhpcy5fbWFwcGVyRmFjdG9yeShzcmNNc2cpIDogbnVsbDtcbiAgICBsZXQgbm9kZXM6IGkxOG4uTm9kZVtdO1xuXG4gICAgdGhpcy5fY29udGV4dFN0YWNrLnB1c2goe21zZzogdGhpcy5fc3JjTXNnLCBtYXBwZXI6IHRoaXMuX21hcHBlcn0pO1xuICAgIHRoaXMuX3NyY01zZyA9IHNyY01zZztcblxuICAgIGlmICh0aGlzLl9pMThuTm9kZXNCeU1zZ0lkLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgICAgLy8gV2hlbiB0aGVyZSBpcyBhIHRyYW5zbGF0aW9uIHVzZSBpdHMgbm9kZXMgYXMgdGhlIHNvdXJjZVxuICAgICAgLy8gQW5kIGNyZWF0ZSBhIG1hcHBlciB0byBjb252ZXJ0IHNlcmlhbGl6ZWQgcGxhY2Vob2xkZXIgbmFtZXMgdG8gaW50ZXJuYWwgbmFtZXNcbiAgICAgIG5vZGVzID0gdGhpcy5faTE4bk5vZGVzQnlNc2dJZFtpZF07XG4gICAgICB0aGlzLl9tYXBwZXIgPSAobmFtZTogc3RyaW5nKSA9PiBtYXBwZXIgPyBtYXBwZXIudG9JbnRlcm5hbE5hbWUobmFtZSkhIDogbmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2hlbiBubyB0cmFuc2xhdGlvbiBoYXMgYmVlbiBmb3VuZFxuICAgICAgLy8gLSByZXBvcnQgYW4gZXJyb3IgLyBhIHdhcm5pbmcgLyBub3RoaW5nLFxuICAgICAgLy8gLSB1c2UgdGhlIG5vZGVzIGZyb20gdGhlIG9yaWdpbmFsIG1lc3NhZ2VcbiAgICAgIC8vIC0gcGxhY2Vob2xkZXJzIGFyZSBhbHJlYWR5IGludGVybmFsIGFuZCBuZWVkIG5vIG1hcHBlclxuICAgICAgaWYgKHRoaXMuX21pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5ID09PSBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5FcnJvcikge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9sb2NhbGUgPyBgIGZvciBsb2NhbGUgXCIke3RoaXMuX2xvY2FsZX1cImAgOiAnJztcbiAgICAgICAgdGhpcy5fYWRkRXJyb3Ioc3JjTXNnLm5vZGVzWzBdLCBgTWlzc2luZyB0cmFuc2xhdGlvbiBmb3IgbWVzc2FnZSBcIiR7aWR9XCIke2N0eH1gKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdGhpcy5fY29uc29sZSAmJlxuICAgICAgICAgIHRoaXMuX21pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5ID09PSBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5XYXJuaW5nKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2xvY2FsZSA/IGAgZm9yIGxvY2FsZSBcIiR7dGhpcy5fbG9jYWxlfVwiYCA6ICcnO1xuICAgICAgICB0aGlzLl9jb25zb2xlLndhcm4oYE1pc3NpbmcgdHJhbnNsYXRpb24gZm9yIG1lc3NhZ2UgXCIke2lkfVwiJHtjdHh9YCk7XG4gICAgICB9XG4gICAgICBub2RlcyA9IHNyY01zZy5ub2RlcztcbiAgICAgIHRoaXMuX21hcHBlciA9IChuYW1lOiBzdHJpbmcpID0+IG5hbWU7XG4gICAgfVxuICAgIGNvbnN0IHRleHQgPSBub2Rlcy5tYXAobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMpKS5qb2luKCcnKTtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fY29udGV4dFN0YWNrLnBvcCgpITtcbiAgICB0aGlzLl9zcmNNc2cgPSBjb250ZXh0Lm1zZztcbiAgICB0aGlzLl9tYXBwZXIgPSBjb250ZXh0Lm1hcHBlcjtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZEVycm9yKGVsOiBpMThuLk5vZGUsIG1zZzogc3RyaW5nKSB7XG4gICAgdGhpcy5fZXJyb3JzLnB1c2gobmV3IEkxOG5FcnJvcihlbC5zb3VyY2VTcGFuLCBtc2cpKTtcbiAgfVxufVxuIl19
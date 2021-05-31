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
        define("@angular/compiler/src/i18n/serializers/xliff2", ["require", "exports", "tslib", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/xml_parser", "@angular/compiler/src/i18n/digest", "@angular/compiler/src/i18n/i18n_ast", "@angular/compiler/src/i18n/parse_util", "@angular/compiler/src/i18n/serializers/serializer", "@angular/compiler/src/i18n/serializers/xml_helper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Xliff2 = void 0;
    var tslib_1 = require("tslib");
    var ml = require("@angular/compiler/src/ml_parser/ast");
    var xml_parser_1 = require("@angular/compiler/src/ml_parser/xml_parser");
    var digest_1 = require("@angular/compiler/src/i18n/digest");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var parse_util_1 = require("@angular/compiler/src/i18n/parse_util");
    var serializer_1 = require("@angular/compiler/src/i18n/serializers/serializer");
    var xml = require("@angular/compiler/src/i18n/serializers/xml_helper");
    var _VERSION = '2.0';
    var _XMLNS = 'urn:oasis:names:tc:xliff:document:2.0';
    // TODO(vicb): make this a param (s/_/-/)
    var _DEFAULT_SOURCE_LANG = 'en';
    var _PLACEHOLDER_TAG = 'ph';
    var _PLACEHOLDER_SPANNING_TAG = 'pc';
    var _MARKER_TAG = 'mrk';
    var _XLIFF_TAG = 'xliff';
    var _SOURCE_TAG = 'source';
    var _TARGET_TAG = 'target';
    var _UNIT_TAG = 'unit';
    // https://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
    var Xliff2 = /** @class */ (function (_super) {
        tslib_1.__extends(Xliff2, _super);
        function Xliff2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Xliff2.prototype.write = function (messages, locale) {
            var visitor = new _WriteVisitor();
            var units = [];
            messages.forEach(function (message) {
                var unit = new xml.Tag(_UNIT_TAG, { id: message.id });
                var notes = new xml.Tag('notes');
                if (message.description || message.meaning) {
                    if (message.description) {
                        notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'description' }, [new xml.Text(message.description)]));
                    }
                    if (message.meaning) {
                        notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'meaning' }, [new xml.Text(message.meaning)]));
                    }
                }
                message.sources.forEach(function (source) {
                    notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'location' }, [
                        new xml.Text(source.filePath + ":" + source.startLine + (source.endLine !== source.startLine ? ',' + source.endLine : ''))
                    ]));
                });
                notes.children.push(new xml.CR(6));
                unit.children.push(new xml.CR(6), notes);
                var segment = new xml.Tag('segment');
                segment.children.push(new xml.CR(8), new xml.Tag(_SOURCE_TAG, {}, visitor.serialize(message.nodes)), new xml.CR(6));
                unit.children.push(new xml.CR(6), segment, new xml.CR(4));
                units.push(new xml.CR(4), unit);
            });
            var file = new xml.Tag('file', { 'original': 'ng.template', id: 'ngi18n' }, tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(units)), [new xml.CR(2)]));
            var xliff = new xml.Tag(_XLIFF_TAG, { version: _VERSION, xmlns: _XMLNS, srcLang: locale || _DEFAULT_SOURCE_LANG }, [new xml.CR(2), file, new xml.CR()]);
            return xml.serialize([
                new xml.Declaration({ version: '1.0', encoding: 'UTF-8' }), new xml.CR(), xliff, new xml.CR()
            ]);
        };
        Xliff2.prototype.load = function (content, url) {
            // xliff to xml nodes
            var xliff2Parser = new Xliff2Parser();
            var _a = xliff2Parser.parse(content, url), locale = _a.locale, msgIdToHtml = _a.msgIdToHtml, errors = _a.errors;
            // xml nodes to i18n nodes
            var i18nNodesByMsgId = {};
            var converter = new XmlToI18n();
            Object.keys(msgIdToHtml).forEach(function (msgId) {
                var _a = converter.convert(msgIdToHtml[msgId], url), i18nNodes = _a.i18nNodes, e = _a.errors;
                errors.push.apply(errors, tslib_1.__spreadArray([], tslib_1.__read(e)));
                i18nNodesByMsgId[msgId] = i18nNodes;
            });
            if (errors.length) {
                throw new Error("xliff2 parse errors:\n" + errors.join('\n'));
            }
            return { locale: locale, i18nNodesByMsgId: i18nNodesByMsgId };
        };
        Xliff2.prototype.digest = function (message) {
            return digest_1.decimalDigest(message);
        };
        return Xliff2;
    }(serializer_1.Serializer));
    exports.Xliff2 = Xliff2;
    var _WriteVisitor = /** @class */ (function () {
        function _WriteVisitor() {
        }
        _WriteVisitor.prototype.visitText = function (text, context) {
            return [new xml.Text(text.value)];
        };
        _WriteVisitor.prototype.visitContainer = function (container, context) {
            var _this = this;
            var nodes = [];
            container.children.forEach(function (node) { return nodes.push.apply(nodes, tslib_1.__spreadArray([], tslib_1.__read(node.visit(_this)))); });
            return nodes;
        };
        _WriteVisitor.prototype.visitIcu = function (icu, context) {
            var _this = this;
            var nodes = [new xml.Text("{" + icu.expressionPlaceholder + ", " + icu.type + ", ")];
            Object.keys(icu.cases).forEach(function (c) {
                nodes.push.apply(nodes, tslib_1.__spreadArray(tslib_1.__spreadArray([new xml.Text(c + " {")], tslib_1.__read(icu.cases[c].visit(_this))), [new xml.Text("} ")]));
            });
            nodes.push(new xml.Text("}"));
            return nodes;
        };
        _WriteVisitor.prototype.visitTagPlaceholder = function (ph, context) {
            var _this = this;
            var type = getTypeForTag(ph.tag);
            if (ph.isVoid) {
                var tagPh = new xml.Tag(_PLACEHOLDER_TAG, {
                    id: (this._nextPlaceholderId++).toString(),
                    equiv: ph.startName,
                    type: type,
                    disp: "<" + ph.tag + "/>",
                });
                return [tagPh];
            }
            var tagPc = new xml.Tag(_PLACEHOLDER_SPANNING_TAG, {
                id: (this._nextPlaceholderId++).toString(),
                equivStart: ph.startName,
                equivEnd: ph.closeName,
                type: type,
                dispStart: "<" + ph.tag + ">",
                dispEnd: "</" + ph.tag + ">",
            });
            var nodes = [].concat.apply([], tslib_1.__spreadArray([], tslib_1.__read(ph.children.map(function (node) { return node.visit(_this); }))));
            if (nodes.length) {
                nodes.forEach(function (node) { return tagPc.children.push(node); });
            }
            else {
                tagPc.children.push(new xml.Text(''));
            }
            return [tagPc];
        };
        _WriteVisitor.prototype.visitPlaceholder = function (ph, context) {
            var idStr = (this._nextPlaceholderId++).toString();
            return [new xml.Tag(_PLACEHOLDER_TAG, {
                    id: idStr,
                    equiv: ph.name,
                    disp: "{{" + ph.value + "}}",
                })];
        };
        _WriteVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
            var cases = Object.keys(ph.value.cases).map(function (value) { return value + ' {...}'; }).join(' ');
            var idStr = (this._nextPlaceholderId++).toString();
            return [new xml.Tag(_PLACEHOLDER_TAG, { id: idStr, equiv: ph.name, disp: "{" + ph.value.expression + ", " + ph.value.type + ", " + cases + "}" })];
        };
        _WriteVisitor.prototype.serialize = function (nodes) {
            var _this = this;
            this._nextPlaceholderId = 0;
            return [].concat.apply([], tslib_1.__spreadArray([], tslib_1.__read(nodes.map(function (node) { return node.visit(_this); }))));
        };
        return _WriteVisitor;
    }());
    // Extract messages as xml nodes from the xliff file
    var Xliff2Parser = /** @class */ (function () {
        function Xliff2Parser() {
            this._locale = null;
        }
        Xliff2Parser.prototype.parse = function (xliff, url) {
            this._unitMlString = null;
            this._msgIdToHtml = {};
            var xml = new xml_parser_1.XmlParser().parse(xliff, url);
            this._errors = xml.errors;
            ml.visitAll(this, xml.rootNodes, null);
            return {
                msgIdToHtml: this._msgIdToHtml,
                errors: this._errors,
                locale: this._locale,
            };
        };
        Xliff2Parser.prototype.visitElement = function (element, context) {
            switch (element.name) {
                case _UNIT_TAG:
                    this._unitMlString = null;
                    var idAttr = element.attrs.find(function (attr) { return attr.name === 'id'; });
                    if (!idAttr) {
                        this._addError(element, "<" + _UNIT_TAG + "> misses the \"id\" attribute");
                    }
                    else {
                        var id = idAttr.value;
                        if (this._msgIdToHtml.hasOwnProperty(id)) {
                            this._addError(element, "Duplicated translations for msg " + id);
                        }
                        else {
                            ml.visitAll(this, element.children, null);
                            if (typeof this._unitMlString === 'string') {
                                this._msgIdToHtml[id] = this._unitMlString;
                            }
                            else {
                                this._addError(element, "Message " + id + " misses a translation");
                            }
                        }
                    }
                    break;
                case _SOURCE_TAG:
                    // ignore source message
                    break;
                case _TARGET_TAG:
                    var innerTextStart = element.startSourceSpan.end.offset;
                    var innerTextEnd = element.endSourceSpan.start.offset;
                    var content = element.startSourceSpan.start.file.content;
                    var innerText = content.slice(innerTextStart, innerTextEnd);
                    this._unitMlString = innerText;
                    break;
                case _XLIFF_TAG:
                    var localeAttr = element.attrs.find(function (attr) { return attr.name === 'trgLang'; });
                    if (localeAttr) {
                        this._locale = localeAttr.value;
                    }
                    var versionAttr = element.attrs.find(function (attr) { return attr.name === 'version'; });
                    if (versionAttr) {
                        var version = versionAttr.value;
                        if (version !== '2.0') {
                            this._addError(element, "The XLIFF file version " + version + " is not compatible with XLIFF 2.0 serializer");
                        }
                        else {
                            ml.visitAll(this, element.children, null);
                        }
                    }
                    break;
                default:
                    ml.visitAll(this, element.children, null);
            }
        };
        Xliff2Parser.prototype.visitAttribute = function (attribute, context) { };
        Xliff2Parser.prototype.visitText = function (text, context) { };
        Xliff2Parser.prototype.visitComment = function (comment, context) { };
        Xliff2Parser.prototype.visitExpansion = function (expansion, context) { };
        Xliff2Parser.prototype.visitExpansionCase = function (expansionCase, context) { };
        Xliff2Parser.prototype._addError = function (node, message) {
            this._errors.push(new parse_util_1.I18nError(node.sourceSpan, message));
        };
        return Xliff2Parser;
    }());
    // Convert ml nodes (xliff syntax) to i18n nodes
    var XmlToI18n = /** @class */ (function () {
        function XmlToI18n() {
        }
        XmlToI18n.prototype.convert = function (message, url) {
            var xmlIcu = new xml_parser_1.XmlParser().parse(message, url, { tokenizeExpansionForms: true });
            this._errors = xmlIcu.errors;
            var i18nNodes = this._errors.length > 0 || xmlIcu.rootNodes.length == 0 ?
                [] : [].concat.apply([], tslib_1.__spreadArray([], tslib_1.__read(ml.visitAll(this, xmlIcu.rootNodes))));
            return {
                i18nNodes: i18nNodes,
                errors: this._errors,
            };
        };
        XmlToI18n.prototype.visitText = function (text, context) {
            return new i18n.Text(text.value, text.sourceSpan);
        };
        XmlToI18n.prototype.visitElement = function (el, context) {
            var _this = this;
            switch (el.name) {
                case _PLACEHOLDER_TAG:
                    var nameAttr = el.attrs.find(function (attr) { return attr.name === 'equiv'; });
                    if (nameAttr) {
                        return [new i18n.Placeholder('', nameAttr.value, el.sourceSpan)];
                    }
                    this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equiv\" attribute");
                    break;
                case _PLACEHOLDER_SPANNING_TAG:
                    var startAttr = el.attrs.find(function (attr) { return attr.name === 'equivStart'; });
                    var endAttr = el.attrs.find(function (attr) { return attr.name === 'equivEnd'; });
                    if (!startAttr) {
                        this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equivStart\" attribute");
                    }
                    else if (!endAttr) {
                        this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equivEnd\" attribute");
                    }
                    else {
                        var startId = startAttr.value;
                        var endId = endAttr.value;
                        var nodes = [];
                        return nodes.concat.apply(nodes, tslib_1.__spreadArray(tslib_1.__spreadArray([new i18n.Placeholder('', startId, el.sourceSpan)], tslib_1.__read(el.children.map(function (node) { return node.visit(_this, null); }))), [new i18n.Placeholder('', endId, el.sourceSpan)]));
                    }
                    break;
                case _MARKER_TAG:
                    return [].concat.apply([], tslib_1.__spreadArray([], tslib_1.__read(ml.visitAll(this, el.children))));
                default:
                    this._addError(el, "Unexpected tag");
            }
            return null;
        };
        XmlToI18n.prototype.visitExpansion = function (icu, context) {
            var caseMap = {};
            ml.visitAll(this, icu.cases).forEach(function (c) {
                caseMap[c.value] = new i18n.Container(c.nodes, icu.sourceSpan);
            });
            return new i18n.Icu(icu.switchValue, icu.type, caseMap, icu.sourceSpan);
        };
        XmlToI18n.prototype.visitExpansionCase = function (icuCase, context) {
            return {
                value: icuCase.value,
                nodes: [].concat.apply([], tslib_1.__spreadArray([], tslib_1.__read(ml.visitAll(this, icuCase.expression)))),
            };
        };
        XmlToI18n.prototype.visitComment = function (comment, context) { };
        XmlToI18n.prototype.visitAttribute = function (attribute, context) { };
        XmlToI18n.prototype._addError = function (node, message) {
            this._errors.push(new parse_util_1.I18nError(node.sourceSpan, message));
        };
        return XmlToI18n;
    }());
    function getTypeForTag(tag) {
        switch (tag.toLowerCase()) {
            case 'br':
            case 'b':
            case 'i':
            case 'u':
                return 'fmt';
            case 'img':
                return 'image';
            case 'a':
                return 'link';
            default:
                return 'other';
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2kxOG4vc2VyaWFsaXplcnMveGxpZmYyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx3REFBMEM7SUFDMUMseUVBQXFEO0lBQ3JELDREQUF3QztJQUN4QywwREFBb0M7SUFDcEMsb0VBQXdDO0lBRXhDLGdGQUF3QztJQUN4Qyx1RUFBb0M7SUFFcEMsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLElBQU0sTUFBTSxHQUFHLHVDQUF1QyxDQUFDO0lBQ3ZELHlDQUF5QztJQUN6QyxJQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUNsQyxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUM5QixJQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQztJQUN2QyxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFFMUIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztJQUM3QixJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7SUFDN0IsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBRXpCLCtFQUErRTtJQUMvRTtRQUE0QixrQ0FBVTtRQUF0Qzs7UUFrRkEsQ0FBQztRQWpGQyxzQkFBSyxHQUFMLFVBQU0sUUFBd0IsRUFBRSxNQUFtQjtZQUNqRCxJQUFNLE9BQU8sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ3BDLElBQU0sS0FBSyxHQUFlLEVBQUUsQ0FBQztZQUU3QixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztnQkFDdEIsSUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFDLENBQUMs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RCxzQ0FBa0IsR0FBbEIsVUFBbUIsT0FBeUIsRUFBRSxPQUFZO1lBQ3hELE9BQU87Z0JBQ0wsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNwQixLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sT0FBVCxFQUFFLDJDQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBQzthQUMzRCxDQUFDO1FBQ0osQ0FBQztRQUVELGdDQUFZLEdBQVosVUFBYSxPQUFtQixFQUFFLE9BQVksSUFBRyxDQUFDO1FBRWxELGtDQUFjLEdBQWQsVUFBZSxTQUF1QixFQUFFLE9BQVksSUFBRyxDQUFDO1FBRWhELDZCQUFTLEdBQWpCLFVBQWtCLElBQWEsRUFBRSxPQUFlO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQXJGRCxJQXFGQztJQUVELFNBQVMsYUFBYSxDQUFDLEdBQVc7UUFDaEMsUUFBUSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDekIsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHO2dCQUNOLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxLQUFLO2dCQUNSLE9BQU8sT0FBTyxDQUFDO1lBQ2pCLEtBQUssR0FBRztnQkFDTixPQUFPLE1BQU0sQ0FBQztZQUNoQjtnQkFDRSxPQUFPLE9BQU8sQ0FBQztTQUNsQjtJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbWwgZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge1htbFBhcnNlcn0gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL3htbF9wYXJzZXInO1xuaW1wb3J0IHtkZWNpbWFsRGlnZXN0fSBmcm9tICcuLi9kaWdlc3QnO1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi9pMThuX2FzdCc7XG5pbXBvcnQge0kxOG5FcnJvcn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5cbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSAnLi9zZXJpYWxpemVyJztcbmltcG9ydCAqIGFzIHhtbCBmcm9tICcuL3htbF9oZWxwZXInO1xuXG5jb25zdCBfVkVSU0lPTiA9ICcyLjAnO1xuY29uc3QgX1hNTE5TID0gJ3VybjpvYXNpczpuYW1lczp0Yzp4bGlmZjpkb2N1bWVudDoyLjAnO1xuLy8gVE9ETyh2aWNiKTogbWFrZSB0aGlzIGEgcGFyYW0gKHMvXy8tLylcbmNvbnN0IF9ERUZBVUxUX1NPVVJDRV9MQU5HID0gJ2VuJztcbmNvbnN0IF9QTEFDRUhPTERFUl9UQUcgPSAncGgnO1xuY29uc3QgX1BMQUNFSE9MREVSX1NQQU5OSU5HX1RBRyA9ICdwYyc7XG5jb25zdCBfTUFSS0VSX1RBRyA9ICdtcmsnO1xuXG5jb25zdCBfWExJRkZfVEFHID0gJ3hsaWZmJztcbmNvbnN0IF9TT1VSQ0VfVEFHID0gJ3NvdXJjZSc7XG5jb25zdCBfVEFSR0VUX1RBRyA9ICd0YXJnZXQnO1xuY29uc3QgX1VOSVRfVEFHID0gJ3VuaXQnO1xuXG4vLyBodHRwczovL2RvY3Mub2FzaXMtb3Blbi5vcmcveGxpZmYveGxpZmYtY29yZS92Mi4wL29zL3hsaWZmLWNvcmUtdjIuMC1vcy5odG1sXG5leHBvcnQgY2xhc3MgWGxpZmYyIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gIHdyaXRlKG1lc3NhZ2VzOiBpMThuLk1lc3NhZ2VbXSwgbG9jYWxlOiBzdHJpbmd8bnVsbCk6IHN0cmluZyB7XG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBfV3JpdGVWaXNpdG9yKCk7XG4gICAgY29uc3QgdW5pdHM6IHhtbC5Ob2RlW10gPSBbXTtcblxuICAgIG1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICBjb25zdCB1bml0ID0gbmV3IHhtbC5UYWcoX1VOSVRfVEFHLCB7aWQ6IG1lc3NhZ2UuaWR9KTtcbiAgICAgIGNvbnN0IG5vdGVzID0gbmV3IHhtbC5UYWcoJ25vdGVzJyk7XG5cbiAgICAgIGlmIChtZXNzYWdlLmRlc2NyaXB0aW9uIHx8IG1lc3NhZ2UubWVhbmluZykge1xuICAgICAgICBpZiAobWVzc2FnZS5kZXNjcmlwdGlvbikge1xuICAgICAgICAgIG5vdGVzLmNoaWxkcmVuLnB1c2goXG4gICAgICAgICAgICAgIG5ldyB4bWwuQ1IoOCksXG4gICAgICAgICAgICAgIG5ldyB4bWwuVGFnKCdub3RlJywge2NhdGVnb3J5OiAnZGVzY3JpcHRpb24nfSwgW25ldyB4bWwuVGV4dChtZXNzYWdlLmRlc2NyaXB0aW9uKV0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXNzYWdlLm1lYW5pbmcpIHtcbiAgICAgICAgICBub3Rlcy5jaGlsZHJlbi5wdXNoKFxuICAgICAgICAgICAgICBuZXcgeG1sLkNSKDgpLFxuICAgICAgICAgICAgICBuZXcgeG1sLlRhZygnbm90ZScsIHtjYXRlZ29yeTogJ21lYW5pbmcnfSwgW25ldyB4bWwuVGV4dChtZXNzYWdlLm1lYW5pbmcpXSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lc3NhZ2Uuc291cmNlcy5mb3JFYWNoKChzb3VyY2U6IGkxOG4uTWVzc2FnZVNwYW4pID0+IHtcbiAgICAgICAgbm90ZXMuY2hpbGRyZW4ucHVzaChuZXcgeG1sLkNSKDgpLCBuZXcgeG1sLlRhZygnbm90ZScsIHtjYXRlZ29yeTogJ2xvY2F0aW9uJ30sIFtcbiAgICAgICAgICBuZXcgeG1sLlRleHQoYCR7c291cmNlLmZpbGVQYXRofToke3NvdXJjZS5zdGFydExpbmV9JHtcbiAgICAgICAgICAgICAgc291cmNlLmVuZExpbmUgIT09IHNvdXJjZS5zdGFydExpbmUgPyAnLCcgKyBzb3VyY2UuZW5kTGluZSA6ICcnfWApXG4gICAgICAgIF0pKTtcbiAgICAgIH0pO1xuXG4gICAgICBub3Rlcy5jaGlsZHJlbi5wdXNoKG5ldyB4bWwuQ1IoNikpO1xuICAgICAgdW5pdC5jaGlsZHJlbi5wdXNoKG5ldyB4bWwuQ1IoNiksIG5vdGVzKTtcblxuICAgICAgY29uc3Qgc2VnbWVudCA9IG5ldyB4bWwuVGFnKCdzZWdtZW50Jyk7XG5cbiAgICAgIHNlZ21lbnQuY2hpbGRyZW4ucHVzaChcbiAgICAgICAgICBuZXcgeG1sLkNSKDgpLCBuZXcgeG1sLlRhZyhfU09VUkNFX1RBRywge30sIHZpc2l0b3Iuc2VyaWFsaXplKG1lc3NhZ2Uubm9kZXMpKSxcbiAgICAgICAgICBuZXcgeG1sLkNSKDYpKTtcblxuICAgICAgdW5pdC5jaGlsZHJlbi5wdXNoKG5ldyB4bWwuQ1IoNiksIHNlZ21lbnQsIG5ldyB4bWwuQ1IoNCkpO1xuXG4gICAgICB1bml0cy5wdXNoKG5ldyB4bWwuQ1IoNCksIHVuaXQpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZmlsZSA9XG4gICAgICAgIG5ldyB4bWwuVGFnKCdmaWxlJywgeydvcmlnaW5hbCc6ICduZy50ZW1wbGF0ZScsIGlkOiAnbmdpMThuJ30sIFsuLi51bml0cywgbmV3IHhtbC5DUigyKV0pO1xuXG4gICAgY29uc3QgeGxpZmYgPSBuZXcgeG1sLlRhZyhcbiAgICAgICAgX1hMSUZGX1RBRywge3ZlcnNpb246IF9WRVJTSU9OLCB4bWxuczogX1hNTE5TLCBzcmNMYW5nOiBsb2NhbGUgfHwgX0RFRkFVTFRfU09VUkNFX0xBTkd9LFxuICAgICAgICBbbmV3IHhtbC5DUigyKSwgZmlsZSwgbmV3IHhtbC5DUigpXSk7XG5cbiAgICByZXR1cm4geG1sLnNlcmlhbGl6ZShbXG4gICAgICBuZXcgeG1sLkRlY2xhcmF0aW9uKHt2ZXJzaW9uOiAnMS4wJywgZW5jb2Rpbmc6ICdVVEYtOCd9KSwgbmV3IHhtbC5DUigpLCB4bGlmZiwgbmV3IHhtbC5DUigpXG4gICAgXSk7XG4gIH1cblxuICBsb2FkKGNvbnRlbnQ6IHN0cmluZywgdXJsOiBzdHJpbmcpOlxuICAgICAge2xvY2FsZTogc3RyaW5nLCBpMThuTm9kZXNCeU1zZ0lkOiB7W21zZ0lkOiBzdHJpbmddOiBpMThuLk5vZGVbXX19IHtcbiAgICAvLyB4bGlmZiB0byB4bWwgbm9kZXNcbiAgICBjb25zdCB4bGlmZjJQYXJzZXIgPSBuZXcgWGxpZmYyUGFyc2VyKCk7XG4gICAgY29uc3Qge2xvY2FsZSwgbXNnSWRUb0h0bWwsIGVycm9yc30gPSB4bGlmZjJQYXJzZXIucGFyc2UoY29udGVudCwgdXJsKTtcblxuICAgIC8vIHhtbCBub2RlcyB0byBpMThuIG5vZGVzXG4gICAgY29uc3QgaTE4bk5vZGVzQnlNc2dJZDoge1ttc2dJZDogc3RyaW5nXTogaTE4bi5Ob2RlW119ID0ge307XG4gICAgY29uc3QgY29udmVydGVyID0gbmV3IFhtbFRvSTE4bigpO1xuXG4gICAgT2JqZWN0LmtleXMobXNnSWRUb0h0bWwpLmZvckVhY2gobXNnSWQgPT4ge1xuICAgICAgY29uc3Qge2kxOG5Ob2RlcywgZXJyb3JzOiBlfSA9IGNvbnZlcnRlci5jb252ZXJ0KG1zZ0lkVG9IdG1sW21zZ0lkXSwgdXJsKTtcbiAgICAgIGVycm9ycy5wdXNoKC4uLmUpO1xuICAgICAgaTE4bk5vZGVzQnlNc2dJZFttc2dJZF0gPSBpMThuTm9kZXM7XG4gICAgfSk7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB4bGlmZjIgcGFyc2UgZXJyb3JzOlxcbiR7ZXJyb3JzLmpvaW4oJ1xcbicpfWApO1xuICAgIH1cblxuICAgIHJldHVybiB7bG9jYWxlOiBsb2NhbGUhLCBpMThuTm9kZXNCeU1zZ0lkfTtcbiAgfVxuXG4gIGRpZ2VzdChtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWNpbWFsRGlnZXN0KG1lc3NhZ2UpO1xuICB9XG59XG5cbmNsYXNzIF9Xcml0ZVZpc2l0b3IgaW1wbGVtZW50cyBpMThuLlZpc2l0b3Ige1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfbmV4dFBsYWNlaG9sZGVySWQhOiBudW1iZXI7XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGkxOG4uVGV4dCwgY29udGV4dD86IGFueSk6IHhtbC5Ob2RlW10ge1xuICAgIHJldHVybiBbbmV3IHhtbC5UZXh0KHRleHQudmFsdWUpXTtcbiAgfVxuXG4gIHZpc2l0Q29udGFpbmVyKGNvbnRhaW5lcjogaTE4bi5Db250YWluZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBub2RlczogeG1sLk5vZGVbXSA9IFtdO1xuICAgIGNvbnRhaW5lci5jaGlsZHJlbi5mb3JFYWNoKChub2RlOiBpMThuLk5vZGUpID0+IG5vZGVzLnB1c2goLi4ubm9kZS52aXNpdCh0aGlzKSkpO1xuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIHZpc2l0SWN1KGljdTogaTE4bi5JY3UsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBub2RlcyA9IFtuZXcgeG1sLlRleHQoYHske2ljdS5leHByZXNzaW9uUGxhY2Vob2xkZXJ9LCAke2ljdS50eXBlfSwgYCldO1xuXG4gICAgT2JqZWN0LmtleXMoaWN1LmNhc2VzKS5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgIG5vZGVzLnB1c2gobmV3IHhtbC5UZXh0KGAke2N9IHtgKSwgLi4uaWN1LmNhc2VzW2NdLnZpc2l0KHRoaXMpLCBuZXcgeG1sLlRleHQoYH0gYCkpO1xuICAgIH0pO1xuXG4gICAgbm9kZXMucHVzaChuZXcgeG1sLlRleHQoYH1gKSk7XG5cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7XG4gICAgY29uc3QgdHlwZSA9IGdldFR5cGVGb3JUYWcocGgudGFnKTtcblxuICAgIGlmIChwaC5pc1ZvaWQpIHtcbiAgICAgIGNvbnN0IHRhZ1BoID0gbmV3IHhtbC5UYWcoX1BMQUNFSE9MREVSX1RBRywge1xuICAgICAgICBpZDogKHRoaXMuX25leHRQbGFjZWhvbGRlcklkKyspLnRvU3RyaW5nKCksXG4gICAgICAgIGVxdWl2OiBwaC5zdGFydE5hbWUsXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGRpc3A6IGA8JHtwaC50YWd9Lz5gLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gW3RhZ1BoXTtcbiAgICB9XG5cbiAgICBjb25zdCB0YWdQYyA9IG5ldyB4bWwuVGFnKF9QTEFDRUhPTERFUl9TUEFOTklOR19UQUcsIHtcbiAgICAgIGlkOiAodGhpcy5fbmV4dFBsYWNlaG9sZGVySWQrKykudG9TdHJpbmcoKSxcbiAgICAgIGVxdWl2U3RhcnQ6IHBoLnN0YXJ0TmFtZSxcbiAgICAgIGVxdWl2RW5kOiBwaC5jbG9zZU5hbWUsXG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgZGlzcFN0YXJ0OiBgPCR7cGgudGFnfT5gLFxuICAgICAgZGlzcEVuZDogYDwvJHtwaC50YWd9PmAsXG4gICAgfSk7XG4gICAgY29uc3Qgbm9kZXM6IHhtbC5Ob2RlW10gPSBbXS5jb25jYXQoLi4ucGguY2hpbGRyZW4ubWFwKG5vZGUgPT4gbm9kZS52aXNpdCh0aGlzKSkpO1xuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIG5vZGVzLmZvckVhY2goKG5vZGU6IHhtbC5Ob2RlKSA9PiB0YWdQYy5jaGlsZHJlbi5wdXNoKG5vZGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFnUGMuY2hpbGRyZW4ucHVzaChuZXcgeG1sLlRleHQoJycpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3RhZ1BjXTtcbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBpZFN0ciA9ICh0aGlzLl9uZXh0UGxhY2Vob2xkZXJJZCsrKS50b1N0cmluZygpO1xuICAgIHJldHVybiBbbmV3IHhtbC5UYWcoX1BMQUNFSE9MREVSX1RBRywge1xuICAgICAgaWQ6IGlkU3RyLFxuICAgICAgZXF1aXY6IHBoLm5hbWUsXG4gICAgICBkaXNwOiBge3ske3BoLnZhbHVlfX19YCxcbiAgICB9KV07XG4gIH1cblxuICB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7XG4gICAgY29uc3QgY2FzZXMgPSBPYmplY3Qua2V5cyhwaC52YWx1ZS5jYXNlcykubWFwKCh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSArICcgey4uLn0nKS5qb2luKCcgJyk7XG4gICAgY29uc3QgaWRTdHIgPSAodGhpcy5fbmV4dFBsYWNlaG9sZGVySWQrKykudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gW25ldyB4bWwuVGFnKFxuICAgICAgICBfUExBQ0VIT0xERVJfVEFHLFxuICAgICAgICB7aWQ6IGlkU3RyLCBlcXVpdjogcGgubmFtZSwgZGlzcDogYHske3BoLnZhbHVlLmV4cHJlc3Npb259LCAke3BoLnZhbHVlLnR5cGV9LCAke2Nhc2VzfX1gfSldO1xuICB9XG5cbiAgc2VyaWFsaXplKG5vZGVzOiBpMThuLk5vZGVbXSk6IHhtbC5Ob2RlW10ge1xuICAgIHRoaXMuX25leHRQbGFjZWhvbGRlcklkID0gMDtcbiAgICByZXR1cm4gW10uY29uY2F0KC4uLm5vZGVzLm1hcChub2RlID0+IG5vZGUudmlzaXQodGhpcykpKTtcbiAgfVxufVxuXG4vLyBFeHRyYWN0IG1lc3NhZ2VzIGFzIHhtbCBub2RlcyBmcm9tIHRoZSB4bGlmZiBmaWxlXG5jbGFzcyBYbGlmZjJQYXJzZXIgaW1wbGVtZW50cyBtbC5WaXNpdG9yIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3VuaXRNbFN0cmluZyE6IHN0cmluZ3xudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZXJyb3JzITogSTE4bkVycm9yW107XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9tc2dJZFRvSHRtbCE6IHtbbXNnSWQ6IHN0cmluZ106IHN0cmluZ307XG4gIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIHBhcnNlKHhsaWZmOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdW5pdE1sU3RyaW5nID0gbnVsbDtcbiAgICB0aGlzLl9tc2dJZFRvSHRtbCA9IHt9O1xuXG4gICAgY29uc3QgeG1sID0gbmV3IFhtbFBhcnNlcigpLnBhcnNlKHhsaWZmLCB1cmwpO1xuXG4gICAgdGhpcy5fZXJyb3JzID0geG1sLmVycm9ycztcbiAgICBtbC52aXNpdEFsbCh0aGlzLCB4bWwucm9vdE5vZGVzLCBudWxsKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtc2dJZFRvSHRtbDogdGhpcy5fbXNnSWRUb0h0bWwsXG4gICAgICBlcnJvcnM6IHRoaXMuX2Vycm9ycyxcbiAgICAgIGxvY2FsZTogdGhpcy5fbG9jYWxlLFxuICAgIH07XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogbWwuRWxlbWVudCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBzd2l0Y2ggKGVsZW1lbnQubmFtZSkge1xuICAgICAgY2FzZSBfVU5JVF9UQUc6XG4gICAgICAgIHRoaXMuX3VuaXRNbFN0cmluZyA9IG51bGw7XG4gICAgICAgIGNvbnN0IGlkQXR0ciA9IGVsZW1lbnQuYXR0cnMuZmluZCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSAnaWQnKTtcbiAgICAgICAgaWYgKCFpZEF0dHIpIHtcbiAgICAgICAgICB0aGlzLl9hZGRFcnJvcihlbGVtZW50LCBgPCR7X1VOSVRfVEFHfT4gbWlzc2VzIHRoZSBcImlkXCIgYXR0cmlidXRlYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaWQgPSBpZEF0dHIudmFsdWU7XG4gICAgICAgICAgaWYgKHRoaXMuX21zZ0lkVG9IdG1sLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWxlbWVudCwgYER1cGxpY2F0ZWQgdHJhbnNsYXRpb25zIGZvciBtc2cgJHtpZH1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWwudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbiwgbnVsbCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3VuaXRNbFN0cmluZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdGhpcy5fbXNnSWRUb0h0bWxbaWRdID0gdGhpcy5fdW5pdE1sU3RyaW5nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWxlbWVudCwgYE1lc3NhZ2UgJHtpZH0gbWlzc2VzIGEgdHJhbnNsYXRpb25gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgX1NPVVJDRV9UQUc6XG4gICAgICAgIC8vIGlnbm9yZSBzb3VyY2UgbWVzc2FnZVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBfVEFSR0VUX1RBRzpcbiAgICAgICAgY29uc3QgaW5uZXJUZXh0U3RhcnQgPSBlbGVtZW50LnN0YXJ0U291cmNlU3Bhbi5lbmQub2Zmc2V0O1xuICAgICAgICBjb25zdCBpbm5lclRleHRFbmQgPSBlbGVtZW50LmVuZFNvdXJjZVNwYW4hLnN0YXJ0Lm9mZnNldDtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLnN0YXJ0LmZpbGUuY29udGVudDtcbiAgICAgICAgY29uc3QgaW5uZXJUZXh0ID0gY29udGVudC5zbGljZShpbm5lclRleHRTdGFydCwgaW5uZXJUZXh0RW5kKTtcbiAgICAgICAgdGhpcy5fdW5pdE1sU3RyaW5nID0gaW5uZXJUZXh0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBfWExJRkZfVEFHOlxuICAgICAgICBjb25zdCBsb2NhbGVBdHRyID0gZWxlbWVudC5hdHRycy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09ICd0cmdMYW5nJyk7XG4gICAgICAgIGlmIChsb2NhbGVBdHRyKSB7XG4gICAgICAgICAgdGhpcy5fbG9jYWxlID0gbG9jYWxlQXR0ci52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnNpb25BdHRyID0gZWxlbWVudC5hdHRycy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09ICd2ZXJzaW9uJyk7XG4gICAgICAgIGlmICh2ZXJzaW9uQXR0cikge1xuICAgICAgICAgIGNvbnN0IHZlcnNpb24gPSB2ZXJzaW9uQXR0ci52YWx1ZTtcbiAgICAgICAgICBpZiAodmVyc2lvbiAhPT0gJzIuMCcpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEVycm9yKFxuICAgICAgICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgYFRoZSBYTElGRiBmaWxlIHZlcnNpb24gJHt2ZXJzaW9ufSBpcyBub3QgY29tcGF0aWJsZSB3aXRoIFhMSUZGIDIuMCBzZXJpYWxpemVyYCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1sLnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sIG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG1sLnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZTogbWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cblxuICB2aXNpdFRleHQodGV4dDogbWwuVGV4dCwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IG1sLkNvbW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuXG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogbWwuRXhwYW5zaW9uLCBjb250ZXh0OiBhbnkpOiBhbnkge31cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoZXhwYW5zaW9uQ2FzZTogbWwuRXhwYW5zaW9uQ2FzZSwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgcHJpdmF0ZSBfYWRkRXJyb3Iobm9kZTogbWwuTm9kZSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZXJyb3JzLnB1c2gobmV3IEkxOG5FcnJvcihub2RlLnNvdXJjZVNwYW4sIG1lc3NhZ2UpKTtcbiAgfVxufVxuXG4vLyBDb252ZXJ0IG1sIG5vZGVzICh4bGlmZiBzeW50YXgpIHRvIGkxOG4gbm9kZXNcbmNsYXNzIFhtbFRvSTE4biBpbXBsZW1lbnRzIG1sLlZpc2l0b3Ige1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZXJyb3JzITogSTE4bkVycm9yW107XG5cbiAgY29udmVydChtZXNzYWdlOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XG4gICAgY29uc3QgeG1sSWN1ID0gbmV3IFhtbFBhcnNlcigpLnBhcnNlKG1lc3NhZ2UsIHVybCwge3Rva2VuaXplRXhwYW5zaW9uRm9ybXM6IHRydWV9KTtcbiAgICB0aGlzLl9lcnJvcnMgPSB4bWxJY3UuZXJyb3JzO1xuXG4gICAgY29uc3QgaTE4bk5vZGVzID0gdGhpcy5fZXJyb3JzLmxlbmd0aCA+IDAgfHwgeG1sSWN1LnJvb3ROb2Rlcy5sZW5ndGggPT0gMCA/XG4gICAgICAgIFtdIDpcbiAgICAgICAgW10uY29uY2F0KC4uLm1sLnZpc2l0QWxsKHRoaXMsIHhtbEljdS5yb290Tm9kZXMpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpMThuTm9kZXMsXG4gICAgICBlcnJvcnM6IHRoaXMuX2Vycm9ycyxcbiAgICB9O1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IG1sLlRleHQsIGNvbnRleHQ6IGFueSkge1xuICAgIHJldHVybiBuZXcgaTE4bi5UZXh0KHRleHQudmFsdWUsIHRleHQuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoZWw6IG1sLkVsZW1lbnQsIGNvbnRleHQ6IGFueSk6IGkxOG4uTm9kZVtdfG51bGwge1xuICAgIHN3aXRjaCAoZWwubmFtZSkge1xuICAgICAgY2FzZSBfUExBQ0VIT0xERVJfVEFHOlxuICAgICAgICBjb25zdCBuYW1lQXR0ciA9IGVsLmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2VxdWl2Jyk7XG4gICAgICAgIGlmIChuYW1lQXR0cikge1xuICAgICAgICAgIHJldHVybiBbbmV3IGkxOG4uUGxhY2Vob2xkZXIoJycsIG5hbWVBdHRyLnZhbHVlLCBlbC5zb3VyY2VTcGFuKV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hZGRFcnJvcihlbCwgYDwke19QTEFDRUhPTERFUl9UQUd9PiBtaXNzZXMgdGhlIFwiZXF1aXZcIiBhdHRyaWJ1dGVgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIF9QTEFDRUhPTERFUl9TUEFOTklOR19UQUc6XG4gICAgICAgIGNvbnN0IHN0YXJ0QXR0ciA9IGVsLmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2VxdWl2U3RhcnQnKTtcbiAgICAgICAgY29uc3QgZW5kQXR0ciA9IGVsLmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2VxdWl2RW5kJyk7XG5cbiAgICAgICAgaWYgKCFzdGFydEF0dHIpIHtcbiAgICAgICAgICB0aGlzLl9hZGRFcnJvcihlbCwgYDwke19QTEFDRUhPTERFUl9UQUd9PiBtaXNzZXMgdGhlIFwiZXF1aXZTdGFydFwiIGF0dHJpYnV0ZWApO1xuICAgICAgICB9IGVsc2UgaWYgKCFlbmRBdHRyKSB7XG4gICAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWwsIGA8JHtfUExBQ0VIT0xERVJfVEFHfT4gbWlzc2VzIHRoZSBcImVxdWl2RW5kXCIgYXR0cmlidXRlYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnRJZCA9IHN0YXJ0QXR0ci52YWx1ZTtcbiAgICAgICAgICBjb25zdCBlbmRJZCA9IGVuZEF0dHIudmFsdWU7XG5cbiAgICAgICAgICBjb25zdCBub2RlczogaTE4bi5Ob2RlW10gPSBbXTtcblxuICAgICAgICAgIHJldHVybiBub2Rlcy5jb25jYXQoXG4gICAgICAgICAgICAgIG5ldyBpMThuLlBsYWNlaG9sZGVyKCcnLCBzdGFydElkLCBlbC5zb3VyY2VTcGFuKSxcbiAgICAgICAgICAgICAgLi4uZWwuY2hpbGRyZW4ubWFwKG5vZGUgPT4gbm9kZS52aXNpdCh0aGlzLCBudWxsKSksXG4gICAgICAgICAgICAgIG5ldyBpMThuLlBsYWNlaG9sZGVyKCcnLCBlbmRJZCwgZWwuc291cmNlU3BhbikpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfTUFSS0VSX1RBRzpcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdCguLi5tbC52aXNpdEFsbCh0aGlzLCBlbC5jaGlsZHJlbikpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWwsIGBVbmV4cGVjdGVkIHRhZ2ApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oaWN1OiBtbC5FeHBhbnNpb24sIGNvbnRleHQ6IGFueSkge1xuICAgIGNvbnN0IGNhc2VNYXA6IHtbdmFsdWU6IHN0cmluZ106IGkxOG4uTm9kZX0gPSB7fTtcblxuICAgIG1sLnZpc2l0QWxsKHRoaXMsIGljdS5jYXNlcykuZm9yRWFjaCgoYzogYW55KSA9PiB7XG4gICAgICBjYXNlTWFwW2MudmFsdWVdID0gbmV3IGkxOG4uQ29udGFpbmVyKGMubm9kZXMsIGljdS5zb3VyY2VTcGFuKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgaTE4bi5JY3UoaWN1LnN3aXRjaFZhbHVlLCBpY3UudHlwZSwgY2FzZU1hcCwgaWN1LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGljdUNhc2U6IG1sLkV4cGFuc2lvbkNhc2UsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBpY3VDYXNlLnZhbHVlLFxuICAgICAgbm9kZXM6IFtdLmNvbmNhdCguLi5tbC52aXNpdEFsbCh0aGlzLCBpY3VDYXNlLmV4cHJlc3Npb24pKSxcbiAgICB9O1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IG1sLkNvbW1lbnQsIGNvbnRleHQ6IGFueSkge31cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IG1sLkF0dHJpYnV0ZSwgY29udGV4dDogYW55KSB7fVxuXG4gIHByaXZhdGUgX2FkZEVycm9yKG5vZGU6IG1sLk5vZGUsIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Vycm9ycy5wdXNoKG5ldyBJMThuRXJyb3Iobm9kZS5zb3VyY2VTcGFuLCBtZXNzYWdlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VHlwZUZvclRhZyh0YWc6IHN0cmluZyk6IHN0cmluZyB7XG4gIHN3aXRjaCAodGFnLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdicic6XG4gICAgY2FzZSAnYic6XG4gICAgY2FzZSAnaSc6XG4gICAgY2FzZSAndSc6XG4gICAgICByZXR1cm4gJ2ZtdCc7XG4gICAgY2FzZSAnaW1nJzpcbiAgICAgIHJldHVybiAnaW1hZ2UnO1xuICAgIGNhc2UgJ2EnOlxuICAgICAgcmV0dXJuICdsaW5rJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdvdGhlcic7XG4gIH1cbn1cbiJdfQ==
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/view/i18n/localize_utils", ["require", "exports", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/parse_util", "@angular/compiler/src/render3/view/i18n/icu_serializer", "@angular/compiler/src/render3/view/i18n/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serializeI18nMessageForLocalize = exports.createLocalizeStatements = void 0;
    var o = require("@angular/compiler/src/output/output_ast");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var icu_serializer_1 = require("@angular/compiler/src/render3/view/i18n/icu_serializer");
    var util_1 = require("@angular/compiler/src/render3/view/i18n/util");
    function createLocalizeStatements(variable, message, params) {
        var _a = serializeI18nMessageForLocalize(message), messageParts = _a.messageParts, placeHolders = _a.placeHolders;
        var sourceSpan = getSourceSpan(message);
        var expressions = placeHolders.map(function (ph) { return params[ph.text]; });
        var localizedString = o.localizedString(message, messageParts, placeHolders, expressions, sourceSpan);
        var variableInitialization = variable.set(localizedString);
        return [new o.ExpressionStatement(variableInitialization)];
    }
    exports.createLocalizeStatements = createLocalizeStatements;
    /**
     * This visitor walks over an i18n tree, capturing literal strings and placeholders.
     *
     * The result can be used for generating the `$localize` tagged template literals.
     */
    var LocalizeSerializerVisitor = /** @class */ (function () {
        function LocalizeSerializerVisitor() {
        }
        LocalizeSerializerVisitor.prototype.visitText = function (text, context) {
            if (context[context.length - 1] instanceof o.LiteralPiece) {
                // Two literal pieces in a row means that there was some comment node in-between.
                context[context.length - 1].text += text.value;
            }
            else {
                context.push(new o.LiteralPiece(text.value, text.sourceSpan));
            }
        };
        LocalizeSerializerVisitor.prototype.visitContainer = function (container, context) {
            var _this = this;
            container.children.forEach(function (child) { return child.visit(_this, context); });
        };
        LocalizeSerializerVisitor.prototype.visitIcu = function (icu, context) {
            context.push(new o.LiteralPiece(icu_serializer_1.serializeIcuNode(icu), icu.sourceSpan));
        };
        LocalizeSerializerVisitor.prototype.visitTagPlaceholder = function (ph, context) {
            var _this = this;
            var _a, _b;
            context.push(this.createPlaceholderPiece(ph.startName, (_a = ph.startSourceSpan) !== null && _a !== void 0 ? _a : ph.sourceSpan));
            if (!ph.isVoid) {
                ph.children.forEach(function (child) { return child.visit(_this, context); });
                context.push(this.createPlaceholderPiece(ph.closeName, (_b = ph.endSourceSpan) !== null && _b !== void 0 ? _b : ph.sourceSpan));
            }
        };
        LocalizeSerializerVisitor.prototype.visitPlaceholder = function (ph, context) {
            context.push(this.createPlaceholderPiece(ph.name, ph.sourceSpan));
        };
        LocalizeSerializerVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
            context.push(this.createPlaceholderPiece(ph.name, ph.sourceSpan));
        };
        LocalizeSerializerVisitor.prototype.createPlaceholderPiece = function (name, sourceSpan) {
            return new o.PlaceholderPiece(util_1.formatI18nPlaceholderName(name, /* useCamelCase */ false), sourceSpan);
        };
        return LocalizeSerializerVisitor;
    }());
    var serializerVisitor = new LocalizeSerializerVisitor();
    /**
     * Serialize an i18n message into two arrays: messageParts and placeholders.
     *
     * These arrays will be used to generate `$localize` tagged template literals.
     *
     * @param message The message to be serialized.
     * @returns an object containing the messageParts and placeholders.
     */
    function serializeI18nMessageForLocalize(message) {
        var pieces = [];
        message.nodes.forEach(function (node) { return node.visit(serializerVisitor, pieces); });
        return processMessagePieces(pieces);
    }
    exports.serializeI18nMessageForLocalize = serializeI18nMessageForLocalize;
    function getSourceSpan(message) {
        var startNode = message.nodes[0];
        var endNode = message.nodes[message.nodes.length - 1];
        return new parse_util_1.ParseSourceSpan(startNode.sourceSpan.start, endNode.sourceSpan.end, startNode.sourceSpan.fullStart, startNode.sourceSpan.details);
    }
    /**
     * Convert the list of serialized MessagePieces into two arrays.
     *
     * One contains the literal string pieces and the other the placeholders that will be replaced by
     * expressions when rendering `$localize` tagged template literals.
     *
     * @param pieces The pieces to process.
     * @returns an object containing the messageParts and placeholders.
     */
    function processMessagePieces(pieces) {
        var messageParts = [];
        var placeHolders = [];
        if (pieces[0] instanceof o.PlaceholderPiece) {
            // The first piece was a placeholder so we need to add an initial empty message part.
            messageParts.push(createEmptyMessagePart(pieces[0].sourceSpan.start));
        }
        for (var i = 0; i < pieces.length; i++) {
            var part = pieces[i];
            if (part instanceof o.LiteralPiece) {
                messageParts.push(part);
            }
            else {
                placeHolders.push(part);
                if (pieces[i - 1] instanceof o.PlaceholderPiece) {
                    // There were two placeholders in a row, so we need to add an empty message part.
                    messageParts.push(createEmptyMessagePart(pieces[i - 1].sourceSpan.end));
                }
            }
        }
        if (pieces[pieces.length - 1] instanceof o.PlaceholderPiece) {
            // The last piece was a placeholder so we need to add a final empty message part.
            messageParts.push(createEmptyMessagePart(pieces[pieces.length - 1].sourceSpan.end));
        }
        return { messageParts: messageParts, placeHolders: placeHolders };
    }
    function createEmptyMessagePart(location) {
        return new o.LiteralPiece('', new parse_util_1.ParseSourceSpan(location, location));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemVfdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L2kxOG4vbG9jYWxpemVfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBUUEsMkRBQWdEO0lBQ2hELCtEQUFtRTtJQUVuRSx5RkFBa0Q7SUFDbEQscUVBQWlEO0lBRWpELFNBQWdCLHdCQUF3QixDQUNwQyxRQUF1QixFQUFFLE9BQXFCLEVBQzlDLE1BQXNDO1FBQ2xDLElBQUEsS0FBK0IsK0JBQStCLENBQUMsT0FBTyxDQUFDLEVBQXRFLFlBQVksa0JBQUEsRUFBRSxZQUFZLGtCQUE0QyxDQUFDO1FBQzlFLElBQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQyxJQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBZixDQUFlLENBQUMsQ0FBQztRQUM1RCxJQUFNLGVBQWUsR0FDakIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEYsSUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQVZELDREQVVDO0lBRUQ7Ozs7T0FJRztJQUNIO1FBQUE7UUFzQ0EsQ0FBQztRQXJDQyw2Q0FBUyxHQUFULFVBQVUsSUFBZSxFQUFFLE9BQXlCO1lBQ2xELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFlBQVks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QUksQ0FBQyxDQUFDO2dCQUN4QixJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLGdCQUFnQixFQUFFO29CQUMvQyxpRkFBaUY7b0JBQ2pGLFlBQVksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDekU7YUFDRjtTQUNGO1FBQ0QsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7WUFDM0QsaUZBQWlGO1lBQ2pGLFlBQVksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDckY7UUFDRCxPQUFPLEVBQUMsWUFBWSxjQUFBLEVBQUUsWUFBWSxjQUFBLEVBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxRQUF1QjtRQUNyRCxPQUFPLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsSUFBSSw0QkFBZSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VMb2NhdGlvbiwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi8uLi8uLi9wYXJzZV91dGlsJztcblxuaW1wb3J0IHtzZXJpYWxpemVJY3VOb2RlfSBmcm9tICcuL2ljdV9zZXJpYWxpemVyJztcbmltcG9ydCB7Zm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZX0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2FsaXplU3RhdGVtZW50cyhcbiAgICB2YXJpYWJsZTogby5SZWFkVmFyRXhwciwgbWVzc2FnZTogaTE4bi5NZXNzYWdlLFxuICAgIHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259KTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IHttZXNzYWdlUGFydHMsIHBsYWNlSG9sZGVyc30gPSBzZXJpYWxpemVJMThuTWVzc2FnZUZvckxvY2FsaXplKG1lc3NhZ2UpO1xuICBjb25zdCBzb3VyY2VTcGFuID0gZ2V0U291cmNlU3BhbihtZXNzYWdlKTtcbiAgY29uc3QgZXhwcmVzc2lvbnMgPSBwbGFjZUhvbGRlcnMubWFwKHBoID0+IHBhcmFtc1twaC50ZXh0XSk7XG4gIGNvbnN0IGxvY2FsaXplZFN0cmluZyA9XG4gICAgICBvLmxvY2FsaXplZFN0cmluZyhtZXNzYWdlLCBtZXNzYWdlUGFydHMsIHBsYWNlSG9sZGVycywgZXhwcmVzc2lvbnMsIHNvdXJjZVNwYW4pO1xuICBjb25zdCB2YXJpYWJsZUluaXRpYWxpemF0aW9uID0gdmFyaWFibGUuc2V0KGxvY2FsaXplZFN0cmluZyk7XG4gIHJldHVybiBbbmV3IG8uRXhwcmVzc2lvblN0YXRlbWVudCh2YXJpYWJsZUluaXRpYWxpemF0aW9uKV07XG59XG5cbi8qKlxuICogVGhpcyB2aXNpdG9yIHdhbGtzIG92ZXIgYW4gaTE4biB0cmVlLCBjYXB0dXJpbmcgbGl0ZXJhbCBzdHJpbmdzIGFuZCBwbGFjZWhvbGRlcnMuXG4gKlxuICogVGhlIHJlc3VsdCBjYW4gYmUgdXNlZCBmb3IgZ2VuZXJhdGluZyB0aGUgYCRsb2NhbGl6ZWAgdGFnZ2VkIHRlbXBsYXRlIGxpdGVyYWxzLlxuICovXG5jbGFzcyBMb2NhbGl6ZVNlcmlhbGl6ZXJWaXNpdG9yIGltcGxlbWVudHMgaTE4bi5WaXNpdG9yIHtcbiAgdmlzaXRUZXh0KHRleHQ6IGkxOG4uVGV4dCwgY29udGV4dDogby5NZXNzYWdlUGllY2VbXSk6IGFueSB7XG4gICAgaWYgKGNvbnRleHRbY29udGV4dC5sZW5ndGggLSAxXSBpbnN0YW5jZW9mIG8uTGl0ZXJhbFBpZWNlKSB7XG4gICAgICAvLyBUd28gbGl0ZXJhbCBwaWVjZXMgaW4gYSByb3cgbWVhbnMgdGhhdCB0aGVyZSB3YXMgc29tZSBjb21tZW50IG5vZGUgaW4tYmV0d2Vlbi5cbiAgICAgIGNvbnRleHRbY29udGV4dC5sZW5ndGggLSAxXS50ZXh0ICs9IHRleHQudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQucHVzaChuZXcgby5MaXRlcmFsUGllY2UodGV4dC52YWx1ZSwgdGV4dC5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRDb250YWluZXIoY29udGFpbmVyOiBpMThuLkNvbnRhaW5lciwgY29udGV4dDogby5NZXNzYWdlUGllY2VbXSk6IGFueSB7XG4gICAgY29udGFpbmVyLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gY2hpbGQudmlzaXQodGhpcywgY29udGV4dCkpO1xuICB9XG5cbiAgdmlzaXRJY3UoaWN1OiBpMThuLkljdSwgY29udGV4dDogby5NZXNzYWdlUGllY2VbXSk6IGFueSB7XG4gICAgY29udGV4dC5wdXNoKG5ldyBvLkxpdGVyYWxQaWVjZShzZXJpYWxpemVJY3VOb2RlKGljdSksIGljdS5zb3VyY2VTcGFuKSk7XG4gIH1cblxuICB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0OiBvLk1lc3NhZ2VQaWVjZVtdKTogYW55IHtcbiAgICBjb250ZXh0LnB1c2godGhpcy5jcmVhdGVQbGFjZWhvbGRlclBpZWNlKHBoLnN0YXJ0TmFtZSwgcGguc3RhcnRTb3VyY2VTcGFuID8/IHBoLnNvdXJjZVNwYW4pKTtcbiAgICBpZiAoIXBoLmlzVm9pZCkge1xuICAgICAgcGguY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBjaGlsZC52aXNpdCh0aGlzLCBjb250ZXh0KSk7XG4gICAgICBjb250ZXh0LnB1c2godGhpcy5jcmVhdGVQbGFjZWhvbGRlclBpZWNlKHBoLmNsb3NlTmFtZSwgcGguZW5kU291cmNlU3BhbiA/PyBwaC5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRQbGFjZWhvbGRlcihwaDogaTE4bi5QbGFjZWhvbGRlciwgY29udGV4dDogby5NZXNzYWdlUGllY2VbXSk6IGFueSB7XG4gICAgY29udGV4dC5wdXNoKHRoaXMuY3JlYXRlUGxhY2Vob2xkZXJQaWVjZShwaC5uYW1lLCBwaC5zb3VyY2VTcGFuKSk7XG4gIH1cblxuICB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICBjb250ZXh0LnB1c2godGhpcy5jcmVhdGVQbGFjZWhvbGRlclBpZWNlKHBoLm5hbWUsIHBoLnNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUGxhY2Vob2xkZXJQaWVjZShuYW1lOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IG8uUGxhY2Vob2xkZXJQaWVjZSB7XG4gICAgcmV0dXJuIG5ldyBvLlBsYWNlaG9sZGVyUGllY2UoXG4gICAgICAgIGZvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWUobmFtZSwgLyogdXNlQ2FtZWxDYXNlICovIGZhbHNlKSwgc291cmNlU3Bhbik7XG4gIH1cbn1cblxuY29uc3Qgc2VyaWFsaXplclZpc2l0b3IgPSBuZXcgTG9jYWxpemVTZXJpYWxpemVyVmlzaXRvcigpO1xuXG4vKipcbiAqIFNlcmlhbGl6ZSBhbiBpMThuIG1lc3NhZ2UgaW50byB0d28gYXJyYXlzOiBtZXNzYWdlUGFydHMgYW5kIHBsYWNlaG9sZGVycy5cbiAqXG4gKiBUaGVzZSBhcnJheXMgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIGAkbG9jYWxpemVgIHRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFscy5cbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBiZSBzZXJpYWxpemVkLlxuICogQHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1lc3NhZ2VQYXJ0cyBhbmQgcGxhY2Vob2xkZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplSTE4bk1lc3NhZ2VGb3JMb2NhbGl6ZShtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOlxuICAgIHttZXNzYWdlUGFydHM6IG8uTGl0ZXJhbFBpZWNlW10sIHBsYWNlSG9sZGVyczogby5QbGFjZWhvbGRlclBpZWNlW119IHtcbiAgY29uc3QgcGllY2VzOiBvLk1lc3NhZ2VQaWVjZVtdID0gW107XG4gIG1lc3NhZ2Uubm9kZXMuZm9yRWFjaChub2RlID0+IG5vZGUudmlzaXQoc2VyaWFsaXplclZpc2l0b3IsIHBpZWNlcykpO1xuICByZXR1cm4gcHJvY2Vzc01lc3NhZ2VQaWVjZXMocGllY2VzKTtcbn1cblxuZnVuY3Rpb24gZ2V0U291cmNlU3BhbihtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBQYXJzZVNvdXJjZVNwYW4ge1xuICBjb25zdCBzdGFydE5vZGUgPSBtZXNzYWdlLm5vZGVzWzBdO1xuICBjb25zdCBlbmROb2RlID0gbWVzc2FnZS5ub2Rlc1ttZXNzYWdlLm5vZGVzLmxlbmd0aCAtIDFdO1xuICByZXR1cm4gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHN0YXJ0Tm9kZS5zb3VyY2VTcGFuLnN0YXJ0LCBlbmROb2RlLnNvdXJjZVNwYW4uZW5kLCBzdGFydE5vZGUuc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgICBzdGFydE5vZGUuc291cmNlU3Bhbi5kZXRhaWxzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHRoZSBsaXN0IG9mIHNlcmlhbGl6ZWQgTWVzc2FnZVBpZWNlcyBpbnRvIHR3byBhcnJheXMuXG4gKlxuICogT25lIGNvbnRhaW5zIHRoZSBsaXRlcmFsIHN0cmluZyBwaWVjZXMgYW5kIHRoZSBvdGhlciB0aGUgcGxhY2Vob2xkZXJzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBieVxuICogZXhwcmVzc2lvbnMgd2hlbiByZW5kZXJpbmcgYCRsb2NhbGl6ZWAgdGFnZ2VkIHRlbXBsYXRlIGxpdGVyYWxzLlxuICpcbiAqIEBwYXJhbSBwaWVjZXMgVGhlIHBpZWNlcyB0byBwcm9jZXNzLlxuICogQHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1lc3NhZ2VQYXJ0cyBhbmQgcGxhY2Vob2xkZXJzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzTWVzc2FnZVBpZWNlcyhwaWVjZXM6IG8uTWVzc2FnZVBpZWNlW10pOlxuICAgIHttZXNzYWdlUGFydHM6IG8uTGl0ZXJhbFBpZWNlW10sIHBsYWNlSG9sZGVyczogby5QbGFjZWhvbGRlclBpZWNlW119IHtcbiAgY29uc3QgbWVzc2FnZVBhcnRzOiBvLkxpdGVyYWxQaWVjZVtdID0gW107XG4gIGNvbnN0IHBsYWNlSG9sZGVyczogby5QbGFjZWhvbGRlclBpZWNlW10gPSBbXTtcblxuICBpZiAocGllY2VzWzBdIGluc3RhbmNlb2Ygby5QbGFjZWhvbGRlclBpZWNlKSB7XG4gICAgLy8gVGhlIGZpcnN0IHBpZWNlIHdhcyBhIHBsYWNlaG9sZGVyIHNvIHdlIG5lZWQgdG8gYWRkIGFuIGluaXRpYWwgZW1wdHkgbWVzc2FnZSBwYXJ0LlxuICAgIG1lc3NhZ2VQYXJ0cy5wdXNoKGNyZWF0ZUVtcHR5TWVzc2FnZVBhcnQocGllY2VzWzBdLnNvdXJjZVNwYW4uc3RhcnQpKTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGllY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGFydCA9IHBpZWNlc1tpXTtcbiAgICBpZiAocGFydCBpbnN0YW5jZW9mIG8uTGl0ZXJhbFBpZWNlKSB7XG4gICAgICBtZXNzYWdlUGFydHMucHVzaChwYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxhY2VIb2xkZXJzLnB1c2gocGFydCk7XG4gICAgICBpZiAocGllY2VzW2kgLSAxXSBpbnN0YW5jZW9mIG8uUGxhY2Vob2xkZXJQaWVjZSkge1xuICAgICAgICAvLyBUaGVyZSB3ZXJlIHR3byBwbGFjZWhvbGRlcnMgaW4gYSByb3csIHNvIHdlIG5lZWQgdG8gYWRkIGFuIGVtcHR5IG1lc3NhZ2UgcGFydC5cbiAgICAgICAgbWVzc2FnZVBhcnRzLnB1c2goY3JlYXRlRW1wdHlNZXNzYWdlUGFydChwaWVjZXNbaSAtIDFdLnNvdXJjZVNwYW4uZW5kKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChwaWVjZXNbcGllY2VzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2Ygby5QbGFjZWhvbGRlclBpZWNlKSB7XG4gICAgLy8gVGhlIGxhc3QgcGllY2Ugd2FzIGEgcGxhY2Vob2xkZXIgc28gd2UgbmVlZCB0byBhZGQgYSBmaW5hbCBlbXB0eSBtZXNzYWdlIHBhcnQuXG4gICAgbWVzc2FnZVBhcnRzLnB1c2goY3JlYXRlRW1wdHlNZXNzYWdlUGFydChwaWVjZXNbcGllY2VzLmxlbmd0aCAtIDFdLnNvdXJjZVNwYW4uZW5kKSk7XG4gIH1cbiAgcmV0dXJuIHttZXNzYWdlUGFydHMsIHBsYWNlSG9sZGVyc307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVtcHR5TWVzc2FnZVBhcnQobG9jYXRpb246IFBhcnNlTG9jYXRpb24pOiBvLkxpdGVyYWxQaWVjZSB7XG4gIHJldHVybiBuZXcgby5MaXRlcmFsUGllY2UoJycsIG5ldyBQYXJzZVNvdXJjZVNwYW4obG9jYXRpb24sIGxvY2F0aW9uKSk7XG59XG4iXX0=
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as chars from './chars';
import { stringify } from './util';
export class ParseLocation {
    constructor(file, offset, line, col) {
        this.file = file;
        this.offset = offset;
        this.line = line;
        this.col = col;
    }
    toString() {
        return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
    }
    moveBy(delta) {
        const source = this.file.content;
        const len = source.length;
        let offset = this.offset;
        let line = this.line;
        let col = this.col;
        while (offset > 0 && delta < 0) {
            offset--;
            delta++;
            const ch = source.charCodeAt(offset);
            if (ch == chars.$LF) {
                line--;
                const priorLine = source
                    .substring(0, offset - 1)
                    .lastIndexOf(String.fromCharCode(chars.$LF));
                col = priorLine > 0 ? offset - priorLine : offset;
            }
            else {
                col--;
            }
        }
        while (offset < len && delta > 0) {
            const ch = source.charCodeAt(offset);
            offset++;
            delta--;
            if (ch == chars.$LF) {
                line++;
                col = 0;
            }
            else {
                col++;
            }
        }
        return new ParseLocation(this.file, offset, line, col);
    }
    // Return the source around the location
    // Up to `maxChars` or `maxLines` on each side of the location
    getContext(maxChars, maxLines) {
        const content = this.file.content;
        let startOffset = this.offset;
        if (startOffset != null) {
            if (startOffset > content.length - 1) {
                startOffset = content.length - 1;
            }
            let endOffset = startOffset;
            let ctxChars = 0;
            let ctxLines = 0;
            while (ctxChars < maxChars && startOffset > 0) {
                startOffset--;
                ctxChars++;
                if (content[startOffset] == '\n') {
                    if (++ctxLines == maxLines) {
                        break;
                    }
                }
            }
            ctxChars = 0;
            ctxLines = 0;
            while (ctxChars < maxChars && endOffset < content.length - 1) {
                endOffset++;
                ctxChars++;
                if (content[endOffset] == '\n') {
                    if (++ctxLines == maxLines) {
                        break;
                    }
                }
            }
            return {
                before: content.substring(startOffset, this.offset),
                after: content.substring(this.offset, endOffset + 1),
            };
        }
        return null;
    }
}
export class ParseSourceFile {
    constructor(content, url) {
        this.content = content;
        this.url = url;
    }
}
export class ParseSourceSpan {
    /**
     * Create an object that holds information about spans of tokens/nodes captured during
     * lexing/parsing of text.
     *
     * @param start
     * The location of the start of the span (having skipped leading trivia).
     * Skipping leading trivia makes source-spans more "user friendly", since things like HTML
     * elements will appear to begin at the start of the opening tag, rather than at the start of any
     * leading trivia, which could include newlines.
     *
     * @param end
     * The location of the end of the span.
     *
     * @param fullStart
     * The start of the token without skipping the leading trivia.
     * This is used by tooling that splits tokens further, such as extracting Angular interpolations
     * from text tokens. Such tooling creates new source-spans relative to the original token's
     * source-span. If leading trivia characters have been skipped then the new source-spans may be
     * incorrectly offset.
     *
     * @param details
     * Additional information (such as identifier names) that should be associated with the span.
     */
    constructor(start, end, fullStart = start, details = null) {
        this.start = start;
        this.end = end;
        this.fullStart = fullStart;
        this.details = details;
    }
    toString() {
        return this.start.file.content.substring(this.start.offset, this.end.offset);
    }
}
export var ParseErrorLevel;
(function (ParseErrorLevel) {
    ParseErrorLevel[ParseErrorLevel["WARNING"] = 0] = "WARNING";
    ParseErrorLevel[ParseErrorLevel["ERROR"] = 1] = "ERROR";
})(ParseErrorLevel || (ParseErrorLevel = {}));
export class ParseError {
    constructor(span, msg, level = ParseErrorLevel.ERROR) {
        this.span = span;
        this.msg = msg;
        this.level = level;
    }
    contextualMessage() {
        const ctx = this.span.start.getContext(100, 3);
        return ctx
            ? `${this.msg} ("${ctx.before}[${ParseErrorLevel[this.level]} ->]${ctx.after}")`
            : this.msg;
    }
    toString() {
        const details = this.span.details ? `, ${this.span.details}` : '';
        return `${this.contextualMessage()}: ${this.span.start}${details}`;
    }
}
/**
 * Generates Source Span object for a given R3 Type for JIT mode.
 *
 * @param kind Component or Directive.
 * @param typeName name of the Component or Directive.
 * @param sourceUrl reference to Component or Directive source.
 * @returns instance of ParseSourceSpan that represent a given Component or Directive.
 */
export function r3JitTypeSourceSpan(kind, typeName, sourceUrl) {
    const sourceFileName = `in ${kind} ${typeName} in ${sourceUrl}`;
    const sourceFile = new ParseSourceFile('', sourceFileName);
    return new ParseSourceSpan(new ParseLocation(sourceFile, -1, -1, -1), new ParseLocation(sourceFile, -1, -1, -1));
}
let _anonymousTypeIndex = 0;
export function identifierName(compileIdentifier) {
    if (!compileIdentifier || !compileIdentifier.reference) {
        return null;
    }
    const ref = compileIdentifier.reference;
    if (ref['__anonymousType']) {
        return ref['__anonymousType'];
    }
    if (ref['__forward_ref__']) {
        // We do not want to try to stringify a `forwardRef()` function because that would cause the
        // inner function to be evaluated too early, defeating the whole point of the `forwardRef`.
        return '__forward_ref__';
    }
    let identifier = stringify(ref);
    if (identifier.indexOf('(') >= 0) {
        // case: anonymous functions!
        identifier = `anonymous_${_anonymousTypeIndex++}`;
        ref['__anonymousType'] = identifier;
    }
    else {
        identifier = sanitizeIdentifier(identifier);
    }
    return identifier;
}
export function sanitizeIdentifier(name) {
    return name.replace(/\W/g, '_');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9wYXJzZV91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sS0FBSyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFakMsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFDUyxJQUFxQixFQUNyQixNQUFjLEVBQ2QsSUFBWSxFQUNaLEdBQVc7UUFIWCxTQUFJLEdBQUosSUFBSSxDQUFpQjtRQUNyQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFDakIsQ0FBQztJQUVKLFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUMzRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQWE7UUFDbEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQixPQUFPLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO1lB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b3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGNoYXJzIGZyb20gJy4vY2hhcnMnO1xuaW1wb3J0IHtzdHJpbmdpZnl9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBjbGFzcyBQYXJzZUxvY2F0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGZpbGU6IFBhcnNlU291cmNlRmlsZSxcbiAgICBwdWJsaWMgb2Zmc2V0OiBudW1iZXIsXG4gICAgcHVibGljIGxpbmU6IG51bWJlcixcbiAgICBwdWJsaWMgY29sOiBudW1iZXIsXG4gICkge31cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm9mZnNldCAhPSBudWxsID8gYCR7dGhpcy5maWxlLnVybH1AJHt0aGlzLmxpbmV9OiR7dGhpcy5jb2x9YCA6IHRoaXMuZmlsZS51cmw7XG4gIH1cblxuICBtb3ZlQnkoZGVsdGE6IG51bWJlcik6IFBhcnNlTG9jYXRpb24ge1xuICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMuZmlsZS5jb250ZW50O1xuICAgIGNvbnN0IGxlbiA9IHNvdXJjZS5sZW5ndGg7XG4gICAgbGV0IG9mZnNldCA9IHRoaXMub2Zmc2V0O1xuICAgIGxldCBsaW5lID0gdGhpcy5saW5lO1xuICAgIGxldCBjb2wgPSB0aGlzLmNvbDtcbiAgICB3aGlsZSAob2Zmc2V0ID4gMCAmJiBkZWx0YSA8IDApIHtcbiAgICAgIG9mZnNldC0tO1xuICAgICAgZGVsdGErKztcbiAgICAgIGNvbnN0IGNoID0gc291cmNlLmNoYXJDb2RlQXQob2Zmc2V0KTtcbiAgICAgIGlmIChjaCA9PSBjaGFycy4kTEYpIHtcbiAgICAgICAgbGluZS0tO1xuICAgICAgICBjb25zdCBwcmlvckxpbmUgPSBzb3VyY2VcbiAgICAgICAgICAuc3Vic3RyaW5nKDAsIG9mZnNldCAtIDEpXG4gICAgICAgICAgLmxhc3RJbmRleE9mKFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcnMuJExGKSk7XG4gICAgICAgIGNvbCA9IHByaW9yTGluZSA+IDAgPyBvZmZzZXQgLSBwcmlvckxpbmUgOiBvZmZzZXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2wtLTtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKG9mZnNldCA8IGxlbiAmJiBkZWx0YSA+IDApIHtcbiAgICAgIGNvbnN0IGNoID0gc291cmNlLmNoYXJDb2RlQXQob2Zmc2V0KTtcbiAgICAgIG9mZnNldCsrO1xuICAgICAgZGVsdGEtLTtcbiAgICAgIGlmIChjaCA9PSBjaGFycy4kTEYpIHtcbiAgICAgICAgbGluZSsrO1xuICAgICAgICBjb2wgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUGFyc2VMb2NhdGlvbih0aGlzLmZpbGUsIG9mZnNldCwgbGluZSwgY29sKTtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgc291cmNlIGFyb3VuZCB0aGUgbG9jYXRpb25cbiAgLy8gVXAgdG8gYG1heENoYXJzYCBvciBgbWF4TGluZXNgIG9uIGVhY2ggc2lkZSBvZiB0aGUgbG9jYXRpb25cbiAgZ2V0Q29udGV4dChtYXhDaGFyczogbnVtYmVyLCBtYXhMaW5lczogbnVtYmVyKToge2JlZm9yZTogc3RyaW5nOyBhZnRlcjogc3RyaW5nfSB8IG51bGwge1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmZpbGUuY29udGVudDtcbiAgICBsZXQgc3RhcnRPZmZzZXQgPSB0aGlzLm9mZnNldDtcblxuICAgIGlmIChzdGFydE9mZnNldCAhPSBudWxsKSB7XG4gICAgICBpZiAoc3RhcnRPZmZzZXQgPiBjb250ZW50Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgc3RhcnRPZmZzZXQgPSBjb250ZW50Lmxlbmd0aCAtIDE7XG4gICAgICB9XG4gICAgICBsZXQgZW5kT2Zmc2V0ID0gc3RhcnRPZmZzZXQ7XG4gICAgICBsZXQgY3R4Q2hhcnMgPSAwO1xuICAgICAgbGV0IGN0eExpbmVzID0gMDtcblxuICAgICAgd2hpbGUgKGN0eENoYXJzIDwgbWF4Q2hhcnMgJiYgc3RhcnRPZmZzZXQgPiAwKSB7XG4gICAgICAgIHN0YXJ0T2Zmc2V0LS07XG4gICAgICAgIGN0eENoYXJzKys7XG4gICAgICAgIGlmIChjb250ZW50W3N0YXJ0T2Zmc2V0XSA9PSAnXFxuJykge1xuICAgICAgICAgIGlmICgrK2N0eExpbmVzID09IG1heExpbmVzKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY3R4Q2hhcnMgPSAwO1xuICAgICAgY3R4TGluZXMgPSAwO1xuICAgICAgd2hpbGUgKGN0eENoYXJzIDwgbWF4Q2hhcnMgJiYgZW5kT2Zmc2V0IDwgY29udGVudC5sZW5ndGggLSAxKSB7XG4gICAgICAgIGVuZE9mZnNldCsrO1xuICAgICAgICBjdHhDaGFycysrO1xuICAgICAgICBpZiAoY29udGVudFtlbmRPZmZzZXRdID09ICdcXG4nKSB7XG4gICAgICAgICAgaWYgKCsrY3R4TGluZXMgPT0gbWF4TGluZXMpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBiZWZvcmU6IGNvbnRlbnQuc3Vic3RyaW5nKHN0YXJ0T2Zmc2V0LCB0aGlzLm9mZnNldCksXG4gICAgICAgIGFmdGVyOiBjb250ZW50LnN1YnN0cmluZyh0aGlzLm9mZnNldCwgZW5kT2Zmc2V0ICsgMSksXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZVNvdXJjZUZpbGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY29udGVudDogc3RyaW5nLFxuICAgIHB1YmxpYyB1cmw6IHN0cmluZyxcbiAgKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VTb3VyY2VTcGFuIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBvYmplY3QgdGhhdCBob2xkcyBpbmZvcm1hdGlvbiBhYm91dCBzcGFucyBvZiB0b2tlbnMvbm9kZXMgY2FwdHVyZWQgZHVyaW5nXG4gICAqIGxleGluZy9wYXJzaW5nIG9mIHRleHQuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydFxuICAgKiBUaGUgbG9jYXRpb24gb2YgdGhlIHN0YXJ0IG9mIHRoZSBzcGFuIChoYXZpbmcgc2tpcHBlZCBsZWFkaW5nIHRyaXZpYSkuXG4gICAqIFNraXBwaW5nIGxlYWRpbmcgdHJpdmlhIG1ha2VzIHNvdXJjZS1zcGFucyBtb3JlIFwidXNlciBmcmllbmRseVwiLCBzaW5jZSB0aGluZ3MgbGlrZSBIVE1MXG4gICAqIGVsZW1lbnRzIHdpbGwgYXBwZWFyIHRvIGJlZ2luIGF0IHRoZSBzdGFydCBvZiB0aGUgb3BlbmluZyB0YWcsIHJhdGhlciB0aGFuIGF0IHRoZSBzdGFydCBvZiBhbnlcbiAgICogbGVhZGluZyB0cml2aWEsIHdoaWNoIGNvdWxkIGluY2x1ZGUgbmV3bGluZXMuXG4gICAqXG4gICAqIEBwYXJhbSBlbmRcbiAgICogVGhlIGxvY2F0aW9uIG9mIHRoZSBlbmQgb2YgdGhlIHNwYW4uXG4gICAqXG4gICAqIEBwYXJhbSBmdWxsU3RhcnRcbiAgICogVGhlIHN0YXJ0IG9mIHRoZSB0b2tlbiB3aXRob3V0IHNraXBwaW5nIHRoZSBsZWFkaW5nIHRyaXZpYS5cbiAgICogVGhpcyBpcyB1c2VkIGJ5IHRvb2xpbmcgdGhhdCBzcGxpdHMgdG9rZW5zIGZ1cnRoZXIsIHN1Y2ggYXMgZXh0cmFjdGluZyBBbmd1bGFyIGludGVycG9sYXRpb25zXG4gICAqIGZyb20gdGV4dCB0b2tlbnMuIFN1Y2ggdG9vbGluZyBjcmVhdGVzIG5ldyBzb3VyY2Utc3BhbnMgcmVsYXRpdmUgdG8gdGhlIG9yaWdpbmFsIHRva2VuJ3NcbiAgICogc291cmNlLXNwYW4uIElmIGxlYWRpbmcgdHJpdmlhIGNoYXJhY3RlcnMgaGF2ZSBiZWVuIHNraXBwZWQgdGhlbiB0aGUgbmV3IHNvdXJjZS1zcGFucyBtYXkgYmVcbiAgICogaW5jb3JyZWN0bHkgb2Zmc2V0LlxuICAgKlxuICAgKiBAcGFyYW0gZGV0YWlsc1xuICAgKiBBZGRpdGlvbmFsIGluZm9ybWF0aW9uIChzdWNoIGFzIGlkZW50aWZpZXIgbmFtZXMpIHRoYXQgc2hvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3Bhbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzdGFydDogUGFyc2VMb2NhdGlvbixcbiAgICBwdWJsaWMgZW5kOiBQYXJzZUxvY2F0aW9uLFxuICAgIHB1YmxpYyBmdWxsU3RhcnQ6IFBhcnNlTG9jYXRpb24gPSBzdGFydCxcbiAgICBwdWJsaWMgZGV0YWlsczogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4gICkge31cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0LmZpbGUuY29udGVudC5zdWJzdHJpbmcodGhpcy5zdGFydC5vZmZzZXQsIHRoaXMuZW5kLm9mZnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGVudW0gUGFyc2VFcnJvckxldmVsIHtcbiAgV0FSTklORyxcbiAgRVJST1IsXG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgbXNnOiBzdHJpbmcsXG4gICAgcHVibGljIGxldmVsOiBQYXJzZUVycm9yTGV2ZWwgPSBQYXJzZUVycm9yTGV2ZWwuRVJST1IsXG4gICkge31cblxuICBjb250ZXh0dWFsTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuc3Bhbi5zdGFydC5nZXRDb250ZXh0KDEwMCwgMyk7XG4gICAgcmV0dXJuIGN0eFxuICAgICAgPyBgJHt0aGlzLm1zZ30gKFwiJHtjdHguYmVmb3JlfVske1BhcnNlRXJyb3JMZXZlbFt0aGlzLmxldmVsXX0gLT5dJHtjdHguYWZ0ZXJ9XCIpYFxuICAgICAgOiB0aGlzLm1zZztcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZGV0YWlscyA9IHRoaXMuc3Bhbi5kZXRhaWxzID8gYCwgJHt0aGlzLnNwYW4uZGV0YWlsc31gIDogJyc7XG4gICAgcmV0dXJuIGAke3RoaXMuY29udGV4dHVhbE1lc3NhZ2UoKX06ICR7dGhpcy5zcGFuLnN0YXJ0fSR7ZGV0YWlsc31gO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIFNvdXJjZSBTcGFuIG9iamVjdCBmb3IgYSBnaXZlbiBSMyBUeXBlIGZvciBKSVQgbW9kZS5cbiAqXG4gKiBAcGFyYW0ga2luZCBDb21wb25lbnQgb3IgRGlyZWN0aXZlLlxuICogQHBhcmFtIHR5cGVOYW1lIG5hbWUgb2YgdGhlIENvbXBvbmVudCBvciBEaXJlY3RpdmUuXG4gKiBAcGFyYW0gc291cmNlVXJsIHJlZmVyZW5jZSB0byBDb21wb25lbnQgb3IgRGlyZWN0aXZlIHNvdXJjZS5cbiAqIEByZXR1cm5zIGluc3RhbmNlIG9mIFBhcnNlU291cmNlU3BhbiB0aGF0IHJlcHJlc2VudCBhIGdpdmVuIENvbXBvbmVudCBvciBEaXJlY3RpdmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByM0ppdFR5cGVTb3VyY2VTcGFuKFxuICBraW5kOiBzdHJpbmcsXG4gIHR5cGVOYW1lOiBzdHJpbmcsXG4gIHNvdXJjZVVybDogc3RyaW5nLFxuKTogUGFyc2VTb3VyY2VTcGFuIHtcbiAgY29uc3Qgc291cmNlRmlsZU5hbWUgPSBgaW4gJHtraW5kfSAke3R5cGVOYW1lfSBpbiAke3NvdXJjZVVybH1gO1xuICBjb25zdCBzb3VyY2VGaWxlID0gbmV3IFBhcnNlU291cmNlRmlsZSgnJywgc291cmNlRmlsZU5hbWUpO1xuICByZXR1cm4gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICBuZXcgUGFyc2VMb2NhdGlvbihzb3VyY2VGaWxlLCAtMSwgLTEsIC0xKSxcbiAgICBuZXcgUGFyc2VMb2NhdGlvbihzb3VyY2VGaWxlLCAtMSwgLTEsIC0xKSxcbiAgKTtcbn1cblxubGV0IF9hbm9ueW1vdXNUeXBlSW5kZXggPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpZmllck5hbWUoXG4gIGNvbXBpbGVJZGVudGlmaWVyOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgbnVsbCB8IHVuZGVmaW5lZCxcbik6IHN0cmluZyB8IG51bGwge1xuICBpZiAoIWNvbXBpbGVJZGVudGlmaWVyIHx8ICFjb21waWxlSWRlbnRpZmllci5yZWZlcmVuY2UpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCByZWYgPSBjb21waWxlSWRlbnRpZmllci5yZWZlcmVuY2U7XG4gIGlmIChyZWZbJ19fYW5vbnltb3VzVHlwZSddKSB7XG4gICAgcmV0dXJuIHJlZlsnX19hbm9ueW1vdXNUeXBlJ107XG4gIH1cbiAgaWYgKHJlZlsnX19mb3J3YXJkX3JlZl9fJ10pIHtcbiAgICAvLyBXZSBkbyBub3Qgd2FudCB0byB0cnkgdG8gc3RyaW5naWZ5IGEgYGZvcndhcmRSZWYoKWAgZnVuY3Rpb24gYmVjYXVzZSB0aGF0IHdvdWxkIGNhdXNlIHRoZVxuICAgIC8vIGlubmVyIGZ1bmN0aW9uIHRvIGJlIGV2YWx1YXRlZCB0b28gZWFybHksIGRlZmVhdGluZyB0aGUgd2hvbGUgcG9pbnQgb2YgdGhlIGBmb3J3YXJkUmVmYC5cbiAgICByZXR1cm4gJ19fZm9yd2FyZF9yZWZfXyc7XG4gIH1cbiAgbGV0IGlkZW50aWZpZXIgPSBzdHJpbmdpZnkocmVmKTtcbiAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignKCcpID49IDApIHtcbiAgICAvLyBjYXNlOiBhbm9ueW1vdXMgZnVuY3Rpb25zIVxuICAgIGlkZW50aWZpZXIgPSBgYW5vbnltb3VzXyR7X2Fub255bW91c1R5cGVJbmRleCsrfWA7XG4gICAgcmVmWydfX2Fub255bW91c1R5cGUnXSA9IGlkZW50aWZpZXI7XG4gIH0gZWxzZSB7XG4gICAgaWRlbnRpZmllciA9IHNhbml0aXplSWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgcmVmZXJlbmNlOiBhbnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUlkZW50aWZpZXIobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZSgvXFxXL2csICdfJyk7XG59XG4iXX0=
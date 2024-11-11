/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9wYXJzZV91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sS0FBSyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFakMsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFDUyxJQUFxQixFQUNyQixNQUFjLEVBQ2QsSUFBWSxFQUNaLEdBQVc7UUFIWCxTQUFJLEdBQUosSUFBSSxDQUFpQjtRQUNyQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFDakIsQ0FBQztJQUVKLFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUMzRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQWE7UUFDbEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQixPQUFPLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO1lB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b3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyBjaGFycyBmcm9tICcuL2NoYXJzJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgUGFyc2VMb2NhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBmaWxlOiBQYXJzZVNvdXJjZUZpbGUsXG4gICAgcHVibGljIG9mZnNldDogbnVtYmVyLFxuICAgIHB1YmxpYyBsaW5lOiBudW1iZXIsXG4gICAgcHVibGljIGNvbDogbnVtYmVyLFxuICApIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQgIT0gbnVsbCA/IGAke3RoaXMuZmlsZS51cmx9QCR7dGhpcy5saW5lfToke3RoaXMuY29sfWAgOiB0aGlzLmZpbGUudXJsO1xuICB9XG5cbiAgbW92ZUJ5KGRlbHRhOiBudW1iZXIpOiBQYXJzZUxvY2F0aW9uIHtcbiAgICBjb25zdCBzb3VyY2UgPSB0aGlzLmZpbGUuY29udGVudDtcbiAgICBjb25zdCBsZW4gPSBzb3VyY2UubGVuZ3RoO1xuICAgIGxldCBvZmZzZXQgPSB0aGlzLm9mZnNldDtcbiAgICBsZXQgbGluZSA9IHRoaXMubGluZTtcbiAgICBsZXQgY29sID0gdGhpcy5jb2w7XG4gICAgd2hpbGUgKG9mZnNldCA+IDAgJiYgZGVsdGEgPCAwKSB7XG4gICAgICBvZmZzZXQtLTtcbiAgICAgIGRlbHRhKys7XG4gICAgICBjb25zdCBjaCA9IHNvdXJjZS5jaGFyQ29kZUF0KG9mZnNldCk7XG4gICAgICBpZiAoY2ggPT0gY2hhcnMuJExGKSB7XG4gICAgICAgIGxpbmUtLTtcbiAgICAgICAgY29uc3QgcHJpb3JMaW5lID0gc291cmNlXG4gICAgICAgICAgLnN1YnN0cmluZygwLCBvZmZzZXQgLSAxKVxuICAgICAgICAgIC5sYXN0SW5kZXhPZihTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJzLiRMRikpO1xuICAgICAgICBjb2wgPSBwcmlvckxpbmUgPiAwID8gb2Zmc2V0IC0gcHJpb3JMaW5lIDogb2Zmc2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sLS07XG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChvZmZzZXQgPCBsZW4gJiYgZGVsdGEgPiAwKSB7XG4gICAgICBjb25zdCBjaCA9IHNvdXJjZS5jaGFyQ29kZUF0KG9mZnNldCk7XG4gICAgICBvZmZzZXQrKztcbiAgICAgIGRlbHRhLS07XG4gICAgICBpZiAoY2ggPT0gY2hhcnMuJExGKSB7XG4gICAgICAgIGxpbmUrKztcbiAgICAgICAgY29sID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbCsrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFBhcnNlTG9jYXRpb24odGhpcy5maWxlLCBvZmZzZXQsIGxpbmUsIGNvbCk7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHNvdXJjZSBhcm91bmQgdGhlIGxvY2F0aW9uXG4gIC8vIFVwIHRvIGBtYXhDaGFyc2Agb3IgYG1heExpbmVzYCBvbiBlYWNoIHNpZGUgb2YgdGhlIGxvY2F0aW9uXG4gIGdldENvbnRleHQobWF4Q2hhcnM6IG51bWJlciwgbWF4TGluZXM6IG51bWJlcik6IHtiZWZvcmU6IHN0cmluZzsgYWZ0ZXI6IHN0cmluZ30gfCBudWxsIHtcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5maWxlLmNvbnRlbnQ7XG4gICAgbGV0IHN0YXJ0T2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XG5cbiAgICBpZiAoc3RhcnRPZmZzZXQgIT0gbnVsbCkge1xuICAgICAgaWYgKHN0YXJ0T2Zmc2V0ID4gY29udGVudC5sZW5ndGggLSAxKSB7XG4gICAgICAgIHN0YXJ0T2Zmc2V0ID0gY29udGVudC5sZW5ndGggLSAxO1xuICAgICAgfVxuICAgICAgbGV0IGVuZE9mZnNldCA9IHN0YXJ0T2Zmc2V0O1xuICAgICAgbGV0IGN0eENoYXJzID0gMDtcbiAgICAgIGxldCBjdHhMaW5lcyA9IDA7XG5cbiAgICAgIHdoaWxlIChjdHhDaGFycyA8IG1heENoYXJzICYmIHN0YXJ0T2Zmc2V0ID4gMCkge1xuICAgICAgICBzdGFydE9mZnNldC0tO1xuICAgICAgICBjdHhDaGFycysrO1xuICAgICAgICBpZiAoY29udGVudFtzdGFydE9mZnNldF0gPT0gJ1xcbicpIHtcbiAgICAgICAgICBpZiAoKytjdHhMaW5lcyA9PSBtYXhMaW5lcykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGN0eENoYXJzID0gMDtcbiAgICAgIGN0eExpbmVzID0gMDtcbiAgICAgIHdoaWxlIChjdHhDaGFycyA8IG1heENoYXJzICYmIGVuZE9mZnNldCA8IGNvbnRlbnQubGVuZ3RoIC0gMSkge1xuICAgICAgICBlbmRPZmZzZXQrKztcbiAgICAgICAgY3R4Q2hhcnMrKztcbiAgICAgICAgaWYgKGNvbnRlbnRbZW5kT2Zmc2V0XSA9PSAnXFxuJykge1xuICAgICAgICAgIGlmICgrK2N0eExpbmVzID09IG1heExpbmVzKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmVmb3JlOiBjb250ZW50LnN1YnN0cmluZyhzdGFydE9mZnNldCwgdGhpcy5vZmZzZXQpLFxuICAgICAgICBhZnRlcjogY29udGVudC5zdWJzdHJpbmcodGhpcy5vZmZzZXQsIGVuZE9mZnNldCArIDEpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VTb3VyY2VGaWxlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGNvbnRlbnQ6IHN0cmluZyxcbiAgICBwdWJsaWMgdXJsOiBzdHJpbmcsXG4gICkge31cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlU291cmNlU3BhbiB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gb2JqZWN0IHRoYXQgaG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgc3BhbnMgb2YgdG9rZW5zL25vZGVzIGNhcHR1cmVkIGR1cmluZ1xuICAgKiBsZXhpbmcvcGFyc2luZyBvZiB0ZXh0LlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnRcbiAgICogVGhlIGxvY2F0aW9uIG9mIHRoZSBzdGFydCBvZiB0aGUgc3BhbiAoaGF2aW5nIHNraXBwZWQgbGVhZGluZyB0cml2aWEpLlxuICAgKiBTa2lwcGluZyBsZWFkaW5nIHRyaXZpYSBtYWtlcyBzb3VyY2Utc3BhbnMgbW9yZSBcInVzZXIgZnJpZW5kbHlcIiwgc2luY2UgdGhpbmdzIGxpa2UgSFRNTFxuICAgKiBlbGVtZW50cyB3aWxsIGFwcGVhciB0byBiZWdpbiBhdCB0aGUgc3RhcnQgb2YgdGhlIG9wZW5pbmcgdGFnLCByYXRoZXIgdGhhbiBhdCB0aGUgc3RhcnQgb2YgYW55XG4gICAqIGxlYWRpbmcgdHJpdmlhLCB3aGljaCBjb3VsZCBpbmNsdWRlIG5ld2xpbmVzLlxuICAgKlxuICAgKiBAcGFyYW0gZW5kXG4gICAqIFRoZSBsb2NhdGlvbiBvZiB0aGUgZW5kIG9mIHRoZSBzcGFuLlxuICAgKlxuICAgKiBAcGFyYW0gZnVsbFN0YXJ0XG4gICAqIFRoZSBzdGFydCBvZiB0aGUgdG9rZW4gd2l0aG91dCBza2lwcGluZyB0aGUgbGVhZGluZyB0cml2aWEuXG4gICAqIFRoaXMgaXMgdXNlZCBieSB0b29saW5nIHRoYXQgc3BsaXRzIHRva2VucyBmdXJ0aGVyLCBzdWNoIGFzIGV4dHJhY3RpbmcgQW5ndWxhciBpbnRlcnBvbGF0aW9uc1xuICAgKiBmcm9tIHRleHQgdG9rZW5zLiBTdWNoIHRvb2xpbmcgY3JlYXRlcyBuZXcgc291cmNlLXNwYW5zIHJlbGF0aXZlIHRvIHRoZSBvcmlnaW5hbCB0b2tlbidzXG4gICAqIHNvdXJjZS1zcGFuLiBJZiBsZWFkaW5nIHRyaXZpYSBjaGFyYWN0ZXJzIGhhdmUgYmVlbiBza2lwcGVkIHRoZW4gdGhlIG5ldyBzb3VyY2Utc3BhbnMgbWF5IGJlXG4gICAqIGluY29ycmVjdGx5IG9mZnNldC5cbiAgICpcbiAgICogQHBhcmFtIGRldGFpbHNcbiAgICogQWRkaXRpb25hbCBpbmZvcm1hdGlvbiAoc3VjaCBhcyBpZGVudGlmaWVyIG5hbWVzKSB0aGF0IHNob3VsZCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwYW4uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgc3RhcnQ6IFBhcnNlTG9jYXRpb24sXG4gICAgcHVibGljIGVuZDogUGFyc2VMb2NhdGlvbixcbiAgICBwdWJsaWMgZnVsbFN0YXJ0OiBQYXJzZUxvY2F0aW9uID0gc3RhcnQsXG4gICAgcHVibGljIGRldGFpbHM6IHN0cmluZyB8IG51bGwgPSBudWxsLFxuICApIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydC5maWxlLmNvbnRlbnQuc3Vic3RyaW5nKHRoaXMuc3RhcnQub2Zmc2V0LCB0aGlzLmVuZC5vZmZzZXQpO1xuICB9XG59XG5cbmV4cG9ydCBlbnVtIFBhcnNlRXJyb3JMZXZlbCB7XG4gIFdBUk5JTkcsXG4gIEVSUk9SLFxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIG1zZzogc3RyaW5nLFxuICAgIHB1YmxpYyBsZXZlbDogUGFyc2VFcnJvckxldmVsID0gUGFyc2VFcnJvckxldmVsLkVSUk9SLFxuICApIHt9XG5cbiAgY29udGV4dHVhbE1lc3NhZ2UoKTogc3RyaW5nIHtcbiAgICBjb25zdCBjdHggPSB0aGlzLnNwYW4uc3RhcnQuZ2V0Q29udGV4dCgxMDAsIDMpO1xuICAgIHJldHVybiBjdHhcbiAgICAgID8gYCR7dGhpcy5tc2d9IChcIiR7Y3R4LmJlZm9yZX1bJHtQYXJzZUVycm9yTGV2ZWxbdGhpcy5sZXZlbF19IC0+XSR7Y3R4LmFmdGVyfVwiKWBcbiAgICAgIDogdGhpcy5tc2c7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IGRldGFpbHMgPSB0aGlzLnNwYW4uZGV0YWlscyA/IGAsICR7dGhpcy5zcGFuLmRldGFpbHN9YCA6ICcnO1xuICAgIHJldHVybiBgJHt0aGlzLmNvbnRleHR1YWxNZXNzYWdlKCl9OiAke3RoaXMuc3Bhbi5zdGFydH0ke2RldGFpbHN9YDtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBTb3VyY2UgU3BhbiBvYmplY3QgZm9yIGEgZ2l2ZW4gUjMgVHlwZSBmb3IgSklUIG1vZGUuXG4gKlxuICogQHBhcmFtIGtpbmQgQ29tcG9uZW50IG9yIERpcmVjdGl2ZS5cbiAqIEBwYXJhbSB0eXBlTmFtZSBuYW1lIG9mIHRoZSBDb21wb25lbnQgb3IgRGlyZWN0aXZlLlxuICogQHBhcmFtIHNvdXJjZVVybCByZWZlcmVuY2UgdG8gQ29tcG9uZW50IG9yIERpcmVjdGl2ZSBzb3VyY2UuXG4gKiBAcmV0dXJucyBpbnN0YW5jZSBvZiBQYXJzZVNvdXJjZVNwYW4gdGhhdCByZXByZXNlbnQgYSBnaXZlbiBDb21wb25lbnQgb3IgRGlyZWN0aXZlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcjNKaXRUeXBlU291cmNlU3BhbihcbiAga2luZDogc3RyaW5nLFxuICB0eXBlTmFtZTogc3RyaW5nLFxuICBzb3VyY2VVcmw6IHN0cmluZyxcbik6IFBhcnNlU291cmNlU3BhbiB7XG4gIGNvbnN0IHNvdXJjZUZpbGVOYW1lID0gYGluICR7a2luZH0gJHt0eXBlTmFtZX0gaW4gJHtzb3VyY2VVcmx9YDtcbiAgY29uc3Qgc291cmNlRmlsZSA9IG5ldyBQYXJzZVNvdXJjZUZpbGUoJycsIHNvdXJjZUZpbGVOYW1lKTtcbiAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgbmV3IFBhcnNlTG9jYXRpb24oc291cmNlRmlsZSwgLTEsIC0xLCAtMSksXG4gICAgbmV3IFBhcnNlTG9jYXRpb24oc291cmNlRmlsZSwgLTEsIC0xLCAtMSksXG4gICk7XG59XG5cbmxldCBfYW5vbnltb3VzVHlwZUluZGV4ID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aWZpZXJOYW1lKFxuICBjb21waWxlSWRlbnRpZmllcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IG51bGwgfCB1bmRlZmluZWQsXG4pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCFjb21waWxlSWRlbnRpZmllciB8fCAhY29tcGlsZUlkZW50aWZpZXIucmVmZXJlbmNlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcmVmID0gY29tcGlsZUlkZW50aWZpZXIucmVmZXJlbmNlO1xuICBpZiAocmVmWydfX2Fub255bW91c1R5cGUnXSkge1xuICAgIHJldHVybiByZWZbJ19fYW5vbnltb3VzVHlwZSddO1xuICB9XG4gIGlmIChyZWZbJ19fZm9yd2FyZF9yZWZfXyddKSB7XG4gICAgLy8gV2UgZG8gbm90IHdhbnQgdG8gdHJ5IHRvIHN0cmluZ2lmeSBhIGBmb3J3YXJkUmVmKClgIGZ1bmN0aW9uIGJlY2F1c2UgdGhhdCB3b3VsZCBjYXVzZSB0aGVcbiAgICAvLyBpbm5lciBmdW5jdGlvbiB0byBiZSBldmFsdWF0ZWQgdG9vIGVhcmx5LCBkZWZlYXRpbmcgdGhlIHdob2xlIHBvaW50IG9mIHRoZSBgZm9yd2FyZFJlZmAuXG4gICAgcmV0dXJuICdfX2ZvcndhcmRfcmVmX18nO1xuICB9XG4gIGxldCBpZGVudGlmaWVyID0gc3RyaW5naWZ5KHJlZik7XG4gIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJygnKSA+PSAwKSB7XG4gICAgLy8gY2FzZTogYW5vbnltb3VzIGZ1bmN0aW9ucyFcbiAgICBpZGVudGlmaWVyID0gYGFub255bW91c18ke19hbm9ueW1vdXNUeXBlSW5kZXgrK31gO1xuICAgIHJlZlsnX19hbm9ueW1vdXNUeXBlJ10gPSBpZGVudGlmaWVyO1xuICB9IGVsc2Uge1xuICAgIGlkZW50aWZpZXIgPSBzYW5pdGl6ZUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gIHJlZmVyZW5jZTogYW55O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJZGVudGlmaWVyKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lLnJlcGxhY2UoL1xcVy9nLCAnXycpO1xufVxuIl19
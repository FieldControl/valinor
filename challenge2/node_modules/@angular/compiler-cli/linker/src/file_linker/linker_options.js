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
        define("@angular/compiler-cli/linker/src/file_linker/linker_options", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_LINKER_OPTIONS = void 0;
    /**
     * The default linker options to use if properties are not provided.
     */
    exports.DEFAULT_LINKER_OPTIONS = {
        sourceMapping: true,
        linkerJitMode: false,
        unknownDeclarationVersionHandling: 'error',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua2VyX29wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL3NyYy9maWxlX2xpbmtlci9saW5rZXJfb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFtQ0g7O09BRUc7SUFDVSxRQUFBLHNCQUFzQixHQUFrQjtRQUNuRCxhQUFhLEVBQUUsSUFBSTtRQUNuQixhQUFhLEVBQUUsS0FBSztRQUNwQixpQ0FBaUMsRUFBRSxPQUFPO0tBQzNDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBPcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgbGlua2luZyBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaW5rZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gdXNlIHNvdXJjZS1tYXBwaW5nIHRvIGNvbXB1dGUgdGhlIG9yaWdpbmFsIHNvdXJjZSBmb3IgZXh0ZXJuYWwgdGVtcGxhdGVzLlxuICAgKiBUaGUgZGVmYXVsdCBpcyBgdHJ1ZWAuXG4gICAqL1xuICBzb3VyY2VNYXBwaW5nOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUaGlzIG9wdGlvbiB0ZWxscyB0aGUgbGlua2VyIHRvIGdlbmVyYXRlIGluZm9ybWF0aW9uIHVzZWQgYnkgYSBkb3duc3RyZWFtIEpJVCBjb21waWxlci5cbiAgICpcbiAgICogU3BlY2lmaWNhbGx5LCBpbiBKSVQgbW9kZSwgTmdNb2R1bGUgZGVmaW5pdGlvbnMgbXVzdCBkZXNjcmliZSB0aGUgYGRlY2xhcmF0aW9uc2AsIGBpbXBvcnRzYCxcbiAgICogYGV4cG9ydHNgLCBldGMsIHdoaWNoIGFyZSBvdGhlcndpc2Ugbm90IG5lZWRlZC5cbiAgICovXG4gIGxpbmtlckppdE1vZGU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEhvdyB0byBoYW5kbGUgYSBzaXR1YXRpb24gd2hlcmUgYSBwYXJ0aWFsIGRlY2xhcmF0aW9uIG1hdGNoZXMgbm9uZSBvZiB0aGUgc3VwcG9ydGVkXG4gICAqIHBhcnRpYWwtbGlua2VyIHZlcnNpb25zLlxuICAgKlxuICAgKiAtIGBlcnJvcmAgLSB0aGUgdmVyc2lvbiBtaXNtYXRjaCBpcyBhIGZhdGFsIGVycm9yLlxuICAgKiAtIGB3YXJuYCAtIGEgd2FybmluZyBpcyBzZW50IHRvIHRoZSBsb2dnZXIgYnV0IHRoZSBtb3N0IHJlY2VudCBwYXJ0aWFsLWxpbmtlclxuICAgKiAgIHdpbGwgYXR0ZW1wdCB0byBwcm9jZXNzIHRoZSBkZWNsYXJhdGlvbiBhbnl3YXkuXG4gICAqIC0gYGlnbm9yZWAgLSB0aGUgbW9zdCByZWNlbnQgcGFydGlhbC1saW5rZXIgd2lsbCwgc2lsZW50bHksIGF0dGVtcHQgdG8gcHJvY2Vzc1xuICAgKiAgIHRoZSBkZWNsYXJhdGlvbi5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgaXMgYGVycm9yYC5cbiAgICovXG4gIHVua25vd25EZWNsYXJhdGlvblZlcnNpb25IYW5kbGluZzogJ2lnbm9yZSd8J3dhcm4nfCdlcnJvcic7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgbGlua2VyIG9wdGlvbnMgdG8gdXNlIGlmIHByb3BlcnRpZXMgYXJlIG5vdCBwcm92aWRlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTElOS0VSX09QVElPTlM6IExpbmtlck9wdGlvbnMgPSB7XG4gIHNvdXJjZU1hcHBpbmc6IHRydWUsXG4gIGxpbmtlckppdE1vZGU6IGZhbHNlLFxuICB1bmtub3duRGVjbGFyYXRpb25WZXJzaW9uSGFuZGxpbmc6ICdlcnJvcicsXG59O1xuIl19
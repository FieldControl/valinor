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
        define("@angular/compiler-cli/linker/src/fatal_linker_error", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isFatalLinkerError = exports.FatalLinkerError = void 0;
    var tslib_1 = require("tslib");
    /**
     * An unrecoverable error during linking.
     */
    var FatalLinkerError = /** @class */ (function (_super) {
        tslib_1.__extends(FatalLinkerError, _super);
        /**
         * Create a new FatalLinkerError.
         *
         * @param node The AST node where the error occurred.
         * @param message A description of the error.
         */
        function FatalLinkerError(node, message) {
            var _this = _super.call(this, message) || this;
            _this.node = node;
            _this.type = 'FatalLinkerError';
            return _this;
        }
        return FatalLinkerError;
    }(Error));
    exports.FatalLinkerError = FatalLinkerError;
    /**
     * Whether the given object `e` is a FatalLinkerError.
     */
    function isFatalLinkerError(e) {
        return e && e.type === 'FatalLinkerError';
    }
    exports.isFatalLinkerError = isFatalLinkerError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmF0YWxfbGlua2VyX2Vycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmF0YWxfbGlua2VyX2Vycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSDs7T0FFRztJQUNIO1FBQXNDLDRDQUFLO1FBR3pDOzs7OztXQUtHO1FBQ0gsMEJBQW1CLElBQWEsRUFBRSxPQUFlO1lBQWpELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7WUFGa0IsVUFBSSxHQUFKLElBQUksQ0FBUztZQVJ2QixVQUFJLEdBQUcsa0JBQWtCLENBQUM7O1FBVW5DLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUFaRCxDQUFzQyxLQUFLLEdBWTFDO0lBWlksNENBQWdCO0lBYzdCOztPQUVHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsQ0FBTTtRQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLGtCQUFrQixDQUFDO0lBQzVDLENBQUM7SUFGRCxnREFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEFuIHVucmVjb3ZlcmFibGUgZXJyb3IgZHVyaW5nIGxpbmtpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYXRhbExpbmtlckVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICByZWFkb25seSB0eXBlID0gJ0ZhdGFsTGlua2VyRXJyb3InO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgRmF0YWxMaW5rZXJFcnJvci5cbiAgICpcbiAgICogQHBhcmFtIG5vZGUgVGhlIEFTVCBub2RlIHdoZXJlIHRoZSBlcnJvciBvY2N1cnJlZC5cbiAgICogQHBhcmFtIG1lc3NhZ2UgQSBkZXNjcmlwdGlvbiBvZiB0aGUgZXJyb3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbm9kZTogdW5rbm93biwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgYGVgIGlzIGEgRmF0YWxMaW5rZXJFcnJvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmF0YWxMaW5rZXJFcnJvcihlOiBhbnkpOiBlIGlzIEZhdGFsTGlua2VyRXJyb3Ige1xuICByZXR1cm4gZSAmJiBlLnR5cGUgPT09ICdGYXRhbExpbmtlckVycm9yJztcbn1cbiJdfQ==
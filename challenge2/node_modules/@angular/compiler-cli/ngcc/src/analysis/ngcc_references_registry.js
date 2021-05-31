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
        define("@angular/compiler-cli/ngcc/src/analysis/ngcc_references_registry", ["require", "exports", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgccReferencesRegistry = void 0;
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * This is a place for DecoratorHandlers to register references that they
     * find in their analysis of the code.
     *
     * This registry is used to ensure that these references are publicly exported
     * from libraries that are compiled by ngcc.
     */
    var NgccReferencesRegistry = /** @class */ (function () {
        function NgccReferencesRegistry(host) {
            this.host = host;
            this.map = new Map();
        }
        /**
         * Register one or more references in the registry.
         * Only `ResolveReference` references are stored. Other types are ignored.
         * @param references A collection of references to register.
         */
        NgccReferencesRegistry.prototype.add = function (source) {
            var _this = this;
            var references = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                references[_i - 1] = arguments[_i];
            }
            references.forEach(function (ref) {
                // Only store relative references. We are not interested in literals.
                if (ref.bestGuessOwningModule === null && utils_1.hasNameIdentifier(ref.node)) {
                    var declaration = _this.host.getDeclarationOfIdentifier(ref.node.name);
                    if (declaration && utils_1.hasNameIdentifier(declaration.node)) {
                        _this.map.set(declaration.node.name, declaration);
                    }
                }
            });
        };
        /**
         * Create and return a mapping for the registered resolved references.
         * @returns A map of reference identifiers to reference declarations.
         */
        NgccReferencesRegistry.prototype.getDeclarationMap = function () {
            return this.map;
        };
        return NgccReferencesRegistry;
    }());
    exports.NgccReferencesRegistry = NgccReferencesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdjY19yZWZlcmVuY2VzX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2FuYWx5c2lzL25nY2NfcmVmZXJlbmNlc19yZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFNSCw4REFBMkM7SUFFM0M7Ozs7OztPQU1HO0lBQ0g7UUFHRSxnQ0FBb0IsSUFBb0I7WUFBcEIsU0FBSSxHQUFKLElBQUksQ0FBZ0I7WUFGaEMsUUFBRyxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBRVQsQ0FBQztRQUU1Qzs7OztXQUlHO1FBQ0gsb0NBQUcsR0FBSCxVQUFJLE1BQXVCO1lBQTNCLGlCQVVDO1lBVjRCLG9CQUEyQztpQkFBM0MsVUFBMkMsRUFBM0MscUJBQTJDLEVBQTNDLElBQTJDO2dCQUEzQyxtQ0FBMkM7O1lBQ3RFLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUNwQixxRUFBcUU7Z0JBQ3JFLElBQUksR0FBRyxDQUFDLHFCQUFxQixLQUFLLElBQUksSUFBSSx5QkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3JFLElBQU0sV0FBVyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxXQUFXLElBQUkseUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN0RCxLQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztxQkFDbEQ7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxrREFBaUIsR0FBakI7WUFDRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbEIsQ0FBQztRQUNILDZCQUFDO0lBQUQsQ0FBQyxBQTdCRCxJQTZCQztJQTdCWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge1JlZmVyZW5jZXNSZWdpc3RyeX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2Fubm90YXRpb25zJztcbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvaW1wb3J0cyc7XG5pbXBvcnQge0RlY2xhcmF0aW9uLCBEZWNsYXJhdGlvbk5vZGUsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvcmVmbGVjdGlvbic7XG5pbXBvcnQge2hhc05hbWVJZGVudGlmaWVyfSBmcm9tICcuLi91dGlscyc7XG5cbi8qKlxuICogVGhpcyBpcyBhIHBsYWNlIGZvciBEZWNvcmF0b3JIYW5kbGVycyB0byByZWdpc3RlciByZWZlcmVuY2VzIHRoYXQgdGhleVxuICogZmluZCBpbiB0aGVpciBhbmFseXNpcyBvZiB0aGUgY29kZS5cbiAqXG4gKiBUaGlzIHJlZ2lzdHJ5IGlzIHVzZWQgdG8gZW5zdXJlIHRoYXQgdGhlc2UgcmVmZXJlbmNlcyBhcmUgcHVibGljbHkgZXhwb3J0ZWRcbiAqIGZyb20gbGlicmFyaWVzIHRoYXQgYXJlIGNvbXBpbGVkIGJ5IG5nY2MuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ2NjUmVmZXJlbmNlc1JlZ2lzdHJ5IGltcGxlbWVudHMgUmVmZXJlbmNlc1JlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBtYXAgPSBuZXcgTWFwPHRzLklkZW50aWZpZXIsIERlY2xhcmF0aW9uPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogUmVmbGVjdGlvbkhvc3QpIHt9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIG9uZSBvciBtb3JlIHJlZmVyZW5jZXMgaW4gdGhlIHJlZ2lzdHJ5LlxuICAgKiBPbmx5IGBSZXNvbHZlUmVmZXJlbmNlYCByZWZlcmVuY2VzIGFyZSBzdG9yZWQuIE90aGVyIHR5cGVzIGFyZSBpZ25vcmVkLlxuICAgKiBAcGFyYW0gcmVmZXJlbmNlcyBBIGNvbGxlY3Rpb24gb2YgcmVmZXJlbmNlcyB0byByZWdpc3Rlci5cbiAgICovXG4gIGFkZChzb3VyY2U6IERlY2xhcmF0aW9uTm9kZSwgLi4ucmVmZXJlbmNlczogUmVmZXJlbmNlPERlY2xhcmF0aW9uTm9kZT5bXSk6IHZvaWQge1xuICAgIHJlZmVyZW5jZXMuZm9yRWFjaChyZWYgPT4ge1xuICAgICAgLy8gT25seSBzdG9yZSByZWxhdGl2ZSByZWZlcmVuY2VzLiBXZSBhcmUgbm90IGludGVyZXN0ZWQgaW4gbGl0ZXJhbHMuXG4gICAgICBpZiAocmVmLmJlc3RHdWVzc093bmluZ01vZHVsZSA9PT0gbnVsbCAmJiBoYXNOYW1lSWRlbnRpZmllcihyZWYubm9kZSkpIHtcbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSB0aGlzLmhvc3QuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIocmVmLm5vZGUubmFtZSk7XG4gICAgICAgIGlmIChkZWNsYXJhdGlvbiAmJiBoYXNOYW1lSWRlbnRpZmllcihkZWNsYXJhdGlvbi5ub2RlKSkge1xuICAgICAgICAgIHRoaXMubWFwLnNldChkZWNsYXJhdGlvbi5ub2RlLm5hbWUsIGRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbWFwcGluZyBmb3IgdGhlIHJlZ2lzdGVyZWQgcmVzb2x2ZWQgcmVmZXJlbmNlcy5cbiAgICogQHJldHVybnMgQSBtYXAgb2YgcmVmZXJlbmNlIGlkZW50aWZpZXJzIHRvIHJlZmVyZW5jZSBkZWNsYXJhdGlvbnMuXG4gICAqL1xuICBnZXREZWNsYXJhdGlvbk1hcCgpOiBNYXA8dHMuSWRlbnRpZmllciwgRGVjbGFyYXRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5tYXA7XG4gIH1cbn1cbiJdfQ==
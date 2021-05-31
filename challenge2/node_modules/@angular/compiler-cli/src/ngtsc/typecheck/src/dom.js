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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/dom", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RegistryDomSchemaChecker = void 0;
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var diagnostics_2 = require("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics");
    var REGISTRY = new compiler_1.DomElementSchemaRegistry();
    var REMOVE_XHTML_REGEX = /^:xhtml:/;
    /**
     * Checks non-Angular elements and properties against the `DomElementSchemaRegistry`, a schema
     * maintained by the Angular team via extraction from a browser IDL.
     */
    var RegistryDomSchemaChecker = /** @class */ (function () {
        function RegistryDomSchemaChecker(resolver) {
            this.resolver = resolver;
            this._diagnostics = [];
        }
        Object.defineProperty(RegistryDomSchemaChecker.prototype, "diagnostics", {
            get: function () {
                return this._diagnostics;
            },
            enumerable: false,
            configurable: true
        });
        RegistryDomSchemaChecker.prototype.checkElement = function (id, element, schemas) {
            // HTML elements inside an SVG `foreignObject` are declared in the `xhtml` namespace.
            // We need to strip it before handing it over to the registry because all HTML tag names
            // in the registry are without a namespace.
            var name = element.name.replace(REMOVE_XHTML_REGEX, '');
            if (!REGISTRY.hasElement(name, schemas)) {
                var mapping = this.resolver.getSourceMapping(id);
                var errorMsg = "'" + name + "' is not a known element:\n";
                errorMsg +=
                    "1. If '" + name + "' is an Angular component, then verify that it is part of this module.\n";
                if (name.indexOf('-') > -1) {
                    errorMsg += "2. If '" + name + "' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.";
                }
                else {
                    errorMsg +=
                        "2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                }
                var diag = diagnostics_2.makeTemplateDiagnostic(id, mapping, element.startSourceSpan, ts.DiagnosticCategory.Error, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.SCHEMA_INVALID_ELEMENT), errorMsg);
                this._diagnostics.push(diag);
            }
        };
        RegistryDomSchemaChecker.prototype.checkProperty = function (id, element, name, span, schemas) {
            if (!REGISTRY.hasProperty(element.name, name, schemas)) {
                var mapping = this.resolver.getSourceMapping(id);
                var errorMsg = "Can't bind to '" + name + "' since it isn't a known property of '" + element.name + "'.";
                if (element.name.startsWith('ng-')) {
                    errorMsg +=
                        "\n1. If '" + name + "' is an Angular directive, then add 'CommonModule' to the '@NgModule.imports' of this component." +
                            "\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                }
                else if (element.name.indexOf('-') > -1) {
                    errorMsg +=
                        "\n1. If '" + element.name + "' is an Angular component and it has '" + name + "' input, then verify that it is part of this module." +
                            ("\n2. If '" + element
                                .name + "' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.") +
                            "\n3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                }
                var diag = diagnostics_2.makeTemplateDiagnostic(id, mapping, span, ts.DiagnosticCategory.Error, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.SCHEMA_INVALID_ATTRIBUTE), errorMsg);
                this._diagnostics.push(diag);
            }
        };
        return RegistryDomSchemaChecker;
    }());
    exports.RegistryDomSchemaChecker = RegistryDomSchemaChecker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90eXBlY2hlY2svc3JjL2RvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBNEc7SUFDNUcsK0JBQWlDO0lBRWpDLDJFQUF5RDtJQUV6RCxxRkFBMEU7SUFJMUUsSUFBTSxRQUFRLEdBQUcsSUFBSSxtQ0FBd0IsRUFBRSxDQUFDO0lBQ2hELElBQU0sa0JBQWtCLEdBQUcsVUFBVSxDQUFDO0lBNEN0Qzs7O09BR0c7SUFDSDtRQU9FLGtDQUFvQixRQUFnQztZQUFoQyxhQUFRLEdBQVIsUUFBUSxDQUF3QjtZQU41QyxpQkFBWSxHQUF5QixFQUFFLENBQUM7UUFNTyxDQUFDO1FBSnhELHNCQUFJLGlEQUFXO2lCQUFmO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztZQUMzQixDQUFDOzs7V0FBQTtRQUlELCtDQUFZLEdBQVosVUFBYSxFQUFjLEVBQUUsT0FBdUIsRUFBRSxPQUF5QjtZQUM3RSxxRkFBcUY7WUFDckYsd0ZBQXdGO1lBQ3hGLDJDQUEyQztZQUMzQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUxRCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ3ZDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRW5ELElBQUksUUFBUSxHQUFHLE1BQUksSUFBSSxnQ0FBNkIsQ0FBQztnQkFDckQsUUFBUTtvQkFDSixZQUFVLElBQUksNkVBQTBFLENBQUM7Z0JBQzdGLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDMUIsUUFBUSxJQUFJLFlBQ1IsSUFBSSxrSUFBK0gsQ0FBQztpQkFDekk7cUJBQU07b0JBQ0wsUUFBUTt3QkFDSiw4RkFBOEYsQ0FBQztpQkFDcEc7Z0JBRUQsSUFBTSxJQUFJLEdBQUcsb0NBQXNCLENBQy9CLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUNqRSx5QkFBVyxDQUFDLHVCQUFTLENBQUMsc0JBQXNCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUI7UUFDSCxDQUFDO1FBRUQsZ0RBQWEsR0FBYixVQUNJLEVBQWMsRUFBRSxPQUF1QixFQUFFLElBQVksRUFBRSxJQUFxQixFQUM1RSxPQUF5QjtZQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDdEQsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFbkQsSUFBSSxRQUFRLEdBQ1Isb0JBQWtCLElBQUksOENBQXlDLE9BQU8sQ0FBQyxJQUFJLE9BQUksQ0FBQztnQkFDcEYsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDbEMsUUFBUTt3QkFDSixjQUNJLElBQUkscUdBQWtHOzRCQUMxRyxpR0FBaUcsQ0FBQztpQkFDdkc7cUJBQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDekMsUUFBUTt3QkFDSixjQUFZLE9BQU8sQ0FBQyxJQUFJLDhDQUNwQixJQUFJLHlEQUFzRDs2QkFDOUQsY0FDSSxPQUFPO2lDQUNGLElBQUksa0lBQStILENBQUE7NEJBQzVJLGlHQUFpRyxDQUFDO2lCQUN2RztnQkFFRCxJQUFNLElBQUksR0FBRyxvQ0FBc0IsQ0FDL0IsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFDOUMseUJBQVcsQ0FBQyx1QkFBUyxDQUFDLHdCQUF3QixDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzlCO1FBQ0gsQ0FBQztRQUNILCtCQUFDO0lBQUQsQ0FBQyxBQWpFRCxJQWlFQztJQWpFWSw0REFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEb21FbGVtZW50U2NoZW1hUmVnaXN0cnksIFBhcnNlU291cmNlU3BhbiwgU2NoZW1hTWV0YWRhdGEsIFRtcGxBc3RFbGVtZW50fSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtFcnJvckNvZGUsIG5nRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge1RlbXBsYXRlSWR9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge21ha2VUZW1wbGF0ZURpYWdub3N0aWMsIFRlbXBsYXRlRGlhZ25vc3RpY30gZnJvbSAnLi4vZGlhZ25vc3RpY3MnO1xuXG5pbXBvcnQge1RlbXBsYXRlU291cmNlUmVzb2x2ZXJ9IGZyb20gJy4vdGNiX3V0aWwnO1xuXG5jb25zdCBSRUdJU1RSWSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcbmNvbnN0IFJFTU9WRV9YSFRNTF9SRUdFWCA9IC9eOnhodG1sOi87XG5cbi8qKlxuICogQ2hlY2tzIGV2ZXJ5IG5vbi1Bbmd1bGFyIGVsZW1lbnQvcHJvcGVydHkgcHJvY2Vzc2VkIGluIGEgdGVtcGxhdGUgYW5kIHBvdGVudGlhbGx5IHByb2R1Y2VzXG4gKiBgdHMuRGlhZ25vc3RpY2BzIHJlbGF0ZWQgdG8gaW1wcm9wZXIgdXNhZ2UuXG4gKlxuICogQSBgRG9tU2NoZW1hQ2hlY2tlcmAncyBqb2IgaXMgdG8gY2hlY2sgRE9NIG5vZGVzIGFuZCB0aGVpciBhdHRyaWJ1dGVzIHdyaXR0ZW4gdXNlZCBpbiB0ZW1wbGF0ZXNcbiAqIGFuZCBwcm9kdWNlIGB0cy5EaWFnbm9zdGljYHMgaWYgdGhlIG5vZGVzIGRvbid0IGNvbmZvcm0gdG8gdGhlIERPTSBzcGVjaWZpY2F0aW9uLiBJdCBhY3RzIGFzIGFcbiAqIGNvbGxlY3RvciBmb3IgdGhlc2UgZGlhZ25vc3RpY3MsIGFuZCBjYW4gYmUgcXVlcmllZCBsYXRlciB0byByZXRyaWV2ZSB0aGUgbGlzdCBvZiBhbnkgdGhhdCBoYXZlXG4gKiBiZWVuIGdlbmVyYXRlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEb21TY2hlbWFDaGVja2VyIHtcbiAgLyoqXG4gICAqIEdldCB0aGUgYHRzLkRpYWdub3N0aWNgcyB0aGF0IGhhdmUgYmVlbiBnZW5lcmF0ZWQgdmlhIGBjaGVja0VsZW1lbnRgIGFuZCBgY2hlY2tQcm9wZXJ0eWAgY2FsbHNcbiAgICogdGh1cyBmYXIuXG4gICAqL1xuICByZWFkb25seSBkaWFnbm9zdGljczogUmVhZG9ubHlBcnJheTxUZW1wbGF0ZURpYWdub3N0aWM+O1xuXG4gIC8qKlxuICAgKiBDaGVjayBhIG5vbi1Bbmd1bGFyIGVsZW1lbnQgYW5kIHJlY29yZCBhbnkgZGlhZ25vc3RpY3MgYWJvdXQgaXQuXG4gICAqXG4gICAqIEBwYXJhbSBpZCB0aGUgdGVtcGxhdGUgSUQsIHN1aXRhYmxlIGZvciByZXNvbHV0aW9uIHdpdGggYSBgVGNiU291cmNlUmVzb2x2ZXJgLlxuICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBub2RlIGluIHF1ZXN0aW9uLlxuICAgKiBAcGFyYW0gc2NoZW1hcyBhbnkgYWN0aXZlIHNjaGVtYXMgZm9yIHRoZSB0ZW1wbGF0ZSwgd2hpY2ggbWlnaHQgYWZmZWN0IHRoZSB2YWxpZGl0eSBvZiB0aGVcbiAgICogZWxlbWVudC5cbiAgICovXG4gIGNoZWNrRWxlbWVudChpZDogc3RyaW5nLCBlbGVtZW50OiBUbXBsQXN0RWxlbWVudCwgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENoZWNrIGEgcHJvcGVydHkgYmluZGluZyBvbiBhbiBlbGVtZW50IGFuZCByZWNvcmQgYW55IGRpYWdub3N0aWNzIGFib3V0IGl0LlxuICAgKlxuICAgKiBAcGFyYW0gaWQgdGhlIHRlbXBsYXRlIElELCBzdWl0YWJsZSBmb3IgcmVzb2x1dGlvbiB3aXRoIGEgYFRjYlNvdXJjZVJlc29sdmVyYC5cbiAgICogQHBhcmFtIGVsZW1lbnQgdGhlIGVsZW1lbnQgbm9kZSBpbiBxdWVzdGlvbi5cbiAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIGNoZWNrZWQuXG4gICAqIEBwYXJhbSBzcGFuIHRoZSBzb3VyY2Ugc3BhbiBvZiB0aGUgYmluZGluZy4gVGhpcyBpcyByZWR1bmRhbnQgd2l0aCBgZWxlbWVudC5hdHRyaWJ1dGVzYCBidXQgaXNcbiAgICogcGFzc2VkIHNlcGFyYXRlbHkgdG8gYXZvaWQgaGF2aW5nIHRvIGxvb2sgdXAgdGhlIHBhcnRpY3VsYXIgcHJvcGVydHkgbmFtZS5cbiAgICogQHBhcmFtIHNjaGVtYXMgYW55IGFjdGl2ZSBzY2hlbWFzIGZvciB0aGUgdGVtcGxhdGUsIHdoaWNoIG1pZ2h0IGFmZmVjdCB0aGUgdmFsaWRpdHkgb2YgdGhlXG4gICAqIHByb3BlcnR5LlxuICAgKi9cbiAgY2hlY2tQcm9wZXJ0eShcbiAgICAgIGlkOiBzdHJpbmcsIGVsZW1lbnQ6IFRtcGxBc3RFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHNjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW10pOiB2b2lkO1xufVxuXG4vKipcbiAqIENoZWNrcyBub24tQW5ndWxhciBlbGVtZW50cyBhbmQgcHJvcGVydGllcyBhZ2FpbnN0IHRoZSBgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5YCwgYSBzY2hlbWFcbiAqIG1haW50YWluZWQgYnkgdGhlIEFuZ3VsYXIgdGVhbSB2aWEgZXh0cmFjdGlvbiBmcm9tIGEgYnJvd3NlciBJREwuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWdpc3RyeURvbVNjaGVtYUNoZWNrZXIgaW1wbGVtZW50cyBEb21TY2hlbWFDaGVja2VyIHtcbiAgcHJpdmF0ZSBfZGlhZ25vc3RpY3M6IFRlbXBsYXRlRGlhZ25vc3RpY1tdID0gW107XG5cbiAgZ2V0IGRpYWdub3N0aWNzKCk6IFJlYWRvbmx5QXJyYXk8VGVtcGxhdGVEaWFnbm9zdGljPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpYWdub3N0aWNzO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZXNvbHZlcjogVGVtcGxhdGVTb3VyY2VSZXNvbHZlcikge31cblxuICBjaGVja0VsZW1lbnQoaWQ6IFRlbXBsYXRlSWQsIGVsZW1lbnQ6IFRtcGxBc3RFbGVtZW50LCBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdKTogdm9pZCB7XG4gICAgLy8gSFRNTCBlbGVtZW50cyBpbnNpZGUgYW4gU1ZHIGBmb3JlaWduT2JqZWN0YCBhcmUgZGVjbGFyZWQgaW4gdGhlIGB4aHRtbGAgbmFtZXNwYWNlLlxuICAgIC8vIFdlIG5lZWQgdG8gc3RyaXAgaXQgYmVmb3JlIGhhbmRpbmcgaXQgb3ZlciB0byB0aGUgcmVnaXN0cnkgYmVjYXVzZSBhbGwgSFRNTCB0YWcgbmFtZXNcbiAgICAvLyBpbiB0aGUgcmVnaXN0cnkgYXJlIHdpdGhvdXQgYSBuYW1lc3BhY2UuXG4gICAgY29uc3QgbmFtZSA9IGVsZW1lbnQubmFtZS5yZXBsYWNlKFJFTU9WRV9YSFRNTF9SRUdFWCwgJycpO1xuXG4gICAgaWYgKCFSRUdJU1RSWS5oYXNFbGVtZW50KG5hbWUsIHNjaGVtYXMpKSB7XG4gICAgICBjb25zdCBtYXBwaW5nID0gdGhpcy5yZXNvbHZlci5nZXRTb3VyY2VNYXBwaW5nKGlkKTtcblxuICAgICAgbGV0IGVycm9yTXNnID0gYCcke25hbWV9JyBpcyBub3QgYSBrbm93biBlbGVtZW50OlxcbmA7XG4gICAgICBlcnJvck1zZyArPVxuICAgICAgICAgIGAxLiBJZiAnJHtuYW1lfScgaXMgYW4gQW5ndWxhciBjb21wb25lbnQsIHRoZW4gdmVyaWZ5IHRoYXQgaXQgaXMgcGFydCBvZiB0aGlzIG1vZHVsZS5cXG5gO1xuICAgICAgaWYgKG5hbWUuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgICAgZXJyb3JNc2cgKz0gYDIuIElmICcke1xuICAgICAgICAgICAgbmFtZX0nIGlzIGEgV2ViIENvbXBvbmVudCB0aGVuIGFkZCAnQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQgdG8gc3VwcHJlc3MgdGhpcyBtZXNzYWdlLmA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvck1zZyArPVxuICAgICAgICAgICAgYDIuIFRvIGFsbG93IGFueSBlbGVtZW50IGFkZCAnTk9fRVJST1JTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQuYDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGlhZyA9IG1ha2VUZW1wbGF0ZURpYWdub3N0aWMoXG4gICAgICAgICAgaWQsIG1hcHBpbmcsIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLCB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgbmdFcnJvckNvZGUoRXJyb3JDb2RlLlNDSEVNQV9JTlZBTElEX0VMRU1FTlQpLCBlcnJvck1zZyk7XG4gICAgICB0aGlzLl9kaWFnbm9zdGljcy5wdXNoKGRpYWcpO1xuICAgIH1cbiAgfVxuXG4gIGNoZWNrUHJvcGVydHkoXG4gICAgICBpZDogVGVtcGxhdGVJZCwgZWxlbWVudDogVG1wbEFzdEVsZW1lbnQsIG5hbWU6IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSk6IHZvaWQge1xuICAgIGlmICghUkVHSVNUUlkuaGFzUHJvcGVydHkoZWxlbWVudC5uYW1lLCBuYW1lLCBzY2hlbWFzKSkge1xuICAgICAgY29uc3QgbWFwcGluZyA9IHRoaXMucmVzb2x2ZXIuZ2V0U291cmNlTWFwcGluZyhpZCk7XG5cbiAgICAgIGxldCBlcnJvck1zZyA9XG4gICAgICAgICAgYENhbid0IGJpbmQgdG8gJyR7bmFtZX0nIHNpbmNlIGl0IGlzbid0IGEga25vd24gcHJvcGVydHkgb2YgJyR7ZWxlbWVudC5uYW1lfScuYDtcbiAgICAgIGlmIChlbGVtZW50Lm5hbWUuc3RhcnRzV2l0aCgnbmctJykpIHtcbiAgICAgICAgZXJyb3JNc2cgKz1cbiAgICAgICAgICAgIGBcXG4xLiBJZiAnJHtcbiAgICAgICAgICAgICAgICBuYW1lfScgaXMgYW4gQW5ndWxhciBkaXJlY3RpdmUsIHRoZW4gYWRkICdDb21tb25Nb2R1bGUnIHRvIHRoZSAnQE5nTW9kdWxlLmltcG9ydHMnIG9mIHRoaXMgY29tcG9uZW50LmAgK1xuICAgICAgICAgICAgYFxcbjIuIFRvIGFsbG93IGFueSBwcm9wZXJ0eSBhZGQgJ05PX0VSUk9SU19TQ0hFTUEnIHRvIHRoZSAnQE5nTW9kdWxlLnNjaGVtYXMnIG9mIHRoaXMgY29tcG9uZW50LmA7XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQubmFtZS5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgICBlcnJvck1zZyArPVxuICAgICAgICAgICAgYFxcbjEuIElmICcke2VsZW1lbnQubmFtZX0nIGlzIGFuIEFuZ3VsYXIgY29tcG9uZW50IGFuZCBpdCBoYXMgJyR7XG4gICAgICAgICAgICAgICAgbmFtZX0nIGlucHV0LCB0aGVuIHZlcmlmeSB0aGF0IGl0IGlzIHBhcnQgb2YgdGhpcyBtb2R1bGUuYCArXG4gICAgICAgICAgICBgXFxuMi4gSWYgJyR7XG4gICAgICAgICAgICAgICAgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAubmFtZX0nIGlzIGEgV2ViIENvbXBvbmVudCB0aGVuIGFkZCAnQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQgdG8gc3VwcHJlc3MgdGhpcyBtZXNzYWdlLmAgK1xuICAgICAgICAgICAgYFxcbjMuIFRvIGFsbG93IGFueSBwcm9wZXJ0eSBhZGQgJ05PX0VSUk9SU19TQ0hFTUEnIHRvIHRoZSAnQE5nTW9kdWxlLnNjaGVtYXMnIG9mIHRoaXMgY29tcG9uZW50LmA7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRpYWcgPSBtYWtlVGVtcGxhdGVEaWFnbm9zdGljKFxuICAgICAgICAgIGlkLCBtYXBwaW5nLCBzcGFuLCB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgbmdFcnJvckNvZGUoRXJyb3JDb2RlLlNDSEVNQV9JTlZBTElEX0FUVFJJQlVURSksIGVycm9yTXNnKTtcbiAgICAgIHRoaXMuX2RpYWdub3N0aWNzLnB1c2goZGlhZyk7XG4gICAgfVxuICB9XG59XG4iXX0=
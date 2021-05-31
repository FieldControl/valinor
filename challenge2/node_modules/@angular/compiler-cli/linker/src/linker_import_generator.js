(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/linker_import_generator", ["require", "exports", "@angular/compiler-cli/linker/src/fatal_linker_error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkerImportGenerator = void 0;
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    /**
     * A class that is used to generate imports when translating from Angular Output AST to an AST to
     * render, such as Babel.
     *
     * Note that, in the linker, there can only be imports from `@angular/core` and that these imports
     * must be achieved by property access on an `ng` namespace identifer, which is passed in via the
     * constructor.
     */
    var LinkerImportGenerator = /** @class */ (function () {
        function LinkerImportGenerator(ngImport) {
            this.ngImport = ngImport;
        }
        LinkerImportGenerator.prototype.generateNamespaceImport = function (moduleName) {
            this.assertModuleName(moduleName);
            return this.ngImport;
        };
        LinkerImportGenerator.prototype.generateNamedImport = function (moduleName, originalSymbol) {
            this.assertModuleName(moduleName);
            return { moduleImport: this.ngImport, symbol: originalSymbol };
        };
        LinkerImportGenerator.prototype.assertModuleName = function (moduleName) {
            if (moduleName !== '@angular/core') {
                throw new fatal_linker_error_1.FatalLinkerError(this.ngImport, "Unable to import from anything other than '@angular/core'");
            }
        };
        return LinkerImportGenerator;
    }());
    exports.LinkerImportGenerator = LinkerImportGenerator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua2VyX2ltcG9ydF9nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL3NyYy9saW5rZXJfaW1wb3J0X2dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFRQSwwRkFBc0Q7SUFFdEQ7Ozs7Ozs7T0FPRztJQUNIO1FBQ0UsK0JBQW9CLFFBQXFCO1lBQXJCLGFBQVEsR0FBUixRQUFRLENBQWE7UUFBRyxDQUFDO1FBRTdDLHVEQUF1QixHQUF2QixVQUF3QixVQUFrQjtZQUN4QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxtREFBbUIsR0FBbkIsVUFBb0IsVUFBa0IsRUFBRSxjQUFzQjtZQUM1RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsT0FBTyxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRU8sZ0RBQWdCLEdBQXhCLFVBQXlCLFVBQWtCO1lBQ3pDLElBQUksVUFBVSxLQUFLLGVBQWUsRUFBRTtnQkFDbEMsTUFBTSxJQUFJLHFDQUFnQixDQUN0QixJQUFJLENBQUMsUUFBUSxFQUFFLDJEQUEyRCxDQUFDLENBQUM7YUFDakY7UUFDSCxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBbkJELElBbUJDO0lBbkJZLHNEQUFxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtJbXBvcnRHZW5lcmF0b3IsIE5hbWVkSW1wb3J0fSBmcm9tICcuLi8uLi9zcmMvbmd0c2MvdHJhbnNsYXRvcic7XG5pbXBvcnQge0ZhdGFsTGlua2VyRXJyb3J9IGZyb20gJy4vZmF0YWxfbGlua2VyX2Vycm9yJztcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgaXMgdXNlZCB0byBnZW5lcmF0ZSBpbXBvcnRzIHdoZW4gdHJhbnNsYXRpbmcgZnJvbSBBbmd1bGFyIE91dHB1dCBBU1QgdG8gYW4gQVNUIHRvXG4gKiByZW5kZXIsIHN1Y2ggYXMgQmFiZWwuXG4gKlxuICogTm90ZSB0aGF0LCBpbiB0aGUgbGlua2VyLCB0aGVyZSBjYW4gb25seSBiZSBpbXBvcnRzIGZyb20gYEBhbmd1bGFyL2NvcmVgIGFuZCB0aGF0IHRoZXNlIGltcG9ydHNcbiAqIG11c3QgYmUgYWNoaWV2ZWQgYnkgcHJvcGVydHkgYWNjZXNzIG9uIGFuIGBuZ2AgbmFtZXNwYWNlIGlkZW50aWZlciwgd2hpY2ggaXMgcGFzc2VkIGluIHZpYSB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICovXG5leHBvcnQgY2xhc3MgTGlua2VySW1wb3J0R2VuZXJhdG9yPFRFeHByZXNzaW9uPiBpbXBsZW1lbnRzIEltcG9ydEdlbmVyYXRvcjxURXhwcmVzc2lvbj4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5nSW1wb3J0OiBURXhwcmVzc2lvbikge31cblxuICBnZW5lcmF0ZU5hbWVzcGFjZUltcG9ydChtb2R1bGVOYW1lOiBzdHJpbmcpOiBURXhwcmVzc2lvbiB7XG4gICAgdGhpcy5hc3NlcnRNb2R1bGVOYW1lKG1vZHVsZU5hbWUpO1xuICAgIHJldHVybiB0aGlzLm5nSW1wb3J0O1xuICB9XG5cbiAgZ2VuZXJhdGVOYW1lZEltcG9ydChtb2R1bGVOYW1lOiBzdHJpbmcsIG9yaWdpbmFsU3ltYm9sOiBzdHJpbmcpOiBOYW1lZEltcG9ydDxURXhwcmVzc2lvbj4ge1xuICAgIHRoaXMuYXNzZXJ0TW9kdWxlTmFtZShtb2R1bGVOYW1lKTtcbiAgICByZXR1cm4ge21vZHVsZUltcG9ydDogdGhpcy5uZ0ltcG9ydCwgc3ltYm9sOiBvcmlnaW5hbFN5bWJvbH07XG4gIH1cblxuICBwcml2YXRlIGFzc2VydE1vZHVsZU5hbWUobW9kdWxlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKG1vZHVsZU5hbWUgIT09ICdAYW5ndWxhci9jb3JlJykge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3IoXG4gICAgICAgICAgdGhpcy5uZ0ltcG9ydCwgYFVuYWJsZSB0byBpbXBvcnQgZnJvbSBhbnl0aGluZyBvdGhlciB0aGFuICdAYW5ndWxhci9jb3JlJ2ApO1xuICAgIH1cbiAgfVxufVxuIl19
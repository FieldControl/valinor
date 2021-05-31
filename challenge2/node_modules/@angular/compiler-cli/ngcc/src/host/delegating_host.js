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
        define("@angular/compiler-cli/ngcc/src/host/delegating_host", ["require", "exports", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DelegatingReflectionHost = void 0;
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    /**
     * A reflection host implementation that delegates reflector queries depending on whether they
     * reflect on declaration files (for dependent libraries) or source files within the entry-point
     * that is being compiled. The first type of queries are handled by the regular TypeScript
     * reflection host, whereas the other queries are handled by an `NgccReflectionHost` that is
     * specific to the entry-point's format.
     */
    var DelegatingReflectionHost = /** @class */ (function () {
        function DelegatingReflectionHost(tsHost, ngccHost) {
            this.tsHost = tsHost;
            this.ngccHost = ngccHost;
        }
        DelegatingReflectionHost.prototype.getConstructorParameters = function (clazz) {
            if (typescript_1.isFromDtsFile(clazz)) {
                return this.tsHost.getConstructorParameters(clazz);
            }
            return this.ngccHost.getConstructorParameters(clazz);
        };
        DelegatingReflectionHost.prototype.getDeclarationOfIdentifier = function (id) {
            if (typescript_1.isFromDtsFile(id)) {
                var declaration = this.tsHost.getDeclarationOfIdentifier(id);
                return declaration !== null ? this.detectKnownDeclaration(declaration) : null;
            }
            return this.ngccHost.getDeclarationOfIdentifier(id);
        };
        DelegatingReflectionHost.prototype.getDecoratorsOfDeclaration = function (declaration) {
            if (typescript_1.isFromDtsFile(declaration)) {
                return this.tsHost.getDecoratorsOfDeclaration(declaration);
            }
            return this.ngccHost.getDecoratorsOfDeclaration(declaration);
        };
        DelegatingReflectionHost.prototype.getDefinitionOfFunction = function (fn) {
            if (typescript_1.isFromDtsFile(fn)) {
                return this.tsHost.getDefinitionOfFunction(fn);
            }
            return this.ngccHost.getDefinitionOfFunction(fn);
        };
        DelegatingReflectionHost.prototype.getDtsDeclaration = function (declaration) {
            if (typescript_1.isFromDtsFile(declaration)) {
                return this.tsHost.getDtsDeclaration(declaration);
            }
            return this.ngccHost.getDtsDeclaration(declaration);
        };
        DelegatingReflectionHost.prototype.getExportsOfModule = function (module) {
            var _this = this;
            if (typescript_1.isFromDtsFile(module)) {
                var exportMap = this.tsHost.getExportsOfModule(module);
                if (exportMap !== null) {
                    exportMap.forEach(function (decl) { return _this.detectKnownDeclaration(decl); });
                }
                return exportMap;
            }
            return this.ngccHost.getExportsOfModule(module);
        };
        DelegatingReflectionHost.prototype.getGenericArityOfClass = function (clazz) {
            if (typescript_1.isFromDtsFile(clazz)) {
                return this.tsHost.getGenericArityOfClass(clazz);
            }
            return this.ngccHost.getGenericArityOfClass(clazz);
        };
        DelegatingReflectionHost.prototype.getImportOfIdentifier = function (id) {
            if (typescript_1.isFromDtsFile(id)) {
                return this.tsHost.getImportOfIdentifier(id);
            }
            return this.ngccHost.getImportOfIdentifier(id);
        };
        DelegatingReflectionHost.prototype.getInternalNameOfClass = function (clazz) {
            if (typescript_1.isFromDtsFile(clazz)) {
                return this.tsHost.getInternalNameOfClass(clazz);
            }
            return this.ngccHost.getInternalNameOfClass(clazz);
        };
        DelegatingReflectionHost.prototype.getAdjacentNameOfClass = function (clazz) {
            if (typescript_1.isFromDtsFile(clazz)) {
                return this.tsHost.getAdjacentNameOfClass(clazz);
            }
            return this.ngccHost.getAdjacentNameOfClass(clazz);
        };
        DelegatingReflectionHost.prototype.getMembersOfClass = function (clazz) {
            if (typescript_1.isFromDtsFile(clazz)) {
                return this.tsHost.getMembersOfClass(clazz);
            }
            return this.ngccHost.getMembersOfClass(clazz);
        };
        DelegatingReflectionHost.prototype.getVariableValue = function (declaration) {
            if (typescript_1.isFromDtsFile(declaration)) {
                return this.tsHost.getVariableValue(declaration);
            }
            return this.ngccHost.getVariableValue(declaration);
        };
        DelegatingReflectionHost.prototype.hasBaseClass = function (clazz) {
            if (typescript_1.isFromDtsFile(clazz)) {
                return this.tsHost.hasBaseClass(clazz);
            }
            return this.ngccHost.hasBaseClass(clazz);
        };
        DelegatingReflectionHost.prototype.getBaseClassExpression = function (clazz) {
            if (typescript_1.isFromDtsFile(clazz)) {
                return this.tsHost.getBaseClassExpression(clazz);
            }
            return this.ngccHost.getBaseClassExpression(clazz);
        };
        DelegatingReflectionHost.prototype.isClass = function (node) {
            if (typescript_1.isFromDtsFile(node)) {
                return this.tsHost.isClass(node);
            }
            return this.ngccHost.isClass(node);
        };
        // Note: the methods below are specific to ngcc and the entry-point that is being compiled, so
        // they don't take declaration files into account.
        DelegatingReflectionHost.prototype.findClassSymbols = function (sourceFile) {
            return this.ngccHost.findClassSymbols(sourceFile);
        };
        DelegatingReflectionHost.prototype.getClassSymbol = function (node) {
            return this.ngccHost.getClassSymbol(node);
        };
        DelegatingReflectionHost.prototype.getDecoratorsOfSymbol = function (symbol) {
            return this.ngccHost.getDecoratorsOfSymbol(symbol);
        };
        DelegatingReflectionHost.prototype.getSwitchableDeclarations = function (module) {
            return this.ngccHost.getSwitchableDeclarations(module);
        };
        DelegatingReflectionHost.prototype.getEndOfClass = function (classSymbol) {
            return this.ngccHost.getEndOfClass(classSymbol);
        };
        DelegatingReflectionHost.prototype.detectKnownDeclaration = function (decl) {
            return this.ngccHost.detectKnownDeclaration(decl);
        };
        return DelegatingReflectionHost;
    }());
    exports.DelegatingReflectionHost = DelegatingReflectionHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZWdhdGluZ19ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2hvc3QvZGVsZWdhdGluZ19ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUtILGtGQUFxRTtJQUlyRTs7Ozs7O09BTUc7SUFDSDtRQUNFLGtDQUFvQixNQUFzQixFQUFVLFFBQTRCO1lBQTVELFdBQU0sR0FBTixNQUFNLENBQWdCO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFBRyxDQUFDO1FBRXBGLDJEQUF3QixHQUF4QixVQUF5QixLQUF1QjtZQUM5QyxJQUFJLDBCQUFhLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwRDtZQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsNkRBQTBCLEdBQTFCLFVBQTJCLEVBQWlCO1lBQzFDLElBQUksMEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDckIsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDL0QsT0FBTyxXQUFXLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzthQUMvRTtZQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsNkRBQTBCLEdBQTFCLFVBQTJCLFdBQTRCO1lBQ3JELElBQUksMEJBQWEsQ0FBQyxXQUFXLENBQUMsRUFB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UUFFRCw4RkFBOEY7UUFDOUYsa0RBQWtEO1FBRWxELG1EQUFnQixHQUFoQixVQUFpQixVQUF5QjtZQUN4QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELGlEQUFjLEdBQWQsVUFBZSxJQUFhO1lBQzFCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELHdEQUFxQixHQUFyQixVQUFzQixNQUF1QjtZQUMzQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELDREQUF5QixHQUF6QixVQUEwQixNQUFlO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsZ0RBQWEsR0FBYixVQUFjLFdBQTRCO1lBQ3hDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELHlEQUFzQixHQUF0QixVQUE4QyxJQUFPO1lBQ25ELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQ0gsK0JBQUM7SUFBRCxDQUFDLEFBN0lELElBNklDO0lBN0lZLDREQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBDbGFzc01lbWJlciwgQ3RvclBhcmFtZXRlciwgRGVjbGFyYXRpb24sIERlY2xhcmF0aW9uTm9kZSwgRGVjb3JhdG9yLCBGdW5jdGlvbkRlZmluaXRpb24sIEltcG9ydCwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7aXNGcm9tRHRzRmlsZX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge05nY2NDbGFzc1N5bWJvbCwgTmdjY1JlZmxlY3Rpb25Ib3N0LCBTd2l0Y2hhYmxlVmFyaWFibGVEZWNsYXJhdGlvbn0gZnJvbSAnLi9uZ2NjX2hvc3QnO1xuXG4vKipcbiAqIEEgcmVmbGVjdGlvbiBob3N0IGltcGxlbWVudGF0aW9uIHRoYXQgZGVsZWdhdGVzIHJlZmxlY3RvciBxdWVyaWVzIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZXlcbiAqIHJlZmxlY3Qgb24gZGVjbGFyYXRpb24gZmlsZXMgKGZvciBkZXBlbmRlbnQgbGlicmFyaWVzKSBvciBzb3VyY2UgZmlsZXMgd2l0aGluIHRoZSBlbnRyeS1wb2ludFxuICogdGhhdCBpcyBiZWluZyBjb21waWxlZC4gVGhlIGZpcnN0IHR5cGUgb2YgcXVlcmllcyBhcmUgaGFuZGxlZCBieSB0aGUgcmVndWxhciBUeXBlU2NyaXB0XG4gKiByZWZsZWN0aW9uIGhvc3QsIHdoZXJlYXMgdGhlIG90aGVyIHF1ZXJpZXMgYXJlIGhhbmRsZWQgYnkgYW4gYE5nY2NSZWZsZWN0aW9uSG9zdGAgdGhhdCBpc1xuICogc3BlY2lmaWMgdG8gdGhlIGVudHJ5LXBvaW50J3MgZm9ybWF0LlxuICovXG5leHBvcnQgY2xhc3MgRGVsZWdhdGluZ1JlZmxlY3Rpb25Ib3N0IGltcGxlbWVudHMgTmdjY1JlZmxlY3Rpb25Ib3N0IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0c0hvc3Q6IFJlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIG5nY2NIb3N0OiBOZ2NjUmVmbGVjdGlvbkhvc3QpIHt9XG5cbiAgZ2V0Q29uc3RydWN0b3JQYXJhbWV0ZXJzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogQ3RvclBhcmFtZXRlcltdfG51bGwge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMudHNIb3N0LmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5nY2NIb3N0LmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eik7XG4gIH1cblxuICBnZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpZDogdHMuSWRlbnRpZmllcik6IERlY2xhcmF0aW9ufG51bGwge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKGlkKSkge1xuICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSB0aGlzLnRzSG9zdC5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpZCk7XG4gICAgICByZXR1cm4gZGVjbGFyYXRpb24gIT09IG51bGwgPyB0aGlzLmRldGVjdEtub3duRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmdjY0hvc3QuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoaWQpO1xuICB9XG5cbiAgZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24oZGVjbGFyYXRpb246IERlY2xhcmF0aW9uTm9kZSk6IERlY29yYXRvcltdfG51bGwge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKGRlY2xhcmF0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMudHNIb3N0LmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmdjY0hvc3QuZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pO1xuICB9XG5cbiAgZ2V0RGVmaW5pdGlvbk9mRnVuY3Rpb24oZm46IHRzLk5vZGUpOiBGdW5jdGlvbkRlZmluaXRpb258bnVsbCB7XG4gICAgaWYgKGlzRnJvbUR0c0ZpbGUoZm4pKSB7XG4gICAgICByZXR1cm4gdGhpcy50c0hvc3QuZ2V0RGVmaW5pdGlvbk9mRnVuY3Rpb24oZm4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5nZXREZWZpbml0aW9uT2ZGdW5jdGlvbihmbik7XG4gIH1cblxuICBnZXREdHNEZWNsYXJhdGlvbihkZWNsYXJhdGlvbjogRGVjbGFyYXRpb25Ob2RlKTogdHMuRGVjbGFyYXRpb258bnVsbCB7XG4gICAgaWYgKGlzRnJvbUR0c0ZpbGUoZGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy50c0hvc3QuZ2V0RHRzRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5nZXREdHNEZWNsYXJhdGlvbihkZWNsYXJhdGlvbik7XG4gIH1cblxuICBnZXRFeHBvcnRzT2ZNb2R1bGUobW9kdWxlOiB0cy5Ob2RlKTogTWFwPHN0cmluZywgRGVjbGFyYXRpb24+fG51bGwge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKG1vZHVsZSkpIHtcbiAgICAgIGNvbnN0IGV4cG9ydE1hcCA9IHRoaXMudHNIb3N0LmdldEV4cG9ydHNPZk1vZHVsZShtb2R1bGUpO1xuXG4gICAgICBpZiAoZXhwb3J0TWFwICE9PSBudWxsKSB7XG4gICAgICAgIGV4cG9ydE1hcC5mb3JFYWNoKGRlY2wgPT4gdGhpcy5kZXRlY3RLbm93bkRlY2xhcmF0aW9uKGRlY2wpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGV4cG9ydE1hcDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmdjY0hvc3QuZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZSk7XG4gIH1cblxuICBnZXRHZW5lcmljQXJpdHlPZkNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogbnVtYmVyfG51bGwge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMudHNIb3N0LmdldEdlbmVyaWNBcml0eU9mQ2xhc3MoY2xhenopO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5nZXRHZW5lcmljQXJpdHlPZkNsYXNzKGNsYXp6KTtcbiAgfVxuXG4gIGdldEltcG9ydE9mSWRlbnRpZmllcihpZDogdHMuSWRlbnRpZmllcik6IEltcG9ydHxudWxsIHtcbiAgICBpZiAoaXNGcm9tRHRzRmlsZShpZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRzSG9zdC5nZXRJbXBvcnRPZklkZW50aWZpZXIoaWQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5nZXRJbXBvcnRPZklkZW50aWZpZXIoaWQpO1xuICB9XG5cbiAgZ2V0SW50ZXJuYWxOYW1lT2ZDbGFzcyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IHRzLklkZW50aWZpZXIge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMudHNIb3N0LmdldEludGVybmFsTmFtZU9mQ2xhc3MoY2xhenopO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5nZXRJbnRlcm5hbE5hbWVPZkNsYXNzKGNsYXp6KTtcbiAgfVxuXG4gIGdldEFkamFjZW50TmFtZU9mQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiB0cy5JZGVudGlmaWVyIHtcbiAgICBpZiAoaXNGcm9tRHRzRmlsZShjbGF6eikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRzSG9zdC5nZXRBZGphY2VudE5hbWVPZkNsYXNzKGNsYXp6KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmdjY0hvc3QuZ2V0QWRqYWNlbnROYW1lT2ZDbGFzcyhjbGF6eik7XG4gIH1cblxuICBnZXRNZW1iZXJzT2ZDbGFzcyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IENsYXNzTWVtYmVyW10ge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMudHNIb3N0LmdldE1lbWJlcnNPZkNsYXNzKGNsYXp6KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmdjY0hvc3QuZ2V0TWVtYmVyc09mQ2xhc3MoY2xhenopO1xuICB9XG5cbiAgZ2V0VmFyaWFibGVWYWx1ZShkZWNsYXJhdGlvbjogdHMuVmFyaWFibGVEZWNsYXJhdGlvbik6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKGlzRnJvbUR0c0ZpbGUoZGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy50c0hvc3QuZ2V0VmFyaWFibGVWYWx1ZShkZWNsYXJhdGlvbik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5nY2NIb3N0LmdldFZhcmlhYmxlVmFsdWUoZGVjbGFyYXRpb24pO1xuICB9XG5cbiAgaGFzQmFzZUNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gICAgaWYgKGlzRnJvbUR0c0ZpbGUoY2xhenopKSB7XG4gICAgICByZXR1cm4gdGhpcy50c0hvc3QuaGFzQmFzZUNsYXNzKGNsYXp6KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmdjY0hvc3QuaGFzQmFzZUNsYXNzKGNsYXp6KTtcbiAgfVxuXG4gIGdldEJhc2VDbGFzc0V4cHJlc3Npb24oY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiB0cy5FeHByZXNzaW9ufG51bGwge1xuICAgIGlmIChpc0Zyb21EdHNGaWxlKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMudHNIb3N0LmdldEJhc2VDbGFzc0V4cHJlc3Npb24oY2xhenopO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5nZXRCYXNlQ2xhc3NFeHByZXNzaW9uKGNsYXp6KTtcbiAgfVxuXG4gIGlzQ2xhc3Mobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgQ2xhc3NEZWNsYXJhdGlvbiB7XG4gICAgaWYgKGlzRnJvbUR0c0ZpbGUobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRzSG9zdC5pc0NsYXNzKG5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5pc0NsYXNzKG5vZGUpO1xuICB9XG5cbiAgLy8gTm90ZTogdGhlIG1ldGhvZHMgYmVsb3cgYXJlIHNwZWNpZmljIHRvIG5nY2MgYW5kIHRoZSBlbnRyeS1wb2ludCB0aGF0IGlzIGJlaW5nIGNvbXBpbGVkLCBzb1xuICAvLyB0aGV5IGRvbid0IHRha2UgZGVjbGFyYXRpb24gZmlsZXMgaW50byBhY2NvdW50LlxuXG4gIGZpbmRDbGFzc1N5bWJvbHMoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IE5nY2NDbGFzc1N5bWJvbFtdIHtcbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5maW5kQ2xhc3NTeW1ib2xzKHNvdXJjZUZpbGUpO1xuICB9XG5cbiAgZ2V0Q2xhc3NTeW1ib2wobm9kZTogdHMuTm9kZSk6IE5nY2NDbGFzc1N5bWJvbHx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm5nY2NIb3N0LmdldENsYXNzU3ltYm9sKG5vZGUpO1xuICB9XG5cbiAgZ2V0RGVjb3JhdG9yc09mU3ltYm9sKHN5bWJvbDogTmdjY0NsYXNzU3ltYm9sKTogRGVjb3JhdG9yW118bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubmdjY0hvc3QuZ2V0RGVjb3JhdG9yc09mU3ltYm9sKHN5bWJvbCk7XG4gIH1cblxuICBnZXRTd2l0Y2hhYmxlRGVjbGFyYXRpb25zKG1vZHVsZTogdHMuTm9kZSk6IFN3aXRjaGFibGVWYXJpYWJsZURlY2xhcmF0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLm5nY2NIb3N0LmdldFN3aXRjaGFibGVEZWNsYXJhdGlvbnMobW9kdWxlKTtcbiAgfVxuXG4gIGdldEVuZE9mQ2xhc3MoY2xhc3NTeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCk6IHRzLk5vZGUge1xuICAgIHJldHVybiB0aGlzLm5nY2NIb3N0LmdldEVuZE9mQ2xhc3MoY2xhc3NTeW1ib2wpO1xuICB9XG5cbiAgZGV0ZWN0S25vd25EZWNsYXJhdGlvbjxUIGV4dGVuZHMgRGVjbGFyYXRpb24+KGRlY2w6IFQpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5uZ2NjSG9zdC5kZXRlY3RLbm93bkRlY2xhcmF0aW9uKGRlY2wpO1xuICB9XG59XG4iXX0=
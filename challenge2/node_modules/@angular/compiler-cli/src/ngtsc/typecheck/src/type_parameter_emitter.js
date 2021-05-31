(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeParameterEmitter = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var type_emitter_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_emitter");
    /**
     * See `TypeEmitter` for more information on the emitting process.
     */
    var TypeParameterEmitter = /** @class */ (function () {
        function TypeParameterEmitter(typeParameters, reflector) {
            this.typeParameters = typeParameters;
            this.reflector = reflector;
        }
        /**
         * Determines whether the type parameters can be emitted. If this returns true, then a call to
         * `emit` is known to succeed. Vice versa, if false is returned then `emit` should not be
         * called, as it would fail.
         */
        TypeParameterEmitter.prototype.canEmit = function () {
            var _this = this;
            if (this.typeParameters === undefined) {
                return true;
            }
            return this.typeParameters.every(function (typeParam) {
                if (typeParam.constraint === undefined) {
                    return true;
                }
                return type_emitter_1.canEmitType(typeParam.constraint, function (type) { return _this.resolveTypeReference(type); });
            });
        };
        /**
         * Emits the type parameters using the provided emitter function for `Reference`s.
         */
        TypeParameterEmitter.prototype.emit = function (emitReference) {
            var _this = this;
            if (this.typeParameters === undefined) {
                return undefined;
            }
            var emitter = new type_emitter_1.TypeEmitter(function (type) { return _this.resolveTypeReference(type); }, emitReference);
            return this.typeParameters.map(function (typeParam) {
                var constraint = typeParam.constraint !== undefined ? emitter.emitType(typeParam.constraint) : undefined;
                return ts.updateTypeParameterDeclaration(
                /* node */ typeParam, 
                /* name */ typeParam.name, 
                /* constraint */ constraint, 
                /* defaultType */ typeParam.default);
            });
        };
        TypeParameterEmitter.prototype.resolveTypeReference = function (type) {
            var target = ts.isIdentifier(type.typeName) ? type.typeName : type.typeName.right;
            var declaration = this.reflector.getDeclarationOfIdentifier(target);
            // If no declaration could be resolved or does not have a `ts.Declaration`, the type cannot be
            // resolved.
            if (declaration === null || declaration.node === null) {
                return null;
            }
            // If the declaration corresponds with a local type parameter, the type reference can be used
            // as is.
            if (this.isLocalTypeParameter(declaration.node)) {
                return type;
            }
            var owningModule = null;
            if (declaration.viaModule !== null) {
                owningModule = {
                    specifier: declaration.viaModule,
                    resolutionContext: type.getSourceFile().fileName,
                };
            }
            return new imports_1.Reference(declaration.node, owningModule);
        };
        TypeParameterEmitter.prototype.isLocalTypeParameter = function (decl) {
            // Checking for local type parameters only occurs during resolution of type parameters, so it is
            // guaranteed that type parameters are present.
            return this.typeParameters.some(function (param) { return param === decl; });
        };
        return TypeParameterEmitter;
    }());
    exports.TypeParameterEmitter = TypeParameterEmitter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9wYXJhbWV0ZXJfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy90eXBlX3BhcmFtZXRlcl9lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUVqQyxtRUFBc0Q7SUFHdEQsMkZBQStFO0lBRy9FOztPQUVHO0lBQ0g7UUFDRSw4QkFDWSxjQUFtRSxFQUNuRSxTQUF5QjtZQUR6QixtQkFBYyxHQUFkLGNBQWMsQ0FBcUQ7WUFDbkUsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7UUFBRyxDQUFDO1FBRXpDOzs7O1dBSUc7UUFDSCxzQ0FBTyxHQUFQO1lBQUEsaUJBWUM7WUFYQyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO2dCQUNyQyxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFBLFNBQVM7Z0JBQ3hDLElBQUksU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQ3RDLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUVELE9BQU8sMEJBQVcsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUM7WUFDcEYsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxtQ0FBSSxHQUFKLFVBQUssYUFBOEM7WUFBbkQsaUJBaUJDO1lBaEJDLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3JDLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBRUQsSUFBTSxPQUFPLEdBQUcsSUFBSSwwQkFBVyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUEvQixDQUErQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRXhGLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQSxTQUFTO2dCQUN0QyxJQUFNLFVBQVUsR0FDWixTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFFNUYsT0FBTyxFQUFFLENBQUMsOEJBQThCO2dCQUNwQyxVQUFVLENBQUMsU0FBUztnQkFDcEIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUN6QixnQkFBZ0IsQ0FBQyxVQUFVO2dCQUMzQixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sbURBQW9CLEdBQTVCLFVBQTZCLElBQTBCO1lBQ3JELElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUNwRixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXRFLDhGQUE4RjtZQUM5RixZQUFZO1lBQ1osSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNyRCxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsNkZBQTZGO1lBQzdGLFNBQVM7WUFDVCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxJQUFJLFlBQVksR0FBc0IsSUFBSSxDQUFDO1lBQzNDLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xDLFlBQVksR0FBRztvQkFDYixTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVM7b0JBQ2hDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRO2lCQUNqRCxDQUFDO2FBQ0g7WUFFRCxPQUFPLElBQUksbUJBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFTyxtREFBb0IsR0FBNUIsVUFBNkIsSUFBcUI7WUFDaEQsZ0dBQWdHO1lBQ2hHLCtDQUErQztZQUMvQyxPQUFPLElBQUksQ0FBQyxjQUFlLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxLQUFLLElBQUksRUFBZCxDQUFjLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBQ0gsMkJBQUM7SUFBRCxDQUFDLEFBOUVELElBOEVDO0lBOUVZLG9EQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7T3duaW5nTW9kdWxlLCBSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtEZWNsYXJhdGlvbk5vZGUsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtjYW5FbWl0VHlwZSwgUmVzb2x2ZWRUeXBlUmVmZXJlbmNlLCBUeXBlRW1pdHRlcn0gZnJvbSAnLi90eXBlX2VtaXR0ZXInO1xuXG5cbi8qKlxuICogU2VlIGBUeXBlRW1pdHRlcmAgZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIGVtaXR0aW5nIHByb2Nlc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlUGFyYW1ldGVyRW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSB0eXBlUGFyYW1ldGVyczogdHMuTm9kZUFycmF5PHRzLlR5cGVQYXJhbWV0ZXJEZWNsYXJhdGlvbj58dW5kZWZpbmVkLFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KSB7fVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHR5cGUgcGFyYW1ldGVycyBjYW4gYmUgZW1pdHRlZC4gSWYgdGhpcyByZXR1cm5zIHRydWUsIHRoZW4gYSBjYWxsIHRvXG4gICAqIGBlbWl0YCBpcyBrbm93biB0byBzdWNjZWVkLiBWaWNlIHZlcnNhLCBpZiBmYWxzZSBpcyByZXR1cm5lZCB0aGVuIGBlbWl0YCBzaG91bGQgbm90IGJlXG4gICAqIGNhbGxlZCwgYXMgaXQgd291bGQgZmFpbC5cbiAgICovXG4gIGNhbkVtaXQoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudHlwZVBhcmFtZXRlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudHlwZVBhcmFtZXRlcnMuZXZlcnkodHlwZVBhcmFtID0+IHtcbiAgICAgIGlmICh0eXBlUGFyYW0uY29uc3RyYWludCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2FuRW1pdFR5cGUodHlwZVBhcmFtLmNvbnN0cmFpbnQsIHR5cGUgPT4gdGhpcy5yZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgdGhlIHR5cGUgcGFyYW1ldGVycyB1c2luZyB0aGUgcHJvdmlkZWQgZW1pdHRlciBmdW5jdGlvbiBmb3IgYFJlZmVyZW5jZWBzLlxuICAgKi9cbiAgZW1pdChlbWl0UmVmZXJlbmNlOiAocmVmOiBSZWZlcmVuY2UpID0+IHRzLlR5cGVOb2RlKTogdHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uW118dW5kZWZpbmVkIHtcbiAgICBpZiAodGhpcy50eXBlUGFyYW1ldGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IGVtaXR0ZXIgPSBuZXcgVHlwZUVtaXR0ZXIodHlwZSA9PiB0aGlzLnJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGUpLCBlbWl0UmVmZXJlbmNlKTtcblxuICAgIHJldHVybiB0aGlzLnR5cGVQYXJhbWV0ZXJzLm1hcCh0eXBlUGFyYW0gPT4ge1xuICAgICAgY29uc3QgY29uc3RyYWludCA9XG4gICAgICAgICAgdHlwZVBhcmFtLmNvbnN0cmFpbnQgIT09IHVuZGVmaW5lZCA/IGVtaXR0ZXIuZW1pdFR5cGUodHlwZVBhcmFtLmNvbnN0cmFpbnQpIDogdW5kZWZpbmVkO1xuXG4gICAgICByZXR1cm4gdHMudXBkYXRlVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uKFxuICAgICAgICAgIC8qIG5vZGUgKi8gdHlwZVBhcmFtLFxuICAgICAgICAgIC8qIG5hbWUgKi8gdHlwZVBhcmFtLm5hbWUsXG4gICAgICAgICAgLyogY29uc3RyYWludCAqLyBjb25zdHJhaW50LFxuICAgICAgICAgIC8qIGRlZmF1bHRUeXBlICovIHR5cGVQYXJhbS5kZWZhdWx0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZTogdHMuVHlwZVJlZmVyZW5jZU5vZGUpOiBSZXNvbHZlZFR5cGVSZWZlcmVuY2Uge1xuICAgIGNvbnN0IHRhcmdldCA9IHRzLmlzSWRlbnRpZmllcih0eXBlLnR5cGVOYW1lKSA/IHR5cGUudHlwZU5hbWUgOiB0eXBlLnR5cGVOYW1lLnJpZ2h0O1xuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gdGhpcy5yZWZsZWN0b3IuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIodGFyZ2V0KTtcblxuICAgIC8vIElmIG5vIGRlY2xhcmF0aW9uIGNvdWxkIGJlIHJlc29sdmVkIG9yIGRvZXMgbm90IGhhdmUgYSBgdHMuRGVjbGFyYXRpb25gLCB0aGUgdHlwZSBjYW5ub3QgYmVcbiAgICAvLyByZXNvbHZlZC5cbiAgICBpZiAoZGVjbGFyYXRpb24gPT09IG51bGwgfHwgZGVjbGFyYXRpb24ubm9kZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGRlY2xhcmF0aW9uIGNvcnJlc3BvbmRzIHdpdGggYSBsb2NhbCB0eXBlIHBhcmFtZXRlciwgdGhlIHR5cGUgcmVmZXJlbmNlIGNhbiBiZSB1c2VkXG4gICAgLy8gYXMgaXMuXG4gICAgaWYgKHRoaXMuaXNMb2NhbFR5cGVQYXJhbWV0ZXIoZGVjbGFyYXRpb24ubm9kZSkpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH1cblxuICAgIGxldCBvd25pbmdNb2R1bGU6IE93bmluZ01vZHVsZXxudWxsID0gbnVsbDtcbiAgICBpZiAoZGVjbGFyYXRpb24udmlhTW9kdWxlICE9PSBudWxsKSB7XG4gICAgICBvd25pbmdNb2R1bGUgPSB7XG4gICAgICAgIHNwZWNpZmllcjogZGVjbGFyYXRpb24udmlhTW9kdWxlLFxuICAgICAgICByZXNvbHV0aW9uQ29udGV4dDogdHlwZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVmZXJlbmNlKGRlY2xhcmF0aW9uLm5vZGUsIG93bmluZ01vZHVsZSk7XG4gIH1cblxuICBwcml2YXRlIGlzTG9jYWxUeXBlUGFyYW1ldGVyKGRlY2w6IERlY2xhcmF0aW9uTm9kZSk6IGJvb2xlYW4ge1xuICAgIC8vIENoZWNraW5nIGZvciBsb2NhbCB0eXBlIHBhcmFtZXRlcnMgb25seSBvY2N1cnMgZHVyaW5nIHJlc29sdXRpb24gb2YgdHlwZSBwYXJhbWV0ZXJzLCBzbyBpdCBpc1xuICAgIC8vIGd1YXJhbnRlZWQgdGhhdCB0eXBlIHBhcmFtZXRlcnMgYXJlIHByZXNlbnQuXG4gICAgcmV0dXJuIHRoaXMudHlwZVBhcmFtZXRlcnMhLnNvbWUocGFyYW0gPT4gcGFyYW0gPT09IGRlY2wpO1xuICB9XG59XG4iXX0=
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/scope/src/component_scope", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompoundComponentScopeReader = void 0;
    var tslib_1 = require("tslib");
    /**
     * A `ComponentScopeReader` that reads from an ordered set of child readers until it obtains the
     * requested scope.
     *
     * This is used to combine `ComponentScopeReader`s that read from different sources (e.g. from a
     * registry and from the incremental state).
     */
    var CompoundComponentScopeReader = /** @class */ (function () {
        function CompoundComponentScopeReader(readers) {
            this.readers = readers;
        }
        CompoundComponentScopeReader.prototype.getScopeForComponent = function (clazz) {
            var e_1, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getScopeForComponent(clazz);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        CompoundComponentScopeReader.prototype.getRemoteScope = function (clazz) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var remoteScope = reader.getRemoteScope(clazz);
                    if (remoteScope !== null) {
                        return remoteScope;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return null;
        };
        return CompoundComponentScopeReader;
    }());
    exports.CompoundComponentScopeReader = CompoundComponentScopeReader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3Njb3BlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9zY29wZS9zcmMvY29tcG9uZW50X3Njb3BlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUEwQkE7Ozs7OztPQU1HO0lBQ0g7UUFDRSxzQ0FBb0IsT0FBK0I7WUFBL0IsWUFBTyxHQUFQLE9BQU8sQ0FBd0I7UUFBRyxDQUFDO1FBRXZELDJEQUFvQixHQUFwQixVQUFxQixLQUF1Qjs7O2dCQUMxQyxLQUFxQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQSxnQkFBQSw0QkFBRTtvQkFBOUIsSUFBTSxNQUFNLFdBQUE7b0JBQ2YsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoRCxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7d0JBQ2pCLE9BQU8sSUFBSSxDQUFDO3FCQUNiO2lCQUNGOzs7Ozs7Ozs7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxxREFBYyxHQUFkLFVBQWUsS0FBdUI7OztnQkFDcEMsS0FBcUIsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxPQUFPLENBQUEsZ0JBQUEsNEJBQUU7b0JBQTlCLElBQU0sTUFBTSxXQUFBO29CQUNmLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pELElBQUksV0FBVyxLQUFLLElBQUksRUFBRTt3QkFDeEIsT0FBTyxXQUFXLENBQUM7cUJBQ3BCO2lCQUNGOzs7Ozs7Ozs7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCxtQ0FBQztJQUFELENBQUMsQUF0QkQsSUFzQkM7SUF0Qlksb0VBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtSZW1vdGVTY29wZX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtMb2NhbE1vZHVsZVNjb3BlfSBmcm9tICcuL2xvY2FsJztcblxuLyoqXG4gKiBSZWFkIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjb21waWxhdGlvbiBzY29wZSBvZiBjb21wb25lbnRzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudFNjb3BlUmVhZGVyIHtcbiAgZ2V0U2NvcGVGb3JDb21wb25lbnQoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBMb2NhbE1vZHVsZVNjb3BlfG51bGw7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYFJlbW90ZVNjb3BlYCByZXF1aXJlZCBmb3IgdGhpcyBjb21wb25lbnQsIGlmIGFueS5cbiAgICpcbiAgICogSWYgdGhlIGNvbXBvbmVudCByZXF1aXJlcyByZW1vdGUgc2NvcGluZywgdGhlbiByZXRyaWV2ZSB0aGUgZGlyZWN0aXZlcy9waXBlcyByZWdpc3RlcmVkIGZvclxuICAgKiB0aGF0IGNvbXBvbmVudC4gSWYgcmVtb3RlIHNjb3BpbmcgaXMgbm90IHJlcXVpcmVkICh0aGUgY29tbW9uIGNhc2UpLCByZXR1cm5zIGBudWxsYC5cbiAgICovXG4gIGdldFJlbW90ZVNjb3BlKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogUmVtb3RlU2NvcGV8bnVsbDtcbn1cblxuLyoqXG4gKiBBIGBDb21wb25lbnRTY29wZVJlYWRlcmAgdGhhdCByZWFkcyBmcm9tIGFuIG9yZGVyZWQgc2V0IG9mIGNoaWxkIHJlYWRlcnMgdW50aWwgaXQgb2J0YWlucyB0aGVcbiAqIHJlcXVlc3RlZCBzY29wZS5cbiAqXG4gKiBUaGlzIGlzIHVzZWQgdG8gY29tYmluZSBgQ29tcG9uZW50U2NvcGVSZWFkZXJgcyB0aGF0IHJlYWQgZnJvbSBkaWZmZXJlbnQgc291cmNlcyAoZS5nLiBmcm9tIGFcbiAqIHJlZ2lzdHJ5IGFuZCBmcm9tIHRoZSBpbmNyZW1lbnRhbCBzdGF0ZSkuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb3VuZENvbXBvbmVudFNjb3BlUmVhZGVyIGltcGxlbWVudHMgQ29tcG9uZW50U2NvcGVSZWFkZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRlcnM6IENvbXBvbmVudFNjb3BlUmVhZGVyW10pIHt9XG5cbiAgZ2V0U2NvcGVGb3JDb21wb25lbnQoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBMb2NhbE1vZHVsZVNjb3BlfG51bGwge1xuICAgIGZvciAoY29uc3QgcmVhZGVyIG9mIHRoaXMucmVhZGVycykge1xuICAgICAgY29uc3QgbWV0YSA9IHJlYWRlci5nZXRTY29wZUZvckNvbXBvbmVudChjbGF6eik7XG4gICAgICBpZiAobWV0YSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbWV0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRSZW1vdGVTY29wZShjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IFJlbW90ZVNjb3BlfG51bGwge1xuICAgIGZvciAoY29uc3QgcmVhZGVyIG9mIHRoaXMucmVhZGVycykge1xuICAgICAgY29uc3QgcmVtb3RlU2NvcGUgPSByZWFkZXIuZ2V0UmVtb3RlU2NvcGUoY2xhenopO1xuICAgICAgaWYgKHJlbW90ZVNjb3BlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiByZW1vdGVTY29wZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==
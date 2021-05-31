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
        define("@angular/compiler-cli/src/ngtsc/transform/src/trait", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Trait = exports.TraitState = void 0;
    var TraitState;
    (function (TraitState) {
        /**
         * Pending traits are freshly created and have never been analyzed.
         */
        TraitState[TraitState["Pending"] = 0] = "Pending";
        /**
         * Analyzed traits have successfully been analyzed, but are pending resolution.
         */
        TraitState[TraitState["Analyzed"] = 1] = "Analyzed";
        /**
         * Resolved traits have successfully been analyzed and resolved and are ready for compilation.
         */
        TraitState[TraitState["Resolved"] = 2] = "Resolved";
        /**
         * Skipped traits are no longer considered for compilation.
         */
        TraitState[TraitState["Skipped"] = 3] = "Skipped";
    })(TraitState = exports.TraitState || (exports.TraitState = {}));
    /**
     * The value side of `Trait` exposes a helper to create a `Trait` in a pending state (by delegating
     * to `TraitImpl`).
     */
    exports.Trait = {
        pending: function (handler, detected) {
            return TraitImpl.pending(handler, detected);
        },
    };
    /**
     * An implementation of the `Trait` type which transitions safely between the various
     * `TraitState`s.
     */
    var TraitImpl = /** @class */ (function () {
        function TraitImpl(handler, detected) {
            this.state = TraitState.Pending;
            this.analysis = null;
            this.symbol = null;
            this.resolution = null;
            this.analysisDiagnostics = null;
            this.resolveDiagnostics = null;
            this.handler = handler;
            this.detected = detected;
        }
        TraitImpl.prototype.toAnalyzed = function (analysis, diagnostics, symbol) {
            // Only pending traits can be analyzed.
            this.assertTransitionLegal(TraitState.Pending, TraitState.Analyzed);
            this.analysis = analysis;
            this.analysisDiagnostics = diagnostics;
            this.symbol = symbol;
            this.state = TraitState.Analyzed;
            return this;
        };
        TraitImpl.prototype.toResolved = function (resolution, diagnostics) {
            // Only analyzed traits can be resolved.
            this.assertTransitionLegal(TraitState.Analyzed, TraitState.Resolved);
            if (this.analysis === null) {
                throw new Error("Cannot transition an Analyzed trait with a null analysis to Resolved");
            }
            this.resolution = resolution;
            this.state = TraitState.Resolved;
            this.resolveDiagnostics = diagnostics;
            return this;
        };
        TraitImpl.prototype.toSkipped = function () {
            // Only pending traits can be skipped.
            this.assertTransitionLegal(TraitState.Pending, TraitState.Skipped);
            this.state = TraitState.Skipped;
            return this;
        };
        /**
         * Verifies that the trait is currently in one of the `allowedState`s.
         *
         * If correctly used, the `Trait` type and transition methods prevent illegal transitions from
         * occurring. However, if a reference to the `TraitImpl` instance typed with the previous
         * interface is retained after calling one of its transition methods, it will allow for illegal
         * transitions to take place. Hence, this assertion provides a little extra runtime protection.
         */
        TraitImpl.prototype.assertTransitionLegal = function (allowedState, transitionTo) {
            if (!(this.state === allowedState)) {
                throw new Error("Assertion failure: cannot transition from " + TraitState[this.state] + " to " + TraitState[transitionTo] + ".");
            }
        };
        /**
         * Construct a new `TraitImpl` in the pending state.
         */
        TraitImpl.pending = function (handler, detected) {
            return new TraitImpl(handler, detected);
        };
        return TraitImpl;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zZm9ybS9zcmMvdHJhaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBTUgsSUFBWSxVQW9CWDtJQXBCRCxXQUFZLFVBQVU7UUFDcEI7O1dBRUc7UUFDSCxpREFBTyxDQUFBO1FBRVA7O1dBRUc7UUFDSCxtREFBUSxDQUFBO1FBRVI7O1dBRUc7UUFDSCxtREFBUSxDQUFBO1FBRVI7O1dBRUc7UUFDSCxpREFBTyxDQUFBO0lBQ1QsQ0FBQyxFQXBCVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQW9CckI7SUFrQkQ7OztPQUdHO0lBQ1UsUUFBQSxLQUFLLEdBQUc7UUFDbkIsT0FBTyxFQUFFLFVBQ0wsT0FBcUMsRUFBRSxRQUF5QjtZQUNoRSxPQUFBLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztRQUFwQyxDQUFvQztLQUN6QyxDQUFDO0lBNkhGOzs7T0FHRztJQUNIO1FBVUUsbUJBQVksT0FBcUMsRUFBRSxRQUF5QjtZQVQ1RSxVQUFLLEdBQWUsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUd2QyxhQUFRLEdBQXFCLElBQUksQ0FBQztZQUNsQyxXQUFNLEdBQVcsSUFBSSxDQUFDO1lBQ3RCLGVBQVUsR0FBcUIsSUFBSSxDQUFDO1lBQ3BDLHdCQUFtQixHQUF5QixJQUFJLENBQUM7WUFDakQsdUJBQWtCLEdBQXlCLElBQUksQ0FBQztZQUc5QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMzQixDQUFDO1FBRUQsOEJBQVUsR0FBVixVQUFXLFFBQWdCLEVBQUUsV0FBaUMsRUFBRSxNQUFTO1lBRXZFLHVDQUF1QztZQUN2QyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFdBQVcsQ0FBQztZQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDakMsT0FBTyxJQUFpQyxDQUFDO1FBQzNDLENBQUM7UUFFRCw4QkFBVSxHQUFWLFVBQVcsVUFBa0IsRUFBRSxXQUFpQztZQUM5RCx3Q0FBd0M7WUFDeEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JFLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0VBQXNFLENBQUMsQ0FBQzthQUN6RjtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsV0FBVyxDQUFDO1lBQ3RDLE9BQU8sSUFBaUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsNkJBQVMsR0FBVDtZQUNFLHNDQUFzQztZQUN0QyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQ2hDLE9BQU8sSUFBZ0MsQ0FBQztRQUMxQyxDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNLLHlDQUFxQixHQUE3QixVQUE4QixZQUF3QixFQUFFLFlBQXdCO1lBQzlFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssWUFBWSxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsK0NBQTZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQy9FLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBRyxDQUFDLENBQUM7YUFDbEM7UUFDSCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxpQkFBTyxHQUFkLFVBQ0ksT0FBcUMsRUFBRSxRQUF5QjtZQUNsRSxPQUFPLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQTZCLENBQUM7UUFDdEUsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQW5FRCxJQW1FQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7U2VtYW50aWNTeW1ib2x9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL3NlbWFudGljX2dyYXBoJztcbmltcG9ydCB7RGVjb3JhdG9ySGFuZGxlciwgRGV0ZWN0UmVzdWx0fSBmcm9tICcuL2FwaSc7XG5cbmV4cG9ydCBlbnVtIFRyYWl0U3RhdGUge1xuICAvKipcbiAgICogUGVuZGluZyB0cmFpdHMgYXJlIGZyZXNobHkgY3JlYXRlZCBhbmQgaGF2ZSBuZXZlciBiZWVuIGFuYWx5emVkLlxuICAgKi9cbiAgUGVuZGluZyxcblxuICAvKipcbiAgICogQW5hbHl6ZWQgdHJhaXRzIGhhdmUgc3VjY2Vzc2Z1bGx5IGJlZW4gYW5hbHl6ZWQsIGJ1dCBhcmUgcGVuZGluZyByZXNvbHV0aW9uLlxuICAgKi9cbiAgQW5hbHl6ZWQsXG5cbiAgLyoqXG4gICAqIFJlc29sdmVkIHRyYWl0cyBoYXZlIHN1Y2Nlc3NmdWxseSBiZWVuIGFuYWx5emVkIGFuZCByZXNvbHZlZCBhbmQgYXJlIHJlYWR5IGZvciBjb21waWxhdGlvbi5cbiAgICovXG4gIFJlc29sdmVkLFxuXG4gIC8qKlxuICAgKiBTa2lwcGVkIHRyYWl0cyBhcmUgbm8gbG9uZ2VyIGNvbnNpZGVyZWQgZm9yIGNvbXBpbGF0aW9uLlxuICAgKi9cbiAgU2tpcHBlZCxcbn1cblxuLyoqXG4gKiBBbiBJdnkgYXNwZWN0IGFkZGVkIHRvIGEgY2xhc3MgKGZvciBleGFtcGxlLCB0aGUgY29tcGlsYXRpb24gb2YgYSBjb21wb25lbnQgZGVmaW5pdGlvbikuXG4gKlxuICogVHJhaXRzIGFyZSBjcmVhdGVkIHdoZW4gYSBgRGVjb3JhdG9ySGFuZGxlcmAgbWF0Y2hlcyBhIGNsYXNzLiBFYWNoIHRyYWl0IGJlZ2lucyBpbiBhIHBlbmRpbmdcbiAqIHN0YXRlIGFuZCB1bmRlcmdvZXMgdHJhbnNpdGlvbnMgYXMgY29tcGlsYXRpb24gcHJvY2VlZHMgdGhyb3VnaCB0aGUgdmFyaW91cyBzdGVwcy5cbiAqXG4gKiBJbiBwcmFjdGljZSwgdHJhaXRzIGFyZSBpbnN0YW5jZXMgb2YgdGhlIHByaXZhdGUgY2xhc3MgYFRyYWl0SW1wbGAgZGVjbGFyZWQgYmVsb3cuIFRocm91Z2ggdGhlXG4gKiB2YXJpb3VzIGludGVyZmFjZXMgaW5jbHVkZWQgaW4gdGhpcyB1bmlvbiB0eXBlLCB0aGUgbGVnYWwgQVBJIG9mIGEgdHJhaXQgaW4gYW55IGdpdmVuIHN0YXRlIGlzXG4gKiByZXByZXNlbnRlZCBpbiB0aGUgdHlwZSBzeXN0ZW0uIFRoaXMgaW5jbHVkZXMgYW55IHBvc3NpYmxlIHRyYW5zaXRpb25zIGZyb20gb25lIHR5cGUgdG8gdGhlIG5leHQuXG4gKlxuICogVGhpcyBub3Qgb25seSBzaW1wbGlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbiwgYnV0IGVuc3VyZXMgdHJhaXRzIGFyZSBtb25vbW9ycGhpYyBvYmplY3RzIGFzXG4gKiB0aGV5J3JlIGFsbCBqdXN0IFwidmlld3NcIiBpbiB0aGUgdHlwZSBzeXN0ZW0gb2YgdGhlIHNhbWUgb2JqZWN0ICh3aGljaCBuZXZlciBjaGFuZ2VzIHNoYXBlKS5cbiAqL1xuZXhwb3J0IHR5cGUgVHJhaXQ8RCwgQSwgUyBleHRlbmRzIFNlbWFudGljU3ltYm9sfG51bGwsIFI+ID0gUGVuZGluZ1RyYWl0PEQsIEEsIFMsIFI+fFxuICAgIFNraXBwZWRUcmFpdDxELCBBLCBTLCBSPnxBbmFseXplZFRyYWl0PEQsIEEsIFMsIFI+fFJlc29sdmVkVHJhaXQ8RCwgQSwgUywgUj47XG5cbi8qKlxuICogVGhlIHZhbHVlIHNpZGUgb2YgYFRyYWl0YCBleHBvc2VzIGEgaGVscGVyIHRvIGNyZWF0ZSBhIGBUcmFpdGAgaW4gYSBwZW5kaW5nIHN0YXRlIChieSBkZWxlZ2F0aW5nXG4gKiB0byBgVHJhaXRJbXBsYCkuXG4gKi9cbmV4cG9ydCBjb25zdCBUcmFpdCA9IHtcbiAgcGVuZGluZzogPEQsIEEsIFMgZXh0ZW5kcyBTZW1hbnRpY1N5bWJvbHxudWxsLCBSPihcbiAgICAgIGhhbmRsZXI6IERlY29yYXRvckhhbmRsZXI8RCwgQSwgUywgUj4sIGRldGVjdGVkOiBEZXRlY3RSZXN1bHQ8RD4pOiBQZW5kaW5nVHJhaXQ8RCwgQSwgUywgUj4gPT5cbiAgICAgIFRyYWl0SW1wbC5wZW5kaW5nKGhhbmRsZXIsIGRldGVjdGVkKSxcbn07XG5cbi8qKlxuICogVGhlIHBhcnQgb2YgdGhlIGBUcmFpdGAgaW50ZXJmYWNlIHRoYXQncyBjb21tb24gdG8gYWxsIHRyYWl0IHN0YXRlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUcmFpdEJhc2U8RCwgQSwgUyBleHRlbmRzIFNlbWFudGljU3ltYm9sfG51bGwsIFI+IHtcbiAgLyoqXG4gICAqIEN1cnJlbnQgc3RhdGUgb2YgdGhlIHRyYWl0LlxuICAgKlxuICAgKiBUaGlzIHdpbGwgYmUgbmFycm93ZWQgaW4gdGhlIGludGVyZmFjZXMgZm9yIGVhY2ggc3BlY2lmaWMgc3RhdGUuXG4gICAqL1xuICBzdGF0ZTogVHJhaXRTdGF0ZTtcblxuICAvKipcbiAgICogVGhlIGBEZWNvcmF0b3JIYW5kbGVyYCB3aGljaCBtYXRjaGVkIG9uIHRoZSBjbGFzcyB0byBjcmVhdGUgdGhpcyB0cmFpdC5cbiAgICovXG4gIGhhbmRsZXI6IERlY29yYXRvckhhbmRsZXI8RCwgQSwgUywgUj47XG5cbiAgLyoqXG4gICAqIFRoZSBkZXRlY3Rpb24gcmVzdWx0IChvZiBgaGFuZGxlci5kZXRlY3RgKSB3aGljaCBpbmRpY2F0ZWQgdGhhdCB0aGlzIHRyYWl0IGFwcGxpZWQgdG8gdGhlXG4gICAqIGNsYXNzLlxuICAgKlxuICAgKiBUaGlzIGlzIG1haW5seSB1c2VkIHRvIGNhY2hlIHRoZSBkZXRlY3Rpb24gYmV0d2VlbiBwcmUtYW5hbHlzaXMgYW5kIGFuYWx5c2lzLlxuICAgKi9cbiAgZGV0ZWN0ZWQ6IERldGVjdFJlc3VsdDxEPjtcbn1cblxuLyoqXG4gKiBBIHRyYWl0IGluIHRoZSBwZW5kaW5nIHN0YXRlLlxuICpcbiAqIFBlbmRpbmcgdHJhaXRzIGhhdmUgeWV0IHRvIGJlIGFuYWx5emVkIGluIGFueSB3YXkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGVuZGluZ1RyYWl0PEQsIEEsIFMgZXh0ZW5kcyBTZW1hbnRpY1N5bWJvbHxudWxsLCBSPiBleHRlbmRzXG4gICAgVHJhaXRCYXNlPEQsIEEsIFMsIFI+IHtcbiAgc3RhdGU6IFRyYWl0U3RhdGUuUGVuZGluZztcblxuICAvKipcbiAgICogVGhpcyBwZW5kaW5nIHRyYWl0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBhbmFseXplZCwgYW5kIHNob3VsZCB0cmFuc2l0aW9uIHRvIHRoZSBcImFuYWx5emVkXCJcbiAgICogc3RhdGUuXG4gICAqL1xuICB0b0FuYWx5emVkKGFuYWx5c2lzOiBBfG51bGwsIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW118bnVsbCwgc3ltYm9sOiBTKTpcbiAgICAgIEFuYWx5emVkVHJhaXQ8RCwgQSwgUywgUj47XG5cbiAgLyoqXG4gICAqIER1cmluZyBhbmFseXNpcyBpdCB3YXMgZGV0ZXJtaW5lZCB0aGF0IHRoaXMgdHJhaXQgaXMgbm90IGVsaWdpYmxlIGZvciBjb21waWxhdGlvbiBhZnRlciBhbGwsXG4gICAqIGFuZCBzaG91bGQgYmUgdHJhbnNpdGlvbmVkIHRvIHRoZSBcInNraXBwZWRcIiBzdGF0ZS5cbiAgICovXG4gIHRvU2tpcHBlZCgpOiBTa2lwcGVkVHJhaXQ8RCwgQSwgUywgUj47XG59XG5cbi8qKlxuICogQSB0cmFpdCBpbiB0aGUgXCJza2lwcGVkXCIgc3RhdGUuXG4gKlxuICogU2tpcHBlZCB0cmFpdHMgYXJlbid0IGNvbnNpZGVyZWQgZm9yIGNvbXBpbGF0aW9uLlxuICpcbiAqIFRoaXMgaXMgYSB0ZXJtaW5hbCBzdGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTa2lwcGVkVHJhaXQ8RCwgQSwgUyBleHRlbmRzIFNlbWFudGljU3ltYm9sfG51bGwsIFI+IGV4dGVuZHNcbiAgICBUcmFpdEJhc2U8RCwgQSwgUywgUj4ge1xuICBzdGF0ZTogVHJhaXRTdGF0ZS5Ta2lwcGVkO1xufVxuXG4vKipcbiAqIEEgdHJhaXQgaW4gdGhlIFwiYW5hbHl6ZWRcIiBzdGF0ZS5cbiAqXG4gKiBBbmFseXplZCB0cmFpdHMgaGF2ZSBhbmFseXNpcyByZXN1bHRzIGF2YWlsYWJsZSwgYW5kIGFyZSBlbGlnaWJsZSBmb3IgcmVzb2x1dGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmFseXplZFRyYWl0PEQsIEEsIFMgZXh0ZW5kcyBTZW1hbnRpY1N5bWJvbHxudWxsLCBSPiBleHRlbmRzXG4gICAgVHJhaXRCYXNlPEQsIEEsIFMsIFI+IHtcbiAgc3RhdGU6IFRyYWl0U3RhdGUuQW5hbHl6ZWQ7XG4gIHN5bWJvbDogUztcblxuICAvKipcbiAgICogQW5hbHlzaXMgcmVzdWx0cyBvZiB0aGUgZ2l2ZW4gdHJhaXQgKGlmIGFibGUgdG8gYmUgcHJvZHVjZWQpLCBvciBgbnVsbGAgaWYgYW5hbHlzaXMgZmFpbGVkXG4gICAqIGNvbXBsZXRlbHkuXG4gICAqL1xuICBhbmFseXNpczogUmVhZG9ubHk8QT58bnVsbDtcblxuICAvKipcbiAgICogQW55IGRpYWdub3N0aWNzIHRoYXQgcmVzdWx0ZWQgZnJvbSBhbmFseXNpcywgb3IgYG51bGxgIGlmIG5vbmUuXG4gICAqL1xuICBhbmFseXNpc0RpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW118bnVsbDtcblxuICAvKipcbiAgICogVGhpcyBhbmFseXplZCB0cmFpdCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcmVzb2x2ZWQsIGFuZCBzaG91bGQgYmUgdHJhbnNpdGlvbmVkIHRvIHRoZVxuICAgKiBcInJlc29sdmVkXCIgc3RhdGUuXG4gICAqL1xuICB0b1Jlc29sdmVkKHJlc29sdXRpb246IFJ8bnVsbCwgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXXxudWxsKTogUmVzb2x2ZWRUcmFpdDxELCBBLCBTLCBSPjtcbn1cblxuLyoqXG4gKiBBIHRyYWl0IGluIHRoZSBcInJlc29sdmVkXCIgc3RhdGUuXG4gKlxuICogUmVzb2x2ZWQgdHJhaXRzIGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgYW5kIHJlc29sdmVkLCBjb250YWluIG5vIGVycm9ycywgYW5kIGFyZSByZWFkeVxuICogZm9yIHRoZSBjb21waWxhdGlvbiBwaGFzZS5cbiAqXG4gKiBUaGlzIGlzIGEgdGVybWluYWwgc3RhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRUcmFpdDxELCBBLCBTIGV4dGVuZHMgU2VtYW50aWNTeW1ib2x8bnVsbCwgUj4gZXh0ZW5kc1xuICAgIFRyYWl0QmFzZTxELCBBLCBTLCBSPiB7XG4gIHN0YXRlOiBUcmFpdFN0YXRlLlJlc29sdmVkO1xuICBzeW1ib2w6IFM7XG5cbiAgLyoqXG4gICAqIFJlc29sdmVkIHRyYWl0cyBtdXN0IGhhdmUgcHJvZHVjZWQgdmFsaWQgYW5hbHlzaXMgcmVzdWx0cy5cbiAgICovXG4gIGFuYWx5c2lzOiBSZWFkb25seTxBPjtcblxuICAvKipcbiAgICogQW5hbHlzaXMgbWF5IGhhdmUgc3RpbGwgcmVzdWx0ZWQgaW4gZGlhZ25vc3RpY3MuXG4gICAqL1xuICBhbmFseXNpc0RpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW118bnVsbDtcblxuICAvKipcbiAgICogRGlhZ25vc3RpY3MgcmVzdWx0aW5nIGZyb20gcmVzb2x1dGlvbiBhcmUgdHJhY2tlZCBzZXBhcmF0ZWx5IGZyb21cbiAgICovXG4gIHJlc29sdmVEaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSByZXN1bHRzIHJldHVybmVkIGJ5IGEgc3VjY2Vzc2Z1bCByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBjbGFzcy9gRGVjb3JhdG9ySGFuZGxlcmBcbiAgICogY29tYmluYXRpb24uXG4gICAqL1xuICByZXNvbHV0aW9uOiBSZWFkb25seTxSPnxudWxsO1xufVxuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBgVHJhaXRgIHR5cGUgd2hpY2ggdHJhbnNpdGlvbnMgc2FmZWx5IGJldHdlZW4gdGhlIHZhcmlvdXNcbiAqIGBUcmFpdFN0YXRlYHMuXG4gKi9cbmNsYXNzIFRyYWl0SW1wbDxELCBBLCBTIGV4dGVuZHMgU2VtYW50aWNTeW1ib2x8bnVsbCwgUj4ge1xuICBzdGF0ZTogVHJhaXRTdGF0ZSA9IFRyYWl0U3RhdGUuUGVuZGluZztcbiAgaGFuZGxlcjogRGVjb3JhdG9ySGFuZGxlcjxELCBBLCBTLCBSPjtcbiAgZGV0ZWN0ZWQ6IERldGVjdFJlc3VsdDxEPjtcbiAgYW5hbHlzaXM6IFJlYWRvbmx5PEE+fG51bGwgPSBudWxsO1xuICBzeW1ib2w6IFN8bnVsbCA9IG51bGw7XG4gIHJlc29sdXRpb246IFJlYWRvbmx5PFI+fG51bGwgPSBudWxsO1xuICBhbmFseXNpc0RpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW118bnVsbCA9IG51bGw7XG4gIHJlc29sdmVEaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGhhbmRsZXI6IERlY29yYXRvckhhbmRsZXI8RCwgQSwgUywgUj4sIGRldGVjdGVkOiBEZXRlY3RSZXN1bHQ8RD4pIHtcbiAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIHRoaXMuZGV0ZWN0ZWQgPSBkZXRlY3RlZDtcbiAgfVxuXG4gIHRvQW5hbHl6ZWQoYW5hbHlzaXM6IEF8bnVsbCwgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXXxudWxsLCBzeW1ib2w6IFMpOlxuICAgICAgQW5hbHl6ZWRUcmFpdDxELCBBLCBTLCBSPiB7XG4gICAgLy8gT25seSBwZW5kaW5nIHRyYWl0cyBjYW4gYmUgYW5hbHl6ZWQuXG4gICAgdGhpcy5hc3NlcnRUcmFuc2l0aW9uTGVnYWwoVHJhaXRTdGF0ZS5QZW5kaW5nLCBUcmFpdFN0YXRlLkFuYWx5emVkKTtcbiAgICB0aGlzLmFuYWx5c2lzID0gYW5hbHlzaXM7XG4gICAgdGhpcy5hbmFseXNpc0RpYWdub3N0aWNzID0gZGlhZ25vc3RpY3M7XG4gICAgdGhpcy5zeW1ib2wgPSBzeW1ib2w7XG4gICAgdGhpcy5zdGF0ZSA9IFRyYWl0U3RhdGUuQW5hbHl6ZWQ7XG4gICAgcmV0dXJuIHRoaXMgYXMgQW5hbHl6ZWRUcmFpdDxELCBBLCBTLCBSPjtcbiAgfVxuXG4gIHRvUmVzb2x2ZWQocmVzb2x1dGlvbjogUnxudWxsLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfG51bGwpOiBSZXNvbHZlZFRyYWl0PEQsIEEsIFMsIFI+IHtcbiAgICAvLyBPbmx5IGFuYWx5emVkIHRyYWl0cyBjYW4gYmUgcmVzb2x2ZWQuXG4gICAgdGhpcy5hc3NlcnRUcmFuc2l0aW9uTGVnYWwoVHJhaXRTdGF0ZS5BbmFseXplZCwgVHJhaXRTdGF0ZS5SZXNvbHZlZCk7XG4gICAgaWYgKHRoaXMuYW5hbHlzaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHRyYW5zaXRpb24gYW4gQW5hbHl6ZWQgdHJhaXQgd2l0aCBhIG51bGwgYW5hbHlzaXMgdG8gUmVzb2x2ZWRgKTtcbiAgICB9XG4gICAgdGhpcy5yZXNvbHV0aW9uID0gcmVzb2x1dGlvbjtcbiAgICB0aGlzLnN0YXRlID0gVHJhaXRTdGF0ZS5SZXNvbHZlZDtcbiAgICB0aGlzLnJlc29sdmVEaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzO1xuICAgIHJldHVybiB0aGlzIGFzIFJlc29sdmVkVHJhaXQ8RCwgQSwgUywgUj47XG4gIH1cblxuICB0b1NraXBwZWQoKTogU2tpcHBlZFRyYWl0PEQsIEEsIFMsIFI+IHtcbiAgICAvLyBPbmx5IHBlbmRpbmcgdHJhaXRzIGNhbiBiZSBza2lwcGVkLlxuICAgIHRoaXMuYXNzZXJ0VHJhbnNpdGlvbkxlZ2FsKFRyYWl0U3RhdGUuUGVuZGluZywgVHJhaXRTdGF0ZS5Ta2lwcGVkKTtcbiAgICB0aGlzLnN0YXRlID0gVHJhaXRTdGF0ZS5Ta2lwcGVkO1xuICAgIHJldHVybiB0aGlzIGFzIFNraXBwZWRUcmFpdDxELCBBLCBTLCBSPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSB0cmFpdCBpcyBjdXJyZW50bHkgaW4gb25lIG9mIHRoZSBgYWxsb3dlZFN0YXRlYHMuXG4gICAqXG4gICAqIElmIGNvcnJlY3RseSB1c2VkLCB0aGUgYFRyYWl0YCB0eXBlIGFuZCB0cmFuc2l0aW9uIG1ldGhvZHMgcHJldmVudCBpbGxlZ2FsIHRyYW5zaXRpb25zIGZyb21cbiAgICogb2NjdXJyaW5nLiBIb3dldmVyLCBpZiBhIHJlZmVyZW5jZSB0byB0aGUgYFRyYWl0SW1wbGAgaW5zdGFuY2UgdHlwZWQgd2l0aCB0aGUgcHJldmlvdXNcbiAgICogaW50ZXJmYWNlIGlzIHJldGFpbmVkIGFmdGVyIGNhbGxpbmcgb25lIG9mIGl0cyB0cmFuc2l0aW9uIG1ldGhvZHMsIGl0IHdpbGwgYWxsb3cgZm9yIGlsbGVnYWxcbiAgICogdHJhbnNpdGlvbnMgdG8gdGFrZSBwbGFjZS4gSGVuY2UsIHRoaXMgYXNzZXJ0aW9uIHByb3ZpZGVzIGEgbGl0dGxlIGV4dHJhIHJ1bnRpbWUgcHJvdGVjdGlvbi5cbiAgICovXG4gIHByaXZhdGUgYXNzZXJ0VHJhbnNpdGlvbkxlZ2FsKGFsbG93ZWRTdGF0ZTogVHJhaXRTdGF0ZSwgdHJhbnNpdGlvblRvOiBUcmFpdFN0YXRlKTogdm9pZCB7XG4gICAgaWYgKCEodGhpcy5zdGF0ZSA9PT0gYWxsb3dlZFN0YXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb24gZmFpbHVyZTogY2Fubm90IHRyYW5zaXRpb24gZnJvbSAke1RyYWl0U3RhdGVbdGhpcy5zdGF0ZV19IHRvICR7XG4gICAgICAgICAgVHJhaXRTdGF0ZVt0cmFuc2l0aW9uVG9dfS5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGBUcmFpdEltcGxgIGluIHRoZSBwZW5kaW5nIHN0YXRlLlxuICAgKi9cbiAgc3RhdGljIHBlbmRpbmc8RCwgQSwgUyBleHRlbmRzIFNlbWFudGljU3ltYm9sfG51bGwsIFI+KFxuICAgICAgaGFuZGxlcjogRGVjb3JhdG9ySGFuZGxlcjxELCBBLCBTLCBSPiwgZGV0ZWN0ZWQ6IERldGVjdFJlc3VsdDxEPik6IFBlbmRpbmdUcmFpdDxELCBBLCBTLCBSPiB7XG4gICAgcmV0dXJuIG5ldyBUcmFpdEltcGwoaGFuZGxlciwgZGV0ZWN0ZWQpIGFzIFBlbmRpbmdUcmFpdDxELCBBLCBTLCBSPjtcbiAgfVxufVxuIl19
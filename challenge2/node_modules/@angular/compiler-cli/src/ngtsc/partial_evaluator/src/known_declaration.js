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
        define("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/known_declaration", ["require", "exports", "@angular/compiler-cli/src/ngtsc/reflection/src/host", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/builtin", "@angular/compiler-cli/src/ngtsc/partial_evaluator/src/ts_helpers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveKnownDeclaration = exports.jsGlobalObjectValue = void 0;
    var host_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/host");
    var builtin_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/builtin");
    var ts_helpers_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator/src/ts_helpers");
    /** Resolved value for the JavaScript global `Object` declaration. */
    exports.jsGlobalObjectValue = new Map([['assign', new builtin_1.ObjectAssignBuiltinFn()]]);
    /** Resolved value for the `__assign()` TypeScript helper declaration. */
    var assignTsHelperFn = new ts_helpers_1.AssignHelperFn();
    /** Resolved value for the `__spread()` and `__spreadArrays()` TypeScript helper declarations. */
    var spreadTsHelperFn = new ts_helpers_1.SpreadHelperFn();
    /** Resolved value for the `__spreadArray()` TypeScript helper declarations. */
    var spreadArrayTsHelperFn = new ts_helpers_1.SpreadArrayHelperFn();
    /** Resolved value for the `__read()` TypeScript helper declarations. */
    var readTsHelperFn = new ts_helpers_1.ReadHelperFn();
    /**
     * Resolves the specified known declaration to a resolved value. For example,
     * the known JavaScript global `Object` will resolve to a `Map` that provides the
     * `assign` method with a built-in function. This enables evaluation of `Object.assign`.
     */
    function resolveKnownDeclaration(decl) {
        switch (decl) {
            case host_1.KnownDeclaration.JsGlobalObject:
                return exports.jsGlobalObjectValue;
            case host_1.KnownDeclaration.TsHelperAssign:
                return assignTsHelperFn;
            case host_1.KnownDeclaration.TsHelperSpread:
            case host_1.KnownDeclaration.TsHelperSpreadArrays:
                return spreadTsHelperFn;
            case host_1.KnownDeclaration.TsHelperSpreadArray:
                return spreadArrayTsHelperFn;
            case host_1.KnownDeclaration.TsHelperRead:
                return readTsHelperFn;
            default:
                throw new Error("Cannot resolve known declaration. Received: " + host_1.KnownDeclaration[decl] + ".");
        }
    }
    exports.resolveKnownDeclaration = resolveKnownDeclaration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia25vd25fZGVjbGFyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3BhcnRpYWxfZXZhbHVhdG9yL3NyYy9rbm93bl9kZWNsYXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw0RUFBMkQ7SUFFM0QseUZBQWdEO0lBRWhELCtGQUErRjtJQUUvRixxRUFBcUU7SUFDeEQsUUFBQSxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksK0JBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0Rix5RUFBeUU7SUFDekUsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDJCQUFjLEVBQUUsQ0FBQztJQUU5QyxpR0FBaUc7SUFDakcsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDJCQUFjLEVBQUUsQ0FBQztJQUU5QywrRUFBK0U7SUFDL0UsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLGdDQUFtQixFQUFFLENBQUM7SUFFeEQsd0VBQXdFO0lBQ3hFLElBQU0sY0FBYyxHQUFHLElBQUkseUJBQVksRUFBRSxDQUFDO0lBRTFDOzs7O09BSUc7SUFDSCxTQUFnQix1QkFBdUIsQ0FBQyxJQUFzQjtRQUM1RCxRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssdUJBQWdCLENBQUMsY0FBYztnQkFDbEMsT0FBTywyQkFBbUIsQ0FBQztZQUM3QixLQUFLLHVCQUFnQixDQUFDLGNBQWM7Z0JBQ2xDLE9BQU8sZ0JBQWdCLENBQUM7WUFDMUIsS0FBSyx1QkFBZ0IsQ0FBQyxjQUFjLENBQUM7WUFDckMsS0FBSyx1QkFBZ0IsQ0FBQyxvQkFBb0I7Z0JBQ3hDLE9BQU8sZ0JBQWdCLENBQUM7WUFDMUIsS0FBSyx1QkFBZ0IsQ0FBQyxtQkFBbUI7Z0JBQ3ZDLE9BQU8scUJBQXFCLENBQUM7WUFDL0IsS0FBSyx1QkFBZ0IsQ0FBQyxZQUFZO2dCQUNoQyxPQUFPLGNBQWMsQ0FBQztZQUN4QjtnQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUErQyx1QkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBRyxDQUFDLENBQUM7U0FDN0Y7SUFDSCxDQUFDO0lBaEJELDBEQWdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0tub3duRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24vc3JjL2hvc3QnO1xuXG5pbXBvcnQge09iamVjdEFzc2lnbkJ1aWx0aW5Gbn0gZnJvbSAnLi9idWlsdGluJztcbmltcG9ydCB7UmVzb2x2ZWRWYWx1ZX0gZnJvbSAnLi9yZXN1bHQnO1xuaW1wb3J0IHtBc3NpZ25IZWxwZXJGbiwgUmVhZEhlbHBlckZuLCBTcHJlYWRBcnJheUhlbHBlckZuLCBTcHJlYWRIZWxwZXJGbn0gZnJvbSAnLi90c19oZWxwZXJzJztcblxuLyoqIFJlc29sdmVkIHZhbHVlIGZvciB0aGUgSmF2YVNjcmlwdCBnbG9iYWwgYE9iamVjdGAgZGVjbGFyYXRpb24uICovXG5leHBvcnQgY29uc3QganNHbG9iYWxPYmplY3RWYWx1ZSA9IG5ldyBNYXAoW1snYXNzaWduJywgbmV3IE9iamVjdEFzc2lnbkJ1aWx0aW5GbigpXV0pO1xuXG4vKiogUmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSBgX19hc3NpZ24oKWAgVHlwZVNjcmlwdCBoZWxwZXIgZGVjbGFyYXRpb24uICovXG5jb25zdCBhc3NpZ25Uc0hlbHBlckZuID0gbmV3IEFzc2lnbkhlbHBlckZuKCk7XG5cbi8qKiBSZXNvbHZlZCB2YWx1ZSBmb3IgdGhlIGBfX3NwcmVhZCgpYCBhbmQgYF9fc3ByZWFkQXJyYXlzKClgIFR5cGVTY3JpcHQgaGVscGVyIGRlY2xhcmF0aW9ucy4gKi9cbmNvbnN0IHNwcmVhZFRzSGVscGVyRm4gPSBuZXcgU3ByZWFkSGVscGVyRm4oKTtcblxuLyoqIFJlc29sdmVkIHZhbHVlIGZvciB0aGUgYF9fc3ByZWFkQXJyYXkoKWAgVHlwZVNjcmlwdCBoZWxwZXIgZGVjbGFyYXRpb25zLiAqL1xuY29uc3Qgc3ByZWFkQXJyYXlUc0hlbHBlckZuID0gbmV3IFNwcmVhZEFycmF5SGVscGVyRm4oKTtcblxuLyoqIFJlc29sdmVkIHZhbHVlIGZvciB0aGUgYF9fcmVhZCgpYCBUeXBlU2NyaXB0IGhlbHBlciBkZWNsYXJhdGlvbnMuICovXG5jb25zdCByZWFkVHNIZWxwZXJGbiA9IG5ldyBSZWFkSGVscGVyRm4oKTtcblxuLyoqXG4gKiBSZXNvbHZlcyB0aGUgc3BlY2lmaWVkIGtub3duIGRlY2xhcmF0aW9uIHRvIGEgcmVzb2x2ZWQgdmFsdWUuIEZvciBleGFtcGxlLFxuICogdGhlIGtub3duIEphdmFTY3JpcHQgZ2xvYmFsIGBPYmplY3RgIHdpbGwgcmVzb2x2ZSB0byBhIGBNYXBgIHRoYXQgcHJvdmlkZXMgdGhlXG4gKiBgYXNzaWduYCBtZXRob2Qgd2l0aCBhIGJ1aWx0LWluIGZ1bmN0aW9uLiBUaGlzIGVuYWJsZXMgZXZhbHVhdGlvbiBvZiBgT2JqZWN0LmFzc2lnbmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlS25vd25EZWNsYXJhdGlvbihkZWNsOiBLbm93bkRlY2xhcmF0aW9uKTogUmVzb2x2ZWRWYWx1ZSB7XG4gIHN3aXRjaCAoZGVjbCkge1xuICAgIGNhc2UgS25vd25EZWNsYXJhdGlvbi5Kc0dsb2JhbE9iamVjdDpcbiAgICAgIHJldHVybiBqc0dsb2JhbE9iamVjdFZhbHVlO1xuICAgIGNhc2UgS25vd25EZWNsYXJhdGlvbi5Uc0hlbHBlckFzc2lnbjpcbiAgICAgIHJldHVybiBhc3NpZ25Uc0hlbHBlckZuO1xuICAgIGNhc2UgS25vd25EZWNsYXJhdGlvbi5Uc0hlbHBlclNwcmVhZDpcbiAgICBjYXNlIEtub3duRGVjbGFyYXRpb24uVHNIZWxwZXJTcHJlYWRBcnJheXM6XG4gICAgICByZXR1cm4gc3ByZWFkVHNIZWxwZXJGbjtcbiAgICBjYXNlIEtub3duRGVjbGFyYXRpb24uVHNIZWxwZXJTcHJlYWRBcnJheTpcbiAgICAgIHJldHVybiBzcHJlYWRBcnJheVRzSGVscGVyRm47XG4gICAgY2FzZSBLbm93bkRlY2xhcmF0aW9uLlRzSGVscGVyUmVhZDpcbiAgICAgIHJldHVybiByZWFkVHNIZWxwZXJGbjtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVzb2x2ZSBrbm93biBkZWNsYXJhdGlvbi4gUmVjZWl2ZWQ6ICR7S25vd25EZWNsYXJhdGlvbltkZWNsXX0uYCk7XG4gIH1cbn1cbiJdfQ==
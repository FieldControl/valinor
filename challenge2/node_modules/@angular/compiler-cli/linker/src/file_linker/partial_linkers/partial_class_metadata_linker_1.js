(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_class_metadata_linker_1", ["require", "exports", "@angular/compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toR3ClassMetadata = exports.PartialClassMetadataLinkerVersion1 = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    /**
     * A `PartialLinker` that is designed to process `ɵɵngDeclareClassMetadata()` call expressions.
     */
    var PartialClassMetadataLinkerVersion1 = /** @class */ (function () {
        function PartialClassMetadataLinkerVersion1() {
        }
        PartialClassMetadataLinkerVersion1.prototype.linkPartialDeclaration = function (constantPool, metaObj) {
            var meta = toR3ClassMetadata(metaObj);
            return compiler_1.compileClassMetadata(meta);
        };
        return PartialClassMetadataLinkerVersion1;
    }());
    exports.PartialClassMetadataLinkerVersion1 = PartialClassMetadataLinkerVersion1;
    /**
     * Derives the `R3ClassMetadata` structure from the AST object.
     */
    function toR3ClassMetadata(metaObj) {
        return {
            type: metaObj.getOpaque('type'),
            decorators: metaObj.getOpaque('decorators'),
            ctorParameters: metaObj.has('ctorParameters') ? metaObj.getOpaque('ctorParameters') : null,
            propDecorators: metaObj.has('propDecorators') ? metaObj.getOpaque('propDecorators') : null,
        };
    }
    exports.toR3ClassMetadata = toR3ClassMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9jbGFzc19tZXRhZGF0YV9saW5rZXJfMS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9saW5rZXIvc3JjL2ZpbGVfbGlua2VyL3BhcnRpYWxfbGlua2Vycy9wYXJ0aWFsX2NsYXNzX21ldGFkYXRhX2xpbmtlcl8xLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhDQUFvSTtJQU9wSTs7T0FFRztJQUNIO1FBQUE7UUFPQSxDQUFDO1FBTkMsbUVBQXNCLEdBQXRCLFVBQ0ksWUFBMEIsRUFDMUIsT0FBcUQ7WUFDdkQsSUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEMsT0FBTywrQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQ0gseUNBQUM7SUFBRCxDQUFDLEFBUEQsSUFPQztJQVBZLGdGQUFrQztJQVMvQzs7T0FFRztJQUNILFNBQWdCLGlCQUFpQixDQUM3QixPQUF1RDtRQUN6RCxPQUFPO1lBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQy9CLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztZQUMzQyxjQUFjLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDMUYsY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1NBQzNGLENBQUM7SUFDSixDQUFDO0lBUkQsOENBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Y29tcGlsZUNsYXNzTWV0YWRhdGEsIENvbnN0YW50UG9vbCwgUjNDbGFzc01ldGFkYXRhLCBSM0RlY2xhcmVDbGFzc01ldGFkYXRhLCBSM1BhcnRpYWxEZWNsYXJhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICdAYW5ndWxhci9jb21waWxlci9zcmMvb3V0cHV0L291dHB1dF9hc3QnO1xuXG5pbXBvcnQge0FzdE9iamVjdH0gZnJvbSAnLi4vLi4vYXN0L2FzdF92YWx1ZSc7XG5cbmltcG9ydCB7UGFydGlhbExpbmtlcn0gZnJvbSAnLi9wYXJ0aWFsX2xpbmtlcic7XG5cbi8qKlxuICogQSBgUGFydGlhbExpbmtlcmAgdGhhdCBpcyBkZXNpZ25lZCB0byBwcm9jZXNzIGDJtcm1bmdEZWNsYXJlQ2xhc3NNZXRhZGF0YSgpYCBjYWxsIGV4cHJlc3Npb25zLlxuICovXG5leHBvcnQgY2xhc3MgUGFydGlhbENsYXNzTWV0YWRhdGFMaW5rZXJWZXJzaW9uMTxURXhwcmVzc2lvbj4gaW1wbGVtZW50cyBQYXJ0aWFsTGlua2VyPFRFeHByZXNzaW9uPiB7XG4gIGxpbmtQYXJ0aWFsRGVjbGFyYXRpb24oXG4gICAgICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICAgIG1ldGFPYmo6IEFzdE9iamVjdDxSM1BhcnRpYWxEZWNsYXJhdGlvbiwgVEV4cHJlc3Npb24+KTogby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBtZXRhID0gdG9SM0NsYXNzTWV0YWRhdGEobWV0YU9iaik7XG4gICAgcmV0dXJuIGNvbXBpbGVDbGFzc01ldGFkYXRhKG1ldGEpO1xuICB9XG59XG5cbi8qKlxuICogRGVyaXZlcyB0aGUgYFIzQ2xhc3NNZXRhZGF0YWAgc3RydWN0dXJlIGZyb20gdGhlIEFTVCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1IzQ2xhc3NNZXRhZGF0YTxURXhwcmVzc2lvbj4oXG4gICAgbWV0YU9iajogQXN0T2JqZWN0PFIzRGVjbGFyZUNsYXNzTWV0YWRhdGEsIFRFeHByZXNzaW9uPik6IFIzQ2xhc3NNZXRhZGF0YSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogbWV0YU9iai5nZXRPcGFxdWUoJ3R5cGUnKSxcbiAgICBkZWNvcmF0b3JzOiBtZXRhT2JqLmdldE9wYXF1ZSgnZGVjb3JhdG9ycycpLFxuICAgIGN0b3JQYXJhbWV0ZXJzOiBtZXRhT2JqLmhhcygnY3RvclBhcmFtZXRlcnMnKSA/IG1ldGFPYmouZ2V0T3BhcXVlKCdjdG9yUGFyYW1ldGVycycpIDogbnVsbCxcbiAgICBwcm9wRGVjb3JhdG9yczogbWV0YU9iai5oYXMoJ3Byb3BEZWNvcmF0b3JzJykgPyBtZXRhT2JqLmdldE9wYXF1ZSgncHJvcERlY29yYXRvcnMnKSA6IG51bGwsXG4gIH07XG59XG4iXX0=
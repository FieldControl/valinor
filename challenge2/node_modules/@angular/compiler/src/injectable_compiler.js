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
        define("@angular/compiler/src/injectable_compiler", ["require", "exports", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/identifiers", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/output/value_util", "@angular/compiler/src/render3/r3_identifiers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InjectableCompiler = void 0;
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var identifiers_1 = require("@angular/compiler/src/identifiers");
    var o = require("@angular/compiler/src/output/output_ast");
    var value_util_1 = require("@angular/compiler/src/output/value_util");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    function mapEntry(key, value) {
        return { key: key, value: value, quoted: false };
    }
    var InjectableCompiler = /** @class */ (function () {
        function InjectableCompiler(reflector, alwaysGenerateDef) {
            this.reflector = reflector;
            this.alwaysGenerateDef = alwaysGenerateDef;
            this.tokenInjector = reflector.resolveExternalReference(identifiers_1.Identifiers.Injector);
        }
        InjectableCompiler.prototype.depsArray = function (deps, ctx) {
            var _this = this;
            return deps.map(function (dep) {
                var token = dep;
                var args = [token];
                var flags = 0 /* Default */;
                if (Array.isArray(dep)) {
                    for (var i = 0; i < dep.length; i++) {
                        var v = dep[i];
                        if (v) {
                            if (v.ngMetadataName === 'Optional') {
                                flags |= 8 /* Optional */;
                            }
                            else if (v.ngMetadataName === 'SkipSelf') {
                                flags |= 4 /* SkipSelf */;
                            }
                            else if (v.ngMetadataName === 'Self') {
                                flags |= 2 /* Self */;
                            }
                            else if (v.ngMetadataName === 'Inject') {
                                token = v.token;
                            }
                            else {
                                token = v;
                            }
                        }
                    }
                }
                var tokenExpr;
                if (typeof token === 'string') {
                    tokenExpr = o.literal(token);
                }
                else if (token === _this.tokenInjector) {
                    tokenExpr = o.importExpr(identifiers_1.Identifiers.INJECTOR);
                }
                else {
                    tokenExpr = ctx.importExpr(token);
                }
                if (flags !== 0 /* Default */) {
                    args = [tokenExpr, o.literal(flags)];
                }
                else {
                    args = [tokenExpr];
                }
                return o.importExpr(identifiers_1.Identifiers.inject).callFn(args);
            });
        };
        InjectableCompiler.prototype.factoryFor = function (injectable, ctx) {
            var retValue;
            if (injectable.useExisting) {
                retValue = o.importExpr(identifiers_1.Identifiers.inject).callFn([ctx.importExpr(injectable.useExisting)]);
            }
            else if (injectable.useFactory) {
                var deps = injectable.deps || [];
                if (deps.length > 0) {
                    retValue = ctx.importExpr(injectable.useFactory).callFn(this.depsArray(deps, ctx));
                }
                else {
                    return ctx.importExpr(injectable.useFactory);
                }
            }
            else if (injectable.useValue) {
                retValue = value_util_1.convertValueToOutputAst(ctx, injectable.useValue);
            }
            else {
                var clazz = injectable.useClass || injectable.symbol;
                var depArgs = this.depsArray(this.reflector.parameters(clazz), ctx);
                retValue = new o.InstantiateExpr(ctx.importExpr(clazz), depArgs);
            }
            return o.fn([], [new o.ReturnStatement(retValue)], undefined, undefined, injectable.symbol.name + '_Factory');
        };
        InjectableCompiler.prototype.injectableDef = function (injectable, ctx) {
            var providedIn = o.NULL_EXPR;
            if (injectable.providedIn !== undefined) {
                if (injectable.providedIn === null) {
                    providedIn = o.NULL_EXPR;
                }
                else if (typeof injectable.providedIn === 'string') {
                    providedIn = o.literal(injectable.providedIn);
                }
                else {
                    providedIn = ctx.importExpr(injectable.providedIn);
                }
            }
            var def = [
                mapEntry('factory', this.factoryFor(injectable, ctx)),
                mapEntry('token', ctx.importExpr(injectable.type.reference)),
                mapEntry('providedIn', providedIn),
            ];
            return o.importExpr(r3_identifiers_1.Identifiers.ɵɵdefineInjectable).callFn([o.literalMap(def)], undefined, true);
        };
        InjectableCompiler.prototype.compile = function (injectable, ctx) {
            if (this.alwaysGenerateDef || injectable.providedIn !== undefined) {
                var className = compile_metadata_1.identifierName(injectable.type);
                var clazz = new o.ClassStmt(className, null, [
                    new o.ClassField('ɵprov', o.INFERRED_TYPE, [o.StmtModifier.Static], this.injectableDef(injectable, ctx)),
                ], [], new o.ClassMethod(null, [], []), []);
                ctx.statements.push(clazz);
            }
        };
        return InjectableCompiler;
    }());
    exports.InjectableCompiler = InjectableCompiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9pbmplY3RhYmxlX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILDJFQUE2RTtJQUc3RSxpRUFBMEM7SUFDMUMsMkRBQXlDO0lBQ3pDLHNFQUE0RDtJQUM1RCwrRUFBMkQ7SUFVM0QsU0FBUyxRQUFRLENBQUMsR0FBVyxFQUFFLEtBQW1CO1FBQ2hELE9BQU8sRUFBQyxHQUFHLEtBQUEsRUFBRSxLQUFLLE9BQUEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEO1FBRUUsNEJBQW9CLFNBQTJCLEVBQVUsaUJBQTBCO1lBQS9ELGNBQVMsR0FBVCxTQUFTLENBQWtCO1lBQVUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1lBQ2pGLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLHdCQUF3QixDQUFDLHlCQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVPLHNDQUFTLEdBQWpCLFVBQWtCLElBQVcsRUFBRSxHQUFrQjtZQUFqRCxpQkF3Q0M7WUF2Q0MsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztnQkFDakIsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNoQixJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQixJQUFJLEtBQUssa0JBQW1DLENBQUM7Z0JBQzdDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ25DLElBQU0sQ0FBQyxHQUFHLEdBQUcs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VSxDQUFDLDRCQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFRCxvQ0FBTyxHQUFQLFVBQVEsVUFBcUMsRUFBRSxHQUFrQjtZQUMvRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxVQUFVLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDakUsSUFBTSxTQUFTLEdBQUcsaUNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLENBQUM7Z0JBQ25ELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FDekIsU0FBUyxFQUFFLElBQUksRUFDZjtvQkFDRSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQ1osT0FBTyxFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUNqRCxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDekMsRUFDRCxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzdDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCO1FBQ0gsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQXhHRCxJQXdHQztJQXhHWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0aWNTeW1ib2x9IGZyb20gJy4vYW90L3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhLCBpZGVudGlmaWVyTmFtZX0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZVJlZmxlY3Rvcn0gZnJvbSAnLi9jb21waWxlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0luamVjdEZsYWdzfSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9pZGVudGlmaWVycyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtjb252ZXJ0VmFsdWVUb091dHB1dEFzdH0gZnJvbSAnLi9vdXRwdXQvdmFsdWVfdXRpbCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuL3JlbmRlcjMvcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtPdXRwdXRDb250ZXh0fSBmcm9tICcuL3V0aWwnO1xuXG50eXBlIE1hcEVudHJ5ID0ge1xuICBrZXk6IHN0cmluZyxcbiAgcXVvdGVkOiBib29sZWFuLFxuICB2YWx1ZTogby5FeHByZXNzaW9uXG59O1xudHlwZSBNYXBMaXRlcmFsID0gTWFwRW50cnlbXTtcblxuZnVuY3Rpb24gbWFwRW50cnkoa2V5OiBzdHJpbmcsIHZhbHVlOiBvLkV4cHJlc3Npb24pOiBNYXBFbnRyeSB7XG4gIHJldHVybiB7a2V5LCB2YWx1ZSwgcXVvdGVkOiBmYWxzZX07XG59XG5cbmV4cG9ydCBjbGFzcyBJbmplY3RhYmxlQ29tcGlsZXIge1xuICBwcml2YXRlIHRva2VuSW5qZWN0b3I6IFN0YXRpY1N5bWJvbDtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIHByaXZhdGUgYWx3YXlzR2VuZXJhdGVEZWY6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnRva2VuSW5qZWN0b3IgPSByZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLkluamVjdG9yKTtcbiAgfVxuXG4gIHByaXZhdGUgZGVwc0FycmF5KGRlcHM6IGFueVtdLCBjdHg6IE91dHB1dENvbnRleHQpOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgcmV0dXJuIGRlcHMubWFwKGRlcCA9PiB7XG4gICAgICBsZXQgdG9rZW4gPSBkZXA7XG4gICAgICBsZXQgYXJncyA9IFt0b2tlbl07XG4gICAgICBsZXQgZmxhZ3M6IEluamVjdEZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdDtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRlcCkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCB2ID0gZGVwW2ldO1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICBpZiAodi5uZ01ldGFkYXRhTmFtZSA9PT0gJ09wdGlvbmFsJykge1xuICAgICAgICAgICAgICBmbGFncyB8PSBJbmplY3RGbGFncy5PcHRpb25hbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodi5uZ01ldGFkYXRhTmFtZSA9PT0gJ1NraXBTZWxmJykge1xuICAgICAgICAgICAgICBmbGFncyB8PSBJbmplY3RGbGFncy5Ta2lwU2VsZjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodi5uZ01ldGFkYXRhTmFtZSA9PT0gJ1NlbGYnKSB7XG4gICAgICAgICAgICAgIGZsYWdzIHw9IEluamVjdEZsYWdzLlNlbGY7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHYubmdNZXRhZGF0YU5hbWUgPT09ICdJbmplY3QnKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdi50b2tlbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IHRva2VuRXhwcjogby5FeHByZXNzaW9uO1xuICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdG9rZW5FeHByID0gby5saXRlcmFsKHRva2VuKTtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW4gPT09IHRoaXMudG9rZW5JbmplY3Rvcikge1xuICAgICAgICB0b2tlbkV4cHIgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuSU5KRUNUT1IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW5FeHByID0gY3R4LmltcG9ydEV4cHIodG9rZW4pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmxhZ3MgIT09IEluamVjdEZsYWdzLkRlZmF1bHQpIHtcbiAgICAgICAgYXJncyA9IFt0b2tlbkV4cHIsIG8ubGl0ZXJhbChmbGFncyldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IFt0b2tlbkV4cHJdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5pbmplY3QpLmNhbGxGbihhcmdzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZhY3RvcnlGb3IoaW5qZWN0YWJsZTogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YSwgY3R4OiBPdXRwdXRDb250ZXh0KTogby5FeHByZXNzaW9uIHtcbiAgICBsZXQgcmV0VmFsdWU6IG8uRXhwcmVzc2lvbjtcbiAgICBpZiAoaW5qZWN0YWJsZS51c2VFeGlzdGluZykge1xuICAgICAgcmV0VmFsdWUgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuaW5qZWN0KS5jYWxsRm4oW2N0eC5pbXBvcnRFeHByKGluamVjdGFibGUudXNlRXhpc3RpbmcpXSk7XG4gICAgfSBlbHNlIGlmIChpbmplY3RhYmxlLnVzZUZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IGRlcHMgPSBpbmplY3RhYmxlLmRlcHMgfHwgW107XG4gICAgICBpZiAoZGVwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldFZhbHVlID0gY3R4LmltcG9ydEV4cHIoaW5qZWN0YWJsZS51c2VGYWN0b3J5KS5jYWxsRm4odGhpcy5kZXBzQXJyYXkoZGVwcywgY3R4KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY3R4LmltcG9ydEV4cHIoaW5qZWN0YWJsZS51c2VGYWN0b3J5KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluamVjdGFibGUudXNlVmFsdWUpIHtcbiAgICAgIHJldFZhbHVlID0gY29udmVydFZhbHVlVG9PdXRwdXRBc3QoY3R4LCBpbmplY3RhYmxlLnVzZVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2xhenogPSBpbmplY3RhYmxlLnVzZUNsYXNzIHx8IGluamVjdGFibGUuc3ltYm9sO1xuICAgICAgY29uc3QgZGVwQXJncyA9IHRoaXMuZGVwc0FycmF5KHRoaXMucmVmbGVjdG9yLnBhcmFtZXRlcnMoY2xhenopLCBjdHgpO1xuICAgICAgcmV0VmFsdWUgPSBuZXcgby5JbnN0YW50aWF0ZUV4cHIoY3R4LmltcG9ydEV4cHIoY2xhenopLCBkZXBBcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIG8uZm4oXG4gICAgICAgIFtdLCBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHJldFZhbHVlKV0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICBpbmplY3RhYmxlLnN5bWJvbC5uYW1lICsgJ19GYWN0b3J5Jyk7XG4gIH1cblxuICBpbmplY3RhYmxlRGVmKGluamVjdGFibGU6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGEsIGN0eDogT3V0cHV0Q29udGV4dCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgbGV0IHByb3ZpZGVkSW46IG8uRXhwcmVzc2lvbiA9IG8uTlVMTF9FWFBSO1xuICAgIGlmIChpbmplY3RhYmxlLnByb3ZpZGVkSW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGluamVjdGFibGUucHJvdmlkZWRJbiA9PT0gbnVsbCkge1xuICAgICAgICBwcm92aWRlZEluID0gby5OVUxMX0VYUFI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbmplY3RhYmxlLnByb3ZpZGVkSW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHByb3ZpZGVkSW4gPSBvLmxpdGVyYWwoaW5qZWN0YWJsZS5wcm92aWRlZEluKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3ZpZGVkSW4gPSBjdHguaW1wb3J0RXhwcihpbmplY3RhYmxlLnByb3ZpZGVkSW4pO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkZWY6IE1hcExpdGVyYWwgPSBbXG4gICAgICBtYXBFbnRyeSgnZmFjdG9yeScsIHRoaXMuZmFjdG9yeUZvcihpbmplY3RhYmxlLCBjdHgpKSxcbiAgICAgIG1hcEVudHJ5KCd0b2tlbicsIGN0eC5pbXBvcnRFeHByKGluamVjdGFibGUudHlwZS5yZWZlcmVuY2UpKSxcbiAgICAgIG1hcEVudHJ5KCdwcm92aWRlZEluJywgcHJvdmlkZWRJbiksXG4gICAgXTtcbiAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLsm1ybVkZWZpbmVJbmplY3RhYmxlKS5jYWxsRm4oW28ubGl0ZXJhbE1hcChkZWYpXSwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgfVxuXG4gIGNvbXBpbGUoaW5qZWN0YWJsZTogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YSwgY3R4OiBPdXRwdXRDb250ZXh0KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYWx3YXlzR2VuZXJhdGVEZWYgfHwgaW5qZWN0YWJsZS5wcm92aWRlZEluICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGlkZW50aWZpZXJOYW1lKGluamVjdGFibGUudHlwZSkhO1xuICAgICAgY29uc3QgY2xhenogPSBuZXcgby5DbGFzc1N0bXQoXG4gICAgICAgICAgY2xhc3NOYW1lLCBudWxsLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG5ldyBvLkNsYXNzRmllbGQoXG4gICAgICAgICAgICAgICAgJ8m1cHJvdicsIG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLlN0YXRpY10sXG4gICAgICAgICAgICAgICAgdGhpcy5pbmplY3RhYmxlRGVmKGluamVjdGFibGUsIGN0eCkpLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgW10sIG5ldyBvLkNsYXNzTWV0aG9kKG51bGwsIFtdLCBbXSksIFtdKTtcbiAgICAgIGN0eC5zdGF0ZW1lbnRzLnB1c2goY2xhenopO1xuICAgIH1cbiAgfVxufVxuIl19
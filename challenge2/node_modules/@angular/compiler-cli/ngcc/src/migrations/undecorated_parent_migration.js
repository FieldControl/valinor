(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/migrations/undecorated_parent_migration", ["require", "exports", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/ngcc/src/migrations/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UndecoratedParentMigration = void 0;
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/migrations/utils");
    /**
     * Ensure that the parents of directives and components that have no constructor are also decorated
     * as a `Directive`.
     *
     * Example:
     *
     * ```
     * export class BasePlain {
     *   constructor(private vcr: ViewContainerRef) {}
     * }
     *
     * @Directive({selector: '[blah]'})
     * export class DerivedDir extends BasePlain {}
     * ```
     *
     * When compiling `DerivedDir` which extends the undecorated `BasePlain` class, the compiler needs
     * to generate a directive def (`ɵdir`) for `DerivedDir`. In particular, it needs to generate a
     * factory function that creates instances of `DerivedDir`.
     *
     * As `DerivedDir` has no constructor, the factory function for `DerivedDir` must delegate to the
     * factory function for `BasePlain`. But for this to work, `BasePlain` must have a factory function,
     * itself.
     *
     * This migration adds a `Directive` decorator to such undecorated parent classes, to ensure that
     * the compiler will create the necessary factory function.
     *
     * The resulting code looks like:
     *
     * ```
     * @Directive()
     * export class BasePlain {
     *   constructor(private vcr: ViewContainerRef) {}
     * }
     *
     * @Directive({selector: '[blah]'})
     * export class DerivedDir extends BasePlain {}
     * ```
     */
    var UndecoratedParentMigration = /** @class */ (function () {
        function UndecoratedParentMigration() {
        }
        UndecoratedParentMigration.prototype.apply = function (clazz, host) {
            // Only interested in `clazz` if it is a `Component` or a `Directive`,
            // and it has no constructor of its own.
            if (!utils_1.hasDirectiveDecorator(host, clazz) || utils_1.hasConstructor(host, clazz)) {
                return null;
            }
            // Only interested in `clazz` if it inherits from a base class.
            var baseClazzRef = determineBaseClass(clazz, host);
            while (baseClazzRef !== null) {
                var baseClazz = baseClazzRef.node;
                // Do not proceed if the base class already has a decorator, or is not in scope of the
                // entry-point that is currently being compiled.
                if (utils_1.hasDirectiveDecorator(host, baseClazz) || !host.isInScope(baseClazz)) {
                    break;
                }
                // Inject an `@Directive()` decorator for the base class.
                host.injectSyntheticDecorator(baseClazz, utils_1.createDirectiveDecorator(baseClazz));
                // If the base class has a constructor, there's no need to continue walking up the
                // inheritance chain. The injected decorator ensures that a factory is generated that does
                // not delegate to the base class.
                if (utils_1.hasConstructor(host, baseClazz)) {
                    break;
                }
                // Continue with another level of class inheritance.
                baseClazzRef = determineBaseClass(baseClazz, host);
            }
            return null;
        };
        return UndecoratedParentMigration;
    }());
    exports.UndecoratedParentMigration = UndecoratedParentMigration;
    /**
     * Computes a reference to the base class, or `null` if the class has no base class or if it could
     * not be statically determined.
     */
    function determineBaseClass(clazz, host) {
        var baseClassExpr = host.reflectionHost.getBaseClassExpression(clazz);
        if (baseClassExpr === null) {
            return null;
        }
        var baseClass = host.evaluator.evaluate(baseClassExpr);
        if (!(baseClass instanceof imports_1.Reference) || !utils_1.isClassDeclaration(baseClass.node)) {
            return null;
        }
        return baseClass;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5kZWNvcmF0ZWRfcGFyZW50X21pZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9taWdyYXRpb25zL3VuZGVjb3JhdGVkX3BhcmVudF9taWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBU0EsbUVBQXFEO0lBSXJELHlFQUE0RztJQUc1Rzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXFDRztJQUNIO1FBQUE7UUFtQ0EsQ0FBQztRQWxDQywwQ0FBSyxHQUFMLFVBQU0sS0FBdUIsRUFBRSxJQUFtQjtZQUNoRCxzRUFBc0U7WUFDdEUsd0NBQXdDO1lBQ3hDLElBQUksQ0FBQyw2QkFBcUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksc0JBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RFLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCwrREFBK0Q7WUFDL0QsSUFBSSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELE9BQU8sWUFBWSxLQUFLLElBQUksRUFBRTtnQkFDNUIsSUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFFcEMsc0ZBQXNGO2dCQUN0RixnREFBZ0Q7Z0JBQ2hELElBQUksNkJBQXFCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDeEUsTUFBTTtpQkFDUDtnQkFFRCx5REFBeUQ7Z0JBQ3pELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsZ0NBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFFOUUsa0ZBQWtGO2dCQUNsRiwwRkFBMEY7Z0JBQzFGLGtDQUFrQztnQkFDbEMsSUFBSSxzQkFBYyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDbkMsTUFBTTtpQkFDUDtnQkFFRCxvREFBb0Q7Z0JBQ3BELFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDcEQ7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCxpQ0FBQztJQUFELENBQUMsQUFuQ0QsSUFtQ0M7SUFuQ1ksZ0VBQTBCO0lBcUN2Qzs7O09BR0c7SUFDSCxTQUFTLGtCQUFrQixDQUN2QixLQUF1QixFQUFFLElBQW1CO1FBQzlDLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEUsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO1lBQzFCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsQ0FBQyxTQUFTLFlBQVksbUJBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQWtCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLFNBQXdDLENBQUM7SUFDbEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvaW1wb3J0cyc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtNaWdyYXRpb24sIE1pZ3JhdGlvbkhvc3R9IGZyb20gJy4vbWlncmF0aW9uJztcbmltcG9ydCB7Y3JlYXRlRGlyZWN0aXZlRGVjb3JhdG9yLCBoYXNDb25zdHJ1Y3RvciwgaGFzRGlyZWN0aXZlRGVjb3JhdG9yLCBpc0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4vdXRpbHMnO1xuXG5cbi8qKlxuICogRW5zdXJlIHRoYXQgdGhlIHBhcmVudHMgb2YgZGlyZWN0aXZlcyBhbmQgY29tcG9uZW50cyB0aGF0IGhhdmUgbm8gY29uc3RydWN0b3IgYXJlIGFsc28gZGVjb3JhdGVkXG4gKiBhcyBhIGBEaXJlY3RpdmVgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBleHBvcnQgY2xhc3MgQmFzZVBsYWluIHtcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSB2Y3I6IFZpZXdDb250YWluZXJSZWYpIHt9XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbYmxhaF0nfSlcbiAqIGV4cG9ydCBjbGFzcyBEZXJpdmVkRGlyIGV4dGVuZHMgQmFzZVBsYWluIHt9XG4gKiBgYGBcbiAqXG4gKiBXaGVuIGNvbXBpbGluZyBgRGVyaXZlZERpcmAgd2hpY2ggZXh0ZW5kcyB0aGUgdW5kZWNvcmF0ZWQgYEJhc2VQbGFpbmAgY2xhc3MsIHRoZSBjb21waWxlciBuZWVkc1xuICogdG8gZ2VuZXJhdGUgYSBkaXJlY3RpdmUgZGVmIChgybVkaXJgKSBmb3IgYERlcml2ZWREaXJgLiBJbiBwYXJ0aWN1bGFyLCBpdCBuZWVkcyB0byBnZW5lcmF0ZSBhXG4gKiBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBpbnN0YW5jZXMgb2YgYERlcml2ZWREaXJgLlxuICpcbiAqIEFzIGBEZXJpdmVkRGlyYCBoYXMgbm8gY29uc3RydWN0b3IsIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGZvciBgRGVyaXZlZERpcmAgbXVzdCBkZWxlZ2F0ZSB0byB0aGVcbiAqIGZhY3RvcnkgZnVuY3Rpb24gZm9yIGBCYXNlUGxhaW5gLiBCdXQgZm9yIHRoaXMgdG8gd29yaywgYEJhc2VQbGFpbmAgbXVzdCBoYXZlIGEgZmFjdG9yeSBmdW5jdGlvbixcbiAqIGl0c2VsZi5cbiAqXG4gKiBUaGlzIG1pZ3JhdGlvbiBhZGRzIGEgYERpcmVjdGl2ZWAgZGVjb3JhdG9yIHRvIHN1Y2ggdW5kZWNvcmF0ZWQgcGFyZW50IGNsYXNzZXMsIHRvIGVuc3VyZSB0aGF0XG4gKiB0aGUgY29tcGlsZXIgd2lsbCBjcmVhdGUgdGhlIG5lY2Vzc2FyeSBmYWN0b3J5IGZ1bmN0aW9uLlxuICpcbiAqIFRoZSByZXN1bHRpbmcgY29kZSBsb29rcyBsaWtlOlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSgpXG4gKiBleHBvcnQgY2xhc3MgQmFzZVBsYWluIHtcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSB2Y3I6IFZpZXdDb250YWluZXJSZWYpIHt9XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbYmxhaF0nfSlcbiAqIGV4cG9ydCBjbGFzcyBEZXJpdmVkRGlyIGV4dGVuZHMgQmFzZVBsYWluIHt9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFVuZGVjb3JhdGVkUGFyZW50TWlncmF0aW9uIGltcGxlbWVudHMgTWlncmF0aW9uIHtcbiAgYXBwbHkoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGhvc3Q6IE1pZ3JhdGlvbkhvc3QpOiB0cy5EaWFnbm9zdGljfG51bGwge1xuICAgIC8vIE9ubHkgaW50ZXJlc3RlZCBpbiBgY2xhenpgIGlmIGl0IGlzIGEgYENvbXBvbmVudGAgb3IgYSBgRGlyZWN0aXZlYCxcbiAgICAvLyBhbmQgaXQgaGFzIG5vIGNvbnN0cnVjdG9yIG9mIGl0cyBvd24uXG4gICAgaWYgKCFoYXNEaXJlY3RpdmVEZWNvcmF0b3IoaG9zdCwgY2xhenopIHx8IGhhc0NvbnN0cnVjdG9yKGhvc3QsIGNsYXp6KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gT25seSBpbnRlcmVzdGVkIGluIGBjbGF6emAgaWYgaXQgaW5oZXJpdHMgZnJvbSBhIGJhc2UgY2xhc3MuXG4gICAgbGV0IGJhc2VDbGF6elJlZiA9IGRldGVybWluZUJhc2VDbGFzcyhjbGF6eiwgaG9zdCk7XG4gICAgd2hpbGUgKGJhc2VDbGF6elJlZiAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgYmFzZUNsYXp6ID0gYmFzZUNsYXp6UmVmLm5vZGU7XG5cbiAgICAgIC8vIERvIG5vdCBwcm9jZWVkIGlmIHRoZSBiYXNlIGNsYXNzIGFscmVhZHkgaGFzIGEgZGVjb3JhdG9yLCBvciBpcyBub3QgaW4gc2NvcGUgb2YgdGhlXG4gICAgICAvLyBlbnRyeS1wb2ludCB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBjb21waWxlZC5cbiAgICAgIGlmIChoYXNEaXJlY3RpdmVEZWNvcmF0b3IoaG9zdCwgYmFzZUNsYXp6KSB8fCAhaG9zdC5pc0luU2NvcGUoYmFzZUNsYXp6KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gSW5qZWN0IGFuIGBARGlyZWN0aXZlKClgIGRlY29yYXRvciBmb3IgdGhlIGJhc2UgY2xhc3MuXG4gICAgICBob3N0LmluamVjdFN5bnRoZXRpY0RlY29yYXRvcihiYXNlQ2xhenosIGNyZWF0ZURpcmVjdGl2ZURlY29yYXRvcihiYXNlQ2xhenopKTtcblxuICAgICAgLy8gSWYgdGhlIGJhc2UgY2xhc3MgaGFzIGEgY29uc3RydWN0b3IsIHRoZXJlJ3Mgbm8gbmVlZCB0byBjb250aW51ZSB3YWxraW5nIHVwIHRoZVxuICAgICAgLy8gaW5oZXJpdGFuY2UgY2hhaW4uIFRoZSBpbmplY3RlZCBkZWNvcmF0b3IgZW5zdXJlcyB0aGF0IGEgZmFjdG9yeSBpcyBnZW5lcmF0ZWQgdGhhdCBkb2VzXG4gICAgICAvLyBub3QgZGVsZWdhdGUgdG8gdGhlIGJhc2UgY2xhc3MuXG4gICAgICBpZiAoaGFzQ29uc3RydWN0b3IoaG9zdCwgYmFzZUNsYXp6KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gQ29udGludWUgd2l0aCBhbm90aGVyIGxldmVsIG9mIGNsYXNzIGluaGVyaXRhbmNlLlxuICAgICAgYmFzZUNsYXp6UmVmID0gZGV0ZXJtaW5lQmFzZUNsYXNzKGJhc2VDbGF6eiwgaG9zdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wdXRlcyBhIHJlZmVyZW5jZSB0byB0aGUgYmFzZSBjbGFzcywgb3IgYG51bGxgIGlmIHRoZSBjbGFzcyBoYXMgbm8gYmFzZSBjbGFzcyBvciBpZiBpdCBjb3VsZFxuICogbm90IGJlIHN0YXRpY2FsbHkgZGV0ZXJtaW5lZC5cbiAqL1xuZnVuY3Rpb24gZGV0ZXJtaW5lQmFzZUNsYXNzKFxuICAgIGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCBob3N0OiBNaWdyYXRpb25Ib3N0KTogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+fG51bGwge1xuICBjb25zdCBiYXNlQ2xhc3NFeHByID0gaG9zdC5yZWZsZWN0aW9uSG9zdC5nZXRCYXNlQ2xhc3NFeHByZXNzaW9uKGNsYXp6KTtcbiAgaWYgKGJhc2VDbGFzc0V4cHIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGJhc2VDbGFzcyA9IGhvc3QuZXZhbHVhdG9yLmV2YWx1YXRlKGJhc2VDbGFzc0V4cHIpO1xuICBpZiAoIShiYXNlQ2xhc3MgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHx8ICFpc0NsYXNzRGVjbGFyYXRpb24oYmFzZUNsYXNzLm5vZGUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gYmFzZUNsYXNzIGFzIFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPjtcbn1cbiJdfQ==
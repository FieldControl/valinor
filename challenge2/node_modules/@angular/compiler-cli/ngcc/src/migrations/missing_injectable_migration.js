(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/migrations/missing_injectable_migration", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/annotations", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/ngcc/src/migrations/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAngularCoreDecoratorName = exports.MissingInjectableMigration = void 0;
    var tslib_1 = require("tslib");
    var annotations_1 = require("@angular/compiler-cli/src/ngtsc/annotations");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/migrations/utils");
    /**
     * Ensures that classes that are provided as an Angular service in either `NgModule.providers` or
     * `Directive.providers`/`Component.viewProviders` are decorated with one of the `@Injectable`,
     * `@Directive`, `@Component` or `@Pipe` decorators, adding an `@Injectable()` decorator when none
     * are present.
     *
     * At least one decorator is now mandatory, as otherwise the compiler would not compile an
     * injectable definition for the service. This is unlike View Engine, where having just an unrelated
     * decorator may have been sufficient for the service to become injectable.
     *
     * In essence, this migration operates on classes that are themselves an NgModule, Directive or
     * Component. Their metadata is statically evaluated so that their "providers"/"viewProviders"
     * properties can be analyzed. For any provider that refers to an undecorated class, the class will
     * be migrated to have an `@Injectable()` decorator.
     *
     * This implementation mirrors the "missing-injectable" schematic.
     */
    var MissingInjectableMigration = /** @class */ (function () {
        function MissingInjectableMigration() {
        }
        MissingInjectableMigration.prototype.apply = function (clazz, host) {
            var e_1, _a;
            var decorators = host.reflectionHost.getDecoratorsOfDeclaration(clazz);
            if (decorators === null) {
                return null;
            }
            try {
                for (var decorators_1 = tslib_1.__values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                    var decorator = decorators_1_1.value;
                    var name = getAngularCoreDecoratorName(decorator);
                    if (name === 'NgModule') {
                        migrateNgModuleProviders(decorator, host);
                    }
                    else if (name === 'Directive') {
                        migrateDirectiveProviders(decorator, host, /* isComponent */ false);
                    }
                    else if (name === 'Component') {
                        migrateDirectiveProviders(decorator, host, /* isComponent */ true);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (decorators_1_1 && !decorators_1_1.done && (_a = decorators_1.return)) _a.call(decorators_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        return MissingInjectableMigration;
    }());
    exports.MissingInjectableMigration = MissingInjectableMigration;
    /**
     * Iterates through all `NgModule.providers` and adds the `@Injectable()` decorator to any provider
     * that is not otherwise decorated.
     */
    function migrateNgModuleProviders(decorator, host) {
        if (decorator.args === null || decorator.args.length !== 1) {
            return;
        }
        var metadata = host.evaluator.evaluate(decorator.args[0], annotations_1.forwardRefResolver);
        if (!(metadata instanceof Map)) {
            return;
        }
        migrateProviders(metadata, 'providers', host);
        // TODO(alxhub): we should probably also check for `ModuleWithProviders` here.
    }
    /**
     * Iterates through all `Directive.providers` and if `isComponent` is set to true also
     * `Component.viewProviders` and adds the `@Injectable()` decorator to any provider that is not
     * otherwise decorated.
     */
    function migrateDirectiveProviders(decorator, host, isComponent) {
        if (decorator.args === null || decorator.args.length !== 1) {
            return;
        }
        var metadata = host.evaluator.evaluate(decorator.args[0], annotations_1.forwardRefResolver);
        if (!(metadata instanceof Map)) {
            return;
        }
        migrateProviders(metadata, 'providers', host);
        if (isComponent) {
            migrateProviders(metadata, 'viewProviders', host);
        }
    }
    /**
     * Given an object with decorator metadata, iterates through the list of providers to add
     * `@Injectable()` to any provider that is not otherwise decorated.
     */
    function migrateProviders(metadata, field, host) {
        var e_2, _a;
        if (!metadata.has(field)) {
            return;
        }
        var providers = metadata.get(field);
        if (!Array.isArray(providers)) {
            return;
        }
        try {
            for (var providers_1 = tslib_1.__values(providers), providers_1_1 = providers_1.next(); !providers_1_1.done; providers_1_1 = providers_1.next()) {
                var provider = providers_1_1.value;
                migrateProvider(provider, host);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (providers_1_1 && !providers_1_1.done && (_a = providers_1.return)) _a.call(providers_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    /**
     * Analyzes a single provider entry and determines the class that is required to have an
     * `@Injectable()` decorator.
     */
    function migrateProvider(provider, host) {
        var e_3, _a;
        if (provider instanceof Map) {
            if (!provider.has('provide') || provider.has('useValue') || provider.has('useFactory') ||
                provider.has('useExisting')) {
                return;
            }
            if (provider.has('useClass')) {
                // {provide: ..., useClass: SomeClass, deps: [...]} does not require a decorator on SomeClass,
                // as the provider itself configures 'deps'. Only if 'deps' is missing will this require a
                // factory to exist on SomeClass.
                if (!provider.has('deps')) {
                    migrateProviderClass(provider.get('useClass'), host);
                }
            }
            else {
                migrateProviderClass(provider.get('provide'), host);
            }
        }
        else if (Array.isArray(provider)) {
            try {
                for (var provider_1 = tslib_1.__values(provider), provider_1_1 = provider_1.next(); !provider_1_1.done; provider_1_1 = provider_1.next()) {
                    var v = provider_1_1.value;
                    migrateProvider(v, host);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (provider_1_1 && !provider_1_1.done && (_a = provider_1.return)) _a.call(provider_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        else {
            migrateProviderClass(provider, host);
        }
    }
    /**
     * Given a provider class, adds the `@Injectable()` decorator if no other relevant Angular decorator
     * is present on the class.
     */
    function migrateProviderClass(provider, host) {
        // Providers that do not refer to a class cannot be migrated.
        if (!(provider instanceof imports_1.Reference)) {
            return;
        }
        var clazz = provider.node;
        if (utils_1.isClassDeclaration(clazz) && host.isInScope(clazz) && needsInjectableDecorator(clazz, host)) {
            host.injectSyntheticDecorator(clazz, utils_1.createInjectableDecorator(clazz));
        }
    }
    var NO_MIGRATE_DECORATORS = new Set(['Injectable', 'Directive', 'Component', 'Pipe']);
    /**
     * Determines if the given class needs to be decorated with `@Injectable()` based on whether it
     * already has an Angular decorator applied.
     */
    function needsInjectableDecorator(clazz, host) {
        var e_4, _a;
        var decorators = host.getAllDecorators(clazz);
        if (decorators === null) {
            return true;
        }
        try {
            for (var decorators_2 = tslib_1.__values(decorators), decorators_2_1 = decorators_2.next(); !decorators_2_1.done; decorators_2_1 = decorators_2.next()) {
                var decorator = decorators_2_1.value;
                var name = getAngularCoreDecoratorName(decorator);
                if (name !== null && NO_MIGRATE_DECORATORS.has(name)) {
                    return false;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (decorators_2_1 && !decorators_2_1.done && (_a = decorators_2.return)) _a.call(decorators_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return true;
    }
    /**
     * Determines the original name of a decorator if it is from '@angular/core'. For other decorators,
     * null is returned.
     */
    function getAngularCoreDecoratorName(decorator) {
        if (decorator.import === null || decorator.import.from !== '@angular/core') {
            return null;
        }
        return decorator.import.name;
    }
    exports.getAngularCoreDecoratorName = getAngularCoreDecoratorName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzc2luZ19pbmplY3RhYmxlX21pZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9taWdyYXRpb25zL21pc3NpbmdfaW5qZWN0YWJsZV9taWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVNBLDJFQUFrRTtJQUNsRSxtRUFBcUQ7SUFLckQseUVBQXNFO0lBRXRFOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JHO0lBQ0g7UUFBQTtRQW9CQSxDQUFDO1FBbkJDLDBDQUFLLEdBQUwsVUFBTSxLQUF1QixFQUFFLElBQW1COztZQUNoRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pFLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDdkIsT0FBTyxJQUFJLENBQUM7YUFDYjs7Z0JBRUQsS0FBd0IsSUFBQSxlQUFBLGlCQUFBLFVBQVUsQ0FBQSxzQ0FBQSw4REFBRTtvQkFBL0IsSUFBTSxTQUFTLHVCQUFBO29CQUNsQixJQUFNLElBQUksR0FBRywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO3dCQUN2Qix3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQzNDO3lCQUFNLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRTt3QkFDL0IseUJBQXlCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDckU7eUJBQU0sSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFO3dCQUMvQix5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwRTtpQkFDRjs7Ozs7Ozs7O1lB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SSxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7O1lBRUQsS0FBd0IsSUFBQSxlQUFBLGlCQUFBLFVBQVUsQ0FBQSxzQ0FBQSw4REFBRTtnQkFBL0IsSUFBTSxTQUFTLHVCQUFBO2dCQUNsQixJQUFNLElBQUksR0FBRywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDcEQsT0FBTyxLQUFLLENBQUM7aUJBQ2Q7YUFDRjs7Ozs7Ozs7O1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsMkJBQTJCLENBQUMsU0FBb0I7UUFDOUQsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLElBQUksSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxlQUFlLEVBQUU7WUFDMUUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQU5ELGtFQU1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtmb3J3YXJkUmVmUmVzb2x2ZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9hbm5vdGF0aW9ucyc7XG5pbXBvcnQge1JlZmVyZW5jZX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ltcG9ydHMnO1xuaW1wb3J0IHtSZXNvbHZlZFZhbHVlLCBSZXNvbHZlZFZhbHVlTWFwfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvcGFydGlhbF9ldmFsdWF0b3InO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBEZWNvcmF0b3J9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtNaWdyYXRpb24sIE1pZ3JhdGlvbkhvc3R9IGZyb20gJy4vbWlncmF0aW9uJztcbmltcG9ydCB7Y3JlYXRlSW5qZWN0YWJsZURlY29yYXRvciwgaXNDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgY2xhc3NlcyB0aGF0IGFyZSBwcm92aWRlZCBhcyBhbiBBbmd1bGFyIHNlcnZpY2UgaW4gZWl0aGVyIGBOZ01vZHVsZS5wcm92aWRlcnNgIG9yXG4gKiBgRGlyZWN0aXZlLnByb3ZpZGVyc2AvYENvbXBvbmVudC52aWV3UHJvdmlkZXJzYCBhcmUgZGVjb3JhdGVkIHdpdGggb25lIG9mIHRoZSBgQEluamVjdGFibGVgLFxuICogYEBEaXJlY3RpdmVgLCBgQENvbXBvbmVudGAgb3IgYEBQaXBlYCBkZWNvcmF0b3JzLCBhZGRpbmcgYW4gYEBJbmplY3RhYmxlKClgIGRlY29yYXRvciB3aGVuIG5vbmVcbiAqIGFyZSBwcmVzZW50LlxuICpcbiAqIEF0IGxlYXN0IG9uZSBkZWNvcmF0b3IgaXMgbm93IG1hbmRhdG9yeSwgYXMgb3RoZXJ3aXNlIHRoZSBjb21waWxlciB3b3VsZCBub3QgY29tcGlsZSBhblxuICogaW5qZWN0YWJsZSBkZWZpbml0aW9uIGZvciB0aGUgc2VydmljZS4gVGhpcyBpcyB1bmxpa2UgVmlldyBFbmdpbmUsIHdoZXJlIGhhdmluZyBqdXN0IGFuIHVucmVsYXRlZFxuICogZGVjb3JhdG9yIG1heSBoYXZlIGJlZW4gc3VmZmljaWVudCBmb3IgdGhlIHNlcnZpY2UgdG8gYmVjb21lIGluamVjdGFibGUuXG4gKlxuICogSW4gZXNzZW5jZSwgdGhpcyBtaWdyYXRpb24gb3BlcmF0ZXMgb24gY2xhc3NlcyB0aGF0IGFyZSB0aGVtc2VsdmVzIGFuIE5nTW9kdWxlLCBEaXJlY3RpdmUgb3JcbiAqIENvbXBvbmVudC4gVGhlaXIgbWV0YWRhdGEgaXMgc3RhdGljYWxseSBldmFsdWF0ZWQgc28gdGhhdCB0aGVpciBcInByb3ZpZGVyc1wiL1widmlld1Byb3ZpZGVyc1wiXG4gKiBwcm9wZXJ0aWVzIGNhbiBiZSBhbmFseXplZC4gRm9yIGFueSBwcm92aWRlciB0aGF0IHJlZmVycyB0byBhbiB1bmRlY29yYXRlZCBjbGFzcywgdGhlIGNsYXNzIHdpbGxcbiAqIGJlIG1pZ3JhdGVkIHRvIGhhdmUgYW4gYEBJbmplY3RhYmxlKClgIGRlY29yYXRvci5cbiAqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIG1pcnJvcnMgdGhlIFwibWlzc2luZy1pbmplY3RhYmxlXCIgc2NoZW1hdGljLlxuICovXG5leHBvcnQgY2xhc3MgTWlzc2luZ0luamVjdGFibGVNaWdyYXRpb24gaW1wbGVtZW50cyBNaWdyYXRpb24ge1xuICBhcHBseShjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgaG9zdDogTWlncmF0aW9uSG9zdCk6IHRzLkRpYWdub3N0aWN8bnVsbCB7XG4gICAgY29uc3QgZGVjb3JhdG9ycyA9IGhvc3QucmVmbGVjdGlvbkhvc3QuZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24oY2xhenopO1xuICAgIGlmIChkZWNvcmF0b3JzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGRlY29yYXRvciBvZiBkZWNvcmF0b3JzKSB7XG4gICAgICBjb25zdCBuYW1lID0gZ2V0QW5ndWxhckNvcmVEZWNvcmF0b3JOYW1lKGRlY29yYXRvcik7XG4gICAgICBpZiAobmFtZSA9PT0gJ05nTW9kdWxlJykge1xuICAgICAgICBtaWdyYXRlTmdNb2R1bGVQcm92aWRlcnMoZGVjb3JhdG9yLCBob3N0KTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ0RpcmVjdGl2ZScpIHtcbiAgICAgICAgbWlncmF0ZURpcmVjdGl2ZVByb3ZpZGVycyhkZWNvcmF0b3IsIGhvc3QsIC8qIGlzQ29tcG9uZW50ICovIGZhbHNlKTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ0NvbXBvbmVudCcpIHtcbiAgICAgICAgbWlncmF0ZURpcmVjdGl2ZVByb3ZpZGVycyhkZWNvcmF0b3IsIGhvc3QsIC8qIGlzQ29tcG9uZW50ICovIHRydWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogSXRlcmF0ZXMgdGhyb3VnaCBhbGwgYE5nTW9kdWxlLnByb3ZpZGVyc2AgYW5kIGFkZHMgdGhlIGBASW5qZWN0YWJsZSgpYCBkZWNvcmF0b3IgdG8gYW55IHByb3ZpZGVyXG4gKiB0aGF0IGlzIG5vdCBvdGhlcndpc2UgZGVjb3JhdGVkLlxuICovXG5mdW5jdGlvbiBtaWdyYXRlTmdNb2R1bGVQcm92aWRlcnMoZGVjb3JhdG9yOiBEZWNvcmF0b3IsIGhvc3Q6IE1pZ3JhdGlvbkhvc3QpOiB2b2lkIHtcbiAgaWYgKGRlY29yYXRvci5hcmdzID09PSBudWxsIHx8IGRlY29yYXRvci5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1ldGFkYXRhID0gaG9zdC5ldmFsdWF0b3IuZXZhbHVhdGUoZGVjb3JhdG9yLmFyZ3NbMF0sIGZvcndhcmRSZWZSZXNvbHZlcik7XG4gIGlmICghKG1ldGFkYXRhIGluc3RhbmNlb2YgTWFwKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG1pZ3JhdGVQcm92aWRlcnMobWV0YWRhdGEsICdwcm92aWRlcnMnLCBob3N0KTtcbiAgLy8gVE9ETyhhbHhodWIpOiB3ZSBzaG91bGQgcHJvYmFibHkgYWxzbyBjaGVjayBmb3IgYE1vZHVsZVdpdGhQcm92aWRlcnNgIGhlcmUuXG59XG5cbi8qKlxuICogSXRlcmF0ZXMgdGhyb3VnaCBhbGwgYERpcmVjdGl2ZS5wcm92aWRlcnNgIGFuZCBpZiBgaXNDb21wb25lbnRgIGlzIHNldCB0byB0cnVlIGFsc29cbiAqIGBDb21wb25lbnQudmlld1Byb3ZpZGVyc2AgYW5kIGFkZHMgdGhlIGBASW5qZWN0YWJsZSgpYCBkZWNvcmF0b3IgdG8gYW55IHByb3ZpZGVyIHRoYXQgaXMgbm90XG4gKiBvdGhlcndpc2UgZGVjb3JhdGVkLlxuICovXG5mdW5jdGlvbiBtaWdyYXRlRGlyZWN0aXZlUHJvdmlkZXJzKFxuICAgIGRlY29yYXRvcjogRGVjb3JhdG9yLCBob3N0OiBNaWdyYXRpb25Ib3N0LCBpc0NvbXBvbmVudDogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoZGVjb3JhdG9yLmFyZ3MgPT09IG51bGwgfHwgZGVjb3JhdG9yLmFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgbWV0YWRhdGEgPSBob3N0LmV2YWx1YXRvci5ldmFsdWF0ZShkZWNvcmF0b3IuYXJnc1swXSwgZm9yd2FyZFJlZlJlc29sdmVyKTtcbiAgaWYgKCEobWV0YWRhdGEgaW5zdGFuY2VvZiBNYXApKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbWlncmF0ZVByb3ZpZGVycyhtZXRhZGF0YSwgJ3Byb3ZpZGVycycsIGhvc3QpO1xuICBpZiAoaXNDb21wb25lbnQpIHtcbiAgICBtaWdyYXRlUHJvdmlkZXJzKG1ldGFkYXRhLCAndmlld1Byb3ZpZGVycycsIGhvc3QpO1xuICB9XG59XG5cbi8qKlxuICogR2l2ZW4gYW4gb2JqZWN0IHdpdGggZGVjb3JhdG9yIG1ldGFkYXRhLCBpdGVyYXRlcyB0aHJvdWdoIHRoZSBsaXN0IG9mIHByb3ZpZGVycyB0byBhZGRcbiAqIGBASW5qZWN0YWJsZSgpYCB0byBhbnkgcHJvdmlkZXIgdGhhdCBpcyBub3Qgb3RoZXJ3aXNlIGRlY29yYXRlZC5cbiAqL1xuZnVuY3Rpb24gbWlncmF0ZVByb3ZpZGVycyhtZXRhZGF0YTogUmVzb2x2ZWRWYWx1ZU1hcCwgZmllbGQ6IHN0cmluZywgaG9zdDogTWlncmF0aW9uSG9zdCk6IHZvaWQge1xuICBpZiAoIW1ldGFkYXRhLmhhcyhmaWVsZCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcHJvdmlkZXJzID0gbWV0YWRhdGEuZ2V0KGZpZWxkKSE7XG4gIGlmICghQXJyYXkuaXNBcnJheShwcm92aWRlcnMpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yIChjb25zdCBwcm92aWRlciBvZiBwcm92aWRlcnMpIHtcbiAgICBtaWdyYXRlUHJvdmlkZXIocHJvdmlkZXIsIGhvc3QpO1xuICB9XG59XG5cbi8qKlxuICogQW5hbHl6ZXMgYSBzaW5nbGUgcHJvdmlkZXIgZW50cnkgYW5kIGRldGVybWluZXMgdGhlIGNsYXNzIHRoYXQgaXMgcmVxdWlyZWQgdG8gaGF2ZSBhblxuICogYEBJbmplY3RhYmxlKClgIGRlY29yYXRvci5cbiAqL1xuZnVuY3Rpb24gbWlncmF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBSZXNvbHZlZFZhbHVlLCBob3N0OiBNaWdyYXRpb25Ib3N0KTogdm9pZCB7XG4gIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIE1hcCkge1xuICAgIGlmICghcHJvdmlkZXIuaGFzKCdwcm92aWRlJykgfHwgcHJvdmlkZXIuaGFzKCd1c2VWYWx1ZScpIHx8IHByb3ZpZGVyLmhhcygndXNlRmFjdG9yeScpIHx8XG4gICAgICAgIHByb3ZpZGVyLmhhcygndXNlRXhpc3RpbmcnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAocHJvdmlkZXIuaGFzKCd1c2VDbGFzcycpKSB7XG4gICAgICAvLyB7cHJvdmlkZTogLi4uLCB1c2VDbGFzczogU29tZUNsYXNzLCBkZXBzOiBbLi4uXX0gZG9lcyBub3QgcmVxdWlyZSBhIGRlY29yYXRvciBvbiBTb21lQ2xhc3MsXG4gICAgICAvLyBhcyB0aGUgcHJvdmlkZXIgaXRzZWxmIGNvbmZpZ3VyZXMgJ2RlcHMnLiBPbmx5IGlmICdkZXBzJyBpcyBtaXNzaW5nIHdpbGwgdGhpcyByZXF1aXJlIGFcbiAgICAgIC8vIGZhY3RvcnkgdG8gZXhpc3Qgb24gU29tZUNsYXNzLlxuICAgICAgaWYgKCFwcm92aWRlci5oYXMoJ2RlcHMnKSkge1xuICAgICAgICBtaWdyYXRlUHJvdmlkZXJDbGFzcyhwcm92aWRlci5nZXQoJ3VzZUNsYXNzJykhLCBob3N0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWlncmF0ZVByb3ZpZGVyQ2xhc3MocHJvdmlkZXIuZ2V0KCdwcm92aWRlJykhLCBob3N0KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwcm92aWRlcikpIHtcbiAgICBmb3IgKGNvbnN0IHYgb2YgcHJvdmlkZXIpIHtcbiAgICAgIG1pZ3JhdGVQcm92aWRlcih2LCBob3N0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbWlncmF0ZVByb3ZpZGVyQ2xhc3MocHJvdmlkZXIsIGhvc3QpO1xuICB9XG59XG5cbi8qKlxuICogR2l2ZW4gYSBwcm92aWRlciBjbGFzcywgYWRkcyB0aGUgYEBJbmplY3RhYmxlKClgIGRlY29yYXRvciBpZiBubyBvdGhlciByZWxldmFudCBBbmd1bGFyIGRlY29yYXRvclxuICogaXMgcHJlc2VudCBvbiB0aGUgY2xhc3MuXG4gKi9cbmZ1bmN0aW9uIG1pZ3JhdGVQcm92aWRlckNsYXNzKHByb3ZpZGVyOiBSZXNvbHZlZFZhbHVlLCBob3N0OiBNaWdyYXRpb25Ib3N0KTogdm9pZCB7XG4gIC8vIFByb3ZpZGVycyB0aGF0IGRvIG5vdCByZWZlciB0byBhIGNsYXNzIGNhbm5vdCBiZSBtaWdyYXRlZC5cbiAgaWYgKCEocHJvdmlkZXIgaW5zdGFuY2VvZiBSZWZlcmVuY2UpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgY2xhenogPSBwcm92aWRlci5ub2RlO1xuICBpZiAoaXNDbGFzc0RlY2xhcmF0aW9uKGNsYXp6KSAmJiBob3N0LmlzSW5TY29wZShjbGF6eikgJiYgbmVlZHNJbmplY3RhYmxlRGVjb3JhdG9yKGNsYXp6LCBob3N0KSkge1xuICAgIGhvc3QuaW5qZWN0U3ludGhldGljRGVjb3JhdG9yKGNsYXp6LCBjcmVhdGVJbmplY3RhYmxlRGVjb3JhdG9yKGNsYXp6KSk7XG4gIH1cbn1cblxuY29uc3QgTk9fTUlHUkFURV9ERUNPUkFUT1JTID0gbmV3IFNldChbJ0luamVjdGFibGUnLCAnRGlyZWN0aXZlJywgJ0NvbXBvbmVudCcsICdQaXBlJ10pO1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIGdpdmVuIGNsYXNzIG5lZWRzIHRvIGJlIGRlY29yYXRlZCB3aXRoIGBASW5qZWN0YWJsZSgpYCBiYXNlZCBvbiB3aGV0aGVyIGl0XG4gKiBhbHJlYWR5IGhhcyBhbiBBbmd1bGFyIGRlY29yYXRvciBhcHBsaWVkLlxuICovXG5mdW5jdGlvbiBuZWVkc0luamVjdGFibGVEZWNvcmF0b3IoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGhvc3Q6IE1pZ3JhdGlvbkhvc3QpOiBib29sZWFuIHtcbiAgY29uc3QgZGVjb3JhdG9ycyA9IGhvc3QuZ2V0QWxsRGVjb3JhdG9ycyhjbGF6eik7XG4gIGlmIChkZWNvcmF0b3JzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmb3IgKGNvbnN0IGRlY29yYXRvciBvZiBkZWNvcmF0b3JzKSB7XG4gICAgY29uc3QgbmFtZSA9IGdldEFuZ3VsYXJDb3JlRGVjb3JhdG9yTmFtZShkZWNvcmF0b3IpO1xuICAgIGlmIChuYW1lICE9PSBudWxsICYmIE5PX01JR1JBVEVfREVDT1JBVE9SUy5oYXMobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBvcmlnaW5hbCBuYW1lIG9mIGEgZGVjb3JhdG9yIGlmIGl0IGlzIGZyb20gJ0Bhbmd1bGFyL2NvcmUnLiBGb3Igb3RoZXIgZGVjb3JhdG9ycyxcbiAqIG51bGwgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmd1bGFyQ29yZURlY29yYXRvck5hbWUoZGVjb3JhdG9yOiBEZWNvcmF0b3IpOiBzdHJpbmd8bnVsbCB7XG4gIGlmIChkZWNvcmF0b3IuaW1wb3J0ID09PSBudWxsIHx8IGRlY29yYXRvci5pbXBvcnQuZnJvbSAhPT0gJ0Bhbmd1bGFyL2NvcmUnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZGVjb3JhdG9yLmltcG9ydC5uYW1lO1xufVxuIl19
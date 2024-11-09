/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilerConfig } from '@angular/compiler';
import { Compiler, Injector, ViewEncapsulation } from '@angular/core';
export const COMPILER_PROVIDERS = [{ provide: Compiler, useFactory: () => new Compiler() }];
/**
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 * See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for
 * additional context.
 */
export class JitCompilerFactory {
    /** @internal */
    constructor(defaultOptions) {
        const compilerOptions = {
            defaultEncapsulation: ViewEncapsulation.Emulated,
        };
        this._defaultOptions = [compilerOptions, ...defaultOptions];
    }
    createCompiler(options = []) {
        const opts = _mergeOptions(this._defaultOptions.concat(options));
        const injector = Injector.create({
            providers: [
                COMPILER_PROVIDERS, {
                    provide: CompilerConfig,
                    useFactory: () => {
                        return new CompilerConfig({
                            defaultEncapsulation: opts.defaultEncapsulation,
                            preserveWhitespaces: opts.preserveWhitespaces,
                        });
                    },
                    deps: []
                },
                opts.providers
            ]
        });
        return injector.get(Compiler);
    }
}
function _mergeOptions(optionsArr) {
    return {
        defaultEncapsulation: _lastDefined(optionsArr.map(options => options.defaultEncapsulation)),
        providers: _mergeArrays(optionsArr.map(options => options.providers)),
        preserveWhitespaces: _lastDefined(optionsArr.map(options => options.preserveWhitespaces)),
    };
}
function _lastDefined(args) {
    for (let i = args.length - 1; i >= 0; i--) {
        if (args[i] !== undefined) {
            return args[i];
        }
    }
    return undefined;
}
function _mergeArrays(parts) {
    const result = [];
    parts.forEach((part) => part && result.push(...part));
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYy9zcmMvY29tcGlsZXJfZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBb0MsUUFBUSxFQUFrQixpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV0SCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FDVCxDQUFDLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUM7QUFDOUU7Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxrQkFBa0I7SUFHN0IsZ0JBQWdCO0lBQ2hCLFlBQVksY0FBaUM7UUFDM0MsTUFBTSxlQUFlLEdBQW9CO1lBQ3ZDLG9CQUFvQixFQUFFLGlCQUFpQixDQUFDLFFBQVE7U0FDakQsQ0FBQztRQUVGLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxlQUFlLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsY0FBYyxDQUFDLFVBQTZCLEVBQUU7UUFDNUMsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDakUsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMvQixTQUFTLEVBQUU7Z0JBQ1Qsa0JBQWtCLEVBQUU7b0JBQ2xCLE9BQU8sRUFBRSxjQUFjO29CQUN2QixVQUFVLEVBQUUsR0FBRyxFQUFFO3dCQUNmLE9BQU8sSUFBSSxjQUFjLENBQUM7NEJBQ3hCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7NEJBQy9DLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUI7eUJBQzlDLENBQUMsQ0FBQztvQkFDTCxDQUFDO29CQUNELElBQUksRUFBRSxFQUFFO2lCQUNUO2dCQUNELElBQUksQ0FBQyxTQUFVO2FBQ2hCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FDRjtBQUVELFNBQVMsYUFBYSxDQUFDLFVBQTZCO0lBQ2xELE9BQU87UUFDTCxvQkFBb0IsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNGLFNBQVMsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFVLENBQUMsQ0FBQztRQUN0RSxtQkFBbUIsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzFGLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUksSUFBUztJQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMxQixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFjO0lBQ2xDLE1BQU0sTUFBTSxHQUFVLEVBQUUsQ0FBQztJQUN6QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVyQ29uZmlnfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlckZhY3RvcnksIENvbXBpbGVyT3B0aW9ucywgSW5qZWN0b3IsIFN0YXRpY1Byb3ZpZGVyLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBjb25zdCBDT01QSUxFUl9QUk9WSURFUlMgPVxuICAgIDxTdGF0aWNQcm92aWRlcltdPlt7cHJvdmlkZTogQ29tcGlsZXIsIHVzZUZhY3Rvcnk6ICgpID0+IG5ldyBDb21waWxlcigpfV07XG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZFxuICogSXZ5IEpJVCBtb2RlIGRvZXNuJ3QgcmVxdWlyZSBhY2Nlc3NpbmcgdGhpcyBzeW1ib2wuXG4gKiBTZWUgW0pJVCBBUEkgY2hhbmdlcyBkdWUgdG8gVmlld0VuZ2luZSBkZXByZWNhdGlvbl0oZ3VpZGUvZGVwcmVjYXRpb25zI2ppdC1hcGktY2hhbmdlcykgZm9yXG4gKiBhZGRpdGlvbmFsIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBjbGFzcyBKaXRDb21waWxlckZhY3RvcnkgaW1wbGVtZW50cyBDb21waWxlckZhY3Rvcnkge1xuICBwcml2YXRlIF9kZWZhdWx0T3B0aW9uczogQ29tcGlsZXJPcHRpb25zW107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RvcihkZWZhdWx0T3B0aW9uczogQ29tcGlsZXJPcHRpb25zW10pIHtcbiAgICBjb25zdCBjb21waWxlck9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyA9IHtcbiAgICAgIGRlZmF1bHRFbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCxcbiAgICB9O1xuXG4gICAgdGhpcy5fZGVmYXVsdE9wdGlvbnMgPSBbY29tcGlsZXJPcHRpb25zLCAuLi5kZWZhdWx0T3B0aW9uc107XG4gIH1cblxuICBjcmVhdGVDb21waWxlcihvcHRpb25zOiBDb21waWxlck9wdGlvbnNbXSA9IFtdKTogQ29tcGlsZXIge1xuICAgIGNvbnN0IG9wdHMgPSBfbWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLmNvbmNhdChvcHRpb25zKSk7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIENPTVBJTEVSX1BST1ZJREVSUywge1xuICAgICAgICAgIHByb3ZpZGU6IENvbXBpbGVyQ29uZmlnLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcGlsZXJDb25maWcoe1xuICAgICAgICAgICAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogb3B0cy5kZWZhdWx0RW5jYXBzdWxhdGlvbixcbiAgICAgICAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogb3B0cy5wcmVzZXJ2ZVdoaXRlc3BhY2VzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBkZXBzOiBbXVxuICAgICAgICB9LFxuICAgICAgICBvcHRzLnByb3ZpZGVycyFcbiAgICAgIF1cbiAgICB9KTtcbiAgICByZXR1cm4gaW5qZWN0b3IuZ2V0KENvbXBpbGVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfbWVyZ2VPcHRpb25zKG9wdGlvbnNBcnI6IENvbXBpbGVyT3B0aW9uc1tdKTogQ29tcGlsZXJPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5kZWZhdWx0RW5jYXBzdWxhdGlvbikpLFxuICAgIHByb3ZpZGVyczogX21lcmdlQXJyYXlzKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5wcm92aWRlcnMhKSksXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlczogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5wcmVzZXJ2ZVdoaXRlc3BhY2VzKSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9sYXN0RGVmaW5lZDxUPihhcmdzOiBUW10pOiBUfHVuZGVmaW5lZCB7XG4gIGZvciAobGV0IGkgPSBhcmdzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGFyZ3NbaV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGFyZ3NbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIF9tZXJnZUFycmF5cyhwYXJ0czogYW55W11bXSk6IGFueVtdIHtcbiAgY29uc3QgcmVzdWx0OiBhbnlbXSA9IFtdO1xuICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiBwYXJ0ICYmIHJlc3VsdC5wdXNoKC4uLnBhcnQpKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==
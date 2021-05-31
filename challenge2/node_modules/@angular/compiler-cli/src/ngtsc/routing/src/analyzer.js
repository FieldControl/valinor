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
        define("@angular/compiler-cli/src/ngtsc/routing/src/analyzer", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/routing/src/lazy", "@angular/compiler-cli/src/ngtsc/routing/src/route"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgModuleRouteAnalyzer = void 0;
    var tslib_1 = require("tslib");
    var lazy_1 = require("@angular/compiler-cli/src/ngtsc/routing/src/lazy");
    var route_1 = require("@angular/compiler-cli/src/ngtsc/routing/src/route");
    var NgModuleRouteAnalyzer = /** @class */ (function () {
        function NgModuleRouteAnalyzer(moduleResolver, evaluator) {
            this.evaluator = evaluator;
            this.modules = new Map();
            this.entryPointManager = new route_1.RouterEntryPointManager(moduleResolver);
        }
        NgModuleRouteAnalyzer.prototype.add = function (sourceFile, moduleName, imports, exports, providers) {
            var key = route_1.entryPointKeyFor(sourceFile.fileName, moduleName);
            if (this.modules.has(key)) {
                throw new Error("Double route analyzing for '" + key + "'.");
            }
            this.modules.set(key, {
                sourceFile: sourceFile,
                moduleName: moduleName,
                imports: imports,
                exports: exports,
                providers: providers,
            });
        };
        NgModuleRouteAnalyzer.prototype.listLazyRoutes = function (entryModuleKey) {
            var _this = this;
            if ((entryModuleKey !== undefined) && !this.modules.has(entryModuleKey)) {
                throw new Error("Failed to list lazy routes: Unknown module '" + entryModuleKey + "'.");
            }
            var routes = [];
            var scannedModuleKeys = new Set();
            var pendingModuleKeys = entryModuleKey ? [entryModuleKey] : Array.from(this.modules.keys());
            // When listing lazy routes for a specific entry module, we need to recursively extract
            // "transitive" routes from imported/exported modules. This is not necessary when listing all
            // lazy routes, because all analyzed modules will be scanned anyway.
            var scanRecursively = entryModuleKey !== undefined;
            while (pendingModuleKeys.length > 0) {
                var key = pendingModuleKeys.pop();
                if (scannedModuleKeys.has(key)) {
                    continue;
                }
                else {
                    scannedModuleKeys.add(key);
                }
                var data = this.modules.get(key);
                var entryPoints = lazy_1.scanForRouteEntryPoints(data.sourceFile, data.moduleName, data, this.entryPointManager, this.evaluator);
                routes.push.apply(routes, tslib_1.__spreadArray([], tslib_1.__read(entryPoints.map(function (entryPoint) { return ({
                    route: entryPoint.loadChildren,
                    module: entryPoint.from,
                    referencedModule: entryPoint.resolvedTo,
                }); }))));
                if (scanRecursively) {
                    pendingModuleKeys.push.apply(pendingModuleKeys, tslib_1.__spreadArray([], tslib_1.__read(tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(entryPoints.map(function (_a) {
                        var resolvedTo = _a.resolvedTo;
                        return route_1.entryPointKeyFor(resolvedTo.filePath, resolvedTo.moduleName);
                    }))), tslib_1.__read(lazy_1.scanForCandidateTransitiveModules(data.imports, this.evaluator))), tslib_1.__read(lazy_1.scanForCandidateTransitiveModules(data.exports, this.evaluator))).filter(function (key) { return _this.modules.has(key); }))));
                }
            }
            return routes;
        };
        return NgModuleRouteAnalyzer;
    }());
    exports.NgModuleRouteAnalyzer = NgModuleRouteAnalyzer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3JvdXRpbmcvc3JjL2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFPSCx5RUFBa0Y7SUFDbEYsMkVBQWtFO0lBZ0JsRTtRQUlFLCtCQUFZLGNBQThCLEVBQVUsU0FBMkI7WUFBM0IsY0FBUyxHQUFULFNBQVMsQ0FBa0I7WUFIdkUsWUFBTyxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBSXhELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLCtCQUF1QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxtQ0FBRyxHQUFILFVBQUksVUFBeUIsRUFBRSxVQUFrQixFQUFFLE9BQTJCLEVBQzFFLE9BQTJCLEVBQUUsU0FBNkI7WUFDNUQsSUFBTSxHQUFHLEdBQUcsd0JBQWdCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLGlDQUErQixHQUFHLE9BQUksQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUNwQixVQUFVLFlBQUE7Z0JBQ1YsVUFBVSxZQUFBO2dCQUNWLE9BQU8sU0FBQTtnQkFDUCxPQUFPLFNBQUE7Z0JBQ1AsU0FBUyxXQUFBO2FBQ1YsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELDhDQUFjLEdBQWQsVUFBZSxjQUFpQztZQUFoRCxpQkFnREM7WUEvQ0MsSUFBSSxDQUFDLGNBQWMsS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUN2RSxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUErQyxjQUFjLE9BQUksQ0FBQyxDQUFDO2FBQ3BGO1lBRUQsSUFBTSxNQUFNLEdBQWdCLEVBQUUsQ0FBQztZQUMvQixJQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFDNUMsSUFBTSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTlGLHVGQUF1RjtZQUN2Riw2RkFBNkY7WUFDN0Ysb0VBQW9FO1lBQ3BFLElBQU0sZUFBZSxHQUFHLGNBQWMsS0FBSyxTQUFTLENBQUM7WUFFckQsT0FBTyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQyxJQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUcsQ0FBQztnQkFFckMsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzlCLFNBQVM7aUJBQ1Y7cUJBQU07b0JBQ0wsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QjtnQkFFRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQztnQkFDcEMsSUFBTSxXQUFXLEdBQUcsOEJBQXVCLENBQ3ZDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFcEYsTUFBTSxDQUFDLElBQUksT0FBWCxNQUFNLDJDQUFTLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxDQUFDO29CQUNiLEtBQUssRUFBRSxVQUFVLENBQUMsWUFBWTtvQkFDOUIsTUFBTSxFQUFFLFVBQVUsQ0FBQyxJQUFJO29CQUN2QixnQkFBZ0IsRUFBRSxVQUFVLENBQUMsVUFBVTtpQkFDeEMsQ0FBQyxFQUpZLENBSVosQ0FBQyxJQUFFO2dCQUVwQyxJQUFJLGVBQWUsRUFBRTtvQkFDbkIsaUJBQWlCLENBQUMsSUFBSSxPQUF0QixpQkFBaUIsMkNBQ1YscUZBRUksV0FBVyxDQUFDLEdBQUcsQ0FDZCxVQUFDLEVBQVk7NEJBQVgsVUFBVSxnQkFBQTt3QkFBTSxPQUFBLHdCQUFnQixDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQztvQkFBNUQsQ0FBNEQsQ0FBQyxtQkFFaEYsd0NBQWlDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUUvRCx3Q0FBaUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FDeEUsTUFBTSxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQXJCLENBQXFCLENBQUMsSUFBRTtpQkFDekM7YUFDRjtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFDSCw0QkFBQztJQUFELENBQUMsQUF4RUQsSUF3RUM7SUF4RVksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge01vZHVsZVJlc29sdmVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7UGFydGlhbEV2YWx1YXRvcn0gZnJvbSAnLi4vLi4vcGFydGlhbF9ldmFsdWF0b3InO1xuXG5pbXBvcnQge3NjYW5Gb3JDYW5kaWRhdGVUcmFuc2l0aXZlTW9kdWxlcywgc2NhbkZvclJvdXRlRW50cnlQb2ludHN9IGZyb20gJy4vbGF6eSc7XG5pbXBvcnQge2VudHJ5UG9pbnRLZXlGb3IsIFJvdXRlckVudHJ5UG9pbnRNYW5hZ2VyfSBmcm9tICcuL3JvdXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBOZ01vZHVsZVJhd1JvdXRlRGF0YSB7XG4gIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGU7XG4gIG1vZHVsZU5hbWU6IHN0cmluZztcbiAgaW1wb3J0czogdHMuRXhwcmVzc2lvbnxudWxsO1xuICBleHBvcnRzOiB0cy5FeHByZXNzaW9ufG51bGw7XG4gIHByb3ZpZGVyczogdHMuRXhwcmVzc2lvbnxudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhenlSb3V0ZSB7XG4gIHJvdXRlOiBzdHJpbmc7XG4gIG1vZHVsZToge25hbWU6IHN0cmluZywgZmlsZVBhdGg6IHN0cmluZ307XG4gIHJlZmVyZW5jZWRNb2R1bGU6IHtuYW1lOiBzdHJpbmcsIGZpbGVQYXRoOiBzdHJpbmd9O1xufVxuXG5leHBvcnQgY2xhc3MgTmdNb2R1bGVSb3V0ZUFuYWx5emVyIHtcbiAgcHJpdmF0ZSBtb2R1bGVzID0gbmV3IE1hcDxzdHJpbmcsIE5nTW9kdWxlUmF3Um91dGVEYXRhPigpO1xuICBwcml2YXRlIGVudHJ5UG9pbnRNYW5hZ2VyOiBSb3V0ZXJFbnRyeVBvaW50TWFuYWdlcjtcblxuICBjb25zdHJ1Y3Rvcihtb2R1bGVSZXNvbHZlcjogTW9kdWxlUmVzb2x2ZXIsIHByaXZhdGUgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yKSB7XG4gICAgdGhpcy5lbnRyeVBvaW50TWFuYWdlciA9IG5ldyBSb3V0ZXJFbnRyeVBvaW50TWFuYWdlcihtb2R1bGVSZXNvbHZlcik7XG4gIH1cblxuICBhZGQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbW9kdWxlTmFtZTogc3RyaW5nLCBpbXBvcnRzOiB0cy5FeHByZXNzaW9ufG51bGwsXG4gICAgICBleHBvcnRzOiB0cy5FeHByZXNzaW9ufG51bGwsIHByb3ZpZGVyczogdHMuRXhwcmVzc2lvbnxudWxsKTogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gZW50cnlQb2ludEtleUZvcihzb3VyY2VGaWxlLmZpbGVOYW1lLCBtb2R1bGVOYW1lKTtcbiAgICBpZiAodGhpcy5tb2R1bGVzLmhhcyhrZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERvdWJsZSByb3V0ZSBhbmFseXppbmcgZm9yICcke2tleX0nLmApO1xuICAgIH1cbiAgICB0aGlzLm1vZHVsZXMuc2V0KGtleSwge1xuICAgICAgc291cmNlRmlsZSxcbiAgICAgIG1vZHVsZU5hbWUsXG4gICAgICBpbXBvcnRzLFxuICAgICAgZXhwb3J0cyxcbiAgICAgIHByb3ZpZGVycyxcbiAgICB9KTtcbiAgfVxuXG4gIGxpc3RMYXp5Um91dGVzKGVudHJ5TW9kdWxlS2V5Pzogc3RyaW5nfHVuZGVmaW5lZCk6IExhenlSb3V0ZVtdIHtcbiAgICBpZiAoKGVudHJ5TW9kdWxlS2V5ICE9PSB1bmRlZmluZWQpICYmICF0aGlzLm1vZHVsZXMuaGFzKGVudHJ5TW9kdWxlS2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gbGlzdCBsYXp5IHJvdXRlczogVW5rbm93biBtb2R1bGUgJyR7ZW50cnlNb2R1bGVLZXl9Jy5gKTtcbiAgICB9XG5cbiAgICBjb25zdCByb3V0ZXM6IExhenlSb3V0ZVtdID0gW107XG4gICAgY29uc3Qgc2Nhbm5lZE1vZHVsZUtleXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBwZW5kaW5nTW9kdWxlS2V5cyA9IGVudHJ5TW9kdWxlS2V5ID8gW2VudHJ5TW9kdWxlS2V5XSA6IEFycmF5LmZyb20odGhpcy5tb2R1bGVzLmtleXMoKSk7XG5cbiAgICAvLyBXaGVuIGxpc3RpbmcgbGF6eSByb3V0ZXMgZm9yIGEgc3BlY2lmaWMgZW50cnkgbW9kdWxlLCB3ZSBuZWVkIHRvIHJlY3Vyc2l2ZWx5IGV4dHJhY3RcbiAgICAvLyBcInRyYW5zaXRpdmVcIiByb3V0ZXMgZnJvbSBpbXBvcnRlZC9leHBvcnRlZCBtb2R1bGVzLiBUaGlzIGlzIG5vdCBuZWNlc3Nhcnkgd2hlbiBsaXN0aW5nIGFsbFxuICAgIC8vIGxhenkgcm91dGVzLCBiZWNhdXNlIGFsbCBhbmFseXplZCBtb2R1bGVzIHdpbGwgYmUgc2Nhbm5lZCBhbnl3YXkuXG4gICAgY29uc3Qgc2NhblJlY3Vyc2l2ZWx5ID0gZW50cnlNb2R1bGVLZXkgIT09IHVuZGVmaW5lZDtcblxuICAgIHdoaWxlIChwZW5kaW5nTW9kdWxlS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBrZXkgPSBwZW5kaW5nTW9kdWxlS2V5cy5wb3AoKSE7XG5cbiAgICAgIGlmIChzY2FubmVkTW9kdWxlS2V5cy5oYXMoa2V5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYW5uZWRNb2R1bGVLZXlzLmFkZChrZXkpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gdGhpcy5tb2R1bGVzLmdldChrZXkpITtcbiAgICAgIGNvbnN0IGVudHJ5UG9pbnRzID0gc2NhbkZvclJvdXRlRW50cnlQb2ludHMoXG4gICAgICAgICAgZGF0YS5zb3VyY2VGaWxlLCBkYXRhLm1vZHVsZU5hbWUsIGRhdGEsIHRoaXMuZW50cnlQb2ludE1hbmFnZXIsIHRoaXMuZXZhbHVhdG9yKTtcblxuICAgICAgcm91dGVzLnB1c2goLi4uZW50cnlQb2ludHMubWFwKGVudHJ5UG9pbnQgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlOiBlbnRyeVBvaW50LmxvYWRDaGlsZHJlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZTogZW50cnlQb2ludC5mcm9tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZE1vZHVsZTogZW50cnlQb2ludC5yZXNvbHZlZFRvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG5cbiAgICAgIGlmIChzY2FuUmVjdXJzaXZlbHkpIHtcbiAgICAgICAgcGVuZGluZ01vZHVsZUtleXMucHVzaChcbiAgICAgICAgICAgIC4uLltcbiAgICAgICAgICAgICAgICAvLyBTY2FuIHRoZSByZXRyaWV2ZWQgbGF6eSByb3V0ZSBlbnRyeSBwb2ludHMuXG4gICAgICAgICAgICAgICAgLi4uZW50cnlQb2ludHMubWFwKFxuICAgICAgICAgICAgICAgICAgICAoe3Jlc29sdmVkVG99KSA9PiBlbnRyeVBvaW50S2V5Rm9yKHJlc29sdmVkVG8uZmlsZVBhdGgsIHJlc29sdmVkVG8ubW9kdWxlTmFtZSkpLFxuICAgICAgICAgICAgICAgIC8vIFNjYW4gdGhlIGN1cnJlbnQgbW9kdWxlJ3MgaW1wb3J0ZWQgbW9kdWxlcy5cbiAgICAgICAgICAgICAgICAuLi5zY2FuRm9yQ2FuZGlkYXRlVHJhbnNpdGl2ZU1vZHVsZXMoZGF0YS5pbXBvcnRzLCB0aGlzLmV2YWx1YXRvciksXG4gICAgICAgICAgICAgICAgLy8gU2NhbiB0aGUgY3VycmVudCBtb2R1bGUncyBleHBvcnRlZCBtb2R1bGVzLlxuICAgICAgICAgICAgICAgIC4uLnNjYW5Gb3JDYW5kaWRhdGVUcmFuc2l0aXZlTW9kdWxlcyhkYXRhLmV4cG9ydHMsIHRoaXMuZXZhbHVhdG9yKSxcbiAgICAgICAgXS5maWx0ZXIoa2V5ID0+IHRoaXMubW9kdWxlcy5oYXMoa2V5KSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByb3V0ZXM7XG4gIH1cbn1cbiJdfQ==
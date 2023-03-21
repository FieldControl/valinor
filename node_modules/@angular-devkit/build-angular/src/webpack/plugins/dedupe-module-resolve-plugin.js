"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DedupeModuleResolvePlugin = void 0;
const webpack_diagnostics_1 = require("../../utils/webpack-diagnostics");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getResourceData(resolveData) {
    const { descriptionFileData, relativePath } = resolveData.createData.resourceResolveData;
    return {
        packageName: descriptionFileData === null || descriptionFileData === void 0 ? void 0 : descriptionFileData.name,
        packageVersion: descriptionFileData === null || descriptionFileData === void 0 ? void 0 : descriptionFileData.version,
        relativePath,
        resource: resolveData.createData.resource,
    };
}
/**
 * DedupeModuleResolvePlugin is a webpack plugin which dedupes modules with the same name and versions
 * that are laid out in different parts of the node_modules tree.
 *
 * This is needed because Webpack relies on package managers to hoist modules and doesn't have any deduping logic.
 *
 * This is similar to how Webpack's 'NormalModuleReplacementPlugin' works
 * @see https://github.com/webpack/webpack/blob/4a1f068828c2ab47537d8be30d542cd3a1076db4/lib/NormalModuleReplacementPlugin.js#L9
 */
class DedupeModuleResolvePlugin {
    constructor(options) {
        this.options = options;
        this.modules = new Map();
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('DedupeModuleResolvePlugin', (compilation, { normalModuleFactory }) => {
            normalModuleFactory.hooks.afterResolve.tap('DedupeModuleResolvePlugin', (result) => {
                var _a;
                if (!result) {
                    return;
                }
                const { packageName, packageVersion, relativePath, resource } = getResourceData(result);
                // Empty name or versions are no valid primary  entrypoints of a library
                if (!packageName || !packageVersion) {
                    return;
                }
                const moduleId = packageName + '@' + packageVersion + ':' + relativePath;
                const prevResolvedModule = this.modules.get(moduleId);
                if (!prevResolvedModule) {
                    // This is the first time we visit this module.
                    this.modules.set(moduleId, {
                        resource,
                        request: result.request,
                    });
                    return;
                }
                const { resource: prevResource, request: prevRequest } = prevResolvedModule;
                if (resource === prevResource) {
                    // No deduping needed.
                    // Current path and previously resolved path are the same.
                    return;
                }
                if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.verbose) {
                    (0, webpack_diagnostics_1.addWarning)(compilation, `[DedupeModuleResolvePlugin]: ${resource} -> ${prevResource}`);
                }
                // Alter current request with previously resolved module.
                const createData = result.createData;
                createData.resource = prevResource;
                createData.userRequest = prevRequest;
            });
        });
    }
}
exports.DedupeModuleResolvePlugin = DedupeModuleResolvePlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLW1vZHVsZS1yZXNvbHZlLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3dlYnBhY2svcGx1Z2lucy9kZWR1cGUtbW9kdWxlLXJlc29sdmUtcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILHlFQUE2RDtBQWE3RCw4REFBOEQ7QUFDOUQsU0FBUyxlQUFlLENBQUMsV0FBZ0I7SUFDdkMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBRSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUM7SUFFekYsT0FBTztRQUNMLFdBQVcsRUFBRSxtQkFBbUIsYUFBbkIsbUJBQW1CLHVCQUFuQixtQkFBbUIsQ0FBRSxJQUFJO1FBQ3RDLGNBQWMsRUFBRSxtQkFBbUIsYUFBbkIsbUJBQW1CLHVCQUFuQixtQkFBbUIsQ0FBRSxPQUFPO1FBQzVDLFlBQVk7UUFDWixRQUFRLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRO0tBQzFDLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFhLHlCQUF5QjtJQUdwQyxZQUFvQixPQUEwQztRQUExQyxZQUFPLEdBQVAsT0FBTyxDQUFtQztRQUY5RCxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQWlELENBQUM7SUFFRixDQUFDO0lBRWxFLEtBQUssQ0FBQyxRQUFrQjtRQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQzVCLDJCQUEyQixFQUMzQixDQUFDLFdBQVcsRUFBRSxFQUFFLG1CQUFtQixFQUFFLEVBQUUsRUFBRTtZQUN2QyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFOztnQkFDakYsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWCxPQUFPO2lCQUNSO2dCQUVELE1BQU0sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXhGLHdFQUF3RTtnQkFDeEUsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLGNBQWMsRUFBRTtvQkFDbkMsT0FBTztpQkFDUjtnQkFFRCxNQUFNLFFBQVEsR0FBRyxXQUFXLEdBQUcsR0FBRyxHQUFHLGNBQWMsR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDO2dCQUN6RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUV0RCxJQUFJLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3ZCLCtDQUErQztvQkFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO3dCQUN6QixRQUFRO3dCQUNSLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztxQkFDeEIsQ0FBQyxDQUFDO29CQUVILE9BQU87aUJBQ1I7Z0JBRUQsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxHQUFHLGtCQUFrQixDQUFDO2dCQUM1RSxJQUFJLFFBQVEsS0FBSyxZQUFZLEVBQUU7b0JBQzdCLHNCQUFzQjtvQkFDdEIsMERBQTBEO29CQUMxRCxPQUFPO2lCQUNSO2dCQUVELElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxPQUFPLEVBQUU7b0JBQ3pCLElBQUEsZ0NBQVUsRUFBQyxXQUFXLEVBQUUsZ0NBQWdDLFFBQVEsT0FBTyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2lCQUN4RjtnQkFFRCx5REFBeUQ7Z0JBQ3pELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUF1RCxDQUFDO2dCQUNsRixVQUFVLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztnQkFDbkMsVUFBVSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQXJERCw4REFxREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQ29tcGlsZXIgfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IGFkZFdhcm5pbmcgfSBmcm9tICcuLi8uLi91dGlscy93ZWJwYWNrLWRpYWdub3N0aWNzJztcblxuaW50ZXJmYWNlIFJlc291cmNlRGF0YSB7XG4gIHJlbGF0aXZlUGF0aDogc3RyaW5nO1xuICByZXNvdXJjZTogc3RyaW5nO1xuICBwYWNrYWdlTmFtZT86IHN0cmluZztcbiAgcGFja2FnZVZlcnNpb24/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVkdXBlTW9kdWxlUmVzb2x2ZVBsdWdpbk9wdGlvbnMge1xuICB2ZXJib3NlPzogYm9vbGVhbjtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmZ1bmN0aW9uIGdldFJlc291cmNlRGF0YShyZXNvbHZlRGF0YTogYW55KTogUmVzb3VyY2VEYXRhIHtcbiAgY29uc3QgeyBkZXNjcmlwdGlvbkZpbGVEYXRhLCByZWxhdGl2ZVBhdGggfSA9IHJlc29sdmVEYXRhLmNyZWF0ZURhdGEucmVzb3VyY2VSZXNvbHZlRGF0YTtcblxuICByZXR1cm4ge1xuICAgIHBhY2thZ2VOYW1lOiBkZXNjcmlwdGlvbkZpbGVEYXRhPy5uYW1lLFxuICAgIHBhY2thZ2VWZXJzaW9uOiBkZXNjcmlwdGlvbkZpbGVEYXRhPy52ZXJzaW9uLFxuICAgIHJlbGF0aXZlUGF0aCxcbiAgICByZXNvdXJjZTogcmVzb2x2ZURhdGEuY3JlYXRlRGF0YS5yZXNvdXJjZSxcbiAgfTtcbn1cblxuLyoqXG4gKiBEZWR1cGVNb2R1bGVSZXNvbHZlUGx1Z2luIGlzIGEgd2VicGFjayBwbHVnaW4gd2hpY2ggZGVkdXBlcyBtb2R1bGVzIHdpdGggdGhlIHNhbWUgbmFtZSBhbmQgdmVyc2lvbnNcbiAqIHRoYXQgYXJlIGxhaWQgb3V0IGluIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgbm9kZV9tb2R1bGVzIHRyZWUuXG4gKlxuICogVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBXZWJwYWNrIHJlbGllcyBvbiBwYWNrYWdlIG1hbmFnZXJzIHRvIGhvaXN0IG1vZHVsZXMgYW5kIGRvZXNuJ3QgaGF2ZSBhbnkgZGVkdXBpbmcgbG9naWMuXG4gKlxuICogVGhpcyBpcyBzaW1pbGFyIHRvIGhvdyBXZWJwYWNrJ3MgJ05vcm1hbE1vZHVsZVJlcGxhY2VtZW50UGx1Z2luJyB3b3Jrc1xuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay93ZWJwYWNrL2Jsb2IvNGExZjA2ODgyOGMyYWI0NzUzN2Q4YmUzMGQ1NDJjZDNhMTA3NmRiNC9saWIvTm9ybWFsTW9kdWxlUmVwbGFjZW1lbnRQbHVnaW4uanMjTDlcbiAqL1xuZXhwb3J0IGNsYXNzIERlZHVwZU1vZHVsZVJlc29sdmVQbHVnaW4ge1xuICBtb2R1bGVzID0gbmV3IE1hcDxzdHJpbmcsIHsgcmVxdWVzdDogc3RyaW5nOyByZXNvdXJjZTogc3RyaW5nIH0+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvcHRpb25zPzogRGVkdXBlTW9kdWxlUmVzb2x2ZVBsdWdpbk9wdGlvbnMpIHt9XG5cbiAgYXBwbHkoY29tcGlsZXI6IENvbXBpbGVyKSB7XG4gICAgY29tcGlsZXIuaG9va3MuY29tcGlsYXRpb24udGFwKFxuICAgICAgJ0RlZHVwZU1vZHVsZVJlc29sdmVQbHVnaW4nLFxuICAgICAgKGNvbXBpbGF0aW9uLCB7IG5vcm1hbE1vZHVsZUZhY3RvcnkgfSkgPT4ge1xuICAgICAgICBub3JtYWxNb2R1bGVGYWN0b3J5Lmhvb2tzLmFmdGVyUmVzb2x2ZS50YXAoJ0RlZHVwZU1vZHVsZVJlc29sdmVQbHVnaW4nLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB7IHBhY2thZ2VOYW1lLCBwYWNrYWdlVmVyc2lvbiwgcmVsYXRpdmVQYXRoLCByZXNvdXJjZSB9ID0gZ2V0UmVzb3VyY2VEYXRhKHJlc3VsdCk7XG5cbiAgICAgICAgICAvLyBFbXB0eSBuYW1lIG9yIHZlcnNpb25zIGFyZSBubyB2YWxpZCBwcmltYXJ5ICBlbnRyeXBvaW50cyBvZiBhIGxpYnJhcnlcbiAgICAgICAgICBpZiAoIXBhY2thZ2VOYW1lIHx8ICFwYWNrYWdlVmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG1vZHVsZUlkID0gcGFja2FnZU5hbWUgKyAnQCcgKyBwYWNrYWdlVmVyc2lvbiArICc6JyArIHJlbGF0aXZlUGF0aDtcbiAgICAgICAgICBjb25zdCBwcmV2UmVzb2x2ZWRNb2R1bGUgPSB0aGlzLm1vZHVsZXMuZ2V0KG1vZHVsZUlkKTtcblxuICAgICAgICAgIGlmICghcHJldlJlc29sdmVkTW9kdWxlKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBmaXJzdCB0aW1lIHdlIHZpc2l0IHRoaXMgbW9kdWxlLlxuICAgICAgICAgICAgdGhpcy5tb2R1bGVzLnNldChtb2R1bGVJZCwge1xuICAgICAgICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgICAgICAgcmVxdWVzdDogcmVzdWx0LnJlcXVlc3QsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHsgcmVzb3VyY2U6IHByZXZSZXNvdXJjZSwgcmVxdWVzdDogcHJldlJlcXVlc3QgfSA9IHByZXZSZXNvbHZlZE1vZHVsZTtcbiAgICAgICAgICBpZiAocmVzb3VyY2UgPT09IHByZXZSZXNvdXJjZSkge1xuICAgICAgICAgICAgLy8gTm8gZGVkdXBpbmcgbmVlZGVkLlxuICAgICAgICAgICAgLy8gQ3VycmVudCBwYXRoIGFuZCBwcmV2aW91c2x5IHJlc29sdmVkIHBhdGggYXJlIHRoZSBzYW1lLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnM/LnZlcmJvc2UpIHtcbiAgICAgICAgICAgIGFkZFdhcm5pbmcoY29tcGlsYXRpb24sIGBbRGVkdXBlTW9kdWxlUmVzb2x2ZVBsdWdpbl06ICR7cmVzb3VyY2V9IC0+ICR7cHJldlJlc291cmNlfWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFsdGVyIGN1cnJlbnQgcmVxdWVzdCB3aXRoIHByZXZpb3VzbHkgcmVzb2x2ZWQgbW9kdWxlLlxuICAgICAgICAgIGNvbnN0IGNyZWF0ZURhdGEgPSByZXN1bHQuY3JlYXRlRGF0YSBhcyB7IHJlc291cmNlOiBzdHJpbmc7IHVzZXJSZXF1ZXN0OiBzdHJpbmcgfTtcbiAgICAgICAgICBjcmVhdGVEYXRhLnJlc291cmNlID0gcHJldlJlc291cmNlO1xuICAgICAgICAgIGNyZWF0ZURhdGEudXNlclJlcXVlc3QgPSBwcmV2UmVxdWVzdDtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICk7XG4gIH1cbn1cbiJdfQ==
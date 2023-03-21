"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIvyPlugin = void 0;
const webpack_1 = require("@ngtools/webpack");
const typescript_1 = require("typescript");
function createIvyPlugin(wco, aot, tsconfig) {
    var _a, _b;
    var _c;
    const { buildOptions, tsConfig } = wco;
    const optimize = buildOptions.optimization.scripts;
    const compilerOptions = {
        sourceMap: buildOptions.sourceMap.scripts,
        declaration: false,
        declarationMap: false,
    };
    if (tsConfig.options.target === undefined || tsConfig.options.target < typescript_1.ScriptTarget.ES2022) {
        tsConfig.options.target = typescript_1.ScriptTarget.ES2022;
        // If 'useDefineForClassFields' is already defined in the users project leave the value as is.
        // Otherwise fallback to false due to https://github.com/microsoft/TypeScript/issues/45995
        // which breaks the deprecated `@Effects` NGRX decorator and potentially other existing code as well.
        (_a = (_c = tsConfig.options).useDefineForClassFields) !== null && _a !== void 0 ? _a : (_c.useDefineForClassFields = false);
        wco.logger.warn('TypeScript compiler options "target" and "useDefineForClassFields" are set to "ES2022" and ' +
            '"false" respectively by the Angular CLI. To control ECMA version and features use the Browerslist configuration. ' +
            'For more information, see https://angular.io/guide/build#configuring-browser-compatibility\n' +
            `NOTE: You can set the "target" to "ES2022" in the project's tsconfig to remove this warning.`);
    }
    if (buildOptions.preserveSymlinks !== undefined) {
        compilerOptions.preserveSymlinks = buildOptions.preserveSymlinks;
    }
    const fileReplacements = {};
    if (buildOptions.fileReplacements) {
        for (const replacement of buildOptions.fileReplacements) {
            fileReplacements[replacement.replace] = replacement.with;
        }
    }
    return new webpack_1.AngularWebpackPlugin({
        tsconfig,
        compilerOptions,
        fileReplacements,
        jitMode: !aot,
        emitNgModuleScope: !optimize,
        inlineStyleFileExtension: (_b = buildOptions.inlineStyleLanguage) !== null && _b !== void 0 ? _b : 'css',
    });
}
exports.createIvyPlugin = createIvyPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3dlYnBhY2svcGx1Z2lucy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILDhDQUF3RDtBQUN4RCwyQ0FBMEM7QUFHMUMsU0FBZ0IsZUFBZSxDQUM3QixHQUF5QixFQUN6QixHQUFZLEVBQ1osUUFBZ0I7OztJQUVoQixNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUN2QyxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUVuRCxNQUFNLGVBQWUsR0FBb0I7UUFDdkMsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTztRQUN6QyxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztLQUN0QixDQUFDO0lBRUYsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcseUJBQVksQ0FBQyxNQUFNLEVBQUU7UUFDMUYsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcseUJBQVksQ0FBQyxNQUFNLENBQUM7UUFDOUMsOEZBQThGO1FBQzlGLDBGQUEwRjtRQUMxRixxR0FBcUc7UUFDckcsWUFBQSxRQUFRLENBQUMsT0FBTyxFQUFDLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLEdBQUssS0FBSyxFQUFDO1FBRW5ELEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNiLDZGQUE2RjtZQUMzRixtSEFBbUg7WUFDbkgsOEZBQThGO1lBQzlGLDhGQUE4RixDQUNqRyxDQUFDO0tBQ0g7SUFFRCxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7UUFDL0MsZUFBZSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztLQUNsRTtJQUVELE1BQU0sZ0JBQWdCLEdBQTJCLEVBQUUsQ0FBQztJQUNwRCxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtRQUNqQyxLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtZQUN2RCxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztTQUMxRDtLQUNGO0lBRUQsT0FBTyxJQUFJLDhCQUFvQixDQUFDO1FBQzlCLFFBQVE7UUFDUixlQUFlO1FBQ2YsZ0JBQWdCO1FBQ2hCLE9BQU8sRUFBRSxDQUFDLEdBQUc7UUFDYixpQkFBaUIsRUFBRSxDQUFDLFFBQVE7UUFDNUIsd0JBQXdCLEVBQUUsTUFBQSxZQUFZLENBQUMsbUJBQW1CLG1DQUFJLEtBQUs7S0FDcEUsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWhERCwwQ0FnREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBDb21waWxlck9wdGlvbnMgfSBmcm9tICdAYW5ndWxhci9jb21waWxlci1jbGknO1xuaW1wb3J0IHsgQW5ndWxhcldlYnBhY2tQbHVnaW4gfSBmcm9tICdAbmd0b29scy93ZWJwYWNrJztcbmltcG9ydCB7IFNjcmlwdFRhcmdldCB9IGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgV2VicGFja0NvbmZpZ09wdGlvbnMgfSBmcm9tICcuLi8uLi91dGlscy9idWlsZC1vcHRpb25zJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUl2eVBsdWdpbihcbiAgd2NvOiBXZWJwYWNrQ29uZmlnT3B0aW9ucyxcbiAgYW90OiBib29sZWFuLFxuICB0c2NvbmZpZzogc3RyaW5nLFxuKTogQW5ndWxhcldlYnBhY2tQbHVnaW4ge1xuICBjb25zdCB7IGJ1aWxkT3B0aW9ucywgdHNDb25maWcgfSA9IHdjbztcbiAgY29uc3Qgb3B0aW1pemUgPSBidWlsZE9wdGlvbnMub3B0aW1pemF0aW9uLnNjcmlwdHM7XG5cbiAgY29uc3QgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnMgPSB7XG4gICAgc291cmNlTWFwOiBidWlsZE9wdGlvbnMuc291cmNlTWFwLnNjcmlwdHMsXG4gICAgZGVjbGFyYXRpb246IGZhbHNlLFxuICAgIGRlY2xhcmF0aW9uTWFwOiBmYWxzZSxcbiAgfTtcblxuICBpZiAodHNDb25maWcub3B0aW9ucy50YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0c0NvbmZpZy5vcHRpb25zLnRhcmdldCA8IFNjcmlwdFRhcmdldC5FUzIwMjIpIHtcbiAgICB0c0NvbmZpZy5vcHRpb25zLnRhcmdldCA9IFNjcmlwdFRhcmdldC5FUzIwMjI7XG4gICAgLy8gSWYgJ3VzZURlZmluZUZvckNsYXNzRmllbGRzJyBpcyBhbHJlYWR5IGRlZmluZWQgaW4gdGhlIHVzZXJzIHByb2plY3QgbGVhdmUgdGhlIHZhbHVlIGFzIGlzLlxuICAgIC8vIE90aGVyd2lzZSBmYWxsYmFjayB0byBmYWxzZSBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80NTk5NVxuICAgIC8vIHdoaWNoIGJyZWFrcyB0aGUgZGVwcmVjYXRlZCBgQEVmZmVjdHNgIE5HUlggZGVjb3JhdG9yIGFuZCBwb3RlbnRpYWxseSBvdGhlciBleGlzdGluZyBjb2RlIGFzIHdlbGwuXG4gICAgdHNDb25maWcub3B0aW9ucy51c2VEZWZpbmVGb3JDbGFzc0ZpZWxkcyA/Pz0gZmFsc2U7XG5cbiAgICB3Y28ubG9nZ2VyLndhcm4oXG4gICAgICAnVHlwZVNjcmlwdCBjb21waWxlciBvcHRpb25zIFwidGFyZ2V0XCIgYW5kIFwidXNlRGVmaW5lRm9yQ2xhc3NGaWVsZHNcIiBhcmUgc2V0IHRvIFwiRVMyMDIyXCIgYW5kICcgK1xuICAgICAgICAnXCJmYWxzZVwiIHJlc3BlY3RpdmVseSBieSB0aGUgQW5ndWxhciBDTEkuIFRvIGNvbnRyb2wgRUNNQSB2ZXJzaW9uIGFuZCBmZWF0dXJlcyB1c2UgdGhlIEJyb3dlcnNsaXN0IGNvbmZpZ3VyYXRpb24uICcgK1xuICAgICAgICAnRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvYnVpbGQjY29uZmlndXJpbmctYnJvd3Nlci1jb21wYXRpYmlsaXR5XFxuJyArXG4gICAgICAgIGBOT1RFOiBZb3UgY2FuIHNldCB0aGUgXCJ0YXJnZXRcIiB0byBcIkVTMjAyMlwiIGluIHRoZSBwcm9qZWN0J3MgdHNjb25maWcgdG8gcmVtb3ZlIHRoaXMgd2FybmluZy5gLFxuICAgICk7XG4gIH1cblxuICBpZiAoYnVpbGRPcHRpb25zLnByZXNlcnZlU3ltbGlua3MgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbXBpbGVyT3B0aW9ucy5wcmVzZXJ2ZVN5bWxpbmtzID0gYnVpbGRPcHRpb25zLnByZXNlcnZlU3ltbGlua3M7XG4gIH1cblxuICBjb25zdCBmaWxlUmVwbGFjZW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIGlmIChidWlsZE9wdGlvbnMuZmlsZVJlcGxhY2VtZW50cykge1xuICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQgb2YgYnVpbGRPcHRpb25zLmZpbGVSZXBsYWNlbWVudHMpIHtcbiAgICAgIGZpbGVSZXBsYWNlbWVudHNbcmVwbGFjZW1lbnQucmVwbGFjZV0gPSByZXBsYWNlbWVudC53aXRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgQW5ndWxhcldlYnBhY2tQbHVnaW4oe1xuICAgIHRzY29uZmlnLFxuICAgIGNvbXBpbGVyT3B0aW9ucyxcbiAgICBmaWxlUmVwbGFjZW1lbnRzLFxuICAgIGppdE1vZGU6ICFhb3QsXG4gICAgZW1pdE5nTW9kdWxlU2NvcGU6ICFvcHRpbWl6ZSxcbiAgICBpbmxpbmVTdHlsZUZpbGVFeHRlbnNpb246IGJ1aWxkT3B0aW9ucy5pbmxpbmVTdHlsZUxhbmd1YWdlID8/ICdjc3MnLFxuICB9KTtcbn1cbiJdfQ==
"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
const promises_1 = require("node:fs/promises");
const application_1 = __importDefault(require("../../babel/presets/application"));
const webpack_loader_1 = require("../../babel/webpack-loader");
const load_esm_1 = require("../../utils/load-esm");
async function transformJavaScript(request) {
    var _a;
    (_a = request.data) !== null && _a !== void 0 ? _a : (request.data = await (0, promises_1.readFile)(request.filename, 'utf-8'));
    const transformedData = await transformWithBabel(request);
    return Buffer.from(transformedData, 'utf-8');
}
exports.default = transformJavaScript;
let linkerPluginCreator;
async function transformWithBabel({ filename, data, ...options }) {
    var _a, _b;
    const forceAsyncTransformation = (_a = options.forceAsyncTransformation) !== null && _a !== void 0 ? _a : (!/[\\/][_f]?esm2015[\\/]/.test(filename) && /async(?:\s+function)?\s*\*/.test(data));
    const shouldLink = !options.skipLinker && (await (0, webpack_loader_1.requiresLinking)(filename, data));
    const useInputSourcemap = options.sourcemap &&
        (!!options.thirdPartySourcemaps || !/[\\/]node_modules[\\/]/.test(filename));
    // If no additional transformations are needed, return the data directly
    if (!forceAsyncTransformation && !options.advancedOptimizations && !shouldLink) {
        // Strip sourcemaps if they should not be used
        return useInputSourcemap ? data : data.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
    }
    const angularPackage = /[\\/]node_modules[\\/]@angular[\\/]/.test(filename);
    // Lazy load the linker plugin only when linking is required
    if (shouldLink) {
        linkerPluginCreator !== null && linkerPluginCreator !== void 0 ? linkerPluginCreator : (linkerPluginCreator = (await (0, load_esm_1.loadEsmModule)('@angular/compiler-cli/linker/babel')).createEs2015LinkerPlugin);
    }
    const result = await (0, core_1.transformAsync)(data, {
        filename,
        inputSourceMap: (useInputSourcemap ? undefined : false),
        sourceMaps: options.sourcemap ? 'inline' : false,
        compact: false,
        configFile: false,
        babelrc: false,
        browserslistConfigFile: false,
        plugins: [],
        presets: [
            [
                application_1.default,
                {
                    angularLinker: linkerPluginCreator && {
                        shouldLink,
                        jitMode: options.jit,
                        linkerPluginCreator,
                    },
                    forceAsyncTransformation,
                    optimize: options.advancedOptimizations && {
                        looseEnums: angularPackage,
                        pureTopLevel: angularPackage,
                    },
                },
            ],
        ],
    });
    return (_b = result === null || result === void 0 ? void 0 : result.code) !== null && _b !== void 0 ? _b : data;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdC10cmFuc2Zvcm1lci13b3JrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9icm93c2VyLWVzYnVpbGQvamF2YXNjcmlwdC10cmFuc2Zvcm1lci13b3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7QUFFSCxzQ0FBNkM7QUFDN0MsK0NBQTRDO0FBQzVDLGtGQUF1RTtBQUN2RSwrREFBNkQ7QUFDN0QsbURBQXFEO0FBYXRDLEtBQUssVUFBVSxtQkFBbUIsQ0FDL0MsT0FBbUM7O0lBRW5DLE1BQUEsT0FBTyxDQUFDLElBQUksb0NBQVosT0FBTyxDQUFDLElBQUksR0FBSyxNQUFNLElBQUEsbUJBQVEsRUFBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFDO0lBQzNELE1BQU0sZUFBZSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFMUQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBUEQsc0NBT0M7QUFFRCxJQUFJLG1CQUVTLENBQUM7QUFFZCxLQUFLLFVBQVUsa0JBQWtCLENBQUMsRUFDaEMsUUFBUSxFQUNSLElBQUksRUFDSixHQUFHLE9BQU8sRUFDaUI7O0lBQzNCLE1BQU0sd0JBQXdCLEdBQzVCLE1BQUEsT0FBTyxDQUFDLHdCQUF3QixtQ0FDaEMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN4RixNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxNQUFNLElBQUEsZ0NBQWUsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsRixNQUFNLGlCQUFpQixHQUNyQixPQUFPLENBQUMsU0FBUztRQUNqQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUUvRSx3RUFBd0U7SUFDeEUsSUFBSSxDQUFDLHdCQUF3QixJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixJQUFJLENBQUMsVUFBVSxFQUFFO1FBQzlFLDhDQUE4QztRQUM5QyxPQUFPLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsb0NBQW9DLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDMUY7SUFFRCxNQUFNLGNBQWMsR0FBRyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUUsNERBQTREO0lBQzVELElBQUksVUFBVSxFQUFFO1FBQ2QsbUJBQW1CLGFBQW5CLG1CQUFtQixjQUFuQixtQkFBbUIsSUFBbkIsbUJBQW1CLEdBQUssQ0FDdEIsTUFBTSxJQUFBLHdCQUFhLEVBQ2pCLG9DQUFvQyxDQUNyQyxDQUNGLENBQUMsd0JBQXdCLEVBQUM7S0FDNUI7SUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEscUJBQWMsRUFBQyxJQUFJLEVBQUU7UUFDeEMsUUFBUTtRQUNSLGNBQWMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBYztRQUNwRSxVQUFVLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLO1FBQ2hELE9BQU8sRUFBRSxLQUFLO1FBQ2QsVUFBVSxFQUFFLEtBQUs7UUFDakIsT0FBTyxFQUFFLEtBQUs7UUFDZCxzQkFBc0IsRUFBRSxLQUFLO1FBQzdCLE9BQU8sRUFBRSxFQUFFO1FBQ1gsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UscUJBQXdCO2dCQUN4QjtvQkFDRSxhQUFhLEVBQUUsbUJBQW1CLElBQUk7d0JBQ3BDLFVBQVU7d0JBQ1YsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHO3dCQUNwQixtQkFBbUI7cUJBQ3BCO29CQUNELHdCQUF3QjtvQkFDeEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsSUFBSTt3QkFDekMsVUFBVSxFQUFFLGNBQWM7d0JBQzFCLFlBQVksRUFBRSxjQUFjO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPLE1BQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLElBQUksbUNBQUksSUFBSSxDQUFDO0FBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgdHJhbnNmb3JtQXN5bmMgfSBmcm9tICdAYmFiZWwvY29yZSc7XG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuaW1wb3J0IGFuZ3VsYXJBcHBsaWNhdGlvblByZXNldCBmcm9tICcuLi8uLi9iYWJlbC9wcmVzZXRzL2FwcGxpY2F0aW9uJztcbmltcG9ydCB7IHJlcXVpcmVzTGlua2luZyB9IGZyb20gJy4uLy4uL2JhYmVsL3dlYnBhY2stbG9hZGVyJztcbmltcG9ydCB7IGxvYWRFc21Nb2R1bGUgfSBmcm9tICcuLi8uLi91dGlscy9sb2FkLWVzbSc7XG5cbmludGVyZmFjZSBKYXZhU2NyaXB0VHJhbnNmb3JtUmVxdWVzdCB7XG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIGRhdGE6IHN0cmluZztcbiAgc291cmNlbWFwOiBib29sZWFuO1xuICB0aGlyZFBhcnR5U291cmNlbWFwczogYm9vbGVhbjtcbiAgYWR2YW5jZWRPcHRpbWl6YXRpb25zOiBib29sZWFuO1xuICBmb3JjZUFzeW5jVHJhbnNmb3JtYXRpb24/OiBib29sZWFuO1xuICBza2lwTGlua2VyOiBib29sZWFuO1xuICBqaXQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHRyYW5zZm9ybUphdmFTY3JpcHQoXG4gIHJlcXVlc3Q6IEphdmFTY3JpcHRUcmFuc2Zvcm1SZXF1ZXN0LFxuKTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gIHJlcXVlc3QuZGF0YSA/Pz0gYXdhaXQgcmVhZEZpbGUocmVxdWVzdC5maWxlbmFtZSwgJ3V0Zi04Jyk7XG4gIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IGF3YWl0IHRyYW5zZm9ybVdpdGhCYWJlbChyZXF1ZXN0KTtcblxuICByZXR1cm4gQnVmZmVyLmZyb20odHJhbnNmb3JtZWREYXRhLCAndXRmLTgnKTtcbn1cblxubGV0IGxpbmtlclBsdWdpbkNyZWF0b3I6XG4gIHwgdHlwZW9mIGltcG9ydCgnQGFuZ3VsYXIvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbCcpLmNyZWF0ZUVzMjAxNUxpbmtlclBsdWdpblxuICB8IHVuZGVmaW5lZDtcblxuYXN5bmMgZnVuY3Rpb24gdHJhbnNmb3JtV2l0aEJhYmVsKHtcbiAgZmlsZW5hbWUsXG4gIGRhdGEsXG4gIC4uLm9wdGlvbnNcbn06IEphdmFTY3JpcHRUcmFuc2Zvcm1SZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgZm9yY2VBc3luY1RyYW5zZm9ybWF0aW9uID1cbiAgICBvcHRpb25zLmZvcmNlQXN5bmNUcmFuc2Zvcm1hdGlvbiA/P1xuICAgICghL1tcXFxcL11bX2ZdP2VzbTIwMTVbXFxcXC9dLy50ZXN0KGZpbGVuYW1lKSAmJiAvYXN5bmMoPzpcXHMrZnVuY3Rpb24pP1xccypcXCovLnRlc3QoZGF0YSkpO1xuICBjb25zdCBzaG91bGRMaW5rID0gIW9wdGlvbnMuc2tpcExpbmtlciAmJiAoYXdhaXQgcmVxdWlyZXNMaW5raW5nKGZpbGVuYW1lLCBkYXRhKSk7XG4gIGNvbnN0IHVzZUlucHV0U291cmNlbWFwID1cbiAgICBvcHRpb25zLnNvdXJjZW1hcCAmJlxuICAgICghIW9wdGlvbnMudGhpcmRQYXJ0eVNvdXJjZW1hcHMgfHwgIS9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXS8udGVzdChmaWxlbmFtZSkpO1xuXG4gIC8vIElmIG5vIGFkZGl0aW9uYWwgdHJhbnNmb3JtYXRpb25zIGFyZSBuZWVkZWQsIHJldHVybiB0aGUgZGF0YSBkaXJlY3RseVxuICBpZiAoIWZvcmNlQXN5bmNUcmFuc2Zvcm1hdGlvbiAmJiAhb3B0aW9ucy5hZHZhbmNlZE9wdGltaXphdGlvbnMgJiYgIXNob3VsZExpbmspIHtcbiAgICAvLyBTdHJpcCBzb3VyY2VtYXBzIGlmIHRoZXkgc2hvdWxkIG5vdCBiZSB1c2VkXG4gICAgcmV0dXJuIHVzZUlucHV0U291cmNlbWFwID8gZGF0YSA6IGRhdGEucmVwbGFjZSgvXlxcL1xcLyMgc291cmNlTWFwcGluZ1VSTD1bXlxcclxcbl0qL2dtLCAnJyk7XG4gIH1cblxuICBjb25zdCBhbmd1bGFyUGFja2FnZSA9IC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXS8udGVzdChmaWxlbmFtZSk7XG5cbiAgLy8gTGF6eSBsb2FkIHRoZSBsaW5rZXIgcGx1Z2luIG9ubHkgd2hlbiBsaW5raW5nIGlzIHJlcXVpcmVkXG4gIGlmIChzaG91bGRMaW5rKSB7XG4gICAgbGlua2VyUGx1Z2luQ3JlYXRvciA/Pz0gKFxuICAgICAgYXdhaXQgbG9hZEVzbU1vZHVsZTx0eXBlb2YgaW1wb3J0KCdAYW5ndWxhci9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsJyk+KFxuICAgICAgICAnQGFuZ3VsYXIvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbCcsXG4gICAgICApXG4gICAgKS5jcmVhdGVFczIwMTVMaW5rZXJQbHVnaW47XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmFuc2Zvcm1Bc3luYyhkYXRhLCB7XG4gICAgZmlsZW5hbWUsXG4gICAgaW5wdXRTb3VyY2VNYXA6ICh1c2VJbnB1dFNvdXJjZW1hcCA/IHVuZGVmaW5lZCA6IGZhbHNlKSBhcyB1bmRlZmluZWQsXG4gICAgc291cmNlTWFwczogb3B0aW9ucy5zb3VyY2VtYXAgPyAnaW5saW5lJyA6IGZhbHNlLFxuICAgIGNvbXBhY3Q6IGZhbHNlLFxuICAgIGNvbmZpZ0ZpbGU6IGZhbHNlLFxuICAgIGJhYmVscmM6IGZhbHNlLFxuICAgIGJyb3dzZXJzbGlzdENvbmZpZ0ZpbGU6IGZhbHNlLFxuICAgIHBsdWdpbnM6IFtdLFxuICAgIHByZXNldHM6IFtcbiAgICAgIFtcbiAgICAgICAgYW5ndWxhckFwcGxpY2F0aW9uUHJlc2V0LFxuICAgICAgICB7XG4gICAgICAgICAgYW5ndWxhckxpbmtlcjogbGlua2VyUGx1Z2luQ3JlYXRvciAmJiB7XG4gICAgICAgICAgICBzaG91bGRMaW5rLFxuICAgICAgICAgICAgaml0TW9kZTogb3B0aW9ucy5qaXQsXG4gICAgICAgICAgICBsaW5rZXJQbHVnaW5DcmVhdG9yLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZm9yY2VBc3luY1RyYW5zZm9ybWF0aW9uLFxuICAgICAgICAgIG9wdGltaXplOiBvcHRpb25zLmFkdmFuY2VkT3B0aW1pemF0aW9ucyAmJiB7XG4gICAgICAgICAgICBsb29zZUVudW1zOiBhbmd1bGFyUGFja2FnZSxcbiAgICAgICAgICAgIHB1cmVUb3BMZXZlbDogYW5ndWxhclBhY2thZ2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgXSxcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdD8uY29kZSA/PyBkYXRhO1xufVxuIl19
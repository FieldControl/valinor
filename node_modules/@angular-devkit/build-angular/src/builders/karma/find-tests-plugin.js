"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindTestsPlugin = void 0;
const assert_1 = __importDefault(require("assert"));
const fs_1 = require("fs");
const glob_1 = __importStar(require("glob"));
const mini_css_extract_plugin_1 = require("mini-css-extract-plugin");
const path_1 = require("path");
const util_1 = require("util");
const globPromise = (0, util_1.promisify)(glob_1.default);
/**
 * The name of the plugin provided to Webpack when tapping Webpack compiler hooks.
 */
const PLUGIN_NAME = 'angular-find-tests-plugin';
class FindTestsPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        const { include = ['**/*.spec.ts'], exclude = [], projectSourceRoot, workspaceRoot, } = this.options;
        const webpackOptions = compiler.options;
        const entry = typeof webpackOptions.entry === 'function' ? webpackOptions.entry() : webpackOptions.entry;
        let originalImport;
        // Add tests files are part of the entry-point.
        webpackOptions.entry = async () => {
            const specFiles = await findTests(include, exclude, workspaceRoot, projectSourceRoot);
            const entrypoints = await entry;
            const entrypoint = entrypoints['main'];
            if (!entrypoint.import) {
                throw new Error(`Cannot find 'main' entrypoint.`);
            }
            if (specFiles.length) {
                originalImport !== null && originalImport !== void 0 ? originalImport : (originalImport = entrypoint.import);
                entrypoint.import = [...originalImport, ...specFiles];
            }
            else {
                (0, assert_1.default)(this.compilation, 'Compilation cannot be undefined.');
                this.compilation
                    .getLogger(mini_css_extract_plugin_1.pluginName)
                    .error(`Specified patterns: "${include.join(', ')}" did not match any spec files.`);
            }
            return entrypoints;
        };
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            this.compilation = compilation;
            compilation.contextDependencies.add(projectSourceRoot);
        });
    }
}
exports.FindTestsPlugin = FindTestsPlugin;
// go through all patterns and find unique list of files
async function findTests(include, exclude, workspaceRoot, projectSourceRoot) {
    const matchingTestsPromises = include.map((pattern) => findMatchingTests(pattern, exclude, workspaceRoot, projectSourceRoot));
    const files = await Promise.all(matchingTestsPromises);
    // Unique file names
    return [...new Set(files.flat())];
}
const normalizePath = (path) => path.replace(/\\/g, '/');
async function findMatchingTests(pattern, ignore, workspaceRoot, projectSourceRoot) {
    // normalize pattern, glob lib only accepts forward slashes
    let normalizedPattern = normalizePath(pattern);
    if (normalizedPattern.charAt(0) === '/') {
        normalizedPattern = normalizedPattern.substring(1);
    }
    const relativeProjectRoot = normalizePath((0, path_1.relative)(workspaceRoot, projectSourceRoot) + '/');
    // remove relativeProjectRoot to support relative paths from root
    // such paths are easy to get when running scripts via IDEs
    if (normalizedPattern.startsWith(relativeProjectRoot)) {
        normalizedPattern = normalizedPattern.substring(relativeProjectRoot.length);
    }
    // special logic when pattern does not look like a glob
    if (!(0, glob_1.hasMagic)(normalizedPattern)) {
        if (await isDirectory((0, path_1.join)(projectSourceRoot, normalizedPattern))) {
            normalizedPattern = `${normalizedPattern}/**/*.spec.@(ts|tsx)`;
        }
        else {
            // see if matching spec file exists
            const fileExt = (0, path_1.extname)(normalizedPattern);
            // Replace extension to `.spec.ext`. Example: `src/app/app.component.ts`-> `src/app/app.component.spec.ts`
            const potentialSpec = (0, path_1.join)(projectSourceRoot, (0, path_1.dirname)(normalizedPattern), `${(0, path_1.basename)(normalizedPattern, fileExt)}.spec${fileExt}`);
            if (await exists(potentialSpec)) {
                return [potentialSpec];
            }
        }
    }
    return globPromise(normalizedPattern, {
        cwd: projectSourceRoot,
        root: projectSourceRoot,
        nomount: true,
        absolute: true,
        ignore: ['**/node_modules/**', ...ignore],
    });
}
async function isDirectory(path) {
    try {
        const stats = await fs_1.promises.stat(path);
        return stats.isDirectory();
    }
    catch (_a) {
        return false;
    }
}
async function exists(path) {
    try {
        await fs_1.promises.access(path, fs_1.constants.F_OK);
        return true;
    }
    catch (_a) {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC10ZXN0cy1wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9rYXJtYS9maW5kLXRlc3RzLXBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILG9EQUE0QjtBQUM1QiwyQkFBeUQ7QUFDekQsNkNBQXNDO0FBQ3RDLHFFQUFxRDtBQUNyRCwrQkFBa0U7QUFDbEUsK0JBQWlDO0FBR2pDLE1BQU0sV0FBVyxHQUFHLElBQUEsZ0JBQVMsRUFBQyxjQUFJLENBQUMsQ0FBQztBQUVwQzs7R0FFRztBQUNILE1BQU0sV0FBVyxHQUFHLDJCQUEyQixDQUFDO0FBU2hELE1BQWEsZUFBZTtJQUcxQixZQUFvQixPQUErQjtRQUEvQixZQUFPLEdBQVAsT0FBTyxDQUF3QjtJQUFHLENBQUM7SUFFdkQsS0FBSyxDQUFDLFFBQWtCO1FBQ3RCLE1BQU0sRUFDSixPQUFPLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFDMUIsT0FBTyxHQUFHLEVBQUUsRUFDWixpQkFBaUIsRUFDakIsYUFBYSxHQUNkLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNqQixNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxHQUNULE9BQU8sY0FBYyxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztRQUU3RixJQUFJLGNBQW9DLENBQUM7UUFFekMsK0NBQStDO1FBQy9DLGNBQWMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLEVBQUU7WUFDaEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxTQUFTLENBQUMs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QUFJO1FBQ0YsTUFBTSxhQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEMsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUFDLFdBQU07UUFDTixPQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBQYXRoTGlrZSwgY29uc3RhbnRzLCBwcm9taXNlcyBhcyBmcyB9IGZyb20gJ2ZzJztcbmltcG9ydCBnbG9iLCB7IGhhc01hZ2ljIH0gZnJvbSAnZ2xvYic7XG5pbXBvcnQgeyBwbHVnaW5OYW1lIH0gZnJvbSAnbWluaS1jc3MtZXh0cmFjdC1wbHVnaW4nO1xuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUsIGV4dG5hbWUsIGpvaW4sIHJlbGF0aXZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tICd1dGlsJztcbmltcG9ydCB0eXBlIHsgQ29tcGlsYXRpb24sIENvbXBpbGVyIH0gZnJvbSAnd2VicGFjayc7XG5cbmNvbnN0IGdsb2JQcm9taXNlID0gcHJvbWlzaWZ5KGdsb2IpO1xuXG4vKipcbiAqIFRoZSBuYW1lIG9mIHRoZSBwbHVnaW4gcHJvdmlkZWQgdG8gV2VicGFjayB3aGVuIHRhcHBpbmcgV2VicGFjayBjb21waWxlciBob29rcy5cbiAqL1xuY29uc3QgUExVR0lOX05BTUUgPSAnYW5ndWxhci1maW5kLXRlc3RzLXBsdWdpbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmluZFRlc3RzUGx1Z2luT3B0aW9ucyB7XG4gIGluY2x1ZGU/OiBzdHJpbmdbXTtcbiAgZXhjbHVkZT86IHN0cmluZ1tdO1xuICB3b3Jrc3BhY2VSb290OiBzdHJpbmc7XG4gIHByb2plY3RTb3VyY2VSb290OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBGaW5kVGVzdHNQbHVnaW4ge1xuICBwcml2YXRlIGNvbXBpbGF0aW9uOiBDb21waWxhdGlvbiB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wdGlvbnM6IEZpbmRUZXN0c1BsdWdpbk9wdGlvbnMpIHt9XG5cbiAgYXBwbHkoY29tcGlsZXI6IENvbXBpbGVyKTogdm9pZCB7XG4gICAgY29uc3Qge1xuICAgICAgaW5jbHVkZSA9IFsnKiovKi5zcGVjLnRzJ10sXG4gICAgICBleGNsdWRlID0gW10sXG4gICAgICBwcm9qZWN0U291cmNlUm9vdCxcbiAgICAgIHdvcmtzcGFjZVJvb3QsXG4gICAgfSA9IHRoaXMub3B0aW9ucztcbiAgICBjb25zdCB3ZWJwYWNrT3B0aW9ucyA9IGNvbXBpbGVyLm9wdGlvbnM7XG4gICAgY29uc3QgZW50cnkgPVxuICAgICAgdHlwZW9mIHdlYnBhY2tPcHRpb25zLmVudHJ5ID09PSAnZnVuY3Rpb24nID8gd2VicGFja09wdGlvbnMuZW50cnkoKSA6IHdlYnBhY2tPcHRpb25zLmVudHJ5O1xuXG4gICAgbGV0IG9yaWdpbmFsSW1wb3J0OiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcblxuICAgIC8vIEFkZCB0ZXN0cyBmaWxlcyBhcmUgcGFydCBvZiB0aGUgZW50cnktcG9pbnQuXG4gICAgd2VicGFja09wdGlvbnMuZW50cnkgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBzcGVjRmlsZXMgPSBhd2FpdCBmaW5kVGVzdHMoaW5jbHVkZSwgZXhjbHVkZSwgd29ya3NwYWNlUm9vdCwgcHJvamVjdFNvdXJjZVJvb3QpO1xuICAgICAgY29uc3QgZW50cnlwb2ludHMgPSBhd2FpdCBlbnRyeTtcbiAgICAgIGNvbnN0IGVudHJ5cG9pbnQgPSBlbnRyeXBvaW50c1snbWFpbiddO1xuICAgICAgaWYgKCFlbnRyeXBvaW50LmltcG9ydCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kICdtYWluJyBlbnRyeXBvaW50LmApO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3BlY0ZpbGVzLmxlbmd0aCkge1xuICAgICAgICBvcmlnaW5hbEltcG9ydCA/Pz0gZW50cnlwb2ludC5pbXBvcnQ7XG4gICAgICAgIGVudHJ5cG9pbnQuaW1wb3J0ID0gWy4uLm9yaWdpbmFsSW1wb3J0LCAuLi5zcGVjRmlsZXNdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0KHRoaXMuY29tcGlsYXRpb24sICdDb21waWxhdGlvbiBjYW5ub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgICAgICB0aGlzLmNvbXBpbGF0aW9uXG4gICAgICAgICAgLmdldExvZ2dlcihwbHVnaW5OYW1lKVxuICAgICAgICAgIC5lcnJvcihgU3BlY2lmaWVkIHBhdHRlcm5zOiBcIiR7aW5jbHVkZS5qb2luKCcsICcpfVwiIGRpZCBub3QgbWF0Y2ggYW55IHNwZWMgZmlsZXMuYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbnRyeXBvaW50cztcbiAgICB9O1xuXG4gICAgY29tcGlsZXIuaG9va3MudGhpc0NvbXBpbGF0aW9uLnRhcChQTFVHSU5fTkFNRSwgKGNvbXBpbGF0aW9uKSA9PiB7XG4gICAgICB0aGlzLmNvbXBpbGF0aW9uID0gY29tcGlsYXRpb247XG4gICAgICBjb21waWxhdGlvbi5jb250ZXh0RGVwZW5kZW5jaWVzLmFkZChwcm9qZWN0U291cmNlUm9vdCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gZ28gdGhyb3VnaCBhbGwgcGF0dGVybnMgYW5kIGZpbmQgdW5pcXVlIGxpc3Qgb2YgZmlsZXNcbmFzeW5jIGZ1bmN0aW9uIGZpbmRUZXN0cyhcbiAgaW5jbHVkZTogc3RyaW5nW10sXG4gIGV4Y2x1ZGU6IHN0cmluZ1tdLFxuICB3b3Jrc3BhY2VSb290OiBzdHJpbmcsXG4gIHByb2plY3RTb3VyY2VSb290OiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IG1hdGNoaW5nVGVzdHNQcm9taXNlcyA9IGluY2x1ZGUubWFwKChwYXR0ZXJuKSA9PlxuICAgIGZpbmRNYXRjaGluZ1Rlc3RzKHBhdHRlcm4sIGV4Y2x1ZGUsIHdvcmtzcGFjZVJvb3QsIHByb2plY3RTb3VyY2VSb290KSxcbiAgKTtcbiAgY29uc3QgZmlsZXMgPSBhd2FpdCBQcm9taXNlLmFsbChtYXRjaGluZ1Rlc3RzUHJvbWlzZXMpO1xuXG4gIC8vIFVuaXF1ZSBmaWxlIG5hbWVzXG4gIHJldHVybiBbLi4ubmV3IFNldChmaWxlcy5mbGF0KCkpXTtcbn1cblxuY29uc3Qgbm9ybWFsaXplUGF0aCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4gcGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRNYXRjaGluZ1Rlc3RzKFxuICBwYXR0ZXJuOiBzdHJpbmcsXG4gIGlnbm9yZTogc3RyaW5nW10sXG4gIHdvcmtzcGFjZVJvb3Q6IHN0cmluZyxcbiAgcHJvamVjdFNvdXJjZVJvb3Q6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgLy8gbm9ybWFsaXplIHBhdHRlcm4sIGdsb2IgbGliIG9ubHkgYWNjZXB0cyBmb3J3YXJkIHNsYXNoZXNcbiAgbGV0IG5vcm1hbGl6ZWRQYXR0ZXJuID0gbm9ybWFsaXplUGF0aChwYXR0ZXJuKTtcbiAgaWYgKG5vcm1hbGl6ZWRQYXR0ZXJuLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgbm9ybWFsaXplZFBhdHRlcm4gPSBub3JtYWxpemVkUGF0dGVybi5zdWJzdHJpbmcoMSk7XG4gIH1cblxuICBjb25zdCByZWxhdGl2ZVByb2plY3RSb290ID0gbm9ybWFsaXplUGF0aChyZWxhdGl2ZSh3b3Jrc3BhY2VSb290LCBwcm9qZWN0U291cmNlUm9vdCkgKyAnLycpO1xuXG4gIC8vIHJlbW92ZSByZWxhdGl2ZVByb2plY3RSb290IHRvIHN1cHBvcnQgcmVsYXRpdmUgcGF0aHMgZnJvbSByb290XG4gIC8vIHN1Y2ggcGF0aHMgYXJlIGVhc3kgdG8gZ2V0IHdoZW4gcnVubmluZyBzY3JpcHRzIHZpYSBJREVzXG4gIGlmIChub3JtYWxpemVkUGF0dGVybi5zdGFydHNXaXRoKHJlbGF0aXZlUHJvamVjdFJvb3QpKSB7XG4gICAgbm9ybWFsaXplZFBhdHRlcm4gPSBub3JtYWxpemVkUGF0dGVybi5zdWJzdHJpbmcocmVsYXRpdmVQcm9qZWN0Um9vdC5sZW5ndGgpO1xuICB9XG5cbiAgLy8gc3BlY2lhbCBsb2dpYyB3aGVuIHBhdHRlcm4gZG9lcyBub3QgbG9vayBsaWtlIGEgZ2xvYlxuICBpZiAoIWhhc01hZ2ljKG5vcm1hbGl6ZWRQYXR0ZXJuKSkge1xuICAgIGlmIChhd2FpdCBpc0RpcmVjdG9yeShqb2luKHByb2plY3RTb3VyY2VSb290LCBub3JtYWxpemVkUGF0dGVybikpKSB7XG4gICAgICBub3JtYWxpemVkUGF0dGVybiA9IGAke25vcm1hbGl6ZWRQYXR0ZXJufS8qKi8qLnNwZWMuQCh0c3x0c3gpYDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc2VlIGlmIG1hdGNoaW5nIHNwZWMgZmlsZSBleGlzdHNcbiAgICAgIGNvbnN0IGZpbGVFeHQgPSBleHRuYW1lKG5vcm1hbGl6ZWRQYXR0ZXJuKTtcbiAgICAgIC8vIFJlcGxhY2UgZXh0ZW5zaW9uIHRvIGAuc3BlYy5leHRgLiBFeGFtcGxlOiBgc3JjL2FwcC9hcHAuY29tcG9uZW50LnRzYC0+IGBzcmMvYXBwL2FwcC5jb21wb25lbnQuc3BlYy50c2BcbiAgICAgIGNvbnN0IHBvdGVudGlhbFNwZWMgPSBqb2luKFxuICAgICAgICBwcm9qZWN0U291cmNlUm9vdCxcbiAgICAgICAgZGlybmFtZShub3JtYWxpemVkUGF0dGVybiksXG4gICAgICAgIGAke2Jhc2VuYW1lKG5vcm1hbGl6ZWRQYXR0ZXJuLCBmaWxlRXh0KX0uc3BlYyR7ZmlsZUV4dH1gLFxuICAgICAgKTtcblxuICAgICAgaWYgKGF3YWl0IGV4aXN0cyhwb3RlbnRpYWxTcGVjKSkge1xuICAgICAgICByZXR1cm4gW3BvdGVudGlhbFNwZWNdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBnbG9iUHJvbWlzZShub3JtYWxpemVkUGF0dGVybiwge1xuICAgIGN3ZDogcHJvamVjdFNvdXJjZVJvb3QsXG4gICAgcm9vdDogcHJvamVjdFNvdXJjZVJvb3QsXG4gICAgbm9tb3VudDogdHJ1ZSxcbiAgICBhYnNvbHV0ZTogdHJ1ZSxcbiAgICBpZ25vcmU6IFsnKiovbm9kZV9tb2R1bGVzLyoqJywgLi4uaWdub3JlXSxcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGlzRGlyZWN0b3J5KHBhdGg6IFBhdGhMaWtlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5zdGF0KHBhdGgpO1xuXG4gICAgcmV0dXJuIHN0YXRzLmlzRGlyZWN0b3J5KCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBleGlzdHMocGF0aDogUGF0aExpa2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBmcy5hY2Nlc3MocGF0aCwgY29uc3RhbnRzLkZfT0spO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19
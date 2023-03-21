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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleComponentStylesheet = exports.createStylesheetBundleOptions = void 0;
const path = __importStar(require("node:path"));
const css_resource_plugin_1 = require("./css-resource-plugin");
const esbuild_1 = require("./esbuild");
const less_plugin_1 = require("./less-plugin");
const sass_plugin_1 = require("./sass-plugin");
/**
 * A counter for component styles used to generate unique build-time identifiers for each stylesheet.
 */
let componentStyleCounter = 0;
function createStylesheetBundleOptions(options, inlineComponentData) {
    var _a, _b, _c;
    // Ensure preprocessor include paths are absolute based on the workspace root
    const includePaths = (_a = options.includePaths) === null || _a === void 0 ? void 0 : _a.map((includePath) => path.resolve(options.workspaceRoot, includePath));
    return {
        absWorkingDir: options.workspaceRoot,
        bundle: true,
        entryNames: (_b = options.outputNames) === null || _b === void 0 ? void 0 : _b.bundles,
        assetNames: (_c = options.outputNames) === null || _c === void 0 ? void 0 : _c.media,
        logLevel: 'silent',
        minify: options.optimization,
        metafile: true,
        sourcemap: options.sourcemap,
        outdir: options.workspaceRoot,
        write: false,
        platform: 'browser',
        target: options.target,
        preserveSymlinks: options.preserveSymlinks,
        external: options.externalDependencies,
        conditions: ['style', 'sass'],
        mainFields: ['style', 'sass'],
        plugins: [
            (0, sass_plugin_1.createSassPlugin)({
                sourcemap: !!options.sourcemap,
                loadPaths: includePaths,
                inlineComponentData,
            }),
            (0, less_plugin_1.createLessPlugin)({
                sourcemap: !!options.sourcemap,
                includePaths,
                inlineComponentData,
            }),
            (0, css_resource_plugin_1.createCssResourcePlugin)(),
        ],
    };
}
exports.createStylesheetBundleOptions = createStylesheetBundleOptions;
/**
 * Bundles a component stylesheet. The stylesheet can be either an inline stylesheet that
 * is contained within the Component's metadata definition or an external file referenced
 * from the Component's metadata definition.
 *
 * @param identifier A unique string identifier for the component stylesheet.
 * @param language The language of the stylesheet such as `css` or `scss`.
 * @param data The string content of the stylesheet.
 * @param filename The filename representing the source of the stylesheet content.
 * @param inline If true, the stylesheet source is within the component metadata;
 * if false, the source is a stylesheet file.
 * @param options An object containing the stylesheet bundling options.
 * @returns An object containing the output of the bundling operation.
 */
async function bundleComponentStylesheet(language, data, filename, inline, options) {
    const namespace = 'angular:styles/component';
    const entry = [language, componentStyleCounter++, filename].join(';');
    const buildOptions = createStylesheetBundleOptions(options, { [entry]: data });
    buildOptions.entryPoints = [`${namespace};${entry}`];
    buildOptions.plugins.push({
        name: 'angular-component-styles',
        setup(build) {
            build.onResolve({ filter: /^angular:styles\/component;/ }, (args) => {
                if (args.kind !== 'entry-point') {
                    return null;
                }
                if (inline) {
                    return {
                        path: entry,
                        namespace,
                    };
                }
                else {
                    return {
                        path: filename,
                    };
                }
            });
            build.onLoad({ filter: /^css;/, namespace }, async () => {
                return {
                    contents: data,
                    loader: 'css',
                    resolveDir: path.dirname(filename),
                };
            });
        },
    });
    // Execute esbuild
    const context = new esbuild_1.BundlerContext(options.workspaceRoot, false, buildOptions);
    const result = await context.bundle();
    // Extract the result of the bundling from the output files
    let contents = '';
    let map;
    let outputPath;
    const resourceFiles = [];
    if (!result.errors) {
        for (const outputFile of result.outputFiles) {
            const filename = path.basename(outputFile.path);
            if (filename.endsWith('.css')) {
                outputPath = outputFile.path;
                contents = outputFile.text;
            }
            else if (filename.endsWith('.css.map')) {
                map = outputFile.text;
            }
            else {
                // The output files could also contain resources (images/fonts/etc.) that were referenced
                resourceFiles.push(outputFile);
            }
        }
    }
    return {
        errors: result.errors,
        warnings: result.warnings,
        contents,
        map,
        path: outputPath,
        resourceFiles,
        metafile: result.errors ? undefined : result.metafile,
    };
}
exports.bundleComponentStylesheet = bundleComponentStylesheet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzaGVldHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9icm93c2VyLWVzYnVpbGQvc3R5bGVzaGVldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHSCxnREFBa0M7QUFDbEMsK0RBQWdFO0FBQ2hFLHVDQUEyQztBQUMzQywrQ0FBaUQ7QUFDakQsK0NBQWlEO0FBRWpEOztHQUVHO0FBQ0gsSUFBSSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7QUFhOUIsU0FBZ0IsNkJBQTZCLENBQzNDLE9BQWdDLEVBQ2hDLG1CQUE0Qzs7SUFFNUMsNkVBQTZFO0lBQzdFLE1BQU0sWUFBWSxHQUFHLE1BQUEsT0FBTyxDQUFDLFlBQVksMENBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUNqRCxDQUFDO0lBRUYsT0FBTztRQUNMLGFBQWEsRUFBRSxPQUFPLENBQUMsYUFBYTtRQUNwQyxNQUFNLEVBQUUsSUFBSTtRQUNaLFVBQVUsRUFBRSxNQUFBLE9BQU8sQ0FBQyxXQUFXLDBDQUFFLE9BQU87UUFDeEMsVUFBVSxFQUFFLE1BQUEsT0FBTyxDQUFDLFdBQVcsMENBQUUsS0FBSztRQUN0QyxRQUFRLEVBQUUsUUFBUTtRQUNsQixNQUFNLEVBQUUsT0FBTyxDQUFDLFlBQVk7UUFDNUIsUUFBUSxFQUFFLElBQUk7UUFDZCxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7UUFDNUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxhQUFhO1FBQzdCLEtBQUssRUFBRSxLQUFLO1FBQ1osUUFBUSxFQUFFLFNBQVM7UUFDbkIsTUFBTSxFQUFFLE9BQU8s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UUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDN0IsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQzdCLFFBQVEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO2FBQzVCO2lCQUFNLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDeEMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFDdkI7aUJBQU07Z0JBQ0wseUZBQXlGO2dCQUN6RixhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7S0FDRjtJQUVELE9BQU87UUFDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07UUFDckIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1FBQ3pCLFFBQVE7UUFDUixHQUFHO1FBQ0gsSUFBSSxFQUFFLFVBQVU7UUFDaEIsYUFBYTtRQUNiLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRO0tBQ3RELENBQUM7QUFDSixDQUFDO0FBMUVELDhEQTBFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEJ1aWxkT3B0aW9ucywgT3V0cHV0RmlsZSB9IGZyb20gJ2VzYnVpbGQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgY3JlYXRlQ3NzUmVzb3VyY2VQbHVnaW4gfSBmcm9tICcuL2Nzcy1yZXNvdXJjZS1wbHVnaW4nO1xuaW1wb3J0IHsgQnVuZGxlckNvbnRleHQgfSBmcm9tICcuL2VzYnVpbGQnO1xuaW1wb3J0IHsgY3JlYXRlTGVzc1BsdWdpbiB9IGZyb20gJy4vbGVzcy1wbHVnaW4nO1xuaW1wb3J0IHsgY3JlYXRlU2Fzc1BsdWdpbiB9IGZyb20gJy4vc2Fzcy1wbHVnaW4nO1xuXG4vKipcbiAqIEEgY291bnRlciBmb3IgY29tcG9uZW50IHN0eWxlcyB1c2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBidWlsZC10aW1lIGlkZW50aWZpZXJzIGZvciBlYWNoIHN0eWxlc2hlZXQuXG4gKi9cbmxldCBjb21wb25lbnRTdHlsZUNvdW50ZXIgPSAwO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJ1bmRsZVN0eWxlc2hlZXRPcHRpb25zIHtcbiAgd29ya3NwYWNlUm9vdDogc3RyaW5nO1xuICBvcHRpbWl6YXRpb246IGJvb2xlYW47XG4gIHByZXNlcnZlU3ltbGlua3M/OiBib29sZWFuO1xuICBzb3VyY2VtYXA6IGJvb2xlYW4gfCAnZXh0ZXJuYWwnIHwgJ2lubGluZSc7XG4gIG91dHB1dE5hbWVzPzogeyBidW5kbGVzPzogc3RyaW5nOyBtZWRpYT86IHN0cmluZyB9O1xuICBpbmNsdWRlUGF0aHM/OiBzdHJpbmdbXTtcbiAgZXh0ZXJuYWxEZXBlbmRlbmNpZXM/OiBzdHJpbmdbXTtcbiAgdGFyZ2V0OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0eWxlc2hlZXRCdW5kbGVPcHRpb25zKFxuICBvcHRpb25zOiBCdW5kbGVTdHlsZXNoZWV0T3B0aW9ucyxcbiAgaW5saW5lQ29tcG9uZW50RGF0YT86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4pOiBCdWlsZE9wdGlvbnMgJiB7IHBsdWdpbnM6IE5vbk51bGxhYmxlPEJ1aWxkT3B0aW9uc1sncGx1Z2lucyddPiB9IHtcbiAgLy8gRW5zdXJlIHByZXByb2Nlc3NvciBpbmNsdWRlIHBhdGhzIGFyZSBhYnNvbHV0ZSBiYXNlZCBvbiB0aGUgd29ya3NwYWNlIHJvb3RcbiAgY29uc3QgaW5jbHVkZVBhdGhzID0gb3B0aW9ucy5pbmNsdWRlUGF0aHM/Lm1hcCgoaW5jbHVkZVBhdGgpID0+XG4gICAgcGF0aC5yZXNvbHZlKG9wdGlvbnMud29ya3NwYWNlUm9vdCwgaW5jbHVkZVBhdGgpLFxuICApO1xuXG4gIHJldHVybiB7XG4gICAgYWJzV29ya2luZ0Rpcjogb3B0aW9ucy53b3Jrc3BhY2VSb290LFxuICAgIGJ1bmRsZTogdHJ1ZSxcbiAgICBlbnRyeU5hbWVzOiBvcHRpb25zLm91dHB1dE5hbWVzPy5idW5kbGVzLFxuICAgIGFzc2V0TmFtZXM6IG9wdGlvbnMub3V0cHV0TmFtZXM/Lm1lZGlhLFxuICAgIGxvZ0xldmVsOiAnc2lsZW50JyxcbiAgICBtaW5pZnk6IG9wdGlvbnMub3B0aW1pemF0aW9uLFxuICAgIG1ldGFmaWxlOiB0cnVlLFxuICAgIHNvdXJjZW1hcDogb3B0aW9ucy5zb3VyY2VtYXAsXG4gICAgb3V0ZGlyOiBvcHRpb25zLndvcmtzcGFjZVJvb3QsXG4gICAgd3JpdGU6IGZhbHNlLFxuICAgIHBsYXRmb3JtOiAnYnJvd3NlcicsXG4gICAgdGFyZ2V0OiBvcHRpb25zLnRhcmdldCxcbiAgICBwcmVzZXJ2ZVN5bWxpbmtzOiBvcHRpb25zLnByZXNlcnZlU3ltbGlua3MsXG4gICAgZXh0ZXJuYWw6IG9wdGlvbnMuZXh0ZXJuYWxEZXBlbmRlbmNpZXMsXG4gICAgY29uZGl0aW9uczogWydzdHlsZScsICdzYXNzJ10sXG4gICAgbWFpbkZpZWxkczogWydzdHlsZScsICdzYXNzJ10sXG4gICAgcGx1Z2luczogW1xuICAgICAgY3JlYXRlU2Fzc1BsdWdpbih7XG4gICAgICAgIHNvdXJjZW1hcDogISFvcHRpb25zLnNvdXJjZW1hcCxcbiAgICAgICAgbG9hZFBhdGhzOiBpbmNsdWRlUGF0aHMsXG4gICAgICAgIGlubGluZUNvbXBvbmVudERhdGEsXG4gICAgICB9KSxcbiAgICAgIGNyZWF0ZUxlc3NQbHVnaW4oe1xuICAgICAgICBzb3VyY2VtYXA6ICEhb3B0aW9ucy5zb3VyY2VtYXAsXG4gICAgICAgIGluY2x1ZGVQYXRocyxcbiAgICAgICAgaW5saW5lQ29tcG9uZW50RGF0YSxcbiAgICAgIH0pLFxuICAgICAgY3JlYXRlQ3NzUmVzb3VyY2VQbHVnaW4oKSxcbiAgICBdLFxuICB9O1xufVxuXG4vKipcbiAqIEJ1bmRsZXMgYSBjb21wb25lbnQgc3R5bGVzaGVldC4gVGhlIHN0eWxlc2hlZXQgY2FuIGJlIGVpdGhlciBhbiBpbmxpbmUgc3R5bGVzaGVldCB0aGF0XG4gKiBpcyBjb250YWluZWQgd2l0aGluIHRoZSBDb21wb25lbnQncyBtZXRhZGF0YSBkZWZpbml0aW9uIG9yIGFuIGV4dGVybmFsIGZpbGUgcmVmZXJlbmNlZFxuICogZnJvbSB0aGUgQ29tcG9uZW50J3MgbWV0YWRhdGEgZGVmaW5pdGlvbi5cbiAqXG4gKiBAcGFyYW0gaWRlbnRpZmllciBBIHVuaXF1ZSBzdHJpbmcgaWRlbnRpZmllciBmb3IgdGhlIGNvbXBvbmVudCBzdHlsZXNoZWV0LlxuICogQHBhcmFtIGxhbmd1YWdlIFRoZSBsYW5ndWFnZSBvZiB0aGUgc3R5bGVzaGVldCBzdWNoIGFzIGBjc3NgIG9yIGBzY3NzYC5cbiAqIEBwYXJhbSBkYXRhIFRoZSBzdHJpbmcgY29udGVudCBvZiB0aGUgc3R5bGVzaGVldC5cbiAqIEBwYXJhbSBmaWxlbmFtZSBUaGUgZmlsZW5hbWUgcmVwcmVzZW50aW5nIHRoZSBzb3VyY2Ugb2YgdGhlIHN0eWxlc2hlZXQgY29udGVudC5cbiAqIEBwYXJhbSBpbmxpbmUgSWYgdHJ1ZSwgdGhlIHN0eWxlc2hlZXQgc291cmNlIGlzIHdpdGhpbiB0aGUgY29tcG9uZW50IG1ldGFkYXRhO1xuICogaWYgZmFsc2UsIHRoZSBzb3VyY2UgaXMgYSBzdHlsZXNoZWV0IGZpbGUuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgc3R5bGVzaGVldCBidW5kbGluZyBvcHRpb25zLlxuICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG91dHB1dCBvZiB0aGUgYnVuZGxpbmcgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVuZGxlQ29tcG9uZW50U3R5bGVzaGVldChcbiAgbGFuZ3VhZ2U6IHN0cmluZyxcbiAgZGF0YTogc3RyaW5nLFxuICBmaWxlbmFtZTogc3RyaW5nLFxuICBpbmxpbmU6IGJvb2xlYW4sXG4gIG9wdGlvbnM6IEJ1bmRsZVN0eWxlc2hlZXRPcHRpb25zLFxuKSB7XG4gIGNvbnN0IG5hbWVzcGFjZSA9ICdhbmd1bGFyOnN0eWxlcy9jb21wb25lbnQnO1xuICBjb25zdCBlbnRyeSA9IFtsYW5ndWFnZSwgY29tcG9uZW50U3R5bGVDb3VudGVyKyssIGZpbGVuYW1lXS5qb2luKCc7Jyk7XG5cbiAgY29uc3QgYnVpbGRPcHRpb25zID0gY3JlYXRlU3R5bGVzaGVldEJ1bmRsZU9wdGlvbnMob3B0aW9ucywgeyBbZW50cnldOiBkYXRhIH0pO1xuICBidWlsZE9wdGlvbnMuZW50cnlQb2ludHMgPSBbYCR7bmFtZXNwYWNlfTske2VudHJ5fWBdO1xuICBidWlsZE9wdGlvbnMucGx1Z2lucy5wdXNoKHtcbiAgICBuYW1lOiAnYW5ndWxhci1jb21wb25lbnQtc3R5bGVzJyxcbiAgICBzZXR1cChidWlsZCkge1xuICAgICAgYnVpbGQub25SZXNvbHZlKHsgZmlsdGVyOiAvXmFuZ3VsYXI6c3R5bGVzXFwvY29tcG9uZW50Oy8gfSwgKGFyZ3MpID0+IHtcbiAgICAgICAgaWYgKGFyZ3Mua2luZCAhPT0gJ2VudHJ5LXBvaW50Jykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlubGluZSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXRoOiBlbnRyeSxcbiAgICAgICAgICAgIG5hbWVzcGFjZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXRoOiBmaWxlbmFtZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogL15jc3M7LywgbmFtZXNwYWNlIH0sIGFzeW5jICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb250ZW50czogZGF0YSxcbiAgICAgICAgICBsb2FkZXI6ICdjc3MnLFxuICAgICAgICAgIHJlc29sdmVEaXI6IHBhdGguZGlybmFtZShmaWxlbmFtZSksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBFeGVjdXRlIGVzYnVpbGRcbiAgY29uc3QgY29udGV4dCA9IG5ldyBCdW5kbGVyQ29udGV4dChvcHRpb25zLndvcmtzcGFjZVJvb3QsIGZhbHNlLCBidWlsZE9wdGlvbnMpO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb250ZXh0LmJ1bmRsZSgpO1xuXG4gIC8vIEV4dHJhY3QgdGhlIHJlc3VsdCBvZiB0aGUgYnVuZGxpbmcgZnJvbSB0aGUgb3V0cHV0IGZpbGVzXG4gIGxldCBjb250ZW50cyA9ICcnO1xuICBsZXQgbWFwO1xuICBsZXQgb3V0cHV0UGF0aDtcbiAgY29uc3QgcmVzb3VyY2VGaWxlczogT3V0cHV0RmlsZVtdID0gW107XG4gIGlmICghcmVzdWx0LmVycm9ycykge1xuICAgIGZvciAoY29uc3Qgb3V0cHV0RmlsZSBvZiByZXN1bHQub3V0cHV0RmlsZXMpIHtcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShvdXRwdXRGaWxlLnBhdGgpO1xuICAgICAgaWYgKGZpbGVuYW1lLmVuZHNXaXRoKCcuY3NzJykpIHtcbiAgICAgICAgb3V0cHV0UGF0aCA9IG91dHB1dEZpbGUucGF0aDtcbiAgICAgICAgY29udGVudHMgPSBvdXRwdXRGaWxlLnRleHQ7XG4gICAgICB9IGVsc2UgaWYgKGZpbGVuYW1lLmVuZHNXaXRoKCcuY3NzLm1hcCcpKSB7XG4gICAgICAgIG1hcCA9IG91dHB1dEZpbGUudGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBvdXRwdXQgZmlsZXMgY291bGQgYWxzbyBjb250YWluIHJlc291cmNlcyAoaW1hZ2VzL2ZvbnRzL2V0Yy4pIHRoYXQgd2VyZSByZWZlcmVuY2VkXG4gICAgICAgIHJlc291cmNlRmlsZXMucHVzaChvdXRwdXRGaWxlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVycm9yczogcmVzdWx0LmVycm9ycyxcbiAgICB3YXJuaW5nczogcmVzdWx0Lndhcm5pbmdzLFxuICAgIGNvbnRlbnRzLFxuICAgIG1hcCxcbiAgICBwYXRoOiBvdXRwdXRQYXRoLFxuICAgIHJlc291cmNlRmlsZXMsXG4gICAgbWV0YWZpbGU6IHJlc3VsdC5lcnJvcnMgPyB1bmRlZmluZWQgOiByZXN1bHQubWV0YWZpbGUsXG4gIH07XG59XG4iXX0=
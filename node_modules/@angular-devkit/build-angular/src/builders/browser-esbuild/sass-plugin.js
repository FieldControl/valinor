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
exports.createSassPlugin = exports.shutdownSassWorkerPool = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const sass_service_1 = require("../../sass/sass-service");
let sassWorkerPool;
function isSassException(error) {
    return !!error && typeof error === 'object' && 'sassMessage' in error;
}
function shutdownSassWorkerPool() {
    sassWorkerPool === null || sassWorkerPool === void 0 ? void 0 : sassWorkerPool.close();
    sassWorkerPool = undefined;
}
exports.shutdownSassWorkerPool = shutdownSassWorkerPool;
function createSassPlugin(options) {
    return {
        name: 'angular-sass',
        setup(build) {
            const resolveUrl = async (url, previousResolvedModules) => {
                let result = await build.resolve(url, {
                    kind: 'import-rule',
                    // This should ideally be the directory of the importer file from Sass
                    // but that is not currently available from the Sass importer API.
                    resolveDir: build.initialOptions.absWorkingDir,
                });
                // Workaround to support Yarn PnP without access to the importer file from Sass
                if (!result.path && (previousResolvedModules === null || previousResolvedModules === void 0 ? void 0 : previousResolvedModules.size)) {
                    for (const previous of previousResolvedModules) {
                        result = await build.resolve(url, {
                            kind: 'import-rule',
                            resolveDir: previous,
                        });
                        if (result.path) {
                            break;
                        }
                    }
                }
                return result;
            };
            build.onLoad({ filter: /^s[ac]ss;/, namespace: 'angular:styles/component' }, async (args) => {
                var _a;
                const data = (_a = options.inlineComponentData) === null || _a === void 0 ? void 0 : _a[args.path];
                (0, node_assert_1.default)(data, `component style name should always be found [${args.path}]`);
                const [language, , filePath] = args.path.split(';', 3);
                const syntax = language === 'sass' ? 'indented' : 'scss';
                return compileString(data, filePath, syntax, options, resolveUrl);
            });
            build.onLoad({ filter: /\.s[ac]ss$/ }, async (args) => {
                const data = await (0, promises_1.readFile)(args.path, 'utf-8');
                const syntax = (0, node_path_1.extname)(args.path).toLowerCase() === '.sass' ? 'indented' : 'scss';
                return compileString(data, args.path, syntax, options, resolveUrl);
            });
        },
    };
}
exports.createSassPlugin = createSassPlugin;
async function compileString(data, filePath, syntax, options, resolveUrl) {
    // Lazily load Sass when a Sass file is found
    sassWorkerPool !== null && sassWorkerPool !== void 0 ? sassWorkerPool : (sassWorkerPool = new sass_service_1.SassWorkerImplementation(true));
    const warnings = [];
    try {
        const { css, sourceMap, loadedUrls } = await sassWorkerPool.compileStringAsync(data, {
            url: (0, node_url_1.pathToFileURL)(filePath),
            style: 'expanded',
            syntax,
            loadPaths: options.loadPaths,
            sourceMap: options.sourcemap,
            sourceMapIncludeSources: options.sourcemap,
            quietDeps: true,
            importers: [
                {
                    findFileUrl: async (url, { previousResolvedModules }) => {
                        const result = await resolveUrl(url, previousResolvedModules);
                        // Check for package deep imports
                        if (!result.path) {
                            const parts = url.split('/');
                            const hasScope = parts.length >= 2 && parts[0].startsWith('@');
                            const [nameOrScope, nameOrFirstPath, ...pathPart] = parts;
                            const packageName = hasScope ? `${nameOrScope}/${nameOrFirstPath}` : nameOrScope;
                            const packageResult = await resolveUrl(packageName + '/package.json', previousResolvedModules);
                            if (packageResult.path) {
                                return (0, node_url_1.pathToFileURL)((0, node_path_1.join)((0, node_path_1.dirname)(packageResult.path), !hasScope && nameOrFirstPath ? nameOrFirstPath : '', ...pathPart));
                            }
                        }
                        return result.path ? (0, node_url_1.pathToFileURL)(result.path) : null;
                    },
                },
            ],
            logger: {
                warn: (text, { deprecation, span }) => {
                    warnings.push({
                        text: deprecation ? 'Deprecation' : text,
                        location: span && {
                            file: span.url && (0, node_url_1.fileURLToPath)(span.url),
                            lineText: span.context,
                            // Sass line numbers are 0-based while esbuild's are 1-based
                            line: span.start.line + 1,
                            column: span.start.column,
                        },
                        notes: deprecation ? [{ text }] : undefined,
                    });
                },
            },
        });
        return {
            loader: 'css',
            contents: sourceMap ? `${css}\n${sourceMapToUrlComment(sourceMap, (0, node_path_1.dirname)(filePath))}` : css,
            watchFiles: loadedUrls.map((url) => (0, node_url_1.fileURLToPath)(url)),
            warnings,
        };
    }
    catch (error) {
        if (isSassException(error)) {
            const file = error.span.url ? (0, node_url_1.fileURLToPath)(error.span.url) : undefined;
            return {
                loader: 'css',
                errors: [
                    {
                        text: error.message,
                    },
                ],
                warnings,
                watchFiles: file ? [file] : undefined,
            };
        }
        throw error;
    }
}
function sourceMapToUrlComment(sourceMap, root) {
    // Remove `file` protocol from all sourcemap sources and adjust to be relative to the input file.
    // This allows esbuild to correctly process the paths.
    sourceMap.sources = sourceMap.sources.map((source) => (0, node_path_1.relative)(root, (0, node_url_1.fileURLToPath)(source)));
    const urlSourceMap = Buffer.from(JSON.stringify(sourceMap), 'utf-8').toString('base64');
    return `/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${urlSourceMap} */`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Fzcy1wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9icm93c2VyLWVzYnVpbGQvc2Fzcy1wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7O0FBR0gsOERBQWlDO0FBQ2pDLCtDQUE0QztBQUM1Qyx5Q0FBNkQ7QUFDN0QsdUNBQXdEO0FBRXhELDBEQUdpQztBQVFqQyxJQUFJLGNBQW9ELENBQUM7QUFFekQsU0FBUyxlQUFlLENBQUMsS0FBYztJQUNyQyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLGFBQWEsSUFBSSxLQUFLLENBQUM7QUFDeEUsQ0FBQztBQUVELFNBQWdCLHNCQUFzQjtJQUNwQyxjQUFjLGFBQWQsY0FBYyx1QkFBZCxjQUFjLENBQUUsS0FBSyxFQUFFLENBQUM7SUFDeEIsY0FBYyxHQUFHLFNBQVMsQ0FBQztBQUM3QixDQUFDO0FBSEQsd0RBR0M7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxPQUEwQjtJQUN6RCxPQUFPO1FBQ0wsSUFBSSxFQUFFLGNBQWM7UUFDcEIsS0FBSyxDQUFDLEtBQWtCO1lBQ3RCLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxHQUFXLEVBQUUsdUJBQXFDLEVBQUUsRUFBRTtnQkFDOUUsSUFBSSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtvQkFDcEMsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLHNFQUFzRTtvQkFDdEUsa0VBQWtFO29CQUNsRSxVQUFVLEVBQUUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxhQUFhO2lCQUMvQyxDQUFDLENBQUM7Z0JBRUgsK0VBQStFO2dCQUMvRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSSx1QkFBdUIs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QUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUEsd0JBQWEsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFFeEUsT0FBTztnQkFDTCxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUU7b0JBQ047d0JBQ0UsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPO3FCQUNwQjtpQkFDRjtnQkFDRCxRQUFRO2dCQUNSLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDdEMsQ0FBQztTQUNIO1FBRUQsTUFBTSxLQUFLLENBQUM7S0FDYjtBQUNILENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUM1QixTQUF5RCxFQUN6RCxJQUFZO0lBRVosaUdBQWlHO0lBQ2pHLHNEQUFzRDtJQUN0RCxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFBLG9CQUFRLEVBQUMsSUFBSSxFQUFFLElBQUEsd0JBQWEsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0YsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV4RixPQUFPLG1FQUFtRSxZQUFZLEtBQUssQ0FBQztBQUM5RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB0eXBlIHsgT25Mb2FkUmVzdWx0LCBQYXJ0aWFsTWVzc2FnZSwgUGx1Z2luLCBQbHVnaW5CdWlsZCwgUmVzb2x2ZVJlc3VsdCB9IGZyb20gJ2VzYnVpbGQnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdub2RlOmFzc2VydCc7XG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuaW1wb3J0IHsgZGlybmFtZSwgZXh0bmFtZSwgam9pbiwgcmVsYXRpdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB0eXBlIHsgQ29tcGlsZVJlc3VsdCwgRXhjZXB0aW9uLCBTeW50YXggfSBmcm9tICdzYXNzJztcbmltcG9ydCB7XG4gIEZpbGVJbXBvcnRlcldpdGhSZXF1ZXN0Q29udGV4dE9wdGlvbnMsXG4gIFNhc3NXb3JrZXJJbXBsZW1lbnRhdGlvbixcbn0gZnJvbSAnLi4vLi4vc2Fzcy9zYXNzLXNlcnZpY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhc3NQbHVnaW5PcHRpb25zIHtcbiAgc291cmNlbWFwOiBib29sZWFuO1xuICBsb2FkUGF0aHM/OiBzdHJpbmdbXTtcbiAgaW5saW5lQ29tcG9uZW50RGF0YT86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmxldCBzYXNzV29ya2VyUG9vbDogU2Fzc1dvcmtlckltcGxlbWVudGF0aW9uIHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1Nhc3NFeGNlcHRpb24oZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFeGNlcHRpb24ge1xuICByZXR1cm4gISFlcnJvciAmJiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmICdzYXNzTWVzc2FnZScgaW4gZXJyb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaHV0ZG93blNhc3NXb3JrZXJQb29sKCk6IHZvaWQge1xuICBzYXNzV29ya2VyUG9vbD8uY2xvc2UoKTtcbiAgc2Fzc1dvcmtlclBvb2wgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTYXNzUGx1Z2luKG9wdGlvbnM6IFNhc3NQbHVnaW5PcHRpb25zKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnYW5ndWxhci1zYXNzJyxcbiAgICBzZXR1cChidWlsZDogUGx1Z2luQnVpbGQpOiB2b2lkIHtcbiAgICAgIGNvbnN0IHJlc29sdmVVcmwgPSBhc3luYyAodXJsOiBzdHJpbmcsIHByZXZpb3VzUmVzb2x2ZWRNb2R1bGVzPzogU2V0PHN0cmluZz4pID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IGJ1aWxkLnJlc29sdmUodXJsLCB7XG4gICAgICAgICAga2luZDogJ2ltcG9ydC1ydWxlJyxcbiAgICAgICAgICAvLyBUaGlzIHNob3VsZCBpZGVhbGx5IGJlIHRoZSBkaXJlY3Rvcnkgb2YgdGhlIGltcG9ydGVyIGZpbGUgZnJvbSBTYXNzXG4gICAgICAgICAgLy8gYnV0IHRoYXQgaXMgbm90IGN1cnJlbnRseSBhdmFpbGFibGUgZnJvbSB0aGUgU2FzcyBpbXBvcnRlciBBUEkuXG4gICAgICAgICAgcmVzb2x2ZURpcjogYnVpbGQuaW5pdGlhbE9wdGlvbnMuYWJzV29ya2luZ0RpcixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCB0byBzdXBwb3J0IFlhcm4gUG5QIHdpdGhvdXQgYWNjZXNzIHRvIHRoZSBpbXBvcnRlciBmaWxlIGZyb20gU2Fzc1xuICAgICAgICBpZiAoIXJlc3VsdC5wYXRoICYmIHByZXZpb3VzUmVzb2x2ZWRNb2R1bGVzPy5zaXplKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBwcmV2aW91cyBvZiBwcmV2aW91c1Jlc29sdmVkTW9kdWxlcykge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgYnVpbGQucmVzb2x2ZSh1cmwsIHtcbiAgICAgICAgICAgICAga2luZDogJ2ltcG9ydC1ydWxlJyxcbiAgICAgICAgICAgICAgcmVzb2x2ZURpcjogcHJldmlvdXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQucGF0aCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcblxuICAgICAgYnVpbGQub25Mb2FkKHsgZmlsdGVyOiAvXnNbYWNdc3M7LywgbmFtZXNwYWNlOiAnYW5ndWxhcjpzdHlsZXMvY29tcG9uZW50JyB9LCBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gb3B0aW9ucy5pbmxpbmVDb21wb25lbnREYXRhPy5bYXJncy5wYXRoXTtcbiAgICAgICAgYXNzZXJ0KGRhdGEsIGBjb21wb25lbnQgc3R5bGUgbmFtZSBzaG91bGQgYWx3YXlzIGJlIGZvdW5kIFske2FyZ3MucGF0aH1dYCk7XG5cbiAgICAgICAgY29uc3QgW2xhbmd1YWdlLCAsIGZpbGVQYXRoXSA9IGFyZ3MucGF0aC5zcGxpdCgnOycsIDMpO1xuICAgICAgICBjb25zdCBzeW50YXggPSBsYW5ndWFnZSA9PT0gJ3Nhc3MnID8gJ2luZGVudGVkJyA6ICdzY3NzJztcblxuICAgICAgICByZXR1cm4gY29tcGlsZVN0cmluZyhkYXRhLCBmaWxlUGF0aCwgc3ludGF4LCBvcHRpb25zLCByZXNvbHZlVXJsKTtcbiAgICAgIH0pO1xuXG4gICAgICBidWlsZC5vbkxvYWQoeyBmaWx0ZXI6IC9cXC5zW2FjXXNzJC8gfSwgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlYWRGaWxlKGFyZ3MucGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIGNvbnN0IHN5bnRheCA9IGV4dG5hbWUoYXJncy5wYXRoKS50b0xvd2VyQ2FzZSgpID09PSAnLnNhc3MnID8gJ2luZGVudGVkJyA6ICdzY3NzJztcblxuICAgICAgICByZXR1cm4gY29tcGlsZVN0cmluZyhkYXRhLCBhcmdzLnBhdGgsIHN5bnRheCwgb3B0aW9ucywgcmVzb2x2ZVVybCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb21waWxlU3RyaW5nKFxuICBkYXRhOiBzdHJpbmcsXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIHN5bnRheDogU3ludGF4LFxuICBvcHRpb25zOiBTYXNzUGx1Z2luT3B0aW9ucyxcbiAgcmVzb2x2ZVVybDogKHVybDogc3RyaW5nLCBwcmV2aW91c1Jlc29sdmVkTW9kdWxlcz86IFNldDxzdHJpbmc+KSA9PiBQcm9taXNlPFJlc29sdmVSZXN1bHQ+LFxuKTogUHJvbWlzZTxPbkxvYWRSZXN1bHQ+IHtcbiAgLy8gTGF6aWx5IGxvYWQgU2FzcyB3aGVuIGEgU2FzcyBmaWxlIGlzIGZvdW5kXG4gIHNhc3NXb3JrZXJQb29sID8/PSBuZXcgU2Fzc1dvcmtlckltcGxlbWVudGF0aW9uKHRydWUpO1xuXG4gIGNvbnN0IHdhcm5pbmdzOiBQYXJ0aWFsTWVzc2FnZVtdID0gW107XG4gIHRyeSB7XG4gICAgY29uc3QgeyBjc3MsIHNvdXJjZU1hcCwgbG9hZGVkVXJscyB9ID0gYXdhaXQgc2Fzc1dvcmtlclBvb2wuY29tcGlsZVN0cmluZ0FzeW5jKGRhdGEsIHtcbiAgICAgIHVybDogcGF0aFRvRmlsZVVSTChmaWxlUGF0aCksXG4gICAgICBzdHlsZTogJ2V4cGFuZGVkJyxcbiAgICAgIHN5bnRheCxcbiAgICAgIGxvYWRQYXRoczogb3B0aW9ucy5sb2FkUGF0aHMsXG4gICAgICBzb3VyY2VNYXA6IG9wdGlvbnMuc291cmNlbWFwLFxuICAgICAgc291cmNlTWFwSW5jbHVkZVNvdXJjZXM6IG9wdGlvbnMuc291cmNlbWFwLFxuICAgICAgcXVpZXREZXBzOiB0cnVlLFxuICAgICAgaW1wb3J0ZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmaW5kRmlsZVVybDogYXN5bmMgKFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgeyBwcmV2aW91c1Jlc29sdmVkTW9kdWxlcyB9OiBGaWxlSW1wb3J0ZXJXaXRoUmVxdWVzdENvbnRleHRPcHRpb25zLFxuICAgICAgICAgICk6IFByb21pc2U8VVJMIHwgbnVsbD4gPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzb2x2ZVVybCh1cmwsIHByZXZpb3VzUmVzb2x2ZWRNb2R1bGVzKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHBhY2thZ2UgZGVlcCBpbXBvcnRzXG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5wYXRoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBhcnRzID0gdXJsLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgIGNvbnN0IGhhc1Njb3BlID0gcGFydHMubGVuZ3RoID49IDIgJiYgcGFydHNbMF0uc3RhcnRzV2l0aCgnQCcpO1xuICAgICAgICAgICAgICBjb25zdCBbbmFtZU9yU2NvcGUsIG5hbWVPckZpcnN0UGF0aCwgLi4ucGF0aFBhcnRdID0gcGFydHM7XG4gICAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gaGFzU2NvcGUgPyBgJHtuYW1lT3JTY29wZX0vJHtuYW1lT3JGaXJzdFBhdGh9YCA6IG5hbWVPclNjb3BlO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VSZXN1bHQgPSBhd2FpdCByZXNvbHZlVXJsKFxuICAgICAgICAgICAgICAgIHBhY2thZ2VOYW1lICsgJy9wYWNrYWdlLmpzb24nLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzUmVzb2x2ZWRNb2R1bGVzLFxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIGlmIChwYWNrYWdlUmVzdWx0LnBhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aFRvRmlsZVVSTChcbiAgICAgICAgICAgICAgICAgIGpvaW4oXG4gICAgICAgICAgICAgICAgICAgIGRpcm5hbWUocGFja2FnZVJlc3VsdC5wYXRoKSxcbiAgICAgICAgICAgICAgICAgICAgIWhhc1Njb3BlICYmIG5hbWVPckZpcnN0UGF0aCA/IG5hbWVPckZpcnN0UGF0aCA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAuLi5wYXRoUGFydCxcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnBhdGggPyBwYXRoVG9GaWxlVVJMKHJlc3VsdC5wYXRoKSA6IG51bGw7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBsb2dnZXI6IHtcbiAgICAgICAgd2FybjogKHRleHQsIHsgZGVwcmVjYXRpb24sIHNwYW4gfSkgPT4ge1xuICAgICAgICAgIHdhcm5pbmdzLnB1c2goe1xuICAgICAgICAgICAgdGV4dDogZGVwcmVjYXRpb24gPyAnRGVwcmVjYXRpb24nIDogdGV4dCxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBzcGFuICYmIHtcbiAgICAgICAgICAgICAgZmlsZTogc3Bhbi51cmwgJiYgZmlsZVVSTFRvUGF0aChzcGFuLnVybCksXG4gICAgICAgICAgICAgIGxpbmVUZXh0OiBzcGFuLmNvbnRleHQsXG4gICAgICAgICAgICAgIC8vIFNhc3MgbGluZSBudW1iZXJzIGFyZSAwLWJhc2VkIHdoaWxlIGVzYnVpbGQncyBhcmUgMS1iYXNlZFxuICAgICAgICAgICAgICBsaW5lOiBzcGFuLnN0YXJ0LmxpbmUgKyAxLFxuICAgICAgICAgICAgICBjb2x1bW46IHNwYW4uc3RhcnQuY29sdW1uLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5vdGVzOiBkZXByZWNhdGlvbiA/IFt7IHRleHQgfV0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxvYWRlcjogJ2NzcycsXG4gICAgICBjb250ZW50czogc291cmNlTWFwID8gYCR7Y3NzfVxcbiR7c291cmNlTWFwVG9VcmxDb21tZW50KHNvdXJjZU1hcCwgZGlybmFtZShmaWxlUGF0aCkpfWAgOiBjc3MsXG4gICAgICB3YXRjaEZpbGVzOiBsb2FkZWRVcmxzLm1hcCgodXJsKSA9PiBmaWxlVVJMVG9QYXRoKHVybCkpLFxuICAgICAgd2FybmluZ3MsXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoaXNTYXNzRXhjZXB0aW9uKGVycm9yKSkge1xuICAgICAgY29uc3QgZmlsZSA9IGVycm9yLnNwYW4udXJsID8gZmlsZVVSTFRvUGF0aChlcnJvci5zcGFuLnVybCkgOiB1bmRlZmluZWQ7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxvYWRlcjogJ2NzcycsXG4gICAgICAgIGVycm9yczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgd2FybmluZ3MsXG4gICAgICAgIHdhdGNoRmlsZXM6IGZpbGUgPyBbZmlsZV0gOiB1bmRlZmluZWQsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNvdXJjZU1hcFRvVXJsQ29tbWVudChcbiAgc291cmNlTWFwOiBFeGNsdWRlPENvbXBpbGVSZXN1bHRbJ3NvdXJjZU1hcCddLCB1bmRlZmluZWQ+LFxuICByb290OiBzdHJpbmcsXG4pOiBzdHJpbmcge1xuICAvLyBSZW1vdmUgYGZpbGVgIHByb3RvY29sIGZyb20gYWxsIHNvdXJjZW1hcCBzb3VyY2VzIGFuZCBhZGp1c3QgdG8gYmUgcmVsYXRpdmUgdG8gdGhlIGlucHV0IGZpbGUuXG4gIC8vIFRoaXMgYWxsb3dzIGVzYnVpbGQgdG8gY29ycmVjdGx5IHByb2Nlc3MgdGhlIHBhdGhzLlxuICBzb3VyY2VNYXAuc291cmNlcyA9IHNvdXJjZU1hcC5zb3VyY2VzLm1hcCgoc291cmNlKSA9PiByZWxhdGl2ZShyb290LCBmaWxlVVJMVG9QYXRoKHNvdXJjZSkpKTtcblxuICBjb25zdCB1cmxTb3VyY2VNYXAgPSBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApLCAndXRmLTgnKS50b1N0cmluZygnYmFzZTY0Jyk7XG5cbiAgcmV0dXJuIGAvKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJHt1cmxTb3VyY2VNYXB9ICovYDtcbn1cbiJdfQ==
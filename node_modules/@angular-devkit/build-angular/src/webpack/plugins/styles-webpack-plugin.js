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
exports.StylesWebpackPlugin = void 0;
const assert_1 = __importDefault(require("assert"));
const error_1 = require("../../utils/error");
const webpack_diagnostics_1 = require("../../utils/webpack-diagnostics");
/**
 * The name of the plugin provided to Webpack when tapping Webpack compiler hooks.
 */
const PLUGIN_NAME = 'styles-webpack-plugin';
class StylesWebpackPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        const { entryPoints, preserveSymlinks, root } = this.options;
        const resolver = compiler.resolverFactory.get('global-styles', {
            conditionNames: ['sass', 'less', 'style'],
            mainFields: ['sass', 'less', 'style', 'main', '...'],
            extensions: ['.scss', '.sass', '.less', '.css'],
            restrictions: [/\.((le|sa|sc|c)ss)$/i],
            preferRelative: true,
            useSyncFileSystemCalls: true,
            symlinks: !preserveSymlinks,
            fileSystem: compiler.inputFileSystem,
        });
        const webpackOptions = compiler.options;
        compiler.hooks.environment.tap(PLUGIN_NAME, () => {
            const entry = typeof webpackOptions.entry === 'function' ? webpackOptions.entry() : webpackOptions.entry;
            webpackOptions.entry = async () => {
                var _a, _b;
                var _c;
                const entrypoints = await entry;
                for (const [bundleName, paths] of Object.entries(entryPoints)) {
                    (_a = entrypoints[bundleName]) !== null && _a !== void 0 ? _a : (entrypoints[bundleName] = {});
                    const entryImport = ((_b = (_c = entrypoints[bundleName]).import) !== null && _b !== void 0 ? _b : (_c.import = []));
                    for (const path of paths) {
                        try {
                            const resolvedPath = resolver.resolveSync({}, root, path);
                            if (resolvedPath) {
                                entryImport.push(`${resolvedPath}?ngGlobalStyle`);
                            }
                            else {
                                (0, assert_1.default)(this.compilation, 'Compilation cannot be undefined.');
                                (0, webpack_diagnostics_1.addError)(this.compilation, `Cannot resolve '${path}'.`);
                            }
                        }
                        catch (error) {
                            (0, assert_1.default)(this.compilation, 'Compilation cannot be undefined.');
                            (0, error_1.assertIsError)(error);
                            (0, webpack_diagnostics_1.addError)(this.compilation, error.message);
                        }
                    }
                }
                return entrypoints;
            };
        });
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            this.compilation = compilation;
        });
    }
}
exports.StylesWebpackPlugin = StylesWebpackPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLXdlYnBhY2stcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvd2VicGFjay9wbHVnaW5zL3N0eWxlcy13ZWJwYWNrLXBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7QUFFSCxvREFBNEI7QUFFNUIsNkNBQWtEO0FBQ2xELHlFQUEyRDtBQVEzRDs7R0FFRztBQUNILE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDO0FBRTVDLE1BQWEsbUJBQW1CO0lBRzlCLFlBQTZCLE9BQW1DO1FBQW5DLFlBQU8sR0FBUCxPQUFPLENBQTRCO0lBQUcsQ0FBQztJQUVwRSxLQUFLLENBQUMsUUFBa0I7UUFDdEIsTUFBTSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzdELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRTtZQUM3RCxjQUFjLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztZQUN6QyxVQUFVLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ3BELFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztZQUMvQyxZQUFZLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztZQUN0QyxjQUFjLEVBQUUsSUFBSTtZQUNwQixzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLFFBQVEsRUFBRSxDQUFDLGdCQUFnQjtZQUMzQixVQUFVLEVBQUUsUUFBUSxDQUFDLGVBQWU7U0FDckMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUN4QyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtZQUMvQyxNQUFNLEtBQUssR0FDVCxPQUFPLGNBQWMsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7WUFFN0YsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFLLElBQUksRUFBRTs7O2dCQUNoQyxNQUFNLFdBQVcsR0FBRyxNQUFNLEtBQUssQ0FBQztnQkFFaEMsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQzdELE1BQUEsV0FBVyxDQUFDLFVBQVUscUNBQXRCLFdBQVcsQ0FBQyxVQUFVLElBQU0sRUFBRSxFQUFDO29CQUMvQixNQUFNLFdBQVcsR0FBRyxhQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBQyxNQUFNLHVDQUFOLE1BQU0sR0FBSyxFQUFFLEVBQUMsQ0FBQztvQkFFNUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7d0JBQ3hCLElBQUk7NEJBQ0YsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUMxRCxJQUFJLFlBQVksRUFBRTtnQ0FDaEIsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksZ0JBQWdCLENBQUMsQ0FBQzs2QkFDbkQ7aUNBQU07Z0NBQ0wsSUFBQSxnQkFBTSxFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztnQ0FDN0QsSUFBQSw4QkFBUSxFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLElBQUksSUFBSSxDQUFDLENBQUM7NkJBQ3pEO3lCQUNGO3dCQUFDLE9BQU8sS0FBSyxFQUFFOzRCQUNkLElBQUEsZ0JBQU0sRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7NEJBQzdELElBQUEscUJBQWEsRUFBQyxLQUFLLENBQUMsQ0FBQzs0QkFDckIsSUFBQSw4QkFBUSxFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3lCQUMzQztxQkFDRjtpQkFDRjtnQkFFRCxPQUFPLFdBQVcsQ0FBQztZQUNyQixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUM5RCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXZERCxrREF1REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHR5cGUgeyBDb21waWxhdGlvbiwgQ29tcGlsZXIgfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IGFzc2VydElzRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcic7XG5pbXBvcnQgeyBhZGRFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL3dlYnBhY2stZGlhZ25vc3RpY3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0eWxlc1dlYnBhY2tQbHVnaW5PcHRpb25zIHtcbiAgcHJlc2VydmVTeW1saW5rcz86IGJvb2xlYW47XG4gIHJvb3Q6IHN0cmluZztcbiAgZW50cnlQb2ludHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcbn1cblxuLyoqXG4gKiBUaGUgbmFtZSBvZiB0aGUgcGx1Z2luIHByb3ZpZGVkIHRvIFdlYnBhY2sgd2hlbiB0YXBwaW5nIFdlYnBhY2sgY29tcGlsZXIgaG9va3MuXG4gKi9cbmNvbnN0IFBMVUdJTl9OQU1FID0gJ3N0eWxlcy13ZWJwYWNrLXBsdWdpbic7XG5cbmV4cG9ydCBjbGFzcyBTdHlsZXNXZWJwYWNrUGx1Z2luIHtcbiAgcHJpdmF0ZSBjb21waWxhdGlvbjogQ29tcGlsYXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBTdHlsZXNXZWJwYWNrUGx1Z2luT3B0aW9ucykge31cblxuICBhcHBseShjb21waWxlcjogQ29tcGlsZXIpOiB2b2lkIHtcbiAgICBjb25zdCB7IGVudHJ5UG9pbnRzLCBwcmVzZXJ2ZVN5bWxpbmtzLCByb290IH0gPSB0aGlzLm9wdGlvbnM7XG4gICAgY29uc3QgcmVzb2x2ZXIgPSBjb21waWxlci5yZXNvbHZlckZhY3RvcnkuZ2V0KCdnbG9iYWwtc3R5bGVzJywge1xuICAgICAgY29uZGl0aW9uTmFtZXM6IFsnc2FzcycsICdsZXNzJywgJ3N0eWxlJ10sXG4gICAgICBtYWluRmllbGRzOiBbJ3Nhc3MnLCAnbGVzcycsICdzdHlsZScsICdtYWluJywgJy4uLiddLFxuICAgICAgZXh0ZW5zaW9uczogWycuc2NzcycsICcuc2FzcycsICcubGVzcycsICcuY3NzJ10sXG4gICAgICByZXN0cmljdGlvbnM6IFsvXFwuKChsZXxzYXxzY3xjKXNzKSQvaV0sXG4gICAgICBwcmVmZXJSZWxhdGl2ZTogdHJ1ZSxcbiAgICAgIHVzZVN5bmNGaWxlU3lzdGVtQ2FsbHM6IHRydWUsXG4gICAgICBzeW1saW5rczogIXByZXNlcnZlU3ltbGlua3MsXG4gICAgICBmaWxlU3lzdGVtOiBjb21waWxlci5pbnB1dEZpbGVTeXN0ZW0sXG4gICAgfSk7XG5cbiAgICBjb25zdCB3ZWJwYWNrT3B0aW9ucyA9IGNvbXBpbGVyLm9wdGlvbnM7XG4gICAgY29tcGlsZXIuaG9va3MuZW52aXJvbm1lbnQudGFwKFBMVUdJTl9OQU1FLCAoKSA9PiB7XG4gICAgICBjb25zdCBlbnRyeSA9XG4gICAgICAgIHR5cGVvZiB3ZWJwYWNrT3B0aW9ucy5lbnRyeSA9PT0gJ2Z1bmN0aW9uJyA/IHdlYnBhY2tPcHRpb25zLmVudHJ5KCkgOiB3ZWJwYWNrT3B0aW9ucy5lbnRyeTtcblxuICAgICAgd2VicGFja09wdGlvbnMuZW50cnkgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5cG9pbnRzID0gYXdhaXQgZW50cnk7XG5cbiAgICAgICAgZm9yIChjb25zdCBbYnVuZGxlTmFtZSwgcGF0aHNdIG9mIE9iamVjdC5lbnRyaWVzKGVudHJ5UG9pbnRzKSkge1xuICAgICAgICAgIGVudHJ5cG9pbnRzW2J1bmRsZU5hbWVdID8/PSB7fTtcbiAgICAgICAgICBjb25zdCBlbnRyeUltcG9ydCA9IChlbnRyeXBvaW50c1tidW5kbGVOYW1lXS5pbXBvcnQgPz89IFtdKTtcblxuICAgICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiBwYXRocykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZXIucmVzb2x2ZVN5bmMoe30sIHJvb3QsIHBhdGgpO1xuICAgICAgICAgICAgICBpZiAocmVzb2x2ZWRQYXRoKSB7XG4gICAgICAgICAgICAgICAgZW50cnlJbXBvcnQucHVzaChgJHtyZXNvbHZlZFBhdGh9P25nR2xvYmFsU3R5bGVgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQodGhpcy5jb21waWxhdGlvbiwgJ0NvbXBpbGF0aW9uIGNhbm5vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgICAgICAgICAgICAgYWRkRXJyb3IodGhpcy5jb21waWxhdGlvbiwgYENhbm5vdCByZXNvbHZlICcke3BhdGh9Jy5gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgYXNzZXJ0KHRoaXMuY29tcGlsYXRpb24sICdDb21waWxhdGlvbiBjYW5ub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgICAgICAgICAgICBhc3NlcnRJc0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgYWRkRXJyb3IodGhpcy5jb21waWxhdGlvbiwgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVudHJ5cG9pbnRzO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIGNvbXBpbGVyLmhvb2tzLnRoaXNDb21waWxhdGlvbi50YXAoUExVR0lOX05BTUUsIChjb21waWxhdGlvbikgPT4ge1xuICAgICAgdGhpcy5jb21waWxhdGlvbiA9IGNvbXBpbGF0aW9uO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
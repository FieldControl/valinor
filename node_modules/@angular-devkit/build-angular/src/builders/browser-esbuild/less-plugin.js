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
exports.createLessPlugin = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const promises_1 = require("node:fs/promises");
/**
 * The lazy-loaded instance of the less stylesheet preprocessor.
 * It is only imported and initialized if a less stylesheet is used.
 */
let lessPreprocessor;
function isLessException(error) {
    return !!error && typeof error === 'object' && 'column' in error;
}
function createLessPlugin(options) {
    return {
        name: 'angular-less',
        setup(build) {
            // Add a load callback to support inline Component styles
            build.onLoad({ filter: /^less;/, namespace: 'angular:styles/component' }, async (args) => {
                var _a;
                const data = (_a = options.inlineComponentData) === null || _a === void 0 ? void 0 : _a[args.path];
                (0, node_assert_1.default)(data, `component style name should always be found [${args.path}]`);
                const [, , filePath] = args.path.split(';', 3);
                return compileString(data, filePath, options);
            });
            // Add a load callback to support files from disk
            build.onLoad({ filter: /\.less$/ }, async (args) => {
                const data = await (0, promises_1.readFile)(args.path, 'utf-8');
                return compileString(data, args.path, options);
            });
        },
    };
}
exports.createLessPlugin = createLessPlugin;
async function compileString(data, filename, options) {
    const less = (lessPreprocessor !== null && lessPreprocessor !== void 0 ? lessPreprocessor : (lessPreprocessor = (await Promise.resolve().then(() => __importStar(require('less')))).default));
    try {
        const result = await less.render(data, {
            filename,
            paths: options.includePaths,
            rewriteUrls: 'all',
            sourceMap: options.sourcemap
                ? {
                    sourceMapFileInline: true,
                    outputSourceFiles: true,
                }
                : undefined,
        });
        return {
            contents: result.css,
            loader: 'css',
        };
    }
    catch (error) {
        if (isLessException(error)) {
            return {
                errors: [
                    {
                        text: error.message,
                        location: {
                            file: error.filename,
                            line: error.line,
                            column: error.column,
                            // Middle element represents the line containing the error
                            lineText: error.extract && error.extract[Math.trunc(error.extract.length / 2)],
                        },
                    },
                ],
                loader: 'css',
            };
        }
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVzcy1wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9icm93c2VyLWVzYnVpbGQvbGVzcy1wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHSCw4REFBaUM7QUFDakMsK0NBQTRDO0FBRTVDOzs7R0FHRztBQUNILElBQUksZ0JBQW1ELENBQUM7QUFleEQsU0FBUyxlQUFlLENBQUMsS0FBYztJQUNyQyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLFFBQVEsSUFBSSxLQUFLLENBQUM7QUFDbkUsQ0FBQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLE9BQTBCO0lBQ3pELE9BQU87UUFDTCxJQUFJLEVBQUUsY0FBYztRQUNwQixLQUFLLENBQUMsS0FBa0I7WUFDdEIseURBQXlEO1lBQ3pELEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSwwQkFBMEIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTs7Z0JBQ3ZGLE1BQU0sSUFBSSxHQUFHLE1BQUEsT0FBTyxDQUFDLG1CQUFtQiwwQ0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RELElBQUEscUJBQU0sRUFBQyxJQUFJLEVBQUUsZ0RBQWdELElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUUzRSxNQUFNLENBQUMsRUFBRSxBQUFELEVBQUcsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUUvQyxPQUFPLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1lBRUgsaURBQWlEO1lBQ2pELEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsbUJBQVEsRUFBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVoRCxPQUFPLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQXRCRCw0Q0FzQkM7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUMxQixJQUFZLEVBQ1osUUFBZ0IsRUFDaEIsT0FBMEI7SUFFMUIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsYUFBaEIsZ0JBQWdCLGNBQWhCLGdCQUFnQixJQUFoQixnQkFBZ0IsR0FBSyxDQUFDLHdEQUFhLE1BQU0sR0FBQyxDQUFDLENBQUMsT0FBTyxFQUFDLENBQUM7SUFFbkUsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDckMsUUFBUTtZQUNSLEtBQUssRUFBRSxPQUFPLENBQUMsWUFBWTtZQUMzQixXQUFXLEVBQUUsS0FBSztZQUNsQixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7Z0JBQzFCLENBQUMsQ0FBQztvQkFDRSxtQkFBbUIsRUFBRSxJQUFJO29CQUN6QixpQkFBaUIsRUFBRSxJQUFJO2lCQUN4QjtnQkFDSCxDQUFDLENBQUMsU0FBUztTQUNFLENBQUMsQ0FBQztRQUVuQixPQUFPO1lBQ0wsUUFBUSxFQUFFLE1BQU0sQ0FBQyxHQUFHO1lBQ3BCLE1BQU0sRUFBRSxLQUFLO1NBQ2QsQ0FBQztLQUNIO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMxQixPQUFPO2dCQUNMLE1BQU0sRUFBRTtvQkFDTjt3QkFDRSxJQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU87d0JBQ25CLFFBQVEsRUFBRTs0QkFDUixJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVE7NEJBQ3BCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTs0QkFDaEIsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNOzRCQUNwQiwwREFBMEQ7NEJBQzFELFFBQVEsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDL0U7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsTUFBTSxFQUFFLEtBQUs7YUFDZCxDQUFDO1NBQ0g7UUFFRCxNQUFNLEtBQUssQ0FBQztLQUNiO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IE9uTG9hZFJlc3VsdCwgUGx1Z2luLCBQbHVnaW5CdWlsZCB9IGZyb20gJ2VzYnVpbGQnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdub2RlOmFzc2VydCc7XG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuXG4vKipcbiAqIFRoZSBsYXp5LWxvYWRlZCBpbnN0YW5jZSBvZiB0aGUgbGVzcyBzdHlsZXNoZWV0IHByZXByb2Nlc3Nvci5cbiAqIEl0IGlzIG9ubHkgaW1wb3J0ZWQgYW5kIGluaXRpYWxpemVkIGlmIGEgbGVzcyBzdHlsZXNoZWV0IGlzIHVzZWQuXG4gKi9cbmxldCBsZXNzUHJlcHJvY2Vzc29yOiB0eXBlb2YgaW1wb3J0KCdsZXNzJykgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGVzc1BsdWdpbk9wdGlvbnMge1xuICBzb3VyY2VtYXA6IGJvb2xlYW47XG4gIGluY2x1ZGVQYXRocz86IHN0cmluZ1tdO1xuICBpbmxpbmVDb21wb25lbnREYXRhPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuaW50ZXJmYWNlIExlc3NFeGNlcHRpb24gZXh0ZW5kcyBFcnJvciB7XG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIGxpbmU6IG51bWJlcjtcbiAgY29sdW1uOiBudW1iZXI7XG4gIGV4dHJhY3Q/OiBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gaXNMZXNzRXhjZXB0aW9uKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgTGVzc0V4Y2VwdGlvbiB7XG4gIHJldHVybiAhIWVycm9yICYmIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgJ2NvbHVtbicgaW4gZXJyb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMZXNzUGx1Z2luKG9wdGlvbnM6IExlc3NQbHVnaW5PcHRpb25zKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnYW5ndWxhci1sZXNzJyxcbiAgICBzZXR1cChidWlsZDogUGx1Z2luQnVpbGQpOiB2b2lkIHtcbiAgICAgIC8vIEFkZCBhIGxvYWQgY2FsbGJhY2sgdG8gc3VwcG9ydCBpbmxpbmUgQ29tcG9uZW50IHN0eWxlc1xuICAgICAgYnVpbGQub25Mb2FkKHsgZmlsdGVyOiAvXmxlc3M7LywgbmFtZXNwYWNlOiAnYW5ndWxhcjpzdHlsZXMvY29tcG9uZW50JyB9LCBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gb3B0aW9ucy5pbmxpbmVDb21wb25lbnREYXRhPy5bYXJncy5wYXRoXTtcbiAgICAgICAgYXNzZXJ0KGRhdGEsIGBjb21wb25lbnQgc3R5bGUgbmFtZSBzaG91bGQgYWx3YXlzIGJlIGZvdW5kIFske2FyZ3MucGF0aH1dYCk7XG5cbiAgICAgICAgY29uc3QgWywgLCBmaWxlUGF0aF0gPSBhcmdzLnBhdGguc3BsaXQoJzsnLCAzKTtcblxuICAgICAgICByZXR1cm4gY29tcGlsZVN0cmluZyhkYXRhLCBmaWxlUGF0aCwgb3B0aW9ucyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGEgbG9hZCBjYWxsYmFjayB0byBzdXBwb3J0IGZpbGVzIGZyb20gZGlza1xuICAgICAgYnVpbGQub25Mb2FkKHsgZmlsdGVyOiAvXFwubGVzcyQvIH0sIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZWFkRmlsZShhcmdzLnBhdGgsICd1dGYtOCcpO1xuXG4gICAgICAgIHJldHVybiBjb21waWxlU3RyaW5nKGRhdGEsIGFyZ3MucGF0aCwgb3B0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb21waWxlU3RyaW5nKFxuICBkYXRhOiBzdHJpbmcsXG4gIGZpbGVuYW1lOiBzdHJpbmcsXG4gIG9wdGlvbnM6IExlc3NQbHVnaW5PcHRpb25zLFxuKTogUHJvbWlzZTxPbkxvYWRSZXN1bHQ+IHtcbiAgY29uc3QgbGVzcyA9IChsZXNzUHJlcHJvY2Vzc29yID8/PSAoYXdhaXQgaW1wb3J0KCdsZXNzJykpLmRlZmF1bHQpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbGVzcy5yZW5kZXIoZGF0YSwge1xuICAgICAgZmlsZW5hbWUsXG4gICAgICBwYXRoczogb3B0aW9ucy5pbmNsdWRlUGF0aHMsXG4gICAgICByZXdyaXRlVXJsczogJ2FsbCcsXG4gICAgICBzb3VyY2VNYXA6IG9wdGlvbnMuc291cmNlbWFwXG4gICAgICAgID8ge1xuICAgICAgICAgICAgc291cmNlTWFwRmlsZUlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgIG91dHB1dFNvdXJjZUZpbGVzOiB0cnVlLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfSBhcyBMZXNzLk9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnRzOiByZXN1bHQuY3NzLFxuICAgICAgbG9hZGVyOiAnY3NzJyxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChpc0xlc3NFeGNlcHRpb24oZXJyb3IpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICAgICAgZmlsZTogZXJyb3IuZmlsZW5hbWUsXG4gICAgICAgICAgICAgIGxpbmU6IGVycm9yLmxpbmUsXG4gICAgICAgICAgICAgIGNvbHVtbjogZXJyb3IuY29sdW1uLFxuICAgICAgICAgICAgICAvLyBNaWRkbGUgZWxlbWVudCByZXByZXNlbnRzIHRoZSBsaW5lIGNvbnRhaW5pbmcgdGhlIGVycm9yXG4gICAgICAgICAgICAgIGxpbmVUZXh0OiBlcnJvci5leHRyYWN0ICYmIGVycm9yLmV4dHJhY3RbTWF0aC50cnVuYyhlcnJvci5leHRyYWN0Lmxlbmd0aCAvIDIpXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbG9hZGVyOiAnY3NzJyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiJdfQ==
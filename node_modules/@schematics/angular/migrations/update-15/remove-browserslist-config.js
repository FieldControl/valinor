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
exports.DEFAULT_BROWSERS = void 0;
const core_1 = require("@angular-devkit/core");
const validBrowserslistConfigFilenames = new Set(['browserslist', '.browserslistrc']);
exports.DEFAULT_BROWSERS = [
    'last 1 Chrome version',
    'last 1 Firefox version',
    'last 2 Edge major versions',
    'last 2 Safari major versions',
    'last 2 iOS major versions',
    'Firefox ESR',
];
function* visit(directory) {
    for (const path of directory.subfiles) {
        if (validBrowserslistConfigFilenames.has(path)) {
            yield (0, core_1.join)(directory.path, path);
        }
    }
    for (const path of directory.subdirs) {
        if (path === 'node_modules') {
            continue;
        }
        yield* visit(directory.dir(path));
    }
}
function default_1() {
    return async (tree, { logger }) => {
        let browserslist;
        try {
            browserslist = (await Promise.resolve().then(() => __importStar(require('browserslist')))).default;
        }
        catch (_a) {
            logger.warn('Skipping migration because the "browserslist" package could not be loaded.');
            return;
        }
        // Set the defaults to match the defaults in build-angular.
        browserslist.defaults = exports.DEFAULT_BROWSERS;
        const defaultSupportedBrowsers = new Set(browserslist(exports.DEFAULT_BROWSERS));
        const es5Browsers = new Set(browserslist(['supports es6-module']));
        for (const path of visit(tree.root)) {
            const { defaults: browsersListConfig, ...otherConfigs } = browserslist.parseConfig(tree.readText(path));
            if (Object.keys(otherConfigs).length) {
                // The config contains additional sections.
                continue;
            }
            const browserslistInProject = browserslist(
            // Exclude from the list ES5 browsers which are not supported.
            browsersListConfig.map((s) => `${s} and supports es6-module`), {
                ignoreUnknownVersions: true,
            });
            if (defaultSupportedBrowsers.size !== browserslistInProject.length) {
                continue;
            }
            const shouldDelete = browserslistInProject.every((browser) => defaultSupportedBrowsers.has(browser));
            if (shouldDelete) {
                // All browsers are the same as the default config.
                // Delete file as it's redundant.
                tree.delete(path);
            }
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWJyb3dzZXJzbGlzdC1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvbWlncmF0aW9ucy91cGRhdGUtMTUvcmVtb3ZlLWJyb3dzZXJzbGlzdC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBa0Q7QUFHbEQsTUFBTSxnQ0FBZ0MsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7QUFFekUsUUFBQSxnQkFBZ0IsR0FBRztJQUM5Qix1QkFBdUI7SUFDdkIsd0JBQXdCO0lBQ3hCLDRCQUE0QjtJQUM1Qiw4QkFBOEI7SUFDOUIsMkJBQTJCO0lBQzNCLGFBQWE7Q0FDZCxDQUFDO0FBRUYsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQW1CO0lBQ2pDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtRQUNyQyxJQUFJLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QyxNQUFNLElBQUEsV0FBSSxFQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbEM7S0FDRjtJQUVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtRQUNwQyxJQUFJLElBQUksS0FBSyxjQUFjLEVBQUU7WUFDM0IsU0FBUztTQUNWO1FBRUQsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNuQztBQUNILENBQUM7QUFFRDtJQUNFLE9BQU8sS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7UUFDaEMsSUFBSSxZQUF1RCxDQUFDO1FBRTVELElBQUk7WUFDRixZQUFZLEdBQUcsQ0FBQyx3REFBYSxjQUFjLEdBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztTQUN2RDtRQUFDLFdBQU07WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7WUFFMUYsT0FBTztTQUNSO1FBRUQsMkRBQTJEO1FBQzNELFlBQVksQ0FBQyxRQUFRLEdBQUcsd0JBQWdCLENBQUM7UUFFekMsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsd0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5FLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQyxNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsWUFBWSxFQUFFLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FDaEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FDcEIsQ0FBQztZQUVGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BDLDJDQUEyQztnQkFDM0MsU0FBUzthQUNWO1lBRUQsTUFBTSxxQkFBcUIsR0FBRyxZQUFZO1lBQ3hDLDhEQUE4RDtZQUM5RCxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxFQUM3RDtnQkFDRSxxQkFBcUIsRUFBRSxJQUFJO2FBQzVCLENBQ0YsQ0FBQztZQUVGLElBQUksd0JBQXdCLENBQUMsSUFBSSxLQUFLLHFCQUFxQixDQUFDLE1BQU0sRUFBRTtnQkFDbEUsU0FBUzthQUNWO1lBRUQsTUFBTSxZQUFZLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDM0Qsd0JBQXdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUN0QyxDQUFDO1lBRUYsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLG1EQUFtRDtnQkFDbkQsaUNBQWlDO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25CO1NBQ0Y7SUFDSCxDQUFDLENBQUM7QUFDSixDQUFDO0FBbkRELDRCQW1EQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBQYXRoLCBqb2luIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgRGlyRW50cnksIFJ1bGUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cbmNvbnN0IHZhbGlkQnJvd3NlcnNsaXN0Q29uZmlnRmlsZW5hbWVzID0gbmV3IFNldChbJ2Jyb3dzZXJzbGlzdCcsICcuYnJvd3NlcnNsaXN0cmMnXSk7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JST1dTRVJTID0gW1xuICAnbGFzdCAxIENocm9tZSB2ZXJzaW9uJyxcbiAgJ2xhc3QgMSBGaXJlZm94IHZlcnNpb24nLFxuICAnbGFzdCAyIEVkZ2UgbWFqb3IgdmVyc2lvbnMnLFxuICAnbGFzdCAyIFNhZmFyaSBtYWpvciB2ZXJzaW9ucycsXG4gICdsYXN0IDIgaU9TIG1ham9yIHZlcnNpb25zJyxcbiAgJ0ZpcmVmb3ggRVNSJyxcbl07XG5cbmZ1bmN0aW9uKiB2aXNpdChkaXJlY3Rvcnk6IERpckVudHJ5KTogSXRlcmFibGVJdGVyYXRvcjxQYXRoPiB7XG4gIGZvciAoY29uc3QgcGF0aCBvZiBkaXJlY3Rvcnkuc3ViZmlsZXMpIHtcbiAgICBpZiAodmFsaWRCcm93c2Vyc2xpc3RDb25maWdGaWxlbmFtZXMuaGFzKHBhdGgpKSB7XG4gICAgICB5aWVsZCBqb2luKGRpcmVjdG9yeS5wYXRoLCBwYXRoKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IHBhdGggb2YgZGlyZWN0b3J5LnN1YmRpcnMpIHtcbiAgICBpZiAocGF0aCA9PT0gJ25vZGVfbW9kdWxlcycpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHlpZWxkKiB2aXNpdChkaXJlY3RvcnkuZGlyKHBhdGgpKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAodHJlZSwgeyBsb2dnZXIgfSkgPT4ge1xuICAgIGxldCBicm93c2Vyc2xpc3Q6IHR5cGVvZiBpbXBvcnQoJ2Jyb3dzZXJzbGlzdCcpIHwgdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGJyb3dzZXJzbGlzdCA9IChhd2FpdCBpbXBvcnQoJ2Jyb3dzZXJzbGlzdCcpKS5kZWZhdWx0O1xuICAgIH0gY2F0Y2gge1xuICAgICAgbG9nZ2VyLndhcm4oJ1NraXBwaW5nIG1pZ3JhdGlvbiBiZWNhdXNlIHRoZSBcImJyb3dzZXJzbGlzdFwiIHBhY2thZ2UgY291bGQgbm90IGJlIGxvYWRlZC4nKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdHMgdG8gbWF0Y2ggdGhlIGRlZmF1bHRzIGluIGJ1aWxkLWFuZ3VsYXIuXG4gICAgYnJvd3NlcnNsaXN0LmRlZmF1bHRzID0gREVGQVVMVF9CUk9XU0VSUztcblxuICAgIGNvbnN0IGRlZmF1bHRTdXBwb3J0ZWRCcm93c2VycyA9IG5ldyBTZXQoYnJvd3NlcnNsaXN0KERFRkFVTFRfQlJPV1NFUlMpKTtcbiAgICBjb25zdCBlczVCcm93c2VycyA9IG5ldyBTZXQoYnJvd3NlcnNsaXN0KFsnc3VwcG9ydHMgZXM2LW1vZHVsZSddKSk7XG5cbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgdmlzaXQodHJlZS5yb290KSkge1xuICAgICAgY29uc3QgeyBkZWZhdWx0czogYnJvd3NlcnNMaXN0Q29uZmlnLCAuLi5vdGhlckNvbmZpZ3MgfSA9IGJyb3dzZXJzbGlzdC5wYXJzZUNvbmZpZyhcbiAgICAgICAgdHJlZS5yZWFkVGV4dChwYXRoKSxcbiAgICAgICk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhvdGhlckNvbmZpZ3MpLmxlbmd0aCkge1xuICAgICAgICAvLyBUaGUgY29uZmlnIGNvbnRhaW5zIGFkZGl0aW9uYWwgc2VjdGlvbnMuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBicm93c2Vyc2xpc3RJblByb2plY3QgPSBicm93c2Vyc2xpc3QoXG4gICAgICAgIC8vIEV4Y2x1ZGUgZnJvbSB0aGUgbGlzdCBFUzUgYnJvd3NlcnMgd2hpY2ggYXJlIG5vdCBzdXBwb3J0ZWQuXG4gICAgICAgIGJyb3dzZXJzTGlzdENvbmZpZy5tYXAoKHMpID0+IGAke3N9IGFuZCBzdXBwb3J0cyBlczYtbW9kdWxlYCksXG4gICAgICAgIHtcbiAgICAgICAgICBpZ25vcmVVbmtub3duVmVyc2lvbnM6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICApO1xuXG4gICAgICBpZiAoZGVmYXVsdFN1cHBvcnRlZEJyb3dzZXJzLnNpemUgIT09IGJyb3dzZXJzbGlzdEluUHJvamVjdC5sZW5ndGgpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNob3VsZERlbGV0ZSA9IGJyb3dzZXJzbGlzdEluUHJvamVjdC5ldmVyeSgoYnJvd3NlcikgPT5cbiAgICAgICAgZGVmYXVsdFN1cHBvcnRlZEJyb3dzZXJzLmhhcyhicm93c2VyKSxcbiAgICAgICk7XG5cbiAgICAgIGlmIChzaG91bGREZWxldGUpIHtcbiAgICAgICAgLy8gQWxsIGJyb3dzZXJzIGFyZSB0aGUgc2FtZSBhcyB0aGUgZGVmYXVsdCBjb25maWcuXG4gICAgICAgIC8vIERlbGV0ZSBmaWxlIGFzIGl0J3MgcmVkdW5kYW50LlxuICAgICAgICB0cmVlLmRlbGV0ZShwYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG4iXX0=
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
exports.getWebpackConfig = exports.getEmittedFiles = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const url_1 = require("url");
function getEmittedFiles(compilation) {
    var _a;
    const files = [];
    const chunkFileNames = new Set();
    // adds all chunks to the list of emitted files such as lazy loaded modules
    for (const chunk of compilation.chunks) {
        for (const file of chunk.files) {
            if (chunkFileNames.has(file)) {
                continue;
            }
            chunkFileNames.add(file);
            files.push({
                id: (_a = chunk.id) === null || _a === void 0 ? void 0 : _a.toString(),
                name: chunk.name,
                file,
                extension: path.extname(file),
                initial: chunk.isOnlyInitial(),
            });
        }
    }
    // add all other files
    for (const file of Object.keys(compilation.assets)) {
        // Chunk files have already been added to the files list above
        if (chunkFileNames.has(file)) {
            continue;
        }
        files.push({ file, extension: path.extname(file), initial: false, asset: true });
    }
    return files;
}
exports.getEmittedFiles = getEmittedFiles;
/**
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */
function loadEsmModule(modulePath) {
    return new Function('modulePath', `return import(modulePath);`)(modulePath);
}
async function getWebpackConfig(configPath) {
    if (!(0, fs_1.existsSync)(configPath)) {
        throw new Error(`Webpack configuration file ${configPath} does not exist.`);
    }
    switch (path.extname(configPath)) {
        case '.mjs':
            // Load the ESM configuration file using the TypeScript dynamic import workaround.
            // Once TypeScript provides support for keeping the dynamic import this workaround can be
            // changed to a direct dynamic import.
            return (await loadEsmModule((0, url_1.pathToFileURL)(configPath))).default;
        case '.cjs':
            return require(configPath);
        default:
            // The file could be either CommonJS or ESM.
            // CommonJS is tried first then ESM if loading fails.
            try {
                return require(configPath);
            }
            catch (e) {
                if (e.code === 'ERR_REQUIRE_ESM') {
                    // Load the ESM configuration file using the TypeScript dynamic import workaround.
                    // Once TypeScript provides support for keeping the dynamic import this workaround can be
                    // changed to a direct dynamic import.
                    return (await loadEsmModule((0, url_1.pathToFileURL)(configPath)))
                        .default;
                }
                throw e;
            }
    }
}
exports.getWebpackConfig = getWebpackConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF93ZWJwYWNrL3NyYy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILDJCQUFnQztBQUNoQywyQ0FBNkI7QUFDN0IsNkJBQXlDO0FBWXpDLFNBQWdCLGVBQWUsQ0FBQyxXQUF3Qjs7SUFDdEQsTUFBTSxLQUFLLEdBQW1CLEVBQUUsQ0FBQztJQUNqQyxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBRXpDLDJFQUEyRTtJQUMzRSxLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7UUFDdEMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQzlCLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUIsU0FBUzthQUNWO1lBRUQsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNULEVBQUUsRUFBRSxNQUFBLEtBQUssQ0FBQyxFQUFFLDBDQUFFLFFBQVEsRUFBRTtnQkFDeEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2dCQUNoQixJQUFJO2dCQUNKLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDN0IsT0FBTyxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUU7YUFDL0IsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtJQUVELHNCQUFzQjtJQUN0QixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ2xELDhEQUE4RDtRQUM5RCxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUIsU0FBUztTQUNWO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ2xGO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBakNELDBDQWlDQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsU0FBUyxhQUFhLENBQUksVUFBd0I7SUFDaEQsT0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxVQUFVLENBQWUsQ0FBQztBQUM1RixDQUFDO0FBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUFDLFVBQWtCO0lBQ3ZELElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxVQUFVLENBQUMsRUFBRTtRQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixVQUFVLGtCQUFrQixDQUFDLENBQUM7S0FDN0U7SUFFRCxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDaEMsS0FBSyxNQUFNO1lBQ1Qsa0ZBQWtGO1lBQ2xGLHlGQUF5RjtZQUN6RixzQ0FBc0M7WUFDdEMsT0FBTyxDQUFDLE1BQU0sYUFBYSxDQUE2QixJQUFBLG1CQUFhLEVBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUM5RixLQUFLLE1BQU07WUFDVCxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3QjtZQUNFLDRDQUE0QztZQUM1QyxxREFBcUQ7WUFDckQsSUFBSTtnQkFDRixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM1QjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLElBQUssQ0FBMkIsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUU7b0JBQzNELGtGQUFrRjtvQkFDbEYseUZBQXlGO29CQUN6RixzQ0FBc0M7b0JBQ3RDLE9BQU8sQ0FBQyxNQUFNLGFBQWEsQ0FBNkIsSUFBQSxtQkFBYSxFQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7eUJBQ2hGLE9BQU8sQ0FBQztpQkFDWjtnQkFFRCxNQUFNLENBQUMsQ0FBQzthQUNUO0tBQ0o7QUFDSCxDQUFDO0FBOUJELDRDQThCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFVSTCwgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgeyBDb21waWxhdGlvbiwgQ29uZmlndXJhdGlvbiB9IGZyb20gJ3dlYnBhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVtaXR0ZWRGaWxlcyB7XG4gIGlkPzogc3RyaW5nO1xuICBuYW1lPzogc3RyaW5nO1xuICBmaWxlOiBzdHJpbmc7XG4gIGluaXRpYWw6IGJvb2xlYW47XG4gIGFzc2V0PzogYm9vbGVhbjtcbiAgZXh0ZW5zaW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbWl0dGVkRmlsZXMoY29tcGlsYXRpb246IENvbXBpbGF0aW9uKTogRW1pdHRlZEZpbGVzW10ge1xuICBjb25zdCBmaWxlczogRW1pdHRlZEZpbGVzW10gPSBbXTtcbiAgY29uc3QgY2h1bmtGaWxlTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAvLyBhZGRzIGFsbCBjaHVua3MgdG8gdGhlIGxpc3Qgb2YgZW1pdHRlZCBmaWxlcyBzdWNoIGFzIGxhenkgbG9hZGVkIG1vZHVsZXNcbiAgZm9yIChjb25zdCBjaHVuayBvZiBjb21waWxhdGlvbi5jaHVua3MpIHtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgY2h1bmsuZmlsZXMpIHtcbiAgICAgIGlmIChjaHVua0ZpbGVOYW1lcy5oYXMoZmlsZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNodW5rRmlsZU5hbWVzLmFkZChmaWxlKTtcbiAgICAgIGZpbGVzLnB1c2goe1xuICAgICAgICBpZDogY2h1bmsuaWQ/LnRvU3RyaW5nKCksXG4gICAgICAgIG5hbWU6IGNodW5rLm5hbWUsXG4gICAgICAgIGZpbGUsXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKGZpbGUpLFxuICAgICAgICBpbml0aWFsOiBjaHVuay5pc09ubHlJbml0aWFsKCksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBhZGQgYWxsIG90aGVyIGZpbGVzXG4gIGZvciAoY29uc3QgZmlsZSBvZiBPYmplY3Qua2V5cyhjb21waWxhdGlvbi5hc3NldHMpKSB7XG4gICAgLy8gQ2h1bmsgZmlsZXMgaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gdGhlIGZpbGVzIGxpc3QgYWJvdmVcbiAgICBpZiAoY2h1bmtGaWxlTmFtZXMuaGFzKGZpbGUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBmaWxlcy5wdXNoKHsgZmlsZSwgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUoZmlsZSksIGluaXRpYWw6IGZhbHNlLCBhc3NldDogdHJ1ZSB9KTtcbiAgfVxuXG4gIHJldHVybiBmaWxlcztcbn1cblxuLyoqXG4gKiBUaGlzIHVzZXMgYSBkeW5hbWljIGltcG9ydCB0byBsb2FkIGEgbW9kdWxlIHdoaWNoIG1heSBiZSBFU00uXG4gKiBDb21tb25KUyBjb2RlIGNhbiBsb2FkIEVTTSBjb2RlIHZpYSBhIGR5bmFtaWMgaW1wb3J0LiBVbmZvcnR1bmF0ZWx5LCBUeXBlU2NyaXB0XG4gKiB3aWxsIGN1cnJlbnRseSwgdW5jb25kaXRpb25hbGx5IGRvd25sZXZlbCBkeW5hbWljIGltcG9ydCBpbnRvIGEgcmVxdWlyZSBjYWxsLlxuICogcmVxdWlyZSBjYWxscyBjYW5ub3QgbG9hZCBFU00gY29kZSBhbmQgd2lsbCByZXN1bHQgaW4gYSBydW50aW1lIGVycm9yLiBUbyB3b3JrYXJvdW5kXG4gKiB0aGlzLCBhIEZ1bmN0aW9uIGNvbnN0cnVjdG9yIGlzIHVzZWQgdG8gcHJldmVudCBUeXBlU2NyaXB0IGZyb20gY2hhbmdpbmcgdGhlIGR5bmFtaWMgaW1wb3J0LlxuICogT25jZSBUeXBlU2NyaXB0IHByb3ZpZGVzIHN1cHBvcnQgZm9yIGtlZXBpbmcgdGhlIGR5bmFtaWMgaW1wb3J0IHRoaXMgd29ya2Fyb3VuZCBjYW5cbiAqIGJlIGRyb3BwZWQuXG4gKlxuICogQHBhcmFtIG1vZHVsZVBhdGggVGhlIHBhdGggb2YgdGhlIG1vZHVsZSB0byBsb2FkLlxuICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGR5bmFtaWNhbGx5IGltcG9ydGVkIG1vZHVsZS5cbiAqL1xuZnVuY3Rpb24gbG9hZEVzbU1vZHVsZTxUPihtb2R1bGVQYXRoOiBzdHJpbmcgfCBVUkwpOiBQcm9taXNlPFQ+IHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignbW9kdWxlUGF0aCcsIGByZXR1cm4gaW1wb3J0KG1vZHVsZVBhdGgpO2ApKG1vZHVsZVBhdGgpIGFzIFByb21pc2U8VD47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRXZWJwYWNrQ29uZmlnKGNvbmZpZ1BhdGg6IHN0cmluZyk6IFByb21pc2U8Q29uZmlndXJhdGlvbj4ge1xuICBpZiAoIWV4aXN0c1N5bmMoY29uZmlnUGF0aCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFdlYnBhY2sgY29uZmlndXJhdGlvbiBmaWxlICR7Y29uZmlnUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gIH1cblxuICBzd2l0Y2ggKHBhdGguZXh0bmFtZShjb25maWdQYXRoKSkge1xuICAgIGNhc2UgJy5tanMnOlxuICAgICAgLy8gTG9hZCB0aGUgRVNNIGNvbmZpZ3VyYXRpb24gZmlsZSB1c2luZyB0aGUgVHlwZVNjcmlwdCBkeW5hbWljIGltcG9ydCB3b3JrYXJvdW5kLlxuICAgICAgLy8gT25jZSBUeXBlU2NyaXB0IHByb3ZpZGVzIHN1cHBvcnQgZm9yIGtlZXBpbmcgdGhlIGR5bmFtaWMgaW1wb3J0IHRoaXMgd29ya2Fyb3VuZCBjYW4gYmVcbiAgICAgIC8vIGNoYW5nZWQgdG8gYSBkaXJlY3QgZHluYW1pYyBpbXBvcnQuXG4gICAgICByZXR1cm4gKGF3YWl0IGxvYWRFc21Nb2R1bGU8eyBkZWZhdWx0OiBDb25maWd1cmF0aW9uIH0+KHBhdGhUb0ZpbGVVUkwoY29uZmlnUGF0aCkpKS5kZWZhdWx0O1xuICAgIGNhc2UgJy5janMnOlxuICAgICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIFRoZSBmaWxlIGNvdWxkIGJlIGVpdGhlciBDb21tb25KUyBvciBFU00uXG4gICAgICAvLyBDb21tb25KUyBpcyB0cmllZCBmaXJzdCB0aGVuIEVTTSBpZiBsb2FkaW5nIGZhaWxzLlxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICgoZSBhcyBOb2RlSlMuRXJybm9FeGNlcHRpb24pLmNvZGUgPT09ICdFUlJfUkVRVUlSRV9FU00nKSB7XG4gICAgICAgICAgLy8gTG9hZCB0aGUgRVNNIGNvbmZpZ3VyYXRpb24gZmlsZSB1c2luZyB0aGUgVHlwZVNjcmlwdCBkeW5hbWljIGltcG9ydCB3b3JrYXJvdW5kLlxuICAgICAgICAgIC8vIE9uY2UgVHlwZVNjcmlwdCBwcm92aWRlcyBzdXBwb3J0IGZvciBrZWVwaW5nIHRoZSBkeW5hbWljIGltcG9ydCB0aGlzIHdvcmthcm91bmQgY2FuIGJlXG4gICAgICAgICAgLy8gY2hhbmdlZCB0byBhIGRpcmVjdCBkeW5hbWljIGltcG9ydC5cbiAgICAgICAgICByZXR1cm4gKGF3YWl0IGxvYWRFc21Nb2R1bGU8eyBkZWZhdWx0OiBDb25maWd1cmF0aW9uIH0+KHBhdGhUb0ZpbGVVUkwoY29uZmlnUGF0aCkpKVxuICAgICAgICAgICAgLmRlZmF1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICB9XG59XG4iXX0=
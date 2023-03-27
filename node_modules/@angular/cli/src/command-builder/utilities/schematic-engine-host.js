"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchematicEngineHost = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const tools_1 = require("@angular-devkit/schematics/tools");
const fs_1 = require("fs");
const jsonc_parser_1 = require("jsonc-parser");
const module_1 = require("module");
const path_1 = require("path");
const util_1 = require("util");
const vm_1 = require("vm");
const error_1 = require("../../utilities/error");
/**
 * Environment variable to control schematic package redirection
 */
const schematicRedirectVariable = (_a = process.env['NG_SCHEMATIC_REDIRECT']) === null || _a === void 0 ? void 0 : _a.toLowerCase();
function shouldWrapSchematic(schematicFile, schematicEncapsulation) {
    // Check environment variable if present
    switch (schematicRedirectVariable) {
        case '0':
        case 'false':
        case 'off':
        case 'none':
            return false;
        case 'all':
            return true;
    }
    const normalizedSchematicFile = schematicFile.replace(/\\/g, '/');
    // Never wrap the internal update schematic when executed directly
    // It communicates with the update command via `global`
    // But we still want to redirect schematics located in `@angular/cli/node_modules`.
    if (normalizedSchematicFile.includes('node_modules/@angular/cli/') &&
        !normalizedSchematicFile.includes('node_modules/@angular/cli/node_modules/')) {
        return false;
    }
    // @angular/pwa uses dynamic imports which causes `[1]    2468039 segmentation fault` when wrapped.
    // We should remove this when make `importModuleDynamically` work.
    // See: https://nodejs.org/docs/latest-v14.x/api/vm.html
    if (normalizedSchematicFile.includes('@angular/pwa')) {
        return false;
    }
    // Check for first-party Angular schematic packages
    // Angular schematics are safe to use in the wrapped VM context
    if (/\/node_modules\/@(?:angular|schematics|nguniversal)\//.test(normalizedSchematicFile)) {
        return true;
    }
    // Otherwise use the value of the schematic collection's encapsulation option (current default of false)
    return schematicEncapsulation;
}
class SchematicEngineHost extends tools_1.NodeModulesEngineHost {
    _resolveReferenceString(refString, parentPath, collectionDescription) {
        const [path, name] = refString.split('#', 2);
        // Mimic behavior of ExportStringRef class used in default behavior
        const fullPath = path[0] === '.' ? (0, path_1.resolve)(parentPath !== null && parentPath !== void 0 ? parentPath : process.cwd(), path) : path;
        const referenceRequire = (0, module_1.createRequire)(__filename);
        const schematicFile = referenceRequire.resolve(fullPath, { paths: [parentPath] });
        if (shouldWrapSchematic(schematicFile, !!(collectionDescription === null || collectionDescription === void 0 ? void 0 : collectionDescription.encapsulation))) {
            const schematicPath = (0, path_1.dirname)(schematicFile);
            const moduleCache = new Map();
            const factoryInitializer = wrap(schematicFile, schematicPath, moduleCache, name || 'default');
            const factory = factoryInitializer();
            if (!factory || typeof factory !== 'function') {
                return null;
            }
            return { ref: factory, path: schematicPath };
        }
        // All other schematics use default behavior
        return super._resolveReferenceString(refString, parentPath, collectionDescription);
    }
}
exports.SchematicEngineHost = SchematicEngineHost;
/**
 * Minimal shim modules for legacy deep imports of `@schematics/angular`
 */
const legacyModules = {
    '@schematics/angular/utility/config': {
        getWorkspace(host) {
            const path = '/.angular.json';
            const data = host.read(path);
            if (!data) {
                throw new schematics_1.SchematicsException(`Could not find (${path})`);
            }
            return (0, jsonc_parser_1.parse)(data.toString(), [], { allowTrailingComma: true });
        },
    },
    '@schematics/angular/utility/project': {
        buildDefaultPath(project) {
            const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;
            return `${root}${project.projectType === 'application' ? 'app' : 'lib'}`;
        },
    },
};
/**
 * Wrap a JavaScript file in a VM context to allow specific Angular dependencies to be redirected.
 * This VM setup is ONLY intended to redirect dependencies.
 *
 * @param schematicFile A JavaScript schematic file path that should be wrapped.
 * @param schematicDirectory A directory that will be used as the location of the JavaScript file.
 * @param moduleCache A map to use for caching repeat module usage and proper `instanceof` support.
 * @param exportName An optional name of a specific export to return. Otherwise, return all exports.
 */
function wrap(schematicFile, schematicDirectory, moduleCache, exportName) {
    const hostRequire = (0, module_1.createRequire)(__filename);
    const schematicRequire = (0, module_1.createRequire)(schematicFile);
    const customRequire = function (id) {
        if (legacyModules[id]) {
            // Provide compatibility modules for older versions of @angular/cdk
            return legacyModules[id];
        }
        else if (id.startsWith('schematics:')) {
            // Schematics built-in modules use the `schematics` scheme (similar to the Node.js `node` scheme)
            const builtinId = id.slice(11);
            const builtinModule = loadBuiltinModule(builtinId);
            if (!builtinModule) {
                throw new Error(`Unknown schematics built-in module '${id}' requested from schematic '${schematicFile}'`);
            }
            return builtinModule;
        }
        else if (id.startsWith('@angular-devkit/') || id.startsWith('@schematics/')) {
            // Files should not redirect `@angular/core` and instead use the direct
            // dependency if available. This allows old major version migrations to continue to function
            // even though the latest major version may have breaking changes in `@angular/core`.
            if (id.startsWith('@angular-devkit/core')) {
                try {
                    return schematicRequire(id);
                }
                catch (e) {
                    (0, error_1.assertIsError)(e);
                    if (e.code !== 'MODULE_NOT_FOUND') {
                        throw e;
                    }
                }
            }
            // Resolve from inside the `@angular/cli` project
            return hostRequire(id);
        }
        else if (id.startsWith('.') || id.startsWith('@angular/cdk')) {
            // Wrap relative files inside the schematic collection
            // Also wrap `@angular/cdk`, it contains helper utilities that import core schematic packages
            // Resolve from the original file
            const modulePath = schematicRequire.resolve(id);
            // Use cached module if available
            const cachedModule = moduleCache.get(modulePath);
            if (cachedModule) {
                return cachedModule;
            }
            // Do not wrap vendored third-party packages or JSON files
            if (!/[/\\]node_modules[/\\]@schematics[/\\]angular[/\\]third_party[/\\]/.test(modulePath) &&
                !modulePath.endsWith('.json')) {
                // Wrap module and save in cache
                const wrappedModule = wrap(modulePath, (0, path_1.dirname)(modulePath), moduleCache)();
                moduleCache.set(modulePath, wrappedModule);
                return wrappedModule;
            }
        }
        // All others are required directly from the original file
        return schematicRequire(id);
    };
    // Setup a wrapper function to capture the module's exports
    const schematicCode = (0, fs_1.readFileSync)(schematicFile, 'utf8');
    // `module` is required due to @angular/localize ng-add being in UMD format
    const headerCode = '(function() {\nvar exports = {};\nvar module = { exports };\n';
    const footerCode = exportName
        ? `\nreturn module.exports['${exportName}'];});`
        : '\nreturn module.exports;});';
    const script = new vm_1.Script(headerCode + schematicCode + footerCode, {
        filename: schematicFile,
        lineOffset: 3,
    });
    const context = {
        __dirname: schematicDirectory,
        __filename: schematicFile,
        Buffer,
        // TextEncoder is used by the compiler to generate i18n message IDs. See:
        // https://github.com/angular/angular/blob/main/packages/compiler/src/i18n/digest.ts#L17
        // It is referenced globally, because it may be run either on the browser or the server.
        // Usually Node exposes it globally, but in order for it to work, our custom context
        // has to expose it too. Issue context: https://github.com/angular/angular/issues/48940.
        TextEncoder: util_1.TextEncoder,
        console,
        process,
        get global() {
            return this;
        },
        require: customRequire,
    };
    const exportsFactory = script.runInNewContext(context);
    return exportsFactory;
}
function loadBuiltinModule(id) {
    return undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hdGljLWVuZ2luZS1ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmQtYnVpbGRlci91dGlsaXRpZXMvc2NoZW1hdGljLWVuZ2luZS1ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7QUFFSCwyREFBb0Y7QUFDcEYsNERBQW1HO0FBQ25HLDJCQUFrQztBQUNsQywrQ0FBa0Q7QUFDbEQsbUNBQXVDO0FBQ3ZDLCtCQUF3QztBQUN4QywrQkFBbUM7QUFDbkMsMkJBQTRCO0FBQzVCLGlEQUFzRDtBQUV0RDs7R0FFRztBQUNILE1BQU0seUJBQXlCLEdBQUcsTUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLDBDQUFFLFdBQVcsRUFBRSxDQUFDO0FBRXRGLFNBQVMsbUJBQW1CLENBQUMsYUFBcUIsRUFBRSxzQkFBK0I7SUFDakYsd0NBQXdDO0lBQ3hDLFFBQVEseUJBQXlCLEVBQUU7UUFDakMsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLE9BQU8sQ0FBQztRQUNiLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxNQUFNO1lBQ1QsT0FBTyxLQUFLLENBQUM7UUFDZixLQUFLLEtBQUs7WUFDUixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsTUFBTSx1QkFBdUIsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRSxrRUFBa0U7SUFDbEUsdURBQXVEO0lBQ3ZELG1GQUFtRjtJQUNuRixJQUNFLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQztRQUM5RCxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyx5Q0FBeUMsQ0FBQyxFQUM1RTtRQUNBLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxtR0FBbUc7SUFDbkcsa0VBQWtFO0lBQ2xF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Q0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUM7SUFFRiwyREFBMkQ7SUFDM0QsTUFBTSxhQUFhLEdBQUcsSUFBQSxpQkFBWSxFQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxRCwyRUFBMkU7SUFDM0UsTUFBTSxVQUFVLEdBQUcsK0RBQStELENBQUM7SUFDbkYsTUFBTSxVQUFVLEdBQUcsVUFBVTtRQUMzQixDQUFDLENBQUMsNEJBQTRCLFVBQVUsUUFBUTtRQUNoRCxDQUFDLENBQUMsNkJBQTZCLENBQUM7SUFFbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFNLENBQUMsVUFBVSxHQUFHLGFBQWEsR0FBRyxVQUFVLEVBQUU7UUFDakUsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUM7S0FDZCxDQUFDLENBQUM7SUFFSCxNQUFNLE9BQU8sR0FBRztRQUNkLFNBQVMsRUFBRSxrQkFBa0I7UUFDN0IsVUFBVSxFQUFFLGFBQWE7UUFDekIsTUFBTTtRQUNOLHlFQUF5RTtRQUN6RSx3RkFBd0Y7UUFDeEYsd0ZBQXdGO1FBQ3hGLG9GQUFvRjtRQUNwRix3RkFBd0Y7UUFDeEYsV0FBVyxFQUFYLGtCQUFXO1FBQ1gsT0FBTztRQUNQLE9BQU87UUFDUCxJQUFJLE1BQU07WUFDUixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxPQUFPLEVBQUUsYUFBYTtLQUN2QixDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV2RCxPQUFPLGNBQWMsQ0FBQztBQUN4QixDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxFQUFVO0lBQ25DLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgUnVsZUZhY3RvcnksIFNjaGVtYXRpY3NFeGNlcHRpb24sIFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBGaWxlU3lzdGVtQ29sbGVjdGlvbkRlc2MsIE5vZGVNb2R1bGVzRW5naW5lSG9zdCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rvb2xzJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHBhcnNlIGFzIHBhcnNlSnNvbiB9IGZyb20gJ2pzb25jLXBhcnNlcic7XG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSAnbW9kdWxlJztcbmltcG9ydCB7IGRpcm5hbWUsIHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IFRleHRFbmNvZGVyIH0gZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBTY3JpcHQgfSBmcm9tICd2bSc7XG5pbXBvcnQgeyBhc3NlcnRJc0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2Vycm9yJztcblxuLyoqXG4gKiBFbnZpcm9ubWVudCB2YXJpYWJsZSB0byBjb250cm9sIHNjaGVtYXRpYyBwYWNrYWdlIHJlZGlyZWN0aW9uXG4gKi9cbmNvbnN0IHNjaGVtYXRpY1JlZGlyZWN0VmFyaWFibGUgPSBwcm9jZXNzLmVudlsnTkdfU0NIRU1BVElDX1JFRElSRUNUJ10/LnRvTG93ZXJDYXNlKCk7XG5cbmZ1bmN0aW9uIHNob3VsZFdyYXBTY2hlbWF0aWMoc2NoZW1hdGljRmlsZTogc3RyaW5nLCBzY2hlbWF0aWNFbmNhcHN1bGF0aW9uOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIC8vIENoZWNrIGVudmlyb25tZW50IHZhcmlhYmxlIGlmIHByZXNlbnRcbiAgc3dpdGNoIChzY2hlbWF0aWNSZWRpcmVjdFZhcmlhYmxlKSB7XG4gICAgY2FzZSAnMCc6XG4gICAgY2FzZSAnZmFsc2UnOlxuICAgIGNhc2UgJ29mZic6XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplZFNjaGVtYXRpY0ZpbGUgPSBzY2hlbWF0aWNGaWxlLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgLy8gTmV2ZXIgd3JhcCB0aGUgaW50ZXJuYWwgdXBkYXRlIHNjaGVtYXRpYyB3aGVuIGV4ZWN1dGVkIGRpcmVjdGx5XG4gIC8vIEl0IGNvbW11bmljYXRlcyB3aXRoIHRoZSB1cGRhdGUgY29tbWFuZCB2aWEgYGdsb2JhbGBcbiAgLy8gQnV0IHdlIHN0aWxsIHdhbnQgdG8gcmVkaXJlY3Qgc2NoZW1hdGljcyBsb2NhdGVkIGluIGBAYW5ndWxhci9jbGkvbm9kZV9tb2R1bGVzYC5cbiAgaWYgKFxuICAgIG5vcm1hbGl6ZWRTY2hlbWF0aWNGaWxlLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQGFuZ3VsYXIvY2xpLycpICYmXG4gICAgIW5vcm1hbGl6ZWRTY2hlbWF0aWNGaWxlLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQGFuZ3VsYXIvY2xpL25vZGVfbW9kdWxlcy8nKVxuICApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBAYW5ndWxhci9wd2EgdXNlcyBkeW5hbWljIGltcG9ydHMgd2hpY2ggY2F1c2VzIGBbMV0gICAgMjQ2ODAzOSBzZWdtZW50YXRpb24gZmF1bHRgIHdoZW4gd3JhcHBlZC5cbiAgLy8gV2Ugc2hvdWxkIHJlbW92ZSB0aGlzIHdoZW4gbWFrZSBgaW1wb3J0TW9kdWxlRHluYW1pY2FsbHlgIHdvcmsuXG4gIC8vIFNlZTogaHR0cHM6Ly9ub2RlanMub3JnL2RvY3MvbGF0ZXN0LXYxNC54L2FwaS92bS5odG1sXG4gIGlmIChub3JtYWxpemVkU2NoZW1hdGljRmlsZS5pbmNsdWRlcygnQGFuZ3VsYXIvcHdhJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBmb3IgZmlyc3QtcGFydHkgQW5ndWxhciBzY2hlbWF0aWMgcGFja2FnZXNcbiAgLy8gQW5ndWxhciBzY2hlbWF0aWNzIGFyZSBzYWZlIHRvIHVzZSBpbiB0aGUgd3JhcHBlZCBWTSBjb250ZXh0XG4gIGlmICgvXFwvbm9kZV9tb2R1bGVzXFwvQCg/OmFuZ3VsYXJ8c2NoZW1hdGljc3xuZ3VuaXZlcnNhbClcXC8vLnRlc3Qobm9ybWFsaXplZFNjaGVtYXRpY0ZpbGUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBPdGhlcndpc2UgdXNlIHRoZSB2YWx1ZSBvZiB0aGUgc2NoZW1hdGljIGNvbGxlY3Rpb24ncyBlbmNhcHN1bGF0aW9uIG9wdGlvbiAoY3VycmVudCBkZWZhdWx0IG9mIGZhbHNlKVxuICByZXR1cm4gc2NoZW1hdGljRW5jYXBzdWxhdGlvbjtcbn1cblxuZXhwb3J0IGNsYXNzIFNjaGVtYXRpY0VuZ2luZUhvc3QgZXh0ZW5kcyBOb2RlTW9kdWxlc0VuZ2luZUhvc3Qge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX3Jlc29sdmVSZWZlcmVuY2VTdHJpbmcoXG4gICAgcmVmU3RyaW5nOiBzdHJpbmcsXG4gICAgcGFyZW50UGF0aDogc3RyaW5nLFxuICAgIGNvbGxlY3Rpb25EZXNjcmlwdGlvbj86IEZpbGVTeXN0ZW1Db2xsZWN0aW9uRGVzYyxcbiAgKSB7XG4gICAgY29uc3QgW3BhdGgsIG5hbWVdID0gcmVmU3RyaW5nLnNwbGl0KCcjJywgMik7XG4gICAgLy8gTWltaWMgYmVoYXZpb3Igb2YgRXhwb3J0U3RyaW5nUmVmIGNsYXNzIHVzZWQgaW4gZGVmYXVsdCBiZWhhdmlvclxuICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aFswXSA9PT0gJy4nID8gcmVzb2x2ZShwYXJlbnRQYXRoID8/IHByb2Nlc3MuY3dkKCksIHBhdGgpIDogcGF0aDtcblxuICAgIGNvbnN0IHJlZmVyZW5jZVJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKF9fZmlsZW5hbWUpO1xuICAgIGNvbnN0IHNjaGVtYXRpY0ZpbGUgPSByZWZlcmVuY2VSZXF1aXJlLnJlc29sdmUoZnVsbFBhdGgsIHsgcGF0aHM6IFtwYXJlbnRQYXRoXSB9KTtcblxuICAgIGlmIChzaG91bGRXcmFwU2NoZW1hdGljKHNjaGVtYXRpY0ZpbGUsICEhY29sbGVjdGlvbkRlc2NyaXB0aW9uPy5lbmNhcHN1bGF0aW9uKSkge1xuICAgICAgY29uc3Qgc2NoZW1hdGljUGF0aCA9IGRpcm5hbWUoc2NoZW1hdGljRmlsZSk7XG5cbiAgICAgIGNvbnN0IG1vZHVsZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHVua25vd24+KCk7XG4gICAgICBjb25zdCBmYWN0b3J5SW5pdGlhbGl6ZXIgPSB3cmFwKFxuICAgICAgICBzY2hlbWF0aWNGaWxlLFxuICAgICAgICBzY2hlbWF0aWNQYXRoLFxuICAgICAgICBtb2R1bGVDYWNoZSxcbiAgICAgICAgbmFtZSB8fCAnZGVmYXVsdCcsXG4gICAgICApIGFzICgpID0+IFJ1bGVGYWN0b3J5PHt9PjtcblxuICAgICAgY29uc3QgZmFjdG9yeSA9IGZhY3RvcnlJbml0aWFsaXplcigpO1xuICAgICAgaWYgKCFmYWN0b3J5IHx8IHR5cGVvZiBmYWN0b3J5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4geyByZWY6IGZhY3RvcnksIHBhdGg6IHNjaGVtYXRpY1BhdGggfTtcbiAgICB9XG5cbiAgICAvLyBBbGwgb3RoZXIgc2NoZW1hdGljcyB1c2UgZGVmYXVsdCBiZWhhdmlvclxuICAgIHJldHVybiBzdXBlci5fcmVzb2x2ZVJlZmVyZW5jZVN0cmluZyhyZWZTdHJpbmcsIHBhcmVudFBhdGgsIGNvbGxlY3Rpb25EZXNjcmlwdGlvbik7XG4gIH1cbn1cblxuLyoqXG4gKiBNaW5pbWFsIHNoaW0gbW9kdWxlcyBmb3IgbGVnYWN5IGRlZXAgaW1wb3J0cyBvZiBgQHNjaGVtYXRpY3MvYW5ndWxhcmBcbiAqL1xuY29uc3QgbGVnYWN5TW9kdWxlczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG4gICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvY29uZmlnJzoge1xuICAgIGdldFdvcmtzcGFjZShob3N0OiBUcmVlKSB7XG4gICAgICBjb25zdCBwYXRoID0gJy8uYW5ndWxhci5qc29uJztcbiAgICAgIGNvbnN0IGRhdGEgPSBob3N0LnJlYWQocGF0aCk7XG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvdWxkIG5vdCBmaW5kICgke3BhdGh9KWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyc2VKc29uKGRhdGEudG9TdHJpbmcoKSwgW10sIHsgYWxsb3dUcmFpbGluZ0NvbW1hOiB0cnVlIH0pO1xuICAgIH0sXG4gIH0sXG4gICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvcHJvamVjdCc6IHtcbiAgICBidWlsZERlZmF1bHRQYXRoKHByb2plY3Q6IHsgc291cmNlUm9vdD86IHN0cmluZzsgcm9vdDogc3RyaW5nOyBwcm9qZWN0VHlwZTogc3RyaW5nIH0pOiBzdHJpbmcge1xuICAgICAgY29uc3Qgcm9vdCA9IHByb2plY3Quc291cmNlUm9vdCA/IGAvJHtwcm9qZWN0LnNvdXJjZVJvb3R9L2AgOiBgLyR7cHJvamVjdC5yb290fS9zcmMvYDtcblxuICAgICAgcmV0dXJuIGAke3Jvb3R9JHtwcm9qZWN0LnByb2plY3RUeXBlID09PSAnYXBwbGljYXRpb24nID8gJ2FwcCcgOiAnbGliJ31gO1xuICAgIH0sXG4gIH0sXG59O1xuXG4vKipcbiAqIFdyYXAgYSBKYXZhU2NyaXB0IGZpbGUgaW4gYSBWTSBjb250ZXh0IHRvIGFsbG93IHNwZWNpZmljIEFuZ3VsYXIgZGVwZW5kZW5jaWVzIHRvIGJlIHJlZGlyZWN0ZWQuXG4gKiBUaGlzIFZNIHNldHVwIGlzIE9OTFkgaW50ZW5kZWQgdG8gcmVkaXJlY3QgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEBwYXJhbSBzY2hlbWF0aWNGaWxlIEEgSmF2YVNjcmlwdCBzY2hlbWF0aWMgZmlsZSBwYXRoIHRoYXQgc2hvdWxkIGJlIHdyYXBwZWQuXG4gKiBAcGFyYW0gc2NoZW1hdGljRGlyZWN0b3J5IEEgZGlyZWN0b3J5IHRoYXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBsb2NhdGlvbiBvZiB0aGUgSmF2YVNjcmlwdCBmaWxlLlxuICogQHBhcmFtIG1vZHVsZUNhY2hlIEEgbWFwIHRvIHVzZSBmb3IgY2FjaGluZyByZXBlYXQgbW9kdWxlIHVzYWdlIGFuZCBwcm9wZXIgYGluc3RhbmNlb2ZgIHN1cHBvcnQuXG4gKiBAcGFyYW0gZXhwb3J0TmFtZSBBbiBvcHRpb25hbCBuYW1lIG9mIGEgc3BlY2lmaWMgZXhwb3J0IHRvIHJldHVybi4gT3RoZXJ3aXNlLCByZXR1cm4gYWxsIGV4cG9ydHMuXG4gKi9cbmZ1bmN0aW9uIHdyYXAoXG4gIHNjaGVtYXRpY0ZpbGU6IHN0cmluZyxcbiAgc2NoZW1hdGljRGlyZWN0b3J5OiBzdHJpbmcsXG4gIG1vZHVsZUNhY2hlOiBNYXA8c3RyaW5nLCB1bmtub3duPixcbiAgZXhwb3J0TmFtZT86IHN0cmluZyxcbik6ICgpID0+IHVua25vd24ge1xuICBjb25zdCBob3N0UmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoX19maWxlbmFtZSk7XG4gIGNvbnN0IHNjaGVtYXRpY1JlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKHNjaGVtYXRpY0ZpbGUpO1xuXG4gIGNvbnN0IGN1c3RvbVJlcXVpcmUgPSBmdW5jdGlvbiAoaWQ6IHN0cmluZykge1xuICAgIGlmIChsZWdhY3lNb2R1bGVzW2lkXSkge1xuICAgICAgLy8gUHJvdmlkZSBjb21wYXRpYmlsaXR5IG1vZHVsZXMgZm9yIG9sZGVyIHZlcnNpb25zIG9mIEBhbmd1bGFyL2Nka1xuICAgICAgcmV0dXJuIGxlZ2FjeU1vZHVsZXNbaWRdO1xuICAgIH0gZWxzZSBpZiAoaWQuc3RhcnRzV2l0aCgnc2NoZW1hdGljczonKSkge1xuICAgICAgLy8gU2NoZW1hdGljcyBidWlsdC1pbiBtb2R1bGVzIHVzZSB0aGUgYHNjaGVtYXRpY3NgIHNjaGVtZSAoc2ltaWxhciB0byB0aGUgTm9kZS5qcyBgbm9kZWAgc2NoZW1lKVxuICAgICAgY29uc3QgYnVpbHRpbklkID0gaWQuc2xpY2UoMTEpO1xuICAgICAgY29uc3QgYnVpbHRpbk1vZHVsZSA9IGxvYWRCdWlsdGluTW9kdWxlKGJ1aWx0aW5JZCk7XG4gICAgICBpZiAoIWJ1aWx0aW5Nb2R1bGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmtub3duIHNjaGVtYXRpY3MgYnVpbHQtaW4gbW9kdWxlICcke2lkfScgcmVxdWVzdGVkIGZyb20gc2NoZW1hdGljICcke3NjaGVtYXRpY0ZpbGV9J2AsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBidWlsdGluTW9kdWxlO1xuICAgIH0gZWxzZSBpZiAoaWQuc3RhcnRzV2l0aCgnQGFuZ3VsYXItZGV2a2l0LycpIHx8IGlkLnN0YXJ0c1dpdGgoJ0BzY2hlbWF0aWNzLycpKSB7XG4gICAgICAvLyBGaWxlcyBzaG91bGQgbm90IHJlZGlyZWN0IGBAYW5ndWxhci9jb3JlYCBhbmQgaW5zdGVhZCB1c2UgdGhlIGRpcmVjdFxuICAgICAgLy8gZGVwZW5kZW5jeSBpZiBhdmFpbGFibGUuIFRoaXMgYWxsb3dzIG9sZCBtYWpvciB2ZXJzaW9uIG1pZ3JhdGlvbnMgdG8gY29udGludWUgdG8gZnVuY3Rpb25cbiAgICAgIC8vIGV2ZW4gdGhvdWdoIHRoZSBsYXRlc3QgbWFqb3IgdmVyc2lvbiBtYXkgaGF2ZSBicmVha2luZyBjaGFuZ2VzIGluIGBAYW5ndWxhci9jb3JlYC5cbiAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdAYW5ndWxhci1kZXZraXQvY29yZScpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIHNjaGVtYXRpY1JlcXVpcmUoaWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgYXNzZXJ0SXNFcnJvcihlKTtcbiAgICAgICAgICBpZiAoZS5jb2RlICE9PSAnTU9EVUxFX05PVF9GT1VORCcpIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlc29sdmUgZnJvbSBpbnNpZGUgdGhlIGBAYW5ndWxhci9jbGlgIHByb2plY3RcbiAgICAgIHJldHVybiBob3N0UmVxdWlyZShpZCk7XG4gICAgfSBlbHNlIGlmIChpZC5zdGFydHNXaXRoKCcuJykgfHwgaWQuc3RhcnRzV2l0aCgnQGFuZ3VsYXIvY2RrJykpIHtcbiAgICAgIC8vIFdyYXAgcmVsYXRpdmUgZmlsZXMgaW5zaWRlIHRoZSBzY2hlbWF0aWMgY29sbGVjdGlvblxuICAgICAgLy8gQWxzbyB3cmFwIGBAYW5ndWxhci9jZGtgLCBpdCBjb250YWlucyBoZWxwZXIgdXRpbGl0aWVzIHRoYXQgaW1wb3J0IGNvcmUgc2NoZW1hdGljIHBhY2thZ2VzXG5cbiAgICAgIC8vIFJlc29sdmUgZnJvbSB0aGUgb3JpZ2luYWwgZmlsZVxuICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IHNjaGVtYXRpY1JlcXVpcmUucmVzb2x2ZShpZCk7XG5cbiAgICAgIC8vIFVzZSBjYWNoZWQgbW9kdWxlIGlmIGF2YWlsYWJsZVxuICAgICAgY29uc3QgY2FjaGVkTW9kdWxlID0gbW9kdWxlQ2FjaGUuZ2V0KG1vZHVsZVBhdGgpO1xuICAgICAgaWYgKGNhY2hlZE1vZHVsZSkge1xuICAgICAgICByZXR1cm4gY2FjaGVkTW9kdWxlO1xuICAgICAgfVxuXG4gICAgICAvLyBEbyBub3Qgd3JhcCB2ZW5kb3JlZCB0aGlyZC1wYXJ0eSBwYWNrYWdlcyBvciBKU09OIGZpbGVzXG4gICAgICBpZiAoXG4gICAgICAgICEvWy9cXFxcXW5vZGVfbW9kdWxlc1svXFxcXF1Ac2NoZW1hdGljc1svXFxcXF1hbmd1bGFyWy9cXFxcXXRoaXJkX3BhcnR5Wy9cXFxcXS8udGVzdChtb2R1bGVQYXRoKSAmJlxuICAgICAgICAhbW9kdWxlUGF0aC5lbmRzV2l0aCgnLmpzb24nKVxuICAgICAgKSB7XG4gICAgICAgIC8vIFdyYXAgbW9kdWxlIGFuZCBzYXZlIGluIGNhY2hlXG4gICAgICAgIGNvbnN0IHdyYXBwZWRNb2R1bGUgPSB3cmFwKG1vZHVsZVBhdGgsIGRpcm5hbWUobW9kdWxlUGF0aCksIG1vZHVsZUNhY2hlKSgpO1xuICAgICAgICBtb2R1bGVDYWNoZS5zZXQobW9kdWxlUGF0aCwgd3JhcHBlZE1vZHVsZSk7XG5cbiAgICAgICAgcmV0dXJuIHdyYXBwZWRNb2R1bGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWxsIG90aGVycyBhcmUgcmVxdWlyZWQgZGlyZWN0bHkgZnJvbSB0aGUgb3JpZ2luYWwgZmlsZVxuICAgIHJldHVybiBzY2hlbWF0aWNSZXF1aXJlKGlkKTtcbiAgfTtcblxuICAvLyBTZXR1cCBhIHdyYXBwZXIgZnVuY3Rpb24gdG8gY2FwdHVyZSB0aGUgbW9kdWxlJ3MgZXhwb3J0c1xuICBjb25zdCBzY2hlbWF0aWNDb2RlID0gcmVhZEZpbGVTeW5jKHNjaGVtYXRpY0ZpbGUsICd1dGY4Jyk7XG4gIC8vIGBtb2R1bGVgIGlzIHJlcXVpcmVkIGR1ZSB0byBAYW5ndWxhci9sb2NhbGl6ZSBuZy1hZGQgYmVpbmcgaW4gVU1EIGZvcm1hdFxuICBjb25zdCBoZWFkZXJDb2RlID0gJyhmdW5jdGlvbigpIHtcXG52YXIgZXhwb3J0cyA9IHt9O1xcbnZhciBtb2R1bGUgPSB7IGV4cG9ydHMgfTtcXG4nO1xuICBjb25zdCBmb290ZXJDb2RlID0gZXhwb3J0TmFtZVxuICAgID8gYFxcbnJldHVybiBtb2R1bGUuZXhwb3J0c1snJHtleHBvcnROYW1lfSddO30pO2BcbiAgICA6ICdcXG5yZXR1cm4gbW9kdWxlLmV4cG9ydHM7fSk7JztcblxuICBjb25zdCBzY3JpcHQgPSBuZXcgU2NyaXB0KGhlYWRlckNvZGUgKyBzY2hlbWF0aWNDb2RlICsgZm9vdGVyQ29kZSwge1xuICAgIGZpbGVuYW1lOiBzY2hlbWF0aWNGaWxlLFxuICAgIGxpbmVPZmZzZXQ6IDMsXG4gIH0pO1xuXG4gIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgX19kaXJuYW1lOiBzY2hlbWF0aWNEaXJlY3RvcnksXG4gICAgX19maWxlbmFtZTogc2NoZW1hdGljRmlsZSxcbiAgICBCdWZmZXIsXG4gICAgLy8gVGV4dEVuY29kZXIgaXMgdXNlZCBieSB0aGUgY29tcGlsZXIgdG8gZ2VuZXJhdGUgaTE4biBtZXNzYWdlIElEcy4gU2VlOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi9tYWluL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9pMThuL2RpZ2VzdC50cyNMMTdcbiAgICAvLyBJdCBpcyByZWZlcmVuY2VkIGdsb2JhbGx5LCBiZWNhdXNlIGl0IG1heSBiZSBydW4gZWl0aGVyIG9uIHRoZSBicm93c2VyIG9yIHRoZSBzZXJ2ZXIuXG4gICAgLy8gVXN1YWxseSBOb2RlIGV4cG9zZXMgaXQgZ2xvYmFsbHksIGJ1dCBpbiBvcmRlciBmb3IgaXQgdG8gd29yaywgb3VyIGN1c3RvbSBjb250ZXh0XG4gICAgLy8gaGFzIHRvIGV4cG9zZSBpdCB0b28uIElzc3VlIGNvbnRleHQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzQ4OTQwLlxuICAgIFRleHRFbmNvZGVyLFxuICAgIGNvbnNvbGUsXG4gICAgcHJvY2VzcyxcbiAgICBnZXQgZ2xvYmFsKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICByZXF1aXJlOiBjdXN0b21SZXF1aXJlLFxuICB9O1xuXG4gIGNvbnN0IGV4cG9ydHNGYWN0b3J5ID0gc2NyaXB0LnJ1bkluTmV3Q29udGV4dChjb250ZXh0KTtcblxuICByZXR1cm4gZXhwb3J0c0ZhY3Rvcnk7XG59XG5cbmZ1bmN0aW9uIGxvYWRCdWlsdGluTW9kdWxlKGlkOiBzdHJpbmcpOiB1bmtub3duIHtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiJdfQ==
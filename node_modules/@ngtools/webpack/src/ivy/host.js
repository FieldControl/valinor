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
exports.augmentHostWithCaching = exports.augmentProgramWithVersioning = exports.augmentHostWithVersioning = exports.augmentHostWithSubstitutions = exports.augmentHostWithReplacements = exports.augmentHostWithNgcc = exports.augmentHostWithDependencyCollection = exports.augmentHostWithResources = void 0;
const crypto_1 = require("crypto");
const path = __importStar(require("path"));
const ts = __importStar(require("typescript"));
const paths_1 = require("./paths");
function augmentHostWithResources(host, resourceLoader, options = {}) {
    const resourceHost = host;
    resourceHost.readResource = function (fileName) {
        const filePath = (0, paths_1.normalizePath)(fileName);
        if (options.directTemplateLoading &&
            (filePath.endsWith('.html') || filePath.endsWith('.svg'))) {
            const content = this.readFile(filePath);
            if (content === undefined) {
                throw new Error('Unable to locate component resource: ' + fileName);
            }
            resourceLoader.setAffectedResources(filePath, [filePath]);
            return content;
        }
        else {
            return resourceLoader.get(filePath);
        }
    };
    resourceHost.resourceNameToFileName = function (resourceName, containingFile) {
        return path.join(path.dirname(containingFile), resourceName);
    };
    resourceHost.getModifiedResourceFiles = function () {
        return resourceLoader.getModifiedResourceFiles();
    };
    resourceHost.transformResource = async function (data, context) {
        // Only inline style resources are supported currently
        if (context.resourceFile || context.type !== 'style') {
            return null;
        }
        if (options.inlineStyleFileExtension) {
            const content = await resourceLoader.process(data, options.inlineStyleFileExtension, context.type, context.containingFile);
            return { content };
        }
        return null;
    };
}
exports.augmentHostWithResources = augmentHostWithResources;
function augmentResolveModuleNames(host, resolvedModuleModifier, moduleResolutionCache) {
    if (host.resolveModuleNames) {
        const baseResolveModuleNames = host.resolveModuleNames;
        host.resolveModuleNames = function (moduleNames, ...parameters) {
            return moduleNames.map((name) => {
                const result = baseResolveModuleNames.call(host, [name], ...parameters);
                return resolvedModuleModifier(result[0], name);
            });
        };
    }
    else {
        host.resolveModuleNames = function (moduleNames, containingFile, _reusedNames, redirectedReference, options) {
            return moduleNames.map((name) => {
                const result = ts.resolveModuleName(name, containingFile, options, host, moduleResolutionCache, redirectedReference).resolvedModule;
                return resolvedModuleModifier(result, name);
            });
        };
    }
}
/**
 * Augments a TypeScript Compiler Host's resolveModuleNames function to collect dependencies
 * of the containing file passed to the resolveModuleNames function. This process assumes
 * that consumers of the Compiler Host will only call resolveModuleNames with modules that are
 * actually present in a containing file.
 * This process is a workaround for gathering a TypeScript SourceFile's dependencies as there
 * is no currently exposed public method to do so. A BuilderProgram does have a `getAllDependencies`
 * function. However, that function returns all transitive dependencies as well which can cause
 * excessive Webpack rebuilds.
 *
 * @param host The CompilerHost to augment.
 * @param dependencies A Map which will be used to store file dependencies.
 * @param moduleResolutionCache An optional resolution cache to use when the host resolves a module.
 */
function augmentHostWithDependencyCollection(host, dependencies, moduleResolutionCache) {
    if (host.resolveModuleNames) {
        const baseResolveModuleNames = host.resolveModuleNames;
        host.resolveModuleNames = function (moduleNames, containingFile, ...parameters) {
            const results = baseResolveModuleNames.call(host, moduleNames, containingFile, ...parameters);
            const containingFilePath = (0, paths_1.normalizePath)(containingFile);
            for (const result of results) {
                if (result) {
                    const containingFileDependencies = dependencies.get(containingFilePath);
                    if (containingFileDependencies) {
                        containingFileDependencies.add(result.resolvedFileName);
                    }
                    else {
                        dependencies.set(containingFilePath, new Set([result.resolvedFileName]));
                    }
                }
            }
            return results;
        };
    }
    else {
        host.resolveModuleNames = function (moduleNames, containingFile, _reusedNames, redirectedReference, options) {
            return moduleNames.map((name) => {
                const result = ts.resolveModuleName(name, containingFile, options, host, moduleResolutionCache, redirectedReference).resolvedModule;
                if (result) {
                    const containingFilePath = (0, paths_1.normalizePath)(containingFile);
                    const containingFileDependencies = dependencies.get(containingFilePath);
                    if (containingFileDependencies) {
                        containingFileDependencies.add(result.resolvedFileName);
                    }
                    else {
                        dependencies.set(containingFilePath, new Set([result.resolvedFileName]));
                    }
                }
                return result;
            });
        };
    }
}
exports.augmentHostWithDependencyCollection = augmentHostWithDependencyCollection;
function augmentHostWithNgcc(host, ngcc, moduleResolutionCache) {
    augmentResolveModuleNames(host, (resolvedModule, moduleName) => {
        if (resolvedModule && ngcc) {
            ngcc.processModule(moduleName, resolvedModule);
        }
        return resolvedModule;
    }, moduleResolutionCache);
    if (host.resolveTypeReferenceDirectives) {
        const baseResolveTypeReferenceDirectives = host.resolveTypeReferenceDirectives;
        host.resolveTypeReferenceDirectives = function (names, ...parameters) {
            return names.map((name) => {
                const fileName = typeof name === 'string' ? name : name.fileName;
                const result = baseResolveTypeReferenceDirectives.call(host, [fileName], ...parameters);
                if (result[0] && ngcc) {
                    ngcc.processModule(fileName, result[0]);
                }
                return result[0];
            });
        };
    }
    else {
        host.resolveTypeReferenceDirectives = function (moduleNames, containingFile, redirectedReference, options) {
            return moduleNames.map((name) => {
                const fileName = typeof name === 'string' ? name : name.fileName;
                const result = ts.resolveTypeReferenceDirective(fileName, containingFile, options, host, redirectedReference).resolvedTypeReferenceDirective;
                if (result && ngcc) {
                    ngcc.processModule(fileName, result);
                }
                return result;
            });
        };
    }
}
exports.augmentHostWithNgcc = augmentHostWithNgcc;
function augmentHostWithReplacements(host, replacements, moduleResolutionCache) {
    if (Object.keys(replacements).length === 0) {
        return;
    }
    const normalizedReplacements = {};
    for (const [key, value] of Object.entries(replacements)) {
        normalizedReplacements[(0, paths_1.normalizePath)(key)] = (0, paths_1.normalizePath)(value);
    }
    const tryReplace = (resolvedModule) => {
        const replacement = resolvedModule && normalizedReplacements[resolvedModule.resolvedFileName];
        if (replacement) {
            return {
                resolvedFileName: replacement,
                isExternalLibraryImport: /[/\\]node_modules[/\\]/.test(replacement),
            };
        }
        else {
            return resolvedModule;
        }
    };
    augmentResolveModuleNames(host, tryReplace, moduleResolutionCache);
}
exports.augmentHostWithReplacements = augmentHostWithReplacements;
function augmentHostWithSubstitutions(host, substitutions) {
    const regexSubstitutions = [];
    for (const [key, value] of Object.entries(substitutions)) {
        regexSubstitutions.push([new RegExp(`\\b${key}\\b`, 'g'), value]);
    }
    if (regexSubstitutions.length === 0) {
        return;
    }
    const baseReadFile = host.readFile;
    host.readFile = function (...parameters) {
        let file = baseReadFile.call(host, ...parameters);
        if (file) {
            for (const entry of regexSubstitutions) {
                file = file.replace(entry[0], entry[1]);
            }
        }
        return file;
    };
}
exports.augmentHostWithSubstitutions = augmentHostWithSubstitutions;
function augmentHostWithVersioning(host) {
    const baseGetSourceFile = host.getSourceFile;
    host.getSourceFile = function (...parameters) {
        const file = baseGetSourceFile.call(host, ...parameters);
        if (file && file.version === undefined) {
            file.version = (0, crypto_1.createHash)('sha256').update(file.text).digest('hex');
        }
        return file;
    };
}
exports.augmentHostWithVersioning = augmentHostWithVersioning;
function augmentProgramWithVersioning(program) {
    const baseGetSourceFiles = program.getSourceFiles;
    program.getSourceFiles = function (...parameters) {
        const files = baseGetSourceFiles(...parameters);
        for (const file of files) {
            if (file.version === undefined) {
                file.version = (0, crypto_1.createHash)('sha256').update(file.text).digest('hex');
            }
        }
        return files;
    };
}
exports.augmentProgramWithVersioning = augmentProgramWithVersioning;
function augmentHostWithCaching(host, cache) {
    const baseGetSourceFile = host.getSourceFile;
    host.getSourceFile = function (fileName, languageVersion, onError, shouldCreateNewSourceFile, ...parameters) {
        if (!shouldCreateNewSourceFile && cache.has(fileName)) {
            return cache.get(fileName);
        }
        const file = baseGetSourceFile.call(host, fileName, languageVersion, onError, true, ...parameters);
        if (file) {
            cache.set(fileName, file);
        }
        return file;
    };
}
exports.augmentHostWithCaching = augmentHostWithCaching;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvaXZ5L2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJSCxtQ0FBb0M7QUFDcEMsMkNBQTZCO0FBQzdCLCtDQUFpQztBQUdqQyxtQ0FBd0M7QUFFeEMsU0FBZ0Isd0JBQXdCLENBQ3RDLElBQXFCLEVBQ3JCLGNBQXFDLEVBQ3JDLFVBR0ksRUFBRTtJQUVOLE1BQU0sWUFBWSxHQUFHLElBQW9CLENBQUM7SUFFMUMsWUFBWSxDQUFDLFlBQVksR0FBRyxVQUFVLFFBQWdCO1FBQ3BELE1BQU0sUUFBUSxHQUFHLElBQUEscUJBQWEsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUV6QyxJQUNFLE9BQU8sQ0FBQyxxQkFBcUI7WUFDN0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDekQ7WUFDQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsR0FBRyxRQUFRLENBQUMsQ0FBQzthQUNyRTtZQUVELGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRTFELE9BQU8sT0FBTyxDQUFDO1NBQ2hCO2FBQU07WUFDTCxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckM7SUFDSCxDQUFDLENBQUM7SUFFRixZQUFZLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxZQUFvQixFQUFFLGNBQXNCO1FBQzFGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQztJQUVGLFlBQVksQ0FBQyx3QkFBd0IsR0FBRztRQUN0QyxPQUFPLGNBQWMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0lBQ25ELENBQUMsQ0FBQztJQUVGLFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLFdBQVcsSUFBSSxFQUFFLE9BQU87UUFDNUQsc0RBQXNEO1FBQ3RELElBQUksT0FBTyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtZQUNwRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsSUFBSSxPQUFPLENBQUMsd0JBQXdCLEVBQUU7WUFDcEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxjQUFjLENBQUMsT0FBTyxDQUMxQyxJQUFJLEVBQ0osT0FBTyxDQUFDLHdCQUF3QixFQUNoQyxPQUFPLENBQUMsSUFBSSxFQUNaLE9BQU8sQ0FBQyxjQUFjLENBQ3ZCLENBQUM7WUFFRixPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7U0FDcEI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNKLENBQUM7QUF6REQsNERBeURDO0FBRUQsU0FBUyx5QkFBeUIsQ0FDaEMsSUFBcUIsRUFDckIsc0JBR2tDLEVBQ2xDLHFCQUFnRDtJQUVoRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtRQUMzQixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN2RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxXQUFxQixFQUFFLEdBQUcsVUFBVTtZQUN0RSxPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDOUIsTUFBTSxNQUFNLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBRXhFLE9BQU8sc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0tBQ0g7U0FBTTtRQUNMLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUN4QixXQUFxQixFQUNyQixjQUFzQixFQUN0QixZQUFrQyxFQUNsQyxtQkFBNEQsRUFDNUQsT0FBMkI7WUFFM0IsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDakMsSUFBSSxFQUNKLGNBQWMsRUFDZCxPQUFPLEVBQ1AsSUFBSSxFQUNKLHFCQUFxQixFQUNyQixtQkFBbUIsQ0FDcEIsQ0FBQyxjQUFjLENBQUM7Z0JBRWpCLE9BQU8sc0JBQXNCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILFNBQWdCLG1DQUFtQyxDQUNqRCxJQUFxQixFQUNyQixZQUFzQyxFQUN0QyxxQkFBZ0Q7SUFFaEQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7UUFDM0IsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDdkQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFVBQ3hCLFdBQXFCLEVBQ3JCLGNBQXNCLEVBQ3RCLEdBQUcsVUFBVTtZQUViLE1BQU0sT0FBTyxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBRTlGLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxxQkFBYSxFQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3pELEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO2dCQUM1QixJQUFJLE1BQU0sRUFBRTtvQkFDVixNQUFNLDBCQUEwQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDeEUsSUFBSSwwQkFBMEIsRUFBRTt3QkFDOUIsMEJBQTBCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUN6RDt5QkFBTTt3QkFDTCxZQUFZLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTtpQkFDRjthQUNGO1lBRUQsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQyxDQUFDO0tBQ0g7U0FBTTtRQUNMLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUN4QixXQUFxQixFQUNyQixjQUFzQixFQUN0QixZQUFrQyxFQUNsQyxtQkFBNEQsRUFDNUQsT0FBMkI7WUFFM0IsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDakMsSUFBSSxFQUNKLGNBQWMsRUFDZCxPQUFPLEVBQ1AsSUFBSSxFQUNKLHFCQUFxQixFQUNyQixtQkFBbUIsQ0FDcEIsQ0FBQyxjQUFjLENBQUM7Z0JBRWpCLElBQUksTUFBTSxFQUFFO29CQUNWLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxxQkFBYSxFQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUN6RCxNQUFNLDBCQUEwQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDeEUsSUFBSSwwQkFBMEIsRUFBRTt3QkFDOUIsMEJBQTBCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUN6RDt5QkFBTTt3QkFDTCxZQUFZLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTtpQkFDRjtnQkFFRCxPQUFPLE1BQU0sQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztLQUNIO0FBQ0gsQ0FBQztBQTVERCxrRkE0REM7QUFFRCxTQUFnQixtQkFBbUIsQ0FDakMsSUFBcUIsRUFDckIsSUFBbUIsRUFDbkIscUJBQWdEO0lBRWhELHlCQUF5QixDQUN2QixJQUFJLEVBQ0osQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLEVBQUU7UUFDN0IsSUFBSSxjQUFjLElBQUksSUFBSSxFQUFFO1lBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQyxFQUNELHFCQUFxQixDQUN0QixDQUFDO0lBRUYsSUFBSSxJQUFJLENBQUMsOEJBQThCLEVBQUU7UUFDdkMsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUM7UUFDL0UsSUFBSSxDQUFDLDhCQUE4QixHQUFHLFVBQ3BDLEtBQW9DLEVBQ3BDLEdBQUcsVUFBVTtZQUViLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUN4QixNQUFNLFFBQVEsR0FBRyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDakUsTUFBTSxNQUFNLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBRXhGLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtvQkFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pDO2dCQUVELE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0tBQ0g7U0FBTTtRQUNMLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxVQUNwQyxXQUEwQyxFQUMxQyxjQUFzQixFQUN0QixtQkFBNEQsRUFDNUQsT0FBMkI7WUFFM0IsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQzlCLE1BQU0sUUFBUSxHQUFHLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNqRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsNkJBQTZCLENBQzdDLFFBQVEsRUFDUixjQUFjLEVBQ2QsT0FBTyxFQUNQLElBQUksRUFDSixtQkFBbUIsQ0FDcEIsQ0FBQyw4QkFBOEIsQ0FBQztnQkFFakMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO29CQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDdEM7Z0JBRUQsT0FBTyxNQUFNLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7S0FDSDtBQUNILENBQUM7QUEzREQsa0RBMkRDO0FBRUQsU0FBZ0IsMkJBQTJCLENBQ3pDLElBQXFCLEVBQ3JCLFlBQW9DLEVBQ3BDLHFCQUFnRDtJQUVoRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUMxQyxPQUFPO0tBQ1I7SUFFRCxNQUFNLHNCQUFzQixHQUEyQixFQUFFLENBQUM7SUFDMUQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7UUFDdkQsc0JBQXNCLENBQUMsSUFBQSxxQkFBYSxFQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBQSxxQkFBYSxFQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ25FO0lBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxjQUE2QyxFQUFFLEVBQUU7UUFDbkUsTUFBTSxXQUFXLEdBQUcsY0FBYyxJQUFJLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlGLElBQUksV0FBVyxFQUFFO1lBQ2YsT0FBTztnQkFDTCxnQkFBZ0IsRUFBRSxXQUFXO2dCQUM3Qix1QkFBdUIsRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQ3BFLENBQUM7U0FDSDthQUFNO1lBQ0wsT0FBTyxjQUFjLENBQUM7U0FDdkI7SUFDSCxDQUFDLENBQUM7SUFFRix5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDckUsQ0FBQztBQTNCRCxrRUEyQkM7QUFFRCxTQUFnQiw0QkFBNEIsQ0FDMUMsSUFBcUIsRUFDckIsYUFBcUM7SUFFckMsTUFBTSxrQkFBa0IsR0FBdUIsRUFBRSxDQUFDO0lBQ2xELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQ3hELGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNuRTtJQUVELElBQUksa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQyxPQUFPO0tBQ1I7SUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLFVBQVU7UUFDckMsSUFBSSxJQUFJLEdBQXVCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFDdEUsSUFBSSxJQUFJLEVBQUU7WUFDUixLQUFLLE1BQU0sS0FBSyxJQUFJLGtCQUFrQixFQUFFO2dCQUN0QyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDekM7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQXhCRCxvRUF3QkM7QUFFRCxTQUFnQix5QkFBeUIsQ0FBQyxJQUFxQjtJQUM3RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDN0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLEdBQUcsVUFBVTtRQUMxQyxNQUFNLElBQUksR0FBdUQsaUJBQWlCLENBQUMsSUFBSSxDQUNyRixJQUFJLEVBQ0osR0FBRyxVQUFVLENBQ2QsQ0FBQztRQUNGLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBQSxtQkFBVSxFQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSixDQUFDO0FBYkQsOERBYUM7QUFFRCxTQUFnQiw0QkFBNEIsQ0FBQyxPQUFtQjtJQUM5RCxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7SUFDbEQsT0FBTyxDQUFDLGNBQWMsR0FBRyxVQUFVLEdBQUcsVUFBVTtRQUM5QyxNQUFNLEtBQUssR0FBc0Qsa0JBQWtCLENBQ2pGLEdBQUcsVUFBVSxDQUNkLENBQUM7UUFFRixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN4QixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsbUJBQVUsRUFBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNyRTtTQUNGO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDLENBQUM7QUFDSixDQUFDO0FBZkQsb0VBZUM7QUFFRCxTQUFnQixzQkFBc0IsQ0FDcEMsSUFBcUIsRUFDckIsS0FBaUM7SUFFakMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzdDLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFDbkIsUUFBUSxFQUNSLGVBQWUsRUFDZixPQUFPLEVBQ1AseUJBQXlCLEVBQ3pCLEdBQUcsVUFBVTtRQUViLElBQUksQ0FBQyx5QkFBeUIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3JELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM1QjtRQUVELE1BQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FDakMsSUFBSSxFQUNKLFFBQVEsRUFDUixlQUFlLEVBQ2YsT0FBTyxFQUNQLElBQUksRUFDSixHQUFHLFVBQVUsQ0FDZCxDQUFDO1FBRUYsSUFBSSxJQUFJLEVBQUU7WUFDUixLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMzQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQS9CRCx3REErQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L3VuYm91bmQtbWV0aG9kICovXG5pbXBvcnQgdHlwZSB7IENvbXBpbGVySG9zdCB9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaSc7XG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IE5nY2NQcm9jZXNzb3IgfSBmcm9tICcuLi9uZ2NjX3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBXZWJwYWNrUmVzb3VyY2VMb2FkZXIgfSBmcm9tICcuLi9yZXNvdXJjZV9sb2FkZXInO1xuaW1wb3J0IHsgbm9ybWFsaXplUGF0aCB9IGZyb20gJy4vcGF0aHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEhvc3RXaXRoUmVzb3VyY2VzKFxuICBob3N0OiB0cy5Db21waWxlckhvc3QsXG4gIHJlc291cmNlTG9hZGVyOiBXZWJwYWNrUmVzb3VyY2VMb2FkZXIsXG4gIG9wdGlvbnM6IHtcbiAgICBkaXJlY3RUZW1wbGF0ZUxvYWRpbmc/OiBib29sZWFuO1xuICAgIGlubGluZVN0eWxlRmlsZUV4dGVuc2lvbj86IHN0cmluZztcbiAgfSA9IHt9LFxuKSB7XG4gIGNvbnN0IHJlc291cmNlSG9zdCA9IGhvc3QgYXMgQ29tcGlsZXJIb3N0O1xuXG4gIHJlc291cmNlSG9zdC5yZWFkUmVzb3VyY2UgPSBmdW5jdGlvbiAoZmlsZU5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gbm9ybWFsaXplUGF0aChmaWxlTmFtZSk7XG5cbiAgICBpZiAoXG4gICAgICBvcHRpb25zLmRpcmVjdFRlbXBsYXRlTG9hZGluZyAmJlxuICAgICAgKGZpbGVQYXRoLmVuZHNXaXRoKCcuaHRtbCcpIHx8IGZpbGVQYXRoLmVuZHNXaXRoKCcuc3ZnJykpXG4gICAgKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5yZWFkRmlsZShmaWxlUGF0aCk7XG4gICAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGxvY2F0ZSBjb21wb25lbnQgcmVzb3VyY2U6ICcgKyBmaWxlTmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHJlc291cmNlTG9hZGVyLnNldEFmZmVjdGVkUmVzb3VyY2VzKGZpbGVQYXRoLCBbZmlsZVBhdGhdKTtcblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXNvdXJjZUxvYWRlci5nZXQoZmlsZVBhdGgpO1xuICAgIH1cbiAgfTtcblxuICByZXNvdXJjZUhvc3QucmVzb3VyY2VOYW1lVG9GaWxlTmFtZSA9IGZ1bmN0aW9uIChyZXNvdXJjZU5hbWU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU6IHN0cmluZykge1xuICAgIHJldHVybiBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGNvbnRhaW5pbmdGaWxlKSwgcmVzb3VyY2VOYW1lKTtcbiAgfTtcblxuICByZXNvdXJjZUhvc3QuZ2V0TW9kaWZpZWRSZXNvdXJjZUZpbGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZXNvdXJjZUxvYWRlci5nZXRNb2RpZmllZFJlc291cmNlRmlsZXMoKTtcbiAgfTtcblxuICByZXNvdXJjZUhvc3QudHJhbnNmb3JtUmVzb3VyY2UgPSBhc3luYyBmdW5jdGlvbiAoZGF0YSwgY29udGV4dCkge1xuICAgIC8vIE9ubHkgaW5saW5lIHN0eWxlIHJlc291cmNlcyBhcmUgc3VwcG9ydGVkIGN1cnJlbnRseVxuICAgIGlmIChjb250ZXh0LnJlc291cmNlRmlsZSB8fCBjb250ZXh0LnR5cGUgIT09ICdzdHlsZScpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmlubGluZVN0eWxlRmlsZUV4dGVuc2lvbikge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlc291cmNlTG9hZGVyLnByb2Nlc3MoXG4gICAgICAgIGRhdGEsXG4gICAgICAgIG9wdGlvbnMuaW5saW5lU3R5bGVGaWxlRXh0ZW5zaW9uLFxuICAgICAgICBjb250ZXh0LnR5cGUsXG4gICAgICAgIGNvbnRleHQuY29udGFpbmluZ0ZpbGUsXG4gICAgICApO1xuXG4gICAgICByZXR1cm4geyBjb250ZW50IH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF1Z21lbnRSZXNvbHZlTW9kdWxlTmFtZXMoXG4gIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCxcbiAgcmVzb2x2ZWRNb2R1bGVNb2RpZmllcjogKFxuICAgIHJlc29sdmVkTW9kdWxlOiB0cy5SZXNvbHZlZE1vZHVsZSB8IHVuZGVmaW5lZCxcbiAgICBtb2R1bGVOYW1lOiBzdHJpbmcsXG4gICkgPT4gdHMuUmVzb2x2ZWRNb2R1bGUgfCB1bmRlZmluZWQsXG4gIG1vZHVsZVJlc29sdXRpb25DYWNoZT86IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZSxcbik6IHZvaWQge1xuICBpZiAoaG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMpIHtcbiAgICBjb25zdCBiYXNlUmVzb2x2ZU1vZHVsZU5hbWVzID0gaG9zdC5yZXNvbHZlTW9kdWxlTmFtZXM7XG4gICAgaG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMgPSBmdW5jdGlvbiAobW9kdWxlTmFtZXM6IHN0cmluZ1tdLCAuLi5wYXJhbWV0ZXJzKSB7XG4gICAgICByZXR1cm4gbW9kdWxlTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VSZXNvbHZlTW9kdWxlTmFtZXMuY2FsbChob3N0LCBbbmFtZV0sIC4uLnBhcmFtZXRlcnMpO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlZE1vZHVsZU1vZGlmaWVyKHJlc3VsdFswXSwgbmFtZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGhvc3QucmVzb2x2ZU1vZHVsZU5hbWVzID0gZnVuY3Rpb24gKFxuICAgICAgbW9kdWxlTmFtZXM6IHN0cmluZ1tdLFxuICAgICAgY29udGFpbmluZ0ZpbGU6IHN0cmluZyxcbiAgICAgIF9yZXVzZWROYW1lczogc3RyaW5nW10gfCB1bmRlZmluZWQsXG4gICAgICByZWRpcmVjdGVkUmVmZXJlbmNlOiB0cy5SZXNvbHZlZFByb2plY3RSZWZlcmVuY2UgfCB1bmRlZmluZWQsXG4gICAgICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsXG4gICAgKSB7XG4gICAgICByZXR1cm4gbW9kdWxlTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRzLnJlc29sdmVNb2R1bGVOYW1lKFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgY29udGFpbmluZ0ZpbGUsXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICBob3N0LFxuICAgICAgICAgIG1vZHVsZVJlc29sdXRpb25DYWNoZSxcbiAgICAgICAgICByZWRpcmVjdGVkUmVmZXJlbmNlLFxuICAgICAgICApLnJlc29sdmVkTW9kdWxlO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlZE1vZHVsZU1vZGlmaWVyKHJlc3VsdCwgbmFtZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQXVnbWVudHMgYSBUeXBlU2NyaXB0IENvbXBpbGVyIEhvc3QncyByZXNvbHZlTW9kdWxlTmFtZXMgZnVuY3Rpb24gdG8gY29sbGVjdCBkZXBlbmRlbmNpZXNcbiAqIG9mIHRoZSBjb250YWluaW5nIGZpbGUgcGFzc2VkIHRvIHRoZSByZXNvbHZlTW9kdWxlTmFtZXMgZnVuY3Rpb24uIFRoaXMgcHJvY2VzcyBhc3N1bWVzXG4gKiB0aGF0IGNvbnN1bWVycyBvZiB0aGUgQ29tcGlsZXIgSG9zdCB3aWxsIG9ubHkgY2FsbCByZXNvbHZlTW9kdWxlTmFtZXMgd2l0aCBtb2R1bGVzIHRoYXQgYXJlXG4gKiBhY3R1YWxseSBwcmVzZW50IGluIGEgY29udGFpbmluZyBmaWxlLlxuICogVGhpcyBwcm9jZXNzIGlzIGEgd29ya2Fyb3VuZCBmb3IgZ2F0aGVyaW5nIGEgVHlwZVNjcmlwdCBTb3VyY2VGaWxlJ3MgZGVwZW5kZW5jaWVzIGFzIHRoZXJlXG4gKiBpcyBubyBjdXJyZW50bHkgZXhwb3NlZCBwdWJsaWMgbWV0aG9kIHRvIGRvIHNvLiBBIEJ1aWxkZXJQcm9ncmFtIGRvZXMgaGF2ZSBhIGBnZXRBbGxEZXBlbmRlbmNpZXNgXG4gKiBmdW5jdGlvbi4gSG93ZXZlciwgdGhhdCBmdW5jdGlvbiByZXR1cm5zIGFsbCB0cmFuc2l0aXZlIGRlcGVuZGVuY2llcyBhcyB3ZWxsIHdoaWNoIGNhbiBjYXVzZVxuICogZXhjZXNzaXZlIFdlYnBhY2sgcmVidWlsZHMuXG4gKlxuICogQHBhcmFtIGhvc3QgVGhlIENvbXBpbGVySG9zdCB0byBhdWdtZW50LlxuICogQHBhcmFtIGRlcGVuZGVuY2llcyBBIE1hcCB3aGljaCB3aWxsIGJlIHVzZWQgdG8gc3RvcmUgZmlsZSBkZXBlbmRlbmNpZXMuXG4gKiBAcGFyYW0gbW9kdWxlUmVzb2x1dGlvbkNhY2hlIEFuIG9wdGlvbmFsIHJlc29sdXRpb24gY2FjaGUgdG8gdXNlIHdoZW4gdGhlIGhvc3QgcmVzb2x2ZXMgYSBtb2R1bGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50SG9zdFdpdGhEZXBlbmRlbmN5Q29sbGVjdGlvbihcbiAgaG9zdDogdHMuQ29tcGlsZXJIb3N0LFxuICBkZXBlbmRlbmNpZXM6IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PixcbiAgbW9kdWxlUmVzb2x1dGlvbkNhY2hlPzogdHMuTW9kdWxlUmVzb2x1dGlvbkNhY2hlLFxuKTogdm9pZCB7XG4gIGlmIChob3N0LnJlc29sdmVNb2R1bGVOYW1lcykge1xuICAgIGNvbnN0IGJhc2VSZXNvbHZlTW9kdWxlTmFtZXMgPSBob3N0LnJlc29sdmVNb2R1bGVOYW1lcztcbiAgICBob3N0LnJlc29sdmVNb2R1bGVOYW1lcyA9IGZ1bmN0aW9uIChcbiAgICAgIG1vZHVsZU5hbWVzOiBzdHJpbmdbXSxcbiAgICAgIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcsXG4gICAgICAuLi5wYXJhbWV0ZXJzXG4gICAgKSB7XG4gICAgICBjb25zdCByZXN1bHRzID0gYmFzZVJlc29sdmVNb2R1bGVOYW1lcy5jYWxsKGhvc3QsIG1vZHVsZU5hbWVzLCBjb250YWluaW5nRmlsZSwgLi4ucGFyYW1ldGVycyk7XG5cbiAgICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlUGF0aCA9IG5vcm1hbGl6ZVBhdGgoY29udGFpbmluZ0ZpbGUpO1xuICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgY29uc3QgY29udGFpbmluZ0ZpbGVEZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMuZ2V0KGNvbnRhaW5pbmdGaWxlUGF0aCk7XG4gICAgICAgICAgaWYgKGNvbnRhaW5pbmdGaWxlRGVwZW5kZW5jaWVzKSB7XG4gICAgICAgICAgICBjb250YWluaW5nRmlsZURlcGVuZGVuY2llcy5hZGQocmVzdWx0LnJlc29sdmVkRmlsZU5hbWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXBlbmRlbmNpZXMuc2V0KGNvbnRhaW5pbmdGaWxlUGF0aCwgbmV3IFNldChbcmVzdWx0LnJlc29sdmVkRmlsZU5hbWVdKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgaG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMgPSBmdW5jdGlvbiAoXG4gICAgICBtb2R1bGVOYW1lczogc3RyaW5nW10sXG4gICAgICBjb250YWluaW5nRmlsZTogc3RyaW5nLFxuICAgICAgX3JldXNlZE5hbWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcbiAgICAgIHJlZGlyZWN0ZWRSZWZlcmVuY2U6IHRzLlJlc29sdmVkUHJvamVjdFJlZmVyZW5jZSB8IHVuZGVmaW5lZCxcbiAgICAgIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyxcbiAgICApIHtcbiAgICAgIHJldHVybiBtb2R1bGVOYW1lcy5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdHMucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBjb250YWluaW5nRmlsZSxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgbW9kdWxlUmVzb2x1dGlvbkNhY2hlLFxuICAgICAgICAgIHJlZGlyZWN0ZWRSZWZlcmVuY2UsXG4gICAgICAgICkucmVzb2x2ZWRNb2R1bGU7XG5cbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlUGF0aCA9IG5vcm1hbGl6ZVBhdGgoY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlRGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzLmdldChjb250YWluaW5nRmlsZVBhdGgpO1xuICAgICAgICAgIGlmIChjb250YWluaW5nRmlsZURlcGVuZGVuY2llcykge1xuICAgICAgICAgICAgY29udGFpbmluZ0ZpbGVEZXBlbmRlbmNpZXMuYWRkKHJlc3VsdC5yZXNvbHZlZEZpbGVOYW1lKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVwZW5kZW5jaWVzLnNldChjb250YWluaW5nRmlsZVBhdGgsIG5ldyBTZXQoW3Jlc3VsdC5yZXNvbHZlZEZpbGVOYW1lXSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50SG9zdFdpdGhOZ2NjKFxuICBob3N0OiB0cy5Db21waWxlckhvc3QsXG4gIG5nY2M6IE5nY2NQcm9jZXNzb3IsXG4gIG1vZHVsZVJlc29sdXRpb25DYWNoZT86IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZSxcbik6IHZvaWQge1xuICBhdWdtZW50UmVzb2x2ZU1vZHVsZU5hbWVzKFxuICAgIGhvc3QsXG4gICAgKHJlc29sdmVkTW9kdWxlLCBtb2R1bGVOYW1lKSA9PiB7XG4gICAgICBpZiAocmVzb2x2ZWRNb2R1bGUgJiYgbmdjYykge1xuICAgICAgICBuZ2NjLnByb2Nlc3NNb2R1bGUobW9kdWxlTmFtZSwgcmVzb2x2ZWRNb2R1bGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzb2x2ZWRNb2R1bGU7XG4gICAgfSxcbiAgICBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUsXG4gICk7XG5cbiAgaWYgKGhvc3QucmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzKSB7XG4gICAgY29uc3QgYmFzZVJlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcyA9IGhvc3QucmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzO1xuICAgIGhvc3QucmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzID0gZnVuY3Rpb24gKFxuICAgICAgbmFtZXM6IHN0cmluZ1tdIHwgdHMuRmlsZVJlZmVyZW5jZVtdLFxuICAgICAgLi4ucGFyYW1ldGVyc1xuICAgICkge1xuICAgICAgcmV0dXJuIG5hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyA/IG5hbWUgOiBuYW1lLmZpbGVOYW1lO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBiYXNlUmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzLmNhbGwoaG9zdCwgW2ZpbGVOYW1lXSwgLi4ucGFyYW1ldGVycyk7XG5cbiAgICAgICAgaWYgKHJlc3VsdFswXSAmJiBuZ2NjKSB7XG4gICAgICAgICAgbmdjYy5wcm9jZXNzTW9kdWxlKGZpbGVOYW1lLCByZXN1bHRbMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFswXTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgaG9zdC5yZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMgPSBmdW5jdGlvbiAoXG4gICAgICBtb2R1bGVOYW1lczogc3RyaW5nW10gfCB0cy5GaWxlUmVmZXJlbmNlW10sXG4gICAgICBjb250YWluaW5nRmlsZTogc3RyaW5nLFxuICAgICAgcmVkaXJlY3RlZFJlZmVyZW5jZTogdHMuUmVzb2x2ZWRQcm9qZWN0UmVmZXJlbmNlIHwgdW5kZWZpbmVkLFxuICAgICAgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLFxuICAgICkge1xuICAgICAgcmV0dXJuIG1vZHVsZU5hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyA/IG5hbWUgOiBuYW1lLmZpbGVOYW1lO1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0cy5yZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZShcbiAgICAgICAgICBmaWxlTmFtZSxcbiAgICAgICAgICBjb250YWluaW5nRmlsZSxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgcmVkaXJlY3RlZFJlZmVyZW5jZSxcbiAgICAgICAgKS5yZXNvbHZlZFR5cGVSZWZlcmVuY2VEaXJlY3RpdmU7XG5cbiAgICAgICAgaWYgKHJlc3VsdCAmJiBuZ2NjKSB7XG4gICAgICAgICAgbmdjYy5wcm9jZXNzTW9kdWxlKGZpbGVOYW1lLCByZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRIb3N0V2l0aFJlcGxhY2VtZW50cyhcbiAgaG9zdDogdHMuQ29tcGlsZXJIb3N0LFxuICByZXBsYWNlbWVudHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gIG1vZHVsZVJlc29sdXRpb25DYWNoZT86IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZSxcbik6IHZvaWQge1xuICBpZiAoT2JqZWN0LmtleXMocmVwbGFjZW1lbnRzKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkUmVwbGFjZW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHJlcGxhY2VtZW50cykpIHtcbiAgICBub3JtYWxpemVkUmVwbGFjZW1lbnRzW25vcm1hbGl6ZVBhdGgoa2V5KV0gPSBub3JtYWxpemVQYXRoKHZhbHVlKTtcbiAgfVxuXG4gIGNvbnN0IHRyeVJlcGxhY2UgPSAocmVzb2x2ZWRNb2R1bGU6IHRzLlJlc29sdmVkTW9kdWxlIHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgY29uc3QgcmVwbGFjZW1lbnQgPSByZXNvbHZlZE1vZHVsZSAmJiBub3JtYWxpemVkUmVwbGFjZW1lbnRzW3Jlc29sdmVkTW9kdWxlLnJlc29sdmVkRmlsZU5hbWVdO1xuICAgIGlmIChyZXBsYWNlbWVudCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzb2x2ZWRGaWxlTmFtZTogcmVwbGFjZW1lbnQsXG4gICAgICAgIGlzRXh0ZXJuYWxMaWJyYXJ5SW1wb3J0OiAvWy9cXFxcXW5vZGVfbW9kdWxlc1svXFxcXF0vLnRlc3QocmVwbGFjZW1lbnQpLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc29sdmVkTW9kdWxlO1xuICAgIH1cbiAgfTtcblxuICBhdWdtZW50UmVzb2x2ZU1vZHVsZU5hbWVzKGhvc3QsIHRyeVJlcGxhY2UsIG1vZHVsZVJlc29sdXRpb25DYWNoZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50SG9zdFdpdGhTdWJzdGl0dXRpb25zKFxuICBob3N0OiB0cy5Db21waWxlckhvc3QsXG4gIHN1YnN0aXR1dGlvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4pOiB2b2lkIHtcbiAgY29uc3QgcmVnZXhTdWJzdGl0dXRpb25zOiBbUmVnRXhwLCBzdHJpbmddW10gPSBbXTtcbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc3Vic3RpdHV0aW9ucykpIHtcbiAgICByZWdleFN1YnN0aXR1dGlvbnMucHVzaChbbmV3IFJlZ0V4cChgXFxcXGIke2tleX1cXFxcYmAsICdnJyksIHZhbHVlXSk7XG4gIH1cblxuICBpZiAocmVnZXhTdWJzdGl0dXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGJhc2VSZWFkRmlsZSA9IGhvc3QucmVhZEZpbGU7XG4gIGhvc3QucmVhZEZpbGUgPSBmdW5jdGlvbiAoLi4ucGFyYW1ldGVycykge1xuICAgIGxldCBmaWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBiYXNlUmVhZEZpbGUuY2FsbChob3N0LCAuLi5wYXJhbWV0ZXJzKTtcbiAgICBpZiAoZmlsZSkge1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWdleFN1YnN0aXR1dGlvbnMpIHtcbiAgICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZShlbnRyeVswXSwgZW50cnlbMV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaWxlO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEhvc3RXaXRoVmVyc2lvbmluZyhob3N0OiB0cy5Db21waWxlckhvc3QpOiB2b2lkIHtcbiAgY29uc3QgYmFzZUdldFNvdXJjZUZpbGUgPSBob3N0LmdldFNvdXJjZUZpbGU7XG4gIGhvc3QuZ2V0U291cmNlRmlsZSA9IGZ1bmN0aW9uICguLi5wYXJhbWV0ZXJzKSB7XG4gICAgY29uc3QgZmlsZTogKHRzLlNvdXJjZUZpbGUgJiB7IHZlcnNpb24/OiBzdHJpbmcgfSkgfCB1bmRlZmluZWQgPSBiYXNlR2V0U291cmNlRmlsZS5jYWxsKFxuICAgICAgaG9zdCxcbiAgICAgIC4uLnBhcmFtZXRlcnMsXG4gICAgKTtcbiAgICBpZiAoZmlsZSAmJiBmaWxlLnZlcnNpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZmlsZS52ZXJzaW9uID0gY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGZpbGUudGV4dCkuZGlnZXN0KCdoZXgnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRQcm9ncmFtV2l0aFZlcnNpb25pbmcocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IHZvaWQge1xuICBjb25zdCBiYXNlR2V0U291cmNlRmlsZXMgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGVzO1xuICBwcm9ncmFtLmdldFNvdXJjZUZpbGVzID0gZnVuY3Rpb24gKC4uLnBhcmFtZXRlcnMpIHtcbiAgICBjb25zdCBmaWxlczogcmVhZG9ubHkgKHRzLlNvdXJjZUZpbGUgJiB7IHZlcnNpb24/OiBzdHJpbmcgfSlbXSA9IGJhc2VHZXRTb3VyY2VGaWxlcyhcbiAgICAgIC4uLnBhcmFtZXRlcnMsXG4gICAgKTtcblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKGZpbGUudmVyc2lvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZpbGUudmVyc2lvbiA9IGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShmaWxlLnRleHQpLmRpZ2VzdCgnaGV4Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVzO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXVnbWVudEhvc3RXaXRoQ2FjaGluZyhcbiAgaG9zdDogdHMuQ29tcGlsZXJIb3N0LFxuICBjYWNoZTogTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4sXG4pOiB2b2lkIHtcbiAgY29uc3QgYmFzZUdldFNvdXJjZUZpbGUgPSBob3N0LmdldFNvdXJjZUZpbGU7XG4gIGhvc3QuZ2V0U291cmNlRmlsZSA9IGZ1bmN0aW9uIChcbiAgICBmaWxlTmFtZSxcbiAgICBsYW5ndWFnZVZlcnNpb24sXG4gICAgb25FcnJvcixcbiAgICBzaG91bGRDcmVhdGVOZXdTb3VyY2VGaWxlLFxuICAgIC4uLnBhcmFtZXRlcnNcbiAgKSB7XG4gICAgaWYgKCFzaG91bGRDcmVhdGVOZXdTb3VyY2VGaWxlICYmIGNhY2hlLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgIHJldHVybiBjYWNoZS5nZXQoZmlsZU5hbWUpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSBiYXNlR2V0U291cmNlRmlsZS5jYWxsKFxuICAgICAgaG9zdCxcbiAgICAgIGZpbGVOYW1lLFxuICAgICAgbGFuZ3VhZ2VWZXJzaW9uLFxuICAgICAgb25FcnJvcixcbiAgICAgIHRydWUsXG4gICAgICAuLi5wYXJhbWV0ZXJzLFxuICAgICk7XG5cbiAgICBpZiAoZmlsZSkge1xuICAgICAgY2FjaGUuc2V0KGZpbGVOYW1lLCBmaWxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZTtcbiAgfTtcbn1cbiJdfQ==
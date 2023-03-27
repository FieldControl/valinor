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
exports.getNpmPackageJson = exports.fetchPackageManifest = exports.fetchPackageMetadata = void 0;
const lockfile = __importStar(require("@yarnpkg/lockfile"));
const fs_1 = require("fs");
const ini = __importStar(require("ini"));
const os_1 = require("os");
const path = __importStar(require("path"));
let npmrc;
const npmPackageJsonCache = new Map();
function ensureNpmrc(logger, usingYarn, verbose) {
    if (!npmrc) {
        try {
            npmrc = readOptions(logger, false, verbose);
        }
        catch (_a) { }
        if (usingYarn) {
            try {
                npmrc = { ...npmrc, ...readOptions(logger, true, verbose) };
            }
            catch (_b) { }
        }
    }
}
function readOptions(logger, yarn = false, showPotentials = false) {
    var _a;
    const cwd = process.cwd();
    const baseFilename = yarn ? 'yarnrc' : 'npmrc';
    const dotFilename = '.' + baseFilename;
    let globalPrefix;
    if (process.env.PREFIX) {
        globalPrefix = process.env.PREFIX;
    }
    else {
        globalPrefix = path.dirname(process.execPath);
        if (process.platform !== 'win32') {
            globalPrefix = path.dirname(globalPrefix);
        }
    }
    const defaultConfigLocations = [
        (!yarn && process.env.NPM_CONFIG_GLOBALCONFIG) || path.join(globalPrefix, 'etc', baseFilename),
        (!yarn && process.env.NPM_CONFIG_USERCONFIG) || path.join((0, os_1.homedir)(), dotFilename),
    ];
    const projectConfigLocations = [path.join(cwd, dotFilename)];
    if (yarn) {
        const root = path.parse(cwd).root;
        for (let curDir = path.dirname(cwd); curDir && curDir !== root; curDir = path.dirname(curDir)) {
            projectConfigLocations.unshift(path.join(curDir, dotFilename));
        }
    }
    if (showPotentials) {
        logger.info(`Locating potential ${baseFilename} files:`);
    }
    let rcOptions = {};
    for (const location of [...defaultConfigLocations, ...projectConfigLocations]) {
        if ((0, fs_1.existsSync)(location)) {
            if (showPotentials) {
                logger.info(`Trying '${location}'...found.`);
            }
            const data = (0, fs_1.readFileSync)(location, 'utf8');
            // Normalize RC options that are needed by 'npm-registry-fetch'.
            // See: https://github.com/npm/npm-registry-fetch/blob/ebddbe78a5f67118c1f7af2e02c8a22bcaf9e850/index.js#L99-L126
            const rcConfig = yarn ? lockfile.parse(data) : ini.parse(data);
            rcOptions = normalizeOptions(rcConfig, location, rcOptions);
        }
    }
    const envVariablesOptions = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (!value) {
            continue;
        }
        let normalizedName = key.toLowerCase();
        if (normalizedName.startsWith('npm_config_')) {
            normalizedName = normalizedName.substring(11);
        }
        else if (yarn && normalizedName.startsWith('yarn_')) {
            normalizedName = normalizedName.substring(5);
        }
        else {
            continue;
        }
        if (normalizedName === 'registry' &&
            rcOptions['registry'] &&
            value === 'https://registry.yarnpkg.com' &&
            ((_a = process.env['npm_config_user_agent']) === null || _a === void 0 ? void 0 : _a.includes('yarn'))) {
            // When running `ng update` using yarn (`yarn ng update`), yarn will set the `npm_config_registry` env variable to `https://registry.yarnpkg.com`
            // even when an RC file is present with a different repository.
            // This causes the registry specified in the RC to always be overridden with the below logic.
            continue;
        }
        normalizedName = normalizedName.replace(/(?!^)_/g, '-'); // don't replace _ at the start of the key.s
        envVariablesOptions[normalizedName] = value;
    }
    return normalizeOptions(envVariablesOptions, undefined, rcOptions);
}
function normalizeOptions(rawOptions, location = process.cwd(), existingNormalizedOptions = {}) {
    var _a;
    const options = { ...existingNormalizedOptions };
    for (const [key, value] of Object.entries(rawOptions)) {
        let substitutedValue = value;
        // Substitute any environment variable references.
        if (typeof value === 'string') {
            substitutedValue = value.replace(/\$\{([^}]+)\}/, (_, name) => process.env[name] || '');
        }
        switch (key) {
            // Unless auth options are scope with the registry url it appears that npm-registry-fetch ignores them,
            // even though they are documented.
            // https://github.com/npm/npm-registry-fetch/blob/8954f61d8d703e5eb7f3d93c9b40488f8b1b62ac/README.md
            // https://github.com/npm/npm-registry-fetch/blob/8954f61d8d703e5eb7f3d93c9b40488f8b1b62ac/auth.js#L45-L91
            case '_authToken':
            case 'token':
            case 'username':
            case 'password':
            case '_auth':
            case 'auth':
                (_a = options['forceAuth']) !== null && _a !== void 0 ? _a : (options['forceAuth'] = {});
                options['forceAuth'][key] = substitutedValue;
                break;
            case 'noproxy':
            case 'no-proxy':
                options['noProxy'] = substitutedValue;
                break;
            case 'maxsockets':
                options['maxSockets'] = substitutedValue;
                break;
            case 'https-proxy':
            case 'proxy':
                options['proxy'] = substitutedValue;
                break;
            case 'strict-ssl':
                options['strictSSL'] = substitutedValue;
                break;
            case 'local-address':
                options['localAddress'] = substitutedValue;
                break;
            case 'cafile':
                if (typeof substitutedValue === 'string') {
                    const cafile = path.resolve(path.dirname(location), substitutedValue);
                    try {
                        options['ca'] = (0, fs_1.readFileSync)(cafile, 'utf8').replace(/\r?\n/g, '\n');
                    }
                    catch (_b) { }
                }
                break;
            case 'before':
                options['before'] =
                    typeof substitutedValue === 'string' ? new Date(substitutedValue) : substitutedValue;
                break;
            default:
                options[key] = substitutedValue;
                break;
        }
    }
    return options;
}
async function fetchPackageMetadata(name, logger, options) {
    const { usingYarn, verbose, registry } = {
        registry: undefined,
        usingYarn: false,
        verbose: false,
        ...options,
    };
    ensureNpmrc(logger, usingYarn, verbose);
    const { packument } = await Promise.resolve().then(() => __importStar(require('pacote')));
    const response = await packument(name, {
        fullMetadata: true,
        ...npmrc,
        ...(registry ? { registry } : {}),
    });
    // Normalize the response
    const metadata = {
        ...response,
        tags: {},
    };
    if (response['dist-tags']) {
        for (const [tag, version] of Object.entries(response['dist-tags'])) {
            const manifest = metadata.versions[version];
            if (manifest) {
                metadata.tags[tag] = manifest;
            }
            else if (verbose) {
                logger.warn(`Package ${metadata.name} has invalid version metadata for '${tag}'.`);
            }
        }
    }
    return metadata;
}
exports.fetchPackageMetadata = fetchPackageMetadata;
async function fetchPackageManifest(name, logger, options = {}) {
    const { usingYarn = false, verbose = false, registry } = options;
    ensureNpmrc(logger, usingYarn, verbose);
    const { manifest } = await Promise.resolve().then(() => __importStar(require('pacote')));
    const response = await manifest(name, {
        fullMetadata: true,
        ...npmrc,
        ...(registry ? { registry } : {}),
    });
    return response;
}
exports.fetchPackageManifest = fetchPackageManifest;
async function getNpmPackageJson(packageName, logger, options = {}) {
    const cachedResponse = npmPackageJsonCache.get(packageName);
    if (cachedResponse) {
        return cachedResponse;
    }
    const { usingYarn = false, verbose = false, registry } = options;
    ensureNpmrc(logger, usingYarn, verbose);
    const { packument } = await Promise.resolve().then(() => __importStar(require('pacote')));
    const response = packument(packageName, {
        fullMetadata: true,
        ...npmrc,
        ...(registry ? { registry } : {}),
    });
    npmPackageJsonCache.set(packageName, response);
    return response;
}
exports.getNpmPackageJson = getNpmPackageJson;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS1tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXIvY2xpL3NyYy91dGlsaXRpZXMvcGFja2FnZS1tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdILDREQUE4QztBQUM5QywyQkFBOEM7QUFDOUMseUNBQTJCO0FBQzNCLDJCQUE2QjtBQUU3QiwyQ0FBNkI7QUEyQzdCLElBQUksS0FBNEIsQ0FBQztBQUNqQyxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFzRCxDQUFDO0FBRTFGLFNBQVMsV0FBVyxDQUFDLE1BQXlCLEVBQUUsU0FBa0IsRUFBRSxPQUFnQjtJQUNsRixJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsSUFBSTtZQUNGLEtBQUssR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM3QztRQUFDLFdBQU0sR0FBRTtRQUVWLElBQUksU0FBUyxFQUFFO1lBQ2IsSUFBSTtnQkFDRixLQUFLLEdBQUcsRUFBRSxHQUFHLEtBQUssRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUM7YUFDN0Q7WUFBQyxXQUFNLEdBQUU7U0FDWDtLQUNGO0FBQ0gsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUNsQixNQUF5QixFQUN6QixJQUFJLEdBQUcsS0FBSyxFQUNaLGNBQWMsR0FBRyxLQUFLOztJQUV0QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUMvQyxNQUFNLFdBQVcsR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFD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UUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUNsQyxDQUFDLENBQUM7SUFFSCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBcEJELG9EQW9CQztBQUVNLEtBQUssVUFBVSxpQkFBaUIsQ0FDckMsV0FBbUIsRUFDbkIsTUFBeUIsRUFDekIsVUFJSSxFQUFFO0lBRU4sTUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVELElBQUksY0FBYyxFQUFFO1FBQ2xCLE9BQU8sY0FBYyxDQUFDO0tBQ3ZCO0lBRUQsTUFBTSxFQUFFLFNBQVMsR0FBRyxLQUFLLEVBQUUsT0FBTyxHQUFHLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFDakUsV0FBVyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEMsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLHdEQUFhLFFBQVEsR0FBQyxDQUFDO0lBQzdDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUU7UUFDdEMsWUFBWSxFQUFFLElBQUk7UUFDbEIsR0FBRyxLQUFLO1FBQ1IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0tBQ2xDLENBQUMsQ0FBQztJQUVILG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFL0MsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQTFCRCw4Q0EwQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgbG9nZ2luZyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCAqIGFzIGxvY2tmaWxlIGZyb20gJ0B5YXJucGtnL2xvY2tmaWxlJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIGluaSBmcm9tICdpbmknO1xuaW1wb3J0IHsgaG9tZWRpciB9IGZyb20gJ29zJztcbmltcG9ydCB0eXBlIHsgTWFuaWZlc3QsIFBhY2t1bWVudCB9IGZyb20gJ3BhY290ZSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBhY2thZ2VNZXRhZGF0YSBleHRlbmRzIFBhY2t1bWVudCwgTmdQYWNrYWdlTWFuaWZlc3RQcm9wZXJ0aWVzIHtcbiAgdGFnczogUmVjb3JkPHN0cmluZywgUGFja2FnZU1hbmlmZXN0PjtcbiAgdmVyc2lvbnM6IFJlY29yZDxzdHJpbmcsIFBhY2thZ2VNYW5pZmVzdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uIGV4dGVuZHMgUGFja2FnZU1ldGFkYXRhIHtcbiAgcmVxdWVzdGVkTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgTmdBZGRTYXZlRGVwZW5kZW5jeSA9ICdkZXBlbmRlbmNpZXMnIHwgJ2RldkRlcGVuZGVuY2llcycgfCBib29sZWFuO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBhY2thZ2VJZGVudGlmaWVyIHtcbiAgdHlwZTogJ2dpdCcgfCAndGFnJyB8ICd2ZXJzaW9uJyB8ICdyYW5nZScgfCAnZmlsZScgfCAnZGlyZWN0b3J5JyB8ICdyZW1vdGUnO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNjb3BlOiBzdHJpbmcgfCBudWxsO1xuICByZWdpc3RyeTogYm9vbGVhbjtcbiAgcmF3OiBzdHJpbmc7XG4gIGZldGNoU3BlYzogc3RyaW5nO1xuICByYXdTcGVjOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmdQYWNrYWdlTWFuaWZlc3RQcm9wZXJ0aWVzIHtcbiAgJ25nLWFkZCc/OiB7XG4gICAgc2F2ZT86IE5nQWRkU2F2ZURlcGVuZGVuY3k7XG4gIH07XG4gICduZy11cGRhdGUnPzoge1xuICAgIG1pZ3JhdGlvbnM/OiBzdHJpbmc7XG4gICAgcGFja2FnZUdyb3VwPzogc3RyaW5nW10gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIHBhY2thZ2VHcm91cE5hbWU/OiBzdHJpbmc7XG4gICAgcmVxdWlyZW1lbnRzPzogc3RyaW5nW10gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhY2thZ2VNYW5pZmVzdCBleHRlbmRzIE1hbmlmZXN0LCBOZ1BhY2thZ2VNYW5pZmVzdFByb3BlcnRpZXMge1xuICBkZXByZWNhdGVkPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIFBhY2thZ2VNYW5hZ2VyT3B0aW9ucyBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgZm9yY2VBdXRoPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmxldCBucG1yYzogUGFja2FnZU1hbmFnZXJPcHRpb25zO1xuY29uc3QgbnBtUGFja2FnZUpzb25DYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBQcm9taXNlPFBhcnRpYWw8TnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uPj4+KCk7XG5cbmZ1bmN0aW9uIGVuc3VyZU5wbXJjKGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksIHVzaW5nWWFybjogYm9vbGVhbiwgdmVyYm9zZTogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoIW5wbXJjKSB7XG4gICAgdHJ5IHtcbiAgICAgIG5wbXJjID0gcmVhZE9wdGlvbnMobG9nZ2VyLCBmYWxzZSwgdmVyYm9zZSk7XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgaWYgKHVzaW5nWWFybikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbnBtcmMgPSB7IC4uLm5wbXJjLCAuLi5yZWFkT3B0aW9ucyhsb2dnZXIsIHRydWUsIHZlcmJvc2UpIH07XG4gICAgICB9IGNhdGNoIHt9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRPcHRpb25zKFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuICB5YXJuID0gZmFsc2UsXG4gIHNob3dQb3RlbnRpYWxzID0gZmFsc2UsXG4pOiBQYWNrYWdlTWFuYWdlck9wdGlvbnMge1xuICBjb25zdCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICBjb25zdCBiYXNlRmlsZW5hbWUgPSB5YXJuID8gJ3lhcm5yYycgOiAnbnBtcmMnO1xuICBjb25zdCBkb3RGaWxlbmFtZSA9ICcuJyArIGJhc2VGaWxlbmFtZTtcblxuICBsZXQgZ2xvYmFsUHJlZml4OiBzdHJpbmc7XG4gIGlmIChwcm9jZXNzLmVudi5QUkVGSVgpIHtcbiAgICBnbG9iYWxQcmVmaXggPSBwcm9jZXNzLmVudi5QUkVGSVg7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsUHJlZml4ID0gcGF0aC5kaXJuYW1lKHByb2Nlc3MuZXhlY1BhdGgpO1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gICAgICBnbG9iYWxQcmVmaXggPSBwYXRoLmRpcm5hbWUoZ2xvYmFsUHJlZml4KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkZWZhdWx0Q29uZmlnTG9jYXRpb25zID0gW1xuICAgICgheWFybiAmJiBwcm9jZXNzLmVudi5OUE1fQ09ORklHX0dMT0JBTENPTkZJRykgfHwgcGF0aC5qb2luKGdsb2JhbFByZWZpeCwgJ2V0YycsIGJhc2VGaWxlbmFtZSksXG4gICAgKCF5YXJuICYmIHByb2Nlc3MuZW52Lk5QTV9DT05GSUdfVVNFUkNPTkZJRykgfHwgcGF0aC5qb2luKGhvbWVkaXIoKSwgZG90RmlsZW5hbWUpLFxuICBdO1xuXG4gIGNvbnN0IHByb2plY3RDb25maWdMb2NhdGlvbnM6IHN0cmluZ1tdID0gW3BhdGguam9pbihjd2QsIGRvdEZpbGVuYW1lKV07XG4gIGlmICh5YXJuKSB7XG4gICAgY29uc3Qgcm9vdCA9IHBhdGgucGFyc2UoY3dkKS5yb290O1xuICAgIGZvciAobGV0IGN1ckRpciA9IHBhdGguZGlybmFtZShjd2QpOyBjdXJEaXIgJiYgY3VyRGlyICE9PSByb290OyBjdXJEaXIgPSBwYXRoLmRpcm5hbWUoY3VyRGlyKSkge1xuICAgICAgcHJvamVjdENvbmZpZ0xvY2F0aW9ucy51bnNoaWZ0KHBhdGguam9pbihjdXJEaXIsIGRvdEZpbGVuYW1lKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHNob3dQb3RlbnRpYWxzKSB7XG4gICAgbG9nZ2VyLmluZm8oYExvY2F0aW5nIHBvdGVudGlhbCAke2Jhc2VGaWxlbmFtZX0gZmlsZXM6YCk7XG4gIH1cblxuICBsZXQgcmNPcHRpb25zOiBQYWNrYWdlTWFuYWdlck9wdGlvbnMgPSB7fTtcbiAgZm9yIChjb25zdCBsb2NhdGlvbiBvZiBbLi4uZGVmYXVsdENvbmZpZ0xvY2F0aW9ucywgLi4ucHJvamVjdENvbmZpZ0xvY2F0aW9uc10pIHtcbiAgICBpZiAoZXhpc3RzU3luYyhsb2NhdGlvbikpIHtcbiAgICAgIGlmIChzaG93UG90ZW50aWFscykge1xuICAgICAgICBsb2dnZXIuaW5mbyhgVHJ5aW5nICcke2xvY2F0aW9ufScuLi5mb3VuZC5gKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IHJlYWRGaWxlU3luYyhsb2NhdGlvbiwgJ3V0ZjgnKTtcbiAgICAgIC8vIE5vcm1hbGl6ZSBSQyBvcHRpb25zIHRoYXQgYXJlIG5lZWRlZCBieSAnbnBtLXJlZ2lzdHJ5LWZldGNoJy5cbiAgICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL25wbS9ucG0tcmVnaXN0cnktZmV0Y2gvYmxvYi9lYmRkYmU3OGE1ZjY3MTE4YzFmN2FmMmUwMmM4YTIyYmNhZjllODUwL2luZGV4LmpzI0w5OS1MMTI2XG4gICAgICBjb25zdCByY0NvbmZpZzogUGFja2FnZU1hbmFnZXJPcHRpb25zID0geWFybiA/IGxvY2tmaWxlLnBhcnNlKGRhdGEpIDogaW5pLnBhcnNlKGRhdGEpO1xuXG4gICAgICByY09wdGlvbnMgPSBub3JtYWxpemVPcHRpb25zKHJjQ29uZmlnLCBsb2NhdGlvbiwgcmNPcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBlbnZWYXJpYWJsZXNPcHRpb25zOiBQYWNrYWdlTWFuYWdlck9wdGlvbnMgPSB7fTtcbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocHJvY2Vzcy5lbnYpKSB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbGV0IG5vcm1hbGl6ZWROYW1lID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgoJ25wbV9jb25maWdfJykpIHtcbiAgICAgIG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplZE5hbWUuc3Vic3RyaW5nKDExKTtcbiAgICB9IGVsc2UgaWYgKHlhcm4gJiYgbm9ybWFsaXplZE5hbWUuc3RhcnRzV2l0aCgneWFybl8nKSkge1xuICAgICAgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVkTmFtZS5zdWJzdHJpbmcoNSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIG5vcm1hbGl6ZWROYW1lID09PSAncmVnaXN0cnknICYmXG4gICAgICByY09wdGlvbnNbJ3JlZ2lzdHJ5J10gJiZcbiAgICAgIHZhbHVlID09PSAnaHR0cHM6Ly9yZWdpc3RyeS55YXJucGtnLmNvbScgJiZcbiAgICAgIHByb2Nlc3MuZW52WyducG1fY29uZmlnX3VzZXJfYWdlbnQnXT8uaW5jbHVkZXMoJ3lhcm4nKVxuICAgICkge1xuICAgICAgLy8gV2hlbiBydW5uaW5nIGBuZyB1cGRhdGVgIHVzaW5nIHlhcm4gKGB5YXJuIG5nIHVwZGF0ZWApLCB5YXJuIHdpbGwgc2V0IHRoZSBgbnBtX2NvbmZpZ19yZWdpc3RyeWAgZW52IHZhcmlhYmxlIHRvIGBodHRwczovL3JlZ2lzdHJ5Lnlhcm5wa2cuY29tYFxuICAgICAgLy8gZXZlbiB3aGVuIGFuIFJDIGZpbGUgaXMgcHJlc2VudCB3aXRoIGEgZGlmZmVyZW50IHJlcG9zaXRvcnkuXG4gICAgICAvLyBUaGlzIGNhdXNlcyB0aGUgcmVnaXN0cnkgc3BlY2lmaWVkIGluIHRoZSBSQyB0byBhbHdheXMgYmUgb3ZlcnJpZGRlbiB3aXRoIHRoZSBiZWxvdyBsb2dpYy5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplZE5hbWUucmVwbGFjZSgvKD8hXilfL2csICctJyk7IC8vIGRvbid0IHJlcGxhY2UgXyBhdCB0aGUgc3RhcnQgb2YgdGhlIGtleS5zXG4gICAgZW52VmFyaWFibGVzT3B0aW9uc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBub3JtYWxpemVPcHRpb25zKGVudlZhcmlhYmxlc09wdGlvbnMsIHVuZGVmaW5lZCwgcmNPcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplT3B0aW9ucyhcbiAgcmF3T3B0aW9uczogUGFja2FnZU1hbmFnZXJPcHRpb25zLFxuICBsb2NhdGlvbiA9IHByb2Nlc3MuY3dkKCksXG4gIGV4aXN0aW5nTm9ybWFsaXplZE9wdGlvbnM6IFBhY2thZ2VNYW5hZ2VyT3B0aW9ucyA9IHt9LFxuKTogUGFja2FnZU1hbmFnZXJPcHRpb25zIHtcbiAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZXhpc3RpbmdOb3JtYWxpemVkT3B0aW9ucyB9O1xuXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHJhd09wdGlvbnMpKSB7XG4gICAgbGV0IHN1YnN0aXR1dGVkVmFsdWUgPSB2YWx1ZTtcblxuICAgIC8vIFN1YnN0aXR1dGUgYW55IGVudmlyb25tZW50IHZhcmlhYmxlIHJlZmVyZW5jZXMuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHN1YnN0aXR1dGVkVmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXCRcXHsoW159XSspXFx9LywgKF8sIG5hbWUpID0+IHByb2Nlc3MuZW52W25hbWVdIHx8ICcnKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgLy8gVW5sZXNzIGF1dGggb3B0aW9ucyBhcmUgc2NvcGUgd2l0aCB0aGUgcmVnaXN0cnkgdXJsIGl0IGFwcGVhcnMgdGhhdCBucG0tcmVnaXN0cnktZmV0Y2ggaWdub3JlcyB0aGVtLFxuICAgICAgLy8gZXZlbiB0aG91Z2ggdGhleSBhcmUgZG9jdW1lbnRlZC5cbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucG0vbnBtLXJlZ2lzdHJ5LWZldGNoL2Jsb2IvODk1NGY2MWQ4ZDcwM2U1ZWI3ZjNkOTNjOWI0MDQ4OGY4YjFiNjJhYy9SRUFETUUubWRcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucG0vbnBtLXJlZ2lzdHJ5LWZldGNoL2Jsb2IvODk1NGY2MWQ4ZDcwM2U1ZWI3ZjNkOTNjOWI0MDQ4OGY4YjFiNjJhYy9hdXRoLmpzI0w0NS1MOTFcbiAgICAgIGNhc2UgJ19hdXRoVG9rZW4nOlxuICAgICAgY2FzZSAndG9rZW4nOlxuICAgICAgY2FzZSAndXNlcm5hbWUnOlxuICAgICAgY2FzZSAncGFzc3dvcmQnOlxuICAgICAgY2FzZSAnX2F1dGgnOlxuICAgICAgY2FzZSAnYXV0aCc6XG4gICAgICAgIG9wdGlvbnNbJ2ZvcmNlQXV0aCddID8/PSB7fTtcbiAgICAgICAgb3B0aW9uc1snZm9yY2VBdXRoJ11ba2V5XSA9IHN1YnN0aXR1dGVkVmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbm9wcm94eSc6XG4gICAgICBjYXNlICduby1wcm94eSc6XG4gICAgICAgIG9wdGlvbnNbJ25vUHJveHknXSA9IHN1YnN0aXR1dGVkVmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWF4c29ja2V0cyc6XG4gICAgICAgIG9wdGlvbnNbJ21heFNvY2tldHMnXSA9IHN1YnN0aXR1dGVkVmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaHR0cHMtcHJveHknOlxuICAgICAgY2FzZSAncHJveHknOlxuICAgICAgICBvcHRpb25zWydwcm94eSddID0gc3Vic3RpdHV0ZWRWYWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdHJpY3Qtc3NsJzpcbiAgICAgICAgb3B0aW9uc1snc3RyaWN0U1NMJ10gPSBzdWJzdGl0dXRlZFZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xvY2FsLWFkZHJlc3MnOlxuICAgICAgICBvcHRpb25zWydsb2NhbEFkZHJlc3MnXSA9IHN1YnN0aXR1dGVkVmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2FmaWxlJzpcbiAgICAgICAgaWYgKHR5cGVvZiBzdWJzdGl0dXRlZFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGNhZmlsZSA9IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUobG9jYXRpb24pLCBzdWJzdGl0dXRlZFZhbHVlKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgb3B0aW9uc1snY2EnXSA9IHJlYWRGaWxlU3luYyhjYWZpbGUsICd1dGY4JykucmVwbGFjZSgvXFxyP1xcbi9nLCAnXFxuJyk7XG4gICAgICAgICAgfSBjYXRjaCB7fVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYmVmb3JlJzpcbiAgICAgICAgb3B0aW9uc1snYmVmb3JlJ10gPVxuICAgICAgICAgIHR5cGVvZiBzdWJzdGl0dXRlZFZhbHVlID09PSAnc3RyaW5nJyA/IG5ldyBEYXRlKHN1YnN0aXR1dGVkVmFsdWUpIDogc3Vic3RpdHV0ZWRWYWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvcHRpb25zW2tleV0gPSBzdWJzdGl0dXRlZFZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3B0aW9ucztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoUGFja2FnZU1ldGFkYXRhKFxuICBuYW1lOiBzdHJpbmcsXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4gIG9wdGlvbnM/OiB7XG4gICAgcmVnaXN0cnk/OiBzdHJpbmc7XG4gICAgdXNpbmdZYXJuPzogYm9vbGVhbjtcbiAgICB2ZXJib3NlPzogYm9vbGVhbjtcbiAgfSxcbik6IFByb21pc2U8UGFja2FnZU1ldGFkYXRhPiB7XG4gIGNvbnN0IHsgdXNpbmdZYXJuLCB2ZXJib3NlLCByZWdpc3RyeSB9ID0ge1xuICAgIHJlZ2lzdHJ5OiB1bmRlZmluZWQsXG4gICAgdXNpbmdZYXJuOiBmYWxzZSxcbiAgICB2ZXJib3NlOiBmYWxzZSxcbiAgICAuLi5vcHRpb25zLFxuICB9O1xuXG4gIGVuc3VyZU5wbXJjKGxvZ2dlciwgdXNpbmdZYXJuLCB2ZXJib3NlKTtcbiAgY29uc3QgeyBwYWNrdW1lbnQgfSA9IGF3YWl0IGltcG9ydCgncGFjb3RlJyk7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcGFja3VtZW50KG5hbWUsIHtcbiAgICBmdWxsTWV0YWRhdGE6IHRydWUsXG4gICAgLi4ubnBtcmMsXG4gICAgLi4uKHJlZ2lzdHJ5ID8geyByZWdpc3RyeSB9IDoge30pLFxuICB9KTtcblxuICAvLyBOb3JtYWxpemUgdGhlIHJlc3BvbnNlXG4gIGNvbnN0IG1ldGFkYXRhOiBQYWNrYWdlTWV0YWRhdGEgPSB7XG4gICAgLi4ucmVzcG9uc2UsXG4gICAgdGFnczoge30sXG4gIH07XG5cbiAgaWYgKHJlc3BvbnNlWydkaXN0LXRhZ3MnXSkge1xuICAgIGZvciAoY29uc3QgW3RhZywgdmVyc2lvbl0gb2YgT2JqZWN0LmVudHJpZXMocmVzcG9uc2VbJ2Rpc3QtdGFncyddKSkge1xuICAgICAgY29uc3QgbWFuaWZlc3QgPSBtZXRhZGF0YS52ZXJzaW9uc1t2ZXJzaW9uXTtcbiAgICAgIGlmIChtYW5pZmVzdCkge1xuICAgICAgICBtZXRhZGF0YS50YWdzW3RhZ10gPSBtYW5pZmVzdDtcbiAgICAgIH0gZWxzZSBpZiAodmVyYm9zZSkge1xuICAgICAgICBsb2dnZXIud2FybihgUGFja2FnZSAke21ldGFkYXRhLm5hbWV9IGhhcyBpbnZhbGlkIHZlcnNpb24gbWV0YWRhdGEgZm9yICcke3RhZ30nLmApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZXRhZGF0YTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoUGFja2FnZU1hbmlmZXN0KFxuICBuYW1lOiBzdHJpbmcsXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4gIG9wdGlvbnM6IHtcbiAgICByZWdpc3RyeT86IHN0cmluZztcbiAgICB1c2luZ1lhcm4/OiBib29sZWFuO1xuICAgIHZlcmJvc2U/OiBib29sZWFuO1xuICB9ID0ge30sXG4pOiBQcm9taXNlPFBhY2thZ2VNYW5pZmVzdD4ge1xuICBjb25zdCB7IHVzaW5nWWFybiA9IGZhbHNlLCB2ZXJib3NlID0gZmFsc2UsIHJlZ2lzdHJ5IH0gPSBvcHRpb25zO1xuICBlbnN1cmVOcG1yYyhsb2dnZXIsIHVzaW5nWWFybiwgdmVyYm9zZSk7XG4gIGNvbnN0IHsgbWFuaWZlc3QgfSA9IGF3YWl0IGltcG9ydCgncGFjb3RlJyk7XG5cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBtYW5pZmVzdChuYW1lLCB7XG4gICAgZnVsbE1ldGFkYXRhOiB0cnVlLFxuICAgIC4uLm5wbXJjLFxuICAgIC4uLihyZWdpc3RyeSA/IHsgcmVnaXN0cnkgfSA6IHt9KSxcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TnBtUGFja2FnZUpzb24oXG4gIHBhY2thZ2VOYW1lOiBzdHJpbmcsXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4gIG9wdGlvbnM6IHtcbiAgICByZWdpc3RyeT86IHN0cmluZztcbiAgICB1c2luZ1lhcm4/OiBib29sZWFuO1xuICAgIHZlcmJvc2U/OiBib29sZWFuO1xuICB9ID0ge30sXG4pOiBQcm9taXNlPFBhcnRpYWw8TnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uPj4ge1xuICBjb25zdCBjYWNoZWRSZXNwb25zZSA9IG5wbVBhY2thZ2VKc29uQ2FjaGUuZ2V0KHBhY2thZ2VOYW1lKTtcbiAgaWYgKGNhY2hlZFJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIGNhY2hlZFJlc3BvbnNlO1xuICB9XG5cbiAgY29uc3QgeyB1c2luZ1lhcm4gPSBmYWxzZSwgdmVyYm9zZSA9IGZhbHNlLCByZWdpc3RyeSB9ID0gb3B0aW9ucztcbiAgZW5zdXJlTnBtcmMobG9nZ2VyLCB1c2luZ1lhcm4sIHZlcmJvc2UpO1xuICBjb25zdCB7IHBhY2t1bWVudCB9ID0gYXdhaXQgaW1wb3J0KCdwYWNvdGUnKTtcbiAgY29uc3QgcmVzcG9uc2UgPSBwYWNrdW1lbnQocGFja2FnZU5hbWUsIHtcbiAgICBmdWxsTWV0YWRhdGE6IHRydWUsXG4gICAgLi4ubnBtcmMsXG4gICAgLi4uKHJlZ2lzdHJ5ID8geyByZWdpc3RyeSB9IDoge30pLFxuICB9KTtcblxuICBucG1QYWNrYWdlSnNvbkNhY2hlLnNldChwYWNrYWdlTmFtZSwgcmVzcG9uc2UpO1xuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiJdfQ==
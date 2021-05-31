"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackageManifest = exports.fetchPackageMetadata = void 0;
const fs_1 = require("fs");
const os_1 = require("os");
const path = require("path");
const lockfile = require('@yarnpkg/lockfile');
const ini = require('ini');
const pacote = require('pacote');
let npmrc;
function ensureNpmrc(logger, usingYarn, verbose) {
    if (!npmrc) {
        try {
            npmrc = readOptions(logger, false, verbose);
        }
        catch { }
        if (usingYarn) {
            try {
                npmrc = { ...npmrc, ...readOptions(logger, true, verbose) };
            }
            catch { }
        }
    }
}
function readOptions(logger, yarn = false, showPotentials = false) {
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
        (!yarn && process.env.NPM_CONFIG_USERCONFIG) || path.join(os_1.homedir(), dotFilename),
    ];
    const projectConfigLocations = [path.join(cwd, dotFilename)];
    const root = path.parse(cwd).root;
    for (let curDir = path.dirname(cwd); curDir && curDir !== root; curDir = path.dirname(curDir)) {
        projectConfigLocations.unshift(path.join(curDir, dotFilename));
    }
    if (showPotentials) {
        logger.info(`Locating potential ${baseFilename} files:`);
    }
    const options = {};
    for (const location of [...defaultConfigLocations, ...projectConfigLocations]) {
        if (fs_1.existsSync(location)) {
            if (showPotentials) {
                logger.info(`Trying '${location}'...found.`);
            }
            const data = fs_1.readFileSync(location, 'utf8');
            // Normalize RC options that are needed by 'npm-registry-fetch'.
            // See: https://github.com/npm/npm-registry-fetch/blob/ebddbe78a5f67118c1f7af2e02c8a22bcaf9e850/index.js#L99-L126
            const rcConfig = yarn ? lockfile.parse(data) : ini.parse(data);
            for (const [key, value] of Object.entries(rcConfig)) {
                switch (key) {
                    case 'noproxy':
                    case 'no-proxy':
                        options['noProxy'] = value;
                        break;
                    case 'maxsockets':
                        options['maxSockets'] = value;
                        break;
                    case 'https-proxy':
                    case 'proxy':
                        options['proxy'] = value;
                        break;
                    case 'strict-ssl':
                        options['strictSSL'] = value;
                        break;
                    case 'local-address':
                        options['localAddress'] = value;
                        break;
                    case 'cafile':
                        if (typeof value === 'string') {
                            const cafile = path.resolve(path.dirname(location), value);
                            try {
                                options['ca'] = fs_1.readFileSync(cafile, 'utf8').replace(/\r?\n/g, '\n');
                            }
                            catch { }
                        }
                        break;
                    default:
                        options[key] = value;
                        break;
                }
            }
        }
        else if (showPotentials) {
            logger.info(`Trying '${location}'...not found.`);
        }
    }
    // Substitute any environment variable references
    for (const key in options) {
        const value = options[key];
        if (typeof value === 'string') {
            options[key] = value.replace(/\$\{([^\}]+)\}/, (_, name) => process.env[name] || '');
        }
    }
    return options;
}
function normalizeManifest(rawManifest) {
    // TODO: Fully normalize and sanitize
    return {
        dependencies: {},
        devDependencies: {},
        peerDependencies: {},
        optionalDependencies: {},
        ...rawManifest,
    };
}
async function fetchPackageMetadata(name, logger, options) {
    const { usingYarn, verbose, registry } = {
        registry: undefined,
        usingYarn: false,
        verbose: false,
        ...options,
    };
    ensureNpmrc(logger, usingYarn, verbose);
    const response = await pacote.packument(name, {
        fullMetadata: true,
        ...npmrc,
        ...(registry ? { registry } : {}),
    });
    // Normalize the response
    const metadata = {
        name: response.name,
        tags: {},
        versions: {},
    };
    if (response.versions) {
        for (const [version, manifest] of Object.entries(response.versions)) {
            metadata.versions[version] = normalizeManifest(manifest);
        }
    }
    if (response['dist-tags']) {
        // Store this for use with other npm utility packages
        metadata['dist-tags'] = response['dist-tags'];
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
async function fetchPackageManifest(name, logger, options) {
    const { usingYarn, verbose, registry } = {
        registry: undefined,
        usingYarn: false,
        verbose: false,
        ...options,
    };
    ensureNpmrc(logger, usingYarn, verbose);
    const response = await pacote.manifest(name, {
        fullMetadata: true,
        ...npmrc,
        ...(registry ? { registry } : {}),
    });
    return normalizeManifest(response);
}
exports.fetchPackageManifest = fetchPackageManifest;

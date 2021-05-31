"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const extraction_1 = require("@angular/localize/src/tools/src/extract/extraction");
const loader_utils_1 = require("loader-utils");
const nodePath = require("path");
function localizeExtractLoader(content, 
// Source map types are broken in the webpack type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
map) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const loaderContext = this;
    // Casts are needed to workaround the loader-utils typings limited support for option values
    const options = loader_utils_1.getOptions(this);
    // Setup a Webpack-based logger instance
    const logger = {
        // level 2 is warnings
        level: 2,
        debug(...args) {
            // eslint-disable-next-line no-console
            console.debug(...args);
        },
        info(...args) {
            loaderContext.emitWarning(args.join(''));
        },
        warn(...args) {
            loaderContext.emitWarning(args.join(''));
        },
        error(...args) {
            loaderContext.emitError(args.join(''));
        },
    };
    let filename = loaderContext.resourcePath;
    if (map === null || map === void 0 ? void 0 : map.file) {
        // The extractor's internal sourcemap handling expects the filenames to match
        filename = nodePath.join(loaderContext.context, map.file);
    }
    // Setup a virtual file system instance for the extractor
    // * MessageExtractor itself uses readFile, relative and resolve
    // * Internal SourceFileLoader (sourcemap support) uses dirname, exists, readFile, and resolve
    const filesystem = {
        readFile(path) {
            if (path === filename) {
                return content;
            }
            else if (path === filename + '.map') {
                return typeof map === 'string' ? map : JSON.stringify(map);
            }
            else {
                throw new Error('Unknown file requested: ' + path);
            }
        },
        relative(from, to) {
            return nodePath.relative(from, to);
        },
        resolve(...paths) {
            return nodePath.resolve(...paths);
        },
        exists(path) {
            return path === filename || path === filename + '.map';
        },
        dirname(path) {
            return nodePath.dirname(path);
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractor = new extraction_1.MessageExtractor(filesystem, logger, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        basePath: this.rootContext,
        useSourceMaps: !!map,
    });
    const messages = extractor.extractMessages(filename);
    if (messages.length > 0) {
        options === null || options === void 0 ? void 0 : options.messageHandler(messages);
    }
    // Pass through the original content now that messages have been extracted
    this.callback(undefined, content, map);
}
exports.default = localizeExtractLoader;

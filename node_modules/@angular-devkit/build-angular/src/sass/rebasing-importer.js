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
exports.sassBindWorkaround = exports.LoadPathsUrlRebasingImporter = exports.ModuleUrlRebasingImporter = exports.RelativeUrlRebasingImporter = void 0;
const magic_string_1 = __importDefault(require("magic-string"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
/**
 * A Sass Importer base class that provides the load logic to rebase all `url()` functions
 * within a stylesheet. The rebasing will ensure that the URLs in the output of the Sass compiler
 * reflect the final filesystem location of the output CSS file.
 *
 * This class provides the core of the rebasing functionality. To ensure that each file is processed
 * by this importer's load implementation, the Sass compiler requires the importer's canonicalize
 * function to return a non-null value with the resolved location of the requested stylesheet.
 * Concrete implementations of this class must provide this canonicalize functionality for rebasing
 * to be effective.
 */
class UrlRebasingImporter {
    /**
     * @param entryDirectory The directory of the entry stylesheet that was passed to the Sass compiler.
     * @param rebaseSourceMaps When provided, rebased files will have an intermediate sourcemap added to the Map
     * which can be used to generate a final sourcemap that contains original sources.
     */
    constructor(entryDirectory, rebaseSourceMaps) {
        this.entryDirectory = entryDirectory;
        this.rebaseSourceMaps = rebaseSourceMaps;
    }
    load(canonicalUrl) {
        const stylesheetPath = (0, node_url_1.fileURLToPath)(canonicalUrl);
        const stylesheetDirectory = (0, node_path_1.dirname)(stylesheetPath);
        let contents = (0, node_fs_1.readFileSync)(stylesheetPath, 'utf-8');
        // Rebase any URLs that are found
        let updatedContents;
        for (const { start, end, value } of findUrls(contents)) {
            // Skip if value is empty or a Sass variable
            if (value.length === 0 || value.startsWith('$')) {
                continue;
            }
            // Skip if root-relative, absolute or protocol relative url
            if (/^((?:\w+:)?\/\/|data:|chrome:|#|\/)/.test(value)) {
                continue;
            }
            const rebasedPath = (0, node_path_1.relative)(this.entryDirectory, (0, node_path_1.join)(stylesheetDirectory, value));
            // Normalize path separators and escape characters
            // https://developer.mozilla.org/en-US/docs/Web/CSS/url#syntax
            const rebasedUrl = './' + rebasedPath.replace(/\\/g, '/').replace(/[()\s'"]/g, '\\$&');
            updatedContents !== null && updatedContents !== void 0 ? updatedContents : (updatedContents = new magic_string_1.default(contents));
            updatedContents.update(start, end, rebasedUrl);
        }
        if (updatedContents) {
            contents = updatedContents.toString();
            if (this.rebaseSourceMaps) {
                // Generate an intermediate source map for the rebasing changes
                const map = updatedContents.generateMap({
                    hires: true,
                    includeContent: true,
                    source: canonicalUrl.href,
                });
                this.rebaseSourceMaps.set(canonicalUrl.href, map);
            }
        }
        let syntax;
        switch ((0, node_path_1.extname)(stylesheetPath).toLowerCase()) {
            case 'css':
                syntax = 'css';
                break;
            case 'sass':
                syntax = 'indented';
                break;
            default:
                syntax = 'scss';
                break;
        }
        return {
            contents,
            syntax,
            sourceMapUrl: canonicalUrl,
        };
    }
}
/**
 * Determines if a unicode code point is a CSS whitespace character.
 * @param code The unicode code point to test.
 * @returns true, if the code point is CSS whitespace; false, otherwise.
 */
function isWhitespace(code) {
    // Based on https://www.w3.org/TR/css-syntax-3/#whitespace
    switch (code) {
        case 0x0009: // tab
        case 0x0020: // space
        case 0x000a: // line feed
        case 0x000c: // form feed
        case 0x000d: // carriage return
            return true;
        default:
            return false;
    }
}
/**
 * Scans a CSS or Sass file and locates all valid url function values as defined by the CSS
 * syntax specification.
 * @param contents A string containing a CSS or Sass file to scan.
 * @returns An iterable that yields each CSS url function value found.
 */
function* findUrls(contents) {
    let pos = 0;
    let width = 1;
    let current = -1;
    const next = () => {
        var _a;
        pos += width;
        current = (_a = contents.codePointAt(pos)) !== null && _a !== void 0 ? _a : -1;
        width = current > 0xffff ? 2 : 1;
        return current;
    };
    // Based on https://www.w3.org/TR/css-syntax-3/#consume-ident-like-token
    while ((pos = contents.indexOf('url(', pos)) !== -1) {
        // Set to position of the (
        pos += 3;
        width = 1;
        // Consume all leading whitespace
        while (isWhitespace(next())) {
            /* empty */
        }
        // Initialize URL state
        const url = { start: pos, end: -1, value: '' };
        let complete = false;
        // If " or ', then consume the value as a string
        if (current === 0x0022 || current === 0x0027) {
            const ending = current;
            // Based on https://www.w3.org/TR/css-syntax-3/#consume-string-token
            while (!complete) {
                switch (next()) {
                    case -1: // EOF
                        return;
                    case 0x000a: // line feed
                    case 0x000c: // form feed
                    case 0x000d: // carriage return
                        // Invalid
                        complete = true;
                        break;
                    case 0x005c: // \ -- character escape
                        // If not EOF or newline, add the character after the escape
                        switch (next()) {
                            case -1:
                                return;
                            case 0x000a: // line feed
                            case 0x000c: // form feed
                            case 0x000d: // carriage return
                                // Skip when inside a string
                                break;
                            default:
                                // TODO: Handle hex escape codes
                                url.value += String.fromCodePoint(current);
                                break;
                        }
                        break;
                    case ending:
                        // Full string position should include the quotes for replacement
                        url.end = pos + 1;
                        complete = true;
                        yield url;
                        break;
                    default:
                        url.value += String.fromCodePoint(current);
                        break;
                }
            }
            next();
            continue;
        }
        // Based on https://www.w3.org/TR/css-syntax-3/#consume-url-token
        while (!complete) {
            switch (current) {
                case -1: // EOF
                    return;
                case 0x0022: // "
                case 0x0027: // '
                case 0x0028: // (
                    // Invalid
                    complete = true;
                    break;
                case 0x0029: // )
                    // URL is valid and complete
                    url.end = pos;
                    complete = true;
                    break;
                case 0x005c: // \ -- character escape
                    // If not EOF or newline, add the character after the escape
                    switch (next()) {
                        case -1: // EOF
                            return;
                        case 0x000a: // line feed
                        case 0x000c: // form feed
                        case 0x000d: // carriage return
                            // Invalid
                            complete = true;
                            break;
                        default:
                            // TODO: Handle hex escape codes
                            url.value += String.fromCodePoint(current);
                            break;
                    }
                    break;
                default:
                    if (isWhitespace(current)) {
                        while (isWhitespace(next())) {
                            /* empty */
                        }
                        // Unescaped whitespace is only valid before the closing )
                        if (current === 0x0029) {
                            // URL is valid
                            url.end = pos;
                        }
                        complete = true;
                    }
                    else {
                        // Add the character to the url value
                        url.value += String.fromCodePoint(current);
                    }
                    break;
            }
            next();
        }
        // An end position indicates a URL was found
        if (url.end !== -1) {
            yield url;
        }
    }
}
/**
 * Provides the Sass importer logic to resolve relative stylesheet imports via both import and use rules
 * and also rebase any `url()` function usage within those stylesheets. The rebasing will ensure that
 * the URLs in the output of the Sass compiler reflect the final filesystem location of the output CSS file.
 */
class RelativeUrlRebasingImporter extends UrlRebasingImporter {
    constructor(entryDirectory, directoryCache = new Map(), rebaseSourceMaps) {
        super(entryDirectory, rebaseSourceMaps);
        this.directoryCache = directoryCache;
    }
    canonicalize(url, options) {
        return this.resolveImport(url, options.fromImport, true);
    }
    /**
     * Attempts to resolve a provided URL to a stylesheet file using the Sass compiler's resolution algorithm.
     * Based on https://github.com/sass/dart-sass/blob/44d6bb6ac72fe6b93f5bfec371a1fffb18e6b76d/lib/src/importer/utils.dart
     * @param url The file protocol URL to resolve.
     * @param fromImport If true, URL was from an import rule; otherwise from a use rule.
     * @param checkDirectory If true, try checking for a directory with the base name containing an index file.
     * @returns A full resolved URL of the stylesheet file or `null` if not found.
     */
    resolveImport(url, fromImport, checkDirectory) {
        var _a;
        let stylesheetPath;
        try {
            stylesheetPath = (0, node_url_1.fileURLToPath)(url);
        }
        catch (_b) {
            // Only file protocol URLs are supported by this importer
            return null;
        }
        const directory = (0, node_path_1.dirname)(stylesheetPath);
        const extension = (0, node_path_1.extname)(stylesheetPath);
        const hasStyleExtension = extension === '.scss' || extension === '.sass' || extension === '.css';
        // Remove the style extension if present to allow adding the `.import` suffix
        const filename = (0, node_path_1.basename)(stylesheetPath, hasStyleExtension ? extension : undefined);
        const importPotentials = new Set();
        const defaultPotentials = new Set();
        if (hasStyleExtension) {
            if (fromImport) {
                importPotentials.add(filename + '.import' + extension);
                importPotentials.add('_' + filename + '.import' + extension);
            }
            defaultPotentials.add(filename + extension);
            defaultPotentials.add('_' + filename + extension);
        }
        else {
            if (fromImport) {
                importPotentials.add(filename + '.import.scss');
                importPotentials.add(filename + '.import.sass');
                importPotentials.add(filename + '.import.css');
                importPotentials.add('_' + filename + '.import.scss');
                importPotentials.add('_' + filename + '.import.sass');
                importPotentials.add('_' + filename + '.import.css');
            }
            defaultPotentials.add(filename + '.scss');
            defaultPotentials.add(filename + '.sass');
            defaultPotentials.add(filename + '.css');
            defaultPotentials.add('_' + filename + '.scss');
            defaultPotentials.add('_' + filename + '.sass');
            defaultPotentials.add('_' + filename + '.css');
        }
        let foundDefaults;
        let foundImports;
        let hasPotentialIndex = false;
        let cachedEntries = this.directoryCache.get(directory);
        if (cachedEntries) {
            // If there is a preprocessed cache of the directory, perform an intersection of the potentials
            // and the directory files.
            const { files, directories } = cachedEntries;
            foundDefaults = [...defaultPotentials].filter((potential) => files.has(potential));
            foundImports = [...importPotentials].filter((potential) => files.has(potential));
            hasPotentialIndex = checkDirectory && !hasStyleExtension && directories.has(filename);
        }
        else {
            // If no preprocessed cache exists, get the entries from the file system and, while searching,
            // generate the cache for later requests.
            let entries;
            try {
                entries = (0, node_fs_1.readdirSync)(directory, { withFileTypes: true });
            }
            catch (_c) {
                return null;
            }
            foundDefaults = [];
            foundImports = [];
            cachedEntries = { files: new Set(), directories: new Set() };
            for (const entry of entries) {
                const isDirectory = entry.isDirectory();
                if (isDirectory) {
                    cachedEntries.directories.add(entry.name);
                }
                // Record if the name should be checked as a directory with an index file
                if (checkDirectory && !hasStyleExtension && entry.name === filename && isDirectory) {
                    hasPotentialIndex = true;
                }
                if (!entry.isFile()) {
                    continue;
                }
                cachedEntries.files.add(entry.name);
                if (importPotentials.has(entry.name)) {
                    foundImports.push(entry.name);
                }
                if (defaultPotentials.has(entry.name)) {
                    foundDefaults.push(entry.name);
                }
            }
            this.directoryCache.set(directory, cachedEntries);
        }
        // `foundImports` will only contain elements if `options.fromImport` is true
        const result = (_a = this.checkFound(foundImports)) !== null && _a !== void 0 ? _a : this.checkFound(foundDefaults);
        if (result !== null) {
            return (0, node_url_1.pathToFileURL)((0, node_path_1.join)(directory, result));
        }
        if (hasPotentialIndex) {
            // Check for index files using filename as a directory
            return this.resolveImport(url + '/index', fromImport, false);
        }
        return null;
    }
    /**
     * Checks an array of potential stylesheet files to determine if there is a valid
     * stylesheet file. More than one discovered file may indicate an error.
     * @param found An array of discovered stylesheet files.
     * @returns A fully resolved path for a stylesheet file or `null` if not found.
     * @throws If there are ambiguous files discovered.
     */
    checkFound(found) {
        if (found.length === 0) {
            // Not found
            return null;
        }
        // More than one found file may be an error
        if (found.length > 1) {
            // Presence of CSS files alongside a Sass file does not cause an error
            const foundWithoutCss = found.filter((element) => (0, node_path_1.extname)(element) !== '.css');
            // If the length is zero then there are two or more css files
            // If the length is more than one than there are two or more sass/scss files
            if (foundWithoutCss.length !== 1) {
                throw new Error('Ambiguous import detected.');
            }
            // Return the non-CSS file (sass/scss files have priority)
            // https://github.com/sass/dart-sass/blob/44d6bb6ac72fe6b93f5bfec371a1fffb18e6b76d/lib/src/importer/utils.dart#L44-L47
            return foundWithoutCss[0];
        }
        return found[0];
    }
}
exports.RelativeUrlRebasingImporter = RelativeUrlRebasingImporter;
/**
 * Provides the Sass importer logic to resolve module (npm package) stylesheet imports via both import and
 * use rules and also rebase any `url()` function usage within those stylesheets. The rebasing will ensure that
 * the URLs in the output of the Sass compiler reflect the final filesystem location of the output CSS file.
 */
class ModuleUrlRebasingImporter extends RelativeUrlRebasingImporter {
    constructor(entryDirectory, directoryCache, rebaseSourceMaps, finder) {
        super(entryDirectory, directoryCache, rebaseSourceMaps);
        this.finder = finder;
    }
    canonicalize(url, options) {
        if (url.startsWith('file://')) {
            return super.canonicalize(url, options);
        }
        const result = this.finder(url, options);
        return result ? super.canonicalize(result.href, options) : null;
    }
}
exports.ModuleUrlRebasingImporter = ModuleUrlRebasingImporter;
/**
 * Provides the Sass importer logic to resolve load paths located stylesheet imports via both import and
 * use rules and also rebase any `url()` function usage within those stylesheets. The rebasing will ensure that
 * the URLs in the output of the Sass compiler reflect the final filesystem location of the output CSS file.
 */
class LoadPathsUrlRebasingImporter extends RelativeUrlRebasingImporter {
    constructor(entryDirectory, directoryCache, rebaseSourceMaps, loadPaths) {
        super(entryDirectory, directoryCache, rebaseSourceMaps);
        this.loadPaths = loadPaths;
    }
    canonicalize(url, options) {
        if (url.startsWith('file://')) {
            return super.canonicalize(url, options);
        }
        let result = null;
        for (const loadPath of this.loadPaths) {
            result = super.canonicalize((0, node_url_1.pathToFileURL)((0, node_path_1.join)(loadPath, url)).href, options);
            if (result !== null) {
                break;
            }
        }
        return result;
    }
}
exports.LoadPathsUrlRebasingImporter = LoadPathsUrlRebasingImporter;
/**
 * Workaround for Sass not calling instance methods with `this`.
 * The `canonicalize` and `load` methods will be bound to the class instance.
 * @param importer A Sass importer to bind.
 * @returns The bound Sass importer.
 */
function sassBindWorkaround(importer) {
    importer.canonicalize = importer.canonicalize.bind(importer);
    importer.load = importer.load.bind(importer);
    return importer;
}
exports.sassBindWorkaround = sassBindWorkaround;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmViYXNpbmctaW1wb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9zYXNzL3JlYmFzaW5nLWltcG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUdILGdFQUF1QztBQUN2QyxxQ0FBb0Q7QUFDcEQseUNBQXVFO0FBQ3ZFLHVDQUF3RDtBQVl4RDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBZSxtQkFBbUI7SUFDaEM7Ozs7T0FJRztJQUNILFlBQ1UsY0FBc0IsRUFDdEIsZ0JBQTRDO1FBRDVDLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1FBQ3RCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBNEI7SUFDbkQsQ0FBQztJQUlKLElBQUksQ0FBQyxZQUFpQjtRQUNwQixNQUFNLGNBQWMsR0FBRyxJQUFBLHdCQUFhLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkQsTUFBTSxtQkFBbUIsR0FBRyxJQUFBLG1CQUFPLEVBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsSUFBSSxRQUFRLEdBQUcsSUFBQSxzQkFBWSxFQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVyRCxpQ0FBaUM7UUFDakMsSUFBSSxlQUFlLENBQUM7UUFDcEIsS0FBSyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEQsNENBQTRDO1lBQzVDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDL0MsU0FBUzthQUNWO1lBRUQsMkRBQTJEO1lBQzNELElBQUkscUNBQXFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNyRCxTQUFTO2FBQ1Y7WUFF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LEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFN0MsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUxELGdEQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IFJhd1NvdXJjZU1hcCB9IGZyb20gJ0BhbXBwcm9qZWN0L3JlbWFwcGluZyc7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IGJhc2VuYW1lLCBkaXJuYW1lLCBleHRuYW1lLCBqb2luLCByZWxhdGl2ZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBwYXRoVG9GaWxlVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHR5cGUgeyBGaWxlSW1wb3J0ZXIsIEltcG9ydGVyLCBJbXBvcnRlclJlc3VsdCwgU3ludGF4IH0gZnJvbSAnc2Fzcyc7XG5cbi8qKlxuICogQSBwcmVwcm9jZXNzZWQgY2FjaGUgZW50cnkgZm9yIHRoZSBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgd2l0aGluIGEgcHJldmlvdXNseSBzZWFyY2hlZFxuICogZGlyZWN0b3J5IHdoZW4gcGVyZm9ybWluZyBTYXNzIGltcG9ydCByZXNvbHV0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdG9yeUVudHJ5IHtcbiAgZmlsZXM6IFNldDxzdHJpbmc+O1xuICBkaXJlY3RvcmllczogU2V0PHN0cmluZz47XG59XG5cbi8qKlxuICogQSBTYXNzIEltcG9ydGVyIGJhc2UgY2xhc3MgdGhhdCBwcm92aWRlcyB0aGUgbG9hZCBsb2dpYyB0byByZWJhc2UgYWxsIGB1cmwoKWAgZnVuY3Rpb25zXG4gKiB3aXRoaW4gYSBzdHlsZXNoZWV0LiBUaGUgcmViYXNpbmcgd2lsbCBlbnN1cmUgdGhhdCB0aGUgVVJMcyBpbiB0aGUgb3V0cHV0IG9mIHRoZSBTYXNzIGNvbXBpbGVyXG4gKiByZWZsZWN0IHRoZSBmaW5hbCBmaWxlc3lzdGVtIGxvY2F0aW9uIG9mIHRoZSBvdXRwdXQgQ1NTIGZpbGUuXG4gKlxuICogVGhpcyBjbGFzcyBwcm92aWRlcyB0aGUgY29yZSBvZiB0aGUgcmViYXNpbmcgZnVuY3Rpb25hbGl0eS4gVG8gZW5zdXJlIHRoYXQgZWFjaCBmaWxlIGlzIHByb2Nlc3NlZFxuICogYnkgdGhpcyBpbXBvcnRlcidzIGxvYWQgaW1wbGVtZW50YXRpb24sIHRoZSBTYXNzIGNvbXBpbGVyIHJlcXVpcmVzIHRoZSBpbXBvcnRlcidzIGNhbm9uaWNhbGl6ZVxuICogZnVuY3Rpb24gdG8gcmV0dXJuIGEgbm9uLW51bGwgdmFsdWUgd2l0aCB0aGUgcmVzb2x2ZWQgbG9jYXRpb24gb2YgdGhlIHJlcXVlc3RlZCBzdHlsZXNoZWV0LlxuICogQ29uY3JldGUgaW1wbGVtZW50YXRpb25zIG9mIHRoaXMgY2xhc3MgbXVzdCBwcm92aWRlIHRoaXMgY2Fub25pY2FsaXplIGZ1bmN0aW9uYWxpdHkgZm9yIHJlYmFzaW5nXG4gKiB0byBiZSBlZmZlY3RpdmUuXG4gKi9cbmFic3RyYWN0IGNsYXNzIFVybFJlYmFzaW5nSW1wb3J0ZXIgaW1wbGVtZW50cyBJbXBvcnRlcjwnc3luYyc+IHtcbiAgLyoqXG4gICAqIEBwYXJhbSBlbnRyeURpcmVjdG9yeSBUaGUgZGlyZWN0b3J5IG9mIHRoZSBlbnRyeSBzdHlsZXNoZWV0IHRoYXQgd2FzIHBhc3NlZCB0byB0aGUgU2FzcyBjb21waWxlci5cbiAgICogQHBhcmFtIHJlYmFzZVNvdXJjZU1hcHMgV2hlbiBwcm92aWRlZCwgcmViYXNlZCBmaWxlcyB3aWxsIGhhdmUgYW4gaW50ZXJtZWRpYXRlIHNvdXJjZW1hcCBhZGRlZCB0byB0aGUgTWFwXG4gICAqIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGdlbmVyYXRlIGEgZmluYWwgc291cmNlbWFwIHRoYXQgY29udGFpbnMgb3JpZ2luYWwgc291cmNlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZW50cnlEaXJlY3Rvcnk6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYmFzZVNvdXJjZU1hcHM/OiBNYXA8c3RyaW5nLCBSYXdTb3VyY2VNYXA+LFxuICApIHt9XG5cbiAgYWJzdHJhY3QgY2Fub25pY2FsaXplKHVybDogc3RyaW5nLCBvcHRpb25zOiB7IGZyb21JbXBvcnQ6IGJvb2xlYW4gfSk6IFVSTCB8IG51bGw7XG5cbiAgbG9hZChjYW5vbmljYWxVcmw6IFVSTCk6IEltcG9ydGVyUmVzdWx0IHwgbnVsbCB7XG4gICAgY29uc3Qgc3R5bGVzaGVldFBhdGggPSBmaWxlVVJMVG9QYXRoKGNhbm9uaWNhbFVybCk7XG4gICAgY29uc3Qgc3R5bGVzaGVldERpcmVjdG9yeSA9IGRpcm5hbWUoc3R5bGVzaGVldFBhdGgpO1xuICAgIGxldCBjb250ZW50cyA9IHJlYWRGaWxlU3luYyhzdHlsZXNoZWV0UGF0aCwgJ3V0Zi04Jyk7XG5cbiAgICAvLyBSZWJhc2UgYW55IFVSTHMgdGhhdCBhcmUgZm91bmRcbiAgICBsZXQgdXBkYXRlZENvbnRlbnRzO1xuICAgIGZvciAoY29uc3QgeyBzdGFydCwgZW5kLCB2YWx1ZSB9IG9mIGZpbmRVcmxzKGNvbnRlbnRzKSkge1xuICAgICAgLy8gU2tpcCBpZiB2YWx1ZSBpcyBlbXB0eSBvciBhIFNhc3MgdmFyaWFibGVcbiAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDAgfHwgdmFsdWUuc3RhcnRzV2l0aCgnJCcpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIGlmIHJvb3QtcmVsYXRpdmUsIGFic29sdXRlIG9yIHByb3RvY29sIHJlbGF0aXZlIHVybFxuICAgICAgaWYgKC9eKCg/Olxcdys6KT9cXC9cXC98ZGF0YTp8Y2hyb21lOnwjfFxcLykvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZWJhc2VkUGF0aCA9IHJlbGF0aXZlKHRoaXMuZW50cnlEaXJlY3RvcnksIGpvaW4oc3R5bGVzaGVldERpcmVjdG9yeSwgdmFsdWUpKTtcblxuICAgICAgLy8gTm9ybWFsaXplIHBhdGggc2VwYXJhdG9ycyBhbmQgZXNjYXBlIGNoYXJhY3RlcnNcbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy91cmwjc3ludGF4XG4gICAgICBjb25zdCByZWJhc2VkVXJsID0gJy4vJyArIHJlYmFzZWRQYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC9bKClcXHMnXCJdL2csICdcXFxcJCYnKTtcblxuICAgICAgdXBkYXRlZENvbnRlbnRzID8/PSBuZXcgTWFnaWNTdHJpbmcoY29udGVudHMpO1xuICAgICAgdXBkYXRlZENvbnRlbnRzLnVwZGF0ZShzdGFydCwgZW5kLCByZWJhc2VkVXJsKTtcbiAgICB9XG5cbiAgICBpZiAodXBkYXRlZENvbnRlbnRzKSB7XG4gICAgICBjb250ZW50cyA9IHVwZGF0ZWRDb250ZW50cy50b1N0cmluZygpO1xuICAgICAgaWYgKHRoaXMucmViYXNlU291cmNlTWFwcykge1xuICAgICAgICAvLyBHZW5lcmF0ZSBhbiBpbnRlcm1lZGlhdGUgc291cmNlIG1hcCBmb3IgdGhlIHJlYmFzaW5nIGNoYW5nZXNcbiAgICAgICAgY29uc3QgbWFwID0gdXBkYXRlZENvbnRlbnRzLmdlbmVyYXRlTWFwKHtcbiAgICAgICAgICBoaXJlczogdHJ1ZSxcbiAgICAgICAgICBpbmNsdWRlQ29udGVudDogdHJ1ZSxcbiAgICAgICAgICBzb3VyY2U6IGNhbm9uaWNhbFVybC5ocmVmLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWJhc2VTb3VyY2VNYXBzLnNldChjYW5vbmljYWxVcmwuaHJlZiwgbWFwIGFzIFJhd1NvdXJjZU1hcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHN5bnRheDogU3ludGF4IHwgdW5kZWZpbmVkO1xuICAgIHN3aXRjaCAoZXh0bmFtZShzdHlsZXNoZWV0UGF0aCkudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAnY3NzJzpcbiAgICAgICAgc3ludGF4ID0gJ2Nzcyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2Fzcyc6XG4gICAgICAgIHN5bnRheCA9ICdpbmRlbnRlZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3ludGF4ID0gJ3Njc3MnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudHMsXG4gICAgICBzeW50YXgsXG4gICAgICBzb3VyY2VNYXBVcmw6IGNhbm9uaWNhbFVybCxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhIHVuaWNvZGUgY29kZSBwb2ludCBpcyBhIENTUyB3aGl0ZXNwYWNlIGNoYXJhY3Rlci5cbiAqIEBwYXJhbSBjb2RlIFRoZSB1bmljb2RlIGNvZGUgcG9pbnQgdG8gdGVzdC5cbiAqIEByZXR1cm5zIHRydWUsIGlmIHRoZSBjb2RlIHBvaW50IGlzIENTUyB3aGl0ZXNwYWNlOyBmYWxzZSwgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIEJhc2VkIG9uIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3Mtc3ludGF4LTMvI3doaXRlc3BhY2VcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAweDAwMDk6IC8vIHRhYlxuICAgIGNhc2UgMHgwMDIwOiAvLyBzcGFjZVxuICAgIGNhc2UgMHgwMDBhOiAvLyBsaW5lIGZlZWRcbiAgICBjYXNlIDB4MDAwYzogLy8gZm9ybSBmZWVkXG4gICAgY2FzZSAweDAwMGQ6IC8vIGNhcnJpYWdlIHJldHVyblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFNjYW5zIGEgQ1NTIG9yIFNhc3MgZmlsZSBhbmQgbG9jYXRlcyBhbGwgdmFsaWQgdXJsIGZ1bmN0aW9uIHZhbHVlcyBhcyBkZWZpbmVkIGJ5IHRoZSBDU1NcbiAqIHN5bnRheCBzcGVjaWZpY2F0aW9uLlxuICogQHBhcmFtIGNvbnRlbnRzIEEgc3RyaW5nIGNvbnRhaW5pbmcgYSBDU1Mgb3IgU2FzcyBmaWxlIHRvIHNjYW4uXG4gKiBAcmV0dXJucyBBbiBpdGVyYWJsZSB0aGF0IHlpZWxkcyBlYWNoIENTUyB1cmwgZnVuY3Rpb24gdmFsdWUgZm91bmQuXG4gKi9cbmZ1bmN0aW9uKiBmaW5kVXJscyhjb250ZW50czogc3RyaW5nKTogSXRlcmFibGU8eyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlcjsgdmFsdWU6IHN0cmluZyB9PiB7XG4gIGxldCBwb3MgPSAwO1xuICBsZXQgd2lkdGggPSAxO1xuICBsZXQgY3VycmVudCA9IC0xO1xuICBjb25zdCBuZXh0ID0gKCkgPT4ge1xuICAgIHBvcyArPSB3aWR0aDtcbiAgICBjdXJyZW50ID0gY29udGVudHMuY29kZVBvaW50QXQocG9zKSA/PyAtMTtcbiAgICB3aWR0aCA9IGN1cnJlbnQgPiAweGZmZmYgPyAyIDogMTtcblxuICAgIHJldHVybiBjdXJyZW50O1xuICB9O1xuXG4gIC8vIEJhc2VkIG9uIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3Mtc3ludGF4LTMvI2NvbnN1bWUtaWRlbnQtbGlrZS10b2tlblxuICB3aGlsZSAoKHBvcyA9IGNvbnRlbnRzLmluZGV4T2YoJ3VybCgnLCBwb3MpKSAhPT0gLTEpIHtcbiAgICAvLyBTZXQgdG8gcG9zaXRpb24gb2YgdGhlIChcbiAgICBwb3MgKz0gMztcbiAgICB3aWR0aCA9IDE7XG5cbiAgICAvLyBDb25zdW1lIGFsbCBsZWFkaW5nIHdoaXRlc3BhY2VcbiAgICB3aGlsZSAoaXNXaGl0ZXNwYWNlKG5leHQoKSkpIHtcbiAgICAgIC8qIGVtcHR5ICovXG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZSBVUkwgc3RhdGVcbiAgICBjb25zdCB1cmwgPSB7IHN0YXJ0OiBwb3MsIGVuZDogLTEsIHZhbHVlOiAnJyB9O1xuICAgIGxldCBjb21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgLy8gSWYgXCIgb3IgJywgdGhlbiBjb25zdW1lIHRoZSB2YWx1ZSBhcyBhIHN0cmluZ1xuICAgIGlmIChjdXJyZW50ID09PSAweDAwMjIgfHwgY3VycmVudCA9PT0gMHgwMDI3KSB7XG4gICAgICBjb25zdCBlbmRpbmcgPSBjdXJyZW50O1xuICAgICAgLy8gQmFzZWQgb24gaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1zeW50YXgtMy8jY29uc3VtZS1zdHJpbmctdG9rZW5cbiAgICAgIHdoaWxlICghY29tcGxldGUpIHtcbiAgICAgICAgc3dpdGNoIChuZXh0KCkpIHtcbiAgICAgICAgICBjYXNlIC0xOiAvLyBFT0ZcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICBjYXNlIDB4MDAwYTogLy8gbGluZSBmZWVkXG4gICAgICAgICAgY2FzZSAweDAwMGM6IC8vIGZvcm0gZmVlZFxuICAgICAgICAgIGNhc2UgMHgwMDBkOiAvLyBjYXJyaWFnZSByZXR1cm5cbiAgICAgICAgICAgIC8vIEludmFsaWRcbiAgICAgICAgICAgIGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMHgwMDVjOiAvLyBcXCAtLSBjaGFyYWN0ZXIgZXNjYXBlXG4gICAgICAgICAgICAvLyBJZiBub3QgRU9GIG9yIG5ld2xpbmUsIGFkZCB0aGUgY2hhcmFjdGVyIGFmdGVyIHRoZSBlc2NhcGVcbiAgICAgICAgICAgIHN3aXRjaCAobmV4dCgpKSB7XG4gICAgICAgICAgICAgIGNhc2UgLTE6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICBjYXNlIDB4MDAwYTogLy8gbGluZSBmZWVkXG4gICAgICAgICAgICAgIGNhc2UgMHgwMDBjOiAvLyBmb3JtIGZlZWRcbiAgICAgICAgICAgICAgY2FzZSAweDAwMGQ6IC8vIGNhcnJpYWdlIHJldHVyblxuICAgICAgICAgICAgICAgIC8vIFNraXAgd2hlbiBpbnNpZGUgYSBzdHJpbmdcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBIYW5kbGUgaGV4IGVzY2FwZSBjb2Rlc1xuICAgICAgICAgICAgICAgIHVybC52YWx1ZSArPSBTdHJpbmcuZnJvbUNvZGVQb2ludChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgZW5kaW5nOlxuICAgICAgICAgICAgLy8gRnVsbCBzdHJpbmcgcG9zaXRpb24gc2hvdWxkIGluY2x1ZGUgdGhlIHF1b3RlcyBmb3IgcmVwbGFjZW1lbnRcbiAgICAgICAgICAgIHVybC5lbmQgPSBwb3MgKyAxO1xuICAgICAgICAgICAgY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgeWllbGQgdXJsO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHVybC52YWx1ZSArPSBTdHJpbmcuZnJvbUNvZGVQb2ludChjdXJyZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5leHQoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIEJhc2VkIG9uIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3Mtc3ludGF4LTMvI2NvbnN1bWUtdXJsLXRva2VuXG4gICAgd2hpbGUgKCFjb21wbGV0ZSkge1xuICAgICAgc3dpdGNoIChjdXJyZW50KSB7XG4gICAgICAgIGNhc2UgLTE6IC8vIEVPRlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FzZSAweDAwMjI6IC8vIFwiXG4gICAgICAgIGNhc2UgMHgwMDI3OiAvLyAnXG4gICAgICAgIGNhc2UgMHgwMDI4OiAvLyAoXG4gICAgICAgICAgLy8gSW52YWxpZFxuICAgICAgICAgIGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAweDAwMjk6IC8vIClcbiAgICAgICAgICAvLyBVUkwgaXMgdmFsaWQgYW5kIGNvbXBsZXRlXG4gICAgICAgICAgdXJsLmVuZCA9IHBvcztcbiAgICAgICAgICBjb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMHgwMDVjOiAvLyBcXCAtLSBjaGFyYWN0ZXIgZXNjYXBlXG4gICAgICAgICAgLy8gSWYgbm90IEVPRiBvciBuZXdsaW5lLCBhZGQgdGhlIGNoYXJhY3RlciBhZnRlciB0aGUgZXNjYXBlXG4gICAgICAgICAgc3dpdGNoIChuZXh0KCkpIHtcbiAgICAgICAgICAgIGNhc2UgLTE6IC8vIEVPRlxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlIDB4MDAwYTogLy8gbGluZSBmZWVkXG4gICAgICAgICAgICBjYXNlIDB4MDAwYzogLy8gZm9ybSBmZWVkXG4gICAgICAgICAgICBjYXNlIDB4MDAwZDogLy8gY2FycmlhZ2UgcmV0dXJuXG4gICAgICAgICAgICAgIC8vIEludmFsaWRcbiAgICAgICAgICAgICAgY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIC8vIFRPRE86IEhhbmRsZSBoZXggZXNjYXBlIGNvZGVzXG4gICAgICAgICAgICAgIHVybC52YWx1ZSArPSBTdHJpbmcuZnJvbUNvZGVQb2ludChjdXJyZW50KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmIChpc1doaXRlc3BhY2UoY3VycmVudCkpIHtcbiAgICAgICAgICAgIHdoaWxlIChpc1doaXRlc3BhY2UobmV4dCgpKSkge1xuICAgICAgICAgICAgICAvKiBlbXB0eSAqL1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVW5lc2NhcGVkIHdoaXRlc3BhY2UgaXMgb25seSB2YWxpZCBiZWZvcmUgdGhlIGNsb3NpbmcgKVxuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IDB4MDAyOSkge1xuICAgICAgICAgICAgICAvLyBVUkwgaXMgdmFsaWRcbiAgICAgICAgICAgICAgdXJsLmVuZCA9IHBvcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQWRkIHRoZSBjaGFyYWN0ZXIgdG8gdGhlIHVybCB2YWx1ZVxuICAgICAgICAgICAgdXJsLnZhbHVlICs9IFN0cmluZy5mcm9tQ29kZVBvaW50KGN1cnJlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG5leHQoKTtcbiAgICB9XG5cbiAgICAvLyBBbiBlbmQgcG9zaXRpb24gaW5kaWNhdGVzIGEgVVJMIHdhcyBmb3VuZFxuICAgIGlmICh1cmwuZW5kICE9PSAtMSkge1xuICAgICAgeWllbGQgdXJsO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSBTYXNzIGltcG9ydGVyIGxvZ2ljIHRvIHJlc29sdmUgcmVsYXRpdmUgc3R5bGVzaGVldCBpbXBvcnRzIHZpYSBib3RoIGltcG9ydCBhbmQgdXNlIHJ1bGVzXG4gKiBhbmQgYWxzbyByZWJhc2UgYW55IGB1cmwoKWAgZnVuY3Rpb24gdXNhZ2Ugd2l0aGluIHRob3NlIHN0eWxlc2hlZXRzLiBUaGUgcmViYXNpbmcgd2lsbCBlbnN1cmUgdGhhdFxuICogdGhlIFVSTHMgaW4gdGhlIG91dHB1dCBvZiB0aGUgU2FzcyBjb21waWxlciByZWZsZWN0IHRoZSBmaW5hbCBmaWxlc3lzdGVtIGxvY2F0aW9uIG9mIHRoZSBvdXRwdXQgQ1NTIGZpbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWxhdGl2ZVVybFJlYmFzaW5nSW1wb3J0ZXIgZXh0ZW5kcyBVcmxSZWJhc2luZ0ltcG9ydGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgZW50cnlEaXJlY3Rvcnk6IHN0cmluZyxcbiAgICBwcml2YXRlIGRpcmVjdG9yeUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIERpcmVjdG9yeUVudHJ5PigpLFxuICAgIHJlYmFzZVNvdXJjZU1hcHM/OiBNYXA8c3RyaW5nLCBSYXdTb3VyY2VNYXA+LFxuICApIHtcbiAgICBzdXBlcihlbnRyeURpcmVjdG9yeSwgcmViYXNlU291cmNlTWFwcyk7XG4gIH1cblxuICBjYW5vbmljYWxpemUodXJsOiBzdHJpbmcsIG9wdGlvbnM6IHsgZnJvbUltcG9ydDogYm9vbGVhbiB9KTogVVJMIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZUltcG9ydCh1cmwsIG9wdGlvbnMuZnJvbUltcG9ydCwgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gcmVzb2x2ZSBhIHByb3ZpZGVkIFVSTCB0byBhIHN0eWxlc2hlZXQgZmlsZSB1c2luZyB0aGUgU2FzcyBjb21waWxlcidzIHJlc29sdXRpb24gYWxnb3JpdGhtLlxuICAgKiBCYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vc2Fzcy9kYXJ0LXNhc3MvYmxvYi80NGQ2YmI2YWM3MmZlNmI5M2Y1YmZlYzM3MWExZmZmYjE4ZTZiNzZkL2xpYi9zcmMvaW1wb3J0ZXIvdXRpbHMuZGFydFxuICAgKiBAcGFyYW0gdXJsIFRoZSBmaWxlIHByb3RvY29sIFVSTCB0byByZXNvbHZlLlxuICAgKiBAcGFyYW0gZnJvbUltcG9ydCBJZiB0cnVlLCBVUkwgd2FzIGZyb20gYW4gaW1wb3J0IHJ1bGU7IG90aGVyd2lzZSBmcm9tIGEgdXNlIHJ1bGUuXG4gICAqIEBwYXJhbSBjaGVja0RpcmVjdG9yeSBJZiB0cnVlLCB0cnkgY2hlY2tpbmcgZm9yIGEgZGlyZWN0b3J5IHdpdGggdGhlIGJhc2UgbmFtZSBjb250YWluaW5nIGFuIGluZGV4IGZpbGUuXG4gICAqIEByZXR1cm5zIEEgZnVsbCByZXNvbHZlZCBVUkwgb2YgdGhlIHN0eWxlc2hlZXQgZmlsZSBvciBgbnVsbGAgaWYgbm90IGZvdW5kLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlSW1wb3J0KHVybDogc3RyaW5nLCBmcm9tSW1wb3J0OiBib29sZWFuLCBjaGVja0RpcmVjdG9yeTogYm9vbGVhbik6IFVSTCB8IG51bGwge1xuICAgIGxldCBzdHlsZXNoZWV0UGF0aDtcbiAgICB0cnkge1xuICAgICAgc3R5bGVzaGVldFBhdGggPSBmaWxlVVJMVG9QYXRoKHVybCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBPbmx5IGZpbGUgcHJvdG9jb2wgVVJMcyBhcmUgc3VwcG9ydGVkIGJ5IHRoaXMgaW1wb3J0ZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGRpcm5hbWUoc3R5bGVzaGVldFBhdGgpO1xuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGV4dG5hbWUoc3R5bGVzaGVldFBhdGgpO1xuICAgIGNvbnN0IGhhc1N0eWxlRXh0ZW5zaW9uID1cbiAgICAgIGV4dGVuc2lvbiA9PT0gJy5zY3NzJyB8fCBleHRlbnNpb24gPT09ICcuc2FzcycgfHwgZXh0ZW5zaW9uID09PSAnLmNzcyc7XG4gICAgLy8gUmVtb3ZlIHRoZSBzdHlsZSBleHRlbnNpb24gaWYgcHJlc2VudCB0byBhbGxvdyBhZGRpbmcgdGhlIGAuaW1wb3J0YCBzdWZmaXhcbiAgICBjb25zdCBmaWxlbmFtZSA9IGJhc2VuYW1lKHN0eWxlc2hlZXRQYXRoLCBoYXNTdHlsZUV4dGVuc2lvbiA/IGV4dGVuc2lvbiA6IHVuZGVmaW5lZCk7XG5cbiAgICBjb25zdCBpbXBvcnRQb3RlbnRpYWxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgZGVmYXVsdFBvdGVudGlhbHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgIGlmIChoYXNTdHlsZUV4dGVuc2lvbikge1xuICAgICAgaWYgKGZyb21JbXBvcnQpIHtcbiAgICAgICAgaW1wb3J0UG90ZW50aWFscy5hZGQoZmlsZW5hbWUgKyAnLmltcG9ydCcgKyBleHRlbnNpb24pO1xuICAgICAgICBpbXBvcnRQb3RlbnRpYWxzLmFkZCgnXycgKyBmaWxlbmFtZSArICcuaW1wb3J0JyArIGV4dGVuc2lvbik7XG4gICAgICB9XG4gICAgICBkZWZhdWx0UG90ZW50aWFscy5hZGQoZmlsZW5hbWUgKyBleHRlbnNpb24pO1xuICAgICAgZGVmYXVsdFBvdGVudGlhbHMuYWRkKCdfJyArIGZpbGVuYW1lICsgZXh0ZW5zaW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZyb21JbXBvcnQpIHtcbiAgICAgICAgaW1wb3J0UG90ZW50aWFscy5hZGQoZmlsZW5hbWUgKyAnLmltcG9ydC5zY3NzJyk7XG4gICAgICAgIGltcG9ydFBvdGVudGlhbHMuYWRkKGZpbGVuYW1lICsgJy5pbXBvcnQuc2FzcycpO1xuICAgICAgICBpbXBvcnRQb3RlbnRpYWxzLmFkZChmaWxlbmFtZSArICcuaW1wb3J0LmNzcycpO1xuICAgICAgICBpbXBvcnRQb3RlbnRpYWxzLmFkZCgnXycgKyBmaWxlbmFtZSArICcuaW1wb3J0LnNjc3MnKTtcbiAgICAgICAgaW1wb3J0UG90ZW50aWFscy5hZGQoJ18nICsgZmlsZW5hbWUgKyAnLmltcG9ydC5zYXNzJyk7XG4gICAgICAgIGltcG9ydFBvdGVudGlhbHMuYWRkKCdfJyArIGZpbGVuYW1lICsgJy5pbXBvcnQuY3NzJyk7XG4gICAgICB9XG4gICAgICBkZWZhdWx0UG90ZW50aWFscy5hZGQoZmlsZW5hbWUgKyAnLnNjc3MnKTtcbiAgICAgIGRlZmF1bHRQb3RlbnRpYWxzLmFkZChmaWxlbmFtZSArICcuc2FzcycpO1xuICAgICAgZGVmYXVsdFBvdGVudGlhbHMuYWRkKGZpbGVuYW1lICsgJy5jc3MnKTtcbiAgICAgIGRlZmF1bHRQb3RlbnRpYWxzLmFkZCgnXycgKyBmaWxlbmFtZSArICcuc2NzcycpO1xuICAgICAgZGVmYXVsdFBvdGVudGlhbHMuYWRkKCdfJyArIGZpbGVuYW1lICsgJy5zYXNzJyk7XG4gICAgICBkZWZhdWx0UG90ZW50aWFscy5hZGQoJ18nICsgZmlsZW5hbWUgKyAnLmNzcycpO1xuICAgIH1cblxuICAgIGxldCBmb3VuZERlZmF1bHRzO1xuICAgIGxldCBmb3VuZEltcG9ydHM7XG4gICAgbGV0IGhhc1BvdGVudGlhbEluZGV4ID0gZmFsc2U7XG5cbiAgICBsZXQgY2FjaGVkRW50cmllcyA9IHRoaXMuZGlyZWN0b3J5Q2FjaGUuZ2V0KGRpcmVjdG9yeSk7XG4gICAgaWYgKGNhY2hlZEVudHJpZXMpIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzIGEgcHJlcHJvY2Vzc2VkIGNhY2hlIG9mIHRoZSBkaXJlY3RvcnksIHBlcmZvcm0gYW4gaW50ZXJzZWN0aW9uIG9mIHRoZSBwb3RlbnRpYWxzXG4gICAgICAvLyBhbmQgdGhlIGRpcmVjdG9yeSBmaWxlcy5cbiAgICAgIGNvbnN0IHsgZmlsZXMsIGRpcmVjdG9yaWVzIH0gPSBjYWNoZWRFbnRyaWVzO1xuICAgICAgZm91bmREZWZhdWx0cyA9IFsuLi5kZWZhdWx0UG90ZW50aWFsc10uZmlsdGVyKChwb3RlbnRpYWwpID0+IGZpbGVzLmhhcyhwb3RlbnRpYWwpKTtcbiAgICAgIGZvdW5kSW1wb3J0cyA9IFsuLi5pbXBvcnRQb3RlbnRpYWxzXS5maWx0ZXIoKHBvdGVudGlhbCkgPT4gZmlsZXMuaGFzKHBvdGVudGlhbCkpO1xuICAgICAgaGFzUG90ZW50aWFsSW5kZXggPSBjaGVja0RpcmVjdG9yeSAmJiAhaGFzU3R5bGVFeHRlbnNpb24gJiYgZGlyZWN0b3JpZXMuaGFzKGZpbGVuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgbm8gcHJlcHJvY2Vzc2VkIGNhY2hlIGV4aXN0cywgZ2V0IHRoZSBlbnRyaWVzIGZyb20gdGhlIGZpbGUgc3lzdGVtIGFuZCwgd2hpbGUgc2VhcmNoaW5nLFxuICAgICAgLy8gZ2VuZXJhdGUgdGhlIGNhY2hlIGZvciBsYXRlciByZXF1ZXN0cy5cbiAgICAgIGxldCBlbnRyaWVzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZW50cmllcyA9IHJlYWRkaXJTeW5jKGRpcmVjdG9yeSwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBmb3VuZERlZmF1bHRzID0gW107XG4gICAgICBmb3VuZEltcG9ydHMgPSBbXTtcbiAgICAgIGNhY2hlZEVudHJpZXMgPSB7IGZpbGVzOiBuZXcgU2V0PHN0cmluZz4oKSwgZGlyZWN0b3JpZXM6IG5ldyBTZXQ8c3RyaW5nPigpIH07XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgY29uc3QgaXNEaXJlY3RvcnkgPSBlbnRyeS5pc0RpcmVjdG9yeSgpO1xuICAgICAgICBpZiAoaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICBjYWNoZWRFbnRyaWVzLmRpcmVjdG9yaWVzLmFkZChlbnRyeS5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlY29yZCBpZiB0aGUgbmFtZSBzaG91bGQgYmUgY2hlY2tlZCBhcyBhIGRpcmVjdG9yeSB3aXRoIGFuIGluZGV4IGZpbGVcbiAgICAgICAgaWYgKGNoZWNrRGlyZWN0b3J5ICYmICFoYXNTdHlsZUV4dGVuc2lvbiAmJiBlbnRyeS5uYW1lID09PSBmaWxlbmFtZSAmJiBpc0RpcmVjdG9yeSkge1xuICAgICAgICAgIGhhc1BvdGVudGlhbEluZGV4ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZW50cnkuaXNGaWxlKCkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhY2hlZEVudHJpZXMuZmlsZXMuYWRkKGVudHJ5Lm5hbWUpO1xuXG4gICAgICAgIGlmIChpbXBvcnRQb3RlbnRpYWxzLmhhcyhlbnRyeS5uYW1lKSkge1xuICAgICAgICAgIGZvdW5kSW1wb3J0cy5wdXNoKGVudHJ5Lm5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlZmF1bHRQb3RlbnRpYWxzLmhhcyhlbnRyeS5uYW1lKSkge1xuICAgICAgICAgIGZvdW5kRGVmYXVsdHMucHVzaChlbnRyeS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmRpcmVjdG9yeUNhY2hlLnNldChkaXJlY3RvcnksIGNhY2hlZEVudHJpZXMpO1xuICAgIH1cblxuICAgIC8vIGBmb3VuZEltcG9ydHNgIHdpbGwgb25seSBjb250YWluIGVsZW1lbnRzIGlmIGBvcHRpb25zLmZyb21JbXBvcnRgIGlzIHRydWVcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmNoZWNrRm91bmQoZm91bmRJbXBvcnRzKSA/PyB0aGlzLmNoZWNrRm91bmQoZm91bmREZWZhdWx0cyk7XG4gICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHBhdGhUb0ZpbGVVUkwoam9pbihkaXJlY3RvcnksIHJlc3VsdCkpO1xuICAgIH1cblxuICAgIGlmIChoYXNQb3RlbnRpYWxJbmRleCkge1xuICAgICAgLy8gQ2hlY2sgZm9yIGluZGV4IGZpbGVzIHVzaW5nIGZpbGVuYW1lIGFzIGEgZGlyZWN0b3J5XG4gICAgICByZXR1cm4gdGhpcy5yZXNvbHZlSW1wb3J0KHVybCArICcvaW5kZXgnLCBmcm9tSW1wb3J0LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGFuIGFycmF5IG9mIHBvdGVudGlhbCBzdHlsZXNoZWV0IGZpbGVzIHRvIGRldGVybWluZSBpZiB0aGVyZSBpcyBhIHZhbGlkXG4gICAqIHN0eWxlc2hlZXQgZmlsZS4gTW9yZSB0aGFuIG9uZSBkaXNjb3ZlcmVkIGZpbGUgbWF5IGluZGljYXRlIGFuIGVycm9yLlxuICAgKiBAcGFyYW0gZm91bmQgQW4gYXJyYXkgb2YgZGlzY292ZXJlZCBzdHlsZXNoZWV0IGZpbGVzLlxuICAgKiBAcmV0dXJucyBBIGZ1bGx5IHJlc29sdmVkIHBhdGggZm9yIGEgc3R5bGVzaGVldCBmaWxlIG9yIGBudWxsYCBpZiBub3QgZm91bmQuXG4gICAqIEB0aHJvd3MgSWYgdGhlcmUgYXJlIGFtYmlndW91cyBmaWxlcyBkaXNjb3ZlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBjaGVja0ZvdW5kKGZvdW5kOiBzdHJpbmdbXSk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmIChmb3VuZC5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIE5vdCBmb3VuZFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gTW9yZSB0aGFuIG9uZSBmb3VuZCBmaWxlIG1heSBiZSBhbiBlcnJvclxuICAgIGlmIChmb3VuZC5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBQcmVzZW5jZSBvZiBDU1MgZmlsZXMgYWxvbmdzaWRlIGEgU2FzcyBmaWxlIGRvZXMgbm90IGNhdXNlIGFuIGVycm9yXG4gICAgICBjb25zdCBmb3VuZFdpdGhvdXRDc3MgPSBmb3VuZC5maWx0ZXIoKGVsZW1lbnQpID0+IGV4dG5hbWUoZWxlbWVudCkgIT09ICcuY3NzJyk7XG4gICAgICAvLyBJZiB0aGUgbGVuZ3RoIGlzIHplcm8gdGhlbiB0aGVyZSBhcmUgdHdvIG9yIG1vcmUgY3NzIGZpbGVzXG4gICAgICAvLyBJZiB0aGUgbGVuZ3RoIGlzIG1vcmUgdGhhbiBvbmUgdGhhbiB0aGVyZSBhcmUgdHdvIG9yIG1vcmUgc2Fzcy9zY3NzIGZpbGVzXG4gICAgICBpZiAoZm91bmRXaXRob3V0Q3NzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FtYmlndW91cyBpbXBvcnQgZGV0ZWN0ZWQuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiB0aGUgbm9uLUNTUyBmaWxlIChzYXNzL3Njc3MgZmlsZXMgaGF2ZSBwcmlvcml0eSlcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zYXNzL2RhcnQtc2Fzcy9ibG9iLzQ0ZDZiYjZhYzcyZmU2YjkzZjViZmVjMzcxYTFmZmZiMThlNmI3NmQvbGliL3NyYy9pbXBvcnRlci91dGlscy5kYXJ0I0w0NC1MNDdcbiAgICAgIHJldHVybiBmb3VuZFdpdGhvdXRDc3NbMF07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvdW5kWzBdO1xuICB9XG59XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIFNhc3MgaW1wb3J0ZXIgbG9naWMgdG8gcmVzb2x2ZSBtb2R1bGUgKG5wbSBwYWNrYWdlKSBzdHlsZXNoZWV0IGltcG9ydHMgdmlhIGJvdGggaW1wb3J0IGFuZFxuICogdXNlIHJ1bGVzIGFuZCBhbHNvIHJlYmFzZSBhbnkgYHVybCgpYCBmdW5jdGlvbiB1c2FnZSB3aXRoaW4gdGhvc2Ugc3R5bGVzaGVldHMuIFRoZSByZWJhc2luZyB3aWxsIGVuc3VyZSB0aGF0XG4gKiB0aGUgVVJMcyBpbiB0aGUgb3V0cHV0IG9mIHRoZSBTYXNzIGNvbXBpbGVyIHJlZmxlY3QgdGhlIGZpbmFsIGZpbGVzeXN0ZW0gbG9jYXRpb24gb2YgdGhlIG91dHB1dCBDU1MgZmlsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vZHVsZVVybFJlYmFzaW5nSW1wb3J0ZXIgZXh0ZW5kcyBSZWxhdGl2ZVVybFJlYmFzaW5nSW1wb3J0ZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBlbnRyeURpcmVjdG9yeTogc3RyaW5nLFxuICAgIGRpcmVjdG9yeUNhY2hlOiBNYXA8c3RyaW5nLCBEaXJlY3RvcnlFbnRyeT4sXG4gICAgcmViYXNlU291cmNlTWFwczogTWFwPHN0cmluZywgUmF3U291cmNlTWFwPiB8IHVuZGVmaW5lZCxcbiAgICBwcml2YXRlIGZpbmRlcjogRmlsZUltcG9ydGVyPCdzeW5jJz5bJ2ZpbmRGaWxlVXJsJ10sXG4gICkge1xuICAgIHN1cGVyKGVudHJ5RGlyZWN0b3J5LCBkaXJlY3RvcnlDYWNoZSwgcmViYXNlU291cmNlTWFwcyk7XG4gIH1cblxuICBvdmVycmlkZSBjYW5vbmljYWxpemUodXJsOiBzdHJpbmcsIG9wdGlvbnM6IHsgZnJvbUltcG9ydDogYm9vbGVhbiB9KTogVVJMIHwgbnVsbCB7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCdmaWxlOi8vJykpIHtcbiAgICAgIHJldHVybiBzdXBlci5jYW5vbmljYWxpemUodXJsLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmZpbmRlcih1cmwsIG9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIHJlc3VsdCA/IHN1cGVyLmNhbm9uaWNhbGl6ZShyZXN1bHQuaHJlZiwgb3B0aW9ucykgOiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIFNhc3MgaW1wb3J0ZXIgbG9naWMgdG8gcmVzb2x2ZSBsb2FkIHBhdGhzIGxvY2F0ZWQgc3R5bGVzaGVldCBpbXBvcnRzIHZpYSBib3RoIGltcG9ydCBhbmRcbiAqIHVzZSBydWxlcyBhbmQgYWxzbyByZWJhc2UgYW55IGB1cmwoKWAgZnVuY3Rpb24gdXNhZ2Ugd2l0aGluIHRob3NlIHN0eWxlc2hlZXRzLiBUaGUgcmViYXNpbmcgd2lsbCBlbnN1cmUgdGhhdFxuICogdGhlIFVSTHMgaW4gdGhlIG91dHB1dCBvZiB0aGUgU2FzcyBjb21waWxlciByZWZsZWN0IHRoZSBmaW5hbCBmaWxlc3lzdGVtIGxvY2F0aW9uIG9mIHRoZSBvdXRwdXQgQ1NTIGZpbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2FkUGF0aHNVcmxSZWJhc2luZ0ltcG9ydGVyIGV4dGVuZHMgUmVsYXRpdmVVcmxSZWJhc2luZ0ltcG9ydGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgZW50cnlEaXJlY3Rvcnk6IHN0cmluZyxcbiAgICBkaXJlY3RvcnlDYWNoZTogTWFwPHN0cmluZywgRGlyZWN0b3J5RW50cnk+LFxuICAgIHJlYmFzZVNvdXJjZU1hcHM6IE1hcDxzdHJpbmcsIFJhd1NvdXJjZU1hcD4gfCB1bmRlZmluZWQsXG4gICAgcHJpdmF0ZSBsb2FkUGF0aHM6IEl0ZXJhYmxlPHN0cmluZz4sXG4gICkge1xuICAgIHN1cGVyKGVudHJ5RGlyZWN0b3J5LCBkaXJlY3RvcnlDYWNoZSwgcmViYXNlU291cmNlTWFwcyk7XG4gIH1cblxuICBvdmVycmlkZSBjYW5vbmljYWxpemUodXJsOiBzdHJpbmcsIG9wdGlvbnM6IHsgZnJvbUltcG9ydDogYm9vbGVhbiB9KTogVVJMIHwgbnVsbCB7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCdmaWxlOi8vJykpIHtcbiAgICAgIHJldHVybiBzdXBlci5jYW5vbmljYWxpemUodXJsLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGxvYWRQYXRoIG9mIHRoaXMubG9hZFBhdGhzKSB7XG4gICAgICByZXN1bHQgPSBzdXBlci5jYW5vbmljYWxpemUocGF0aFRvRmlsZVVSTChqb2luKGxvYWRQYXRoLCB1cmwpKS5ocmVmLCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG4vKipcbiAqIFdvcmthcm91bmQgZm9yIFNhc3Mgbm90IGNhbGxpbmcgaW5zdGFuY2UgbWV0aG9kcyB3aXRoIGB0aGlzYC5cbiAqIFRoZSBgY2Fub25pY2FsaXplYCBhbmQgYGxvYWRgIG1ldGhvZHMgd2lsbCBiZSBib3VuZCB0byB0aGUgY2xhc3MgaW5zdGFuY2UuXG4gKiBAcGFyYW0gaW1wb3J0ZXIgQSBTYXNzIGltcG9ydGVyIHRvIGJpbmQuXG4gKiBAcmV0dXJucyBUaGUgYm91bmQgU2FzcyBpbXBvcnRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhc3NCaW5kV29ya2Fyb3VuZDxUIGV4dGVuZHMgSW1wb3J0ZXI+KGltcG9ydGVyOiBUKTogVCB7XG4gIGltcG9ydGVyLmNhbm9uaWNhbGl6ZSA9IGltcG9ydGVyLmNhbm9uaWNhbGl6ZS5iaW5kKGltcG9ydGVyKTtcbiAgaW1wb3J0ZXIubG9hZCA9IGltcG9ydGVyLmxvYWQuYmluZChpbXBvcnRlcik7XG5cbiAgcmV0dXJuIGltcG9ydGVyO1xufVxuIl19
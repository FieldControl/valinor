#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/command_line_options", ["require", "exports", "yargs", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/logging"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCommandLineOptions = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var logging_1 = require("@angular/compiler-cli/src/ngtsc/logging");
    function parseCommandLineOptions(args) {
        var _a;
        var options = yargs
            .option('s', {
            alias: 'source',
            describe: 'A path (relative to the working directory) of the `node_modules` folder to process.',
            default: './node_modules',
            type: 'string',
        })
            .option('f', { alias: 'formats', hidden: true, array: true, type: 'string' })
            .option('p', {
            alias: 'properties',
            array: true,
            describe: 'An array of names of properties in package.json to compile (e.g. `module` or `main`)\n' +
                'Each of these properties should hold the path to a bundle-format.\n' +
                'If provided, only the specified properties are considered for processing.\n' +
                'If not provided, all the supported format properties (e.g. fesm2015, fesm5, es2015, esm2015, esm5, main, module) in the package.json are considered.',
            type: 'string',
        })
            .option('t', {
            alias: 'target',
            describe: 'A relative path (from the `source` path) to a single entry-point to process (plus its dependencies).\n' +
                'If this property is provided then `error-on-failed-entry-point` is forced to true.\n' +
                'This option overrides the `--use-program-dependencies` option.',
            type: 'string',
        })
            .option('use-program-dependencies', {
            type: 'boolean',
            describe: 'If this property is provided then the entry-points to process are parsed from the program defined by the loaded tsconfig.json. See `--tsconfig`.\n' +
                'This option is overridden by the `--target` option.',
        })
            .option('first-only', {
            describe: 'If specified then only the first matching package.json property will be compiled.\n' +
                'This option is overridden by `--typings-only`.',
            type: 'boolean',
        })
            .option('typings-only', {
            describe: 'If specified then only the typings files are processed, and no JS source files will be modified.\n' +
                'Setting this option will force `--first-only` to be set, since only one format is needed to process the typings',
            type: 'boolean',
        })
            .option('create-ivy-entry-points', {
            describe: 'If specified then new `*_ivy_ngcc` entry-points will be added to package.json rather than modifying the ones in-place.\n' +
                'For this to work you need to have custom resolution set up (e.g. in webpack) to look for these new entry-points.\n' +
                'The Angular CLI does this already, so it is safe to use this option if the project is being built via the CLI.',
            type: 'boolean',
        })
            .option('legacy-message-ids', {
            describe: 'Render `$localize` messages with legacy format ids.\n' +
                'The default value is `true`. Only set this to `false` if you do not want legacy message ids to\n' +
                'be rendered. For example, if you are not using legacy message ids in your translation files\n' +
                'AND are not doing compile-time inlining of translations, in which case the extra message ids\n' +
                'would add unwanted size to the final source bundle.\n' +
                'It is safe to leave this set to true if you are doing compile-time inlining because the extra\n' +
                'legacy message ids will all be stripped during translation.',
            type: 'boolean',
            default: true,
        })
            .option('async', {
            describe: 'Whether to compile asynchronously. This is enabled by default as it allows compilations to be parallelized.\n' +
                'Disabling asynchronous compilation may be useful for debugging.',
            type: 'boolean',
            default: true,
        })
            .option('l', {
            alias: 'loglevel',
            describe: 'The lowest severity logging message that should be output.',
            choices: ['debug', 'info', 'warn', 'error'],
            type: 'string',
        })
            .option('invalidate-entry-point-manifest', {
            describe: 'If this is set then ngcc will not read an entry-point manifest file from disk.\n' +
                'Instead it will walk the directory tree as normal looking for entry-points, and then write a new manifest file.',
            type: 'boolean',
            default: false,
        })
            .option('error-on-failed-entry-point', {
            describe: 'Set this option in order to terminate immediately with an error code if an entry-point fails to be processed.\n' +
                'If `-t`/`--target` is provided then this property is always true and cannot be changed. Otherwise the default is false.\n' +
                'When set to false, ngcc will continue to process entry-points after a failure. In which case it will log an error and resume processing other entry-points.',
            type: 'boolean',
            default: false,
        })
            .option('tsconfig', {
            describe: 'A path to a tsconfig.json file that will be used to configure the Angular compiler and module resolution used by ngcc.\n' +
                'If not provided, ngcc will attempt to read a `tsconfig.json` file from the folder above that given by the `-s` option.\n' +
                'Set to false (via `--no-tsconfig`) if you do not want ngcc to use any `tsconfig.json` file.',
            type: 'string',
        })
            .strict()
            .help()
            .parse(args);
        if ((_a = options.f) === null || _a === void 0 ? void 0 : _a.length) {
            console.error('The formats option (-f/--formats) has been removed. Consider the properties option (-p/--properties) instead.');
            process.exit(1);
        }
        var fs = new file_system_1.NodeJSFileSystem();
        file_system_1.setFileSystem(fs);
        var baseSourcePath = fs.resolve(options.s || './node_modules');
        var propertiesToConsider = options.p;
        var targetEntryPointPath = options.t;
        var compileAllFormats = !options['first-only'];
        var typingsOnly = options['typings-only'];
        var createNewEntryPointFormats = options['create-ivy-entry-points'];
        var logLevel = options.l;
        var enableI18nLegacyMessageIdFormat = options['legacy-message-ids'];
        var invalidateEntryPointManifest = options['invalidate-entry-point-manifest'];
        var errorOnFailedEntryPoint = options['error-on-failed-entry-point'];
        var findEntryPointsFromTsConfigProgram = options['use-program-dependencies'];
        // yargs is not so great at mixed string+boolean types, so we have to test tsconfig against a
        // string "false" to capture the `tsconfig=false` option.
        // And we have to convert the option to a string to handle `no-tsconfig`, which will be `false`.
        var tsConfigPath = "" + options.tsconfig === 'false' ? null : options.tsconfig;
        var logger = logLevel && new logging_1.ConsoleLogger(logging_1.LogLevel[logLevel]);
        return {
            basePath: baseSourcePath,
            propertiesToConsider: propertiesToConsider,
            targetEntryPointPath: targetEntryPointPath,
            typingsOnly: typingsOnly,
            compileAllFormats: compileAllFormats,
            createNewEntryPointFormats: createNewEntryPointFormats,
            logger: logger,
            enableI18nLegacyMessageIdFormat: enableI18nLegacyMessageIdFormat,
            async: options.async,
            invalidateEntryPointManifest: invalidateEntryPointManifest,
            errorOnFailedEntryPoint: errorOnFailedEntryPoint,
            tsConfigPath: tsConfigPath,
            findEntryPointsFromTsConfigProgram: findEntryPointsFromTsConfigProgram,
        };
    }
    exports.parseCommandLineOptions = parseCommandLineOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZF9saW5lX29wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvY29tbWFuZF9saW5lX29wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUNBOzs7Ozs7T0FNRztJQUNILDZCQUErQjtJQUUvQiwyRUFBNEU7SUFDNUUsbUVBQWdFO0lBR2hFLFNBQWdCLHVCQUF1QixDQUFDLElBQWM7O1FBQ3BELElBQU0sT0FBTyxHQUNULEtBQUs7YUFDQSxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1gsS0FBSyxFQUFFLFFBQVE7WUFDZixRQUFRLEVBQ0oscUZBQXFGO1lBQ3pGLE9BQU8sRUFBRSxnQkFBZ0I7WUFDekIsSUFBSSxFQUFFLFFBQVE7U0FDZixDQUFDO2FBQ0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQzthQUMxRSxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1gsS0FBSyxFQUFFLFlBQVk7WUFDbkIsS0FBSyxFQUFFLElBQUk7WUFDWCxRQUFRLEVBQ0osd0ZBQXdGO2dCQUN4RixxRUFBcUU7Z0JBQ3JFLDZFQUE2RTtnQkFDN0Usc0pBQXNKO1lBQzFKLElBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDWCxLQUFLLEVBQUUsUUFBUTtZQUNmLFFBQVEsRUFDSix3R0FBd0c7Z0JBQ3hHLHNGQUFzRjtnQkFDdEYsZ0VBQWdFO1lBQ3BFLElBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQzthQUNELE1BQU0sQ0FBQywwQkFBMEIsRUFBRTtZQUNsQyxJQUFJLEVBQUUsU0FBUztZQUNmLFFBQVEsRUFDSixvSkFBb0o7Z0JBQ3BKLHFE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Q3RFLElBQU0sNEJBQTRCLEdBQUcsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDaEYsSUFBTSx1QkFBdUIsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUN2RSxJQUFNLGtDQUFrQyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQy9FLDZGQUE2RjtRQUM3Rix5REFBeUQ7UUFDekQsZ0dBQWdHO1FBQ2hHLElBQU0sWUFBWSxHQUFHLEtBQUcsT0FBTyxDQUFDLFFBQVUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUVqRixJQUFNLE1BQU0sR0FBRyxRQUFRLElBQUksSUFBSSx1QkFBYSxDQUFDLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVqRSxPQUFPO1lBQ0wsUUFBUSxFQUFFLGNBQWM7WUFDeEIsb0JBQW9CLHNCQUFBO1lBQ3BCLG9CQUFvQixzQkFBQTtZQUNwQixXQUFXLGFBQUE7WUFDWCxpQkFBaUIsbUJBQUE7WUFDakIsMEJBQTBCLDRCQUFBO1lBQzFCLE1BQU0sUUFBQTtZQUNOLCtCQUErQixpQ0FBQTtZQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsNEJBQTRCLDhCQUFBO1lBQzVCLHVCQUF1Qix5QkFBQTtZQUN2QixZQUFZLGNBQUE7WUFDWixrQ0FBa0Msb0NBQUE7U0FDbkMsQ0FBQztJQUNKLENBQUM7SUFsSkQsMERBa0pDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7c2V0RmlsZVN5c3RlbSwgTm9kZUpTRmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Q29uc29sZUxvZ2dlciwgTG9nTGV2ZWx9IGZyb20gJy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7TmdjY09wdGlvbnN9IGZyb20gJy4vbmdjY19vcHRpb25zJztcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29tbWFuZExpbmVPcHRpb25zKGFyZ3M6IHN0cmluZ1tdKTogTmdjY09wdGlvbnMge1xuICBjb25zdCBvcHRpb25zID1cbiAgICAgIHlhcmdzXG4gICAgICAgICAgLm9wdGlvbigncycsIHtcbiAgICAgICAgICAgIGFsaWFzOiAnc291cmNlJyxcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdBIHBhdGggKHJlbGF0aXZlIHRvIHRoZSB3b3JraW5nIGRpcmVjdG9yeSkgb2YgdGhlIGBub2RlX21vZHVsZXNgIGZvbGRlciB0byBwcm9jZXNzLicsXG4gICAgICAgICAgICBkZWZhdWx0OiAnLi9ub2RlX21vZHVsZXMnLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCdmJywge2FsaWFzOiAnZm9ybWF0cycsIGhpZGRlbjrCoHRydWUsIGFycmF5OiB0cnVlLCB0eXBlOiAnc3RyaW5nJ30pXG4gICAgICAgICAgLm9wdGlvbigncCcsIHtcbiAgICAgICAgICAgIGFsaWFzOiAncHJvcGVydGllcycsXG4gICAgICAgICAgICBhcnJheTogdHJ1ZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdBbiBhcnJheSBvZiBuYW1lcyBvZiBwcm9wZXJ0aWVzIGluIHBhY2thZ2UuanNvbiB0byBjb21waWxlIChlLmcuIGBtb2R1bGVgIG9yIGBtYWluYClcXG4nICtcbiAgICAgICAgICAgICAgICAnRWFjaCBvZiB0aGVzZSBwcm9wZXJ0aWVzIHNob3VsZCBob2xkIHRoZSBwYXRoIHRvIGEgYnVuZGxlLWZvcm1hdC5cXG4nICtcbiAgICAgICAgICAgICAgICAnSWYgcHJvdmlkZWQsIG9ubHkgdGhlIHNwZWNpZmllZCBwcm9wZXJ0aWVzIGFyZSBjb25zaWRlcmVkIGZvciBwcm9jZXNzaW5nLlxcbicgK1xuICAgICAgICAgICAgICAgICdJZiBub3QgcHJvdmlkZWQsIGFsbCB0aGUgc3VwcG9ydGVkIGZvcm1hdCBwcm9wZXJ0aWVzIChlLmcuIGZlc20yMDE1LCBmZXNtNSwgZXMyMDE1LCBlc20yMDE1LCBlc201LCBtYWluLCBtb2R1bGUpIGluIHRoZSBwYWNrYWdlLmpzb24gYXJlIGNvbnNpZGVyZWQuJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbigndCcsIHtcbiAgICAgICAgICAgIGFsaWFzOiAndGFyZ2V0JyxcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdBIHJlbGF0aXZlIHBhdGggKGZyb20gdGhlIGBzb3VyY2VgIHBhdGgpIHRvIGEgc2luZ2xlIGVudHJ5LXBvaW50IHRvIHByb2Nlc3MgKHBsdXMgaXRzIGRlcGVuZGVuY2llcykuXFxuJyArXG4gICAgICAgICAgICAgICAgJ0lmIHRoaXMgcHJvcGVydHkgaXMgcHJvdmlkZWQgdGhlbiBgZXJyb3Itb24tZmFpbGVkLWVudHJ5LXBvaW50YCBpcyBmb3JjZWQgdG8gdHJ1ZS5cXG4nICtcbiAgICAgICAgICAgICAgICAnVGhpcyBvcHRpb24gb3ZlcnJpZGVzIHRoZSBgLS11c2UtcHJvZ3JhbS1kZXBlbmRlbmNpZXNgIG9wdGlvbi4nLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCd1c2UtcHJvZ3JhbS1kZXBlbmRlbmNpZXMnLCB7XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZXNjcmliZTpcbiAgICAgICAgICAgICAgICAnSWYgdGhpcyBwcm9wZXJ0eSBpcyBwcm92aWRlZCB0aGVuIHRoZSBlbnRyeS1wb2ludHMgdG8gcHJvY2VzcyBhcmUgcGFyc2VkIGZyb20gdGhlIHByb2dyYW0gZGVmaW5lZCBieSB0aGUgbG9hZGVkIHRzY29uZmlnLmpzb24uIFNlZSBgLS10c2NvbmZpZ2AuXFxuJyArXG4gICAgICAgICAgICAgICAgJ1RoaXMgb3B0aW9uIGlzIG92ZXJyaWRkZW4gYnkgdGhlIGAtLXRhcmdldGAgb3B0aW9uLicsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCdmaXJzdC1vbmx5Jywge1xuICAgICAgICAgICAgZGVzY3JpYmU6XG4gICAgICAgICAgICAgICAgJ0lmIHNwZWNpZmllZCB0aGVuIG9ubHkgdGhlIGZpcnN0IG1hdGNoaW5nIHBhY2thZ2UuanNvbiBwcm9wZXJ0eSB3aWxsIGJlIGNvbXBpbGVkLlxcbicgK1xuICAgICAgICAgICAgICAgICdUaGlzIG9wdGlvbiBpcyBvdmVycmlkZGVuIGJ5IGAtLXR5cGluZ3Mtb25seWAuJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vcHRpb24oJ3R5cGluZ3Mtb25seScsIHtcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdJZiBzcGVjaWZpZWQgdGhlbiBvbmx5IHRoZSB0eXBpbmdzIGZpbGVzIGFyZSBwcm9jZXNzZWQsIGFuZCBubyBKUyBzb3VyY2UgZmlsZXMgd2lsbCBiZSBtb2RpZmllZC5cXG4nICtcbiAgICAgICAgICAgICAgICAnU2V0dGluZyB0aGlzIG9wdGlvbiB3aWxsIGZvcmNlIGAtLWZpcnN0LW9ubHlgIHRvIGJlIHNldCwgc2luY2Ugb25seSBvbmUgZm9ybWF0IGlzIG5lZWRlZCB0byBwcm9jZXNzIHRoZSB0eXBpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vcHRpb24oJ2NyZWF0ZS1pdnktZW50cnktcG9pbnRzJywge1xuICAgICAgICAgICAgZGVzY3JpYmU6XG4gICAgICAgICAgICAgICAgJ0lmIHNwZWNpZmllZCB0aGVuIG5ldyBgKl9pdnlfbmdjY2AgZW50cnktcG9pbnRzIHdpbGwgYmUgYWRkZWQgdG8gcGFja2FnZS5qc29uIHJhdGhlciB0aGFuIG1vZGlmeWluZyB0aGUgb25lcyBpbi1wbGFjZS5cXG4nICtcbiAgICAgICAgICAgICAgICAnRm9yIHRoaXMgdG8gd29yayB5b3UgbmVlZCB0byBoYXZlIGN1c3RvbSByZXNvbHV0aW9uIHNldCB1cCAoZS5nLiBpbiB3ZWJwYWNrKSB0byBsb29rIGZvciB0aGVzZSBuZXcgZW50cnktcG9pbnRzLlxcbicgK1xuICAgICAgICAgICAgICAgICdUaGUgQW5ndWxhciBDTEkgZG9lcyB0aGlzIGFscmVhZHksIHNvIGl0IGlzIHNhZmUgdG8gdXNlIHRoaXMgb3B0aW9uIGlmIHRoZSBwcm9qZWN0IGlzIGJlaW5nIGJ1aWx0IHZpYSB0aGUgQ0xJLicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCdsZWdhY3ktbWVzc2FnZS1pZHMnLCB7XG4gICAgICAgICAgICBkZXNjcmliZTogJ1JlbmRlciBgJGxvY2FsaXplYCBtZXNzYWdlcyB3aXRoIGxlZ2FjeSBmb3JtYXQgaWRzLlxcbicgK1xuICAgICAgICAgICAgICAgICdUaGUgZGVmYXVsdCB2YWx1ZSBpcyBgdHJ1ZWAuIE9ubHkgc2V0IHRoaXMgdG8gYGZhbHNlYCBpZiB5b3UgZG8gbm90IHdhbnQgbGVnYWN5IG1lc3NhZ2UgaWRzIHRvXFxuJyArXG4gICAgICAgICAgICAgICAgJ2JlIHJlbmRlcmVkLiBGb3IgZXhhbXBsZSwgaWYgeW91IGFyZSBub3QgdXNpbmcgbGVnYWN5IG1lc3NhZ2UgaWRzIGluIHlvdXIgdHJhbnNsYXRpb24gZmlsZXNcXG4nICtcbiAgICAgICAgICAgICAgICAnQU5EIGFyZSBub3QgZG9pbmcgY29tcGlsZS10aW1lIGlubGluaW5nIG9mIHRyYW5zbGF0aW9ucywgaW4gd2hpY2ggY2FzZSB0aGUgZXh0cmEgbWVzc2FnZSBpZHNcXG4nICtcbiAgICAgICAgICAgICAgICAnd291bGQgYWRkIHVud2FudGVkIHNpemUgdG8gdGhlIGZpbmFsIHNvdXJjZSBidW5kbGUuXFxuJyArXG4gICAgICAgICAgICAgICAgJ0l0IGlzIHNhZmUgdG8gbGVhdmUgdGhpcyBzZXQgdG8gdHJ1ZSBpZiB5b3UgYXJlIGRvaW5nIGNvbXBpbGUtdGltZSBpbmxpbmluZyBiZWNhdXNlIHRoZSBleHRyYVxcbicgK1xuICAgICAgICAgICAgICAgICdsZWdhY3kgbWVzc2FnZSBpZHMgd2lsbCBhbGwgYmUgc3RyaXBwZWQgZHVyaW5nIHRyYW5zbGF0aW9uLicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbignYXN5bmMnLCB7XG4gICAgICAgICAgICBkZXNjcmliZTpcbiAgICAgICAgICAgICAgICAnV2hldGhlciB0byBjb21waWxlIGFzeW5jaHJvbm91c2x5LiBUaGlzIGlzIGVuYWJsZWQgYnkgZGVmYXVsdCBhcyBpdCBhbGxvd3MgY29tcGlsYXRpb25zIHRvIGJlIHBhcmFsbGVsaXplZC5cXG4nICtcbiAgICAgICAgICAgICAgICAnRGlzYWJsaW5nIGFzeW5jaHJvbm91cyBjb21waWxhdGlvbiBtYXkgYmUgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCdsJywge1xuICAgICAgICAgICAgYWxpYXM6ICdsb2dsZXZlbCcsXG4gICAgICAgICAgICBkZXNjcmliZTogJ1RoZSBsb3dlc3Qgc2V2ZXJpdHkgbG9nZ2luZyBtZXNzYWdlIHRoYXQgc2hvdWxkIGJlIG91dHB1dC4nLFxuICAgICAgICAgICAgY2hvaWNlczogWydkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbignaW52YWxpZGF0ZS1lbnRyeS1wb2ludC1tYW5pZmVzdCcsIHtcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdJZiB0aGlzIGlzIHNldCB0aGVuIG5nY2Mgd2lsbCBub3QgcmVhZCBhbiBlbnRyeS1wb2ludCBtYW5pZmVzdCBmaWxlIGZyb20gZGlzay5cXG4nICtcbiAgICAgICAgICAgICAgICAnSW5zdGVhZCBpdCB3aWxsIHdhbGsgdGhlIGRpcmVjdG9yeSB0cmVlIGFzIG5vcm1hbCBsb29raW5nIGZvciBlbnRyeS1wb2ludHMsIGFuZCB0aGVuIHdyaXRlIGEgbmV3IG1hbmlmZXN0IGZpbGUuJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbignZXJyb3Itb24tZmFpbGVkLWVudHJ5LXBvaW50Jywge1xuICAgICAgICAgICAgZGVzY3JpYmU6XG4gICAgICAgICAgICAgICAgJ1NldCB0aGlzIG9wdGlvbiBpbiBvcmRlciB0byB0ZXJtaW5hdGUgaW1tZWRpYXRlbHkgd2l0aCBhbiBlcnJvciBjb2RlIGlmIGFuIGVudHJ5LXBvaW50IGZhaWxzIHRvIGJlIHByb2Nlc3NlZC5cXG4nICtcbiAgICAgICAgICAgICAgICAnSWYgYC10YC9gLS10YXJnZXRgIGlzIHByb3ZpZGVkIHRoZW4gdGhpcyBwcm9wZXJ0eSBpcyBhbHdheXMgdHJ1ZSBhbmQgY2Fubm90IGJlIGNoYW5nZWQuIE90aGVyd2lzZSB0aGUgZGVmYXVsdCBpcyBmYWxzZS5cXG4nICtcbiAgICAgICAgICAgICAgICAnV2hlbiBzZXQgdG8gZmFsc2UsIG5nY2Mgd2lsbCBjb250aW51ZSB0byBwcm9jZXNzIGVudHJ5LXBvaW50cyBhZnRlciBhIGZhaWx1cmUuIEluIHdoaWNoIGNhc2UgaXQgd2lsbCBsb2cgYW4gZXJyb3IgYW5kIHJlc3VtZSBwcm9jZXNzaW5nIG90aGVyIGVudHJ5LXBvaW50cy4nLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCd0c2NvbmZpZycsIHtcbiAgICAgICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICAgICAgICdBIHBhdGggdG8gYSB0c2NvbmZpZy5qc29uIGZpbGUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gY29uZmlndXJlIHRoZSBBbmd1bGFyIGNvbXBpbGVyIGFuZCBtb2R1bGUgcmVzb2x1dGlvbiB1c2VkIGJ5IG5nY2MuXFxuJyArXG4gICAgICAgICAgICAgICAgJ0lmIG5vdCBwcm92aWRlZCwgbmdjYyB3aWxsIGF0dGVtcHQgdG8gcmVhZCBhIGB0c2NvbmZpZy5qc29uYCBmaWxlIGZyb20gdGhlIGZvbGRlciBhYm92ZSB0aGF0IGdpdmVuIGJ5IHRoZSBgLXNgIG9wdGlvbi5cXG4nICtcbiAgICAgICAgICAgICAgICAnU2V0IHRvIGZhbHNlICh2aWEgYC0tbm8tdHNjb25maWdgKSBpZiB5b3UgZG8gbm90IHdhbnQgbmdjYyB0byB1c2UgYW55IGB0c2NvbmZpZy5qc29uYCBmaWxlLicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5zdHJpY3QoKVxuICAgICAgICAgIC5oZWxwKClcbiAgICAgICAgICAucGFyc2UoYXJncyk7XG5cbiAgaWYgKG9wdGlvbnMuZj8ubGVuZ3RoKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgJ1RoZSBmb3JtYXRzIG9wdGlvbiAoLWYvLS1mb3JtYXRzKSBoYXMgYmVlbiByZW1vdmVkLiBDb25zaWRlciB0aGUgcHJvcGVydGllcyBvcHRpb24gKC1wLy0tcHJvcGVydGllcykgaW5zdGVhZC4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBmcyA9IG5ldyBOb2RlSlNGaWxlU3lzdGVtKCk7XG4gIHNldEZpbGVTeXN0ZW0oZnMpO1xuXG4gIGNvbnN0IGJhc2VTb3VyY2VQYXRoID0gZnMucmVzb2x2ZShvcHRpb25zLnMgfHwgJy4vbm9kZV9tb2R1bGVzJyk7XG4gIGNvbnN0IHByb3BlcnRpZXNUb0NvbnNpZGVyID0gb3B0aW9ucy5wO1xuICBjb25zdCB0YXJnZXRFbnRyeVBvaW50UGF0aCA9IG9wdGlvbnMudDtcbiAgY29uc3QgY29tcGlsZUFsbEZvcm1hdHMgPSAhb3B0aW9uc1snZmlyc3Qtb25seSddO1xuICBjb25zdCB0eXBpbmdzT25seSA9IG9wdGlvbnNbJ3R5cGluZ3Mtb25seSddO1xuICBjb25zdCBjcmVhdGVOZXdFbnRyeVBvaW50Rm9ybWF0cyA9IG9wdGlvbnNbJ2NyZWF0ZS1pdnktZW50cnktcG9pbnRzJ107XG4gIGNvbnN0IGxvZ0xldmVsID0gb3B0aW9ucy5sIGFzIGtleW9mIHR5cGVvZiBMb2dMZXZlbCB8IHVuZGVmaW5lZDtcbiAgY29uc3QgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCA9IG9wdGlvbnNbJ2xlZ2FjeS1tZXNzYWdlLWlkcyddO1xuICBjb25zdCBpbnZhbGlkYXRlRW50cnlQb2ludE1hbmlmZXN0ID0gb3B0aW9uc1snaW52YWxpZGF0ZS1lbnRyeS1wb2ludC1tYW5pZmVzdCddO1xuICBjb25zdCBlcnJvck9uRmFpbGVkRW50cnlQb2ludCA9IG9wdGlvbnNbJ2Vycm9yLW9uLWZhaWxlZC1lbnRyeS1wb2ludCddO1xuICBjb25zdCBmaW5kRW50cnlQb2ludHNGcm9tVHNDb25maWdQcm9ncmFtID0gb3B0aW9uc1sndXNlLXByb2dyYW0tZGVwZW5kZW5jaWVzJ107XG4gIC8vIHlhcmdzIGlzIG5vdCBzbyBncmVhdCBhdCBtaXhlZCBzdHJpbmcrYm9vbGVhbiB0eXBlcywgc28gd2UgaGF2ZSB0byB0ZXN0IHRzY29uZmlnIGFnYWluc3QgYVxuICAvLyBzdHJpbmcgXCJmYWxzZVwiIHRvIGNhcHR1cmUgdGhlIGB0c2NvbmZpZz1mYWxzZWAgb3B0aW9uLlxuICAvLyBBbmQgd2UgaGF2ZSB0byBjb252ZXJ0IHRoZSBvcHRpb24gdG8gYSBzdHJpbmcgdG8gaGFuZGxlIGBuby10c2NvbmZpZ2AsIHdoaWNoIHdpbGwgYmUgYGZhbHNlYC5cbiAgY29uc3QgdHNDb25maWdQYXRoID0gYCR7b3B0aW9ucy50c2NvbmZpZ31gID09PSAnZmFsc2UnID8gbnVsbCA6IG9wdGlvbnMudHNjb25maWc7XG5cbiAgY29uc3QgbG9nZ2VyID0gbG9nTGV2ZWwgJiYgbmV3IENvbnNvbGVMb2dnZXIoTG9nTGV2ZWxbbG9nTGV2ZWxdKTtcblxuICByZXR1cm4ge1xuICAgIGJhc2VQYXRoOiBiYXNlU291cmNlUGF0aCxcbiAgICBwcm9wZXJ0aWVzVG9Db25zaWRlcixcbiAgICB0YXJnZXRFbnRyeVBvaW50UGF0aCxcbiAgICB0eXBpbmdzT25seSxcbiAgICBjb21waWxlQWxsRm9ybWF0cyxcbiAgICBjcmVhdGVOZXdFbnRyeVBvaW50Rm9ybWF0cyxcbiAgICBsb2dnZXIsXG4gICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCxcbiAgICBhc3luYzogb3B0aW9ucy5hc3luYyxcbiAgICBpbnZhbGlkYXRlRW50cnlQb2ludE1hbmlmZXN0LFxuICAgIGVycm9yT25GYWlsZWRFbnRyeVBvaW50LFxuICAgIHRzQ29uZmlnUGF0aCxcbiAgICBmaW5kRW50cnlQb2ludHNGcm9tVHNDb25maWdQcm9ncmFtLFxuICB9O1xufVxuIl19
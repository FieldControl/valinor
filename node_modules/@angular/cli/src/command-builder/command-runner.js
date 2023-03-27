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
exports.runCommand = void 0;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const cli_1 = require("../commands/add/cli");
const cli_2 = require("../commands/analytics/cli");
const cli_3 = require("../commands/build/cli");
const cli_4 = require("../commands/cache/cli");
const cli_5 = require("../commands/completion/cli");
const cli_6 = require("../commands/config/cli");
const cli_7 = require("../commands/deploy/cli");
const cli_8 = require("../commands/doc/cli");
const cli_9 = require("../commands/e2e/cli");
const cli_10 = require("../commands/extract-i18n/cli");
const cli_11 = require("../commands/generate/cli");
const cli_12 = require("../commands/lint/cli");
const cli_13 = require("../commands/make-this-awesome/cli");
const cli_14 = require("../commands/new/cli");
const cli_15 = require("../commands/run/cli");
const cli_16 = require("../commands/serve/cli");
const cli_17 = require("../commands/test/cli");
const cli_18 = require("../commands/update/cli");
const cli_19 = require("../commands/version/cli");
const color_1 = require("../utilities/color");
const config_1 = require("../utilities/config");
const error_1 = require("../utilities/error");
const package_manager_1 = require("../utilities/package-manager");
const command_module_1 = require("./command-module");
const command_1 = require("./utilities/command");
const json_help_1 = require("./utilities/json-help");
const normalize_options_middleware_1 = require("./utilities/normalize-options-middleware");
const COMMANDS = [
    cli_19.VersionCommandModule,
    cli_8.DocCommandModule,
    cli_13.AwesomeCommandModule,
    cli_6.ConfigCommandModule,
    cli_2.AnalyticsCommandModule,
    cli_1.AddCommandModule,
    cli_11.GenerateCommandModule,
    cli_3.BuildCommandModule,
    cli_9.E2eCommandModule,
    cli_17.TestCommandModule,
    cli_16.ServeCommandModule,
    cli_10.ExtractI18nCommandModule,
    cli_7.DeployCommandModule,
    cli_12.LintCommandModule,
    cli_14.NewCommandModule,
    cli_18.UpdateCommandModule,
    cli_15.RunCommandModule,
    cli_4.CacheCommandModule,
    cli_5.CompletionCommandModule,
].sort(); // Will be sorted by class name.
const yargsParser = helpers_1.Parser;
async function runCommand(args, logger) {
    var _a, _b;
    const { $0, _, help = false, jsonHelp = false, getYargsCompletions = false, ...rest } = yargsParser(args, {
        boolean: ['help', 'json-help', 'get-yargs-completions'],
        alias: { 'collection': 'c' },
    });
    // When `getYargsCompletions` is true the scriptName 'ng' at index 0 is not removed.
    const positional = getYargsCompletions ? _.slice(1) : _;
    let workspace;
    let globalConfiguration;
    try {
        [workspace, globalConfiguration] = await Promise.all([
            (0, config_1.getWorkspace)('local'),
            (0, config_1.getWorkspace)('global'),
        ]);
    }
    catch (e) {
        (0, error_1.assertIsError)(e);
        logger.fatal(e.message);
        return 1;
    }
    const root = (_a = workspace === null || workspace === void 0 ? void 0 : workspace.basePath) !== null && _a !== void 0 ? _a : process.cwd();
    const context = {
        globalConfiguration,
        workspace,
        logger,
        currentDirectory: process.cwd(),
        root,
        packageManager: new package_manager_1.PackageManagerUtils({ globalConfiguration, workspace, root }),
        args: {
            positional: positional.map((v) => v.toString()),
            options: {
                help,
                jsonHelp,
                getYargsCompletions,
                ...rest,
            },
        },
    };
    let localYargs = (0, yargs_1.default)(args);
    for (const CommandModule of COMMANDS) {
        localYargs = (0, command_1.addCommandModuleToYargs)(localYargs, CommandModule, context);
    }
    if (jsonHelp) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usageInstance = localYargs.getInternalMethods().getUsageInstance();
        usageInstance.help = () => (0, json_help_1.jsonHelpUsage)();
    }
    await localYargs
        .scriptName('ng')
        // https://github.com/yargs/yargs/blob/main/docs/advanced.md#customizing-yargs-parser
        .parserConfiguration({
        'populate--': true,
        'unknown-options-as-args': false,
        'dot-notation': false,
        'boolean-negation': true,
        'strip-aliased': true,
        'strip-dashed': true,
        'camel-case-expansion': false,
    })
        .option('json-help', {
        describe: 'Show help in JSON format.',
        implies: ['help'],
        hidden: true,
        type: 'boolean',
    })
        .help('help', 'Shows a help message for this command in the console.')
        // A complete list of strings can be found: https://github.com/yargs/yargs/blob/main/locales/en.json
        .updateStrings({
        'Commands:': color_1.colors.cyan('Commands:'),
        'Options:': color_1.colors.cyan('Options:'),
        'Positionals:': color_1.colors.cyan('Arguments:'),
        'deprecated': color_1.colors.yellow('deprecated'),
        'deprecated: %s': color_1.colors.yellow('deprecated:') + ' %s',
        'Did you mean %s?': 'Unknown command. Did you mean %s?',
    })
        .epilogue('For more information, see https://angular.io/cli/.\n')
        .demandCommand(1, command_1.demandCommandFailureMessage)
        .recommendCommands()
        .middleware(normalize_options_middleware_1.normalizeOptionsMiddleware)
        .version(false)
        .showHelpOnFail(false)
        .strict()
        .fail((msg, err) => {
        throw msg
            ? // Validation failed example: `Unknown argument:`
                new command_module_1.CommandModuleError(msg)
            : // Unknown exception, re-throw.
                err;
    })
        .wrap(yargs_1.default.terminalWidth())
        .parseAsync();
    return (_b = process.exitCode) !== null && _b !== void 0 ? _b : 0;
}
exports.runCommand = runCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1ydW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyL2NsaS9zcmMvY29tbWFuZC1idWlsZGVyL2NvbW1hbmQtcnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUdILGtEQUEwQjtBQUMxQiwyQ0FBdUM7QUFDdkMsNkNBQXVEO0FBQ3ZELG1EQUFtRTtBQUNuRSwrQ0FBMkQ7QUFDM0QsK0NBQTJEO0FBQzNELG9EQUFxRTtBQUNyRSxnREFBNkQ7QUFDN0QsZ0RBQTZEO0FBQzdELDZDQUF1RDtBQUN2RCw2Q0FBdUQ7QUFDdkQsdURBQXdFO0FBQ3hFLG1EQUFpRTtBQUNqRSwrQ0FBeUQ7QUFDekQsNERBQXlFO0FBQ3pFLDhDQUF1RDtBQUN2RCw4Q0FBdUQ7QUFDdkQsZ0RBQTJEO0FBQzNELCtDQUF5RDtBQUN6RCxpREFBNkQ7QUFDN0Qsa0RBQStEO0FBQy9ELDhDQUE0QztBQUM1QyxnREFBcUU7QUFDckUsOENBQW1EO0FBQ25ELGtFQUFtRTtBQUNuRSxxREFBc0U7QUFDdEUsaURBQTJGO0FBQzNGLHFEQUFzRDtBQUN0RCwyRkFBc0Y7QUFFdEYsTUFBTSxRQUFRLEdBQUc7SUFDZiwyQkFBb0I7SUFDcEIsc0JBQWdCO0lBQ2hCLDJCQUFvQjtJQUNwQix5QkFBbUI7SUFDbkIsNEJBQXNCO0lBQ3RCLHNCQUFnQjtJQUNoQiw0QkFBcUI7SUFDckIsd0JBQWtCO0lBQ2xCLHNCQUFnQjtJQUNoQix3QkFBaUI7SUFDakIseUJBQWtCO0lBQ2xCLCtCQUF3QjtJQUN4Qix5QkFBbUI7SUFDbkIsd0JBQWlCO0lBQ2pCLHVCQUFnQjtJQUNoQiwwQkFBbUI7SUFDbkIsdUJBQWdCO0lBQ2hCLHdCQUFrQjtJQUNsQiw2QkFBdUI7Q0FDeEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGdDQUFnQztBQUUxQyxNQUFNLFdBQVcsR0FBRyxn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QztBQUMvQixDQUFDO0FBMUdELGdDQTBHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBsb2dnaW5nIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IFBhcnNlciB9IGZyb20gJ3lhcmdzL2hlbHBlcnMnO1xuaW1wb3J0IHsgQWRkQ29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL2FkZC9jbGknO1xuaW1wb3J0IHsgQW5hbHl0aWNzQ29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL2FuYWx5dGljcy9jbGknO1xuaW1wb3J0IHsgQnVpbGRDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vY29tbWFuZHMvYnVpbGQvY2xpJztcbmltcG9ydCB7IENhY2hlQ29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL2NhY2hlL2NsaSc7XG5pbXBvcnQgeyBDb21wbGV0aW9uQ29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL2NvbXBsZXRpb24vY2xpJztcbmltcG9ydCB7IENvbmZpZ0NvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi9jb21tYW5kcy9jb25maWcvY2xpJztcbmltcG9ydCB7IERlcGxveUNvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi9jb21tYW5kcy9kZXBsb3kvY2xpJztcbmltcG9ydCB7IERvY0NvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi9jb21tYW5kcy9kb2MvY2xpJztcbmltcG9ydCB7IEUyZUNvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi9jb21tYW5kcy9lMmUvY2xpJztcbmltcG9ydCB7IEV4dHJhY3RJMThuQ29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL2V4dHJhY3QtaTE4bi9jbGknO1xuaW1wb3J0IHsgR2VuZXJhdGVDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vY29tbWFuZHMvZ2VuZXJhdGUvY2xpJztcbmltcG9ydCB7IExpbnRDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vY29tbWFuZHMvbGludC9jbGknO1xuaW1wb3J0IHsgQXdlc29tZUNvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi9jb21tYW5kcy9tYWtlLXRoaXMtYXdlc29tZS9jbGknO1xuaW1wb3J0IHsgTmV3Q29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL25ldy9jbGknO1xuaW1wb3J0IHsgUnVuQ29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL3J1bi9jbGknO1xuaW1wb3J0IHsgU2VydmVDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vY29tbWFuZHMvc2VydmUvY2xpJztcbmltcG9ydCB7IFRlc3RDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vY29tbWFuZHMvdGVzdC9jbGknO1xuaW1wb3J0IHsgVXBkYXRlQ29tbWFuZE1vZHVsZSB9IGZyb20gJy4uL2NvbW1hbmRzL3VwZGF0ZS9jbGknO1xuaW1wb3J0IHsgVmVyc2lvbkNvbW1hbmRNb2R1bGUgfSBmcm9tICcuLi9jb21tYW5kcy92ZXJzaW9uL2NsaSc7XG5pbXBvcnQgeyBjb2xvcnMgfSBmcm9tICcuLi91dGlsaXRpZXMvY29sb3InO1xuaW1wb3J0IHsgQW5ndWxhcldvcmtzcGFjZSwgZ2V0V29ya3NwYWNlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2NvbmZpZyc7XG5pbXBvcnQgeyBhc3NlcnRJc0Vycm9yIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Vycm9yJztcbmltcG9ydCB7IFBhY2thZ2VNYW5hZ2VyVXRpbHMgfSBmcm9tICcuLi91dGlsaXRpZXMvcGFja2FnZS1tYW5hZ2VyJztcbmltcG9ydCB7IENvbW1hbmRDb250ZXh0LCBDb21tYW5kTW9kdWxlRXJyb3IgfSBmcm9tICcuL2NvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7IGFkZENvbW1hbmRNb2R1bGVUb1lhcmdzLCBkZW1hbmRDb21tYW5kRmFpbHVyZU1lc3NhZ2UgfSBmcm9tICcuL3V0aWxpdGllcy9jb21tYW5kJztcbmltcG9ydCB7IGpzb25IZWxwVXNhZ2UgfSBmcm9tICcuL3V0aWxpdGllcy9qc29uLWhlbHAnO1xuaW1wb3J0IHsgbm9ybWFsaXplT3B0aW9uc01pZGRsZXdhcmUgfSBmcm9tICcuL3V0aWxpdGllcy9ub3JtYWxpemUtb3B0aW9ucy1taWRkbGV3YXJlJztcblxuY29uc3QgQ09NTUFORFMgPSBbXG4gIFZlcnNpb25Db21tYW5kTW9kdWxlLFxuICBEb2NDb21tYW5kTW9kdWxlLFxuICBBd2Vzb21lQ29tbWFuZE1vZHVsZSxcbiAgQ29uZmlnQ29tbWFuZE1vZHVsZSxcbiAgQW5hbHl0aWNzQ29tbWFuZE1vZHVsZSxcbiAgQWRkQ29tbWFuZE1vZHVsZSxcbiAgR2VuZXJhdGVDb21tYW5kTW9kdWxlLFxuICBCdWlsZENvbW1hbmRNb2R1bGUsXG4gIEUyZUNvbW1hbmRNb2R1bGUsXG4gIFRlc3RDb21tYW5kTW9kdWxlLFxuICBTZXJ2ZUNvbW1hbmRNb2R1bGUsXG4gIEV4dHJhY3RJMThuQ29tbWFuZE1vZHVsZSxcbiAgRGVwbG95Q29tbWFuZE1vZHVsZSxcbiAgTGludENvbW1hbmRNb2R1bGUsXG4gIE5ld0NvbW1hbmRNb2R1bGUsXG4gIFVwZGF0ZUNvbW1hbmRNb2R1bGUsXG4gIFJ1bkNvbW1hbmRNb2R1bGUsXG4gIENhY2hlQ29tbWFuZE1vZHVsZSxcbiAgQ29tcGxldGlvbkNvbW1hbmRNb2R1bGUsXG5dLnNvcnQoKTsgLy8gV2lsbCBiZSBzb3J0ZWQgYnkgY2xhc3MgbmFtZS5cblxuY29uc3QgeWFyZ3NQYXJzZXIgPSBQYXJzZXIgYXMgdW5rbm93biBhcyB0eXBlb2YgUGFyc2VyLmRlZmF1bHQ7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Db21tYW5kKGFyZ3M6IHN0cmluZ1tdLCBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgY29uc3Qge1xuICAgICQwLFxuICAgIF8sXG4gICAgaGVscCA9IGZhbHNlLFxuICAgIGpzb25IZWxwID0gZmFsc2UsXG4gICAgZ2V0WWFyZ3NDb21wbGV0aW9ucyA9IGZhbHNlLFxuICAgIC4uLnJlc3RcbiAgfSA9IHlhcmdzUGFyc2VyKGFyZ3MsIHtcbiAgICBib29sZWFuOiBbJ2hlbHAnLCAnanNvbi1oZWxwJywgJ2dldC15YXJncy1jb21wbGV0aW9ucyddLFxuICAgIGFsaWFzOiB7ICdjb2xsZWN0aW9uJzogJ2MnIH0sXG4gIH0pO1xuXG4gIC8vIFdoZW4gYGdldFlhcmdzQ29tcGxldGlvbnNgIGlzIHRydWUgdGhlIHNjcmlwdE5hbWUgJ25nJyBhdCBpbmRleCAwIGlzIG5vdCByZW1vdmVkLlxuICBjb25zdCBwb3NpdGlvbmFsID0gZ2V0WWFyZ3NDb21wbGV0aW9ucyA/IF8uc2xpY2UoMSkgOiBfO1xuXG4gIGxldCB3b3Jrc3BhY2U6IEFuZ3VsYXJXb3Jrc3BhY2UgfCB1bmRlZmluZWQ7XG4gIGxldCBnbG9iYWxDb25maWd1cmF0aW9uOiBBbmd1bGFyV29ya3NwYWNlO1xuICB0cnkge1xuICAgIFt3b3Jrc3BhY2UsIGdsb2JhbENvbmZpZ3VyYXRpb25dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgZ2V0V29ya3NwYWNlKCdsb2NhbCcpLFxuICAgICAgZ2V0V29ya3NwYWNlKCdnbG9iYWwnKSxcbiAgICBdKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGFzc2VydElzRXJyb3IoZSk7XG4gICAgbG9nZ2VyLmZhdGFsKGUubWVzc2FnZSk7XG5cbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IHJvb3QgPSB3b3Jrc3BhY2U/LmJhc2VQYXRoID8/IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IGNvbnRleHQ6IENvbW1hbmRDb250ZXh0ID0ge1xuICAgIGdsb2JhbENvbmZpZ3VyYXRpb24sXG4gICAgd29ya3NwYWNlLFxuICAgIGxvZ2dlcixcbiAgICBjdXJyZW50RGlyZWN0b3J5OiBwcm9jZXNzLmN3ZCgpLFxuICAgIHJvb3QsXG4gICAgcGFja2FnZU1hbmFnZXI6IG5ldyBQYWNrYWdlTWFuYWdlclV0aWxzKHsgZ2xvYmFsQ29uZmlndXJhdGlvbiwgd29ya3NwYWNlLCByb290IH0pLFxuICAgIGFyZ3M6IHtcbiAgICAgIHBvc2l0aW9uYWw6IHBvc2l0aW9uYWwubWFwKCh2KSA9PiB2LnRvU3RyaW5nKCkpLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBoZWxwLFxuICAgICAgICBqc29uSGVscCxcbiAgICAgICAgZ2V0WWFyZ3NDb21wbGV0aW9ucyxcbiAgICAgICAgLi4ucmVzdCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICBsZXQgbG9jYWxZYXJncyA9IHlhcmdzKGFyZ3MpO1xuICBmb3IgKGNvbnN0IENvbW1hbmRNb2R1bGUgb2YgQ09NTUFORFMpIHtcbiAgICBsb2NhbFlhcmdzID0gYWRkQ29tbWFuZE1vZHVsZVRvWWFyZ3MobG9jYWxZYXJncywgQ29tbWFuZE1vZHVsZSwgY29udGV4dCk7XG4gIH1cblxuICBpZiAoanNvbkhlbHApIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0IHVzYWdlSW5zdGFuY2UgPSAobG9jYWxZYXJncyBhcyBhbnkpLmdldEludGVybmFsTWV0aG9kcygpLmdldFVzYWdlSW5zdGFuY2UoKTtcbiAgICB1c2FnZUluc3RhbmNlLmhlbHAgPSAoKSA9PiBqc29uSGVscFVzYWdlKCk7XG4gIH1cblxuICBhd2FpdCBsb2NhbFlhcmdzXG4gICAgLnNjcmlwdE5hbWUoJ25nJylcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20veWFyZ3MveWFyZ3MvYmxvYi9tYWluL2RvY3MvYWR2YW5jZWQubWQjY3VzdG9taXppbmcteWFyZ3MtcGFyc2VyXG4gICAgLnBhcnNlckNvbmZpZ3VyYXRpb24oe1xuICAgICAgJ3BvcHVsYXRlLS0nOiB0cnVlLFxuICAgICAgJ3Vua25vd24tb3B0aW9ucy1hcy1hcmdzJzogZmFsc2UsXG4gICAgICAnZG90LW5vdGF0aW9uJzogZmFsc2UsXG4gICAgICAnYm9vbGVhbi1uZWdhdGlvbic6IHRydWUsXG4gICAgICAnc3RyaXAtYWxpYXNlZCc6IHRydWUsXG4gICAgICAnc3RyaXAtZGFzaGVkJzogdHJ1ZSxcbiAgICAgICdjYW1lbC1jYXNlLWV4cGFuc2lvbic6IGZhbHNlLFxuICAgIH0pXG4gICAgLm9wdGlvbignanNvbi1oZWxwJywge1xuICAgICAgZGVzY3JpYmU6ICdTaG93IGhlbHAgaW4gSlNPTiBmb3JtYXQuJyxcbiAgICAgIGltcGxpZXM6IFsnaGVscCddLFxuICAgICAgaGlkZGVuOiB0cnVlLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIH0pXG4gICAgLmhlbHAoJ2hlbHAnLCAnU2hvd3MgYSBoZWxwIG1lc3NhZ2UgZm9yIHRoaXMgY29tbWFuZCBpbiB0aGUgY29uc29sZS4nKVxuICAgIC8vIEEgY29tcGxldGUgbGlzdCBvZiBzdHJpbmdzIGNhbiBiZSBmb3VuZDogaHR0cHM6Ly9naXRodWIuY29tL3lhcmdzL3lhcmdzL2Jsb2IvbWFpbi9sb2NhbGVzL2VuLmpzb25cbiAgICAudXBkYXRlU3RyaW5ncyh7XG4gICAgICAnQ29tbWFuZHM6JzogY29sb3JzLmN5YW4oJ0NvbW1hbmRzOicpLFxuICAgICAgJ09wdGlvbnM6JzogY29sb3JzLmN5YW4oJ09wdGlvbnM6JyksXG4gICAgICAnUG9zaXRpb25hbHM6JzogY29sb3JzLmN5YW4oJ0FyZ3VtZW50czonKSxcbiAgICAgICdkZXByZWNhdGVkJzogY29sb3JzLnllbGxvdygnZGVwcmVjYXRlZCcpLFxuICAgICAgJ2RlcHJlY2F0ZWQ6ICVzJzogY29sb3JzLnllbGxvdygnZGVwcmVjYXRlZDonKSArICcgJXMnLFxuICAgICAgJ0RpZCB5b3UgbWVhbiAlcz8nOiAnVW5rbm93biBjb21tYW5kLiBEaWQgeW91IG1lYW4gJXM/JyxcbiAgICB9KVxuICAgIC5lcGlsb2d1ZSgnRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vY2xpLy5cXG4nKVxuICAgIC5kZW1hbmRDb21tYW5kKDEsIGRlbWFuZENvbW1hbmRGYWlsdXJlTWVzc2FnZSlcbiAgICAucmVjb21tZW5kQ29tbWFuZHMoKVxuICAgIC5taWRkbGV3YXJlKG5vcm1hbGl6ZU9wdGlvbnNNaWRkbGV3YXJlKVxuICAgIC52ZXJzaW9uKGZhbHNlKVxuICAgIC5zaG93SGVscE9uRmFpbChmYWxzZSlcbiAgICAuc3RyaWN0KClcbiAgICAuZmFpbCgobXNnLCBlcnIpID0+IHtcbiAgICAgIHRocm93IG1zZ1xuICAgICAgICA/IC8vIFZhbGlkYXRpb24gZmFpbGVkIGV4YW1wbGU6IGBVbmtub3duIGFyZ3VtZW50OmBcbiAgICAgICAgICBuZXcgQ29tbWFuZE1vZHVsZUVycm9yKG1zZylcbiAgICAgICAgOiAvLyBVbmtub3duIGV4Y2VwdGlvbiwgcmUtdGhyb3cuXG4gICAgICAgICAgZXJyO1xuICAgIH0pXG4gICAgLndyYXAoeWFyZ3MudGVybWluYWxXaWR0aCgpKVxuICAgIC5wYXJzZUFzeW5jKCk7XG5cbiAgcmV0dXJuIHByb2Nlc3MuZXhpdENvZGUgPz8gMDtcbn1cbiJdfQ==
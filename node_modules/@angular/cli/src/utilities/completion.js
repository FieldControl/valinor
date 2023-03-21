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
exports.hasGlobalCliInstall = exports.initializeAutocomplete = exports.considerSettingUpAutocompletion = void 0;
const core_1 = require("@angular-devkit/core");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const process_1 = require("process");
const color_1 = require("../utilities/color");
const config_1 = require("../utilities/config");
const environment_options_1 = require("../utilities/environment-options");
const tty_1 = require("../utilities/tty");
const error_1 = require("./error");
/**
 * Checks if it is appropriate to prompt the user to setup autocompletion. If not, does nothing. If
 * so prompts and sets up autocompletion for the user. Returns an exit code if the program should
 * terminate, otherwise returns `undefined`.
 * @returns an exit code if the program should terminate, undefined otherwise.
 */
async function considerSettingUpAutocompletion(command, logger) {
    // Check if we should prompt the user to setup autocompletion.
    const completionConfig = await getCompletionConfig();
    if (!(await shouldPromptForAutocompletionSetup(command, completionConfig))) {
        return undefined; // Already set up or prompted previously, nothing to do.
    }
    // Prompt the user and record their response.
    const shouldSetupAutocompletion = await promptForAutocompletion();
    if (!shouldSetupAutocompletion) {
        // User rejected the prompt and doesn't want autocompletion.
        logger.info(`
Ok, you won't be prompted again. Should you change your mind, the following command will set up autocompletion for you:

    ${color_1.colors.yellow(`ng completion`)}
    `.trim());
        // Save configuration to remember that the user was prompted and avoid prompting again.
        await setCompletionConfig({ ...completionConfig, prompted: true });
        return undefined;
    }
    // User accepted the prompt, set up autocompletion.
    let rcFile;
    try {
        rcFile = await initializeAutocomplete();
    }
    catch (err) {
        (0, error_1.assertIsError)(err);
        // Failed to set up autocompeletion, log the error and abort.
        logger.error(err.message);
        return 1;
    }
    // Notify the user autocompletion was set up successfully.
    logger.info(`
Appended \`source <(ng completion script)\` to \`${rcFile}\`. Restart your terminal or run the following to autocomplete \`ng\` commands:

    ${color_1.colors.yellow(`source <(ng completion script)`)}
    `.trim());
    if (!(await hasGlobalCliInstall())) {
        logger.warn('Setup completed successfully, but there does not seem to be a global install of the' +
            ' Angular CLI. For autocompletion to work, the CLI will need to be on your `$PATH`, which' +
            ' is typically done with the `-g` flag in `npm install -g @angular/cli`.' +
            '\n\n' +
            'For more information, see https://angular.io/cli/completion#global-install');
    }
    // Save configuration to remember that the user was prompted.
    await setCompletionConfig({ ...completionConfig, prompted: true });
    return undefined;
}
exports.considerSettingUpAutocompletion = considerSettingUpAutocompletion;
async function getCompletionConfig() {
    var _a;
    const wksp = await (0, config_1.getWorkspace)('global');
    return (_a = wksp === null || wksp === void 0 ? void 0 : wksp.getCli()) === null || _a === void 0 ? void 0 : _a['completion'];
}
async function setCompletionConfig(config) {
    var _a;
    var _b;
    const wksp = await (0, config_1.getWorkspace)('global');
    if (!wksp) {
        throw new Error(`Could not find global workspace`);
    }
    (_a = (_b = wksp.extensions)['cli']) !== null && _a !== void 0 ? _a : (_b['cli'] = {});
    const cli = wksp.extensions['cli'];
    if (!core_1.json.isJsonObject(cli)) {
        throw new Error(`Invalid config found at ${wksp.filePath}. \`extensions.cli\` should be an object.`);
    }
    cli.completion = config;
    await wksp.save();
}
async function shouldPromptForAutocompletionSetup(command, config) {
    // Force whether or not to prompt for autocomplete to give an easy path for e2e testing to skip.
    if (environment_options_1.forceAutocomplete !== undefined) {
        return environment_options_1.forceAutocomplete;
    }
    // Don't prompt on `ng update` or `ng completion`.
    if (command === 'update' || command === 'completion') {
        return false;
    }
    // Non-interactive and continuous integration systems don't care about autocompletion.
    if (!(0, tty_1.isTTY)()) {
        return false;
    }
    // Skip prompt if the user has already been prompted.
    if (config === null || config === void 0 ? void 0 : config.prompted) {
        return false;
    }
    // `$HOME` variable is necessary to find RC files to modify.
    const home = process_1.env['HOME'];
    if (!home) {
        return false;
    }
    // Get possible RC files for the current shell.
    const shell = process_1.env['SHELL'];
    if (!shell) {
        return false;
    }
    const rcFiles = getShellRunCommandCandidates(shell, home);
    if (!rcFiles) {
        return false; // Unknown shell.
    }
    // Don't prompt if the user is missing a global CLI install. Autocompletion won't work after setup
    // anyway and could be annoying for users running one-off commands via `npx` or using `npm start`.
    if ((await hasGlobalCliInstall()) === false) {
        return false;
    }
    // Check each RC file if they already use `ng completion script` in any capacity and don't prompt.
    for (const rcFile of rcFiles) {
        const contents = await fs_1.promises.readFile(rcFile, 'utf-8').catch(() => undefined);
        if (contents === null || contents === void 0 ? void 0 : contents.includes('ng completion script')) {
            return false;
        }
    }
    return true;
}
async function promptForAutocompletion() {
    // Dynamically load `inquirer` so users don't have to pay the cost of parsing and executing it for
    // the 99% of builds that *don't* prompt for autocompletion.
    const { prompt } = await Promise.resolve().then(() => __importStar(require('inquirer')));
    const { autocomplete } = await prompt([
        {
            name: 'autocomplete',
            type: 'confirm',
            message: `
Would you like to enable autocompletion? This will set up your terminal so pressing TAB while typing
Angular CLI commands will show possible options and autocomplete arguments. (Enabling autocompletion
will modify configuration files in your home directory.)
      `
                .split('\n')
                .join(' ')
                .trim(),
            default: true,
        },
    ]);
    return autocomplete;
}
/**
 * Sets up autocompletion for the user's terminal. This attempts to find the configuration file for
 * the current shell (`.bashrc`, `.zshrc`, etc.) and append a command which enables autocompletion
 * for the Angular CLI. Supports only Bash and Zsh. Returns whether or not it was successful.
 * @return The full path of the configuration file modified.
 */
async function initializeAutocomplete() {
    var _a, _b;
    // Get the currently active `$SHELL` and `$HOME` environment variables.
    const shell = process_1.env['SHELL'];
    if (!shell) {
        throw new Error('`$SHELL` environment variable not set. Angular CLI autocompletion only supports Bash or' +
            " Zsh. If you're on Windows, Cmd and Powershell don't support command autocompletion," +
            ' but Git Bash or Windows Subsystem for Linux should work, so please try again in one of' +
            ' those environments.');
    }
    const home = process_1.env['HOME'];
    if (!home) {
        throw new Error('`$HOME` environment variable not set. Setting up autocompletion modifies configuration files' +
            ' in the home directory and must be set.');
    }
    // Get all the files we can add `ng completion` to which apply to the user's `$SHELL`.
    const runCommandCandidates = getShellRunCommandCandidates(shell, home);
    if (!runCommandCandidates) {
        throw new Error(`Unknown \`$SHELL\` environment variable value (${shell}). Angular CLI autocompletion only supports Bash or Zsh.`);
    }
    // Get the first file that already exists or fallback to a new file of the first candidate.
    const candidates = await Promise.allSettled(runCommandCandidates.map((rcFile) => fs_1.promises.access(rcFile).then(() => rcFile)));
    const rcFile = (_b = (_a = candidates.find((result) => result.status === 'fulfilled')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : runCommandCandidates[0];
    // Append Angular autocompletion setup to RC file.
    try {
        await fs_1.promises.appendFile(rcFile, '\n\n# Load Angular CLI autocompletion.\nsource <(ng completion script)\n');
    }
    catch (err) {
        (0, error_1.assertIsError)(err);
        throw new Error(`Failed to append autocompletion setup to \`${rcFile}\`:\n${err.message}`);
    }
    return rcFile;
}
exports.initializeAutocomplete = initializeAutocomplete;
/** Returns an ordered list of possible candidates of RC files used by the given shell. */
function getShellRunCommandCandidates(shell, home) {
    if (shell.toLowerCase().includes('bash')) {
        return ['.bashrc', '.bash_profile', '.profile'].map((file) => path.join(home, file));
    }
    else if (shell.toLowerCase().includes('zsh')) {
        return ['.zshrc', '.zsh_profile', '.profile'].map((file) => path.join(home, file));
    }
    else {
        return undefined;
    }
}
/**
 * Returns whether the user has a global CLI install.
 * Execution from `npx` is *not* considered a global CLI install.
 *
 * This does *not* mean the current execution is from a global CLI install, only that a global
 * install exists on the system.
 */
function hasGlobalCliInstall() {
    // List all binaries with the `ng` name on the user's `$PATH`.
    return new Promise((resolve) => {
        (0, child_process_1.execFile)('which', ['-a', 'ng'], (error, stdout) => {
            if (error) {
                // No instances of `ng` on the user's `$PATH`
                // `which` returns exit code 2 if an invalid option is specified and `-a` doesn't appear to be
                // supported on all systems. Other exit codes mean unknown errors occurred. Can't tell whether
                // CLI is globally installed, so treat this as inconclusive.
                // `which` was killed by a signal and did not exit gracefully. Maybe it hung or something else
                // went very wrong, so treat this as inconclusive.
                resolve(false);
                return;
            }
            // Successfully listed all `ng` binaries on the `$PATH`. Look for at least one line which is a
            // global install. We can't easily identify global installs, but local installs are typically
            // placed in `node_modules/.bin` by NPM / Yarn. `npx` also currently caches files at
            // `~/.npm/_npx/*/node_modules/.bin/`, so the same logic applies.
            const lines = stdout.split('\n').filter((line) => line !== '');
            const hasGlobalInstall = lines.some((line) => {
                // A binary is a local install if it is a direct child of a `node_modules/.bin/` directory.
                const parent = path.parse(path.parse(line).dir);
                const grandparent = path.parse(parent.dir);
                const localInstall = grandparent.base === 'node_modules' && parent.base === '.bin';
                return !localInstall;
            });
            return resolve(hasGlobalInstall);
        });
    });
}
exports.hasGlobalCliInstall = hasGlobalCliInstall;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXIvY2xpL3NyYy91dGlsaXRpZXMvY29tcGxldGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILCtDQUFxRDtBQUNyRCxpREFBeUM7QUFDekMsMkJBQW9DO0FBQ3BDLDJDQUE2QjtBQUM3QixxQ0FBOEI7QUFDOUIsOENBQTRDO0FBQzVDLGdEQUFtRDtBQUNuRCwwRUFBcUU7QUFDckUsMENBQXlDO0FBQ3pDLG1DQUF3QztBQVd4Qzs7Ozs7R0FLRztBQUNJLEtBQUssVUFBVSwrQkFBK0IsQ0FDbkQsT0FBZSxFQUNmLE1BQXNCO0lBRXRCLDhEQUE4RDtJQUM5RCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztJQUNyRCxJQUFJLENBQUMsQ0FBQyxNQUFNLGtDQUFrQyxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUU7UUFDMUUsT0FBTyxTQUFTLENBQUMsQ0FBQyx3REFBd0Q7S0FDM0U7SUFFRCw2Q0FBNkM7SUFDN0MsTUFBTSx5QkFBeUIsR0FBRyxNQUFNLHVCQUF1QixFQUFFLENBQUM7SUFDbEUsSUFBSSxDQUFDLHlCQUF5QixFQUFFO1FBQzlCLDREQUE0RDtRQUM1RCxNQUFNLENBQUMsSUFBSSxDQUNUOzs7TUFHQSxjQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztLQUMvQixDQUFDLElBQUksRUFBRSxDQUNQLENBQUM7UUFFRix1RkFBdUY7UUFDdkYsTUFBTSxtQkFBbUIsQ0FBQyxFQUFFLEdBQUcsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFFbkUsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxtREFBbUQ7SUFDbkQsSUFBSSxNQUFjLENBQUM7SUFD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RTtZQUNoRCxJQUFJLEtBQUssRUFBRTtnQkFDVCw2Q0FBNkM7Z0JBRTdDLDhGQUE4RjtnQkFDOUYsOEZBQThGO2dCQUM5Riw0REFBNEQ7Z0JBRTVELDhGQUE4RjtnQkFDOUYsa0RBQWtEO2dCQUNsRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRWYsT0FBTzthQUNSO1lBRUQsOEZBQThGO1lBQzlGLDZGQUE2RjtZQUM3RixvRkFBb0Y7WUFDcEYsaUVBQWlFO1lBQ2pFLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQzNDLDJGQUEyRjtnQkFDM0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLElBQUksS0FBSyxjQUFjLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7Z0JBRW5GLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBbkNELGtEQW1DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBqc29uLCBsb2dnaW5nIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgZXhlY0ZpbGUgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHByb21pc2VzIGFzIGZzIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGVudiB9IGZyb20gJ3Byb2Nlc3MnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2NvbG9yJztcbmltcG9ydCB7IGdldFdvcmtzcGFjZSB9IGZyb20gJy4uL3V0aWxpdGllcy9jb25maWcnO1xuaW1wb3J0IHsgZm9yY2VBdXRvY29tcGxldGUgfSBmcm9tICcuLi91dGlsaXRpZXMvZW52aXJvbm1lbnQtb3B0aW9ucyc7XG5pbXBvcnQgeyBpc1RUWSB9IGZyb20gJy4uL3V0aWxpdGllcy90dHknO1xuaW1wb3J0IHsgYXNzZXJ0SXNFcnJvciB9IGZyb20gJy4vZXJyb3InO1xuXG4vKiogSW50ZXJmYWNlIGZvciB0aGUgYXV0b2NvbXBsZXRpb24gY29uZmlndXJhdGlvbiBzdG9yZWQgaW4gdGhlIGdsb2JhbCB3b3Jrc3BhY2UuICovXG5pbnRlcmZhY2UgQ29tcGxldGlvbkNvbmZpZyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGUgdXNlciBoYXMgYmVlbiBwcm9tcHRlZCB0byBzZXQgdXAgYXV0b2NvbXBsZXRpb24uIElmIGB0cnVlYCwgc2hvdWxkICpub3QqXG4gICAqIHByb21wdCB0aGVtIGFnYWluLlxuICAgKi9cbiAgcHJvbXB0ZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBpdCBpcyBhcHByb3ByaWF0ZSB0byBwcm9tcHQgdGhlIHVzZXIgdG8gc2V0dXAgYXV0b2NvbXBsZXRpb24uIElmIG5vdCwgZG9lcyBub3RoaW5nLiBJZlxuICogc28gcHJvbXB0cyBhbmQgc2V0cyB1cCBhdXRvY29tcGxldGlvbiBmb3IgdGhlIHVzZXIuIFJldHVybnMgYW4gZXhpdCBjb2RlIGlmIHRoZSBwcm9ncmFtIHNob3VsZFxuICogdGVybWluYXRlLCBvdGhlcndpc2UgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAqIEByZXR1cm5zIGFuIGV4aXQgY29kZSBpZiB0aGUgcHJvZ3JhbSBzaG91bGQgdGVybWluYXRlLCB1bmRlZmluZWQgb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29uc2lkZXJTZXR0aW5nVXBBdXRvY29tcGxldGlvbihcbiAgY29tbWFuZDogc3RyaW5nLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyLFxuKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgLy8gQ2hlY2sgaWYgd2Ugc2hvdWxkIHByb21wdCB0aGUgdXNlciB0byBzZXR1cCBhdXRvY29tcGxldGlvbi5cbiAgY29uc3QgY29tcGxldGlvbkNvbmZpZyA9IGF3YWl0IGdldENvbXBsZXRpb25Db25maWcoKTtcbiAgaWYgKCEoYXdhaXQgc2hvdWxkUHJvbXB0Rm9yQXV0b2NvbXBsZXRpb25TZXR1cChjb21tYW5kLCBjb21wbGV0aW9uQ29uZmlnKSkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkOyAvLyBBbHJlYWR5IHNldCB1cCBvciBwcm9tcHRlZCBwcmV2aW91c2x5LCBub3RoaW5nIHRvIGRvLlxuICB9XG5cbiAgLy8gUHJvbXB0IHRoZSB1c2VyIGFuZCByZWNvcmQgdGhlaXIgcmVzcG9uc2UuXG4gIGNvbnN0IHNob3VsZFNldHVwQXV0b2NvbXBsZXRpb24gPSBhd2FpdCBwcm9tcHRGb3JBdXRvY29tcGxldGlvbigpO1xuICBpZiAoIXNob3VsZFNldHVwQXV0b2NvbXBsZXRpb24pIHtcbiAgICAvLyBVc2VyIHJlamVjdGVkIHRoZSBwcm9tcHQgYW5kIGRvZXNuJ3Qgd2FudCBhdXRvY29tcGxldGlvbi5cbiAgICBsb2dnZXIuaW5mbyhcbiAgICAgIGBcbk9rLCB5b3Ugd29uJ3QgYmUgcHJvbXB0ZWQgYWdhaW4uIFNob3VsZCB5b3UgY2hhbmdlIHlvdXIgbWluZCwgdGhlIGZvbGxvd2luZyBjb21tYW5kIHdpbGwgc2V0IHVwIGF1dG9jb21wbGV0aW9uIGZvciB5b3U6XG5cbiAgICAke2NvbG9ycy55ZWxsb3coYG5nIGNvbXBsZXRpb25gKX1cbiAgICBgLnRyaW0oKSxcbiAgICApO1xuXG4gICAgLy8gU2F2ZSBjb25maWd1cmF0aW9uIHRvIHJlbWVtYmVyIHRoYXQgdGhlIHVzZXIgd2FzIHByb21wdGVkIGFuZCBhdm9pZCBwcm9tcHRpbmcgYWdhaW4uXG4gICAgYXdhaXQgc2V0Q29tcGxldGlvbkNvbmZpZyh7IC4uLmNvbXBsZXRpb25Db25maWcsIHByb21wdGVkOiB0cnVlIH0pO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIFVzZXIgYWNjZXB0ZWQgdGhlIHByb21wdCwgc2V0IHVwIGF1dG9jb21wbGV0aW9uLlxuICBsZXQgcmNGaWxlOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgcmNGaWxlID0gYXdhaXQgaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZSgpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBhc3NlcnRJc0Vycm9yKGVycik7XG4gICAgLy8gRmFpbGVkIHRvIHNldCB1cCBhdXRvY29tcGVsZXRpb24sIGxvZyB0aGUgZXJyb3IgYW5kIGFib3J0LlxuICAgIGxvZ2dlci5lcnJvcihlcnIubWVzc2FnZSk7XG5cbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIE5vdGlmeSB0aGUgdXNlciBhdXRvY29tcGxldGlvbiB3YXMgc2V0IHVwIHN1Y2Nlc3NmdWxseS5cbiAgbG9nZ2VyLmluZm8oXG4gICAgYFxuQXBwZW5kZWQgXFxgc291cmNlIDwobmcgY29tcGxldGlvbiBzY3JpcHQpXFxgIHRvIFxcYCR7cmNGaWxlfVxcYC4gUmVzdGFydCB5b3VyIHRlcm1pbmFsIG9yIHJ1biB0aGUgZm9sbG93aW5nIHRvIGF1dG9jb21wbGV0ZSBcXGBuZ1xcYCBjb21tYW5kczpcblxuICAgICR7Y29sb3JzLnllbGxvdyhgc291cmNlIDwobmcgY29tcGxldGlvbiBzY3JpcHQpYCl9XG4gICAgYC50cmltKCksXG4gICk7XG5cbiAgaWYgKCEoYXdhaXQgaGFzR2xvYmFsQ2xpSW5zdGFsbCgpKSkge1xuICAgIGxvZ2dlci53YXJuKFxuICAgICAgJ1NldHVwIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHksIGJ1dCB0aGVyZSBkb2VzIG5vdCBzZWVtIHRvIGJlIGEgZ2xvYmFsIGluc3RhbGwgb2YgdGhlJyArXG4gICAgICAgICcgQW5ndWxhciBDTEkuIEZvciBhdXRvY29tcGxldGlvbiB0byB3b3JrLCB0aGUgQ0xJIHdpbGwgbmVlZCB0byBiZSBvbiB5b3VyIGAkUEFUSGAsIHdoaWNoJyArXG4gICAgICAgICcgaXMgdHlwaWNhbGx5IGRvbmUgd2l0aCB0aGUgYC1nYCBmbGFnIGluIGBucG0gaW5zdGFsbCAtZyBAYW5ndWxhci9jbGlgLicgK1xuICAgICAgICAnXFxuXFxuJyArXG4gICAgICAgICdGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9jbGkvY29tcGxldGlvbiNnbG9iYWwtaW5zdGFsbCcsXG4gICAgKTtcbiAgfVxuXG4gIC8vIFNhdmUgY29uZmlndXJhdGlvbiB0byByZW1lbWJlciB0aGF0IHRoZSB1c2VyIHdhcyBwcm9tcHRlZC5cbiAgYXdhaXQgc2V0Q29tcGxldGlvbkNvbmZpZyh7IC4uLmNvbXBsZXRpb25Db25maWcsIHByb21wdGVkOiB0cnVlIH0pO1xuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldENvbXBsZXRpb25Db25maWcoKTogUHJvbWlzZTxDb21wbGV0aW9uQ29uZmlnIHwgdW5kZWZpbmVkPiB7XG4gIGNvbnN0IHdrc3AgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoJ2dsb2JhbCcpO1xuXG4gIHJldHVybiB3a3NwPy5nZXRDbGkoKT8uWydjb21wbGV0aW9uJ107XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldENvbXBsZXRpb25Db25maWcoY29uZmlnOiBDb21wbGV0aW9uQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHdrc3AgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoJ2dsb2JhbCcpO1xuICBpZiAoIXdrc3ApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGdsb2JhbCB3b3Jrc3BhY2VgKTtcbiAgfVxuXG4gIHdrc3AuZXh0ZW5zaW9uc1snY2xpJ10gPz89IHt9O1xuICBjb25zdCBjbGkgPSB3a3NwLmV4dGVuc2lvbnNbJ2NsaSddO1xuICBpZiAoIWpzb24uaXNKc29uT2JqZWN0KGNsaSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBjb25maWcgZm91bmQgYXQgJHt3a3NwLmZpbGVQYXRofS4gXFxgZXh0ZW5zaW9ucy5jbGlcXGAgc2hvdWxkIGJlIGFuIG9iamVjdC5gLFxuICAgICk7XG4gIH1cbiAgY2xpLmNvbXBsZXRpb24gPSBjb25maWcgYXMganNvbi5Kc29uT2JqZWN0O1xuICBhd2FpdCB3a3NwLnNhdmUoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2hvdWxkUHJvbXB0Rm9yQXV0b2NvbXBsZXRpb25TZXR1cChcbiAgY29tbWFuZDogc3RyaW5nLFxuICBjb25maWc/OiBDb21wbGV0aW9uQ29uZmlnLFxuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIC8vIEZvcmNlIHdoZXRoZXIgb3Igbm90IHRvIHByb21wdCBmb3IgYXV0b2NvbXBsZXRlIHRvIGdpdmUgYW4gZWFzeSBwYXRoIGZvciBlMmUgdGVzdGluZyB0byBza2lwLlxuICBpZiAoZm9yY2VBdXRvY29tcGxldGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmb3JjZUF1dG9jb21wbGV0ZTtcbiAgfVxuXG4gIC8vIERvbid0IHByb21wdCBvbiBgbmcgdXBkYXRlYCBvciBgbmcgY29tcGxldGlvbmAuXG4gIGlmIChjb21tYW5kID09PSAndXBkYXRlJyB8fCBjb21tYW5kID09PSAnY29tcGxldGlvbicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBOb24taW50ZXJhY3RpdmUgYW5kIGNvbnRpbnVvdXMgaW50ZWdyYXRpb24gc3lzdGVtcyBkb24ndCBjYXJlIGFib3V0IGF1dG9jb21wbGV0aW9uLlxuICBpZiAoIWlzVFRZKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBTa2lwIHByb21wdCBpZiB0aGUgdXNlciBoYXMgYWxyZWFkeSBiZWVuIHByb21wdGVkLlxuICBpZiAoY29uZmlnPy5wcm9tcHRlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGAkSE9NRWAgdmFyaWFibGUgaXMgbmVjZXNzYXJ5IHRvIGZpbmQgUkMgZmlsZXMgdG8gbW9kaWZ5LlxuICBjb25zdCBob21lID0gZW52WydIT01FJ107XG4gIGlmICghaG9tZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEdldCBwb3NzaWJsZSBSQyBmaWxlcyBmb3IgdGhlIGN1cnJlbnQgc2hlbGwuXG4gIGNvbnN0IHNoZWxsID0gZW52WydTSEVMTCddO1xuICBpZiAoIXNoZWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHJjRmlsZXMgPSBnZXRTaGVsbFJ1bkNvbW1hbmRDYW5kaWRhdGVzKHNoZWxsLCBob21lKTtcbiAgaWYgKCFyY0ZpbGVzKSB7XG4gICAgcmV0dXJuIGZhbHNlOyAvLyBVbmtub3duIHNoZWxsLlxuICB9XG5cbiAgLy8gRG9uJ3QgcHJvbXB0IGlmIHRoZSB1c2VyIGlzIG1pc3NpbmcgYSBnbG9iYWwgQ0xJIGluc3RhbGwuIEF1dG9jb21wbGV0aW9uIHdvbid0IHdvcmsgYWZ0ZXIgc2V0dXBcbiAgLy8gYW55d2F5IGFuZCBjb3VsZCBiZSBhbm5veWluZyBmb3IgdXNlcnMgcnVubmluZyBvbmUtb2ZmIGNvbW1hbmRzIHZpYSBgbnB4YCBvciB1c2luZyBgbnBtIHN0YXJ0YC5cbiAgaWYgKChhd2FpdCBoYXNHbG9iYWxDbGlJbnN0YWxsKCkpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIGVhY2ggUkMgZmlsZSBpZiB0aGV5IGFscmVhZHkgdXNlIGBuZyBjb21wbGV0aW9uIHNjcmlwdGAgaW4gYW55IGNhcGFjaXR5IGFuZCBkb24ndCBwcm9tcHQuXG4gIGZvciAoY29uc3QgcmNGaWxlIG9mIHJjRmlsZXMpIHtcbiAgICBjb25zdCBjb250ZW50cyA9IGF3YWl0IGZzLnJlYWRGaWxlKHJjRmlsZSwgJ3V0Zi04JykuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKTtcbiAgICBpZiAoY29udGVudHM/LmluY2x1ZGVzKCduZyBjb21wbGV0aW9uIHNjcmlwdCcpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb21wdEZvckF1dG9jb21wbGV0aW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAvLyBEeW5hbWljYWxseSBsb2FkIGBpbnF1aXJlcmAgc28gdXNlcnMgZG9uJ3QgaGF2ZSB0byBwYXkgdGhlIGNvc3Qgb2YgcGFyc2luZyBhbmQgZXhlY3V0aW5nIGl0IGZvclxuICAvLyB0aGUgOTklIG9mIGJ1aWxkcyB0aGF0ICpkb24ndCogcHJvbXB0IGZvciBhdXRvY29tcGxldGlvbi5cbiAgY29uc3QgeyBwcm9tcHQgfSA9IGF3YWl0IGltcG9ydCgnaW5xdWlyZXInKTtcbiAgY29uc3QgeyBhdXRvY29tcGxldGUgfSA9IGF3YWl0IHByb21wdDx7IGF1dG9jb21wbGV0ZTogYm9vbGVhbiB9PihbXG4gICAge1xuICAgICAgbmFtZTogJ2F1dG9jb21wbGV0ZScsXG4gICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICBtZXNzYWdlOiBgXG5Xb3VsZCB5b3UgbGlrZSB0byBlbmFibGUgYXV0b2NvbXBsZXRpb24/IFRoaXMgd2lsbCBzZXQgdXAgeW91ciB0ZXJtaW5hbCBzbyBwcmVzc2luZyBUQUIgd2hpbGUgdHlwaW5nXG5Bbmd1bGFyIENMSSBjb21tYW5kcyB3aWxsIHNob3cgcG9zc2libGUgb3B0aW9ucyBhbmQgYXV0b2NvbXBsZXRlIGFyZ3VtZW50cy4gKEVuYWJsaW5nIGF1dG9jb21wbGV0aW9uXG53aWxsIG1vZGlmeSBjb25maWd1cmF0aW9uIGZpbGVzIGluIHlvdXIgaG9tZSBkaXJlY3RvcnkuKVxuICAgICAgYFxuICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5qb2luKCcgJylcbiAgICAgICAgLnRyaW0oKSxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgXSk7XG5cbiAgcmV0dXJuIGF1dG9jb21wbGV0ZTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIGF1dG9jb21wbGV0aW9uIGZvciB0aGUgdXNlcidzIHRlcm1pbmFsLiBUaGlzIGF0dGVtcHRzIHRvIGZpbmQgdGhlIGNvbmZpZ3VyYXRpb24gZmlsZSBmb3JcbiAqIHRoZSBjdXJyZW50IHNoZWxsIChgLmJhc2hyY2AsIGAuenNocmNgLCBldGMuKSBhbmQgYXBwZW5kIGEgY29tbWFuZCB3aGljaCBlbmFibGVzIGF1dG9jb21wbGV0aW9uXG4gKiBmb3IgdGhlIEFuZ3VsYXIgQ0xJLiBTdXBwb3J0cyBvbmx5IEJhc2ggYW5kIFpzaC4gUmV0dXJucyB3aGV0aGVyIG9yIG5vdCBpdCB3YXMgc3VjY2Vzc2Z1bC5cbiAqIEByZXR1cm4gVGhlIGZ1bGwgcGF0aCBvZiB0aGUgY29uZmlndXJhdGlvbiBmaWxlIG1vZGlmaWVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAvLyBHZXQgdGhlIGN1cnJlbnRseSBhY3RpdmUgYCRTSEVMTGAgYW5kIGAkSE9NRWAgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuICBjb25zdCBzaGVsbCA9IGVudlsnU0hFTEwnXTtcbiAgaWYgKCFzaGVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdgJFNIRUxMYCBlbnZpcm9ubWVudCB2YXJpYWJsZSBub3Qgc2V0LiBBbmd1bGFyIENMSSBhdXRvY29tcGxldGlvbiBvbmx5IHN1cHBvcnRzIEJhc2ggb3InICtcbiAgICAgICAgXCIgWnNoLiBJZiB5b3UncmUgb24gV2luZG93cywgQ21kIGFuZCBQb3dlcnNoZWxsIGRvbid0IHN1cHBvcnQgY29tbWFuZCBhdXRvY29tcGxldGlvbixcIiArXG4gICAgICAgICcgYnV0IEdpdCBCYXNoIG9yIFdpbmRvd3MgU3Vic3lzdGVtIGZvciBMaW51eCBzaG91bGQgd29yaywgc28gcGxlYXNlIHRyeSBhZ2FpbiBpbiBvbmUgb2YnICtcbiAgICAgICAgJyB0aG9zZSBlbnZpcm9ubWVudHMuJyxcbiAgICApO1xuICB9XG4gIGNvbnN0IGhvbWUgPSBlbnZbJ0hPTUUnXTtcbiAgaWYgKCFob21lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2AkSE9NRWAgZW52aXJvbm1lbnQgdmFyaWFibGUgbm90IHNldC4gU2V0dGluZyB1cCBhdXRvY29tcGxldGlvbiBtb2RpZmllcyBjb25maWd1cmF0aW9uIGZpbGVzJyArXG4gICAgICAgICcgaW4gdGhlIGhvbWUgZGlyZWN0b3J5IGFuZCBtdXN0IGJlIHNldC4nLFxuICAgICk7XG4gIH1cblxuICAvLyBHZXQgYWxsIHRoZSBmaWxlcyB3ZSBjYW4gYWRkIGBuZyBjb21wbGV0aW9uYCB0byB3aGljaCBhcHBseSB0byB0aGUgdXNlcidzIGAkU0hFTExgLlxuICBjb25zdCBydW5Db21tYW5kQ2FuZGlkYXRlcyA9IGdldFNoZWxsUnVuQ29tbWFuZENhbmRpZGF0ZXMoc2hlbGwsIGhvbWUpO1xuICBpZiAoIXJ1bkNvbW1hbmRDYW5kaWRhdGVzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFVua25vd24gXFxgJFNIRUxMXFxgIGVudmlyb25tZW50IHZhcmlhYmxlIHZhbHVlICgke3NoZWxsfSkuIEFuZ3VsYXIgQ0xJIGF1dG9jb21wbGV0aW9uIG9ubHkgc3VwcG9ydHMgQmFzaCBvciBac2guYCxcbiAgICApO1xuICB9XG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBmaWxlIHRoYXQgYWxyZWFkeSBleGlzdHMgb3IgZmFsbGJhY2sgdG8gYSBuZXcgZmlsZSBvZiB0aGUgZmlyc3QgY2FuZGlkYXRlLlxuICBjb25zdCBjYW5kaWRhdGVzID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFxuICAgIHJ1bkNvbW1hbmRDYW5kaWRhdGVzLm1hcCgocmNGaWxlKSA9PiBmcy5hY2Nlc3MocmNGaWxlKS50aGVuKCgpID0+IHJjRmlsZSkpLFxuICApO1xuICBjb25zdCByY0ZpbGUgPVxuICAgIGNhbmRpZGF0ZXMuZmluZChcbiAgICAgIChyZXN1bHQpOiByZXN1bHQgaXMgUHJvbWlzZUZ1bGZpbGxlZFJlc3VsdDxzdHJpbmc+ID0+IHJlc3VsdC5zdGF0dXMgPT09ICdmdWxmaWxsZWQnLFxuICAgICk/LnZhbHVlID8/IHJ1bkNvbW1hbmRDYW5kaWRhdGVzWzBdO1xuXG4gIC8vIEFwcGVuZCBBbmd1bGFyIGF1dG9jb21wbGV0aW9uIHNldHVwIHRvIFJDIGZpbGUuXG4gIHRyeSB7XG4gICAgYXdhaXQgZnMuYXBwZW5kRmlsZShcbiAgICAgIHJjRmlsZSxcbiAgICAgICdcXG5cXG4jIExvYWQgQW5ndWxhciBDTEkgYXV0b2NvbXBsZXRpb24uXFxuc291cmNlIDwobmcgY29tcGxldGlvbiBzY3JpcHQpXFxuJyxcbiAgICApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBhc3NlcnRJc0Vycm9yKGVycik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gYXBwZW5kIGF1dG9jb21wbGV0aW9uIHNldHVwIHRvIFxcYCR7cmNGaWxlfVxcYDpcXG4ke2Vyci5tZXNzYWdlfWApO1xuICB9XG5cbiAgcmV0dXJuIHJjRmlsZTtcbn1cblxuLyoqIFJldHVybnMgYW4gb3JkZXJlZCBsaXN0IG9mIHBvc3NpYmxlIGNhbmRpZGF0ZXMgb2YgUkMgZmlsZXMgdXNlZCBieSB0aGUgZ2l2ZW4gc2hlbGwuICovXG5mdW5jdGlvbiBnZXRTaGVsbFJ1bkNvbW1hbmRDYW5kaWRhdGVzKHNoZWxsOiBzdHJpbmcsIGhvbWU6IHN0cmluZyk6IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHNoZWxsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2Jhc2gnKSkge1xuICAgIHJldHVybiBbJy5iYXNocmMnLCAnLmJhc2hfcHJvZmlsZScsICcucHJvZmlsZSddLm1hcCgoZmlsZSkgPT4gcGF0aC5qb2luKGhvbWUsIGZpbGUpKTtcbiAgfSBlbHNlIGlmIChzaGVsbC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCd6c2gnKSkge1xuICAgIHJldHVybiBbJy56c2hyYycsICcuenNoX3Byb2ZpbGUnLCAnLnByb2ZpbGUnXS5tYXAoKGZpbGUpID0+IHBhdGguam9pbihob21lLCBmaWxlKSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGUgdXNlciBoYXMgYSBnbG9iYWwgQ0xJIGluc3RhbGwuXG4gKiBFeGVjdXRpb24gZnJvbSBgbnB4YCBpcyAqbm90KiBjb25zaWRlcmVkIGEgZ2xvYmFsIENMSSBpbnN0YWxsLlxuICpcbiAqIFRoaXMgZG9lcyAqbm90KiBtZWFuIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBpcyBmcm9tIGEgZ2xvYmFsIENMSSBpbnN0YWxsLCBvbmx5IHRoYXQgYSBnbG9iYWxcbiAqIGluc3RhbGwgZXhpc3RzIG9uIHRoZSBzeXN0ZW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNHbG9iYWxDbGlJbnN0YWxsKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAvLyBMaXN0IGFsbCBiaW5hcmllcyB3aXRoIHRoZSBgbmdgIG5hbWUgb24gdGhlIHVzZXIncyBgJFBBVEhgLlxuICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IHtcbiAgICBleGVjRmlsZSgnd2hpY2gnLCBbJy1hJywgJ25nJ10sIChlcnJvciwgc3Rkb3V0KSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgLy8gTm8gaW5zdGFuY2VzIG9mIGBuZ2Agb24gdGhlIHVzZXIncyBgJFBBVEhgXG5cbiAgICAgICAgLy8gYHdoaWNoYCByZXR1cm5zIGV4aXQgY29kZSAyIGlmIGFuIGludmFsaWQgb3B0aW9uIGlzIHNwZWNpZmllZCBhbmQgYC1hYCBkb2Vzbid0IGFwcGVhciB0byBiZVxuICAgICAgICAvLyBzdXBwb3J0ZWQgb24gYWxsIHN5c3RlbXMuIE90aGVyIGV4aXQgY29kZXMgbWVhbiB1bmtub3duIGVycm9ycyBvY2N1cnJlZC4gQ2FuJ3QgdGVsbCB3aGV0aGVyXG4gICAgICAgIC8vIENMSSBpcyBnbG9iYWxseSBpbnN0YWxsZWQsIHNvIHRyZWF0IHRoaXMgYXMgaW5jb25jbHVzaXZlLlxuXG4gICAgICAgIC8vIGB3aGljaGAgd2FzIGtpbGxlZCBieSBhIHNpZ25hbCBhbmQgZGlkIG5vdCBleGl0IGdyYWNlZnVsbHkuIE1heWJlIGl0IGh1bmcgb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgICAgLy8gd2VudCB2ZXJ5IHdyb25nLCBzbyB0cmVhdCB0aGlzIGFzIGluY29uY2x1c2l2ZS5cbiAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTdWNjZXNzZnVsbHkgbGlzdGVkIGFsbCBgbmdgIGJpbmFyaWVzIG9uIHRoZSBgJFBBVEhgLiBMb29rIGZvciBhdCBsZWFzdCBvbmUgbGluZSB3aGljaCBpcyBhXG4gICAgICAvLyBnbG9iYWwgaW5zdGFsbC4gV2UgY2FuJ3QgZWFzaWx5IGlkZW50aWZ5IGdsb2JhbCBpbnN0YWxscywgYnV0IGxvY2FsIGluc3RhbGxzIGFyZSB0eXBpY2FsbHlcbiAgICAgIC8vIHBsYWNlZCBpbiBgbm9kZV9tb2R1bGVzLy5iaW5gIGJ5IE5QTSAvIFlhcm4uIGBucHhgIGFsc28gY3VycmVudGx5IGNhY2hlcyBmaWxlcyBhdFxuICAgICAgLy8gYH4vLm5wbS9fbnB4Lyovbm9kZV9tb2R1bGVzLy5iaW4vYCwgc28gdGhlIHNhbWUgbG9naWMgYXBwbGllcy5cbiAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KCdcXG4nKS5maWx0ZXIoKGxpbmUpID0+IGxpbmUgIT09ICcnKTtcbiAgICAgIGNvbnN0IGhhc0dsb2JhbEluc3RhbGwgPSBsaW5lcy5zb21lKChsaW5lKSA9PiB7XG4gICAgICAgIC8vIEEgYmluYXJ5IGlzIGEgbG9jYWwgaW5zdGFsbCBpZiBpdCBpcyBhIGRpcmVjdCBjaGlsZCBvZiBhIGBub2RlX21vZHVsZXMvLmJpbi9gIGRpcmVjdG9yeS5cbiAgICAgICAgY29uc3QgcGFyZW50ID0gcGF0aC5wYXJzZShwYXRoLnBhcnNlKGxpbmUpLmRpcik7XG4gICAgICAgIGNvbnN0IGdyYW5kcGFyZW50ID0gcGF0aC5wYXJzZShwYXJlbnQuZGlyKTtcbiAgICAgICAgY29uc3QgbG9jYWxJbnN0YWxsID0gZ3JhbmRwYXJlbnQuYmFzZSA9PT0gJ25vZGVfbW9kdWxlcycgJiYgcGFyZW50LmJhc2UgPT09ICcuYmluJztcblxuICAgICAgICByZXR1cm4gIWxvY2FsSW5zdGFsbDtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzb2x2ZShoYXNHbG9iYWxJbnN0YWxsKTtcbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=
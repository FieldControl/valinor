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
exports.getAnalyticsInfoString = exports.getAnalyticsUserId = exports.promptAnalytics = exports.setAnalyticsConfig = exports.isPackageNameSafeForAnalytics = exports.analyticsPackageSafelist = void 0;
const core_1 = require("@angular-devkit/core");
const crypto_1 = require("crypto");
const color_1 = require("../utilities/color");
const config_1 = require("../utilities/config");
const environment_options_1 = require("../utilities/environment-options");
const tty_1 = require("../utilities/tty");
/* eslint-disable no-console */
/**
 * This is the ultimate safelist for checking if a package name is safe to report to analytics.
 */
exports.analyticsPackageSafelist = [
    /^@angular\//,
    /^@angular-devkit\//,
    /^@nguniversal\//,
    '@schematics/angular',
];
function isPackageNameSafeForAnalytics(name) {
    return exports.analyticsPackageSafelist.some((pattern) => {
        if (typeof pattern == 'string') {
            return pattern === name;
        }
        else {
            return pattern.test(name);
        }
    });
}
exports.isPackageNameSafeForAnalytics = isPackageNameSafeForAnalytics;
/**
 * Set analytics settings. This does not work if the user is not inside a project.
 * @param global Which config to use. "global" for user-level, and "local" for project-level.
 * @param value Either a user ID, true to generate a new User ID, or false to disable analytics.
 */
async function setAnalyticsConfig(global, value) {
    var _a;
    var _b;
    const level = global ? 'global' : 'local';
    const workspace = await (0, config_1.getWorkspace)(level);
    if (!workspace) {
        throw new Error(`Could not find ${level} workspace.`);
    }
    const cli = ((_a = (_b = workspace.extensions)['cli']) !== null && _a !== void 0 ? _a : (_b['cli'] = {}));
    if (!workspace || !core_1.json.isJsonObject(cli)) {
        throw new Error(`Invalid config found at ${workspace.filePath}. CLI should be an object.`);
    }
    cli.analytics = value === true ? (0, crypto_1.randomUUID)() : value;
    await workspace.save();
}
exports.setAnalyticsConfig = setAnalyticsConfig;
/**
 * Prompt the user for usage gathering permission.
 * @param force Whether to ask regardless of whether or not the user is using an interactive shell.
 * @return Whether or not the user was shown a prompt.
 */
async function promptAnalytics(context, global, force = false) {
    const level = global ? 'global' : 'local';
    const workspace = await (0, config_1.getWorkspace)(level);
    if (!workspace) {
        throw new Error(`Could not find a ${level} workspace. Are you in a project?`);
    }
    if (force || (0, tty_1.isTTY)()) {
        const { prompt } = await Promise.resolve().then(() => __importStar(require('inquirer')));
        const answers = await prompt([
            {
                type: 'confirm',
                name: 'analytics',
                message: core_1.tags.stripIndents `
           Would you like to share pseudonymous usage data about this project with the Angular Team
           at Google under Google's Privacy Policy at https://policies.google.com/privacy. For more
           details and how to change this setting, see https://angular.io/analytics.

         `,
                default: false,
            },
        ]);
        await setAnalyticsConfig(global, answers.analytics);
        if (answers.analytics) {
            console.log('');
            console.log(core_1.tags.stripIndent `
         Thank you for sharing pseudonymous usage data. Should you change your mind, the following
         command will disable this feature entirely:

             ${color_1.colors.yellow(`ng analytics disable${global ? ' --global' : ''}`)}
       `);
            console.log('');
        }
        process.stderr.write(await getAnalyticsInfoString(context));
        return true;
    }
    return false;
}
exports.promptAnalytics = promptAnalytics;
/**
 * Get the analytics user id.
 *
 * @returns
 * - `string` user id.
 * - `false` when disabled.
 * - `undefined` when not configured.
 */
async function getAnalyticsUserIdForLevel(level) {
    var _a;
    if (environment_options_1.analyticsDisabled) {
        return false;
    }
    const workspace = await (0, config_1.getWorkspace)(level);
    const analyticsConfig = (_a = workspace === null || workspace === void 0 ? void 0 : workspace.getCli()) === null || _a === void 0 ? void 0 : _a['analytics'];
    if (analyticsConfig === false) {
        return false;
    }
    else if (analyticsConfig === undefined || analyticsConfig === null) {
        return undefined;
    }
    else {
        if (typeof analyticsConfig == 'string') {
            return analyticsConfig;
        }
        else if (typeof analyticsConfig == 'object' && typeof analyticsConfig['uid'] == 'string') {
            return analyticsConfig['uid'];
        }
        return undefined;
    }
}
async function getAnalyticsUserId(context, skipPrompt = false) {
    const { workspace } = context;
    // Global config takes precedence over local config only for the disabled check.
    // IE:
    // global: disabled & local: enabled = disabled
    // global: id: 123 & local: id: 456 = 456
    // check global
    const globalConfig = await getAnalyticsUserIdForLevel('global');
    if (globalConfig === false) {
        return undefined;
    }
    // Not disabled globally, check locally or not set globally and command is run outside of workspace example: `ng new`
    if (workspace || globalConfig === undefined) {
        const level = workspace ? 'local' : 'global';
        let localOrGlobalConfig = await getAnalyticsUserIdForLevel(level);
        if (localOrGlobalConfig === undefined) {
            if (!skipPrompt) {
                // config is unset, prompt user.
                // TODO: This should honor the `no-interactive` option.
                // It is currently not an `ng` option but rather only an option for specific commands.
                // The concept of `ng`-wide options are needed to cleanly handle this.
                await promptAnalytics(context, !workspace /** global */);
                localOrGlobalConfig = await getAnalyticsUserIdForLevel(level);
            }
        }
        if (localOrGlobalConfig === false) {
            return undefined;
        }
        else if (typeof localOrGlobalConfig === 'string') {
            return localOrGlobalConfig;
        }
    }
    return globalConfig;
}
exports.getAnalyticsUserId = getAnalyticsUserId;
function analyticsConfigValueToHumanFormat(value) {
    if (value === false) {
        return 'disabled';
    }
    else if (typeof value === 'string' || value === true) {
        return 'enabled';
    }
    else {
        return 'not set';
    }
}
async function getAnalyticsInfoString(context) {
    var _a, _b;
    const analyticsInstance = await getAnalyticsUserId(context, true /** skipPrompt */);
    const { globalConfiguration, workspace: localWorkspace } = context;
    const globalSetting = (_a = globalConfiguration === null || globalConfiguration === void 0 ? void 0 : globalConfiguration.getCli()) === null || _a === void 0 ? void 0 : _a['analytics'];
    const localSetting = (_b = localWorkspace === null || localWorkspace === void 0 ? void 0 : localWorkspace.getCli()) === null || _b === void 0 ? void 0 : _b['analytics'];
    return (core_1.tags.stripIndents `
     Global setting: ${analyticsConfigValueToHumanFormat(globalSetting)}
     Local setting: ${localWorkspace
        ? analyticsConfigValueToHumanFormat(localSetting)
        : 'No local workspace configuration file.'}
     Effective status: ${analyticsInstance ? 'enabled' : 'disabled'}
   ` + '\n');
}
exports.getAnalyticsInfoString = getAnalyticsInfoString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2FuYWx5dGljcy9hbmFseXRpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBa0Q7QUFDbEQsbUNBQW9DO0FBRXBDLDhDQUE0QztBQUM1QyxnREFBbUQ7QUFDbkQsMEVBQXFFO0FBQ3JFLDBDQUF5QztBQUV6QywrQkFBK0I7QUFFL0I7O0dBRUc7QUFDVSxRQUFBLHdCQUF3QixHQUFHO0lBQ3RDLGFBQWE7SUFDYixvQkFBb0I7SUFDcEIsaUJBQWlCO0lBQ2pCLHFCQUFxQjtDQUN0QixDQUFDO0FBRUYsU0FBZ0IsNkJBQTZCLENBQUMsSUFBWTtJQUN4RCxPQUFPLGdDQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQy9DLElBQUksT0FBTyxPQUFPLElBQUksUUFBUSxFQUFFO1lBQzlCLE9BQU8sT0FBTyxLQUFLLElBQUksQ0FBQztTQUN6QjthQUFNO1lBQ0wsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBUkQsc0VBUUM7QUFFRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLGtCQUFrQixDQUFDLE1BQWUsRUFBRSxLQUF1Qjs7O0lBQy9FLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDMUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHFCQUFZLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLEtBQUssYUFBYSxDQUFDLENBQUM7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LENBQUMsVUFBVTtJQUMvRCxHQUFHLElBQUksQ0FDUixDQUFDO0FBQ0osQ0FBQztBQWxCRCx3REFrQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsganNvbiwgdGFncyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IHJhbmRvbVVVSUQgfSBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHR5cGUgeyBDb21tYW5kQ29udGV4dCB9IGZyb20gJy4uL2NvbW1hbmQtYnVpbGRlci9jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQgeyBjb2xvcnMgfSBmcm9tICcuLi91dGlsaXRpZXMvY29sb3InO1xuaW1wb3J0IHsgZ2V0V29ya3NwYWNlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2NvbmZpZyc7XG5pbXBvcnQgeyBhbmFseXRpY3NEaXNhYmxlZCB9IGZyb20gJy4uL3V0aWxpdGllcy9lbnZpcm9ubWVudC1vcHRpb25zJztcbmltcG9ydCB7IGlzVFRZIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3R0eSc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuLyoqXG4gKiBUaGlzIGlzIHRoZSB1bHRpbWF0ZSBzYWZlbGlzdCBmb3IgY2hlY2tpbmcgaWYgYSBwYWNrYWdlIG5hbWUgaXMgc2FmZSB0byByZXBvcnQgdG8gYW5hbHl0aWNzLlxuICovXG5leHBvcnQgY29uc3QgYW5hbHl0aWNzUGFja2FnZVNhZmVsaXN0ID0gW1xuICAvXkBhbmd1bGFyXFwvLyxcbiAgL15AYW5ndWxhci1kZXZraXRcXC8vLFxuICAvXkBuZ3VuaXZlcnNhbFxcLy8sXG4gICdAc2NoZW1hdGljcy9hbmd1bGFyJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhY2thZ2VOYW1lU2FmZUZvckFuYWx5dGljcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGFuYWx5dGljc1BhY2thZ2VTYWZlbGlzdC5zb21lKChwYXR0ZXJuKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBwYXR0ZXJuID09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gcGF0dGVybiA9PT0gbmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhdHRlcm4udGVzdChuYW1lKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFNldCBhbmFseXRpY3Mgc2V0dGluZ3MuIFRoaXMgZG9lcyBub3Qgd29yayBpZiB0aGUgdXNlciBpcyBub3QgaW5zaWRlIGEgcHJvamVjdC5cbiAqIEBwYXJhbSBnbG9iYWwgV2hpY2ggY29uZmlnIHRvIHVzZS4gXCJnbG9iYWxcIiBmb3IgdXNlci1sZXZlbCwgYW5kIFwibG9jYWxcIiBmb3IgcHJvamVjdC1sZXZlbC5cbiAqIEBwYXJhbSB2YWx1ZSBFaXRoZXIgYSB1c2VyIElELCB0cnVlIHRvIGdlbmVyYXRlIGEgbmV3IFVzZXIgSUQsIG9yIGZhbHNlIHRvIGRpc2FibGUgYW5hbHl0aWNzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QW5hbHl0aWNzQ29uZmlnKGdsb2JhbDogYm9vbGVhbiwgdmFsdWU6IHN0cmluZyB8IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgbGV2ZWwgPSBnbG9iYWwgPyAnZ2xvYmFsJyA6ICdsb2NhbCc7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShsZXZlbCk7XG4gIGlmICghd29ya3NwYWNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCAke2xldmVsfSB3b3Jrc3BhY2UuYCk7XG4gIH1cblxuICBjb25zdCBjbGkgPSAod29ya3NwYWNlLmV4dGVuc2lvbnNbJ2NsaSddID8/PSB7fSk7XG4gIGlmICghd29ya3NwYWNlIHx8ICFqc29uLmlzSnNvbk9iamVjdChjbGkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGNvbmZpZyBmb3VuZCBhdCAke3dvcmtzcGFjZS5maWxlUGF0aH0uIENMSSBzaG91bGQgYmUgYW4gb2JqZWN0LmApO1xuICB9XG5cbiAgY2xpLmFuYWx5dGljcyA9IHZhbHVlID09PSB0cnVlID8gcmFuZG9tVVVJRCgpIDogdmFsdWU7XG4gIGF3YWl0IHdvcmtzcGFjZS5zYXZlKCk7XG59XG5cbi8qKlxuICogUHJvbXB0IHRoZSB1c2VyIGZvciB1c2FnZSBnYXRoZXJpbmcgcGVybWlzc2lvbi5cbiAqIEBwYXJhbSBmb3JjZSBXaGV0aGVyIHRvIGFzayByZWdhcmRsZXNzIG9mIHdoZXRoZXIgb3Igbm90IHRoZSB1c2VyIGlzIHVzaW5nIGFuIGludGVyYWN0aXZlIHNoZWxsLlxuICogQHJldHVybiBXaGV0aGVyIG9yIG5vdCB0aGUgdXNlciB3YXMgc2hvd24gYSBwcm9tcHQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmFseXRpY3MoXG4gIGNvbnRleHQ6IENvbW1hbmRDb250ZXh0LFxuICBnbG9iYWw6IGJvb2xlYW4sXG4gIGZvcmNlID0gZmFsc2UsXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgbGV2ZWwgPSBnbG9iYWwgPyAnZ2xvYmFsJyA6ICdsb2NhbCc7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShsZXZlbCk7XG4gIGlmICghd29ya3NwYWNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhICR7bGV2ZWx9IHdvcmtzcGFjZS4gQXJlIHlvdSBpbiBhIHByb2plY3Q/YCk7XG4gIH1cblxuICBpZiAoZm9yY2UgfHwgaXNUVFkoKSkge1xuICAgIGNvbnN0IHsgcHJvbXB0IH0gPSBhd2FpdCBpbXBvcnQoJ2lucXVpcmVyJyk7XG4gICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IHByb21wdDx7IGFuYWx5dGljczogYm9vbGVhbiB9PihbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgbmFtZTogJ2FuYWx5dGljcycsXG4gICAgICAgIG1lc3NhZ2U6IHRhZ3Muc3RyaXBJbmRlbnRzYFxuICAgICAgICAgICBXb3VsZCB5b3UgbGlrZSB0byBzaGFyZSBwc2V1ZG9ueW1vdXMgdXNhZ2UgZGF0YSBhYm91dCB0aGlzIHByb2plY3Qgd2l0aCB0aGUgQW5ndWxhciBUZWFtXG4gICAgICAgICAgIGF0IEdvb2dsZSB1bmRlciBHb29nbGUncyBQcml2YWN5IFBvbGljeSBhdCBodHRwczovL3BvbGljaWVzLmdvb2dsZS5jb20vcHJpdmFjeS4gRm9yIG1vcmVcbiAgICAgICAgICAgZGV0YWlscyBhbmQgaG93IHRvIGNoYW5nZSB0aGlzIHNldHRpbmcsIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vYW5hbHl0aWNzLlxuXG4gICAgICAgICBgLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIH0sXG4gICAgXSk7XG5cbiAgICBhd2FpdCBzZXRBbmFseXRpY3NDb25maWcoZ2xvYmFsLCBhbnN3ZXJzLmFuYWx5dGljcyk7XG5cbiAgICBpZiAoYW5zd2Vycy5hbmFseXRpY3MpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICB0YWdzLnN0cmlwSW5kZW50YFxuICAgICAgICAgVGhhbmsgeW91IGZvciBzaGFyaW5nIHBzZXVkb255bW91cyB1c2FnZSBkYXRhLiBTaG91bGQgeW91IGNoYW5nZSB5b3VyIG1pbmQsIHRoZSBmb2xsb3dpbmdcbiAgICAgICAgIGNvbW1hbmQgd2lsbCBkaXNhYmxlIHRoaXMgZmVhdHVyZSBlbnRpcmVseTpcblxuICAgICAgICAgICAgICR7Y29sb3JzLnllbGxvdyhgbmcgYW5hbHl0aWNzIGRpc2FibGUke2dsb2JhbCA/ICcgLS1nbG9iYWwnIDogJyd9YCl9XG4gICAgICAgYCxcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgfVxuXG4gICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUoYXdhaXQgZ2V0QW5hbHl0aWNzSW5mb1N0cmluZyhjb250ZXh0KSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGFuYWx5dGljcyB1c2VyIGlkLlxuICpcbiAqIEByZXR1cm5zXG4gKiAtIGBzdHJpbmdgIHVzZXIgaWQuXG4gKiAtIGBmYWxzZWAgd2hlbiBkaXNhYmxlZC5cbiAqIC0gYHVuZGVmaW5lZGAgd2hlbiBub3QgY29uZmlndXJlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0QW5hbHl0aWNzVXNlcklkRm9yTGV2ZWwoXG4gIGxldmVsOiAnbG9jYWwnIHwgJ2dsb2JhbCcsXG4pOiBQcm9taXNlPHN0cmluZyB8IGZhbHNlIHwgdW5kZWZpbmVkPiB7XG4gIGlmIChhbmFseXRpY3NEaXNhYmxlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShsZXZlbCk7XG4gIGNvbnN0IGFuYWx5dGljc0NvbmZpZzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCB8IHsgdWlkPzogc3RyaW5nIH0gfCBib29sZWFuID1cbiAgICB3b3Jrc3BhY2U/LmdldENsaSgpPy5bJ2FuYWx5dGljcyddO1xuXG4gIGlmIChhbmFseXRpY3NDb25maWcgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2UgaWYgKGFuYWx5dGljc0NvbmZpZyA9PT0gdW5kZWZpbmVkIHx8IGFuYWx5dGljc0NvbmZpZyA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBhbmFseXRpY3NDb25maWcgPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBhbmFseXRpY3NDb25maWc7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYW5hbHl0aWNzQ29uZmlnID09ICdvYmplY3QnICYmIHR5cGVvZiBhbmFseXRpY3NDb25maWdbJ3VpZCddID09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gYW5hbHl0aWNzQ29uZmlnWyd1aWQnXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbmFseXRpY3NVc2VySWQoXG4gIGNvbnRleHQ6IENvbW1hbmRDb250ZXh0LFxuICBza2lwUHJvbXB0ID0gZmFsc2UsXG4pOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gY29udGV4dDtcbiAgLy8gR2xvYmFsIGNvbmZpZyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgbG9jYWwgY29uZmlnIG9ubHkgZm9yIHRoZSBkaXNhYmxlZCBjaGVjay5cbiAgLy8gSUU6XG4gIC8vIGdsb2JhbDogZGlzYWJsZWQgJiBsb2NhbDogZW5hYmxlZCA9IGRpc2FibGVkXG4gIC8vIGdsb2JhbDogaWQ6IDEyMyAmIGxvY2FsOiBpZDogNDU2ID0gNDU2XG5cbiAgLy8gY2hlY2sgZ2xvYmFsXG4gIGNvbnN0IGdsb2JhbENvbmZpZyA9IGF3YWl0IGdldEFuYWx5dGljc1VzZXJJZEZvckxldmVsKCdnbG9iYWwnKTtcbiAgaWYgKGdsb2JhbENvbmZpZyA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gTm90IGRpc2FibGVkIGdsb2JhbGx5LCBjaGVjayBsb2NhbGx5IG9yIG5vdCBzZXQgZ2xvYmFsbHkgYW5kIGNvbW1hbmQgaXMgcnVuIG91dHNpZGUgb2Ygd29ya3NwYWNlIGV4YW1wbGU6IGBuZyBuZXdgXG4gIGlmICh3b3Jrc3BhY2UgfHwgZ2xvYmFsQ29uZmlnID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBsZXZlbCA9IHdvcmtzcGFjZSA/ICdsb2NhbCcgOiAnZ2xvYmFsJztcbiAgICBsZXQgbG9jYWxPckdsb2JhbENvbmZpZyA9IGF3YWl0IGdldEFuYWx5dGljc1VzZXJJZEZvckxldmVsKGxldmVsKTtcbiAgICBpZiAobG9jYWxPckdsb2JhbENvbmZpZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXNraXBQcm9tcHQpIHtcbiAgICAgICAgLy8gY29uZmlnIGlzIHVuc2V0LCBwcm9tcHQgdXNlci5cbiAgICAgICAgLy8gVE9ETzogVGhpcyBzaG91bGQgaG9ub3IgdGhlIGBuby1pbnRlcmFjdGl2ZWAgb3B0aW9uLlxuICAgICAgICAvLyBJdCBpcyBjdXJyZW50bHkgbm90IGFuIGBuZ2Agb3B0aW9uIGJ1dCByYXRoZXIgb25seSBhbiBvcHRpb24gZm9yIHNwZWNpZmljIGNvbW1hbmRzLlxuICAgICAgICAvLyBUaGUgY29uY2VwdCBvZiBgbmdgLXdpZGUgb3B0aW9ucyBhcmUgbmVlZGVkIHRvIGNsZWFubHkgaGFuZGxlIHRoaXMuXG4gICAgICAgIGF3YWl0IHByb21wdEFuYWx5dGljcyhjb250ZXh0LCAhd29ya3NwYWNlIC8qKiBnbG9iYWwgKi8pO1xuICAgICAgICBsb2NhbE9yR2xvYmFsQ29uZmlnID0gYXdhaXQgZ2V0QW5hbHl0aWNzVXNlcklkRm9yTGV2ZWwobGV2ZWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChsb2NhbE9yR2xvYmFsQ29uZmlnID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb2NhbE9yR2xvYmFsQ29uZmlnID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGxvY2FsT3JHbG9iYWxDb25maWc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdsb2JhbENvbmZpZztcbn1cblxuZnVuY3Rpb24gYW5hbHl0aWNzQ29uZmlnVmFsdWVUb0h1bWFuRm9ybWF0KHZhbHVlOiB1bmtub3duKTogJ2VuYWJsZWQnIHwgJ2Rpc2FibGVkJyB8ICdub3Qgc2V0JyB7XG4gIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gJ2Rpc2FibGVkJztcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHZhbHVlID09PSB0cnVlKSB7XG4gICAgcmV0dXJuICdlbmFibGVkJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ25vdCBzZXQnO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbmFseXRpY3NJbmZvU3RyaW5nKGNvbnRleHQ6IENvbW1hbmRDb250ZXh0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgYW5hbHl0aWNzSW5zdGFuY2UgPSBhd2FpdCBnZXRBbmFseXRpY3NVc2VySWQoY29udGV4dCwgdHJ1ZSAvKiogc2tpcFByb21wdCAqLyk7XG5cbiAgY29uc3QgeyBnbG9iYWxDb25maWd1cmF0aW9uLCB3b3Jrc3BhY2U6IGxvY2FsV29ya3NwYWNlIH0gPSBjb250ZXh0O1xuICBjb25zdCBnbG9iYWxTZXR0aW5nID0gZ2xvYmFsQ29uZmlndXJhdGlvbj8uZ2V0Q2xpKCk/LlsnYW5hbHl0aWNzJ107XG4gIGNvbnN0IGxvY2FsU2V0dGluZyA9IGxvY2FsV29ya3NwYWNlPy5nZXRDbGkoKT8uWydhbmFseXRpY3MnXTtcblxuICByZXR1cm4gKFxuICAgIHRhZ3Muc3RyaXBJbmRlbnRzYFxuICAgICBHbG9iYWwgc2V0dGluZzogJHthbmFseXRpY3NDb25maWdWYWx1ZVRvSHVtYW5Gb3JtYXQoZ2xvYmFsU2V0dGluZyl9XG4gICAgIExvY2FsIHNldHRpbmc6ICR7XG4gICAgICAgbG9jYWxXb3Jrc3BhY2VcbiAgICAgICAgID8gYW5hbHl0aWNzQ29uZmlnVmFsdWVUb0h1bWFuRm9ybWF0KGxvY2FsU2V0dGluZylcbiAgICAgICAgIDogJ05vIGxvY2FsIHdvcmtzcGFjZSBjb25maWd1cmF0aW9uIGZpbGUuJ1xuICAgICB9XG4gICAgIEVmZmVjdGl2ZSBzdGF0dXM6ICR7YW5hbHl0aWNzSW5zdGFuY2UgPyAnZW5hYmxlZCcgOiAnZGlzYWJsZWQnfVxuICAgYCArICdcXG4nXG4gICk7XG59XG4iXX0=
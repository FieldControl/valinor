"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigCommandModule = void 0;
const crypto_1 = require("crypto");
const path_1 = require("path");
const command_module_1 = require("../../command-builder/command-module");
const config_1 = require("../../utilities/config");
const json_file_1 = require("../../utilities/json-file");
class ConfigCommandModule extends command_module_1.CommandModule {
    constructor() {
        super(...arguments);
        this.command = 'config [json-path] [value]';
        this.describe = 'Retrieves or sets Angular configuration values in the angular.json file for the workspace.';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
    }
    builder(localYargs) {
        return localYargs
            .positional('json-path', {
            description: `The configuration key to set or query, in JSON path format. ` +
                `For example: "a[3].foo.bar[2]". If no new value is provided, returns the current value of this key.`,
            type: 'string',
        })
            .positional('value', {
            description: 'If provided, a new value for the given configuration key.',
            type: 'string',
        })
            .option('global', {
            description: `Access the global configuration in the caller's home directory.`,
            alias: ['g'],
            type: 'boolean',
            default: false,
        })
            .strict();
    }
    async run(options) {
        const level = options.global ? 'global' : 'local';
        const [config] = await (0, config_1.getWorkspaceRaw)(level);
        if (options.value == undefined) {
            if (!config) {
                this.context.logger.error('No config found.');
                return 1;
            }
            return this.get(config, options);
        }
        else {
            return this.set(options);
        }
    }
    get(jsonFile, options) {
        const { logger } = this.context;
        const value = options.jsonPath
            ? jsonFile.get(parseJsonPath(options.jsonPath))
            : jsonFile.content;
        if (value === undefined) {
            logger.error('Value cannot be found.');
            return 1;
        }
        else if (typeof value === 'string') {
            logger.info(value);
        }
        else {
            logger.info(JSON.stringify(value, null, 2));
        }
        return 0;
    }
    async set(options) {
        var _a, _b;
        if (!((_a = options.jsonPath) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new command_module_1.CommandModuleError('Invalid Path.');
        }
        const [config, configPath] = await (0, config_1.getWorkspaceRaw)(options.global ? 'global' : 'local');
        const { logger } = this.context;
        if (!config || !configPath) {
            throw new command_module_1.CommandModuleError('Confguration file cannot be found.');
        }
        const normalizeUUIDValue = (v) => (v === '' ? (0, crypto_1.randomUUID)() : `${v}`);
        const value = options.jsonPath === 'cli.analyticsSharing.uuid'
            ? normalizeUUIDValue(options.value)
            : options.value;
        const modified = config.modify(parseJsonPath(options.jsonPath), normalizeValue(value));
        if (!modified) {
            logger.error('Value cannot be found.');
            return 1;
        }
        await (0, config_1.validateWorkspace)((0, json_file_1.parseJson)(config.content), (_b = options.global) !== null && _b !== void 0 ? _b : false);
        config.save();
        return 0;
    }
}
exports.ConfigCommandModule = ConfigCommandModule;
/**
 * Splits a JSON path string into fragments. Fragments can be used to get the value referenced
 * by the path. For example, a path of "a[3].foo.bar[2]" would give you a fragment array of
 * ["a", 3, "foo", "bar", 2].
 * @param path The JSON string to parse.
 * @returns {(string|number)[]} The fragments for the string.
 * @private
 */
function parseJsonPath(path) {
    const fragments = (path || '').split(/\./g);
    const result = [];
    while (fragments.length > 0) {
        const fragment = fragments.shift();
        if (fragment == undefined) {
            break;
        }
        const match = fragment.match(/([^[]+)((\[.*\])*)/);
        if (!match) {
            throw new command_module_1.CommandModuleError('Invalid JSON path.');
        }
        result.push(match[1]);
        if (match[2]) {
            const indices = match[2]
                .slice(1, -1)
                .split('][')
                .map((x) => (/^\d$/.test(x) ? +x : x.replace(/"|'/g, '')));
            result.push(...indices);
        }
    }
    return result.filter((fragment) => fragment != null);
}
function normalizeValue(value) {
    const valueString = `${value}`.trim();
    switch (valueString) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
        case 'undefined':
            return undefined;
    }
    if (isFinite(+valueString)) {
        return +valueString;
    }
    try {
        // We use `JSON.parse` instead of `parseJson` because the latter will parse UUIDs
        // and convert them into a numberic entities.
        // Example: 73b61974-182c-48e4-b4c6-30ddf08c5c98 -> 73.
        // These values should never contain comments, therefore using `JSON.parse` is safe.
        return JSON.parse(valueString);
    }
    catch (_a) {
        return value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2NvbmZpZy9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsbUNBQW9DO0FBQ3BDLCtCQUE0QjtBQUU1Qix5RUFLOEM7QUFDOUMsbURBQTRFO0FBQzVFLHlEQUFnRTtBQVFoRSxNQUFhLG1CQUNYLFNBQVEsOEJBQWdDO0lBRDFDOztRQUlFLFlBQU8sR0FBRyw0QkFBNEIsQ0FBQztRQUN2QyxhQUFRLEdBQ04sNEZBQTRGLENBQUM7UUFDL0Ysd0JBQW1CLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUE2Ri9ELENBQUM7SUEzRkMsT0FBTyxDQUFDLFVBQWdCO1FBQ3RCLE9BQU8sVUFBVTthQUNkLFVBQVUsQ0FBQyxXQUFXLEVBQUU7WUFDdkIsV0FBVyxFQUNULDhEQUE4RDtnQkFDOUQscUdBQXFHO1lBQ3ZHLElBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQzthQUNELFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDbkIsV0FBVyxFQUFFLDJEQUEyRDtZQUN4RSxJQUFJLEVBQUUsUUFBUTtTQUNmLENBQUM7YUFDRCxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2hCLFdBQVcsRUFBRSxpRUFBaUU7WUFDOUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsS0FBSztTQUNmLENBQUM7YUFDRCxNQUFNLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQW1DO1FBQzNDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxN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RUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1NBQ3pCO0tBQ0Y7SUFFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsS0FBNEM7SUFDbEUsTUFBTSxXQUFXLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0QyxRQUFRLFdBQVcsRUFBRTtRQUNuQixLQUFLLE1BQU07WUFDVCxPQUFPLElBQUksQ0FBQztRQUNkLEtBQUssT0FBTztZQUNWLE9BQU8sS0FBSyxDQUFDO1FBQ2YsS0FBSyxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUM7UUFDZCxLQUFLLFdBQVc7WUFDZCxPQUFPLFNBQVMsQ0FBQztLQUNwQjtJQUVELElBQUksUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxDQUFDLFdBQVcsQ0FBQztLQUNyQjtJQUVELElBQUk7UUFDRixpRkFBaUY7UUFDakYsNkNBQTZDO1FBQzdDLHVEQUF1RDtRQUN2RCxvRkFBb0Y7UUFDcEYsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2hDO0lBQUMsV0FBTTtRQUNOLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IEpzb25WYWx1ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IHJhbmRvbVVVSUQgfSBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7XG4gIENvbW1hbmRNb2R1bGUsXG4gIENvbW1hbmRNb2R1bGVFcnJvcixcbiAgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uLFxuICBPcHRpb25zLFxufSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHsgZ2V0V29ya3NwYWNlUmF3LCB2YWxpZGF0ZVdvcmtzcGFjZSB9IGZyb20gJy4uLy4uL3V0aWxpdGllcy9jb25maWcnO1xuaW1wb3J0IHsgSlNPTkZpbGUsIHBhcnNlSnNvbiB9IGZyb20gJy4uLy4uL3V0aWxpdGllcy9qc29uLWZpbGUnO1xuXG5pbnRlcmZhY2UgQ29uZmlnQ29tbWFuZEFyZ3Mge1xuICAnanNvbi1wYXRoJz86IHN0cmluZztcbiAgdmFsdWU/OiBzdHJpbmc7XG4gIGdsb2JhbD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBDb25maWdDb21tYW5kTW9kdWxlXG4gIGV4dGVuZHMgQ29tbWFuZE1vZHVsZTxDb25maWdDb21tYW5kQXJncz5cbiAgaW1wbGVtZW50cyBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb248Q29uZmlnQ29tbWFuZEFyZ3M+XG57XG4gIGNvbW1hbmQgPSAnY29uZmlnIFtqc29uLXBhdGhdIFt2YWx1ZV0nO1xuICBkZXNjcmliZSA9XG4gICAgJ1JldHJpZXZlcyBvciBzZXRzIEFuZ3VsYXIgY29uZmlndXJhdGlvbiB2YWx1ZXMgaW4gdGhlIGFuZ3VsYXIuanNvbiBmaWxlIGZvciB0aGUgd29ya3NwYWNlLic7XG4gIGxvbmdEZXNjcmlwdGlvblBhdGggPSBqb2luKF9fZGlybmFtZSwgJ2xvbmctZGVzY3JpcHRpb24ubWQnKTtcblxuICBidWlsZGVyKGxvY2FsWWFyZ3M6IEFyZ3YpOiBBcmd2PENvbmZpZ0NvbW1hbmRBcmdzPiB7XG4gICAgcmV0dXJuIGxvY2FsWWFyZ3NcbiAgICAgIC5wb3NpdGlvbmFsKCdqc29uLXBhdGgnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgIGBUaGUgY29uZmlndXJhdGlvbiBrZXkgdG8gc2V0IG9yIHF1ZXJ5LCBpbiBKU09OIHBhdGggZm9ybWF0LiBgICtcbiAgICAgICAgICBgRm9yIGV4YW1wbGU6IFwiYVszXS5mb28uYmFyWzJdXCIuIElmIG5vIG5ldyB2YWx1ZSBpcyBwcm92aWRlZCwgcmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGlzIGtleS5gLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIH0pXG4gICAgICAucG9zaXRpb25hbCgndmFsdWUnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgcHJvdmlkZWQsIGEgbmV3IHZhbHVlIGZvciB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBrZXkuJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbignZ2xvYmFsJywge1xuICAgICAgICBkZXNjcmlwdGlvbjogYEFjY2VzcyB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gaW4gdGhlIGNhbGxlcidzIGhvbWUgZGlyZWN0b3J5LmAsXG4gICAgICAgIGFsaWFzOiBbJ2cnXSxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIH0pXG4gICAgICAuc3RyaWN0KCk7XG4gIH1cblxuICBhc3luYyBydW4ob3B0aW9uczogT3B0aW9uczxDb25maWdDb21tYW5kQXJncz4pOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICBjb25zdCBsZXZlbCA9IG9wdGlvbnMuZ2xvYmFsID8gJ2dsb2JhbCcgOiAnbG9jYWwnO1xuICAgIGNvbnN0IFtjb25maWddID0gYXdhaXQgZ2V0V29ya3NwYWNlUmF3KGxldmVsKTtcblxuICAgIGlmIChvcHRpb25zLnZhbHVlID09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5lcnJvcignTm8gY29uZmlnIGZvdW5kLicpO1xuXG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXQoY29uZmlnLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0KG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0KGpzb25GaWxlOiBKU09ORmlsZSwgb3B0aW9uczogT3B0aW9uczxDb25maWdDb21tYW5kQXJncz4pOiBudW1iZXIge1xuICAgIGNvbnN0IHsgbG9nZ2VyIH0gPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBjb25zdCB2YWx1ZSA9IG9wdGlvbnMuanNvblBhdGhcbiAgICAgID8ganNvbkZpbGUuZ2V0KHBhcnNlSnNvblBhdGgob3B0aW9ucy5qc29uUGF0aCkpXG4gICAgICA6IGpzb25GaWxlLmNvbnRlbnQ7XG5cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdWYWx1ZSBjYW5ub3QgYmUgZm91bmQuJyk7XG5cbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgbG9nZ2VyLmluZm8odmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuaW5mbyhKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZXQob3B0aW9uczogT3B0aW9uczxDb25maWdDb21tYW5kQXJncz4pOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICBpZiAoIW9wdGlvbnMuanNvblBhdGg/LnRyaW0oKSkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcignSW52YWxpZCBQYXRoLicpO1xuICAgIH1cblxuICAgIGNvbnN0IFtjb25maWcsIGNvbmZpZ1BhdGhdID0gYXdhaXQgZ2V0V29ya3NwYWNlUmF3KG9wdGlvbnMuZ2xvYmFsID8gJ2dsb2JhbCcgOiAnbG9jYWwnKTtcbiAgICBjb25zdCB7IGxvZ2dlciB9ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgaWYgKCFjb25maWcgfHwgIWNvbmZpZ1BhdGgpIHtcbiAgICAgIHRocm93IG5ldyBDb21tYW5kTW9kdWxlRXJyb3IoJ0NvbmZndXJhdGlvbiBmaWxlIGNhbm5vdCBiZSBmb3VuZC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBub3JtYWxpemVVVUlEVmFsdWUgPSAodjogc3RyaW5nIHwgdW5kZWZpbmVkKSA9PiAodiA9PT0gJycgPyByYW5kb21VVUlEKCkgOiBgJHt2fWApO1xuXG4gICAgY29uc3QgdmFsdWUgPVxuICAgICAgb3B0aW9ucy5qc29uUGF0aCA9PT0gJ2NsaS5hbmFseXRpY3NTaGFyaW5nLnV1aWQnXG4gICAgICAgID8gbm9ybWFsaXplVVVJRFZhbHVlKG9wdGlvbnMudmFsdWUpXG4gICAgICAgIDogb3B0aW9ucy52YWx1ZTtcblxuICAgIGNvbnN0IG1vZGlmaWVkID0gY29uZmlnLm1vZGlmeShwYXJzZUpzb25QYXRoKG9wdGlvbnMuanNvblBhdGgpLCBub3JtYWxpemVWYWx1ZSh2YWx1ZSkpO1xuXG4gICAgaWYgKCFtb2RpZmllZCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdWYWx1ZSBjYW5ub3QgYmUgZm91bmQuJyk7XG5cbiAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIGF3YWl0IHZhbGlkYXRlV29ya3NwYWNlKHBhcnNlSnNvbihjb25maWcuY29udGVudCksIG9wdGlvbnMuZ2xvYmFsID8/IGZhbHNlKTtcblxuICAgIGNvbmZpZy5zYXZlKCk7XG5cbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG4vKipcbiAqIFNwbGl0cyBhIEpTT04gcGF0aCBzdHJpbmcgaW50byBmcmFnbWVudHMuIEZyYWdtZW50cyBjYW4gYmUgdXNlZCB0byBnZXQgdGhlIHZhbHVlIHJlZmVyZW5jZWRcbiAqIGJ5IHRoZSBwYXRoLiBGb3IgZXhhbXBsZSwgYSBwYXRoIG9mIFwiYVszXS5mb28uYmFyWzJdXCIgd291bGQgZ2l2ZSB5b3UgYSBmcmFnbWVudCBhcnJheSBvZlxuICogW1wiYVwiLCAzLCBcImZvb1wiLCBcImJhclwiLCAyXS5cbiAqIEBwYXJhbSBwYXRoIFRoZSBKU09OIHN0cmluZyB0byBwYXJzZS5cbiAqIEByZXR1cm5zIHsoc3RyaW5nfG51bWJlcilbXX0gVGhlIGZyYWdtZW50cyBmb3IgdGhlIHN0cmluZy5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHBhcnNlSnNvblBhdGgocGF0aDogc3RyaW5nKTogKHN0cmluZyB8IG51bWJlcilbXSB7XG4gIGNvbnN0IGZyYWdtZW50cyA9IChwYXRoIHx8ICcnKS5zcGxpdCgvXFwuL2cpO1xuICBjb25zdCByZXN1bHQ6IChzdHJpbmcgfCBudW1iZXIpW10gPSBbXTtcblxuICB3aGlsZSAoZnJhZ21lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmcmFnbWVudCA9IGZyYWdtZW50cy5zaGlmdCgpO1xuICAgIGlmIChmcmFnbWVudCA9PSB1bmRlZmluZWQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoID0gZnJhZ21lbnQubWF0Y2goLyhbXltdKykoKFxcWy4qXFxdKSopLyk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcignSW52YWxpZCBKU09OIHBhdGguJyk7XG4gICAgfVxuXG4gICAgcmVzdWx0LnB1c2gobWF0Y2hbMV0pO1xuICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgY29uc3QgaW5kaWNlcyA9IG1hdGNoWzJdXG4gICAgICAgIC5zbGljZSgxLCAtMSlcbiAgICAgICAgLnNwbGl0KCddWycpXG4gICAgICAgIC5tYXAoKHgpID0+ICgvXlxcZCQvLnRlc3QoeCkgPyAreCA6IHgucmVwbGFjZSgvXCJ8Jy9nLCAnJykpKTtcbiAgICAgIHJlc3VsdC5wdXNoKC4uLmluZGljZXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQuZmlsdGVyKChmcmFnbWVudCkgPT4gZnJhZ21lbnQgIT0gbnVsbCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBib29sZWFuIHwgbnVtYmVyKTogSnNvblZhbHVlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgdmFsdWVTdHJpbmcgPSBgJHt2YWx1ZX1gLnRyaW0oKTtcbiAgc3dpdGNoICh2YWx1ZVN0cmluZykge1xuICAgIGNhc2UgJ3RydWUnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2FzZSAnZmFsc2UnOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNhc2UgJ251bGwnOlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoaXNGaW5pdGUoK3ZhbHVlU3RyaW5nKSkge1xuICAgIHJldHVybiArdmFsdWVTdHJpbmc7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIFdlIHVzZSBgSlNPTi5wYXJzZWAgaW5zdGVhZCBvZiBgcGFyc2VKc29uYCBiZWNhdXNlIHRoZSBsYXR0ZXIgd2lsbCBwYXJzZSBVVUlEc1xuICAgIC8vIGFuZCBjb252ZXJ0IHRoZW0gaW50byBhIG51bWJlcmljIGVudGl0aWVzLlxuICAgIC8vIEV4YW1wbGU6IDczYjYxOTc0LTE4MmMtNDhlNC1iNGM2LTMwZGRmMDhjNWM5OCAtPiA3My5cbiAgICAvLyBUaGVzZSB2YWx1ZXMgc2hvdWxkIG5ldmVyIGNvbnRhaW4gY29tbWVudHMsIHRoZXJlZm9yZSB1c2luZyBgSlNPTi5wYXJzZWAgaXMgc2FmZS5cbiAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZVN0cmluZyk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuIl19
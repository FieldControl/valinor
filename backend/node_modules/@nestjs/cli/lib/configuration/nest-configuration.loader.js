"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestConfigurationLoader = void 0;
const readers_1 = require("../readers");
const defaults_1 = require("./defaults");
/**
 * A cache table that maps some reader (by its name along with the config path)
 * to a loaded configuration.
 * This was added because several commands relies on the app's config in order
 * to generate some dynanmic content prior running the command itself.
 */
const loadedConfigsCache = new Map();
class NestConfigurationLoader {
    constructor(reader) {
        this.reader = reader;
    }
    load(name) {
        const cacheEntryKey = `${this.reader.constructor.name}:${name}`;
        const cachedConfig = loadedConfigsCache.get(cacheEntryKey);
        if (cachedConfig) {
            return cachedConfig;
        }
        let loadedConfig;
        const contentOrError = name
            ? this.reader.read(name)
            : this.reader.readAnyOf([
                'nest-cli.json',
                '.nestcli.json',
                '.nest-cli.json',
                'nest.json',
            ]);
        if (contentOrError) {
            const isMissingPermissionsError = contentOrError instanceof readers_1.ReaderFileLackPermissionsError;
            if (isMissingPermissionsError) {
                console.error(contentOrError.message);
                process.exit(1);
            }
            const fileConfig = JSON.parse(contentOrError);
            if (fileConfig.compilerOptions) {
                loadedConfig = {
                    ...defaults_1.defaultConfiguration,
                    ...fileConfig,
                    compilerOptions: {
                        ...defaults_1.defaultConfiguration.compilerOptions,
                        ...fileConfig.compilerOptions,
                    },
                };
            }
            else {
                loadedConfig = {
                    ...defaults_1.defaultConfiguration,
                    ...fileConfig,
                };
            }
        }
        else {
            loadedConfig = defaults_1.defaultConfiguration;
        }
        loadedConfigsCache.set(cacheEntryKey, loadedConfig);
        return loadedConfig;
    }
}
exports.NestConfigurationLoader = NestConfigurationLoader;

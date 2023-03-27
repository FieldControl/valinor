"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateCommandModule = void 0;
const core_1 = require("@angular-devkit/core");
const command_module_1 = require("../../command-builder/command-module");
const schematics_command_module_1 = require("../../command-builder/schematics-command-module");
const command_1 = require("../../command-builder/utilities/command");
class GenerateCommandModule extends schematics_command_module_1.SchematicsCommandModule {
    constructor() {
        super(...arguments);
        this.command = 'generate';
        this.aliases = 'g';
        this.describe = 'Generates and/or modifies files based on a schematic.';
    }
    async builder(argv) {
        let localYargs = (await super.builder(argv)).command({
            command: '$0 <schematic>',
            describe: 'Run the provided schematic.',
            builder: (localYargs) => localYargs
                .positional('schematic', {
                describe: 'The [collection:schematic] to run.',
                type: 'string',
                demandOption: true,
            })
                .strict(),
            handler: (options) => this.handler(options),
        });
        for (const [schematicName, collectionName] of await this.getSchematicsToRegister()) {
            const workflow = this.getOrCreateWorkflowForBuilder(collectionName);
            const collection = workflow.engine.createCollection(collectionName);
            const { description: { schemaJson, aliases: schematicAliases, hidden: schematicHidden, description: schematicDescription, }, } = collection.createSchematic(schematicName, true);
            if (!schemaJson) {
                continue;
            }
            const { 'x-deprecated': xDeprecated, description = schematicDescription, hidden = schematicHidden, } = schemaJson;
            const options = await this.getSchematicOptions(collection, schematicName, workflow);
            localYargs = localYargs.command({
                command: await this.generateCommandString(collectionName, schematicName, options),
                // When 'describe' is set to false, it results in a hidden command.
                describe: hidden === true ? false : typeof description === 'string' ? description : '',
                deprecated: xDeprecated === true || typeof xDeprecated === 'string' ? xDeprecated : false,
                aliases: Array.isArray(schematicAliases)
                    ? await this.generateCommandAliasesStrings(collectionName, schematicAliases)
                    : undefined,
                builder: (localYargs) => this.addSchemaOptionsToCommand(localYargs, options).strict(),
                handler: (options) => this.handler({
                    ...options,
                    schematic: `${collectionName}:${schematicName}`,
                }),
            });
        }
        return localYargs.demandCommand(1, command_1.demandCommandFailureMessage);
    }
    async run(options) {
        const { dryRun, schematic, defaults, force, interactive, ...schematicOptions } = options;
        const [collectionName, schematicName] = this.parseSchematicInfo(schematic);
        if (!collectionName || !schematicName) {
            throw new command_module_1.CommandModuleError('A collection and schematic is required during execution.');
        }
        return this.runSchematic({
            collectionName,
            schematicName,
            schematicOptions,
            executionOptions: {
                dryRun,
                defaults,
                force,
                interactive,
            },
        });
    }
    async getCollectionNames() {
        const [collectionName] = this.parseSchematicInfo(
        // positional = [generate, component] or [generate]
        this.context.args.positional[1]);
        return collectionName ? [collectionName] : [...(await this.getSchematicCollections())];
    }
    async shouldAddCollectionNameAsPartOfCommand() {
        const [collectionNameFromArgs] = this.parseSchematicInfo(
        // positional = [generate, component] or [generate]
        this.context.args.positional[1]);
        const schematicCollectionsFromConfig = await this.getSchematicCollections();
        const collectionNames = await this.getCollectionNames();
        // Only add the collection name as part of the command when it's not a known
        // schematics collection or when it has been provided via the CLI.
        // Ex:`ng generate @schematics/angular:c`
        return (!!collectionNameFromArgs ||
            !collectionNames.some((c) => schematicCollectionsFromConfig.has(c)));
    }
    /**
     * Generate an aliases string array to be passed to the command builder.
     *
     * @example `[component]` or `[@schematics/angular:component]`.
     */
    async generateCommandAliasesStrings(collectionName, schematicAliases) {
        // Only add the collection name as part of the command when it's not a known
        // schematics collection or when it has been provided via the CLI.
        // Ex:`ng generate @schematics/angular:c`
        return (await this.shouldAddCollectionNameAsPartOfCommand())
            ? schematicAliases.map((alias) => `${collectionName}:${alias}`)
            : schematicAliases;
    }
    /**
     * Generate a command string to be passed to the command builder.
     *
     * @example `component [name]` or `@schematics/angular:component [name]`.
     */
    async generateCommandString(collectionName, schematicName, options) {
        const dasherizedSchematicName = core_1.strings.dasherize(schematicName);
        // Only add the collection name as part of the command when it's not a known
        // schematics collection or when it has been provided via the CLI.
        // Ex:`ng generate @schematics/angular:component`
        const commandName = (await this.shouldAddCollectionNameAsPartOfCommand())
            ? collectionName + ':' + dasherizedSchematicName
            : dasherizedSchematicName;
        const positionalArgs = options
            .filter((o) => o.positional !== undefined)
            .map((o) => {
            const label = `${core_1.strings.dasherize(o.name)}${o.type === 'array' ? ' ..' : ''}`;
            return o.required ? `<${label}>` : `[${label}]`;
        })
            .join(' ');
        return `${commandName}${positionalArgs ? ' ' + positionalArgs : ''}`;
    }
    /**
     * Get schematics that can to be registered as subcommands.
     */
    async *getSchematics() {
        const seenNames = new Set();
        for (const collectionName of await this.getCollectionNames()) {
            const workflow = this.getOrCreateWorkflowForBuilder(collectionName);
            const collection = workflow.engine.createCollection(collectionName);
            for (const schematicName of collection.listSchematicNames(true /** includeHidden */)) {
                // If a schematic with this same name is already registered skip.
                if (!seenNames.has(schematicName)) {
                    seenNames.add(schematicName);
                    yield {
                        schematicName,
                        collectionName,
                        schematicAliases: this.listSchematicAliases(collection, schematicName),
                    };
                }
            }
        }
    }
    listSchematicAliases(collection, schematicName) {
        const description = collection.description.schematics[schematicName];
        if (description) {
            return description.aliases && new Set(description.aliases);
        }
        // Extended collections
        if (collection.baseDescriptions) {
            for (const base of collection.baseDescriptions) {
                const description = base.schematics[schematicName];
                if (description) {
                    return description.aliases && new Set(description.aliases);
                }
            }
        }
        return undefined;
    }
    /**
     * Get schematics that should to be registered as subcommands.
     *
     * @returns a sorted list of schematic that needs to be registered as subcommands.
     */
    async getSchematicsToRegister() {
        const schematicsToRegister = [];
        const [, schematicNameFromArgs] = this.parseSchematicInfo(
        // positional = [generate, component] or [generate]
        this.context.args.positional[1]);
        for await (const { schematicName, collectionName, schematicAliases } of this.getSchematics()) {
            if (schematicNameFromArgs &&
                (schematicName === schematicNameFromArgs || (schematicAliases === null || schematicAliases === void 0 ? void 0 : schematicAliases.has(schematicNameFromArgs)))) {
                return [[schematicName, collectionName]];
            }
            schematicsToRegister.push([schematicName, collectionName]);
        }
        // Didn't find the schematic or no schematic name was provided Ex: `ng generate --help`.
        return schematicsToRegister.sort(([nameA], [nameB]) => nameA.localeCompare(nameB, undefined, { sensitivity: 'accent' }));
    }
}
exports.GenerateCommandModule = GenerateCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2dlbmVyYXRlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBK0M7QUFPL0MseUVBSzhDO0FBQzlDLCtGQUd5RDtBQUN6RCxxRUFBc0Y7QUFPdEYsTUFBYSxxQkFDWCxTQUFRLG1EQUF1QjtJQURqQzs7UUFJRSxZQUFPLEdBQUcsVUFBVSxDQUFDO1FBQ3JCLFlBQU8sR0FBRyxHQUFHLENBQUM7UUFDZCxhQUFRLEdBQUcsdURBQXVELENBQUM7SUFtUHJFLENBQUM7SUFoUFUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFVO1FBQy9CLElBQUksVUFBVSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ25ELE9BQU8sRUFBRSxnQkFBZ0I7WUFDekIsUUFBUSxFQUFFLDZCQUE2QjtZQUN2QyxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUN0QixVQUFVO2lCQUNQLFVBQVUsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3ZCLFFBQVEsRUFBRSxvQ0FBb0M7Z0JBQzlDLElBQUksRUFBRSxRQUFRO2dCQUNkLFlBQVksRUFBRSxJQUFJO2FBQ25CLENBQUM7aUJBQ0QsTUFBTSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWtELENBQUM7U0FDdkYsQ0FBQyxDQUFDO1FBRUgsS0FBSyxNQUFNLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUU7WUFDbEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLGNBQWMsQ0FBQyxDQUFD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IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IHN0cmluZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtcbiAgRmlsZVN5c3RlbUNvbGxlY3Rpb25EZXNjcmlwdGlvbixcbiAgRmlsZVN5c3RlbVNjaGVtYXRpY0Rlc2NyaXB0aW9uLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90b29scyc7XG5pbXBvcnQgeyBBcmd1bWVudHNDYW1lbENhc2UsIEFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQge1xuICBDb21tYW5kTW9kdWxlRXJyb3IsXG4gIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbixcbiAgT3B0aW9ucyxcbiAgT3RoZXJPcHRpb25zLFxufSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHtcbiAgU2NoZW1hdGljc0NvbW1hbmRBcmdzLFxuICBTY2hlbWF0aWNzQ29tbWFuZE1vZHVsZSxcbn0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL3NjaGVtYXRpY3MtY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHsgZGVtYW5kQ29tbWFuZEZhaWx1cmVNZXNzYWdlIH0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL3V0aWxpdGllcy9jb21tYW5kJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJy4uLy4uL2NvbW1hbmQtYnVpbGRlci91dGlsaXRpZXMvanNvbi1zY2hlbWEnO1xuXG5pbnRlcmZhY2UgR2VuZXJhdGVDb21tYW5kQXJncyBleHRlbmRzIFNjaGVtYXRpY3NDb21tYW5kQXJncyB7XG4gIHNjaGVtYXRpYz86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEdlbmVyYXRlQ29tbWFuZE1vZHVsZVxuICBleHRlbmRzIFNjaGVtYXRpY3NDb21tYW5kTW9kdWxlXG4gIGltcGxlbWVudHMgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uPEdlbmVyYXRlQ29tbWFuZEFyZ3M+XG57XG4gIGNvbW1hbmQgPSAnZ2VuZXJhdGUnO1xuICBhbGlhc2VzID0gJ2cnO1xuICBkZXNjcmliZSA9ICdHZW5lcmF0ZXMgYW5kL29yIG1vZGlmaWVzIGZpbGVzIGJhc2VkIG9uIGEgc2NoZW1hdGljLic7XG4gIGxvbmdEZXNjcmlwdGlvblBhdGg/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgb3ZlcnJpZGUgYXN5bmMgYnVpbGRlcihhcmd2OiBBcmd2KTogUHJvbWlzZTxBcmd2PEdlbmVyYXRlQ29tbWFuZEFyZ3M+PiB7XG4gICAgbGV0IGxvY2FsWWFyZ3MgPSAoYXdhaXQgc3VwZXIuYnVpbGRlcihhcmd2KSkuY29tbWFuZCh7XG4gICAgICBjb21tYW5kOiAnJDAgPHNjaGVtYXRpYz4nLFxuICAgICAgZGVzY3JpYmU6ICdSdW4gdGhlIHByb3ZpZGVkIHNjaGVtYXRpYy4nLFxuICAgICAgYnVpbGRlcjogKGxvY2FsWWFyZ3MpID0+XG4gICAgICAgIGxvY2FsWWFyZ3NcbiAgICAgICAgICAucG9zaXRpb25hbCgnc2NoZW1hdGljJywge1xuICAgICAgICAgICAgZGVzY3JpYmU6ICdUaGUgW2NvbGxlY3Rpb246c2NoZW1hdGljXSB0byBydW4uJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnN0cmljdCgpLFxuICAgICAgaGFuZGxlcjogKG9wdGlvbnMpID0+IHRoaXMuaGFuZGxlcihvcHRpb25zIGFzIEFyZ3VtZW50c0NhbWVsQ2FzZTxHZW5lcmF0ZUNvbW1hbmRBcmdzPiksXG4gICAgfSk7XG5cbiAgICBmb3IgKGNvbnN0IFtzY2hlbWF0aWNOYW1lLCBjb2xsZWN0aW9uTmFtZV0gb2YgYXdhaXQgdGhpcy5nZXRTY2hlbWF0aWNzVG9SZWdpc3RlcigpKSB7XG4gICAgICBjb25zdCB3b3JrZmxvdyA9IHRoaXMuZ2V0T3JDcmVhdGVXb3JrZmxvd0ZvckJ1aWxkZXIoY29sbGVjdGlvbk5hbWUpO1xuICAgICAgY29uc3QgY29sbGVjdGlvbiA9IHdvcmtmbG93LmVuZ2luZS5jcmVhdGVDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcblxuICAgICAgY29uc3Qge1xuICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgIHNjaGVtYUpzb24sXG4gICAgICAgICAgYWxpYXNlczogc2NoZW1hdGljQWxpYXNlcyxcbiAgICAgICAgICBoaWRkZW46IHNjaGVtYXRpY0hpZGRlbixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogc2NoZW1hdGljRGVzY3JpcHRpb24sXG4gICAgICAgIH0sXG4gICAgICB9ID0gY29sbGVjdGlvbi5jcmVhdGVTY2hlbWF0aWMoc2NoZW1hdGljTmFtZSwgdHJ1ZSk7XG5cbiAgICAgIGlmICghc2NoZW1hSnNvbikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qge1xuICAgICAgICAneC1kZXByZWNhdGVkJzogeERlcHJlY2F0ZWQsXG4gICAgICAgIGRlc2NyaXB0aW9uID0gc2NoZW1hdGljRGVzY3JpcHRpb24sXG4gICAgICAgIGhpZGRlbiA9IHNjaGVtYXRpY0hpZGRlbixcbiAgICAgIH0gPSBzY2hlbWFKc29uO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IHRoaXMuZ2V0U2NoZW1hdGljT3B0aW9ucyhjb2xsZWN0aW9uLCBzY2hlbWF0aWNOYW1lLCB3b3JrZmxvdyk7XG5cbiAgICAgIGxvY2FsWWFyZ3MgPSBsb2NhbFlhcmdzLmNvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBhd2FpdCB0aGlzLmdlbmVyYXRlQ29tbWFuZFN0cmluZyhjb2xsZWN0aW9uTmFtZSwgc2NoZW1hdGljTmFtZSwgb3B0aW9ucyksXG4gICAgICAgIC8vIFdoZW4gJ2Rlc2NyaWJlJyBpcyBzZXQgdG8gZmFsc2UsIGl0IHJlc3VsdHMgaW4gYSBoaWRkZW4gY29tbWFuZC5cbiAgICAgICAgZGVzY3JpYmU6IGhpZGRlbiA9PT0gdHJ1ZSA/IGZhbHNlIDogdHlwZW9mIGRlc2NyaXB0aW9uID09PSAnc3RyaW5nJyA/IGRlc2NyaXB0aW9uIDogJycsXG4gICAgICAgIGRlcHJlY2F0ZWQ6IHhEZXByZWNhdGVkID09PSB0cnVlIHx8IHR5cGVvZiB4RGVwcmVjYXRlZCA9PT0gJ3N0cmluZycgPyB4RGVwcmVjYXRlZCA6IGZhbHNlLFxuICAgICAgICBhbGlhc2VzOiBBcnJheS5pc0FycmF5KHNjaGVtYXRpY0FsaWFzZXMpXG4gICAgICAgICAgPyBhd2FpdCB0aGlzLmdlbmVyYXRlQ29tbWFuZEFsaWFzZXNTdHJpbmdzKGNvbGxlY3Rpb25OYW1lLCBzY2hlbWF0aWNBbGlhc2VzKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBidWlsZGVyOiAobG9jYWxZYXJncykgPT4gdGhpcy5hZGRTY2hlbWFPcHRpb25zVG9Db21tYW5kKGxvY2FsWWFyZ3MsIG9wdGlvbnMpLnN0cmljdCgpLFxuICAgICAgICBoYW5kbGVyOiAob3B0aW9ucykgPT5cbiAgICAgICAgICB0aGlzLmhhbmRsZXIoe1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHNjaGVtYXRpYzogYCR7Y29sbGVjdGlvbk5hbWV9OiR7c2NoZW1hdGljTmFtZX1gLFxuICAgICAgICAgIH0gYXMgQXJndW1lbnRzQ2FtZWxDYXNlPFxuICAgICAgICAgICAgU2NoZW1hdGljc0NvbW1hbmRBcmdzICYge1xuICAgICAgICAgICAgICBzY2hlbWF0aWM6IHN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA+KSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBsb2NhbFlhcmdzLmRlbWFuZENvbW1hbmQoMSwgZGVtYW5kQ29tbWFuZEZhaWx1cmVNZXNzYWdlKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bihvcHRpb25zOiBPcHRpb25zPEdlbmVyYXRlQ29tbWFuZEFyZ3M+ICYgT3RoZXJPcHRpb25zKTogUHJvbWlzZTxudW1iZXIgfCB2b2lkPiB7XG4gICAgY29uc3QgeyBkcnlSdW4sIHNjaGVtYXRpYywgZGVmYXVsdHMsIGZvcmNlLCBpbnRlcmFjdGl2ZSwgLi4uc2NoZW1hdGljT3B0aW9ucyB9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0IFtjb2xsZWN0aW9uTmFtZSwgc2NoZW1hdGljTmFtZV0gPSB0aGlzLnBhcnNlU2NoZW1hdGljSW5mbyhzY2hlbWF0aWMpO1xuXG4gICAgaWYgKCFjb2xsZWN0aW9uTmFtZSB8fCAhc2NoZW1hdGljTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcignQSBjb2xsZWN0aW9uIGFuZCBzY2hlbWF0aWMgaXMgcmVxdWlyZWQgZHVyaW5nIGV4ZWN1dGlvbi4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5ydW5TY2hlbWF0aWMoe1xuICAgICAgY29sbGVjdGlvbk5hbWUsXG4gICAgICBzY2hlbWF0aWNOYW1lLFxuICAgICAgc2NoZW1hdGljT3B0aW9ucyxcbiAgICAgIGV4ZWN1dGlvbk9wdGlvbnM6IHtcbiAgICAgICAgZHJ5UnVuLFxuICAgICAgICBkZWZhdWx0cyxcbiAgICAgICAgZm9yY2UsXG4gICAgICAgIGludGVyYWN0aXZlLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0Q29sbGVjdGlvbk5hbWVzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBbY29sbGVjdGlvbk5hbWVdID0gdGhpcy5wYXJzZVNjaGVtYXRpY0luZm8oXG4gICAgICAvLyBwb3NpdGlvbmFsID0gW2dlbmVyYXRlLCBjb21wb25lbnRdIG9yIFtnZW5lcmF0ZV1cbiAgICAgIHRoaXMuY29udGV4dC5hcmdzLnBvc2l0aW9uYWxbMV0sXG4gICAgKTtcblxuICAgIHJldHVybiBjb2xsZWN0aW9uTmFtZSA/IFtjb2xsZWN0aW9uTmFtZV0gOiBbLi4uKGF3YWl0IHRoaXMuZ2V0U2NoZW1hdGljQ29sbGVjdGlvbnMoKSldO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzaG91bGRBZGRDb2xsZWN0aW9uTmFtZUFzUGFydE9mQ29tbWFuZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBbY29sbGVjdGlvbk5hbWVGcm9tQXJnc10gPSB0aGlzLnBhcnNlU2NoZW1hdGljSW5mbyhcbiAgICAgIC8vIHBvc2l0aW9uYWwgPSBbZ2VuZXJhdGUsIGNvbXBvbmVudF0gb3IgW2dlbmVyYXRlXVxuICAgICAgdGhpcy5jb250ZXh0LmFyZ3MucG9zaXRpb25hbFsxXSxcbiAgICApO1xuXG4gICAgY29uc3Qgc2NoZW1hdGljQ29sbGVjdGlvbnNGcm9tQ29uZmlnID0gYXdhaXQgdGhpcy5nZXRTY2hlbWF0aWNDb2xsZWN0aW9ucygpO1xuICAgIGNvbnN0IGNvbGxlY3Rpb25OYW1lcyA9IGF3YWl0IHRoaXMuZ2V0Q29sbGVjdGlvbk5hbWVzKCk7XG5cbiAgICAvLyBPbmx5IGFkZCB0aGUgY29sbGVjdGlvbiBuYW1lIGFzIHBhcnQgb2YgdGhlIGNvbW1hbmQgd2hlbiBpdCdzIG5vdCBhIGtub3duXG4gICAgLy8gc2NoZW1hdGljcyBjb2xsZWN0aW9uIG9yIHdoZW4gaXQgaGFzIGJlZW4gcHJvdmlkZWQgdmlhIHRoZSBDTEkuXG4gICAgLy8gRXg6YG5nIGdlbmVyYXRlIEBzY2hlbWF0aWNzL2FuZ3VsYXI6Y2BcbiAgICByZXR1cm4gKFxuICAgICAgISFjb2xsZWN0aW9uTmFtZUZyb21BcmdzIHx8XG4gICAgICAhY29sbGVjdGlvbk5hbWVzLnNvbWUoKGMpID0+IHNjaGVtYXRpY0NvbGxlY3Rpb25zRnJvbUNvbmZpZy5oYXMoYykpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhbiBhbGlhc2VzIHN0cmluZyBhcnJheSB0byBiZSBwYXNzZWQgdG8gdGhlIGNvbW1hbmQgYnVpbGRlci5cbiAgICpcbiAgICogQGV4YW1wbGUgYFtjb21wb25lbnRdYCBvciBgW0BzY2hlbWF0aWNzL2FuZ3VsYXI6Y29tcG9uZW50XWAuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGdlbmVyYXRlQ29tbWFuZEFsaWFzZXNTdHJpbmdzKFxuICAgIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgc2NoZW1hdGljQWxpYXNlczogc3RyaW5nW10sXG4gICk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICAvLyBPbmx5IGFkZCB0aGUgY29sbGVjdGlvbiBuYW1lIGFzIHBhcnQgb2YgdGhlIGNvbW1hbmQgd2hlbiBpdCdzIG5vdCBhIGtub3duXG4gICAgLy8gc2NoZW1hdGljcyBjb2xsZWN0aW9uIG9yIHdoZW4gaXQgaGFzIGJlZW4gcHJvdmlkZWQgdmlhIHRoZSBDTEkuXG4gICAgLy8gRXg6YG5nIGdlbmVyYXRlIEBzY2hlbWF0aWNzL2FuZ3VsYXI6Y2BcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuc2hvdWxkQWRkQ29sbGVjdGlvbk5hbWVBc1BhcnRPZkNvbW1hbmQoKSlcbiAgICAgID8gc2NoZW1hdGljQWxpYXNlcy5tYXAoKGFsaWFzKSA9PiBgJHtjb2xsZWN0aW9uTmFtZX06JHthbGlhc31gKVxuICAgICAgOiBzY2hlbWF0aWNBbGlhc2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgY29tbWFuZCBzdHJpbmcgdG8gYmUgcGFzc2VkIHRvIHRoZSBjb21tYW5kIGJ1aWxkZXIuXG4gICAqXG4gICAqIEBleGFtcGxlIGBjb21wb25lbnQgW25hbWVdYCBvciBgQHNjaGVtYXRpY3MvYW5ndWxhcjpjb21wb25lbnQgW25hbWVdYC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVDb21tYW5kU3RyaW5nKFxuICAgIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgc2NoZW1hdGljTmFtZTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IE9wdGlvbltdLFxuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGRhc2hlcml6ZWRTY2hlbWF0aWNOYW1lID0gc3RyaW5ncy5kYXNoZXJpemUoc2NoZW1hdGljTmFtZSk7XG5cbiAgICAvLyBPbmx5IGFkZCB0aGUgY29sbGVjdGlvbiBuYW1lIGFzIHBhcnQgb2YgdGhlIGNvbW1hbmQgd2hlbiBpdCdzIG5vdCBhIGtub3duXG4gICAgLy8gc2NoZW1hdGljcyBjb2xsZWN0aW9uIG9yIHdoZW4gaXQgaGFzIGJlZW4gcHJvdmlkZWQgdmlhIHRoZSBDTEkuXG4gICAgLy8gRXg6YG5nIGdlbmVyYXRlIEBzY2hlbWF0aWNzL2FuZ3VsYXI6Y29tcG9uZW50YFxuICAgIGNvbnN0IGNvbW1hbmROYW1lID0gKGF3YWl0IHRoaXMuc2hvdWxkQWRkQ29sbGVjdGlvbk5hbWVBc1BhcnRPZkNvbW1hbmQoKSlcbiAgICAgID8gY29sbGVjdGlvbk5hbWUgKyAnOicgKyBkYXNoZXJpemVkU2NoZW1hdGljTmFtZVxuICAgICAgOiBkYXNoZXJpemVkU2NoZW1hdGljTmFtZTtcblxuICAgIGNvbnN0IHBvc2l0aW9uYWxBcmdzID0gb3B0aW9uc1xuICAgICAgLmZpbHRlcigobykgPT4gby5wb3NpdGlvbmFsICE9PSB1bmRlZmluZWQpXG4gICAgICAubWFwKChvKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gYCR7c3RyaW5ncy5kYXNoZXJpemUoby5uYW1lKX0ke28udHlwZSA9PT0gJ2FycmF5JyA/ICcgLi4nIDogJyd9YDtcblxuICAgICAgICByZXR1cm4gby5yZXF1aXJlZCA/IGA8JHtsYWJlbH0+YCA6IGBbJHtsYWJlbH1dYDtcbiAgICAgIH0pXG4gICAgICAuam9pbignICcpO1xuXG4gICAgcmV0dXJuIGAke2NvbW1hbmROYW1lfSR7cG9zaXRpb25hbEFyZ3MgPyAnICcgKyBwb3NpdGlvbmFsQXJncyA6ICcnfWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNjaGVtYXRpY3MgdGhhdCBjYW4gdG8gYmUgcmVnaXN0ZXJlZCBhcyBzdWJjb21tYW5kcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgKmdldFNjaGVtYXRpY3MoKTogQXN5bmNHZW5lcmF0b3I8e1xuICAgIHNjaGVtYXRpY05hbWU6IHN0cmluZztcbiAgICBzY2hlbWF0aWNBbGlhc2VzPzogU2V0PHN0cmluZz47XG4gICAgY29sbGVjdGlvbk5hbWU6IHN0cmluZztcbiAgfT4ge1xuICAgIGNvbnN0IHNlZW5OYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGZvciAoY29uc3QgY29sbGVjdGlvbk5hbWUgb2YgYXdhaXQgdGhpcy5nZXRDb2xsZWN0aW9uTmFtZXMoKSkge1xuICAgICAgY29uc3Qgd29ya2Zsb3cgPSB0aGlzLmdldE9yQ3JlYXRlV29ya2Zsb3dGb3JCdWlsZGVyKGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB3b3JrZmxvdy5lbmdpbmUuY3JlYXRlQ29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XG5cbiAgICAgIGZvciAoY29uc3Qgc2NoZW1hdGljTmFtZSBvZiBjb2xsZWN0aW9uLmxpc3RTY2hlbWF0aWNOYW1lcyh0cnVlIC8qKiBpbmNsdWRlSGlkZGVuICovKSkge1xuICAgICAgICAvLyBJZiBhIHNjaGVtYXRpYyB3aXRoIHRoaXMgc2FtZSBuYW1lIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCBza2lwLlxuICAgICAgICBpZiAoIXNlZW5OYW1lcy5oYXMoc2NoZW1hdGljTmFtZSkpIHtcbiAgICAgICAgICBzZWVuTmFtZXMuYWRkKHNjaGVtYXRpY05hbWUpO1xuXG4gICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgc2NoZW1hdGljTmFtZSxcbiAgICAgICAgICAgIGNvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgICAgc2NoZW1hdGljQWxpYXNlczogdGhpcy5saXN0U2NoZW1hdGljQWxpYXNlcyhjb2xsZWN0aW9uLCBzY2hlbWF0aWNOYW1lKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBsaXN0U2NoZW1hdGljQWxpYXNlcyhcbiAgICBjb2xsZWN0aW9uOiBDb2xsZWN0aW9uPEZpbGVTeXN0ZW1Db2xsZWN0aW9uRGVzY3JpcHRpb24sIEZpbGVTeXN0ZW1TY2hlbWF0aWNEZXNjcmlwdGlvbj4sXG4gICAgc2NoZW1hdGljTmFtZTogc3RyaW5nLFxuICApOiBTZXQ8c3RyaW5nPiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uLnNjaGVtYXRpY3Nbc2NoZW1hdGljTmFtZV07XG4gICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICByZXR1cm4gZGVzY3JpcHRpb24uYWxpYXNlcyAmJiBuZXcgU2V0KGRlc2NyaXB0aW9uLmFsaWFzZXMpO1xuICAgIH1cblxuICAgIC8vIEV4dGVuZGVkIGNvbGxlY3Rpb25zXG4gICAgaWYgKGNvbGxlY3Rpb24uYmFzZURlc2NyaXB0aW9ucykge1xuICAgICAgZm9yIChjb25zdCBiYXNlIG9mIGNvbGxlY3Rpb24uYmFzZURlc2NyaXB0aW9ucykge1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGJhc2Uuc2NoZW1hdGljc1tzY2hlbWF0aWNOYW1lXTtcbiAgICAgICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uLmFsaWFzZXMgJiYgbmV3IFNldChkZXNjcmlwdGlvbi5hbGlhc2VzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNjaGVtYXRpY3MgdGhhdCBzaG91bGQgdG8gYmUgcmVnaXN0ZXJlZCBhcyBzdWJjb21tYW5kcy5cbiAgICpcbiAgICogQHJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBzY2hlbWF0aWMgdGhhdCBuZWVkcyB0byBiZSByZWdpc3RlcmVkIGFzIHN1YmNvbW1hbmRzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRTY2hlbWF0aWNzVG9SZWdpc3RlcigpOiBQcm9taXNlPFxuICAgIFtzY2hlbWF0aWNOYW1lOiBzdHJpbmcsIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmddW11cbiAgPiB7XG4gICAgY29uc3Qgc2NoZW1hdGljc1RvUmVnaXN0ZXI6IFtzY2hlbWF0aWNOYW1lOiBzdHJpbmcsIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmddW10gPSBbXTtcbiAgICBjb25zdCBbLCBzY2hlbWF0aWNOYW1lRnJvbUFyZ3NdID0gdGhpcy5wYXJzZVNjaGVtYXRpY0luZm8oXG4gICAgICAvLyBwb3NpdGlvbmFsID0gW2dlbmVyYXRlLCBjb21wb25lbnRdIG9yIFtnZW5lcmF0ZV1cbiAgICAgIHRoaXMuY29udGV4dC5hcmdzLnBvc2l0aW9uYWxbMV0sXG4gICAgKTtcblxuICAgIGZvciBhd2FpdCAoY29uc3QgeyBzY2hlbWF0aWNOYW1lLCBjb2xsZWN0aW9uTmFtZSwgc2NoZW1hdGljQWxpYXNlcyB9IG9mIHRoaXMuZ2V0U2NoZW1hdGljcygpKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHNjaGVtYXRpY05hbWVGcm9tQXJncyAmJlxuICAgICAgICAoc2NoZW1hdGljTmFtZSA9PT0gc2NoZW1hdGljTmFtZUZyb21BcmdzIHx8IHNjaGVtYXRpY0FsaWFzZXM/LmhhcyhzY2hlbWF0aWNOYW1lRnJvbUFyZ3MpKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBbW3NjaGVtYXRpY05hbWUsIGNvbGxlY3Rpb25OYW1lXV07XG4gICAgICB9XG5cbiAgICAgIHNjaGVtYXRpY3NUb1JlZ2lzdGVyLnB1c2goW3NjaGVtYXRpY05hbWUsIGNvbGxlY3Rpb25OYW1lXSk7XG4gICAgfVxuXG4gICAgLy8gRGlkbid0IGZpbmQgdGhlIHNjaGVtYXRpYyBvciBubyBzY2hlbWF0aWMgbmFtZSB3YXMgcHJvdmlkZWQgRXg6IGBuZyBnZW5lcmF0ZSAtLWhlbHBgLlxuICAgIHJldHVybiBzY2hlbWF0aWNzVG9SZWdpc3Rlci5zb3J0KChbbmFtZUFdLCBbbmFtZUJdKSA9PlxuICAgICAgbmFtZUEubG9jYWxlQ29tcGFyZShuYW1lQiwgdW5kZWZpbmVkLCB7IHNlbnNpdGl2aXR5OiAnYWNjZW50JyB9KSxcbiAgICApO1xuICB9XG59XG4iXX0=
"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewCommandModule = void 0;
const node_path_1 = require("node:path");
const command_module_1 = require("../../command-builder/command-module");
const schematics_command_module_1 = require("../../command-builder/schematics-command-module");
const version_1 = require("../../utilities/version");
class NewCommandModule extends schematics_command_module_1.SchematicsCommandModule {
    constructor() {
        super(...arguments);
        this.schematicName = 'ng-new';
        this.scope = command_module_1.CommandScope.Out;
        this.allowPrivateSchematics = true;
        this.command = 'new [name]';
        this.aliases = 'n';
        this.describe = 'Creates a new Angular workspace.';
        this.longDescriptionPath = (0, node_path_1.join)(__dirname, 'long-description.md');
    }
    async builder(argv) {
        const localYargs = (await super.builder(argv)).option('collection', {
            alias: 'c',
            describe: 'A collection of schematics to use in generating the initial application.',
            type: 'string',
        });
        const { options: { collection: collectionNameFromArgs }, } = this.context.args;
        const collectionName = typeof collectionNameFromArgs === 'string'
            ? collectionNameFromArgs
            : await this.getCollectionFromConfig();
        const workflow = await this.getOrCreateWorkflowForBuilder(collectionName);
        const collection = workflow.engine.createCollection(collectionName);
        const options = await this.getSchematicOptions(collection, this.schematicName, workflow);
        return this.addSchemaOptionsToCommand(localYargs, options);
    }
    async run(options) {
        var _a;
        // Register the version of the CLI in the registry.
        const collectionName = (_a = options.collection) !== null && _a !== void 0 ? _a : (await this.getCollectionFromConfig());
        const { dryRun, force, interactive, defaults, collection, ...schematicOptions } = options;
        const workflow = await this.getOrCreateWorkflowForExecution(collectionName, {
            dryRun,
            force,
            interactive,
            defaults,
        });
        workflow.registry.addSmartDefaultProvider('ng-cli-version', () => version_1.VERSION.full);
        // Compatibility check for NPM 7
        if (collectionName === '@schematics/angular' &&
            !schematicOptions.skipInstall &&
            (schematicOptions.packageManager === undefined || schematicOptions.packageManager === 'npm')) {
            this.context.packageManager.ensureCompatibility();
        }
        return this.runSchematic({
            collectionName,
            schematicName: this.schematicName,
            schematicOptions,
            executionOptions: {
                dryRun,
                force,
                interactive,
                defaults,
            },
        });
    }
    /** Find a collection from config that has an `ng-new` schematic. */
    async getCollectionFromConfig() {
        for (const collectionName of await this.getSchematicCollections()) {
            const workflow = this.getOrCreateWorkflowForBuilder(collectionName);
            const collection = workflow.engine.createCollection(collectionName);
            const schematicsInCollection = collection.description.schematics;
            if (Object.keys(schematicsInCollection).includes(this.schematicName)) {
                return collectionName;
            }
        }
        return schematics_command_module_1.DEFAULT_SCHEMATICS_COLLECTION;
    }
}
exports.NewCommandModule = NewCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL25ldy9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgseUNBQWlDO0FBRWpDLHlFQUs4QztBQUM5QywrRkFJeUQ7QUFDekQscURBQWtEO0FBTWxELE1BQWEsZ0JBQ1gsU0FBUSxtREFBdUI7SUFEakM7O1FBSW1CLGtCQUFhLEdBQUcsUUFBUSxDQUFDO1FBQ2pDLFVBQUssR0FBRyw2QkFBWSxDQUFDLEdBQUcsQ0FBQztRQUNmLDJCQUFzQixHQUFHLElBQUksQ0FBQztRQUVqRCxZQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ3ZCLFlBQU8sR0FBRyxHQUFHLENBQUM7UUFDZCxhQUFRLEdBQUcsa0NBQWtDLENBQUM7UUFDOUMsd0JBQW1CLEdBQUcsSUFBQSxnQkFBSSxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBeUUvRCxDQUFDO0lBdkVVLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBVTtRQUMvQixNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7WUFDbEUsS0FBSyxFQUFFLEdBQUc7WUFDVixRQUFRLEVBQUUsMEVBQTBFO1lBQ3BGLElBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUNKLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxzQkFBc0IsRUFBRSxHQUNoRCxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBRXRCLE1BQU0sY0FBYyxHQUNsQixPQUFPLHNCQUFzQixLQUFLLFFBQVE7WUFDeEMsQ0FBQyxDQUFDLHNCQUFzQjtZQUN4QixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUUzQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMxRSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXpGLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUErQzs7UUFDdkQsbURBQW1EO1FBQ25ELE1BQU0sY0FBYyxHQUFHLE1BQUEsT0FBTyxDQUFDLFVBQVUsbUNBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7UUFDcEYsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxnQkFBZ0IsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxjQUFjLEVBQUU7WUFDMUUsTUFBTTtZQUNOLEtBQUs7WUFDTCxXQUFXO1lBQ1gsUUFBUTtTQUNULENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRixnQ0FBZ0M7UUFDaEMsSUFDRSxjQUFjLEtBQUsscUJBQXFCO1lBQ3hDLENBQUMsZ0JBQWdCLENBQUMsV0FBVztZQUM3QixDQUFDLGdCQUFnQixDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksZ0JBQWdCLENBQUMsY0FBYyxLQUFLLEtBQUssQ0FBQyxFQUM1RjtZQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDbkQ7UUFFRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDdkIsY0FBYztZQUNkLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNqQyxnQkFBZ0I7WUFDaEIsZ0JBQWdCLEVBQUU7Z0JBQ2hCLE1BQU07Z0JBQ04sS0FBSztnQkFDTCxXQUFXO2dCQUNYLFFBQVE7YUFDVDtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxvRUFBb0U7SUFDNUQsS0FBSyxDQUFDLHVCQUF1QjtRQUNuQyxLQUFLLE1BQU0sY0FBYyxJQUFJLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUU7WUFDakUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEUsTUFBTSxzQkFBc0IsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQztZQUVqRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUNwRSxPQUFPLGNBQWMsQ0FBQzthQUN2QjtTQUNGO1FBRUQsT0FBTyx5REFBNkIsQ0FBQztJQUN2QyxDQUFDO0NBQ0Y7QUFwRkQsNENBb0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7XG4gIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbixcbiAgQ29tbWFuZFNjb3BlLFxuICBPcHRpb25zLFxuICBPdGhlck9wdGlvbnMsXG59IGZyb20gJy4uLy4uL2NvbW1hbmQtYnVpbGRlci9jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQge1xuICBERUZBVUxUX1NDSEVNQVRJQ1NfQ09MTEVDVElPTixcbiAgU2NoZW1hdGljc0NvbW1hbmRBcmdzLFxuICBTY2hlbWF0aWNzQ29tbWFuZE1vZHVsZSxcbn0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL3NjaGVtYXRpY3MtY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gJy4uLy4uL3V0aWxpdGllcy92ZXJzaW9uJztcblxuaW50ZXJmYWNlIE5ld0NvbW1hbmRBcmdzIGV4dGVuZHMgU2NoZW1hdGljc0NvbW1hbmRBcmdzIHtcbiAgY29sbGVjdGlvbj86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIE5ld0NvbW1hbmRNb2R1bGVcbiAgZXh0ZW5kcyBTY2hlbWF0aWNzQ29tbWFuZE1vZHVsZVxuICBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbjxOZXdDb21tYW5kQXJncz5cbntcbiAgcHJpdmF0ZSByZWFkb25seSBzY2hlbWF0aWNOYW1lID0gJ25nLW5ldyc7XG4gIG92ZXJyaWRlIHNjb3BlID0gQ29tbWFuZFNjb3BlLk91dDtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGFsbG93UHJpdmF0ZVNjaGVtYXRpY3MgPSB0cnVlO1xuXG4gIGNvbW1hbmQgPSAnbmV3IFtuYW1lXSc7XG4gIGFsaWFzZXMgPSAnbic7XG4gIGRlc2NyaWJlID0gJ0NyZWF0ZXMgYSBuZXcgQW5ndWxhciB3b3Jrc3BhY2UuJztcbiAgbG9uZ0Rlc2NyaXB0aW9uUGF0aCA9IGpvaW4oX19kaXJuYW1lLCAnbG9uZy1kZXNjcmlwdGlvbi5tZCcpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGJ1aWxkZXIoYXJndjogQXJndik6IFByb21pc2U8QXJndjxOZXdDb21tYW5kQXJncz4+IHtcbiAgICBjb25zdCBsb2NhbFlhcmdzID0gKGF3YWl0IHN1cGVyLmJ1aWxkZXIoYXJndikpLm9wdGlvbignY29sbGVjdGlvbicsIHtcbiAgICAgIGFsaWFzOiAnYycsXG4gICAgICBkZXNjcmliZTogJ0EgY29sbGVjdGlvbiBvZiBzY2hlbWF0aWNzIHRvIHVzZSBpbiBnZW5lcmF0aW5nIHRoZSBpbml0aWFsIGFwcGxpY2F0aW9uLicsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHtcbiAgICAgIG9wdGlvbnM6IHsgY29sbGVjdGlvbjogY29sbGVjdGlvbk5hbWVGcm9tQXJncyB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQuYXJncztcblxuICAgIGNvbnN0IGNvbGxlY3Rpb25OYW1lID1cbiAgICAgIHR5cGVvZiBjb2xsZWN0aW9uTmFtZUZyb21BcmdzID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGNvbGxlY3Rpb25OYW1lRnJvbUFyZ3NcbiAgICAgICAgOiBhd2FpdCB0aGlzLmdldENvbGxlY3Rpb25Gcm9tQ29uZmlnKCk7XG5cbiAgICBjb25zdCB3b3JrZmxvdyA9IGF3YWl0IHRoaXMuZ2V0T3JDcmVhdGVXb3JrZmxvd0ZvckJ1aWxkZXIoY29sbGVjdGlvbk5hbWUpO1xuICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB3b3JrZmxvdy5lbmdpbmUuY3JlYXRlQ29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IHRoaXMuZ2V0U2NoZW1hdGljT3B0aW9ucyhjb2xsZWN0aW9uLCB0aGlzLnNjaGVtYXRpY05hbWUsIHdvcmtmbG93KTtcblxuICAgIHJldHVybiB0aGlzLmFkZFNjaGVtYU9wdGlvbnNUb0NvbW1hbmQobG9jYWxZYXJncywgb3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBydW4ob3B0aW9uczogT3B0aW9uczxOZXdDb21tYW5kQXJncz4gJiBPdGhlck9wdGlvbnMpOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICAvLyBSZWdpc3RlciB0aGUgdmVyc2lvbiBvZiB0aGUgQ0xJIGluIHRoZSByZWdpc3RyeS5cbiAgICBjb25zdCBjb2xsZWN0aW9uTmFtZSA9IG9wdGlvbnMuY29sbGVjdGlvbiA/PyAoYXdhaXQgdGhpcy5nZXRDb2xsZWN0aW9uRnJvbUNvbmZpZygpKTtcbiAgICBjb25zdCB7IGRyeVJ1biwgZm9yY2UsIGludGVyYWN0aXZlLCBkZWZhdWx0cywgY29sbGVjdGlvbiwgLi4uc2NoZW1hdGljT3B0aW9ucyB9ID0gb3B0aW9ucztcbiAgICBjb25zdCB3b3JrZmxvdyA9IGF3YWl0IHRoaXMuZ2V0T3JDcmVhdGVXb3JrZmxvd0ZvckV4ZWN1dGlvbihjb2xsZWN0aW9uTmFtZSwge1xuICAgICAgZHJ5UnVuLFxuICAgICAgZm9yY2UsXG4gICAgICBpbnRlcmFjdGl2ZSxcbiAgICAgIGRlZmF1bHRzLFxuICAgIH0pO1xuICAgIHdvcmtmbG93LnJlZ2lzdHJ5LmFkZFNtYXJ0RGVmYXVsdFByb3ZpZGVyKCduZy1jbGktdmVyc2lvbicsICgpID0+IFZFUlNJT04uZnVsbCk7XG5cbiAgICAvLyBDb21wYXRpYmlsaXR5IGNoZWNrIGZvciBOUE0gN1xuICAgIGlmIChcbiAgICAgIGNvbGxlY3Rpb25OYW1lID09PSAnQHNjaGVtYXRpY3MvYW5ndWxhcicgJiZcbiAgICAgICFzY2hlbWF0aWNPcHRpb25zLnNraXBJbnN0YWxsICYmXG4gICAgICAoc2NoZW1hdGljT3B0aW9ucy5wYWNrYWdlTWFuYWdlciA9PT0gdW5kZWZpbmVkIHx8IHNjaGVtYXRpY09wdGlvbnMucGFja2FnZU1hbmFnZXIgPT09ICducG0nKVxuICAgICkge1xuICAgICAgdGhpcy5jb250ZXh0LnBhY2thZ2VNYW5hZ2VyLmVuc3VyZUNvbXBhdGliaWxpdHkoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5ydW5TY2hlbWF0aWMoe1xuICAgICAgY29sbGVjdGlvbk5hbWUsXG4gICAgICBzY2hlbWF0aWNOYW1lOiB0aGlzLnNjaGVtYXRpY05hbWUsXG4gICAgICBzY2hlbWF0aWNPcHRpb25zLFxuICAgICAgZXhlY3V0aW9uT3B0aW9uczoge1xuICAgICAgICBkcnlSdW4sXG4gICAgICAgIGZvcmNlLFxuICAgICAgICBpbnRlcmFjdGl2ZSxcbiAgICAgICAgZGVmYXVsdHMsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEZpbmQgYSBjb2xsZWN0aW9uIGZyb20gY29uZmlnIHRoYXQgaGFzIGFuIGBuZy1uZXdgIHNjaGVtYXRpYy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRDb2xsZWN0aW9uRnJvbUNvbmZpZygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGZvciAoY29uc3QgY29sbGVjdGlvbk5hbWUgb2YgYXdhaXQgdGhpcy5nZXRTY2hlbWF0aWNDb2xsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCB3b3JrZmxvdyA9IHRoaXMuZ2V0T3JDcmVhdGVXb3JrZmxvd0ZvckJ1aWxkZXIoY29sbGVjdGlvbk5hbWUpO1xuICAgICAgY29uc3QgY29sbGVjdGlvbiA9IHdvcmtmbG93LmVuZ2luZS5jcmVhdGVDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIGNvbnN0IHNjaGVtYXRpY3NJbkNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uLnNjaGVtYXRpY3M7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhzY2hlbWF0aWNzSW5Db2xsZWN0aW9uKS5pbmNsdWRlcyh0aGlzLnNjaGVtYXRpY05hbWUpKSB7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uTmFtZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gREVGQVVMVF9TQ0hFTUFUSUNTX0NPTExFQ1RJT047XG4gIH1cbn1cbiJdfQ==
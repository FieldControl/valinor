"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const dependencies_1 = require("../utility/dependencies");
const json_file_1 = require("../utility/json-file");
const latest_versions_1 = require("../utility/latest-versions");
const paths_1 = require("../utility/paths");
const workspace_1 = require("../utility/workspace");
const workspace_models_1 = require("../utility/workspace-models");
function updateTsConfig(packageName, ...paths) {
    return (host) => {
        if (!host.exists('tsconfig.json')) {
            return host;
        }
        const file = new json_file_1.JSONFile(host, 'tsconfig.json');
        const jsonPath = ['compilerOptions', 'paths', packageName];
        const value = file.get(jsonPath);
        file.modify(jsonPath, Array.isArray(value) ? [...value, ...paths] : paths);
    };
}
function addDependenciesToPackageJson() {
    return (host) => {
        [
            {
                type: dependencies_1.NodeDependencyType.Dev,
                name: '@angular/compiler-cli',
                version: latest_versions_1.latestVersions.Angular,
            },
            {
                type: dependencies_1.NodeDependencyType.Dev,
                name: '@angular-devkit/build-angular',
                version: latest_versions_1.latestVersions.DevkitBuildAngular,
            },
            {
                type: dependencies_1.NodeDependencyType.Dev,
                name: 'ng-packagr',
                version: latest_versions_1.latestVersions['ng-packagr'],
            },
            {
                type: dependencies_1.NodeDependencyType.Default,
                name: 'tslib',
                version: latest_versions_1.latestVersions['tslib'],
            },
            {
                type: dependencies_1.NodeDependencyType.Dev,
                name: 'typescript',
                version: latest_versions_1.latestVersions['typescript'],
            },
        ].forEach((dependency) => (0, dependencies_1.addPackageJsonDependency)(host, dependency));
        return host;
    };
}
function addLibToWorkspaceFile(options, projectRoot, projectName) {
    return (0, workspace_1.updateWorkspace)((workspace) => {
        workspace.projects.add({
            name: projectName,
            root: projectRoot,
            sourceRoot: `${projectRoot}/src`,
            projectType: workspace_models_1.ProjectType.Library,
            prefix: options.prefix,
            targets: {
                build: {
                    builder: workspace_models_1.Builders.NgPackagr,
                    defaultConfiguration: 'production',
                    options: {
                        project: `${projectRoot}/ng-package.json`,
                    },
                    configurations: {
                        production: {
                            tsConfig: `${projectRoot}/tsconfig.lib.prod.json`,
                        },
                        development: {
                            tsConfig: `${projectRoot}/tsconfig.lib.json`,
                        },
                    },
                },
                test: {
                    builder: workspace_models_1.Builders.Karma,
                    options: {
                        tsConfig: `${projectRoot}/tsconfig.spec.json`,
                        polyfills: ['zone.js', 'zone.js/testing'],
                    },
                },
            },
        });
    });
}
function default_1(options) {
    return async (host) => {
        const prefix = options.prefix;
        // If scoped project (i.e. "@foo/bar"), convert projectDir to "foo/bar".
        const packageName = options.name;
        if (/^@.*\/.*/.test(options.name)) {
            const [, name] = options.name.split('/');
            options.name = name;
        }
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const newProjectRoot = workspace.extensions.newProjectRoot || '';
        let folderName = packageName.startsWith('@') ? packageName.slice(1) : packageName;
        if (/[A-Z]/.test(folderName)) {
            folderName = schematics_1.strings.dasherize(folderName);
        }
        const libDir = options.projectRoot !== undefined
            ? (0, core_1.normalize)(options.projectRoot)
            : (0, core_1.join)((0, core_1.normalize)(newProjectRoot), folderName);
        const distRoot = `dist/${folderName}`;
        const sourceDir = `${libDir}/src/lib`;
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.applyTemplates)({
                ...schematics_1.strings,
                ...options,
                packageName,
                libDir,
                distRoot,
                relativePathToWorkspaceRoot: (0, paths_1.relativePathToWorkspaceRoot)(libDir),
                prefix,
                angularLatestVersion: latest_versions_1.latestVersions.Angular.replace(/~|\^/, ''),
                tsLibLatestVersion: latest_versions_1.latestVersions['tslib'].replace(/~|\^/, ''),
                folderName,
            }),
            (0, schematics_1.move)(libDir),
        ]);
        return (0, schematics_1.chain)([
            (0, schematics_1.mergeWith)(templateSource),
            addLibToWorkspaceFile(options, libDir, packageName),
            options.skipPackageJson ? (0, schematics_1.noop)() : addDependenciesToPackageJson(),
            options.skipTsConfig ? (0, schematics_1.noop)() : updateTsConfig(packageName, distRoot),
            (0, schematics_1.schematic)('module', {
                name: options.name,
                commonModule: false,
                flat: true,
                path: sourceDir,
                project: packageName,
            }),
            (0, schematics_1.schematic)('component', {
                name: options.name,
                selector: `${prefix}-${options.name}`,
                inlineStyle: true,
                inlineTemplate: true,
                flat: true,
                path: sourceDir,
                export: true,
                project: packageName,
            }),
            (0, schematics_1.schematic)('service', {
                name: options.name,
                flat: true,
                path: sourceDir,
                project: packageName,
            }),
            (_tree, context) => {
                if (!options.skipPackageJson && !options.skipInstall) {
                    context.addTask(new tasks_1.NodePackageInstallTask());
                }
            },
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvbGlicmFyeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILCtDQUF1RDtBQUN2RCwyREFhb0M7QUFDcEMsNERBQTBFO0FBQzFFLDBEQUF1RjtBQUN2RixvREFBZ0Q7QUFDaEQsZ0VBQTREO0FBQzVELDRDQUErRDtBQUMvRCxvREFBcUU7QUFDckUsa0VBQW9FO0FBR3BFLFNBQVMsY0FBYyxDQUFDLFdBQW1CLEVBQUUsR0FBRyxLQUFlO0lBQzdELE9BQU8sQ0FBQyxJQUFVLEVBQUUsRUFBRTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxvQkFBUSxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNqRCxNQUFNLFFBQVEsR0FBRyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMzRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0UsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsNEJBQTRCO0lBQ25DLE9BQU8sQ0FBQyxJQUFVLEVBQUUsRUFBRTtRQUNwQjtZQUNFO2dCQUNFLElBQUksRUFBRSxpQ0FBa0IsQ0FBQyxHQUFHO2dCQUM1QixJQUFJLEVBQUUsdUJBQXVC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QUFDLGVBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7b0JBQ3BELE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSw4QkFBc0IsRUFBRSxDQUFDLENBQUM7aUJBQy9DO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUE5RUQsNEJBOEVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGpvaW4sIG5vcm1hbGl6ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFRyZWUsXG4gIGFwcGx5LFxuICBhcHBseVRlbXBsYXRlcyxcbiAgY2hhaW4sXG4gIG1lcmdlV2l0aCxcbiAgbW92ZSxcbiAgbm9vcCxcbiAgc2NoZW1hdGljLFxuICBzdHJpbmdzLFxuICB1cmwsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgeyBOb2RlRGVwZW5kZW5jeVR5cGUsIGFkZFBhY2thZ2VKc29uRGVwZW5kZW5jeSB9IGZyb20gJy4uL3V0aWxpdHkvZGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IEpTT05GaWxlIH0gZnJvbSAnLi4vdXRpbGl0eS9qc29uLWZpbGUnO1xuaW1wb3J0IHsgbGF0ZXN0VmVyc2lvbnMgfSBmcm9tICcuLi91dGlsaXR5L2xhdGVzdC12ZXJzaW9ucyc7XG5pbXBvcnQgeyByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QgfSBmcm9tICcuLi91dGlsaXR5L3BhdGhzJztcbmltcG9ydCB7IGdldFdvcmtzcGFjZSwgdXBkYXRlV29ya3NwYWNlIH0gZnJvbSAnLi4vdXRpbGl0eS93b3Jrc3BhY2UnO1xuaW1wb3J0IHsgQnVpbGRlcnMsIFByb2plY3RUeXBlIH0gZnJvbSAnLi4vdXRpbGl0eS93b3Jrc3BhY2UtbW9kZWxzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBMaWJyYXJ5T3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuZnVuY3Rpb24gdXBkYXRlVHNDb25maWcocGFja2FnZU5hbWU6IHN0cmluZywgLi4ucGF0aHM6IHN0cmluZ1tdKSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGlmICghaG9zdC5leGlzdHMoJ3RzY29uZmlnLmpzb24nKSkge1xuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IG5ldyBKU09ORmlsZShob3N0LCAndHNjb25maWcuanNvbicpO1xuICAgIGNvbnN0IGpzb25QYXRoID0gWydjb21waWxlck9wdGlvbnMnLCAncGF0aHMnLCBwYWNrYWdlTmFtZV07XG4gICAgY29uc3QgdmFsdWUgPSBmaWxlLmdldChqc29uUGF0aCk7XG4gICAgZmlsZS5tb2RpZnkoanNvblBhdGgsIEFycmF5LmlzQXJyYXkodmFsdWUpID8gWy4uLnZhbHVlLCAuLi5wYXRoc10gOiBwYXRocyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZERlcGVuZGVuY2llc1RvUGFja2FnZUpzb24oKSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogTm9kZURlcGVuZGVuY3lUeXBlLkRldixcbiAgICAgICAgbmFtZTogJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaScsXG4gICAgICAgIHZlcnNpb246IGxhdGVzdFZlcnNpb25zLkFuZ3VsYXIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBOb2RlRGVwZW5kZW5jeVR5cGUuRGV2LFxuICAgICAgICBuYW1lOiAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInLFxuICAgICAgICB2ZXJzaW9uOiBsYXRlc3RWZXJzaW9ucy5EZXZraXRCdWlsZEFuZ3VsYXIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBOb2RlRGVwZW5kZW5jeVR5cGUuRGV2LFxuICAgICAgICBuYW1lOiAnbmctcGFja2FncicsXG4gICAgICAgIHZlcnNpb246IGxhdGVzdFZlcnNpb25zWyduZy1wYWNrYWdyJ10sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBOb2RlRGVwZW5kZW5jeVR5cGUuRGVmYXVsdCxcbiAgICAgICAgbmFtZTogJ3RzbGliJyxcbiAgICAgICAgdmVyc2lvbjogbGF0ZXN0VmVyc2lvbnNbJ3RzbGliJ10sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBOb2RlRGVwZW5kZW5jeVR5cGUuRGV2LFxuICAgICAgICBuYW1lOiAndHlwZXNjcmlwdCcsXG4gICAgICAgIHZlcnNpb246IGxhdGVzdFZlcnNpb25zWyd0eXBlc2NyaXB0J10sXG4gICAgICB9LFxuICAgIF0uZm9yRWFjaCgoZGVwZW5kZW5jeSkgPT4gYWRkUGFja2FnZUpzb25EZXBlbmRlbmN5KGhvc3QsIGRlcGVuZGVuY3kpKTtcblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGRMaWJUb1dvcmtzcGFjZUZpbGUoXG4gIG9wdGlvbnM6IExpYnJhcnlPcHRpb25zLFxuICBwcm9qZWN0Um9vdDogc3RyaW5nLFxuICBwcm9qZWN0TmFtZTogc3RyaW5nLFxuKTogUnVsZSB7XG4gIHJldHVybiB1cGRhdGVXb3Jrc3BhY2UoKHdvcmtzcGFjZSkgPT4ge1xuICAgIHdvcmtzcGFjZS5wcm9qZWN0cy5hZGQoe1xuICAgICAgbmFtZTogcHJvamVjdE5hbWUsXG4gICAgICByb290OiBwcm9qZWN0Um9vdCxcbiAgICAgIHNvdXJjZVJvb3Q6IGAke3Byb2plY3RSb290fS9zcmNgLFxuICAgICAgcHJvamVjdFR5cGU6IFByb2plY3RUeXBlLkxpYnJhcnksXG4gICAgICBwcmVmaXg6IG9wdGlvbnMucHJlZml4LFxuICAgICAgdGFyZ2V0czoge1xuICAgICAgICBidWlsZDoge1xuICAgICAgICAgIGJ1aWxkZXI6IEJ1aWxkZXJzLk5nUGFja2FncixcbiAgICAgICAgICBkZWZhdWx0Q29uZmlndXJhdGlvbjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHByb2plY3Q6IGAke3Byb2plY3RSb290fS9uZy1wYWNrYWdlLmpzb25gLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29uZmlndXJhdGlvbnM6IHtcbiAgICAgICAgICAgIHByb2R1Y3Rpb246IHtcbiAgICAgICAgICAgICAgdHNDb25maWc6IGAke3Byb2plY3RSb290fS90c2NvbmZpZy5saWIucHJvZC5qc29uYCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXZlbG9wbWVudDoge1xuICAgICAgICAgICAgICB0c0NvbmZpZzogYCR7cHJvamVjdFJvb3R9L3RzY29uZmlnLmxpYi5qc29uYCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdGVzdDoge1xuICAgICAgICAgIGJ1aWxkZXI6IEJ1aWxkZXJzLkthcm1hLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRzQ29uZmlnOiBgJHtwcm9qZWN0Um9vdH0vdHNjb25maWcuc3BlYy5qc29uYCxcbiAgICAgICAgICAgIHBvbHlmaWxsczogWyd6b25lLmpzJywgJ3pvbmUuanMvdGVzdGluZyddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IExpYnJhcnlPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGNvbnN0IHByZWZpeCA9IG9wdGlvbnMucHJlZml4O1xuXG4gICAgLy8gSWYgc2NvcGVkIHByb2plY3QgKGkuZS4gXCJAZm9vL2JhclwiKSwgY29udmVydCBwcm9qZWN0RGlyIHRvIFwiZm9vL2JhclwiLlxuICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgIGlmICgvXkAuKlxcLy4qLy50ZXN0KG9wdGlvbnMubmFtZSkpIHtcbiAgICAgIGNvbnN0IFssIG5hbWVdID0gb3B0aW9ucy5uYW1lLnNwbGl0KCcvJyk7XG4gICAgICBvcHRpb25zLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShob3N0KTtcbiAgICBjb25zdCBuZXdQcm9qZWN0Um9vdCA9ICh3b3Jrc3BhY2UuZXh0ZW5zaW9ucy5uZXdQcm9qZWN0Um9vdCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpIHx8ICcnO1xuXG4gICAgbGV0IGZvbGRlck5hbWUgPSBwYWNrYWdlTmFtZS5zdGFydHNXaXRoKCdAJykgPyBwYWNrYWdlTmFtZS5zbGljZSgxKSA6IHBhY2thZ2VOYW1lO1xuICAgIGlmICgvW0EtWl0vLnRlc3QoZm9sZGVyTmFtZSkpIHtcbiAgICAgIGZvbGRlck5hbWUgPSBzdHJpbmdzLmRhc2hlcml6ZShmb2xkZXJOYW1lKTtcbiAgICB9XG5cbiAgICBjb25zdCBsaWJEaXIgPVxuICAgICAgb3B0aW9ucy5wcm9qZWN0Um9vdCAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gbm9ybWFsaXplKG9wdGlvbnMucHJvamVjdFJvb3QpXG4gICAgICAgIDogam9pbihub3JtYWxpemUobmV3UHJvamVjdFJvb3QpLCBmb2xkZXJOYW1lKTtcblxuICAgIGNvbnN0IGRpc3RSb290ID0gYGRpc3QvJHtmb2xkZXJOYW1lfWA7XG4gICAgY29uc3Qgc291cmNlRGlyID0gYCR7bGliRGlyfS9zcmMvbGliYDtcblxuICAgIGNvbnN0IHRlbXBsYXRlU291cmNlID0gYXBwbHkodXJsKCcuL2ZpbGVzJyksIFtcbiAgICAgIGFwcGx5VGVtcGxhdGVzKHtcbiAgICAgICAgLi4uc3RyaW5ncyxcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgcGFja2FnZU5hbWUsXG4gICAgICAgIGxpYkRpcixcbiAgICAgICAgZGlzdFJvb3QsXG4gICAgICAgIHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdDogcmVsYXRpdmVQYXRoVG9Xb3Jrc3BhY2VSb290KGxpYkRpciksXG4gICAgICAgIHByZWZpeCxcbiAgICAgICAgYW5ndWxhckxhdGVzdFZlcnNpb246IGxhdGVzdFZlcnNpb25zLkFuZ3VsYXIucmVwbGFjZSgvfnxcXF4vLCAnJyksXG4gICAgICAgIHRzTGliTGF0ZXN0VmVyc2lvbjogbGF0ZXN0VmVyc2lvbnNbJ3RzbGliJ10ucmVwbGFjZSgvfnxcXF4vLCAnJyksXG4gICAgICAgIGZvbGRlck5hbWUsXG4gICAgICB9KSxcbiAgICAgIG1vdmUobGliRGlyKSxcbiAgICBdKTtcblxuICAgIHJldHVybiBjaGFpbihbXG4gICAgICBtZXJnZVdpdGgodGVtcGxhdGVTb3VyY2UpLFxuICAgICAgYWRkTGliVG9Xb3Jrc3BhY2VGaWxlKG9wdGlvbnMsIGxpYkRpciwgcGFja2FnZU5hbWUpLFxuICAgICAgb3B0aW9ucy5za2lwUGFja2FnZUpzb24gPyBub29wKCkgOiBhZGREZXBlbmRlbmNpZXNUb1BhY2thZ2VKc29uKCksXG4gICAgICBvcHRpb25zLnNraXBUc0NvbmZpZyA/IG5vb3AoKSA6IHVwZGF0ZVRzQ29uZmlnKHBhY2thZ2VOYW1lLCBkaXN0Um9vdCksXG4gICAgICBzY2hlbWF0aWMoJ21vZHVsZScsIHtcbiAgICAgICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgICBjb21tb25Nb2R1bGU6IGZhbHNlLFxuICAgICAgICBmbGF0OiB0cnVlLFxuICAgICAgICBwYXRoOiBzb3VyY2VEaXIsXG4gICAgICAgIHByb2plY3Q6IHBhY2thZ2VOYW1lLFxuICAgICAgfSksXG4gICAgICBzY2hlbWF0aWMoJ2NvbXBvbmVudCcsIHtcbiAgICAgICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgICBzZWxlY3RvcjogYCR7cHJlZml4fS0ke29wdGlvbnMubmFtZX1gLFxuICAgICAgICBpbmxpbmVTdHlsZTogdHJ1ZSxcbiAgICAgICAgaW5saW5lVGVtcGxhdGU6IHRydWUsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgICAgIHBhdGg6IHNvdXJjZURpcixcbiAgICAgICAgZXhwb3J0OiB0cnVlLFxuICAgICAgICBwcm9qZWN0OiBwYWNrYWdlTmFtZSxcbiAgICAgIH0pLFxuICAgICAgc2NoZW1hdGljKCdzZXJ2aWNlJywge1xuICAgICAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgICAgIHBhdGg6IHNvdXJjZURpcixcbiAgICAgICAgcHJvamVjdDogcGFja2FnZU5hbWUsXG4gICAgICB9KSxcbiAgICAgIChfdHJlZTogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcFBhY2thZ2VKc29uICYmICFvcHRpb25zLnNraXBJbnN0YWxsKSB7XG4gICAgICAgICAgY29udGV4dC5hZGRUYXNrKG5ldyBOb2RlUGFja2FnZUluc3RhbGxUYXNrKCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0pO1xuICB9O1xufVxuIl19
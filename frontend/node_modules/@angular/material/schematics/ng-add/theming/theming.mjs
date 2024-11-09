"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTypographyClass = exports.addThemeToAppStyles = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const path_1 = require("path");
const create_custom_theme_1 = require("./create-custom-theme");
/** Path segment that can be found in paths that refer to a prebuilt theme. */
const prebuiltThemePathSegment = '@angular/material/prebuilt-themes';
/** Default file name of the custom theme that can be generated. */
const defaultCustomThemeFilename = 'custom-theme.scss';
/** Add pre-built styles to the main project style file. */
function addThemeToAppStyles(options) {
    return (host, context) => {
        const themeName = options.theme || 'indigo-pink';
        return themeName === 'custom'
            ? insertCustomTheme(options.project, host, context.logger)
            : insertPrebuiltTheme(options.project, themeName, context.logger);
    };
}
exports.addThemeToAppStyles = addThemeToAppStyles;
/** Adds the global typography class to the body element. */
function addTypographyClass(options) {
    return async (host) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        const projectIndexFiles = (0, schematics_2.getProjectIndexFiles)(project);
        if (!projectIndexFiles.length) {
            throw new schematics_1.SchematicsException('No project index HTML file could be found.');
        }
        if (options.typography) {
            projectIndexFiles.forEach(path => (0, schematics_2.addBodyClass)(host, path, 'mat-typography'));
        }
    };
}
exports.addTypographyClass = addTypographyClass;
/**
 * Insert a custom theme to project style file. If no valid style file could be found, a new
 * Scss file for the custom theme will be created.
 */
async function insertCustomTheme(projectName, host, logger) {
    const workspace = await (0, workspace_1.getWorkspace)(host);
    const project = (0, schematics_2.getProjectFromWorkspace)(workspace, projectName);
    const stylesPath = (0, schematics_2.getProjectStyleFile)(project, 'scss');
    const themeContent = (0, create_custom_theme_1.createCustomTheme)(projectName);
    if (!stylesPath) {
        if (!project.sourceRoot) {
            throw new schematics_1.SchematicsException(`Could not find source root for project: "${projectName}". ` +
                `Please make sure that the "sourceRoot" property is set in the workspace config.`);
        }
        // Normalize the path through the devkit utilities because we want to avoid having
        // unnecessary path segments and windows backslash delimiters.
        const customThemePath = (0, core_1.normalize)((0, path_1.join)(project.sourceRoot, defaultCustomThemeFilename));
        if (host.exists(customThemePath)) {
            logger.warn(`Cannot create a custom Angular Material theme because
          ${customThemePath} already exists. Skipping custom theme generation.`);
            return (0, schematics_1.noop)();
        }
        host.create(customThemePath, themeContent);
        return addThemeStyleToTarget(projectName, 'build', customThemePath, logger);
    }
    const insertion = new change_1.InsertChange(stylesPath, 0, themeContent);
    const recorder = host.beginUpdate(stylesPath);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
    return (0, schematics_1.noop)();
}
/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(project, theme, logger) {
    const themePath = `@angular/material/prebuilt-themes/${theme}.css`;
    return (0, schematics_1.chain)([
        addThemeStyleToTarget(project, 'build', themePath, logger),
        addThemeStyleToTarget(project, 'test', themePath, logger),
    ]);
}
/** Adds a theming style entry to the given project target options. */
function addThemeStyleToTarget(projectName, targetName, assetPath, logger) {
    return (0, workspace_1.updateWorkspace)(workspace => {
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, projectName);
        // Do not update the builder options in case the target does not use the default CLI builder.
        if (!validateDefaultTargetBuilder(project, targetName, logger)) {
            return;
        }
        const targetOptions = (0, schematics_2.getProjectTargetOptions)(project, targetName);
        const styles = targetOptions['styles'];
        if (!styles) {
            targetOptions['styles'] = [assetPath];
        }
        else {
            const existingStyles = styles.map(s => (typeof s === 'string' ? s : s.input));
            for (let [index, stylePath] of existingStyles.entries()) {
                // If the given asset is already specified in the styles, we don't need to do anything.
                if (stylePath === assetPath) {
                    return;
                }
                // In case a prebuilt theme is already set up, we can safely replace the theme with the new
                // theme file. If a custom theme is set up, we are not able to safely replace the custom
                // theme because these files can contain custom styles, while prebuilt themes are
                // always packaged and considered replaceable.
                if (stylePath.includes(defaultCustomThemeFilename)) {
                    logger.error(`Could not add the selected theme to the CLI project ` +
                        `configuration because there is already a custom theme file referenced.`);
                    logger.info(`Please manually add the following style file to your configuration:`);
                    logger.info(`    ${assetPath}`);
                    return;
                }
                else if (stylePath.includes(prebuiltThemePathSegment)) {
                    styles.splice(index, 1);
                }
            }
            styles.unshift(assetPath);
        }
    });
}
/**
 * Validates that the specified project target is configured with the default builders which are
 * provided by the Angular CLI. If the configured builder does not match the default builder,
 * this function can either throw or just show a warning.
 */
function validateDefaultTargetBuilder(project, targetName, logger) {
    const targets = targetName === 'test' ? (0, schematics_2.getProjectTestTargets)(project) : (0, schematics_2.getProjectBuildTargets)(project);
    const isDefaultBuilder = targets.length > 0;
    // Because the build setup for the Angular CLI can be customized by developers, we can't know
    // where to put the theme file in the workspace configuration if custom builders are being
    // used. In case the builder has been changed for the "build" target, we throw an error and
    // exit because setting up a theme is a primary goal of `ng-add`. Otherwise if just the "test"
    // builder has been changed, we warn because a theme is not mandatory for running tests
    // with Material. See: https://github.com/angular/components/issues/14176
    if (!isDefaultBuilder && targetName === 'build') {
        throw new schematics_1.SchematicsException(`Your project is not using the default builders for ` +
            `"${targetName}". The Angular Material schematics cannot add a theme to the workspace ` +
            `configuration if the builder has been changed.`);
    }
    else if (!isDefaultBuilder) {
        // for non-build targets we gracefully report the error without actually aborting the
        // setup schematic. This is because a theme is not mandatory for running tests.
        logger.warn(`Your project is not using the default builders for "${targetName}". This ` +
            `means that we cannot add the configured theme to the "${targetName}" target.`);
    }
    return isDefaultBuilder;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLWFkZC90aGVtaW5nL3RoZW1pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQW9FO0FBQ3BFLDJEQU9vQztBQUNwQyx3REFRaUM7QUFDakMsK0RBQWdFO0FBQ2hFLHFFQUFvRjtBQUNwRiwrQkFBMEI7QUFFMUIsK0RBQXdEO0FBRXhELDhFQUE4RTtBQUM5RSxNQUFNLHdCQUF3QixHQUFHLG1DQUFtQyxDQUFDO0FBRXJFLG1FQUFtRTtBQUNuRSxNQUFNLDBCQUEwQixHQUFHLG1CQUFtQixDQUFDO0FBRXZELDJEQUEyRDtBQUMzRCxTQUFnQixtQkFBbUIsQ0FBQyxPQUFlO0lBQ2pELE9BQU8sQ0FBQyxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQy9DLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDO1FBQ2pELE9BQU8sU0FBUyxLQUFLLFFBQVE7WUFDM0IsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDMUQsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0RSxDQUFDLENBQUM7QUFDSixDQUFDO0FBUEQsa0RBT0M7QUFFRCw0REFBNEQ7QUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsT0FBZTtJQUNoRCxPQUFPLEtBQUssRUFBRSxJQUFVLEVBQUUsRUFBRTtRQUMxQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsd0JBQVksRUFBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFBLG9DQUF1QixFQUFDLFNBQVMs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TUFBTSxDQUFDLElBQUksQ0FDVCx1REFBdUQsVUFBVSxVQUFVO1lBQ3pFLHlEQUF5RCxVQUFVLFdBQVcsQ0FDakYsQ0FBQztJQUNKLENBQUM7SUFFRCxPQUFPLGdCQUFnQixDQUFDO0FBQzFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtub3JtYWxpemUsIGxvZ2dpbmcsIHdvcmtzcGFjZXN9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIGNoYWluLFxuICBub29wLFxuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhZGRCb2R5Q2xhc3MsXG4gIGdldFByb2plY3RGcm9tV29ya3NwYWNlLFxuICBnZXRQcm9qZWN0U3R5bGVGaWxlLFxuICBnZXRQcm9qZWN0VGFyZ2V0T3B0aW9ucyxcbiAgZ2V0UHJvamVjdEluZGV4RmlsZXMsXG4gIGdldFByb2plY3RUZXN0VGFyZ2V0cyxcbiAgZ2V0UHJvamVjdEJ1aWxkVGFyZ2V0cyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtJbnNlcnRDaGFuZ2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9jaGFuZ2UnO1xuaW1wb3J0IHtnZXRXb3Jrc3BhY2UsIHVwZGF0ZVdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTY2hlbWF9IGZyb20gJy4uL3NjaGVtYSc7XG5pbXBvcnQge2NyZWF0ZUN1c3RvbVRoZW1lfSBmcm9tICcuL2NyZWF0ZS1jdXN0b20tdGhlbWUnO1xuXG4vKiogUGF0aCBzZWdtZW50IHRoYXQgY2FuIGJlIGZvdW5kIGluIHBhdGhzIHRoYXQgcmVmZXIgdG8gYSBwcmVidWlsdCB0aGVtZS4gKi9cbmNvbnN0IHByZWJ1aWx0VGhlbWVQYXRoU2VnbWVudCA9ICdAYW5ndWxhci9tYXRlcmlhbC9wcmVidWlsdC10aGVtZXMnO1xuXG4vKiogRGVmYXVsdCBmaWxlIG5hbWUgb2YgdGhlIGN1c3RvbSB0aGVtZSB0aGF0IGNhbiBiZSBnZW5lcmF0ZWQuICovXG5jb25zdCBkZWZhdWx0Q3VzdG9tVGhlbWVGaWxlbmFtZSA9ICdjdXN0b20tdGhlbWUuc2Nzcyc7XG5cbi8qKiBBZGQgcHJlLWJ1aWx0IHN0eWxlcyB0byB0aGUgbWFpbiBwcm9qZWN0IHN0eWxlIGZpbGUuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVGhlbWVUb0FwcFN0eWxlcyhvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3QgdGhlbWVOYW1lID0gb3B0aW9ucy50aGVtZSB8fCAnaW5kaWdvLXBpbmsnO1xuICAgIHJldHVybiB0aGVtZU5hbWUgPT09ICdjdXN0b20nXG4gICAgICA/IGluc2VydEN1c3RvbVRoZW1lKG9wdGlvbnMucHJvamVjdCwgaG9zdCwgY29udGV4dC5sb2dnZXIpXG4gICAgICA6IGluc2VydFByZWJ1aWx0VGhlbWUob3B0aW9ucy5wcm9qZWN0LCB0aGVtZU5hbWUsIGNvbnRleHQubG9nZ2VyKTtcbiAgfTtcbn1cblxuLyoqIEFkZHMgdGhlIGdsb2JhbCB0eXBvZ3JhcGh5IGNsYXNzIHRvIHRoZSBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVHlwb2dyYXBoeUNsYXNzKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgb3B0aW9ucy5wcm9qZWN0KTtcbiAgICBjb25zdCBwcm9qZWN0SW5kZXhGaWxlcyA9IGdldFByb2plY3RJbmRleEZpbGVzKHByb2plY3QpO1xuXG4gICAgaWYgKCFwcm9qZWN0SW5kZXhGaWxlcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdObyBwcm9qZWN0IGluZGV4IEhUTUwgZmlsZSBjb3VsZCBiZSBmb3VuZC4nKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50eXBvZ3JhcGh5KSB7XG4gICAgICBwcm9qZWN0SW5kZXhGaWxlcy5mb3JFYWNoKHBhdGggPT4gYWRkQm9keUNsYXNzKGhvc3QsIHBhdGgsICdtYXQtdHlwb2dyYXBoeScpKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogSW5zZXJ0IGEgY3VzdG9tIHRoZW1lIHRvIHByb2plY3Qgc3R5bGUgZmlsZS4gSWYgbm8gdmFsaWQgc3R5bGUgZmlsZSBjb3VsZCBiZSBmb3VuZCwgYSBuZXdcbiAqIFNjc3MgZmlsZSBmb3IgdGhlIGN1c3RvbSB0aGVtZSB3aWxsIGJlIGNyZWF0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluc2VydEN1c3RvbVRoZW1lKFxuICBwcm9qZWN0TmFtZTogc3RyaW5nLFxuICBob3N0OiBUcmVlLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogUHJvbWlzZTxSdWxlPiB7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShob3N0KTtcbiAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgcHJvamVjdE5hbWUpO1xuICBjb25zdCBzdHlsZXNQYXRoID0gZ2V0UHJvamVjdFN0eWxlRmlsZShwcm9qZWN0LCAnc2NzcycpO1xuICBjb25zdCB0aGVtZUNvbnRlbnQgPSBjcmVhdGVDdXN0b21UaGVtZShwcm9qZWN0TmFtZSk7XG5cbiAgaWYgKCFzdHlsZXNQYXRoKSB7XG4gICAgaWYgKCFwcm9qZWN0LnNvdXJjZVJvb3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgICBgQ291bGQgbm90IGZpbmQgc291cmNlIHJvb3QgZm9yIHByb2plY3Q6IFwiJHtwcm9qZWN0TmFtZX1cIi4gYCArXG4gICAgICAgICAgYFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB0aGUgXCJzb3VyY2VSb290XCIgcHJvcGVydHkgaXMgc2V0IGluIHRoZSB3b3Jrc3BhY2UgY29uZmlnLmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aCB0aHJvdWdoIHRoZSBkZXZraXQgdXRpbGl0aWVzIGJlY2F1c2Ugd2Ugd2FudCB0byBhdm9pZCBoYXZpbmdcbiAgICAvLyB1bm5lY2Vzc2FyeSBwYXRoIHNlZ21lbnRzIGFuZCB3aW5kb3dzIGJhY2tzbGFzaCBkZWxpbWl0ZXJzLlxuICAgIGNvbnN0IGN1c3RvbVRoZW1lUGF0aCA9IG5vcm1hbGl6ZShqb2luKHByb2plY3Quc291cmNlUm9vdCwgZGVmYXVsdEN1c3RvbVRoZW1lRmlsZW5hbWUpKTtcblxuICAgIGlmIChob3N0LmV4aXN0cyhjdXN0b21UaGVtZVBhdGgpKSB7XG4gICAgICBsb2dnZXIud2FybihgQ2Fubm90IGNyZWF0ZSBhIGN1c3RvbSBBbmd1bGFyIE1hdGVyaWFsIHRoZW1lIGJlY2F1c2VcbiAgICAgICAgICAke2N1c3RvbVRoZW1lUGF0aH0gYWxyZWFkeSBleGlzdHMuIFNraXBwaW5nIGN1c3RvbSB0aGVtZSBnZW5lcmF0aW9uLmApO1xuICAgICAgcmV0dXJuIG5vb3AoKTtcbiAgICB9XG5cbiAgICBob3N0LmNyZWF0ZShjdXN0b21UaGVtZVBhdGgsIHRoZW1lQ29udGVudCk7XG4gICAgcmV0dXJuIGFkZFRoZW1lU3R5bGVUb1RhcmdldChwcm9qZWN0TmFtZSwgJ2J1aWxkJywgY3VzdG9tVGhlbWVQYXRoLCBsb2dnZXIpO1xuICB9XG5cbiAgY29uc3QgaW5zZXJ0aW9uID0gbmV3IEluc2VydENoYW5nZShzdHlsZXNQYXRoLCAwLCB0aGVtZUNvbnRlbnQpO1xuICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUoc3R5bGVzUGF0aCk7XG5cbiAgcmVjb3JkZXIuaW5zZXJ0TGVmdChpbnNlcnRpb24ucG9zLCBpbnNlcnRpb24udG9BZGQpO1xuICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gIHJldHVybiBub29wKCk7XG59XG5cbi8qKiBJbnNlcnQgYSBwcmUtYnVpbHQgdGhlbWUgaW50byB0aGUgYW5ndWxhci5qc29uIGZpbGUuICovXG5mdW5jdGlvbiBpbnNlcnRQcmVidWlsdFRoZW1lKHByb2plY3Q6IHN0cmluZywgdGhlbWU6IHN0cmluZywgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSk6IFJ1bGUge1xuICBjb25zdCB0aGVtZVBhdGggPSBgQGFuZ3VsYXIvbWF0ZXJpYWwvcHJlYnVpbHQtdGhlbWVzLyR7dGhlbWV9LmNzc2A7XG5cbiAgcmV0dXJuIGNoYWluKFtcbiAgICBhZGRUaGVtZVN0eWxlVG9UYXJnZXQocHJvamVjdCwgJ2J1aWxkJywgdGhlbWVQYXRoLCBsb2dnZXIpLFxuICAgIGFkZFRoZW1lU3R5bGVUb1RhcmdldChwcm9qZWN0LCAndGVzdCcsIHRoZW1lUGF0aCwgbG9nZ2VyKSxcbiAgXSk7XG59XG5cbi8qKiBBZGRzIGEgdGhlbWluZyBzdHlsZSBlbnRyeSB0byB0aGUgZ2l2ZW4gcHJvamVjdCB0YXJnZXQgb3B0aW9ucy4gKi9cbmZ1bmN0aW9uIGFkZFRoZW1lU3R5bGVUb1RhcmdldChcbiAgcHJvamVjdE5hbWU6IHN0cmluZyxcbiAgdGFyZ2V0TmFtZTogJ3Rlc3QnIHwgJ2J1aWxkJyxcbiAgYXNzZXRQYXRoOiBzdHJpbmcsXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiBSdWxlIHtcbiAgcmV0dXJuIHVwZGF0ZVdvcmtzcGFjZSh3b3Jrc3BhY2UgPT4ge1xuICAgIGNvbnN0IHByb2plY3QgPSBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZSh3b3Jrc3BhY2UsIHByb2plY3ROYW1lKTtcblxuICAgIC8vIERvIG5vdCB1cGRhdGUgdGhlIGJ1aWxkZXIgb3B0aW9ucyBpbiBjYXNlIHRoZSB0YXJnZXQgZG9lcyBub3QgdXNlIHRoZSBkZWZhdWx0IENMSSBidWlsZGVyLlxuICAgIGlmICghdmFsaWRhdGVEZWZhdWx0VGFyZ2V0QnVpbGRlcihwcm9qZWN0LCB0YXJnZXROYW1lLCBsb2dnZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0T3B0aW9ucyA9IGdldFByb2plY3RUYXJnZXRPcHRpb25zKHByb2plY3QsIHRhcmdldE5hbWUpO1xuICAgIGNvbnN0IHN0eWxlcyA9IHRhcmdldE9wdGlvbnNbJ3N0eWxlcyddIGFzIChzdHJpbmcgfCB7aW5wdXQ6IHN0cmluZ30pW107XG5cbiAgICBpZiAoIXN0eWxlcykge1xuICAgICAgdGFyZ2V0T3B0aW9uc1snc3R5bGVzJ10gPSBbYXNzZXRQYXRoXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhpc3RpbmdTdHlsZXMgPSBzdHlsZXMubWFwKHMgPT4gKHR5cGVvZiBzID09PSAnc3RyaW5nJyA/IHMgOiBzLmlucHV0KSk7XG5cbiAgICAgIGZvciAobGV0IFtpbmRleCwgc3R5bGVQYXRoXSBvZiBleGlzdGluZ1N0eWxlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIGdpdmVuIGFzc2V0IGlzIGFscmVhZHkgc3BlY2lmaWVkIGluIHRoZSBzdHlsZXMsIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcuXG4gICAgICAgIGlmIChzdHlsZVBhdGggPT09IGFzc2V0UGF0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluIGNhc2UgYSBwcmVidWlsdCB0aGVtZSBpcyBhbHJlYWR5IHNldCB1cCwgd2UgY2FuIHNhZmVseSByZXBsYWNlIHRoZSB0aGVtZSB3aXRoIHRoZSBuZXdcbiAgICAgICAgLy8gdGhlbWUgZmlsZS4gSWYgYSBjdXN0b20gdGhlbWUgaXMgc2V0IHVwLCB3ZSBhcmUgbm90IGFibGUgdG8gc2FmZWx5IHJlcGxhY2UgdGhlIGN1c3RvbVxuICAgICAgICAvLyB0aGVtZSBiZWNhdXNlIHRoZXNlIGZpbGVzIGNhbiBjb250YWluIGN1c3RvbSBzdHlsZXMsIHdoaWxlIHByZWJ1aWx0IHRoZW1lcyBhcmVcbiAgICAgICAgLy8gYWx3YXlzIHBhY2thZ2VkIGFuZCBjb25zaWRlcmVkIHJlcGxhY2VhYmxlLlxuICAgICAgICBpZiAoc3R5bGVQYXRoLmluY2x1ZGVzKGRlZmF1bHRDdXN0b21UaGVtZUZpbGVuYW1lKSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgIGBDb3VsZCBub3QgYWRkIHRoZSBzZWxlY3RlZCB0aGVtZSB0byB0aGUgQ0xJIHByb2plY3QgYCArXG4gICAgICAgICAgICAgIGBjb25maWd1cmF0aW9uIGJlY2F1c2UgdGhlcmUgaXMgYWxyZWFkeSBhIGN1c3RvbSB0aGVtZSBmaWxlIHJlZmVyZW5jZWQuYCxcbiAgICAgICAgICApO1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBQbGVhc2UgbWFudWFsbHkgYWRkIHRoZSBmb2xsb3dpbmcgc3R5bGUgZmlsZSB0byB5b3VyIGNvbmZpZ3VyYXRpb246YCk7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oYCAgICAke2Fzc2V0UGF0aH1gKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoc3R5bGVQYXRoLmluY2x1ZGVzKHByZWJ1aWx0VGhlbWVQYXRoU2VnbWVudCkpIHtcbiAgICAgICAgICBzdHlsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdHlsZXMudW5zaGlmdChhc3NldFBhdGgpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHNwZWNpZmllZCBwcm9qZWN0IHRhcmdldCBpcyBjb25maWd1cmVkIHdpdGggdGhlIGRlZmF1bHQgYnVpbGRlcnMgd2hpY2ggYXJlXG4gKiBwcm92aWRlZCBieSB0aGUgQW5ndWxhciBDTEkuIElmIHRoZSBjb25maWd1cmVkIGJ1aWxkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGRlZmF1bHQgYnVpbGRlcixcbiAqIHRoaXMgZnVuY3Rpb24gY2FuIGVpdGhlciB0aHJvdyBvciBqdXN0IHNob3cgYSB3YXJuaW5nLlxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZURlZmF1bHRUYXJnZXRCdWlsZGVyKFxuICBwcm9qZWN0OiB3b3Jrc3BhY2VzLlByb2plY3REZWZpbml0aW9uLFxuICB0YXJnZXROYW1lOiAnYnVpbGQnIHwgJ3Rlc3QnLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKSB7XG4gIGNvbnN0IHRhcmdldHMgPVxuICAgIHRhcmdldE5hbWUgPT09ICd0ZXN0JyA/IGdldFByb2plY3RUZXN0VGFyZ2V0cyhwcm9qZWN0KSA6IGdldFByb2plY3RCdWlsZFRhcmdldHMocHJvamVjdCk7XG4gIGNvbnN0IGlzRGVmYXVsdEJ1aWxkZXIgPSB0YXJnZXRzLmxlbmd0aCA+IDA7XG5cbiAgLy8gQmVjYXVzZSB0aGUgYnVpbGQgc2V0dXAgZm9yIHRoZSBBbmd1bGFyIENMSSBjYW4gYmUgY3VzdG9taXplZCBieSBkZXZlbG9wZXJzLCB3ZSBjYW4ndCBrbm93XG4gIC8vIHdoZXJlIHRvIHB1dCB0aGUgdGhlbWUgZmlsZSBpbiB0aGUgd29ya3NwYWNlIGNvbmZpZ3VyYXRpb24gaWYgY3VzdG9tIGJ1aWxkZXJzIGFyZSBiZWluZ1xuICAvLyB1c2VkLiBJbiBjYXNlIHRoZSBidWlsZGVyIGhhcyBiZWVuIGNoYW5nZWQgZm9yIHRoZSBcImJ1aWxkXCIgdGFyZ2V0LCB3ZSB0aHJvdyBhbiBlcnJvciBhbmRcbiAgLy8gZXhpdCBiZWNhdXNlIHNldHRpbmcgdXAgYSB0aGVtZSBpcyBhIHByaW1hcnkgZ29hbCBvZiBgbmctYWRkYC4gT3RoZXJ3aXNlIGlmIGp1c3QgdGhlIFwidGVzdFwiXG4gIC8vIGJ1aWxkZXIgaGFzIGJlZW4gY2hhbmdlZCwgd2Ugd2FybiBiZWNhdXNlIGEgdGhlbWUgaXMgbm90IG1hbmRhdG9yeSBmb3IgcnVubmluZyB0ZXN0c1xuICAvLyB3aXRoIE1hdGVyaWFsLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzE0MTc2XG4gIGlmICghaXNEZWZhdWx0QnVpbGRlciAmJiB0YXJnZXROYW1lID09PSAnYnVpbGQnKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oXG4gICAgICBgWW91ciBwcm9qZWN0IGlzIG5vdCB1c2luZyB0aGUgZGVmYXVsdCBidWlsZGVycyBmb3IgYCArXG4gICAgICAgIGBcIiR7dGFyZ2V0TmFtZX1cIi4gVGhlIEFuZ3VsYXIgTWF0ZXJpYWwgc2NoZW1hdGljcyBjYW5ub3QgYWRkIGEgdGhlbWUgdG8gdGhlIHdvcmtzcGFjZSBgICtcbiAgICAgICAgYGNvbmZpZ3VyYXRpb24gaWYgdGhlIGJ1aWxkZXIgaGFzIGJlZW4gY2hhbmdlZC5gLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoIWlzRGVmYXVsdEJ1aWxkZXIpIHtcbiAgICAvLyBmb3Igbm9uLWJ1aWxkIHRhcmdldHMgd2UgZ3JhY2VmdWxseSByZXBvcnQgdGhlIGVycm9yIHdpdGhvdXQgYWN0dWFsbHkgYWJvcnRpbmcgdGhlXG4gICAgLy8gc2V0dXAgc2NoZW1hdGljLiBUaGlzIGlzIGJlY2F1c2UgYSB0aGVtZSBpcyBub3QgbWFuZGF0b3J5IGZvciBydW5uaW5nIHRlc3RzLlxuICAgIGxvZ2dlci53YXJuKFxuICAgICAgYFlvdXIgcHJvamVjdCBpcyBub3QgdXNpbmcgdGhlIGRlZmF1bHQgYnVpbGRlcnMgZm9yIFwiJHt0YXJnZXROYW1lfVwiLiBUaGlzIGAgK1xuICAgICAgICBgbWVhbnMgdGhhdCB3ZSBjYW5ub3QgYWRkIHRoZSBjb25maWd1cmVkIHRoZW1lIHRvIHRoZSBcIiR7dGFyZ2V0TmFtZX1cIiB0YXJnZXQuYCxcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGlzRGVmYXVsdEJ1aWxkZXI7XG59XG4iXX0=
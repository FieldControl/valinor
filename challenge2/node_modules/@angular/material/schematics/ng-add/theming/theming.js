"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        return themeName === 'custom' ?
            insertCustomTheme(options.project, host, context.logger) :
            insertPrebuiltTheme(options.project, themeName, context.logger);
    };
}
exports.addThemeToAppStyles = addThemeToAppStyles;
/** Adds the global typography class to the body element. */
function addTypographyClass(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        const project = schematics_2.getProjectFromWorkspace(workspace, options.project);
        const projectIndexFiles = schematics_2.getProjectIndexFiles(project);
        if (!projectIndexFiles.length) {
            throw new schematics_1.SchematicsException('No project index HTML file could be found.');
        }
        if (options.typography) {
            projectIndexFiles.forEach(path => schematics_2.addBodyClass(host, path, 'mat-typography'));
        }
    });
}
exports.addTypographyClass = addTypographyClass;
/**
 * Insert a custom theme to project style file. If no valid style file could be found, a new
 * Scss file for the custom theme will be created.
 */
function insertCustomTheme(projectName, host, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        const project = schematics_2.getProjectFromWorkspace(workspace, projectName);
        const stylesPath = schematics_2.getProjectStyleFile(project, 'scss');
        const themeContent = create_custom_theme_1.createCustomTheme(projectName);
        if (!stylesPath) {
            if (!project.sourceRoot) {
                throw new schematics_1.SchematicsException(`Could not find source root for project: "${projectName}". ` +
                    `Please make sure that the "sourceRoot" property is set in the workspace config.`);
            }
            // Normalize the path through the devkit utilities because we want to avoid having
            // unnecessary path segments and windows backslash delimiters.
            const customThemePath = core_1.normalize(path_1.join(project.sourceRoot, defaultCustomThemeFilename));
            if (host.exists(customThemePath)) {
                logger.warn(`Cannot create a custom Angular Material theme because
          ${customThemePath} already exists. Skipping custom theme generation.`);
                return schematics_1.noop();
            }
            host.create(customThemePath, themeContent);
            return addThemeStyleToTarget(projectName, 'build', customThemePath, logger);
        }
        const insertion = new change_1.InsertChange(stylesPath, 0, themeContent);
        const recorder = host.beginUpdate(stylesPath);
        recorder.insertLeft(insertion.pos, insertion.toAdd);
        host.commitUpdate(recorder);
        return schematics_1.noop();
    });
}
/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(project, theme, logger) {
    // Path needs to be always relative to the `package.json` or workspace root.
    const themePath = `./node_modules/@angular/material/prebuilt-themes/${theme}.css`;
    return schematics_1.chain([
        addThemeStyleToTarget(project, 'build', themePath, logger),
        addThemeStyleToTarget(project, 'test', themePath, logger)
    ]);
}
/** Adds a theming style entry to the given project target options. */
function addThemeStyleToTarget(projectName, targetName, assetPath, logger) {
    return workspace_1.updateWorkspace(workspace => {
        const project = schematics_2.getProjectFromWorkspace(workspace, projectName);
        // Do not update the builder options in case the target does not use the default CLI builder.
        if (!validateDefaultTargetBuilder(project, targetName, logger)) {
            return;
        }
        const targetOptions = schematics_2.getProjectTargetOptions(project, targetName);
        const styles = targetOptions.styles;
        if (!styles) {
            targetOptions.styles = [assetPath];
        }
        else {
            const existingStyles = styles.map(s => typeof s === 'string' ? s : s.input);
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
    const defaultBuilder = schematics_2.defaultTargetBuilders[targetName];
    const targetConfig = project.targets && project.targets.get(targetName);
    const isDefaultBuilder = targetConfig && targetConfig['builder'] === defaultBuilder;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLWFkZC90aGVtaW5nL3RoZW1pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0FBRUgsK0NBQXdEO0FBRXhELDJEQU9vQztBQUNwQyx3REFPaUM7QUFDakMsK0RBQWdFO0FBQ2hFLHFFQUFvRjtBQUNwRiwrQkFBMEI7QUFFMUIsK0RBQXdEO0FBRXhELDhFQUE4RTtBQUM5RSxNQUFNLHdCQUF3QixHQUFHLG1DQUFtQyxDQUFDO0FBRXJFLG1FQUFtRTtBQUNuRSxNQUFNLDBCQUEwQixHQUFHLG1CQUFtQixDQUFDO0FBRXZELDJEQUEyRDtBQUMzRCxTQUFnQixtQkFBbUIsQ0FBQyxPQUFlO0lBQ2pELE9BQU8sQ0FBQyxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQy9DLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDO1FBQ2pELE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQzdCLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFELG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRSxDQUFDLENBQUM7QUFDSixDQUFDO0FBUEQsa0RBT0M7QUFFRCw0REFBNEQ7QUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsT0FBZTtJQUNoRCxPQUFPLENBQU8sSUFBVSxFQUFFLEVBQUU7UUFDMUIsTUFBTSxTQUFTLEdBQUcsTUFBTSx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxHQUFHLG9DQUF1QixDQUFDLFNBQVMsRUFBRSxP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UUFBUSxDQUFDLHdCQUF3QixDQUFDLEVBQUU7b0JBQ3ZELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjthQUNGO1lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQjtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLDRCQUE0QixDQUFDLE9BQTBCLEVBQUUsVUFBNEIsRUFDeEQsTUFBeUI7SUFDN0QsTUFBTSxjQUFjLEdBQUcsa0NBQXFCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4RSxNQUFNLGdCQUFnQixHQUFHLFlBQVksSUFBSSxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssY0FBYyxDQUFDO0lBRXBGLDZGQUE2RjtJQUM3RiwwRkFBMEY7SUFDMUYsMkZBQTJGO0lBQzNGLDhGQUE4RjtJQUM5Rix1RkFBdUY7SUFDdkYseUVBQXlFO0lBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxVQUFVLEtBQUssT0FBTyxFQUFFO1FBQy9DLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyxxREFBcUQ7WUFDakYsSUFBSSxVQUFVLHlFQUF5RTtZQUN2RixnREFBZ0QsQ0FBQyxDQUFDO0tBQ3JEO1NBQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFO1FBQzVCLHFGQUFxRjtRQUNyRiwrRUFBK0U7UUFDL0UsTUFBTSxDQUFDLElBQUksQ0FBQyx1REFBdUQsVUFBVSxVQUFVO1lBQ3JGLHlEQUF5RCxVQUFVLFdBQVcsQ0FBQyxDQUFDO0tBQ25GO0lBRUQsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplLCBsb2dnaW5nfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1Byb2plY3REZWZpbml0aW9ufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9zcmMvd29ya3NwYWNlJztcbmltcG9ydCB7XG4gIGNoYWluLFxuICBub29wLFxuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhZGRCb2R5Q2xhc3MsXG4gIGRlZmF1bHRUYXJnZXRCdWlsZGVycyxcbiAgZ2V0UHJvamVjdEZyb21Xb3Jrc3BhY2UsXG4gIGdldFByb2plY3RTdHlsZUZpbGUsXG4gIGdldFByb2plY3RUYXJnZXRPcHRpb25zLFxuICBnZXRQcm9qZWN0SW5kZXhGaWxlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtJbnNlcnRDaGFuZ2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9jaGFuZ2UnO1xuaW1wb3J0IHtnZXRXb3Jrc3BhY2UsIHVwZGF0ZVdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTY2hlbWF9IGZyb20gJy4uL3NjaGVtYSc7XG5pbXBvcnQge2NyZWF0ZUN1c3RvbVRoZW1lfSBmcm9tICcuL2NyZWF0ZS1jdXN0b20tdGhlbWUnO1xuXG4vKiogUGF0aCBzZWdtZW50IHRoYXQgY2FuIGJlIGZvdW5kIGluIHBhdGhzIHRoYXQgcmVmZXIgdG8gYSBwcmVidWlsdCB0aGVtZS4gKi9cbmNvbnN0IHByZWJ1aWx0VGhlbWVQYXRoU2VnbWVudCA9ICdAYW5ndWxhci9tYXRlcmlhbC9wcmVidWlsdC10aGVtZXMnO1xuXG4vKiogRGVmYXVsdCBmaWxlIG5hbWUgb2YgdGhlIGN1c3RvbSB0aGVtZSB0aGF0IGNhbiBiZSBnZW5lcmF0ZWQuICovXG5jb25zdCBkZWZhdWx0Q3VzdG9tVGhlbWVGaWxlbmFtZSA9ICdjdXN0b20tdGhlbWUuc2Nzcyc7XG5cbi8qKiBBZGQgcHJlLWJ1aWx0IHN0eWxlcyB0byB0aGUgbWFpbiBwcm9qZWN0IHN0eWxlIGZpbGUuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVGhlbWVUb0FwcFN0eWxlcyhvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3QgdGhlbWVOYW1lID0gb3B0aW9ucy50aGVtZSB8fCAnaW5kaWdvLXBpbmsnO1xuICAgIHJldHVybiB0aGVtZU5hbWUgPT09ICdjdXN0b20nID9cbiAgICAgIGluc2VydEN1c3RvbVRoZW1lKG9wdGlvbnMucHJvamVjdCwgaG9zdCwgY29udGV4dC5sb2dnZXIpIDpcbiAgICAgIGluc2VydFByZWJ1aWx0VGhlbWUob3B0aW9ucy5wcm9qZWN0LCB0aGVtZU5hbWUsIGNvbnRleHQubG9nZ2VyKTtcbiAgfTtcbn1cblxuLyoqIEFkZHMgdGhlIGdsb2JhbCB0eXBvZ3JhcGh5IGNsYXNzIHRvIHRoZSBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVHlwb2dyYXBoeUNsYXNzKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgb3B0aW9ucy5wcm9qZWN0KTtcbiAgICBjb25zdCBwcm9qZWN0SW5kZXhGaWxlcyA9IGdldFByb2plY3RJbmRleEZpbGVzKHByb2plY3QpO1xuXG4gICAgaWYgKCFwcm9qZWN0SW5kZXhGaWxlcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdObyBwcm9qZWN0IGluZGV4IEhUTUwgZmlsZSBjb3VsZCBiZSBmb3VuZC4nKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50eXBvZ3JhcGh5KSB7XG4gICAgICBwcm9qZWN0SW5kZXhGaWxlcy5mb3JFYWNoKHBhdGggPT4gYWRkQm9keUNsYXNzKGhvc3QsIHBhdGgsICdtYXQtdHlwb2dyYXBoeScpKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogSW5zZXJ0IGEgY3VzdG9tIHRoZW1lIHRvIHByb2plY3Qgc3R5bGUgZmlsZS4gSWYgbm8gdmFsaWQgc3R5bGUgZmlsZSBjb3VsZCBiZSBmb3VuZCwgYSBuZXdcbiAqIFNjc3MgZmlsZSBmb3IgdGhlIGN1c3RvbSB0aGVtZSB3aWxsIGJlIGNyZWF0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluc2VydEN1c3RvbVRoZW1lKHByb2plY3ROYW1lOiBzdHJpbmcsIGhvc3Q6IFRyZWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpKTogUHJvbWlzZTxSdWxlPiB7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShob3N0KTtcbiAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgcHJvamVjdE5hbWUpO1xuICBjb25zdCBzdHlsZXNQYXRoID0gZ2V0UHJvamVjdFN0eWxlRmlsZShwcm9qZWN0LCAnc2NzcycpO1xuICBjb25zdCB0aGVtZUNvbnRlbnQgPSBjcmVhdGVDdXN0b21UaGVtZShwcm9qZWN0TmFtZSk7XG5cbiAgaWYgKCFzdHlsZXNQYXRoKSB7XG4gICAgaWYgKCFwcm9qZWN0LnNvdXJjZVJvb3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBDb3VsZCBub3QgZmluZCBzb3VyY2Ugcm9vdCBmb3IgcHJvamVjdDogXCIke3Byb2plY3ROYW1lfVwiLiBgICtcbiAgICAgICAgYFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB0aGUgXCJzb3VyY2VSb290XCIgcHJvcGVydHkgaXMgc2V0IGluIHRoZSB3b3Jrc3BhY2UgY29uZmlnLmApO1xuICAgIH1cblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aCB0aHJvdWdoIHRoZSBkZXZraXQgdXRpbGl0aWVzIGJlY2F1c2Ugd2Ugd2FudCB0byBhdm9pZCBoYXZpbmdcbiAgICAvLyB1bm5lY2Vzc2FyeSBwYXRoIHNlZ21lbnRzIGFuZCB3aW5kb3dzIGJhY2tzbGFzaCBkZWxpbWl0ZXJzLlxuICAgIGNvbnN0IGN1c3RvbVRoZW1lUGF0aCA9IG5vcm1hbGl6ZShqb2luKHByb2plY3Quc291cmNlUm9vdCwgZGVmYXVsdEN1c3RvbVRoZW1lRmlsZW5hbWUpKTtcblxuICAgIGlmIChob3N0LmV4aXN0cyhjdXN0b21UaGVtZVBhdGgpKSB7XG4gICAgICBsb2dnZXIud2FybihgQ2Fubm90IGNyZWF0ZSBhIGN1c3RvbSBBbmd1bGFyIE1hdGVyaWFsIHRoZW1lIGJlY2F1c2VcbiAgICAgICAgICAke2N1c3RvbVRoZW1lUGF0aH0gYWxyZWFkeSBleGlzdHMuIFNraXBwaW5nIGN1c3RvbSB0aGVtZSBnZW5lcmF0aW9uLmApO1xuICAgICAgcmV0dXJuIG5vb3AoKTtcbiAgICB9XG5cbiAgICBob3N0LmNyZWF0ZShjdXN0b21UaGVtZVBhdGgsIHRoZW1lQ29udGVudCk7XG4gICAgcmV0dXJuIGFkZFRoZW1lU3R5bGVUb1RhcmdldChwcm9qZWN0TmFtZSwgJ2J1aWxkJywgY3VzdG9tVGhlbWVQYXRoLCBsb2dnZXIpO1xuICB9XG5cbiAgY29uc3QgaW5zZXJ0aW9uID0gbmV3IEluc2VydENoYW5nZShzdHlsZXNQYXRoLCAwLCB0aGVtZUNvbnRlbnQpO1xuICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUoc3R5bGVzUGF0aCk7XG5cbiAgcmVjb3JkZXIuaW5zZXJ0TGVmdChpbnNlcnRpb24ucG9zLCBpbnNlcnRpb24udG9BZGQpO1xuICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gIHJldHVybiBub29wKCk7XG59XG5cbi8qKiBJbnNlcnQgYSBwcmUtYnVpbHQgdGhlbWUgaW50byB0aGUgYW5ndWxhci5qc29uIGZpbGUuICovXG5mdW5jdGlvbiBpbnNlcnRQcmVidWlsdFRoZW1lKHByb2plY3Q6IHN0cmluZywgdGhlbWU6IHN0cmluZywgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSk6IFJ1bGUge1xuICAvLyBQYXRoIG5lZWRzIHRvIGJlIGFsd2F5cyByZWxhdGl2ZSB0byB0aGUgYHBhY2thZ2UuanNvbmAgb3Igd29ya3NwYWNlIHJvb3QuXG4gIGNvbnN0IHRoZW1lUGF0aCA9IGAuL25vZGVfbW9kdWxlcy9AYW5ndWxhci9tYXRlcmlhbC9wcmVidWlsdC10aGVtZXMvJHt0aGVtZX0uY3NzYDtcblxuICByZXR1cm4gY2hhaW4oW1xuICAgIGFkZFRoZW1lU3R5bGVUb1RhcmdldChwcm9qZWN0LCAnYnVpbGQnLCB0aGVtZVBhdGgsIGxvZ2dlciksXG4gICAgYWRkVGhlbWVTdHlsZVRvVGFyZ2V0KHByb2plY3QsICd0ZXN0JywgdGhlbWVQYXRoLCBsb2dnZXIpXG4gIF0pO1xufVxuXG4vKiogQWRkcyBhIHRoZW1pbmcgc3R5bGUgZW50cnkgdG8gdGhlIGdpdmVuIHByb2plY3QgdGFyZ2V0IG9wdGlvbnMuICovXG5mdW5jdGlvbiBhZGRUaGVtZVN0eWxlVG9UYXJnZXQocHJvamVjdE5hbWU6IHN0cmluZywgdGFyZ2V0TmFtZTogJ3Rlc3QnIHwgJ2J1aWxkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFBhdGg6IHN0cmluZywgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSk6IFJ1bGUge1xuICByZXR1cm4gdXBkYXRlV29ya3NwYWNlKHdvcmtzcGFjZSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgcHJvamVjdE5hbWUpO1xuXG4gICAgLy8gRG8gbm90IHVwZGF0ZSB0aGUgYnVpbGRlciBvcHRpb25zIGluIGNhc2UgdGhlIHRhcmdldCBkb2VzIG5vdCB1c2UgdGhlIGRlZmF1bHQgQ0xJIGJ1aWxkZXIuXG4gICAgaWYgKCF2YWxpZGF0ZURlZmF1bHRUYXJnZXRCdWlsZGVyKHByb2plY3QsIHRhcmdldE5hbWUsIGxvZ2dlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXRPcHRpb25zID0gZ2V0UHJvamVjdFRhcmdldE9wdGlvbnMocHJvamVjdCwgdGFyZ2V0TmFtZSk7XG4gICAgY29uc3Qgc3R5bGVzID0gdGFyZ2V0T3B0aW9ucy5zdHlsZXMgYXMgKHN0cmluZyB8IHtpbnB1dDogc3RyaW5nfSlbXTtcblxuICAgIGlmICghc3R5bGVzKSB7XG4gICAgICB0YXJnZXRPcHRpb25zLnN0eWxlcyA9IFthc3NldFBhdGhdO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBleGlzdGluZ1N0eWxlcyA9IHN0eWxlcy5tYXAocyA9PiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgPyBzIDogcy5pbnB1dCk7XG5cbiAgICAgIGZvciAobGV0IFtpbmRleCwgc3R5bGVQYXRoXSBvZiBleGlzdGluZ1N0eWxlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIGdpdmVuIGFzc2V0IGlzIGFscmVhZHkgc3BlY2lmaWVkIGluIHRoZSBzdHlsZXMsIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcuXG4gICAgICAgIGlmIChzdHlsZVBhdGggPT09IGFzc2V0UGF0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluIGNhc2UgYSBwcmVidWlsdCB0aGVtZSBpcyBhbHJlYWR5IHNldCB1cCwgd2UgY2FuIHNhZmVseSByZXBsYWNlIHRoZSB0aGVtZSB3aXRoIHRoZSBuZXdcbiAgICAgICAgLy8gdGhlbWUgZmlsZS4gSWYgYSBjdXN0b20gdGhlbWUgaXMgc2V0IHVwLCB3ZSBhcmUgbm90IGFibGUgdG8gc2FmZWx5IHJlcGxhY2UgdGhlIGN1c3RvbVxuICAgICAgICAvLyB0aGVtZSBiZWNhdXNlIHRoZXNlIGZpbGVzIGNhbiBjb250YWluIGN1c3RvbSBzdHlsZXMsIHdoaWxlIHByZWJ1aWx0IHRoZW1lcyBhcmVcbiAgICAgICAgLy8gYWx3YXlzIHBhY2thZ2VkIGFuZCBjb25zaWRlcmVkIHJlcGxhY2VhYmxlLlxuICAgICAgICBpZiAoc3R5bGVQYXRoLmluY2x1ZGVzKGRlZmF1bHRDdXN0b21UaGVtZUZpbGVuYW1lKSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihgQ291bGQgbm90IGFkZCB0aGUgc2VsZWN0ZWQgdGhlbWUgdG8gdGhlIENMSSBwcm9qZWN0IGAgK1xuICAgICAgICAgICAgICBgY29uZmlndXJhdGlvbiBiZWNhdXNlIHRoZXJlIGlzIGFscmVhZHkgYSBjdXN0b20gdGhlbWUgZmlsZSByZWZlcmVuY2VkLmApO1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBQbGVhc2UgbWFudWFsbHkgYWRkIHRoZSBmb2xsb3dpbmcgc3R5bGUgZmlsZSB0byB5b3VyIGNvbmZpZ3VyYXRpb246YCk7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oYCAgICAke2Fzc2V0UGF0aH1gKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoc3R5bGVQYXRoLmluY2x1ZGVzKHByZWJ1aWx0VGhlbWVQYXRoU2VnbWVudCkpIHtcbiAgICAgICAgICBzdHlsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdHlsZXMudW5zaGlmdChhc3NldFBhdGgpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHNwZWNpZmllZCBwcm9qZWN0IHRhcmdldCBpcyBjb25maWd1cmVkIHdpdGggdGhlIGRlZmF1bHQgYnVpbGRlcnMgd2hpY2ggYXJlXG4gKiBwcm92aWRlZCBieSB0aGUgQW5ndWxhciBDTEkuIElmIHRoZSBjb25maWd1cmVkIGJ1aWxkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGRlZmF1bHQgYnVpbGRlcixcbiAqIHRoaXMgZnVuY3Rpb24gY2FuIGVpdGhlciB0aHJvdyBvciBqdXN0IHNob3cgYSB3YXJuaW5nLlxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZURlZmF1bHRUYXJnZXRCdWlsZGVyKHByb2plY3Q6IFByb2plY3REZWZpbml0aW9uLCB0YXJnZXROYW1lOiAnYnVpbGQnIHwgJ3Rlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpKSB7XG4gIGNvbnN0IGRlZmF1bHRCdWlsZGVyID0gZGVmYXVsdFRhcmdldEJ1aWxkZXJzW3RhcmdldE5hbWVdO1xuICBjb25zdCB0YXJnZXRDb25maWcgPSBwcm9qZWN0LnRhcmdldHMgJiYgcHJvamVjdC50YXJnZXRzLmdldCh0YXJnZXROYW1lKTtcbiAgY29uc3QgaXNEZWZhdWx0QnVpbGRlciA9IHRhcmdldENvbmZpZyAmJiB0YXJnZXRDb25maWdbJ2J1aWxkZXInXSA9PT0gZGVmYXVsdEJ1aWxkZXI7XG5cbiAgLy8gQmVjYXVzZSB0aGUgYnVpbGQgc2V0dXAgZm9yIHRoZSBBbmd1bGFyIENMSSBjYW4gYmUgY3VzdG9taXplZCBieSBkZXZlbG9wZXJzLCB3ZSBjYW4ndCBrbm93XG4gIC8vIHdoZXJlIHRvIHB1dCB0aGUgdGhlbWUgZmlsZSBpbiB0aGUgd29ya3NwYWNlIGNvbmZpZ3VyYXRpb24gaWYgY3VzdG9tIGJ1aWxkZXJzIGFyZSBiZWluZ1xuICAvLyB1c2VkLiBJbiBjYXNlIHRoZSBidWlsZGVyIGhhcyBiZWVuIGNoYW5nZWQgZm9yIHRoZSBcImJ1aWxkXCIgdGFyZ2V0LCB3ZSB0aHJvdyBhbiBlcnJvciBhbmRcbiAgLy8gZXhpdCBiZWNhdXNlIHNldHRpbmcgdXAgYSB0aGVtZSBpcyBhIHByaW1hcnkgZ29hbCBvZiBgbmctYWRkYC4gT3RoZXJ3aXNlIGlmIGp1c3QgdGhlIFwidGVzdFwiXG4gIC8vIGJ1aWxkZXIgaGFzIGJlZW4gY2hhbmdlZCwgd2Ugd2FybiBiZWNhdXNlIGEgdGhlbWUgaXMgbm90IG1hbmRhdG9yeSBmb3IgcnVubmluZyB0ZXN0c1xuICAvLyB3aXRoIE1hdGVyaWFsLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzE0MTc2XG4gIGlmICghaXNEZWZhdWx0QnVpbGRlciAmJiB0YXJnZXROYW1lID09PSAnYnVpbGQnKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYFlvdXIgcHJvamVjdCBpcyBub3QgdXNpbmcgdGhlIGRlZmF1bHQgYnVpbGRlcnMgZm9yIGAgK1xuICAgICAgYFwiJHt0YXJnZXROYW1lfVwiLiBUaGUgQW5ndWxhciBNYXRlcmlhbCBzY2hlbWF0aWNzIGNhbm5vdCBhZGQgYSB0aGVtZSB0byB0aGUgd29ya3NwYWNlIGAgK1xuICAgICAgYGNvbmZpZ3VyYXRpb24gaWYgdGhlIGJ1aWxkZXIgaGFzIGJlZW4gY2hhbmdlZC5gKTtcbiAgfSBlbHNlIGlmICghaXNEZWZhdWx0QnVpbGRlcikge1xuICAgIC8vIGZvciBub24tYnVpbGQgdGFyZ2V0cyB3ZSBncmFjZWZ1bGx5IHJlcG9ydCB0aGUgZXJyb3Igd2l0aG91dCBhY3R1YWxseSBhYm9ydGluZyB0aGVcbiAgICAvLyBzZXR1cCBzY2hlbWF0aWMuIFRoaXMgaXMgYmVjYXVzZSBhIHRoZW1lIGlzIG5vdCBtYW5kYXRvcnkgZm9yIHJ1bm5pbmcgdGVzdHMuXG4gICAgbG9nZ2VyLndhcm4oYFlvdXIgcHJvamVjdCBpcyBub3QgdXNpbmcgdGhlIGRlZmF1bHQgYnVpbGRlcnMgZm9yIFwiJHt0YXJnZXROYW1lfVwiLiBUaGlzIGAgK1xuICAgICAgYG1lYW5zIHRoYXQgd2UgY2Fubm90IGFkZCB0aGUgY29uZmlndXJlZCB0aGVtZSB0byB0aGUgXCIke3RhcmdldE5hbWV9XCIgdGFyZ2V0LmApO1xuICB9XG5cbiAgcmV0dXJuIGlzRGVmYXVsdEJ1aWxkZXI7XG59XG4iXX0=
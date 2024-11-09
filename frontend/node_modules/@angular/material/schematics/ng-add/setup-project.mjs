"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
const workspace_1 = require("@schematics/angular/utility/workspace");
const utility_1 = require("@schematics/angular/utility");
const workspace_models_1 = require("@schematics/angular/utility/workspace-models");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const material_fonts_1 = require("./fonts/material-fonts");
const theming_1 = require("./theming/theming");
/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 *  - Adds Browser Animation to app.module
 */
function default_1(options) {
    return async (host, context) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        if (project.extensions['projectType'] === workspace_models_1.ProjectType.Application) {
            return (0, schematics_1.chain)([
                addAnimations(options),
                (0, theming_1.addThemeToAppStyles)(options),
                (0, material_fonts_1.addFontsToIndex)(options),
                addMaterialAppStyles(options),
                (0, theming_1.addTypographyClass)(options),
            ]);
        }
        context.logger.warn('Angular Material has been set up in your workspace. There is no additional setup ' +
            'required for consuming Angular Material in your library project.\n\n' +
            'If you intended to run the schematic on a different project, pass the `--project` ' +
            'option.');
        return;
    };
}
exports.default = default_1;
/**
 * Adds custom Material styles to the project style file. The custom CSS sets up the Roboto font
 * and reset the default browser body margin.
 */
function addMaterialAppStyles(options) {
    return async (host, context) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        const styleFilePath = (0, schematics_2.getProjectStyleFile)(project);
        const logger = context.logger;
        if (!styleFilePath) {
            logger.error(`Could not find the default style file for this project.`);
            logger.info(`Consider manually adding the Roboto font to your CSS.`);
            logger.info(`More information at https://fonts.google.com/specimen/Roboto`);
            return;
        }
        const buffer = host.read(styleFilePath);
        if (!buffer) {
            logger.error(`Could not read the default style file within the project ` + `(${styleFilePath})`);
            logger.info(`Please consider manually setting up the Roboto font.`);
            return;
        }
        const htmlContent = buffer.toString();
        const insertion = '\n' +
            `html, body { height: 100%; }\n` +
            `body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }\n`;
        if (htmlContent.includes(insertion)) {
            return;
        }
        const recorder = host.beginUpdate(styleFilePath);
        recorder.insertLeft(htmlContent.length, insertion);
        host.commitUpdate(recorder);
    };
}
/** Adds the animations package to the project based on the conffiguration. */
function addAnimations(options) {
    return (host, context) => {
        const animationsRule = options.animations === 'excluded'
            ? (0, schematics_1.noop)()
            : (0, utility_1.addRootProvider)(options.project, ({ code, external }) => {
                return code `${external('provideAnimationsAsync', '@angular/platform-browser/animations/async')}(${options.animations === 'disabled' ? `'noop'` : ''})`;
            });
        // The `addRootProvider` rule can throw in some custom scenarios (see #28640).
        // Add some error handling around it so the setup isn't interrupted.
        return (0, schematics_1.callRule)(animationsRule, host, context).pipe((0, operators_1.catchError)(() => {
            context.logger.error('Failed to add animations to project. Continuing with the Angular Material setup.');
            context.logger.info('Read more about setting up the animations manually: https://angular.io/guide/animations');
            return (0, rxjs_1.of)(host);
        }));
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtcHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLWFkZC9zZXR1cC1wcm9qZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBRUgsMkRBQStGO0FBQy9GLHdEQUFxRjtBQUNyRixxRUFBbUU7QUFDbkUseURBQTREO0FBQzVELG1GQUF5RTtBQUN6RSwrQkFBd0M7QUFDeEMsOENBQTBDO0FBQzFDLDJEQUF1RDtBQUV2RCwrQ0FBMEU7QUFFMUU7Ozs7O0dBS0c7QUFDSCxtQkFBeUIsT0FBZTtJQUN0QyxPQUFPLEtBQUssRUFBRSxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQ3JELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSx3QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUEsb0NBQXVCLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVwRSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEtBQUssOEJBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsRSxPQUFPLElBQUEsa0JBQUssRUFBQztnQkFDWCxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUN0QixJQUFBLDZCQUFtQixFQUFDLE9BQU8sQ0FBQztnQkFDNUIsSUFBQSxnQ0FBZSxFQUFDLE9BQU8sQ0FBQztnQkFDeEIsb0JBQW9CLENBQUMsT0FBTyxDQUFDO2dCQUM3QixJQUFBLDRCQUFrQixFQUFDLE9BQU8sQ0FBQzthQUM1QixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2pCLG1GQUFtRjtZQUNqRixzRUFBc0U7WUFDdEUsb0ZBQW9GO1lBQ3BGLFNBQVMsQ0FDWixDQUFDO1FBQ0YsT0FBTztJQUNULENBQUMsQ0FBQztB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QUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y2hhaW4sIG5vb3AsIFJ1bGUsIFNjaGVtYXRpY0NvbnRleHQsIFRyZWUsIGNhbGxSdWxlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge2dldFByb2plY3RGcm9tV29ya3NwYWNlLCBnZXRQcm9qZWN0U3R5bGVGaWxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge2dldFdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge2FkZFJvb3RQcm92aWRlcn0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5JztcbmltcG9ydCB7UHJvamVjdFR5cGV9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS93b3Jrc3BhY2UtbW9kZWxzJztcbmltcG9ydCB7b2YgYXMgb2JzZXJ2YWJsZU9mfSBmcm9tICdyeGpzJztcbmltcG9ydCB7Y2F0Y2hFcnJvcn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHthZGRGb250c1RvSW5kZXh9IGZyb20gJy4vZm9udHMvbWF0ZXJpYWwtZm9udHMnO1xuaW1wb3J0IHtTY2hlbWF9IGZyb20gJy4vc2NoZW1hJztcbmltcG9ydCB7YWRkVGhlbWVUb0FwcFN0eWxlcywgYWRkVHlwb2dyYXBoeUNsYXNzfSBmcm9tICcuL3RoZW1pbmcvdGhlbWluZyc7XG5cbi8qKlxuICogU2NhZmZvbGRzIHRoZSBiYXNpY3Mgb2YgYSBBbmd1bGFyIE1hdGVyaWFsIGFwcGxpY2F0aW9uLCB0aGlzIGluY2x1ZGVzOlxuICogIC0gQWRkIFBhY2thZ2VzIHRvIHBhY2thZ2UuanNvblxuICogIC0gQWRkcyBwcmUtYnVpbHQgdGhlbWVzIHRvIHN0eWxlcy5leHRcbiAqICAtIEFkZHMgQnJvd3NlciBBbmltYXRpb24gdG8gYXBwLm1vZHVsZVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9uczogU2NoZW1hKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShob3N0KTtcbiAgICBjb25zdCBwcm9qZWN0ID0gZ2V0UHJvamVjdEZyb21Xb3Jrc3BhY2Uod29ya3NwYWNlLCBvcHRpb25zLnByb2plY3QpO1xuXG4gICAgaWYgKHByb2plY3QuZXh0ZW5zaW9uc1sncHJvamVjdFR5cGUnXSA9PT0gUHJvamVjdFR5cGUuQXBwbGljYXRpb24pIHtcbiAgICAgIHJldHVybiBjaGFpbihbXG4gICAgICAgIGFkZEFuaW1hdGlvbnMob3B0aW9ucyksXG4gICAgICAgIGFkZFRoZW1lVG9BcHBTdHlsZXMob3B0aW9ucyksXG4gICAgICAgIGFkZEZvbnRzVG9JbmRleChvcHRpb25zKSxcbiAgICAgICAgYWRkTWF0ZXJpYWxBcHBTdHlsZXMob3B0aW9ucyksXG4gICAgICAgIGFkZFR5cG9ncmFwaHlDbGFzcyhvcHRpb25zKSxcbiAgICAgIF0pO1xuICAgIH1cbiAgICBjb250ZXh0LmxvZ2dlci53YXJuKFxuICAgICAgJ0FuZ3VsYXIgTWF0ZXJpYWwgaGFzIGJlZW4gc2V0IHVwIGluIHlvdXIgd29ya3NwYWNlLiBUaGVyZSBpcyBubyBhZGRpdGlvbmFsIHNldHVwICcgK1xuICAgICAgICAncmVxdWlyZWQgZm9yIGNvbnN1bWluZyBBbmd1bGFyIE1hdGVyaWFsIGluIHlvdXIgbGlicmFyeSBwcm9qZWN0LlxcblxcbicgK1xuICAgICAgICAnSWYgeW91IGludGVuZGVkIHRvIHJ1biB0aGUgc2NoZW1hdGljIG9uIGEgZGlmZmVyZW50IHByb2plY3QsIHBhc3MgdGhlIGAtLXByb2plY3RgICcgK1xuICAgICAgICAnb3B0aW9uLicsXG4gICAgKTtcbiAgICByZXR1cm47XG4gIH07XG59XG5cbi8qKlxuICogQWRkcyBjdXN0b20gTWF0ZXJpYWwgc3R5bGVzIHRvIHRoZSBwcm9qZWN0IHN0eWxlIGZpbGUuIFRoZSBjdXN0b20gQ1NTIHNldHMgdXAgdGhlIFJvYm90byBmb250XG4gKiBhbmQgcmVzZXQgdGhlIGRlZmF1bHQgYnJvd3NlciBib2R5IG1hcmdpbi5cbiAqL1xuZnVuY3Rpb24gYWRkTWF0ZXJpYWxBcHBTdHlsZXMob3B0aW9uczogU2NoZW1hKSB7XG4gIHJldHVybiBhc3luYyAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShob3N0KTtcbiAgICBjb25zdCBwcm9qZWN0ID0gZ2V0UHJvamVjdEZyb21Xb3Jrc3BhY2Uod29ya3NwYWNlLCBvcHRpb25zLnByb2plY3QpO1xuICAgIGNvbnN0IHN0eWxlRmlsZVBhdGggPSBnZXRQcm9qZWN0U3R5bGVGaWxlKHByb2plY3QpO1xuICAgIGNvbnN0IGxvZ2dlciA9IGNvbnRleHQubG9nZ2VyO1xuXG4gICAgaWYgKCFzdHlsZUZpbGVQYXRoKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoYENvdWxkIG5vdCBmaW5kIHRoZSBkZWZhdWx0IHN0eWxlIGZpbGUgZm9yIHRoaXMgcHJvamVjdC5gKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBDb25zaWRlciBtYW51YWxseSBhZGRpbmcgdGhlIFJvYm90byBmb250IHRvIHlvdXIgQ1NTLmApO1xuICAgICAgbG9nZ2VyLmluZm8oYE1vcmUgaW5mb3JtYXRpb24gYXQgaHR0cHM6Ly9mb250cy5nb29nbGUuY29tL3NwZWNpbWVuL1JvYm90b2ApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IGhvc3QucmVhZChzdHlsZUZpbGVQYXRoKTtcblxuICAgIGlmICghYnVmZmVyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgIGBDb3VsZCBub3QgcmVhZCB0aGUgZGVmYXVsdCBzdHlsZSBmaWxlIHdpdGhpbiB0aGUgcHJvamVjdCBgICsgYCgke3N0eWxlRmlsZVBhdGh9KWAsXG4gICAgICApO1xuICAgICAgbG9nZ2VyLmluZm8oYFBsZWFzZSBjb25zaWRlciBtYW51YWxseSBzZXR0aW5nIHVwIHRoZSBSb2JvdG8gZm9udC5gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBodG1sQ29udGVudCA9IGJ1ZmZlci50b1N0cmluZygpO1xuICAgIGNvbnN0IGluc2VydGlvbiA9XG4gICAgICAnXFxuJyArXG4gICAgICBgaHRtbCwgYm9keSB7IGhlaWdodDogMTAwJTsgfVxcbmAgK1xuICAgICAgYGJvZHkgeyBtYXJnaW46IDA7IGZvbnQtZmFtaWx5OiBSb2JvdG8sIFwiSGVsdmV0aWNhIE5ldWVcIiwgc2Fucy1zZXJpZjsgfVxcbmA7XG5cbiAgICBpZiAoaHRtbENvbnRlbnQuaW5jbHVkZXMoaW5zZXJ0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShzdHlsZUZpbGVQYXRoKTtcblxuICAgIHJlY29yZGVyLmluc2VydExlZnQoaHRtbENvbnRlbnQubGVuZ3RoLCBpbnNlcnRpb24pO1xuICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcbiAgfTtcbn1cblxuLyoqIEFkZHMgdGhlIGFuaW1hdGlvbnMgcGFja2FnZSB0byB0aGUgcHJvamVjdCBiYXNlZCBvbiB0aGUgY29uZmZpZ3VyYXRpb24uICovXG5mdW5jdGlvbiBhZGRBbmltYXRpb25zKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCBhbmltYXRpb25zUnVsZSA9XG4gICAgICBvcHRpb25zLmFuaW1hdGlvbnMgPT09ICdleGNsdWRlZCdcbiAgICAgICAgPyBub29wKClcbiAgICAgICAgOiBhZGRSb290UHJvdmlkZXIob3B0aW9ucy5wcm9qZWN0LCAoe2NvZGUsIGV4dGVybmFsfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGVgJHtleHRlcm5hbChcbiAgICAgICAgICAgICAgJ3Byb3ZpZGVBbmltYXRpb25zQXN5bmMnLFxuICAgICAgICAgICAgICAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zL2FzeW5jJyxcbiAgICAgICAgICAgICl9KCR7b3B0aW9ucy5hbmltYXRpb25zID09PSAnZGlzYWJsZWQnID8gYCdub29wJ2AgOiAnJ30pYDtcbiAgICAgICAgICB9KTtcblxuICAgIC8vIFRoZSBgYWRkUm9vdFByb3ZpZGVyYCBydWxlIGNhbiB0aHJvdyBpbiBzb21lIGN1c3RvbSBzY2VuYXJpb3MgKHNlZSAjMjg2NDApLlxuICAgIC8vIEFkZCBzb21lIGVycm9yIGhhbmRsaW5nIGFyb3VuZCBpdCBzbyB0aGUgc2V0dXAgaXNuJ3QgaW50ZXJydXB0ZWQuXG4gICAgcmV0dXJuIGNhbGxSdWxlKGFuaW1hdGlvbnNSdWxlLCBob3N0LCBjb250ZXh0KS5waXBlKFxuICAgICAgY2F0Y2hFcnJvcigoKSA9PiB7XG4gICAgICAgIGNvbnRleHQubG9nZ2VyLmVycm9yKFxuICAgICAgICAgICdGYWlsZWQgdG8gYWRkIGFuaW1hdGlvbnMgdG8gcHJvamVjdC4gQ29udGludWluZyB3aXRoIHRoZSBBbmd1bGFyIE1hdGVyaWFsIHNldHVwLicsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRleHQubG9nZ2VyLmluZm8oXG4gICAgICAgICAgJ1JlYWQgbW9yZSBhYm91dCBzZXR0aW5nIHVwIHRoZSBhbmltYXRpb25zIG1hbnVhbGx5OiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvYW5pbWF0aW9ucycsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlT2YoaG9zdCk7XG4gICAgICB9KSxcbiAgICApO1xuICB9O1xufVxuIl19
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
const utility_1 = require("@schematics/angular/utility");
const path_1 = require("path");
const paths_1 = require("../utility/paths");
const schema_1 = require("./schema");
function default_1(options) {
    switch (options.type) {
        case schema_1.Type.Karma:
            return addKarmaConfig(options);
        case schema_1.Type.Browserslist:
            return addBrowserslistConfig(options);
        default:
            throw new schematics_1.SchematicsException(`"${options.type}" is an unknown configuration file type.`);
    }
}
exports.default = default_1;
function addBrowserslistConfig(options) {
    return async (host) => {
        const workspace = await (0, utility_1.readWorkspace)(host);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project name "${options.project}" doesn't not exist.`);
        }
        return (0, schematics_1.mergeWith)((0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.filter)((p) => p.endsWith('.browserslistrc.template')),
            (0, schematics_1.applyTemplates)({}),
            (0, schematics_1.move)(project.root),
        ]));
    };
}
function addKarmaConfig(options) {
    return (0, utility_1.updateWorkspace)((workspace) => {
        var _a;
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project name "${options.project}" doesn't not exist.`);
        }
        const testTarget = project.targets.get('test');
        if (!testTarget) {
            throw new schematics_1.SchematicsException(`No "test" target found for project "${options.project}".` +
                ' A "test" target is required to generate a karma configuration.');
        }
        if (testTarget.builder !== utility_1.AngularBuilder.Karma) {
            throw new schematics_1.SchematicsException(`Cannot add a karma configuration as builder for "test" target in project does not use "${utility_1.AngularBuilder.Karma}".`);
        }
        (_a = testTarget.options) !== null && _a !== void 0 ? _a : (testTarget.options = {});
        testTarget.options.karmaConfig = path_1.posix.join(project.root, 'karma.conf.js');
        // If scoped project (i.e. "@foo/bar"), convert dir to "foo/bar".
        let folderName = options.project.startsWith('@') ? options.project.slice(1) : options.project;
        if (/[A-Z]/.test(folderName)) {
            folderName = schematics_1.strings.dasherize(folderName);
        }
        return (0, schematics_1.mergeWith)((0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.filter)((p) => p.endsWith('karma.conf.js.template')),
            (0, schematics_1.applyTemplates)({
                relativePathToWorkspaceRoot: (0, paths_1.relativePathToWorkspaceRoot)(project.root),
                folderName,
            }),
            (0, schematics_1.move)(project.root),
        ]));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvY29uZmlnL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBRUgsMkRBVW9DO0FBQ3BDLHlEQUE2RjtBQUM3RiwrQkFBcUM7QUFDckMsNENBQStEO0FBQy9ELHFDQUF1RTtBQUV2RSxtQkFBeUIsT0FBc0I7SUFDN0MsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ3BCLEtBQUssYUFBVSxDQUFDLEtBQUs7WUFDbkIsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsS0FBSyxhQUFVLENBQUMsWUFBWTtZQUMxQixPQUFPLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDO1lBQ0UsTUFBTSxJQUFJLGdDQUFtQixDQUFDLElBQUksT0FBTyxDQUFDLElBQUksMENBQTBDLENBQUMsQ0FBQztLQUM3RjtBQUNILENBQUM7QUFURCw0QkFTQztBQUVELFNBQVMscUJBQXFCLENBQUMsT0FBc0I7SUFDbkQsT0FBTyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDcEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHVCQUFhLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLElBQUksZ0NBQW1CLENBQUMsaUJBQWlCLE9BQU8sQ0FBQyxPQUFPLHNCQUFzQixDQUFDLENBQUM7U0FDdkY7UUFFRCxPQUFPLElBQUEsc0JBQVMsRUFDZCxJQUFBLGtCQUFLLEVBQUMsSUFBQSxnQkFBRyxFQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BCLElBQUEsbUJBQU0sRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3JELElBQUEsMkJBQWMsRUFBQyxFQUFFLENBQUM7WUFDbEIsSUFBQSxpQkFBSSxFQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7U0FDbkIsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBc0I7SUFDNUMsT0FBTyxJQUFBLHlCQUFlLEVBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTs7UUFDbkMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLElBQUksZ0NBQW1CLENBQUMsaUJBQWlCLE9BQU8sQ0FBQyxPQUFPLHNCQUFzQixDQUFDLENBQUM7U0FDdkY7UUFFRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsTUFBTSxJQUFJLGdDQUFtQixDQUMzQix1Q0FBdUMsT0FBTyxDQUFDLE9BQU8sSUFBSTtnQkFDeEQsaUVBQWlFLENBQ3BFLENBQUM7U0FDSDtRQUVELElBQUksVUFBVSxDQUFDLE9BQU8sS0FBSyx3QkFBYyxDQUFDLEtBQUssRUFBRTtZQUMvQyxNQUFNLElBQUksZ0NBQW1CLENBQzNCLDBGQUEwRix3QkFBYyxDQUFDLEtBQUssSUFBSSxDQUNuSCxDQUFDO1NBQ0g7UUFFRCxNQUFBLFVBQVUsQ0FBQyxPQUFPLG9DQUFsQixVQUFVLENBQUMsT0FBTyxHQUFLLEVBQUUsRUFBQztRQUMxQixVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxZQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFMUUsaUVBQWlFO1FBQ2pFLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUM5RixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUIsVUFBVSxHQUFHLG9CQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxJQUFBLHNCQUFTLEVBQ2QsSUFBQSxrQkFBSyxFQUFDLElBQUEsZ0JBQUcsRUFBQyxTQUFTLENBQUMsRUFBRTtZQUNwQixJQUFBLG1CQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUNuRCxJQUFBLDJCQUFjLEVBQUM7Z0JBQ2IsMkJBQTJCLEVBQUUsSUFBQSxtQ0FBMkIsRUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUN0RSxVQUFVO2FBQ1gsQ0FBQztZQUNGLElBQUEsaUJBQUksRUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQ25CLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIGFwcGx5LFxuICBhcHBseVRlbXBsYXRlcyxcbiAgZmlsdGVyLFxuICBtZXJnZVdpdGgsXG4gIG1vdmUsXG4gIHN0cmluZ3MsXG4gIHVybCxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgQW5ndWxhckJ1aWxkZXIsIHJlYWRXb3Jrc3BhY2UsIHVwZGF0ZVdvcmtzcGFjZSB9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eSc7XG5pbXBvcnQgeyBwb3NpeCBhcyBwYXRoIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QgfSBmcm9tICcuLi91dGlsaXR5L3BhdGhzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBDb25maWdPcHRpb25zLCBUeXBlIGFzIENvbmZpZ1R5cGUgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25zOiBDb25maWdPcHRpb25zKTogUnVsZSB7XG4gIHN3aXRjaCAob3B0aW9ucy50eXBlKSB7XG4gICAgY2FzZSBDb25maWdUeXBlLkthcm1hOlxuICAgICAgcmV0dXJuIGFkZEthcm1hQ29uZmlnKG9wdGlvbnMpO1xuICAgIGNhc2UgQ29uZmlnVHlwZS5Ccm93c2Vyc2xpc3Q6XG4gICAgICByZXR1cm4gYWRkQnJvd3NlcnNsaXN0Q29uZmlnKG9wdGlvbnMpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgXCIke29wdGlvbnMudHlwZX1cIiBpcyBhbiB1bmtub3duIGNvbmZpZ3VyYXRpb24gZmlsZSB0eXBlLmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZEJyb3dzZXJzbGlzdENvbmZpZyhvcHRpb25zOiBDb25maWdPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAoaG9zdCkgPT4ge1xuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IHJlYWRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IHdvcmtzcGFjZS5wcm9qZWN0cy5nZXQob3B0aW9ucy5wcm9qZWN0KTtcbiAgICBpZiAoIXByb2plY3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBQcm9qZWN0IG5hbWUgXCIke29wdGlvbnMucHJvamVjdH1cIiBkb2Vzbid0IG5vdCBleGlzdC5gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VXaXRoKFxuICAgICAgYXBwbHkodXJsKCcuL2ZpbGVzJyksIFtcbiAgICAgICAgZmlsdGVyKChwKSA9PiBwLmVuZHNXaXRoKCcuYnJvd3NlcnNsaXN0cmMudGVtcGxhdGUnKSksXG4gICAgICAgIGFwcGx5VGVtcGxhdGVzKHt9KSxcbiAgICAgICAgbW92ZShwcm9qZWN0LnJvb3QpLFxuICAgICAgXSksXG4gICAgKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkS2FybWFDb25maWcob3B0aW9uczogQ29uZmlnT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gdXBkYXRlV29ya3NwYWNlKCh3b3Jrc3BhY2UpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gd29ya3NwYWNlLnByb2plY3RzLmdldChvcHRpb25zLnByb2plY3QpO1xuICAgIGlmICghcHJvamVjdCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYFByb2plY3QgbmFtZSBcIiR7b3B0aW9ucy5wcm9qZWN0fVwiIGRvZXNuJ3Qgbm90IGV4aXN0LmApO1xuICAgIH1cblxuICAgIGNvbnN0IHRlc3RUYXJnZXQgPSBwcm9qZWN0LnRhcmdldHMuZ2V0KCd0ZXN0Jyk7XG4gICAgaWYgKCF0ZXN0VGFyZ2V0KSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihcbiAgICAgICAgYE5vIFwidGVzdFwiIHRhcmdldCBmb3VuZCBmb3IgcHJvamVjdCBcIiR7b3B0aW9ucy5wcm9qZWN0fVwiLmAgK1xuICAgICAgICAgICcgQSBcInRlc3RcIiB0YXJnZXQgaXMgcmVxdWlyZWQgdG8gZ2VuZXJhdGUgYSBrYXJtYSBjb25maWd1cmF0aW9uLicsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0ZXN0VGFyZ2V0LmJ1aWxkZXIgIT09IEFuZ3VsYXJCdWlsZGVyLkthcm1hKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihcbiAgICAgICAgYENhbm5vdCBhZGQgYSBrYXJtYSBjb25maWd1cmF0aW9uIGFzIGJ1aWxkZXIgZm9yIFwidGVzdFwiIHRhcmdldCBpbiBwcm9qZWN0IGRvZXMgbm90IHVzZSBcIiR7QW5ndWxhckJ1aWxkZXIuS2FybWF9XCIuYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGVzdFRhcmdldC5vcHRpb25zID8/PSB7fTtcbiAgICB0ZXN0VGFyZ2V0Lm9wdGlvbnMua2FybWFDb25maWcgPSBwYXRoLmpvaW4ocHJvamVjdC5yb290LCAna2FybWEuY29uZi5qcycpO1xuXG4gICAgLy8gSWYgc2NvcGVkIHByb2plY3QgKGkuZS4gXCJAZm9vL2JhclwiKSwgY29udmVydCBkaXIgdG8gXCJmb28vYmFyXCIuXG4gICAgbGV0IGZvbGRlck5hbWUgPSBvcHRpb25zLnByb2plY3Quc3RhcnRzV2l0aCgnQCcpID8gb3B0aW9ucy5wcm9qZWN0LnNsaWNlKDEpIDogb3B0aW9ucy5wcm9qZWN0O1xuICAgIGlmICgvW0EtWl0vLnRlc3QoZm9sZGVyTmFtZSkpIHtcbiAgICAgIGZvbGRlck5hbWUgPSBzdHJpbmdzLmRhc2hlcml6ZShmb2xkZXJOYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VXaXRoKFxuICAgICAgYXBwbHkodXJsKCcuL2ZpbGVzJyksIFtcbiAgICAgICAgZmlsdGVyKChwKSA9PiBwLmVuZHNXaXRoKCdrYXJtYS5jb25mLmpzLnRlbXBsYXRlJykpLFxuICAgICAgICBhcHBseVRlbXBsYXRlcyh7XG4gICAgICAgICAgcmVsYXRpdmVQYXRoVG9Xb3Jrc3BhY2VSb290OiByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QocHJvamVjdC5yb290KSxcbiAgICAgICAgICBmb2xkZXJOYW1lLFxuICAgICAgICB9KSxcbiAgICAgICAgbW92ZShwcm9qZWN0LnJvb3QpLFxuICAgICAgXSksXG4gICAgKTtcbiAgfSk7XG59XG4iXX0=
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
const tasks_1 = require("@angular-devkit/schematics/tasks");
function default_1(options) {
    if (!options.directory) {
        // If scoped project (i.e. "@foo/bar"), convert directory to "foo/bar".
        options.directory = options.name.startsWith('@') ? options.name.slice(1) : options.name;
    }
    const workspaceOptions = {
        name: options.name,
        version: options.version,
        newProjectRoot: options.newProjectRoot,
        minimal: options.minimal,
        strict: options.strict,
        packageManager: options.packageManager,
    };
    const applicationOptions = {
        projectRoot: '',
        name: options.name,
        inlineStyle: options.inlineStyle,
        inlineTemplate: options.inlineTemplate,
        prefix: options.prefix,
        viewEncapsulation: options.viewEncapsulation,
        routing: options.routing,
        style: options.style,
        skipTests: options.skipTests,
        skipPackageJson: false,
        // always 'skipInstall' here, so that we do it after the move
        skipInstall: true,
        strict: options.strict,
        minimal: options.minimal,
    };
    return (0, schematics_1.chain)([
        (0, schematics_1.mergeWith)((0, schematics_1.apply)((0, schematics_1.empty)(), [
            (0, schematics_1.schematic)('workspace', workspaceOptions),
            options.createApplication ? (0, schematics_1.schematic)('application', applicationOptions) : schematics_1.noop,
            (0, schematics_1.move)(options.directory),
        ])),
        (_host, context) => {
            let packageTask;
            if (!options.skipInstall) {
                packageTask = context.addTask(new tasks_1.NodePackageInstallTask({
                    workingDirectory: options.directory,
                    packageManager: options.packageManager,
                }));
                if (options.linkCli) {
                    packageTask = context.addTask(new tasks_1.NodePackageLinkTask('@angular/cli', options.directory), [packageTask]);
                }
            }
            if (!options.skipGit) {
                const commit = typeof options.commit == 'object' ? options.commit : options.commit ? {} : false;
                context.addTask(new tasks_1.RepositoryInitializerTask(options.directory, commit), packageTask ? [packageTask] : []);
            }
        },
    ]);
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvbmctbmV3L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBRUgsMkRBV29DO0FBQ3BDLDREQUkwQztBQUsxQyxtQkFBeUIsT0FBcUI7SUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDdEIsdUVBQXVFO1FBQ3ZFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0tBQ3pGO0lBRUQsTUFBTSxnQkFBZ0IsR0FBcUI7UUFDekMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1FBQ2xCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztRQUN4QixjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDdEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ3hCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtRQUN0QixjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7S0FDdkMsQ0FBQztJQUNGLE1BQU0sa0JBQWtCLEdBQXVCO1FBQzdDLFdBQVcsRUFBRSxFQUFFO1FBQ2YsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1FBQ2xCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztRQUNoQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDdEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1FBQ3RCLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxpQkFBaUI7UUFDNUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ3hCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztRQUNwQixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7UUFDNUIsZUFBZSxFQUFFLEtBQUs7UUFDdEIsNkRBQTZEO1FBQzdELFdBQVcsRUFBRSxJQUFJO1FBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtRQUN0QixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87S0FDekIsQ0FBQztJQUVGLE9BQU8sSUFBQSxrQkFBSyxFQUFDO1FBQ1gsSUFBQSxzQkFBUyxFQUNQLElBQUEsa0JBQUssRUFBQyxJQUFBLGtCQUFLLEdBQUUsRUFBRTtZQUNiLElBQUEsc0JBQVMsRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUM7WUFDeEMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFBLHNCQUFTLEVBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFJO1lBQy9FLElBQUEsaUJBQUksRUFBQyxPQUFPLENBQUMsU0FBUyxDQUFDO1NBQ3hCLENBQUMsQ0FDSDtRQUNELENBQUMsS0FBVyxFQUFFLE9BQXlCLEVBQUUsRUFBRTtZQUN6QyxJQUFJLFdBQVcsQ0FBQztZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtnQkFDeEIsV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQzNCLElBQUksOEJBQXNCLENBQUM7b0JBQ3pCLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxTQUFTO29CQUNuQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7aUJBQ3ZDLENBQUMsQ0FDSCxDQUFDO2dCQUNGLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtvQkFDbkIsV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQzNCLElBQUksMkJBQW1CLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDMUQsQ0FBQyxXQUFXLENBQUMsQ0FDZCxDQUFDO2lCQUNIO2FBQ0Y7WUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDcEIsTUFBTSxNQUFNLEdBQ1YsT0FBTyxPQUFPLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBRW5GLE9BQU8sQ0FBQyxPQUFPLENBQ2IsSUFBSSxpQ0FBeUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUN4RCxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDakMsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFsRUQsNEJBa0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFRyZWUsXG4gIGFwcGx5LFxuICBjaGFpbixcbiAgZW1wdHksXG4gIG1lcmdlV2l0aCxcbiAgbW92ZSxcbiAgbm9vcCxcbiAgc2NoZW1hdGljLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBOb2RlUGFja2FnZUluc3RhbGxUYXNrLFxuICBOb2RlUGFja2FnZUxpbmtUYXNrLFxuICBSZXBvc2l0b3J5SW5pdGlhbGl6ZXJUYXNrLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQXBwbGljYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vYXBwbGljYXRpb24vc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBXb3Jrc3BhY2VPcHRpb25zIH0gZnJvbSAnLi4vd29ya3NwYWNlL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgTmdOZXdPcHRpb25zIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9uczogTmdOZXdPcHRpb25zKTogUnVsZSB7XG4gIGlmICghb3B0aW9ucy5kaXJlY3RvcnkpIHtcbiAgICAvLyBJZiBzY29wZWQgcHJvamVjdCAoaS5lLiBcIkBmb28vYmFyXCIpLCBjb252ZXJ0IGRpcmVjdG9yeSB0byBcImZvby9iYXJcIi5cbiAgICBvcHRpb25zLmRpcmVjdG9yeSA9IG9wdGlvbnMubmFtZS5zdGFydHNXaXRoKCdAJykgPyBvcHRpb25zLm5hbWUuc2xpY2UoMSkgOiBvcHRpb25zLm5hbWU7XG4gIH1cblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6IG9wdGlvbnMubmFtZSxcbiAgICB2ZXJzaW9uOiBvcHRpb25zLnZlcnNpb24sXG4gICAgbmV3UHJvamVjdFJvb3Q6IG9wdGlvbnMubmV3UHJvamVjdFJvb3QsXG4gICAgbWluaW1hbDogb3B0aW9ucy5taW5pbWFsLFxuICAgIHN0cmljdDogb3B0aW9ucy5zdHJpY3QsXG4gICAgcGFja2FnZU1hbmFnZXI6IG9wdGlvbnMucGFja2FnZU1hbmFnZXIsXG4gIH07XG4gIGNvbnN0IGFwcGxpY2F0aW9uT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIHByb2plY3RSb290OiAnJyxcbiAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG4gICAgaW5saW5lU3R5bGU6IG9wdGlvbnMuaW5saW5lU3R5bGUsXG4gICAgaW5saW5lVGVtcGxhdGU6IG9wdGlvbnMuaW5saW5lVGVtcGxhdGUsXG4gICAgcHJlZml4OiBvcHRpb25zLnByZWZpeCxcbiAgICB2aWV3RW5jYXBzdWxhdGlvbjogb3B0aW9ucy52aWV3RW5jYXBzdWxhdGlvbixcbiAgICByb3V0aW5nOiBvcHRpb25zLnJvdXRpbmcsXG4gICAgc3R5bGU6IG9wdGlvbnMuc3R5bGUsXG4gICAgc2tpcFRlc3RzOiBvcHRpb25zLnNraXBUZXN0cyxcbiAgICBza2lwUGFja2FnZUpzb246IGZhbHNlLFxuICAgIC8vIGFsd2F5cyAnc2tpcEluc3RhbGwnIGhlcmUsIHNvIHRoYXQgd2UgZG8gaXQgYWZ0ZXIgdGhlIG1vdmVcbiAgICBza2lwSW5zdGFsbDogdHJ1ZSxcbiAgICBzdHJpY3Q6IG9wdGlvbnMuc3RyaWN0LFxuICAgIG1pbmltYWw6IG9wdGlvbnMubWluaW1hbCxcbiAgfTtcblxuICByZXR1cm4gY2hhaW4oW1xuICAgIG1lcmdlV2l0aChcbiAgICAgIGFwcGx5KGVtcHR5KCksIFtcbiAgICAgICAgc2NoZW1hdGljKCd3b3Jrc3BhY2UnLCB3b3Jrc3BhY2VPcHRpb25zKSxcbiAgICAgICAgb3B0aW9ucy5jcmVhdGVBcHBsaWNhdGlvbiA/IHNjaGVtYXRpYygnYXBwbGljYXRpb24nLCBhcHBsaWNhdGlvbk9wdGlvbnMpIDogbm9vcCxcbiAgICAgICAgbW92ZShvcHRpb25zLmRpcmVjdG9yeSksXG4gICAgICBdKSxcbiAgICApLFxuICAgIChfaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgICAgbGV0IHBhY2thZ2VUYXNrO1xuICAgICAgaWYgKCFvcHRpb25zLnNraXBJbnN0YWxsKSB7XG4gICAgICAgIHBhY2thZ2VUYXNrID0gY29udGV4dC5hZGRUYXNrKFxuICAgICAgICAgIG5ldyBOb2RlUGFja2FnZUluc3RhbGxUYXNrKHtcbiAgICAgICAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IG9wdGlvbnMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgcGFja2FnZU1hbmFnZXI6IG9wdGlvbnMucGFja2FnZU1hbmFnZXIsXG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICAgIGlmIChvcHRpb25zLmxpbmtDbGkpIHtcbiAgICAgICAgICBwYWNrYWdlVGFzayA9IGNvbnRleHQuYWRkVGFzayhcbiAgICAgICAgICAgIG5ldyBOb2RlUGFja2FnZUxpbmtUYXNrKCdAYW5ndWxhci9jbGknLCBvcHRpb25zLmRpcmVjdG9yeSksXG4gICAgICAgICAgICBbcGFja2FnZVRhc2tdLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghb3B0aW9ucy5za2lwR2l0KSB7XG4gICAgICAgIGNvbnN0IGNvbW1pdCA9XG4gICAgICAgICAgdHlwZW9mIG9wdGlvbnMuY29tbWl0ID09ICdvYmplY3QnID8gb3B0aW9ucy5jb21taXQgOiBvcHRpb25zLmNvbW1pdCA/IHt9IDogZmFsc2U7XG5cbiAgICAgICAgY29udGV4dC5hZGRUYXNrKFxuICAgICAgICAgIG5ldyBSZXBvc2l0b3J5SW5pdGlhbGl6ZXJUYXNrKG9wdGlvbnMuZGlyZWN0b3J5LCBjb21taXQpLFxuICAgICAgICAgIHBhY2thZ2VUYXNrID8gW3BhY2thZ2VUYXNrXSA6IFtdLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG4gIF0pO1xufVxuIl19
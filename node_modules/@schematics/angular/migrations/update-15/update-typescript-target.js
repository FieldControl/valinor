"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return async (host, context) => {
        // Workspace level tsconfig
        updateTarget(host, 'tsconfig.json');
        const workspace = await (0, workspace_1.getWorkspace)(host);
        // Find all tsconfig which are refereces used by builders
        for (const [, project] of workspace.projects) {
            for (const [targetName, target] of project.targets) {
                // Update all other known CLI builders that use a tsconfig
                const tsConfigs = [target.options || {}, ...Object.values(target.configurations || {})]
                    .filter((opt) => typeof (opt === null || opt === void 0 ? void 0 : opt.tsConfig) === 'string')
                    .map((opt) => opt.tsConfig);
                const uniqueTsConfigs = new Set(tsConfigs);
                for (const tsConfig of uniqueTsConfigs) {
                    if (host.exists(tsConfig)) {
                        continue;
                    }
                    uniqueTsConfigs.delete(tsConfig);
                    context.logger.warn(`'${tsConfig}' referenced in the '${targetName}' target does not exist.`);
                }
                if (!uniqueTsConfigs.size) {
                    continue;
                }
                switch (target.builder) {
                    case workspace_models_1.Builders.Server:
                    case workspace_models_1.Builders.Karma:
                    case workspace_models_1.Builders.Browser:
                    case workspace_models_1.Builders.NgPackagr:
                        for (const tsConfig of uniqueTsConfigs) {
                            removeOrUpdateTarget(host, tsConfig);
                        }
                        break;
                }
            }
        }
    };
}
exports.default = default_1;
function removeOrUpdateTarget(host, tsConfigPath) {
    const json = new json_file_1.JSONFile(host, tsConfigPath);
    if (typeof json.get(['extends']) === 'string') {
        json.remove(['compilerOptions', 'target']);
    }
    else {
        updateTarget(host, tsConfigPath);
    }
}
const ESNEXT_ES2022_REGEXP = /^es(?:next|2022)$/i;
function updateTarget(host, tsConfigPath) {
    const json = new json_file_1.JSONFile(host, tsConfigPath);
    const jsonPath = ['compilerOptions'];
    const compilerOptions = json.get(jsonPath);
    if (compilerOptions && typeof compilerOptions === 'object') {
        const { target } = compilerOptions;
        if (typeof target === 'string' && !ESNEXT_ES2022_REGEXP.test(target)) {
            json.modify(jsonPath, {
                ...compilerOptions,
                'target': 'ES2022',
                'useDefineForClassFields': false,
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXR5cGVzY3JpcHQtdGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hdGljcy9hbmd1bGFyL21pZ3JhdGlvbnMvdXBkYXRlLTE1L3VwZGF0ZS10eXBlc2NyaXB0LXRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUlILHVEQUFtRDtBQUNuRCx1REFBdUQ7QUFDdkQscUVBQTBEO0FBRTFEO0lBQ0UsT0FBTyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzdCLDJCQUEyQjtRQUMzQixZQUFZLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXBDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSx3QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNDLHlEQUF5RDtRQUN6RCxLQUFLLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7WUFDNUMsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xELDBEQUEwRDtnQkFDMUQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDcEYsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUEsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLFFBQVEsQ0FBQSxLQUFLLFFBQVEsQ0FBQztxQkFDbEQsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBRSxHQUE0QixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUV4RCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDM0MsS0FBSyxNQUFNLFFBQVEsSUFBSSxlQUFlLEVBQUU7b0JBQ3RDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDekIsU0FBUztxQkFDVjtvQkFFRCxlQUFlLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDakIsSUFBSSxRQUFRLHdCQUF3QixVQUFVLDBCQUEwQixDQUN6RSxDQUFDO2lCQUNIO2dCQUVELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO29CQUN6QixTQUFTO2lCQUNWO2dCQUVELFFBQVEsTUFBTSxDQUFDLE9BQW1CLEVBQUU7b0JBQ2xDLEtBQUssMkJBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQ3JCLEtBQUssMkJBQVEsQ0FBQyxLQUFLLENBQUM7b0JBQ3BCLEtBQUssMkJBQVEsQ0FBQyxPQUFPLENBQUM7b0JBQ3RCLEtBQUssMkJBQVEsQ0FBQyxTQUFTO3dCQUNyQixLQUFLLE1BQU0sUUFBUSxJQUFJLGVBQWUsRUFBRTs0QkFDdEMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3lCQUN0Qzt3QkFDRCxNQUFNO2lCQUNUO2FBQ0Y7U0FDRjtJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUE1Q0QsNEJBNENDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxJQUFVLEVBQUUsWUFBb0I7SUFDNUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxvQkFBUSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM5QyxJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQzVDO1NBQU07UUFDTCxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ2xDO0FBQ0gsQ0FBQztBQUVELE1BQU0sb0JBQW9CLEdBQUcsb0JBQW9CLENBQUM7QUFDbEQsU0FBUyxZQUFZLENBQUMsSUFBVSxFQUFFLFlBQW9CO0lBQ3BELE1BQU0sSUFBSSxHQUFHLElBQUksb0JBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDOUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFM0MsSUFBSSxlQUFlLElBQUksT0FBTyxlQUFlLEtBQUssUUFBUSxFQUFFO1FBQzFELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxlQUE2QixDQUFDO1FBRWpELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3BFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUNwQixHQUFHLGVBQWU7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQix5QkFBeUIsRUFBRSxLQUFLO2FBQ2pDLENBQUMsQ0FBQztTQUNKO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IEpzb25PYmplY3QgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBSdWxlLCBUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgSlNPTkZpbGUgfSBmcm9tICcuLi8uLi91dGlsaXR5L2pzb24tZmlsZSc7XG5pbXBvcnQgeyBnZXRXb3Jrc3BhY2UgfSBmcm9tICcuLi8uLi91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQgeyBCdWlsZGVycyB9IGZyb20gJy4uLy4uL3V0aWxpdHkvd29ya3NwYWNlLW1vZGVscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpOiBSdWxlIHtcbiAgcmV0dXJuIGFzeW5jIChob3N0LCBjb250ZXh0KSA9PiB7XG4gICAgLy8gV29ya3NwYWNlIGxldmVsIHRzY29uZmlnXG4gICAgdXBkYXRlVGFyZ2V0KGhvc3QsICd0c2NvbmZpZy5qc29uJyk7XG5cbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG5cbiAgICAvLyBGaW5kIGFsbCB0c2NvbmZpZyB3aGljaCBhcmUgcmVmZXJlY2VzIHVzZWQgYnkgYnVpbGRlcnNcbiAgICBmb3IgKGNvbnN0IFssIHByb2plY3RdIG9mIHdvcmtzcGFjZS5wcm9qZWN0cykge1xuICAgICAgZm9yIChjb25zdCBbdGFyZ2V0TmFtZSwgdGFyZ2V0XSBvZiBwcm9qZWN0LnRhcmdldHMpIHtcbiAgICAgICAgLy8gVXBkYXRlIGFsbCBvdGhlciBrbm93biBDTEkgYnVpbGRlcnMgdGhhdCB1c2UgYSB0c2NvbmZpZ1xuICAgICAgICBjb25zdCB0c0NvbmZpZ3MgPSBbdGFyZ2V0Lm9wdGlvbnMgfHwge30sIC4uLk9iamVjdC52YWx1ZXModGFyZ2V0LmNvbmZpZ3VyYXRpb25zIHx8IHt9KV1cbiAgICAgICAgICAuZmlsdGVyKChvcHQpID0+IHR5cGVvZiBvcHQ/LnRzQ29uZmlnID09PSAnc3RyaW5nJylcbiAgICAgICAgICAubWFwKChvcHQpID0+IChvcHQgYXMgeyB0c0NvbmZpZzogc3RyaW5nIH0pLnRzQ29uZmlnKTtcblxuICAgICAgICBjb25zdCB1bmlxdWVUc0NvbmZpZ3MgPSBuZXcgU2V0KHRzQ29uZmlncyk7XG4gICAgICAgIGZvciAoY29uc3QgdHNDb25maWcgb2YgdW5pcXVlVHNDb25maWdzKSB7XG4gICAgICAgICAgaWYgKGhvc3QuZXhpc3RzKHRzQ29uZmlnKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdW5pcXVlVHNDb25maWdzLmRlbGV0ZSh0c0NvbmZpZyk7XG4gICAgICAgICAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICAgICAgICAgIGAnJHt0c0NvbmZpZ30nIHJlZmVyZW5jZWQgaW4gdGhlICcke3RhcmdldE5hbWV9JyB0YXJnZXQgZG9lcyBub3QgZXhpc3QuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1bmlxdWVUc0NvbmZpZ3Muc2l6ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoICh0YXJnZXQuYnVpbGRlciBhcyBCdWlsZGVycykge1xuICAgICAgICAgIGNhc2UgQnVpbGRlcnMuU2VydmVyOlxuICAgICAgICAgIGNhc2UgQnVpbGRlcnMuS2FybWE6XG4gICAgICAgICAgY2FzZSBCdWlsZGVycy5Ccm93c2VyOlxuICAgICAgICAgIGNhc2UgQnVpbGRlcnMuTmdQYWNrYWdyOlxuICAgICAgICAgICAgZm9yIChjb25zdCB0c0NvbmZpZyBvZiB1bmlxdWVUc0NvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgcmVtb3ZlT3JVcGRhdGVUYXJnZXQoaG9zdCwgdHNDb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU9yVXBkYXRlVGFyZ2V0KGhvc3Q6IFRyZWUsIHRzQ29uZmlnUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGpzb24gPSBuZXcgSlNPTkZpbGUoaG9zdCwgdHNDb25maWdQYXRoKTtcbiAgaWYgKHR5cGVvZiBqc29uLmdldChbJ2V4dGVuZHMnXSkgPT09ICdzdHJpbmcnKSB7XG4gICAganNvbi5yZW1vdmUoWydjb21waWxlck9wdGlvbnMnLCAndGFyZ2V0J10pO1xuICB9IGVsc2Uge1xuICAgIHVwZGF0ZVRhcmdldChob3N0LCB0c0NvbmZpZ1BhdGgpO1xuICB9XG59XG5cbmNvbnN0IEVTTkVYVF9FUzIwMjJfUkVHRVhQID0gL15lcyg/Om5leHR8MjAyMikkL2k7XG5mdW5jdGlvbiB1cGRhdGVUYXJnZXQoaG9zdDogVHJlZSwgdHNDb25maWdQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QganNvbiA9IG5ldyBKU09ORmlsZShob3N0LCB0c0NvbmZpZ1BhdGgpO1xuICBjb25zdCBqc29uUGF0aCA9IFsnY29tcGlsZXJPcHRpb25zJ107XG4gIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9IGpzb24uZ2V0KGpzb25QYXRoKTtcblxuICBpZiAoY29tcGlsZXJPcHRpb25zICYmIHR5cGVvZiBjb21waWxlck9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgeyB0YXJnZXQgfSA9IGNvbXBpbGVyT3B0aW9ucyBhcyBKc29uT2JqZWN0O1xuXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnICYmICFFU05FWFRfRVMyMDIyX1JFR0VYUC50ZXN0KHRhcmdldCkpIHtcbiAgICAgIGpzb24ubW9kaWZ5KGpzb25QYXRoLCB7XG4gICAgICAgIC4uLmNvbXBpbGVyT3B0aW9ucyxcbiAgICAgICAgJ3RhcmdldCc6ICdFUzIwMjInLFxuICAgICAgICAndXNlRGVmaW5lRm9yQ2xhc3NGaWVsZHMnOiBmYWxzZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIl19
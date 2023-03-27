"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return (0, workspace_1.updateWorkspace)((workspace) => {
        var _a;
        for (const project of workspace.projects.values()) {
            for (const target of project.targets.values()) {
                if (target.builder !== workspace_models_1.Builders.Server) {
                    continue;
                }
                for (const [name, options] of (0, workspace_1.allTargetOptions)(target)) {
                    delete options.bundleDependencies;
                    if (name === 'development') {
                        (_a = options.vendorChunk) !== null && _a !== void 0 ? _a : (options.vendorChunk = true);
                    }
                }
            }
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXdvcmtzcGFjZS1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvbWlncmF0aW9ucy91cGRhdGUtMTUvdXBkYXRlLXdvcmtzcGFjZS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFHSCx1REFBNEU7QUFDNUUscUVBQTBEO0FBRTFEO0lBQ0UsT0FBTyxJQUFBLDJCQUFlLEVBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTs7UUFDbkMsS0FBSyxNQUFNLE9BQU8sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2pELEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDN0MsSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLDJCQUFRLENBQUMsTUFBTSxFQUFFO29CQUN0QyxTQUFTO2lCQUNWO2dCQUVELEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFBLDRCQUFnQixFQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUN0RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztvQkFFbEMsSUFBSSxJQUFJLEtBQUssYUFBYSxFQUFFO3dCQUMxQixNQUFBLE9BQU8sQ0FBQyxXQUFXLG9DQUFuQixPQUFPLENBQUMsV0FBVyxHQUFLLElBQUksRUFBQztxQkFDOUI7aUJBQ0Y7YUFDRjtTQUNGO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBbEJELDRCQWtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBSdWxlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgYWxsVGFyZ2V0T3B0aW9ucywgdXBkYXRlV29ya3NwYWNlIH0gZnJvbSAnLi4vLi4vdXRpbGl0eS93b3Jrc3BhY2UnO1xuaW1wb3J0IHsgQnVpbGRlcnMgfSBmcm9tICcuLi8uLi91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKTogUnVsZSB7XG4gIHJldHVybiB1cGRhdGVXb3Jrc3BhY2UoKHdvcmtzcGFjZSkgPT4ge1xuICAgIGZvciAoY29uc3QgcHJvamVjdCBvZiB3b3Jrc3BhY2UucHJvamVjdHMudmFsdWVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgdGFyZ2V0IG9mIHByb2plY3QudGFyZ2V0cy52YWx1ZXMoKSkge1xuICAgICAgICBpZiAodGFyZ2V0LmJ1aWxkZXIgIT09IEJ1aWxkZXJzLlNlcnZlcikge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgb3B0aW9uc10gb2YgYWxsVGFyZ2V0T3B0aW9ucyh0YXJnZXQpKSB7XG4gICAgICAgICAgZGVsZXRlIG9wdGlvbnMuYnVuZGxlRGVwZW5kZW5jaWVzO1xuXG4gICAgICAgICAgaWYgKG5hbWUgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICAgIG9wdGlvbnMudmVuZG9yQ2h1bmsgPz89IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==
"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDependency = exports.ExistingBehavior = exports.InstallBehavior = exports.DependencyType = void 0;
const tasks_1 = require("@angular-devkit/schematics/tasks");
const path = __importStar(require("path"));
const installTasks = new WeakMap();
/**
 * An enum used to specify the type of a dependency found within a package manifest
 * file (`package.json`).
 */
var DependencyType;
(function (DependencyType) {
    DependencyType["Default"] = "dependencies";
    DependencyType["Dev"] = "devDependencies";
    DependencyType["Peer"] = "peerDependencies";
})(DependencyType = exports.DependencyType || (exports.DependencyType = {}));
/**
 * An enum used to specify the dependency installation behavior for the {@link addDependency}
 * schematics rule. The installation behavior affects if and when {@link NodePackageInstallTask}
 * will be scheduled when using the rule.
 */
var InstallBehavior;
(function (InstallBehavior) {
    /**
     * No installation will occur as a result of the rule when specified.
     *
     * NOTE: This does not prevent other rules from scheduling a {@link NodePackageInstallTask}
     * which may install the dependency.
     */
    InstallBehavior[InstallBehavior["None"] = 0] = "None";
    /**
     * Automatically determine the need to schedule a {@link NodePackageInstallTask} based on
     * previous usage of the {@link addDependency} within the schematic.
     */
    InstallBehavior[InstallBehavior["Auto"] = 1] = "Auto";
    /**
     * Always schedule a {@link NodePackageInstallTask} when the rule is executed.
     */
    InstallBehavior[InstallBehavior["Always"] = 2] = "Always";
})(InstallBehavior = exports.InstallBehavior || (exports.InstallBehavior = {}));
/**
 * An enum used to specify the existing dependency behavior for the {@link addDependency}
 * schematics rule. The existing behavior affects whether the named dependency will be added
 * to the `package.json` when the dependency is already present with a differing specifier.
 */
var ExistingBehavior;
(function (ExistingBehavior) {
    /**
     * The dependency will not be added or otherwise changed if it already exists.
     */
    ExistingBehavior[ExistingBehavior["Skip"] = 0] = "Skip";
    /**
     * The dependency's existing specifier will be replaced with the specifier provided in the
     * {@link addDependency} call. A warning will also be shown during schematic execution to
     * notify the user of the replacement.
     */
    ExistingBehavior[ExistingBehavior["Replace"] = 1] = "Replace";
})(ExistingBehavior = exports.ExistingBehavior || (exports.ExistingBehavior = {}));
/**
 * Adds a package as a dependency to a `package.json`. By default the `package.json` located
 * at the schematic's root will be used. The `manifestPath` option can be used to explicitly specify
 * a `package.json` in different location. The type of the dependency can also be specified instead
 * of the default of the `dependencies` section by using the `type` option for either `devDependencies`
 * or `peerDependencies`.
 *
 * When using this rule, {@link NodePackageInstallTask} does not need to be included directly by
 * a schematic. A package manager install task will be automatically scheduled as needed.
 *
 * @param name The name of the package to add.
 * @param specifier The package specifier for the package to add. Typically a SemVer range.
 * @param options An optional object that can contain the `type` of the dependency
 * and/or a path (`packageJsonPath`) of a manifest file (`package.json`) to modify.
 * @returns A Schematics {@link Rule}
 */
function addDependency(name, specifier, options = {}) {
    const { type = DependencyType.Default, packageJsonPath = '/package.json', install = InstallBehavior.Auto, existing = ExistingBehavior.Replace, } = options;
    return (tree, context) => {
        var _a;
        const manifest = tree.readJson(packageJsonPath);
        const dependencySection = manifest[type];
        if (!dependencySection) {
            // Section is not present. The dependency can be added to a new object literal for the section.
            manifest[type] = { [name]: specifier };
        }
        else {
            const existingSpecifier = dependencySection[name];
            if (existingSpecifier === specifier) {
                // Already present with same specifier
                return;
            }
            if (existingSpecifier) {
                // Already present but different specifier
                if (existing === ExistingBehavior.Skip) {
                    return;
                }
                // ExistingBehavior.Replace is the only other behavior currently
                context.logger.warn(`Package dependency "${name}" already exists with a different specifier. ` +
                    `"${existingSpecifier}" will be replaced with "${specifier}".`);
            }
            // Add new dependency in alphabetical order
            const entries = Object.entries(dependencySection);
            entries.push([name, specifier]);
            entries.sort((a, b) => a[0].localeCompare(b[0]));
            manifest[type] = Object.fromEntries(entries);
        }
        tree.overwrite(packageJsonPath, JSON.stringify(manifest, null, 2));
        const installPaths = (_a = installTasks.get(context)) !== null && _a !== void 0 ? _a : new Set();
        if (install === InstallBehavior.Always ||
            (install === InstallBehavior.Auto && !installPaths.has(packageJsonPath))) {
            context.addTask(new tasks_1.NodePackageInstallTask({ workingDirectory: path.dirname(packageJsonPath) }));
            installPaths.add(packageJsonPath);
            installTasks.set(context, installPaths);
        }
    };
}
exports.addDependency = addDependency;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2RlcGVuZGVuY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHSCw0REFBMEU7QUFDMUUsMkNBQTZCO0FBRTdCLE1BQU0sWUFBWSxHQUFHLElBQUksT0FBTyxFQUFpQyxDQUFDO0FBUWxFOzs7R0FHRztBQUNILElBQVksY0FJWDtBQUpELFdBQVksY0FBYztJQUN4QiwwQ0FBd0IsQ0FBQTtJQUN4Qix5Q0FBdUIsQ0FBQTtJQUN2QiwyQ0FBeUIsQ0FBQTtBQUMzQixDQUFDLEVBSlcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFJekI7QUFFRDs7OztHQUlHO0FBQ0gsSUFBWSxlQWlCWDtBQWpCRCxXQUFZLGVBQWU7SUFDekI7Ozs7O09BS0c7SUFDSCxxREFBSSxDQUFBO0lBQ0o7OztPQUdHO0lBQ0gscURBQUksQ0FBQTtJQUNKOztPQUVHO0lBQ0gseURBQU0sQ0FBQTtBQUNSLENBQUMsRUFqQlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFpQjFCO0FBRUQ7Ozs7R0FJRztBQUNILElBQVksZ0JBV1g7QUFYRCxXQUFZLGdCQUFnQjtJQUMxQjs7T0FFRztJQUNILHVEQUFJLENBQUE7SUFDSjs7OztPQUlHO0lBQ0gsNkRBQU8sQ0FBQTtBQUNULENBQUMsRUFYVyxnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQVczQjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILFNBQWdCLGFBQWEsQ0FDM0IsSUFBWSxFQUNaLFNBQWlCLEVBQ2pCLFVBc0JJLEVBQUU7SUFFTixNQUFNLEVBQ0osSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQzdCLGVBQWUsR0FBRyxlQUFlLEVBQ2pDLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUM5QixRQUFRLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxHQUNwQyxHQUFHLE9BQU8sQ0FBQztJQUVaLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7O1FBQ3ZCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUEyQixDQUFDO1FBQzFFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN0QiwrRkFBK0Y7WUFDL0YsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQztTQUN4QzthQUFNO1lBQ0wsTUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsRCxJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtnQkFDbkMsc0NBQXNDO2dCQUN0QyxPQUFPO2FBQ1I7WUFFRCxJQUFJLGlCQUFpQixFQUFFO2dCQUNyQiwwQ0FBMEM7Z0JBRTFDLElBQUksUUFBUSxLQUFLLGdCQUFnQixDQUFDLElBQUksRUFBRTtvQkFDdEMsT0FBTztpQkFDUjtnQkFFRCxnRUFBZ0U7Z0JBQ2hFLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNqQix1QkFBdUIsSUFBSSwrQ0FBK0M7b0JBQ3hFLElBQUksaUJBQWlCLDRCQUE0QixTQUFTLElBQUksQ0FDakUsQ0FBQzthQUNIO1lBRUQsMkNBQTJDO1lBQzNDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRCxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5QztRQUVELElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5FLE1BQU0sWUFBWSxHQUFHLE1BQUEsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUNBQUksSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUNwRSxJQUNFLE9BQU8sS0FBSyxlQUFlLENBQUMsTUFBTTtZQUNsQyxDQUFDLE9BQU8sS0FBSyxlQUFlLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUN4RTtZQUNBLE9BQU8sQ0FBQyxPQUFPLENBQ2IsSUFBSSw4QkFBc0IsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUNoRixDQUFDO1lBQ0YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztTQUN6QztJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFwRkQsc0NBb0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IFJ1bGUsIFNjaGVtYXRpY0NvbnRleHQgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBOb2RlUGFja2FnZUluc3RhbGxUYXNrIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGFza3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgaW5zdGFsbFRhc2tzID0gbmV3IFdlYWtNYXA8U2NoZW1hdGljQ29udGV4dCwgU2V0PHN0cmluZz4+KCk7XG5cbmludGVyZmFjZSBNaW5pbWFsUGFja2FnZU1hbmlmZXN0IHtcbiAgZGVwZW5kZW5jaWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgZGV2RGVwZW5kZW5jaWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgcGVlckRlcGVuZGVuY2llcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbi8qKlxuICogQW4gZW51bSB1c2VkIHRvIHNwZWNpZnkgdGhlIHR5cGUgb2YgYSBkZXBlbmRlbmN5IGZvdW5kIHdpdGhpbiBhIHBhY2thZ2UgbWFuaWZlc3RcbiAqIGZpbGUgKGBwYWNrYWdlLmpzb25gKS5cbiAqL1xuZXhwb3J0IGVudW0gRGVwZW5kZW5jeVR5cGUge1xuICBEZWZhdWx0ID0gJ2RlcGVuZGVuY2llcycsXG4gIERldiA9ICdkZXZEZXBlbmRlbmNpZXMnLFxuICBQZWVyID0gJ3BlZXJEZXBlbmRlbmNpZXMnLFxufVxuXG4vKipcbiAqIEFuIGVudW0gdXNlZCB0byBzcGVjaWZ5IHRoZSBkZXBlbmRlbmN5IGluc3RhbGxhdGlvbiBiZWhhdmlvciBmb3IgdGhlIHtAbGluayBhZGREZXBlbmRlbmN5fVxuICogc2NoZW1hdGljcyBydWxlLiBUaGUgaW5zdGFsbGF0aW9uIGJlaGF2aW9yIGFmZmVjdHMgaWYgYW5kIHdoZW4ge0BsaW5rIE5vZGVQYWNrYWdlSW5zdGFsbFRhc2t9XG4gKiB3aWxsIGJlIHNjaGVkdWxlZCB3aGVuIHVzaW5nIHRoZSBydWxlLlxuICovXG5leHBvcnQgZW51bSBJbnN0YWxsQmVoYXZpb3Ige1xuICAvKipcbiAgICogTm8gaW5zdGFsbGF0aW9uIHdpbGwgb2NjdXIgYXMgYSByZXN1bHQgb2YgdGhlIHJ1bGUgd2hlbiBzcGVjaWZpZWQuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgZG9lcyBub3QgcHJldmVudCBvdGhlciBydWxlcyBmcm9tIHNjaGVkdWxpbmcgYSB7QGxpbmsgTm9kZVBhY2thZ2VJbnN0YWxsVGFza31cbiAgICogd2hpY2ggbWF5IGluc3RhbGwgdGhlIGRlcGVuZGVuY3kuXG4gICAqL1xuICBOb25lLFxuICAvKipcbiAgICogQXV0b21hdGljYWxseSBkZXRlcm1pbmUgdGhlIG5lZWQgdG8gc2NoZWR1bGUgYSB7QGxpbmsgTm9kZVBhY2thZ2VJbnN0YWxsVGFza30gYmFzZWQgb25cbiAgICogcHJldmlvdXMgdXNhZ2Ugb2YgdGhlIHtAbGluayBhZGREZXBlbmRlbmN5fSB3aXRoaW4gdGhlIHNjaGVtYXRpYy5cbiAgICovXG4gIEF1dG8sXG4gIC8qKlxuICAgKiBBbHdheXMgc2NoZWR1bGUgYSB7QGxpbmsgTm9kZVBhY2thZ2VJbnN0YWxsVGFza30gd2hlbiB0aGUgcnVsZSBpcyBleGVjdXRlZC5cbiAgICovXG4gIEFsd2F5cyxcbn1cblxuLyoqXG4gKiBBbiBlbnVtIHVzZWQgdG8gc3BlY2lmeSB0aGUgZXhpc3RpbmcgZGVwZW5kZW5jeSBiZWhhdmlvciBmb3IgdGhlIHtAbGluayBhZGREZXBlbmRlbmN5fVxuICogc2NoZW1hdGljcyBydWxlLiBUaGUgZXhpc3RpbmcgYmVoYXZpb3IgYWZmZWN0cyB3aGV0aGVyIHRoZSBuYW1lZCBkZXBlbmRlbmN5IHdpbGwgYmUgYWRkZWRcbiAqIHRvIHRoZSBgcGFja2FnZS5qc29uYCB3aGVuIHRoZSBkZXBlbmRlbmN5IGlzIGFscmVhZHkgcHJlc2VudCB3aXRoIGEgZGlmZmVyaW5nIHNwZWNpZmllci5cbiAqL1xuZXhwb3J0IGVudW0gRXhpc3RpbmdCZWhhdmlvciB7XG4gIC8qKlxuICAgKiBUaGUgZGVwZW5kZW5jeSB3aWxsIG5vdCBiZSBhZGRlZCBvciBvdGhlcndpc2UgY2hhbmdlZCBpZiBpdCBhbHJlYWR5IGV4aXN0cy5cbiAgICovXG4gIFNraXAsXG4gIC8qKlxuICAgKiBUaGUgZGVwZW5kZW5jeSdzIGV4aXN0aW5nIHNwZWNpZmllciB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIHNwZWNpZmllciBwcm92aWRlZCBpbiB0aGVcbiAgICoge0BsaW5rIGFkZERlcGVuZGVuY3l9IGNhbGwuIEEgd2FybmluZyB3aWxsIGFsc28gYmUgc2hvd24gZHVyaW5nIHNjaGVtYXRpYyBleGVjdXRpb24gdG9cbiAgICogbm90aWZ5IHRoZSB1c2VyIG9mIHRoZSByZXBsYWNlbWVudC5cbiAgICovXG4gIFJlcGxhY2UsXG59XG5cbi8qKlxuICogQWRkcyBhIHBhY2thZ2UgYXMgYSBkZXBlbmRlbmN5IHRvIGEgYHBhY2thZ2UuanNvbmAuIEJ5IGRlZmF1bHQgdGhlIGBwYWNrYWdlLmpzb25gIGxvY2F0ZWRcbiAqIGF0IHRoZSBzY2hlbWF0aWMncyByb290IHdpbGwgYmUgdXNlZC4gVGhlIGBtYW5pZmVzdFBhdGhgIG9wdGlvbiBjYW4gYmUgdXNlZCB0byBleHBsaWNpdGx5IHNwZWNpZnlcbiAqIGEgYHBhY2thZ2UuanNvbmAgaW4gZGlmZmVyZW50IGxvY2F0aW9uLiBUaGUgdHlwZSBvZiB0aGUgZGVwZW5kZW5jeSBjYW4gYWxzbyBiZSBzcGVjaWZpZWQgaW5zdGVhZFxuICogb2YgdGhlIGRlZmF1bHQgb2YgdGhlIGBkZXBlbmRlbmNpZXNgIHNlY3Rpb24gYnkgdXNpbmcgdGhlIGB0eXBlYCBvcHRpb24gZm9yIGVpdGhlciBgZGV2RGVwZW5kZW5jaWVzYFxuICogb3IgYHBlZXJEZXBlbmRlbmNpZXNgLlxuICpcbiAqIFdoZW4gdXNpbmcgdGhpcyBydWxlLCB7QGxpbmsgTm9kZVBhY2thZ2VJbnN0YWxsVGFza30gZG9lcyBub3QgbmVlZCB0byBiZSBpbmNsdWRlZCBkaXJlY3RseSBieVxuICogYSBzY2hlbWF0aWMuIEEgcGFja2FnZSBtYW5hZ2VyIGluc3RhbGwgdGFzayB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgc2NoZWR1bGVkIGFzIG5lZWRlZC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcGFja2FnZSB0byBhZGQuXG4gKiBAcGFyYW0gc3BlY2lmaWVyIFRoZSBwYWNrYWdlIHNwZWNpZmllciBmb3IgdGhlIHBhY2thZ2UgdG8gYWRkLiBUeXBpY2FsbHkgYSBTZW1WZXIgcmFuZ2UuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25hbCBvYmplY3QgdGhhdCBjYW4gY29udGFpbiB0aGUgYHR5cGVgIG9mIHRoZSBkZXBlbmRlbmN5XG4gKiBhbmQvb3IgYSBwYXRoIChgcGFja2FnZUpzb25QYXRoYCkgb2YgYSBtYW5pZmVzdCBmaWxlIChgcGFja2FnZS5qc29uYCkgdG8gbW9kaWZ5LlxuICogQHJldHVybnMgQSBTY2hlbWF0aWNzIHtAbGluayBSdWxlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVwZW5kZW5jeShcbiAgbmFtZTogc3RyaW5nLFxuICBzcGVjaWZpZXI6IHN0cmluZyxcbiAgb3B0aW9uczoge1xuICAgIC8qKlxuICAgICAqIFRoZSB0eXBlIG9mIHRoZSBkZXBlbmRlbmN5IGRldGVybWluZXMgdGhlIHNlY3Rpb24gb2YgdGhlIGBwYWNrYWdlLmpzb25gIHRvIHdoaWNoIHRoZVxuICAgICAqIGRlcGVuZGVuY3kgd2lsbCBiZSBhZGRlZC4gRGVmYXVsdHMgdG8ge0BsaW5rIERlcGVuZGVuY3lUeXBlLkRlZmF1bHR9IChgZGVwZW5kZW5jaWVzYCkuXG4gICAgICovXG4gICAgdHlwZT86IERlcGVuZGVuY3lUeXBlO1xuICAgIC8qKlxuICAgICAqIFRoZSBwYXRoIG9mIHRoZSBwYWNrYWdlIG1hbmlmZXN0IGZpbGUgKGBwYWNrYWdlLmpzb25gKSB0aGF0IHdpbGwgYmUgbW9kaWZpZWQuXG4gICAgICogRGVmYXVsdHMgdG8gYC9wYWNrYWdlLmpzb25gLlxuICAgICAqL1xuICAgIHBhY2thZ2VKc29uUGF0aD86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgZGVwZW5kZW5jeSBpbnN0YWxsYXRpb24gYmVoYXZpb3IgdG8gdXNlIHRvIGRldGVybWluZSB3aGV0aGVyIGFcbiAgICAgKiB7QGxpbmsgTm9kZVBhY2thZ2VJbnN0YWxsVGFza30gc2hvdWxkIGJlIHNjaGVkdWxlZCBhZnRlciBhZGRpbmcgdGhlIGRlcGVuZGVuY3kuXG4gICAgICogRGVmYXVsdHMgdG8ge0BsaW5rIEluc3RhbGxCZWhhdmlvci5BdXRvfS5cbiAgICAgKi9cbiAgICBpbnN0YWxsPzogSW5zdGFsbEJlaGF2aW9yO1xuICAgIC8qKlxuICAgICAqIFRoZSBiZWhhdmlvciB0byB1c2Ugd2hlbiB0aGUgZGVwZW5kZW5jeSBhbHJlYWR5IGV4aXN0cyB3aXRoaW4gdGhlIGBwYWNrYWdlLmpzb25gLlxuICAgICAqIERlZmF1bHRzIHRvIHtAbGluayBFeGlzdGluZ0JlaGF2aW9yLlJlcGxhY2V9LlxuICAgICAqL1xuICAgIGV4aXN0aW5nPzogRXhpc3RpbmdCZWhhdmlvcjtcbiAgfSA9IHt9LFxuKTogUnVsZSB7XG4gIGNvbnN0IHtcbiAgICB0eXBlID0gRGVwZW5kZW5jeVR5cGUuRGVmYXVsdCxcbiAgICBwYWNrYWdlSnNvblBhdGggPSAnL3BhY2thZ2UuanNvbicsXG4gICAgaW5zdGFsbCA9IEluc3RhbGxCZWhhdmlvci5BdXRvLFxuICAgIGV4aXN0aW5nID0gRXhpc3RpbmdCZWhhdmlvci5SZXBsYWNlLFxuICB9ID0gb3B0aW9ucztcblxuICByZXR1cm4gKHRyZWUsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCBtYW5pZmVzdCA9IHRyZWUucmVhZEpzb24ocGFja2FnZUpzb25QYXRoKSBhcyBNaW5pbWFsUGFja2FnZU1hbmlmZXN0O1xuICAgIGNvbnN0IGRlcGVuZGVuY3lTZWN0aW9uID0gbWFuaWZlc3RbdHlwZV07XG5cbiAgICBpZiAoIWRlcGVuZGVuY3lTZWN0aW9uKSB7XG4gICAgICAvLyBTZWN0aW9uIGlzIG5vdCBwcmVzZW50LiBUaGUgZGVwZW5kZW5jeSBjYW4gYmUgYWRkZWQgdG8gYSBuZXcgb2JqZWN0IGxpdGVyYWwgZm9yIHRoZSBzZWN0aW9uLlxuICAgICAgbWFuaWZlc3RbdHlwZV0gPSB7IFtuYW1lXTogc3BlY2lmaWVyIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nU3BlY2lmaWVyID0gZGVwZW5kZW5jeVNlY3Rpb25bbmFtZV07XG5cbiAgICAgIGlmIChleGlzdGluZ1NwZWNpZmllciA9PT0gc3BlY2lmaWVyKSB7XG4gICAgICAgIC8vIEFscmVhZHkgcHJlc2VudCB3aXRoIHNhbWUgc3BlY2lmaWVyXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0aW5nU3BlY2lmaWVyKSB7XG4gICAgICAgIC8vIEFscmVhZHkgcHJlc2VudCBidXQgZGlmZmVyZW50IHNwZWNpZmllclxuXG4gICAgICAgIGlmIChleGlzdGluZyA9PT0gRXhpc3RpbmdCZWhhdmlvci5Ta2lwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXhpc3RpbmdCZWhhdmlvci5SZXBsYWNlIGlzIHRoZSBvbmx5IG90aGVyIGJlaGF2aW9yIGN1cnJlbnRseVxuICAgICAgICBjb250ZXh0LmxvZ2dlci53YXJuKFxuICAgICAgICAgIGBQYWNrYWdlIGRlcGVuZGVuY3kgXCIke25hbWV9XCIgYWxyZWFkeSBleGlzdHMgd2l0aCBhIGRpZmZlcmVudCBzcGVjaWZpZXIuIGAgK1xuICAgICAgICAgICAgYFwiJHtleGlzdGluZ1NwZWNpZmllcn1cIiB3aWxsIGJlIHJlcGxhY2VkIHdpdGggXCIke3NwZWNpZmllcn1cIi5gLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbmV3IGRlcGVuZGVuY3kgaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4gICAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZGVwZW5kZW5jeVNlY3Rpb24pO1xuICAgICAgZW50cmllcy5wdXNoKFtuYW1lLCBzcGVjaWZpZXJdKTtcbiAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYVswXS5sb2NhbGVDb21wYXJlKGJbMF0pKTtcbiAgICAgIG1hbmlmZXN0W3R5cGVdID0gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMpO1xuICAgIH1cblxuICAgIHRyZWUub3ZlcndyaXRlKHBhY2thZ2VKc29uUGF0aCwgSlNPTi5zdHJpbmdpZnkobWFuaWZlc3QsIG51bGwsIDIpKTtcblxuICAgIGNvbnN0IGluc3RhbGxQYXRocyA9IGluc3RhbGxUYXNrcy5nZXQoY29udGV4dCkgPz8gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgaWYgKFxuICAgICAgaW5zdGFsbCA9PT0gSW5zdGFsbEJlaGF2aW9yLkFsd2F5cyB8fFxuICAgICAgKGluc3RhbGwgPT09IEluc3RhbGxCZWhhdmlvci5BdXRvICYmICFpbnN0YWxsUGF0aHMuaGFzKHBhY2thZ2VKc29uUGF0aCkpXG4gICAgKSB7XG4gICAgICBjb250ZXh0LmFkZFRhc2soXG4gICAgICAgIG5ldyBOb2RlUGFja2FnZUluc3RhbGxUYXNrKHsgd29ya2luZ0RpcmVjdG9yeTogcGF0aC5kaXJuYW1lKHBhY2thZ2VKc29uUGF0aCkgfSksXG4gICAgICApO1xuICAgICAgaW5zdGFsbFBhdGhzLmFkZChwYWNrYWdlSnNvblBhdGgpO1xuICAgICAgaW5zdGFsbFRhc2tzLnNldChjb250ZXh0LCBpbnN0YWxsUGF0aHMpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==
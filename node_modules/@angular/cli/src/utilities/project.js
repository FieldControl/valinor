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
exports.findWorkspaceFile = void 0;
const core_1 = require("@angular-devkit/core");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const find_up_1 = require("./find-up");
function findWorkspaceFile(currentDirectory = process.cwd()) {
    const possibleConfigFiles = ['angular.json', '.angular.json'];
    const configFilePath = (0, find_up_1.findUp)(possibleConfigFiles, currentDirectory);
    if (configFilePath === null) {
        return null;
    }
    const possibleDir = path.dirname(configFilePath);
    const homedir = os.homedir();
    if ((0, core_1.normalize)(possibleDir) === (0, core_1.normalize)(homedir)) {
        const packageJsonPath = path.join(possibleDir, 'package.json');
        try {
            const packageJsonText = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonText);
            if (!containsCliDep(packageJson)) {
                // No CLI dependency
                return null;
            }
        }
        catch (_a) {
            // No or invalid package.json
            return null;
        }
    }
    return configFilePath;
}
exports.findWorkspaceFile = findWorkspaceFile;
function containsCliDep(obj) {
    var _a, _b;
    const pkgName = '@angular/cli';
    if (!obj) {
        return false;
    }
    return !!(((_a = obj.dependencies) === null || _a === void 0 ? void 0 : _a[pkgName]) || ((_b = obj.devDependencies) === null || _b === void 0 ? void 0 : _b[pkgName]));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXIvY2xpL3NyYy91dGlsaXRpZXMvcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILCtDQUFpRDtBQUNqRCx1Q0FBeUI7QUFDekIsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUM3Qix1Q0FBbUM7QUFFbkMsU0FBZ0IsaUJBQWlCLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRTtJQUNoRSxNQUFNLG1CQUFtQixHQUFHLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQzlELE1BQU0sY0FBYyxHQUFHLElBQUEsZ0JBQU0sRUFBQyxtQkFBbUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3JFLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtRQUMzQixPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVqRCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsSUFBSSxJQUFBLGdCQUFTLEVBQUMsV0FBVyxDQUFDLEtBQUssSUFBQSxnQkFBUyxFQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ2pELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRS9ELElBQUk7WUFDRixNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNsRSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ2hDLG9CQUFvQjtnQkFDcEIsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBQUMsV0FBTTtZQUNOLDZCQUE2QjtZQUM3QixPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7SUFFRCxPQUFPLGNBQWMsQ0FBQztBQUN4QixDQUFDO0FBM0JELDhDQTJCQztBQUVELFNBQVMsY0FBYyxDQUFDLEdBR3ZCOztJQUNDLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQztJQUMvQixJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1IsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQSxNQUFBLEdBQUcsQ0FBQyxZQUFZLDBDQUFHLE9BQU8sQ0FBQyxNQUFJLE1BQUEsR0FBRyxDQUFDLGVBQWUsMENBQUcsT0FBTyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQzNFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbmRVcCB9IGZyb20gJy4vZmluZC11cCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kV29ya3NwYWNlRmlsZShjdXJyZW50RGlyZWN0b3J5ID0gcHJvY2Vzcy5jd2QoKSk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwb3NzaWJsZUNvbmZpZ0ZpbGVzID0gWydhbmd1bGFyLmpzb24nLCAnLmFuZ3VsYXIuanNvbiddO1xuICBjb25zdCBjb25maWdGaWxlUGF0aCA9IGZpbmRVcChwb3NzaWJsZUNvbmZpZ0ZpbGVzLCBjdXJyZW50RGlyZWN0b3J5KTtcbiAgaWYgKGNvbmZpZ0ZpbGVQYXRoID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBwb3NzaWJsZURpciA9IHBhdGguZGlybmFtZShjb25maWdGaWxlUGF0aCk7XG5cbiAgY29uc3QgaG9tZWRpciA9IG9zLmhvbWVkaXIoKTtcbiAgaWYgKG5vcm1hbGl6ZShwb3NzaWJsZURpcikgPT09IG5vcm1hbGl6ZShob21lZGlyKSkge1xuICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHBhdGguam9pbihwb3NzaWJsZURpciwgJ3BhY2thZ2UuanNvbicpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uVGV4dCA9IGZzLnJlYWRGaWxlU3luYyhwYWNrYWdlSnNvblBhdGgsICd1dGYtOCcpO1xuICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKHBhY2thZ2VKc29uVGV4dCk7XG4gICAgICBpZiAoIWNvbnRhaW5zQ2xpRGVwKHBhY2thZ2VKc29uKSkge1xuICAgICAgICAvLyBObyBDTEkgZGVwZW5kZW5jeVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIE5vIG9yIGludmFsaWQgcGFja2FnZS5qc29uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZmlnRmlsZVBhdGg7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zQ2xpRGVwKG9iaj86IHtcbiAgZGVwZW5kZW5jaWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgZGV2RGVwZW5kZW5jaWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn0pOiBib29sZWFuIHtcbiAgY29uc3QgcGtnTmFtZSA9ICdAYW5ndWxhci9jbGknO1xuICBpZiAoIW9iaikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiAhIShvYmouZGVwZW5kZW5jaWVzPy5bcGtnTmFtZV0gfHwgb2JqLmRldkRlcGVuZGVuY2llcz8uW3BrZ05hbWVdKTtcbn1cbiJdfQ==
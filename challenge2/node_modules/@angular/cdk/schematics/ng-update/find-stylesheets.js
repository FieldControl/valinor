"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStylesheetFiles = void 0;
const core_1 = require("@angular-devkit/core");
/** Regular expression that matches stylesheet paths */
const STYLESHEET_REGEX = /.*\.(css|scss)/;
/**
 * Finds stylesheets in the given directory from within the specified tree.
 * @param tree Devkit tree where stylesheet files can be found in.
 * @param startDirectory Optional start directory where stylesheets should be searched in.
 *   This can be useful if only stylesheets within a given folder are relevant (to avoid
 *   unnecessary iterations).
 */
function findStylesheetFiles(tree, startDirectory = '/') {
    const result = [];
    const visitDir = dirPath => {
        const { subfiles, subdirs } = tree.getDir(dirPath);
        subfiles.forEach(fileName => {
            if (STYLESHEET_REGEX.test(fileName)) {
                result.push(core_1.join(dirPath, fileName));
            }
        });
        // Visit directories within the current directory to find other stylesheets.
        subdirs.forEach(fragment => {
            // Do not visit directories or files inside node modules or `dist/` folders.
            if (fragment !== 'node_modules' && fragment !== 'dist') {
                visitDir(core_1.join(dirPath, fragment));
            }
        });
    };
    visitDir(startDirectory);
    return result;
}
exports.findStylesheetFiles = findStylesheetFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1zdHlsZXNoZWV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvZmluZC1zdHlsZXNoZWV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBMEM7QUFHMUMsdURBQXVEO0FBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFFMUM7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsSUFBVSxFQUFFLGlCQUF5QixHQUFHO0lBQzFFLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsRUFBRTtRQUN6QixNQUFNLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFakQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMxQixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDdEM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILDRFQUE0RTtRQUM1RSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3pCLDRFQUE0RTtZQUM1RSxJQUFJLFFBQVEsS0FBSyxjQUFjLElBQUksUUFBUSxLQUFLLE1BQU0sRUFBRTtnQkFDdEQsUUFBUSxDQUFDLFdBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNuQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBQ0YsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pCLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFyQkQsa0RBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cbi8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHN0eWxlc2hlZXQgcGF0aHMgKi9cbmNvbnN0IFNUWUxFU0hFRVRfUkVHRVggPSAvLipcXC4oY3NzfHNjc3MpLztcblxuLyoqXG4gKiBGaW5kcyBzdHlsZXNoZWV0cyBpbiB0aGUgZ2l2ZW4gZGlyZWN0b3J5IGZyb20gd2l0aGluIHRoZSBzcGVjaWZpZWQgdHJlZS5cbiAqIEBwYXJhbSB0cmVlIERldmtpdCB0cmVlIHdoZXJlIHN0eWxlc2hlZXQgZmlsZXMgY2FuIGJlIGZvdW5kIGluLlxuICogQHBhcmFtIHN0YXJ0RGlyZWN0b3J5IE9wdGlvbmFsIHN0YXJ0IGRpcmVjdG9yeSB3aGVyZSBzdHlsZXNoZWV0cyBzaG91bGQgYmUgc2VhcmNoZWQgaW4uXG4gKiAgIFRoaXMgY2FuIGJlIHVzZWZ1bCBpZiBvbmx5IHN0eWxlc2hlZXRzIHdpdGhpbiBhIGdpdmVuIGZvbGRlciBhcmUgcmVsZXZhbnQgKHRvIGF2b2lkXG4gKiAgIHVubmVjZXNzYXJ5IGl0ZXJhdGlvbnMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFN0eWxlc2hlZXRGaWxlcyh0cmVlOiBUcmVlLCBzdGFydERpcmVjdG9yeTogc3RyaW5nID0gJy8nKTogc3RyaW5nW10ge1xuICBjb25zdCByZXN1bHQ6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IHZpc2l0RGlyID0gZGlyUGF0aCA9PiB7XG4gICAgY29uc3Qge3N1YmZpbGVzLCBzdWJkaXJzfSA9IHRyZWUuZ2V0RGlyKGRpclBhdGgpO1xuXG4gICAgc3ViZmlsZXMuZm9yRWFjaChmaWxlTmFtZSA9PiB7XG4gICAgICBpZiAoU1RZTEVTSEVFVF9SRUdFWC50ZXN0KGZpbGVOYW1lKSkge1xuICAgICAgICByZXN1bHQucHVzaChqb2luKGRpclBhdGgsIGZpbGVOYW1lKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBWaXNpdCBkaXJlY3RvcmllcyB3aXRoaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IHRvIGZpbmQgb3RoZXIgc3R5bGVzaGVldHMuXG4gICAgc3ViZGlycy5mb3JFYWNoKGZyYWdtZW50ID0+IHtcbiAgICAgIC8vIERvIG5vdCB2aXNpdCBkaXJlY3RvcmllcyBvciBmaWxlcyBpbnNpZGUgbm9kZSBtb2R1bGVzIG9yIGBkaXN0L2AgZm9sZGVycy5cbiAgICAgIGlmIChmcmFnbWVudCAhPT0gJ25vZGVfbW9kdWxlcycgJiYgZnJhZ21lbnQgIT09ICdkaXN0Jykge1xuICAgICAgICB2aXNpdERpcihqb2luKGRpclBhdGgsIGZyYWdtZW50KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHZpc2l0RGlyKHN0YXJ0RGlyZWN0b3J5KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==
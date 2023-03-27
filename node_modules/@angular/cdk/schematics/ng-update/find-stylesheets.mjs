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
const STYLESHEET_REGEX = /.*\.(css|scss)$/;
/**
 * Finds stylesheets in the given directory from within the specified tree.
 * @param tree Devkit tree where stylesheet files can be found in.
 * @param startDirectory Optional start directory where stylesheets should be searched in.
 *   This can be useful if only stylesheets within a given folder are relevant (to avoid
 *   unnecessary iterations).
 */
function findStylesheetFiles(tree, startDirectory = '/') {
    const result = [];
    const visitDir = (dirPath) => {
        const { subfiles, subdirs } = tree.getDir(dirPath);
        subfiles.forEach(fileName => {
            if (STYLESHEET_REGEX.test(fileName)) {
                result.push((0, core_1.join)(dirPath, fileName));
            }
        });
        // Visit directories within the current directory to find other stylesheets.
        subdirs.forEach(fragment => {
            // Do not visit directories or files inside node modules or `dist/` folders.
            if (fragment !== 'node_modules' && fragment !== 'dist') {
                visitDir((0, core_1.join)(dirPath, fragment));
            }
        });
    };
    visitDir(startDirectory);
    return result;
}
exports.findStylesheetFiles = findStylesheetFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1zdHlsZXNoZWV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvZmluZC1zdHlsZXNoZWV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBZ0Q7QUFHaEQsdURBQXVEO0FBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7QUFFM0M7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsSUFBVSxFQUFFLGlCQUF5QixHQUFHO0lBQzFFLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQWEsRUFBRSxFQUFFO1FBQ2pDLE1BQU0sRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVqRCxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzFCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCw0RUFBNEU7UUFDNUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN6Qiw0RUFBNEU7WUFDNUUsSUFBSSxRQUFRLEtBQUssY0FBYyxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUU7Z0JBQ3RELFFBQVEsQ0FBQyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNuQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBQ0YsUUFBUSxDQUFDLGNBQXNCLENBQUMsQ0FBQztJQUNqQyxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBckJELGtEQXFCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW4sIFBhdGh9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7VHJlZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuXG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyBzdHlsZXNoZWV0IHBhdGhzICovXG5jb25zdCBTVFlMRVNIRUVUX1JFR0VYID0gLy4qXFwuKGNzc3xzY3NzKSQvO1xuXG4vKipcbiAqIEZpbmRzIHN0eWxlc2hlZXRzIGluIHRoZSBnaXZlbiBkaXJlY3RvcnkgZnJvbSB3aXRoaW4gdGhlIHNwZWNpZmllZCB0cmVlLlxuICogQHBhcmFtIHRyZWUgRGV2a2l0IHRyZWUgd2hlcmUgc3R5bGVzaGVldCBmaWxlcyBjYW4gYmUgZm91bmQgaW4uXG4gKiBAcGFyYW0gc3RhcnREaXJlY3RvcnkgT3B0aW9uYWwgc3RhcnQgZGlyZWN0b3J5IHdoZXJlIHN0eWxlc2hlZXRzIHNob3VsZCBiZSBzZWFyY2hlZCBpbi5cbiAqICAgVGhpcyBjYW4gYmUgdXNlZnVsIGlmIG9ubHkgc3R5bGVzaGVldHMgd2l0aGluIGEgZ2l2ZW4gZm9sZGVyIGFyZSByZWxldmFudCAodG8gYXZvaWRcbiAqICAgdW5uZWNlc3NhcnkgaXRlcmF0aW9ucykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU3R5bGVzaGVldEZpbGVzKHRyZWU6IFRyZWUsIHN0YXJ0RGlyZWN0b3J5OiBzdHJpbmcgPSAnLycpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgdmlzaXREaXIgPSAoZGlyUGF0aDogUGF0aCkgPT4ge1xuICAgIGNvbnN0IHtzdWJmaWxlcywgc3ViZGlyc30gPSB0cmVlLmdldERpcihkaXJQYXRoKTtcblxuICAgIHN1YmZpbGVzLmZvckVhY2goZmlsZU5hbWUgPT4ge1xuICAgICAgaWYgKFNUWUxFU0hFRVRfUkVHRVgudGVzdChmaWxlTmFtZSkpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goam9pbihkaXJQYXRoLCBmaWxlTmFtZSkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVmlzaXQgZGlyZWN0b3JpZXMgd2l0aGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeSB0byBmaW5kIG90aGVyIHN0eWxlc2hlZXRzLlxuICAgIHN1YmRpcnMuZm9yRWFjaChmcmFnbWVudCA9PiB7XG4gICAgICAvLyBEbyBub3QgdmlzaXQgZGlyZWN0b3JpZXMgb3IgZmlsZXMgaW5zaWRlIG5vZGUgbW9kdWxlcyBvciBgZGlzdC9gIGZvbGRlcnMuXG4gICAgICBpZiAoZnJhZ21lbnQgIT09ICdub2RlX21vZHVsZXMnICYmIGZyYWdtZW50ICE9PSAnZGlzdCcpIHtcbiAgICAgICAgdmlzaXREaXIoam9pbihkaXJQYXRoLCBmcmFnbWVudCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICB2aXNpdERpcihzdGFydERpcmVjdG9yeSBhcyBQYXRoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==
"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVersionNames = exports.TargetVersion = void 0;
/** Possible versions that can be automatically migrated by `ng update`. */
// Used in an `Object.keys` call below so it can't be `const enum`.
// tslint:disable-next-line:prefer-const-enum
var TargetVersion;
(function (TargetVersion) {
    TargetVersion["V6"] = "version 6";
    TargetVersion["V7"] = "version 7";
    TargetVersion["V8"] = "version 8";
    TargetVersion["V9"] = "version 9";
    TargetVersion["V10"] = "version 10";
    TargetVersion["V11"] = "version 11";
    TargetVersion["V12"] = "version 12";
})(TargetVersion = exports.TargetVersion || (exports.TargetVersion = {}));
/**
 * Returns all versions that are supported by "ng update". The versions are determined
 * based on the "TargetVersion" enum.
 */
function getAllVersionNames() {
    return Object.keys(TargetVersion).filter(enumValue => {
        return typeof TargetVersion[enumValue] === 'string';
    });
}
exports.getAllVersionNames = getAllVersionNames;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LXZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXBkYXRlLXRvb2wvdGFyZ2V0LXZlcnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsMkVBQTJFO0FBQzNFLG1FQUFtRTtBQUNuRSw2Q0FBNkM7QUFDN0MsSUFBWSxhQVFYO0FBUkQsV0FBWSxhQUFhO0lBQ3ZCLGlDQUFnQixDQUFBO0lBQ2hCLGlDQUFnQixDQUFBO0lBQ2hCLGlDQUFnQixDQUFBO0lBQ2hCLGlDQUFnQixDQUFBO0lBQ2hCLG1DQUFrQixDQUFBO0lBQ2xCLG1DQUFrQixDQUFBO0lBQ2xCLG1DQUFrQixDQUFBO0FBQ3BCLENBQUMsRUFSVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQVF4QjtBQUVEOzs7R0FHRztBQUNILFNBQWdCLGtCQUFrQjtJQUNoQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ25ELE9BQU8sT0FBUSxhQUFrRCxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsQ0FBQztJQUM1RixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFKRCxnREFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiogUG9zc2libGUgdmVyc2lvbnMgdGhhdCBjYW4gYmUgYXV0b21hdGljYWxseSBtaWdyYXRlZCBieSBgbmcgdXBkYXRlYC4gKi9cbi8vIFVzZWQgaW4gYW4gYE9iamVjdC5rZXlzYCBjYWxsIGJlbG93IHNvIGl0IGNhbid0IGJlIGBjb25zdCBlbnVtYC5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpwcmVmZXItY29uc3QtZW51bVxuZXhwb3J0IGVudW0gVGFyZ2V0VmVyc2lvbiB7XG4gIFY2ID0gJ3ZlcnNpb24gNicsXG4gIFY3ID0gJ3ZlcnNpb24gNycsXG4gIFY4ID0gJ3ZlcnNpb24gOCcsXG4gIFY5ID0gJ3ZlcnNpb24gOScsXG4gIFYxMCA9ICd2ZXJzaW9uIDEwJyxcbiAgVjExID0gJ3ZlcnNpb24gMTEnLFxuICBWMTIgPSAndmVyc2lvbiAxMicsXG59XG5cbi8qKlxuICogUmV0dXJucyBhbGwgdmVyc2lvbnMgdGhhdCBhcmUgc3VwcG9ydGVkIGJ5IFwibmcgdXBkYXRlXCIuIFRoZSB2ZXJzaW9ucyBhcmUgZGV0ZXJtaW5lZFxuICogYmFzZWQgb24gdGhlIFwiVGFyZ2V0VmVyc2lvblwiIGVudW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxWZXJzaW9uTmFtZXMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gT2JqZWN0LmtleXMoVGFyZ2V0VmVyc2lvbikuZmlsdGVyKGVudW1WYWx1ZSA9PiB7XG4gICAgcmV0dXJuIHR5cGVvZiAoVGFyZ2V0VmVyc2lvbiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmd8dW5kZWZpbmVkPilbZW51bVZhbHVlXSA9PT0gJ3N0cmluZyc7XG4gIH0pO1xufVxuIl19
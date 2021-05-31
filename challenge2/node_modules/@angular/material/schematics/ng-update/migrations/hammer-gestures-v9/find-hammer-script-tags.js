"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findHammerScriptImportElements = void 0;
const schematics_1 = require("@angular/cdk/schematics");
/**
 * Parses the specified HTML content and looks for "script" elements which
 * potentially import HammerJS. These elements will be returned.
 */
function findHammerScriptImportElements(htmlContent) {
    const document = schematics_1.parse5.parse(htmlContent, { sourceCodeLocationInfo: true });
    const nodeQueue = [...document.childNodes];
    const result = [];
    while (nodeQueue.length) {
        const node = nodeQueue.shift();
        if (node.childNodes) {
            nodeQueue.push(...node.childNodes);
        }
        if (node.nodeName.toLowerCase() === 'script' && node.attrs.length !== 0) {
            const srcAttribute = node.attrs.find(a => a.name === 'src');
            if (srcAttribute && isPotentialHammerScriptReference(srcAttribute.value)) {
                result.push(node);
            }
        }
    }
    return result;
}
exports.findHammerScriptImportElements = findHammerScriptImportElements;
/**
 * Checks whether the specified source path is potentially referring to the
 * HammerJS script output.
 */
function isPotentialHammerScriptReference(srcPath) {
    return /\/hammer(\.min)?\.js($|\?)/.test(srcPath);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1oYW1tZXItc2NyaXB0LXRhZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9oYW1tZXItZ2VzdHVyZXMtdjkvZmluZC1oYW1tZXItc2NyaXB0LXRhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQStDO0FBRS9DOzs7R0FHRztBQUNILFNBQWdCLDhCQUE4QixDQUFDLFdBQW1CO0lBQ2hFLE1BQU0sUUFBUSxHQUNWLG1CQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFDLHNCQUFzQixFQUFFLElBQUksRUFBQyxDQUErQixDQUFDO0lBQzVGLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDM0MsTUFBTSxNQUFNLEdBQWdDLEVBQUUsQ0FBQztJQUUvQyxPQUFPLFNBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBK0IsQ0FBQztRQUU1RCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNwQztRQUVELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3ZFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQztZQUM1RCxJQUFJLFlBQVksSUFBSSxnQ0FBZ0MsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkI7U0FDRjtLQUNGO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQXJCRCx3RUFxQkM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGdDQUFnQyxDQUFDLE9BQWU7SUFDdkQsT0FBTyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhcnNlNX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuXG4vKipcbiAqIFBhcnNlcyB0aGUgc3BlY2lmaWVkIEhUTUwgY29udGVudCBhbmQgbG9va3MgZm9yIFwic2NyaXB0XCIgZWxlbWVudHMgd2hpY2hcbiAqIHBvdGVudGlhbGx5IGltcG9ydCBIYW1tZXJKUy4gVGhlc2UgZWxlbWVudHMgd2lsbCBiZSByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRIYW1tZXJTY3JpcHRJbXBvcnRFbGVtZW50cyhodG1sQ29udGVudDogc3RyaW5nKTogcGFyc2U1LkRlZmF1bHRUcmVlRWxlbWVudFtdIHtcbiAgY29uc3QgZG9jdW1lbnQgPVxuICAgICAgcGFyc2U1LnBhcnNlKGh0bWxDb250ZW50LCB7c291cmNlQ29kZUxvY2F0aW9uSW5mbzogdHJ1ZX0pIGFzIHBhcnNlNS5EZWZhdWx0VHJlZURvY3VtZW50O1xuICBjb25zdCBub2RlUXVldWUgPSBbLi4uZG9jdW1lbnQuY2hpbGROb2Rlc107XG4gIGNvbnN0IHJlc3VsdDogcGFyc2U1LkRlZmF1bHRUcmVlRWxlbWVudFtdID0gW107XG5cbiAgd2hpbGUgKG5vZGVRdWV1ZS5sZW5ndGgpIHtcbiAgICBjb25zdCBub2RlID0gbm9kZVF1ZXVlLnNoaWZ0KCkgYXMgcGFyc2U1LkRlZmF1bHRUcmVlRWxlbWVudDtcblxuICAgIGlmIChub2RlLmNoaWxkTm9kZXMpIHtcbiAgICAgIG5vZGVRdWV1ZS5wdXNoKC4uLm5vZGUuY2hpbGROb2Rlcyk7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NjcmlwdCcgJiYgbm9kZS5hdHRycy5sZW5ndGggIT09IDApIHtcbiAgICAgIGNvbnN0IHNyY0F0dHJpYnV0ZSA9IG5vZGUuYXR0cnMuZmluZChhID0+IGEubmFtZSA9PT0gJ3NyYycpO1xuICAgICAgaWYgKHNyY0F0dHJpYnV0ZSAmJiBpc1BvdGVudGlhbEhhbW1lclNjcmlwdFJlZmVyZW5jZShzcmNBdHRyaWJ1dGUudmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgc291cmNlIHBhdGggaXMgcG90ZW50aWFsbHkgcmVmZXJyaW5nIHRvIHRoZVxuICogSGFtbWVySlMgc2NyaXB0IG91dHB1dC5cbiAqL1xuZnVuY3Rpb24gaXNQb3RlbnRpYWxIYW1tZXJTY3JpcHRSZWZlcmVuY2Uoc3JjUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAvXFwvaGFtbWVyKFxcLm1pbik/XFwuanMoJHxcXD8pLy50ZXN0KHNyY1BhdGgpO1xufVxuIl19
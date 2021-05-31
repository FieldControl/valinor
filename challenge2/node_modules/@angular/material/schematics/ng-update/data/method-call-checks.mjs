"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.methodCallChecks = void 0;
const schematics_1 = require("@angular/cdk/schematics");
exports.methodCallChecks = {
    [schematics_1.TargetVersion.V11]: [{
            pr: 'https://github.com/angular/components/pull/20499',
            changes: [{
                    className: 'MatTabNav',
                    method: 'updateActiveLink',
                    invalidArgCounts: [{ count: 1, message: 'The "_element" parameter has been removed' }]
                }]
        }],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kLWNhbGwtY2hlY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NjaGVtYXRpY3MvbmctdXBkYXRlL2RhdGEvbWV0aG9kLWNhbGwtY2hlY2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHdEQUE2RjtBQUVoRixRQUFBLGdCQUFnQixHQUEwQztJQUNyRSxDQUFDLDBCQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNwQixFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDO29CQUNSLFNBQVMsRUFBRSxXQUFXO29CQUN0QixNQUFNLEVBQUUsa0JBQWtCO29CQUMxQixnQkFBZ0IsRUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsMkNBQTJDLEVBQUMsQ0FBQztpQkFDckYsQ0FBQztTQUNILENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TWV0aG9kQ2FsbFVwZ3JhZGVEYXRhLCBUYXJnZXRWZXJzaW9uLCBWZXJzaW9uQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuXG5leHBvcnQgY29uc3QgbWV0aG9kQ2FsbENoZWNrczogVmVyc2lvbkNoYW5nZXM8TWV0aG9kQ2FsbFVwZ3JhZGVEYXRhPiA9IHtcbiAgW1RhcmdldFZlcnNpb24uVjExXTogW3tcbiAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMDQ5OScsXG4gICAgY2hhbmdlczogW3tcbiAgICAgIGNsYXNzTmFtZTogJ01hdFRhYk5hdicsXG4gICAgICBtZXRob2Q6ICd1cGRhdGVBY3RpdmVMaW5rJyxcbiAgICAgIGludmFsaWRBcmdDb3VudHM6IFt7Y291bnQ6IDEsIG1lc3NhZ2U6ICdUaGUgXCJfZWxlbWVudFwiIHBhcmFtZXRlciBoYXMgYmVlbiByZW1vdmVkJ31dXG4gICAgfV1cbiAgfV0sXG59O1xuIl19
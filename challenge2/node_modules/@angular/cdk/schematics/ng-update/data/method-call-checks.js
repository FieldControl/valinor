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
const target_version_1 = require("../../update-tool/target-version");
exports.methodCallChecks = {
    [target_version_1.TargetVersion.V11]: [{
            pr: 'https://github.com/angular/components/pull/20500',
            changes: [{
                    className: 'DropListRef',
                    method: 'drop',
                    invalidArgCounts: [{
                            count: 5,
                            message: 'The "previousIndex" parameter is required and the parameter order has changed.'
                        }]
                }]
        }],
    [target_version_1.TargetVersion.V9]: [{
            pr: 'https://github.com/angular/components/pull/17084',
            changes: [{
                    className: 'DropListRef',
                    method: 'drop',
                    invalidArgCounts: [{ count: 4, message: 'The "distance" parameter is required' }]
                }]
        }],
    [target_version_1.TargetVersion.V8]: [],
    [target_version_1.TargetVersion.V7]: [],
    [target_version_1.TargetVersion.V6]: [{
            pr: 'https://github.com/angular/components/pull/10325',
            changes: [{
                    className: 'FocusMonitor',
                    method: 'monitor',
                    invalidArgCounts: [{ count: 3, message: 'The "renderer" argument has been removed' }]
                }]
        }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kLWNhbGwtY2hlY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kYXRhL21ldGhvZC1jYWxsLWNoZWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxxRUFBK0Q7QUFTbEQsUUFBQSxnQkFBZ0IsR0FBMEM7SUFDckUsQ0FBQyw4QkFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDcEIsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQztvQkFDUixTQUFTLEVBQUUsYUFBYTtvQkFDeEIsTUFBTSxFQUFFLE1BQU07b0JBQ2QsZ0JBQWdCLEVBQUUsQ0FBQzs0QkFDakIsS0FBSyxFQUFFLENBQUM7NEJBQ1IsT0FBTyxFQUFFLGdGQUFnRjt5QkFDMUYsQ0FBQztpQkFDSCxDQUFDO1NBQ0gsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25CLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsU0FBUyxFQUFFLGFBQWE7b0JBQ3hCLE1BQU0sRUFBRSxNQUFNO29CQUNkLGdCQUFnQixFQUFFLENBQUMsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxzQ0FBc0MsRUFBQyxDQUFDO2lCQUNoRixDQUFDO1NBQ0gsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25CLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsU0FBUyxFQUFFLGNBQWM7b0JBQ3pCLE1BQU0sRUFBRSxTQUFTO29CQUNqQixnQkFBZ0IsRUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsMENBQTBDLEVBQUMsQ0FBQztpQkFDcEYsQ0FBQztTQUNILENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VGFyZ2V0VmVyc2lvbn0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvdGFyZ2V0LXZlcnNpb24nO1xuaW1wb3J0IHtWZXJzaW9uQ2hhbmdlc30gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvdmVyc2lvbi1jaGFuZ2VzJztcblxuZXhwb3J0IGludGVyZmFjZSBNZXRob2RDYWxsVXBncmFkZURhdGEge1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIGludmFsaWRBcmdDb3VudHM6IHtjb3VudDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmd9W107XG59XG5cbmV4cG9ydCBjb25zdCBtZXRob2RDYWxsQ2hlY2tzOiBWZXJzaW9uQ2hhbmdlczxNZXRob2RDYWxsVXBncmFkZURhdGE+ID0ge1xuICBbVGFyZ2V0VmVyc2lvbi5WMTFdOiBbe1xuICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzIwNTAwJyxcbiAgICBjaGFuZ2VzOiBbe1xuICAgICAgY2xhc3NOYW1lOiAnRHJvcExpc3RSZWYnLFxuICAgICAgbWV0aG9kOiAnZHJvcCcsXG4gICAgICBpbnZhbGlkQXJnQ291bnRzOiBbe1xuICAgICAgICBjb3VudDogNSxcbiAgICAgICAgbWVzc2FnZTogJ1RoZSBcInByZXZpb3VzSW5kZXhcIiBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgYW5kIHRoZSBwYXJhbWV0ZXIgb3JkZXIgaGFzIGNoYW5nZWQuJ1xuICAgICAgfV1cbiAgICB9XVxuICB9XSxcbiAgW1RhcmdldFZlcnNpb24uVjldOiBbe1xuICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE3MDg0JyxcbiAgICBjaGFuZ2VzOiBbe1xuICAgICAgY2xhc3NOYW1lOiAnRHJvcExpc3RSZWYnLFxuICAgICAgbWV0aG9kOiAnZHJvcCcsXG4gICAgICBpbnZhbGlkQXJnQ291bnRzOiBbe2NvdW50OiA0LCBtZXNzYWdlOiAnVGhlIFwiZGlzdGFuY2VcIiBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnfV1cbiAgICB9XVxuICB9XSxcbiAgW1RhcmdldFZlcnNpb24uVjhdOiBbXSxcbiAgW1RhcmdldFZlcnNpb24uVjddOiBbXSxcbiAgW1RhcmdldFZlcnNpb24uVjZdOiBbe1xuICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMzI1JyxcbiAgICBjaGFuZ2VzOiBbe1xuICAgICAgY2xhc3NOYW1lOiAnRm9jdXNNb25pdG9yJyxcbiAgICAgIG1ldGhvZDogJ21vbml0b3InLFxuICAgICAgaW52YWxpZEFyZ0NvdW50czogW3tjb3VudDogMywgbWVzc2FnZTogJ1RoZSBcInJlbmRlcmVyXCIgYXJndW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCd9XVxuICAgIH1dXG4gIH1dXG59O1xuIl19
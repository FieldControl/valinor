"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructorChecks = void 0;
const target_version_1 = require("../../update-tool/target-version");
/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
exports.constructorChecks = {
    [target_version_1.TargetVersion.V12]: [
        {
            pr: 'https://github.com/angular/components/pull/21876',
            changes: ['CdkTable', 'StickyStyler']
        },
        {
            pr: 'https://github.com/angular/components/issues/21900',
            changes: ['CdkStepper']
        }
    ],
    [target_version_1.TargetVersion.V11]: [
        {
            pr: 'https://github.com/angular/components/pull/20454',
            changes: ['ScrollDispatcher', 'ViewportRuler', 'CdkVirtualScrollViewport']
        },
        {
            pr: 'https://github.com/angular/components/pull/20500',
            changes: ['CdkDropList']
        },
        {
            pr: 'https://github.com/angular/components/pull/20572',
            changes: ['CdkTreeNodePadding']
        },
        {
            pr: 'https://github.com/angular/components/pull/20511',
            changes: ['OverlayContainer', 'FullscreenOverlayContainer', 'OverlayRef', 'Overlay']
        }
    ],
    [target_version_1.TargetVersion.V10]: [
        {
            pr: 'https://github.com/angular/components/pull/19347',
            changes: ['Platform']
        }
    ],
    [target_version_1.TargetVersion.V9]: [{
            pr: 'https://github.com/angular/components/pull/17084',
            changes: ['DropListRef']
        }],
    [target_version_1.TargetVersion.V8]: [{
            pr: 'https://github.com/angular/components/pull/15647',
            changes: [
                'CdkDrag', 'CdkDropList', 'ConnectedPositionStrategy', 'FlexibleConnectedPositionStrategy',
                'OverlayPositionBuilder', 'CdkTable'
            ]
        }],
    [target_version_1.TargetVersion.V7]: [],
    [target_version_1.TargetVersion.V6]: []
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0b3ItY2hlY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kYXRhL2NvbnN0cnVjdG9yLWNoZWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxxRUFBK0Q7QUFLL0Q7Ozs7R0FJRztBQUNVLFFBQUEsaUJBQWlCLEdBQWlEO0lBQzdFLENBQUMsOEJBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQztTQUN0QztRQUNEO1lBQ0UsRUFBRSxFQUFFLG9EQUFvRDtZQUN4RCxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7U0FDeEI7S0FDRjtJQUNELENBQUMsOEJBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLDBCQUEwQixDQUFDO1NBQzNFO1FBQ0Q7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztTQUN6QjtRQUNEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztTQUNoQztRQUNEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDO1NBQ3JGO0tBQ0Y7SUFDRCxDQUFDLDhCQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbkI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQztTQUN0QjtLQUNGO0lBQ0QsQ0FBQyw4QkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDbkIsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7U0FDekIsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25CLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRSxhQUFhLEVBQUUsMkJBQTJCLEVBQUUsbUNBQW1DO2dCQUMxRix3QkFBd0IsRUFBRSxVQUFVO2FBQ3JDO1NBQ0YsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0NBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUYXJnZXRWZXJzaW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC90YXJnZXQtdmVyc2lvbic7XG5pbXBvcnQge1ZlcnNpb25DaGFuZ2VzfSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC92ZXJzaW9uLWNoYW5nZXMnO1xuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvckNoZWNrc1VwZ3JhZGVEYXRhID0gc3RyaW5nO1xuXG4vKipcbiAqIExpc3Qgb2YgY2xhc3MgbmFtZXMgZm9yIHdoaWNoIHRoZSBjb25zdHJ1Y3RvciBzaWduYXR1cmUgaGFzIGJlZW4gY2hhbmdlZC4gVGhlIG5ldyBjb25zdHJ1Y3RvclxuICogc2lnbmF0dXJlIHR5cGVzIGRvbid0IG5lZWQgdG8gYmUgc3RvcmVkIGhlcmUgYmVjYXVzZSB0aGUgc2lnbmF0dXJlIHdpbGwgYmUgZGV0ZXJtaW5lZFxuICogYXV0b21hdGljYWxseSB0aHJvdWdoIHR5cGUgY2hlY2tpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RvckNoZWNrczogVmVyc2lvbkNoYW5nZXM8Q29uc3RydWN0b3JDaGVja3NVcGdyYWRlRGF0YT4gPSB7XG4gIFtUYXJnZXRWZXJzaW9uLlYxMl06IFtcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMTg3NicsXG4gICAgICBjaGFuZ2VzOiBbJ0Nka1RhYmxlJywgJ1N0aWNreVN0eWxlciddXG4gICAgfSxcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzIxOTAwJyxcbiAgICAgIGNoYW5nZXM6IFsnQ2RrU3RlcHBlciddXG4gICAgfVxuICBdLFxuICBbVGFyZ2V0VmVyc2lvbi5WMTFdOiBbXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMjA0NTQnLFxuICAgICAgY2hhbmdlczogWydTY3JvbGxEaXNwYXRjaGVyJywgJ1ZpZXdwb3J0UnVsZXInLCAnQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0J11cbiAgICB9LFxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzIwNTAwJyxcbiAgICAgIGNoYW5nZXM6IFsnQ2RrRHJvcExpc3QnXVxuICAgIH0sXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMjA1NzInLFxuICAgICAgY2hhbmdlczogWydDZGtUcmVlTm9kZVBhZGRpbmcnXVxuICAgIH0sXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMjA1MTEnLFxuICAgICAgY2hhbmdlczogWydPdmVybGF5Q29udGFpbmVyJywgJ0Z1bGxzY3JlZW5PdmVybGF5Q29udGFpbmVyJywgJ092ZXJsYXlSZWYnLCAnT3ZlcmxheSddXG4gICAgfVxuICBdLFxuICBbVGFyZ2V0VmVyc2lvbi5WMTBdOiBbXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTkzNDcnLFxuICAgICAgY2hhbmdlczogWydQbGF0Zm9ybSddXG4gICAgfVxuICBdLFxuICBbVGFyZ2V0VmVyc2lvbi5WOV06IFt7XG4gICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTcwODQnLFxuICAgIGNoYW5nZXM6IFsnRHJvcExpc3RSZWYnXVxuICB9XSxcbiAgW1RhcmdldFZlcnNpb24uVjhdOiBbe1xuICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE1NjQ3JyxcbiAgICBjaGFuZ2VzOiBbXG4gICAgICAnQ2RrRHJhZycsICdDZGtEcm9wTGlzdCcsICdDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5JywgJ0ZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneScsXG4gICAgICAnT3ZlcmxheVBvc2l0aW9uQnVpbGRlcicsICdDZGtUYWJsZSdcbiAgICBdXG4gIH1dLFxuICBbVGFyZ2V0VmVyc2lvbi5WN106IFtdLFxuICBbVGFyZ2V0VmVyc2lvbi5WNl06IFtdXG59O1xuIl19
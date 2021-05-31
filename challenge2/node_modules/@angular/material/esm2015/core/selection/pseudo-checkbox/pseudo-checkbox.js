/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy, Inject, Optional, } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
/**
 * Component that shows a simplified checkbox without including any kind of "real" checkbox.
 * Meant to be used when the checkbox is purely decorative and a large number of them will be
 * included, such as for the options in a multi-select. Uses no SVGs or complex animations.
 * Note that theming is meant to be handled by the parent element, e.g.
 * `mat-primary .mat-pseudo-checkbox`.
 *
 * Note that this component will be completely invisible to screen-reader users. This is *not*
 * interchangeable with `<mat-checkbox>` and should *not* be used if the user would directly
 * interact with the checkbox. The pseudo-checkbox should only be used as an implementation detail
 * of more complex components that appropriately handle selected / checked state.
 * @docs-private
 */
export class MatPseudoCheckbox {
    constructor(_animationMode) {
        this._animationMode = _animationMode;
        /** Display state of the checkbox. */
        this.state = 'unchecked';
        /** Whether the checkbox is disabled. */
        this.disabled = false;
    }
}
MatPseudoCheckbox.decorators = [
    { type: Component, args: [{
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                selector: 'mat-pseudo-checkbox',
                template: '',
                host: {
                    'class': 'mat-pseudo-checkbox',
                    '[class.mat-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
                    '[class.mat-pseudo-checkbox-checked]': 'state === "checked"',
                    '[class.mat-pseudo-checkbox-disabled]': 'disabled',
                    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                },
                styles: [".mat-pseudo-checkbox{width:16px;height:16px;border:2px solid;border-radius:2px;cursor:pointer;display:inline-block;vertical-align:middle;box-sizing:border-box;position:relative;flex-shrink:0;transition:border-color 90ms cubic-bezier(0, 0, 0.2, 0.1),background-color 90ms cubic-bezier(0, 0, 0.2, 0.1)}.mat-pseudo-checkbox::after{position:absolute;opacity:0;content:\"\";border-bottom:2px solid currentColor;transition:opacity 90ms cubic-bezier(0, 0, 0.2, 0.1)}.mat-pseudo-checkbox.mat-pseudo-checkbox-checked,.mat-pseudo-checkbox.mat-pseudo-checkbox-indeterminate{border-color:transparent}._mat-animation-noopable.mat-pseudo-checkbox{transition:none;animation:none}._mat-animation-noopable.mat-pseudo-checkbox::after{transition:none}.mat-pseudo-checkbox-disabled{cursor:default}.mat-pseudo-checkbox-indeterminate::after{top:5px;left:1px;width:10px;opacity:1;border-radius:2px}.mat-pseudo-checkbox-checked::after{top:2.4px;left:1px;width:8px;height:3px;border-left:2px solid currentColor;transform:rotate(-45deg);opacity:1;box-sizing:content-box}\n"]
            },] }
];
MatPseudoCheckbox.ctorParameters = () => [
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [ANIMATION_MODULE_TYPE,] }] }
];
MatPseudoCheckbox.propDecorators = {
    state: [{ type: Input }],
    disabled: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNldWRvLWNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NvcmUvc2VsZWN0aW9uL3BzZXVkby1jaGVja2JveC9wc2V1ZG8tY2hlY2tib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsS0FBSyxFQUNMLHVCQUF1QixFQUN2QixNQUFNLEVBQ04sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBUTNFOzs7Ozs7Ozs7Ozs7R0FZRztBQWVILE1BQU0sT0FBTyxpQkFBaUI7SUFPNUIsWUFBOEQsY0FBdUI7UUFBdkIsbUJBQWMsR0FBZCxjQUFjLENBQVM7UUFOckYscUNBQXFDO1FBQzVCLFVBQUssR0FBMkIsV0FBVyxDQUFDO1FBRXJELHdDQUF3QztRQUMvQixhQUFRLEdBQVksS0FBSyxDQUFDO0lBRXNELENBQUM7OztZQXJCM0YsU0FBUyxTQUFDO2dCQUNULGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsUUFBUSxFQUFFLHFCQUFxQjtnQkFFL0IsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osSUFBSSxFQUFFO29CQUNKLE9BQU8sRUFBRSxxQkFBcUI7b0JBQzlCLDJDQUEyQyxFQUFFLDJCQUEyQjtvQkFDeEUscUNBQXFDLEVBQUUscUJBQXFCO29CQUM1RCxzQ0FBc0MsRUFBRSxVQUFVO29CQUNsRCxpQ0FBaUMsRUFBRSxxQ0FBcUM7aUJBQ3pFOzthQUNGOzs7eUNBUWMsUUFBUSxZQUFJLE1BQU0sU0FBQyxxQkFBcUI7OztvQkFMcEQsS0FBSzt1QkFHTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIElucHV0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0FOSU1BVElPTl9NT0RVTEVfVFlQRX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zJztcblxuLyoqXG4gKiBQb3NzaWJsZSBzdGF0ZXMgZm9yIGEgcHNldWRvIGNoZWNrYm94LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBNYXRQc2V1ZG9DaGVja2JveFN0YXRlID0gJ3VuY2hlY2tlZCcgfCAnY2hlY2tlZCcgfCAnaW5kZXRlcm1pbmF0ZSc7XG5cbi8qKlxuICogQ29tcG9uZW50IHRoYXQgc2hvd3MgYSBzaW1wbGlmaWVkIGNoZWNrYm94IHdpdGhvdXQgaW5jbHVkaW5nIGFueSBraW5kIG9mIFwicmVhbFwiIGNoZWNrYm94LlxuICogTWVhbnQgdG8gYmUgdXNlZCB3aGVuIHRoZSBjaGVja2JveCBpcyBwdXJlbHkgZGVjb3JhdGl2ZSBhbmQgYSBsYXJnZSBudW1iZXIgb2YgdGhlbSB3aWxsIGJlXG4gKiBpbmNsdWRlZCwgc3VjaCBhcyBmb3IgdGhlIG9wdGlvbnMgaW4gYSBtdWx0aS1zZWxlY3QuIFVzZXMgbm8gU1ZHcyBvciBjb21wbGV4IGFuaW1hdGlvbnMuXG4gKiBOb3RlIHRoYXQgdGhlbWluZyBpcyBtZWFudCB0byBiZSBoYW5kbGVkIGJ5IHRoZSBwYXJlbnQgZWxlbWVudCwgZS5nLlxuICogYG1hdC1wcmltYXJ5IC5tYXQtcHNldWRvLWNoZWNrYm94YC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBjb21wb25lbnQgd2lsbCBiZSBjb21wbGV0ZWx5IGludmlzaWJsZSB0byBzY3JlZW4tcmVhZGVyIHVzZXJzLiBUaGlzIGlzICpub3QqXG4gKiBpbnRlcmNoYW5nZWFibGUgd2l0aCBgPG1hdC1jaGVja2JveD5gIGFuZCBzaG91bGQgKm5vdCogYmUgdXNlZCBpZiB0aGUgdXNlciB3b3VsZCBkaXJlY3RseVxuICogaW50ZXJhY3Qgd2l0aCB0aGUgY2hlY2tib3guIFRoZSBwc2V1ZG8tY2hlY2tib3ggc2hvdWxkIG9ubHkgYmUgdXNlZCBhcyBhbiBpbXBsZW1lbnRhdGlvbiBkZXRhaWxcbiAqIG9mIG1vcmUgY29tcGxleCBjb21wb25lbnRzIHRoYXQgYXBwcm9wcmlhdGVseSBoYW5kbGUgc2VsZWN0ZWQgLyBjaGVja2VkIHN0YXRlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHNlbGVjdG9yOiAnbWF0LXBzZXVkby1jaGVja2JveCcsXG4gIHN0eWxlVXJsczogWydwc2V1ZG8tY2hlY2tib3guY3NzJ10sXG4gIHRlbXBsYXRlOiAnJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtcHNldWRvLWNoZWNrYm94JyxcbiAgICAnW2NsYXNzLm1hdC1wc2V1ZG8tY2hlY2tib3gtaW5kZXRlcm1pbmF0ZV0nOiAnc3RhdGUgPT09IFwiaW5kZXRlcm1pbmF0ZVwiJyxcbiAgICAnW2NsYXNzLm1hdC1wc2V1ZG8tY2hlY2tib3gtY2hlY2tlZF0nOiAnc3RhdGUgPT09IFwiY2hlY2tlZFwiJyxcbiAgICAnW2NsYXNzLm1hdC1wc2V1ZG8tY2hlY2tib3gtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLl9tYXQtYW5pbWF0aW9uLW5vb3BhYmxlXSc6ICdfYW5pbWF0aW9uTW9kZSA9PT0gXCJOb29wQW5pbWF0aW9uc1wiJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0UHNldWRvQ2hlY2tib3gge1xuICAvKiogRGlzcGxheSBzdGF0ZSBvZiB0aGUgY2hlY2tib3guICovXG4gIEBJbnB1dCgpIHN0YXRlOiBNYXRQc2V1ZG9DaGVja2JveFN0YXRlID0gJ3VuY2hlY2tlZCc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoZWNrYm94IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBwdWJsaWMgX2FuaW1hdGlvbk1vZGU/OiBzdHJpbmcpIHsgfVxufVxuIl19
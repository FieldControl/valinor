/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy, Inject, Optional, } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import * as i0 from "@angular/core";
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
        /**
         * Appearance of the pseudo checkbox. Default appearance of 'full' renders a checkmark/mixedmark
         * indicator inside a square box. 'minimal' appearance only renders the checkmark/mixedmark.
         */
        this.appearance = 'full';
    }
}
MatPseudoCheckbox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatPseudoCheckbox, deps: [{ token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Component });
MatPseudoCheckbox.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatPseudoCheckbox, selector: "mat-pseudo-checkbox", inputs: { state: "state", disabled: "disabled", appearance: "appearance" }, host: { properties: { "class.mat-pseudo-checkbox-indeterminate": "state === \"indeterminate\"", "class.mat-pseudo-checkbox-checked": "state === \"checked\"", "class.mat-pseudo-checkbox-disabled": "disabled", "class.mat-pseudo-checkbox-minimal": "appearance === \"minimal\"", "class.mat-pseudo-checkbox-full": "appearance === \"full\"", "class._mat-animation-noopable": "_animationMode === \"NoopAnimations\"" }, classAttribute: "mat-pseudo-checkbox" }, ngImport: i0, template: '', isInline: true, styles: [".mat-pseudo-checkbox{border-radius:2px;cursor:pointer;display:inline-block;vertical-align:middle;box-sizing:border-box;position:relative;flex-shrink:0;transition:border-color 90ms cubic-bezier(0, 0, 0.2, 0.1),background-color 90ms cubic-bezier(0, 0, 0.2, 0.1)}.mat-pseudo-checkbox::after{position:absolute;opacity:0;content:\"\";border-bottom:2px solid currentColor;transition:opacity 90ms cubic-bezier(0, 0, 0.2, 0.1)}.mat-pseudo-checkbox._mat-animation-noopable{transition:none !important;animation:none !important}.mat-pseudo-checkbox._mat-animation-noopable::after{transition:none}.mat-pseudo-checkbox-disabled{cursor:default}.mat-pseudo-checkbox-indeterminate::after{left:1px;opacity:1;border-radius:2px}.mat-pseudo-checkbox-checked::after{left:1px;border-left:2px solid currentColor;transform:rotate(-45deg);opacity:1;box-sizing:content-box}.mat-pseudo-checkbox-full{border:2px solid}.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked,.mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate{border-color:rgba(0,0,0,0)}.mat-pseudo-checkbox{width:18px;height:18px}.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked::after{width:14px;height:6px;transform-origin:center;top:-4.2426406871px;left:0;bottom:0;right:0;margin:auto}.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate::after{top:8px;width:16px}.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked::after{width:10px;height:4px;transform-origin:center;top:-2.8284271247px;left:0;bottom:0;right:0;margin:auto}.mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate::after{top:6px;width:12px}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatPseudoCheckbox, decorators: [{
            type: Component,
            args: [{ encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, selector: 'mat-pseudo-checkbox', template: '', host: {
                        'class': 'mat-pseudo-checkbox',
                        '[class.mat-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
                        '[class.mat-pseudo-checkbox-checked]': 'state === "checked"',
                        '[class.mat-pseudo-checkbox-disabled]': 'disabled',
                        '[class.mat-pseudo-checkbox-minimal]': 'appearance === "minimal"',
                        '[class.mat-pseudo-checkbox-full]': 'appearance === "full"',
                        '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                    }, styles: [".mat-pseudo-checkbox{border-radius:2px;cursor:pointer;display:inline-block;vertical-align:middle;box-sizing:border-box;position:relative;flex-shrink:0;transition:border-color 90ms cubic-bezier(0, 0, 0.2, 0.1),background-color 90ms cubic-bezier(0, 0, 0.2, 0.1)}.mat-pseudo-checkbox::after{position:absolute;opacity:0;content:\"\";border-bottom:2px solid currentColor;transition:opacity 90ms cubic-bezier(0, 0, 0.2, 0.1)}.mat-pseudo-checkbox._mat-animation-noopable{transition:none !important;animation:none !important}.mat-pseudo-checkbox._mat-animation-noopable::after{transition:none}.mat-pseudo-checkbox-disabled{cursor:default}.mat-pseudo-checkbox-indeterminate::after{left:1px;opacity:1;border-radius:2px}.mat-pseudo-checkbox-checked::after{left:1px;border-left:2px solid currentColor;transform:rotate(-45deg);opacity:1;box-sizing:content-box}.mat-pseudo-checkbox-full{border:2px solid}.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked,.mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate{border-color:rgba(0,0,0,0)}.mat-pseudo-checkbox{width:18px;height:18px}.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked::after{width:14px;height:6px;transform-origin:center;top:-4.2426406871px;left:0;bottom:0;right:0;margin:auto}.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate::after{top:8px;width:16px}.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked::after{width:10px;height:4px;transform-origin:center;top:-2.8284271247px;left:0;bottom:0;right:0;margin:auto}.mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate::after{top:6px;width:12px}"] }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }]; }, propDecorators: { state: [{
                type: Input
            }], disabled: [{
                type: Input
            }], appearance: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNldWRvLWNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NvcmUvc2VsZWN0aW9uL3BzZXVkby1jaGVja2JveC9wc2V1ZG8tY2hlY2tib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsS0FBSyxFQUNMLHVCQUF1QixFQUN2QixNQUFNLEVBQ04sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHNDQUFzQyxDQUFDOztBQVEzRTs7Ozs7Ozs7Ozs7O0dBWUc7QUFpQkgsTUFBTSxPQUFPLGlCQUFpQjtJQWE1QixZQUE4RCxjQUF1QjtRQUF2QixtQkFBYyxHQUFkLGNBQWMsQ0FBUztRQVpyRixxQ0FBcUM7UUFDNUIsVUFBSyxHQUEyQixXQUFXLENBQUM7UUFFckQsd0NBQXdDO1FBQy9CLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFbkM7OztXQUdHO1FBQ00sZUFBVSxHQUF1QixNQUFNLENBQUM7SUFFdUMsQ0FBQzs7bUhBYjlFLGlCQUFpQixrQkFhSSxxQkFBcUI7dUdBYjFDLGlCQUFpQiw0a0JBWGxCLEVBQUU7Z0dBV0QsaUJBQWlCO2tCQWhCN0IsU0FBUztvQ0FDTyxpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNLFlBQ3JDLHFCQUFxQixZQUVyQixFQUFFLFFBQ047d0JBQ0osT0FBTyxFQUFFLHFCQUFxQjt3QkFDOUIsMkNBQTJDLEVBQUUsMkJBQTJCO3dCQUN4RSxxQ0FBcUMsRUFBRSxxQkFBcUI7d0JBQzVELHNDQUFzQyxFQUFFLFVBQVU7d0JBQ2xELHFDQUFxQyxFQUFFLDBCQUEwQjt3QkFDakUsa0NBQWtDLEVBQUUsdUJBQXVCO3dCQUMzRCxpQ0FBaUMsRUFBRSxxQ0FBcUM7cUJBQ3pFOzswQkFlWSxRQUFROzswQkFBSSxNQUFNOzJCQUFDLHFCQUFxQjs0Q0FYNUMsS0FBSztzQkFBYixLQUFLO2dCQUdHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBTUcsVUFBVTtzQkFBbEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBJbnB1dCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIEluamVjdCxcbiAgT3B0aW9uYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBTklNQVRJT05fTU9EVUxFX1RZUEV9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXIvYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogUG9zc2libGUgc3RhdGVzIGZvciBhIHBzZXVkbyBjaGVja2JveC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IHR5cGUgTWF0UHNldWRvQ2hlY2tib3hTdGF0ZSA9ICd1bmNoZWNrZWQnIHwgJ2NoZWNrZWQnIHwgJ2luZGV0ZXJtaW5hdGUnO1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IHNob3dzIGEgc2ltcGxpZmllZCBjaGVja2JveCB3aXRob3V0IGluY2x1ZGluZyBhbnkga2luZCBvZiBcInJlYWxcIiBjaGVja2JveC5cbiAqIE1lYW50IHRvIGJlIHVzZWQgd2hlbiB0aGUgY2hlY2tib3ggaXMgcHVyZWx5IGRlY29yYXRpdmUgYW5kIGEgbGFyZ2UgbnVtYmVyIG9mIHRoZW0gd2lsbCBiZVxuICogaW5jbHVkZWQsIHN1Y2ggYXMgZm9yIHRoZSBvcHRpb25zIGluIGEgbXVsdGktc2VsZWN0LiBVc2VzIG5vIFNWR3Mgb3IgY29tcGxleCBhbmltYXRpb25zLlxuICogTm90ZSB0aGF0IHRoZW1pbmcgaXMgbWVhbnQgdG8gYmUgaGFuZGxlZCBieSB0aGUgcGFyZW50IGVsZW1lbnQsIGUuZy5cbiAqIGBtYXQtcHJpbWFyeSAubWF0LXBzZXVkby1jaGVja2JveGAuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgY29tcG9uZW50IHdpbGwgYmUgY29tcGxldGVseSBpbnZpc2libGUgdG8gc2NyZWVuLXJlYWRlciB1c2Vycy4gVGhpcyBpcyAqbm90KlxuICogaW50ZXJjaGFuZ2VhYmxlIHdpdGggYDxtYXQtY2hlY2tib3g+YCBhbmQgc2hvdWxkICpub3QqIGJlIHVzZWQgaWYgdGhlIHVzZXIgd291bGQgZGlyZWN0bHlcbiAqIGludGVyYWN0IHdpdGggdGhlIGNoZWNrYm94LiBUaGUgcHNldWRvLWNoZWNrYm94IHNob3VsZCBvbmx5IGJlIHVzZWQgYXMgYW4gaW1wbGVtZW50YXRpb24gZGV0YWlsXG4gKiBvZiBtb3JlIGNvbXBsZXggY29tcG9uZW50cyB0aGF0IGFwcHJvcHJpYXRlbHkgaGFuZGxlIHNlbGVjdGVkIC8gY2hlY2tlZCBzdGF0ZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzZWxlY3RvcjogJ21hdC1wc2V1ZG8tY2hlY2tib3gnLFxuICBzdHlsZVVybHM6IFsncHNldWRvLWNoZWNrYm94LmNzcyddLFxuICB0ZW1wbGF0ZTogJycsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LXBzZXVkby1jaGVja2JveCcsXG4gICAgJ1tjbGFzcy5tYXQtcHNldWRvLWNoZWNrYm94LWluZGV0ZXJtaW5hdGVdJzogJ3N0YXRlID09PSBcImluZGV0ZXJtaW5hdGVcIicsXG4gICAgJ1tjbGFzcy5tYXQtcHNldWRvLWNoZWNrYm94LWNoZWNrZWRdJzogJ3N0YXRlID09PSBcImNoZWNrZWRcIicsXG4gICAgJ1tjbGFzcy5tYXQtcHNldWRvLWNoZWNrYm94LWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5tYXQtcHNldWRvLWNoZWNrYm94LW1pbmltYWxdJzogJ2FwcGVhcmFuY2UgPT09IFwibWluaW1hbFwiJyxcbiAgICAnW2NsYXNzLm1hdC1wc2V1ZG8tY2hlY2tib3gtZnVsbF0nOiAnYXBwZWFyYW5jZSA9PT0gXCJmdWxsXCInLFxuICAgICdbY2xhc3MuX21hdC1hbmltYXRpb24tbm9vcGFibGVdJzogJ19hbmltYXRpb25Nb2RlID09PSBcIk5vb3BBbmltYXRpb25zXCInLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBNYXRQc2V1ZG9DaGVja2JveCB7XG4gIC8qKiBEaXNwbGF5IHN0YXRlIG9mIHRoZSBjaGVja2JveC4gKi9cbiAgQElucHV0KCkgc3RhdGU6IE1hdFBzZXVkb0NoZWNrYm94U3RhdGUgPSAndW5jaGVja2VkJztcblxuICAvKiogV2hldGhlciB0aGUgY2hlY2tib3ggaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgpIGRpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEFwcGVhcmFuY2Ugb2YgdGhlIHBzZXVkbyBjaGVja2JveC4gRGVmYXVsdCBhcHBlYXJhbmNlIG9mICdmdWxsJyByZW5kZXJzIGEgY2hlY2ttYXJrL21peGVkbWFya1xuICAgKiBpbmRpY2F0b3IgaW5zaWRlIGEgc3F1YXJlIGJveC4gJ21pbmltYWwnIGFwcGVhcmFuY2Ugb25seSByZW5kZXJzIHRoZSBjaGVja21hcmsvbWl4ZWRtYXJrLlxuICAgKi9cbiAgQElucHV0KCkgYXBwZWFyYW5jZTogJ21pbmltYWwnIHwgJ2Z1bGwnID0gJ2Z1bGwnO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBwdWJsaWMgX2FuaW1hdGlvbk1vZGU/OiBzdHJpbmcpIHt9XG59XG4iXX0=
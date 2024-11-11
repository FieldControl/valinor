/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NgModule } from '@angular/core';
import { InternalFormsSharedModule, NG_MODEL_WITH_FORM_CONTROL_WARNING, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES, } from './directives';
import { CALL_SET_DISABLED_STATE, setDisabledStateDefault, } from './directives/shared';
import * as i0 from "@angular/core";
import * as i1 from "./directives/ng_model";
import * as i2 from "./directives/ng_model_group";
import * as i3 from "./directives/ng_form";
import * as i4 from "./directives/reactive_directives/form_control_directive";
import * as i5 from "./directives/reactive_directives/form_group_directive";
import * as i6 from "./directives/reactive_directives/form_control_name";
import * as i7 from "./directives/reactive_directives/form_group_name";
/**
 * Exports the required providers and directives for template-driven forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms)
 * @see [Template-driven Forms Guide](guide/forms)
 *
 * @publicApi
 */
export class FormsModule {
    /**
     * @description
     * Provides options for configuring the forms module.
     *
     * @param opts An object of configuration options
     * * `callSetDisabledState` Configures whether to `always` call `setDisabledState`, which is more
     * correct, or to only call it `whenDisabled`, which is the legacy behavior.
     */
    static withConfig(opts) {
        return {
            ngModule: FormsModule,
            providers: [
                {
                    provide: CALL_SET_DISABLED_STATE,
                    useValue: opts.callSetDisabledState ?? setDisabledStateDefault,
                },
            ],
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: FormsModule, declarations: [i1.NgModel, i2.NgModelGroup, i3.NgForm], exports: [InternalFormsSharedModule, i1.NgModel, i2.NgModelGroup, i3.NgForm] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormsModule, imports: [InternalFormsSharedModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FormsModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: TEMPLATE_DRIVEN_DIRECTIVES,
                    exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES],
                }]
        }] });
/**
 * Exports the required infrastructure and directives for reactive forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms)
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 *
 * @publicApi
 */
export class ReactiveFormsModule {
    /**
     * @description
     * Provides options for configuring the reactive forms module.
     *
     * @param opts An object of configuration options
     * * `warnOnNgModelWithFormControl` Configures when to emit a warning when an `ngModel`
     * binding is used with reactive form directives.
     * * `callSetDisabledState` Configures whether to `always` call `setDisabledState`, which is more
     * correct, or to only call it `whenDisabled`, which is the legacy behavior.
     */
    static withConfig(opts) {
        return {
            ngModule: ReactiveFormsModule,
            providers: [
                {
                    provide: NG_MODEL_WITH_FORM_CONTROL_WARNING,
                    useValue: opts.warnOnNgModelWithFormControl ?? 'always',
                },
                {
                    provide: CALL_SET_DISABLED_STATE,
                    useValue: opts.callSetDisabledState ?? setDisabledStateDefault,
                },
            ],
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: ReactiveFormsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: ReactiveFormsModule, declarations: [i4.FormControlDirective, i5.FormGroupDirective, i6.FormControlName, i7.FormGroupName, i7.FormArrayName], exports: [InternalFormsSharedModule, i4.FormControlDirective, i5.FormGroupDirective, i6.FormControlName, i7.FormGroupName, i7.FormArrayName] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: ReactiveFormsModule, imports: [InternalFormsSharedModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: ReactiveFormsModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [REACTIVE_DRIVEN_DIRECTIVES],
                    exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9wcm92aWRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZm9ybV9wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFzQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUNMLHlCQUF5QixFQUN6QixrQ0FBa0MsRUFDbEMsMEJBQTBCLEVBQzFCLDBCQUEwQixHQUMzQixNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLHVCQUF1QixHQUV4QixNQUFNLHFCQUFxQixDQUFDOzs7Ozs7Ozs7QUFFN0I7Ozs7Ozs7O0dBUUc7QUFLSCxNQUFNLE9BQU8sV0FBVztJQUN0Qjs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUVqQjtRQUNDLE9BQU87WUFDTCxRQUFRLEVBQUUsV0FBVztZQUNyQixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsT0FBTyxFQUFFLHVCQUF1QjtvQkFDaEMsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsSUFBSSx1QkFBdUI7aUJBQy9EO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQzt5SEFyQlUsV0FBVzswSEFBWCxXQUFXLG9FQUZaLHlCQUF5QjswSEFFeEIsV0FBVyxZQUZaLHlCQUF5Qjs7c0dBRXhCLFdBQVc7a0JBSnZCLFFBQVE7bUJBQUM7b0JBQ1IsWUFBWSxFQUFFLDBCQUEwQjtvQkFDeEMsT0FBTyxFQUFFLENBQUMseUJBQXlCLEVBQUUsMEJBQTBCLENBQUM7aUJBQ2pFOztBQXlCRDs7Ozs7Ozs7R0FRRztBQUtILE1BQU0sT0FBTyxtQkFBbUI7SUFDOUI7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUdqQjtRQUNDLE9BQU87WUFDTCxRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUsa0NBQWtDO29CQUMzQyxRQUFRLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixJQUFJLFFBQVE7aUJBQ3hEO2dCQUNEO29CQUNFLE9BQU8sRUFBRSx1QkFBdUI7b0JBQ2hDLFFBQVEsRUFBRSxJQUFJLENBQUMsb0JBQW9CLElBQUksdUJBQXVCO2lCQUMvRDthQUNGO1NBQ0YsQ0FBQztJQUNKLENBQUM7eUhBNUJVLG1CQUFtQjswSEFBbkIsbUJBQW1CLG9JQUZwQix5QkFBeUI7MEhBRXhCLG1CQUFtQixZQUZwQix5QkFBeUI7O3NHQUV4QixtQkFBbUI7a0JBSi9CLFFBQVE7bUJBQUM7b0JBQ1IsWUFBWSxFQUFFLENBQUMsMEJBQTBCLENBQUM7b0JBQzFDLE9BQU8sRUFBRSxDQUFDLHlCQUF5QixFQUFFLDBCQUEwQixDQUFDO2lCQUNqRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIEludGVybmFsRm9ybXNTaGFyZWRNb2R1bGUsXG4gIE5HX01PREVMX1dJVEhfRk9STV9DT05UUk9MX1dBUk5JTkcsXG4gIFJFQUNUSVZFX0RSSVZFTl9ESVJFQ1RJVkVTLFxuICBURU1QTEFURV9EUklWRU5fRElSRUNUSVZFUyxcbn0gZnJvbSAnLi9kaXJlY3RpdmVzJztcbmltcG9ydCB7XG4gIENBTExfU0VUX0RJU0FCTEVEX1NUQVRFLFxuICBzZXREaXNhYmxlZFN0YXRlRGVmYXVsdCxcbiAgU2V0RGlzYWJsZWRTdGF0ZU9wdGlvbixcbn0gZnJvbSAnLi9kaXJlY3RpdmVzL3NoYXJlZCc7XG5cbi8qKlxuICogRXhwb3J0cyB0aGUgcmVxdWlyZWQgcHJvdmlkZXJzIGFuZCBkaXJlY3RpdmVzIGZvciB0ZW1wbGF0ZS1kcml2ZW4gZm9ybXMsXG4gKiBtYWtpbmcgdGhlbSBhdmFpbGFibGUgZm9yIGltcG9ydCBieSBOZ01vZHVsZXMgdGhhdCBpbXBvcnQgdGhpcyBtb2R1bGUuXG4gKlxuICogQHNlZSBbRm9ybXMgT3ZlcnZpZXddKGd1aWRlL2Zvcm1zKVxuICogQHNlZSBbVGVtcGxhdGUtZHJpdmVuIEZvcm1zIEd1aWRlXShndWlkZS9mb3JtcylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogVEVNUExBVEVfRFJJVkVOX0RJUkVDVElWRVMsXG4gIGV4cG9ydHM6IFtJbnRlcm5hbEZvcm1zU2hhcmVkTW9kdWxlLCBURU1QTEFURV9EUklWRU5fRElSRUNUSVZFU10sXG59KVxuZXhwb3J0IGNsYXNzIEZvcm1zTW9kdWxlIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBQcm92aWRlcyBvcHRpb25zIGZvciBjb25maWd1cmluZyB0aGUgZm9ybXMgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0gb3B0cyBBbiBvYmplY3Qgb2YgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gICAqICogYGNhbGxTZXREaXNhYmxlZFN0YXRlYCBDb25maWd1cmVzIHdoZXRoZXIgdG8gYGFsd2F5c2AgY2FsbCBgc2V0RGlzYWJsZWRTdGF0ZWAsIHdoaWNoIGlzIG1vcmVcbiAgICogY29ycmVjdCwgb3IgdG8gb25seSBjYWxsIGl0IGB3aGVuRGlzYWJsZWRgLCB3aGljaCBpcyB0aGUgbGVnYWN5IGJlaGF2aW9yLlxuICAgKi9cbiAgc3RhdGljIHdpdGhDb25maWcob3B0czoge1xuICAgIGNhbGxTZXREaXNhYmxlZFN0YXRlPzogU2V0RGlzYWJsZWRTdGF0ZU9wdGlvbjtcbiAgfSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8Rm9ybXNNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEZvcm1zTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBDQUxMX1NFVF9ESVNBQkxFRF9TVEFURSxcbiAgICAgICAgICB1c2VWYWx1ZTogb3B0cy5jYWxsU2V0RGlzYWJsZWRTdGF0ZSA/PyBzZXREaXNhYmxlZFN0YXRlRGVmYXVsdCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9ydHMgdGhlIHJlcXVpcmVkIGluZnJhc3RydWN0dXJlIGFuZCBkaXJlY3RpdmVzIGZvciByZWFjdGl2ZSBmb3JtcyxcbiAqIG1ha2luZyB0aGVtIGF2YWlsYWJsZSBmb3IgaW1wb3J0IGJ5IE5nTW9kdWxlcyB0aGF0IGltcG9ydCB0aGlzIG1vZHVsZS5cbiAqXG4gKiBAc2VlIFtGb3JtcyBPdmVydmlld10oZ3VpZGUvZm9ybXMpXG4gKiBAc2VlIFtSZWFjdGl2ZSBGb3JtcyBHdWlkZV0oZ3VpZGUvZm9ybXMvcmVhY3RpdmUtZm9ybXMpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtSRUFDVElWRV9EUklWRU5fRElSRUNUSVZFU10sXG4gIGV4cG9ydHM6IFtJbnRlcm5hbEZvcm1zU2hhcmVkTW9kdWxlLCBSRUFDVElWRV9EUklWRU5fRElSRUNUSVZFU10sXG59KVxuZXhwb3J0IGNsYXNzIFJlYWN0aXZlRm9ybXNNb2R1bGUge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFByb3ZpZGVzIG9wdGlvbnMgZm9yIGNvbmZpZ3VyaW5nIHRoZSByZWFjdGl2ZSBmb3JtcyBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRzIEFuIG9iamVjdCBvZiBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICogKiBgd2Fybk9uTmdNb2RlbFdpdGhGb3JtQ29udHJvbGAgQ29uZmlndXJlcyB3aGVuIHRvIGVtaXQgYSB3YXJuaW5nIHdoZW4gYW4gYG5nTW9kZWxgXG4gICAqIGJpbmRpbmcgaXMgdXNlZCB3aXRoIHJlYWN0aXZlIGZvcm0gZGlyZWN0aXZlcy5cbiAgICogKiBgY2FsbFNldERpc2FibGVkU3RhdGVgIENvbmZpZ3VyZXMgd2hldGhlciB0byBgYWx3YXlzYCBjYWxsIGBzZXREaXNhYmxlZFN0YXRlYCwgd2hpY2ggaXMgbW9yZVxuICAgKiBjb3JyZWN0LCBvciB0byBvbmx5IGNhbGwgaXQgYHdoZW5EaXNhYmxlZGAsIHdoaWNoIGlzIHRoZSBsZWdhY3kgYmVoYXZpb3IuXG4gICAqL1xuICBzdGF0aWMgd2l0aENvbmZpZyhvcHRzOiB7XG4gICAgLyoqIEBkZXByZWNhdGVkIGFzIG9mIHY2ICovIHdhcm5Pbk5nTW9kZWxXaXRoRm9ybUNvbnRyb2w/OiAnbmV2ZXInIHwgJ29uY2UnIHwgJ2Fsd2F5cyc7XG4gICAgY2FsbFNldERpc2FibGVkU3RhdGU/OiBTZXREaXNhYmxlZFN0YXRlT3B0aW9uO1xuICB9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxSZWFjdGl2ZUZvcm1zTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBOR19NT0RFTF9XSVRIX0ZPUk1fQ09OVFJPTF9XQVJOSU5HLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRzLndhcm5Pbk5nTW9kZWxXaXRoRm9ybUNvbnRyb2wgPz8gJ2Fsd2F5cycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBDQUxMX1NFVF9ESVNBQkxFRF9TVEFURSxcbiAgICAgICAgICB1c2VWYWx1ZTogb3B0cy5jYWxsU2V0RGlzYWJsZWRTdGF0ZSA/PyBzZXREaXNhYmxlZFN0YXRlRGVmYXVsdCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuIl19
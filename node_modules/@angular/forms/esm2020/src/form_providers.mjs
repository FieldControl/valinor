/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { InternalFormsSharedModule, NG_MODEL_WITH_FORM_CONTROL_WARNING, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES } from './directives';
import { CALL_SET_DISABLED_STATE, setDisabledStateDefault } from './directives/shared';
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
 * Providers associated with this module:
 * * `RadioControlRegistry`
 *
 * @see [Forms Overview](/guide/forms-overview)
 * @see [Template-driven Forms Guide](/guide/forms)
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
            providers: [{
                    provide: CALL_SET_DISABLED_STATE,
                    useValue: opts.callSetDisabledState ?? setDisabledStateDefault
                }]
        };
    }
}
FormsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: FormsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
FormsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.0", ngImport: i0, type: FormsModule, declarations: [i1.NgModel, i2.NgModelGroup, i3.NgForm], exports: [InternalFormsSharedModule, i1.NgModel, i2.NgModelGroup, i3.NgForm] });
FormsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: FormsModule, imports: [InternalFormsSharedModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: FormsModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: TEMPLATE_DRIVEN_DIRECTIVES,
                    exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
                }]
        }] });
/**
 * Exports the required infrastructure and directives for reactive forms,
 * making them available for import by NgModules that import this module.
 *
 * Providers associated with this module:
 * * `FormBuilder`
 * * `RadioControlRegistry`
 *
 * @see [Forms Overview](guide/forms-overview)
 * @see [Reactive Forms Guide](guide/reactive-forms)
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
                    useValue: opts.warnOnNgModelWithFormControl ?? 'always'
                },
                {
                    provide: CALL_SET_DISABLED_STATE,
                    useValue: opts.callSetDisabledState ?? setDisabledStateDefault
                }
            ]
        };
    }
}
ReactiveFormsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: ReactiveFormsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
ReactiveFormsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.0", ngImport: i0, type: ReactiveFormsModule, declarations: [i4.FormControlDirective, i5.FormGroupDirective, i6.FormControlName, i7.FormGroupName, i7.FormArrayName], exports: [InternalFormsSharedModule, i4.FormControlDirective, i5.FormGroupDirective, i6.FormControlName, i7.FormGroupName, i7.FormArrayName] });
ReactiveFormsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: ReactiveFormsModule, imports: [InternalFormsSharedModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: ReactiveFormsModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [REACTIVE_DRIVEN_DIRECTIVES],
                    exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9wcm92aWRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZm9ybV9wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFzQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLHlCQUF5QixFQUFFLGtDQUFrQyxFQUFFLDBCQUEwQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ25KLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSx1QkFBdUIsRUFBeUIsTUFBTSxxQkFBcUIsQ0FBQzs7Ozs7Ozs7O0FBRTdHOzs7Ozs7Ozs7OztHQVdHO0FBS0gsTUFBTSxPQUFPLFdBQVc7SUFDdEI7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFFakI7UUFDQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLFdBQVc7WUFDckIsU0FBUyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLHVCQUF1QjtvQkFDaEMsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsSUFBSSx1QkFBdUI7aUJBQy9ELENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQzs7bUhBbkJVLFdBQVc7b0hBQVgsV0FBVyxvRUFGWix5QkFBeUI7b0hBRXhCLFdBQVcsWUFGWix5QkFBeUI7c0dBRXhCLFdBQVc7a0JBSnZCLFFBQVE7bUJBQUM7b0JBQ1IsWUFBWSxFQUFFLDBCQUEwQjtvQkFDeEMsT0FBTyxFQUFFLENBQUMseUJBQXlCLEVBQUUsMEJBQTBCLENBQUM7aUJBQ2pFOztBQXVCRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFLSCxNQUFNLE9BQU8sbUJBQW1CO0lBQzlCOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFJQztRQUNqQixPQUFPO1lBQ0wsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsT0FBTyxFQUFFLGtDQUFrQztvQkFDM0MsUUFBUSxFQUFFLElBQUksQ0FBQyw0QkFBNEIsSUFBSSxRQUFRO2lCQUN4RDtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsdUJBQXVCO29CQUNoQyxRQUFRLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixJQUFJLHVCQUF1QjtpQkFDL0Q7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDOzsySEE3QlUsbUJBQW1COzRIQUFuQixtQkFBbUIsb0lBRnBCLHlCQUF5Qjs0SEFFeEIsbUJBQW1CLFlBRnBCLHlCQUF5QjtzR0FFeEIsbUJBQW1CO2tCQUovQixRQUFRO21CQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLDBCQUEwQixDQUFDO29CQUMxQyxPQUFPLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSwwQkFBMEIsQ0FBQztpQkFDakUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SW50ZXJuYWxGb3Jtc1NoYXJlZE1vZHVsZSwgTkdfTU9ERUxfV0lUSF9GT1JNX0NPTlRST0xfV0FSTklORywgUkVBQ1RJVkVfRFJJVkVOX0RJUkVDVElWRVMsIFRFTVBMQVRFX0RSSVZFTl9ESVJFQ1RJVkVTfSBmcm9tICcuL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHtDQUxMX1NFVF9ESVNBQkxFRF9TVEFURSwgc2V0RGlzYWJsZWRTdGF0ZURlZmF1bHQsIFNldERpc2FibGVkU3RhdGVPcHRpb259IGZyb20gJy4vZGlyZWN0aXZlcy9zaGFyZWQnO1xuXG4vKipcbiAqIEV4cG9ydHMgdGhlIHJlcXVpcmVkIHByb3ZpZGVycyBhbmQgZGlyZWN0aXZlcyBmb3IgdGVtcGxhdGUtZHJpdmVuIGZvcm1zLFxuICogbWFraW5nIHRoZW0gYXZhaWxhYmxlIGZvciBpbXBvcnQgYnkgTmdNb2R1bGVzIHRoYXQgaW1wb3J0IHRoaXMgbW9kdWxlLlxuICpcbiAqIFByb3ZpZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBtb2R1bGU6XG4gKiAqIGBSYWRpb0NvbnRyb2xSZWdpc3RyeWBcbiAqXG4gKiBAc2VlIFtGb3JtcyBPdmVydmlld10oL2d1aWRlL2Zvcm1zLW92ZXJ2aWV3KVxuICogQHNlZSBbVGVtcGxhdGUtZHJpdmVuIEZvcm1zIEd1aWRlXSgvZ3VpZGUvZm9ybXMpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFRFTVBMQVRFX0RSSVZFTl9ESVJFQ1RJVkVTLFxuICBleHBvcnRzOiBbSW50ZXJuYWxGb3Jtc1NoYXJlZE1vZHVsZSwgVEVNUExBVEVfRFJJVkVOX0RJUkVDVElWRVNdXG59KVxuZXhwb3J0IGNsYXNzIEZvcm1zTW9kdWxlIHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBQcm92aWRlcyBvcHRpb25zIGZvciBjb25maWd1cmluZyB0aGUgZm9ybXMgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0gb3B0cyBBbiBvYmplY3Qgb2YgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gICAqICogYGNhbGxTZXREaXNhYmxlZFN0YXRlYCBDb25maWd1cmVzIHdoZXRoZXIgdG8gYGFsd2F5c2AgY2FsbCBgc2V0RGlzYWJsZWRTdGF0ZWAsIHdoaWNoIGlzIG1vcmVcbiAgICogY29ycmVjdCwgb3IgdG8gb25seSBjYWxsIGl0IGB3aGVuRGlzYWJsZWRgLCB3aGljaCBpcyB0aGUgbGVnYWN5IGJlaGF2aW9yLlxuICAgKi9cbiAgc3RhdGljIHdpdGhDb25maWcob3B0czoge1xuICAgIGNhbGxTZXREaXNhYmxlZFN0YXRlPzogU2V0RGlzYWJsZWRTdGF0ZU9wdGlvbixcbiAgfSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8Rm9ybXNNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEZvcm1zTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbe1xuICAgICAgICBwcm92aWRlOiBDQUxMX1NFVF9ESVNBQkxFRF9TVEFURSxcbiAgICAgICAgdXNlVmFsdWU6IG9wdHMuY2FsbFNldERpc2FibGVkU3RhdGUgPz8gc2V0RGlzYWJsZWRTdGF0ZURlZmF1bHRcbiAgICAgIH1dXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9ydHMgdGhlIHJlcXVpcmVkIGluZnJhc3RydWN0dXJlIGFuZCBkaXJlY3RpdmVzIGZvciByZWFjdGl2ZSBmb3JtcyxcbiAqIG1ha2luZyB0aGVtIGF2YWlsYWJsZSBmb3IgaW1wb3J0IGJ5IE5nTW9kdWxlcyB0aGF0IGltcG9ydCB0aGlzIG1vZHVsZS5cbiAqXG4gKiBQcm92aWRlcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgbW9kdWxlOlxuICogKiBgRm9ybUJ1aWxkZXJgXG4gKiAqIGBSYWRpb0NvbnRyb2xSZWdpc3RyeWBcbiAqXG4gKiBAc2VlIFtGb3JtcyBPdmVydmlld10oZ3VpZGUvZm9ybXMtb3ZlcnZpZXcpXG4gKiBAc2VlIFtSZWFjdGl2ZSBGb3JtcyBHdWlkZV0oZ3VpZGUvcmVhY3RpdmUtZm9ybXMpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtSRUFDVElWRV9EUklWRU5fRElSRUNUSVZFU10sXG4gIGV4cG9ydHM6IFtJbnRlcm5hbEZvcm1zU2hhcmVkTW9kdWxlLCBSRUFDVElWRV9EUklWRU5fRElSRUNUSVZFU11cbn0pXG5leHBvcnQgY2xhc3MgUmVhY3RpdmVGb3Jtc01vZHVsZSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUHJvdmlkZXMgb3B0aW9ucyBmb3IgY29uZmlndXJpbmcgdGhlIHJlYWN0aXZlIGZvcm1zIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIG9wdHMgQW4gb2JqZWN0IG9mIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgKiAqIGB3YXJuT25OZ01vZGVsV2l0aEZvcm1Db250cm9sYCBDb25maWd1cmVzIHdoZW4gdG8gZW1pdCBhIHdhcm5pbmcgd2hlbiBhbiBgbmdNb2RlbGBcbiAgICogYmluZGluZyBpcyB1c2VkIHdpdGggcmVhY3RpdmUgZm9ybSBkaXJlY3RpdmVzLlxuICAgKiAqIGBjYWxsU2V0RGlzYWJsZWRTdGF0ZWAgQ29uZmlndXJlcyB3aGV0aGVyIHRvIGBhbHdheXNgIGNhbGwgYHNldERpc2FibGVkU3RhdGVgLCB3aGljaCBpcyBtb3JlXG4gICAqIGNvcnJlY3QsIG9yIHRvIG9ubHkgY2FsbCBpdCBgd2hlbkRpc2FibGVkYCwgd2hpY2ggaXMgdGhlIGxlZ2FjeSBiZWhhdmlvci5cbiAgICovXG4gIHN0YXRpYyB3aXRoQ29uZmlnKG9wdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgLyoqIEBkZXByZWNhdGVkIGFzIG9mIHY2ICovIHdhcm5Pbk5nTW9kZWxXaXRoRm9ybUNvbnRyb2w/OiAnbmV2ZXInfCdvbmNlJ3xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYWx3YXlzJyxcbiAgICAgICAgICAgICAgICAgICAgY2FsbFNldERpc2FibGVkU3RhdGU/OiBTZXREaXNhYmxlZFN0YXRlT3B0aW9uLFxuICAgICAgICAgICAgICAgICAgICB9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxSZWFjdGl2ZUZvcm1zTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBOR19NT0RFTF9XSVRIX0ZPUk1fQ09OVFJPTF9XQVJOSU5HLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRzLndhcm5Pbk5nTW9kZWxXaXRoRm9ybUNvbnRyb2wgPz8gJ2Fsd2F5cydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IENBTExfU0VUX0RJU0FCTEVEX1NUQVRFLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRzLmNhbGxTZXREaXNhYmxlZFN0YXRlID8/IHNldERpc2FibGVkU3RhdGVEZWZhdWx0XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXX0=
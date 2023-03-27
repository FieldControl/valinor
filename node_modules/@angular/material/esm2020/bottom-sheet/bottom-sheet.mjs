/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Injectable, Optional, SkipSelf, InjectionToken, Inject, Injector, } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetConfig } from './bottom-sheet-config';
import { MatBottomSheetContainer } from './bottom-sheet-container';
import { MatBottomSheetModule } from './bottom-sheet-module';
import { MatBottomSheetRef } from './bottom-sheet-ref';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "./bottom-sheet-config";
/** Injection token that can be used to specify default bottom sheet options. */
export const MAT_BOTTOM_SHEET_DEFAULT_OPTIONS = new InjectionToken('mat-bottom-sheet-default-options');
/**
 * Service to trigger Material Design bottom sheets.
 */
export class MatBottomSheet {
    /** Reference to the currently opened bottom sheet. */
    get _openedBottomSheetRef() {
        const parent = this._parentBottomSheet;
        return parent ? parent._openedBottomSheetRef : this._bottomSheetRefAtThisLevel;
    }
    set _openedBottomSheetRef(value) {
        if (this._parentBottomSheet) {
            this._parentBottomSheet._openedBottomSheetRef = value;
        }
        else {
            this._bottomSheetRefAtThisLevel = value;
        }
    }
    constructor(_overlay, injector, _parentBottomSheet, _defaultOptions) {
        this._overlay = _overlay;
        this._parentBottomSheet = _parentBottomSheet;
        this._defaultOptions = _defaultOptions;
        this._bottomSheetRefAtThisLevel = null;
        this._dialog = injector.get(Dialog);
    }
    open(componentOrTemplateRef, config) {
        const _config = { ...(this._defaultOptions || new MatBottomSheetConfig()), ...config };
        let ref;
        this._dialog.open(componentOrTemplateRef, {
            ..._config,
            // Disable closing since we need to sync it up to the animation ourselves.
            disableClose: true,
            // Disable closing on detachments so that we can sync up the animation.
            closeOnOverlayDetachments: false,
            maxWidth: '100%',
            container: MatBottomSheetContainer,
            scrollStrategy: _config.scrollStrategy || this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position().global().centerHorizontally().bottom('0'),
            templateContext: () => ({ bottomSheetRef: ref }),
            providers: (cdkRef, _cdkConfig, container) => {
                ref = new MatBottomSheetRef(cdkRef, _config, container);
                return [
                    { provide: MatBottomSheetRef, useValue: ref },
                    { provide: MAT_BOTTOM_SHEET_DATA, useValue: _config.data },
                ];
            },
        });
        // When the bottom sheet is dismissed, clear the reference to it.
        ref.afterDismissed().subscribe(() => {
            // Clear the bottom sheet ref if it hasn't already been replaced by a newer one.
            if (this._openedBottomSheetRef === ref) {
                this._openedBottomSheetRef = null;
            }
        });
        if (this._openedBottomSheetRef) {
            // If a bottom sheet is already in view, dismiss it and enter the
            // new bottom sheet after exit animation is complete.
            this._openedBottomSheetRef.afterDismissed().subscribe(() => ref.containerInstance?.enter());
            this._openedBottomSheetRef.dismiss();
        }
        else {
            // If no bottom sheet is in view, enter the new bottom sheet.
            ref.containerInstance.enter();
        }
        this._openedBottomSheetRef = ref;
        return ref;
    }
    /**
     * Dismisses the currently-visible bottom sheet.
     * @param result Data to pass to the bottom sheet instance.
     */
    dismiss(result) {
        if (this._openedBottomSheetRef) {
            this._openedBottomSheetRef.dismiss(result);
        }
    }
    ngOnDestroy() {
        if (this._bottomSheetRefAtThisLevel) {
            this._bottomSheetRefAtThisLevel.dismiss();
        }
    }
}
MatBottomSheet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatBottomSheet, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: MatBottomSheet, optional: true, skipSelf: true }, { token: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
MatBottomSheet.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatBottomSheet, providedIn: MatBottomSheetModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatBottomSheet, decorators: [{
            type: Injectable,
            args: [{ providedIn: MatBottomSheetModule }]
        }], ctorParameters: function () { return [{ type: i1.Overlay }, { type: i0.Injector }, { type: MatBottomSheet, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i2.MatBottomSheetConfig, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_BOTTOM_SHEET_DEFAULT_OPTIONS]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90dG9tLXNoZWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2JvdHRvbS1zaGVldC9ib3R0b20tc2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUU3QyxPQUFPLEVBQ0wsVUFBVSxFQUNWLFFBQVEsRUFDUixRQUFRLEVBRVIsY0FBYyxFQUNkLE1BQU0sRUFFTixRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHFCQUFxQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEYsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7Ozs7QUFFckQsZ0ZBQWdGO0FBQ2hGLE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLElBQUksY0FBYyxDQUNoRSxrQ0FBa0MsQ0FDbkMsQ0FBQztBQUVGOztHQUVHO0FBRUgsTUFBTSxPQUFPLGNBQWM7SUFJekIsc0RBQXNEO0lBQ3RELElBQUkscUJBQXFCO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN2QyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUM7SUFDakYsQ0FBQztJQUVELElBQUkscUJBQXFCLENBQUMsS0FBb0M7UUFDNUQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGtCQUFr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QkFBcUIsRUFBRTtZQUM5QixJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVDO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtZQUNuQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDM0M7SUFDSCxDQUFDOztnSEFsSFUsY0FBYyw0SEF1QmYsZ0NBQWdDO29IQXZCL0IsY0FBYyxjQURGLG9CQUFvQjtnR0FDaEMsY0FBYztrQkFEMUIsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFBQzs7MEJBc0J6QyxRQUFROzswQkFBSSxRQUFROzswQkFDcEIsUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxnQ0FBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaWFsb2d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kaWFsb2cnO1xuaW1wb3J0IHtPdmVybGF5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0NvbXBvbmVudFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgSW5qZWN0YWJsZSxcbiAgT3B0aW9uYWwsXG4gIFNraXBTZWxmLFxuICBUZW1wbGF0ZVJlZixcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdCxcbiAgT25EZXN0cm95LFxuICBJbmplY3Rvcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01BVF9CT1RUT01fU0hFRVRfREFUQSwgTWF0Qm90dG9tU2hlZXRDb25maWd9IGZyb20gJy4vYm90dG9tLXNoZWV0LWNvbmZpZyc7XG5pbXBvcnQge01hdEJvdHRvbVNoZWV0Q29udGFpbmVyfSBmcm9tICcuL2JvdHRvbS1zaGVldC1jb250YWluZXInO1xuaW1wb3J0IHtNYXRCb3R0b21TaGVldE1vZHVsZX0gZnJvbSAnLi9ib3R0b20tc2hlZXQtbW9kdWxlJztcbmltcG9ydCB7TWF0Qm90dG9tU2hlZXRSZWZ9IGZyb20gJy4vYm90dG9tLXNoZWV0LXJlZic7XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBzcGVjaWZ5IGRlZmF1bHQgYm90dG9tIHNoZWV0IG9wdGlvbnMuICovXG5leHBvcnQgY29uc3QgTUFUX0JPVFRPTV9TSEVFVF9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0Qm90dG9tU2hlZXRDb25maWc+KFxuICAnbWF0LWJvdHRvbS1zaGVldC1kZWZhdWx0LW9wdGlvbnMnLFxuKTtcblxuLyoqXG4gKiBTZXJ2aWNlIHRvIHRyaWdnZXIgTWF0ZXJpYWwgRGVzaWduIGJvdHRvbSBzaGVldHMuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiBNYXRCb3R0b21TaGVldE1vZHVsZX0pXG5leHBvcnQgY2xhc3MgTWF0Qm90dG9tU2hlZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9ib3R0b21TaGVldFJlZkF0VGhpc0xldmVsOiBNYXRCb3R0b21TaGVldFJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2RpYWxvZzogRGlhbG9nO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseSBvcGVuZWQgYm90dG9tIHNoZWV0LiAqL1xuICBnZXQgX29wZW5lZEJvdHRvbVNoZWV0UmVmKCk6IE1hdEJvdHRvbVNoZWV0UmVmPGFueT4gfCBudWxsIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9wYXJlbnRCb3R0b21TaGVldDtcbiAgICByZXR1cm4gcGFyZW50ID8gcGFyZW50Ll9vcGVuZWRCb3R0b21TaGVldFJlZiA6IHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWw7XG4gIH1cblxuICBzZXQgX29wZW5lZEJvdHRvbVNoZWV0UmVmKHZhbHVlOiBNYXRCb3R0b21TaGVldFJlZjxhbnk+IHwgbnVsbCkge1xuICAgIGlmICh0aGlzLl9wYXJlbnRCb3R0b21TaGVldCkge1xuICAgICAgdGhpcy5fcGFyZW50Qm90dG9tU2hlZXQuX29wZW5lZEJvdHRvbVNoZWV0UmVmID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWwgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwcml2YXRlIF9wYXJlbnRCb3R0b21TaGVldDogTWF0Qm90dG9tU2hlZXQsXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KE1BVF9CT1RUT01fU0hFRVRfREVGQVVMVF9PUFRJT05TKVxuICAgIHByaXZhdGUgX2RlZmF1bHRPcHRpb25zPzogTWF0Qm90dG9tU2hlZXRDb25maWcsXG4gICkge1xuICAgIHRoaXMuX2RpYWxvZyA9IGluamVjdG9yLmdldChEaWFsb2cpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgYm90dG9tIHNoZWV0IGNvbnRhaW5pbmcgdGhlIGdpdmVuIGNvbXBvbmVudC5cbiAgICogQHBhcmFtIGNvbXBvbmVudCBUeXBlIG9mIHRoZSBjb21wb25lbnQgdG8gbG9hZCBpbnRvIHRoZSBib3R0b20gc2hlZXQuXG4gICAqIEBwYXJhbSBjb25maWcgRXh0cmEgY29uZmlndXJhdGlvbiBvcHRpb25zLlxuICAgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIG5ld2x5LW9wZW5lZCBib3R0b20gc2hlZXQuXG4gICAqL1xuICBvcGVuPFQsIEQgPSBhbnksIFIgPSBhbnk+KFxuICAgIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZTxUPixcbiAgICBjb25maWc/OiBNYXRCb3R0b21TaGVldENvbmZpZzxEPixcbiAgKTogTWF0Qm90dG9tU2hlZXRSZWY8VCwgUj47XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgYm90dG9tIHNoZWV0IGNvbnRhaW5pbmcgdGhlIGdpdmVuIHRlbXBsYXRlLlxuICAgKiBAcGFyYW0gdGVtcGxhdGUgVGVtcGxhdGVSZWYgdG8gaW5zdGFudGlhdGUgYXMgdGhlIGJvdHRvbSBzaGVldCBjb250ZW50LlxuICAgKiBAcGFyYW0gY29uZmlnIEV4dHJhIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICogQHJldHVybnMgUmVmZXJlbmNlIHRvIHRoZSBuZXdseS1vcGVuZWQgYm90dG9tIHNoZWV0LlxuICAgKi9cbiAgb3BlbjxULCBEID0gYW55LCBSID0gYW55PihcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VD4sXG4gICAgY29uZmlnPzogTWF0Qm90dG9tU2hlZXRDb25maWc8RD4sXG4gICk6IE1hdEJvdHRvbVNoZWV0UmVmPFQsIFI+O1xuXG4gIG9wZW48VCwgRCA9IGFueSwgUiA9IGFueT4oXG4gICAgY29tcG9uZW50T3JUZW1wbGF0ZVJlZjogQ29tcG9uZW50VHlwZTxUPiB8IFRlbXBsYXRlUmVmPFQ+LFxuICAgIGNvbmZpZz86IE1hdEJvdHRvbVNoZWV0Q29uZmlnPEQ+LFxuICApOiBNYXRCb3R0b21TaGVldFJlZjxULCBSPiB7XG4gICAgY29uc3QgX2NvbmZpZyA9IHsuLi4odGhpcy5fZGVmYXVsdE9wdGlvbnMgfHwgbmV3IE1hdEJvdHRvbVNoZWV0Q29uZmlnKCkpLCAuLi5jb25maWd9O1xuICAgIGxldCByZWY6IE1hdEJvdHRvbVNoZWV0UmVmPFQsIFI+O1xuXG4gICAgdGhpcy5fZGlhbG9nLm9wZW48UiwgRCwgVD4oY29tcG9uZW50T3JUZW1wbGF0ZVJlZiwge1xuICAgICAgLi4uX2NvbmZpZyxcbiAgICAgIC8vIERpc2FibGUgY2xvc2luZyBzaW5jZSB3ZSBuZWVkIHRvIHN5bmMgaXQgdXAgdG8gdGhlIGFuaW1hdGlvbiBvdXJzZWx2ZXMuXG4gICAgICBkaXNhYmxlQ2xvc2U6IHRydWUsXG4gICAgICAvLyBEaXNhYmxlIGNsb3Npbmcgb24gZGV0YWNobWVudHMgc28gdGhhdCB3ZSBjYW4gc3luYyB1cCB0aGUgYW5pbWF0aW9uLlxuICAgICAgY2xvc2VPbk92ZXJsYXlEZXRhY2htZW50czogZmFsc2UsXG4gICAgICBtYXhXaWR0aDogJzEwMCUnLFxuICAgICAgY29udGFpbmVyOiBNYXRCb3R0b21TaGVldENvbnRhaW5lcixcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiBfY29uZmlnLnNjcm9sbFN0cmF0ZWd5IHx8IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpLmdsb2JhbCgpLmNlbnRlckhvcml6b250YWxseSgpLmJvdHRvbSgnMCcpLFxuICAgICAgdGVtcGxhdGVDb250ZXh0OiAoKSA9PiAoe2JvdHRvbVNoZWV0UmVmOiByZWZ9KSxcbiAgICAgIHByb3ZpZGVyczogKGNka1JlZiwgX2Nka0NvbmZpZywgY29udGFpbmVyKSA9PiB7XG4gICAgICAgIHJlZiA9IG5ldyBNYXRCb3R0b21TaGVldFJlZihjZGtSZWYsIF9jb25maWcsIGNvbnRhaW5lciBhcyBNYXRCb3R0b21TaGVldENvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAge3Byb3ZpZGU6IE1hdEJvdHRvbVNoZWV0UmVmLCB1c2VWYWx1ZTogcmVmfSxcbiAgICAgICAgICB7cHJvdmlkZTogTUFUX0JPVFRPTV9TSEVFVF9EQVRBLCB1c2VWYWx1ZTogX2NvbmZpZy5kYXRhfSxcbiAgICAgICAgXTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXaGVuIHRoZSBib3R0b20gc2hlZXQgaXMgZGlzbWlzc2VkLCBjbGVhciB0aGUgcmVmZXJlbmNlIHRvIGl0LlxuICAgIHJlZiEuYWZ0ZXJEaXNtaXNzZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgLy8gQ2xlYXIgdGhlIGJvdHRvbSBzaGVldCByZWYgaWYgaXQgaGFzbid0IGFscmVhZHkgYmVlbiByZXBsYWNlZCBieSBhIG5ld2VyIG9uZS5cbiAgICAgIGlmICh0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZiA9PT0gcmVmKSB7XG4gICAgICAgIHRoaXMuX29wZW5lZEJvdHRvbVNoZWV0UmVmID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZikge1xuICAgICAgLy8gSWYgYSBib3R0b20gc2hlZXQgaXMgYWxyZWFkeSBpbiB2aWV3LCBkaXNtaXNzIGl0IGFuZCBlbnRlciB0aGVcbiAgICAgIC8vIG5ldyBib3R0b20gc2hlZXQgYWZ0ZXIgZXhpdCBhbmltYXRpb24gaXMgY29tcGxldGUuXG4gICAgICB0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZi5hZnRlckRpc21pc3NlZCgpLnN1YnNjcmliZSgoKSA9PiByZWYuY29udGFpbmVySW5zdGFuY2U/LmVudGVyKCkpO1xuICAgICAgdGhpcy5fb3BlbmVkQm90dG9tU2hlZXRSZWYuZGlzbWlzcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBubyBib3R0b20gc2hlZXQgaXMgaW4gdmlldywgZW50ZXIgdGhlIG5ldyBib3R0b20gc2hlZXQuXG4gICAgICByZWYhLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3BlbmVkQm90dG9tU2hlZXRSZWYgPSByZWYhO1xuICAgIHJldHVybiByZWYhO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc21pc3NlcyB0aGUgY3VycmVudGx5LXZpc2libGUgYm90dG9tIHNoZWV0LlxuICAgKiBAcGFyYW0gcmVzdWx0IERhdGEgdG8gcGFzcyB0byB0aGUgYm90dG9tIHNoZWV0IGluc3RhbmNlLlxuICAgKi9cbiAgZGlzbWlzczxSID0gYW55PihyZXN1bHQ/OiBSKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29wZW5lZEJvdHRvbVNoZWV0UmVmKSB7XG4gICAgICB0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZi5kaXNtaXNzKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWwpIHtcbiAgICAgIHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWwuZGlzbWlzcygpO1xuICAgIH1cbiAgfVxufVxuIl19
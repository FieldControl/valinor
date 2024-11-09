/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, Optional, } from '@angular/core';
import { MatDialog } from './dialog';
import { _closeDialogVia, MatDialogRef } from './dialog-ref';
import * as i0 from "@angular/core";
import * as i1 from "./dialog-ref";
import * as i2 from "./dialog";
/** Counter used to generate unique IDs for dialog elements. */
let dialogElementUid = 0;
/**
 * Button that will close the current dialog.
 */
export class MatDialogClose {
    constructor(
    // The dialog title directive is always used in combination with a `MatDialogRef`.
    // tslint:disable-next-line: lightweight-tokens
    dialogRef, _elementRef, _dialog) {
        this.dialogRef = dialogRef;
        this._elementRef = _elementRef;
        this._dialog = _dialog;
        /** Default to "button" to prevents accidental form submits. */
        this.type = 'button';
    }
    ngOnInit() {
        if (!this.dialogRef) {
            // When this directive is included in a dialog via TemplateRef (rather than being
            // in a Component), the DialogRef isn't available via injection because embedded
            // views cannot be given a custom injector. Instead, we look up the DialogRef by
            // ID. This must occur in `onInit`, as the ID binding for the dialog container won't
            // be resolved at constructor time.
            this.dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs);
        }
    }
    ngOnChanges(changes) {
        const proxiedChange = changes['_matDialogClose'] || changes['_matDialogCloseResult'];
        if (proxiedChange) {
            this.dialogResult = proxiedChange.currentValue;
        }
    }
    _onButtonClick(event) {
        // Determinate the focus origin using the click event, because using the FocusMonitor will
        // result in incorrect origins. Most of the time, close buttons will be auto focused in the
        // dialog, and therefore clicking the button won't result in a focus change. This means that
        // the FocusMonitor won't detect any origin change, and will always output `program`.
        _closeDialogVia(this.dialogRef, event.screenX === 0 && event.screenY === 0 ? 'keyboard' : 'mouse', this.dialogResult);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogClose, deps: [{ token: i1.MatDialogRef, optional: true }, { token: i0.ElementRef }, { token: i2.MatDialog }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0", type: MatDialogClose, isStandalone: true, selector: "[mat-dialog-close], [matDialogClose]", inputs: { ariaLabel: ["aria-label", "ariaLabel"], type: "type", dialogResult: ["mat-dialog-close", "dialogResult"], _matDialogClose: ["matDialogClose", "_matDialogClose"] }, host: { listeners: { "click": "_onButtonClick($event)" }, properties: { "attr.aria-label": "ariaLabel || null", "attr.type": "type" } }, exportAs: ["matDialogClose"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogClose, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-dialog-close], [matDialogClose]',
                    exportAs: 'matDialogClose',
                    standalone: true,
                    host: {
                        '(click)': '_onButtonClick($event)',
                        '[attr.aria-label]': 'ariaLabel || null',
                        '[attr.type]': 'type',
                    },
                }]
        }], ctorParameters: () => [{ type: i1.MatDialogRef, decorators: [{
                    type: Optional
                }] }, { type: i0.ElementRef }, { type: i2.MatDialog }], propDecorators: { ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], type: [{
                type: Input
            }], dialogResult: [{
                type: Input,
                args: ['mat-dialog-close']
            }], _matDialogClose: [{
                type: Input,
                args: ['matDialogClose']
            }] } });
export class MatDialogLayoutSection {
    constructor(
    // The dialog title directive is always used in combination with a `MatDialogRef`.
    // tslint:disable-next-line: lightweight-tokens
    _dialogRef, _elementRef, _dialog) {
        this._dialogRef = _dialogRef;
        this._elementRef = _elementRef;
        this._dialog = _dialog;
    }
    ngOnInit() {
        if (!this._dialogRef) {
            this._dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs);
        }
        if (this._dialogRef) {
            Promise.resolve().then(() => {
                this._onAdd();
            });
        }
    }
    ngOnDestroy() {
        // Note: we null check because there are some internal
        // tests that are mocking out `MatDialogRef` incorrectly.
        const instance = this._dialogRef?._containerInstance;
        if (instance) {
            Promise.resolve().then(() => {
                this._onRemove();
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogLayoutSection, deps: [{ token: i1.MatDialogRef, optional: true }, { token: i0.ElementRef }, { token: i2.MatDialog }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0", type: MatDialogLayoutSection, isStandalone: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogLayoutSection, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], ctorParameters: () => [{ type: i1.MatDialogRef, decorators: [{
                    type: Optional
                }] }, { type: i0.ElementRef }, { type: i2.MatDialog }] });
/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
export class MatDialogTitle extends MatDialogLayoutSection {
    constructor() {
        super(...arguments);
        this.id = `mat-mdc-dialog-title-${dialogElementUid++}`;
    }
    _onAdd() {
        // Note: we null check the queue, because there are some internal
        // tests that are mocking out `MatDialogRef` incorrectly.
        this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);
    }
    _onRemove() {
        this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogTitle, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0", type: MatDialogTitle, isStandalone: true, selector: "[mat-dialog-title], [matDialogTitle]", inputs: { id: "id" }, host: { properties: { "id": "id" }, classAttribute: "mat-mdc-dialog-title mdc-dialog__title" }, exportAs: ["matDialogTitle"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogTitle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-dialog-title], [matDialogTitle]',
                    exportAs: 'matDialogTitle',
                    standalone: true,
                    host: {
                        'class': 'mat-mdc-dialog-title mdc-dialog__title',
                        '[id]': 'id',
                    },
                }]
        }], propDecorators: { id: [{
                type: Input
            }] } });
/**
 * Scrollable content container of a dialog.
 */
export class MatDialogContent {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogContent, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0", type: MatDialogContent, isStandalone: true, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]", host: { classAttribute: "mat-mdc-dialog-content mdc-dialog__content" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogContent, decorators: [{
            type: Directive,
            args: [{
                    selector: `[mat-dialog-content], mat-dialog-content, [matDialogContent]`,
                    host: { 'class': 'mat-mdc-dialog-content mdc-dialog__content' },
                    standalone: true,
                }]
        }] });
/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
export class MatDialogActions extends MatDialogLayoutSection {
    _onAdd() {
        this._dialogRef._containerInstance?._updateActionSectionCount?.(1);
    }
    _onRemove() {
        this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogActions, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0", type: MatDialogActions, isStandalone: true, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: { align: "align" }, host: { properties: { "class.mat-mdc-dialog-actions-align-start": "align === \"start\"", "class.mat-mdc-dialog-actions-align-center": "align === \"center\"", "class.mat-mdc-dialog-actions-align-end": "align === \"end\"" }, classAttribute: "mat-mdc-dialog-actions mdc-dialog__actions" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatDialogActions, decorators: [{
            type: Directive,
            args: [{
                    selector: `[mat-dialog-actions], mat-dialog-actions, [matDialogActions]`,
                    standalone: true,
                    host: {
                        'class': 'mat-mdc-dialog-actions mdc-dialog__actions',
                        '[class.mat-mdc-dialog-actions-align-start]': 'align === "start"',
                        '[class.mat-mdc-dialog-actions-align-center]': 'align === "center"',
                        '[class.mat-mdc-dialog-actions-align-end]': 'align === "end"',
                    },
                }]
        }], propDecorators: { align: [{
                type: Input
            }] } });
/**
 * Finds the closest MatDialogRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a dialog.
 * @param openDialogs References to the currently-open dialogs.
 */
function getClosestDialog(element, openDialogs) {
    let parent = element.nativeElement.parentElement;
    while (parent && !parent.classList.contains('mat-mdc-dialog-container')) {
        parent = parent.parentElement;
    }
    return parent ? openDialogs.find(dialog => dialog.id === parent.id) : null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRlbnQtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kaWFsb2cvZGlhbG9nLWNvbnRlbnQtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEVBSUwsUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkMsT0FBTyxFQUFDLGVBQWUsRUFBRSxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7QUFFM0QsK0RBQStEO0FBQy9ELElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBRXpCOztHQUVHO0FBV0gsTUFBTSxPQUFPLGNBQWM7SUFZekI7SUFDRSxrRkFBa0Y7SUFDbEYsK0NBQStDO0lBQzVCLFNBQTRCLEVBQ3ZDLFdBQW9DLEVBQ3BDLE9BQWtCO1FBRlAsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFDdkMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ3BDLFlBQU8sR0FBUCxPQUFPLENBQVc7UUFiNUIsK0RBQStEO1FBQ3RELFNBQUksR0FBa0MsUUFBUSxDQUFDO0lBYXJELENBQUM7SUFFSixRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNwQixpRkFBaUY7WUFDakYsZ0ZBQWdGO1lBQ2hGLGdGQUFnRjtZQUNoRixvRkFBb0Y7WUFDcEYsbUNBQW1DO1lBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBRSxDQUFDO1FBQ2pGLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLE1BQU0sYUFBYSxHQUFHLE9B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LDRDQUE0Qzt3QkFDckQsNENBQTRDLEVBQUUsbUJBQW1CO3dCQUNqRSw2Q0FBNkMsRUFBRSxvQkFBb0I7d0JBQ25FLDBDQUEwQyxFQUFFLGlCQUFpQjtxQkFDOUQ7aUJBQ0Y7OEJBS1UsS0FBSztzQkFBYixLQUFLOztBQVdSOzs7O0dBSUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLE9BQWdDLEVBQUUsV0FBZ0M7SUFDMUYsSUFBSSxNQUFNLEdBQXVCLE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDO0lBRXJFLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLENBQUMsRUFBRSxDQUFDO1FBQ3hFLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDOUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TWF0RGlhbG9nfSBmcm9tICcuL2RpYWxvZyc7XG5pbXBvcnQge19jbG9zZURpYWxvZ1ZpYSwgTWF0RGlhbG9nUmVmfSBmcm9tICcuL2RpYWxvZy1yZWYnO1xuXG4vKiogQ291bnRlciB1c2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMgZm9yIGRpYWxvZyBlbGVtZW50cy4gKi9cbmxldCBkaWFsb2dFbGVtZW50VWlkID0gMDtcblxuLyoqXG4gKiBCdXR0b24gdGhhdCB3aWxsIGNsb3NlIHRoZSBjdXJyZW50IGRpYWxvZy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdC1kaWFsb2ctY2xvc2VdLCBbbWF0RGlhbG9nQ2xvc2VdJyxcbiAgZXhwb3J0QXM6ICdtYXREaWFsb2dDbG9zZScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdfb25CdXR0b25DbGljaygkZXZlbnQpJyxcbiAgICAnW2F0dHIuYXJpYS1sYWJlbF0nOiAnYXJpYUxhYmVsIHx8IG51bGwnLFxuICAgICdbYXR0ci50eXBlXSc6ICd0eXBlJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGlhbG9nQ2xvc2UgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcyB7XG4gIC8qKiBTY3JlZW4tcmVhZGVyIGxhYmVsIGZvciB0aGUgYnV0dG9uLiAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWwnKSBhcmlhTGFiZWw6IHN0cmluZztcblxuICAvKiogRGVmYXVsdCB0byBcImJ1dHRvblwiIHRvIHByZXZlbnRzIGFjY2lkZW50YWwgZm9ybSBzdWJtaXRzLiAqL1xuICBASW5wdXQoKSB0eXBlOiAnc3VibWl0JyB8ICdidXR0b24nIHwgJ3Jlc2V0JyA9ICdidXR0b24nO1xuXG4gIC8qKiBEaWFsb2cgY2xvc2UgaW5wdXQuICovXG4gIEBJbnB1dCgnbWF0LWRpYWxvZy1jbG9zZScpIGRpYWxvZ1Jlc3VsdDogYW55O1xuXG4gIEBJbnB1dCgnbWF0RGlhbG9nQ2xvc2UnKSBfbWF0RGlhbG9nQ2xvc2U6IGFueTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvLyBUaGUgZGlhbG9nIHRpdGxlIGRpcmVjdGl2ZSBpcyBhbHdheXMgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYE1hdERpYWxvZ1JlZmAuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBsaWdodHdlaWdodC10b2tlbnNcbiAgICBAT3B0aW9uYWwoKSBwdWJsaWMgZGlhbG9nUmVmOiBNYXREaWFsb2dSZWY8YW55PixcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9kaWFsb2c6IE1hdERpYWxvZyxcbiAgKSB7fVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmICghdGhpcy5kaWFsb2dSZWYpIHtcbiAgICAgIC8vIFdoZW4gdGhpcyBkaXJlY3RpdmUgaXMgaW5jbHVkZWQgaW4gYSBkaWFsb2cgdmlhIFRlbXBsYXRlUmVmIChyYXRoZXIgdGhhbiBiZWluZ1xuICAgICAgLy8gaW4gYSBDb21wb25lbnQpLCB0aGUgRGlhbG9nUmVmIGlzbid0IGF2YWlsYWJsZSB2aWEgaW5qZWN0aW9uIGJlY2F1c2UgZW1iZWRkZWRcbiAgICAgIC8vIHZpZXdzIGNhbm5vdCBiZSBnaXZlbiBhIGN1c3RvbSBpbmplY3Rvci4gSW5zdGVhZCwgd2UgbG9vayB1cCB0aGUgRGlhbG9nUmVmIGJ5XG4gICAgICAvLyBJRC4gVGhpcyBtdXN0IG9jY3VyIGluIGBvbkluaXRgLCBhcyB0aGUgSUQgYmluZGluZyBmb3IgdGhlIGRpYWxvZyBjb250YWluZXIgd29uJ3RcbiAgICAgIC8vIGJlIHJlc29sdmVkIGF0IGNvbnN0cnVjdG9yIHRpbWUuXG4gICAgICB0aGlzLmRpYWxvZ1JlZiA9IGdldENsb3Nlc3REaWFsb2codGhpcy5fZWxlbWVudFJlZiwgdGhpcy5fZGlhbG9nLm9wZW5EaWFsb2dzKSE7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHByb3hpZWRDaGFuZ2UgPSBjaGFuZ2VzWydfbWF0RGlhbG9nQ2xvc2UnXSB8fCBjaGFuZ2VzWydfbWF0RGlhbG9nQ2xvc2VSZXN1bHQnXTtcblxuICAgIGlmIChwcm94aWVkQ2hhbmdlKSB7XG4gICAgICB0aGlzLmRpYWxvZ1Jlc3VsdCA9IHByb3hpZWRDaGFuZ2UuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIF9vbkJ1dHRvbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gRGV0ZXJtaW5hdGUgdGhlIGZvY3VzIG9yaWdpbiB1c2luZyB0aGUgY2xpY2sgZXZlbnQsIGJlY2F1c2UgdXNpbmcgdGhlIEZvY3VzTW9uaXRvciB3aWxsXG4gICAgLy8gcmVzdWx0IGluIGluY29ycmVjdCBvcmlnaW5zLiBNb3N0IG9mIHRoZSB0aW1lLCBjbG9zZSBidXR0b25zIHdpbGwgYmUgYXV0byBmb2N1c2VkIGluIHRoZVxuICAgIC8vIGRpYWxvZywgYW5kIHRoZXJlZm9yZSBjbGlja2luZyB0aGUgYnV0dG9uIHdvbid0IHJlc3VsdCBpbiBhIGZvY3VzIGNoYW5nZS4gVGhpcyBtZWFucyB0aGF0XG4gICAgLy8gdGhlIEZvY3VzTW9uaXRvciB3b24ndCBkZXRlY3QgYW55IG9yaWdpbiBjaGFuZ2UsIGFuZCB3aWxsIGFsd2F5cyBvdXRwdXQgYHByb2dyYW1gLlxuICAgIF9jbG9zZURpYWxvZ1ZpYShcbiAgICAgIHRoaXMuZGlhbG9nUmVmLFxuICAgICAgZXZlbnQuc2NyZWVuWCA9PT0gMCAmJiBldmVudC5zY3JlZW5ZID09PSAwID8gJ2tleWJvYXJkJyA6ICdtb3VzZScsXG4gICAgICB0aGlzLmRpYWxvZ1Jlc3VsdCxcbiAgICApO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoe3N0YW5kYWxvbmU6IHRydWV9KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1hdERpYWxvZ0xheW91dFNlY3Rpb24gaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIFRoZSBkaWFsb2cgdGl0bGUgZGlyZWN0aXZlIGlzIGFsd2F5cyB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYSBgTWF0RGlhbG9nUmVmYC5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGxpZ2h0d2VpZ2h0LXRva2Vuc1xuICAgIEBPcHRpb25hbCgpIHByb3RlY3RlZCBfZGlhbG9nUmVmOiBNYXREaWFsb2dSZWY8YW55PixcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9kaWFsb2c6IE1hdERpYWxvZyxcbiAgKSB7fVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfb25BZGQoKTogdm9pZDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vblJlbW92ZSgpOiB2b2lkO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmICghdGhpcy5fZGlhbG9nUmVmKSB7XG4gICAgICB0aGlzLl9kaWFsb2dSZWYgPSBnZXRDbG9zZXN0RGlhbG9nKHRoaXMuX2VsZW1lbnRSZWYsIHRoaXMuX2RpYWxvZy5vcGVuRGlhbG9ncykhO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9kaWFsb2dSZWYpIHtcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLl9vbkFkZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgLy8gTm90ZTogd2UgbnVsbCBjaGVjayBiZWNhdXNlIHRoZXJlIGFyZSBzb21lIGludGVybmFsXG4gICAgLy8gdGVzdHMgdGhhdCBhcmUgbW9ja2luZyBvdXQgYE1hdERpYWxvZ1JlZmAgaW5jb3JyZWN0bHkuXG4gICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzLl9kaWFsb2dSZWY/Ll9jb250YWluZXJJbnN0YW5jZTtcblxuICAgIGlmIChpbnN0YW5jZSkge1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuX29uUmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUaXRsZSBvZiBhIGRpYWxvZyBlbGVtZW50LiBTdGF5cyBmaXhlZCB0byB0aGUgdG9wIG9mIHRoZSBkaWFsb2cgd2hlbiBzY3JvbGxpbmcuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXQtZGlhbG9nLXRpdGxlXSwgW21hdERpYWxvZ1RpdGxlXScsXG4gIGV4cG9ydEFzOiAnbWF0RGlhbG9nVGl0bGUnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtZGlhbG9nLXRpdGxlIG1kYy1kaWFsb2dfX3RpdGxlJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdERpYWxvZ1RpdGxlIGV4dGVuZHMgTWF0RGlhbG9nTGF5b3V0U2VjdGlvbiB7XG4gIEBJbnB1dCgpIGlkOiBzdHJpbmcgPSBgbWF0LW1kYy1kaWFsb2ctdGl0bGUtJHtkaWFsb2dFbGVtZW50VWlkKyt9YDtcblxuICBwcm90ZWN0ZWQgX29uQWRkKCkge1xuICAgIC8vIE5vdGU6IHdlIG51bGwgY2hlY2sgdGhlIHF1ZXVlLCBiZWNhdXNlIHRoZXJlIGFyZSBzb21lIGludGVybmFsXG4gICAgLy8gdGVzdHMgdGhhdCBhcmUgbW9ja2luZyBvdXQgYE1hdERpYWxvZ1JlZmAgaW5jb3JyZWN0bHkuXG4gICAgdGhpcy5fZGlhbG9nUmVmLl9jb250YWluZXJJbnN0YW5jZT8uX2FkZEFyaWFMYWJlbGxlZEJ5Py4odGhpcy5pZCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX29uUmVtb3ZlKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpYWxvZ1JlZj8uX2NvbnRhaW5lckluc3RhbmNlPy5fcmVtb3ZlQXJpYUxhYmVsbGVkQnk/Lih0aGlzLmlkKTtcbiAgfVxufVxuXG4vKipcbiAqIFNjcm9sbGFibGUgY29udGVudCBjb250YWluZXIgb2YgYSBkaWFsb2cuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogYFttYXQtZGlhbG9nLWNvbnRlbnRdLCBtYXQtZGlhbG9nLWNvbnRlbnQsIFttYXREaWFsb2dDb250ZW50XWAsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LW1kYy1kaWFsb2ctY29udGVudCBtZGMtZGlhbG9nX19jb250ZW50J30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdERpYWxvZ0NvbnRlbnQge31cblxuLyoqXG4gKiBDb250YWluZXIgZm9yIHRoZSBib3R0b20gYWN0aW9uIGJ1dHRvbnMgaW4gYSBkaWFsb2cuXG4gKiBTdGF5cyBmaXhlZCB0byB0aGUgYm90dG9tIHdoZW4gc2Nyb2xsaW5nLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6IGBbbWF0LWRpYWxvZy1hY3Rpb25zXSwgbWF0LWRpYWxvZy1hY3Rpb25zLCBbbWF0RGlhbG9nQWN0aW9uc11gLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtZGlhbG9nLWFjdGlvbnMgbWRjLWRpYWxvZ19fYWN0aW9ucycsXG4gICAgJ1tjbGFzcy5tYXQtbWRjLWRpYWxvZy1hY3Rpb25zLWFsaWduLXN0YXJ0XSc6ICdhbGlnbiA9PT0gXCJzdGFydFwiJyxcbiAgICAnW2NsYXNzLm1hdC1tZGMtZGlhbG9nLWFjdGlvbnMtYWxpZ24tY2VudGVyXSc6ICdhbGlnbiA9PT0gXCJjZW50ZXJcIicsXG4gICAgJ1tjbGFzcy5tYXQtbWRjLWRpYWxvZy1hY3Rpb25zLWFsaWduLWVuZF0nOiAnYWxpZ24gPT09IFwiZW5kXCInLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBNYXREaWFsb2dBY3Rpb25zIGV4dGVuZHMgTWF0RGlhbG9nTGF5b3V0U2VjdGlvbiB7XG4gIC8qKlxuICAgKiBIb3Jpem9udGFsIGFsaWdubWVudCBvZiBhY3Rpb24gYnV0dG9ucy5cbiAgICovXG4gIEBJbnB1dCgpIGFsaWduPzogJ3N0YXJ0JyB8ICdjZW50ZXInIHwgJ2VuZCc7XG5cbiAgcHJvdGVjdGVkIF9vbkFkZCgpIHtcbiAgICB0aGlzLl9kaWFsb2dSZWYuX2NvbnRhaW5lckluc3RhbmNlPy5fdXBkYXRlQWN0aW9uU2VjdGlvbkNvdW50Py4oMSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX29uUmVtb3ZlKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpYWxvZ1JlZi5fY29udGFpbmVySW5zdGFuY2U/Ll91cGRhdGVBY3Rpb25TZWN0aW9uQ291bnQ/LigtMSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgY2xvc2VzdCBNYXREaWFsb2dSZWYgdG8gYW4gZWxlbWVudCBieSBsb29raW5nIGF0IHRoZSBET00uXG4gKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IHJlbGF0aXZlIHRvIHdoaWNoIHRvIGxvb2sgZm9yIGEgZGlhbG9nLlxuICogQHBhcmFtIG9wZW5EaWFsb2dzIFJlZmVyZW5jZXMgdG8gdGhlIGN1cnJlbnRseS1vcGVuIGRpYWxvZ3MuXG4gKi9cbmZ1bmN0aW9uIGdldENsb3Nlc3REaWFsb2coZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIG9wZW5EaWFsb2dzOiBNYXREaWFsb2dSZWY8YW55PltdKSB7XG4gIGxldCBwYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnQubmF0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50O1xuXG4gIHdoaWxlIChwYXJlbnQgJiYgIXBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdC1tZGMtZGlhbG9nLWNvbnRhaW5lcicpKSB7XG4gICAgcGFyZW50ID0gcGFyZW50LnBhcmVudEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gcGFyZW50ID8gb3BlbkRpYWxvZ3MuZmluZChkaWFsb2cgPT4gZGlhbG9nLmlkID09PSBwYXJlbnQhLmlkKSA6IG51bGw7XG59XG4iXX0=
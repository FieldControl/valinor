"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.unprefixedRemovedVariables = exports.removedMaterialVariables = exports.cdkMixins = exports.cdkVariables = exports.materialVariables = exports.materialFunctions = exports.materialMixins = void 0;
/** Mapping of Material mixins that should be renamed. */
exports.materialMixins = {
    'mat-core': 'core',
    'mat-core-color': 'core-color',
    'mat-core-theme': 'core-theme',
    'angular-material-theme': 'all-component-themes',
    'angular-material-typography': 'all-component-typographies',
    'angular-material-color': 'all-component-colors',
    'mat-base-typography': 'typography-hierarchy',
    'mat-typography-level-to-styles': 'typography-level',
    'mat-elevation': 'elevation',
    'mat-overridable-elevation': 'overridable-elevation',
    'mat-elevation-transition': 'elevation-transition',
    'mat-ripple': 'ripple',
    'mat-ripple-color': 'ripple-color',
    'mat-ripple-theme': 'ripple-theme',
    'mat-strong-focus-indicators': 'strong-focus-indicators',
    'mat-strong-focus-indicators-color': 'strong-focus-indicators-color',
    'mat-strong-focus-indicators-theme': 'strong-focus-indicators-theme',
    'mat-font-shorthand': 'font-shorthand',
    // The expansion panel is a special case, because the package is called `expansion`, but the
    // mixins were prefixed with `expansion-panel`. This was corrected by the Sass module migration.
    'mat-expansion-panel-theme': 'expansion-theme',
    'mat-expansion-panel-color': 'expansion-color',
    'mat-expansion-panel-typography': 'expansion-typography',
};
// The component themes all follow the same pattern so we can spare ourselves some typing.
[
    'option', 'optgroup', 'pseudo-checkbox', 'autocomplete', 'badge', 'bottom-sheet', 'button',
    'button-toggle', 'card', 'checkbox', 'chips', 'divider', 'table', 'datepicker', 'dialog',
    'grid-list', 'icon', 'input', 'list', 'menu', 'paginator', 'progress-bar', 'progress-spinner',
    'radio', 'select', 'sidenav', 'slide-toggle', 'slider', 'stepper', 'sort', 'tabs', 'toolbar',
    'tooltip', 'snack-bar', 'form-field', 'tree'
].forEach(name => {
    exports.materialMixins[`mat-${name}-theme`] = `${name}-theme`;
    exports.materialMixins[`mat-${name}-color`] = `${name}-color`;
    exports.materialMixins[`mat-${name}-typography`] = `${name}-typography`;
});
/** Mapping of Material functions that should be renamed. */
exports.materialFunctions = {
    'mat-color': 'get-color-from-palette',
    'mat-contrast': 'get-contrast-color-from-palette',
    'mat-palette': 'define-palette',
    'mat-dark-theme': 'define-dark-theme',
    'mat-light-theme': 'define-light-theme',
    'mat-typography-level': 'define-typography-level',
    'mat-typography-config': 'define-typography-config',
    'mat-font-size': 'font-size',
    'mat-line-height': 'line-height',
    'mat-font-weight': 'font-weight',
    'mat-letter-spacing': 'letter-spacing',
    'mat-font-family': 'font-family',
};
/** Mapping of Material variables that should be renamed. */
exports.materialVariables = {
    'mat-light-theme-background': 'light-theme-background-palette',
    'mat-dark-theme-background': 'dark-theme-background-palette',
    'mat-light-theme-foreground': 'light-theme-foreground-palette',
    'mat-dark-theme-foreground': 'dark-theme-foreground-palette',
};
// The palettes all follow the same pattern.
[
    'red', 'pink', 'indigo', 'purple', 'deep-purple', 'blue', 'light-blue', 'cyan', 'teal', 'green',
    'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'gray',
    'blue-grey', 'blue-gray'
].forEach(name => exports.materialVariables[`mat-${name}`] = `${name}-palette`);
/** Mapping of CDK variables that should be renamed. */
exports.cdkVariables = {
    'cdk-z-index-overlay-container': 'overlay-container-z-index',
    'cdk-z-index-overlay': 'overlay-z-index',
    'cdk-z-index-overlay-backdrop': 'overlay-backdrop-z-index',
    'cdk-overlay-dark-backdrop-background': 'overlay-backdrop-color',
};
/** Mapping of CDK mixins that should be renamed. */
exports.cdkMixins = {
    'cdk-overlay': 'overlay',
    'cdk-a11y': 'a11y-visually-hidden',
    'cdk-high-contrast': 'high-contrast',
    'cdk-text-field-autofill-color': 'text-field-autofill-color',
    // This one was split up into two mixins which is trickier to
    // migrate so for now we forward to the deprecated variant.
    'cdk-text-field': 'text-field',
};
/**
 * Material variables that have been removed from the public API
 * and which should be replaced with their values.
 */
exports.removedMaterialVariables = {
    // Note: there's also a usage of a variable called `$pi`, but the name is short enough that
    // it matches things like `$mat-pink`. Don't migrate it since it's unlikely to be used.
    'mat-xsmall': 'max-width: 599px',
    'mat-small': 'max-width: 959px',
    'mat-toggle-padding': '8px',
    'mat-toggle-size': '20px',
    'mat-linear-out-slow-in-timing-function': 'cubic-bezier(0, 0, 0.2, 0.1)',
    'mat-fast-out-slow-in-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'mat-fast-out-linear-in-timing-function': 'cubic-bezier(0.4, 0, 1, 1)',
    'mat-elevation-transition-duration': '280ms',
    'mat-elevation-transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'mat-elevation-color': '#000',
    'mat-elevation-opacity': '1',
    'mat-elevation-prefix': `'mat-elevation-z'`,
    'mat-ripple-color-opacity': '0.1',
    'mat-badge-font-size': '12px',
    'mat-badge-font-weight': '600',
    'mat-badge-default-size': '22px',
    'mat-badge-small-size': '16px',
    'mat-badge-large-size': '28px',
    'mat-button-toggle-standard-height': '48px',
    'mat-button-toggle-standard-minimum-height': '24px',
    'mat-button-toggle-standard-maximum-height': '48px',
    'mat-chip-remove-font-size': '18px',
    'mat-datepicker-selected-today-box-shadow-width': '1px',
    'mat-datepicker-selected-fade-amount': '0.6',
    'mat-datepicker-range-fade-amount': '0.2',
    'mat-datepicker-today-fade-amount': '0.2',
    'mat-calendar-body-font-size': '13px',
    'mat-calendar-weekday-table-font-size': '11px',
    'mat-expansion-panel-header-collapsed-height': '48px',
    'mat-expansion-panel-header-collapsed-minimum-height': '36px',
    'mat-expansion-panel-header-collapsed-maximum-height': '48px',
    'mat-expansion-panel-header-expanded-height': '64px',
    'mat-expansion-panel-header-expanded-minimum-height': '48px',
    'mat-expansion-panel-header-expanded-maximum-height': '64px',
    'mat-expansion-panel-header-transition': '225ms cubic-bezier(0.4, 0, 0.2, 1)',
    'mat-paginator-height': '56px',
    'mat-paginator-minimum-height': '40px',
    'mat-paginator-maximum-height': '56px',
    'mat-stepper-header-height': '72px',
    'mat-stepper-header-minimum-height': '42px',
    'mat-stepper-header-maximum-height': '72px',
    'mat-stepper-label-header-height': '24px',
    'mat-stepper-label-position-bottom-top-gap': '16px',
    'mat-stepper-label-min-width': '50px',
    'mat-vertical-stepper-content-margin': '36px',
    'mat-stepper-side-gap': '24px',
    'mat-stepper-line-width': '1px',
    'mat-stepper-line-gap': '8px',
    'mat-step-sub-label-font-size': '12px',
    'mat-step-header-icon-size': '16px',
    'mat-toolbar-minimum-height': '44px',
    'mat-toolbar-height-desktop': '64px',
    'mat-toolbar-maximum-height-desktop': '64px',
    'mat-toolbar-minimum-height-desktop': '44px',
    'mat-toolbar-height-mobile': '56px',
    'mat-toolbar-maximum-height-mobile': '56px',
    'mat-toolbar-minimum-height-mobile': '44px',
    'mat-tooltip-target-height': '22px',
    'mat-tooltip-font-size': '10px',
    'mat-tooltip-vertical-padding': '6px',
    'mat-tooltip-handset-target-height': '30px',
    'mat-tooltip-handset-font-size': '14px',
    'mat-tooltip-handset-vertical-padding': '8px',
    'mat-tree-node-height': '48px',
    'mat-tree-node-minimum-height': '24px',
    'mat-tree-node-maximum-height': '48px',
};
/**
 * Material variables **without a `mat-` prefix** that have been removed from the public API
 * and which should be replaced with their values. These should be migrated only when there's a
 * Material import, because their names could conflict with other variables in the user's app.
 */
exports.unprefixedRemovedVariables = {
    'z-index-fab': '20',
    'z-index-drawer': '100',
    'ease-in-out-curve-function': 'cubic-bezier(0.35, 0, 0.25, 1)',
    'swift-ease-out-duration': '400ms',
    'swift-ease-out-timing-function': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
    'swift-ease-out': 'all 400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
    'swift-ease-in-duration': '300ms',
    'swift-ease-in-timing-function': 'cubic-bezier(0.55, 0, 0.55, 0.2)',
    'swift-ease-in': 'all 300ms cubic-bezier(0.55, 0, 0.55, 0.2)',
    'swift-ease-in-out-duration': '500ms',
    'swift-ease-in-out-timing-function': 'cubic-bezier(0.35, 0, 0.25, 1)',
    'swift-ease-in-out': 'all 500ms cubic-bezier(0.35, 0, 0.25, 1)',
    'swift-linear-duration': '80ms',
    'swift-linear-timing-function': 'linear',
    'swift-linear': 'all 80ms linear',
    'black-87-opacity': 'rgba(black, 0.87)',
    'white-87-opacity': 'rgba(white, 0.87)',
    'black-12-opacity': 'rgba(black, 0.12)',
    'white-12-opacity': 'rgba(white, 0.12)',
    'black-6-opacity': 'rgba(black, 0.06)',
    'white-6-opacity': 'rgba(white, 0.06)',
    'dark-primary-text': 'rgba(black, 0.87)',
    'dark-secondary-text': 'rgba(black, 0.54)',
    'dark-disabled-text': 'rgba(black, 0.38)',
    'dark-dividers': 'rgba(black, 0.12)',
    'dark-focused': 'rgba(black, 0.12)',
    'light-primary-text': 'white',
    'light-secondary-text': 'rgba(white, 0.7)',
    'light-disabled-text': 'rgba(white, 0.5)',
    'light-dividers': 'rgba(white, 0.12)',
    'light-focused': 'rgba(white, 0.12)',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NjaGVtYXRpY3MvbmctdXBkYXRlL21pZ3JhdGlvbnMvdGhlbWluZy1hcGktdjEyL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx5REFBeUQ7QUFDNUMsUUFBQSxjQUFjLEdBQTJCO0lBQ3BELFVBQVUsRUFBRSxNQUFNO0lBQ2xCLGdCQUFnQixFQUFFLFlBQVk7SUFDOUIsZ0JBQWdCLEVBQUUsWUFBWTtJQUM5Qix3QkFBd0IsRUFBRSxzQkFBc0I7SUFDaEQsNkJBQTZCLEVBQUUsNEJBQTRCO0lBQzNELHdCQUF3QixFQUFFLHNCQUFzQjtJQUNoRCxxQkFBcUIsRUFBRSxzQkFBc0I7SUFDN0MsZ0NBQWdDLEVBQUUsa0JBQWtCO0lBQ3BELGVBQWUsRUFBRSxXQUFXO0lBQzVCLDJCQUEyQixFQUFFLHVCQUF1QjtJQUNwRCwwQkFBMEIsRUFBRSxzQkFBc0I7SUFDbEQsWUFBWSxFQUFFLFFBQVE7SUFDdEIsa0JBQWtCLEVBQUUsY0FBYztJQUNsQyxrQkFBa0IsRUFBRSxjQUFjO0lBQ2xDLDZCQUE2QixFQUFFLHlCQUF5QjtJQUN4RCxtQ0FBbUMsRUFBRSwrQkFBK0I7SUFDcEUsbUNBQW1DLEVBQUUsK0JBQStCO0lBQ3BFLG9CQUFvQixFQUFFLGdCQUFnQjtJQUN0Qyw0RkFBNEY7SUFDNUYsZ0dBQWdHO0lBQ2hHLDJCQUEyQixFQUFFLGlCQUFpQjtJQUM5QywyQkFBMkIsRUFBRSxpQkFBaUI7SUFDOUMsZ0NBQWdDLEVBQUUsc0JBQXNCO0NBQ3pELENBQUM7QUFFRiwwRkFBMEY7QUFDMUY7SUFDRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVE7SUFDMUYsZUFBZSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVB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LDhCQUE4QixFQUFFLFFBQVE7SUFDeEMsY0FBYyxFQUFFLGlCQUFpQjtJQUNqQyxrQkFBa0IsRUFBRSxtQkFBbUI7SUFDdkMsa0JBQWtCLEVBQUUsbUJBQW1CO0lBQ3ZDLGtCQUFrQixFQUFFLG1CQUFtQjtJQUN2QyxrQkFBa0IsRUFBRSxtQkFBbUI7SUFDdkMsaUJBQWlCLEVBQUUsbUJBQW1CO0lBQ3RDLGlCQUFpQixFQUFFLG1CQUFtQjtJQUN0QyxtQkFBbUIsRUFBRSxtQkFBbUI7SUFDeEMscUJBQXFCLEVBQUUsbUJBQW1CO0lBQzFDLG9CQUFvQixFQUFFLG1CQUFtQjtJQUN6QyxlQUFlLEVBQUUsbUJBQW1CO0lBQ3BDLGNBQWMsRUFBRSxtQkFBbUI7SUFDbkMsb0JBQW9CLEVBQUUsT0FBTztJQUM3QixzQkFBc0IsRUFBRSxrQkFBa0I7SUFDMUMscUJBQXFCLEVBQUUsa0JBQWtCO0lBQ3pDLGdCQUFnQixFQUFFLG1CQUFtQjtJQUNyQyxlQUFlLEVBQUUsbUJBQW1CO0NBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqIE1hcHBpbmcgb2YgTWF0ZXJpYWwgbWl4aW5zIHRoYXQgc2hvdWxkIGJlIHJlbmFtZWQuICovXG5leHBvcnQgY29uc3QgbWF0ZXJpYWxNaXhpbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICdtYXQtY29yZSc6ICdjb3JlJyxcbiAgJ21hdC1jb3JlLWNvbG9yJzogJ2NvcmUtY29sb3InLFxuICAnbWF0LWNvcmUtdGhlbWUnOiAnY29yZS10aGVtZScsXG4gICdhbmd1bGFyLW1hdGVyaWFsLXRoZW1lJzogJ2FsbC1jb21wb25lbnQtdGhlbWVzJyxcbiAgJ2FuZ3VsYXItbWF0ZXJpYWwtdHlwb2dyYXBoeSc6ICdhbGwtY29tcG9uZW50LXR5cG9ncmFwaGllcycsXG4gICdhbmd1bGFyLW1hdGVyaWFsLWNvbG9yJzogJ2FsbC1jb21wb25lbnQtY29sb3JzJyxcbiAgJ21hdC1iYXNlLXR5cG9ncmFwaHknOiAndHlwb2dyYXBoeS1oaWVyYXJjaHknLFxuICAnbWF0LXR5cG9ncmFwaHktbGV2ZWwtdG8tc3R5bGVzJzogJ3R5cG9ncmFwaHktbGV2ZWwnLFxuICAnbWF0LWVsZXZhdGlvbic6ICdlbGV2YXRpb24nLFxuICAnbWF0LW92ZXJyaWRhYmxlLWVsZXZhdGlvbic6ICdvdmVycmlkYWJsZS1lbGV2YXRpb24nLFxuICAnbWF0LWVsZXZhdGlvbi10cmFuc2l0aW9uJzogJ2VsZXZhdGlvbi10cmFuc2l0aW9uJyxcbiAgJ21hdC1yaXBwbGUnOiAncmlwcGxlJyxcbiAgJ21hdC1yaXBwbGUtY29sb3InOiAncmlwcGxlLWNvbG9yJyxcbiAgJ21hdC1yaXBwbGUtdGhlbWUnOiAncmlwcGxlLXRoZW1lJyxcbiAgJ21hdC1zdHJvbmctZm9jdXMtaW5kaWNhdG9ycyc6ICdzdHJvbmctZm9jdXMtaW5kaWNhdG9ycycsXG4gICdtYXQtc3Ryb25nLWZvY3VzLWluZGljYXRvcnMtY29sb3InOiAnc3Ryb25nLWZvY3VzLWluZGljYXRvcnMtY29sb3InLFxuICAnbWF0LXN0cm9uZy1mb2N1cy1pbmRpY2F0b3JzLXRoZW1lJzogJ3N0cm9uZy1mb2N1cy1pbmRpY2F0b3JzLXRoZW1lJyxcbiAgJ21hdC1mb250LXNob3J0aGFuZCc6ICdmb250LXNob3J0aGFuZCcsXG4gIC8vIFRoZSBleHBhbnNpb24gcGFuZWwgaXMgYSBzcGVjaWFsIGNhc2UsIGJlY2F1c2UgdGhlIHBhY2thZ2UgaXMgY2FsbGVkIGBleHBhbnNpb25gLCBidXQgdGhlXG4gIC8vIG1peGlucyB3ZXJlIHByZWZpeGVkIHdpdGggYGV4cGFuc2lvbi1wYW5lbGAuIFRoaXMgd2FzIGNvcnJlY3RlZCBieSB0aGUgU2FzcyBtb2R1bGUgbWlncmF0aW9uLlxuICAnbWF0LWV4cGFuc2lvbi1wYW5lbC10aGVtZSc6ICdleHBhbnNpb24tdGhlbWUnLFxuICAnbWF0LWV4cGFuc2lvbi1wYW5lbC1jb2xvcic6ICdleHBhbnNpb24tY29sb3InLFxuICAnbWF0LWV4cGFuc2lvbi1wYW5lbC10eXBvZ3JhcGh5JzogJ2V4cGFuc2lvbi10eXBvZ3JhcGh5Jyxcbn07XG5cbi8vIFRoZSBjb21wb25lbnQgdGhlbWVzIGFsbCBmb2xsb3cgdGhlIHNhbWUgcGF0dGVybiBzbyB3ZSBjYW4gc3BhcmUgb3Vyc2VsdmVzIHNvbWUgdHlwaW5nLlxuW1xuICAnb3B0aW9uJywgJ29wdGdyb3VwJywgJ3BzZXVkby1jaGVja2JveCcsICdhdXRvY29tcGxldGUnLCAnYmFkZ2UnLCAnYm90dG9tLXNoZWV0JywgJ2J1dHRvbicsXG4gICdidXR0b24tdG9nZ2xlJywgJ2NhcmQnLCAnY2hlY2tib3gnLCAnY2hpcHMnLCAnZGl2aWRlcicsICd0YWJsZScsICdkYXRlcGlja2VyJywgJ2RpYWxvZycsXG4gICdncmlkLWxpc3QnLCAnaWNvbicsICdpbnB1dCcsICdsaXN0JywgJ21lbnUnLCAncGFnaW5hdG9yJywgJ3Byb2dyZXNzLWJhcicsICdwcm9ncmVzcy1zcGlubmVyJyxcbiAgJ3JhZGlvJywgJ3NlbGVjdCcsICdzaWRlbmF2JywgJ3NsaWRlLXRvZ2dsZScsICdzbGlkZXInLCAnc3RlcHBlcicsICdzb3J0JywgJ3RhYnMnLCAndG9vbGJhcicsXG4gICd0b29sdGlwJywgJ3NuYWNrLWJhcicsICdmb3JtLWZpZWxkJywgJ3RyZWUnXG5dLmZvckVhY2gobmFtZSA9PiB7XG4gIG1hdGVyaWFsTWl4aW5zW2BtYXQtJHtuYW1lfS10aGVtZWBdID0gYCR7bmFtZX0tdGhlbWVgO1xuICBtYXRlcmlhbE1peGluc1tgbWF0LSR7bmFtZX0tY29sb3JgXSA9IGAke25hbWV9LWNvbG9yYDtcbiAgbWF0ZXJpYWxNaXhpbnNbYG1hdC0ke25hbWV9LXR5cG9ncmFwaHlgXSA9IGAke25hbWV9LXR5cG9ncmFwaHlgO1xufSk7XG5cbi8qKiBNYXBwaW5nIG9mIE1hdGVyaWFsIGZ1bmN0aW9ucyB0aGF0IHNob3VsZCBiZSByZW5hbWVkLiAqL1xuZXhwb3J0IGNvbnN0IG1hdGVyaWFsRnVuY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnbWF0LWNvbG9yJzogJ2dldC1jb2xvci1mcm9tLXBhbGV0dGUnLFxuICAnbWF0LWNvbnRyYXN0JzogJ2dldC1jb250cmFzdC1jb2xvci1mcm9tLXBhbGV0dGUnLFxuICAnbWF0LXBhbGV0dGUnOiAnZGVmaW5lLXBhbGV0dGUnLFxuICAnbWF0LWRhcmstdGhlbWUnOiAnZGVmaW5lLWRhcmstdGhlbWUnLFxuICAnbWF0LWxpZ2h0LXRoZW1lJzogJ2RlZmluZS1saWdodC10aGVtZScsXG4gICdtYXQtdHlwb2dyYXBoeS1sZXZlbCc6ICdkZWZpbmUtdHlwb2dyYXBoeS1sZXZlbCcsXG4gICdtYXQtdHlwb2dyYXBoeS1jb25maWcnOiAnZGVmaW5lLXR5cG9ncmFwaHktY29uZmlnJyxcbiAgJ21hdC1mb250LXNpemUnOiAnZm9udC1zaXplJyxcbiAgJ21hdC1saW5lLWhlaWdodCc6ICdsaW5lLWhlaWdodCcsXG4gICdtYXQtZm9udC13ZWlnaHQnOiAnZm9udC13ZWlnaHQnLFxuICAnbWF0LWxldHRlci1zcGFjaW5nJzogJ2xldHRlci1zcGFjaW5nJyxcbiAgJ21hdC1mb250LWZhbWlseSc6ICdmb250LWZhbWlseScsXG59O1xuXG4vKiogTWFwcGluZyBvZiBNYXRlcmlhbCB2YXJpYWJsZXMgdGhhdCBzaG91bGQgYmUgcmVuYW1lZC4gKi9cbmV4cG9ydCBjb25zdCBtYXRlcmlhbFZhcmlhYmxlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ21hdC1saWdodC10aGVtZS1iYWNrZ3JvdW5kJzogJ2xpZ2h0LXRoZW1lLWJhY2tncm91bmQtcGFsZXR0ZScsXG4gICdtYXQtZGFyay10aGVtZS1iYWNrZ3JvdW5kJzogJ2RhcmstdGhlbWUtYmFja2dyb3VuZC1wYWxldHRlJyxcbiAgJ21hdC1saWdodC10aGVtZS1mb3JlZ3JvdW5kJzogJ2xpZ2h0LXRoZW1lLWZvcmVncm91bmQtcGFsZXR0ZScsXG4gICdtYXQtZGFyay10aGVtZS1mb3JlZ3JvdW5kJzogJ2RhcmstdGhlbWUtZm9yZWdyb3VuZC1wYWxldHRlJyxcbn07XG5cbi8vIFRoZSBwYWxldHRlcyBhbGwgZm9sbG93IHRoZSBzYW1lIHBhdHRlcm4uXG5bXG4gICdyZWQnLCAncGluaycsICdpbmRpZ28nLCAncHVycGxlJywgJ2RlZXAtcHVycGxlJywgJ2JsdWUnLCAnbGlnaHQtYmx1ZScsICdjeWFuJywgJ3RlYWwnLCAnZ3JlZW4nLFxuICAnbGlnaHQtZ3JlZW4nLCAnbGltZScsICd5ZWxsb3cnLCAnYW1iZXInLCAnb3JhbmdlJywgJ2RlZXAtb3JhbmdlJywgJ2Jyb3duJywgJ2dyZXknLCAnZ3JheScsXG4gICdibHVlLWdyZXknLCAnYmx1ZS1ncmF5J1xuXS5mb3JFYWNoKG5hbWUgPT4gbWF0ZXJpYWxWYXJpYWJsZXNbYG1hdC0ke25hbWV9YF0gPSBgJHtuYW1lfS1wYWxldHRlYCk7XG5cbi8qKiBNYXBwaW5nIG9mIENESyB2YXJpYWJsZXMgdGhhdCBzaG91bGQgYmUgcmVuYW1lZC4gKi9cbmV4cG9ydCBjb25zdCBjZGtWYXJpYWJsZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICdjZGstei1pbmRleC1vdmVybGF5LWNvbnRhaW5lcic6ICdvdmVybGF5LWNvbnRhaW5lci16LWluZGV4JyxcbiAgJ2Nkay16LWluZGV4LW92ZXJsYXknOiAnb3ZlcmxheS16LWluZGV4JyxcbiAgJ2Nkay16LWluZGV4LW92ZXJsYXktYmFja2Ryb3AnOiAnb3ZlcmxheS1iYWNrZHJvcC16LWluZGV4JyxcbiAgJ2Nkay1vdmVybGF5LWRhcmstYmFja2Ryb3AtYmFja2dyb3VuZCc6ICdvdmVybGF5LWJhY2tkcm9wLWNvbG9yJyxcbn07XG5cbi8qKiBNYXBwaW5nIG9mIENESyBtaXhpbnMgdGhhdCBzaG91bGQgYmUgcmVuYW1lZC4gKi9cbmV4cG9ydCBjb25zdCBjZGtNaXhpbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICdjZGstb3ZlcmxheSc6ICdvdmVybGF5JyxcbiAgJ2Nkay1hMTF5JzogJ2ExMXktdmlzdWFsbHktaGlkZGVuJyxcbiAgJ2Nkay1oaWdoLWNvbnRyYXN0JzogJ2hpZ2gtY29udHJhc3QnLFxuICAnY2RrLXRleHQtZmllbGQtYXV0b2ZpbGwtY29sb3InOiAndGV4dC1maWVsZC1hdXRvZmlsbC1jb2xvcicsXG4gIC8vIFRoaXMgb25lIHdhcyBzcGxpdCB1cCBpbnRvIHR3byBtaXhpbnMgd2hpY2ggaXMgdHJpY2tpZXIgdG9cbiAgLy8gbWlncmF0ZSBzbyBmb3Igbm93IHdlIGZvcndhcmQgdG8gdGhlIGRlcHJlY2F0ZWQgdmFyaWFudC5cbiAgJ2Nkay10ZXh0LWZpZWxkJzogJ3RleHQtZmllbGQnLFxufTtcblxuLyoqXG4gKiBNYXRlcmlhbCB2YXJpYWJsZXMgdGhhdCBoYXZlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBwdWJsaWMgQVBJXG4gKiBhbmQgd2hpY2ggc2hvdWxkIGJlIHJlcGxhY2VkIHdpdGggdGhlaXIgdmFsdWVzLlxuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlZE1hdGVyaWFsVmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAvLyBOb3RlOiB0aGVyZSdzIGFsc28gYSB1c2FnZSBvZiBhIHZhcmlhYmxlIGNhbGxlZCBgJHBpYCwgYnV0IHRoZSBuYW1lIGlzIHNob3J0IGVub3VnaCB0aGF0XG4gIC8vIGl0IG1hdGNoZXMgdGhpbmdzIGxpa2UgYCRtYXQtcGlua2AuIERvbid0IG1pZ3JhdGUgaXQgc2luY2UgaXQncyB1bmxpa2VseSB0byBiZSB1c2VkLlxuICAnbWF0LXhzbWFsbCc6ICdtYXgtd2lkdGg6IDU5OXB4JyxcbiAgJ21hdC1zbWFsbCc6ICdtYXgtd2lkdGg6IDk1OXB4JyxcbiAgJ21hdC10b2dnbGUtcGFkZGluZyc6ICc4cHgnLFxuICAnbWF0LXRvZ2dsZS1zaXplJzogJzIwcHgnLFxuICAnbWF0LWxpbmVhci1vdXQtc2xvdy1pbi10aW1pbmctZnVuY3Rpb24nOiAnY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMC4xKScsXG4gICdtYXQtZmFzdC1vdXQtc2xvdy1pbi10aW1pbmctZnVuY3Rpb24nOiAnY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKScsXG4gICdtYXQtZmFzdC1vdXQtbGluZWFyLWluLXRpbWluZy1mdW5jdGlvbic6ICdjdWJpYy1iZXppZXIoMC40LCAwLCAxLCAxKScsXG4gICdtYXQtZWxldmF0aW9uLXRyYW5zaXRpb24tZHVyYXRpb24nOiAnMjgwbXMnLFxuICAnbWF0LWVsZXZhdGlvbi10cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbic6ICdjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpJyxcbiAgJ21hdC1lbGV2YXRpb24tY29sb3InOiAnIzAwMCcsXG4gICdtYXQtZWxldmF0aW9uLW9wYWNpdHknOiAnMScsXG4gICdtYXQtZWxldmF0aW9uLXByZWZpeCc6IGAnbWF0LWVsZXZhdGlvbi16J2AsXG4gICdtYXQtcmlwcGxlLWNvbG9yLW9wYWNpdHknOiAnMC4xJyxcbiAgJ21hdC1iYWRnZS1mb250LXNpemUnOiAnMTJweCcsXG4gICdtYXQtYmFkZ2UtZm9udC13ZWlnaHQnOiAnNjAwJyxcbiAgJ21hdC1iYWRnZS1kZWZhdWx0LXNpemUnOiAnMjJweCcsXG4gICdtYXQtYmFkZ2Utc21hbGwtc2l6ZSc6ICcxNnB4JyxcbiAgJ21hdC1iYWRnZS1sYXJnZS1zaXplJzogJzI4cHgnLFxuICAnbWF0LWJ1dHRvbi10b2dnbGUtc3RhbmRhcmQtaGVpZ2h0JzogJzQ4cHgnLFxuICAnbWF0LWJ1dHRvbi10b2dnbGUtc3RhbmRhcmQtbWluaW11bS1oZWlnaHQnOiAnMjRweCcsXG4gICdtYXQtYnV0dG9uLXRvZ2dsZS1zdGFuZGFyZC1tYXhpbXVtLWhlaWdodCc6ICc0OHB4JyxcbiAgJ21hdC1jaGlwLXJlbW92ZS1mb250LXNpemUnOiAnMThweCcsXG4gICdtYXQtZGF0ZXBpY2tlci1zZWxlY3RlZC10b2RheS1ib3gtc2hhZG93LXdpZHRoJzogJzFweCcsXG4gICdtYXQtZGF0ZXBpY2tlci1zZWxlY3RlZC1mYWRlLWFtb3VudCc6ICcwLjYnLFxuICAnbWF0LWRhdGVwaWNrZXItcmFuZ2UtZmFkZS1hbW91bnQnOiAnMC4yJyxcbiAgJ21hdC1kYXRlcGlja2VyLXRvZGF5LWZhZGUtYW1vdW50JzogJzAuMicsXG4gICdtYXQtY2FsZW5kYXItYm9keS1mb250LXNpemUnOiAnMTNweCcsXG4gICdtYXQtY2FsZW5kYXItd2Vla2RheS10YWJsZS1mb250LXNpemUnOiAnMTFweCcsXG4gICdtYXQtZXhwYW5zaW9uLXBhbmVsLWhlYWRlci1jb2xsYXBzZWQtaGVpZ2h0JzogJzQ4cHgnLFxuICAnbWF0LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXItY29sbGFwc2VkLW1pbmltdW0taGVpZ2h0JzogJzM2cHgnLFxuICAnbWF0LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXItY29sbGFwc2VkLW1heGltdW0taGVpZ2h0JzogJzQ4cHgnLFxuICAnbWF0LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXItZXhwYW5kZWQtaGVpZ2h0JzogJzY0cHgnLFxuICAnbWF0LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXItZXhwYW5kZWQtbWluaW11bS1oZWlnaHQnOiAnNDhweCcsXG4gICdtYXQtZXhwYW5zaW9uLXBhbmVsLWhlYWRlci1leHBhbmRlZC1tYXhpbXVtLWhlaWdodCc6ICc2NHB4JyxcbiAgJ21hdC1leHBhbnNpb24tcGFuZWwtaGVhZGVyLXRyYW5zaXRpb24nOiAnMjI1bXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKScsXG4gICdtYXQtcGFnaW5hdG9yLWhlaWdodCc6ICc1NnB4JyxcbiAgJ21hdC1wYWdpbmF0b3ItbWluaW11bS1oZWlnaHQnOiAnNDBweCcsXG4gICdtYXQtcGFnaW5hdG9yLW1heGltdW0taGVpZ2h0JzogJzU2cHgnLFxuICAnbWF0LXN0ZXBwZXItaGVhZGVyLWhlaWdodCc6ICc3MnB4JyxcbiAgJ21hdC1zdGVwcGVyLWhlYWRlci1taW5pbXVtLWhlaWdodCc6ICc0MnB4JyxcbiAgJ21hdC1zdGVwcGVyLWhlYWRlci1tYXhpbXVtLWhlaWdodCc6ICc3MnB4JyxcbiAgJ21hdC1zdGVwcGVyLWxhYmVsLWhlYWRlci1oZWlnaHQnOiAnMjRweCcsXG4gICdtYXQtc3RlcHBlci1sYWJlbC1wb3NpdGlvbi1ib3R0b20tdG9wLWdhcCc6ICcxNnB4JyxcbiAgJ21hdC1zdGVwcGVyLWxhYmVsLW1pbi13aWR0aCc6ICc1MHB4JyxcbiAgJ21hdC12ZXJ0aWNhbC1zdGVwcGVyLWNvbnRlbnQtbWFyZ2luJzogJzM2cHgnLFxuICAnbWF0LXN0ZXBwZXItc2lkZS1nYXAnOiAnMjRweCcsXG4gICdtYXQtc3RlcHBlci1saW5lLXdpZHRoJzogJzFweCcsXG4gICdtYXQtc3RlcHBlci1saW5lLWdhcCc6ICc4cHgnLFxuICAnbWF0LXN0ZXAtc3ViLWxhYmVsLWZvbnQtc2l6ZSc6ICcxMnB4JyxcbiAgJ21hdC1zdGVwLWhlYWRlci1pY29uLXNpemUnOiAnMTZweCcsXG4gICdtYXQtdG9vbGJhci1taW5pbXVtLWhlaWdodCc6ICc0NHB4JyxcbiAgJ21hdC10b29sYmFyLWhlaWdodC1kZXNrdG9wJzogJzY0cHgnLFxuICAnbWF0LXRvb2xiYXItbWF4aW11bS1oZWlnaHQtZGVza3RvcCc6ICc2NHB4JyxcbiAgJ21hdC10b29sYmFyLW1pbmltdW0taGVpZ2h0LWRlc2t0b3AnOiAnNDRweCcsXG4gICdtYXQtdG9vbGJhci1oZWlnaHQtbW9iaWxlJzogJzU2cHgnLFxuICAnbWF0LXRvb2xiYXItbWF4aW11bS1oZWlnaHQtbW9iaWxlJzogJzU2cHgnLFxuICAnbWF0LXRvb2xiYXItbWluaW11bS1oZWlnaHQtbW9iaWxlJzogJzQ0cHgnLFxuICAnbWF0LXRvb2x0aXAtdGFyZ2V0LWhlaWdodCc6ICcyMnB4JyxcbiAgJ21hdC10b29sdGlwLWZvbnQtc2l6ZSc6ICcxMHB4JyxcbiAgJ21hdC10b29sdGlwLXZlcnRpY2FsLXBhZGRpbmcnOiAnNnB4JyxcbiAgJ21hdC10b29sdGlwLWhhbmRzZXQtdGFyZ2V0LWhlaWdodCc6ICczMHB4JyxcbiAgJ21hdC10b29sdGlwLWhhbmRzZXQtZm9udC1zaXplJzogJzE0cHgnLFxuICAnbWF0LXRvb2x0aXAtaGFuZHNldC12ZXJ0aWNhbC1wYWRkaW5nJzogJzhweCcsXG4gICdtYXQtdHJlZS1ub2RlLWhlaWdodCc6ICc0OHB4JyxcbiAgJ21hdC10cmVlLW5vZGUtbWluaW11bS1oZWlnaHQnOiAnMjRweCcsXG4gICdtYXQtdHJlZS1ub2RlLW1heGltdW0taGVpZ2h0JzogJzQ4cHgnLFxufTtcblxuLyoqXG4gKiBNYXRlcmlhbCB2YXJpYWJsZXMgKip3aXRob3V0IGEgYG1hdC1gIHByZWZpeCoqIHRoYXQgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgcHVibGljIEFQSVxuICogYW5kIHdoaWNoIHNob3VsZCBiZSByZXBsYWNlZCB3aXRoIHRoZWlyIHZhbHVlcy4gVGhlc2Ugc2hvdWxkIGJlIG1pZ3JhdGVkIG9ubHkgd2hlbiB0aGVyZSdzIGFcbiAqIE1hdGVyaWFsIGltcG9ydCwgYmVjYXVzZSB0aGVpciBuYW1lcyBjb3VsZCBjb25mbGljdCB3aXRoIG90aGVyIHZhcmlhYmxlcyBpbiB0aGUgdXNlcidzIGFwcC5cbiAqL1xuZXhwb3J0IGNvbnN0IHVucHJlZml4ZWRSZW1vdmVkVmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnei1pbmRleC1mYWInOiAnMjAnLFxuICAnei1pbmRleC1kcmF3ZXInOiAnMTAwJyxcbiAgJ2Vhc2UtaW4tb3V0LWN1cnZlLWZ1bmN0aW9uJzogJ2N1YmljLWJlemllcigwLjM1LCAwLCAwLjI1LCAxKScsXG4gICdzd2lmdC1lYXNlLW91dC1kdXJhdGlvbic6ICc0MDBtcycsXG4gICdzd2lmdC1lYXNlLW91dC10aW1pbmctZnVuY3Rpb24nOiAnY3ViaWMtYmV6aWVyKDAuMjUsIDAuOCwgMC4yNSwgMSknLFxuICAnc3dpZnQtZWFzZS1vdXQnOiAnYWxsIDQwMG1zIGN1YmljLWJlemllcigwLjI1LCAwLjgsIDAuMjUsIDEpJyxcbiAgJ3N3aWZ0LWVhc2UtaW4tZHVyYXRpb24nOiAnMzAwbXMnLFxuICAnc3dpZnQtZWFzZS1pbi10aW1pbmctZnVuY3Rpb24nOiAnY3ViaWMtYmV6aWVyKDAuNTUsIDAsIDAuNTUsIDAuMiknLFxuICAnc3dpZnQtZWFzZS1pbic6ICdhbGwgMzAwbXMgY3ViaWMtYmV6aWVyKDAuNTUsIDAsIDAuNTUsIDAuMiknLFxuICAnc3dpZnQtZWFzZS1pbi1vdXQtZHVyYXRpb24nOiAnNTAwbXMnLFxuICAnc3dpZnQtZWFzZS1pbi1vdXQtdGltaW5nLWZ1bmN0aW9uJzogJ2N1YmljLWJlemllcigwLjM1LCAwLCAwLjI1LCAxKScsXG4gICdzd2lmdC1lYXNlLWluLW91dCc6ICdhbGwgNTAwbXMgY3ViaWMtYmV6aWVyKDAuMzUsIDAsIDAuMjUsIDEpJyxcbiAgJ3N3aWZ0LWxpbmVhci1kdXJhdGlvbic6ICc4MG1zJyxcbiAgJ3N3aWZ0LWxpbmVhci10aW1pbmctZnVuY3Rpb24nOiAnbGluZWFyJyxcbiAgJ3N3aWZ0LWxpbmVhcic6ICdhbGwgODBtcyBsaW5lYXInLFxuICAnYmxhY2stODctb3BhY2l0eSc6ICdyZ2JhKGJsYWNrLCAwLjg3KScsXG4gICd3aGl0ZS04Ny1vcGFjaXR5JzogJ3JnYmEod2hpdGUsIDAuODcpJyxcbiAgJ2JsYWNrLTEyLW9wYWNpdHknOiAncmdiYShibGFjaywgMC4xMiknLFxuICAnd2hpdGUtMTItb3BhY2l0eSc6ICdyZ2JhKHdoaXRlLCAwLjEyKScsXG4gICdibGFjay02LW9wYWNpdHknOiAncmdiYShibGFjaywgMC4wNiknLFxuICAnd2hpdGUtNi1vcGFjaXR5JzogJ3JnYmEod2hpdGUsIDAuMDYpJyxcbiAgJ2RhcmstcHJpbWFyeS10ZXh0JzogJ3JnYmEoYmxhY2ssIDAuODcpJyxcbiAgJ2Rhcmstc2Vjb25kYXJ5LXRleHQnOiAncmdiYShibGFjaywgMC41NCknLFxuICAnZGFyay1kaXNhYmxlZC10ZXh0JzogJ3JnYmEoYmxhY2ssIDAuMzgpJyxcbiAgJ2RhcmstZGl2aWRlcnMnOiAncmdiYShibGFjaywgMC4xMiknLFxuICAnZGFyay1mb2N1c2VkJzogJ3JnYmEoYmxhY2ssIDAuMTIpJyxcbiAgJ2xpZ2h0LXByaW1hcnktdGV4dCc6ICd3aGl0ZScsXG4gICdsaWdodC1zZWNvbmRhcnktdGV4dCc6ICdyZ2JhKHdoaXRlLCAwLjcpJyxcbiAgJ2xpZ2h0LWRpc2FibGVkLXRleHQnOiAncmdiYSh3aGl0ZSwgMC41KScsXG4gICdsaWdodC1kaXZpZGVycyc6ICdyZ2JhKHdoaXRlLCAwLjEyKScsXG4gICdsaWdodC1mb2N1c2VkJzogJ3JnYmEod2hpdGUsIDAuMTIpJyxcbn07XG4iXX0=
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, Inject, Optional, Input, HostListener, } from '@angular/core';
import { mixinDisabled, mixinDisableRipple, } from '@angular/material/core';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MAT_MENU_PANEL } from './menu-panel';
// Boilerplate for applying mixins to MatMenuItem.
/** @docs-private */
class MatMenuItemBase {
}
const _MatMenuItemMixinBase = mixinDisableRipple(mixinDisabled(MatMenuItemBase));
/**
 * Single item inside of a `mat-menu`. Provides the menu item styling and accessibility treatment.
 */
export class MatMenuItem extends _MatMenuItemMixinBase {
    constructor(_elementRef, 
    /**
     * @deprecated `_document` parameter is no longer being used and will be removed.
     * @breaking-change 12.0.0
     */
    _document, _focusMonitor, _parentMenu) {
        // @breaking-change 8.0.0 make `_focusMonitor` and `document` required params.
        super();
        this._elementRef = _elementRef;
        this._focusMonitor = _focusMonitor;
        this._parentMenu = _parentMenu;
        /** ARIA role for the menu item. */
        this.role = 'menuitem';
        /** Stream that emits when the menu item is hovered. */
        this._hovered = new Subject();
        /** Stream that emits when the menu item is focused. */
        this._focused = new Subject();
        /** Whether the menu item is highlighted. */
        this._highlighted = false;
        /** Whether the menu item acts as a trigger for a sub-menu. */
        this._triggersSubmenu = false;
        if (_parentMenu && _parentMenu.addItem) {
            _parentMenu.addItem(this);
        }
    }
    /** Focuses the menu item. */
    focus(origin, options) {
        if (this._focusMonitor && origin) {
            this._focusMonitor.focusVia(this._getHostElement(), origin, options);
        }
        else {
            this._getHostElement().focus(options);
        }
        this._focused.next(this);
    }
    ngAfterViewInit() {
        if (this._focusMonitor) {
            // Start monitoring the element so it gets the appropriate focused classes. We want
            // to show the focus style for menu items only when the focus was not caused by a
            // mouse or touch interaction.
            this._focusMonitor.monitor(this._elementRef, false);
        }
    }
    ngOnDestroy() {
        if (this._focusMonitor) {
            this._focusMonitor.stopMonitoring(this._elementRef);
        }
        if (this._parentMenu && this._parentMenu.removeItem) {
            this._parentMenu.removeItem(this);
        }
        this._hovered.complete();
        this._focused.complete();
    }
    /** Used to set the `tabindex`. */
    _getTabIndex() {
        return this.disabled ? '-1' : '0';
    }
    /** Returns the host DOM element. */
    _getHostElement() {
        return this._elementRef.nativeElement;
    }
    /** Prevents the default element actions if it is disabled. */
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    _checkDisabled(event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    /** Emits to the hover stream. */
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    _handleMouseEnter() {
        this._hovered.next(this);
    }
    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel() {
        var _a, _b;
        const clone = this._elementRef.nativeElement.cloneNode(true);
        const icons = clone.querySelectorAll('mat-icon, .material-icons');
        // Strip away icons so they don't show up in the text.
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            (_a = icon.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(icon);
        }
        return ((_b = clone.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
    }
}
MatMenuItem.decorators = [
    { type: Component, args: [{
                selector: '[mat-menu-item]',
                exportAs: 'matMenuItem',
                inputs: ['disabled', 'disableRipple'],
                host: {
                    '[attr.role]': 'role',
                    '[class.mat-menu-item]': 'true',
                    '[class.mat-menu-item-highlighted]': '_highlighted',
                    '[class.mat-menu-item-submenu-trigger]': '_triggersSubmenu',
                    '[attr.tabindex]': '_getTabIndex()',
                    '[attr.aria-disabled]': 'disabled.toString()',
                    '[attr.disabled]': 'disabled || null',
                    'class': 'mat-focus-indicator',
                },
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                template: "<ng-content></ng-content>\n<div class=\"mat-menu-ripple\" matRipple\n     [matRippleDisabled]=\"disableRipple || disabled\"\n     [matRippleTrigger]=\"_getHostElement()\">\n</div>\n"
            },] }
];
MatMenuItem.ctorParameters = () => [
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: FocusMonitor },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_MENU_PANEL,] }, { type: Optional }] }
];
MatMenuItem.propDecorators = {
    role: [{ type: Input }],
    _checkDisabled: [{ type: HostListener, args: ['click', ['$event'],] }],
    _handleMouseEnter: [{ type: HostListener, args: ['mouseenter',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL21lbnUvbWVudS1pdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBa0IsWUFBWSxFQUFjLE1BQU0sbUJBQW1CLENBQUM7QUFFN0UsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUVWLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sUUFBUSxFQUNSLEtBQUssRUFDTCxZQUFZLEdBRWIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUdMLGFBQWEsRUFDYixrQkFBa0IsR0FDbkIsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsY0FBYyxFQUFlLE1BQU0sY0FBYyxDQUFDO0FBRTFELGtEQUFrRDtBQUNsRCxvQkFBb0I7QUFDcEIsTUFBTSxlQUFlO0NBQUc7QUFDeEIsTUFBTSxxQkFBcUIsR0FDdkIsa0JBQWtCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFFdkQ7O0dBRUc7QUFtQkgsTUFBTSxPQUFPLFdBQVksU0FBUSxxQkFBcUI7SUFrQnBELFlBQ1UsV0FBb0M7SUFDNUM7OztPQUdHO0lBQ2UsU0FBZSxFQUN6QixhQUE0QixFQUNPLFdBQXVDO1FBRWxGLDhFQUE4RTtRQUM5RSxLQUFLLEVBQUUsQ0FBQztRQVZBLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQU1wQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUNPLGdCQUFXLEdBQVgsV0FBVyxDQUE0QjtRQXZCcEYsbUNBQW1DO1FBQzFCLFNBQUksR0FBc0QsVUFBVSxDQUFDO1FBRTlFLHVEQUF1RDtRQUM5QyxhQUFRLEdBQXlC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LE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBQSxJQUFJLENBQUMsVUFBVSwwQ0FBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEM7UUFFRCxPQUFPLENBQUEsTUFBQSxLQUFLLENBQUMsV0FBVywwQ0FBRSxJQUFJLEVBQUUsS0FBSSxFQUFFLENBQUM7SUFDekMsQ0FBQzs7O1lBdElGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixRQUFRLEVBQUUsYUFBYTtnQkFDdkIsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQztnQkFDckMsSUFBSSxFQUFFO29CQUNKLGFBQWEsRUFBRSxNQUFNO29CQUNyQix1QkFBdUIsRUFBRSxNQUFNO29CQUMvQixtQ0FBbUMsRUFBRSxjQUFjO29CQUNuRCx1Q0FBdUMsRUFBRSxrQkFBa0I7b0JBQzNELGlCQUFpQixFQUFFLGdCQUFnQjtvQkFDbkMsc0JBQXNCLEVBQUUscUJBQXFCO29CQUM3QyxpQkFBaUIsRUFBRSxrQkFBa0I7b0JBQ3JDLE9BQU8sRUFBRSxxQkFBcUI7aUJBQy9CO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtnQkFDckMsaU1BQTZCO2FBQzlCOzs7WUE3Q0MsVUFBVTs0Q0FzRVAsTUFBTSxTQUFDLFFBQVE7WUEzRUssWUFBWTs0Q0E2RWhDLE1BQU0sU0FBQyxjQUFjLGNBQUcsUUFBUTs7O21CQXRCbEMsS0FBSzs2QkFpRkwsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztnQ0FjaEMsWUFBWSxTQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtGb2N1c2FibGVPcHRpb24sIEZvY3VzTW9uaXRvciwgRm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Qm9vbGVhbklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgT25EZXN0cm95LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgSW5wdXQsXG4gIEhvc3RMaXN0ZW5lcixcbiAgQWZ0ZXJWaWV3SW5pdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBDYW5EaXNhYmxlLCBDYW5EaXNhYmxlQ3RvcixcbiAgQ2FuRGlzYWJsZVJpcHBsZSwgQ2FuRGlzYWJsZVJpcHBsZUN0b3IsXG4gIG1peGluRGlzYWJsZWQsXG4gIG1peGluRGlzYWJsZVJpcHBsZSxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7TUFUX01FTlVfUEFORUwsIE1hdE1lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBNYXRNZW51SXRlbS5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5jbGFzcyBNYXRNZW51SXRlbUJhc2Uge31cbmNvbnN0IF9NYXRNZW51SXRlbU1peGluQmFzZTogQ2FuRGlzYWJsZVJpcHBsZUN0b3IgJiBDYW5EaXNhYmxlQ3RvciAmIHR5cGVvZiBNYXRNZW51SXRlbUJhc2UgPVxuICAgIG1peGluRGlzYWJsZVJpcHBsZShtaXhpbkRpc2FibGVkKE1hdE1lbnVJdGVtQmFzZSkpO1xuXG4vKipcbiAqIFNpbmdsZSBpdGVtIGluc2lkZSBvZiBhIGBtYXQtbWVudWAuIFByb3ZpZGVzIHRoZSBtZW51IGl0ZW0gc3R5bGluZyBhbmQgYWNjZXNzaWJpbGl0eSB0cmVhdG1lbnQuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ1ttYXQtbWVudS1pdGVtXScsXG4gIGV4cG9ydEFzOiAnbWF0TWVudUl0ZW0nLFxuICBpbnB1dHM6IFsnZGlzYWJsZWQnLCAnZGlzYWJsZVJpcHBsZSddLFxuICBob3N0OiB7XG4gICAgJ1thdHRyLnJvbGVdJzogJ3JvbGUnLFxuICAgICdbY2xhc3MubWF0LW1lbnUtaXRlbV0nOiAndHJ1ZScsXG4gICAgJ1tjbGFzcy5tYXQtbWVudS1pdGVtLWhpZ2hsaWdodGVkXSc6ICdfaGlnaGxpZ2h0ZWQnLFxuICAgICdbY2xhc3MubWF0LW1lbnUtaXRlbS1zdWJtZW51LXRyaWdnZXJdJzogJ190cmlnZ2Vyc1N1Ym1lbnUnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZC50b1N0cmluZygpJyxcbiAgICAnW2F0dHIuZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICAgICdjbGFzcyc6ICdtYXQtZm9jdXMtaW5kaWNhdG9yJyxcbiAgfSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHRlbXBsYXRlVXJsOiAnbWVudS1pdGVtLmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRNZW51SXRlbSBleHRlbmRzIF9NYXRNZW51SXRlbU1peGluQmFzZVxuICAgIGltcGxlbWVudHMgRm9jdXNhYmxlT3B0aW9uLCBDYW5EaXNhYmxlLCBDYW5EaXNhYmxlUmlwcGxlLCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuXG4gIC8qKiBBUklBIHJvbGUgZm9yIHRoZSBtZW51IGl0ZW0uICovXG4gIEBJbnB1dCgpIHJvbGU6ICdtZW51aXRlbScgfCAnbWVudWl0ZW1yYWRpbycgfCAnbWVudWl0ZW1jaGVja2JveCcgPSAnbWVudWl0ZW0nO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIHRoZSBtZW51IGl0ZW0gaXMgaG92ZXJlZC4gKi9cbiAgcmVhZG9ubHkgX2hvdmVyZWQ6IFN1YmplY3Q8TWF0TWVudUl0ZW0+ID0gbmV3IFN1YmplY3Q8TWF0TWVudUl0ZW0+KCk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gdGhlIG1lbnUgaXRlbSBpcyBmb2N1c2VkLiAqL1xuICByZWFkb25seSBfZm9jdXNlZCA9IG5ldyBTdWJqZWN0PE1hdE1lbnVJdGVtPigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gaXMgaGlnaGxpZ2h0ZWQuICovXG4gIF9oaWdobGlnaHRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gYWN0cyBhcyBhIHRyaWdnZXIgZm9yIGEgc3ViLW1lbnUuICovXG4gIF90cmlnZ2Vyc1N1Ym1lbnU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBgX2RvY3VtZW50YCBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIGJlaW5nIHVzZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgKiBAYnJlYWtpbmctY2hhbmdlIDEyLjAuMFxuICAgICAqL1xuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudD86IGFueSxcbiAgICBwcml2YXRlIF9mb2N1c01vbml0b3I/OiBGb2N1c01vbml0b3IsXG4gICAgQEluamVjdChNQVRfTUVOVV9QQU5FTCkgQE9wdGlvbmFsKCkgcHVibGljIF9wYXJlbnRNZW51PzogTWF0TWVudVBhbmVsPE1hdE1lbnVJdGVtPikge1xuXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSA4LjAuMCBtYWtlIGBfZm9jdXNNb25pdG9yYCBhbmQgYGRvY3VtZW50YCByZXF1aXJlZCBwYXJhbXMuXG4gICAgc3VwZXIoKTtcblxuICAgIGlmIChfcGFyZW50TWVudSAmJiBfcGFyZW50TWVudS5hZGRJdGVtKSB7XG4gICAgICBfcGFyZW50TWVudS5hZGRJdGVtKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBtZW51IGl0ZW0uICovXG4gIGZvY3VzKG9yaWdpbj86IEZvY3VzT3JpZ2luLCBvcHRpb25zPzogRm9jdXNPcHRpb25zKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2ZvY3VzTW9uaXRvciAmJiBvcmlnaW4pIHtcbiAgICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5mb2N1c1ZpYSh0aGlzLl9nZXRIb3N0RWxlbWVudCgpLCBvcmlnaW4sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRIb3N0RWxlbWVudCgpLmZvY3VzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRoaXMuX2ZvY3VzZWQubmV4dCh0aGlzKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICBpZiAodGhpcy5fZm9jdXNNb25pdG9yKSB7XG4gICAgICAvLyBTdGFydCBtb25pdG9yaW5nIHRoZSBlbGVtZW50IHNvIGl0IGdldHMgdGhlIGFwcHJvcHJpYXRlIGZvY3VzZWQgY2xhc3Nlcy4gV2Ugd2FudFxuICAgICAgLy8gdG8gc2hvdyB0aGUgZm9jdXMgc3R5bGUgZm9yIG1lbnUgaXRlbXMgb25seSB3aGVuIHRoZSBmb2N1cyB3YXMgbm90IGNhdXNlZCBieSBhXG4gICAgICAvLyBtb3VzZSBvciB0b3VjaCBpbnRlcmFjdGlvbi5cbiAgICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5tb25pdG9yKHRoaXMuX2VsZW1lbnRSZWYsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fZm9jdXNNb25pdG9yKSB7XG4gICAgICB0aGlzLl9mb2N1c01vbml0b3Iuc3RvcE1vbml0b3JpbmcodGhpcy5fZWxlbWVudFJlZik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BhcmVudE1lbnUgJiYgdGhpcy5fcGFyZW50TWVudS5yZW1vdmVJdGVtKSB7XG4gICAgICB0aGlzLl9wYXJlbnRNZW51LnJlbW92ZUl0ZW0odGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5faG92ZXJlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2ZvY3VzZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBVc2VkIHRvIHNldCB0aGUgYHRhYmluZGV4YC4gKi9cbiAgX2dldFRhYkluZGV4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgPyAnLTEnIDogJzAnO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGhvc3QgRE9NIGVsZW1lbnQuICovXG4gIF9nZXRIb3N0RWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgfVxuXG4gIC8qKiBQcmV2ZW50cyB0aGUgZGVmYXVsdCBlbGVtZW50IGFjdGlvbnMgaWYgaXQgaXMgZGlzYWJsZWQuICovXG4gIC8vIFdlIGhhdmUgdG8gdXNlIGEgYEhvc3RMaXN0ZW5lcmAgaGVyZSBpbiBvcmRlciB0byBzdXBwb3J0IGJvdGggSXZ5IGFuZCBWaWV3RW5naW5lLlxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBiaW5kaW5ncyB3aWxsIGJlIG1lcmdlZCB3aGVuIHRoaXMgY2xhc3MgaXMgZXh0ZW5kZWQsIHdoZXJlYXMgaW5cbiAgLy8gVmlld0VuZ2luZSB0aGV5J3JlIG92ZXJ3cml0dGVuLlxuICAvLyBUT0RPKGNyaXNiZXRvKTogd2UgbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAgb25jZSBJdnkgaXMgdHVybmVkIG9uIGJ5IGRlZmF1bHQuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50J10pXG4gIF9jaGVja0Rpc2FibGVkKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEVtaXRzIHRvIHRoZSBob3ZlciBzdHJlYW0uICovXG4gIC8vIFdlIGhhdmUgdG8gdXNlIGEgYEhvc3RMaXN0ZW5lcmAgaGVyZSBpbiBvcmRlciB0byBzdXBwb3J0IGJvdGggSXZ5IGFuZCBWaWV3RW5naW5lLlxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBiaW5kaW5ncyB3aWxsIGJlIG1lcmdlZCB3aGVuIHRoaXMgY2xhc3MgaXMgZXh0ZW5kZWQsIHdoZXJlYXMgaW5cbiAgLy8gVmlld0VuZ2luZSB0aGV5J3JlIG92ZXJ3cml0dGVuLlxuICAvLyBUT0RPKGNyaXNiZXRvKTogd2UgbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAgb25jZSBJdnkgaXMgdHVybmVkIG9uIGJ5IGRlZmF1bHQuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdtb3VzZWVudGVyJylcbiAgX2hhbmRsZU1vdXNlRW50ZXIoKSB7XG4gICAgdGhpcy5faG92ZXJlZC5uZXh0KHRoaXMpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxhYmVsIHRvIGJlIHVzZWQgd2hlbiBkZXRlcm1pbmluZyB3aGV0aGVyIHRoZSBvcHRpb24gc2hvdWxkIGJlIGZvY3VzZWQuICovXG4gIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgY29uc3QgY2xvbmUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnN0IGljb25zID0gY2xvbmUucXVlcnlTZWxlY3RvckFsbCgnbWF0LWljb24sIC5tYXRlcmlhbC1pY29ucycpO1xuXG4gICAgLy8gU3RyaXAgYXdheSBpY29ucyBzbyB0aGV5IGRvbid0IHNob3cgdXAgaW4gdGhlIHRleHQuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpY29ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaWNvbiA9IGljb25zW2ldO1xuICAgICAgaWNvbi5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChpY29uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xvbmUudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZVJpcHBsZTogQm9vbGVhbklucHV0O1xufVxuIl19
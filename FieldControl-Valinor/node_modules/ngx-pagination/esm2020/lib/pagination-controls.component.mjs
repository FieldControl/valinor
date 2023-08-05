import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { DEFAULT_TEMPLATE, DEFAULT_STYLES } from './template';
import * as i0 from "@angular/core";
import * as i1 from "./pagination-controls.directive";
import * as i2 from "@angular/common";
function coerceToBoolean(input) {
    return !!input && input !== 'false';
}
/**
 * The default pagination controls component. Actually just a default implementation of a custom template.
 */
export class PaginationControlsComponent {
    constructor() {
        this.maxSize = 7;
        this.previousLabel = 'Previous';
        this.nextLabel = 'Next';
        this.screenReaderPaginationLabel = 'Pagination';
        this.screenReaderPageLabel = 'page';
        this.screenReaderCurrentLabel = `You're on page`;
        this.pageChange = new EventEmitter();
        this.pageBoundsCorrection = new EventEmitter();
        this._directionLinks = true;
        this._autoHide = false;
        this._responsive = false;
    }
    get directionLinks() {
        return this._directionLinks;
    }
    set directionLinks(value) {
        this._directionLinks = coerceToBoolean(value);
    }
    get autoHide() {
        return this._autoHide;
    }
    set autoHide(value) {
        this._autoHide = coerceToBoolean(value);
    }
    get responsive() {
        return this._responsive;
    }
    set responsive(value) {
        this._responsive = coerceToBoolean(value);
    }
    trackByIndex(index) {
        return index;
    }
}
PaginationControlsComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginationControlsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
PaginationControlsComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.3.9", type: PaginationControlsComponent, selector: "pagination-controls", inputs: { id: "id", maxSize: "maxSize", directionLinks: "directionLinks", autoHide: "autoHide", responsive: "responsive", previousLabel: "previousLabel", nextLabel: "nextLabel", screenReaderPaginationLabel: "screenReaderPaginationLabel", screenReaderPageLabel: "screenReaderPageLabel", screenReaderCurrentLabel: "screenReaderCurrentLabel" }, outputs: { pageChange: "pageChange", pageBoundsCorrection: "pageBoundsCorrection" }, ngImport: i0, template: "\n    <pagination-template  #p=\"paginationApi\"\n                         [id]=\"id\"\n                         [maxSize]=\"maxSize\"\n                         (pageChange)=\"pageChange.emit($event)\"\n                         (pageBoundsCorrection)=\"pageBoundsCorrection.emit($event)\">\n    <nav role=\"navigation\" [attr.aria-label]=\"screenReaderPaginationLabel\">\n    <ul class=\"ngx-pagination\" \n        [class.responsive]=\"responsive\"\n        *ngIf=\"!(autoHide && p.pages.length <= 1)\">\n\n        <li class=\"pagination-previous\" [class.disabled]=\"p.isFirstPage()\" *ngIf=\"directionLinks\"> \n            <a tabindex=\"0\" *ngIf=\"1 < p.getCurrent()\" (keyup.enter)=\"p.previous()\" (click)=\"p.previous()\">\n                {{ previousLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </a>\n            <span *ngIf=\"p.isFirstPage()\" aria-disabled=\"true\">\n                {{ previousLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </span>\n        </li> \n\n        <li class=\"small-screen\">\n            {{ p.getCurrent() }} / {{ p.getLastPage() }}\n        </li>\n\n        <li [class.current]=\"p.getCurrent() === page.value\" \n            [class.ellipsis]=\"page.label === '...'\"\n            *ngFor=\"let page of p.pages; trackBy: trackByIndex\">\n            <a tabindex=\"0\" (keyup.enter)=\"p.setCurrent(page.value)\" (click)=\"p.setCurrent(page.value)\" *ngIf=\"p.getCurrent() !== page.value\">\n                <span class=\"show-for-sr\">{{ screenReaderPageLabel }} </span>\n                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span>\n            </a>\n            <ng-container *ngIf=\"p.getCurrent() === page.value\">\n              <span aria-live=\"polite\">\n                <span class=\"show-for-sr\">{{ screenReaderCurrentLabel }} </span>\n                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span> \n              </span>\n            </ng-container>\n        </li>\n\n        <li class=\"pagination-next\" [class.disabled]=\"p.isLastPage()\" *ngIf=\"directionLinks\">\n            <a tabindex=\"0\" *ngIf=\"!p.isLastPage()\" (keyup.enter)=\"p.next()\" (click)=\"p.next()\">\n                 {{ nextLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </a>\n            <span *ngIf=\"p.isLastPage()\" aria-disabled=\"true\">\n                 {{ nextLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </span>\n        </li>\n\n    </ul>\n    </nav>\n    </pagination-template>\n    ", isInline: true, styles: [".ngx-pagination{margin-left:0;margin-bottom:1rem}.ngx-pagination:before,.ngx-pagination:after{content:\" \";display:table}.ngx-pagination:after{clear:both}.ngx-pagination li{-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;margin-right:.0625rem;border-radius:0}.ngx-pagination li{display:inline-block}.ngx-pagination a,.ngx-pagination button{color:#0a0a0a;display:block;padding:.1875rem .625rem;border-radius:0}.ngx-pagination a:hover,.ngx-pagination button:hover{background:#e6e6e6}.ngx-pagination .current{padding:.1875rem .625rem;background:#2199e8;color:#fefefe;cursor:default}.ngx-pagination .disabled{padding:.1875rem .625rem;color:#cacaca;cursor:default}.ngx-pagination .disabled:hover{background:transparent}.ngx-pagination a,.ngx-pagination button{cursor:pointer}.ngx-pagination .pagination-previous a:before,.ngx-pagination .pagination-previous.disabled:before{content:\"\\ab\";display:inline-block;margin-right:.5rem}.ngx-pagination .pagination-next a:after,.ngx-pagination .pagination-next.disabled:after{content:\"\\bb\";display:inline-block;margin-left:.5rem}.ngx-pagination .show-for-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.ngx-pagination .small-screen{display:none}@media screen and (max-width: 601px){.ngx-pagination.responsive .small-screen{display:inline-block}.ngx-pagination.responsive li:not(.small-screen):not(.pagination-previous):not(.pagination-next){display:none}}\n"], directives: [{ type: i1.PaginationControlsDirective, selector: "pagination-template,[pagination-template]", inputs: ["id", "maxSize"], outputs: ["pageChange", "pageBoundsCorrection"], exportAs: ["paginationApi"] }, { type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], pipes: { "number": i2.DecimalPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginationControlsComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'pagination-controls',
                    template: DEFAULT_TEMPLATE,
                    styles: [DEFAULT_STYLES],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None
                }]
        }], propDecorators: { id: [{
                type: Input
            }], maxSize: [{
                type: Input
            }], directionLinks: [{
                type: Input
            }], autoHide: [{
                type: Input
            }], responsive: [{
                type: Input
            }], previousLabel: [{
                type: Input
            }], nextLabel: [{
                type: Input
            }], screenReaderPaginationLabel: [{
                type: Input
            }], screenReaderPageLabel: [{
                type: Input
            }], screenReaderCurrentLabel: [{
                type: Input
            }], pageChange: [{
                type: Output
            }], pageBoundsCorrection: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi1jb250cm9scy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtcGFnaW5hdGlvbi9zcmMvbGliL3BhZ2luYXRpb24tY29udHJvbHMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUE7QUFDaEgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBQyxNQUFNLFlBQVksQ0FBQzs7OztBQUU1RCxTQUFTLGVBQWUsQ0FBQyxLQUF1QjtJQUM1QyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxLQUFLLE9BQU8sQ0FBQztBQUN4QyxDQUFDO0FBRUQ7O0dBRUc7QUFRSCxNQUFNLE9BQU8sMkJBQTJCO0lBUHhDO1FBVWEsWUFBTyxHQUFXLENBQUMsQ0FBQztRQXNCcEIsa0JBQWEsR0FBVyxVQUFVLENBQUM7UUFDbkMsY0FBUyxHQUFXLE1BQU0sQ0FBQztRQUMzQixnQ0FBMkIsR0FBVyxZQUFZLENBQUM7UUFDbkQsMEJBQXFCLEdBQVcsTUFBTSxDQUFDO1FBQ3ZDLDZCQUF3QixHQUFXLGdCQUFnQixDQUFDO1FBQ25ELGVBQVUsR0FBeUIsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUM5RCx5QkFBb0IsR0FBeUIsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUUxRSxvQkFBZSxHQUFZLElBQUksQ0FBQztRQUNoQyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBQzNCLGdCQUFXLEdBQVksS0FBSyxDQUFDO0tBS3hDO0lBcENHLElBQ0ksY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsSUFBSSxjQUFjLENBQUMsS0FBYztRQUM3QixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsSUFDSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxJQUNJLFVBQVU7UUFDVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQUksVUFBVSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQWFELFlBQVksQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7O3dIQXZDUSwyQkFBMkI7NEdBQTNCLDJCQUEyQjsyRkFBM0IsMkJBQTJCO2tCQVB2QyxTQUFTO21CQUFDO29CQUNQLFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLE1BQU0sRUFBRSxDQUFDLGNBQWMsQ0FBQztvQkFDeEIsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07b0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN4Qzs4QkFHWSxFQUFFO3NCQUFWLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUVGLGNBQWM7c0JBRGpCLEtBQUs7Z0JBUUYsUUFBUTtzQkFEWCxLQUFLO2dCQVFGLFVBQVU7c0JBRGIsS0FBSztnQkFPRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csMkJBQTJCO3NCQUFuQyxLQUFLO2dCQUNHLHFCQUFxQjtzQkFBN0IsS0FBSztnQkFDRyx3QkFBd0I7c0JBQWhDLEtBQUs7Z0JBQ0ksVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxvQkFBb0I7c0JBQTdCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnXHJcbmltcG9ydCB7REVGQVVMVF9URU1QTEFURSwgREVGQVVMVF9TVFlMRVN9IGZyb20gJy4vdGVtcGxhdGUnO1xyXG5cclxuZnVuY3Rpb24gY29lcmNlVG9Cb29sZWFuKGlucHV0OiBzdHJpbmcgfCBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gISFpbnB1dCAmJiBpbnB1dCAhPT0gJ2ZhbHNlJztcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBkZWZhdWx0IHBhZ2luYXRpb24gY29udHJvbHMgY29tcG9uZW50LiBBY3R1YWxseSBqdXN0IGEgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiBhIGN1c3RvbSB0ZW1wbGF0ZS5cclxuICovXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwYWdpbmF0aW9uLWNvbnRyb2xzJyxcclxuICAgIHRlbXBsYXRlOiBERUZBVUxUX1RFTVBMQVRFLFxyXG4gICAgc3R5bGVzOiBbREVGQVVMVF9TVFlMRVNdLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQYWdpbmF0aW9uQ29udHJvbHNDb21wb25lbnQge1xyXG5cclxuICAgIEBJbnB1dCgpIGlkOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoKSBtYXhTaXplOiBudW1iZXIgPSA3O1xyXG4gICAgQElucHV0KClcclxuICAgIGdldCBkaXJlY3Rpb25MaW5rcygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlyZWN0aW9uTGlua3M7XHJcbiAgICB9XHJcbiAgICBzZXQgZGlyZWN0aW9uTGlua3ModmFsdWU6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9kaXJlY3Rpb25MaW5rcyA9IGNvZXJjZVRvQm9vbGVhbih2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBASW5wdXQoKVxyXG4gICAgZ2V0IGF1dG9IaWRlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hdXRvSGlkZTtcclxuICAgIH1cclxuICAgIHNldCBhdXRvSGlkZSh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2F1dG9IaWRlID0gY29lcmNlVG9Cb29sZWFuKHZhbHVlKTtcclxuICAgIH1cclxuICAgIEBJbnB1dCgpXHJcbiAgICBnZXQgcmVzcG9uc2l2ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVzcG9uc2l2ZTtcclxuICAgIH1cclxuICAgIHNldCByZXNwb25zaXZlKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fcmVzcG9uc2l2ZSA9IGNvZXJjZVRvQm9vbGVhbih2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBASW5wdXQoKSBwcmV2aW91c0xhYmVsOiBzdHJpbmcgPSAnUHJldmlvdXMnO1xyXG4gICAgQElucHV0KCkgbmV4dExhYmVsOiBzdHJpbmcgPSAnTmV4dCc7XHJcbiAgICBASW5wdXQoKSBzY3JlZW5SZWFkZXJQYWdpbmF0aW9uTGFiZWw6IHN0cmluZyA9ICdQYWdpbmF0aW9uJztcclxuICAgIEBJbnB1dCgpIHNjcmVlblJlYWRlclBhZ2VMYWJlbDogc3RyaW5nID0gJ3BhZ2UnO1xyXG4gICAgQElucHV0KCkgc2NyZWVuUmVhZGVyQ3VycmVudExhYmVsOiBzdHJpbmcgPSBgWW91J3JlIG9uIHBhZ2VgO1xyXG4gICAgQE91dHB1dCgpIHBhZ2VDaGFuZ2U6IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KCk7XHJcbiAgICBAT3V0cHV0KCkgcGFnZUJvdW5kc0NvcnJlY3Rpb246IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KCk7XHJcblxyXG4gICAgcHJpdmF0ZSBfZGlyZWN0aW9uTGlua3M6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHJpdmF0ZSBfYXV0b0hpZGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3Jlc3BvbnNpdmU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICB0cmFja0J5SW5kZXgoaW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBpbmRleDtcclxuICAgIH1cclxufVxyXG4iXX0=
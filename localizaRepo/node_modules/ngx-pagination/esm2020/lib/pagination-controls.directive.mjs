import { Directive, EventEmitter, Input, Output } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./pagination.service";
/**
 * This directive is what powers all pagination controls components, including the default one.
 * It exposes an API which is hooked up to the PaginationService to keep the PaginatePipe in sync
 * with the pagination controls.
 */
export class PaginationControlsDirective {
    constructor(service, changeDetectorRef) {
        this.service = service;
        this.changeDetectorRef = changeDetectorRef;
        this.maxSize = 7;
        this.pageChange = new EventEmitter();
        this.pageBoundsCorrection = new EventEmitter();
        this.pages = [];
        this.changeSub = this.service.change
            .subscribe(id => {
            if (this.id === id) {
                this.updatePageLinks();
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }
    ngOnInit() {
        if (this.id === undefined) {
            this.id = this.service.defaultId();
        }
        this.updatePageLinks();
    }
    ngOnChanges(changes) {
        this.updatePageLinks();
    }
    ngOnDestroy() {
        this.changeSub.unsubscribe();
    }
    /**
     * Go to the previous page
     */
    previous() {
        this.checkValidId();
        this.setCurrent(this.getCurrent() - 1);
    }
    /**
     * Go to the next page
     */
    next() {
        this.checkValidId();
        this.setCurrent(this.getCurrent() + 1);
    }
    /**
     * Returns true if current page is first page
     */
    isFirstPage() {
        return this.getCurrent() === 1;
    }
    /**
     * Returns true if current page is last page
     */
    isLastPage() {
        return this.getLastPage() === this.getCurrent();
    }
    /**
     * Set the current page number.
     */
    setCurrent(page) {
        this.pageChange.emit(page);
    }
    /**
     * Get the current page number.
     */
    getCurrent() {
        return this.service.getCurrentPage(this.id);
    }
    /**
     * Returns the last page number
     */
    getLastPage() {
        let inst = this.service.getInstance(this.id);
        if (inst.totalItems < 1) {
            // when there are 0 or fewer (an error case) items, there are no "pages" as such,
            // but it makes sense to consider a single, empty page as the last page.
            return 1;
        }
        return Math.ceil(inst.totalItems / inst.itemsPerPage);
    }
    getTotalItems() {
        return this.service.getInstance(this.id).totalItems;
    }
    checkValidId() {
        if (this.service.getInstance(this.id).id == null) {
            console.warn(`PaginationControlsDirective: the specified id "${this.id}" does not match any registered PaginationInstance`);
        }
    }
    /**
     * Updates the page links and checks that the current page is valid. Should run whenever the
     * PaginationService.change stream emits a value matching the current ID, or when any of the
     * input values changes.
     */
    updatePageLinks() {
        let inst = this.service.getInstance(this.id);
        const correctedCurrentPage = this.outOfBoundCorrection(inst);
        if (correctedCurrentPage !== inst.currentPage) {
            setTimeout(() => {
                this.pageBoundsCorrection.emit(correctedCurrentPage);
                this.pages = this.createPageArray(inst.currentPage, inst.itemsPerPage, inst.totalItems, this.maxSize);
            });
        }
        else {
            this.pages = this.createPageArray(inst.currentPage, inst.itemsPerPage, inst.totalItems, this.maxSize);
        }
    }
    /**
     * Checks that the instance.currentPage property is within bounds for the current page range.
     * If not, return a correct value for currentPage, or the current value if OK.
     */
    outOfBoundCorrection(instance) {
        const totalPages = Math.ceil(instance.totalItems / instance.itemsPerPage);
        if (totalPages < instance.currentPage && 0 < totalPages) {
            return totalPages;
        }
        else if (instance.currentPage < 1) {
            return 1;
        }
        return instance.currentPage;
    }
    /**
     * Returns an array of Page objects to use in the pagination controls.
     */
    createPageArray(currentPage, itemsPerPage, totalItems, paginationRange) {
        // paginationRange could be a string if passed from attribute, so cast to number.
        paginationRange = +paginationRange;
        let pages = [];
        // Return 1 as default page number
        // Make sense to show 1 instead of empty when there are no items
        const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
        const halfWay = Math.ceil(paginationRange / 2);
        const isStart = currentPage <= halfWay;
        const isEnd = totalPages - halfWay < currentPage;
        const isMiddle = !isStart && !isEnd;
        let ellipsesNeeded = paginationRange < totalPages;
        let i = 1;
        while (i <= totalPages && i <= paginationRange) {
            let label;
            let pageNumber = this.calculatePageNumber(i, currentPage, paginationRange, totalPages);
            let openingEllipsesNeeded = (i === 2 && (isMiddle || isEnd));
            let closingEllipsesNeeded = (i === paginationRange - 1 && (isMiddle || isStart));
            if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                label = '...';
            }
            else {
                label = pageNumber;
            }
            pages.push({
                label: label,
                value: pageNumber
            });
            i++;
        }
        return pages;
    }
    /**
     * Given the position in the sequence of pagination links [i],
     * figure out what page number corresponds to that position.
     */
    calculatePageNumber(i, currentPage, paginationRange, totalPages) {
        let halfWay = Math.ceil(paginationRange / 2);
        if (i === paginationRange) {
            return totalPages;
        }
        else if (i === 1) {
            return i;
        }
        else if (paginationRange < totalPages) {
            if (totalPages - halfWay < currentPage) {
                return totalPages - paginationRange + i;
            }
            else if (halfWay < currentPage) {
                return currentPage - halfWay + i;
            }
            else {
                return i;
            }
        }
        else {
            return i;
        }
    }
}
PaginationControlsDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginationControlsDirective, deps: [{ token: i1.PaginationService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Directive });
PaginationControlsDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.9", type: PaginationControlsDirective, selector: "pagination-template,[pagination-template]", inputs: { id: "id", maxSize: "maxSize" }, outputs: { pageChange: "pageChange", pageBoundsCorrection: "pageBoundsCorrection" }, exportAs: ["paginationApi"], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginationControlsDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pagination-template,[pagination-template]',
                    exportAs: 'paginationApi'
                }]
        }], ctorParameters: function () { return [{ type: i1.PaginationService }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { id: [{
                type: Input
            }], maxSize: [{
                type: Input
            }], pageChange: [{
                type: Output
            }], pageBoundsCorrection: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi1jb250cm9scy5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtcGFnaW5hdGlvbi9zcmMvbGliL3BhZ2luYXRpb24tY29udHJvbHMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBb0IsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUFXeEY7Ozs7R0FJRztBQUtILE1BQU0sT0FBTywyQkFBMkI7SUFTcEMsWUFBb0IsT0FBMEIsRUFDMUIsaUJBQW9DO1FBRHBDLFlBQU8sR0FBUCxPQUFPLENBQW1CO1FBQzFCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFSL0MsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUNuQixlQUFVLEdBQXlCLElBQUksWUFBWSxFQUFVLENBQUM7UUFDOUQseUJBQW9CLEdBQXlCLElBQUksWUFBWSxFQUFVLENBQUM7UUFDbEYsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQU1mLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO2FBQy9CLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNaLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDMUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLFNBQVMsRUFBRTtZQUN2QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7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QUMsRUFBRTtZQUNoQixPQUFPLENBQUMsQ0FBQztTQUNaO2FBQU0sSUFBSSxlQUFlLEdBQUcsVUFBVSxFQUFFO1lBQ3JDLElBQUksVUFBVSxHQUFHLE9BQU8sR0FBRyxXQUFXLEVBQUU7Z0JBQ3BDLE9BQU8sVUFBVSxHQUFHLGVBQWUsR0FBRyxDQUFDLENBQUM7YUFDM0M7aUJBQU0sSUFBSSxPQUFPLEdBQUcsV0FBVyxFQUFFO2dCQUM5QixPQUFPLFdBQVcsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2FBQ3BDO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxDQUFDO2FBQ1o7U0FDSjthQUFNO1lBQ0gsT0FBTyxDQUFDLENBQUM7U0FDWjtJQUNMLENBQUM7O3dIQXJNUSwyQkFBMkI7NEdBQTNCLDJCQUEyQjsyRkFBM0IsMkJBQTJCO2tCQUp2QyxTQUFTO21CQUFDO29CQUNQLFFBQVEsRUFBRSwyQ0FBMkM7b0JBQ3JELFFBQVEsRUFBRSxlQUFlO2lCQUM1Qjt3SUFFWSxFQUFFO3NCQUFWLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNJLFVBQVU7c0JBQW5CLE1BQU07Z0JBQ0csb0JBQW9CO3NCQUE3QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgRGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcblxyXG5pbXBvcnQge1BhZ2luYXRpb25TZXJ2aWNlfSBmcm9tICcuL3BhZ2luYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7UGFnaW5hdGlvbkluc3RhbmNlfSBmcm9tICcuL3BhZ2luYXRpb24taW5zdGFuY2UnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQYWdlIHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICB2YWx1ZTogYW55O1xyXG59XHJcblxyXG4vKipcclxuICogVGhpcyBkaXJlY3RpdmUgaXMgd2hhdCBwb3dlcnMgYWxsIHBhZ2luYXRpb24gY29udHJvbHMgY29tcG9uZW50cywgaW5jbHVkaW5nIHRoZSBkZWZhdWx0IG9uZS5cclxuICogSXQgZXhwb3NlcyBhbiBBUEkgd2hpY2ggaXMgaG9va2VkIHVwIHRvIHRoZSBQYWdpbmF0aW9uU2VydmljZSB0byBrZWVwIHRoZSBQYWdpbmF0ZVBpcGUgaW4gc3luY1xyXG4gKiB3aXRoIHRoZSBwYWdpbmF0aW9uIGNvbnRyb2xzLlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogJ3BhZ2luYXRpb24tdGVtcGxhdGUsW3BhZ2luYXRpb24tdGVtcGxhdGVdJyxcclxuICAgIGV4cG9ydEFzOiAncGFnaW5hdGlvbkFwaSdcclxufSlcclxuZXhwb3J0IGNsYXNzIFBhZ2luYXRpb25Db250cm9sc0RpcmVjdGl2ZSB7XHJcbiAgICBASW5wdXQoKSBpZDogc3RyaW5nO1xyXG4gICAgQElucHV0KCkgbWF4U2l6ZTogbnVtYmVyID0gNztcclxuICAgIEBPdXRwdXQoKSBwYWdlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8bnVtYmVyPiA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPigpO1xyXG4gICAgQE91dHB1dCgpIHBhZ2VCb3VuZHNDb3JyZWN0aW9uOiBFdmVudEVtaXR0ZXI8bnVtYmVyPiA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPigpO1xyXG4gICAgcGFnZXM6IFBhZ2VbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgY2hhbmdlU3ViOiBTdWJzY3JpcHRpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzZXJ2aWNlOiBQYWdpbmF0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgICAgIHByaXZhdGUgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmKSB7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTdWIgPSB0aGlzLnNlcnZpY2UuY2hhbmdlXHJcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoaWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYWdlTGlua3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSB0aGlzLnNlcnZpY2UuZGVmYXVsdElkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlUGFnZUxpbmtzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQYWdlTGlua3MoKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLmNoYW5nZVN1Yi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR28gdG8gdGhlIHByZXZpb3VzIHBhZ2VcclxuICAgICAqL1xyXG4gICAgcHJldmlvdXMoKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja1ZhbGlkSWQoKTtcclxuICAgICAgICB0aGlzLnNldEN1cnJlbnQodGhpcy5nZXRDdXJyZW50KCkgLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdvIHRvIHRoZSBuZXh0IHBhZ2VcclxuICAgICAqL1xyXG4gICAgbmV4dCgpIHtcclxuICAgICAgICB0aGlzLmNoZWNrVmFsaWRJZCgpO1xyXG4gICAgICAgIHRoaXMuc2V0Q3VycmVudCh0aGlzLmdldEN1cnJlbnQoKSArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIGN1cnJlbnQgcGFnZSBpcyBmaXJzdCBwYWdlXHJcbiAgICAgKi9cclxuICAgIGlzRmlyc3RQYWdlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnQoKSA9PT0gMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBjdXJyZW50IHBhZ2UgaXMgbGFzdCBwYWdlXHJcbiAgICAgKi9cclxuICAgIGlzTGFzdFBhZ2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TGFzdFBhZ2UoKSA9PT0gdGhpcy5nZXRDdXJyZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGN1cnJlbnQgcGFnZSBudW1iZXIuXHJcbiAgICAgKi9cclxuICAgIHNldEN1cnJlbnQocGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5wYWdlQ2hhbmdlLmVtaXQocGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgcGFnZSBudW1iZXIuXHJcbiAgICAgKi9cclxuICAgIGdldEN1cnJlbnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlLmdldEN1cnJlbnRQYWdlKHRoaXMuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbGFzdCBwYWdlIG51bWJlclxyXG4gICAgICovXHJcbiAgICBnZXRMYXN0UGFnZSgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBpbnN0ID0gdGhpcy5zZXJ2aWNlLmdldEluc3RhbmNlKHRoaXMuaWQpO1xyXG4gICAgICAgIGlmIChpbnN0LnRvdGFsSXRlbXMgPCAxKSB7XHJcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlcmUgYXJlIDAgb3IgZmV3ZXIgKGFuIGVycm9yIGNhc2UpIGl0ZW1zLCB0aGVyZSBhcmUgbm8gXCJwYWdlc1wiIGFzIHN1Y2gsXHJcbiAgICAgICAgICAgIC8vIGJ1dCBpdCBtYWtlcyBzZW5zZSB0byBjb25zaWRlciBhIHNpbmdsZSwgZW1wdHkgcGFnZSBhcyB0aGUgbGFzdCBwYWdlLlxyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbChpbnN0LnRvdGFsSXRlbXMgLyBpbnN0Lml0ZW1zUGVyUGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VG90YWxJdGVtcygpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2UuZ2V0SW5zdGFuY2UodGhpcy5pZCkudG90YWxJdGVtcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrVmFsaWRJZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXJ2aWNlLmdldEluc3RhbmNlKHRoaXMuaWQpLmlkID09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBQYWdpbmF0aW9uQ29udHJvbHNEaXJlY3RpdmU6IHRoZSBzcGVjaWZpZWQgaWQgXCIke3RoaXMuaWR9XCIgZG9lcyBub3QgbWF0Y2ggYW55IHJlZ2lzdGVyZWQgUGFnaW5hdGlvbkluc3RhbmNlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgcGFnZSBsaW5rcyBhbmQgY2hlY2tzIHRoYXQgdGhlIGN1cnJlbnQgcGFnZSBpcyB2YWxpZC4gU2hvdWxkIHJ1biB3aGVuZXZlciB0aGVcclxuICAgICAqIFBhZ2luYXRpb25TZXJ2aWNlLmNoYW5nZSBzdHJlYW0gZW1pdHMgYSB2YWx1ZSBtYXRjaGluZyB0aGUgY3VycmVudCBJRCwgb3Igd2hlbiBhbnkgb2YgdGhlXHJcbiAgICAgKiBpbnB1dCB2YWx1ZXMgY2hhbmdlcy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVQYWdlTGlua3MoKSB7XHJcbiAgICAgICAgbGV0IGluc3QgPSB0aGlzLnNlcnZpY2UuZ2V0SW5zdGFuY2UodGhpcy5pZCk7XHJcbiAgICAgICAgY29uc3QgY29ycmVjdGVkQ3VycmVudFBhZ2UgPSB0aGlzLm91dE9mQm91bmRDb3JyZWN0aW9uKGluc3QpO1xyXG5cclxuICAgICAgICBpZiAoY29ycmVjdGVkQ3VycmVudFBhZ2UgIT09IGluc3QuY3VycmVudFBhZ2UpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VCb3VuZHNDb3JyZWN0aW9uLmVtaXQoY29ycmVjdGVkQ3VycmVudFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlcyA9IHRoaXMuY3JlYXRlUGFnZUFycmF5KGluc3QuY3VycmVudFBhZ2UsIGluc3QuaXRlbXNQZXJQYWdlLCBpbnN0LnRvdGFsSXRlbXMsIHRoaXMubWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXMgPSB0aGlzLmNyZWF0ZVBhZ2VBcnJheShpbnN0LmN1cnJlbnRQYWdlLCBpbnN0Lml0ZW1zUGVyUGFnZSwgaW5zdC50b3RhbEl0ZW1zLCB0aGlzLm1heFNpemUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGF0IHRoZSBpbnN0YW5jZS5jdXJyZW50UGFnZSBwcm9wZXJ0eSBpcyB3aXRoaW4gYm91bmRzIGZvciB0aGUgY3VycmVudCBwYWdlIHJhbmdlLlxyXG4gICAgICogSWYgbm90LCByZXR1cm4gYSBjb3JyZWN0IHZhbHVlIGZvciBjdXJyZW50UGFnZSwgb3IgdGhlIGN1cnJlbnQgdmFsdWUgaWYgT0suXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgb3V0T2ZCb3VuZENvcnJlY3Rpb24oaW5zdGFuY2U6IFBhZ2luYXRpb25JbnN0YW5jZSk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGguY2VpbChpbnN0YW5jZS50b3RhbEl0ZW1zIC8gaW5zdGFuY2UuaXRlbXNQZXJQYWdlKTtcclxuICAgICAgICBpZiAodG90YWxQYWdlcyA8IGluc3RhbmNlLmN1cnJlbnRQYWdlICYmIDAgPCB0b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0b3RhbFBhZ2VzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5zdGFuY2UuY3VycmVudFBhZ2UgPCAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmN1cnJlbnRQYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBQYWdlIG9iamVjdHMgdG8gdXNlIGluIHRoZSBwYWdpbmF0aW9uIGNvbnRyb2xzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNyZWF0ZVBhZ2VBcnJheShjdXJyZW50UGFnZTogbnVtYmVyLCBpdGVtc1BlclBhZ2U6IG51bWJlciwgdG90YWxJdGVtczogbnVtYmVyLCBwYWdpbmF0aW9uUmFuZ2U6IG51bWJlcik6IFBhZ2VbXSB7XHJcbiAgICAgICAgLy8gcGFnaW5hdGlvblJhbmdlIGNvdWxkIGJlIGEgc3RyaW5nIGlmIHBhc3NlZCBmcm9tIGF0dHJpYnV0ZSwgc28gY2FzdCB0byBudW1iZXIuXHJcbiAgICAgICAgcGFnaW5hdGlvblJhbmdlID0gK3BhZ2luYXRpb25SYW5nZTtcclxuICAgICAgICBsZXQgcGFnZXMgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBSZXR1cm4gMSBhcyBkZWZhdWx0IHBhZ2UgbnVtYmVyXHJcbiAgICAgICAgLy8gTWFrZSBzZW5zZSB0byBzaG93IDEgaW5zdGVhZCBvZiBlbXB0eSB3aGVuIHRoZXJlIGFyZSBubyBpdGVtc1xyXG4gICAgICAgIGNvbnN0IHRvdGFsUGFnZXMgPSBNYXRoLm1heChNYXRoLmNlaWwodG90YWxJdGVtcyAvIGl0ZW1zUGVyUGFnZSksIDEpO1xyXG4gICAgICAgIGNvbnN0IGhhbGZXYXkgPSBNYXRoLmNlaWwocGFnaW5hdGlvblJhbmdlIC8gMik7XHJcblxyXG4gICAgICAgIGNvbnN0IGlzU3RhcnQgPSBjdXJyZW50UGFnZSA8PSBoYWxmV2F5O1xyXG4gICAgICAgIGNvbnN0IGlzRW5kID0gdG90YWxQYWdlcyAtIGhhbGZXYXkgPCBjdXJyZW50UGFnZTtcclxuICAgICAgICBjb25zdCBpc01pZGRsZSA9ICFpc1N0YXJ0ICYmICFpc0VuZDtcclxuXHJcbiAgICAgICAgbGV0IGVsbGlwc2VzTmVlZGVkID0gcGFnaW5hdGlvblJhbmdlIDwgdG90YWxQYWdlcztcclxuICAgICAgICBsZXQgaSA9IDE7XHJcblxyXG4gICAgICAgIHdoaWxlIChpIDw9IHRvdGFsUGFnZXMgJiYgaSA8PSBwYWdpbmF0aW9uUmFuZ2UpIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsO1xyXG4gICAgICAgICAgICBsZXQgcGFnZU51bWJlciA9IHRoaXMuY2FsY3VsYXRlUGFnZU51bWJlcihpLCBjdXJyZW50UGFnZSwgcGFnaW5hdGlvblJhbmdlLCB0b3RhbFBhZ2VzKTtcclxuICAgICAgICAgICAgbGV0IG9wZW5pbmdFbGxpcHNlc05lZWRlZCA9IChpID09PSAyICYmIChpc01pZGRsZSB8fCBpc0VuZCkpO1xyXG4gICAgICAgICAgICBsZXQgY2xvc2luZ0VsbGlwc2VzTmVlZGVkID0gKGkgPT09IHBhZ2luYXRpb25SYW5nZSAtIDEgJiYgKGlzTWlkZGxlIHx8IGlzU3RhcnQpKTtcclxuICAgICAgICAgICAgaWYgKGVsbGlwc2VzTmVlZGVkICYmIChvcGVuaW5nRWxsaXBzZXNOZWVkZWQgfHwgY2xvc2luZ0VsbGlwc2VzTmVlZGVkKSkge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwgPSAnLi4uJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsID0gcGFnZU51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYWdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBwYWdlTnVtYmVyXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpICsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFnZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHaXZlbiB0aGUgcG9zaXRpb24gaW4gdGhlIHNlcXVlbmNlIG9mIHBhZ2luYXRpb24gbGlua3MgW2ldLFxyXG4gICAgICogZmlndXJlIG91dCB3aGF0IHBhZ2UgbnVtYmVyIGNvcnJlc3BvbmRzIHRvIHRoYXQgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUGFnZU51bWJlcihpOiBudW1iZXIsIGN1cnJlbnRQYWdlOiBudW1iZXIsIHBhZ2luYXRpb25SYW5nZTogbnVtYmVyLCB0b3RhbFBhZ2VzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgaGFsZldheSA9IE1hdGguY2VpbChwYWdpbmF0aW9uUmFuZ2UgLyAyKTtcclxuICAgICAgICBpZiAoaSA9PT0gcGFnaW5hdGlvblJhbmdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0b3RhbFBhZ2VzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhZ2luYXRpb25SYW5nZSA8IHRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgICAgaWYgKHRvdGFsUGFnZXMgLSBoYWxmV2F5IDwgY3VycmVudFBhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b3RhbFBhZ2VzIC0gcGFnaW5hdGlvblJhbmdlICsgaTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChoYWxmV2F5IDwgY3VycmVudFBhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50UGFnZSAtIGhhbGZXYXkgKyBpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19
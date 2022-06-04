import * as i0 from '@angular/core';
import { EventEmitter, Pipe, Directive, Input, Output, Component, ChangeDetectionStrategy, ViewEncapsulation, NgModule } from '@angular/core';
import * as i2 from '@angular/common';
import { CommonModule } from '@angular/common';

class PaginationService {
    constructor() {
        this.change = new EventEmitter();
        this.instances = {};
        this.DEFAULT_ID = 'DEFAULT_PAGINATION_ID';
    }
    defaultId() { return this.DEFAULT_ID; }
    /**
     * Register a PaginationInstance with this service. Returns a
     * boolean value signifying whether the instance is new or
     * updated (true = new or updated, false = unchanged).
     */
    register(instance) {
        if (instance.id == null) {
            instance.id = this.DEFAULT_ID;
        }
        if (!this.instances[instance.id]) {
            this.instances[instance.id] = instance;
            return true;
        }
        else {
            return this.updateInstance(instance);
        }
    }
    /**
     * Check each property of the instance and update any that have changed. Return
     * true if any changes were made, else return false.
     */
    updateInstance(instance) {
        let changed = false;
        for (let prop in this.instances[instance.id]) {
            if (instance[prop] !== this.instances[instance.id][prop]) {
                this.instances[instance.id][prop] = instance[prop];
                changed = true;
            }
        }
        return changed;
    }
    /**
     * Returns the current page number.
     */
    getCurrentPage(id) {
        if (this.instances[id]) {
            return this.instances[id].currentPage;
        }
        return 1;
    }
    /**
     * Sets the current page number.
     */
    setCurrentPage(id, page) {
        if (this.instances[id]) {
            let instance = this.instances[id];
            let maxPage = Math.ceil(instance.totalItems / instance.itemsPerPage);
            if (page <= maxPage && 1 <= page) {
                this.instances[id].currentPage = page;
                this.change.emit(id);
            }
        }
    }
    /**
     * Sets the value of instance.totalItems
     */
    setTotalItems(id, totalItems) {
        if (this.instances[id] && 0 <= totalItems) {
            this.instances[id].totalItems = totalItems;
            this.change.emit(id);
        }
    }
    /**
     * Sets the value of instance.itemsPerPage.
     */
    setItemsPerPage(id, itemsPerPage) {
        if (this.instances[id]) {
            this.instances[id].itemsPerPage = itemsPerPage;
            this.change.emit(id);
        }
    }
    /**
     * Returns a clone of the pagination instance object matching the id. If no
     * id specified, returns the instance corresponding to the default id.
     */
    getInstance(id = this.DEFAULT_ID) {
        if (this.instances[id]) {
            return this.clone(this.instances[id]);
        }
        return {};
    }
    /**
     * Perform a shallow clone of an object.
     */
    clone(obj) {
        var target = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                target[i] = obj[i];
            }
        }
        return target;
    }
}

const LARGE_NUMBER = Number.MAX_SAFE_INTEGER;
class PaginatePipe {
    constructor(service) {
        this.service = service;
        // store the values from the last time the pipe was invoked
        this.state = {};
    }
    transform(collection, args) {
        // When an observable is passed through the AsyncPipe, it will output
        // `null` until the subscription resolves. In this case, we want to
        // use the cached data from the `state` object to prevent the NgFor
        // from flashing empty until the real values arrive.
        if (!(collection instanceof Array)) {
            let _id = args.id || this.service.defaultId();
            if (this.state[_id]) {
                return this.state[_id].slice;
            }
            else {
                return collection;
            }
        }
        let serverSideMode = args.totalItems && args.totalItems !== collection.length;
        let instance = this.createInstance(collection, args);
        let id = instance.id;
        let start, end;
        let perPage = instance.itemsPerPage;
        let emitChange = this.service.register(instance);
        if (!serverSideMode && collection instanceof Array) {
            perPage = +perPage || LARGE_NUMBER;
            start = (instance.currentPage - 1) * perPage;
            end = start + perPage;
            let isIdentical = this.stateIsIdentical(id, collection, start, end);
            if (isIdentical) {
                return this.state[id].slice;
            }
            else {
                let slice = collection.slice(start, end);
                this.saveState(id, collection, slice, start, end);
                this.service.change.emit(id);
                return slice;
            }
        }
        else {
            if (emitChange) {
                this.service.change.emit(id);
            }
            // save the state for server-side collection to avoid null
            // flash as new data loads.
            this.saveState(id, collection, collection, start, end);
            return collection;
        }
    }
    /**
     * Create an PaginationInstance object, using defaults for any optional properties not supplied.
     */
    createInstance(collection, config) {
        this.checkConfig(config);
        return {
            id: config.id != null ? config.id : this.service.defaultId(),
            itemsPerPage: +config.itemsPerPage || 0,
            currentPage: +config.currentPage || 1,
            totalItems: +config.totalItems || collection.length
        };
    }
    /**
     * Ensure the argument passed to the filter contains the required properties.
     */
    checkConfig(config) {
        const required = ['itemsPerPage', 'currentPage'];
        const missing = required.filter(prop => !(prop in config));
        if (0 < missing.length) {
            throw new Error(`PaginatePipe: Argument is missing the following required properties: ${missing.join(', ')}`);
        }
    }
    /**
     * To avoid returning a brand new array each time the pipe is run, we store the state of the sliced
     * array for a given id. This means that the next time the pipe is run on this collection & id, we just
     * need to check that the collection, start and end points are all identical, and if so, return the
     * last sliced array.
     */
    saveState(id, collection, slice, start, end) {
        this.state[id] = {
            collection,
            size: collection.length,
            slice,
            start,
            end
        };
    }
    /**
     * For a given id, returns true if the collection, size, start and end values are identical.
     */
    stateIsIdentical(id, collection, start, end) {
        let state = this.state[id];
        if (!state) {
            return false;
        }
        let isMetaDataIdentical = state.size === collection.length &&
            state.start === start &&
            state.end === end;
        if (!isMetaDataIdentical) {
            return false;
        }
        return state.slice.every((element, index) => element === collection[start + index]);
    }
}
PaginatePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginatePipe, deps: [{ token: PaginationService }], target: i0.ɵɵFactoryTarget.Pipe });
PaginatePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginatePipe, name: "paginate", pure: false });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginatePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'paginate',
                    pure: false
                }]
        }], ctorParameters: function () { return [{ type: PaginationService }]; } });

/**
 * The default template and styles for the pagination links are borrowed directly
 * from Zurb Foundation 6: http://foundation.zurb.com/sites/docs/pagination.html
 */
const DEFAULT_TEMPLATE = `
    <pagination-template  #p="paginationApi"
                         [id]="id"
                         [maxSize]="maxSize"
                         (pageChange)="pageChange.emit($event)"
                         (pageBoundsCorrection)="pageBoundsCorrection.emit($event)">
    <nav role="navigation" [attr.aria-label]="screenReaderPaginationLabel">
    <ul class="ngx-pagination" 
        [class.responsive]="responsive"
        *ngIf="!(autoHide && p.pages.length <= 1)">

        <li class="pagination-previous" [class.disabled]="p.isFirstPage()" *ngIf="directionLinks"> 
            <a tabindex="0" *ngIf="1 < p.getCurrent()" (keyup.enter)="p.previous()" (click)="p.previous()">
                {{ previousLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </a>
            <span *ngIf="p.isFirstPage()" aria-disabled="true">
                {{ previousLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </span>
        </li> 

        <li class="small-screen">
            {{ p.getCurrent() }} / {{ p.getLastPage() }}
        </li>

        <li [class.current]="p.getCurrent() === page.value" 
            [class.ellipsis]="page.label === '...'"
            *ngFor="let page of p.pages; trackBy: trackByIndex">
            <a tabindex="0" (keyup.enter)="p.setCurrent(page.value)" (click)="p.setCurrent(page.value)" *ngIf="p.getCurrent() !== page.value">
                <span class="show-for-sr">{{ screenReaderPageLabel }} </span>
                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span>
            </a>
            <ng-container *ngIf="p.getCurrent() === page.value">
              <span aria-live="polite">
                <span class="show-for-sr">{{ screenReaderCurrentLabel }} </span>
                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span> 
              </span>
            </ng-container>
        </li>

        <li class="pagination-next" [class.disabled]="p.isLastPage()" *ngIf="directionLinks">
            <a tabindex="0" *ngIf="!p.isLastPage()" (keyup.enter)="p.next()" (click)="p.next()">
                 {{ nextLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </a>
            <span *ngIf="p.isLastPage()" aria-disabled="true">
                 {{ nextLabel }} <span class="show-for-sr">{{ screenReaderPageLabel }}</span>
            </span>
        </li>

    </ul>
    </nav>
    </pagination-template>
    `;
const DEFAULT_STYLES = `
.ngx-pagination {
  margin-left: 0;
  margin-bottom: 1rem; }
  .ngx-pagination::before, .ngx-pagination::after {
    content: ' ';
    display: table; }
  .ngx-pagination::after {
    clear: both; }
  .ngx-pagination li {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    margin-right: 0.0625rem;
    border-radius: 0; }
  .ngx-pagination li {
    display: inline-block; }
  .ngx-pagination a,
  .ngx-pagination button {
    color: #0a0a0a; 
    display: block;
    padding: 0.1875rem 0.625rem;
    border-radius: 0; }
    .ngx-pagination a:hover,
    .ngx-pagination button:hover {
      background: #e6e6e6; }
  .ngx-pagination .current {
    padding: 0.1875rem 0.625rem;
    background: #2199e8;
    color: #fefefe;
    cursor: default; }
  .ngx-pagination .disabled {
    padding: 0.1875rem 0.625rem;
    color: #cacaca;
    cursor: default; } 
    .ngx-pagination .disabled:hover {
      background: transparent; }
  .ngx-pagination a, .ngx-pagination button {
    cursor: pointer; }

.ngx-pagination .pagination-previous a::before,
.ngx-pagination .pagination-previous.disabled::before { 
  content: '«';
  display: inline-block;
  margin-right: 0.5rem; }

.ngx-pagination .pagination-next a::after,
.ngx-pagination .pagination-next.disabled::after {
  content: '»';
  display: inline-block;
  margin-left: 0.5rem; }

.ngx-pagination .show-for-sr {
  position: absolute !important;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0); }
.ngx-pagination .small-screen {
  display: none; }
@media screen and (max-width: 601px) {
  .ngx-pagination.responsive .small-screen {
    display: inline-block; } 
  .ngx-pagination.responsive li:not(.small-screen):not(.pagination-previous):not(.pagination-next) {
    display: none; }
}
  `;

/**
 * This directive is what powers all pagination controls components, including the default one.
 * It exposes an API which is hooked up to the PaginationService to keep the PaginatePipe in sync
 * with the pagination controls.
 */
class PaginationControlsDirective {
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
PaginationControlsDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginationControlsDirective, deps: [{ token: PaginationService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Directive });
PaginationControlsDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.9", type: PaginationControlsDirective, selector: "pagination-template,[pagination-template]", inputs: { id: "id", maxSize: "maxSize" }, outputs: { pageChange: "pageChange", pageBoundsCorrection: "pageBoundsCorrection" }, exportAs: ["paginationApi"], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginationControlsDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'pagination-template,[pagination-template]',
                    exportAs: 'paginationApi'
                }]
        }], ctorParameters: function () { return [{ type: PaginationService }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { id: [{
                type: Input
            }], maxSize: [{
                type: Input
            }], pageChange: [{
                type: Output
            }], pageBoundsCorrection: [{
                type: Output
            }] } });

function coerceToBoolean(input) {
    return !!input && input !== 'false';
}
/**
 * The default pagination controls component. Actually just a default implementation of a custom template.
 */
class PaginationControlsComponent {
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
PaginationControlsComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.3.9", type: PaginationControlsComponent, selector: "pagination-controls", inputs: { id: "id", maxSize: "maxSize", directionLinks: "directionLinks", autoHide: "autoHide", responsive: "responsive", previousLabel: "previousLabel", nextLabel: "nextLabel", screenReaderPaginationLabel: "screenReaderPaginationLabel", screenReaderPageLabel: "screenReaderPageLabel", screenReaderCurrentLabel: "screenReaderCurrentLabel" }, outputs: { pageChange: "pageChange", pageBoundsCorrection: "pageBoundsCorrection" }, ngImport: i0, template: "\n    <pagination-template  #p=\"paginationApi\"\n                         [id]=\"id\"\n                         [maxSize]=\"maxSize\"\n                         (pageChange)=\"pageChange.emit($event)\"\n                         (pageBoundsCorrection)=\"pageBoundsCorrection.emit($event)\">\n    <nav role=\"navigation\" [attr.aria-label]=\"screenReaderPaginationLabel\">\n    <ul class=\"ngx-pagination\" \n        [class.responsive]=\"responsive\"\n        *ngIf=\"!(autoHide && p.pages.length <= 1)\">\n\n        <li class=\"pagination-previous\" [class.disabled]=\"p.isFirstPage()\" *ngIf=\"directionLinks\"> \n            <a tabindex=\"0\" *ngIf=\"1 < p.getCurrent()\" (keyup.enter)=\"p.previous()\" (click)=\"p.previous()\">\n                {{ previousLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </a>\n            <span *ngIf=\"p.isFirstPage()\" aria-disabled=\"true\">\n                {{ previousLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </span>\n        </li> \n\n        <li class=\"small-screen\">\n            {{ p.getCurrent() }} / {{ p.getLastPage() }}\n        </li>\n\n        <li [class.current]=\"p.getCurrent() === page.value\" \n            [class.ellipsis]=\"page.label === '...'\"\n            *ngFor=\"let page of p.pages; trackBy: trackByIndex\">\n            <a tabindex=\"0\" (keyup.enter)=\"p.setCurrent(page.value)\" (click)=\"p.setCurrent(page.value)\" *ngIf=\"p.getCurrent() !== page.value\">\n                <span class=\"show-for-sr\">{{ screenReaderPageLabel }} </span>\n                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span>\n            </a>\n            <ng-container *ngIf=\"p.getCurrent() === page.value\">\n              <span aria-live=\"polite\">\n                <span class=\"show-for-sr\">{{ screenReaderCurrentLabel }} </span>\n                <span>{{ (page.label === '...') ? page.label : (page.label | number:'') }}</span> \n              </span>\n            </ng-container>\n        </li>\n\n        <li class=\"pagination-next\" [class.disabled]=\"p.isLastPage()\" *ngIf=\"directionLinks\">\n            <a tabindex=\"0\" *ngIf=\"!p.isLastPage()\" (keyup.enter)=\"p.next()\" (click)=\"p.next()\">\n                 {{ nextLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </a>\n            <span *ngIf=\"p.isLastPage()\" aria-disabled=\"true\">\n                 {{ nextLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </span>\n        </li>\n\n    </ul>\n    </nav>\n    </pagination-template>\n    ", isInline: true, styles: [".ngx-pagination{margin-left:0;margin-bottom:1rem}.ngx-pagination:before,.ngx-pagination:after{content:\" \";display:table}.ngx-pagination:after{clear:both}.ngx-pagination li{-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;margin-right:.0625rem;border-radius:0}.ngx-pagination li{display:inline-block}.ngx-pagination a,.ngx-pagination button{color:#0a0a0a;display:block;padding:.1875rem .625rem;border-radius:0}.ngx-pagination a:hover,.ngx-pagination button:hover{background:#e6e6e6}.ngx-pagination .current{padding:.1875rem .625rem;background:#2199e8;color:#fefefe;cursor:default}.ngx-pagination .disabled{padding:.1875rem .625rem;color:#cacaca;cursor:default}.ngx-pagination .disabled:hover{background:transparent}.ngx-pagination a,.ngx-pagination button{cursor:pointer}.ngx-pagination .pagination-previous a:before,.ngx-pagination .pagination-previous.disabled:before{content:\"\\ab\";display:inline-block;margin-right:.5rem}.ngx-pagination .pagination-next a:after,.ngx-pagination .pagination-next.disabled:after{content:\"\\bb\";display:inline-block;margin-left:.5rem}.ngx-pagination .show-for-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.ngx-pagination .small-screen{display:none}@media screen and (max-width: 601px){.ngx-pagination.responsive .small-screen{display:inline-block}.ngx-pagination.responsive li:not(.small-screen):not(.pagination-previous):not(.pagination-next){display:none}}\n"], directives: [{ type: PaginationControlsDirective, selector: "pagination-template,[pagination-template]", inputs: ["id", "maxSize"], outputs: ["pageChange", "pageBoundsCorrection"], exportAs: ["paginationApi"] }, { type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], pipes: { "number": i2.DecimalPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
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

class NgxPaginationModule {
}
NgxPaginationModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgxPaginationModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, declarations: [PaginatePipe,
        PaginationControlsComponent,
        PaginationControlsDirective], imports: [CommonModule], exports: [PaginatePipe, PaginationControlsComponent, PaginationControlsDirective] });
NgxPaginationModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, providers: [PaginationService], imports: [[CommonModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: NgxPaginationModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    declarations: [
                        PaginatePipe,
                        PaginationControlsComponent,
                        PaginationControlsDirective
                    ],
                    providers: [PaginationService],
                    exports: [PaginatePipe, PaginationControlsComponent, PaginationControlsDirective]
                }]
        }] });

/*
 * Public API Surface of ngx-pagination
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NgxPaginationModule, PaginatePipe, PaginationControlsComponent, PaginationControlsDirective, PaginationService };
//# sourceMappingURL=ngx-pagination.mjs.map

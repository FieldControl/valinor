/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Component, ViewEncapsulation, Input, ContentChildren, QueryList, ElementRef, Optional, ChangeDetectionStrategy, } from '@angular/core';
import { MatGridTile } from './grid-tile';
import { TileCoordinator } from './tile-coordinator';
import { FitTileStyler, RatioTileStyler, FixedTileStyler, } from './tile-styler';
import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { MAT_GRID_LIST } from './grid-list-base';
// TODO(kara): Conditional (responsive) column count / row size.
// TODO(kara): Re-layout on window resize / media change (debounced).
// TODO(kara): gridTileHeader and gridTileFooter.
const MAT_FIT_MODE = 'fit';
export class MatGridList {
    constructor(_element, _dir) {
        this._element = _element;
        this._dir = _dir;
        /** The amount of space between tiles. This will be something like '5px' or '2em'. */
        this._gutter = '1px';
    }
    /** Amount of columns in the grid list. */
    get cols() { return this._cols; }
    set cols(value) {
        this._cols = Math.max(1, Math.round(coerceNumberProperty(value)));
    }
    /** Size of the grid list's gutter in pixels. */
    get gutterSize() { return this._gutter; }
    set gutterSize(value) { this._gutter = `${value == null ? '' : value}`; }
    /** Set internal representation of row height from the user-provided value. */
    get rowHeight() { return this._rowHeight; }
    set rowHeight(value) {
        const newValue = `${value == null ? '' : value}`;
        if (newValue !== this._rowHeight) {
            this._rowHeight = newValue;
            this._setTileStyler(this._rowHeight);
        }
    }
    ngOnInit() {
        this._checkCols();
        this._checkRowHeight();
    }
    /**
     * The layout calculation is fairly cheap if nothing changes, so there's little cost
     * to run it frequently.
     */
    ngAfterContentChecked() {
        this._layoutTiles();
    }
    /** Throw a friendly error if cols property is missing */
    _checkCols() {
        if (!this.cols && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error(`mat-grid-list: must pass in number of columns. ` +
                `Example: <mat-grid-list cols="3">`);
        }
    }
    /** Default to equal width:height if rowHeight property is missing */
    _checkRowHeight() {
        if (!this._rowHeight) {
            this._setTileStyler('1:1');
        }
    }
    /** Creates correct Tile Styler subtype based on rowHeight passed in by user */
    _setTileStyler(rowHeight) {
        if (this._tileStyler) {
            this._tileStyler.reset(this);
        }
        if (rowHeight === MAT_FIT_MODE) {
            this._tileStyler = new FitTileStyler();
        }
        else if (rowHeight && rowHeight.indexOf(':') > -1) {
            this._tileStyler = new RatioTileStyler(rowHeight);
        }
        else {
            this._tileStyler = new FixedTileStyler(rowHeight);
        }
    }
    /** Computes and applies the size and position for all children grid tiles. */
    _layoutTiles() {
        if (!this._tileCoordinator) {
            this._tileCoordinator = new TileCoordinator();
        }
        const tracker = this._tileCoordinator;
        const tiles = this._tiles.filter(tile => !tile._gridList || tile._gridList === this);
        const direction = this._dir ? this._dir.value : 'ltr';
        this._tileCoordinator.update(this.cols, tiles);
        this._tileStyler.init(this.gutterSize, tracker, this.cols, direction);
        tiles.forEach((tile, index) => {
            const pos = tracker.positions[index];
            this._tileStyler.setStyle(tile, pos.row, pos.col);
        });
        this._setListStyle(this._tileStyler.getComputedHeight());
    }
    /** Sets style on the main grid-list element, given the style name and value. */
    _setListStyle(style) {
        if (style) {
            this._element.nativeElement.style[style[0]] = style[1];
        }
    }
}
MatGridList.decorators = [
    { type: Component, args: [{
                selector: 'mat-grid-list',
                exportAs: 'matGridList',
                template: "<div>\n  <ng-content></ng-content>\n</div>",
                host: {
                    'class': 'mat-grid-list',
                    // Ensures that the "cols" input value is reflected in the DOM. This is
                    // needed for the grid-list harness.
                    '[attr.cols]': 'cols',
                },
                providers: [{
                        provide: MAT_GRID_LIST,
                        useExisting: MatGridList
                    }],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".mat-grid-list{display:block;position:relative}.mat-grid-tile{display:block;position:absolute;overflow:hidden}.mat-grid-tile .mat-grid-tile-header,.mat-grid-tile .mat-grid-tile-footer{display:flex;align-items:center;height:48px;color:#fff;background:rgba(0,0,0,.38);overflow:hidden;padding:0 16px;position:absolute;left:0;right:0}.mat-grid-tile .mat-grid-tile-header>*,.mat-grid-tile .mat-grid-tile-footer>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-grid-tile .mat-grid-tile-header.mat-2-line,.mat-grid-tile .mat-grid-tile-footer.mat-2-line{height:68px}.mat-grid-tile .mat-grid-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden}.mat-grid-tile .mat-grid-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-grid-tile .mat-grid-list-text:empty{display:none}.mat-grid-tile .mat-grid-tile-header{top:0}.mat-grid-tile .mat-grid-tile-footer{bottom:0}.mat-grid-tile .mat-grid-avatar{padding-right:16px}[dir=rtl] .mat-grid-tile .mat-grid-avatar{padding-right:0;padding-left:16px}.mat-grid-tile .mat-grid-avatar:empty{display:none}.mat-grid-tile-content{top:0;left:0;right:0;bottom:0;position:absolute;display:flex;align-items:center;justify-content:center;height:100%;padding:0;margin:0}\n"]
            },] }
];
MatGridList.ctorParameters = () => [
    { type: ElementRef },
    { type: Directionality, decorators: [{ type: Optional }] }
];
MatGridList.propDecorators = {
    _tiles: [{ type: ContentChildren, args: [MatGridTile, { descendants: true },] }],
    cols: [{ type: Input }],
    gutterSize: [{ type: Input }],
    rowHeight: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC1saXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2dyaWQtbGlzdC9ncmlkLWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxpQkFBaUIsRUFHakIsS0FBSyxFQUNMLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFFBQVEsRUFDUix1QkFBdUIsR0FDeEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUVMLGFBQWEsRUFDYixlQUFlLEVBQ2YsZUFBZSxHQUVoQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLG9CQUFvQixFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDeEUsT0FBTyxFQUFDLGFBQWEsRUFBa0IsTUFBTSxrQkFBa0IsQ0FBQztBQUdoRSxnRUFBZ0U7QUFDaEUscUVBQXFFO0FBQ3JFLGlEQUFpRDtBQUVqRCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7QUFvQjNCLE1BQU0sT0FBTyxXQUFXO0lBd0J0QixZQUFvQixRQUFpQyxFQUNyQixJQUFvQjtRQURoQyxhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUNyQixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQVZwRCxxRkFBcUY7UUFDN0UsWUFBTyxHQUFXLEtBQUssQ0FBQztJQVN1QixDQUFDO0lBRXhELDBDQUEwQztJQUMxQyxJQUNJLElBQUksS0FBYSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLElBQUksSUFBSSxDQUFDLEtBQWE7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJ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QUM7d0JBQ1YsT0FBTyxFQUFFLGFBQWE7d0JBQ3RCLFdBQVcsRUFBRSxXQUFXO3FCQUN6QixDQUFDO2dCQUNGLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFDdEM7OztZQXpDQyxVQUFVO1lBYUosY0FBYyx1QkFzRFAsUUFBUTs7O3FCQUhwQixlQUFlLFNBQUMsV0FBVyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzttQkFNaEQsS0FBSzt5QkFPTCxLQUFLO3dCQUtMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgT25Jbml0LFxuICBJbnB1dCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBRdWVyeUxpc3QsXG4gIEVsZW1lbnRSZWYsXG4gIE9wdGlvbmFsLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdEdyaWRUaWxlfSBmcm9tICcuL2dyaWQtdGlsZSc7XG5pbXBvcnQge1RpbGVDb29yZGluYXRvcn0gZnJvbSAnLi90aWxlLWNvb3JkaW5hdG9yJztcbmltcG9ydCB7XG4gIFRpbGVTdHlsZXIsXG4gIEZpdFRpbGVTdHlsZXIsXG4gIFJhdGlvVGlsZVN0eWxlcixcbiAgRml4ZWRUaWxlU3R5bGVyLFxuICBUaWxlU3R5bGVUYXJnZXQsXG59IGZyb20gJy4vdGlsZS1zdHlsZXInO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge01BVF9HUklEX0xJU1QsIE1hdEdyaWRMaXN0QmFzZX0gZnJvbSAnLi9ncmlkLWxpc3QtYmFzZSc7XG5cblxuLy8gVE9ETyhrYXJhKTogQ29uZGl0aW9uYWwgKHJlc3BvbnNpdmUpIGNvbHVtbiBjb3VudCAvIHJvdyBzaXplLlxuLy8gVE9ETyhrYXJhKTogUmUtbGF5b3V0IG9uIHdpbmRvdyByZXNpemUgLyBtZWRpYSBjaGFuZ2UgKGRlYm91bmNlZCkuXG4vLyBUT0RPKGthcmEpOiBncmlkVGlsZUhlYWRlciBhbmQgZ3JpZFRpbGVGb290ZXIuXG5cbmNvbnN0IE1BVF9GSVRfTU9ERSA9ICdmaXQnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtZ3JpZC1saXN0JyxcbiAgZXhwb3J0QXM6ICdtYXRHcmlkTGlzdCcsXG4gIHRlbXBsYXRlVXJsOiAnZ3JpZC1saXN0Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZ3JpZC1saXN0LmNzcyddLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1ncmlkLWxpc3QnLFxuICAgIC8vIEVuc3VyZXMgdGhhdCB0aGUgXCJjb2xzXCIgaW5wdXQgdmFsdWUgaXMgcmVmbGVjdGVkIGluIHRoZSBET00uIFRoaXMgaXNcbiAgICAvLyBuZWVkZWQgZm9yIHRoZSBncmlkLWxpc3QgaGFybmVzcy5cbiAgICAnW2F0dHIuY29sc10nOiAnY29scycsXG4gIH0sXG4gIHByb3ZpZGVyczogW3tcbiAgICBwcm92aWRlOiBNQVRfR1JJRF9MSVNULFxuICAgIHVzZUV4aXN0aW5nOiBNYXRHcmlkTGlzdFxuICB9XSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEdyaWRMaXN0IGltcGxlbWVudHMgTWF0R3JpZExpc3RCYXNlLCBPbkluaXQsIEFmdGVyQ29udGVudENoZWNrZWQsIFRpbGVTdHlsZVRhcmdldCB7XG4gIC8qKiBOdW1iZXIgb2YgY29sdW1ucyBiZWluZyByZW5kZXJlZC4gKi9cbiAgcHJpdmF0ZSBfY29sczogbnVtYmVyO1xuXG4gIC8qKiBVc2VkIGZvciBkZXRlcm1pbmluZ3RoZSBwb3NpdGlvbiBvZiBlYWNoIHRpbGUgaW4gdGhlIGdyaWQuICovXG4gIHByaXZhdGUgX3RpbGVDb29yZGluYXRvcjogVGlsZUNvb3JkaW5hdG9yO1xuXG4gIC8qKlxuICAgKiBSb3cgaGVpZ2h0IHZhbHVlIHBhc3NlZCBpbiBieSB1c2VyLiBUaGlzIGNhbiBiZSBvbmUgb2YgdGhyZWUgdHlwZXM6XG4gICAqIC0gTnVtYmVyIHZhbHVlIChleDogXCIxMDBweFwiKTogIHNldHMgYSBmaXhlZCByb3cgaGVpZ2h0IHRvIHRoYXQgdmFsdWVcbiAgICogLSBSYXRpbyB2YWx1ZSAoZXg6IFwiNDozXCIpOiBzZXRzIHRoZSByb3cgaGVpZ2h0IGJhc2VkIG9uIHdpZHRoOmhlaWdodCByYXRpb1xuICAgKiAtIFwiRml0XCIgbW9kZSAoZXg6IFwiZml0XCIpOiBzZXRzIHRoZSByb3cgaGVpZ2h0IHRvIHRvdGFsIGhlaWdodCBkaXZpZGVkIGJ5IG51bWJlciBvZiByb3dzXG4gICAqL1xuICBwcml2YXRlIF9yb3dIZWlnaHQ6IHN0cmluZztcblxuICAvKiogVGhlIGFtb3VudCBvZiBzcGFjZSBiZXR3ZWVuIHRpbGVzLiBUaGlzIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgJzVweCcgb3IgJzJlbScuICovXG4gIHByaXZhdGUgX2d1dHRlcjogc3RyaW5nID0gJzFweCc7XG5cbiAgLyoqIFNldHMgcG9zaXRpb24gYW5kIHNpemUgc3R5bGVzIGZvciBhIHRpbGUgKi9cbiAgcHJpdmF0ZSBfdGlsZVN0eWxlcjogVGlsZVN0eWxlcjtcblxuICAvKiogUXVlcnkgbGlzdCBvZiB0aWxlcyB0aGF0IGFyZSBiZWluZyByZW5kZXJlZC4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihNYXRHcmlkVGlsZSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX3RpbGVzOiBRdWVyeUxpc3Q8TWF0R3JpZFRpbGU+O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kaXI6IERpcmVjdGlvbmFsaXR5KSB7fVxuXG4gIC8qKiBBbW91bnQgb2YgY29sdW1ucyBpbiB0aGUgZ3JpZCBsaXN0LiAqL1xuICBASW5wdXQoKVxuICBnZXQgY29scygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fY29sczsgfVxuICBzZXQgY29scyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fY29scyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpKSk7XG4gIH1cblxuICAvKiogU2l6ZSBvZiB0aGUgZ3JpZCBsaXN0J3MgZ3V0dGVyIGluIHBpeGVscy4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGd1dHRlclNpemUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2d1dHRlcjsgfVxuICBzZXQgZ3V0dGVyU2l6ZSh2YWx1ZTogc3RyaW5nKSB7IHRoaXMuX2d1dHRlciA9IGAke3ZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlfWA7IH1cblxuICAvKiogU2V0IGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHJvdyBoZWlnaHQgZnJvbSB0aGUgdXNlci1wcm92aWRlZCB2YWx1ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHJvd0hlaWdodCgpOiBzdHJpbmcgfCBudW1iZXIgeyByZXR1cm4gdGhpcy5fcm93SGVpZ2h0OyB9XG4gIHNldCByb3dIZWlnaHQodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gYCR7dmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWV9YDtcblxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdGhpcy5fcm93SGVpZ2h0KSB7XG4gICAgICB0aGlzLl9yb3dIZWlnaHQgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMuX3NldFRpbGVTdHlsZXIodGhpcy5fcm93SGVpZ2h0KTtcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9jaGVja0NvbHMoKTtcbiAgICB0aGlzLl9jaGVja1Jvd0hlaWdodCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBsYXlvdXQgY2FsY3VsYXRpb24gaXMgZmFpcmx5IGNoZWFwIGlmIG5vdGhpbmcgY2hhbmdlcywgc28gdGhlcmUncyBsaXR0bGUgY29zdFxuICAgKiB0byBydW4gaXQgZnJlcXVlbnRseS5cbiAgICovXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICB0aGlzLl9sYXlvdXRUaWxlcygpO1xuICB9XG5cbiAgLyoqIFRocm93IGEgZnJpZW5kbHkgZXJyb3IgaWYgY29scyBwcm9wZXJ0eSBpcyBtaXNzaW5nICovXG4gIHByaXZhdGUgX2NoZWNrQ29scygpIHtcbiAgICBpZiAoIXRoaXMuY29scyAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYG1hdC1ncmlkLWxpc3Q6IG11c3QgcGFzcyBpbiBudW1iZXIgb2YgY29sdW1ucy4gYCArXG4gICAgICAgICAgICAgICAgICBgRXhhbXBsZTogPG1hdC1ncmlkLWxpc3QgY29scz1cIjNcIj5gKTtcbiAgICB9XG4gIH1cblxuICAvKiogRGVmYXVsdCB0byBlcXVhbCB3aWR0aDpoZWlnaHQgaWYgcm93SGVpZ2h0IHByb3BlcnR5IGlzIG1pc3NpbmcgKi9cbiAgcHJpdmF0ZSBfY2hlY2tSb3dIZWlnaHQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9yb3dIZWlnaHQpIHtcbiAgICAgIHRoaXMuX3NldFRpbGVTdHlsZXIoJzE6MScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGNvcnJlY3QgVGlsZSBTdHlsZXIgc3VidHlwZSBiYXNlZCBvbiByb3dIZWlnaHQgcGFzc2VkIGluIGJ5IHVzZXIgKi9cbiAgcHJpdmF0ZSBfc2V0VGlsZVN0eWxlcihyb3dIZWlnaHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLl90aWxlU3R5bGVyKSB7XG4gICAgICB0aGlzLl90aWxlU3R5bGVyLnJlc2V0KHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChyb3dIZWlnaHQgPT09IE1BVF9GSVRfTU9ERSkge1xuICAgICAgdGhpcy5fdGlsZVN0eWxlciA9IG5ldyBGaXRUaWxlU3R5bGVyKCk7XG4gICAgfSBlbHNlIGlmIChyb3dIZWlnaHQgJiYgcm93SGVpZ2h0LmluZGV4T2YoJzonKSA+IC0xKSB7XG4gICAgICB0aGlzLl90aWxlU3R5bGVyID0gbmV3IFJhdGlvVGlsZVN0eWxlcihyb3dIZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90aWxlU3R5bGVyID0gbmV3IEZpeGVkVGlsZVN0eWxlcihyb3dIZWlnaHQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21wdXRlcyBhbmQgYXBwbGllcyB0aGUgc2l6ZSBhbmQgcG9zaXRpb24gZm9yIGFsbCBjaGlsZHJlbiBncmlkIHRpbGVzLiAqL1xuICBwcml2YXRlIF9sYXlvdXRUaWxlcygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3RpbGVDb29yZGluYXRvcikge1xuICAgICAgdGhpcy5fdGlsZUNvb3JkaW5hdG9yID0gbmV3IFRpbGVDb29yZGluYXRvcigpO1xuICAgIH1cblxuXG4gICAgY29uc3QgdHJhY2tlciA9IHRoaXMuX3RpbGVDb29yZGluYXRvcjtcbiAgICBjb25zdCB0aWxlcyA9IHRoaXMuX3RpbGVzLmZpbHRlcih0aWxlID0+ICF0aWxlLl9ncmlkTGlzdCB8fCB0aWxlLl9ncmlkTGlzdCA9PT0gdGhpcyk7XG4gICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy5fZGlyID8gdGhpcy5fZGlyLnZhbHVlIDogJ2x0cic7XG5cbiAgICB0aGlzLl90aWxlQ29vcmRpbmF0b3IudXBkYXRlKHRoaXMuY29scywgdGlsZXMpO1xuICAgIHRoaXMuX3RpbGVTdHlsZXIuaW5pdCh0aGlzLmd1dHRlclNpemUsIHRyYWNrZXIsIHRoaXMuY29scywgZGlyZWN0aW9uKTtcblxuICAgIHRpbGVzLmZvckVhY2goKHRpbGUsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBwb3MgPSB0cmFja2VyLnBvc2l0aW9uc1tpbmRleF07XG4gICAgICB0aGlzLl90aWxlU3R5bGVyLnNldFN0eWxlKHRpbGUsIHBvcy5yb3csIHBvcy5jb2wpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc2V0TGlzdFN0eWxlKHRoaXMuX3RpbGVTdHlsZXIuZ2V0Q29tcHV0ZWRIZWlnaHQoKSk7XG4gIH1cblxuICAvKiogU2V0cyBzdHlsZSBvbiB0aGUgbWFpbiBncmlkLWxpc3QgZWxlbWVudCwgZ2l2ZW4gdGhlIHN0eWxlIG5hbWUgYW5kIHZhbHVlLiAqL1xuICBfc2V0TGlzdFN0eWxlKHN0eWxlOiBbc3RyaW5nLCBzdHJpbmcgfCBudWxsXSB8IG51bGwpOiB2b2lkIHtcbiAgICBpZiAoc3R5bGUpIHtcbiAgICAgICh0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuc3R5bGUgYXMgYW55KVtzdHlsZVswXV0gPSBzdHlsZVsxXTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29sczogTnVtYmVySW5wdXQ7XG59XG4iXX0=
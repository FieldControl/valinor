import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * The default pagination controls component. Actually just a default implementation of a custom template.
 */
export declare class PaginationControlsComponent {
    id: string;
    maxSize: number;
    get directionLinks(): boolean;
    set directionLinks(value: boolean);
    get autoHide(): boolean;
    set autoHide(value: boolean);
    get responsive(): boolean;
    set responsive(value: boolean);
    previousLabel: string;
    nextLabel: string;
    screenReaderPaginationLabel: string;
    screenReaderPageLabel: string;
    screenReaderCurrentLabel: string;
    pageChange: EventEmitter<number>;
    pageBoundsCorrection: EventEmitter<number>;
    private _directionLinks;
    private _autoHide;
    private _responsive;
    trackByIndex(index: number): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<PaginationControlsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PaginationControlsComponent, "pagination-controls", never, { "id": "id"; "maxSize": "maxSize"; "directionLinks": "directionLinks"; "autoHide": "autoHide"; "responsive": "responsive"; "previousLabel": "previousLabel"; "nextLabel": "nextLabel"; "screenReaderPaginationLabel": "screenReaderPaginationLabel"; "screenReaderPageLabel": "screenReaderPageLabel"; "screenReaderCurrentLabel": "screenReaderCurrentLabel"; }, { "pageChange": "pageChange"; "pageBoundsCorrection": "pageBoundsCorrection"; }, never, never>;
}

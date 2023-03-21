import { ChangeDetectorRef, OnDestroy, PipeTransform } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { AngularFireStorage } from '../storage';
import * as i0 from "@angular/core";
/** to be used with in combination with | async */
export declare class GetDownloadURLPipe implements PipeTransform, OnDestroy {
    private storage;
    private state;
    private asyncPipe;
    private path;
    private downloadUrl$;
    constructor(storage: AngularFireStorage, cdr: ChangeDetectorRef, state: TransferState);
    transform(path: string): any;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GetDownloadURLPipe, [null, null, { optional: true; }]>;
    static ɵpipe: i0.ɵɵPipeDeclaration<GetDownloadURLPipe, "getDownloadURL">;
}
export declare class GetDownloadURLPipeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<GetDownloadURLPipeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<GetDownloadURLPipeModule, [typeof GetDownloadURLPipe], never, [typeof GetDownloadURLPipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<GetDownloadURLPipeModule>;
}

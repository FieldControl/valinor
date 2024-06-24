import { ComponentRef, Injector, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Overlay } from '../overlay/overlay';
import { ToastRef } from './toast-ref';
import { ToastContainerDirective } from './toast.directive';
import { GlobalConfig, IndividualConfig, ToastToken } from './toastr-config';
import * as i0 from "@angular/core";
export interface ActiveToast<C> {
    /** Your Toast ID. Use this to close it individually */
    toastId: number;
    /** the title of your toast. Stored to prevent duplicates */
    title: string;
    /** the message of your toast. Stored to prevent duplicates */
    message: string;
    /** a reference to the component see portal.ts */
    portal: ComponentRef<C>;
    /** a reference to your toast */
    toastRef: ToastRef<C>;
    /** triggered when toast is active */
    onShown: Observable<void>;
    /** triggered when toast is destroyed */
    onHidden: Observable<void>;
    /** triggered on toast click */
    onTap: Observable<void>;
    /** available for your use in custom toast */
    onAction: Observable<any>;
}
export declare class ToastrService {
    private overlay;
    private _injector;
    private sanitizer;
    private ngZone;
    toastrConfig: GlobalConfig;
    currentlyActive: number;
    toasts: ActiveToast<any>[];
    overlayContainer?: ToastContainerDirective;
    previousToastMessage: string | undefined;
    private index;
    constructor(token: ToastToken, overlay: Overlay, _injector: Injector, sanitizer: DomSanitizer, ngZone: NgZone);
    /** show toast */
    show<ConfigPayload = any>(message?: string, title?: string, override?: Partial<IndividualConfig<ConfigPayload>>, type?: string): ActiveToast<any>;
    /** show successful toast */
    success<ConfigPayload = any>(message?: string, title?: string, override?: Partial<IndividualConfig<ConfigPayload>>): ActiveToast<any>;
    /** show error toast */
    error<ConfigPayload = any>(message?: string, title?: string, override?: Partial<IndividualConfig<ConfigPayload>>): ActiveToast<any>;
    /** show info toast */
    info<ConfigPayload = any>(message?: string, title?: string, override?: Partial<IndividualConfig<ConfigPayload>>): ActiveToast<any>;
    /** show warning toast */
    warning<ConfigPayload = any>(message?: string, title?: string, override?: Partial<IndividualConfig<ConfigPayload>>): ActiveToast<any>;
    /**
     * Remove all or a single toast by id
     */
    clear(toastId?: number): void;
    /**
     * Remove and destroy a single toast by id
     */
    remove(toastId: number): boolean;
    /**
     * Determines if toast message is already shown
     */
    findDuplicate(title: string, message: string, resetOnDuplicate: boolean, countDuplicates: boolean): ActiveToast<any>;
    /** create a clone of global config and apply individual settings */
    private applyConfig;
    /**
     * Find toast object by id
     */
    private _findToast;
    /**
     * Determines the need to run inside angular's zone then builds the toast
     */
    private _preBuildNotification;
    /**
     * Creates and attaches toast data to component
     * returns the active toast, or in case preventDuplicates is enabled the original/non-duplicate active toast.
     */
    private _buildNotification;
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastrService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ToastrService>;
}

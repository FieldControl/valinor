import { NgZone, OnDestroy, WritableSignal } from '@angular/core';
import { IndividualConfig, ToastPackage } from './toastr-config';
import { ToastrService } from './toastr.service';
import * as i0 from "@angular/core";
export declare class Toast<ConfigPayload = any> implements OnDestroy {
    protected toastrService: ToastrService;
    toastPackage: ToastPackage;
    protected ngZone?: NgZone;
    message?: string | null;
    title?: string;
    options: IndividualConfig<ConfigPayload>;
    duplicatesCount: number;
    originalTimeout: number;
    /** width of progress bar */
    width: WritableSignal<number>;
    /** a combination of toast type and options.toastClass */
    toastClasses: string;
    state: WritableSignal<{
        value: 'inactive' | 'active' | 'removed';
        params: {
            easeTime: number | string;
            easing: string;
        };
    }>;
    /** controls animation */
    get _state(): {
        value: "inactive" | "active" | "removed";
        params: {
            easeTime: string | number;
            easing: string;
        };
    };
    /** hides component when waiting to be displayed */
    get displayStyle(): string | undefined;
    private timeout;
    private intervalId;
    private hideTime;
    private sub;
    private sub1;
    private sub2;
    private sub3;
    constructor(toastrService: ToastrService, toastPackage: ToastPackage, ngZone?: NgZone);
    ngOnDestroy(): void;
    /**
     * activates toast and sets timeout
     */
    activateToast(): void;
    /**
     * updates progress bar width
     */
    updateProgress(): void;
    resetTimeout(): void;
    /**
     * tells toastrService to remove this toast after animation time
     */
    remove(): void;
    tapToast(): void;
    stickAround(): void;
    delayedHideToast(): void;
    outsideTimeout(func: () => any, timeout: number): void;
    outsideInterval(func: () => any, timeout: number): void;
    private runInsideAngular;
    static ɵfac: i0.ɵɵFactoryDeclaration<Toast<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Toast<any>, "[toast-component]", never, {}, {}, never, never, true, never>;
}

import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ComponentType } from '../portal/portal';
import { ToastRef } from './toast-ref';
export type ProgressAnimationType = 'increasing' | 'decreasing';
export type DisableTimoutType = boolean | 'timeOut' | 'extendedTimeOut';
/**
 * Configuration for an individual toast.
 */
export interface IndividualConfig<ConfigPayload = any> {
    /**
     * disable both timeOut and extendedTimeOut
     * default: false
     */
    disableTimeOut: DisableTimoutType;
    /**
     * toast time to live in milliseconds
     * default: 5000
     */
    timeOut: number;
    /**
     * toast show close button
     * default: false
     */
    closeButton: boolean;
    /**
     * time to close after a user hovers over toast
     * default: 1000
     */
    extendedTimeOut: number;
    /**
     * show toast progress bar
     * default: false
     */
    progressBar: boolean;
    /**
     * changes toast progress bar animation
     * default: decreasing
     */
    progressAnimation: ProgressAnimationType;
    /**
     * render html in toast message (possibly unsafe)
     * default: false
     */
    enableHtml: boolean;
    /**
     * css class on toast component
     * default: ngx-toastr
     */
    toastClass: string;
    /**
     * css class on toast container
     * default: toast-top-right
     */
    positionClass: string;
    /**
     * css class on toast title
     * default: toast-title
     */
    titleClass: string;
    /**
     * css class on toast message
     * default: toast-message
     */
    messageClass: string;
    /**
     * animation easing on toast
     * default: ease-in
     */
    easing: string;
    /**
     * animation ease time on toast
     * default: 300
     */
    easeTime: string | number;
    /**
     * clicking on toast dismisses it
     * default: true
     */
    tapToDismiss: boolean;
    /**
     * Angular toast component to be shown
     * default: Toast
     */
    toastComponent?: ComponentType<any>;
    /**
     * Helps show toast from a websocket or from event outside Angular
     * default: false
     */
    onActivateTick: boolean;
    /**
     * New toast placement
     * default: true
     */
    newestOnTop: boolean;
    /**
     * Payload to pass to the toast component
     */
    payload?: ConfigPayload;
}
export interface ToastrIconClasses {
    error: string;
    info: string;
    success: string;
    warning: string;
    [key: string]: string;
}
/**
 * Global Toast configuration
 * Includes all IndividualConfig
 */
export interface GlobalConfig extends IndividualConfig {
    /**
     * max toasts opened. Toasts will be queued
     * Zero is unlimited
     * default: 0
     */
    maxOpened: number;
    /**
     * dismiss current toast when max is reached
     * default: false
     */
    autoDismiss: boolean;
    iconClasses: Partial<ToastrIconClasses>;
    /**
     * block duplicate messages
     * default: false
     */
    preventDuplicates: boolean;
    /**
     * display the number of duplicate messages
     * default: false
     */
    countDuplicates: boolean;
    /**
     * Reset toast timeout when there's a duplicate (preventDuplicates needs to be set to true)
     * default: false
     */
    resetTimeoutOnDuplicate: boolean;
    /**
     * consider the title of a toast when checking if duplicate
     * default: false
     */
    includeTitleDuplicates: boolean;
}
/**
 * Everything a toast needs to launch
 */
export declare class ToastPackage<ConfigPayload = any> {
    toastId: number;
    config: IndividualConfig<ConfigPayload>;
    message: string | null | undefined;
    title: string | undefined;
    toastType: string;
    toastRef: ToastRef<any>;
    private _onTap;
    private _onAction;
    constructor(toastId: number, config: IndividualConfig<ConfigPayload>, message: string | null | undefined, title: string | undefined, toastType: string, toastRef: ToastRef<any>);
    /** Fired on click */
    triggerTap(): void;
    onTap(): Observable<void>;
    /** available for use in custom toast */
    triggerAction(action?: any): void;
    onAction(): Observable<void>;
}
/** @deprecated use GlobalConfig */
export interface GlobalToastrConfig extends GlobalConfig {
}
/** @deprecated use IndividualConfig */
export interface IndividualToastrConfig extends IndividualConfig {
}
/** @deprecated use IndividualConfig */
export interface ToastrConfig extends IndividualConfig {
}
export declare const DefaultNoComponentGlobalConfig: GlobalConfig;
export interface ToastToken {
    default: GlobalConfig;
    config: Partial<GlobalConfig>;
}
export declare const TOAST_CONFIG: InjectionToken<ToastToken>;

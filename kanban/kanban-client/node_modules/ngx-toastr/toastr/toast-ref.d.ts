import { Observable } from 'rxjs';
import { OverlayRef } from '../overlay/overlay-ref';
/**
 * Reference to a toast opened via the Toastr service.
 */
export declare class ToastRef<T> {
    private _overlayRef;
    /** The instance of component opened into the toast. */
    componentInstance: T;
    /** Count of duplicates of this toast */
    private duplicatesCount;
    /** Subject for notifying the user that the toast has finished closing. */
    private _afterClosed;
    /** triggered when toast is activated */
    private _activate;
    /** notifies the toast that it should close before the timeout */
    private _manualClose;
    /** notifies the toast that it should reset the timeouts */
    private _resetTimeout;
    /** notifies the toast that it should count a duplicate toast */
    private _countDuplicate;
    constructor(_overlayRef: OverlayRef);
    manualClose(): void;
    manualClosed(): Observable<any>;
    timeoutReset(): Observable<any>;
    countDuplicate(): Observable<number>;
    /**
     * Close the toast.
     */
    close(): void;
    /** Gets an observable that is notified when the toast is finished closing. */
    afterClosed(): Observable<any>;
    isInactive(): boolean;
    activate(): void;
    /** Gets an observable that is notified when the toast has started opening. */
    afterActivate(): Observable<any>;
    /** Reset the toast timouts and count duplicates */
    onDuplicate(resetTimeout: boolean, countDuplicate: boolean): void;
}

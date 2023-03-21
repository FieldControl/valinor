import { NgZone } from '@angular/core';
import { Observable, SchedulerAction, SchedulerLike, Subscription } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * Schedules tasks so that they are invoked inside the Zone that is passed in the constructor.
 */
export declare class ɵZoneScheduler implements SchedulerLike {
    private zone;
    private delegate;
    constructor(zone: any, delegate?: any);
    now(): any;
    schedule(work: (this: SchedulerAction<any>, state?: any) => void, delay?: number, state?: any): Subscription;
}
export declare class ɵAngularFireSchedulers {
    ngZone: NgZone;
    readonly outsideAngular: ɵZoneScheduler;
    readonly insideAngular: ɵZoneScheduler;
    constructor(ngZone: NgZone);
    static ɵfac: i0.ɵɵFactoryDeclaration<ɵAngularFireSchedulers, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ɵAngularFireSchedulers>;
}
export declare function observeOutsideAngular<T>(obs$: Observable<T>): Observable<T>;
export declare function observeInsideAngular<T>(obs$: Observable<T>): Observable<T>;
export declare function keepUnstableUntilFirst<T>(obs$: Observable<T>): Observable<T>;
/**
 * Operator to block the zone until the first value has been emitted or the observable
 * has completed/errored. This is used to make sure that universal waits until the first
 * value from firebase but doesn't block the zone forever since the firebase subscription
 * is still alive.
 */
export declare function ɵkeepUnstableUntilFirstFactory(schedulers: ɵAngularFireSchedulers): <T>(obs$: Observable<T>) => Observable<T>;
export declare const ɵzoneWrap: <T = unknown>(it: T, blockUntilFirst: boolean) => T;

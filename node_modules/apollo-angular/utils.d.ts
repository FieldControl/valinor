import { NgZone } from '@angular/core';
import type { ObservableQuery, ApolloQueryResult, FetchResult, Observable as AObservable } from '@apollo/client/core';
import type { Subscription, SchedulerLike, SchedulerAction } from 'rxjs';
import { Observable } from 'rxjs';
import type { MutationResult } from './types';
export declare function fromPromise<T>(promiseFn: () => Promise<T>): Observable<T>;
export declare function useMutationLoading<T>(source: Observable<FetchResult<T>>, enabled: boolean): Observable<MutationResult<T>>;
export declare class ZoneScheduler implements SchedulerLike {
    private zone;
    constructor(zone: NgZone);
    now: () => number;
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}
export declare function fixObservable<T>(obs: ObservableQuery<T>): Observable<ApolloQueryResult<T>>;
export declare function fixObservable<T>(obs: AObservable<T>): Observable<T>;
export declare function wrapWithZone<T>(obs: Observable<T>, ngZone: NgZone): Observable<T>;
export declare function pickFlag<TFlags, K extends keyof TFlags>(flags: TFlags | undefined, flag: K, defaultValue: TFlags[K]): TFlags[K];

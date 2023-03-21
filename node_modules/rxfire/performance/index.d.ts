import { Observable } from 'rxjs';
declare type FirebaseApp = import('firebase/app').FirebaseApp;
/**
 * Lazy loads Firebase Performance monitoring and returns the instance as
 * an observable
 * @param app
 * @returns Observable<FirebasePerformance>
 */
export declare const getPerformance$: (app: FirebaseApp) => Observable<import("firebase/performance").FirebasePerformance>;
/**
 * Creates a function that creates an observable that begins a trace with a given id. The trace is ended
 * when the observable unsubscribes. The measurement is also logged as a performance
 * entry.
 * @param name
 * @returns (source$: Observable<T>) => Observable<T>
 */
export declare const trace: <T = any>(name: string) => (source$: Observable<T>) => Observable<T>;
/**
 * Creates a function that creates an observable that begins a trace with a given name. The trace runs until
 * a condition resolves to true and then the observable unsubscribes and ends the trace.
 * @param name
 * @param test
 * @param options
 * @returns (source$: Observable<T>) => Observable<T>
 */
export declare const traceUntil: <T = any>(name: string, test: (a: T) => boolean, options?: {
    orComplete?: boolean | undefined;
} | undefined) => (source$: Observable<T>) => Observable<T>;
/**
 * Creates a function that creates an observable that begins a trace with a given name. The trace runs while
 * a condition resolves to true. Once the condition fails the observable unsubscribes
 * and ends the trace.
 * @param name
 * @param test
 * @param options
 * @returns (source$: Observable<T>) => Observable<T>
 */
export declare const traceWhile: <T = any>(name: string, test: (a: T) => boolean, options?: {
    orComplete?: boolean | undefined;
} | undefined) => (source$: Observable<T>) => Observable<T>;
/**
 * Creates a function that creates an observable that begins a trace with a given name. The trace runs until the
 * observable fully completes.
 * @param name
 * @returns (source$: Observable<T>) => Observable<T>
 */
export declare const traceUntilComplete: <T = any>(name: string) => (source$: Observable<T>) => Observable<T>;
/**
 * Creates a function that creates an observable that begins a trace with a given name.
 * The trace runs until the first value emits from the provided observable.
 * @param name
 * @returns (source$: Observable<T>) => Observable<T>
 */
export declare const traceUntilFirst: <T = any>(name: string) => (source$: Observable<T>) => Observable<T>;
export {};

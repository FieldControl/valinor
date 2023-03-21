export declare const traceUntil: <T = any>(name: string, test: (a: T) => boolean, options?: {
    orComplete?: boolean;
}) => (source$: import("rxjs").Observable<T>) => import("rxjs").Observable<T>;
export declare const traceWhile: <T = any>(name: string, test: (a: T) => boolean, options?: {
    orComplete?: boolean;
}) => (source$: import("rxjs").Observable<T>) => import("rxjs").Observable<T>;
export declare const traceUntilComplete: <T = any>(name: string) => (source$: import("rxjs").Observable<T>) => import("rxjs").Observable<T>;
export declare const traceUntilFirst: <T = any>(name: string) => (source$: import("rxjs").Observable<T>) => import("rxjs").Observable<T>;

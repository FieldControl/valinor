import { Observable } from 'rxjs';
type TapResponseObserver<T, E> = {
    next: (value: T) => void;
    error: (error: E) => void;
    complete?: () => void;
    finalize?: () => void;
};
export declare function tapResponse<T, E = unknown>(observer: TapResponseObserver<T, E>): (source$: Observable<T>) => Observable<T>;
export declare function tapResponse<T, E = unknown>(next: (value: T) => void, error: (error: E) => void, complete?: () => void): (source$: Observable<T>) => Observable<T>;
export {};

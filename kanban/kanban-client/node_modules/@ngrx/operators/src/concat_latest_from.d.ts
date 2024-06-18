import { Observable, ObservedValueOf, OperatorFunction } from 'rxjs';
export declare function concatLatestFrom<T extends Observable<unknown>[], V>(observablesFactory: (value: V) => [...T]): OperatorFunction<V, [V, ...{
    [i in keyof T]: ObservedValueOf<T[i]>;
}]>;
export declare function concatLatestFrom<T extends Observable<unknown>, V>(observableFactory: (value: V) => T): OperatorFunction<V, [V, ObservedValueOf<T>]>;

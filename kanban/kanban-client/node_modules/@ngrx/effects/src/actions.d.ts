import { Action, ActionCreator, Creator } from '@ngrx/store';
import { Observable, OperatorFunction, Operator } from 'rxjs';
import * as i0 from "@angular/core";
export declare class Actions<V = Action> extends Observable<V> {
    constructor(source?: Observable<V>);
    lift<R>(operator: Operator<V, R>): Observable<R>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Actions<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Actions<any>>;
}
type ActionExtractor<T extends string | AC, AC extends ActionCreator<string, Creator>, E> = T extends string ? E : ReturnType<Extract<T, AC>>;
export declare function ofType<AC extends ActionCreator<string, Creator>[], U extends Action = Action, V = ReturnType<AC[number]>>(...allowedTypes: AC): OperatorFunction<U, V>;
export declare function ofType<E extends Extract<U, {
    type: T1;
}>, AC extends ActionCreator<string, Creator>, T1 extends string | AC, U extends Action = Action, V = T1 extends string ? E : ReturnType<Extract<T1, AC>>>(t1: T1): OperatorFunction<U, V>;
export declare function ofType<E extends Extract<U, {
    type: T1 | T2;
}>, AC extends ActionCreator<string, Creator>, T1 extends string | AC, T2 extends string | AC, U extends Action = Action, V = ActionExtractor<T1 | T2, AC, E>>(t1: T1, t2: T2): OperatorFunction<U, V>;
export declare function ofType<E extends Extract<U, {
    type: T1 | T2 | T3;
}>, AC extends ActionCreator<string, Creator>, T1 extends string | AC, T2 extends string | AC, T3 extends string | AC, U extends Action = Action, V = ActionExtractor<T1 | T2 | T3, AC, E>>(t1: T1, t2: T2, t3: T3): OperatorFunction<U, V>;
export declare function ofType<E extends Extract<U, {
    type: T1 | T2 | T3 | T4;
}>, AC extends ActionCreator<string, Creator>, T1 extends string | AC, T2 extends string | AC, T3 extends string | AC, T4 extends string | AC, U extends Action = Action, V = ActionExtractor<T1 | T2 | T3 | T4, AC, E>>(t1: T1, t2: T2, t3: T3, t4: T4): OperatorFunction<U, V>;
export declare function ofType<E extends Extract<U, {
    type: T1 | T2 | T3 | T4 | T5;
}>, AC extends ActionCreator<string, Creator>, T1 extends string | AC, T2 extends string | AC, T3 extends string | AC, T4 extends string | AC, T5 extends string | AC, U extends Action = Action, V = ActionExtractor<T1 | T2 | T3 | T4 | T5, AC, E>>(t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): OperatorFunction<U, V>;
/**
 * Fallback for more than 5 arguments.
 * There is no inference, so the return type is the same as the input -
 * Observable<Action>.
 *
 * We provide a type parameter, even though TS will not infer it from the
 * arguments, to preserve backwards compatibility with old versions of ngrx.
 */
export declare function ofType<V extends Action>(...allowedTypes: Array<string | ActionCreator<string, Creator>>): OperatorFunction<Action, V>;
export {};

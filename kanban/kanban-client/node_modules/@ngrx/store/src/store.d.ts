import { Provider, Signal } from '@angular/core';
import { Observable, Observer, Operator } from 'rxjs';
import { ActionsSubject } from './actions_subject';
import { Action, ActionReducer, SelectSignalOptions, FunctionIsNotAllowed } from './models';
import { ReducerManager } from './reducer_manager';
import { StateObservable } from './state';
import * as i0 from "@angular/core";
export declare class Store<T = object> extends Observable<T> implements Observer<Action> {
    private actionsObserver;
    private reducerManager;
    constructor(state$: StateObservable, actionsObserver: ActionsSubject, reducerManager: ReducerManager);
    select<K>(mapFn: (state: T) => K): Observable<K>;
    /**
     * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
     */
    select<K, Props = any>(mapFn: (state: T, props: Props) => K, props: Props): Observable<K>;
    select<a extends keyof T>(key: a): Observable<T[a]>;
    select<a extends keyof T, b extends keyof T[a]>(key1: a, key2: b): Observable<T[a][b]>;
    select<a extends keyof T, b extends keyof T[a], c extends keyof T[a][b]>(key1: a, key2: b, key3: c): Observable<T[a][b][c]>;
    select<a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c]>(key1: a, key2: b, key3: c, key4: d): Observable<T[a][b][c][d]>;
    select<a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c], e extends keyof T[a][b][c][d]>(key1: a, key2: b, key3: c, key4: d, key5: e): Observable<T[a][b][c][d][e]>;
    select<a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c], e extends keyof T[a][b][c][d], f extends keyof T[a][b][c][d][e]>(key1: a, key2: b, key3: c, key4: d, key5: e, key6: f): Observable<T[a][b][c][d][e][f]>;
    select<a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c], e extends keyof T[a][b][c][d], f extends keyof T[a][b][c][d][e], K = any>(key1: a, key2: b, key3: c, key4: d, key5: e, key6: f, ...paths: string[]): Observable<K>;
    /**
     * Returns a signal of the provided selector.
     *
     * @param selector selector function
     * @param options select signal options
     */
    selectSignal<K>(selector: (state: T) => K, options?: SelectSignalOptions<K>): Signal<K>;
    lift<R>(operator: Operator<T, R>): Store<R>;
    dispatch<V extends Action = Action>(action: V & FunctionIsNotAllowed<V, 'Functions are not allowed to be dispatched. Did you forget to call the action creator function?'>): void;
    next(action: Action): void;
    error(err: any): void;
    complete(): void;
    addReducer<State, Actions extends Action = Action>(key: string, reducer: ActionReducer<State, Actions>): void;
    removeReducer<Key extends Extract<keyof T, string>>(key: Key): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Store<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Store<any>>;
}
export declare const STORE_PROVIDERS: Provider[];
export declare function select<T, K>(mapFn: (state: T) => K): (source$: Observable<T>) => Observable<K>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function select<T, Props, K>(mapFn: (state: T, props: Props) => K, props: Props): (source$: Observable<T>) => Observable<K>;
export declare function select<T, a extends keyof T>(key: a): (source$: Observable<T>) => Observable<T[a]>;
export declare function select<T, a extends keyof T, b extends keyof T[a]>(key1: a, key2: b): (source$: Observable<T>) => Observable<T[a][b]>;
export declare function select<T, a extends keyof T, b extends keyof T[a], c extends keyof T[a][b]>(key1: a, key2: b, key3: c): (source$: Observable<T>) => Observable<T[a][b][c]>;
export declare function select<T, a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c]>(key1: a, key2: b, key3: c, key4: d): (source$: Observable<T>) => Observable<T[a][b][c][d]>;
export declare function select<T, a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c], e extends keyof T[a][b][c][d]>(key1: a, key2: b, key3: c, key4: d, key5: e): (source$: Observable<T>) => Observable<T[a][b][c][d][e]>;
export declare function select<T, a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c], e extends keyof T[a][b][c][d], f extends keyof T[a][b][c][d][e]>(key1: a, key2: b, key3: c, key4: d, key5: e, key6: f): (source$: Observable<T>) => Observable<T[a][b][c][d][e][f]>;
export declare function select<T, a extends keyof T, b extends keyof T[a], c extends keyof T[a][b], d extends keyof T[a][b][c], e extends keyof T[a][b][c][d], f extends keyof T[a][b][c][d][e], K = any>(key1: a, key2: b, key3: c, key4: d, key5: e, key6: f, ...paths: string[]): (source$: Observable<T>) => Observable<K>;

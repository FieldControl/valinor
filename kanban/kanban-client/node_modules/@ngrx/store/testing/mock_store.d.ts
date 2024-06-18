import { Observable } from 'rxjs';
import { Action, ActionsSubject, ReducerManager, Store, MemoizedSelectorWithProps, MemoizedSelector } from '@ngrx/store';
import { MockState } from './mock_state';
import { MockSelector } from './mock_selector';
import * as i0 from "@angular/core";
type OnlyMemoized<T, Result> = T extends string | MemoizedSelector<any, any> ? MemoizedSelector<any, Result> : T extends MemoizedSelectorWithProps<any, any, any> ? MemoizedSelectorWithProps<any, any, Result> : never;
type Memoized<Result> = MemoizedSelector<any, Result> | MemoizedSelectorWithProps<any, any, Result>;
export declare class MockStore<T = object> extends Store<T> {
    private state$;
    private initialState;
    private readonly selectors;
    readonly scannedActions$: Observable<Action>;
    private lastState?;
    constructor(state$: MockState<T>, actionsObserver: ActionsSubject, reducerManager: ReducerManager, initialState: T, mockSelectors?: MockSelector[]);
    setState(nextState: T): void;
    overrideSelector<Selector extends Memoized<Result>, Value extends Result, Result = Selector extends MemoizedSelector<any, infer T> ? T : Selector extends MemoizedSelectorWithProps<any, any, infer U> ? U : Value>(selector: Selector | string, value: Value): OnlyMemoized<typeof selector, Result>;
    resetSelectors(): void;
    select(selector: any, prop?: any): Observable<any>;
    addReducer(): void;
    removeReducer(): void;
    /**
     * Refreshes the existing state.
     */
    refreshState(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MockStore<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MockStore<any>>;
}
export {};

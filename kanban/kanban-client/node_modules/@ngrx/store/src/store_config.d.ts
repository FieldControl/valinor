import { InjectionToken } from '@angular/core';
import { Action, ActionReducer, ActionReducerMap, ActionReducerFactory, StoreFeature, InitialState, MetaReducer, RuntimeChecks } from './models';
import { combineReducers } from './utils';
export interface StoreConfig<T, V extends Action = Action> {
    initialState?: InitialState<T>;
    reducerFactory?: ActionReducerFactory<T, V>;
    metaReducers?: MetaReducer<{
        [P in keyof T]: T[P];
    }, V>[];
}
export interface RootStoreConfig<T, V extends Action = Action> extends StoreConfig<T, V> {
    runtimeChecks?: Partial<RuntimeChecks>;
}
/**
 * An object with the name and the reducer for the feature.
 */
export interface FeatureSlice<T, V extends Action = Action> {
    name: string;
    reducer: ActionReducer<T, V>;
}
export declare function _createStoreReducers<T, V extends Action = Action>(reducers: ActionReducerMap<T, V> | InjectionToken<ActionReducerMap<T, V>>): ActionReducerMap<T, V>;
export declare function _createFeatureStore<T, V extends Action = Action>(configs: StoreConfig<T, V>[] | InjectionToken<StoreConfig<T, V>>[], featureStores: StoreFeature<T, V>[]): (StoreFeature<T, V> | {
    key: string;
    reducerFactory: ActionReducerFactory<T, V> | typeof combineReducers;
    metaReducers: MetaReducer<{ [P in keyof T]: T[P]; }, V>[];
    initialState: InitialState<T> | undefined;
})[];
export declare function _createFeatureReducers<T, V extends Action = Action>(reducerCollection: Array<ActionReducerMap<T, V> | InjectionToken<ActionReducerMap<T, V>>>): ActionReducerMap<T, V>[];
export declare function _initialStateFactory(initialState: any): any;
export declare function _concatMetaReducers(metaReducers: MetaReducer[], userProvidedMetaReducers: MetaReducer[]): MetaReducer[];
export declare function _provideForRootGuard(): unknown;

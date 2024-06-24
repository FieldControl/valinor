import { EnvironmentProviders, InjectionToken, Provider } from '@angular/core';
import { Action, ActionReducer, ActionReducerMap } from './models';
import { FeatureSlice, RootStoreConfig, StoreConfig } from './store_config';
export declare function provideState<T, V extends Action = Action>(featureName: string, reducers: ActionReducerMap<T, V> | InjectionToken<ActionReducerMap<T, V>>, config?: StoreConfig<T, V> | InjectionToken<StoreConfig<T, V>>): EnvironmentProviders;
export declare function provideState<T, V extends Action = Action>(featureName: string, reducer: ActionReducer<T, V> | InjectionToken<ActionReducer<T, V>>, config?: StoreConfig<T, V> | InjectionToken<StoreConfig<T, V>>): EnvironmentProviders;
export declare function provideState<T, V extends Action = Action>(slice: FeatureSlice<T, V>): EnvironmentProviders;
export declare function _provideStore<T, V extends Action = Action>(reducers?: ActionReducerMap<T, V> | InjectionToken<ActionReducerMap<T, V>> | Record<string, never>, config?: RootStoreConfig<T, V>): Provider[];
/**
 * Provides the global Store providers and initializes
 * the Store.
 * These providers cannot be used at the component level.
 *
 * @usageNotes
 *
 * ### Providing the Global Store
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideStore()],
 * });
 * ```
 */
export declare function provideStore<T, V extends Action = Action>(reducers?: ActionReducerMap<T, V> | InjectionToken<ActionReducerMap<T, V>>, config?: RootStoreConfig<T, V>): EnvironmentProviders;
export declare function _provideState<T, V extends Action = Action>(featureNameOrSlice: string | FeatureSlice<T, V>, reducers?: ActionReducerMap<T, V> | InjectionToken<ActionReducerMap<T, V>> | ActionReducer<T, V> | InjectionToken<ActionReducer<T, V>>, config?: StoreConfig<T, V> | InjectionToken<StoreConfig<T, V>>): Provider[];

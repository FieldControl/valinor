import { InjectionToken } from '@angular/core';
import { RuntimeChecks, MetaReducer } from './models';
export declare const _ROOT_STORE_GUARD: InjectionToken<void>;
export declare const _INITIAL_STATE: InjectionToken<unknown>;
export declare const INITIAL_STATE: InjectionToken<unknown>;
export declare const REDUCER_FACTORY: InjectionToken<unknown>;
export declare const _REDUCER_FACTORY: InjectionToken<unknown>;
export declare const INITIAL_REDUCERS: InjectionToken<unknown>;
export declare const _INITIAL_REDUCERS: InjectionToken<unknown>;
export declare const STORE_FEATURES: InjectionToken<unknown>;
export declare const _STORE_REDUCERS: InjectionToken<unknown>;
export declare const _FEATURE_REDUCERS: InjectionToken<unknown>;
export declare const _FEATURE_CONFIGS: InjectionToken<unknown>;
export declare const _STORE_FEATURES: InjectionToken<unknown>;
export declare const _FEATURE_REDUCERS_TOKEN: InjectionToken<unknown>;
export declare const FEATURE_REDUCERS: InjectionToken<unknown>;
/**
 * User-defined meta reducers from StoreModule.forRoot()
 */
export declare const USER_PROVIDED_META_REDUCERS: InjectionToken<MetaReducer[]>;
/**
 * Meta reducers defined either internally by @ngrx/store or by library authors
 */
export declare const META_REDUCERS: InjectionToken<MetaReducer[]>;
/**
 * Concats the user provided meta reducers and the meta reducers provided on the multi
 * injection token
 */
export declare const _RESOLVED_META_REDUCERS: InjectionToken<MetaReducer>;
/**
 * Runtime checks defined by the user via an InjectionToken
 * Defaults to `_USER_RUNTIME_CHECKS`
 */
export declare const USER_RUNTIME_CHECKS: InjectionToken<RuntimeChecks>;
/**
 * Runtime checks defined by the user via forRoot()
 */
export declare const _USER_RUNTIME_CHECKS: InjectionToken<RuntimeChecks>;
/**
 * Runtime checks currently in use
 */
export declare const ACTIVE_RUNTIME_CHECKS: InjectionToken<RuntimeChecks>;
export declare const _ACTION_TYPE_UNIQUENESS_CHECK: InjectionToken<void>;
/**
 * InjectionToken that registers the global Store.
 * Mainly used to provide a hook that can be injected
 * to ensure the root state is loaded before something
 * that depends on it.
 */
export declare const ROOT_STORE_PROVIDER: InjectionToken<void>;
/**
 * InjectionToken that registers feature states.
 * Mainly used to provide a hook that can be injected
 * to ensure feature state is loaded before something
 * that depends on it.
 */
export declare const FEATURE_STATE_PROVIDER: InjectionToken<void>;

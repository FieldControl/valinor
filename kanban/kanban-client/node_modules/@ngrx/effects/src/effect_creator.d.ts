import { Observable } from 'rxjs';
import { Action, ActionCreator } from '@ngrx/store';
import { CreateEffectMetadata, EffectConfig, EffectMetadata, FunctionalEffect } from './models';
type DispatchType<T> = T extends {
    dispatch: infer U;
} ? U : true;
type ObservableType<T, OriginalType> = T extends false ? OriginalType : Action;
type EffectResult<OT> = Observable<OT> | ((...args: any[]) => Observable<OT>);
type ConditionallyDisallowActionCreator<DT, Result> = DT extends false ? unknown : Result extends EffectResult<infer OT> ? OT extends ActionCreator ? 'ActionCreator cannot be dispatched. Did you forget to call the action creator function?' : unknown : unknown;
export declare function createEffect<C extends EffectConfig & {
    functional?: false;
}, DT extends DispatchType<C>, OTP, R extends EffectResult<OT>, OT extends ObservableType<DT, OTP>>(source: () => R & ConditionallyDisallowActionCreator<DT, R>, config?: C): R & CreateEffectMetadata;
export declare function createEffect<Source extends () => Observable<unknown>>(source: Source, config: EffectConfig & {
    functional: true;
    dispatch: false;
}): FunctionalEffect<Source>;
export declare function createEffect<Source extends () => Observable<Action>>(source: Source & ConditionallyDisallowActionCreator<true, ReturnType<Source>>, config: EffectConfig & {
    functional: true;
    dispatch?: true;
}): FunctionalEffect<Source>;
export declare function getCreateEffectMetadata<T extends Record<keyof T, Object>>(instance: T): EffectMetadata<T>[];
export {};

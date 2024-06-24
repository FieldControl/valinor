import { Selector, SelectorWithProps } from './models';
export type AnyFn = (...args: any[]) => any;
export type MemoizedProjection = {
    memoized: AnyFn;
    reset: () => void;
    setResult: (result?: any) => void;
    clearResult: () => void;
};
export type MemoizeFn = (t: AnyFn) => MemoizedProjection;
export type ComparatorFn = (a: any, b: any) => boolean;
export type DefaultProjectorFn<T> = (...args: any[]) => T;
export interface MemoizedSelector<State, Result, ProjectorFn = DefaultProjectorFn<Result>> extends Selector<State, Result> {
    release(): void;
    projector: ProjectorFn;
    setResult: (result?: Result) => void;
    clearResult: () => void;
}
/**
 * @deprecated Selectors with props are deprecated, for more info see the {@link https://ngrx.io/guide/migration/v12#ngrxstore migration guide}
 */
export interface MemoizedSelectorWithProps<State, Props, Result, ProjectorFn = DefaultProjectorFn<Result>> extends SelectorWithProps<State, Props, Result> {
    release(): void;
    projector: ProjectorFn;
    setResult: (result?: Result) => void;
    clearResult: () => void;
}
export declare function isEqualCheck(a: any, b: any): boolean;
export declare function resultMemoize(projectionFn: AnyFn, isResultEqual: ComparatorFn): MemoizedProjection;
export declare function defaultMemoize(projectionFn: AnyFn, isArgumentsEqual?: typeof isEqualCheck, isResultEqual?: typeof isEqualCheck): MemoizedProjection;
export declare function createSelector<State, S1, Result>(s1: Selector<State, S1>, projector: (s1: S1) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<State, S1, S2, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, projector: (s1: S1, s2: S2) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<State, S1, S2, S3, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, projector: (s1: S1, s2: S2, s3: S3) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<State, S1, S2, S3, S4, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, projector: (s1: S1, s2: S2, s3: S3, s4: S4) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<State, S1, S2, S3, S4, S5, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, s6: Selector<State, S6>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, S7, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, s6: Selector<State, S6>, s7: Selector<State, S7>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, S7, S8, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, s6: Selector<State, S6>, s7: Selector<State, S7>, s8: Selector<State, S8>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, s8: S8) => Result): MemoizedSelector<State, Result, typeof projector>;
export declare function createSelector<Selectors extends Record<string, Selector<State, unknown>>, State = Selectors extends Record<string, Selector<infer S, unknown>> ? S : never, Result extends Record<string, unknown> = {
    [Key in keyof Selectors]: Selectors[Key] extends Selector<State, infer R> ? R : never;
}>(selectors: Selectors): MemoizedSelector<State, Result, never>;
export declare function createSelector<State, Slices extends unknown[], Result>(...args: [...slices: Selector<State, unknown>[], projector: unknown] & [
    ...slices: {
        [i in keyof Slices]: Selector<State, Slices[i]>;
    },
    projector: (...s: Slices) => Result
]): MemoizedSelector<State, Result, (...s: Slices) => Result>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, Result>(s1: SelectorWithProps<State, Props, S1>, projector: (s1: S1, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, Result>(s1: SelectorWithProps<State, Props, S1>, s2: SelectorWithProps<State, Props, S2>, projector: (s1: S1, s2: S2, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, Result>(s1: SelectorWithProps<State, Props, S1>, s2: SelectorWithProps<State, Props, S2>, s3: SelectorWithProps<State, Props, S3>, projector: (s1: S1, s2: S2, s3: S3, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, Result>(s1: SelectorWithProps<State, Props, S1>, s2: SelectorWithProps<State, Props, S2>, s3: SelectorWithProps<State, Props, S3>, s4: SelectorWithProps<State, Props, S4>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, Result>(s1: SelectorWithProps<State, Props, S1>, s2: SelectorWithProps<State, Props, S2>, s3: SelectorWithProps<State, Props, S3>, s4: SelectorWithProps<State, Props, S4>, s5: SelectorWithProps<State, Props, S5>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, S6, Result>(s1: SelectorWithProps<State, Props, S1>, s2: SelectorWithProps<State, Props, S2>, s3: SelectorWithProps<State, Props, S3>, s4: SelectorWithProps<State, Props, S4>, s5: SelectorWithProps<State, Props, S5>, s6: SelectorWithProps<State, Props, S6>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, S6, S7, Result>(s1: SelectorWithProps<State, Props, S1>, s2: SelectorWithProps<State, Props, S2>, s3: SelectorWithProps<State, Props, S3>, s4: SelectorWithProps<State, Props, S4>, s5: SelectorWithProps<State, Props, S5>, s6: SelectorWithProps<State, Props, S6>, s7: SelectorWithProps<State, Props, S7>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, S6, S7, S8, Result>(s1: SelectorWithProps<State, Props, S1>, s2: SelectorWithProps<State, Props, S2>, s3: SelectorWithProps<State, Props, S3>, s4: SelectorWithProps<State, Props, S4>, s5: SelectorWithProps<State, Props, S5>, s6: SelectorWithProps<State, Props, S6>, s7: SelectorWithProps<State, Props, S7>, s8: SelectorWithProps<State, Props, S8>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, s8: S8, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
export declare function createSelector<State, Slices extends unknown[], Result>(selectors: Selector<State, unknown>[] & [
    ...{
        [i in keyof Slices]: Selector<State, Slices[i]>;
    }
], projector: (...s: Slices) => Result): MemoizedSelector<State, Result, (...s: Slices) => Result>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, Result>(selectors: [SelectorWithProps<State, Props, S1>], projector: (s1: S1, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, Result>(selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>
], projector: (s1: S1, s2: S2, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, Result>(selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>
], projector: (s1: S1, s2: S2, s3: S3, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, Result>(selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>
], projector: (s1: S1, s2: S2, s3: S3, s4: S4, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, Result>(selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>
], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, S6, Result>(selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>,
    SelectorWithProps<State, Props, S6>
], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, S6, S7, Result>(selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>,
    SelectorWithProps<State, Props, S6>,
    SelectorWithProps<State, Props, S7>
], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelector<State, Props, S1, S2, S3, S4, S5, S6, S7, S8, Result>(selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>,
    SelectorWithProps<State, Props, S6>,
    SelectorWithProps<State, Props, S7>,
    SelectorWithProps<State, Props, S8>
], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, s8: S8, props: Props) => Result): MemoizedSelectorWithProps<State, Props, Result, typeof projector>;
export declare function defaultStateFn(state: any, selectors: Selector<any, any>[] | SelectorWithProps<any, any, any>[], props: any, memoizedProjector: MemoizedProjection): any;
export type SelectorFactoryConfig<T = any, V = any> = {
    stateFn: (state: T, selectors: Selector<any, any>[], props: any, memoizedProjector: MemoizedProjection) => V;
};
export declare function createSelectorFactory<T = any, V = any>(memoize: MemoizeFn): (...input: any[]) => MemoizedSelector<T, V>;
export declare function createSelectorFactory<T = any, V = any>(memoize: MemoizeFn, options: SelectorFactoryConfig<T, V>): (...input: any[]) => MemoizedSelector<T, V>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelectorFactory<T = any, Props = any, V = any>(memoize: MemoizeFn): (...input: any[]) => MemoizedSelectorWithProps<T, Props, V>;
/**
 * @deprecated Selectors with props are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/2980 Github Issue}
 */
export declare function createSelectorFactory<T = any, Props = any, V = any>(memoize: MemoizeFn, options: SelectorFactoryConfig<T, V>): (...input: any[]) => MemoizedSelectorWithProps<T, Props, V>;
export declare function createFeatureSelector<T>(featureName: string): MemoizedSelector<object, T>;
/**
 * @deprecated  Feature selectors with a root state are deprecated, for more info see {@link https://github.com/ngrx/platform/issues/3179 Github Issue}
 */
export declare function createFeatureSelector<T, V>(featureName: keyof T): MemoizedSelector<T, V>;

import { ActionReducer, Prettify, Primitive, Selector } from './models';
import { MemoizedSelector } from './selector';
export interface FeatureConfig<FeatureName extends string, FeatureState> {
    name: FeatureName;
    reducer: ActionReducer<FeatureState>;
}
type Feature<FeatureName extends string, FeatureState> = FeatureConfig<FeatureName, FeatureState> & BaseSelectors<FeatureName, FeatureState>;
type FeatureWithExtraSelectors<FeatureName extends string, FeatureState, ExtraSelectors extends SelectorsDictionary> = string extends keyof ExtraSelectors ? Feature<FeatureName, FeatureState> : Omit<Feature<FeatureName, FeatureState>, keyof ExtraSelectors> & ExtraSelectors;
type FeatureSelector<FeatureName extends string, FeatureState> = {
    [K in FeatureName as `select${Capitalize<K>}State`]: MemoizedSelector<Record<string, any>, FeatureState, (featureState: FeatureState) => FeatureState>;
};
type NestedSelectors<FeatureState> = FeatureState extends Primitive | unknown[] | Date ? {} : {
    [K in keyof FeatureState & string as `select${Capitalize<K>}`]: MemoizedSelector<Record<string, any>, FeatureState[K], (featureState: FeatureState) => FeatureState[K]>;
};
type BaseSelectors<FeatureName extends string, FeatureState> = FeatureSelector<FeatureName, FeatureState> & NestedSelectors<FeatureState>;
type SelectorsDictionary = Record<string, Selector<Record<string, any>, unknown> | ((...args: any[]) => Selector<Record<string, any>, unknown>)>;
type ExtraSelectorsFactory<FeatureName extends string, FeatureState, ExtraSelectors extends SelectorsDictionary> = (baseSelectors: BaseSelectors<FeatureName, FeatureState>) => ExtraSelectors;
type NotAllowedFeatureStateCheck<FeatureState> = FeatureState extends Required<FeatureState> ? unknown : 'optional properties are not allowed in the feature state';
/**
 * Creates a feature object with extra selectors.
 *
 * @param featureConfig An object that contains a feature name, a feature
 * reducer, and extra selectors factory.
 * @returns An object that contains a feature name, a feature reducer,
 * a feature selector, a selector for each feature state property, and
 * extra selectors.
 */
export declare function createFeature<FeatureName extends string, FeatureState, ExtraSelectors extends SelectorsDictionary>(featureConfig: FeatureConfig<FeatureName, FeatureState> & {
    extraSelectors: ExtraSelectorsFactory<FeatureName, FeatureState, ExtraSelectors>;
} & NotAllowedFeatureStateCheck<FeatureState>): Prettify<FeatureWithExtraSelectors<FeatureName, FeatureState, ExtraSelectors>>;
/**
 * Creates a feature object.
 *
 * @param featureConfig An object that contains a feature name and a feature
 * reducer.
 * @returns An object that contains a feature name, a feature reducer,
 * a feature selector, and a selector for each feature state property.
 */
export declare function createFeature<FeatureName extends string, FeatureState>(featureConfig: FeatureConfig<FeatureName, FeatureState> & NotAllowedFeatureStateCheck<FeatureState>): Prettify<Feature<FeatureName, FeatureState>>;
export {};

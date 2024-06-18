import { EffectMetadata, EffectsMetadata } from './models';
export declare function getEffectsMetadata<T extends Record<keyof T, Object>>(instance: T): EffectsMetadata<T>;
export declare function getSourceMetadata<T extends {
    [props in keyof T]: object;
}>(instance: T): EffectMetadata<T>[];

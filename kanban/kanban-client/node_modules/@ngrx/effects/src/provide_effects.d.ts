import { EnvironmentProviders, Type } from '@angular/core';
import { FunctionalEffect } from './models';
/**
 * Runs the provided effects.
 * Can be called at the root and feature levels.
 */
export declare function provideEffects(effects: Array<Type<unknown> | Record<string, FunctionalEffect>>): EnvironmentProviders;
/**
 * Runs the provided effects.
 * Can be called at the root and feature levels.
 */
export declare function provideEffects(...effects: Array<Type<unknown> | Record<string, FunctionalEffect>>): EnvironmentProviders;

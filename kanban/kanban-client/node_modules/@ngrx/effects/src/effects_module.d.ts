import { ModuleWithProviders, Type } from '@angular/core';
import { EffectsFeatureModule } from './effects_feature_module';
import { EffectsRootModule } from './effects_root_module';
import { FunctionalEffect } from './models';
import * as i0 from "@angular/core";
export declare class EffectsModule {
    static forFeature(featureEffects: Array<Type<unknown> | Record<string, FunctionalEffect>>): ModuleWithProviders<EffectsFeatureModule>;
    static forFeature(...featureEffects: Array<Type<unknown> | Record<string, FunctionalEffect>>): ModuleWithProviders<EffectsFeatureModule>;
    static forRoot(rootEffects: Array<Type<unknown> | Record<string, FunctionalEffect>>): ModuleWithProviders<EffectsRootModule>;
    static forRoot(...rootEffects: Array<Type<unknown> | Record<string, FunctionalEffect>>): ModuleWithProviders<EffectsRootModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<EffectsModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<EffectsModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<EffectsModule>;
}

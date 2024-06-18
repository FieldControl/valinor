import { StoreRootModule, StoreFeatureModule } from '@ngrx/store';
import { EffectsRootModule } from './effects_root_module';
import * as i0 from "@angular/core";
export declare class EffectsFeatureModule {
    constructor(effectsRootModule: EffectsRootModule, effectsInstanceGroups: unknown[][], storeRootModule: StoreRootModule, storeFeatureModule: StoreFeatureModule);
    static ɵfac: i0.ɵɵFactoryDeclaration<EffectsFeatureModule, [null, null, { optional: true; }, { optional: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<EffectsFeatureModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<EffectsFeatureModule>;
}

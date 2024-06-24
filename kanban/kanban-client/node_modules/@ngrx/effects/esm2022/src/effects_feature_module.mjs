import { NgModule, Inject, Optional } from '@angular/core';
import { _FEATURE_EFFECTS_INSTANCE_GROUPS } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "./effects_root_module";
import * as i2 from "@ngrx/store";
export class EffectsFeatureModule {
    constructor(effectsRootModule, effectsInstanceGroups, storeRootModule, storeFeatureModule) {
        const effectsInstances = effectsInstanceGroups.flat();
        for (const effectsInstance of effectsInstances) {
            effectsRootModule.addEffects(effectsInstance);
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule, deps: [{ token: i1.EffectsRootModule }, { token: _FEATURE_EFFECTS_INSTANCE_GROUPS }, { token: i2.StoreRootModule, optional: true }, { token: i2.StoreFeatureModule, optional: true }], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: () => [{ type: i1.EffectsRootModule }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [_FEATURE_EFFECTS_INSTANCE_GROUPS]
                }] }, { type: i2.StoreRootModule, decorators: [{
                    type: Optional
                }] }, { type: i2.StoreFeatureModule, decorators: [{
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19mZWF0dXJlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19mZWF0dXJlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0QsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sVUFBVSxDQUFDOzs7O0FBRzVELE1BQU0sT0FBTyxvQkFBb0I7SUFDL0IsWUFDRSxpQkFBb0MsRUFFcEMscUJBQWtDLEVBQ3RCLGVBQWdDLEVBQ2hDLGtCQUFzQztRQUVsRCxNQUFNLGdCQUFnQixHQUFHLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RELEtBQUssTUFBTSxlQUFlLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUMvQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNILENBQUM7aUlBWlUsb0JBQW9CLG1EQUdyQixnQ0FBZ0M7a0lBSC9CLG9CQUFvQjtrSUFBcEIsb0JBQW9COzsyRkFBcEIsb0JBQW9CO2tCQURoQyxRQUFRO21CQUFDLEVBQUU7OzBCQUlQLE1BQU07MkJBQUMsZ0NBQWdDOzswQkFFdkMsUUFBUTs7MEJBQ1IsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBJbmplY3QsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdG9yZVJvb3RNb2R1bGUsIFN0b3JlRmVhdHVyZU1vZHVsZSB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7IEVmZmVjdHNSb290TW9kdWxlIH0gZnJvbSAnLi9lZmZlY3RzX3Jvb3RfbW9kdWxlJztcbmltcG9ydCB7IF9GRUFUVVJFX0VGRkVDVFNfSU5TVEFOQ0VfR1JPVVBTIH0gZnJvbSAnLi90b2tlbnMnO1xuXG5ATmdNb2R1bGUoe30pXG5leHBvcnQgY2xhc3MgRWZmZWN0c0ZlYXR1cmVNb2R1bGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBlZmZlY3RzUm9vdE1vZHVsZTogRWZmZWN0c1Jvb3RNb2R1bGUsXG4gICAgQEluamVjdChfRkVBVFVSRV9FRkZFQ1RTX0lOU1RBTkNFX0dST1VQUylcbiAgICBlZmZlY3RzSW5zdGFuY2VHcm91cHM6IHVua25vd25bXVtdLFxuICAgIEBPcHRpb25hbCgpIHN0b3JlUm9vdE1vZHVsZTogU3RvcmVSb290TW9kdWxlLFxuICAgIEBPcHRpb25hbCgpIHN0b3JlRmVhdHVyZU1vZHVsZTogU3RvcmVGZWF0dXJlTW9kdWxlXG4gICkge1xuICAgIGNvbnN0IGVmZmVjdHNJbnN0YW5jZXMgPSBlZmZlY3RzSW5zdGFuY2VHcm91cHMuZmxhdCgpO1xuICAgIGZvciAoY29uc3QgZWZmZWN0c0luc3RhbmNlIG9mIGVmZmVjdHNJbnN0YW5jZXMpIHtcbiAgICAgIGVmZmVjdHNSb290TW9kdWxlLmFkZEVmZmVjdHMoZWZmZWN0c0luc3RhbmNlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
import { NgModule, Inject, Optional } from '@angular/core';
import { _ROOT_EFFECTS_GUARD, _ROOT_EFFECTS_INSTANCES } from './tokens';
import { ROOT_EFFECTS_INIT } from './effects_actions';
import * as i0 from "@angular/core";
import * as i1 from "./effect_sources";
import * as i2 from "./effects_runner";
import * as i3 from "@ngrx/store";
export class EffectsRootModule {
    constructor(sources, runner, store, rootEffectsInstances, storeRootModule, storeFeatureModule, guard) {
        this.sources = sources;
        runner.start();
        for (const effectsInstance of rootEffectsInstances) {
            sources.addEffects(effectsInstance);
        }
        store.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    addEffects(effectsInstance) {
        this.sources.addEffects(effectsInstance);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule, deps: [{ token: i1.EffectSources }, { token: i2.EffectsRunner }, { token: i3.Store }, { token: _ROOT_EFFECTS_INSTANCES }, { token: i3.StoreRootModule, optional: true }, { token: i3.StoreFeatureModule, optional: true }, { token: _ROOT_EFFECTS_GUARD, optional: true }], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: () => [{ type: i1.EffectSources }, { type: i2.EffectsRunner }, { type: i3.Store }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [_ROOT_EFFECTS_INSTANCES]
                }] }, { type: i3.StoreRootModule, decorators: [{
                    type: Optional
                }] }, { type: i3.StoreFeatureModule, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [_ROOT_EFFECTS_GUARD]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19yb290X21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19yb290X21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJM0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLHVCQUF1QixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDOzs7OztBQUd0RCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLFlBQ1UsT0FBc0IsRUFDOUIsTUFBcUIsRUFDckIsS0FBWSxFQUNxQixvQkFBK0IsRUFDcEQsZUFBZ0MsRUFDaEMsa0JBQXNDLEVBR2xELEtBQWM7UUFSTixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBVTlCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVmLEtBQUssTUFBTSxlQUFlLElBQUksb0JBQW9CLEVBQUUsQ0FBQztZQUNuRCxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsVUFBVSxDQUFDLGVBQXdCO1FBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7aUlBdkJVLGlCQUFpQixpR0FLbEIsdUJBQXVCLDhHQUl2QixtQkFBbUI7a0lBVGxCLGlCQUFpQjtrSUFBakIsaUJBQWlCOzsyRkFBakIsaUJBQWlCO2tCQUQ3QixRQUFRO21CQUFDLEVBQUU7OzBCQU1QLE1BQU07MkJBQUMsdUJBQXVCOzswQkFDOUIsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgSW5qZWN0LCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3RvcmUsIFN0b3JlUm9vdE1vZHVsZSwgU3RvcmVGZWF0dXJlTW9kdWxlIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHsgRWZmZWN0c1J1bm5lciB9IGZyb20gJy4vZWZmZWN0c19ydW5uZXInO1xuaW1wb3J0IHsgRWZmZWN0U291cmNlcyB9IGZyb20gJy4vZWZmZWN0X3NvdXJjZXMnO1xuaW1wb3J0IHsgX1JPT1RfRUZGRUNUU19HVUFSRCwgX1JPT1RfRUZGRUNUU19JTlNUQU5DRVMgfSBmcm9tICcuL3Rva2Vucyc7XG5pbXBvcnQgeyBST09UX0VGRkVDVFNfSU5JVCB9IGZyb20gJy4vZWZmZWN0c19hY3Rpb25zJztcblxuQE5nTW9kdWxlKHt9KVxuZXhwb3J0IGNsYXNzIEVmZmVjdHNSb290TW9kdWxlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBzb3VyY2VzOiBFZmZlY3RTb3VyY2VzLFxuICAgIHJ1bm5lcjogRWZmZWN0c1J1bm5lcixcbiAgICBzdG9yZTogU3RvcmUsXG4gICAgQEluamVjdChfUk9PVF9FRkZFQ1RTX0lOU1RBTkNFUykgcm9vdEVmZmVjdHNJbnN0YW5jZXM6IHVua25vd25bXSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZVJvb3RNb2R1bGU6IFN0b3JlUm9vdE1vZHVsZSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZUZlYXR1cmVNb2R1bGU6IFN0b3JlRmVhdHVyZU1vZHVsZSxcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoX1JPT1RfRUZGRUNUU19HVUFSRClcbiAgICBndWFyZDogdW5rbm93blxuICApIHtcbiAgICBydW5uZXIuc3RhcnQoKTtcblxuICAgIGZvciAoY29uc3QgZWZmZWN0c0luc3RhbmNlIG9mIHJvb3RFZmZlY3RzSW5zdGFuY2VzKSB7XG4gICAgICBzb3VyY2VzLmFkZEVmZmVjdHMoZWZmZWN0c0luc3RhbmNlKTtcbiAgICB9XG5cbiAgICBzdG9yZS5kaXNwYXRjaCh7IHR5cGU6IFJPT1RfRUZGRUNUU19JTklUIH0pO1xuICB9XG5cbiAgYWRkRWZmZWN0cyhlZmZlY3RzSW5zdGFuY2U6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnNvdXJjZXMuYWRkRWZmZWN0cyhlZmZlY3RzSW5zdGFuY2UpO1xuICB9XG59XG4iXX0=
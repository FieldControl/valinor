import { OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { EffectSources } from './effect_sources';
import * as i0 from "@angular/core";
export declare class EffectsRunner implements OnDestroy {
    private effectSources;
    private store;
    private effectsSubscription;
    get isStarted(): boolean;
    constructor(effectSources: EffectSources, store: Store<any>);
    start(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EffectsRunner, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<EffectsRunner>;
}

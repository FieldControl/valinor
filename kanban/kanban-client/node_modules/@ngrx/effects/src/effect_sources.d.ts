import { ErrorHandler } from '@angular/core';
import { Subject } from 'rxjs';
import { EffectsErrorHandler } from './effects_error_handler';
import * as i0 from "@angular/core";
export declare class EffectSources extends Subject<any> {
    private errorHandler;
    private effectsErrorHandler;
    constructor(errorHandler: ErrorHandler, effectsErrorHandler: EffectsErrorHandler);
    addEffects(effectSourceInstance: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EffectSources, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<EffectSources>;
}

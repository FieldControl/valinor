import { Observable } from 'rxjs';
import { EffectNotification } from './effect_notification';
import { EffectsErrorHandler } from './effects_error_handler';
import { ErrorHandler } from '@angular/core';
export declare function mergeEffects(sourceInstance: any, globalErrorHandler: ErrorHandler, effectsErrorHandler: EffectsErrorHandler): Observable<EffectNotification>;

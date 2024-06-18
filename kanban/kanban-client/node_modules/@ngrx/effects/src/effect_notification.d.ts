import { ErrorHandler } from '@angular/core';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ObservableNotification } from './utils';
export interface EffectNotification {
    effect: Observable<any> | (() => Observable<any>);
    propertyName: PropertyKey;
    sourceName: string | null;
    sourceInstance: any;
    notification: ObservableNotification<Action | null | undefined>;
}
export declare function reportInvalidActions(output: EffectNotification, reporter: ErrorHandler): void;

import { OnDestroy, Provider } from '@angular/core';
import { Subject } from 'rxjs';
import { Action } from './models';
import * as i0 from "@angular/core";
export declare class ScannedActionsSubject extends Subject<Action> implements OnDestroy {
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScannedActionsSubject, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ScannedActionsSubject>;
}
export declare const SCANNED_ACTIONS_SUBJECT_PROVIDERS: Provider[];

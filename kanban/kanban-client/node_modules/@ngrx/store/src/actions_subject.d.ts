import { OnDestroy, Provider } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Action } from './models';
import * as i0 from "@angular/core";
export declare const INIT: "@ngrx/store/init";
export declare class ActionsSubject extends BehaviorSubject<Action> implements OnDestroy {
    constructor();
    next(action: Action): void;
    complete(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ActionsSubject, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ActionsSubject>;
}
export declare const ACTIONS_SUBJECT_PROVIDERS: Provider[];

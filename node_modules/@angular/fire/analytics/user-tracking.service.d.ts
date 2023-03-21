import { Injector, NgZone, OnDestroy } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import * as i0 from "@angular/core";
export declare class UserTrackingService implements OnDestroy {
    readonly initialized: Promise<void>;
    private disposables;
    constructor(auth: Auth, zone: NgZone, injector: Injector);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<UserTrackingService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UserTrackingService>;
}

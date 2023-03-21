import { ApplicationRef, OnDestroy } from '@angular/core';
import * as i0 from "@angular/core";
export declare class PerformanceMonitoringService implements OnDestroy {
    private disposable;
    constructor(appRef: ApplicationRef);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PerformanceMonitoringService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PerformanceMonitoringService>;
}

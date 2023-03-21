import { ScreenTrackingService } from './screen-tracking.service';
import { AngularFireAnalytics } from './analytics';
import { UserTrackingService } from './user-tracking.service';
import * as i0 from "@angular/core";
export declare class AngularFireAnalyticsModule {
    constructor(analytics: AngularFireAnalytics, screenTracking: ScreenTrackingService, userTracking: UserTrackingService);
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireAnalyticsModule, [null, { optional: true; }, { optional: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AngularFireAnalyticsModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AngularFireAnalyticsModule>;
}

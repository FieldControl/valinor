import { Analytics as FirebaseAnalytics } from 'firebase/analytics';
export interface Analytics extends FirebaseAnalytics {
}
export declare class Analytics {
    constructor(analytics: FirebaseAnalytics);
}
export declare const ANALYTICS_PROVIDER_NAME = "analytics";
export interface AnalyticsInstances extends Array<FirebaseAnalytics> {
}
export declare class AnalyticsInstances {
    constructor();
}
export declare const analyticInstance$: import("rxjs").Observable<FirebaseAnalytics>;

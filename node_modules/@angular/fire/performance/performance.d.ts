import { FirebasePerformance } from 'firebase/performance';
export interface Performance extends FirebasePerformance {
}
export declare class Performance {
    constructor(performance: FirebasePerformance);
}
export declare const PERFORMANCE_PROVIDER_NAME = "performance";
export interface PerformanceInstances extends Array<FirebasePerformance> {
}
export declare class PerformanceInstances {
    constructor();
}
export declare const performanceInstance$: import("rxjs").Observable<FirebasePerformance>;

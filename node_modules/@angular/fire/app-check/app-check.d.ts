import { AppCheck as FirebaseAppCheck } from 'firebase/app-check';
export declare const APP_CHECK_PROVIDER_NAME = "app-check";
export interface AppCheck extends FirebaseAppCheck {
}
export declare class AppCheck {
    constructor(appCheck: FirebaseAppCheck);
}
export interface AppCheckInstances extends Array<FirebaseAppCheck> {
}
export declare class AppCheckInstances {
    constructor();
}
export declare const appCheckInstance$: import("rxjs").Observable<FirebaseAppCheck>;

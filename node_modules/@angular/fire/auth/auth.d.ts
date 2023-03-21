import { Auth as FirebaseAuth } from 'firebase/auth';
export declare const AUTH_PROVIDER_NAME = "auth";
export interface Auth extends FirebaseAuth {
}
export declare class Auth {
    constructor(auth: FirebaseAuth);
}
export interface AuthInstances extends Array<FirebaseAuth> {
}
export declare class AuthInstances {
    constructor();
}
export declare const authInstance$: import("rxjs").Observable<FirebaseAuth>;

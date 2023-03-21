import { Functions as FirebaseFunctions } from 'firebase/functions';
export interface Functions extends FirebaseFunctions {
}
export declare class Functions {
    constructor(functions: FirebaseFunctions);
}
export declare const FUNCTIONS_PROVIDER_NAME = "functions";
export interface FunctionsInstances extends Array<FirebaseFunctions> {
}
export declare class FunctionsInstances {
    constructor();
}
export declare const functionInstance$: import("rxjs").Observable<FirebaseFunctions>;

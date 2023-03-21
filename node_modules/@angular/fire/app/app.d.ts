import { FirebaseApp as IFirebaseApp } from 'firebase/app';
export interface FirebaseApp extends IFirebaseApp {
}
export declare class FirebaseApp {
    constructor(app: IFirebaseApp);
}
export interface FirebaseApps extends Array<IFirebaseApp> {
}
export declare class FirebaseApps {
    constructor();
}
export declare const firebaseApp$: import("rxjs").Observable<IFirebaseApp>;

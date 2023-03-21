import { Firestore as FirebaseFirestore } from 'firebase/firestore/lite';
export interface Firestore extends FirebaseFirestore {
}
export declare class Firestore {
    constructor(firestore: FirebaseFirestore);
}
export declare const FIRESTORE_PROVIDER_NAME = "firestore/lite";
export interface FirestoreInstances extends Array<FirebaseFirestore> {
}
export declare class FirestoreInstances {
    constructor();
}
export declare const firestoreInstance$: import("rxjs").Observable<FirebaseFirestore>;

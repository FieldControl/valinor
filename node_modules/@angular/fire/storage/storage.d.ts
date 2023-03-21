import { FirebaseStorage } from 'firebase/storage';
export interface Storage extends FirebaseStorage {
}
export declare class Storage {
    constructor(auth: FirebaseStorage);
}
export declare const STORAGE_PROVIDER_NAME = "storage";
export interface StorageInstances extends Array<FirebaseStorage> {
}
export declare class StorageInstances {
    constructor();
}
export declare const storageInstance$: import("rxjs").Observable<FirebaseStorage>;

import { Database as FirebaseDatabase } from 'firebase/database';
export interface Database extends FirebaseDatabase {
}
export declare class Database {
    constructor(database: FirebaseDatabase);
}
export declare const DATABASE_PROVIDER_NAME = "database";
export interface DatabaseInstances extends Array<FirebaseDatabase> {
}
export declare class DatabaseInstances {
    constructor();
}
export declare const databaseInstance$: import("rxjs").Observable<FirebaseDatabase>;

import { DatabaseReference, FirebaseOperation, FirebaseOperationCases, PathReference } from './interfaces';
import firebase from 'firebase/compat/app';
export declare function isString(value: any): boolean;
export declare function isFirebaseDataSnapshot(value: any): boolean;
export declare function isNil(obj: any): boolean;
export declare function isFirebaseRef(value: any): boolean;
/**
 * Returns a database reference given a Firebase App and an
 * absolute or relative path.
 * @param database - Firebase Database
 * @param pathRef - Database path, relative or absolute
 */
export declare function getRef(database: firebase.database.Database, pathRef: PathReference): DatabaseReference;
export declare function checkOperationCases(item: FirebaseOperation, cases: FirebaseOperationCases): Promise<void>;

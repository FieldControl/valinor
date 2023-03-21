import { DatabaseReference, FirebaseOperation } from '../interfaces';
export declare function createRemoveMethod<T>(ref: DatabaseReference): (item?: FirebaseOperation) => any;

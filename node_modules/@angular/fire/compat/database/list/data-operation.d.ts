import { DatabaseReference, FirebaseOperation } from '../interfaces';
export declare function createDataOperationMethod<T>(ref: DatabaseReference, operation: string): <T_1>(item: FirebaseOperation, value: T_1) => Promise<void>;
